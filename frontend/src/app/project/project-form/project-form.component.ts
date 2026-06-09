import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Industry, TechnologyReference } from 'src/app/models/technology';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer, CustomerService } from 'src/app/services/customer.service';
import { FormControl, Validators } from '@angular/forms';
import emojiRegex from 'emoji-regex';
import { TechnologyFormDialogComponent } from './technology-form-dialog/technology-form-dialog.component';
import { ProjectService } from 'src/app/services/project.service';
import { Router } from '@angular/router';
import { FormValues } from 'src/app/technology/edit-form/edit-form.component';
import { Project } from 'src/app/models/project';
import { Contact } from 'src/app/models/contact';
import { Sbom } from 'src/app/models/sbom';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';

export type FormValuesProject = {
  projectName: string | null;
  industry?: string;
  customerNames: string[];
  description: string;
  contact: Contact[];
  salesServiceLink: string;
  info: string;
  industrySpecificInformation: string;
  startDate: string;
  endDate: string;
  selectedTechnologies: TechnologyReference[];
  newTechnologies: FormValues[];
  sbom?: Sbom | null;
};

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css'],
})
export class ProjectFormComponent implements OnInit {
  @Input({ required: true }) values!: FormValuesProject;
  @Input() isSubmitting = false;
  @Input() hasError = false;
  @Input({ required: true }) editContext!:
    | 'edit-existing-project'
    | 'create-new-project';
  @Output() submitForm: EventEmitter<void> = new EventEmitter<void>();

  widthZeroRegex = /(\u200B+|\u200C+|\u200D+|\u200E+|\u200F+|\uFEFF+)/g;
  maxCharacterCustomerName = 255;
  maxCharacterProjectName = 255;
  maxCharacterDescription = 1800;
  maxCharacterInfo = 1800;
  maxCharacterIndustrySpecificInformation = 1800;
  maxCharacterSalesServiceLink = 1800;
  maxSbomFileSizeBytes = 4 * 1024 * 1024;
  maxSbomFileSizeMB = 4;
  isNewSbom?: boolean;
  checkIfSubmitted = false;
  selectedTechnologies: TechnologyReference[] = [];
  newTechnologies: FormValues[] = [];
  allCustomerNames: string[] = [];
  allCustomer: Customer[] = [];
  allProjectNames: string[] = [];
  allProjects: Project[] = [];
  allIndustries: Industry[] = [];
  controlCustomerNames: FormControl[] = [new FormControl()];
  controlProjectName = new FormControl('', Validators.required);
  controlProjectDescription = new FormControl();
  contactControls: { email: FormControl; role: FormControl }[] = [
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      role: new FormControl(),
    },
  ];
  controlProjectSalesServiceLink = new FormControl();
  controlProjectInfo = new FormControl();
  controlProjectStartDate = new FormControl();
  controlProjectEndDate = new FormControl();
  controlProjectIndustry = new FormControl();
  controlProjectIndustrySpecificInformation = new FormControl();
  searchValue = '';
  oldProjectName = '';
  oldIndustry: string | undefined = '';
  areAllCustomerNamesUnique = true;
  oldSelectedTechnologies: TechnologyReference[] = [];
  oldCustomerNames: string[] = [];
  oldDescription = '';
  oldContact: Contact[] = [];
  oldSalesServiceLink = '';
  oldInfo = '';
  oldIndustrySpecificInformation = '';
  oldStartDate = '';
  oldEndDate = '';
  oldSbomFileName = '';

  constructor(
    private readonly dialog: MatDialog,
    private readonly location: Location,
    private readonly snackBar: MatSnackBar,
    private readonly customerService: CustomerService,
    private readonly projectService: ProjectService,
    private readonly router: Router,
    public featureFlagService: FeatureFlagService,
  ) {}

  ngOnInit(): void {
    this.initializeSbomValues();

    if (this.editContext === 'edit-existing-project') {
      this.oldProjectName = this.values.projectName || '';
      this.oldDescription = this.values.description;
      this.oldSalesServiceLink = this.values.salesServiceLink;
      this.oldInfo = this.values.info;
      this.oldIndustrySpecificInformation =
        this.values.industrySpecificInformation;
      this.oldIndustry = this.values.industry;
      this.oldStartDate = this.values.startDate;
      this.oldEndDate = this.values.endDate;
      this.oldSbomFileName = this.values.sbom?.fileName || '';

      for (const contact of this.values.contact) {
        this.oldContact.push({ ...contact });
      }

      let index = 0;
      for (const customerName of this.values.customerNames) {
        if (this.controlCustomerNames[index] == null) {
          this.controlCustomerNames.push(new FormControl());
        }
        this.controlCustomerNames[index].setValue(customerName);
        index++;
        this.oldCustomerNames.push(customerName);
      }
      if (this.values.selectedTechnologies.length > 0) {
        this.oldSelectedTechnologies = [...this.values.selectedTechnologies];
      }
      if (this.values.industry) {
        this.controlProjectIndustry.setValue(this.values.industry);
      }
      if (this.values.contact && this.values.contact.length > 0) {
        // Populate contact controls from values
        this.contactControls = [];
        for (const contact of this.values.contact) {
          this.contactControls.push({
            email: new FormControl(contact.email, Validators.email),
            role: new FormControl(contact.role),
          });
        }
      }
    }
    this.customerService.getCustomers().subscribe((customers) => {
      this.allCustomerNames.push('Intern');
      customers.forEach((customer: Customer) => {
        if (customer.name !== 'Intern') {
          this.allCustomerNames.push(customer.name.toLowerCase());
        }
        this.allCustomer.push(customer);
      });
    });
    this.projectService.getProjects().subscribe((projects) => {
      projects.forEach((project) => {
        this.allProjects.push(project);
        this.allProjectNames.push(project.name.toLowerCase());
      });
    });

    // load industries
    this.projectService.getIndustries().subscribe((industries) => {
      this.allIndustries = industries;
    });
  }

  receiveSearchValue(value: string): void {
    this.searchValue = value;
  }

  _filter(value: string): string[] {
    return this.allCustomerNames.filter((customerName) =>
      customerName.toLowerCase().includes(value.toLowerCase()),
    );
  }

  getFilteredCustomerNames(inputText: string): string[] {
    return this._filter(inputText ? inputText : '');
  }

  get newTechnologyNames(): string[] {
    const listOfNames: string[] = [];
    for (const technology of this.newTechnologies) {
      listOfNames.push(technology.name || '');
    }
    return listOfNames;
  }

  doesProjectNameAlreadyExists(): boolean {
    if (
      this.editContext === 'edit-existing-project' &&
      this.controlProjectName.value === this.oldProjectName
    ) {
      return false;
    }
    if (this.controlProjectName.value) {
      return this.allProjectNames.includes(
        this.controlProjectName.value.toString().toLowerCase(),
      );
    }
    return false;
  }

  addCustomerNameField(): void {
    this.controlCustomerNames.push(new FormControl());
  }

  removeCustomerNameField(index: number): void {
    this.controlCustomerNames.splice(index, 1);
  }

  checkRemoveButtonHidden(): boolean {
    return this.controlCustomerNames.length <= 1;
  }

  addContact(): void {
    this.contactControls.push({
      email: new FormControl('', Validators.email),
      role: new FormControl(),
    });
  }

  removeContact(index: number): void {
    this.contactControls.splice(index, 1);
    if (this.contactControls.length > 0) {
      this.contactControls.forEach((contact, i) => {
        if (i === 0) {
          //Checks if it´s the first contact in List and make it a required field.
          contact.email.setValidators([Validators.required, Validators.email]);
        } else {
          contact.email.setValidators([Validators.email]);
        }
        contact.email.updateValueAndValidity();
      });
    }
  }

  private initializeSbomValues(): void {
    this.values.sbom = this.values.sbom ?? null;
    this.isNewSbom = this.isNewSbom ?? false;
  }

  private isJsonSbomFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const mimeType = (file.type || '').toLowerCase();
    return (
      fileName.endsWith('.json') ||
      mimeType === 'application/json' ||
      mimeType === 'text/json'
    );
  }

  onSbomSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (
      this.values.sbom?.fileName &&
      !confirm(
        'Es ist bereits eine SBOM vorhanden. Soll die vorhandene SBOM überschrieben werden?',
      )
    ) {
      input.value = '';
      return;
    }

    if (!this.isJsonSbomFile(file)) {
      this.snackBar.open('Es sind nur SBOM-Dateien im JSON-Format erlaubt.');
      input.value = '';
      return;
    }

    if (file.size > this.maxSbomFileSizeBytes) {
      this.snackBar.open(
        `Die SBOM ist zu gross. Maximal ${this.maxSbomFileSizeMB} MB erlaubt.`,
      );
      input.value = '';
      return;
    }

    this.values.sbom = {
      fileName: file.name,
      fileData: file,
    };
    this.isNewSbom = true;

    this.snackBar.open('SBOM wurde erfolgreich hochgeladen.');
    input.value = '';
  }

  clearSbom(): void {
    this.values.sbom = null;
    this.isNewSbom = false;
  }

  checkRemoveContactButtonHidden(): boolean {
    return this.contactControls.length <= 1;
  }

  showPopup(): void {
    if (this.controlCustomerNames[0].value && this.controlProjectName.value) {
      const values: FormValues = {
        name: this.searchValue,
        description: null,
        shortDescription: null,
        pictureData: null,
        isNewPic: false,
        categoryId: null,
        lifecycleId: null,
        tags: [],
        certificates: [],
        projectIds: [],
        connectedTechnologyIds: [],
        priority: false,
      };
      const data = {
        formValue: values,
        listOfTechnologyNames: this.newTechnologyNames,
      };
      this.dialog
        .open(TechnologyFormDialogComponent, {
          height: 'calc(100% - 40px)',
          width: 'calc(100% - 40px)',
          maxWidth: '100%',
          maxHeight: '100%',
          data: data,
        })
        .afterClosed()
        .subscribe((result) => {
          if (result && result.event === 'addNewTechnology') {
            if (this.checkIfTechnologyNameAlreadyExist(result.data.name)) {
              this.snackBar.open('Diese Technologie wird bereits angelegt');
            } else {
              this.newTechnologies.push(result.data);
              this.searchValue = '';
            }
          }
        });
    } else {
      this.snackBar.open('Bitte gib ein Projekt- und Kundennamen an');
    }
  }

  removeNewTechnology(index: number): void {
    this.newTechnologies.splice(index, 1);
  }

  editNewTechnology(index: number): void {
    const technology: FormValues = this.newTechnologies[index];
    const values: FormValues = {
      name: technology.name,
      description: technology.description,
      shortDescription: technology.shortDescription,
      pictureData: technology.pictureData,
      isNewPic: technology.isNewPic,
      categoryId: technology.categoryId,
      lifecycleId: technology.lifecycleId,
      tags: technology.tags,
      certificates: technology.certificates,
      projectIds: technology.projectIds,
      connectedTechnologyIds: technology.connectedTechnologyIds,
      priority: technology.priority,
    };
    const data = {
      formValue: values,
      listOfTechnologyNames: this.newTechnologyNames,
    };
    this.dialog
      .open(TechnologyFormDialogComponent, {
        height: 'calc(100% - 40px)',
        width: 'calc(100% - 40px)',
        maxWidth: '100%',
        maxHeight: '100%',
        data: data,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result && result.event === 'addNewTechnology') {
          if (this.checkIfTechnologyNameAlreadyExist(result.data.name)) {
            this.snackBar.open('Diese Technologie ist bereits hinzugefügt');
          } else {
            this.newTechnologies[index] = result.data;
          }
        }
      });
  }
  private markAllFieldsAsTouched(): void {
    // Packen wir alle Controls in ein Array, das spart uns viel Schreibarbeit
    const formControls = [
      this.controlProjectName,
      this.controlProjectDescription,
      this.controlProjectIndustry,
      this.controlProjectSalesServiceLink,
      this.controlProjectInfo,
      this.controlProjectStartDate,
      this.controlProjectEndDate,
    ];

    formControls.forEach((control) => {
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
    if (this.contactControls && this.contactControls.length > 0) {
      this.contactControls.forEach((contact) => {
        contact.email.markAsTouched();
        contact.email.markAsDirty();
        contact.email.updateValueAndValidity();
      });
    }

    if (this.controlCustomerNames && this.controlCustomerNames.length > 0) {
      this.controlCustomerNames.forEach((control) => {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      });
    }
  }
  async onFormSubmit(): Promise<void> {
    const isContactsValid = this.contactControls.every(
      (contact) => contact.email.valid,
    );

    this.checkIfSubmitted = true;
    if (!this.isSubmittable || !isContactsValid) {
      this.snackBar.open(
        'Es müssen alle mit * gekennzeichneten Felder ausgefüllt sein',
        'Schließen',
        { duration: 5000 },
      );

      this.markAllFieldsAsTouched();
      return;
    }
    for (const technology of this.selectedTechnologies) {
      this.values.selectedTechnologies.push(technology);
    }
    for (const technology of this.newTechnologies) {
      this.values.newTechnologies.push(technology);
    }

    for (const contact of this.contactControls) {
      this.values.contact.push({
        email: contact.email.value || '',
        role: contact.role.value || '',
      });
    }
    this.values.contact = this.values.contact.filter(
      (contact) => contact.email && contact.email !== '',
    );

    this.isSubmitting = true;
    this.hasError = false;

    if (!this.areAllCustomerNamesUnique || !this.checkIfChanges()) {
      this.isSubmitting = false;
      return;
    }
    this.submitForm.emit();
    setTimeout(() => {
      this.router.navigate(['projects']);
    }, 500);

    if (this.editContext === 'edit-existing-project') {
      this.snackBar.open('Das Projekt wurde erfolgreich bearbeitet');
    } else {
      this.snackBar.open(
        'Das Projekt wurde erfolgreich zu den Technologien hinzugefügt',
      );
    }
  }

  /** goes back to previous page */
  goBackToPrevPage(): void {
    this.location.back();
  }

  /**
   * checks if the technology name already exists in the list of new technologies
   * @param name the name to check
   */
  checkIfTechnologyNameAlreadyExist(name: string): boolean {
    for (const technology of this.values.newTechnologies) {
      if (technology.name === name) return true;
    }
    return false;
  }

  checkIfChanges(): boolean {
    if (
      this.editContext === 'edit-existing-project' &&
      this.oldProjectName === this.values.projectName &&
      this.oldSelectedTechnologies.length ===
        this.values.selectedTechnologies.length &&
      this.oldSelectedTechnologies.every((oldTech) =>
        this.values.selectedTechnologies.some(
          (newTech) => newTech.name === oldTech.name,
        ),
      ) &&
      this.oldDescription === this.values.description &&
      this.oldContact.length === this.values.contact.length &&
      this.oldContact.every(
        (oldC, index) =>
          oldC.email === this.values.contact[index].email &&
          oldC.role === this.values.contact[index].role,
      ) &&
      this.oldSalesServiceLink === this.values.salesServiceLink &&
      this.oldIndustry === this.values.industry &&
      this.oldInfo === this.values.info &&
      this.oldIndustrySpecificInformation ===
        this.values.industrySpecificInformation &&
      this.oldStartDate === this.values.startDate &&
      this.oldEndDate === this.values.endDate &&
      this.oldSbomFileName === (this.values.sbom?.fileName || '') &&
      !this.isNewSbom &&
      this.newTechnologies.length === 0 &&
      this.oldCustomerNames.length === this.values.customerNames.length &&
      this.oldCustomerNames.every((oldCustomerName) =>
        this.values.customerNames.some(
          (newCustomerName) => newCustomerName === oldCustomerName,
        ),
      )
    ) {
      this.isSubmitting = false;
      this.snackBar.open('Es wurde nichts verändert');
      return false;
    }
    return true;
  }

  checkIfAtLeastOneTechnology(): boolean {
    if (
      !(
        this.newTechnologies.length > 0 ||
        this.values.selectedTechnologies.length > 0
      )
    ) {
      this.isSubmitting = false;
      return false;
    }
    return true;
  }

  checkProjectName(): boolean {
    if (
      this.controlProjectName.invalid ||
      this.checkNoWhitespace(this.controlProjectName.value) ||
      this.doesProjectNameAlreadyExists()
    ) {
      this.isSubmitting = false;
      return false;
    }
    return true;
  }

  checkProjectDescription(): boolean {
    if (this.controlProjectDescription.invalid) {
      this.isSubmitting = false;
      return false;
    }
    return true;
  }

  checkCustomer(): boolean {
    this.values.customerNames = [];
    for (const customerName of this.controlCustomerNames) {
      this.values.customerNames.push(customerName.value);
    }
    for (const customerControl of this.controlCustomerNames) {
      if (
        customerControl.invalid ||
        this.checkNoWhitespace(customerControl.value) ||
        !this.areAllCustomerNamesUnique
      ) {
        return false;
      }
    }
    return true;
  }

  checkProjectContact(): boolean {
    this.values.contact = [];
    const hasAtLeastOneEmail = this.contactControls.some(
      (contact) => (contact.email.value || '').toString().trim().length > 0,
    );

    if (!hasAtLeastOneEmail) {
      this.isSubmitting = false;
      return false;
    }

    // Check if all contact emails are valid
    for (const contact of this.contactControls) {
      if (contact.email.value && contact.email.invalid) {
        this.isSubmitting = false;
        return false;
      }
    }
    if (this.hasDuplicateContactEmails()) {
      this.isSubmitting = false;
      return false;
    }
    return true;
  }

  hasDuplicateContactEmails(): boolean {
    const normalizedEmails = this.contactControls
      .map((contact) =>
        (contact.email.value || '').toString().trim().toLowerCase(),
      )
      .filter((email) => email.length > 0);

    return new Set(normalizedEmails).size !== normalizedEmails.length;
  }

  checkProjectSalesServiceLink(): boolean {
    if (
      this.controlProjectSalesServiceLink.invalid ||
      this.checkNoWhitespace(this.controlProjectSalesServiceLink.value)
    ) {
      this.isSubmitting = false;
      return false;
    }
    return true;
  }

  checkCustomerName(customerName: string): boolean {
    if (customerName) {
      const values: string[] = this.controlCustomerNames.map((control) => {
        if (control.value) return control.value.toLowerCase();
      });
      const occurrences = values.filter(
        (value) => customerName.toLowerCase() === value,
      ).length;
      if (occurrences > 1) {
        this.areAllCustomerNamesUnique = false;
        return true;
      }
    }
    this.areAllCustomerNamesUnique = true;
    return false;
  }

  /**
   * checks if the given text has not only empty spaces or zeroWidthSpace characters, and checks if there is no emoji
   *
   * @param text the text to check.
   */
  checkNoWhitespace(text: string | null): boolean {
    const regex = emojiRegex();
    if (text != null && text.length > 0) {
      text = text.replace(this.widthZeroRegex, ' ');
      if (regex.test(text) || text.trim().length === 0) {
        return true;
      }
    }
    return false;
  }

  checkEndDateAfterStartDate(): boolean {
    if (this.values.startDate && this.values.endDate) {
      const startDate = new Date(this.values.startDate);
      const endDate = new Date(this.values.endDate);
      return startDate < endDate;
    }
    return true;
  }

  checkProjectIndustry(): boolean {
    if (this.controlProjectIndustry.invalid) {
      this.isSubmitting = false;
      return false;
    }
    return true;
  }

  get isSubmittable(): boolean {
    return (
      this.values.projectName != null &&
      this.checkProjectName() &&
      this.checkIfAtLeastOneTechnology() &&
      this.checkCustomer() &&
      this.checkProjectDescription() &&
      this.checkProjectContact() &&
      this.checkProjectSalesServiceLink() &&
      this.checkProjectIndustry() &&
      this.checkEndDateAfterStartDate()
    );
  }

  protected readonly of = of;
}

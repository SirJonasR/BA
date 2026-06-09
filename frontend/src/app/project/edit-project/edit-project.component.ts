import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/services/customer.service';
import { FormValuesProject } from '../project-form/project-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Utility } from 'src/app/utility';
import { RemoveDialogComponent } from 'src/app/utils/remove-dialog/remove-dialog.component';
import { Project } from 'src/app/models/project';
import { Industry, TechnologyRequest } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';
import { ProjectService } from 'src/app/services/project.service';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css'],
})
export class EditProjectComponent implements OnInit {
  values: FormValuesProject;
  projectId: number;
  allIndustries: Industry[] = [];
  selectedProject!: Project;
  isSubmitting = false;
  hasError = false;
  isDeleted = false;
  isProjectLoaded = false;

  constructor(
    private technologyService: TechnologyService,
    private projectService: ProjectService,
    private userHandling: UserHandlingService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.values = {
      customerNames: [],
      projectName: null,
      description: '',
      contact: [],
      salesServiceLink: '',
      industry: '',
      info: '',
      industrySpecificInformation: '',
      startDate: '',
      endDate: '',
      selectedTechnologies: [],
      newTechnologies: [],
      sbom: null,
    };
  }

  ngOnInit(): void {
    this.projectService.getProject(this.projectId).subscribe((project) => {
      this.selectedProject = project;
      this.populateValuesFromSelectedProject();
    });

    this.projectService.getIndustries().subscribe((industries) => {
      this.allIndustries = industries;
    });
  }

  populateValuesFromSelectedProject(): void {
    this.values.projectName = this.selectedProject.name;
    const technologyIds = this.selectedProject.technologyIds || [];
    const technologyNames = this.selectedProject.technologyNames || [];
    const length = Math.min(technologyIds.length, technologyNames.length);
    this.values.selectedTechnologies = technologyIds
      .slice(0, length)
      .map((id, index) => ({
        id,
        name: technologyNames[index],
      }));
    for (const customer of this.selectedProject.customers) {
      this.values.customerNames.push(customer.name);
    }
    this.values.description = this.selectedProject.description;
    this.values.contact = this.selectedProject.contact || [];
    this.values.salesServiceLink = this.selectedProject.salesServiceLink;
    this.values.industry = this.selectedProject.industry;
    this.values.info = this.selectedProject.info;
    this.values.industrySpecificInformation =
      this.selectedProject.industrySpecificInformation || '';
    this.values.startDate = this.selectedProject.startDate;
    this.values.endDate = this.selectedProject.endDate;
    this.isProjectLoaded = true;
  }

  isAdmin(): boolean {
    return this.userHandling.hasRole(UserRole.ADMIN);
  }

  openDeleteDialog(): void {
    this.dialog.open(RemoveDialogComponent, {
      data: {
        resourceType: 'Projekt',
        resourceName: this.selectedProject.name,
        onDelete: () => this.deleteProject(),
      },
    });
  }

  deleteProject(): void {
    this.isDeleted = true;
    const n = this.selectedProject.name;
    this.projectService.deleteProject(this.selectedProject.id).subscribe(() => {
      this.dialog.closeAll();
      this.router.navigate([`/`]);
      this.snackBar.open(`Das Projekt ${n} wurde erfolgreich gelöscht.`);
    });
  }
  // If this returns true, the user is notified when leaving the page that there are unsaved changes
  changes(): boolean {
    // If project was deleted using the delete button, there should be no unsaved changes warning
    if (this.isDeleted) {
      return false;
    }
    if (this.selectedProject && !this.isSubmitting) {
      return (
        this.selectedProject.name !== this.values.projectName ||
        this.selectedProject.description !== this.values.description ||
        this.selectedProject.info !== this.values.info ||
        this.selectedProject.industrySpecificInformation !==
          this.values.industrySpecificInformation ||
        JSON.stringify(this.selectedProject.contact) !==
          JSON.stringify(this.values.contact) ||
        this.selectedProject.salesServiceLink !==
          this.values.salesServiceLink ||
        this.selectedProject.industry !== this.values.industry ||
        this.selectedProject.startDate !== this.values.startDate ||
        this.selectedProject.endDate !== this.values.endDate ||
        this.checkTechnology()
      );
    }
    return false;
  }

  checkTechnology(): boolean {
    const newTechnologyIds: number[] = [];
    this.values.selectedTechnologies.forEach((technology) => {
      newTechnologyIds.push(technology.id);
    });
    const isSameTechnologyIds = this.selectedProject.technologyIds
      .sort((a, b) => a - b)
      .every(
        (value, index) =>
          value === newTechnologyIds.sort((a, b) => a - b)[index],
      );
    return this.values.newTechnologies.length > 0 || !isSameTechnologyIds;
  }

  onSubmit = async (): Promise<void> => {
    this.isSubmitting = true;
    this.hasError = false;
    const date = new Date(this.values.startDate);
    let formattedDate = '';
    if (this.values.startDate !== null && this.values.startDate !== '') {
      formattedDate =
        date.getFullYear().toString() +
        '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        date.getDate().toString().padStart(2, '0');
    }
    let formattedEndDate: string;
    if (this.values.endDate !== '') {
      const date = new Date(this.values.endDate);
      formattedEndDate =
        date.getFullYear().toString() +
        '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        date.getDate().toString().padStart(2, '0');
    } else {
      formattedEndDate = '';
    }

    const updatedProject: Project = {
      id: this.selectedProject.id,
      name: this.values.projectName?.toString() || '',
      description: this.values.description,
      contact: this.values.contact,
      industry: this.values.industry,
      salesServiceLink: Utility.normalizeUrl(this.values.salesServiceLink),
      info: this.values.info,
      industrySpecificInformation: this.values.industrySpecificInformation,
      startDate: formattedDate,
      endDate: formattedEndDate,
      customers: [],
      technologyIds: [],
      technologyNames: [],
    };
    for (const technology of this.values.selectedTechnologies) {
      updatedProject.technologyIds.push(technology.id);
    }
    for (const customerName of this.values.customerNames) {
      const customer: Customer = {
        id: -1,
        name: this.technologyService.capitalizedWord(customerName),
      };
      updatedProject.customers.push(customer);
    }
    this.projectService
      .updateProject(this.selectedProject.id, updatedProject)
      .subscribe((updatedProject) => {
        if (this.values.newTechnologies.length > 0) {
          for (const technology of this.values.newTechnologies) {
            technology.projectIds = [updatedProject.id];
            this.technologyService
              .createTechnology(technology as TechnologyRequest)
              .subscribe();
          }
        }
      });
  };
}

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  SecurityContext,
} from '@angular/core';
import { TechnologyService } from 'src/app/services/technology.service';
import { NgForm } from '@angular/forms';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';
import { marked } from 'marked';
import emojiRegex from 'emoji-regex';
import { Location } from '@angular/common';
import {
  CertificateForm,
  Technology,
  Category,
  Lifecycle,
} from 'src/app/models/technology';
import { PictureService } from 'src/app/services/picture.service';
import * as lodash from 'lodash';
import * as d3 from 'd3';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UndefinedDialogComponent } from '../undefined-dialog/undefined-dialog.component';
import { TechnologyFormDialogComponent } from '../../project/project-form/technology-form-dialog/technology-form-dialog.component';
import * as DOMPurify from 'dompurify';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export type FormValues = {
  name: string | null;
  description: string | null;
  shortDescription: string | null;
  tags: string[];
  categoryId: number | null;
  lifecycleId: number | null;
  pictureData: File | string | null;
  isNewPic: boolean;
  certificates: CertificateForm[];
  projectIds: number[];
  connectedTechnologyIds: number[];
  priority: boolean;
};

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css'],
})
/**
 * Edit Form Component
 *
 * Form for adding and editing technologies
 */
export class EditFormComponent implements OnInit {
  @Input() values!: FormValues;
  @Input() isSubmitting = false;
  @Input() hasError = false;
  @Input() isAddingNewProjectAllowed = true;
  @Input() potentialNewTechnologies: string[] = [];
  @Output() submitForm: EventEmitter<void> = new EventEmitter<void>();

  maxCharactersName = 255;
  maxCharactersDescription = 1800;
  maxCharactersShortDescription = 300;

  categories!: Category[];
  lifecycles!: Lifecycle[];

  checkIfSubmitted = false;
  tagsTouched = false;
  oldTagData: string[] = [];
  technologyNamesArray: string[] = [];
  widthZeroRegex = /(\u200B+|\u200C+|\u200D+|\u200E+|\u200F+|\uFEFF+)/g;

  previewUrl: string | ArrayBuffer | SafeUrl | null = null;
  oldNameData: string | null = null;
  oldPicData: string | null = null;

  oldCertificates: CertificateForm[] = [];
  oldProjectIds: number[] = [];

  oldSelectedConnectedTechnologyIds: number[] = [];
  selectedConnectedTechnologies: Technology[] = [];
  isProjectAndCustomerValid = true;

  isEdit = false;

  constructor(
    private technologyService: TechnologyService,
    private userHandlingService: UserHandlingService,
    private pictureService: PictureService,
    private sanitizer: DomSanitizer,
    private location: Location,
    private undefinedDialog: MatDialog,
    @Optional() private snackBar: MatSnackBar,
    @Optional() private dialogRef: MatDialogRef<TechnologyFormDialogComponent>,
  ) {
    this.categories = this.technologyService.categories;
    this.lifecycles = this.technologyService.lifecycles;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.oldCertificates = lodash.cloneDeep(this.values.certificates);
      this.oldProjectIds = lodash.cloneDeep(this.values.projectIds);
      this.oldNameData = this.values.name;
      this.oldTagData = [...this.values.tags];
      if (this.values.name) {
        this.isEdit = true;
      }
      if (this.values.pictureData) {
        if (typeof this.values.pictureData === 'string') {
          this.oldPicData = this.values.pictureData;
          const svgString = atob(this.values.pictureData);
          const sanitizedSvgString = DOMPurify.sanitize(svgString);
          const base64Svg = btoa(sanitizedSvgString);
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            'data:image/svg+xml;base64,' + base64Svg,
          );
          this.drawPreviewRadarBlip(
            this.pictureService.convertBase64ToSafeUrl(
              this.values.pictureData,
              false,
            ),
          );
        }
      }
      this.values.connectedTechnologyIds.forEach((technologyId) => {
        this.technologyService
          .getTechnology(technologyId)
          .subscribe((technology) => {
            this.selectedConnectedTechnologies.push(technology);
          });
      });
      this.oldSelectedConnectedTechnologyIds = [
        ...this.values.connectedTechnologyIds,
      ];
    });
    this.technologyService.getTechnologies().subscribe((technologyArray) => {
      this.technologyNamesArray = technologyArray.map(
        (item) => item.name?.toLowerCase().replace(/\s/g, ''),
      );
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      const file: File = files[0];
      if (file.size < 4000000) {
        this.values.isNewPic = true;
        this.values.pictureData = file;
        // Preview
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>): void => {
          if (e.target) {
            this.previewUrl = e.target.result as string;
            const base64Data = (e.target.result as string).split('base64,')[1];
            this.drawPreviewRadarBlip(
              this.pictureService.convertBase64ToSafeUrl(base64Data, false),
            );
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Bild ist zu groß. Max 4mb');
      }
    }
  }

  handleCertificateData(data: { certificates: CertificateForm[] }): void {
    this.values.certificates = data.certificates;
  }

  async drawPreviewRadarBlip(
    pictureData: SafeResourceUrl | null,
  ): Promise<void> {
    if (!pictureData) return;

    d3.selectAll('#previewRadar svg').remove();

    // Get color display setting from user service
    const shouldUseColor = await this.userHandlingService.getShowIconsInColor();

    const svg = d3
      .select('#previewRadar')
      .append('svg')
      .attr('viewBox', '-21 -21 42 42')
      .attr('width', '35')
      .attr('height', '35')
      .attr('class', shouldUseColor ? '' : 'grayscale');

    // Zeichne einen Kreis
    svg
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 21)
      .attr('fill', '#e0e0e0');

    // Zeichne das Bild
    svg
      .append('image')
      .attr(
        'xlink:href',
        this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, pictureData),
      )
      .attr('width', 27.5)
      .attr('height', 27.5)
      .attr('x', -13.75)
      .attr('y', -13.75);
  }

  /**
   * discards picture
   *
   * sets pictureData, isNewPic and previewUrl to null
   */
  clear(): void {
    this.values.pictureData = null;
    this.values.isNewPic = false;
    this.previewUrl = null;
  }

  /**
   * checks if given description has not only empty space or zeroWidthSpace characters.
   */
  checkValidDescription(): boolean {
    const rawDescription = this.values.description || '';
    const sanitizedDescription = DOMPurify.sanitize(marked(rawDescription), {
      ALLOWED_TAGS: [],
    });
    // const strippedDescription = marked(this.values.description || '').replace(
    //   /<[^>]>/g,
    //   '',
    // );
    sanitizedDescription.replace(this.widthZeroRegex, ' ');
    return sanitizedDescription.trim().length === 0;
  }

  /**
   * checks if the given text has not only empty spaces or zeroWidthSpace characters, and checks if there is no emoji
   *
   * @param text the text to check.
   */
  checkNoWhitespace(text: string): boolean {
    const regex = emojiRegex();
    if (text != null && text.length > 0) {
      text = text.replace(this.widthZeroRegex, ' ');
      if (regex.test(text) || text.trim().length === 0) {
        return true;
      }
    }
    return false;
  }

  checkTechnologyNameAlreadyExits(): boolean {
    this.technologyNamesArray.push(...this.potentialNewTechnologies);
    return (
      this.oldNameData?.toLowerCase().replace(/\s/g, '') !==
        this.values.name?.toLowerCase().replace(/\s/g, '') &&
      this.technologyNamesArray.includes(
        <string>this.values.name?.toLowerCase().replace(/\s/g, ''),
      )
    );
  }

  isCertificateEmpty(): boolean {
    for (const certificate of this.values.certificates) {
      if (certificate.name !== '') {
        return false;
      }
      if (certificate.description !== '') {
        return false;
      }
    }
    return true;
  }

  checkCertificates(): boolean {
    if (!this.isCertificateEmpty()) {
      for (const certificate of this.values.certificates) {
        if (
          certificate.name.length > 0 &&
          this.checkNoWhitespace(certificate.name)
        ) {
          alert('Zertifikatsname darf nicht leer sein.');
          return false;
        }
        if (!certificate.description.trim()) {
          alert('Zertifikatsbeschreibung darf nicht leer sein.');
          return false;
        }
      }
    }
    return true;
  }

  getCorrectTextLength(text: string): number {
    if (text == null) {
      return 0;
    }
    text = text.replace(/(\r\n|\n|\r)/g, '  ');
    return text.length;
  }

  /** goes back to previous page */
  goBackToPrevPage(): void {
    if (!this.isAddingNewProjectAllowed) {
      this.dialogRef.close();
    } else {
      this.location.back();
    }
  }

  isInValid(form: NgForm): boolean {
    return (
      form.valid === false ||
      this.checkValidDescription() ||
      this.checkNoWhitespace(this.values.name?.toString() || '') ||
      this.getCorrectTextLength(this.values.shortDescription || '') >
        this.maxCharactersShortDescription ||
      !this.isProjectAndCustomerValid ||
      this.values.tags.length < 1
    );
  }

  isUnchanged(form: NgForm): boolean {
    return (
      form.dirty === false &&
      this.oldPicData === this.values.pictureData &&
      JSON.stringify(this.oldTagData) === JSON.stringify(this.values.tags) &&
      ((this.oldCertificates.length === 0 &&
        this.values.certificates[0]?.name.trim() === '') ||
        (this.oldCertificates.length !== 0 &&
          JSON.stringify(this.oldCertificates) ===
            JSON.stringify(this.values.certificates))) &&
      this.oldProjectIds.length !== 0 &&
      JSON.stringify(this.oldProjectIds) ===
        JSON.stringify(this.values.projectIds) &&
      JSON.stringify(this.oldSelectedConnectedTechnologyIds) ===
        JSON.stringify(this.values.connectedTechnologyIds)
    );
  }

  isLifecycleChangeable(): boolean {
    return !this.isEdit;
  }

  async onFormSubmit(form: NgForm): Promise<void> {
    this.checkIfSubmitted = true;
    //Check Validation
    if (this.isInValid(form)) {
      this.snackBar.open(
        'Es müssen alle mit * gekennzeichneten Felder ausgefüllt sein',
        'Schließen',
        { duration: 5000 },
      );
      return;
    }

    // Sort Technologies alphabetically
    this.selectedConnectedTechnologies.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    this.values.connectedTechnologyIds = [];
    for (const technology of this.selectedConnectedTechnologies) {
      this.values.connectedTechnologyIds.push(technology.id);
    }
    if (this.isUnchanged(form)) {
      alert('Es wurde nichts verändert');
      return;
    }
    if (this.checkTechnologyNameAlreadyExits()) {
      alert('Diese Technologie existiert bereits');
      return;
    }
    if (!this.checkCertificates()) {
      return;
    }

    if (this.values.lifecycleId === null || this.values.lifecycleId === -5) {
      const dialogRef = this.undefinedDialog.open(UndefinedDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (!result) return;
        this.values.lifecycleId = -5;
        this.submitForm.emit();
      });
    } else {
      this.submitForm.emit();
    }
  }
}

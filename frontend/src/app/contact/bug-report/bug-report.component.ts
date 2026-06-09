import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserHandlingService } from 'src/app/services/user-handling.service';

export type FormValuesBug = {
  description: string | null;
  mailAddress: string | null;
  attachmentData: File[] | null;
  attachmentFileName: string[] | null;
  attachmentContentType: string[] | null;
  mailType: string | null;
};

/**
 * Component responsible for rendering and handling the bug report form.
 * Allows users to submit bug reports, including descriptions, email addresses, and file attachments.
 * Validates form inputs and displays appropriate messages for user actions.
 */
@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.css'],
})
export class BugReportComponent {
  @Input() values!: FormValuesBug;
  @Input() onSubmit!: () => Promise<void>;
  @Input() isSubmitting = false;
  @Input() hasError = false;
  @Input() checked = false;
  @Input() errorText = '';

  maxCharactersBugDescription = 1800;
  maxCharactersMailAddress = 255;
  checkIfSubmitted = false;

  /**
   * Constructs the `BugReportComponent`.
   * @param router Angular Router for navigating between views.
   * @param userHandlingService UserHandling Service
   */
  constructor(
    private router: Router,
    private userHandlingService: UserHandlingService,
  ) {}

  /**
   * Handles file selection, validating file size and type, and updates the form values with the file data.
   * @param event The file input change event, containing selected files.
   */
  onFileSelected(event: Event): void {
    const allowedFileTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    const fileNames: string[] = [];
    const contentTypes: string[] = [];
    const fileDataList: File[] = [];
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      for (const file of Array.from(files)) {
        if (file.size < 4000000) {
          if (allowedFileTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (): void => {
              fileNames.push(file.name);
              contentTypes.push(file.type);
              fileDataList.push(file);
            };
            reader.readAsDataURL(file);
          } else {
            alert(
              'Ungültiger Dateityp. Erlaubte Dateitypen sind: PDF, PNG, JPG, JPEG',
            );
          }
        } else {
          alert('Der Anhang ist zu groß. Max 4mb');
        }
      }
      this.values.attachmentFileName = fileNames;
      this.values.attachmentContentType = contentTypes;
      this.values.attachmentData = fileDataList;
    }
  }

  /**
   * Navigates back to the parent view without submitting the form.
   */
  cancel(): void {
    this.router.navigate([`../..`]);
  }

  /**
   * Validates the form and submits the bug report data if valid. Displays appropriate alerts for validation errors.
   * @param form The Angular form object containing the current state and validity of the form.
   */
  async onFormSubmit(form: NgForm): Promise<void> {
    const hasDescriptionIsWhitespace = /^\s*$/.test(
      this.values.description || '',
    );
    if (form.valid === false) {
      return;
    }
    if (form.dirty === false) {
      alert('Bitte alles ausfüllen');
      return;
    }
    if (!this.values.description || hasDescriptionIsWhitespace) {
      alert('Bitte gib eine gültige Beschreibung an');
      return;
    }

    this.values.mailAddress = this.userHandlingService.getUserEmail();

    await this.onSubmit();
  }
}

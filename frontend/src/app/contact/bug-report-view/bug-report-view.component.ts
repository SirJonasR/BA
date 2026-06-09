import { Component } from '@angular/core';
import { FormValuesBug } from '../bug-report/bug-report.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MailService } from 'src/app/services/mail.service';
import { ContactFormRequest } from 'src/app/models/contact.form.request';

/**
 * Component responsible for displaying the bug report view and handling the submission of bug reports.
 * It utilizes the `MailService` to send bug reports and Angular Material's `SnackBar` for user notifications.
 */
@Component({
  selector: 'app-bug-report-view',
  templateUrl: './bug-report-view.component.html',
  styleUrls: ['./bug-report-view.component.css'],
})
export class BugReportViewComponent {
  values: FormValuesBug;
  isSubmitting = false;
  hasError = false;
  checked = false;
  errorText = '';

  /**
   * Constructs the `BugReportViewComponent` with necessary dependencies.
   * @param router Angular Router for navigating between views.
   * @param snackBar MatSnackBar for showing notifications to the user.
   * @param mailService The MailService used for submitting bug reports via email.
   */
  constructor(
    private readonly router: Router,
    private snackBar: MatSnackBar,
    private readonly mailService: MailService,
  ) {
    this.values = {
      description: null,
      mailAddress: null,
      attachmentData: null,
      attachmentContentType: null,
      attachmentFileName: null,
      mailType: 'BugReport',
    };
  }

  /**
   * Asynchronously submits the bug report. It sets the submission state, handles the submission process including error handling,
   * and navigates the user upon successful submission or shows a notification in case of an error.
   */
  onSubmit = async (): Promise<void> => {
    this.isSubmitting = true;
    this.hasError = false;

    try {
      await firstValueFrom(
        this.mailService.sendMail(this.values as ContactFormRequest),
      );
      await this.router.navigate([`../..`]);
      this.snackBar.open(`Der Bug Report wurde erfolgreich abgesendet`);
    } catch (error) {
      const e: HttpErrorResponse = error as HttpErrorResponse;
      if (e.status === 429) {
        const retryAfter = e.headers.get('Retry-After');
        this.errorText = `Zu viele Anfragen. Bitte versuche es ${
          retryAfter ? `in ${retryAfter} Sekunden` : 'später'
        } erneut.`;
      }
      this.hasError = true;
      this.snackBar.open(
        `Beim Senden des Bug Reports ist ein Fehler aufgetreten`,
      );
    } finally {
      this.isSubmitting = false;
    }
  };
}

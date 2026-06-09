import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormValuesFeedback } from '../feedback/feedback.component';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MailService } from 'src/app/services/mail.service';
import { ContactFormRequest } from 'src/app/models/contact.form.request';

/**
 * Component responsible for displaying the feedback view and handling the submission of bug reports.
 * It utilizes the `MailService` to send feedbacks and Angular Material's `SnackBar` for user notifications.
 */
@Component({
  selector: 'app-feedback-view',
  templateUrl: './feedback-view.component.html',
  styleUrls: ['./feedback-view.component.css'],
})
export class FeedbackViewComponent {
  values: FormValuesFeedback;
  isSubmitting = false;
  hasError = false;
  checked = false;
  errorText = '';

  /**
   * Constructs the `BugReportViewComponent` with necessary dependencies.
   * @param router Angular Router for navigating between views.
   * @param snackBar MatSnackBar for showing notifications to the user.
   * @param mailService The MailService used for submitting feedbacks via email.
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
      attachmentFileName: null,
      attachmentContentType: null,
      mailType: 'Feedback',
    };
  }

  /**
   * Asynchronously submits the feedback. It sets the submission state, handles the submission process including error handling,
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
      this.snackBar.open(`Das Feedback wurde erfolgreich abgesendet`);
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
        `Beim Senden des Feedbacks ist ein Fehler aufgetreten`,
      );
    } finally {
      this.isSubmitting = false;
    }
  };
}

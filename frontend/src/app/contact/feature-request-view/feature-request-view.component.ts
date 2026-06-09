import { Component } from '@angular/core';
import { FormValuesFeature } from '../feature-request/feature-request.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MailService } from 'src/app/services/mail.service';
import { ContactFormRequest } from 'src/app/models/contact.form.request';

/**
 * Component responsible for displaying the feature request view and handling the submission of feature requests.
 * It utilizes the `MailService` to send feature requests and Angular Material's `SnackBar` for user notifications.
 */
@Component({
  selector: 'app-feature-request-view',
  templateUrl: './feature-request-view.component.html',
  styleUrls: ['./feature-request-view.component.css'],
})
export class FeatureRequestViewComponent {
  values: FormValuesFeature;
  isSubmitting = false;
  hasError = false;
  checked = false;
  errorText = '';

  /**
   * Constructs the `BugReportViewComponent` with necessary dependencies.
   * @param router Angular Router for navigating between views.
   * @param snackBar MatSnackBar for showing notifications to the user.
   * @param mailService The MailService used for submitting feature requests via email.
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
      mailType: 'Feature Request',
    };
  }

  /**
   * Asynchronously submits the feature request. It sets the submission state, handles the submission process including error handling,
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
      this.snackBar.open(`Der Feature Request wurde erfolgreich abgesendet`);
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
        `Beim Senden des Feature Requests ist ein Fehler aufgetreten`,
      );
    } finally {
      this.isSubmitting = false;
    }
  };
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ContactFormRequest } from 'src/app/models/contact.form.request';

/**
 * Injectable service class responsible for handling email sending functionality within the application.
 * Utilizes Angular's HttpClient for making HTTP POST requests to send mail data, including attachments,
 * to a specified mail endpoint defined in the environment configuration.
 */
@Injectable()
export class MailService {
  /**
   * The URL endpoint for sending mail, derived from the application's environment configuration.
   */
  private mailUrl = environment.apiUrl + '/contact';

  /**
   * HTTP options for the HttpClient requests, specifically setting the 'Content-Type' header to 'multipart/form-data'
   * to support file attachments in form data.
   */
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' }),
  };

  /**
   * Constructor for the MailService class.
   * @param http The HttpClient injection used for making HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * Sends an email using the form data provided by the user.
   * Constructs the form data from the ContactFormRequest object and sends it as a POST request.
   * @param mail The ContactFormRequest object containing the email details and attachments.
   * @returns Observable<Response> An Observable of the server's response to the POST request.
   */
  sendMail(mail: ContactFormRequest): Observable<Response> {
    const url = `${this.mailUrl}`;
    const formDataMail = this.convertValuesToFormData(mail);

    return this.http.post<Response>(url, formDataMail);
  }

  /**
   * Converts the ContactFormRequest object into FormData to be sent over HTTP.
   * This allows for the inclusion of file attachments alongside the email's other data.
   * @param values The ContactFormRequest object containing the email's data and attachments.
   * @returns FormData The FormData object populated with the email's details and attachments.
   */
  convertValuesToFormData(values: ContactFormRequest): FormData {
    const formDataMail = new FormData();
    formDataMail.append('description', values.description);
    formDataMail.append('mailAddress', values.mailAddress);
    formDataMail.append('mailType', values.mailType);
    if (
      values.attachmentData &&
      values.attachmentFileName &&
      values.attachmentContentType
    ) {
      for (let i = 0; i < values.attachmentData.length; i++) {
        formDataMail.append('attachmentData', values.attachmentData[i]);
        formDataMail.append('attachmentFileName', values.attachmentFileName[i]);
        formDataMail.append(
          'attachmentContentType',
          values.attachmentContentType[i],
        );
      }
    }

    return formDataMail;
  }
}

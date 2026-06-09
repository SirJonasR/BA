import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Certificate } from 'src/app/models/technology';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches a list of certificates from the API.
   *
   * @returns An Observable containing an array of Certificate objects.
   */
  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(environment.apiUrl + '/certificate');
  }
}

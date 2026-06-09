import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private reportUrl = environment.apiUrl + '/report';
  constructor(private http: HttpClient) {}

  createTechnologyDetailReport(
    technologyIds: number[],
    startDate?: Date,
    endDate?: Date,
  ): Observable<Blob> {
    const url = `${this.reportUrl}/technologyDetailReport`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/pdf',
    });

    const requestBody = {
      technologyIds: technologyIds,
      startDate: startDate,
      endDate: endDate,
    };

    return this.http.post(url, requestBody, {
      headers: headers,
      responseType: 'blob' as 'json',
    }) as Observable<Blob>;
  }

  downloadPDF(data: Blob, filename: string): void {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  createCustomerStatsReport(customerNames: string[]): Observable<Blob> {
    const url = `${this.reportUrl}/customerStatsReport`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/pdf',
    });

    const requestBody = {
      customerNames: customerNames,
    };

    return this.http.post(url, requestBody, {
      headers: headers,
      responseType: 'blob' as 'json',
    }) as Observable<Blob>;
  }
}

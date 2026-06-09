import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DeepExpertListItem {
  tableRow: number;
  technologyName: string;
  expertInformation: string;
  scope: string;
  comment: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeepExpertService {
  private readonly baseUrl = environment.apiUrl + '/deep-experts';

  constructor(private http: HttpClient) {}

  updateDeepExpertList(list: DeepExpertListItem[]): Observable<void> {
    return this.http.put<void>(this.baseUrl, list);
  }

  getDeepExpertByTechnologyId(
    technologyId: number,
  ): Observable<DeepExpertListItem[]> {
    return this.http.get<DeepExpertListItem[]>(
      `${this.baseUrl}/${technologyId}`,
    );
  }

  getDeepExpertList(): Observable<DeepExpertListItem[]> {
    return this.http.get<DeepExpertListItem[]>(this.baseUrl);
  }
}

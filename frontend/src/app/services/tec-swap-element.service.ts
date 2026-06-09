import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TecSwapElement } from 'src/app/models/technology';

@Injectable({ providedIn: 'root' })
export class TecSwapService {
  private readonly baseUrl = environment.apiUrl + '/tec_swap';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TecSwapElement[]> {
    return this.http.get<TecSwapElement[]>(`${this.baseUrl}`);
  }

  update(
    id: number,
    tecSwapElement: TecSwapElement,
  ): Observable<TecSwapElement> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<TecSwapElement>(url, tecSwapElement);
  }
}

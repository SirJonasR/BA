import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Customer {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches a list of customers from the API.
   *
   * @returns An Observable containing an array of Customer objects.
   */
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(environment.apiUrl + '/customer');
  }
}

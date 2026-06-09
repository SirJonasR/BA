import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Observable, map } from 'rxjs';
import {
  Subscription,
  SubscriptionItem,
  SubscriptionRequest,
} from 'src/app/models/subscription';

@Injectable()
export class UserSubscriptionService {
  private subscriptionsUrl = environment.apiUrl + '/subscription';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  isOwner(username: string, subscriptionId: number): Observable<boolean> {
    return this.getSubscriptionsByUser(username).pipe(
      map((subscriptions) => {
        const subscription = subscriptions.find(
          (sub) => sub.id === subscriptionId,
        );
        return !!subscription;
      }),
    );
  }

  getSubscriptionsByUser(username: string): Observable<Subscription[]> {
    const url = `${this.subscriptionsUrl}/user/${username}`;
    return this.http.get<Subscription[]>(url);
  }

  getSubscriptionById(id: number): Observable<Subscription> {
    const url = `${this.subscriptionsUrl}/id/${id}`;
    return this.http.get<Subscription>(url);
  }

  updateSubscription(
    id: number,
    subscription: SubscriptionRequest,
  ): Observable<Subscription> {
    const url = `${this.subscriptionsUrl}/${id}`;
    const formDataSubscription = this.convertValuesToFormData(subscription);

    return this.http.put<Subscription>(url, formDataSubscription);
  }

  createSubscription(
    subscription: SubscriptionRequest,
  ): Observable<Subscription> {
    const url = `${this.subscriptionsUrl}`;
    const formDataSubscription = this.convertValuesToFormData(subscription);

    return this.http.post<Subscription>(url, formDataSubscription);
  }

  deleteSubscription(id: number): Observable<Subscription> {
    const url = `${this.subscriptionsUrl}/${id}`;
    return this.http.delete<Subscription>(url, this.httpOptions);
  }

  convertValuesToFormData(values: SubscriptionRequest): FormData {
    const formDataSubscription = new FormData();
    formDataSubscription.append('name', values.name);
    formDataSubscription.append('timespan', values.timespan.toString());
    formDataSubscription.append('email', values.email.toString());

    values.selectedItems.forEach((subscriptionItem: SubscriptionItem) => {
      formDataSubscription.append(
        'subscribedItemType',
        subscriptionItem.itemType,
      );
      formDataSubscription.append(
        'subscribedItemId',
        subscriptionItem.itemId.toString(),
      );
    });

    return formDataSubscription;
  }
}

import { Component } from '@angular/core';
import { FormValues } from '../subscription-form/subscription-form.component';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import {
  SubscriptionItem,
  SubscriptionRequest,
} from 'src/app/models/subscription';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-subscription',
  templateUrl: './add-subscription.component.html',
  styleUrls: ['./add-subscription.component.css'],
})
export class AddSubscriptionComponent {
  values: FormValues;
  isSubmitting = false;
  hasError = false;

  constructor(
    private readonly router: Router,
    private readonly subscriptionService: UserSubscriptionService,
    private snackBar: MatSnackBar,
  ) {
    this.values = {
      name: null,
      selectedItems: [],
      timespan: null,
      email: null,
    };
  }

  onSubmit = async (): Promise<void> => {
    this.isSubmitting = true;
    this.hasError = false;
    try {
      const subscribedItems: SubscriptionItem[] = this.values.selectedItems.map(
        (item) => ({
          itemType: item.type,
          itemId: item?.values?.id || 0,
        }),
      );
      const subscription: SubscriptionRequest = {
        name: this.values.name || '',
        email: this.values.email || '',
        timespan: this.values.timespan || 0,
        selectedItems: subscribedItems,
      };
      if (this.values.name != null) subscription.name = this.values.name;
      await firstValueFrom(
        this.subscriptionService.createSubscription(subscription),
      );
      await this.router.navigate([`/subscription/overview`]);
      this.snackBar.open(
        `Das Abonnement ${subscription.name} wurde erfolgreich abgeschlossen.`,
      );
    } catch (error) {
      this.hasError = true;
      console.log(error);
    } finally {
      this.isSubmitting = false;
    }
  };
}

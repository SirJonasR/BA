import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormValues,
  ItemValues,
} from '../subscription-form/subscription-form.component';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import { TechnologyService } from 'src/app/services/technology.service';

import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SubscriptionItem,
  SubscriptionItemType,
  SubscriptionRequest,
} from 'src/app/models/subscription';

@Component({
  selector: 'app-edit-subscription',
  templateUrl: './edit-subscription.component.html',
  styleUrls: ['./edit-subscription.component.css'],
})
export class EditSubscriptionComponent implements OnInit {
  id: number;
  values!: FormValues;
  isSubmitting = false;
  hasError = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly technologyService: TechnologyService,
    private snackBar: MatSnackBar,
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.userSubscriptionService
      .getSubscriptionById(this.id)
      .subscribe((subscription) => {
        const subscribedItems: ItemValues[] = [];
        subscription.subscriptionItems.forEach(
          async (element: {
            itemType: SubscriptionItemType;
            itemId: number;
          }) => {
            if (element.itemType === SubscriptionItemType.CATEGORY) {
              const item: ItemValues = {
                type: element.itemType,
                values: this.technologyService.getCategoryById(element.itemId),
              };
              subscribedItems.push(item);
            } else if (element.itemType === SubscriptionItemType.LIFECYCLE) {
              const item: ItemValues = {
                type: element.itemType,
                values: this.technologyService.getLifecycleById(element.itemId),
              };
              subscribedItems.push(item);
            } else if (element.itemType === SubscriptionItemType.TECHNOLOGY) {
              const item: ItemValues = {
                type: element.itemType,
                values: await firstValueFrom(
                  this.technologyService.getTechnology(element.itemId),
                ),
              };
              subscribedItems.push(item);
            }
          },
        );

        this.values = {
          name: subscription.name,
          email: subscription.email,
          timespan: subscription.timespan,
          selectedItems: subscribedItems,
        };
      });
  }

  onSubmit = async (): Promise<void> => {
    this.isSubmitting = true;
    this.hasError = false;
    try {
      const subscribedItems: SubscriptionItem[] = this.values.selectedItems.map(
        (item) => ({
          itemType: item.type,
          itemId: item?.values?.id ?? 0,
        }),
      );
      const subscription: SubscriptionRequest = {
        name: this.values.name || '',
        email: this.values.email || '',
        timespan: this.values.timespan || 0,
        selectedItems: subscribedItems,
      };
      if (this.values.name != null) subscription.name = this.values.name;
      const response = await firstValueFrom(
        this.userSubscriptionService.updateSubscription(this.id, subscription),
      );
      await this.router.navigate([`/subscription/overview`]);
      this.snackBar.open(
        `Das Abonnement ${response.name} wurde erfolgreich aktualisiert.`,
      );
    } catch (error) {
      this.hasError = true;
      console.log(error);
    } finally {
      this.isSubmitting = false;
    }
  };
}

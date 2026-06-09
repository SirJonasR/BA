import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { RemoveDialogComponent } from 'src/app/utils/remove-dialog/remove-dialog.component';
import {
  Subscription,
  SubscriptionItem,
  SubscriptionItemType,
} from 'src/app/models/subscription';
import { TechnologyService } from 'src/app/services/technology.service';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';

@Component({
  selector: 'app-subscription-overview',
  templateUrl: './subscription-overview.component.html',
  styleUrls: ['./subscription-overview.component.css'],
})
export class SubscriptionOverviewComponent implements OnInit {
  subscriptions: Subscription[] = [];

  dataSource: MatTableDataSource<Subscription> = new MatTableDataSource();
  displayedColumns: string[] = [
    'name',
    'items',
    'timespan',
    'email',
    'actions',
  ];

  constructor(
    private readonly router: Router,
    private technologyService: TechnologyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userSubscriptionService: UserSubscriptionService,
    private userHandlingService: UserHandlingService,
  ) {}

  ngOnInit(): void {
    this.userSubscriptionService
      .getSubscriptionsByUser(this.userHandlingService.getUserName())
      .subscribe((subscriptions) => {
        this.subscriptions = subscriptions;
        this.mapValues(this.subscriptions).then((data) => {
          this.dataSource.data = data;
        });
      });
  }

  async mapValues(subscriptions: Subscription[]): Promise<
    Awaited<{
      subscriptionItems: SubscriptionItem[];
      subscribedItemsName: Awaited<string | undefined | number>[];
      name: string;
      id: number;
      timespan: number;
      userId: number;
      email: string;
    }>[]
  > {
    return await Promise.all(
      subscriptions.map(async (subscription) => {
        const subscribedItemsName = await Promise.all(
          subscription.subscriptionItems.map(async (item) => {
            if (item.itemType === SubscriptionItemType.CATEGORY)
              return this.technologyService.getCategoryById(item.itemId)?.name;
            else if (item.itemType === SubscriptionItemType.LIFECYCLE)
              return this.technologyService.getLifecycleById(item.itemId)?.name;
            else if (item.itemType === SubscriptionItemType.TECHNOLOGY) {
              const technology = await lastValueFrom(
                this.technologyService.getTechnology(item.itemId),
              );
              return technology.name;
            }
            return item.itemId;
          }),
        );

        return { ...subscription, subscribedItemsName };
      }),
    );
  }

  openDeleteConfirmationDialog(subscription: Subscription): void {
    this.dialog.open(RemoveDialogComponent, {
      data: {
        resourceType: 'Abonnement',
        resourceName: subscription.name,
        onDelete: () => this.deleteSubscription(subscription),
      },
    });
  }

  deleteSubscription(subscription: Subscription): void {
    this.userSubscriptionService
      .deleteSubscription(subscription.id)
      .subscribe(() => {
        this.dialog.closeAll();
      });
    this.userSubscriptionService
      .getSubscriptionsByUser(this.userHandlingService.getUserName())
      .subscribe((subscriptions) => {
        this.subscriptions = subscriptions;
        this.mapValues(this.subscriptions).then((data) => {
          this.dataSource.data = data;
        });
        //Manual rerendering
        const url = this.router.url;
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate([url]);
          });
      });
    this.snackBar.open(
      `Das Abonnement ${subscription.name} wurde erfolgreich gelöscht.`,
    );
  }
}

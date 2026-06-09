import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { SubscriptionOverviewComponent } from './subscription-overview.component';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TechnologyService } from 'src/app/services/technology.service';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { KeycloakService } from 'keycloak-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  Subscription,
  SubscriptionItemType,
} from 'src/app/models/subscription';
import { of } from 'rxjs';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { Router } from '@angular/router';

describe('SubscriptionOverviewComponent', () => {
  let component: SubscriptionOverviewComponent;
  let fixture: ComponentFixture<SubscriptionOverviewComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let userSubscriptionServiceSpy: jasmine.SpyObj<UserSubscriptionService>;
  const keycloakServiceStub: Partial<KeycloakService> = {
    logout: function () {
      return new Promise((resolve) => resolve());
    },
    getUsername: function () {
      return 'gandalf';
    },
  };

  beforeEach(async () => {
    userSubscriptionServiceSpy = jasmine.createSpyObj(
      'UserSubscriptionService',
      ['getSubscriptionsByUser', 'deleteSubscription'],
    );
    mockDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      declarations: [SubscriptionOverviewComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        UserHandlingService,
        TechnologyService,
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: mockDialog },
        { provide: KeycloakService, useValue: keycloakServiceStub },
        {
          provide: UserSubscriptionService,
          useValue: userSubscriptionServiceSpy,
        },
        { provide: Router, useValue: routerSpy },
      ],
    });
    fixture = TestBed.createComponent(SubscriptionOverviewComponent);
    component = fixture.componentInstance;
    const subscriptionData: Subscription[] = [
      {
        id: 1,
        userId: 1,
        email: 'test@test.com',
        timespan: 30,
        subscriptionItems: [
          { itemType: SubscriptionItemType.LIFECYCLE, itemId: 1 },
        ],
        name: 'Test Subscription',
      },
    ];
    userSubscriptionServiceSpy.getSubscriptionsByUser.and.returnValue(
      of(subscriptionData),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate data on ngOnInit', () => {
    component.ngOnInit();
    expect(component.subscriptions.length).toBe(1);
    expect(component.subscriptions[0].name).toBe('Test Subscription');
  });

  it('should delete subscription', fakeAsync(() => {
    const subscription: Subscription = {
      id: 1,
      name: 'Subscription 1',
      userId: 1,
      subscriptionItems: [],
      timespan: 30,
      email: 'test@example.com',
    };

    userSubscriptionServiceSpy.deleteSubscription.and.returnValue(
      of(subscription),
    );

    userSubscriptionServiceSpy.getSubscriptionsByUser.and.returnValue(of([]));

    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));

    component.deleteSubscription(subscription);
    tick();
    expect(userSubscriptionServiceSpy.deleteSubscription).toHaveBeenCalledWith(
      subscription.id,
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      `Das Abonnement ${subscription.name} wurde erfolgreich gelöscht.`,
    );
  }));
});

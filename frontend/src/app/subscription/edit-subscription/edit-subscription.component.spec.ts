import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { EditSubscriptionComponent } from './edit-subscription.component';
import { Router } from '@angular/router';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Subscription,
  SubscriptionItemType,
} from 'src/app/models/subscription';
import { Observable, of } from 'rxjs';
import { TechnologyService } from 'src/app/services/technology.service';
import { Lifecycle } from 'src/app/models/technology';

describe('EditSubscriptionComponent', () => {
  let component: EditSubscriptionComponent;
  let fixture: ComponentFixture<EditSubscriptionComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userSubscriptionServiceSpy: jasmine.SpyObj<UserSubscriptionService>;
  let technologyServiceSbyObj: jasmine.SpyObj<TechnologyService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    userSubscriptionServiceSpy = jasmine.createSpyObj(
      'UserSubscriptionService',
      ['updateSubscription', 'getSubscriptionById'],
    );
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    technologyServiceSbyObj = jasmine.createSpyObj('TechnologyService', [
      'getLifecycleById',
      'getTechnology',
      'getCategoryById',
    ]);

    const subscriptionData: Subscription = {
      id: 1,
      userId: 1,
      email: 'test@test.com',
      timespan: 30,
      subscriptionItems: [
        { itemType: SubscriptionItemType.LIFECYCLE, itemId: 1 },
      ],
      name: 'Test Subscription',
    };

    userSubscriptionServiceSpy.getSubscriptionById.and.returnValue(
      of(subscriptionData),
    );

    await TestBed.configureTestingModule({
      declarations: [EditSubscriptionComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: UserSubscriptionService,
          useValue: userSubscriptionServiceSpy,
        },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: TechnologyService, useValue: technologyServiceSbyObj },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSubscriptionComponent);
    component = fixture.componentInstance;
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [
        {
          type: SubscriptionItemType.LIFECYCLE,
          values: 1 as unknown as Lifecycle,
        },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate from values with subscription data', fakeAsync(() => {
    component.ngOnInit();
    expect(component.values.name).toEqual('Test Subscription');
    expect(component.values.email).toEqual('test@test.com');
    expect(component.values.timespan).toEqual(30);
    expect(component.values.selectedItems.length).toEqual(1);
    expect(userSubscriptionServiceSpy.getSubscriptionById).toHaveBeenCalled();
  }));

  it('should handle form submission error', fakeAsync(() => {
    component.ngOnInit();
    component.id = 1;
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [
        {
          type: SubscriptionItemType.LIFECYCLE,
          values: 1 as unknown as Lifecycle,
        },
      ],
    };
    const mockError: Error = new Error('An error occurred');
    userSubscriptionServiceSpy.updateSubscription.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(mockError);
      }),
    );
    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(true);
    expect(userSubscriptionServiceSpy.updateSubscription).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(snackBarSpy.open).not.toHaveBeenCalled();
  }));
});

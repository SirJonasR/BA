import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

import { AddSubscriptionComponent } from './add-subscription.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { SubscriptionItemType } from 'src/app/models/subscription';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import { Lifecycle } from 'src/app/models/technology';

@Component({
  selector: 'app-subscription-form',
  template: '',
})
class SubscriptionFormStubComponent {
  @Input() values: unknown;
  @Input() isSubmitting = false;
  @Input() hasError = false;
  @Output() submitForm = new EventEmitter<void>();
}

describe('AddSubscriptionComponent', () => {
  let component: AddSubscriptionComponent;
  let fixture: ComponentFixture<AddSubscriptionComponent>;
  let userSubscriptionServiceSpy: jasmine.SpyObj<UserSubscriptionService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let router: Router;

  beforeEach(() => {
    userSubscriptionServiceSpy = jasmine.createSpyObj(
      'UserSubscriptionService',
      ['createSubscription'],
    );
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      declarations: [AddSubscriptionComponent, SubscriptionFormStubComponent],
      imports: [RouterTestingModule, MatDividerModule],
      providers: [
        {
          provide: UserSubscriptionService,
          useValue: userSubscriptionServiceSpy,
        },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AddSubscriptionComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit subscription successfully', fakeAsync(() => {
    const mockResponse = {
      id: 1,
      userId: 1,
      email: 'test@test.com',
      timespan: 30,
      subscriptionItems: [
        { itemType: SubscriptionItemType.LIFECYCLE, itemId: 1 },
      ],
      name: 'Test',
    };
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

    userSubscriptionServiceSpy.createSubscription.and.returnValue(
      of(mockResponse),
    );
    const navigateSpy = spyOn(router, 'navigate');

    component.onSubmit();
    tick();

    expect(component.hasError).toBe(false);
    expect(userSubscriptionServiceSpy.createSubscription).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith([`/subscription/overview`]);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Das Abonnement Test wurde erfolgreich abgeschlossen.',
    );
  }));

  it('should handle error during submission', fakeAsync(() => {
    const mockError = new Error('An error occurred');
    userSubscriptionServiceSpy.createSubscription.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(mockError);
      }),
    );

    component.onSubmit();
    tick();

    expect(userSubscriptionServiceSpy.createSubscription).toHaveBeenCalled();
    expect(snackBarSpy.open).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(true);
  }));
});

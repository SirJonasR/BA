import { TestBed } from '@angular/core/testing';

import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  SubscriptionItemType,
  Subscription,
  SubscriptionRequest,
} from 'src/app/models/subscription';

describe('UserSubscriptionService', () => {
  let service: UserSubscriptionService;
  let httpTestingController: HttpTestingController;
  /**
   * @description
   * Setup for each test case.
   * Initializes UserSubscriptionService.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserSubscriptionService],
    });
    service = TestBed.inject(UserSubscriptionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return subscriptions by user', () => {
    const testUsername = 'testUser';
    const testSubscription: Subscription[] = [
      {
        id: 1,
        name: 'testSubscription',
        email: 'testmail@test.de',
        userId: 1,
        timespan: 2,
        subscriptionItems: [],
      },
    ];
    service.getSubscriptionsByUser(testUsername).subscribe((subscription) => {
      expect(subscription).toEqual(testSubscription);
    });
    const req = httpTestingController.expectOne(
      `${service['subscriptionsUrl']}/user/${testUsername}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(testSubscription);
  });

  it('should return subscriptions by id', () => {
    const testId = 1;
    const testSubscription: Subscription = {
      id: 1,
      name: 'testSubscription',
      email: 'testmail@test.de',
      userId: 1,
      timespan: 2,
      subscriptionItems: [],
    };
    service.getSubscriptionById(testId).subscribe((subscription) => {
      expect(subscription).toEqual(testSubscription);
    });
    const req = httpTestingController.expectOne(
      `${service['subscriptionsUrl']}/id/${testId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(testSubscription);
  });

  it('should update subscription', () => {
    const dummyId = 1;
    const dummySubscription: SubscriptionRequest = {
      name: 'Subscription 1',
      timespan: 30,
      email: 'test@test.com',
      selectedItems: [{ itemType: SubscriptionItemType.TECHNOLOGY, itemId: 1 }],
    };

    service
      .updateSubscription(dummyId, dummySubscription)
      .subscribe((response) => {
        expect(response).toBeTruthy();
      });

    const req = httpTestingController.expectOne(
      `${service['subscriptionsUrl']}/${dummyId}`,
    );
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should create subscription', () => {
    const dummySubscription: SubscriptionRequest = {
      name: 'Subscription 1',
      timespan: 30,
      email: 'test@test.com',
      selectedItems: [],
    };

    service.createSubscription(dummySubscription).subscribe((subscription) => {
      expect(subscription).toBeTruthy();
    });

    const req = httpTestingController.expectOne(
      `${service['subscriptionsUrl']}`,
    );
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should delete subscription', () => {
    const dummyId = 1;

    service.deleteSubscription(dummyId).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(
      `${service['subscriptionsUrl']}/${dummyId}`,
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});

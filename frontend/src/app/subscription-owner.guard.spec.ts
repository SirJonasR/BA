import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  ParamMap,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { subscriptionOwnerGuard } from './subscription-owner.guard';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('subscriptionOwnerGuard', () => {
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;
  let mockUserSubscriptionService: jasmine.SpyObj<UserSubscriptionService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockUserHandlingService = jasmine.createSpyObj('UserHandlingService', [
      'getUserName',
    ]);
    mockUserSubscriptionService = jasmine.createSpyObj(
      'UserSubscriptionService',
      ['isOwner'],
    );
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: UserHandlingService, useValue: mockUserHandlingService },
        {
          provide: UserSubscriptionService,
          useValue: mockUserSubscriptionService,
        },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });
  const executeGuard: CanActivateFn = (route, state) =>
    TestBed.runInInjectionContext(() => subscriptionOwnerGuard(route, state));

  const createMockRoute = (id: string): ActivatedRouteSnapshot => {
    const paramMap: ParamMap = {
      get: (key: string) => (key === 'id' ? id : null),
      has: (key: string) => key === 'id',
      keys: ['id'],
    } as ParamMap;

    const route = new ActivatedRouteSnapshot();
    Object.defineProperty(route, 'paramMap', { value: paramMap });
    return route;
  };

  const createMockState = (): RouterStateSnapshot => {
    return {} as RouterStateSnapshot;
  };

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if user is the subscription owner', async () => {
    const mockRoute = createMockRoute('1');
    const mockState = createMockState();
    mockUserHandlingService.getUserName.and.returnValue('testUser');
    mockUserSubscriptionService.isOwner.and.returnValue(of(true));

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeTrue();
    expect(mockUserHandlingService.getUserName).toHaveBeenCalled();
    expect(mockUserSubscriptionService.isOwner).toHaveBeenCalledWith(
      'testUser',
      1,
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and navigate to /error if user is not the subscription owner', async () => {
    const mockRoute = createMockRoute('1');
    const mockState = createMockState();

    mockUserHandlingService.getUserName.and.returnValue('testUser');
    mockUserSubscriptionService.isOwner.and.returnValue(of(false));

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/error']);
  });

  it('should deny access and navigate to /error if an error occurs', async () => {
    const mockRoute = createMockRoute('1');
    const mockState = createMockState();

    mockUserHandlingService.getUserName.and.returnValue('testUser');
    mockUserSubscriptionService.isOwner.and.returnValue(
      throwError(() => new Error('Error occurred')),
    );

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/error']);
  });

  it('should handle invalid subscription ID and navigate to /error', async () => {
    const mockRoute = createMockRoute('-1');
    const mockState = createMockState();

    mockUserHandlingService.getUserName.and.returnValue('testUser');
    mockUserSubscriptionService.isOwner.and.returnValue(of(false));

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/error']);
  });
});

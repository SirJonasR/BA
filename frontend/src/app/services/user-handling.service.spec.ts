import { TestBed } from '@angular/core/testing';
import {
  User,
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { KeycloakService } from 'keycloak-angular';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

/**
 * @description
 * Unit tests for the UserHandlingService class.
 * Uses Jasmine for spies and assertions.
 */
describe('UserHandlingService', () => {
  let userHandlingService: UserHandlingService;
  let mockKeycloakService: jasmine.SpyObj<KeycloakService>;
  let httpMock: HttpTestingController;

  /**
   * @description
   * Setup for each test case.
   * Initializes UserHandlingService and mocks KeycloakService.
   */
  beforeEach(() => {
    mockKeycloakService = jasmine.createSpyObj('KeycloakService', [
      'getUsername',
      'logout',
      'loadUserProfile',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserHandlingService,
        { provide: KeycloakService, useValue: mockKeycloakService },
      ],
    });

    userHandlingService = TestBed.inject(UserHandlingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * @description
   * Tests whether the UserHandlingService is created successfully.
   */
  it('should be created', () => {
    expect(userHandlingService).toBeTruthy();
  });

  /**
   * @description
   * Asynchronously tests if the userHandlingService correctly determines whether the user has an 'admin' role.
   */
  it('should determine if user is admin', async () => {
    const mockUserResponse = {
      userName: 'testUser',
      roles: ['ADMIN'],
      colourDisplay: false,
      iconDisplay: false,
    };

    const initPromise = userHandlingService.init();

    httpMock.expectOne(environment.apiUrl + '/user/me').flush(mockUserResponse);
    await initPromise;
    expect(userHandlingService.hasRole(UserRole.ADMIN)).toBeTrue();
  });

  /**
   * @description
   * Asynchronously tests if the userHandlingService correctly retrieves the username.
   */
  //it('should get the username', async () => {
  it('should get the username', async () => {
    //Mock Response of getAdmin in userHandlingService.init()
    const mockUserResponse = {
      userName: 'testUser',
      roles: ['ADMIN'],
      colourDisplay: false,
      iconDisplay: false,
    };

    mockKeycloakService.getUsername.and.returnValue('testUser');
    const initPromise = userHandlingService.init();
    httpMock.expectOne(environment.apiUrl + '/user/me').flush(mockUserResponse);
    await initPromise;
    expect(userHandlingService.user.userName).toBe('testUser');
  });

  /**
   * @description
   * Tests if the userHandlingService correctly triggers the logout process.
   */
  it('should logout the user', () => {
    userHandlingService.logout();
    expect(mockKeycloakService.logout).toHaveBeenCalled();
  });

  /**
   * @description
   * Tests if the Methode sends an HTTP DELETE call to right URL.
   */
  it('should revoke consent', () => {
    const emailAddress = 'test@example.com';
    const url = `${environment.apiUrl}/contact/revoke-consent?email=${emailAddress}`;
    userHandlingService.revokeConsent(emailAddress).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  /**
   * @description
   * Tests if the methode sends an HTTP GET call to right URL.
   */
  it('should check if agreement exists', () => {
    const url = `${environment.apiUrl}/contact/agreement`;
    userHandlingService.doesAgreementExist().subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(true); // assuming the agreement exists
  });

  it('should get All User', () => {
    const mockRespond = [
      {
        userName: 'testUser',
        roles: ['ADMIN'],
        colourDisplay: false,
        iconDisplay: false,
      },
      {
        userName: 'testUser2',
        roles: ['USER'],
        colourDisplay: false,
        iconDisplay: false,
      },
    ];

    userHandlingService.getAllUser().subscribe((users) => {
      expect(users.length).toBe(2);
    });
    const req = httpMock.expectOne(environment.apiUrl + '/user');
    expect(req.request.method).toBe('GET');
    req.flush(mockRespond);
    httpMock.verify();
  });

  it('should test updateUser', () => {
    const mockUsers = [
      {
        userName: 'user1',
        roles: [UserRole.USER],
      } as User,
      {
        userName: 'user2',
        roles: [UserRole.ADMIN],
      } as User,
    ];
    userHandlingService.updateUser(mockUsers[0]).subscribe();
    const req = httpMock.expectOne(environment.apiUrl + '/user');
    expect(req.request.method).toBe('PUT');
    req.flush(mockUsers[0]);
    httpMock.verify();
  });

  it('should test user display', async () => {
    const mockUser: User = {
      userName: 'testUser',
      roles: ['ADMIN'],
      showIconsInColor: true,
      showIcons: true,
    } as User;
    userHandlingService.user = mockUser;
    userHandlingService.isInitialized = true;
    const isColourDisplay = await userHandlingService.getShowIconsInColor();
    const isIconDisplay = await userHandlingService.getShowIcons();
    expect(isColourDisplay).toBeTrue();
    expect(isIconDisplay).toBeTrue();
    const promise = userHandlingService.updateUserDisplay(false, false);
    const req = httpMock.expectOne(environment.apiUrl + '/user/settings');
    expect(req.request.body.showIcons).toBeFalse();
    expect(req.request.body.showIconsInColor).toBeFalse();
    expect(req.request.method).toBe('PUT');
    req.flush(mockUser);
    httpMock.verify();
    await promise;
    expect(userHandlingService.user.showIconsInColor).toBeFalsy();
    expect(userHandlingService.user.showIcons).toBeFalsy();
  });
});

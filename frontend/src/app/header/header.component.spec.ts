import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { KeycloakService } from 'keycloak-angular';
import { MatMenuModule } from '@angular/material/menu';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

/**
 * @description
 * Unit tests for the Header-Component class.
 * Uses Jasmine for spies and assertions.
 */
describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let userHandlingService: UserHandlingService;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const keycloakServiceStub: Partial<KeycloakService> = {
    logout: function () {
      return new Promise((resolve) => resolve());
    },
    getUsername: function () {
      return 'gandalf';
    },
  };

  const userHandlingServiceStub: Partial<UserHandlingService> = {
    logout: function () {
      return;
    },

    user: {
      userName: 'testUser',
      roles: [UserRole.USER],
      showIconsInColor: false,
      showIcons: false,
    },
    hasRole(role: UserRole): boolean {
      return !!role;
    },
    doesAgreementExist(): Observable<boolean> {
      return of(true);
    },
  };

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [MatMenuModule, MatDialogModule, HttpClientTestingModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: KeycloakService, useValue: keycloakServiceStub },
        { provide: UserHandlingService, useValue: userHandlingServiceStub },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    userHandlingService = TestBed.inject(UserHandlingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout method of UserHandlingService when logout is called', () => {
    spyOn(userHandlingService, 'logout');
    component.logout();
    expect(userHandlingService.logout).toHaveBeenCalled();
  });
});

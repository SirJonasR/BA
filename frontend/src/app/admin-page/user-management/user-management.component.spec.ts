import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { UserManagementComponent } from './user-management.component';
import {
  User,
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { KeycloakService } from 'keycloak-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;
  let mockKeyCloakService: jasmine.SpyObj<KeycloakService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  const users: User[] = [
    {
      userName: 'user1',
      roles: [UserRole.USER],
      showIconsInColor: false,
      showIcons: false,
    },
    {
      userName: 'admin1',
      roles: [UserRole.ADMIN],
      showIconsInColor: false,
      showIcons: false,
    },
  ];
  beforeEach(() => {
    mockUserHandlingService = jasmine.createSpyObj('UserHandlingService', [
      'getAllUser',
      'updateUser',
    ]);
    mockUserHandlingService.getAllUser.and.returnValue(of(users));
    mockUserHandlingService.updateUser.and.returnValue(of(users[0]));
    mockSnackBar = jasmine.createSpyObj('MatSnackbar', ['open']);
    TestBed.configureTestingModule({
      declarations: [UserManagementComponent],
      providers: [
        { provide: KeycloakService, useValue: mockKeyCloakService },
        { provide: UserHandlingService, useValue: mockUserHandlingService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
      imports: [MatPaginatorModule, MatSortModule, BrowserAnimationsModule],
    });
    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test updating an user', fakeAsync(() => {
    component.onRolesChange(users[0]);
    expect(component.shouldConfirmButton(users[0])).toBeTrue();
    component.confirmChanges(users[0]);
    tick();
    expect(mockUserHandlingService.updateUser).toHaveBeenCalled();
  }));

  it('should test search', () => {
    component.searchText = 'user1';
    component.startFilter();
    expect(component.dataSource.data[0].userName).toBe('user1');
    component.isSearchVisible = false;
    component.toggleSearch();
    expect(component.isSearchVisible).toBeTrue();
  });

  it('should test filter', () => {
    component.selectedUserRoles = [UserRole.ADMIN];
    component.startFilter();
    expect(component.dataSource.data[0].userName).toBe('admin1');
    component.resetFilter();
    expect(component.selectedUserRoles.length).toBe(0);
  });
});

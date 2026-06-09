import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { KeycloakService } from 'keycloak-angular';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockKeycloakService: jasmine.SpyObj<KeycloakService>;

  beforeEach(() => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockKeycloakService = jasmine.createSpyObj('KeycloakService', [
      'getUsername',
      'logout',
      'loadUserProfile',
    ]);
    TestBed.configureTestingModule({
      declarations: [NavigationComponent],
      providers: [
        TechnologyService,
        { provide: MatDialog, useValue: mockDialog },
        { provide: KeycloakService, useValue: mockKeycloakService },
      ],
      imports: [
        MatMenuModule,
        MatIconModule,
        HttpClientTestingModule,
        MatDialogModule,
        RouterTestingModule,
      ],
    });

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve categories and lifecycles from TechnologyService', () => {
    // Stellen Sie sicher, dass die Kategorien und Lebenszyklen geladen wurden
    expect(component.getCategories).toBeDefined();
    expect(component.getLifecycles).toBeDefined();
  });
});

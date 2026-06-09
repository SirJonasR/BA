import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TechnologyDetailsComponent } from './technology-details.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { KeycloakAngularModule } from 'keycloak-angular';
import { technologiesMock } from 'src/app/utils/mock-objekts/technologies.mock';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { Technology } from 'src/app/models/technology';
import { RemoveDialogComponent } from 'src/app/utils/remove-dialog/remove-dialog.component';

describe('TechnologyDetailsComponent', () => {
  let component: TechnologyDetailsComponent;
  let fixture: ComponentFixture<TechnologyDetailsComponent>;
  let technologyService: TechnologyService;
  let pictureService: PictureService;
  let dialog: MatDialog;
  let snackBar: MatSnackBar;
  let userHandling: UserHandlingService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
        KeycloakAngularModule,
      ],
      declarations: [TechnologyDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (): string => '1' } } },
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
        TechnologyService,
        PictureService,
        MatDialog,
        MatSnackBar,
        UserHandlingService,
      ],
    });

    fixture = TestBed.createComponent(TechnologyDetailsComponent);
    component = fixture.componentInstance;
    technologyService = TestBed.inject(TechnologyService);
    pictureService = TestBed.inject(PictureService);
    dialog = TestBed.inject(MatDialog);
    snackBar = TestBed.inject(MatSnackBar);
    userHandling = TestBed.inject(UserHandlingService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog with correct data when openDeleteConfirmationDialog is called', () => {
    component.technology = technologiesMock[0];
    component.deleteTechnology = jasmine.createSpy();

    const spy = spyOn(dialog, 'open').and.callThrough();

    component.openDeleteConfirmationDialog();

    expect(spy).toHaveBeenCalledOnceWith(RemoveDialogComponent, {
      data: {
        resourceName: technologiesMock[0].name,
        resourceType: 'Technologie',
        onDelete: component.deleteTechnology,
      },
    });
  });

  it('should initialize technology details', () => {
    const mockTechnology: Technology = {
      id: 1,
      name: 'Tech1',
      description: 'Tech1 description',
      shortDescription: 'Tech1 short description',
      pictureId: 1,
      categoryId: 1,
      lifecycleId: 1,
      tags: [],
      priority: false,
      projects: [
        {
          id: 1,
          name: 'project1',
          customers: [
            {
              id: 1,
              name: 'customer1',
            },
          ],
        },
      ],
      status: 1,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    spyOn(technologyService, 'getTechnology').and.returnValue(
      of(mockTechnology),
    );
    spyOn(component, 'getPicture');
    spyOn(component, 'getSimilarity');

    component.ngOnInit();
    expect(component.id).toBe(1);
    expect(component.technology).toEqual(mockTechnology);
    expect(component.getPicture).toHaveBeenCalled();
    expect(component.getSimilarity).toHaveBeenCalled();
  });

  it('should get lifecycle name by id', () => {
    const mockLifecycle = {
      id: 1,
      name: 'Test Lifecycle',
      description: 'Description',
    };
    spyOn(technologyService, 'getLifecycleById').and.returnValue(mockLifecycle);

    const result = component.getLifecycleNameById(1);
    expect(result).toBe('Test Lifecycle');
  });

  it('should return undefined if lifecycle id is invalid', () => {
    spyOn(technologyService, 'getLifecycleById').and.returnValue(undefined);

    const result = component.getLifecycleNameById(999);
    expect(result).toBeUndefined();
  });

  it('should load picture if available', () => {
    component.technology = {
      id: 1,
      name: 'Tech1',
      description: 'Tech1 description',
      shortDescription: 'Tech1 short description',
      pictureId: 1,
      categoryId: 1,
      lifecycleId: 1,
      tags: [],
      projects: [],
      status: 1,
      priority: false,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    const mockPictureUrl = 'some-url';
    spyOn(pictureService, 'loadPicture').and.returnValue(of(mockPictureUrl));

    component.getPicture();
    // expect(component.pictureUrl).toBe(mockPictureUrl);
    expect(component.pictureAvailable).toBeTrue();
  });

  it('should handle picture loading error', () => {
    component.technology = {
      id: 1,
      name: 'Tech1',
      description: 'Tech1 description',
      shortDescription: 'Tech1 short description',
      pictureId: 1,
      categoryId: 1,
      lifecycleId: 1,
      tags: [],
      projects: [],
      status: 1,
      priority: false,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };

    spyOn(pictureService, 'loadPicture').and.returnValue(
      throwError(() => new HttpErrorResponse({ error: 'Some error' })),
    );
    spyOn(window, 'alert');

    component.getPicture();

    expect(window.alert).toHaveBeenCalledWith(
      'Etwas lief schief beim Bild laden: Http failure response for (unknown url): undefined undefined',
    );
  });

  it('should delete technology', () => {
    component.technology = {
      id: 1,
      name: 'Tech1',
      description: 'Tech1 description',
      shortDescription: 'Tech1 short description',
      pictureId: 1,
      categoryId: 1,
      lifecycleId: 1,
      tags: [],
      projects: [],
      status: 1,
      priority: false,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    spyOn(technologyService, 'deleteTechnology').and.returnValue(
      of({} as Technology),
    );
    spyOn(dialog, 'closeAll');
    spyOn(snackBar, 'open');

    component.deleteTechnology();

    expect(technologyService.deleteTechnology).toHaveBeenCalledWith(1);
    expect(dialog.closeAll).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return admin status', () => {
    userHandling.user = {
      userName: '',
      showIconsInColor: false,
      showIcons: false,
      roles: [UserRole.ADMIN],
    };
    expect(component.isAdmin()).toBeTrue();
  });

  it('should get category name', () => {
    spyOn(technologyService, 'getCategoryById').and.returnValue({
      id: 1,
      name: 'Test Category',
      description: 'Description',
    });
    component.technology = { categoryId: 1 } as Technology;
    expect(component.getCategoryName()).toBe('Test Category');
  });

  it('should get lifecycle name', () => {
    spyOn(technologyService, 'getLifecycleById').and.returnValue({
      id: 1,
      name: 'Test Lifecycle',
      description: 'Description',
    });
    component.technology = { lifecycleId: 1 } as Technology;
    expect(component.getLifecycleName()).toBe('Test Lifecycle');
  });

  it('should get similarity', () => {
    const mockSimilarity: object = { key1: '1', key2: '2' };
    spyOn(technologyService, 'getSimilarity').and.returnValue(
      of(mockSimilarity),
    );
    component.technology = { id: 1 } as Technology;
    component.getSimilarity();
    expect(component.similarity).toEqual(mockSimilarity);
    expect(component.similarityName).toEqual(['key1', 'key2']);
    expect(component.similarityId).toEqual(['1', '2']);
  });

  it('should handle click on similarity redirect', () => {
    component.similarityId = ['1', '2'];
    component.handleClickOnSimilarityRedirect(0);
    expect(router.navigate).toHaveBeenCalledWith(['/detail', '1']);
  });

  it('should handle click on connected technology redirect', () => {
    component.handleClickOnConnectedTechnologyRedirect(-7);
    expect(router.navigate).toHaveBeenCalledWith(['/detail', -7]);
  });

  it('should show snackbar after successful deletion', () => {
    component.technology = { id: 1, name: 'Tech1' } as Technology;
    spyOn(technologyService, 'deleteTechnology').and.returnValue(
      of({} as Technology),
    );
    spyOn(snackBar, 'open');
    component.deleteTechnology();
    expect(snackBar.open).toHaveBeenCalledWith(
      `Die Technologie Tech1 wurde erfolgreich gelöscht.`,
    );
  });
});

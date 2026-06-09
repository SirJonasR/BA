import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { EditViewComponent } from './edit-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import {
  Picture,
  Technology,
  TechnologyRequest,
} from 'src/app/models/technology';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditViewComponent', () => {
  let component: EditViewComponent;
  let fixture: ComponentFixture<EditViewComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let technologyServiceSpy: jasmine.SpyObj<TechnologyService>;
  let pictureServiceSpy: jasmine.SpyObj<PictureService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    technologyServiceSpy = jasmine.createSpyObj('TechnologyService', [
      'getTechnology',
      'updateTechnology',
      'getTagSelection',
    ]);
    pictureServiceSpy = jasmine.createSpyObj('PictureService', [
      'getPicture',
      'discardPictureFromCache',
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      declarations: [EditViewComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (): string => '1',
              },
            },
          },
        },
        { provide: TechnologyService, useValue: technologyServiceSpy },
        { provide: PictureService, useValue: pictureServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
      imports: [
        MatSnackBarModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
      ],
    });

    fixture = TestBed.createComponent(EditViewComponent);
    component = fixture.componentInstance;

    const technologyData = {
      id: 1,
      name: 'Beispieltechnologie',
      description: 'Dies ist eine Beispieltechnologie.',
      shortDescription: 'Eine kurze Beschreibung',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 2,
      priority: false,
      tags: ['Beispiel', 'Technologie'],
      projects: [
        {
          id: 0,
          name: 'project0',
          customers: [
            {
              id: 1,
              name: 'customer1',
            },
          ],
          technologyIds: [1],
          technologyNames: ['Beispieltechnologie'],
          description: 'desc',
          contact: [{ email: 'HIM', role: 'owner' }],
          salesServiceLink: '',
          info: '',
          startDate: '',
          endDate: '',
        },
      ],
      status: 1,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };

    technologyServiceSpy.getTechnology.and.returnValue(of(technologyData));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate form values with technology data', fakeAsync(() => {
    const mockResponse: Technology = {
      id: 1,
      name: 'Tech1',
      description: 'Test3',
      shortDescription: 'TEST1',
      pictureId: 2,
      categoryId: 2,
      lifecycleId: 2,
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

    technologyServiceSpy.getTechnology.and.returnValue(of(mockResponse));

    // Mock für die getPicture-Methode
    const mockPictureData: Picture = {
      id: 2, // Übereinstimmend mit der pictureId aus dem Technology-Mock
      data: 'base64_encoded_image_data',
    };
    pictureServiceSpy.getPicture.and.returnValue(of(mockPictureData));

    component.ngOnInit();
    tick();

    expect(component.hasLoaded).toBe(true);
    expect(component.values.pictureData).toEqual(mockPictureData.data);
  }));

  it('should handle form submission error', fakeAsync(() => {
    const mockError = new Error('An error occurred');

    technologyServiceSpy.updateTechnology.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(mockError);
      }),
    );

    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(true);
    expect(technologyServiceSpy.updateTechnology).toHaveBeenCalledWith(
      component.id,
      component.values as TechnologyRequest,
    );
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(snackBarSpy.open).not.toHaveBeenCalled();
  }));

  it('should handle form submission success', fakeAsync(() => {
    const mockResponse: Technology = {
      id: 1,
      name: 'Tech1',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 0,
      lifecycleId: 0,
      tags: [],
      projects: [],
      status: 1,
      jumpDate: '2023-08-20',
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };

    const mockTags = ['tag1', 'tag2'];

    technologyServiceSpy.updateTechnology.and.returnValue(of(mockResponse));
    technologyServiceSpy.getTagSelection.and.returnValue(of(mockTags));
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(false);
    expect(technologyServiceSpy.updateTechnology).toHaveBeenCalledWith(
      component.id,
      component.values as TechnologyRequest,
    );
    expect(technologyServiceSpy.getTagSelection).toHaveBeenCalled();
    expect(technologyServiceSpy.tags).toEqual(mockTags);
    expect(routerSpy.navigate).toHaveBeenCalledWith([
      `/detail/${mockResponse.id}`,
    ]);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      `Die Technologie ${mockResponse.name} wurde erfolgreich aktualisiert.`,
    );
  }));

  it('should load picture data by ID', fakeAsync(() => {
    const mockPictureData: Picture = {
      id: 1,
      data: 'base64_encoded_image_data',
    };
    pictureServiceSpy.getPicture.and.returnValue(of(mockPictureData));

    component.getPictureDataById(1);

    tick();

    expect(component.hasLoaded).toBe(true);
    expect(component.values.pictureData).toEqual(mockPictureData.data);
  }));

  it('should test if changes works correctly', () => {
    component.isSubmitting = true;
    expect(component.changes()).toBe(false);
    component.isSubmitting = false;
    expect(component.changes()).toBe(true);
    component.oldValues = {
      name: 'test',
      description: 'test',
      shortDescription: '',
      categoryId: -1,
      lifecycleId: -1,
      isNewPic: false,
      priority: false,
      tags: [],
      connectedTechnologyIds: [],
      certificates: [],
      projectIds: [],
      pictureData: null,
    };
    expect(component.changes()).toBe(true);
  });
});

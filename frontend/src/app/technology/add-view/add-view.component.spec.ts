import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddViewComponent } from './add-view.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TechnologyService } from 'src/app/services/technology.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { Technology, TechnologyRequest } from 'src/app/models/technology';
import { PictureService } from 'src/app/services/picture.service';
import { FormValues } from '../edit-form/edit-form.component';
import { Router } from '@angular/router';

describe('AddViewComponent', () => {
  let component: AddViewComponent;
  let fixture: ComponentFixture<AddViewComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockPictureService: jasmine.SpyObj<PictureService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'createTechnology',
      'getTagSelection',
    ]);
    mockPictureService = jasmine.createSpyObj('PictureService', [
      'discardPictureFromCache',
    ]);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      declarations: [AddViewComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: PictureService, useValue: mockPictureService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddViewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });
  it('should handle form submission successfully', fakeAsync(() => {
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

    const mockRequest: TechnologyRequest = {
      name: 'Tech1',
      description: '',
      shortDescription: '',
      pictureData: null,
      isNewPic: false,
      categoryId: 0,
      lifecycleId: 0,
      tags: [],
      projectIds: [],
      priority: false,
      connectedTechnologyIds: [],
      certificates: [],
    };

    component.values = mockRequest as FormValues;

    mockTechnologyService.createTechnology.and.returnValue(of(mockResponse));
    mockTechnologyService.getTagSelection.and.returnValue(of(mockTags));
    mockTechnologyService.tags = mockTags;
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(
      Promise.resolve(true),
    );

    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(false);
    expect(mockTechnologyService.createTechnology).toHaveBeenCalledWith(
      mockRequest,
    );
    expect(mockTechnologyService.getTagSelection).toHaveBeenCalled();
    expect(mockTechnologyService.tags).toEqual(mockTags);
    expect(navigateSpy).toHaveBeenCalledWith([`/detail/${mockResponse.id}`]);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Die Technologie ${mockResponse.name} wurde erfolgreich erstellt.`,
    );
  }));

  it('should handle form submission error', fakeAsync(() => {
    const mockError = new Error('An error occurred');

    mockTechnologyService.createTechnology.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(mockError);
      }),
    );

    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(true);
  }));

  it('should test if changes() works correctly', () => {
    component.isSubmitting = true;
    expect(component.changes()).toBe(false);
    component.isSubmitting = false;
    expect(component.changes()).toBe(false);
    component.values = {
      name: 'test',
      description: 'test',
      shortDescription: '',
      categoryId: -1,
      lifecycleId: -1,
      isNewPic: false,
      priority: false,
    } as FormValues;
    expect(component.changes()).toBe(true);
  });
});

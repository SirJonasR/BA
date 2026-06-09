import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TechnologyTileComponent } from './technology-tile.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Technology } from 'src/app/models/technology';

describe('TechnologyTileComponent', () => {
  let component: TechnologyTileComponent;
  let fixture: ComponentFixture<TechnologyTileComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockPictureService: jasmine.SpyObj<PictureService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockTechnology: Technology = {
    id: 1,
    name: 'Mock Tech',
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

  const mockPictureUrl = 'picture-url';

  beforeEach(() => {
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnology',
    ]);
    mockPictureService = jasmine.createSpyObj('PictureService', [
      'loadPicture',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [TechnologyTileComponent],
      providers: [
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: PictureService, useValue: mockPictureService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    fixture = TestBed.createComponent(TechnologyTileComponent);
    component = fixture.componentInstance;
    component.id = 1; // Set a sample id
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch technology data on init', () => {
    mockTechnologyService.getTechnology.and.returnValue(of(mockTechnology));
    component.ngOnInit();
    expect(mockTechnologyService.getTechnology).toHaveBeenCalledWith(1);
  });
  /**
  it('should fetch picture data if available', () => {
    component.technology = mockTechnology;
    component.technology.pictureId = 1; // Setting a sample pictureId
    mockPictureService.loadPicture.and.returnValue(of(mockPictureUrl));
    mockTechnologyService.getTechnology.and.returnValue(
      of(component.technology),
    );

    component.getTechnology();

    expect(mockPictureService.loadPicture).toHaveBeenCalledWith(1);
  });
  */
  /*
  it('should handle picture error gracefully', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404,
      statusText: 'Not Found',
    });

    mockPictureService.loadPicture.and.returnValue(
      throwError(() => errorResponse),
    );
    spyOn(window, 'alert');
    component.technology = mockTechnology;
    component.technology.pictureId = 1; // Setting a sample pictureId
    component.getPicture();
    expect(window.alert).toHaveBeenCalledWith(
      'Etwas lief schief beim Bild laden: ' + errorResponse.message,
    );
  });


  */

  it('should set pictureUrl to default when technology has no pictureId', () => {
    // Set technology with no pictureId
    component.technology = { ...mockTechnology, pictureId: null };

    component.getPicture();

    // Expect pictureUrl to be the default logo path
    expect(component.pictureUrl).toEqual('assets/defaultLogo.jpg');
  });

  it('should load and set pictureUrl when technology has a pictureId', () => {
    // Set technology with a pictureId
    component.technology = { ...mockTechnology, pictureId: 123 };

    // Mock the pictureService.loadPicture method to return a picture URL
    mockPictureService.loadPicture.and.returnValue(of(mockPictureUrl));

    component.getPicture();

    // Expect pictureService.loadPicture to have been called with the correct pictureId
    expect(mockPictureService.loadPicture).toHaveBeenCalledWith(123);
    // Expect pictureUrl to be set to the mockPictureUrl
    // expect(component.pictureUrl).toEqual(mockPictureUrl);
  });

  it('should handle error when loading picture fails', () => {
    // Set technology with a pictureId
    component.technology = { ...mockTechnology, pictureId: 123 };

    // Mock the pictureService.loadPicture method to return an error
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });
    mockPictureService.loadPicture.and.returnValue(throwError(errorResponse));

    spyOn(window, 'alert'); // Mock the alert method

    component.getPicture();

    // Expect pictureService.loadPicture to have been called with the correct pictureId
    expect(mockPictureService.loadPicture).toHaveBeenCalledWith(123);
    // Expect an alert to be shown with the error message from the errorResponse
    expect(window.alert).toHaveBeenCalledWith(
      'Etwas lief schief beim Bild laden: Http failure response for (unknown url): 500 Internal Server Error',
    );
  });

  it('should navigate correctly', () => {
    component.navigate();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/detail/1']);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadarContainerComponent } from './radar-container.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { RadarDataService } from './components/radar-visualization/services/radar-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserHandlingService } from 'src/app/services/user-handling.service';

describe('RadarContainerComponent', () => {
  let component: RadarContainerComponent;
  let fixture: ComponentFixture<RadarContainerComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;

  beforeEach(() => {
    // Create mock TechnologyService with all necessary methods
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnologies',
      'getCategories',
      'getLifecycles',
      'getTagSelection',
      'getAllCustomers',
      'getAllProjects',
    ]);
    mockTechnologyService.getTechnologies.and.returnValue(of([]));
    mockTechnologyService.getCategories.and.returnValue(of([]));
    mockTechnologyService.getLifecycles.and.returnValue(of([]));
    mockTechnologyService.getTagSelection.and.returnValue(of([]));
    mockTechnologyService.getAllCustomers.and.returnValue(of([]));
    mockTechnologyService.getAllProjects.and.returnValue(of([]));

    // Create mock UserHandlingService
    mockUserHandlingService = jasmine.createSpyObj('UserHandlingService', [
      'getShowIconsInColor',
      'getShowIcons',
    ]);
    mockUserHandlingService.getShowIconsInColor.and.returnValue(
      Promise.resolve(false),
    );
    mockUserHandlingService.getShowIcons.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      declarations: [RadarContainerComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: UserHandlingService, useValue: mockUserHandlingService },
        RadarDataService,
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignore child component errors
    });
    fixture = TestBed.createComponent(RadarContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

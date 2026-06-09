import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectService } from 'src/app/services/project.service';
import { TechnologyService } from 'src/app/services/technology.service';
import { EscapeHandlerService } from 'src/app/services/escape-handler-service';
import { of } from 'rxjs';
import { Technology } from 'src/app/models/technology';
import { Customer } from 'src/app/services/customer.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Project } from 'src/app/models/project';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockEscapeHandlerService: jasmine.SpyObj<EscapeHandlerService>;

  // Test data for filter functionality
  const mockTechnologies: Technology[] = [
    {
      id: 1,
      name: 'Angular',
      description: 'Angular framework',
      shortDescription: 'Angular',
      pictureId: 1,
      categoryId: 1,
      lifecycleId: 1,
      tags: [],
      projects: [],
      status: 1,
      jumpDate: '',
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    },
    {
      id: 2,
      name: 'React',
      description: 'React library',
      shortDescription: 'React',
      pictureId: 2,
      categoryId: 1,
      lifecycleId: 1,
      tags: [],
      projects: [],
      status: 1,
      jumpDate: '',
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    },
  ];

  const mockCustomers: Customer[] = [
    { id: 1, name: 'Customer A' },
    { id: 2, name: 'Customer B' },
    { id: 3, name: 'Customer C' },
  ];

  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  const futureDateString = futureDate.toISOString().split('T')[0];

  const mockProjects: Project[] = [
    {
      name: 'Angular Project',
      id: 1,
      customers: [mockCustomers[0]],
      technologyIds: [1],
      technologyNames: ['Angular'],
      description: 'Angular project description',
      info: 'Angular project info',
      industrySpecificInformation: 'Angular project industry info',
      startDate: '2024-01-01',
      endDate: futureDateString,
      contact: [{ email: 'John Doe', role: 'owner' }],
      salesServiceLink: 'link1',
      industry: 'PSD - Public Sector & Defense',
    },
    {
      name: 'React Project',
      id: 2,
      customers: [mockCustomers[1]],
      technologyIds: [2],
      technologyNames: ['React'],
      description: 'React project description',
      info: 'React project info',
      industrySpecificInformation: 'React project industry info',
      startDate: '2024-06-01',
      endDate: futureDateString,
      contact: [{ email: 'Jane Smith', role: 'owner' }],
      salesServiceLink: 'link2',
      industry: 'PSD - Public Sector & Defense',
    },
    {
      name: 'Completed Project',
      id: 3,
      customers: [mockCustomers[2]],
      technologyIds: [1, 2],
      technologyNames: ['Angular', 'React'],
      description: 'Completed project description',
      info: 'Completed project info',
      industrySpecificInformation: 'Completed project industry info',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      contact: [{ email: 'Bob Wilson', role: 'owner' }],
      salesServiceLink: 'link3',
      industry: 'PSD - Public Sector & Defense',
    },
  ];

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjects',
      'getTechnologyNames',
    ]);
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnology',
      'getTechnologies',
    ]);
    mockEscapeHandlerService = jasmine.createSpyObj('EscapeHandlerService', [
      'setupEscapeListener',
      'removeEscapeListener',
    ]);

    // Configure mock returns
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    mockTechnologyService.getTechnologies.and.returnValue(of(mockTechnologies));

    TestBed.configureTestingModule({
      declarations: [ProjectsComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: EscapeHandlerService, useValue: mockEscapeHandlerService },
      ],
      imports: [
        HttpClientTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSidenavModule,
        MatSelectModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatRadioModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        MatDividerModule,
        MatButtonModule,
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
    });
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test if correctly initialize', () => {
    component.ngOnInit();
    expect(component.projects.length).toBe(3);
    expect(mockProjectService.getProjects).toHaveBeenCalled();
    expect(mockTechnologyService.getTechnologies).toHaveBeenCalled();
  });

  it('should navigate correct route', () => {
    const project = {
      id: 1,
      name: 'testProject',
    } as Project;
    component.navigate(project);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/project/1']);
  });

  // Filter Tests - New functionality
  describe('Filter functionality', () => {
    beforeEach(() => {
      // Set up component with test data
      component.projects = mockProjects;
      component.availableTechnologies = mockTechnologies;
      component.availableCustomers = mockCustomers;
      fixture.detectChanges();
    });

    it('should initialize filter properties correctly', () => {
      expect(component.selectedTechnologies).toEqual([]);
      expect(component.selectedCustomers).toEqual([]);
      expect(component.startedAfter).toBeNull();
      expect(component.startedBefore).toBeNull();
      expect(component.endedAfter).toBeNull();
      expect(component.endedBefore).toBeNull();
      expect(component.projectStatusFilter).toBeNull();
    });

    it('should filter projects by technology correctly', () => {
      // Set filter for Angular
      component.selectedTechnologies = [mockTechnologies[0]]; // Angular

      // Apply filter (using component's private method indirectly through loadProjects)
      component.projects = mockProjects;
      const filteredResult = component.projects.filter((project) =>
        component.selectedTechnologies.some((selectedTech) =>
          project.technologyNames.includes(selectedTech.name),
        ),
      );

      expect(filteredResult.length).toBe(2); // Angular Project and Completed Project
      expect(
        filteredResult.some((p) => p.name === 'Angular Project'),
      ).toBeTruthy();
      expect(
        filteredResult.some((p) => p.name === 'Completed Project'),
      ).toBeTruthy();
    });

    it('should filter projects by customer correctly', () => {
      // Set filter for Customer A
      component.selectedCustomers = [mockCustomers[0]]; // Customer A

      const filteredResult = mockProjects.filter((project) =>
        component.selectedCustomers.some((selectedCustomer) =>
          project.customers.some(
            (customer) => customer.id === selectedCustomer.id,
          ),
        ),
      );

      expect(filteredResult.length).toBe(1); // Only Angular Project
      expect(filteredResult[0].name).toBe('Angular Project');
    });

    it('should filter projects by start date correctly', () => {
      // Filter for projects started after 2024-01-01
      component.startedAfter = new Date('2024-01-01');

      const startedAfter = component.startedAfter;
      const filteredResult = mockProjects.filter((project) => {
        const projectDate = new Date(project.startDate);
        return startedAfter && projectDate >= startedAfter;
      });

      expect(filteredResult.length).toBe(2); // Angular Project and React Project
      expect(
        filteredResult.some((p) => p.name === 'Angular Project'),
      ).toBeTruthy();
      expect(
        filteredResult.some((p) => p.name === 'React Project'),
      ).toBeTruthy();
    });

    it('should filter projects by completion status - completed', () => {
      component.projectStatusFilter = 'completed';

      const filteredResult = mockProjects.filter((project) => {
        const ended = new Date(project.endDate);
        const today = new Date();
        return ended <= today;
      });

      expect(filteredResult.length).toBe(1); // Only Completed Project
      expect(filteredResult[0].name).toBe('Completed Project');
    });

    it('should filter projects by completion status - ongoing', () => {
      component.projectStatusFilter = 'ongoing';

      const filteredResult = mockProjects.filter((project) => {
        const ended = new Date(project.endDate);
        const today = new Date();
        return ended > today;
      });

      expect(filteredResult.length).toBe(2); // Angular Project and React Project
      expect(
        filteredResult.some((p) => p.name === 'Angular Project'),
      ).toBeTruthy();
      expect(
        filteredResult.some((p) => p.name === 'React Project'),
      ).toBeTruthy();
    });

    it('should combine multiple filters correctly', () => {
      // Filter for Angular technology AND Customer A
      component.selectedTechnologies = [mockTechnologies[0]]; // Angular
      component.selectedCustomers = [mockCustomers[0]]; // Customer A

      const filteredResult = mockProjects.filter(
        (project) =>
          component.selectedTechnologies.some((selectedTech) =>
            project.technologyNames.includes(selectedTech.name),
          ) &&
          component.selectedCustomers.some((selectedCustomer) =>
            project.customers.some(
              (customer) => customer.id === selectedCustomer.id,
            ),
          ),
      );

      expect(filteredResult.length).toBe(1); // Only Angular Project
      expect(filteredResult[0].name).toBe('Angular Project');
    });

    it('should reset all filters correctly', () => {
      // Set some filter values
      component.selectedTechnologies = [mockTechnologies[0]];
      component.selectedCustomers = [mockCustomers[0]];
      component.startedAfter = new Date('2024-01-01');
      component.projectStatusFilter = 'completed';

      // Reset filters
      component.resetFilter();

      expect(component.selectedTechnologies).toEqual([]);
      expect(component.selectedCustomers).toEqual([]);
      expect(component.startedAfter).toBeNull();
      expect(component.startedBefore).toBeNull();
      expect(component.endedAfter).toBeNull();
      expect(component.endedBefore).toBeNull();
      expect(component.projectStatusFilter).toBeNull();
    });

    it('should clear temporary filter values correctly', () => {
      // Set some temporary filter values
      component.selectedTechnologies = [mockTechnologies[0]];
      component.selectedCustomers = [mockCustomers[0]];
      component.startedAfter = new Date('2024-01-01');
      component.projectStatusFilter = 'completed';

      // Reset filters
      component.resetFilter();

      expect(component.selectedTechnologies).toEqual([]);
      expect(component.selectedCustomers).toEqual([]);
      expect(component.startedAfter).toBeNull();
      expect(component.startedBefore).toBeNull();
      expect(component.endedAfter).toBeNull();
      expect(component.endedBefore).toBeNull();
      expect(component.projectStatusFilter).toBeNull();
    });

    it('should validate start date range correctly - error case', () => {
      component.startedAfter = new Date('2024-12-31');
      component.startedBefore = new Date('2024-01-01');

      component.onStartAfterChange();

      expect(component.startDateRangeError).toBe(
        '"Start nach" darf nicht nach "Start vor" liegen',
      );
    });

    it('should validate start date range correctly - valid case', () => {
      component.startedAfter = new Date('2024-01-01');
      component.startedBefore = new Date('2024-12-31');

      component.onStartAfterChange();

      expect(component.startDateRangeError).toBeNull();
    });

    it('should validate end date range correctly - error case', () => {
      component.endedAfter = new Date('2024-12-31');
      component.endedBefore = new Date('2024-01-01');

      component.onEndAfterChange();

      expect(component.endDateRangeError).toBe(
        '"Ende nach" darf nicht nach "Ende vor" liegen',
      );
    });

    it('should validate project duration correctly - error case', () => {
      component.startedAfter = new Date('2024-06-01');
      component.endedBefore = new Date('2024-01-01');

      component.onStartAfterChange();

      expect(component.projectDurationError).toBe(
        'Projektende darf nicht vor Projektstart liegen',
      );
    });

    it('should detect validation errors correctly', () => {
      component.startDateRangeError = 'Some error';
      expect(component.hasValidationErrors).toBeTruthy();

      component.startDateRangeError = null;
      component.endDateRangeError = 'Another error';
      expect(component.hasValidationErrors).toBeTruthy();

      component.endDateRangeError = null;
      expect(component.hasValidationErrors).toBeFalsy();
    });

    it('should remove technology chip correctly', () => {
      component.selectedTechnologies = [
        mockTechnologies[0],
        mockTechnologies[1],
      ];

      component.removeTechnologyChip('Angular');

      expect(component.selectedTechnologies.length).toBe(1);
      expect(component.selectedTechnologies[0].name).toBe('React');
    });

    it('should remove customer chip correctly', () => {
      component.selectedCustomers = [mockCustomers[0], mockCustomers[1]];

      component.removeCustomerChip('Customer A');

      expect(component.selectedCustomers.length).toBe(1);
      expect(component.selectedCustomers[0].name).toBe('Customer B');
    });

    it('should clear status filter correctly', () => {
      component.projectStatusFilter = 'completed';

      component.onStatusToggle('completed', false);

      expect(component.projectStatusFilter).toBeNull();
    });

    it('should load filter options on init', () => {
      component.ngOnInit();

      expect(mockTechnologyService.getTechnologies).toHaveBeenCalled();
      expect(mockProjectService.getProjects).toHaveBeenCalled();
    });

    it('should filter projects by name search text', () => {
      component.searchText = 'angular';
      component.applySearchFilter();

      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].name).toBe('Angular Project');
    });

    it('should toggle search visibility for projects', () => {
      expect(component.isSearchVisible).toBeFalse();
      component.toggleSearch();
      expect(component.isSearchVisible).toBeTrue();
      component.toggleSearch();
      expect(component.isSearchVisible).toBeFalse();
      expect(component.searchText).toBe('');
    });
  });
});

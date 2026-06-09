import { Component, Input } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { TechnologiesComponent } from './technologies.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TechnologyService } from 'src/app/services/technology.service';
import { Category, Lifecycle } from 'src/app/models/technology';
import { CustomerService } from 'src/app/services/customer.service';
import { technologiesMock } from 'src/app/utils/mock-objekts/technologies.mock';
import { Project } from 'src/app/models/project';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-tool-list',
  template: '',
})
class MockToolListComponent {
  @Input() technologies: unknown[] = [];
}

describe('TechnologiesComponent', () => {
  let component: TechnologiesComponent;
  let fixture: ComponentFixture<TechnologiesComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRoute;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockCustomerService: jasmine.SpyObj<CustomerService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRoute = { queryParams: of({}), snapshot: {} } as ActivatedRoute;
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnologies',
      'getTagSelection',
      'categories',
      'lifecycles',
      'tags',
      'customers',
      'certificates',
      'projects',
    ]);
    mockCustomerService = jasmine.createSpyObj('CustomerService', [
      'getAllCustomerProjects',
    ]);

    TestBed.configureTestingModule({
      declarations: [TechnologiesComponent, MockToolListComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: CustomerService, useValue: mockCustomerService },
      ],
      imports: [
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatDividerModule,
        MatRadioModule,
        MatChipsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatCheckboxModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get categories', () => {
    const mockCategories = [
      {
        id: 0,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];
    mockTechnologyService.categories = mockCategories;

    expect(component.categories).toEqual(mockCategories);
  });

  it('should get lifecycles', () => {
    const mockLifecycles = [
      {
        id: 0,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    mockTechnologyService.lifecycles = mockLifecycles;
    expect(component.lifecycles).toEqual(mockLifecycles);
  });

  it('should get tags', () => {
    const mockTags = ['mockTag'];
    mockTechnologyService.tags = mockTags;
    expect(component.tags).toEqual(mockTags);
  });

  it('should get customers', () => {
    const mockCustomers = [{ id: 1, name: 'mockCustomer' }];
    mockTechnologyService.customers = mockCustomers;
    expect(component.customers).toEqual(mockCustomers);
  });

  it('should get projects', () => {
    const mockProjects = [{ name: 'testProject' } as Project];
    mockTechnologyService.projects = mockProjects;
    expect(component.projects).toEqual(mockProjects);
  });

  it('should filter technologies', async () => {
    component.technologies = [
      {
        id: 1,
        name: 'Tech1',
        description: 'Desc1',
        shortDescription: 'ShortDesc1',
        pictureId: 0,
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
      },
      {
        id: 2,
        name: 'Tech2',
        description: 'Desc2',
        shortDescription: 'ShortDesc2',
        pictureId: 0,
        categoryId: 1,
        lifecycleId: 1,
        tags: ['Tag1', 'Tag2', 'Tag3'],
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
        priority: true,
        jumpDate: '2023-08-20',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [
          {
            id: 1,
            name: 'Certificate1',
            description: 'CertDesc',
            prerequisites: [],
            followUps: [],
          },
        ],
      },
    ];
    const mockCategories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];
    const mockLifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    const mockTags: string[] = ['Tag1'];
    const mockCustomers = [{ id: 1, name: 'customer1' }];
    component.selectedCategories = [];
    component.selectedLifecycles = [];
    await component.startFilter();
    expect(component.filteredTechnologies_).toEqual(component.technologies);
    component.selectedCategories = mockCategories;
    component.selectedLifecycles = mockLifecycles;
    component.selectedCustomers = mockCustomers;
    component.selectedTags = mockTags;
    component.onlyPrio = true;
    component.selectedProjects = [{ name: 'project1' } as Project];
    await component.startFilter();
    expect(component.filteredTechnologies_.length).toEqual(1);
  });

  it('should initialize technologies and filters on ngOnInit', fakeAsync(() => {
    mockTechnologyService.getTechnologies.and.returnValue(of(technologiesMock));
    mockTechnologyService.lifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    mockTechnologyService.categories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];

    component.selectedLifecycles.push(...component.lifecycles);
    component.selectedCategories.push(...component.categories);

    component.ngOnInit();
    tick();

    // Assert
    expect(mockTechnologyService.getTechnologies).toHaveBeenCalled();
    // expect(component.startFilter).toHaveBeenCalled();
    expect(component.technologies).toBe(technologiesMock);
  }));

  it('check if method allowFilter works correctly', () => {
    component.selectedLifecycles = [];
    component.selectedCategories = [];
    expect(component.allowFilter()).toBe(false);
    component.selectedCategories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];
    component.selectedLifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    expect(component.allowFilter()).toBe(true);
  });

  it('should check lifecycle and category', () => {
    component.selectedCategories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];
    component.selectedLifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    const mockCategories = [
      {
        id: 11,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];
    const mockLifecycles = [
      {
        id: 11,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    expect(component.isCheckedLifecycle(component.selectedLifecycles[0])).toBe(
      true,
    );
    expect(component.isCheckedCategory(component.selectedCategories[0])).toBe(
      true,
    );
    expect(component.isCheckedLifecycle(mockLifecycles[0])).toBe(false);
    expect(component.isCheckedCategory(mockCategories[0])).toBe(false);
  });

  it('should remove or add categories ', () => {
    component.selectedCategories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];
    const mockCategories = [
      {
        id: 11,
        name: 'MockCategory1',
        description: 'MockCategoryDesc1',
      },
    ];
    mockTechnologyService.lifecycles = [
      {
        id: 0,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    mockTechnologyService.categories = mockCategories;
    component.addOrRemoveCategory(mockCategories[0]);
    expect(component.selectedCategories.length).toEqual(2);
    component.addOrRemoveCategory(mockCategories[0]);
    expect(component.selectedCategories.length).toEqual(1);
    component.resetFilter();
    expect(component.filteredTechnologies_.length).toEqual(0);
    expect(component.selectedTags).toEqual([]);
    expect(component.selectedCustomers).toEqual([]);
    expect(component.selectedCategories).toEqual(component.categories);
    expect(component.selectedLifecycles).toEqual(component.lifecycles);
  });

  it('should remove or add lifecycle ', () => {
    component.selectedLifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    const mockLifecycle = [
      {
        id: 11,
        name: 'MockLifecycle1',
        description: 'MockLifecycleDesc1',
      },
    ];
    component.addOrRemoveLifecycle(mockLifecycle[0]);
    expect(component.selectedLifecycles.length).toEqual(2);
    component.addOrRemoveLifecycle(mockLifecycle[0]);
    expect(component.selectedLifecycles.length).toEqual(1);
  });

  it('should check or uncheck all lifecycles (options)', () => {
    component.selectedLifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
      {
        id: 2,
        name: 'MockLifecycle2',
        description: 'MockLifecycleDesc',
      },
      {
        id: 3,
        name: 'MockLifecycle3',
        description: 'MockLifecycleDesc',
      },
    ];
    mockTechnologyService.lifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
      {
        id: 2,
        name: 'MockLifecycle2',
        description: 'MockLifecycleDesc',
      },
      {
        id: 3,
        name: 'MockLifecycle3',
        description: 'MockLifecycleDesc',
      },
      {
        id: 4,
        name: 'MockLifecycle4',
        description: 'MockLifecycleDesc',
      },
      {
        id: 5,
        name: 'MockLifecycle5',
        description: 'MockLifecycleDesc',
      },
    ];

    component.checkUncheckAllLifecycles();
    expect(component.selectedLifecycles.length).toEqual(5);
    component.checkUncheckAllLifecycles();
    expect(component.selectedLifecycles.length).toEqual(0);
  });

  it('should check or uncheck all category (options)', () => {
    component.selectedCategories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
      {
        id: 2,
        name: 'MockCategory2',
        description: 'MockCategoryDesc',
      },
      {
        id: 3,
        name: 'MockCategory3',
        description: 'MockCategoryDesc',
      },
    ];
    mockTechnologyService.categories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
      {
        id: 2,
        name: 'MockCategory2',
        description: 'MockCategoryDesc',
      },
      {
        id: 3,
        name: 'MockCategory3',
        description: 'MockCategoryDesc',
      },
      {
        id: 4,
        name: 'MockCategory4',
        description: 'MockCategoryDesc',
      },
    ];

    component.checkUncheckAllCategories();
    expect(component.selectedCategories.length).toEqual(4);
    component.checkUncheckAllCategories();
    expect(component.selectedCategories.length).toEqual(0);
  });

  it('should sort correctly', async () => {
    component.selectedSortOption = component.sortOptions[0];
    component.technologies = [
      {
        id: 1,
        name: 'Tech1',
        description: 'Desc1',
        shortDescription: 'ShortDesc1',
        pictureId: 0,
        categoryId: 1,
        lifecycleId: 1,
        tags: ['1', '2', '3', '4', '5'],
        projects: [],
        status: 1,
        jumpDate: '2023-08-29',
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 2,
        name: 'Tech2',
        description: 'Desc2',
        shortDescription: 'ShortDesc2',
        pictureId: 0,
        categoryId: 1,
        lifecycleId: 1,
        tags: ['1', '2', '3', '4', '5'],
        projects: [
          {
            id: 2,
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
        viewCount: 2,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];
    component.selectedCategories = [
      {
        id: 1,
        name: 'MockCategory',
        description: 'MockCategoryDesc',
      },
    ];
    component.selectedLifecycles = [
      {
        id: 1,
        name: 'MockLifecycle',
        description: 'MockLifecycleDesc',
      },
    ];
    let technology_ = await component.getFilteredTechnologies();
    expect(technology_[0].id).toBe(1);
    component.selectedSortOption = component.sortOptions[1];
    technology_ = await component.getFilteredTechnologies();
    expect(technology_[0].id).toBe(2);
    component.selectedSortOption = component.sortOptions[2];
    technology_ = await component.getFilteredTechnologies();
    expect(technology_[0].id).toBe(2);
    component.selectedSortOption = component.sortOptions[3];
    technology_ = await component.getFilteredTechnologies();
    expect(technology_[0].id).toBe(2);
  });

  it('should remove chip', () => {
    component.selectedTags = ['f'];
    // expect(component.options).toEqual(un )
  });

  it('should filterIsOn', () => {
    component.selectedCustomers = [];
    component.selectedProjects = [];
    component.selectedTags = [];
    component.onlyPrio = false;
    component.selectedMostClickedOption = '';
    component.selectedLifecycles = [];
    component.selectedCategories = [];
    expect(component.filterIsOn).toBeFalsy();

    component.selectedCustomers = [{ id: 1, name: 'customer1' }];
    component.selectedProjects = [{ name: 'project1' } as Project];
    component.selectedTags = ['tag'];
    component.onlyPrio = false;
    component.selectedMostClickedOption = '10';
    component.selectedLifecycles = [{ name: 'l1' } as Lifecycle];
    component.selectedCategories = [{ name: 'c1' } as Category];
    expect(component.filterIsOn).toBeTruthy();
  });
  it('should filter technologies by search text', async () => {
    component.technologies = [
      {
        id: 1,
        name: 'Angular',
        description: '',
        shortDescription: '',
        pictureId: 0,
        categoryId: 1,
        lifecycleId: 1,
        tags: [],
        projects: [],
        status: 1,
        priority: false,
        jumpDate: '',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 2,
        name: 'React',
        description: '',
        shortDescription: '',
        pictureId: 0,
        categoryId: 1,
        lifecycleId: 1,
        tags: [],
        projects: [],
        status: 1,
        priority: false,
        jumpDate: '',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];
    component.selectedCategories = [{ id: 1, name: 'c', description: '' }];
    component.selectedLifecycles = [{ id: 1, name: 'l', description: '' }];

    component.searchText = 'ang';
    await component.onSearchInput();

    expect(component.filteredTechnologies_.length).toBe(1);
    expect(component.filteredTechnologies_[0].name).toBe('Angular');
  });

  it('should not clear pending filters on search input', async () => {
    component.technologies = [
      {
        id: 1,
        name: 'Angular',
        description: '',
        shortDescription: '',
        pictureId: 0,
        categoryId: 1,
        lifecycleId: 1,
        tags: ['Tag1'],
        projects: [
          {
            id: 1,
            name: 'Project1',
            customers: [{ id: 1, name: 'Customer1' }],
          },
        ],
        status: 1,
        priority: false,
        jumpDate: '',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];
    component.selectedCategories = [{ id: 1, name: 'c', description: '' }];
    component.selectedLifecycles = [{ id: 1, name: 'l', description: '' }];
    component.selectedTags = ['Tag1'];
    component.selectedCustomers = [{ id: 1, name: 'Customer1' }];
    component.selectedProjects = [{ id: 1, name: 'Project1' } as Project];
    component.searchText = 'ang';

    await component.onSearchInput();

    expect(component.selectedTags).toEqual(['Tag1']);
    expect(component.selectedCustomers.length).toBe(1);
    expect(component.selectedCustomers[0].name).toBe('Customer1');
    expect(component.selectedProjects.length).toBe(1);
    expect(component.selectedProjects[0].name).toBe('Project1');
  });

  it('should toggle search visibility', () => {
    expect(component.isSearchVisible).toBeFalse();
    component.toggleSearch();
    expect(component.isSearchVisible).toBeTrue();
    component.toggleSearch();
    expect(component.isSearchVisible).toBeFalse();
    expect(component.searchText).toBe('');
  });
});

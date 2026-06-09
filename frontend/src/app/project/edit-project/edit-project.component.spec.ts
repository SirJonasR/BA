import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { EditProjectComponent } from './edit-project.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TechnologyService } from 'src/app/services/technology.service';
import { MatSelectModule } from '@angular/material/select';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  convertToParamMap,
  Router,
} from '@angular/router';
import { of } from 'rxjs';
import { RemoveDialogComponent } from 'src/app/utils/remove-dialog/remove-dialog.component';
import { ProjectService } from 'src/app/services/project.service';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { Project } from 'src/app/models/project';
import { Industry, Technology } from 'src/app/models/technology';
import { Customer } from 'src/app/models/customer';

describe('EditProjectComponent', () => {
  let component: EditProjectComponent;
  let fixture: ComponentFixture<EditProjectComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: { snapshot: Partial<ActivatedRouteSnapshot> };
  const projectIdInRoute = 583;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: MatDialog;

  beforeEach(() => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProject',
      'deleteProject',
      'updateProject',
      'getIndustries',
    ]);
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnology',
      'capitalizedWord',
    ]);
    mockUserHandlingService = jasmine.createSpyObj(
      'UserHandlingService',
      ['hasRole'],
      {
        user: {
          userName: '',
          showIconsInColor: false,
          showIcons: false,
          roles: [UserRole.ADMIN],
        },
      },
    );
    mockUserHandlingService.hasRole.and.returnValue(true);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: projectIdInRoute.toString() }),
      },
    };
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      declarations: [EditProjectComponent],
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatAutocompleteModule,
        MatInputModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: UserHandlingService, useValue: mockUserHandlingService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    fixture = TestBed.createComponent(EditProjectComponent);
    dialog = TestBed.inject(MatDialog);
    component = fixture.componentInstance;
    const mockProjects: Project[] = [
      {
        id: 1,
        name: 'Project1',
        customers: [],
        technologyIds: [],
        technologyNames: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
      },
      {
        id: 2,
        name: 'Project2',
        customers: [],
        technologyIds: [],
        technologyNames: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
      },
    ];
    mockProjectService.getProject.and.returnValue(of(mockProjects[0]));
    const mockIndustries: Industry[] = [
      { name: 'testIndustry1', id: 12 },
      { name: 'testIndustry2', id: 20 },
    ];
    mockProjectService.getIndustries.and.returnValue(of(mockIndustries));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch correct project on init', fakeAsync(() => {
      expect(mockProjectService.getProject).toHaveBeenCalledOnceWith(
        projectIdInRoute,
      );
    }));
  });

  describe('deleteProject', () => {
    it('should open delete dialog with correct data when handleDeleteButtonClick is called', () => {
      component.selectedProject = {
        id: 1,
        name: 'Project1',
        customers: [],
        technologyIds: [],
        technologyNames: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
      };
      const spy = spyOn(dialog, 'open').and.callThrough();
      component.openDeleteDialog();
      expect(spy).toHaveBeenCalledOnceWith(
        RemoveDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            resourceType: 'Projekt',
            resourceName: component.selectedProject.name,
            onDelete: jasmine.any(Function),
          }),
        }),
      );
    });

    it('should delete the selected project and navigate to home', () => {
      component.selectedProject = {
        id: 1,
        name: 'Project1',
        customers: [],
        technologyIds: [],
        technologyNames: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
      };

      mockProjectService.deleteProject.and.returnValue(of(void 0));

      component.deleteProject();

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Das Projekt Project1 wurde erfolgreich gelöscht.',
      );
    });
  });

  describe('onSubmit', () => {
    it('should update the project with new values', () => {
      const mockProject: Project = {
        id: 1,
        name: 'Project1',
        customers: [],
        technologyIds: [1],
        technologyNames: ['Tech1'],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
      };
      const mockCustomer: Customer = { id: -1, name: 'Customer1' };
      const mockTechnology: Technology = {
        id: 1,
        name: 'Tech1',
        projects: [],
        categoryId: 1,
        lifecycleId: 1,
        description: '',
        pictureId: null,
        shortDescription: '',
        priority: false,
        tags: [],
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
        viewCount: 1,
        status: 1,
        jumpDate: '',
      };

      component.selectedProject = mockProject;
      component.values = {
        customerNames: ['customer1'],
        projectName: 'UpdatedProject',
        selectedTechnologies: [mockTechnology],
        newTechnologies: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        startDate: '',
        endDate: '',
        industrySpecificInformation: '',
      };

      mockTechnologyService.capitalizedWord.and.returnValue('Customer1');
      mockProjectService.updateProject.and.returnValue(of(mockProject));

      component.onSubmit();

      const expectedUpdatedProject: Project = {
        id: 1,
        name: 'UpdatedProject',
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        industry: undefined,
        salesServiceLink: '',
        info: '',
        startDate: '',
        endDate: '',
        customers: [mockCustomer],
        technologyIds: [1],
        technologyNames: [],
        industrySpecificInformation: '',
      };

      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        1,
        expectedUpdatedProject,
      );
    });
  });

  it('should test if changes works correctly', () => {
    const mockProject: Project = {
      id: 1,
      name: 'Project1',
      customers: [],
      technologyIds: [1, 2, 3],
      technologyNames: [],
      description: 'desc',
      contact: [{ email: 'HIM', role: 'owner' }],
      salesServiceLink: 'link',
      info: 'info',
      industrySpecificInformation: 'industryInfo',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    };

    component.selectedProject = mockProject;

    component.values.projectName = component.selectedProject.name;
    component.values.startDate = component.selectedProject.startDate;
    component.values.info = component.selectedProject.info;
    component.values.description = component.selectedProject.description;
    component.values.contact = component.selectedProject.contact;
    component.values.salesServiceLink =
      component.selectedProject.salesServiceLink;
    component.values.endDate = component.selectedProject.endDate;
    component.values.industry = component.selectedProject.industry;
    component.values.industrySpecificInformation =
      component.selectedProject.industrySpecificInformation;
    component.values.selectedTechnologies = [
      { id: 1 } as Technology,
      { id: 2 } as Technology,
      { id: 3 } as Technology,
    ];
    component.values.newTechnologies = [];

    expect(component.changes()).toBe(false);

    component.values.selectedTechnologies = [
      { id: 1 } as Technology,
      { id: 2 } as Technology,
    ];
    expect(component.changes()).toBe(true);
  });

  it('should test if isAdmin works', () => {
    expect(component.isAdmin()).toBe(true);
  });
});

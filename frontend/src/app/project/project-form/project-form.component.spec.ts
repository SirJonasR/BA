import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormComponent } from './project-form.component';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TechnologyService } from 'src/app/services/technology.service';
import { ProjectService } from 'src/app/services/project.service';
import { CustomerService } from 'src/app/services/customer.service';
import { of } from 'rxjs';
import { Industry, Technology } from 'src/app/models/technology';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { FormValues } from 'src/app/technology/edit-form/edit-form.component';
import { Project } from 'src/app/models/project';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';

describe('ProjectFormComponent', () => {
  let component: ProjectFormComponent;
  let fixture: ComponentFixture<ProjectFormComponent>;

  let mockCustomerService: jasmine.SpyObj<CustomerService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(() => {
    mockCustomerService = jasmine.createSpyObj('CustomerService', [
      'getCustomers',
    ]);
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjects',
      'getIndustries',
    ]);
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'createTechnology',
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', [
      'isEnabled',
    ]);
    mockFeatureFlagService.isEnabled.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [ProjectFormComponent],
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
        RouterTestingModule,
      ],
      providers: [
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: Router, useValue: mockRouter },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
    });
    fixture = TestBed.createComponent(ProjectFormComponent);
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
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    const mockIndustries: Industry[] = [
      { id: 1, name: 'PSD - Public Sector & Defense' },
    ];
    mockProjectService.getIndustries.and.returnValue(of(mockIndustries));
    mockCustomerService.getCustomers.and.returnValue(
      of([{ id: 1, name: 'Customer 1' }]),
    );

    mockTechnologyService.createTechnology.and.returnValue(
      of({ name: 'test' } as Technology),
    );

    component.values = {
      projectName: null,
      customerNames: [],
      selectedTechnologies: [],
      newTechnologies: [],
      startDate: '',
      endDate: '',
      info: '',
      industrySpecificInformation: '',
      salesServiceLink: '',
      industry: 'PSD - Public Sector & Defense',
      description: 'desc',
      contact: [{ email: 'test', role: 'owner' }],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch customers and projects on initialization', () => {
      mockCustomerService.getCustomers.and.returnValue(
        of([{ id: 1, name: 'Customer 1' }]),
      );
      mockProjectService.getProjects.and.returnValue(
        of([
          {
            id: 1,
            name: 'Project 1',
            technologyIds: [],
            technologyNames: [],
            customers: [],
            description: 'desc',
            contact: [{ email: 'HIM', role: 'owner' }],
            salesServiceLink: '',
            info: '',
            industrySpecificInformation: '',
            startDate: '',
            endDate: '',
          },
        ]),
      );

      component.ngOnInit();

      expect(component.allCustomerNames).toContain('customer 1');
      expect(component.allProjectNames).toContain('project 1');
    });

    it('should populate contact controls in edit mode', () => {
      component.editContext = 'edit-existing-project';
      component.values = {
        projectName: 'Project 1',
        customerNames: [],
        description: 'desc',
        contact: [
          { email: 'first@example.com', role: 'owner' },
          { email: 'second@example.com', role: 'stakeholder' },
        ],
        industrySpecificInformation: '',
        salesServiceLink: '',
        info: '',
        industry: 'PSD - Public Sector & Defense',
        startDate: '',
        endDate: '',
        selectedTechnologies: [],
        newTechnologies: [],
      };

      component.ngOnInit();

      expect(component.contactControls.length).toBe(2);
      expect(component.contactControls[0].email.value).toBe(
        'first@example.com',
      );
      expect(component.contactControls[0].role.value).toBe('owner');
      expect(component.contactControls[1].email.value).toBe(
        'second@example.com',
      );
      expect(component.contactControls[1].role.value).toBe('stakeholder');
    });
  });

  describe('checkNoWhitespace', () => {
    it('should return true for empty strings', () => {
      expect(component.checkNoWhitespace('   ')).toBeTrue();
    });

    it('should return false for valid text', () => {
      expect(component.checkNoWhitespace('Valid Text')).toBeFalse();
    });

    it('should return true for strings with only zero-width spaces', () => {
      expect(component.checkNoWhitespace('\u200B')).toBeTrue();
    });
  });

  describe('doesProjectNameAlreadyExists', () => {
    beforeEach(() => {
      component.allProjectNames = ['project 1', 'project 2'];
    });

    it('should return true if the project name already exists', () => {
      component.controlProjectName.setValue('Project 1');
      expect(component.doesProjectNameAlreadyExists()).toBeTrue();
    });

    it('should return false if the project name does not exist', () => {
      component.controlProjectName.setValue('New Project');
      expect(component.doesProjectNameAlreadyExists()).toBeFalse();
    });
  });

  describe('addCustomerNameField', () => {
    it('should add a new customer name form control', () => {
      const initialLength = component.controlCustomerNames.length;
      component.addCustomerNameField();
      expect(component.controlCustomerNames.length).toBe(initialLength + 1);
    });
  });

  describe('removeCustomerNameField', () => {
    it('should remove a customer name form control', () => {
      component.addCustomerNameField();
      const initialLength = component.controlCustomerNames.length;

      component.removeCustomerNameField(0);
      expect(component.controlCustomerNames.length).toBe(initialLength - 1);
    });
  });

  describe('checkRemoveButtonHidden', () => {
    it('should return true when only one customer exists', () => {
      component.controlCustomerNames.length = 1;

      expect(component.checkRemoveButtonHidden()).toBe(true);
    });

    it('should return false when multiple customers exist', () => {
      component.controlCustomerNames.length = 2;

      expect(component.checkRemoveButtonHidden()).toBe(false);
    });
  });

  describe('onFormSubmit', () => {
    it('should emit submitForm if form is valid', async () => {
      spyOn(component.submitForm, 'emit');
      spyOn(component, 'checkIfChanges').and.returnValue(true);
      component.values.projectName = 'New Project';
      component.selectedTechnologies = [
        {
          id: 1,
          name: 'Tech1',
        },
      ];
      component.contactControls = [
        {
          email: new FormControl('test@mail.com', [
            Validators.required,
            Validators.email,
          ]),
          role: new FormControl('owner'),
        },
      ];
      spyOnProperty(component, 'isSubmittable', 'get').and.returnValue(true);
      component.areAllCustomerNamesUnique = true;

      await component.onFormSubmit();

      expect(component.submitForm.emit).toHaveBeenCalled();
    });

    it('should collect contacts and filter empty emails', async () => {
      spyOn(component, 'checkIfChanges').and.returnValue(true);

      component.values = {
        projectName: 'Project 1',
        customerNames: [],
        description: 'desc',
        contact: [],
        industrySpecificInformation: '',
        salesServiceLink: '',
        info: '',
        industry: 'PSD - Public Sector & Defense',
        startDate: '',
        endDate: '',
        selectedTechnologies: [],
        newTechnologies: [],
      };
      component.contactControls = [
        {
          email: new FormControl('valid@example.com', [
            Validators.required,
            Validators.email,
          ]),
          role: new FormControl('owner'),
        },
        {
          email: new FormControl('', [Validators.email]),
          role: new FormControl(''),
        },
      ];
      spyOnProperty(component, 'isSubmittable', 'get').and.returnValue(true);
      component.areAllCustomerNamesUnique = true;

      await component.onFormSubmit();

      expect(component.values.contact.length).toBe(1);
      expect(component.values.contact[0]).toEqual({
        email: 'valid@example.com',
        role: 'owner',
      });
    });
  });

  // it('should call createNewTechnologies and handle errors', async () => {
  //   spyOn(component, 'createNewTechnologies').and.callThrough();
  //   await component.createNewTechnologies();
  //   expect(component.createNewTechnologies).toHaveBeenCalled();
  // });

  it('should edit new technology', () => {
    component.newTechnologies = [{ name: 'Tech1' } as FormValues];
    mockDialog.open.and.returnValue({
      afterClosed: () =>
        of({ event: 'addNewTechnology', data: { name: 'Tech2' } }),
    } as MatDialogRef<void>);
    component.editNewTechnology(0);
    expect(component.newTechnologies[0].name).toBe('Tech2');
  });

  it('should show popup and add new technology', () => {
    mockDialog.open.and.returnValue({
      afterClosed: () =>
        of({ event: 'addNewTechnology', data: { name: 'NewTech' } }),
    } as MatDialogRef<void>);
    component.controlCustomerNames[0].setValue('Customer A');
    component.controlProjectName.setValue('Project A');
    component.showPopup();
    expect(component.newTechnologies.length).toBe(1);
    expect(component.newTechnologies[0].name).toBe('NewTech');
    component.values.newTechnologies = [...component.newTechnologies];
    //component.createNewTechnologies();
  });

  it('should handle if edit mode', () => {
    component.editContext = 'edit-existing-project';
    component.values = {
      projectName: 'test',
      customerNames: ['testCustomer'],
      description: 'test Description',
      contact: [{ email: 'test Contact', role: 'owner' }],
      salesServiceLink: '',
      info: '',
      industrySpecificInformation: '',
      industry: 'PSD - Public Sector & Defense',
      startDate: '',
      endDate: '',
      selectedTechnologies: [{ name: 'testTechnology' } as Technology],
      newTechnologies: [],
    };
    component.ngOnInit();
    expect(component.checkIfChanges()).toBe(false);
    component.values.projectName = 'test2';
    expect(component.checkIfChanges()).toBe(true);
  });

  it('should test searchValue', () => {
    const searchText = 'searchText';
    component.receiveSearchValue(searchText);
    expect(component.searchValue).toBe(searchText);
  });

  it('should test removeTechnology', () => {
    component.newTechnologies = [];
    component.newTechnologies.push(
      { name: 'test1' } as FormValues,
      { name: 'tst2' } as FormValues,
    );
    expect(component.newTechnologies.length).toBe(2);
    component.removeNewTechnology(1);
    expect(component.newTechnologies.length).toBe(1);
  });

  it('should test if isSubmittable works correctly', () => {
    component.controlProjectName.setValue('testProjectName');
    component.controlCustomerNames = [];
    component.controlCustomerNames.push(new FormControl());
    component.controlCustomerNames[0].setValue('testCustomerName');
    component.contactControls[0].email.setValue('test@example.com');
    component.values.selectedTechnologies = [];
    component.values.selectedTechnologies.push({ name: 'test' } as Technology);
    expect(component.isSubmittable).toBe(true);
  });
});

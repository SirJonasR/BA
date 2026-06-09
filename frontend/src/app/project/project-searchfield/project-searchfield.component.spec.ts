import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectSearchfieldComponent } from './project-searchfield.component';
import { ProjectService } from 'src/app/services/project.service';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { SimpleChanges } from '@angular/core';
import { Project } from 'src/app/models/project';

describe('ProjectSearchfieldComponent', () => {
  let component: ProjectSearchfieldComponent;
  let fixture: ComponentFixture<ProjectSearchfieldComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  beforeEach(() => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjects',
    ]);
    mockProjectService.getProjects.and.returnValue(
      of([
        {
          id: 1,
          name: 'project1',
          customers: [
            {
              id: 1,
              name: 'customer1',
            },
          ],
          technologyIds: [1],
          technologyNames: ['t1'],
          description: 'desc',
          contact: [{ email: 'HIM', role: 'owner' }],
          salesServiceLink: '',
          info: '',
          industrySpecificInformation: '',
          startDate: '',
          endDate: '',
          industry: 'PSD - Public Sector & Defense',
        },
        {
          id: 1,
          name: 'project2',
          customers: [
            {
              id: 1,
              name: 'customer1',
            },
          ],
          technologyIds: [1],
          technologyNames: ['t1'],
          description: 'desc',
          contact: [{ email: 'HIM', role: 'owner' }],
          salesServiceLink: '',
          info: '',
          industrySpecificInformation: '',
          startDate: '',
          endDate: '',
          industry: 'PSD - Public Sector & Defense',
        },
      ]),
    );

    TestBed.configureTestingModule({
      declarations: [ProjectSearchfieldComponent, MatAutocomplete],
      providers: [{ provide: ProjectService, useValue: mockProjectService }],
    });
    fixture = TestBed.createComponent(ProjectSearchfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize projects on noOnInit', async () => {
    await component.ngOnInit();
    expect(mockProjectService.getProjects).toHaveBeenCalled();
    expect(component.allProjects.length).toBe(2);
  });

  it('should add selected project and emit event on emit()', () => {
    spyOn(component.selectedProjectsOutput, 'emit');
    spyOn(component.value, 'emit');

    const mockEvent: MatAutocompleteSelectedEvent = {
      option: { value: { name: 'Project 3', id: 1 } },
    } as MatAutocompleteSelectedEvent;

    component.emit(mockEvent);

    expect(component.selectedProjects.length).toBe(1);
    expect(component.selectedProjectsOutput.emit).toHaveBeenCalledWith(
      mockEvent.option.value.id,
    );
    expect(component.value.emit).toHaveBeenCalledWith('');
  });

  it('should mark control as touched when showError changes to true', () => {
    spyOn(component.control, 'markAsTouched');
    spyOn(component.control, 'updateValueAndValidity');

    const changes: SimpleChanges = {
      showError: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false,
      },
    };

    component.ngOnChanges(changes);

    expect(component.control.markAsTouched).toHaveBeenCalledWith({
      onlySelf: true,
    });
    expect(component.control.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should filter projects correctly', async () => {
    await component.ngOnInit();
    const result = component.filter('Project2');
    expect(result.length).toBe(1);
  });

  it('should display project name correctly', () => {
    const project: Project = {
      id: 1,
      name: 'TestProject',
      customers: [
        {
          id: 1,
          name: 'customer1',
        },
      ],
      technologyIds: [1],
      technologyNames: ['t1'],
      description: 'desc',
      contact: [{ email: 'HIM', role: 'owner' }],
      salesServiceLink: '',
      info: '',
      industrySpecificInformation: '',
      startDate: '',
      endDate: '',
      industry: 'PSD - Public Sector & Defense',
    };
    expect(component.displayProject(project)).toBe('TestProject');
  });

  it('should remove project correctly', () => {
    component.selectedProjects = [
      {
        id: 1,
        name: 'project1',
        customers: [
          {
            id: 1,
            name: 'customer1',
          },
        ],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
        industry: 'PSD - Public Sector & Defense',
      },
      {
        id: 1,
        name: 'project2',
        customers: [
          {
            id: 1,
            name: 'customer1',
          },
        ],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
        industry: 'PSD - Public Sector & Defense',
      },
    ];
    spyOn(component.control, 'updateValueAndValidity');

    component.removeItem({
      id: 1,
      name: 'project2',
      customers: [
        {
          id: 1,
          name: 'customer1',
        },
      ],
      description: 'desc',
      contact: [{ email: 'HIM', role: 'owner' }],
      salesServiceLink: '',
      info: '',
      industrySpecificInformation: '',
      startDate: '',
      endDate: '',
      industry: 'PSD - Public Sector & Defense',
    });

    expect(component.selectedProjects.length).toBe(1);
    expect(component.control.updateValueAndValidity).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProjectComponent } from './add-project.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PictureService } from 'src/app/services/picture.service';
import { of } from 'rxjs';
import { Technology } from 'src/app/models/technology';
import { ProjectService } from 'src/app/services/project.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-project-form',
  template: '',
})
class ProjectFormStubComponent {
  @Input() values: unknown;
  @Input() isSubmitting = false;
  @Input() hasError = false;
  @Output() submitForm = new EventEmitter<void>();
}

describe('AddProjectComponent', () => {
  let component: AddProjectComponent;
  let fixture: ComponentFixture<AddProjectComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockPictureService: jasmine.SpyObj<PictureService>;

  beforeEach(() => {
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'createTechnology',
      'getTagSelection',
    ]);
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjectForm',
      'createProject',
      'getIndustries',
    ]);
    mockPictureService = jasmine.createSpyObj('PictureService', ['getPicture']);
    TestBed.configureTestingModule({
      declarations: [AddProjectComponent, ProjectFormStubComponent],
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatAutocompleteModule,
        MatInputModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: PictureService, useValue: mockPictureService },
      ],
    });
    fixture = TestBed.createComponent(AddProjectComponent);
    component = fixture.componentInstance;
    mockProjectService.getIndustries.and.returnValue(of([]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changes method', () => {
    it('should return true if there are changes', () => {
      component.values = {
        customerNames: ['Customer1'],
        projectName: 'Project1',
        selectedTechnologies: [],
        newTechnologies: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
        industry: '',
      };
      expect(component.changes()).toBeTrue();
    });

    it('should return false if there are no changes', () => {
      component.values = {
        customerNames: [],
        projectName: null,
        selectedTechnologies: [],
        newTechnologies: [],
        description: '',
        contact: [],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
        industry: '',
      };
      expect(component.changes()).toBeFalse();
    });

    it('should return false if isSubmitting is true', () => {
      component.isSubmitting = true;
      expect(component.changes()).toBeFalse();
    });
  });

  describe('onSubmit method', () => {
    it('should update technologies and set isSubmitting to true', async () => {
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
      component.values = {
        customerNames: [],
        projectName: 'Project1',
        selectedTechnologies: [mockTechnology],
        newTechnologies: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        startDate: '',
        endDate: '',
        industry: '',
        industrySpecificInformation: '',
      };

      mockProjectService.createProject.and.returnValue(of());

      await component.onSubmit();

      expect(mockProjectService.createProject).toHaveBeenCalled();
      expect(component.isSubmitting).toBeTrue();
      expect(component.hasError).toBeFalse();
    });

    it('should create new technology', async () => {
      component.values = {
        customerNames: [],
        projectName: 'Project1',
        selectedTechnologies: [],
        newTechnologies: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        startDate: '',
        endDate: '',
        industry: '',
        industrySpecificInformation: '',
      };
      component.values.newTechnologies = [
        {
          name: 'name',
          description: 'desc',
          shortDescription: 'shortdesc',
          pictureData: null,
          isNewPic: false,
          categoryId: 0,
          lifecycleId: 0,
          priority: false,
          tags: ['1', '2', '3', '4', '5'],
          projectIds: [0, 1],
          connectedTechnologyIds: [],
          certificates: [],
        },
      ];

      const mockTags = ['tag1', 'tag2'];

      mockProjectService.createProject.and.returnValue(
        of({
          id: 1,
          name: 'Project1',
          technologyIds: [],
          customers: [],
          description: 'desc',
          contact: [{ email: 'HIM', role: 'owner' }],
          salesServiceLink: '',
          info: '',
          startDate: '',
          endDate: '',
          technologyNames: [],
          industrySpecificInformation: '',
        }),
      );

      mockTechnologyService.createTechnology.and.returnValue(
        of({ name: 't1' } as Technology),
      );
      mockTechnologyService.getTagSelection.and.returnValue(of(mockTags));
      mockTechnologyService.tags = mockTags;
      await component.onSubmit();
      expect(mockTechnologyService.createTechnology).toHaveBeenCalled();
      expect(mockTechnologyService.getTagSelection).toHaveBeenCalled();
      expect(mockTechnologyService.tags).toEqual(mockTags);
    });
  });
});

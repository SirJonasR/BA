import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {
  ProjectReference,
  ProjectReferenceComponent,
} from './project-reference.component';
import { Technology } from 'src/app/models/technology';
import { ProjectService } from 'src/app/services/project.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Project } from 'src/app/models/project';

describe('ProjectReferenceComponent', () => {
  let component: ProjectReferenceComponent;
  let fixture: ComponentFixture<ProjectReferenceComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjects',
      'getProjectReferences',
      'getIndustries',
    ]);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockProjectService.getIndustries.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ProjectReferenceComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function createTechnologies(): Technology[] {
    return [
      {
        id: 1,
        name: 'Tech1',
        projects: [],
        categoryId: 1,
        lifecycleId: 1,
        description: '',
        pictureId: null,
        shortDescription: '',
        priority: true,
        tags: [],
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
        viewCount: 1,
        status: 1,
        jumpDate: '',
      },
    ];
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate dataSource when references are returned', () => {
    const techs = createTechnologies();
    const references: ProjectReference[] = [
      {
        projectName: 'Proj1',
        industryName: 'testIndustry',
        allTechnologiesFromProject: techs,
        givenTechnologies: techs,
        overlappedTechnologies: techs,
      },
    ];
    mockProjectService.getProjectReferences.and.returnValue(of(references));

    component.selectedTechnologies = techs;
    component.searchProjectReference();

    expect(mockProjectService.getProjectReferences).toHaveBeenCalledWith(
      techs,
      [],
    );
    expect(component.dataSource.data).toEqual(references);
  });

  it('should show snackbar when no references are returned', () => {
    spyOn(component['snackBar'], 'open');
    const techs = createTechnologies();
    mockProjectService.getProjectReferences.and.returnValue(of([]));

    component.selectedTechnologies = techs;
    component.searchProjectReference();

    expect(component.dataSource.data).toEqual([]);
    expect(component['snackBar'].open).toHaveBeenCalledWith(
      'Keine Projektreferenzen gefunden.',
      '',
      { duration: 3000 },
    );
  });

  it('should log error when service call fails', () => {
    const error = new Error('Service error');
    spyOn(console, 'error');
    mockProjectService.getProjectReferences.and.returnValue(
      throwError(() => error),
    );

    component.selectedTechnologies = createTechnologies();
    component.searchProjectReference();

    expect(console.error).toHaveBeenCalledWith(
      'Fehler beim Abrufen der Projektreferenzen:',
      error,
    );
  });

  it('should call location.back()', () => {
    component.goBackToPrevPage();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('should navigate to correct project when found', () => {
    const project = { id: 1, name: 'testProject' } as Project;
    mockProjectService.getProjects.and.returnValue(of([project]));

    const reference: ProjectReference = {
      projectName: 'testProject',
      industryName: 'testIndustry',
      allTechnologiesFromProject: [],
      givenTechnologies: [],
      overlappedTechnologies: [],
    };

    component.navigate(reference);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/project', 1]);
  });

  it('should not navigate when project not found', () => {
    spyOn(component['snackBar'], 'open');
    mockProjectService.getProjects.and.returnValue(of([]));

    const reference: ProjectReference = {
      projectName: 'notFoundProject',
      industryName: 'testIndustry',
      allTechnologiesFromProject: [],
      givenTechnologies: [],
      overlappedTechnologies: [],
    };

    component.navigate(reference);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component['snackBar'].open).toHaveBeenCalledWith(
      'Projekt nicht gefunden.',
      '',
      { duration: 3000 },
    );
  });
});

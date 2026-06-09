import { TestBed } from '@angular/core/testing';

import { ProjectService } from './project.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Technology } from 'src/app/models/technology';
import { environment } from 'src/environments/environment';
import { ProjectReference } from '../project/project-reference/project-reference.component';
import { Project, ProjectHistory } from '../models/project';

describe('ProjectServiceService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project 1',
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
      name: 'Project 2',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch projects using GET', () => {
    service.getProjects().subscribe((projects) => {
      expect(projects.length).toBe(2);
      expect(projects).toEqual(mockProjects);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/project`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });

  it('should fetch project using GET', () => {
    service.getProject(1).subscribe((project) => {
      expect(project.id).toBe(1);
      expect(project).toEqual(mockProjects[0]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/project/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects[0]);
  });

  it('should update a project using PUT', () => {
    const updatedProject: Project = {
      id: 1,
      name: 'Updated Project',
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

    service.updateProject(1, updatedProject).subscribe((project) => {
      expect(project).toEqual(updatedProject);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/project/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProject);
    req.flush(updatedProject);
  });

  it('should delete a project using DELETE', () => {
    service.deleteProject(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/project/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should create a project using POST', () => {
    const project: Project = {
      id: 1,
      name: 'Project 1',
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
    service.createProject(project).subscribe((response) => {
      expect(response).toEqual(project);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/project`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(project);
    req.flush(project);
  });

  it('should get project using GET', () => {
    const project: Project = {
      id: 1,
      name: 'Project 1',
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
    service.getProject(1).subscribe((response) => {
      expect(response).toEqual(project);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/project/1`);
    expect(req.request.method).toBe('GET');
    req.flush(project);
  });

  it('should get project histories using GET', () => {
    const projectHistories: ProjectHistory[] = [
      {
        changeDate: new Date(),
        username: 'user1',
        name: 'h1',
        description: 'Desc A',
        contact: [{ email: 'John', role: 'owner' }],
        salesServiceLink: 'linkA',
        info: 'Info A',
        industrySpecificInformation: 'Industry Info A',
        startDate: '2020-01-01',
        endDate: '',
        customerNames: ['Customer1'],
        technologyIds: [1],
        technologyNames: ['t1'],
        isChanged: {
          name: false,
          contact: false,
          salesServiceLink: false,
          description: false,
          info: false,
          industrySpecificInformation: false,
          startDate: false,
          endDate: false,
          customerNames: false,
          technologyIds: false,
        },
      },
      {
        changeDate: new Date(),
        username: 'user1',
        name: 'B',
        description: 'Desc B',
        contact: [{ email: 'Doe', role: 'owner' }],
        salesServiceLink: 'linkB',
        info: 'Info B',
        startDate: '2021-01-01',
        endDate: '',
        customerNames: ['Customer2'],
        technologyIds: [2],
        technologyNames: ['t2'],
        isChanged: {
          name: false,
          contact: false,
          salesServiceLink: false,
          description: false,
          info: false,
          industrySpecificInformation: false,
          startDate: false,
          endDate: false,
          customerNames: false,
          technologyIds: false,
        },
      },
    ];
    service.getProjectHistories(1).subscribe((response) => {
      expect(response).toEqual(projectHistories);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/project/history/1`);
    expect(req.request.method).toBe('GET');
    req.flush(projectHistories);
  });

  it('should fetch project references with given technologies', () => {
    const mockTechnologies: Technology[] = [
      { id: 1, name: 'Angular' } as Technology,
      { id: 2, name: 'React' } as Technology,
    ];

    const projectReferences: ProjectReference[] = [
      {
        projectName: 'Project A',
        industryName: 'testIndustry',
        allTechnologiesFromProject: mockTechnologies,
        givenTechnologies: mockTechnologies,
        overlappedTechnologies: mockTechnologies,
      },
    ];

    service
      .getProjectReferences(mockTechnologies, [])
      .subscribe((projectRefs) => {
        expect(projectRefs.length).toBe(1);
        expect(projectRefs).toEqual(projectReferences);
      });

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.apiUrl}/similarity/project-overlap`,
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.getAll('technologyIds')).toEqual(['1', '2']);

    req.flush(projectReferences);
  });
});

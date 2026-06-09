import { TestBed } from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TechnologyService } from 'src/app/services/technology.service';
import {
  Category,
  Lifecycle,
  Technology,
  TechnologyRequest,
  THistory,
} from 'src/app/models/technology';
import { environment } from 'src/environments/environment';
import { Customer } from './customer.service';
import { Project } from '../models/project';

describe('TechnologyService', () => {
  let technologyService: TechnologyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TechnologyService],
    });

    technologyService = TestBed.inject(TechnologyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(technologyService).toBeTruthy();
  });

  it('should initialize lifecycles, categories, tags and customers', async () => {
    const mockLifecycles: Lifecycle[] = [
      { id: 1, name: 'Lifecycle1', description: 'Desc1' },
    ];
    const mockCategories: Category[] = [
      { id: 1, name: 'Category1', description: 'Desc1' },
    ];
    const mockTags: string[] = ['Tags1'];
    const mockCustomers: Customer[] = [{ id: 1, name: 'Customer1' }];
    const mockProjects: Project[] = [
      {
        id: 1,
        name: 'Project1',
        technologyIds: [],
        customers: [],
        description: 'desc',
        contact: [{ email: 'HIM', role: 'owner' }],
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
        technologyNames: [],
        industry: 'PSD - Public Sector & Defense',
      },
    ];
    // Aufruf der asynchronen Methode und Warten auf ihre Fertigstellung
    const initializePromise = technologyService.initialize();

    // Überprüfung und Beendigung der HTTP-Anfragen
    const lifecycleReq = httpMock.expectOne(`${environment.apiUrl}/lifecycle`);
    lifecycleReq.flush(mockLifecycles);

    const categoryReq = httpMock.expectOne(`${environment.apiUrl}/category`);
    categoryReq.flush(mockCategories);

    const tagReq = httpMock.expectOne(`${environment.apiUrl}/tag`);
    tagReq.flush(mockTags);

    const customerReq = httpMock.expectOne(`${environment.apiUrl}/customer`);
    customerReq.flush(mockCustomers);

    const projectReq = httpMock.expectOne(`${environment.apiUrl}/project`);
    projectReq.flush(mockProjects);

    // Warten auf die Fertigstellung der `initialize`-Methode
    await initializePromise;

    // Überprüfung, ob die Eigenschaften korrekt initialisiert wurden
    expect(technologyService.lifecycles).toEqual(mockLifecycles);
    expect(technologyService.categories).toEqual(mockCategories);
    expect(technologyService.tags).toEqual(mockTags);
    expect(technologyService.customers).toEqual(mockCustomers);
    expect(technologyService.projects).toEqual(mockProjects);
  });

  it('should convert TechnologyRequest to FormData', () => {
    const mockTechnologyRequest: TechnologyRequest = {
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
    };

    const formData = technologyService.convertValuesToFormData(
      mockTechnologyRequest,
    );

    expect(formData.get('name')).toEqual('Name');
    expect(formData.getAll('projectIds')).toEqual(['0', '1']);
  });

  it('should fetch technologies', () => {
    const mockTechnologies: Technology[] = [
      {
        id: 1,
        name: 'Tech1',
        description: 'Desc1',
        shortDescription: 'ShortDesc1',
        pictureId: 0,
        categoryId: 0,
        lifecycleId: 0,
        tags: ['1', '2', '3', '4', '5'],
        projects: [],
        status: 1,
        jumpDate: '2023-08-20',
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
        projects: [],
        status: 1,
        jumpDate: '2023-08-20',
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];

    technologyService.getTechnologies().subscribe((technologies) => {
      expect(technologies.length).toBe(2);
      expect(technologies).toEqual(mockTechnologies);
    });

    const req = httpMock.expectOne(environment.apiUrl + '/technology');
    expect(req.request.method).toBe('GET');
    req.flush(mockTechnologies);
    httpMock.verify();
  });

  it('should create a technology', () => {
    const mockTechnologyRequest: TechnologyRequest = {
      name: 'name',
      description: 'desc',
      shortDescription: 'shortdesc',
      pictureData: null,
      isNewPic: false,
      categoryId: 0,
      lifecycleId: 0,
      priority: false,
      tags: ['1', '2', '3', '4', '5'],
      projectIds: [],
      connectedTechnologyIds: [],
      certificates: [],
    };
    const mockTechnology: Technology = {
      name: 'name',
      id: 0,
      description: 'desc',
      shortDescription: 'shortdesc',
      pictureId: 0,
      categoryId: 0,
      lifecycleId: 0,
      priority: false,
      tags: ['1', '2', '3', '4', '5'],
      projects: [],
      status: 1,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };

    technologyService
      .createTechnology(mockTechnologyRequest)
      .subscribe((technology) => {
        expect(technology).toEqual(mockTechnology);
      });

    const req = httpMock.expectOne(environment.apiUrl + '/technology');
    expect(req.request.method).toBe('POST');
    req.flush(mockTechnology);
    httpMock.verify();
  });

  it('should get Category by ID', () => {
    technologyService.categories = [
      { id: 0, name: 'Category0', description: 'Category0' },
      { id: 1, name: 'Category1', description: 'Category1' },
    ];

    const result1 = technologyService.getCategoryById(0);
    const result2 = technologyService.getCategoryById(1);

    expect(result1).toEqual({
      id: 0,
      name: 'Category0',
      description: 'Category0',
    });
    expect(result2).toEqual({
      id: 1,
      name: 'Category1',
      description: 'Category1',
    });
  });

  it('should get Lifecycle by ID', () => {
    technologyService.lifecycles = [
      { id: 0, name: 'Lifecycle0', description: 'Lifecycle0' },
      { id: 1, name: 'Lifecycle1', description: 'Lifecycle1' },
    ];

    const result1 = technologyService.getLifecycleById(0);
    const result2 = technologyService.getLifecycleById(1);
    expect(result1).toEqual({
      id: 0,
      name: 'Lifecycle0',
      description: 'Lifecycle0',
    });
    expect(result2).toEqual({
      id: 1,
      name: 'Lifecycle1',
      description: 'Lifecycle1',
    });
  });

  it('should update a technology', () => {
    const mockId = 0;
    const mockTechnologyRequest: TechnologyRequest = {
      name: 'name',
      description: 'desc',
      shortDescription: 'shortdesc',
      pictureData: null,
      isNewPic: false,
      categoryId: 0,
      lifecycleId: 0,
      priority: false,
      tags: ['1', '2', '3', '4', '5'],
      projectIds: [],
      connectedTechnologyIds: [-99],
      certificates: [
        {
          name: 'certificate',
          description: 'desc',
          prerequisites: [1],
          followUps: [2],
          readonly: false,
        },
      ],
    };
    const mockTechnology: Technology = {
      name: 'name',
      id: 0,
      description: 'desc',
      shortDescription: 'shortdesc',
      pictureId: 0,
      categoryId: 0,
      lifecycleId: 0,
      priority: false,
      tags: ['1', '2', '3', '4', '5'],
      projects: [],
      status: 1,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [-99],
      connectedTechnologyNames: ['connectedTec'],
      certificates: [
        {
          id: 1,
          name: 'certificate',
          description: 'desc',
          prerequisites: [1],
          followUps: [2],
        },
      ],
    };

    technologyService
      .updateTechnology(mockId, mockTechnologyRequest)
      .subscribe((technology) => {
        expect(technology).toEqual(mockTechnology);
      });

    const req = httpMock.expectOne(
      environment.apiUrl + '/technology/' + mockId,
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockTechnology);
    httpMock.verify();
  });

  it('should delete a technology', () => {
    const mockId = 0;

    technologyService.deleteTechnology(mockId).subscribe((technology) => {
      expect(technology).toBeNull();
    });

    const req = httpMock.expectOne(
      environment.apiUrl + '/technology/' + mockId,
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    httpMock.verify();
  });

  it('should fetch a single technology by ID', () => {
    const mockTechnology: Technology = {
      name: 'name',
      id: 0,
      description: 'desc',
      shortDescription: 'shortdesc',
      pictureId: 0,
      categoryId: 0,
      lifecycleId: 0,
      tags: ['1', '2', '3', '4', '5'],
      projects: [],
      status: 1,
      priority: false,
      jumpDate: '2023-08-20',
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };

    const id = 0;

    technologyService.getTechnology(id).subscribe((technology) => {
      expect(technology).toEqual(mockTechnology);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/technology/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTechnology);
    httpMock.verify();
  });

  it('should fetch technology history by ID', () => {
    const mockHistory: THistory[] = [
      {
        date: new Date('2021-09-11T00:00:00.000Z'),
        username: 'username1',
        name: 'Tech1',
        categoryName: 'Category1',
        lifecycleName: 'Lifecycle1',
        description: 'Description1',
        shortDescription: 'ShortDesc1',
        pictureId: 1,
        priority: false,
        tags: ['tag1', 'tag2'],
        isChanged: {
          name: true,
          category: false,
          lifecycle: true,
          description: false,
          shortDescription: true,
          picture: false,
          priority: false,
        },
      },
      {
        date: new Date('2021-09-12T00:00:00.000Z'),
        username: 'username2',
        name: 'Tech2',
        categoryName: 'Category2',
        lifecycleName: 'Lifecycle2',
        description: 'Description2',
        shortDescription: 'ShortDesc2',
        pictureId: 2,
        priority: false,
        tags: ['tag3', 'tag4'],
        isChanged: {
          name: false,
          category: true,
          lifecycle: false,
          description: true,
          shortDescription: false,
          picture: true,
          priority: false,
        },
      },
    ];

    const id = 1;

    technologyService.getTechnologyHistory(id).subscribe((history) => {
      expect(history).toEqual(mockHistory);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/history/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });

  it('should fetch TagSelection', () => {
    const mockTags: Array<string> = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

    technologyService.getTagSelection().subscribe((tags) => {
      expect(tags).toEqual(mockTags);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tag`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTags);
  });

  it('should fetch Similarities', () => {
    const mockSimilarities: Map<string, number> = new Map<string, number>();
    mockSimilarities.set('Technology0', 3);
    mockSimilarities.set('Technology1', 2);
    // ( "Technology0", 3 ),
    // { Technology1: 2 },
    const mockId = 1;

    technologyService.getSimilarity(mockId).subscribe((similarities) => {
      expect(similarities).toEqual(mockSimilarities);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/similarity/${mockId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockSimilarities);
  });
});

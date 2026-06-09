import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectHistoryComponent } from './project-history.component';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { of } from 'rxjs';
import { ProjectHistory } from 'src/app/models/project';
import { MatTableModule } from '@angular/material/table';

describe('ProjectHistoryComponent', () => {
  let component: ProjectHistoryComponent;
  let fixture: ComponentFixture<ProjectHistoryComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;
  const mockHistories: ProjectHistory[] = [
    {
      changeDate: new Date(),
      username: 'user',
      name: 'h1',
      description: 'Desc A',
      contact: [{ email: 'John', role: 'owner' }],
      salesServiceLink: 'LinkA',
      info: 'Info A',
      industrySpecificInformation: 'Industry Info A',
      startDate: '2020-01-01',
      endDate: '',
      customerNames: ['Customer1'],
      technologyIds: [1],
      technologyNames: ['t1'],
      industry: 'PSD - Public Sector & Defense',
      isChanged: {
        name: false,
        contact: false,
        description: false,
        salesServiceLink: false,
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
      username: 'user',
      name: 'B',
      description: 'Desc B',
      contact: [{ email: 'Doe', role: 'owner' }],
      salesServiceLink: 'LinkB',
      info: 'Info B',
      industrySpecificInformation: 'Industry Info B',
      startDate: '2021-01-01',
      endDate: '',
      customerNames: ['Customer2'],
      technologyIds: [2],
      technologyNames: ['t2'],
      industry: 'PSD - Public Sector & Defense',
      isChanged: {
        name: false,
        contact: false,
        description: false,
        salesServiceLink: false,
        info: false,
        industrySpecificInformation: false,
        startDate: false,
        endDate: false,
        customerNames: false,
        technologyIds: false,
      },
    },
  ];
  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjectHistories',
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

    TestBed.configureTestingModule({
      declarations: [ProjectHistoryComponent],
      imports: [MatTableModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (): string => '1',
              },
            },
          },
        },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: UserHandlingService, useValue: mockUserHandlingService },
      ],
    });

    mockProjectService.getProjectHistories.and.returnValue(of(mockHistories));
    fixture = TestBed.createComponent(ProjectHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check if user is an admin', async () => {
    expect(component.displayedColumns.length).toBe(12);

    component.displayedColumns = [
      'changeDate',
      'username',
      'name',
      'description',
      'contact',
      'salesServiceLink',
      'info',
      'industrySpecificInformation',
      'startDate',
      'endDate',
      'customerNames',
      'technologyNames',
    ];
    mockUserHandlingService.user = {
      userName: '',
      showIconsInColor: false,
      showIcons: false,
      roles: [UserRole.USER],
    };
    mockUserHandlingService.hasRole.and.returnValue(false);
    await component.ngOnInit();
    expect(component.displayedColumns.length).toBe(11);
  });

  it('should check init', () => {
    expect(component.dataSource.length).toBe(mockHistories.length);
  });
});

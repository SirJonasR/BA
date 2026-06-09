import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ProjectDetailPageComponent } from './project-detail-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectService } from 'src/app/services/project.service';
import { TechnologyService } from 'src/app/services/technology.service';
import { MatDialog } from '@angular/material/dialog';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { of } from 'rxjs';
import { Technology } from 'src/app/models/technology';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RemoveDialogComponent } from 'src/app/utils/remove-dialog/remove-dialog.component';
import { Project } from 'src/app/models/project';

describe('ProjectDetailPageComponent', () => {
  let component: ProjectDetailPageComponent;
  let fixture: ComponentFixture<ProjectDetailPageComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;
  let mockSnackbar: jasmine.SpyObj<MatSnackBar>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProject',
      'getTechnologyNames',
      'deleteProject',
      'getProjectHistories',
    ]);
    mockProjectService.getProjectHistories.and.returnValue(of([]));
    mockDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnology',
    ]);
    mockUserHandlingService = jasmine.createSpyObj(
      'UserHandlingService',
      ['hasRole'],
      {
        user: {
          userName: '',
          showIcons: false,
          showIconsInColor: false,
          roles: [UserRole.USER],
        },
      },
    );

    mockProjectService.getProject.and.returnValue(
      of({
        name: 'TestProject',
        id: 1,
        customers: [],
        technologyIds: [1],
        technologyNames: ['t1'],
        description: 'desc',
        salesServiceLink: '',
        info: '',
        industrySpecificInformation: '',
        startDate: '',
        endDate: '',
        contact: [{ email: 'test', role: 'owner' }],
      }),
    );
    mockTechnologyService.getTechnology.and.returnValue(
      of({
        id: 1,
        name: 'TestTechnology1',
      } as Technology),
    );
    TestBed.configureTestingModule({
      declarations: [ProjectDetailPageComponent],
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
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackbar },
        { provide: UserHandlingService, useValue: mockUserHandlingService },
        { provide: Router, useValue: mockRouter },
      ],
      imports: [HttpClientTestingModule],
    });
    fixture = TestBed.createComponent(ProjectDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test if correct initialize', () => {
    component.ngOnInit();
    expect(component.id).toBe(1);
    expect(component.project).toEqual({
      name: 'TestProject',
      id: 1,
      customers: [],
      technologyIds: [1],
      technologyNames: ['t1'],
      description: 'desc',
      salesServiceLink: '',
      info: '',
      industrySpecificInformation: '',
      startDate: '',
      endDate: '',
      contact: [{ email: 'test', role: 'owner' }],
    } as Project);
  });

  describe('deleteProject', () => {
    it('should open delete dialog with correct data when handleDeleteButtonClick is called', () => {
      component.project = {
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

      component.openDeleteDialog();

      expect(mockDialog.open).toHaveBeenCalledOnceWith(
        RemoveDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            resourceType: 'Projekt',
            resourceName: component.project.name,
            onDelete: jasmine.any(Function),
          }),
        }),
      );
    });

    it('should delete the selected project and navigate to home', fakeAsync(() => {
      component.project = {
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
      tick();

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'Das Projekt Project1 wurde erfolgreich gelöscht.',
      );
    }));
  });
});

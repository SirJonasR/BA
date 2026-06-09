import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditFormComponent } from './edit-form.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TechnologyFormDialogComponent } from 'src/app/project/project-form/technology-form-dialog/technology-form-dialog.component';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { KeycloakService } from 'keycloak-angular';

describe('EditFormComponent', () => {
  let component: EditFormComponent;
  let fixture: ComponentFixture<EditFormComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TechnologyFormDialogComponent>>;
  let mockKeycloakService: jasmine.SpyObj<KeycloakService>;

  beforeEach(async () => {
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnologies',
    ]);
    mockTechnologyService.getTechnologies.and.returnValue(
      of([
        {
          id: 1,
          name: 'Tech1',
          description: 'Description for Tech1',
          shortDescription: 'Short description for Tech1',
          pictureId: null,
          categoryId: 1,
          lifecycleId: 1,
          priority: false,
          tags: ['tag1', 'tag2'],
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
              technologyIds: [1],
              technologyNames: ['Tech1'],
              description: 'desc',
              contact: [{ email: 'HIM', role: 'owner' }],
              salesServiceLink: '',
              info: '',
              startDate: '',
              endDate: '',
            },
          ],
          status: 1,
          jumpDate: '2023-08-20',
          viewCount: 0,
          connectedTechnologyIds: [],
          connectedTechnologyNames: [],
          certificates: [
            {
              id: 1,
              name: 'Cert1',
              description: 'Certificate description',
              prerequisites: [],
              followUps: [],
            },
          ],
        },
      ]),
    );

    mockUserHandlingService = jasmine.createSpyObj('UserHandlingService', [
      'hasRole',
    ]);
    mockUserHandlingService.hasRole.and.returnValue(true);

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustResourceUrl',
      'sanitize',
    ]);

    await TestBed.configureTestingModule({
      declarations: [EditFormComponent],
      providers: [
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: UserHandlingService, useValue: mockUserHandlingService },
        { provide: KeycloakService, useValue: mockKeycloakService },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFormComponent);
    component = fixture.componentInstance;

    component.values = {
      name: 'Test Name',
      description: 'Test Description',
      shortDescription: 'Test Short Description',
      tags: ['1', '2', '3', '4', '5'],
      categoryId: null,
      lifecycleId: -1,
      pictureData: null,
      isNewPic: false,
      priority: false,
      projectIds: [],
      connectedTechnologyIds: [],
      certificates: [
        {
          name: '',
          description: '',
          prerequisites: [],
          followUps: [],
        },
      ],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call TechnologyService.getTechnologies() on ngOnInit', () => {
    component.ngOnInit();
    expect(mockTechnologyService.getTechnologies).toHaveBeenCalled();
  });

  it('should update previewUrl when onFileSelected is called with a file', () => {
    const mockEvent = {
      target: {
        files: [
          new File(['fileContent'], 'fileName.png', { type: 'image/png' }),
        ],
      },
    };
    component.onFileSelected(mockEvent as unknown as Event);
    fixture.detectChanges();

    expect(component.previewUrl).toBeDefined();
    expect(component.values.isNewPic).toBeTruthy();
    expect(component.values.pictureData).toBeDefined();
  });

  it('should clear picture data when clear is called', () => {
    component.clear();
    expect(component.values.pictureData).toBeNull();
    expect(component.values.isNewPic).toBeFalsy();
    expect(component.previewUrl).toBeNull();
  });

  it('should emit submitForm event if form is valid', () => {
    const mockForm = { valid: true, dirty: true } as NgForm;
    const submitSpy = spyOn(component.submitForm, 'emit');
    component.values.name = 'New Name';
    component.onFormSubmit(mockForm);
    expect(submitSpy).toHaveBeenCalled();
  });

  it('should alert when the image size is too big', () => {
    spyOn(window, 'alert');
    const bigFile = new Blob(['a'.repeat(5 * 1024 * 1024)], {
      type: 'image/png',
    }); // 5 MB
    const mockEventWithBigFile = {
      target: {
        files: [new File([bigFile], 'big-file.png', { type: 'image/png' })],
      },
    };
    component.onFileSelected(mockEventWithBigFile as unknown as Event);
    expect(window.alert).toHaveBeenCalledWith('Bild ist zu groß. Max 4mb');
  });

  it('should emit submitForm event if form and customers are valid', () => {
    const mockForm = { valid: true, dirty: true } as NgForm;
    spyOn(component.submitForm, 'emit');

    component.values.name = 'New Name';

    component.values.certificates = [
      {
        name: 'Certificate1',
        description: 'description1',
        prerequisites: [],
        followUps: [],
      },
    ];
    component.onFormSubmit(mockForm);
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  it('should emit submitForm event if form and customers are valid AND Tech name is same', () => {
    const mockForm = { valid: true, dirty: true } as NgForm;
    spyOn(component.submitForm, 'emit');

    component.values.description = 'New Des';

    component.values.certificates = [
      {
        name: 'Certificate1',
        description: 'description1',
        prerequisites: [],
        followUps: [],
      },
    ];
    component.onFormSubmit(mockForm);
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  // it('should check if nothing was changed', () => {
  //   const mockForm = { valid: true, dirty: false } as NgForm;
  //   spyOn(window, 'alert');
  //
  //   component.oldPicData = 'somePicData';
  //   component.oldTagData = ['tag1', 'tag2'];
  //   component.oldProjects = [];
  //   component.oldPriority = false;
  //   component.oldCertificates = [
  //     { name: 'Certificate1', description: 'descritpion1' },
  //   ];
  //   component.oldSelectedConnectedTechnologyIds = []
  //
  //   component.values.pictureData = 'somePicData';
  //   component.values.tags = ['tag1', 'tag2'];
  //   component.values.projects = [];
  //   component.values.priority = false;
  //   component.values.connectedTechnologyIds = []
  //
  //   component.values.certificates = [
  //     { name: 'Certificate1', description: 'descritpion1' },
  //   ];
  //   component.onFormSubmit(mockForm);
  //   expect(window.alert).toHaveBeenCalledWith('Es wurde nichts verändert');
  // });
  // it('should check if nothing was changed', () => {
  //   const mockForm = { valid: true, dirty: false } as NgForm;
  //   spyOn(window, 'alert');
  //
  //   component.oldPicData = 'somePicData';
  //   component.oldTagData = ['tag1', 'tag2'];
  //   component.oldCustomers = [
  //     { name: 'Customer1', projects: [{ name: 'project1' }] },
  //   ];
  //   component.oldPriority = false;
  //
  //   component.values.pictureData = 'somePicData';
  //   component.values.tags = ['tag1', 'tag2'];
  //   component.values.customers = [
  //     { name: 'Customer1', projects: [{ name: 'project1' }] },
  //   ];
  //   component.values.priority = false;
  //
  //   component.onFormSubmit(mockForm);
  //   expect(window.alert).toHaveBeenCalledWith('Es wurde nichts verändert');
  // });

  it('should alert when a technology with the same name already exists', () => {
    const mockForm = { valid: true, dirty: true } as NgForm;
    const alertSpy = spyOn(window, 'alert');

    component.oldNameData = 'Old Name';
    component.values.name = ' New Name';
    component.technologyNamesArray = ['newname'];

    component.onFormSubmit(mockForm);

    expect(alertSpy).toHaveBeenCalledWith(
      'Diese Technologie existiert bereits',
    );
  });
});

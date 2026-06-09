import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportFormComponent } from './report-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ReportService } from 'src/app/services/report.service';

describe('ReportFormComponent', () => {
  let component: ReportFormComponent;
  let fixture: ComponentFixture<ReportFormComponent>;
  let mockReportService: jasmine.SpyObj<ReportService>;
  let mockSnackbar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    mockReportService = jasmine.createSpyObj('ReportService', [
      'createTechnologyDetailReport',
      'downloadPDF',
    ]);

    mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      declarations: [ReportFormComponent],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // afterEach(() => {
  //   // Aufräumen nach jedem Testfall
  //   mockReportService = jasmine.createSpyObj('ReportService', [
  //     'createTechnologyDetailReport',
  //   ]);
  // });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize periodList with correct values', () => {
    expect(component.periodList.length).toBe(7); // Checks if the number of periods is correct
    // Additional specific checks for initialized values could be added here
  });

  it('should reset selectedPeriod when resetSelectedPeriod is called', () => {
    component.selectedPeriod = {
      name: 'Test',
      periodDetail: 'Test Period',
      startDate: new Date(),
      endDate: new Date(),
    };
    component.resetSelectedPeriod();
    expect(component.selectedPeriod).toBeUndefined(); // Checks if selectedPeriod is reset
  });

  it('should call createReport method when form is submitted with valid data', async () => {
    spyOn(component, 'createReport').and.returnValue(Promise.resolve()); // Watches the createReport method
    const formMock = { valid: true };
    component.selectedTechnologies = [
      {
        id: 1,
        name: 'Technology',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ]; // Update object to match Technology interface
    component.reportTyp = 'Technologien'; // Sets reportTyp for the test
    component.maxAllowedTechnologies = 1;

    // Act
    await component.onFormSubmit(formMock as NgForm); // Simulates form submission

    // Assert
    expect(component.createReport).toHaveBeenCalled(); // Checks if createReport was called
  });

  it('should not call createReport method when form is submitted with invalid data', async () => {
    spyOn(component, 'createReport'); // Watches the createReport method
    const formMock = { valid: false };

    // Act
    await component.onFormSubmit(formMock as NgForm); // Simulates form submission with invalid data

    // Assert
    expect(component.createReport).not.toHaveBeenCalled(); // Checks if createReport was not called
  });

  it('should set isSubmitting to true when createReport is called', async () => {
    // Arrange
    mockReportService.createTechnologyDetailReport([0], undefined, undefined);

    // Act
    component.createReport();

    // Assert
    expect(component.isSubmitting).toBeTrue(); // Ensure isSubmitting is set to true
  });

  it('should not call createReport method when no items are selected', () => {
    spyOn(component, 'createReport');
    const formMock = { valid: true };
    component.selectedTechnologies = []; // Set selectedItems to an empty array
    component.reportTyp = 'Technologien';
    component.onFormSubmit(formMock as NgForm);
    expect(component.createReport).not.toHaveBeenCalled();
  });

  it('should initialize reportTypList with correct values', () => {
    expect(component.reportTypList.length).toBeGreaterThan(0);
  });

  it('should reset selectedPeriod to undefined', () => {
    component.selectedPeriod = {
      name: 'Bis dato',
      periodDetail: `Gesamter Zeitraum`,
      startDate: new Date(),
      endDate: new Date(),
    };
    component.resetSelectedPeriod();
    expect(component.selectedPeriod).toBeUndefined();
  });

  it('should update selectedPeriod with the provided date range', () => {
    // Arrange
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const dateRange = { startDate, endDate };
    component.selectedPeriod = {
      name: 'Bis dato',
      periodDetail: `Gesamter Zeitraum`,
      startDate: new Date(),
      endDate: new Date(),
    };
    // Act
    component.onDateRangeSelected(dateRange);

    // Assert
    expect(component.selectedPeriod.startDate).toEqual(startDate);
    expect(component.selectedPeriod.endDate).toEqual(endDate);
  });

  it('should set showError to true when onFormSubmit is called with invalid form', () => {
    const formMock = { valid: false };
    component.onFormSubmit(formMock as NgForm);
    expect(component.showError).toBeTrue(); // Ensure showError is set to true
  });

  it('should not call createReport when onFormSubmit is called with invalid form', () => {
    spyOn(component, 'createReport');
    const formMock = { valid: false };
    component.onFormSubmit(formMock as NgForm);
    expect(component.createReport).not.toHaveBeenCalled(); // Ensure createReport was not called
  });

  it('should call createReport when onFormSubmit is called with valid form', () => {
    spyOn(component, 'createReport');
    const formMock = { valid: true };
    component.selectedTechnologies = [
      {
        id: 1,
        name: 'Technology',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];
    component.reportTyp = 'Technologien'; // Set reportTyp for the test
    component.onFormSubmit(formMock as NgForm);
    expect(component.createReport).toHaveBeenCalled(); // Ensure createReport was called
  });

  it('should call createCustomerReport when selectedCustomer and reportType Kunden is', () => {
    spyOn(component, 'createCustomerReport');
    const formMock = { valid: true };
    component.selectedCustomers = [{ id: 1, name: 'Customer' }];
    component.reportTyp = 'Kunden';
    component.onFormSubmit(formMock as NgForm);
    expect(component.createCustomerReport).toHaveBeenCalled();
  });

  it('should show error snackbar and not call createReport when selected Technologies exceed maxAllowedTechnologies', async () => {
    spyOn(component, 'createReport');
    const formMock = { valid: true };

    // set selectedTechnologies to maxAllowedTechnologies + 1
    component.selectedTechnologies = new Array(
      component.maxAllowedTechnologies + 1,
    ).fill({
      id: 1,
      name: 'Technology',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 1,
      status: 1,
      jumpDate: '',
      tags: [],
      projects: [],
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    });

    component.reportTyp = 'Technologien';

    await component.onFormSubmit(formMock as NgForm);

    expect(component.createReport).not.toHaveBeenCalled();
    expect(mockSnackbar.open).toHaveBeenCalledWith(
      `Maximal ${component.maxAllowedTechnologies} Technologien dürfen ausgewählt werden.`,
      'Schließen',
      { duration: 5000 },
    );
  });

  it('should show rate limiting error message when createReport receives HTTP 429 error', async () => {
    component.reportTyp = 'Technologien';
    component.selectedTechnologies = [
      {
        id: 1,
        name: 'Tech1',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];

    // Simuliere HTTP 429 Fehler mit Blob-Response
    const errorBlob = new Blob(
      [JSON.stringify('Zu viele Anfragen. Bitte versuche es später erneut.')],
      { type: 'text/plain' },
    );
    const httpError = new HttpErrorResponse({
      status: 429,
      error: errorBlob,
      statusText: 'Too Many Requests',
    });

    mockReportService.createTechnologyDetailReport.and.returnValue(
      throwError(() => httpError),
    );

    await component.createReport();

    expect(component.isSubmitting).toBeFalse();
    expect(mockSnackbar.open).toHaveBeenCalledWith(
      `Beim Senden des Bug Reports ist ein Fehler aufgetreten`,
    );
  });
});

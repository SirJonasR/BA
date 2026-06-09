import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BugReportComponent } from './bug-report.component';
import { FormsModule, NgForm } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';

/**
 * @description
 * Unit tests for the Bug Report Component.
 * Uses HttpClientTestingModule and HttpTestingController for mocking HTTP requests.
 */
describe('BugReportComponent', () => {
  let component: BugReportComponent;
  let fixture: ComponentFixture<BugReportComponent>;
  let router: Router;
  let mockKeycloakService: jasmine.SpyObj<KeycloakService>;

  /**
   * @description
   * Setup for each test case.
   * Initializes BugReport and mocks Router.
   * Defines Values
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BugReportComponent],
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        Router,
        { provide: KeycloakService, useValue: mockKeycloakService },
      ],
    });

    fixture = TestBed.createComponent(BugReportComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    component.values = {
      mailAddress: 'test@mail.com',
      attachmentData: null,
      attachmentContentType: null,
      attachmentFileName: null,
      description: 'Test description',
      mailType: 'Test',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the expected route when cancel is called', () => {
    // Spy on the navigate method of the router
    const navigateSpy = spyOn(router, 'navigate');

    // Call the cancel method
    component.cancel();

    // Expect that the navigate method was called with the expected route
    expect(navigateSpy).toHaveBeenCalledWith(['../..']);
  });

  it('should acknowledge a file if uploaded', () => {
    const mockEvent = {
      target: {
        files: [
          new File(['fileContent'], 'fileName.png', { type: 'image/png' }),
        ],
      },
    };
    component.onFileSelected(mockEvent as unknown as Event);
    fixture.detectChanges();

    expect(component.values.attachmentContentType).toBeDefined();
    expect(component.values.attachmentData).toBeDefined();
    expect(component.values.attachmentFileName).toBeDefined();
  });

  it('should Return: Ungültiger Dateityp. Erlaubte Dateitypen sind: PDF, PNG, JPG, JPEG', () => {
    spyOn(window, 'alert');
    const mockEvent = {
      target: {
        files: [
          new File(['fileContent'], 'fileName.docx', { type: 'text/plain' }),
        ],
      },
    };
    component.onFileSelected(mockEvent as unknown as Event);
    expect(window.alert).toHaveBeenCalledWith(
      'Ungültiger Dateityp. Erlaubte Dateitypen sind: PDF, PNG, JPG, JPEG',
    );
  });

  it('should alert when the attachment size is too big', () => {
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
    expect(window.alert).toHaveBeenCalledWith(
      'Der Anhang ist zu groß. Max 4mb',
    );
  });

  it('should return early if the form is not valid', async () => {
    component.onSubmit = jasmine
      .createSpy('onSubmit')
      .and.returnValue(Promise.resolve());

    // Create a mock form with valid set to false
    const mockForm = {
      valid: false, // Form is not valid
      dirty: true,
    } as NgForm;

    // Call the onFormSubmit method
    await component.onFormSubmit(mockForm);

    // Ensure that onSubmit was not called
    expect(component.onSubmit).not.toHaveBeenCalled();
  });

  it('should return ', async () => {
    component.onSubmit = jasmine
      .createSpy('onSubmit')
      .and.returnValue(Promise.resolve());

    // Create a mock form with valid set to false
    const mockForm = {
      valid: false, // Form is not valid
      dirty: true,
    } as NgForm;

    // Call the onFormSubmit method
    await component.onFormSubmit(mockForm);

    // Ensure that onSubmit was not called
    expect(component.onSubmit).not.toHaveBeenCalled();
  });

  it('should return Bitte alles ausfüllen when the form is dirty', async () => {
    component.onSubmit = jasmine
      .createSpy('onSubmit')
      .and.returnValue(Promise.resolve());
    const mockForm = {
      valid: true,
      dirty: false,
    } as NgForm; // Hier kannst du den Formzustand anpassen, um verschiedene Fälle zu testen
    const alertSpy = spyOn(window, 'alert');
    await component.onFormSubmit(mockForm);

    expect(alertSpy).toHaveBeenCalledWith('Bitte alles ausfüllen');
  });

  it('should return Bitte gib eine gültige Beschreibung an when the description is empty', async () => {
    component.onSubmit = jasmine
      .createSpy('onSubmit')
      .and.returnValue(Promise.resolve());
    const mockForm = {
      valid: true,
      dirty: true,
    } as NgForm; // Hier kannst du den Formzustand anpassen, um verschiedene Fälle zu testen#
    component.values.description = null;
    const alertSpy = spyOn(window, 'alert');
    await component.onFormSubmit(mockForm);

    expect(alertSpy).toHaveBeenCalledWith(
      'Bitte gib eine gültige Beschreibung an',
    );
  });

  it('should call onSubmit method when the form is submitted', async () => {
    component.checked = true;
    component.onSubmit = jasmine
      .createSpy('onSubmit')
      .and.returnValue(Promise.resolve());
    const mockForm = {
      valid: true,
      dirty: true,
    } as NgForm; // Hier kannst du den Formzustand anpassen, um verschiedene Fälle zu testen
    await component.onFormSubmit(mockForm);

    expect(component.onSubmit).toHaveBeenCalled(); // Überprüfe, ob die Methode aufgerufen wurde
    // Hier kannst du weitere Überprüfungen für den onSubmit-Aufruf hinzufügen
  });
});

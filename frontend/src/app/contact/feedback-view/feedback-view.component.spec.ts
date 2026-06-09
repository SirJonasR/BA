import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackViewComponent } from './feedback-view.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MailService } from 'src/app/services/mail.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { ContactFormRequest } from 'src/app/models/contact.form.request';
import { FormValuesFeedback } from '../feedback/feedback.component';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-feedback',
  template: '',
})
class FeedbackStubComponent {
  @Input() values: unknown;
  @Input() isSubmitting = false;
  @Input() hasError = false;
  @Output() submitForm = new EventEmitter<void>();
}

describe('FeedbackViewComponent', () => {
  let component: FeedbackViewComponent;
  let fixture: ComponentFixture<FeedbackViewComponent>;
  let mockMailService: jasmine.SpyObj<MailService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let router: Router;

  beforeEach(() => {
    mockMailService = jasmine.createSpyObj('MailService', ['sendMail']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      declarations: [FeedbackViewComponent, FeedbackStubComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: MailService, useValue: mockMailService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackViewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });
  it('should handle form submission successfully', fakeAsync(() => {
    const mockResponse: Response = {
      headers: new Headers({ 'Content-Type': 'application/json' }),
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: '/kontakt',
      clone: function (): Response {
        throw new Error('Function not implemented.');
      },
      body: null,
      bodyUsed: false,
      arrayBuffer: function (): Promise<ArrayBuffer> {
        throw new Error('Function not implemented.');
      },
      blob: function (): Promise<Blob> {
        throw new Error('Function not implemented.');
      },
      formData: function (): Promise<FormData> {
        throw new Error('Function not implemented.');
      },
      json: function (): Promise<string> {
        throw new Error('Function not implemented.');
      },
      text: function (): Promise<string> {
        throw new Error('Function not implemented.');
      },
    };

    const mockRequest: ContactFormRequest = {
      description: 'Test Description',
      mailAddress: 'test@email.com',
      attachmentData: null,
      attachmentContentType: ['text/plain'],
      attachmentFileName: ['test.txt'],
      mailType: 'TestMail',
    };

    component.values = mockRequest as FormValuesFeedback;

    mockMailService.sendMail.and.returnValue(of(mockResponse));
    const navigateSpy = spyOn(router, 'navigate');

    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(false);
    expect(mockMailService.sendMail).toHaveBeenCalledWith(mockRequest);
    expect(navigateSpy).toHaveBeenCalledWith([`../..`]);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Das Feedback wurde erfolgreich abgesendet`,
    );
  }));

  it('should handle form submission error', fakeAsync(() => {
    const mockError = new Error('An error occurred');

    mockMailService.sendMail.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(mockError);
      }),
    );

    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.hasError).toBe(true);
  }));
});

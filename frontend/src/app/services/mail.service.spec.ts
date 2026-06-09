import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MailService } from './mail.service';
import { ContactFormRequest } from 'src/app/models/contact.form.request';

/**
 * @description
 * Unit tests for the History Service class.
 * Uses HttpClientTestingModule and HttpTestingController for mocking HTTP requests.
 */
describe('MailService', () => {
  let mailService: MailService;
  let httpTestingController: HttpTestingController;

  /**
   * @description
   * Setup for each test case.
   * Initializes MailService and mocks HTTP client.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MailService],
    });

    mailService = TestBed.inject(MailService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  /**
   * Tests if MailService has been created
   */
  it('should be created', () => {
    expect(mailService).toBeTruthy();
  });

  /**
   * Creates a MailRequest and tests if Mail can be send
   */
  it('should send mail successfully', () => {
    const mailRequest: ContactFormRequest = {
      description: 'Test Mail',
      mailAddress: 'test@example.com',
      mailType: 'Test',
      attachmentData: ['testData'],
      attachmentFileName: ['TestFileName'],
      attachmentContentType: ['TestContentType'],
    };

    mailService.sendMail(mailRequest).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`${mailService['mailUrl']}`);
    expect(req.request.method).toEqual('POST');
    req.flush({});

    httpTestingController.verify();
  });

  /**
   * Tests if an Error is handled correctly
   */
  it('should handle errors when sending mail', () => {
    const mailRequest: ContactFormRequest = {
      description: 'Test Mail',
      mailAddress: 'test@example.com',
      mailType: 'Test',
      attachmentData: null,
      attachmentFileName: null,
      attachmentContentType: null,
    };

    mailService.sendMail(mailRequest).subscribe({
      next: () => {
        // This should not be called in case of an error.
        expect(true).toBeFalse();
      },
      error: (error) => {
        expect(error).toBeTruthy();
      },
      complete: () => {
        // This should not be called in case of an error.
        expect(true).toBeFalse();
      },
    });

    const req = httpTestingController.expectOne(`${mailService['mailUrl']}`);
    expect(req.request.method).toEqual('POST');
    req.error(new ProgressEvent('Network error'));

    httpTestingController.verify();
  });
});

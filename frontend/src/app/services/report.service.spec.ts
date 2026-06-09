import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportService],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call createTechnologyDetailReport with correct parameters and return a blob', () => {
    const technologyIds: number[] = [1, 2, 3];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    const mockBlob = new Blob(); // Mock blob response

    service
      .createTechnologyDetailReport(technologyIds, startDate, endDate)
      .subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
      });

    const mockRequest = httpMock.expectOne(
      (request) =>
        request.url === `${service['reportUrl']}/technologyDetailReport` &&
        request.method === 'POST' &&
        request.headers.get('Content-Type') === 'application/json' &&
        request.headers.get('Accept') === 'application/pdf',
    );

    expect(mockRequest.request.body).toEqual({
      technologyIds,
      startDate,
      endDate,
    });
    mockRequest.flush(mockBlob);
  });

  it('should call createCustomerStatsReport with correct parameters and return a blob', () => {
    const customerNames = ['Customer1', 'Customer2'];
    const mockBlob = new Blob();
    service.createCustomerStatsReport(customerNames).subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const mockRequest = httpMock.expectOne(
      (request) =>
        request.url === `${service['reportUrl']}/customerStatsReport` &&
        request.method === 'POST' &&
        request.headers.get('Content-Type') === 'application/json' &&
        request.headers.get('Accept') === 'application/pdf',
    );

    expect(mockRequest.request.body).toEqual({
      customerNames,
    });
    mockRequest.flush(mockBlob);
  });

  it('should download a PDF file', () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

    // Spy on window.URL.createObjectURL to mock its behavior
    const createObjectURLSpy = spyOn(
      window.URL,
      'createObjectURL',
    ).and.callFake(() => 'mock-url');

    // Spy on document.createElement to mock its behavior
    const createElementSpy = spyOn(document, 'createElement').and.callThrough();

    // Call the downloadPDF method
    service.downloadPDF(mockBlob, 'technologyDetailReport.pdf');

    // Expectations
    expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    const anchor = createElementSpy.calls.mostRecent()
      .returnValue as HTMLAnchorElement | null;
    expect(anchor).toBeTruthy(); // Ensure anchor is not null
    if (anchor) {
      expect(anchor.getAttribute('download')).toBe(
        'technologyDetailReport.pdf',
      );
    } else {
      fail('Anchor element was not created');
    }
  });
});

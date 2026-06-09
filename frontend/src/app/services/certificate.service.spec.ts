import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CertificateService } from './certificate.service';
import { environment } from 'src/environments/environment';

describe('CustomerService', () => {
  let service: CertificateService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CertificateService],
    });
    service = TestBed.inject(CertificateService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a list of certificates', () => {
    const mockCertificates = [
      {
        id: 1,
        name: 'Certificate 1',
        description: '',
        prerequisites: [],
        followUps: [],
      },
      {
        id: 2,
        name: 'Certificate 2',
        description: '',
        prerequisites: [],
        followUps: [],
      },
    ];

    service.getCertificates().subscribe((certificates) => {
      expect(certificates).toEqual(mockCertificates);
    });

    const req = httpTestingController.expectOne(
      environment.apiUrl + '/certificate',
    );
    expect(req.request.method).toEqual('GET');

    req.flush(mockCertificates);

    httpTestingController.verify();
  });
});

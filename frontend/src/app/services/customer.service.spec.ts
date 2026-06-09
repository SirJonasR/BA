import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { environment } from 'src/environments/environment';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService],
    });
    service = TestBed.inject(CustomerService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a list of customers', () => {
    const mockCustomers = [
      { id: 1, name: 'Customer 1' },
      { id: 2, name: 'Customer 2' },
    ];

    service.getCustomers().subscribe((customers) => {
      expect(customers).toEqual(mockCustomers);
    });

    const req = httpTestingController.expectOne(
      environment.apiUrl + '/customer',
    );
    expect(req.request.method).toEqual('GET');

    req.flush(mockCustomers);

    httpTestingController.verify();
  });
});

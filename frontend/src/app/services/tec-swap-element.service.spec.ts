import { TestBed } from '@angular/core/testing';

import { TecSwapService } from './tec-swap-element.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TecSwapElement } from 'src/app/models/technology';
import { environment } from 'src/environments/environment';

describe('TecSwapElementService', () => {
  let service: TecSwapService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TecSwapService],
    });
    service = TestBed.inject(TecSwapService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a list of all tecSwap-elements', () => {
    const mockTecSwapElements: TecSwapElement[] = [
      {
        id: 1,
        tecSwap: 'tecSwap',
      } as TecSwapElement,
      {
        id: 2,
        tecSwap: 'tecSwap',
      } as TecSwapElement,
    ];

    service.getAll().subscribe((tecSwaps) => {
      expect(tecSwaps).toEqual(mockTecSwapElements);
    });

    const req = httpTestingController.expectOne(
      environment.apiUrl + '/tec_swap',
    );
    expect(req.request.method).toEqual('GET');
    req.flush(mockTecSwapElements);
    httpTestingController.verify();
  });

  it('should update tecSwapElement', () => {
    const mockTecSwapElement: TecSwapElement = {
      id: 1,
      tecSwap: 'tecSwap',
    } as TecSwapElement;

    service.update(1, mockTecSwapElement).subscribe((tecSwap) => {
      expect(tecSwap).toEqual(mockTecSwapElement);
    });
    const req = httpTestingController.expectOne(
      environment.apiUrl + '/tec_swap/' + 1,
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockTecSwapElement);
    httpTestingController.verify();
  });
});

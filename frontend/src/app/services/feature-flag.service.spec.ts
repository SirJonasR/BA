import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  FeatureFlagService,
  FeatureFlag,
} from 'src/app/services/feature-flag.service';
import { environment } from 'src/environments/environment';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/feature-flags`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeatureFlagService],
    });
    service = TestBed.inject(FeatureFlagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFeatureFlags', () => {
    it('should return an Observable<FeatureFlag[]>', () => {
      const mockFlags: FeatureFlag[] = [{ name: 'testFlag', enabled: true }];

      service.getFeatureFlags().subscribe((flags) => {
        expect(flags.length).toBe(1);
        expect(flags).toEqual(mockFlags);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockFlags);
    });
  });

  describe('init', () => {
    it('should fetch feature flags and initialize the flags map', async () => {
      const mockFlags: FeatureFlag[] = [
        { name: 'flagA', enabled: true },
        { name: 'flagB', enabled: false },
      ];

      const promise = service.init();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockFlags);

      await promise;

      expect(service.isEnabled('flagA')).toBe(true);
      expect(service.isEnabled('flagB')).toBe(false);
    });

    it('should not make a second http call if already initialized', async () => {
      const mockFlags: FeatureFlag[] = [{ name: 'flagA', enabled: true }];
      // first call
      const initPromise = service.init();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockFlags);
      await initPromise;

      // second call
      await service.init();
      httpMock.expectNone(apiUrl); // No new request
    });
  });

  describe('isEnabled', () => {
    it('should return the correct value for a flag after init', async () => {
      const mockFlags: FeatureFlag[] = [{ name: 'test', enabled: true }];
      const initPromise = service.init();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockFlags);
      await initPromise;

      expect(service.isEnabled('test')).toBe(true);
    });

    it('should return false for a non-existent flag', async () => {
      const mockFlags: FeatureFlag[] = [{ name: 'test', enabled: true }];
      const initPromise = service.init();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockFlags);
      await initPromise;

      expect(service.isEnabled('non-existent')).toBe(false);
    });

    it('should return false before init is complete', () => {
      expect(service.isEnabled('anyFlag')).toBe(false);
    });
  });

  describe('updateFeatureFlag', () => {
    it('should send a PUT request to update a feature flag', () => {
      const flagName = 'testFlag';
      const isEnabled = true;
      const mockResponse: FeatureFlag = { name: flagName, enabled: isEnabled };

      service.updateFeatureFlag(flagName, isEnabled).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${flagName}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ enabled: isEnabled });
      req.flush(mockResponse);
    });
  });
});

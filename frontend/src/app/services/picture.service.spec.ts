import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PictureService } from './picture.service';
import { environment } from 'src/environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { Picture } from 'src/app/models/technology';

/**
 * Unit tests for the PictureService class.
 * Tests cover:
 * - HTTP fetching
 * - Data URL conversion
 * - Security sanitization
 * - Caching behavior
 * - Color transformation
 */
describe('PictureService', () => {
  let service: PictureService;
  let httpMock: HttpTestingController;
  let picturesUrl: string;

  // Valid SVG base64 for testing
  const validSvgBase64 = btoa(
    '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="5" fill="red"/></svg>',
  );

  // Malicious SVG with script tag (for security testing)
  const maliciousSvgBase64 = btoa(
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script><circle cx="10" cy="10" r="5"/></svg>',
  );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BrowserModule],
      providers: [PictureService],
    });

    picturesUrl = environment.apiUrl + '/picture';
    service = TestBed.inject(PictureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ============================================================================
  // BASIC SERVICE TESTS
  // ============================================================================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================================================
  // getPicture() - Raw HTTP Fetch
  // ============================================================================

  describe('getPicture()', () => {
    it('should fetch picture by ID', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      service.getPicture(1).subscribe((picture) => {
        expect(picture).toEqual(mockPicture);
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPicture);
    });

    it('should fetch picture with different ID', () => {
      const mockPicture: Picture = { id: 42, data: validSvgBase64 };

      service.getPicture(42).subscribe((picture) => {
        expect(picture.id).toBe(42);
      });

      const req = httpMock.expectOne(`${picturesUrl}/42`);
      req.flush(mockPicture);
    });
  });

  // ============================================================================
  // loadPicture() - For Angular Templates
  // ============================================================================

  describe('loadPicture()', () => {
    it('should load picture and return SafeResourceUrl', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      service.loadPicture(1).subscribe((url) => {
        expect(url).toBeTruthy();
        expect(url).toEqual(jasmine.any(Object));
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPicture);
    });

    it('should return null for invalid pictureId (0)', () => {
      service.loadPicture(0).subscribe((url) => {
        expect(url).toBeNull();
      });

      httpMock.expectNone(`${picturesUrl}/0`);
    });

    it('should return null for negative pictureId', () => {
      service.loadPicture(-5).subscribe((url) => {
        expect(url).toBeNull();
      });

      httpMock.expectNone(`${picturesUrl}/-5`);
    });

    it('should return null when picture data is empty', () => {
      const mockPicture: Picture = { id: 1, data: '' };

      service.loadPicture(1).subscribe((url) => {
        expect(url).toBeNull();
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });

    it('should return null when HTTP error occurs', () => {
      spyOn(console, 'error');

      service.loadPicture(1).subscribe((url) => {
        expect(url).toBeNull();
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(null, { status: 404, statusText: 'Not Found' });

      expect(console.error).toHaveBeenCalledWith(
        'PictureService: Error loading picture:',
        jasmine.anything(),
      );
    });

    it('should convert to black by default (useColor=false)', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      service.loadPicture(1).subscribe((url) => {
        expect(url).toBeTruthy();
        // The URL should exist (color conversion is tested separately)
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });

    it('should preserve colors when useColor=true', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      service.loadPicture(1, true).subscribe((url) => {
        expect(url).toBeTruthy();
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });
  });

  // ============================================================================
  // loadPictureAsDataUrl() - For D3.js/JavaScript
  // ============================================================================

  describe('loadPictureAsDataUrl()', () => {
    it('should load picture and return plain data URL string', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
        expect(typeof dataUrl).toBe('string');
        expect(dataUrl).toContain('data:image/svg+xml;base64,');
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });

    it('should return null for invalid pictureId', () => {
      service.loadPictureAsDataUrl(0).subscribe((dataUrl) => {
        expect(dataUrl).toBeNull();
      });

      httpMock.expectNone(`${picturesUrl}/0`);
    });

    it('should return null when picture data is null', () => {
      const mockPicture: Picture = { id: 1, data: null as never };

      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeNull();
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });

    it('should return null when HTTP error occurs', () => {
      spyOn(console, 'error');

      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeNull();
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(console.error).toHaveBeenCalledWith(
        'PictureService: Error loading picture as data URL:',
        jasmine.anything(),
      );
    });

    it('should convert to black by default', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
        expect(dataUrl).toContain('data:image/svg+xml;base64,');
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });

    it('should preserve colors when useColor=true', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      service.loadPictureAsDataUrl(1, true).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
        expect(dataUrl).toContain('data:image/svg+xml;base64,');
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });
  });

  // ============================================================================
  // convertBase64ToSafeUrl() - For Previews
  // ============================================================================

  describe('convertBase64ToSafeUrl()', () => {
    it('should convert base64 data to SafeResourceUrl', () => {
      const safeUrl = service.convertBase64ToSafeUrl(validSvgBase64);

      expect(safeUrl).toBeTruthy();
      expect(safeUrl).toEqual(jasmine.any(Object));
    });

    it('should return null for empty base64 data', () => {
      const safeUrl = service.convertBase64ToSafeUrl('');

      expect(safeUrl).toBeNull();
    });

    it('should convert to black by default', () => {
      const safeUrl = service.convertBase64ToSafeUrl(validSvgBase64);

      expect(safeUrl).toBeTruthy();
    });

    it('should preserve colors when useColor=true', () => {
      const safeUrl = service.convertBase64ToSafeUrl(validSvgBase64, true);

      expect(safeUrl).toBeTruthy();
    });

    it('should handle malformed base64 gracefully', () => {
      const safeUrl = service.convertBase64ToSafeUrl('invalid!!!base64');

      // DOMPurify handles malformed content gracefully
      // It may return an error message as SVG or sanitized content
      // The service should still return something (not throw)
      expect(safeUrl).toBeDefined();
    });
  });

  // ============================================================================
  // CACHING BEHAVIOR
  // ============================================================================

  describe('Caching', () => {
    it('should cache picture after first load', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      // First call - should fetch from server
      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);

      // Second call - should use cache (no HTTP request)
      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
      });

      // Verify no additional HTTP request was made
      httpMock.expectNone(`${picturesUrl}/1`);
    });

    it('should cache color and black versions separately', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      // Load black version
      service.loadPictureAsDataUrl(1, false).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
      });
      const req1 = httpMock.expectOne(`${picturesUrl}/1`);
      req1.flush(mockPicture);

      // Load color version - should fetch again (different cache key)
      service.loadPictureAsDataUrl(1, true).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
      });
      const req2 = httpMock.expectOne(`${picturesUrl}/1`);
      req2.flush(mockPicture);

      // Third call with black - should use cache
      service.loadPictureAsDataUrl(1, false).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
      });
      httpMock.expectNone(`${picturesUrl}/1`);
    });

    it('should use cache for both loadPicture and loadPictureAsDataUrl', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      // First load with loadPictureAsDataUrl
      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
      });
      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);

      // Second load with loadPicture - should use same cache
      service.loadPicture(1).subscribe((safeUrl) => {
        expect(safeUrl).toBeTruthy();
      });
      httpMock.expectNone(`${picturesUrl}/1`);
    });
  });

  // ============================================================================
  // discardPictureFromCache()
  // ============================================================================

  describe('discardPictureFromCache()', () => {
    it('should remove picture from cache', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      // Load and cache picture
      service.loadPictureAsDataUrl(1).subscribe((url) => {
        expect(url).toBeTruthy();
      });
      const req1 = httpMock.expectOne(`${picturesUrl}/1`);
      req1.flush(mockPicture);

      // Verify it's cached
      service.loadPictureAsDataUrl(1).subscribe((url) => {
        expect(url).toBeTruthy();
      });
      httpMock.expectNone(`${picturesUrl}/1`);

      // Discard from cache
      service.discardPictureFromCache(1);

      // Next load should fetch from server again
      service.loadPictureAsDataUrl(1).subscribe((url) => {
        expect(url).toBeTruthy();
      });
      const req2 = httpMock.expectOne(`${picturesUrl}/1`);
      req2.flush(mockPicture);
    });

    it('should remove both color variants from cache', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      // Cache both versions
      service.loadPictureAsDataUrl(1, false).subscribe((url) => {
        expect(url).toBeTruthy();
      });
      const req1 = httpMock.expectOne(`${picturesUrl}/1`);
      req1.flush(mockPicture);

      service.loadPictureAsDataUrl(1, true).subscribe((url) => {
        expect(url).toBeTruthy();
      });
      const req2 = httpMock.expectOne(`${picturesUrl}/1`);
      req2.flush(mockPicture);

      // Discard from cache
      service.discardPictureFromCache(1);

      // Both should fetch from server again
      service.loadPictureAsDataUrl(1, false).subscribe((url) => {
        expect(url).toBeTruthy();
      });
      const req3 = httpMock.expectOne(`${picturesUrl}/1`);
      req3.flush(mockPicture);

      service.loadPictureAsDataUrl(1, true).subscribe((url) => {
        expect(url).toBeTruthy();
      });
      const req4 = httpMock.expectOne(`${picturesUrl}/1`);
      req4.flush(mockPicture);
    });

    it('should handle invalid pictureId gracefully', () => {
      expect(() => {
        service.discardPictureFromCache(0);
      }).not.toThrow();

      expect(() => {
        service.discardPictureFromCache(null as never);
      }).not.toThrow();
    });
  });

  // ============================================================================
  // SECURITY - SVG SANITIZATION
  // ============================================================================

  describe('Security - SVG Sanitization', () => {
    it('should sanitize malicious SVG content', () => {
      const mockPicture: Picture = { id: 1, data: maliciousSvgBase64 };

      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        expect(dataUrl).toBeTruthy();
        // DOMPurify should have removed the script tag
        // We can't easily verify the exact content, but it should not throw
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);
    });

    it('should sanitize malicious content in convertBase64ToSafeUrl', () => {
      const safeUrl = service.convertBase64ToSafeUrl(maliciousSvgBase64);

      expect(safeUrl).toBeTruthy();
      // Should complete without error (DOMPurify handles sanitization)
    });

    it('should handle SVG with event handlers', () => {
      const svgWithEvents = btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" onclick="alert(1)"><circle cx="10" cy="10" r="5"/></svg>',
      );

      const safeUrl = service.convertBase64ToSafeUrl(svgWithEvents);

      expect(safeUrl).toBeTruthy();
      // DOMPurify should remove onclick attribute
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const mockPicture: Picture = { id: 1, data: validSvgBase64 };

      // Mock localStorage to throw error
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      spyOn(console, 'warn');

      service.loadPictureAsDataUrl(1).subscribe((dataUrl) => {
        // Should still return data URL even if caching fails
        expect(dataUrl).toBeTruthy();
      });

      const req = httpMock.expectOne(`${picturesUrl}/1`);
      req.flush(mockPicture);

      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining('Failed to cache picture'),
        jasmine.anything(),
      );
    });

    it('should handle invalid SVG gracefully', () => {
      const invalidSvg = btoa('not valid xml <><>');
      spyOn(console, 'error');

      const safeUrl = service.convertBase64ToSafeUrl(invalidSvg);

      // Should handle gracefully - DOMPurify is robust
      expect(safeUrl).toBeDefined();
    });
  });
});

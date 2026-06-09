import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Buffer } from 'buffer';
import * as DOMPurify from 'dompurify';
import { environment } from 'src/environments/environment';
import { Picture } from 'src/app/models/technology';

/**
 * Service for loading, caching and transforming icons
 */
@Injectable({
  providedIn: 'root',
})
export class PictureService {
  private picturesUrl = environment.apiUrl + '/picture';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  // ============================================================================
  // PUBLIC SERVICE FUNCTIONS
  // ============================================================================

  /**
   * Load picture for use in Angular templates (returns SafeResourceUrl)
   *
   * @param pictureId - The ID of the picture to load
   * @param shouldUseColor - Whether to preserve original colors (default: false = convert to black)
   * @returns Observable<SafeResourceUrl | null> - Sanitized URL for img src binding
   */
  loadPicture(
    pictureId: number,
    shouldUseColor = false,
  ): Observable<SafeResourceUrl | null> {
    if (!pictureId || pictureId <= 0) {
      return of(null);
    }

    // Check cache first
    const cached = this.getCachedPicture(pictureId, shouldUseColor);
    if (cached) {
      return of(this.createSafeUrl(cached));
    }

    // Fetch from server
    return this.getPicture(pictureId).pipe(
      map((picture) => {
        if (picture && picture.data !== '') {
          const dataUrl = this.convertToDataUrl(picture.data, shouldUseColor);
          if (dataUrl) {
            this.cachePicture(pictureId, shouldUseColor, dataUrl);
            return this.createSafeUrl(dataUrl);
          }
        }
        return null;
      }),
      catchError((error) => {
        console.error('PictureService: Error loading picture:', error);
        return of(null);
      }),
    );
  }

  /**
   * Load picture as plain data URL string for use in D3.js/JavaScript
   *
   * @param pictureId - The ID of the picture to load
   * @param shouldUseColor - Whether to preserve original colors (default: false = convert to black)
   * @returns Observable<string | null> - Plain data URL string
   */
  loadPictureAsDataUrl(
    pictureId: number,
    shouldUseColor = false,
  ): Observable<string | null> {
    if (!pictureId || pictureId <= 0) {
      return of(null);
    }

    // Check cache first
    const cached = this.getCachedPicture(pictureId, shouldUseColor);
    if (cached) {
      return of(cached);
    }

    // Fetch from server
    return this.getPicture(pictureId).pipe(
      map((picture) => {
        if (picture && picture.data !== null) {
          const dataUrl = this.convertToDataUrl(picture.data, shouldUseColor);
          if (dataUrl) {
            this.cachePicture(pictureId, shouldUseColor, dataUrl);
          }
          return dataUrl;
        }
        return null;
      }),
      catchError((error) => {
        console.error(
          'PictureService: Error loading picture as data URL:',
          error,
        );
        return of(null);
      }),
    );
  }

  /**
   * Remove picture from cache
   *
   * @param pictureId - The ID of the picture to remove from cache
   */
  discardPictureFromCache(pictureId: number): void {
    if (pictureId != null && pictureId) {
      localStorage.removeItem(this.getCacheKey(pictureId, false));
      localStorage.removeItem(this.getCacheKey(pictureId, true));
    }
  }

  /**
   * Fetch raw picture data from server
   *
   * @param pictureId - The ID of the picture to fetch
   * @returns Observable<Picture> - Raw picture object from server
   */
  getPicture(pictureId: number): Observable<Picture> {
    const url = `${this.picturesUrl}/${pictureId}`;
    return this.http.get<Picture>(url, this.httpOptions);
  }

  /**
   * Convert raw base64 picture data to data URL (for previews)
   * @param base64Data - Base64 encoded picture data
   * @param useColor - Whether to preserve colors or convert to black (default: false)
   * @returns SafeResourceUrl for use in Angular templates
   */
  convertBase64ToSafeUrl(
    base64Data: string,
    useColor = false,
  ): SafeResourceUrl | null {
    const dataUrl = this.convertToDataUrl(base64Data, useColor);
    return dataUrl ? this.createSafeUrl(dataUrl) : null;
  }

  // ============================================================================
  // PRIVATE
  // ============================================================================

  /**
   * Convert base64 picture data to sanitized data URL
   * @param pictureData - Base64 encoded picture data from server
   * @param useColor - Whether to preserve colors or convert to black
   * @returns Sanitized data URL string or null on error
   */
  private convertToDataUrl(
    pictureData: string,
    useColor: boolean,
  ): string | null {
    if (!pictureData) {
      return null;
    }

    try {
      // Decode base64 to SVG string
      const svgString = Buffer.from(pictureData, 'base64').toString();

      // Apply color transformation if requested
      const processedSvg = useColor
        ? svgString
        : this.convertSvgToBlack(svgString);

      // SECURITY: Sanitize with DOMPurify to remove any malicious content
      const sanitizedSvg = DOMPurify.sanitize(processedSvg);

      // Encode to base64 for data URL
      const base64Svg = btoa(sanitizedSvg);

      return `data:image/svg+xml;base64,${base64Svg}`;
    } catch (error) {
      console.error(
        'PictureService: Error converting picture to data URL:',
        error,
      );
      return null;
    }
  }

  /**
   * Create Angular SafeResourceUrl from data URL
   * Should only be called AFTER sanitization
   */
  private createSafeUrl(dataUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
  }

  /**
   * Convert SVG to black-only version while preserving white/transparent
   * @param svgString - SVG as string
   * @returns Modified SVG string with colors converted to black
   */
  private convertSvgToBlack(svgString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    // Helper: Check if color should remain unchanged
    const shouldKeepColor = (color: string): boolean => {
      if (!color) return false;
      const normalized = color.trim().toLowerCase();
      return (
        normalized === '#ffffff' ||
        normalized === 'white' ||
        normalized === 'none' ||
        normalized === '#fff' ||
        normalized === 'transparent'
      );
    };

    // Process CSS styles in <style> tags
    const styleElements = doc.querySelectorAll('style');
    styleElements.forEach((styleElement) => {
      let cssText = styleElement.textContent || '';

      // Replace fill colors in CSS rules, preserve white/transparent/none
      cssText = cssText.replace(
        /fill\s*:\s*([^;}\s]+)/gi,
        (match, colorValue) => {
          const color = colorValue.trim();
          return shouldKeepColor(color) ? match : 'fill:black';
        },
      );

      // Replace stroke colors in CSS rules, preserve white/transparent/none
      cssText = cssText.replace(
        /stroke\s*:\s*([^;}\s]+)/gi,
        (match, colorValue) => {
          const color = colorValue.trim();
          return shouldKeepColor(color) ? match : 'stroke:black';
        },
      );

      styleElement.textContent = cssText;
    });

    // Process individual element attributes
    doc.querySelectorAll('*').forEach((element) => {
      // Handle fill attribute
      const fill = element.getAttribute('fill')?.trim().toLowerCase();
      if (fill && !shouldKeepColor(fill)) {
        element.setAttribute('fill', 'black');
      }

      // Handle stroke attribute
      const stroke = element.getAttribute('stroke');
      if (stroke && !shouldKeepColor(stroke)) {
        element.setAttribute('stroke', 'black');
      }

      // Handle style attribute
      const style = element.getAttribute('style');
      if (style) {
        const styles = style.split(';').map((s) => s.trim());
        const fillIndex = styles.findIndex((s) => s.startsWith('fill:'));
        if (fillIndex !== -1) {
          const fillStyle = styles[fillIndex];
          const value = fillStyle.split(':').map((s) => s.trim())[1];
          if (
            value !== '#ffffff' &&
            value !== 'white' &&
            value !== 'none' &&
            value !== '#fff' &&
            value !== 'transparent'
          ) {
            styles[fillIndex] = 'fill:black';
          }
        }
        element.setAttribute('style', styles.join(';'));
      }
    });

    // Convert back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }

  /**
   * Get standardized cache key
   * Format: "picture:{pictureId}:{color|black}"
   */
  private getCacheKey(pictureId: number, useColor: boolean): string {
    return `picture:${pictureId}:${useColor ? 'color' : 'black'}`;
  }

  /**
   * Get cached picture data URL
   */
  private getCachedPicture(
    pictureId: number,
    useColor: boolean,
  ): string | null {
    const key = this.getCacheKey(pictureId, useColor);
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('PictureService: Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Cache picture data URL
   */
  private cachePicture(
    pictureId: number,
    useColor: boolean,
    dataUrl: string,
  ): void {
    const key = this.getCacheKey(pictureId, useColor);
    try {
      localStorage.setItem(key, dataUrl);
    } catch (error) {
      console.warn(
        'PictureService: Failed to cache picture (localStorage full?):',
        error,
      );
      // Non-fatal error - service continues without caching
    }
  }
}

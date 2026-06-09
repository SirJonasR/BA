import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { Technology, Category, Lifecycle } from 'src/app/models/technology';
import { take, map } from 'rxjs/operators';
import { of, forkJoin, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RadarMathService } from './services/radar-math.service';
import { RadarNavigationService } from './services/radar-navigation.service';
import { RadarDataService } from './services/radar-data.service';
import { ThemeService } from '../../../theming';

import { unified_radar_visualization } from './utils/radar-visualization.js';

import {
  RadarSettings,
  RadarEntry,
} from './models/radar-visualization.interfaces';

@Component({
  selector: 'app-radar-visualization',
  templateUrl: './radar-visualization.component.html',
  styleUrls: ['./radar-visualization.component.css'],
})
export class RadarVisualizationComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('radarSvg', { static: true }) radarSvg!: ElementRef<SVGElement>;
  @ViewChild('radarWrapper', { static: true })
  radarWrapper!: ElementRef<HTMLDivElement>;

  @Input() technologies: Technology[] = [];
  @Input() categories: Category[] = [];
  @Input() lifecycles: Lifecycle[] = [];
  @Input() settings: RadarSettings = {
    showIcons: false,
    showFullNames: false,
    showIconsInColor: false,
    radarRadius: 450,
    blipRadius: 21,
    maxWindowHeightPct: 0.9,
    animationsEnabled: true,
    responsiveMode: true,
    accessibilityMode: true,
    performanceMode: false,
    debugMode: false,
    dynamicSectors: true,
  };

  // Remove output events - navigation handled internally

  private visualizationInstance: unknown = null;
  private resizeObserver: ResizeObserver | null = null;
  private readonly ASPECT_RATIO = 1500 / 1050; // Original viewBox aspect ratio

  // Slice detail state management - moved from container
  private sliceDetailActive = false;
  private currentSliceIndex: number | null = null;

  // Performance optimization: debounce resize operations
  private resizeTimeoutId: number | null = null;
  private readonly RESIZE_DEBOUNCE_MS = 8; // ~60fps (16ms) 120fps (8ms)
  private lastKnownSize: { width: number; height: number } | null = null;

  // Animation state tracking
  private isInitialRender = true;
  private hasRenderedOnce = false;

  // Theme subscription
  private themeSubscription: Subscription | null = null;

  // Scroll passthrough: allows page scrolling while hovering over the SVG
  private scrollPassthroughListener: ((e: WheelEvent) => void) | null = null;

  constructor(
    private radarMathService: RadarMathService,
    private radarNavigationService: RadarNavigationService,
    private radarDataService: RadarDataService,
    private renderer: Renderer2,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.setupNavigationEvents();
    this.setupResizeHandling();
    this.setupThemeChangeDetection();
  }

  ngAfterViewInit(): void {
    this.setupScrollPassthrough();
    // Initial render after view is initialized
    // Add small delay to ensure data is available
    setTimeout(() => {
      if (!this.hasRenderedOnce) {
        this.renderRadar(false); // Initial render, not a filter change
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Skip if this is the initial data load happening before or during ngAfterViewInit
    if (!this.hasRenderedOnce && this.isInitialRender) {
      return;
    }

    // Re-render when inputs change
    if (
      changes['technologies'] ||
      changes['categories'] ||
      changes['lifecycles'] ||
      changes['settings']
    ) {
      const isTechnologyFilterChange = this.isContentBasedFilterChange(changes);
      this.renderRadar(isTechnologyFilterChange);
    }
  }

  /**
   * IMPROVED: Content-based filter change detection
   * Determines if this is a filter change vs. fundamental data change
   */
  private isContentBasedFilterChange(changes: SimpleChanges): boolean {
    // Must be only technology change, not other fundamental changes
    if (changes['categories'] || changes['lifecycles'] || changes['settings']) {
      return false;
    }

    // Must have rendered at least once
    if (!this.hasRenderedOnce || this.isInitialRender) {
      return false;
    }

    // Must be a technology change
    if (!changes['technologies']) {
      return false;
    }

    const techChange = changes['technologies'];

    // If we don't have previous value, it's not a filter change
    if (!techChange.previousValue || !techChange.currentValue) {
      return false;
    }

    // Compare category and lifecycle sets to confirm it's just filtering
    const prevCategoryIds = new Set(
      techChange.previousValue.map((t: Technology) => t.categoryId),
    );
    const currCategoryIds = new Set(
      techChange.currentValue.map((t: Technology) => t.categoryId),
    );

    const prevLifecycleIds = new Set(
      techChange.previousValue.map((t: Technology) => t.lifecycleId),
    );
    const currLifecycleIds = new Set(
      techChange.currentValue.map((t: Technology) => t.lifecycleId),
    );

    // If category or lifecycle sets changed significantly, it's not just a filter
    const isCategorySetChanged =
      prevCategoryIds.size !== currCategoryIds.size ||
      ![...prevCategoryIds].every((id) => currCategoryIds.has(id));

    const isLifecycleSetChanged =
      prevLifecycleIds.size !== currLifecycleIds.size ||
      ![...prevLifecycleIds].every((id) => currLifecycleIds.has(id));

    // It's a filter change if we just reduced the set without changing fundamental structure
    return (
      !isCategorySetChanged &&
      !isLifecycleSetChanged &&
      techChange.currentValue.length <= techChange.previousValue.length
    );
  }

  ngOnDestroy(): void {
    this.cleanupResizeHandling();
    this.cleanupExistingVisualization();
    this.cleanupThemeSubscription();
    this.cleanupScrollPassthrough();

    // Reset state for potential re-initialization
    this.isInitialRender = true;
    this.hasRenderedOnce = false;
  }

  /**
   * Setup theme change detection to update colors without full re-render
   */
  private setupThemeChangeDetection(): void {
    this.themeSubscription = this.themeService.theme$.subscribe(() => {
      // Only update colors if visualization is already rendered
      if (this.hasRenderedOnce && this.visualizationInstance) {
        // Use requestAnimationFrame to ensure DOM/CSS is updated before reading values
        requestAnimationFrame(() => {
          this.updateRadarColors();
        });
      }
    });
  }

  /**
   * Update radar colors dynamically without triggering animations or full re-render
   */
  private updateRadarColors(): void {
    if (
      !this.visualizationInstance ||
      typeof this.visualizationInstance !== 'object'
    ) {
      return;
    }

    const instance = this.visualizationInstance as Record<string, unknown>;

    // Call updateColors method if available on visualization instance
    if (
      instance['updateColors'] &&
      typeof instance['updateColors'] === 'function'
    ) {
      (instance['updateColors'] as () => void)();
    }
  }

  /**
   * Cleanup theme subscription
   */
  private cleanupThemeSubscription(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
      this.themeSubscription = null;
    }
  }

  /**
   * Allows the page to scroll normally when the mouse is over the radar SVG.
   * The listener is placed on the wrapper div to catch events from all child elements
   * (SVG, overlapping containers, blips, etc.) that would otherwise block page scrolling.
   */
  private setupScrollPassthrough(): void {
    const wrapperEl = this.radarWrapper?.nativeElement;
    if (!wrapperEl) {
      return;
    }

    this.scrollPassthroughListener = (event: WheelEvent): void => {
      event.preventDefault();
      window.scrollBy({
        top: event.deltaY,
        left: event.deltaX,
        behavior: 'auto',
      });
    };

    wrapperEl.addEventListener('wheel', this.scrollPassthroughListener, {
      passive: false,
    });
  }

  /**
   * Removes the scroll passthrough listener from the wrapper element.
   */
  private cleanupScrollPassthrough(): void {
    const wrapperEl = this.radarWrapper?.nativeElement;
    if (wrapperEl && this.scrollPassthroughListener) {
      wrapperEl.removeEventListener('wheel', this.scrollPassthroughListener);
      this.scrollPassthroughListener = null;
    }
  }

  /**
   * Setup navigation event handlers to route to detail pages
   * All navigation is handled internally - no events emitted to parent
   */
  private setupNavigationEvents(): void {
    // Configure navigation service to route directly to pages using canonical routes
    this.radarNavigationService.onTechnologyClick = (techId: number): void => {
      // Route directly to technology detail page using /detail/{id} format
      this.radarNavigationService.navigateToTechnology(techId);
    };

    this.radarNavigationService.onCategoryClick = (
      categoryId: number,
    ): void => {
      // Route to category page
      this.radarNavigationService.navigateToCategory(categoryId);
    };

    this.radarNavigationService.onLifecycleClick = (
      lifecycleId: number,
    ): void => {
      // Route to lifecycle page
      this.radarNavigationService.navigateToLifecycle(lifecycleId);
    };

    this.radarNavigationService.onMaintenanceClick = (): void => {
      this.radarNavigationService.navigateToMaintenance();
    };
  }

  /**
   * Setup responsive resize handling with performance optimizations
   */
  private setupResizeHandling(): void {
    // Use ResizeObserver if available, fallback to window resize
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((): void => {
        this.debouncedUpdateSvgSize();
      });

      // Only observe the wrapper element to avoid double-triggers
      if (this.radarWrapper?.nativeElement) {
        this.resizeObserver.observe(this.radarWrapper.nativeElement);
      }
    } else {
      // Fallback to window resize listener with debouncing
      const debouncedHandler = (): void => this.debouncedUpdateSvgSize();
      window.addEventListener('resize', debouncedHandler);
      // Store reference for cleanup
      (
        this as unknown as { _windowResizeHandler: () => void }
      )._windowResizeHandler = debouncedHandler;
    }

    // Initial size calculation with RAF for better performance
    requestAnimationFrame(() => this.updateSvgSize());
  }

  /**
   * Cleanup resize handling with thorough cleanup
   */
  private cleanupResizeHandling(): void {
    // Clear any pending resize timeout
    if (this.resizeTimeoutId !== null) {
      clearTimeout(this.resizeTimeoutId);
      this.resizeTimeoutId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    } else if (
      (this as unknown as { _windowResizeHandler?: () => void })
        ._windowResizeHandler
    ) {
      const handler = (this as unknown as { _windowResizeHandler: () => void })
        ._windowResizeHandler;
      window.removeEventListener('resize', handler);
      delete (this as unknown as { _windowResizeHandler?: () => void })
        ._windowResizeHandler;
    }

    // Clear cached size
    this.lastKnownSize = null;
  }

  /**
   * Debounced wrapper for updateSvgSize to reduce excessive calls
   */
  private debouncedUpdateSvgSize(): void {
    if (this.resizeTimeoutId !== null) {
      clearTimeout(this.resizeTimeoutId);
    }

    this.resizeTimeoutId = window.setTimeout(() => {
      this.updateSvgSize();
      this.resizeTimeoutId = null;
    }, this.RESIZE_DEBOUNCE_MS);
  }

  /**
   * Update SVG size based on available space while preserving aspect ratio
   * Optimized to reduce DOM operations and eliminate console spam
   */
  private updateSvgSize(): void {
    if (!this.radarWrapper?.nativeElement || !this.radarSvg?.nativeElement) {
      return;
    }

    const wrapper = this.radarWrapper.nativeElement;
    const svg = this.radarSvg.nativeElement;
    const rect = wrapper.getBoundingClientRect();

    // Calculate available height (window height - wrapper top position)
    const availableHeight = window.innerHeight - rect.top;
    const maxHeight =
      availableHeight * (this.settings.maxWindowHeightPct || 0.9);

    // Calculate size based on aspect ratio constraints
    let targetWidth = rect.width;
    let targetHeight = targetWidth / this.ASPECT_RATIO;

    // Respect max height constraint
    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight * this.ASPECT_RATIO;
    }

    // Respect max width constraint if specified
    // We can add maxWidth to settings later if needed
    const maxWidth = 1500;
    if (maxWidth && targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / this.ASPECT_RATIO;
    }

    // Round to avoid sub-pixel rendering issues
    targetWidth = Math.round(targetWidth);
    targetHeight = Math.round(targetHeight);

    // Skip update if size hasn't changed significantly (avoid redundant DOM operations)
    if (
      this.lastKnownSize &&
      Math.abs(this.lastKnownSize.width - targetWidth) < 1 &&
      Math.abs(this.lastKnownSize.height - targetHeight) < 1
    ) {
      return;
    }

    // Cache the new size
    this.lastKnownSize = { width: targetWidth, height: targetHeight };

    // Apply size to SVG using Renderer2 for cross-browser compatibility
    this.renderer.setStyle(svg, 'width', `${targetWidth}px`);
    this.renderer.setStyle(svg, 'height', `${targetHeight}px`);
  }

  /**
   * Pre-fetch all icon data URLs for technologies with pictures
   * Returns a Map<pictureId, dataUrl> for instant lookup during rendering
   */
  private preFetchIconDataUrls(
    technologies: Technology[],
    shouldUseColor: boolean,
  ): Promise<Map<number, string>> {
    // Extract unique picture IDs from technologies
    const pictureIds = new Set<number>();
    technologies.forEach((tech) => {
      if (tech.pictureId && tech.pictureId > 0) {
        pictureIds.add(tech.pictureId);
      }
    });

    // If no pictures, return empty map immediately
    if (pictureIds.size === 0) {
      return Promise.resolve(new Map<number, string>());
    }

    // Create array of observables to fetch all icons in parallel
    const fetchObservables = Array.from(pictureIds).map((pictureId) =>
      this.radarDataService
        .transformTechnologyLogo(pictureId, shouldUseColor)
        .pipe(
          take(1),
          // Map to tuple [pictureId, dataUrl | null]
          map((dataUrl) => ({ pictureId, dataUrl })),
        ),
    );

    // Execute all fetches in parallel using forkJoin
    return new Promise((resolve) => {
      if (fetchObservables.length === 0) {
        resolve(new Map<number, string>());
        return;
      }

      forkJoin(fetchObservables).subscribe({
        next: (results) => {
          const iconMap = new Map<number, string>();
          results.forEach(({ pictureId, dataUrl }) => {
            if (dataUrl) {
              iconMap.set(pictureId, dataUrl);
            }
          });
          resolve(iconMap);
        },
        error: (error) => {
          console.error('RadarVisualization: Error pre-fetching icons', error);
          // Resolve with empty map on error - blips will fall back to initials
          resolve(new Map<number, string>());
        },
      });
    });
  }

  /**
   * Main radar rendering method using unified D3.js system and enhanced services
   */
  private renderRadar(isFilterChange = false): void {
    if (
      !this.technologies.length ||
      !this.categories.length ||
      !this.lifecycles.length
    ) {
      return;
    }

    // Pre-fetch all icons before rendering
    this.preFetchIconDataUrls(this.technologies, this.settings.showIconsInColor)
      .then((iconDataMap) => {
        this.renderRadarWithIcons(isFilterChange, iconDataMap);
      })
      .catch((error) => {
        console.error('RadarVisualization: Error during icon pre-fetch', error);
        // Continue rendering without icons
        this.renderRadarWithIcons(isFilterChange, new Map<number, string>());
      });
  }

  /**
   * Internal rendering method with pre-fetched icons
   */
  private renderRadarWithIcons(
    isFilterChange: boolean,
    iconDataMap: Map<number, string>,
  ): void {
    try {
      // Clean up existing visualization
      this.cleanupExistingVisualization();

      // Determine animation type based on render context
      const isFirstRender = this.isInitialRender || !this.hasRenderedOnce;
      const shouldUseStartupAnimation =
        isFirstRender && this.settings.animationsEnabled && !isFilterChange;

      const shouldUseFilterAnimation =
        isFilterChange && this.settings.animationsEnabled && !isFirstRender;

      // Debug logging for animation decisions (can be removed in production)
      if (this.settings.debugMode) {
        console.log('RadarVisualization render:', {
          isFilterChange,
          isFirstRender,
          isInitialRender: this.isInitialRender,
          hasRenderedOnce: this.hasRenderedOnce,
          currentTechnologyCount: this.technologies.length,
          shouldUseStartupAnimation,
          shouldUseFilterAnimation,
          animationsEnabled: this.settings.animationsEnabled,
        });
      }

      // Build configuration using data service
      const config = this.radarDataService.buildRadarConfig(
        this.technologies,
        this.categories,
        this.lifecycles,
        this.settings,
      );

      // Override svgId with actual element ID
      config.svgId = this.radarSvg?.nativeElement?.id || 'radar';

      // Create rings with calculated radii using math service
      const rings = this.radarDataService.buildRings(
        this.lifecycles,
        this.technologies,
        this.settings.radarRadius,
        this.settings.blipRadius,
      );

      // Get navigation functions (already configured in setupNavigationEvents)
      const navigationFunctions =
        this.radarNavigationService.getNavigationFunctions();

      // Get data functions using proper data service integration
      const fetchDataFunctions = {
        fetchEntryDetails: async (entry: RadarEntry): Promise<unknown> => {
          try {
            return await this.radarDataService
              .fetchEntryDetails(entry, this.technologies)
              .pipe(take(1))
              .toPromise();
          } catch (error) {
            console.error(
              'RadarVisualization: Error fetching entry details',
              error,
            );
            return null;
          }
        },
        fetchQuadrantData: async (quadrant: number): Promise<unknown> => {
          try {
            return await this.radarDataService
              .fetchQuadrantData(quadrant, this.categories, this.technologies)
              .pipe(take(1))
              .toPromise();
          } catch (error) {
            console.error(
              'RadarVisualization: Error fetching quadrant data',
              error,
            );
            return null;
          }
        },
        transformLogo: (pictureId: number): unknown => {
          try {
            // Use RadarDataService instead of direct PictureService access
            return this.radarDataService.transformTechnologyLogo(
              pictureId,
              this.settings.showIconsInColor,
            );
          } catch (error) {
            console.error('RadarVisualization: Error transforming logo', error);
            // Return observable that emits null for graceful fallback
            return of(null);
          }
        },
        getIconDataUrl: (pictureId: number): string | null => {
          return iconDataMap.get(pictureId) || null;
        },
      };

      // Convert settings for visualization - match what D3.js expects
      const visualizationSettings = {
        showIcons: this.settings.showIcons,
        showFullNames: this.settings.showFullNames,
        showIconsInColor: this.settings.showIconsInColor,
        isFilterChange: isFilterChange,
        useBlipOnlyAnimation: shouldUseFilterAnimation,
      };

      // Call unified D3.js visualization with appropriate animation settings
      this.visualizationInstance = unified_radar_visualization(
        rings,
        this.settings.blipRadius,
        config,
        navigationFunctions,
        fetchDataFunctions,
        visualizationSettings,
        shouldUseStartupAnimation,
      );

      // Update tracking variables only after successful render
      this.hasRenderedOnce = true;
      if (isFirstRender) {
        this.isInitialRender = false;
      }

      // Update SVG size after rendering (using RAF for better performance)
      requestAnimationFrame(() => this.updateSvgSize());
    } catch (error) {
      console.error('RadarVisualization: Error during render', error);
      this.cleanupExistingVisualization();

      // Show user error notification
      const errorMessage = this.getErrorMessage(error);
      this.snackBar.open(
        `Radar-Visualisierung konnte nicht geladen werden: ${errorMessage}`,
        'Schließen',
        {
          duration: 8000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        },
      );
    }
  }

  /**
   * Cleanup existing visualization to prevent duplicates
   */
  private cleanupExistingVisualization(): void {
    if (this.visualizationInstance) {
      const instance = this.visualizationInstance as {
        simulation?: { stop: () => void };
        cleanup?: () => void;
      };

      // Stop any running simulations
      if (instance.simulation) {
        instance.simulation.stop();
      }

      // Call cleanup if available
      if (instance.cleanup) {
        instance.cleanup();
      }

      this.visualizationInstance = null;
    }

    // Additional DOM cleanup - ensure SVG is completely cleared
    if (this.radarSvg?.nativeElement) {
      const svg = this.radarSvg.nativeElement;
      // Remove all child elements
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
    }
  }

  /**
   * Extract user-friendly error message from error object
   */
  private getErrorMessage(error: unknown): string {
    if (!error) {
      return 'Unbekannter Fehler';
    }

    // Handle different error types
    if (typeof error === 'string') {
      return error;
    }

    // Type guard for Error objects
    if (error instanceof Error && error.message) {
      return error.message;
    }

    // Type guard for objects with nested error messages
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as {
        message?: string;
        error?: { message?: string };
        statusText?: string;
        status?: number;
      };

      if (errorObj.message) {
        return errorObj.message;
      }

      if (errorObj.error?.message) {
        return errorObj.error.message;
      }

      if (errorObj.statusText) {
        return `${errorObj.status || 'HTTP'} ${errorObj.statusText}`;
      }
    }

    // Fallback to JSON representation if available
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unbekannter Fehler beim Laden der Radar-Visualisierung';
    }
  }

  /**
   * Slice detail management methods - moved from container
   */
  public activateSliceDetail(sliceIndex: number): void {
    this.sliceDetailActive = true;
    this.currentSliceIndex = sliceIndex;
    // Add slice detail styling to container
    if (this.radarWrapper?.nativeElement) {
      this.renderer.addClass(
        this.radarWrapper.nativeElement,
        'slice-detail-mode',
      );
    }
  }

  public deactivateSliceDetail(): void {
    this.sliceDetailActive = false;
    this.currentSliceIndex = null;
    // Remove slice detail styling from container
    if (this.radarWrapper?.nativeElement) {
      this.renderer.removeClass(
        this.radarWrapper.nativeElement,
        'slice-detail-mode',
      );
    }
  }

  public isSliceDetailActive(): boolean {
    return this.sliceDetailActive;
  }

  public getCurrentSliceIndex(): number | null {
    return this.currentSliceIndex;
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Technology, Category, Lifecycle } from 'src/app/models/technology';
import {
  RadarEntry,
  EntryStatus,
  EntryPriority,
  RadarConfig,
  QuadrantConfig,
  RingConfig,
  RadarSettings,
} from '../models/radar-visualization.interfaces';
import { PictureService } from 'src/app/services/picture.service';
import { FilterState } from '../../radar-controls/radar-filters/radar-filters.component';
import { RadarMathService } from './radar-math.service';

@Injectable({
  providedIn: 'root',
})
export class RadarDataService {
  private readonly defaultRadarRadius = 450;
  private readonly defaultBlipRadius = 12;

  constructor(
    private pictureService: PictureService,
    private radarMathService: RadarMathService,
  ) {}

  /**
   * Get radar colors from CSS custom properties
   * This ensures radar visualization respects the current theme
   */
  private getRadarColors(): {
    background: string;
    grid: string;
    inactive: string;
  } {
    // Read CSS custom properties from document root
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    return {
      background:
        computedStyle.getPropertyValue('--radar-background').trim() ||
        '#ffffff',
      grid: computedStyle.getPropertyValue('--radar-grid').trim() || '#bbbbbb',
      inactive:
        computedStyle.getPropertyValue('--radar-inactive').trim() || '#dddddd',
    };
  }

  /**
   * Filter technologies based on filter state
   * CENTRALIZED: All lifecycle -5 exclusion happens here, not in conversion
   * CLARIFIED: All filters use AND logic - technology must match ALL selected criteria
   */
  getFilteredTechnologies(
    technologies: Technology[],
    filterState: FilterState,
  ): Technology[] {
    if (!technologies || !Array.isArray(technologies)) {
      console.warn('RadarDataService: Invalid technologies array provided');
      return [];
    }

    if (!filterState) {
      console.warn(
        'RadarDataService: No filter state provided, returning all technologies',
      );
      return [...technologies];
    }

    try {
      let filtered = [...technologies];

      // CENTRALIZED: EXCLUDE lifecycle -5 (Undefined) and -6 (Deprecated) - single point of exclusion
      filtered = filtered.filter(
        (tech) => tech.lifecycleId !== -5 && tech.lifecycleId !== -6,
      );

      // Apply tag filters - AND logic: must have at least one selected tag
      if (filterState.selectedTags?.length > 0) {
        filtered = filtered.filter(
          (tech) =>
            tech.tags &&
            filterState.selectedTags.some((tag) => tech.tags.includes(tag)),
        );
      }

      // Apply lifecycle filters - AND logic: must be in selected lifecycles (if any selected)
      if (filterState.selectedLifecycles?.length > 0) {
        filtered = filtered.filter((tech) =>
          filterState.selectedLifecycles.some(
            (lc) => lc.id === tech.lifecycleId,
          ),
        );
      }

      // Apply customer filters - AND logic: must be associated with selected customers
      if (filterState.selectedCustomers?.length > 0) {
        filtered = filtered.filter(
          (tech) =>
            tech.projects?.some(
              (project) =>
                project.customers?.some((customer) =>
                  filterState.selectedCustomers.some(
                    (selectedCustomer) => customer.id === selectedCustomer.id,
                  ),
                ),
            ),
        );
      }

      // Apply project filters - AND logic: must be associated with selected projects
      if (filterState.selectedProjects?.length > 0) {
        filtered = filtered.filter(
          (tech) =>
            tech.projects?.some((project) =>
              filterState.selectedProjects.some(
                (selectedProject) => project.id === selectedProject.id,
              ),
            ),
        );
      }

      // Apply priority filter - AND logic: must have priority if enabled
      if (filterState.onlyPrio) {
        filtered = filtered.filter((tech) => tech.priority === true);
      }

      // Apply "Most Clicked" filter - AND logic applied last to get top N from filtered set
      if (filterState.selectedMostClickedOption) {
        // Sort by viewCount descending first
        filtered = filtered.sort(
          (a, b) => (b.viewCount || 0) - (a.viewCount || 0),
        );

        // Apply the selected limit
        if (filterState.selectedMostClickedOption.includes('Top 10')) {
          filtered = filtered.slice(0, 10);
        } else if (filterState.selectedMostClickedOption.includes('Top 20')) {
          filtered = filtered.slice(0, 20);
        }
      }

      return filtered;
    } catch (error) {
      console.error('RadarDataService: Error filtering technologies', error);
      return technologies;
    }
  }

  /**
   * Convert technologies to radar entries
   * OPTIMIZED: Lifecycle -5 exclusion removed - handled in getFilteredTechnologies
   */
  convertTechnologiesToRadarEntries(
    technologies: Technology[],
    categories: Category[],
    lifecycles: Lifecycle[],
  ): RadarEntry[] {
    if (!technologies || !Array.isArray(technologies)) {
      console.warn(
        'RadarDataService: Invalid technologies array for conversion',
      );
      return [];
    }

    if (!categories || !Array.isArray(categories)) {
      console.warn('RadarDataService: Invalid categories array for conversion');
      return [];
    }

    if (!lifecycles || !Array.isArray(lifecycles)) {
      console.warn('RadarDataService: Invalid lifecycles array for conversion');
      return [];
    }

    try {
      // OPTIMIZED: Remove double filtering - lifecycle -5/-6 exclusion handled in getFilteredTechnologies
      // Technologies passed here are already filtered
      const validLifecycles = lifecycles.filter(
        (lifecycle) => lifecycle.id !== -5 && lifecycle.id !== -6,
      );

      return technologies.map((tech) => {
        const categoryIndex = categories.findIndex(
          (cat) => cat.id === tech.categoryId,
        );
        const lifecycleIndex = validLifecycles.findIndex(
          (lc) => lc.id === tech.lifecycleId,
        );

        if (categoryIndex === -1) {
          console.warn(
            `RadarDataService: Category not found for technology ${tech.name} (categoryId: ${tech.categoryId})`,
          );
        }

        if (lifecycleIndex === -1) {
          console.warn(
            `RadarDataService: Lifecycle not found for technology ${tech.name} (lifecycleId: ${tech.lifecycleId})`,
          );
        }

        return {
          quadrant: Math.max(0, categoryIndex),
          ring: Math.max(0, lifecycleIndex),
          label: tech.name || 'Unknown Technology',
          technologyName: tech.name || 'Unknown Technology', // Required by blips.js
          technologyPictureId: tech.pictureId || undefined, // Required by blips.js for custom icons
          active: true,
          moved: 0,
          link: `/detail/${tech.id}`,
          description: tech.description || '',
          shortDescription: tech.shortDescription || '',
          // Ensure both string and numeric versions use the same source
          id: tech.id.toString(), // String version for D3.js compatibility
          technologyId: tech.id, // Canonical numeric ID for navigation (supports negative IDs)
          status: this.mapTechnologyStatus(tech),
          tags: tech.tags || [],
          accessibilityLabel: `${tech.name} technology in ${
            categories.find((c) => c.id === tech.categoryId)?.name ||
            'Unknown Category'
          }`,
          priority: tech.priority ? EntryPriority.HIGH : EntryPriority.MEDIUM,

          color:
            ['#1E3A8A', '#ff0d00ff', '#7e47ffff', '#35d4d4ff'][
              Math.max(0, categoryIndex) % 4
            ] || '#6B7280',
          connectedTechnologyIds: tech.connectedTechnologyIds || [], // FIXED: Include connected technology IDs for relationship visualization
        };
      });
    } catch (error) {
      console.error(
        'RadarDataService: Error converting technologies to radar entries',
        error,
      );
      return [];
    }
  }

  /**
   * Build complete radar configuration
   */
  buildRadarConfig(
    technologies: Technology[],
    categories: Category[],
    lifecycles: Lifecycle[],
    settings: RadarSettings,
  ): RadarConfig {
    if (!technologies || !categories || !lifecycles || !settings) {
      throw new Error(
        'RadarDataService: Missing required parameters for radar configuration',
      );
    }

    try {
      const quadrants = this.buildSectors(categories);
      const rings = this.buildRings(
        lifecycles,
        technologies,
        settings.radarRadius,
        settings.blipRadius,
      );
      const entries = this.convertTechnologiesToRadarEntries(
        technologies,
        categories,
        lifecycles,
      );

      return {
        svgId: 'radar',
        width: 1450,
        height: 1000,
        colors: this.getRadarColors(),
        title: 'Technology Radar',
        quadrants,
        rings,
        entries,
      };
    } catch (error) {
      console.error(
        'RadarDataService: Error building radar configuration',
        error,
      );
      throw error;
    }
  }

  /**
   * Build quadrant configurations from categories
   */
  buildSectors(categories: Category[]): QuadrantConfig[] {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.warn(
        'RadarDataService: No categories provided for sector building',
      );
      return [];
    }

    try {
      return categories.map((category, index) => {
        const sectorCount = categories.length;
        const angleStep = (2 * Math.PI) / sectorCount;
        const startAngle = index * angleStep - Math.PI / 2;
        const endAngle = (index + 1) * angleStep - Math.PI / 2;
        const centerAngle = (index + 0.5) * angleStep - Math.PI / 2;

        return {
          name: category.name || `Category ${index + 1}`,
          index,
          startAngle,
          endAngle,
          centerAngle,
          // NOTE: Quadrant color removed - blip colors use HSL calculation in convertTechnologiesToRadarEntries
        };
      });
    } catch (error) {
      console.error('RadarDataService: Error building sectors', error);
      return [];
    }
  }

  /**
   * Build ring configurations from lifecycles
   */
  buildRings(
    lifecycles: Lifecycle[],
    technologies: Technology[],
    radarRadius: number,
    blipRadius: number,
  ): RingConfig[] {
    if (!lifecycles || !Array.isArray(lifecycles)) {
      console.warn(
        'RadarDataService: Invalid lifecycles array for ring building',
      );
      return [];
    }

    if (!technologies || !Array.isArray(technologies)) {
      console.warn(
        'RadarDataService: Invalid technologies array for ring building',
      );
      return [];
    }

    if (!radarRadius || radarRadius <= 0) {
      console.warn(
        'RadarDataService: Invalid radar radius provided, using default',
      );
      radarRadius = this.defaultRadarRadius;
    }

    if (!blipRadius || blipRadius <= 0) {
      console.warn(
        'RadarDataService: Invalid blip radius provided, using default',
      );
      blipRadius = this.defaultBlipRadius;
    }

    try {
      // EXCLUDE lifecycle -5 (Undefined) and -6 (Deprecated) from ring display
      const validLifecycles = lifecycles.filter(
        (lifecycle) => lifecycle.id !== -5 && lifecycle.id !== -6,
      );

      if (validLifecycles.length === 0) {
        return [];
      }

      const validLifecycleIds = new Set(
        validLifecycles.map((lifecycle) => lifecycle.id),
      );

      const technologiesForRings = technologies.filter((tech) =>
        validLifecycleIds.has(tech.lifecycleId),
      );

      const ringRadii = this.radarMathService.calculateRadii(
        technologiesForRings,
        radarRadius,
        blipRadius,
      );

      const sortedLifecycleIds = Array.from(validLifecycleIds).sort(
        (a, b) => a - b,
      );

      const lifecycleRadiusMap = new Map<number, number>();
      sortedLifecycleIds.forEach((id, index) => {
        lifecycleRadiusMap.set(id, ringRadii[index]);
      });

      return validLifecycles.map((lifecycle, index) => ({
        name: lifecycle.name || `Lifecycle ${index + 1}`,
        radius: lifecycleRadiusMap.get(lifecycle.id) ?? radarRadius,
        index,
        color: '#bbb',
        textColor: '#000',
        description: lifecycle.description || '',
        accessibilityLabel: `${lifecycle.name} lifecycle ring`,
        lifecycleId: lifecycle.id, // Add lifecycleId to track original ID
      }));
    } catch (error) {
      console.error('RadarDataService: Error building rings', error);
      return [];
    }
  }

  /**
   * Map technology status to radar entry status
   */
  private mapTechnologyStatus(tech: Technology): EntryStatus {
    // For now, map based on available data or provide sensible defaults
    // This can be extended when more status information is available
    if (!tech) {
      return EntryStatus.UNCHANGED;
    }

    // Could add logic based on tech.status or other fields when available
    return EntryStatus.UNCHANGED;
  }

  /**
   * Fetch entry details for tooltips and interactions
   */
  fetchEntryDetails(
    entry: RadarEntry,
    technologies: Technology[],
  ): Observable<Technology | null> {
    if (!entry || !entry.id) {
      console.warn('RadarDataService: Invalid entry for detail fetching');
      return of(null);
    }

    if (!technologies || !Array.isArray(technologies)) {
      console.warn(
        'RadarDataService: Invalid technologies array for detail fetching',
      );
      return of(null);
    }

    try {
      const tech = technologies.find((t) => t.id.toString() === entry.id);
      if (tech) {
        const result = {
          ...tech,
          detailedDescription: tech.description || '',
          relatedTechnologies: technologies
            .filter((t) => t.categoryId === tech.categoryId && t.id !== tech.id)
            .slice(0, 5),
          usageMetrics: {
            viewCount: tech.viewCount || 0,
            lastViewed: new Date(),
            popularity: tech.priority ? 'high' : 'medium',
          },
        };
        return of(result);
      }
      return of(null);
    } catch (error) {
      console.error('RadarDataService: Error fetching entry details', error);
      return throwError(() => error);
    }
  }

  /**
   * Fetch quadrant-specific data
   */
  fetchQuadrantData(
    quadrant: number,
    categories: Category[],
    technologies: Technology[],
  ): Observable<{
    category: Category;
    technologies: Technology[];
    metrics: {
      totalTechnologies: number;
      activeTechnologies: number;
      lastUpdated: Date;
    };
  } | null> {
    if (quadrant < 0 || !categories || !Array.isArray(categories)) {
      console.warn(
        'RadarDataService: Invalid parameters for quadrant data fetching',
      );
      return of(null);
    }

    if (!technologies || !Array.isArray(technologies)) {
      console.warn(
        'RadarDataService: Invalid technologies array for quadrant data fetching',
      );
      return of(null);
    }

    try {
      if (categories[quadrant]) {
        const categoryTechnologies = technologies.filter(
          (t) => t.categoryId === categories[quadrant].id,
        );
        const result = {
          category: categories[quadrant],
          technologies: categoryTechnologies,
          metrics: {
            totalTechnologies: categoryTechnologies.length,
            activeTechnologies: categoryTechnologies.filter(
              (t) => t.priority === true,
            ).length,
            lastUpdated: new Date(),
          },
        };
        return of(result);
      }
      return of(null);
    } catch (error) {
      console.error('RadarDataService: Error fetching quadrant data', error);
      return throwError(() => error);
    }
  }

  /**
   * Transform logo/picture for technology blips
   * Returns a plain data URL string that can be used in D3.js image elements
   */
  transformTechnologyLogo(
    pictureId: number,
    shouldUseColor: boolean,
  ): Observable<string | null> {
    if (!pictureId || pictureId <= 0) {
      console.warn(
        'RadarDataService: Invalid picture ID for logo transformation:',
        pictureId,
      );
      return of(null);
    }

    try {
      return this.pictureService
        .loadPictureAsDataUrl(pictureId, shouldUseColor)
        .pipe(
          catchError((error) => {
            console.error(
              'RadarDataService: Error transforming technology logo',
              error,
            );
            return of(null);
          }),
        );
    } catch (error) {
      console.error(
        'RadarDataService: Error in transformTechnologyLogo',
        error,
      );
      return of(null);
    }
  }

  /**
   * Get technology details by ID
   */
  getTechnologyById(
    technologyId: number,
    technologies: Technology[],
  ): Technology | null {
    if (!technologyId || !technologies || !Array.isArray(technologies)) {
      return null;
    }

    try {
      return technologies.find((tech) => tech.id === technologyId) || null;
    } catch (error) {
      console.error('RadarDataService: Error finding technology by ID', error);
      return null;
    }
  }

  // Get connected technologies for a given technology - centralized relationship access

  getConnectedTechnologyIds(
    technologyId: number,
    technologies: Technology[],
  ): number[] {
    if (!technologyId || !technologies || !Array.isArray(technologies)) {
      return [];
    }

    try {
      const technology = this.getTechnologyById(technologyId, technologies);
      if (!technology) {
        return [];
      }

      // Return connected technology IDs if available, otherwise empty array
      // This can be extended when connection data becomes available in the Technology model
      return technology.connectedTechnologyIds || [];
    } catch (error) {
      console.error(
        'RadarDataService: Error getting connected technology IDs',
        error,
      );
      return [];
    }
  }
}

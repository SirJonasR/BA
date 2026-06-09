import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Category, Lifecycle, Technology } from 'src/app/models/technology';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterState } from './components/radar-controls/radar-filters/radar-filters.component';
import { RadarSettings } from './components/radar-visualization/models/radar-visualization.interfaces';
import { RadarDataService } from './components/radar-visualization/services/radar-data.service';
import { DisplaySettings } from './components/radar-controls/radar-settings/radar-settings.component';
import { TechnologyService } from '../services/technology.service';
import { UserHandlingService } from '../services/user-handling.service';
import { Customer } from '../models/customer';
import { Project } from '../models/project';

@Component({
  selector: 'app-radar-container',
  templateUrl: './radar-container.component.html',
  styleUrls: ['./radar-container.component.css'],
})
export class RadarContainerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Core data - fetched once from main service
  technologies: Technology[] = [];
  categories: Category[] = [];
  lifecycles: Lifecycle[] = [];
  tags: string[] = [];
  customers: Customer[] = [];
  projects: Project[] = [];

  // Filtered data - computed reactively via data service
  private _filteredTechnologies: Technology[] = [];

  // Loading state
  hasLoaded = false;

  // Radar settings - centralized configuration for consistent behavior
  radarSettings: RadarSettings = {
    showFullNames: false,
    // default values for showIcons and showIconsInColor (updated)
    showIcons: true,
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

  /**
   * Centralized responsive breakpoints for consistent behavior across components
   * CSS components should use these breakpoints for media queries
   */
  static readonly RESPONSIVE_BREAKPOINTS = {
    MOBILE: 480,
    TABLET: 768,
    SMALL_MOBILE: 360,
  } as const;

  // Filter state
  filterState: FilterState = {
    selectedTags: [],
    selectedCustomers: [],
    selectedProjects: [],
    selectedLifecycles: [],
    onlyPrio: false,
    selectedMostClickedOption: '',
  };

  constructor(
    private technologyService: TechnologyService,
    private userHandlingService: UserHandlingService,
    private cdr: ChangeDetectorRef,
    private radarDataService: RadarDataService,
  ) {}

  get filteredTechnologies(): Technology[] {
    return this._filteredTechnologies;
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== PRIVATE METHODS - INITIALIZATION =====

  private async initializeComponent(): Promise<void> {
    try {
      this.loadUserDisplaySettings();
      await this.loadAllData();
      this.updateFilteredTechnologies();
      this.hasLoaded = true;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('RadarContainer: Initialization error', error);
      this.hasLoaded = false;
    }
  }

  private async loadUserDisplaySettings(): Promise<void> {
    try {
      const shouldDisplayColors =
        await this.userHandlingService.getShowIconsInColor();
      const shouldShowIcons = await this.userHandlingService.getShowIcons();
      this.radarSettings.showIconsInColor = shouldDisplayColors;
      this.radarSettings.showIcons = shouldShowIcons;
    } catch (error) {
      console.error(
        'RadarContainer: Error loading user display settings',
        error,
      );
    }
  }

  private async loadAllData(): Promise<void> {
    try {
      const [technologies, categories, lifecycles, tags, customers, projects] =
        await Promise.all([
          firstValueFrom(
            this.technologyService
              .getTechnologies()
              .pipe(takeUntil(this.destroy$)),
          ),
          firstValueFrom(
            this.technologyService
              .getCategories()
              .pipe(takeUntil(this.destroy$)),
          ),
          firstValueFrom(
            this.technologyService
              .getLifecycles()
              .pipe(takeUntil(this.destroy$)),
          ),
          firstValueFrom(
            this.technologyService
              .getTagSelection()
              .pipe(takeUntil(this.destroy$)),
          ),
          firstValueFrom(
            this.technologyService
              .getAllCustomers()
              .pipe(takeUntil(this.destroy$)),
          ),
          firstValueFrom(
            this.technologyService
              .getAllProjects()
              .pipe(takeUntil(this.destroy$)),
          ),
        ]);

      if (!technologies || !categories || !lifecycles) {
        throw new Error('Failed to load core data for radar');
      }

      this.technologies = technologies;
      this.categories = categories;
      this.lifecycles = lifecycles;
      this.tags = tags || [];
      this.customers = customers || [];
      this.projects = projects || [];
    } catch (error) {
      console.error('RadarContainer: Error loading data', error);
      throw error;
    }
  }

  private updateFilteredTechnologies(): void {
    this._filteredTechnologies = this.radarDataService.getFilteredTechnologies(
      this.technologies,
      this.filterState,
    );
  }

  // ===== PUBLIC METHODS - EVENT HANDLERS =====

  onFiltersChanged(filters: FilterState): void {
    if (!filters) {
      console.warn('RadarContainer: Invalid filter state received');
      return;
    }

    this.filterState = { ...filters };
    this.updateFilteredTechnologies();
  }

  onFilterReset(): void {
    this.filterState = {
      selectedTags: [],
      selectedCustomers: [],
      selectedProjects: [],
      selectedLifecycles: [],
      onlyPrio: false,
      selectedMostClickedOption: '',
    };
    this.updateFilteredTechnologies();
  }

  onDisplaySettingsChanged(settings: DisplaySettings): void {
    // Update radar settings directly with the emitted values
    this.radarSettings.showIcons = settings.showIcons;
    this.radarSettings.showIconsInColor = settings.showIconsInColor;
    // Trigger rerendering of the radar by creating a new object reference
    this.radarSettings = { ...this.radarSettings };
  }
}

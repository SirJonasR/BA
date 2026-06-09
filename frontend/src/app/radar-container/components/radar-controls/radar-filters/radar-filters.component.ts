import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Customer } from 'src/app/models/customer';
import { Project } from 'src/app/models/project';
import { Lifecycle } from 'src/app/models/technology';
import { ThemeService, ThemeConfig } from '../../../../theming';

export interface FilterState {
  selectedTags: string[];
  selectedCustomers: Customer[];
  selectedProjects: Project[];
  selectedLifecycles: Lifecycle[];
  onlyPrio: boolean;
  selectedMostClickedOption: string;
}

@Component({
  selector: 'app-radar-filters',
  templateUrl: './radar-filters.component.html',
  styleUrls: ['./radar-filters.component.css'],
})
export class RadarFiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tags: string[] = [];
  @Input() customers: Customer[] = [];
  @Input() projects: Project[] = [];
  @Input() lifecycles: Lifecycle[] = [];
  @Input() filterState: FilterState = {
    selectedTags: [],
    selectedCustomers: [],
    selectedProjects: [],
    selectedLifecycles: [],
    onlyPrio: false,
    selectedMostClickedOption: '',
  };

  @Output() filtersChanged = new EventEmitter<FilterState>();
  @Output() filterReset = new EventEmitter<void>();

  // Working copies for filter state management
  selectedTags_: string[] = [];
  selectedCustomers_: Customer[] = [];
  selectedProjects_: Project[] = [];
  selectedLifecycles_: Lifecycle[] = [];

  // Search functionality
  tagSearchTerm = '';
  customerSearchTerm = '';
  projectSearchTerm = '';

  // Filtered arrays for search
  filteredTags: string[] = [];
  filteredCustomers: Customer[] = [];
  filteredProjects: Project[] = [];

  mostClickedOptions: string[] = [
    'Top 10 am häufigsten angeklickten Technologien (gefiltert)',
    'Top 20 am häufigsten angeklickten Technologien (gefiltert)',
  ];

  // Card expansion state management
  private expandedCards: Set<string> = new Set(['lifecycles']); //= new Set(['tags', 'customers', 'projects', 'lifecycles']); // Default all expanded

  // Expandable search state management
  private expandedSearches: Set<string> = new Set();

  // Theme management - Observable pattern
  currentThemeConfig: ThemeConfig;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {
    // Initialize with current theme config
    this.currentThemeConfig = this.themeService.getCurrentThemeConfig();
  }

  /**
   * Get filtered lifecycles excluding 'Undefined' lifecycle (ID: -5) and 'Deprecated' (ID: -6)
   * as it's not a meaningful filter option for users
   */
  get filteredLifecycles(): Lifecycle[] {
    return this.lifecycles.filter(
      (lifecycle) => lifecycle.id !== -5 && lifecycle.id !== -6,
    );
  }

  ngOnInit(): void {
    this.resetWorkingCopies();
    this.initializeFilteredArrays();

    // Subscribe to theme changes - reactive theming pattern
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentThemeConfig = this.themeService.getCurrentThemeConfig();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterState'] && !changes['filterState'].firstChange) {
      this.resetWorkingCopies();
    }
    if (changes['tags'] || changes['customers'] || changes['projects']) {
      this.initializeFilteredArrays();
      // Re-apply search filters
      this.filterTags();
      this.filterCustomers();
      this.filterProjects();
    }
  }

  private initializeFilteredArrays(): void {
    this.filteredTags = [...this.tags];
    this.filteredCustomers = [...this.customers];
    this.filteredProjects = [...this.projects];
  }

  private resetWorkingCopies(): void {
    this.selectedTags_ = [...this.filterState.selectedTags];
    this.selectedCustomers_ = [...this.filterState.selectedCustomers];
    this.selectedProjects_ = [...this.filterState.selectedProjects];
    // Filter out 'Undefined' lifecycle (ID: -5) and 'Deprecated' (ID: -6) from selections
    this.selectedLifecycles_ = [
      ...this.filterState.selectedLifecycles.filter(
        (lc) => lc.id !== -5 && lc.id !== -6,
      ),
    ];

    // Reset search terms and filtered arrays
    this.tagSearchTerm = '';
    this.customerSearchTerm = '';
    this.projectSearchTerm = '';
    this.initializeFilteredArrays();
  }

  checkUncheckAllLifecycles(): void {
    const filteredLifecycles = this.filteredLifecycles;
    const isAllSelected =
      this.selectedLifecycles_.length === filteredLifecycles.length &&
      filteredLifecycles.every((lc) =>
        this.selectedLifecycles_.some((selected) => selected.id === lc.id),
      );

    if (isAllSelected) {
      this.selectedLifecycles_ = [];
    } else {
      this.selectedLifecycles_ = [...filteredLifecycles];
    }
    this.emitFiltersChanged();
  }

  get allLifecyclesSelected(): boolean {
    const filteredLifecycles = this.filteredLifecycles;
    return (
      this.selectedLifecycles_.length === filteredLifecycles.length &&
      filteredLifecycles.every((lc) =>
        this.selectedLifecycles_.some((selected) => selected.id === lc.id),
      )
    );
  }

  addOrRemoveLifecycle(lifecycle: Lifecycle): void {
    if (!lifecycle || !lifecycle.id) {
      console.warn(
        'RadarFilters: Invalid lifecycle for add/remove operation',
        lifecycle,
      );
      return;
    }

    const index = this.selectedLifecycles_.findIndex(
      (l) => l.id === lifecycle.id,
    );
    if (index > -1) {
      this.selectedLifecycles_.splice(index, 1);
    } else {
      this.selectedLifecycles_.push(lifecycle);
    }
    this.emitFiltersChanged();
  }

  isCheckedLifecycle(lifecycle: Lifecycle): boolean {
    return this.selectedLifecycles_.some((l) => l.id === lifecycle.id);
  }

  onMostClickedOptionToggle(option: string): void {
    if (!option || typeof option !== 'string') {
      console.warn(
        'RadarFilters: Invalid option for most clicked toggle',
        option,
      );
      return;
    }

    // Toggle behavior: if already selected, deselect; otherwise select
    const newSelectedOption =
      this.filterState.selectedMostClickedOption === option ? '' : option;

    const newState: FilterState = {
      selectedTags: [...this.selectedTags_],
      selectedCustomers: [...this.selectedCustomers_],
      selectedProjects: [...this.selectedProjects_],
      selectedLifecycles: [...this.selectedLifecycles_],
      onlyPrio: this.filterState.onlyPrio,
      selectedMostClickedOption: newSelectedOption,
    };

    this.filterState = { ...newState };
    this.filtersChanged.emit(newState);
  }

  resetFilters(): void {
    this.selectedTags_ = [];
    this.selectedCustomers_ = [];
    this.selectedProjects_ = [];
    this.selectedLifecycles_ = [];

    // Clear search terms
    this.tagSearchTerm = '';
    this.customerSearchTerm = '';
    this.projectSearchTerm = '';

    // Collapse all search dropdowns since there are no selections
    this.expandedSearches.clear();

    // Reset filtered arrays
    this.initializeFilteredArrays();

    this.filterState = {
      selectedTags: [],
      selectedCustomers: [],
      selectedProjects: [],
      selectedLifecycles: [],
      onlyPrio: false,
      selectedMostClickedOption: '',
    };

    this.filterReset.emit();
  }

  onPriorityToggle(checked: boolean): void {
    const newState: FilterState = {
      selectedTags: [...this.selectedTags_],
      selectedCustomers: [...this.selectedCustomers_],
      selectedProjects: [...this.selectedProjects_],
      selectedLifecycles: [...this.selectedLifecycles_],
      onlyPrio: checked,
      selectedMostClickedOption: this.filterState.selectedMostClickedOption,
    };

    this.filterState = { ...newState };
    this.filtersChanged.emit(newState);
  }

  emitFiltersChanged(): void {
    const currentState: FilterState = {
      selectedTags: [...this.selectedTags_],
      selectedCustomers: [...this.selectedCustomers_],
      selectedProjects: [...this.selectedProjects_],
      selectedLifecycles: [...this.selectedLifecycles_],
      onlyPrio: this.filterState.onlyPrio,
      selectedMostClickedOption: this.filterState.selectedMostClickedOption,
    };

    this.filterState = { ...currentState };
    this.filtersChanged.emit(currentState);
  }

  // Card expansion methods
  toggleCardExpanded(cardName: string): void {
    if (this.expandedCards.has(cardName)) {
      this.expandedCards.delete(cardName);
    } else {
      this.expandedCards.add(cardName);
    }
  }

  isCardExpanded(cardName: string): boolean {
    return this.expandedCards.has(cardName);
  }

  // Expandable search methods
  toggleSearchExpanded(searchType: string): void {
    const cardName = this.getCardNameFromSearchType(searchType);

    if (this.expandedSearches.has(searchType)) {
      this.expandedSearches.delete(searchType);
    } else {
      this.expandedSearches.add(searchType);
      // Auto-expand the parent card when search is opened
      if (cardName && !this.expandedCards.has(cardName)) {
        this.expandedCards.add(cardName);
      }
      // Focus the input after expansion
      setTimeout(() => this.focusSearchInput(searchType), 100);
    }
  }

  isSearchExpanded(searchType: string): boolean {
    return this.expandedSearches.has(searchType);
  }

  expandSearch(searchType: string): void {
    const cardName = this.getCardNameFromSearchType(searchType);

    if (!this.expandedSearches.has(searchType)) {
      this.expandedSearches.add(searchType);
      // Auto-expand the parent card when search is opened
      if (cardName && !this.expandedCards.has(cardName)) {
        this.expandedCards.add(cardName);
      }
    }
  }

  /**
   * Get CSS classes for a search container based on its expansion state
   */
  getSearchContainerClasses(searchType: string): string {
    const classes = [];
    if (this.isSearchExpanded(searchType)) {
      classes.push('search-expanded');
    }
    return classes.join(' ');
  }

  /**
   * Check if a card has any expanded search dropdowns
   */
  hasExpandedSearch(cardName: string): boolean {
    const searchTypes = this.getSearchTypesForCard(cardName);
    return searchTypes.some((searchType) =>
      this.expandedSearches.has(searchType),
    );
  }

  /**
   * Get the card name from a search type
   */
  private getCardNameFromSearchType(searchType: string): string {
    switch (searchType) {
      case 'tags':
        return 'tags';
      case 'customers':
        return 'customers';
      case 'projects':
        return 'projects';
      default:
        return '';
    }
  }

  /**
   * Get all search types that belong to a specific card
   */
  private getSearchTypesForCard(cardName: string): string[] {
    switch (cardName) {
      case 'tags':
        return ['tags'];
      case 'customers':
        return ['customers'];
      case 'projects':
        return ['projects'];
      default:
        return [];
    }
  }

  onSearchBlur(searchType: string): void {
    // Delay collapse to allow option clicks
    setTimeout(() => {
      // Only collapse if no search term and no active selections happening
      const searchTerm = this.getSearchTerm(searchType);
      const hasSelections = this.hasSelectionsForSearchType(searchType);

      // Keep expanded if there's a search term or if there are selections (better UX)
      if ((!searchTerm || searchTerm.trim() === '') && !hasSelections) {
        this.expandedSearches.delete(searchType);
      }
    }, 200);
  }

  /**
   * Check if a search type has any active selections
   */
  private hasSelectionsForSearchType(searchType: string): boolean {
    switch (searchType) {
      case 'tags':
        return this.selectedTags_.length > 0;
      case 'customers':
        return this.selectedCustomers_.length > 0;
      case 'projects':
        return this.selectedProjects_.length > 0;
      default:
        return false;
    }
  }

  private focusSearchInput(searchType: string): void {
    const inputElement = document.querySelector(
      `#${searchType}SearchInput`,
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  private getSearchTerm(searchType: string): string {
    switch (searchType) {
      case 'tags':
        return this.tagSearchTerm;
      case 'customers':
        return this.customerSearchTerm;
      case 'projects':
        return this.projectSearchTerm;
      default:
        return '';
    }
  }

  // Get count of active filters for display
  getActiveFiltersCount(): number {
    let count = 0;
    count += this.selectedTags_.length;
    count += this.selectedCustomers_.length;
    count += this.selectedProjects_.length;
    count += this.selectedLifecycles_.length;

    if (this.filterState.onlyPrio) count++;
    if (this.filterState.selectedMostClickedOption) count++;

    return count;
  }

  // Tag filter methods
  removeTag(tag: string): void {
    const index = this.selectedTags_.indexOf(tag);
    if (index > -1) {
      this.selectedTags_.splice(index, 1);
      this.emitFiltersChanged();
    }
  }

  filterTags(): void {
    if (!this.tagSearchTerm.trim()) {
      this.filteredTags = [...this.tags];
    } else {
      const searchTerm = this.tagSearchTerm.toLowerCase();
      this.filteredTags = this.tags.filter((tag) =>
        tag.toLowerCase().includes(searchTerm),
      );
    }
  }

  clearTagSearch(): void {
    this.tagSearchTerm = '';
    this.filteredTags = [...this.tags];
    // Collapse search if no selections
    if (this.selectedTags_.length === 0) {
      this.expandedSearches.delete('tags');
    }
  }

  // Removed: onTagDropdownOpened - replaced with expandable search

  // Customer filter methods
  removeCustomer(customer: Customer): void {
    const index = this.selectedCustomers_.findIndex(
      (c) => c.id === customer.id,
    );
    if (index > -1) {
      this.selectedCustomers_.splice(index, 1);
      this.emitFiltersChanged();
    }
  }

  filterCustomers(): void {
    if (!this.customerSearchTerm.trim()) {
      this.filteredCustomers = [...this.customers];
    } else {
      const searchTerm = this.customerSearchTerm.toLowerCase();
      this.filteredCustomers = this.customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm),
      );
    }
  }

  clearCustomerSearch(): void {
    this.customerSearchTerm = '';
    this.filteredCustomers = [...this.customers];
    // Collapse search if no selections
    if (this.selectedCustomers_.length === 0) {
      this.expandedSearches.delete('customers');
    }
  }

  // Project filter methods
  removeProject(project: Project): void {
    const index = this.selectedProjects_.findIndex((p) => p.id === project.id);
    if (index > -1) {
      this.selectedProjects_.splice(index, 1);
      this.emitFiltersChanged();
    }
  }

  filterProjects(): void {
    if (!this.projectSearchTerm.trim()) {
      this.filteredProjects = [...this.projects];
    } else {
      const searchTerm = this.projectSearchTerm.toLowerCase();
      this.filteredProjects = this.projects.filter((project) =>
        project.name.toLowerCase().includes(searchTerm),
      );
    }
  }

  clearProjectSearch(): void {
    this.projectSearchTerm = '';
    this.filteredProjects = [...this.projects];
    // Collapse search if no selections
    if (this.selectedProjects_.length === 0) {
      this.expandedSearches.delete('projects');
    }
  }

  // Removed: onProjectDropdownOpened - replaced with expandable search

  // TrackBy functions for better performance
  trackByTag(index: number, tag: string): string {
    return tag;
  }

  trackByCustomer(index: number, customer: Customer): number {
    return customer.id;
  }

  trackByProject(index: number, project: Project): number {
    return project.id;
  }

  // Selection helper methods for expandable search
  isTagSelected(tag: string): boolean {
    return this.selectedTags_.includes(tag);
  }

  toggleTagSelection(tag: string): void {
    const index = this.selectedTags_.indexOf(tag);
    if (index > -1) {
      this.selectedTags_.splice(index, 1);
    } else {
      this.selectedTags_.push(tag);
    }
    this.emitFiltersChanged();
  }

  isCustomerSelected(customer: Customer): boolean {
    return this.selectedCustomers_.some((c) => c.id === customer.id);
  }

  toggleCustomerSelection(customer: Customer): void {
    const index = this.selectedCustomers_.findIndex(
      (c) => c.id === customer.id,
    );
    if (index > -1) {
      this.selectedCustomers_.splice(index, 1);
    } else {
      this.selectedCustomers_.push(customer);
    }
    this.emitFiltersChanged();
  }

  isProjectSelected(project: Project): boolean {
    return this.selectedProjects_.some((p) => p.id === project.id);
  }

  toggleProjectSelection(project: Project): void {
    const index = this.selectedProjects_.findIndex((p) => p.id === project.id);
    if (index > -1) {
      this.selectedProjects_.splice(index, 1);
    } else {
      this.selectedProjects_.push(project);
    }
    this.emitFiltersChanged();
  }
}

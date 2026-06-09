import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Category, Lifecycle, Technology } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';
import { Customer } from 'src/app/models/customer';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-technologies',
  templateUrl: './technologies.component.html',
  styleUrls: ['./technologies.component.css'],
})
export class TechnologiesComponent implements OnInit {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  technologies: Technology[] = [];
  filteredTechnologies_: Technology[] = [];

  // Active filter state (applied immediately)
  selectedTags: string[] = [];
  selectedCategories: Category[] = [];
  selectedLifecycles: Lifecycle[] = [];
  selectedCustomers: Customer[] = [];
  selectedProjects: Project[] = [];
  onlyPrio = false;
  selectedMostClickedOption = '';

  // Sort
  sortOptions: string[] = [
    'Neuste',
    'Älteste',
    'Meisten Kunden / Auftraggeber',
    'Am häufigsten angeklickt',
  ];
  selectedSortOption: string = this.sortOptions[0];
  mostClickedOptions: string[] = [
    'Top 10 am häufigsten angeklickten Technologien (gefiltert)',
    'Top 20 am häufigsten angeklickten Technologien (gefiltert)',
  ];

  // Search
  isSearchVisible = false;
  searchText = '';

  // Card expansion state
  expandedCards: {
    sort: boolean;
    categories: boolean;
    lifecycles: boolean;
    tags: boolean;
    customers: boolean;
    projects: boolean;
  } = {
    sort: false,
    categories: false,
    lifecycles: false,
    tags: false,
    customers: false,
    projects: false,
  };

  get categories(): Category[] {
    return this.technologyService.categories;
  }
  get lifecycles(): Lifecycle[] {
    return this.technologyService.lifecycles;
  }
  get tags(): string[] {
    return this.technologyService.tags;
  }
  get customers(): Customer[] {
    return this.technologyService.customers;
  }
  get projects(): Project[] {
    return this.technologyService.projects;
  }

  constructor(
    private route: ActivatedRoute,
    private technologyService: TechnologyService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.technologies = await firstValueFrom(
      this.technologyService.getTechnologies(),
    );
    this.filteredTechnologies_ = this.technologies;
    const params = await firstValueFrom(this.route.queryParams);

    if (params !== undefined) {
      if (params['categoryId'] !== undefined) {
        this.selectedCategories.push(
          <Category>(
            this.technologyService.getCategoryById(
              parseInt(params['categoryId']),
            )
          ) || {},
        );
        this.selectedLifecycles.push(...this.lifecycles);
      } else if (params['lifecycleId'] !== undefined) {
        this.selectedLifecycles.push(
          <Lifecycle>(
            this.technologyService.getLifecycleById(
              parseInt(params['lifecycleId']),
            )
          ) || {},
        );
        this.selectedCategories.push(...this.categories);
      } else {
        this.selectedLifecycles.push(...this.lifecycles);
        this.selectedCategories.push(...this.categories);
      }
      await this.startFilter();
    }
  }

  // ── Card expansion ────────────────────────────────────────────────────────

  toggleCardExpanded(
    card:
      | 'sort'
      | 'categories'
      | 'lifecycles'
      | 'tags'
      | 'customers'
      | 'projects',
  ): void {
    this.expandedCards[card] = !this.expandedCards[card];
  }

  isCardExpanded(
    card:
      | 'sort'
      | 'categories'
      | 'lifecycles'
      | 'tags'
      | 'customers'
      | 'projects',
  ): boolean {
    return this.expandedCards[card];
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  get allTagsSelected(): boolean {
    return (
      this.tags.length > 0 && this.selectedTags.length === this.tags.length
    );
  }

  toggleAllTags(checked: boolean): void {
    this.selectedTags = checked ? [...this.tags] : [];
    this.startFilter();
  }

  toggleTag(tag: string, checked: boolean): void {
    if (checked) {
      this.selectedTags = [...this.selectedTags, tag];
    } else {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    }
    this.startFilter();
  }

  removeTagChip(tag: string): void {
    this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    this.startFilter();
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  get allCustomersSelected(): boolean {
    return (
      this.customers.length > 0 &&
      this.selectedCustomers.length === this.customers.length
    );
  }

  isCustomerSelected(customer: Customer): boolean {
    return this.selectedCustomers.some((c) => c.name === customer.name);
  }

  toggleAllCustomers(checked: boolean): void {
    this.selectedCustomers = checked ? [...this.customers] : [];
    this.startFilter();
  }

  toggleCustomer(customer: Customer, checked: boolean): void {
    if (checked) {
      this.selectedCustomers = [...this.selectedCustomers, customer];
    } else {
      this.selectedCustomers = this.selectedCustomers.filter(
        (c) => c.name !== customer.name,
      );
    }
    this.startFilter();
  }

  removeCustomerChip(name: string): void {
    this.selectedCustomers = this.selectedCustomers.filter(
      (c) => c.name !== name,
    );
    this.startFilter();
  }

  // ── Projects ──────────────────────────────────────────────────────────────

  get allProjectsSelected(): boolean {
    return (
      this.projects.length > 0 &&
      this.selectedProjects.length === this.projects.length
    );
  }

  isProjectSelected(project: Project): boolean {
    return this.selectedProjects.some((p) => p.name === project.name);
  }

  toggleAllProjects(checked: boolean): void {
    this.selectedProjects = checked ? [...this.projects] : [];
    this.startFilter();
  }

  toggleProject(project: Project, checked: boolean): void {
    if (checked) {
      this.selectedProjects = [...this.selectedProjects, project];
    } else {
      this.selectedProjects = this.selectedProjects.filter(
        (p) => p.name !== project.name,
      );
    }
    this.startFilter();
  }

  removeProjectChip(name: string): void {
    this.selectedProjects = this.selectedProjects.filter(
      (p) => p.name !== name,
    );
    this.startFilter();
  }

  // ── Categories ────────────────────────────────────────────────────────────

  isCheckedCategory(category: Category): boolean {
    return this.selectedCategories.some((c) => c.id === category.id);
  }

  addOrRemoveCategory(category: Category): void {
    if (this.isCheckedCategory(category)) {
      this.selectedCategories = this.selectedCategories.filter(
        (c) => c.id !== category.id,
      );
    } else {
      this.selectedCategories = [...this.selectedCategories, category];
    }
    this.startFilter();
  }

  checkUncheckAllCategories(): void {
    if (this.selectedCategories.length < this.categories.length) {
      this.selectedCategories = [...this.categories];
    } else {
      this.selectedCategories = [];
    }
    this.startFilter();
  }

  // ── Lifecycles ────────────────────────────────────────────────────────────

  isCheckedLifecycle(lifecycle: Lifecycle): boolean {
    return this.selectedLifecycles.some((l) => l.id === lifecycle.id);
  }

  addOrRemoveLifecycle(lifecycle: Lifecycle): void {
    if (this.isCheckedLifecycle(lifecycle)) {
      this.selectedLifecycles = this.selectedLifecycles.filter(
        (l) => l.id !== lifecycle.id,
      );
    } else {
      this.selectedLifecycles = [...this.selectedLifecycles, lifecycle];
    }
    this.startFilter();
  }

  checkUncheckAllLifecycles(): void {
    if (this.selectedLifecycles.length < this.lifecycles.length) {
      this.selectedLifecycles = [...this.lifecycles];
    } else {
      this.selectedLifecycles = [];
    }
    this.startFilter();
  }

  // ── Sort / mostClicked ────────────────────────────────────────────────────

  onSortChange(): void {
    this.startFilter();
  }

  onRadioClick(value: string): void {
    if (this.selectedMostClickedOption === value) {
      this.selectedMostClickedOption = '';
    } else {
      this.selectedMostClickedOption = value;
    }
    this.startFilter();
  }

  // ── onlyPrio ──────────────────────────────────────────────────────────────

  onOnlyPrioChange(): void {
    this.startFilter();
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async onSearchInput(): Promise<void> {
    await this.recomputeFilteredTechnologies();
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    if (this.isSearchVisible) {
      setTimeout(() => this.searchInput?.nativeElement.focus());
      return;
    }
    if (!this.isSearchVisible) {
      this.searchText = '';
      this.onSearchInput();
    }
  }

  // ── Filter application ────────────────────────────────────────────────────

  async startFilter(): Promise<void> {
    await this.recomputeFilteredTechnologies();
  }

  resetFilter(): void {
    this.selectedTags = [];
    this.selectedCustomers = [];
    this.selectedProjects = [];
    this.selectedMostClickedOption = '';
    this.onlyPrio = false;
    this.selectedLifecycles = [...this.lifecycles];
    this.selectedCategories = [...this.categories];
    this.startFilter();
  }

  get filterIsOn(): boolean {
    return (
      this.selectedCustomers.length > 0 ||
      this.selectedProjects.length > 0 ||
      this.selectedTags.length > 0 ||
      this.onlyPrio ||
      this.selectedMostClickedOption !== '' ||
      this.selectedLifecycles.length < this.lifecycles.length ||
      this.selectedCategories.length < this.categories.length
    );
  }

  allowFilter(): boolean {
    return (
      this.selectedLifecycles.length > 0 && this.selectedCategories.length > 0
    );
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private async recomputeFilteredTechnologies(): Promise<void> {
    this.filteredTechnologies_ = await this.getFilteredTechnologies();
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    if (this.searchText.trim().length > 0) {
      const filterValue = this.searchText.toLowerCase();
      this.filteredTechnologies_ = this.filteredTechnologies_.filter((tech) =>
        tech.name.toLowerCase().includes(filterValue),
      );
    }
  }

  async getFilteredTechnologies(): Promise<Technology[]> {
    if (
      this.selectedCategories.length > 0 &&
      this.selectedLifecycles.length > 0
    ) {
      let technologies_: Technology[] = this.technologies
        .filter((technology) =>
          this.selectedLifecycles.some(
            (lifecycle) => technology.lifecycleId === lifecycle.id,
          ),
        )
        .filter((technology) =>
          this.selectedCategories.some(
            (category) => technology.categoryId === category.id,
          ),
        );
      if (this.selectedTags.length > 0) {
        technologies_ = technologies_.filter((technology) =>
          this.selectedTags.some((tag) =>
            technology.tags.includes(tag.toString()),
          ),
        );
      }
      if (this.selectedProjects.length > 0) {
        technologies_ = technologies_.filter((technology) =>
          this.selectedProjects.some((selectedProject) =>
            technology.projects.some(
              (project) => project.name === selectedProject.name,
            ),
          ),
        );
      }
      if (this.selectedCustomers.length > 0) {
        technologies_ = technologies_.filter((technology) =>
          this.selectedCustomers.some((selectedCustomer) =>
            technology.projects.some((project) =>
              project.customers.some(
                (customer) => customer.name === selectedCustomer.name,
              ),
            ),
          ),
        );
      }
      technologies_ = technologies_.filter(
        (technology, index, self) =>
          index === self.findIndex((t) => t.id === technology.id),
      );
      if (this.onlyPrio) {
        technologies_ = technologies_.filter(
          (technology) => technology.priority,
        );
      }
      if (this.selectedMostClickedOption === this.mostClickedOptions[0]) {
        technologies_.sort((a, b) => b.viewCount - a.viewCount);
        technologies_ = technologies_.slice(0, 10);
      }
      if (this.selectedMostClickedOption === this.mostClickedOptions[1]) {
        technologies_.sort((a, b) => b.viewCount - a.viewCount);
        technologies_ = technologies_.slice(0, 20);
      }
      switch (this.selectedSortOption) {
        case this.sortOptions[0]:
          return technologies_.sort((a, b) => {
            if (new Date(a.jumpDate) < new Date(b.jumpDate)) return 1;
            if (new Date(a.jumpDate) > new Date(b.jumpDate)) return -1;
            return 0;
          });
        case this.sortOptions[1]:
          return technologies_.sort((a, b) => {
            if (new Date(a.jumpDate) < new Date(b.jumpDate)) return -1;
            if (new Date(a.jumpDate) > new Date(b.jumpDate)) return 1;
            return 0;
          });
        case this.sortOptions[2]:
          return technologies_.sort(
            (a, b) => b.projects.length - a.projects.length,
          );
        case this.sortOptions[3]:
          return technologies_.sort((a, b) => b.viewCount - a.viewCount);
      }
      return technologies_;
    }
    return this.technologies;
  }
}

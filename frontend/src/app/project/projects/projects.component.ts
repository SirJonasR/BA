import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { MatTableDataSource } from '@angular/material/table';
import { Technology } from 'src/app/models/technology';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Customer } from 'src/app/services/customer.service';
import { TechnologyService } from 'src/app/services/technology.service';
import { Project } from 'src/app/models/project';
import { Contact } from 'src/app/models/contact';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() projects: Array<Project> = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  // Filter options
  availableTechnologies: Technology[] = [];
  availableCustomers: Customer[] = [];

  // Active filter values
  selectedTechnologies: Technology[] = [];
  selectedCustomers: Customer[] = [];
  startedAfter: Date | null = null;
  startedBefore: Date | null = null;
  endedAfter: Date | null = null;
  endedBefore: Date | null = null;
  projectStatusFilter: 'completed' | 'ongoing' | null = null;

  // Date range validation errors
  startDateRangeError: string | null = null;
  endDateRangeError: string | null = null;
  projectDurationError: string | null = null;
  isSearchVisible = false;
  searchText = '';

  // Card expansion state
  expandedCards: {
    technologies: boolean;
    customers: boolean;
    startDate: boolean;
    endDate: boolean;
  } = {
    technologies: false,
    customers: false,
    startDate: false,
    endDate: false,
  };

  dataSource: MatTableDataSource<Project> = new MatTableDataSource();
  displayedColumns: string[] = [
    'name',
    'contact',
    'technologyIds',
    'customers',
    'industry',
    'startDate',
    'endDate',
  ];

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private technologyService: TechnologyService,
  ) {}

  ngOnChanges(): void {
    this.loadProjects();
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.projectService.getProjects().subscribe((projects) => {
      this.projects = projects;
      this.dataSource.data = this.mapValues(projects);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Projekte pro Seite';
    this.paginator._intl.nextPageLabel = 'Nächste Seite';
    this.paginator._intl.lastPageLabel = 'Letzte Seite';
    this.paginator._intl.firstPageLabel = 'Erste Seite';
    this.paginator._intl.previousPageLabel = 'Vorherige Seite';
  }

  // ── Card expansion ────────────────────────────────────────────────────────

  toggleCardExpanded(
    card: 'technologies' | 'customers' | 'startDate' | 'endDate',
  ): void {
    this.expandedCards[card] = !this.expandedCards[card];
  }

  isCardExpanded(
    card: 'technologies' | 'customers' | 'startDate' | 'endDate',
  ): boolean {
    return this.expandedCards[card];
  }

  // ── Technology filter ─────────────────────────────────────────────────────

  get allTechnologiesSelected(): boolean {
    return (
      this.availableTechnologies.length > 0 &&
      this.selectedTechnologies.length === this.availableTechnologies.length
    );
  }

  isTechnologySelected(tech: Technology): boolean {
    return this.selectedTechnologies.some((t) => t.id === tech.id);
  }

  toggleAllTechnologies(checked: boolean): void {
    this.selectedTechnologies = checked ? [...this.availableTechnologies] : [];
    this.startFilter();
  }

  toggleTechnology(tech: Technology, checked: boolean): void {
    if (checked) {
      this.selectedTechnologies = [...this.selectedTechnologies, tech];
    } else {
      this.selectedTechnologies = this.selectedTechnologies.filter(
        (t) => t.id !== tech.id,
      );
    }
    this.startFilter();
  }

  removeTechnologyChip(technologyName: string): void {
    this.selectedTechnologies = this.selectedTechnologies.filter(
      (tech) => tech.name !== technologyName,
    );
    this.startFilter();
  }

  // ── Customer filter ───────────────────────────────────────────────────────

  get allCustomersSelected(): boolean {
    return (
      this.availableCustomers.length > 0 &&
      this.selectedCustomers.length === this.availableCustomers.length
    );
  }

  isCustomerSelected(customer: Customer): boolean {
    return this.selectedCustomers.some((c) => c.id === customer.id);
  }

  toggleAllCustomers(checked: boolean): void {
    this.selectedCustomers = checked ? [...this.availableCustomers] : [];
    this.startFilter();
  }

  toggleCustomer(customer: Customer, checked: boolean): void {
    if (checked) {
      this.selectedCustomers = [...this.selectedCustomers, customer];
    } else {
      this.selectedCustomers = this.selectedCustomers.filter(
        (c) => c.id !== customer.id,
      );
    }
    this.startFilter();
  }

  removeCustomerChip(customerName: string): void {
    this.selectedCustomers = this.selectedCustomers.filter(
      (customer) => customer.name !== customerName,
    );
    this.startFilter();
  }

  // ── Date chip removal ─────────────────────────────────────────────────────

  clearStartedAfter(): void {
    this.startedAfter = null;
    this.validateStartDateRange();
    this.validateProjectDuration();
    this.startFilter();
  }

  clearStartedBefore(): void {
    this.startedBefore = null;
    this.validateStartDateRange();
    this.validateProjectDuration();
    this.startFilter();
  }

  clearEndedAfter(): void {
    this.endedAfter = null;
    this.validateEndDateRange();
    this.validateProjectDuration();
    this.startFilter();
  }

  clearEndedBefore(): void {
    this.endedBefore = null;
    this.validateEndDateRange();
    this.validateProjectDuration();
    this.startFilter();
  }

  // ── Status filter ─────────────────────────────────────────────────────────

  onStatusToggle(status: 'completed' | 'ongoing', checked: boolean): void {
    this.projectStatusFilter = checked ? status : null;
    this.startFilter();
  }

  // ── Date validation ───────────────────────────────────────────────────────

  private validateStartDateRange(): void {
    this.startDateRangeError = null;
    if (this.startedAfter && this.startedBefore) {
      if (this.startedAfter > this.startedBefore) {
        this.startDateRangeError =
          '"Start nach" darf nicht nach "Start vor" liegen';
      }
    }
  }

  private validateEndDateRange(): void {
    this.endDateRangeError = null;
    if (this.endedAfter && this.endedBefore) {
      if (this.endedAfter > this.endedBefore) {
        this.endDateRangeError =
          '"Ende nach" darf nicht nach "Ende vor" liegen';
      }
    }
  }

  private validateProjectDuration(): void {
    this.projectDurationError = null;

    const startEarliest = this.startedAfter;
    const startLatest = this.startedBefore;
    const endEarliest = this.endedAfter;
    const endLatest = this.endedBefore;

    if (startEarliest && endLatest && endLatest < startEarliest) {
      this.projectDurationError =
        'Projektende darf nicht vor Projektstart liegen';
    } else if (startLatest && endEarliest && endEarliest < startLatest) {
      this.projectDurationError =
        'Projektende darf nicht vor Projektstart liegen';
    } else if (startEarliest && endEarliest && endEarliest < startEarliest) {
      this.projectDurationError =
        'Projektende darf nicht vor Projektstart liegen';
    } else if (startLatest && endLatest && endLatest < startLatest) {
      this.projectDurationError =
        'Projektende darf nicht vor Projektstart liegen';
    } else if (startEarliest && endEarliest && startEarliest > endEarliest) {
      this.projectDurationError =
        'Projektende darf nicht vor Projektstart liegen';
    } else if (startLatest && endLatest && startLatest > endLatest) {
      this.projectDurationError =
        'Projektende darf nicht vor Projektstart liegen';
    }
  }

  onStartAfterChange(): void {
    this.validateStartDateRange();
    this.validateProjectDuration();
    if (!this.hasValidationErrors) {
      this.startFilter();
    }
  }

  onStartBeforeChange(): void {
    this.validateStartDateRange();
    this.validateProjectDuration();
    if (!this.hasValidationErrors) {
      this.startFilter();
    }
  }

  onEndAfterChange(): void {
    this.validateEndDateRange();
    this.validateProjectDuration();
    if (!this.hasValidationErrors) {
      this.startFilter();
    }
  }

  onEndBeforeChange(): void {
    this.validateEndDateRange();
    this.validateProjectDuration();
    if (!this.hasValidationErrors) {
      this.startFilter();
    }
  }

  get hasValidationErrors(): boolean {
    return !!(
      this.startDateRangeError ||
      this.endDateRangeError ||
      this.projectDurationError
    );
  }

  // ── Filter application ────────────────────────────────────────────────────

  startFilter(): void {
    const filteredProjects = this.applyFilters(this.projects);
    this.dataSource.data = this.mapValues(filteredProjects);
  }

  resetFilter(): void {
    this.selectedTechnologies = [];
    this.selectedCustomers = [];
    this.startedAfter = null;
    this.startedBefore = null;
    this.endedAfter = null;
    this.endedBefore = null;
    this.projectStatusFilter = null;
    this.startDateRangeError = null;
    this.endDateRangeError = null;
    this.projectDurationError = null;
    this.loadProjects();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  private loadFilterOptions(): void {
    this.technologyService.getTechnologies().subscribe((technologies) => {
      this.availableTechnologies = technologies;
    });

    this.projectService.getProjects().subscribe((projects) => {
      const allCustomers: Customer[] = [];
      projects.forEach((project) => {
        project.customers.forEach((customer: Customer) => {
          if (!allCustomers.find((c) => c.id === customer.id)) {
            allCustomers.push(customer);
          }
        });
      });
      this.availableCustomers = allCustomers;
    });
  }

  private loadProjects(): void {
    this.projectService.getProjects().subscribe((projects) => {
      this.projects = projects;
      this.applySearchFilter();
    });
  }

  applySearchFilter(): void {
    let filteredProjects = this.applyFilters(this.projects || []);

    if (this.searchText.trim().length > 0) {
      const filterValue = this.searchText.toLowerCase();
      filteredProjects = filteredProjects.filter((project) =>
        project.name.toLowerCase().includes(filterValue),
      );
    }

    this.dataSource.data = this.mapValues(filteredProjects);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private applyFilters(projects: Project[]): Project[] {
    let filteredProjects = [...projects];

    if (this.selectedTechnologies.length > 0) {
      filteredProjects = filteredProjects.filter((project) =>
        this.selectedTechnologies.some((selectedTech) =>
          project.technologyNames.includes(selectedTech.name),
        ),
      );
    }

    if (this.selectedCustomers.length > 0) {
      filteredProjects = filteredProjects.filter((project) =>
        this.selectedCustomers.some((selectedCustomer) =>
          project.customers.some(
            (customer) => customer.id === selectedCustomer.id,
          ),
        ),
      );
    }

    if (this.startedAfter) {
      const startedAfter = this.startedAfter;
      filteredProjects = filteredProjects.filter((project) => {
        const projectDate = new Date(project.startDate);
        return projectDate >= startedAfter;
      });
    }

    if (this.startedBefore) {
      const startedBefore = this.startedBefore;
      filteredProjects = filteredProjects.filter((project) => {
        const projectDate = new Date(project.startDate);
        return projectDate <= startedBefore;
      });
    }

    if (this.endedAfter) {
      const endedAfter = this.endedAfter;
      filteredProjects = filteredProjects.filter((project) => {
        if (project.endDate) {
          const projectEndDate = new Date(project.endDate);
          return projectEndDate >= endedAfter;
        }
        return false;
      });
    }

    if (this.endedBefore) {
      const endedBefore = this.endedBefore;
      filteredProjects = filteredProjects.filter((project) => {
        if (project.endDate) {
          const projectEndDate = new Date(project.endDate);
          return projectEndDate <= endedBefore;
        }
        return false;
      });
    }

    if (this.projectStatusFilter === 'completed') {
      filteredProjects = filteredProjects.filter((project) =>
        this.isProjectCompleted(project.endDate),
      );
    } else if (this.projectStatusFilter === 'ongoing') {
      filteredProjects = filteredProjects.filter(
        (project) => !this.isProjectCompleted(project.endDate),
      );
    }

    return filteredProjects;
  }

  // returns true if the project was completed today or before today,
  // returns false in any other case
  private isProjectCompleted(endDate: string): boolean {
    try {
      const ended = new Date(endDate);
      const today = new Date(Date.now());
      return ended <= today;
    } catch (error) {
      return false;
    }
  }

  mapValues(projects: Project[]): {
    technologies: string[];
    name: string;
    technologyIds: number[];
    technologyNames: string[];
    customerNames: string[];
    description: string;
    contact: Contact[];
    salesServiceLink: string;
    industry?: string;
    id: number;
    customers: Customer[];
    startDate: string;
    endDate: string;
    info: string;
    industrySpecificInformation: string;
  }[] {
    return projects.map((project) => ({
      ...project,
      id: project.id,
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      customers: project.customers,
      industry: project.industry,
      technologyIds: [],
      technologyNames: project.technologyNames,
      description: '',
      contact: project.contact,
      info: '',
      industrySpecificInformation: project.industrySpecificInformation || '',
      salesServiceLink: project.salesServiceLink,
      technologies: project.technologyNames,
      customerNames: project.customers.map((customer) => customer.name),
    }));
  }

  navigate(project: Project): void {
    this.router.navigate([`/project/${project.id}`]);
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    if (this.isSearchVisible) {
      setTimeout(() => this.searchInput?.nativeElement.focus());
      return;
    }

    if (!this.isSearchVisible) {
      this.searchText = '';
      this.applySearchFilter();
    }
  }
}

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';
import { MatSidenav } from '@angular/material/sidenav';
import { FilterState } from './radar-filters/radar-filters.component';
import { DisplaySettings } from './radar-settings/radar-settings.component';
import { Lifecycle } from 'src/app/models/technology';
import { trigger, transition, style, animate } from '@angular/animations';
import { Customer } from 'src/app/models/customer';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-radar-controls',
  templateUrl: './radar-controls.component.html',
  styleUrls: ['./radar-controls.component.css'],
  animations: [
    trigger('fadeContent', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('250ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class RadarControlsComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Sidenav mode: 'filters', 'settings', or null when closed
  sidenavMode: 'filters' | 'settings' | null = null;

  // Data inputs from parent (radar-container)
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

  // Event outputs to parent
  @Output() filtersChanged = new EventEmitter<FilterState>();
  @Output() filterReset = new EventEmitter<void>();
  @Output() settingsChanged = new EventEmitter<DisplaySettings>();

  constructor(
    private router: Router,
    public featureFlagService: FeatureFlagService,
  ) {}

  onFilterClick(): void {
    if (this.sidenavMode === 'filters' && this.sidenav.opened) {
      this.closeSidenav();
    } else {
      this.openFilters();
    }
  }

  onSettingsClick(): void {
    if (this.sidenavMode === 'settings' && this.sidenav.opened) {
      this.closeSidenav();
    } else {
      this.openSettings();
    }
  }

  openFilters(): void {
    this.sidenavMode = 'filters';
    this.sidenav.open();
  }

  openSettings(): void {
    this.sidenavMode = 'settings';
    this.sidenav.open();
  }

  closeSidenav(): void {
    this.sidenav.close();
    this.sidenavMode = null;
  }

  onAddTechnologyClick(): void {
    this.router.navigate(['/technologies/add']);
  }

  // Event handlers from child components
  onFiltersChanged(filters: FilterState): void {
    this.filtersChanged.emit(filters);
  }

  onFilterReset(): void {
    this.filterReset.emit();
  }

  onSettingsChanged(settings: DisplaySettings): void {
    this.settingsChanged.emit(settings);
  }
}

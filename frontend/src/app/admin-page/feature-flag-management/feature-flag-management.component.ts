import { Component, OnInit } from '@angular/core';
import {
  FeatureFlag,
  FeatureFlagService,
} from 'src/app/services/feature-flag.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-feature-flag-management',
  templateUrl: './feature-flag-management.component.html',
  styleUrls: ['./feature-flag-management.component.css'],
})
export class FeatureFlagManagementComponent implements OnInit {
  featureFlags: FeatureFlag[] = [];
  displayedColumns: string[] = ['name', 'enabled'];

  constructor(
    private featureFlagService: FeatureFlagService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadFeatureFlags();
  }

  loadFeatureFlags(): void {
    this.featureFlagService.getFeatureFlags().subscribe((flags) => {
      this.featureFlags = flags;
    });
  }

  onToggleChange(flag: FeatureFlag): void {
    this.featureFlagService
      .updateFeatureFlag(flag.name, flag.enabled)
      .subscribe(() => {
        this.snackBar.open(
          `Feature flag '${flag.name}' was updated.`,
          'Close',
          {
            duration: 3000,
          },
        );
      });
  }
}

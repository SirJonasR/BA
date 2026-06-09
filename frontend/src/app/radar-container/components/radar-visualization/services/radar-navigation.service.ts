import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  RadarNavigationEvents,
  RadarEntry,
} from '../models/radar-visualization.interfaces';

@Injectable({
  providedIn: 'root',
})
export class RadarNavigationService {
  onTechnologyClick?: (techId: number) => void;
  onCategoryClick?: (categoryId: number) => void;
  onLifecycleClick?: (lifecycleId: number) => void;
  onMaintenanceClick?: () => void;

  constructor(private router: Router) {}

  /**
   * Navigate to technology detail page
   */
  navigateToTechnology(technologyId: number): void {
    if (!this.isValidId(technologyId)) {
      console.warn(
        'RadarNavigationService: Invalid technology ID for navigation:',
        technologyId,
      );
      return;
    }

    try {
      this.router.navigate(['/detail', technologyId]);
    } catch (error) {
      console.error(
        'RadarNavigationService: Navigation error to /detail/' + technologyId,
        error,
      );
    }
  }

  /**
   * Navigate to technologies filtered by lifecycle
   */
  navigateToLifecycle(lifecycleId: number): void {
    if (!this.isValidId(lifecycleId)) {
      console.warn(
        'RadarNavigationService: Invalid lifecycle ID for navigation:',
        lifecycleId,
      );
      return;
    }

    if (lifecycleId === -5) {
      console.warn(
        'RadarNavigationService: Attempting to navigate to excluded lifecycle -5',
      );
      return;
    }

    try {
      this.router.navigate(['/technologies'], {
        queryParams: { lifecycleId },
      });
    } catch (error) {
      console.error('RadarNavigationService: Navigation error', error);
    }
  }

  /**
   * Navigate to technologies filtered by category
   */
  navigateToCategory(categoryId: number): void {
    if (!this.isValidId(categoryId)) {
      console.warn(
        'RadarNavigationService: Invalid category ID for navigation:',
        categoryId,
      );
      return;
    }

    try {
      this.router.navigate(['/technologies'], {
        queryParams: { categoryId },
      });
    } catch (error) {
      console.error('RadarNavigationService: Navigation error', error);
    }
  }

  /**
   * Navigate to maintenance page
   */
  navigateToMaintenance(): void {
    try {
      this.router.navigate(['/maintenance']);
    } catch (error) {
      console.error(
        'RadarNavigationService: Navigation error to /maintenance',
        error,
      );
    }
  }

  /**
   * Get navigation functions for D3.js visualization
   */
  getNavigationFunctions(): RadarNavigationEvents {
    return {
      onQuadrantClick: (quadrant: number): void => {
        if (this.onCategoryClick && this.isValidIndex(quadrant)) {
          this.onCategoryClick(quadrant);
        }
      },
      onEntryClick: (entry: RadarEntry): void => {
        if (!entry) {
          console.warn(
            'RadarNavigationService: Invalid entry for click handler',
          );
          return;
        }

        // Use technologyId as primary, fallback to parsed id
        const techId = entry.technologyId || parseInt(entry.id || '0', 10);

        if (this.isValidId(techId) && this.onTechnologyClick) {
          this.onTechnologyClick(techId);
        } else {
          console.warn(
            'RadarNavigationService: Invalid or missing technology ID in entry click:',
            {
              technologyId: entry.technologyId,
              id: entry.id,
              label: entry.label,
            },
          );
        }
      },
      onCategoryClick: (categoryId: number | string): void => {
        const id =
          typeof categoryId === 'string'
            ? parseInt(categoryId, 10)
            : categoryId;
        if (this.isValidId(id) && this.onCategoryClick) {
          this.onCategoryClick(id);
        }
      },
      onTechnologyClick: (technologyId: number): void => {
        if (this.isValidId(technologyId) && this.onTechnologyClick) {
          this.onTechnologyClick(technologyId);
        }
      },
      onLifecycleClick: (lifecycleId: number): void => {
        if (lifecycleId === -5) {
          console.warn(
            'RadarNavigationService: Attempting to click on excluded lifecycle -5',
          );
          return;
        }

        if (this.isValidId(lifecycleId) && this.onLifecycleClick) {
          this.onLifecycleClick(lifecycleId);
        }
      },
      onMaintenanceClick: (): void => {
        if (this.onMaintenanceClick) {
          this.onMaintenanceClick();
        }
      },
    };
  }

  /**
   * Validate ID (non-zero integer, allows negative IDs)
   */
  private isValidId(id: number): boolean {
    return !isNaN(id) && id !== 0 && Number.isInteger(id);
  }

  /**
   * Validate index (non-negative integer)
   */
  private isValidIndex(index: number): boolean {
    return !isNaN(index) && index >= 0 && Number.isInteger(index);
  }
}

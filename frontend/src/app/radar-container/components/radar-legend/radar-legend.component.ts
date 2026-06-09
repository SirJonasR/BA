import { Component, OnInit, OnDestroy } from '@angular/core';
import { TechnologyService } from 'src/app/services/technology.service';
import { Lifecycle } from 'src/app/models/technology';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';

@Component({
  selector: 'app-radar-legend',
  templateUrl: './radar-legend.component.html',
  styleUrls: ['./radar-legend.component.css'],
})
export class RadarLegendComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  lifecycles: Lifecycle[] = [];

  constructor(
    private technologyService: TechnologyService,
    private featureFlagService: FeatureFlagService,
  ) {}

  ngOnInit(): void {
    this.loadLifecycles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLifecycles(): void {
    this.technologyService
      .getLifecycles()
      .pipe(takeUntil(this.destroy$))
      .subscribe((lifecycles) => {
        // Map lifecycle names to correct display order: 1=Maintain, 2=Adopt, 3=Assess, 4=Monitor
        // Exclude -5 (Undefined) and -6 (Deprecated)

        const displayOrderMap: Record<string, number> = {
          Maintain: 1,
          Adopt: 2,
          Assess: 3,
          Monitor: 4,
        };

        this.lifecycles = lifecycles
          .filter((lifecycle) => lifecycle.id !== -5 && lifecycle.id !== -6)
          .map((lifecycle) => ({
            ...lifecycle,
            id: displayOrderMap[lifecycle.name] ?? Math.abs(lifecycle.id),
          }))
          .sort((a, b) => a.id - b.id);
      });
  }

  getCleanId(id: number | string): string {
    // IDs are already positive from mapping, just return as string
    return id.toString();
  }

  shouldShowLegacyRadarLegend(): boolean {
    return this.featureFlagService.isEnabled('SHOW_LEGACY_RADAR_LEGEND');
  }
}

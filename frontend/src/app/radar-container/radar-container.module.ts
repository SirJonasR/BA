import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';

// Components
import { RadarContainerComponent } from './radar-container.component';
import { RadarVisualizationComponent } from './components/radar-visualization/radar-visualization.component';
import { RadarControlsComponent } from './components/radar-controls/radar-controls.component';
import { RadarFiltersComponent } from './components/radar-controls/radar-filters/radar-filters.component';
import { RadarLegendComponent } from './components/radar-legend/radar-legend.component';

// Services
import { RadarMathService } from './components/radar-visualization/services/radar-math.service';
import { RadarNavigationService } from './components/radar-visualization/services/radar-navigation.service';
import { RadarDataService } from './components/radar-visualization/services/radar-data.service';
import { RadarSettingsComponent } from './components/radar-controls/radar-settings/radar-settings.component';

/**
 * Radar Container Module
 *
 * Provides the unified radar visualization system with modular architecture.
 * Exports RadarContainerComponent for use in other modules.
 *
 * Features:
 * - Unified D3.js visualization
 * - Modular service architecture for math, navigation, data, and picture handling
 * - Reactive data flow with filtering support
 * - Clean separation of concerns between Angular and D3.js
 * - Slice detail functionality for enhanced user experience
 */
@NgModule({
  declarations: [
    RadarContainerComponent,
    RadarVisualizationComponent,
    RadarControlsComponent,
    RadarFiltersComponent,
    RadarLegendComponent,
    RadarSettingsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatRadioModule,
  ],
  exports: [
    RadarContainerComponent,
    RadarVisualizationComponent,
    RadarControlsComponent,
    RadarFiltersComponent,
    RadarLegendComponent,
  ],
  providers: [RadarMathService, RadarNavigationService, RadarDataService],
})
export class RadarContainerModule {}

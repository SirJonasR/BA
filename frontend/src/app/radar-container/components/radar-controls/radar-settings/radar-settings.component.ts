import {
  Component,
  EventEmitter,
  OnInit,
  OnDestroy,
  Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { ThemeService } from 'src/app/theming/services/theme.service';
import {
  ThemeConfig,
  ThemeId,
} from 'src/app/theming/models/theme-config.model';

export interface DisplaySettings {
  showIcons: boolean;
  showIconsInColor: boolean;
}

@Component({
  selector: 'app-radar-settings',
  templateUrl: './radar-settings.component.html',
  styleUrls: ['./radar-settings.component.css'],
})
export class RadarSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  availableThemes: ThemeConfig[] = [];
  currentThemeId: ThemeId | '' = '';
  isThemeExpanded = false;
  showIcons = false;
  showIconsInColor = false;

  @Output() settingsChanged = new EventEmitter<DisplaySettings>();

  constructor(
    protected userHandlingService: UserHandlingService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.showIcons = this.userHandlingService.user.showIcons;
    this.showIconsInColor = this.userHandlingService.user.showIconsInColor;

    this.availableThemes = this.themeService.getAvailableThemes();
    this.currentThemeId = this.themeService.getCurrentTheme();

    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((themeId) => {
        this.currentThemeId = themeId;
      });
  }

  setShowIcons(value: boolean): void {
    this.showIcons = value;
    this.userHandlingService.updateUserDisplay(
      this.showIconsInColor,
      this.showIcons,
    );
    this.emitSettingsChanged();
  }

  setShowIconsInColor(value: boolean): void {
    this.showIconsInColor = value;
    this.userHandlingService.updateUserDisplay(
      this.showIconsInColor,
      this.showIcons,
    );
    this.emitSettingsChanged();
  }

  private emitSettingsChanged(): void {
    this.settingsChanged.emit({
      showIcons: this.showIcons,
      showIconsInColor: this.showIconsInColor,
    });
  }

  toggleThemeExpanded(): void {
    this.isThemeExpanded = !this.isThemeExpanded;
  }

  onThemeChange(themeId: ThemeId): void {
    if (this.availableThemes.length > 1) {
      this.themeService.setTheme(themeId);
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

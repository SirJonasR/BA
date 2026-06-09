import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import {
  ThemeConfig,
  ThemeId,
  DEFAULT_THEME_ID,
} from '../models/theme-config.model';
import { getAllThemes, getThemeConfig } from '../themes/theme-registry';
import { environment } from '../../../environments/environment';

interface ThemePreferenceDto {
  themePreference: ThemeId;
}

/**
 * Theme Service
 *
 * Simple, centralized theme management with automatic configuration.
 *
 * ARCHITECTURE:
 * - Single source of truth: theme-registry.ts
 * - Automatic theme detection from registry
 * - Dynamic icon switching based on theme metadata
 * - localStorage persistence
 *
 * ADDING A THEME:
 * 1. Create [theme-id].theme.scss in app/theming/themes/
 * 2. Add theme ID to THEME_IDS in theme-registry.ts
 * 3. Add metadata to THEME_METADATA in theme-registry.ts
 * 4. Done!
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  private readonly apiUrl = `${environment.apiUrl}/user/me/theme`;

  // Reactive theme state
  private themeSubject: BehaviorSubject<ThemeId>;
  public theme$: Observable<ThemeId>;

  // Current theme configuration
  private currentThemeConfig: ThemeConfig;

  constructor(private http: HttpClient) {
    // Initialize with stored or default theme
    const storedThemeId = this.getStoredThemeId();
    const allThemes = getAllThemes();

    // SAFETY: Ensure at least one theme exists
    if (allThemes.length === 0) {
      throw new Error('ThemeService: No themes registered in THEME_METADATA');
    }

    const initialConfig = getThemeConfig(storedThemeId) || allThemes[0];

    this.currentThemeConfig = initialConfig;
    this.themeSubject = new BehaviorSubject<ThemeId>(initialConfig.id);
    this.theme$ = this.themeSubject.asObservable();

    // Apply initial theme (delay to ensure DOM is ready)
    if (typeof document !== 'undefined') {
      // In browser environment
      if (document.body) {
        this.applyTheme(initialConfig.id);
      } else {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
          this.applyTheme(initialConfig.id);
        });
      }
    }
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): ThemeConfig[] {
    return getAllThemes();
  }

  /**
   * Get current theme configuration (includes icon, name, etc.)
   */
  getCurrentThemeConfig(): ThemeConfig {
    return this.currentThemeConfig;
  }

  /**
   * Get current theme ID
   */
  getCurrentTheme(): ThemeId {
    return this.themeSubject.value;
  }

  /**
   * Set theme by ID
   */
  setTheme(themeId: ThemeId): void {
    const config = getThemeConfig(themeId);
    if (!config) {
      console.warn(`ThemeService: Theme '${themeId}' not found`);
      return;
    }

    if (config.id !== this.themeSubject.value) {
      // CRITICAL: Apply DOM changes BEFORE emitting Observable
      // Ensures CSS variables are updated when subscribers read them
      this.applyTheme(config.id);
      this.persistTheme(config.id);
      this.persistThemeToBackend(config.id); // Persist to backend
      this.currentThemeConfig = config;

      // Notify subscribers after DOM is updated
      this.themeSubject.next(config.id);
    }
  }

  /**
   * Cycle to next theme
   */
  toggleTheme(): void {
    const themes = getAllThemes();

    // SAFETY: Ensure themes exist
    if (themes.length === 0) {
      console.error('ThemeService: No themes available to toggle');
      return;
    }

    // SAFETY: Handle case where current theme was removed from registry
    const currentIndex = themes.findIndex(
      (t) => t.id === this.themeSubject.value,
    );
    const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

    const nextIndex = (safeCurrentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex].id);
  }

  /**
   * Check if dark mode active (based on theme variant)
   */
  isDarkMode(): boolean {
    return this.currentThemeConfig.variant === 'dark';
  }

  /**
   * Apply theme to document root
   */
  private applyTheme(themeId: ThemeId): void {
    const root = document.documentElement;
    const body = document.body;

    // Get theme config to determine variant
    const config = getThemeConfig(themeId);
    if (!config) {
      console.error(
        `ThemeService: Cannot apply theme '${themeId}' - not found in registry`,
      );
      return;
    }

    // Set data-theme attribute for CSS custom property switching
    root.setAttribute('data-theme', themeId);

    // Remove all theme classes from root and body
    const themeClasses = Array.from(root.classList).filter((c) =>
      c.endsWith('-theme'),
    );
    themeClasses.forEach((c) => {
      root.classList.remove(c);
      if (body) body.classList.remove(c);
    });

    // Apply Material theme variant based on theme metadata (not hard-coded ID)
    if (config.variant === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.add('light-theme');
    }

    // Add specific theme class for custom styling (both root and body for starfield)
    const themeClass = `${themeId}-theme`;
    root.classList.add(themeClass);
    if (body) {
      body.classList.add(themeClass);
    }
  }

  /**
   * Persist theme to localStorage
   */
  private persistTheme(themeId: ThemeId): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, themeId);
    } catch (error) {
      console.warn('ThemeService: localStorage error', error);
    }
  }

  /**
   * Retrieve stored theme from localStorage
   */
  private getStoredThemeId(): ThemeId {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && getThemeConfig(stored)) {
        return stored as ThemeId;
      }
    } catch (error) {
      console.warn('ThemeService: localStorage error', error);
    }
    return DEFAULT_THEME_ID;
  }

  /**
   * Clear stored theme (reset to default)
   */
  clearStoredTheme(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.setTheme(DEFAULT_THEME_ID);
    } catch (error) {
      console.warn('ThemeService: localStorage error', error);
    }
  }

  /**
   * Force light theme (used when theme switching is disabled via feature flag)
   * This overrides any stored theme preference
   */
  forceLightTheme(): void {
    this.setTheme(ThemeId.Light);
  }

  /**
   * Initialize theme from backend (call after user is authenticated)
   * This loads the user's persisted theme preference from the database
   */
  async initThemeFromBackend(): Promise<void> {
    try {
      const dto = await firstValueFrom(
        this.http.get<ThemePreferenceDto>(this.apiUrl),
      );
      const themeId = dto.themePreference;

      // Verify theme is valid
      const themeConfig = getThemeConfig(themeId);
      if (themeConfig) {
        // Apply theme without triggering backend save (avoid loop)
        this.applyTheme(themeId);
        this.persistTheme(themeId);
        this.currentThemeConfig = themeConfig;
        this.themeSubject.next(themeId);
      } else {
        console.warn(`ThemeService: Invalid theme from backend: ${themeId}`);
      }
    } catch (error) {
      console.warn('ThemeService: Failed to load theme from backend', error);
      // Fallback to localStorage or default
    }
  }

  /**
   * Persist theme to backend
   * Called when user manually changes theme
   */
  private persistThemeToBackend(themeId: ThemeId): void {
    const dto: ThemePreferenceDto = { themePreference: themeId };
    this.http.put<ThemePreferenceDto>(this.apiUrl, dto).subscribe({
      error: (err) =>
        console.warn('ThemeService: Failed to save theme to backend', err),
    });
  }
}

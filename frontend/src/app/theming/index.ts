/**
 * Theming Module Public API
 * Central export point for all theming functionality
 */

// Services
export { ThemeService } from './services/theme.service';

// Models & Types
export {
  ThemeConfig,
  ThemeId,
  DEFAULT_THEME_ID,
} from './models/theme-config.model';

// Theme Registry (for direct access if needed)
export {
  THEME_IDS,
  getAllThemes,
  getThemeConfig,
} from './themes/theme-registry';

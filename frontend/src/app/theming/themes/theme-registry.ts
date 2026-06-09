/**
 * Theme Registry - Single Source of Truth
 *
 * TO ADD A THEME:
 * 1. Add entry to THEME_METADATA below
 * 2. Create [theme-id].theme.scss with CSS custom properties
 * 3. Add @import to _all-themes.scss
 */

// ============================================================
// Theme identifiers as enum
// ============================================================

export enum ThemeId {
  Atoslight = 'atos-light',
  Light = 'light',
  Dark = 'dark',
  NightSky = 'night-sky',
}

// ============================================================
// EDIT HERE: Add/remove themes
// ============================================================

export const THEME_METADATA: Record<
  ThemeId,
  { name: string; icon: string; description: string; variant: 'light' | 'dark' }
> = {
  [ThemeId.Atoslight]: {
    name: 'Atos Light Mode',
    icon: 'fingerprint',
    description: 'Clean and bright theme for daytime use (Atos)',
    variant: 'light' as const,
  },
  [ThemeId.Light]: {
    name: 'Eviden Light Mode',
    icon: 'light_mode',
    description: 'Clean and bright theme for daytime use (Eviden)',
    variant: 'light' as const, // Material Design variant
  },
  [ThemeId.Dark]: {
    name: 'Eviden Dark Mode',
    icon: 'dark_mode',
    description: 'Standard dark theme with muted colors (Eviden)',
    variant: 'dark' as const,
  },
  [ThemeId.NightSky]: {
    name: 'Night Sky',
    icon: 'nightlight',
    description: 'Celestial theme with animated starfield',
    variant: 'dark' as const,
  },
} as const;

// ============================================================
// Auto-generated types (don't edit below)
// ============================================================

export const THEME_IDS = Object.values(ThemeId);

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
  variant: 'light' | 'dark';
}

export function getAllThemes(): ThemeConfig[] {
  return THEME_IDS.map((id) => ({
    id,
    ...THEME_METADATA[id],
  }));
}

export function getThemeConfig(id: ThemeId | string): ThemeConfig | undefined {
  const value = typeof id === 'string' ? (id as string) : (id as ThemeId);
  const match = THEME_IDS.find((t) => t === value);
  const themeId = (match ?? undefined) as ThemeId | undefined;
  return themeId && THEME_METADATA[themeId]
    ? { id: themeId, ...THEME_METADATA[themeId] }
    : undefined;
}

// Default to first theme in registry (safe even if themes change)
export const DEFAULT_THEME_ID: ThemeId = THEME_IDS[0] || ThemeId.Atoslight;

/**
 * Centralized storage keys for Preferences and related persistence.
 */
export const STORAGE_KEYS = {
  THEME: 'ok-note.theme',
  LOCALE: 'ok-note.locale',
} as const;

/**
 * Supported theme preference values.
 */
export type ThemePreference = 'light' | 'dark';

/**
 * Supported application locale preference values.
 */
export type LocalePreference = 'en' | 'fr';

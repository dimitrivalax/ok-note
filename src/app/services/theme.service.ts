import { Injectable, inject, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { STORAGE_KEYS, type ThemePreference } from '../constants/storage-keys';
import { SystemUiService } from './system-ui.service';

/**
 * Manages light and dark theme preference for the app.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly systemUiService = inject(SystemUiService);

  /**
   * Current theme preference as a reactive signal.
   */
  readonly theme = signal<ThemePreference>('light');

  /**
   * Loads the stored theme and applies it to the document.
   */
  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.THEME });
    const theme: ThemePreference = value === 'dark' ? 'dark' : 'light';
    await this.applyTheme(theme);
  }

  /**
   * Toggles between light and dark themes.
   */
  async toggleTheme(): Promise<void> {
    const nextTheme: ThemePreference = this.theme() === 'dark' ? 'light' : 'dark';
    await this.setTheme(nextTheme);
  }

  /**
   * Sets and persists the theme preference.
   */
  async setTheme(theme: ThemePreference): Promise<void> {
    await this.applyTheme(theme);
    await Preferences.set({ key: STORAGE_KEYS.THEME, value: theme });
  }

  /**
   * Returns whether dark mode is active.
   */
  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private async applyTheme(theme: ThemePreference): Promise<void> {
    this.theme.set(theme);
    document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
    await this.systemUiService.apply(theme);
  }
}

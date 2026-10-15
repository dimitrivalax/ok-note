import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

import type { ThemePreference } from '../constants/storage-keys';
import { SystemUi } from '../plugins/system-ui.plugin';

/**
 * Centralizes native status bar and navigation bar styling for Android / iOS.
 */
@Injectable({
  providedIn: 'root',
})
export class SystemUiService {
  /**
   * Applies system bar contrast to match the app theme.
   *
   * Status bar uses light icons (toolbar is primary blue).
   * Navigation bar uses dark icons in light theme and light icons in dark theme.
   *
   * @param theme Current light or dark preference.
   */
  async apply(theme: ThemePreference): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const isLightTheme = theme === 'light';

    try {
      // Style.Light = light (white) status icons — readable on the primary blue toolbar.
      await StatusBar.setStyle({
        style: Style.Light,
      });
    } catch {
      // StatusBar may be unavailable on some platforms; ignore.
    }

    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    try {
      await SystemUi.setNavigationBarLight({ isLight: isLightTheme });
    } catch {
      // Local plugin is Android-only; ignore when missing.
    }
  }
}

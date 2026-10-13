import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';

import type { LocalePreference } from '../constants/storage-keys';
import { TranslatePipe } from '../pipes/translate.pipe';
import { I18nService } from '../services/i18n.service';
import { ThemeService } from '../services/theme.service';

/**
 * Application settings page (theme and language preference).
 */
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonSegment,
    IonSegmentButton,
    TranslatePipe,
  ],
})
export class SettingsPage {
  /**
   * Theme service used by the template.
   */
  readonly themeService = inject(ThemeService);

  /**
   * I18n service used by the template.
   */
  readonly i18nService = inject(I18nService);

  /**
   * Updates the theme when the toggle changes.
   */
  async onThemeToggle(event: CustomEvent): Promise<void> {
    const isDark = Boolean(event.detail.checked);
    await this.themeService.setTheme(isDark ? 'dark' : 'light');
  }

  /**
   * Updates the locale when the language segment changes.
   */
  async onLocaleChange(event: CustomEvent): Promise<void> {
    const locale = String(event.detail.value) as LocalePreference;
    if (locale !== 'en' && locale !== 'fr') {
      return;
    }

    await this.i18nService.setLocale(locale);
  }
}

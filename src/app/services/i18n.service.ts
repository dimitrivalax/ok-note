import { Injectable, computed, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { STORAGE_KEYS, type LocalePreference } from '../constants/storage-keys';
import enCatalog from '../../assets/i18n/en.json';

/**
 * Flat translation dictionary keyed by dotted message ids.
 */
type TranslationDict = Record<string, string>;

/**
 * Maps app locale preference to Angular locale identifiers.
 */
const ANGULAR_LOCALE_BY_PREFERENCE: Record<LocalePreference, string> = {
  en: 'en-US',
  fr: 'fr-FR',
};

/**
 * Runtime internationalization service with EN/FR catalogs.
 */
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly translations = signal<TranslationDict>({ ...enCatalog });

  /**
   * Current locale preference as a reactive signal.
   */
  readonly locale = signal<LocalePreference>('en');

  /**
   * Angular locale id matching the current preference.
   */
  readonly angularLocale = computed(
    () => ANGULAR_LOCALE_BY_PREFERENCE[this.locale()]
  );

  /**
   * Loads the stored locale and its translation catalog.
   */
  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.LOCALE });
    const locale: LocalePreference = value === 'fr' ? 'fr' : 'en';
    await this.applyLocale(locale);
  }

  /**
   * Sets and persists the locale preference.
   */
  async setLocale(locale: LocalePreference): Promise<void> {
    await this.applyLocale(locale);
    await Preferences.set({ key: STORAGE_KEYS.LOCALE, value: locale });
  }

  /**
   * Returns the translated string for a key, with optional `{{param}}` substitution.
   */
  t(key: string, params?: Record<string, string | number>): string {
    const template = this.translations()[key] ?? key;
    if (!params) {
      return template;
    }

    return Object.entries(params).reduce(
      (result, [name, value]) =>
        result.replaceAll(`{{${name}}}`, String(value)),
      template
    );
  }

  private async applyLocale(locale: LocalePreference): Promise<void> {
    const dict = await this.loadCatalog(locale);
    this.translations.set(dict);
    this.locale.set(locale);
    document.documentElement.lang = locale;
  }

  private async loadCatalog(locale: LocalePreference): Promise<TranslationDict> {
    const response = await fetch(`assets/i18n/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load i18n catalog: ${locale}`);
    }

    return (await response.json()) as TranslationDict;
  }
}

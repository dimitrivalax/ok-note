import { Injectable, inject } from '@angular/core';
import { DatePicker } from '@capgo/capacitor-date-picker';

import { I18nService } from './i18n.service';
import { ThemeService } from './theme.service';

/**
 * Options for presenting a native date-and-time picker.
 */
export interface PickDateTimeOptions {
  /**
   * Initial selected datetime as an ISO string.
   */
  date?: string | null;

  /**
   * Earliest selectable datetime as an ISO string.
   */
  min?: string | null;

  /**
   * Dialog title shown by the native picker when supported.
   */
  title?: string;
}

/**
 * Centralizes native date and time pickers for Android, iOS, and web.
 */
@Injectable({
  providedIn: 'root',
})
export class DatePickerService {
  private readonly i18nService = inject(I18nService);
  private readonly themeService = inject(ThemeService);

  /**
   * Opens a native date-and-time picker and returns an ISO datetime, or null if cancelled.
   */
  async pickDateTime(options: PickDateTimeOptions = {}): Promise<string | null> {
    const initialDate = this.toPickerDate(options.date) ?? new Date().toISOString();
    const minDate = this.toPickerDate(options.min);

    const result = await DatePicker.present({
      mode: 'dateAndTime',
      date: initialDate,
      min: minDate ?? undefined,
      locale: this.i18nService.angularLocale(),
      theme: this.themeService.theme(),
      title: options.title ?? this.i18nService.t('editor.reminder'),
      doneText: this.i18nService.t('common.ok'),
      cancelText: this.i18nService.t('common.cancel'),
      is24h: this.i18nService.locale() === 'fr',
      format: "yyyy-MM-dd'T'HH:mm:ss",
      ios: {
        mergedDateAndTime: true,
        style: 'wheels',
      },
    });

    if (!result.value) {
      return null;
    }

    const parsed = new Date(result.value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  }

  private toPickerDate(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  }
}

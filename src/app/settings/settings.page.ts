import { Component, ElementRef, inject, viewChild } from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';

import type { LocalePreference } from '../constants/storage-keys';
import { TranslatePipe } from '../pipes/translate.pipe';
import { AlertService } from '../services/alert.service';
import { I18nService } from '../services/i18n.service';
import { NoteBackupService } from '../services/note-backup.service';
import { ThemeService } from '../services/theme.service';

/**
 * Application settings page (theme, language, and note backup).
 */
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
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

  private readonly alertService = inject(AlertService);
  private readonly noteBackupService = inject(NoteBackupService);

  /**
   * Hidden file input used after the user confirms an import.
   */
  private readonly importFileInput = viewChild<ElementRef<HTMLInputElement>>('importFileInput');

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

  /**
   * Exports every note as a JSON backup file.
   */
  async onExport(): Promise<void> {
    try {
      await this.noteBackupService.exportToFile();
      await this.alertService.toast(this.i18nService.t('settings.exportSuccess'), 'success');
    } catch {
      await this.alertService.toast(this.i18nService.t('settings.exportFailed'), 'danger');
    }
  }

  /**
   * Confirms a destructive restore, then opens the backup file picker.
   */
  async onImport(): Promise<void> {
    const confirmed = await this.alertService.confirm({
      header: this.i18nService.t('settings.importConfirmHeader'),
      message: this.i18nService.t('settings.importConfirmMessage'),
      confirmText: this.i18nService.t('settings.importConfirmAction'),
    });

    if (!confirmed) {
      return;
    }

    this.importFileInput()?.nativeElement.click();
  }

  /**
   * Restores notes from the selected backup file.
   */
  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const count = await this.noteBackupService.importFromText(raw);
      await this.alertService.toast(
        this.i18nService.t('settings.importSuccess', { count }),
        'success'
      );
    } catch {
      await this.alertService.toast(this.i18nService.t('settings.importInvalid'), 'danger');
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { I18nService } from './i18n.service';

/**
 * Centralized alert and toast handler for the application.
 */
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly i18nService = inject(I18nService);

  /**
   * Shows a confirmation dialog and resolves with the user choice.
   */
  async confirm(options: {
    header: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> {
    const alert = await this.alertController.create({
      header: options.header,
      message: options.message,
      buttons: [
        {
          text: options.cancelText ?? this.i18nService.t('common.cancel'),
          role: 'cancel',
        },
        {
          text: options.confirmText ?? this.i18nService.t('common.confirm'),
          role: 'confirm',
        },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  /**
   * Shows an informational alert.
   */
  async info(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [this.i18nService.t('common.ok')],
    });
    await alert.present();
  }

  /**
   * Shows a short toast message.
   */
  async toast(message: string, color: 'primary' | 'danger' | 'success' | 'warning' = 'primary'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}

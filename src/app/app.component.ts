import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { I18nService } from './services/i18n.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';

/**
 * Application root component.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly i18nService = inject(I18nService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Initializes theme, locale, and notification tap handling.
   */
  async ngOnInit(): Promise<void> {
    await Promise.all([this.themeService.init(), this.i18nService.init()]);
    await this.notificationService.initTapListener();
  }
}

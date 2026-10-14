import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { settingsOutline } from 'ionicons/icons';

import { TranslatePipe } from './pipes/translate.pipe';
import { I18nService } from './services/i18n.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';

/**
 * Application root component.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    RouterLink,
    TranslatePipe,
  ],
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly i18nService = inject(I18nService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    addIcons({ settingsOutline });
  }

  /**
   * Initializes theme, locale, and notification tap handling.
   */
  async ngOnInit(): Promise<void> {
    await Promise.all([this.themeService.init(), this.i18nService.init()]);
    await this.notificationService.initTapListener();
  }
}

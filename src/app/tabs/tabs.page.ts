import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { documentTextOutline, settingsOutline } from 'ionicons/icons';

import { TranslatePipe } from '../pipes/translate.pipe';

/**
 * Root tabs shell for Notes and Settings.
 */
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, TranslatePipe],
})
export class TabsPage {
  constructor() {
    addIcons({ documentTextOutline, settingsOutline });
  }
}

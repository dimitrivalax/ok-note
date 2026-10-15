import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Centralizes Capacitor Splash Screen show/hide for native platforms.
 */
@Injectable({
  providedIn: 'root',
})
export class SplashScreenService {
  /**
   * Hides the launch splash screen once the app is ready.
   */
  async hide(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await SplashScreen.hide({
      fadeOutDuration: 300,
    });
  }
}

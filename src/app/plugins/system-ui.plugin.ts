import { registerPlugin } from '@capacitor/core';

/**
 * Options for navigation bar icon contrast.
 */
export interface SetNavigationBarLightOptions {
  /**
   * When true, uses dark icons / gesture handle on a light navigation bar.
   */
  readonly isLight: boolean;
}

/**
 * Local Capacitor plugin for Android system UI (navigation bar contrast).
 */
export interface SystemUiPlugin {
  /**
   * Sets whether the navigation bar uses a light appearance (dark icons).
   */
  setNavigationBarLight(options: SetNavigationBarLightOptions): Promise<void>;
}

/**
 * Registered SystemUi Capacitor plugin instance.
 */
export const SystemUi = registerPlugin<SystemUiPlugin>('SystemUi');

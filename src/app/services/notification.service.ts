import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from '@capacitor/local-notifications';

/**
 * Options for scheduling a local note reminder.
 */
export interface ScheduleReminderOptions {
  noteId: string;
  title: string;
  body: string;
  at: Date;
  existingId?: number;
}

/**
 * Encapsulates Capacitor local notifications for note reminders.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly router = inject(Router);
  private hasListener = false;

  /**
   * Requests notification permissions when running on a native platform.
   */
  async ensurePermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') {
      return true;
    }

    const requested = await LocalNotifications.requestPermissions();
    return requested.display === 'granted';
  }

  /**
   * Registers the tap listener that opens the related note.
   */
  async initTapListener(): Promise<void> {
    if (this.hasListener || !Capacitor.isNativePlatform()) {
      return;
    }

    await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      const noteId = event.notification.extra?.['noteId'] as string | undefined;
      if (noteId) {
        void this.router.navigate(['/notes', noteId]);
      }
    });

    this.hasListener = true;
  }

  /**
   * Schedules a local notification and returns its numeric id.
   */
  async schedule(options: ScheduleReminderOptions): Promise<number | null> {
    const allowed = await this.ensurePermissions();
    if (!allowed) {
      return null;
    }

    if (!Capacitor.isNativePlatform()) {
      // Persist a stable pseudo-id so reminder state can be tested on web.
      return options.existingId ?? Math.floor(Date.now() % 2_000_000_000);
    }

    const id = options.existingId ?? Math.floor(Date.now() % 2_000_000_000);
    const notification: LocalNotificationSchema = {
      id,
      title: options.title,
      body: options.body,
      schedule: { at: options.at, allowWhileIdle: true },
      extra: { noteId: options.noteId },
      sound: undefined,
    };

    await LocalNotifications.schedule({ notifications: [notification] });
    return id;
  }

  /**
   * Cancels a previously scheduled notification.
   */
  async cancel(notificationId: number): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  }
}

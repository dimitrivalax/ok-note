import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  IonBadge,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonSearchbar,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  alarmOutline,
  checkboxOutline,
  documentTextOutline,
  menuOutline,
} from 'ionicons/icons';

import type { Note } from '../models/note.schema';
import { TranslatePipe } from '../pipes/translate.pipe';
import { AlertService } from '../services/alert.service';
import { I18nService } from '../services/i18n.service';
import { NoteService } from '../services/note.service';

/**
 * Lists notes with search, swipe-to-delete, and create actions.
 */
@Component({
  selector: 'app-notes',
  templateUrl: 'notes.page.html',
  styleUrls: ['notes.page.scss'],
  imports: [
    DatePipe,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonSearchbar,
    IonList,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonNote,
    IonBadge,
    IonIcon,
    IonFab,
    IonFabButton,
  ],
})
export class NotesPage implements OnInit {
  private readonly noteService = inject(NoteService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly actionSheetController = inject(ActionSheetController);

  /**
   * I18n service used by the template for locale-aware formatting.
   */
  readonly i18nService = inject(I18nService);

  /**
   * Notes currently displayed in the list.
   */
  readonly notes = signal<Note[]>([]);

  /**
   * Current search query.
   */
  readonly searchQuery = signal('');

  constructor() {
    addIcons({
      addOutline,
      alarmOutline,
      checkboxOutline,
      documentTextOutline,
      menuOutline,
    });
  }

  /**
   * Loads notes on first init.
   */
  ngOnInit(): void {
    void this.reloadNotes();
  }

  /**
   * Reloads notes whenever the view becomes active.
   */
  ionViewWillEnter(): void {
    void this.reloadNotes();
  }

  /**
   * Filters notes when the searchbar value changes.
   */
  async onSearch(event: CustomEvent): Promise<void> {
    const value = String(event.detail.value ?? '');
    this.searchQuery.set(value);
    await this.reloadNotes();
  }

  /**
   * Opens the note editor for an existing note.
   */
  openNote(note: Note): void {
    void this.router.navigate(['/notes', note.id]);
  }

  /**
   * Shows an action sheet to choose text or checklist creation.
   */
  async presentCreateSheet(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: this.i18nService.t('notes.createSheetHeader'),
      buttons: [
        {
          text: this.i18nService.t('notes.createText'),
          data: 'text',
          handler: () => {
            void this.router.navigate(['/notes/new'], { queryParams: { type: 'text' } });
          },
        },
        {
          text: this.i18nService.t('notes.createChecklist'),
          data: 'checklist',
          handler: () => {
            void this.router.navigate(['/notes/new'], {
              queryParams: { type: 'checklist' },
            });
          },
        },
        {
          text: this.i18nService.t('notes.cancel'),
          role: 'cancel',
        },
      ],
    });

    await sheet.present();
  }

  /**
   * Confirms and deletes a note.
   */
  async deleteNote(note: Note): Promise<void> {
    const confirmed = await this.alertService.confirm({
      header: this.i18nService.t('notes.deleteConfirmHeader'),
      message: this.i18nService.t('notes.deleteConfirmMessage'),
      confirmText: this.i18nService.t('notes.deleteConfirmAction'),
    });

    if (!confirmed) {
      return;
    }

    await this.noteService.delete(note.id);
    await this.alertService.toast(this.i18nService.t('notes.deletedToast'), 'success');
    await this.reloadNotes();
  }

  /**
   * Builds a short preview for list rendering.
   */
  getPreview(note: Note): string {
    if (note.type === 'text') {
      return note.content.trim();
    }

    return note.items
      .map((item) => item.text)
      .filter(Boolean)
      .slice(0, 3)
      .join(' · ');
  }

  /**
   * Returns true when every checklist item is checked.
   */
  isChecklistCompleted(note: Note): boolean {
    return (
      note.type === 'checklist' &&
      note.items.length > 0 &&
      note.items.every((item) => item.checked)
    );
  }

  private async reloadNotes(): Promise<void> {
    const notes = await this.noteService.search(this.searchQuery());
    this.notes.set(notes);
  }
}

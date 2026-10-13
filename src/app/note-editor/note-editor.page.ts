import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonReorder,
  IonReorderGroup,
  IonTextarea,
  IonTitle,
  IonToolbar,
  type ItemReorderEventDetail,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { ZodError } from 'zod';

import type { ChecklistItem, Note, NoteType } from '../models/note.schema';
import { TranslatePipe } from '../pipes/translate.pipe';
import { AlertService } from '../services/alert.service';
import { I18nService } from '../services/i18n.service';
import { NoteService } from '../services/note.service';

/**
 * Creates and edits text notes or checklist notes.
 */
@Component({
  selector: 'app-note-editor',
  templateUrl: 'note-editor.page.html',
  styleUrls: ['note-editor.page.scss'],
  imports: [
    DatePipe,
    FormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonLabel,
    IonNote,
    IonCheckbox,
    IonReorderGroup,
    IonReorder,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
  ],
})
export class NoteEditorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly noteService = inject(NoteService);
  private readonly alertService = inject(AlertService);

  /**
   * I18n service used by the template for locale-aware formatting.
   */
  readonly i18nService = inject(I18nService);

  /**
   * Whether the editor is creating a new note.
   */
  readonly isNew = signal(true);

  /**
   * Current note type.
   */
  readonly noteType = signal<NoteType>('text');

  /**
   * Optional note title.
   */
  readonly title = signal('');

  /**
   * Text content for text notes.
   */
  readonly content = signal('');

  /**
   * Checklist items for list notes.
   */
  readonly items = signal<ChecklistItem[]>([]);

  /**
   * Reminder datetime in ISO format, or empty string when unset.
   */
  readonly reminderAt = signal('');

  /**
   * Creation timestamp shown for existing notes.
   */
  readonly createdAt = signal<string | null>(null);

  /**
   * Last update timestamp shown for existing notes.
   */
  readonly updatedAt = signal<string | null>(null);

  private noteId: string | null = null;

  constructor() {
    addIcons({ addOutline, trashOutline });
  }

  /**
   * Loads an existing note or prepares a new draft.
   */
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    const typeParam = this.route.snapshot.queryParamMap.get('type');

    if (!id || id === 'new') {
      this.isNew.set(true);
      this.noteType.set(typeParam === 'checklist' ? 'checklist' : 'text');
      if (this.noteType() === 'checklist') {
        this.addItem();
      }
      return;
    }

    this.isNew.set(false);
    this.noteId = id;
    const note = await this.noteService.getById(id);
    if (!note) {
      await this.alertService.toast(this.i18nService.t('editor.notFoundToast'), 'danger');
      await this.router.navigate(['/tabs/notes']);
      return;
    }

    this.applyNote(note);
  }

  /**
   * Adds an empty checklist item.
   */
  addItem(): void {
    const next: ChecklistItem = {
      id: crypto.randomUUID(),
      text: '',
      checked: false,
      order: this.items().length,
    };
    this.items.update((current) => [...current, next]);
  }

  /**
   * Removes a checklist item by id.
   */
  removeItem(itemId: string): void {
    this.items.update((current) =>
      current.filter((item) => item.id !== itemId).map((item, index) => ({ ...item, order: index }))
    );
  }

  /**
   * Updates checklist item text.
   */
  updateItemText(itemId: string, value: string | null | undefined): void {
    this.items.update((current) =>
      current.map((item) => (item.id === itemId ? { ...item, text: value ?? '' } : item))
    );
  }

  /**
   * Toggles checklist item checked state.
   */
  toggleItemChecked(itemId: string, checked: boolean): void {
    this.items.update((current) =>
      current.map((item) => (item.id === itemId ? { ...item, checked } : item))
    );
  }

  /**
   * Reorders checklist items after a drag-and-drop gesture.
   */
  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const from = event.detail.from;
    const to = event.detail.to;
    const reordered = [...this.items()];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    this.items.set(reordered.map((item, index) => ({ ...item, order: index })));
    event.detail.complete();
  }

  /**
   * Clears the reminder datetime.
   */
  clearReminder(): void {
    this.reminderAt.set('');
  }

  /**
   * Persists the note after validation.
   */
  async save(): Promise<void> {
    const payload = {
      title: this.title().trim() || null,
      type: this.noteType(),
      content: this.content(),
      items: this.items(),
      reminderAt: this.reminderAt() ? new Date(this.reminderAt()).toISOString() : null,
    };

    try {
      if (this.isNew()) {
        await this.noteService.create(payload);
        await this.alertService.toast(this.i18nService.t('editor.createdToast'), 'success');
        await this.router.navigateByUrl('/tabs/notes', { replaceUrl: true });
        return;
      }

      if (!this.noteId) {
        return;
      }

      const updated = await this.noteService.update(this.noteId, payload);
      this.applyNote(updated);
      await this.alertService.toast(this.i18nService.t('editor.savedToast'), 'success');
    } catch (error) {
      if (error instanceof ZodError) {
        await this.alertService.info(
          this.i18nService.t('editor.contentRequiredHeader'),
          this.noteType() === 'text'
            ? this.i18nService.t('editor.contentRequiredText')
            : this.i18nService.t('editor.contentRequiredChecklist')
        );
        return;
      }

      await this.alertService.toast(this.i18nService.t('editor.saveFailedToast'), 'danger');
    }
  }

  /**
   * Deletes the current note after confirmation.
   */
  async deleteCurrent(): Promise<void> {
    if (!this.noteId) {
      return;
    }

    const confirmed = await this.alertService.confirm({
      header: this.i18nService.t('editor.deleteConfirmHeader'),
      message: this.i18nService.t('editor.deleteConfirmMessage'),
      confirmText: this.i18nService.t('editor.deleteConfirmAction'),
    });

    if (!confirmed) {
      return;
    }

    await this.noteService.delete(this.noteId);
    await this.alertService.toast(this.i18nService.t('editor.deletedToast'), 'success');
    await this.router.navigate(['/tabs/notes']);
  }

  private applyNote(note: Note): void {
    this.noteType.set(note.type);
    this.title.set(note.title ?? '');
    this.content.set(note.content);
    this.items.set([...note.items].sort((a, b) => a.order - b.order));
    this.reminderAt.set(note.reminderAt ?? '');
    this.createdAt.set(note.createdAt);
    this.updatedAt.set(note.updatedAt);
  }
}

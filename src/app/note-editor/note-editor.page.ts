import { DatePipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
 * Creates and edits text notes or checklist notes with debounced auto-save.
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
export class NoteEditorPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly noteService = inject(NoteService);
  private readonly alertService = inject(AlertService);

  /**
   * I18n service used by the template for locale-aware formatting.
   */
  readonly i18nService = inject(I18nService);

  /**
   * Whether the editor is creating a new note that has not been persisted yet.
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
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private isHydrating = false;
  private isSaving = false;
  private readonly autoSaveDelayMs = 500;

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
      this.isHydrating = true;
      this.isNew.set(true);
      this.noteType.set(typeParam === 'checklist' ? 'checklist' : 'text');
      if (this.noteType() === 'checklist') {
        this.addItem();
      }
      this.isHydrating = false;
      return;
    }

    this.isHydrating = true;
    this.isNew.set(false);
    this.noteId = id;
    const note = await this.noteService.getById(id);
    if (!note) {
      this.isHydrating = false;
      await this.alertService.toast(this.i18nService.t('editor.notFoundToast'), 'danger');
      await this.router.navigate(['/tabs/notes']);
      return;
    }

    this.applyNote(note);
    this.isHydrating = false;
  }

  /**
   * Flushes a pending auto-save when leaving the editor.
   */
  ionViewWillLeave(): void {
    void this.flushPendingAutoSave();
  }

  /**
   * Clears the debounce timer on destroy.
   */
  ngOnDestroy(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }

  /**
   * Persists pending edits before the router navigates away.
   *
   * @returns Always true so navigation can continue after the flush
   */
  async flushPendingAutoSave(): Promise<boolean> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }

    await this.waitForSaveIdle();
    await this.autoSave();
    await this.waitForSaveIdle();
    return true;
  }

  /**
   * Updates the title and schedules an auto-save.
   */
  onTitleChange(value: string | null | undefined): void {
    this.title.set(value ?? '');
    this.scheduleAutoSave();
  }

  /**
   * Updates text content and schedules an auto-save.
   */
  onContentChange(value: string | null | undefined): void {
    this.content.set(value ?? '');
    this.scheduleAutoSave();
  }

  /**
   * Updates the reminder and schedules an auto-save.
   */
  onReminderChange(value: string | null | undefined): void {
    this.reminderAt.set(value ?? '');
    this.scheduleAutoSave();
  }

  /**
   * Clears the reminder datetime.
   */
  clearReminder(): void {
    this.reminderAt.set('');
    this.scheduleAutoSave();
  }

  /**
   * Adds an empty checklist item at the end.
   *
   * @returns The id of the created item
   */
  addItem(): string {
    const next: ChecklistItem = {
      id: crypto.randomUUID(),
      text: '',
      checked: false,
      order: this.items().length,
    };
    this.items.update((current) => [...current, next]);
    this.scheduleAutoSave();
    return next.id;
  }

  /**
   * Adds an empty checklist item after the given item and focuses it.
   */
  onChecklistEnter(itemId: string, event: Event): void {
    event.preventDefault();
    const newId = this.addItemAfter(itemId);
    this.focusChecklistItem(newId);
  }

  /**
   * Removes a checklist item by id.
   */
  removeItem(itemId: string): void {
    this.items.update((current) =>
      current.filter((item) => item.id !== itemId).map((item, index) => ({ ...item, order: index }))
    );
    this.scheduleAutoSave();
  }

  /**
   * Updates checklist item text.
   */
  updateItemText(itemId: string, value: string | null | undefined): void {
    this.items.update((current) =>
      current.map((item) => (item.id === itemId ? { ...item, text: value ?? '' } : item))
    );
    this.scheduleAutoSave();
  }

  /**
   * Toggles checklist item checked state.
   */
  toggleItemChecked(itemId: string, checked: boolean): void {
    this.items.update((current) =>
      current.map((item) => (item.id === itemId ? { ...item, checked } : item))
    );
    this.scheduleAutoSave();
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
    this.scheduleAutoSave();
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

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }

    await this.noteService.delete(this.noteId);
    this.noteId = null;
    await this.alertService.toast(this.i18nService.t('editor.deletedToast'), 'success');
    await this.router.navigate(['/tabs/notes']);
  }

  private addItemAfter(afterId: string): string {
    const next: ChecklistItem = {
      id: crypto.randomUUID(),
      text: '',
      checked: false,
      order: 0,
    };

    this.items.update((current) => {
      const index = current.findIndex((item) => item.id === afterId);
      const insertAt = index >= 0 ? index + 1 : current.length;
      const updated = [...current];
      updated.splice(insertAt, 0, next);
      return updated.map((item, order) => ({ ...item, order }));
    });

    this.scheduleAutoSave();
    return next.id;
  }

  private focusChecklistItem(itemId: string): void {
    setTimeout(() => {
      const input = document.querySelector(
        `[data-testid="checklist-text-${itemId}"]`
      ) as HTMLIonInputElement | null;
      void input?.setFocus();
    }, 50);
  }

  private scheduleAutoSave(): void {
    if (this.isHydrating) {
      return;
    }

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.autoSave();
    }, this.autoSaveDelayMs);
  }

  private async waitForSaveIdle(): Promise<void> {
    while (this.isSaving) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  private canPersist(): boolean {
    if (this.noteType() === 'text') {
      return this.content().trim().length > 0;
    }

    return this.items().some((item) => item.text.trim().length > 0);
  }

  private buildPayload() {
    return {
      title: this.title().trim() || null,
      type: this.noteType(),
      content: this.content(),
      items: this.items(),
      reminderAt: this.reminderAt() ? new Date(this.reminderAt()).toISOString() : null,
    };
  }

  private async autoSave(): Promise<void> {
    if (this.isHydrating || !this.canPersist()) {
      return;
    }

    if (this.isSaving) {
      this.scheduleAutoSave();
      return;
    }

    this.isSaving = true;
    const payload = this.buildPayload();

    try {
      if (this.isNew()) {
        const created = await this.noteService.create(payload);
        this.noteId = created.id;
        this.isNew.set(false);
        this.createdAt.set(created.createdAt);
        this.updatedAt.set(created.updatedAt);
        this.location.replaceState(`/tabs/notes/${created.id}`);
        return;
      }

      if (!this.noteId) {
        return;
      }

      const updated = await this.noteService.update(this.noteId, payload);
      this.updatedAt.set(updated.updatedAt);
    } catch (error) {
      if (error instanceof ZodError) {
        return;
      }

      await this.alertService.toast(this.i18nService.t('editor.saveFailedToast'), 'danger');
    } finally {
      this.isSaving = false;
    }
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

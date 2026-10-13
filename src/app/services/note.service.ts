import { Injectable, inject } from '@angular/core';

import {
  createNoteInputSchema,
  noteSchema,
  updateNoteInputSchema,
  type CreateNoteInput,
  type Note,
  type UpdateNoteInput,
} from '../models/note.schema';
import { I18nService } from './i18n.service';
import { noteDb } from './note-db';
import { NotificationService } from './notification.service';

/**
 * Centralized CRUD and search service for notes.
 */
@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly notificationService = inject(NotificationService);
  private readonly i18nService = inject(I18nService);

  /**
   * Returns all notes ordered by most recently updated.
   */
  async getAll(): Promise<Note[]> {
    return noteDb.notes.orderBy('updatedAt').reverse().toArray();
  }

  /**
   * Returns a note by id, or undefined when missing.
   */
  async getById(id: string): Promise<Note | undefined> {
    return noteDb.notes.get(id);
  }

  /**
   * Searches notes by title, content, or checklist item text.
   */
  async search(query: string): Promise<Note[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.getAll();
    }

    const notes = await this.getAll();
    return notes.filter((note) => {
      const titleMatch = (note.title ?? '').toLowerCase().includes(normalized);
      const contentMatch = note.content.toLowerCase().includes(normalized);
      const itemsMatch = note.items.some((item) => item.text.toLowerCase().includes(normalized));
      return titleMatch || contentMatch || itemsMatch;
    });
  }

  /**
   * Creates a note after Zod validation. Rejects empty content.
   */
  async create(input: CreateNoteInput): Promise<Note> {
    const parsedInput = createNoteInputSchema.parse(input);
    const now = new Date().toISOString();
    const noteCandidate: Note = {
      id: crypto.randomUUID(),
      title: parsedInput.title?.trim() || null,
      type: parsedInput.type,
      content: parsedInput.content,
      items: this.normalizeItems(parsedInput.items),
      createdAt: now,
      updatedAt: now,
      reminderAt: parsedInput.reminderAt ?? null,
      notificationId: null,
    };

    const note = noteSchema.parse(noteCandidate);
    const withReminder = await this.syncReminder(note);
    await noteDb.notes.put(withReminder);
    return withReminder;
  }

  /**
   * Updates an existing note.
   */
  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Note not found: ${id}`);
    }

    const parsedInput = updateNoteInputSchema.parse(input);
    const merged: Note = {
      ...existing,
      title:
        parsedInput.title !== undefined
          ? parsedInput.title?.trim() || null
          : existing.title,
      type: parsedInput.type ?? existing.type,
      content: parsedInput.content ?? existing.content,
      items:
        parsedInput.items !== undefined
          ? this.normalizeItems(parsedInput.items)
          : existing.items,
      reminderAt:
        parsedInput.reminderAt !== undefined ? parsedInput.reminderAt : existing.reminderAt,
      notificationId:
        parsedInput.notificationId !== undefined
          ? parsedInput.notificationId
          : existing.notificationId,
      updatedAt: new Date().toISOString(),
    };

    const note = noteSchema.parse(merged);
    const withReminder = await this.syncReminder(note);
    await noteDb.notes.put(withReminder);
    return withReminder;
  }

  /**
   * Deletes a note and cancels any scheduled reminder.
   */
  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (existing?.notificationId != null) {
      await this.notificationService.cancel(existing.notificationId);
    }
    await noteDb.notes.delete(id);
  }

  private normalizeItems(
    items: Note['items']
  ): Note['items'] {
    return items
      .map((item, index) => ({
        ...item,
        text: item.text,
        order: index,
      }))
      .filter((item) => item.text.trim().length > 0 || item.checked);
  }

  private async syncReminder(note: Note): Promise<Note> {
    if (note.notificationId != null) {
      await this.notificationService.cancel(note.notificationId);
    }

    if (!note.reminderAt) {
      return { ...note, notificationId: null };
    }

    const reminderDate = new Date(note.reminderAt);
    if (Number.isNaN(reminderDate.getTime()) || reminderDate.getTime() <= Date.now()) {
      return { ...note, reminderAt: null, notificationId: null };
    }

    const title = note.title?.trim() || 'OK! Note';
    const body =
      note.type === 'text'
        ? note.content.slice(0, 120)
        : note.items
            .map((item) => item.text)
            .filter(Boolean)
            .slice(0, 3)
            .join(', ') || this.i18nService.t('notifications.checklistReminder');

    const notificationId = await this.notificationService.schedule({
      noteId: note.id,
      title,
      body,
      at: reminderDate,
      existingId: note.notificationId ?? undefined,
    });

    return { ...note, notificationId };
  }
}

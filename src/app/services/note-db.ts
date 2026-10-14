import Dexie, { type Table } from 'dexie';

import type { Note } from '../models/note.schema';

/**
 * IndexedDB database for Ok! Note persistence.
 */
export class NoteDatabase extends Dexie {
  /**
   * Notes table.
   */
  notes!: Table<Note, string>;

  /**
   * Creates the Dexie database schema.
   */
  constructor() {
    super('ok-note');
    this.version(1).stores({
      notes: 'id, updatedAt, type, createdAt',
    });
  }
}

/**
 * Shared Dexie database instance.
 */
export const noteDb = new NoteDatabase();

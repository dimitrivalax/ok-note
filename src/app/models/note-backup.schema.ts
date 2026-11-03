import { z } from 'zod';

import { noteSchema, type Note } from './note.schema';

/**
 * Current backup file format version.
 */
export const NOTE_BACKUP_VERSION = 1 as const;

/**
 * Schema for a note stored inside a backup file.
 * Device-local `notificationId` values are omitted on export.
 */
export const backupNoteSchema = noteSchema;

/**
 * Schema for an Ok! Note JSON backup envelope.
 */
export const noteBackupEnvelopeSchema = z.object({
  version: z.literal(NOTE_BACKUP_VERSION),
  exportedAt: z.string().datetime(),
  notes: z.array(backupNoteSchema),
});

export type NoteBackupEnvelope = z.infer<typeof noteBackupEnvelopeSchema>;

/**
 * Parses and validates a backup JSON string.
 *
 * @param raw - File contents to parse.
 * @returns The validated backup envelope.
 */
export function parseNoteBackupJson(raw: string): NoteBackupEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid backup JSON');
  }

  return noteBackupEnvelopeSchema.parse(parsed);
}

/**
 * Builds a versioned backup envelope from notes, stripping notification ids.
 *
 * @param notes - Notes currently stored in the app.
 * @returns A serializable backup envelope.
 */
export function createNoteBackupEnvelope(notes: Note[]): NoteBackupEnvelope {
  return {
    version: NOTE_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    notes: notes.map((note) => {
      const { notificationId: _notificationId, ...rest } = note;
      return rest;
    }),
  };
}

/**
 * Builds the download filename for a backup taken at `now`.
 *
 * @param now - Timestamp used in the filename (local date).
 * @returns A `ok-note-backup-YYYY-MM-DD.json` filename.
 */
export function buildBackupFilename(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `ok-note-backup-${year}-${month}-${day}.json`;
}

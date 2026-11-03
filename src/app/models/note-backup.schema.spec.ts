import { ZodError } from 'zod';

import type { Note } from './note.schema';
import {
  buildBackupFilename,
  createNoteBackupEnvelope,
  parseNoteBackupJson,
} from './note-backup.schema';

/**
 * Builds a valid text note for backup tests.
 */
function createTextNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Courses',
    type: 'text',
    content: 'Acheter du pain',
    items: [],
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
    reminderAt: null,
    notificationId: 42,
    ...overrides,
  };
}

describe('note backup schema', () => {
  it('parses a valid version 1 envelope', () => {
    const envelope = parseNoteBackupJson(
      JSON.stringify({
        version: 1,
        exportedAt: '2026-11-03T09:00:00.000Z',
        notes: [createTextNote({ notificationId: null })],
      })
    );

    expect(envelope.version).toBe(1);
    expect(envelope.notes).toHaveLength(1);
    expect(envelope.notes[0]?.title).toBe('Courses');
  });

  it('rejects unknown backup versions', () => {
    expect(() =>
      parseNoteBackupJson(
        JSON.stringify({
          version: 2,
          exportedAt: '2026-11-03T09:00:00.000Z',
          notes: [],
        })
      )
    ).toThrow(ZodError);
  });

  it('rejects invalid JSON text', () => {
    expect(() => parseNoteBackupJson('{not-json')).toThrow('Invalid backup JSON');
  });

  it('rejects a backup that contains an invalid note', () => {
    expect(() =>
      parseNoteBackupJson(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-11-03T09:00:00.000Z',
          notes: [createTextNote({ content: '   ' })],
        })
      )
    ).toThrow(ZodError);
  });

  it('strips notification ids when creating an envelope', () => {
    const envelope = createNoteBackupEnvelope([createTextNote()]);

    expect(envelope.version).toBe(1);
    expect(envelope.notes[0]?.notificationId).toBeUndefined();
    expect(JSON.stringify(envelope)).not.toContain('notificationId');
  });

  it('builds a dated backup filename', () => {
    expect(buildBackupFilename(new Date(2026, 10, 3))).toBe('ok-note-backup-2026-11-03.json');
  });
});

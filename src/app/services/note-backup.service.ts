import { Injectable, inject } from '@angular/core';

import {
  buildBackupFilename,
  createNoteBackupEnvelope,
  parseNoteBackupJson,
} from '../models/note-backup.schema';
import { FileTransferService } from './file-transfer.service';
import { NoteService } from './note.service';

/**
 * Exports and restores notes through a versioned JSON backup file.
 */
@Injectable({
  providedIn: 'root',
})
export class NoteBackupService {
  private readonly noteService = inject(NoteService);
  private readonly fileTransferService = inject(FileTransferService);

  /**
   * Writes a JSON backup of every note to a downloadable or shareable file.
   *
   * @returns The number of notes included in the backup.
   */
  async exportToFile(): Promise<number> {
    const notes = await this.noteService.getAll();
    const envelope = createNoteBackupEnvelope(notes);
    const filename = buildBackupFilename();
    await this.fileTransferService.saveTextFile(
      filename,
      `${JSON.stringify(envelope, null, 2)}\n`,
      'application/json'
    );
    return notes.length;
  }

  /**
   * Validates backup JSON and replaces all stored notes with its contents.
   *
   * @param raw - Backup file text.
   * @returns The number of notes restored.
   */
  async importFromText(raw: string): Promise<number> {
    const envelope = parseNoteBackupJson(raw);
    await this.noteService.replaceAll(envelope.notes);
    return envelope.notes.length;
  }
}

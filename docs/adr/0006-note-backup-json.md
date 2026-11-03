# 0006. JSON backup for note import and export

## Status

Accepted

## Context

Notes are local-first in Dexie. Users need a portable backup they can download and restore from Settings, without a backend or account. Import is a restore: the current note set is replaced by the file contents.

## Decision

Use a versioned UTF-8 JSON envelope:

- `version`: literal `1`
- `exportedAt`: ISO datetime
- `notes`: array of notes validated with `noteSchema`

Entry point is the Settings page. Export writes `ok-note-backup-YYYY-MM-DD.json`. Import parses and validates the whole file first; only then `NoteService.replaceAll` clears IndexedDB and writes the imported notes.

`notificationId` is omitted on export because it is device-local. Future `reminderAt` values are rescheduled on import. File I/O goes through `FileTransferService` (browser download on web; Filesystem cache + Share on native).

Key sources: `src/app/models/note-backup.schema.ts`, `src/app/services/note-backup.service.ts`, `src/app/services/file-transfer.service.ts`.

## Consequences

- Restore is destructive; the UI must confirm before opening the file picker.
- Invalid files leave existing notes unchanged.
- A later format change requires a new `version` and an explicit migration path.
- Native export depends on Capacitor Filesystem and Share; e2e covers the web download path.

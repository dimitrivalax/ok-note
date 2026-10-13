# 0001. Local-first storage with Dexie / IndexedDB

## Status

Accepted

## Context

OK! Note must work offline on web and Android without a backend. Notes need structured queries (by id, type, timestamps) and durable client-side storage that works in the browser and the Capacitor WebView.

## Decision

Persist notes in IndexedDB through Dexie.

- Database name: `ok-note`
- Table: `notes` indexed by `id, updatedAt, type, createdAt`
- Access via `NoteDatabase` / `noteDb` and `NoteService` for CRUD and search

Key sources: `src/app/services/note-db.ts`, `src/app/services/note.service.ts`.

## Consequences

- No server dependency or account model; privacy and offline use are straightforward.
- Sync, multi-device, and backup must be designed later if needed.
- Search is client-side over loaded notes rather than a full-text index.

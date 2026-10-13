# 0002. Zod as note schema and write-path validation

## Status

Accepted

## Context

Notes support two shapes (text and checklist) with different required fields. Runtime validation is needed on create/update so invalid data never reaches IndexedDB, and TypeScript types should stay aligned with that schema.

## Decision

Define note shapes with Zod schemas and infer TypeScript types from them.

- `noteSchema` with discriminated rules for `text` vs `checklist`
- `createNoteInputSchema` / `updateNoteInputSchema` for write payloads
- `NoteService` validates inputs before persistence

Key source: `src/app/models/note.schema.ts`.

## Consequences

- Single source of truth for structure and validation.
- Schema changes require coordinated updates to UI, services, and any migrations.
- Slight runtime cost on writes; acceptable for local-first note volume.

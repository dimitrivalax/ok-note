# Architecture Decision Records

ADRs capture significant technical decisions for Ok! Note.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-local-first-dexie.md) | Local-first storage with Dexie / IndexedDB | Accepted |
| [0002](0002-zod-note-schema.md) | Zod as note schema and write-path validation | Accepted |
| [0003](0003-custom-i18n.md) | Custom lightweight i18n | Accepted |
| [0004](0004-capacitor-plugin-services.md) | Capacitor plugins via services; web-safe stubs | Accepted |
| [0005](0005-playwright-e2e.md) | Playwright e2e as primary QA; Vitest for unit tests | Accepted |

## Adding an ADR

1. Copy the template below into `docs/adr/NNNN-short-title.md` (next free number).
2. Fill Status, Context, Decision, and Consequences.
3. Add a row to the index in this file.

### Template

```markdown
# NNNN. Title

## Status

Accepted | Proposed | Deprecated | Superseded by NNNN

## Context

What problem or constraint led to this decision?

## Decision

What did we choose?

## Consequences

What follows from this choice (positive and negative)?
```

# 0005. Playwright e2e as primary QA; Vitest for unit tests

## Status

Accepted

## Context

Critical flows (notes, checklists, search, i18n, theme) are UI-driven and depend on IndexedDB. Unit tests alone would miss integration bugs. The team wants reliable browser automation without heavy Cypress setup.

## Decision

- Use Playwright for end-to-end tests (`e2e/`, `npm run e2e`), Chromium-focused, with IndexedDB reset per test and `data-testid` / role-based locators.
- Use Vitest through the Angular unit-test builder for component/service unit tests (`npm test`).

Key sources: `playwright.config.ts`, `package.json` scripts.

## Consequences

- User-path coverage is the primary quality gate for features.
- Unit coverage is still thin and should grow for services and schemas.
- CI should install Playwright browsers when running e2e.

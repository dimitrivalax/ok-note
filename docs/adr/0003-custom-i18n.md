# 0003. Custom lightweight i18n

## Status

Accepted

## Context

The app needs English and French UI strings with a persisted locale preference. Full frameworks (ngx-translate, Angular i18n build-time localization) add dependency weight and build complexity beyond current needs.

## Decision

Ship a small custom i18n layer:

- Flat JSON catalogs in `src/assets/i18n/` (`en.json`, `fr.json`)
- `I18nService` loads catalogs, persists locale via Capacitor Preferences, sets `document.documentElement.lang`
- Impure `translate` pipe for templates

Key sources: `src/app/services/i18n.service.ts`, `src/app/pipes/translate.pipe.ts`.

## Consequences

- Easy to extend with more locales by adding JSON files.
- No ICU / pluralization tooling unless we add it later.
- Call sites must use consistent keys; missing keys need discipline or fallbacks in the service.

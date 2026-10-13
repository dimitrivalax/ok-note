# 0004. Capacitor plugins via services; web-safe stubs

## Status

Accepted

## Context

Theme, locale, and reminders use Capacitor plugins (`Preferences`, `LocalNotifications`). Pages should stay testable on web and free of platform conditionals. E2E runs in Chromium without a native notification stack.

## Decision

Wrap Capacitor APIs in injectable services.

- Pages call `ThemeService`, `I18nService`, `NotificationService` only.
- Preferences keys live in `src/app/constants/storage-keys.ts`.
- On non-native platforms, `NotificationService` uses stubs that still return a pseudo notification id so reminder state remains usable in browser and Playwright.

Key sources: `src/app/services/notification.service.ts`, `src/app/services/theme.service.ts`.

## Consequences

- Clear boundary for native behavior and mocks.
- New plugins should follow the same service encapsulation pattern.
- Web reminders do not fire real notifications; native verification still needs a device or emulator.

# OK! Note

Local-first notes and checklists for web and Android. Create text notes or checklists, search them, set reminders, and switch language (EN/FR) or theme (light/dark)—all data stays on the device.

## Features

- Text and checklist notes
- Search across notes
- Optional reminders (local notifications on native)
- English and French UI
- Light and dark themes
- Offline storage (IndexedDB via Dexie)

## Stack

- [Ionic](https://ionicframework.com/) Angular (standalone)
- [Capacitor](https://capacitorjs.com/) 8 (Android)
- [Dexie](https://dexie.org/) / IndexedDB
- [Zod](https://zod.dev/) for note schemas and validation
- [Playwright](https://playwright.dev/) for end-to-end tests
- Vitest (via Angular unit-test builder) for unit tests

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm

## Setup

```bash
npm install
npm start
```

Open the URL printed by the Angular CLI (typically `http://localhost:4200`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Serve the app locally |
| `npm run build` | Production build to `www/` |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
| `npm run e2e` | Playwright end-to-end tests |
| `npm run e2e:ui` | Playwright UI mode |

### Android

After a web build, sync and open the native project:

```bash
npm run build
npx cap sync android
npx cap open android
```

App ID: `com.ok.note`.

## Documentation

- [Architecture overview](docs/architecture.md)
- [Architecture Decision Records](docs/adr/)
- [Contributing](CONTRIBUTING.md)

## License

Copyright (c) 2026 Dimitri Valax.

Licensed under the [EUPL-1.2](LICENSE).

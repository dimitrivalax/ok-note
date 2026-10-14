# Contributing

Thanks for your interest in Ok! Note. This guide covers the essentials for local development and pull requests.

## Development setup

1. Install dependencies: `pnpm install`
2. Start the app: `pnpm start`
3. Run checks before opening a PR:
   - `pnpm run lint`
   - `pnpm test`
   - `pnpm run e2e` (when you change user-facing flows)

Use **pnpm** as the supported package manager (`pnpm-lock.yaml`). The `packageManager` field in `package.json` pins the version.

## Pull requests

- Prefer small, focused changes.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (for example `feat:`, `fix:`, `docs:`).
- Describe the motivation and how you verified the change.
- Update or add docs/ADRs when you change an architectural decision.
- GitHub Actions runs `quality` (lint), `build`, `test`, and `e2e` on pull requests to `main` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Project conventions

- Prefer Ionic components and standalone Angular APIs (`inject`, signals where already used).
- Keep Capacitor / native plugins behind services; do not call them directly from pages.
- Persist preferences through the centralized keys in `src/app/constants/storage-keys.ts`.
- Validate note write paths with Zod schemas in `src/app/models/note.schema.ts`.
- Prefer Playwright role-based or `data-testid` locators in e2e tests.

## Documentation and ADRs

- Architecture overview: [`docs/architecture.md`](docs/architecture.md)
- New ADRs: copy the template described in [`docs/adr/README.md`](docs/adr/README.md) and add the next numbered file under `docs/adr/`.

## License

By contributing, you agree that your contributions are licensed under the [EUPL-1.2](LICENSE).

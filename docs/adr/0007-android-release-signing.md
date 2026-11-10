# 0007. Android release signing and upload key management

## Status

Accepted

## Context

Publishing Ok! Note to Google Play (Internal Testing track and production releases) requires building signed Android App Bundles (`.aab`).

Security and operational constraints:
- Keystores and passphrases must never be checked into version control.
- Losing a signing key historically meant losing the ability to update the application permanently.
- The build process must be reproducible both locally and in future CI/CD pipelines without manual prompts or hardcoded secrets.

## Decision

Adopt **Google Play App Signing** with a separated **Upload Key** strategy:

1. **Upload Key separation**:
   - Generate a dedicated upload keystore (`oknote-upload-key.jks`) using PKCS12 / RSA.
   - Google Play retains and protects the master application signing key. In case of lost credentials or machine disaster, the upload key can be safely reset through the Google Play Console without stranding existing users.

2. **Credentials storage & backup**:
   - Keep keystore and credential files locally under `credentials/android/`, strictly ignored by `.gitignore` along with `key.properties`, `*.jks`, and `*.keystore`.
   - Store the passphrases, alias, and an encrypted copy of `oknote-upload-key.jks` as an attachment in a password manager (e.g., Bitwarden, 1Password) to guarantee disaster recovery.

3. **Decoupled Gradle configuration**:
   - Read signing parameters dynamically in `android/app/build.gradle` via `key.properties` (checking `android/key.properties` and `credentials/android/key.properties`) with environment variable fallback (`KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`).
   - If release credentials are missing, Gradle skips signing gracefully instead of failing debug and development tasks.

Key sources: `android/app/build.gradle`, `credentials/android/key.properties.example`, `.gitignore`.

## Consequences

- Releases can be built and signed in a single command (`./gradlew bundleRelease`).
- No secrets or certificates are committed to the repository.
- Upload key loss is recoverable via Google Play Console support.
- New developer workstations need `credentials/android/key.properties` configured from the password manager before building release bundles locally.


# 0008. Google Play Store listing and metadata

## Status

Accepted

## Context

Publishing Ok! Note on the Google Play Store requires defining official store presence metadata:
- Application name, short description, and full description under strict character constraints (title ≤ 30, short description ≤ 80, full description ≤ 4000).
- Localization for core target audiences (French as primary, English for international reach).
- Declarations for Google Play's mandatory Data Safety section aligned with the application's local-first architecture and privacy commitments.
- Requirements for visual store assets (app icon, feature banner, and phone screenshots).

A version-controlled source of truth ensures marketing copy, feature descriptions, and privacy declarations remain consistent with the codebase.

## Decision

Adopt the following standardized store listing, bilingual copy, and Data Safety declarations for Google Play:

### 1. General Classification
- **Category**: Productivity
- **Tags**: Note-taking, Checklists, To-do list, Productivity, Offline, Minimalist
- **Business model**: Free, zero ads, no in-app purchases

### 2. French Store Listing (`fr-FR`)

- **Title (≤ 30 chars)**:
  `Ok! Note – Notes & Checklists` (29 chars)
- **Short description (≤ 80 chars)**:
  `Notes et listes à cocher simples, rapides et 100 % hors-ligne.` (62 chars)
- **Full description (≤ 4000 chars)**:
  ```text
  Ok! Note est l’application idéale pour capturer vos pensées, organiser vos journées et gérer vos listes du quotidien en toute simplicité.

  Conçue selon les principes du « local-first », Ok! Note place le respect de votre vie privée et la rapidité au cœur de l'expérience : aucune création de compte obligatoire, aucune publicité, et toutes vos données restent strictement stockées sur votre appareil.

  POURQUOI CHOISIR OK! NOTE ?

  📝 Notes & Listes à cocher interactives
  Basculez facilement entre des notes textuelles libres et des checklists dynamiques pour vos courses, vos tâches quotidiennes ou vos projets.

  ⚡ Rapide et disponible 100 % hors-ligne
  L'application s'ouvre instantanément et fonctionne parfaitement sans connexion Internet. Vos notes sont enregistrées localement sur votre téléphone.

  🔔 Rappels & Notifications
  Ne manquez plus aucun événement grâce aux rappels programmés avec notifications locales, fiables et discrètes.

  🔍 Recherche instantanée
  Retrouvez n'importe quelle note ou élément de liste en quelques frappes grâce au moteur de recherche intégré ultra-rapide.

  🔒 Vos données vous appartiennent
  • Zéro traqueur, zéro publicité intrusive.
  • Aucun compte requis.
  • Sauvegarde et restauration complètes au format JSON en un clic depuis les Réglages pour exporter ou transférer facilement vos notes.

  🎨 Personnalisable et soignée
  • Thèmes Sombre et Clair adaptés à vos préférences et au confort visuel.
  • Interface soignée, intuitive et disponible en Français et en Anglais.

  Téléchargez Ok! Note dès aujourd'hui et reprenez le contrôle de vos notes !
  ```

### 3. English Store Listing (`en-US`)

- **Title (≤ 30 chars)**:
  `Ok! Note – Notes & Checklists` (29 chars)
- **Short description (≤ 80 chars)**:
  `Simple, fast notes and checklists. 100% offline and privacy-friendly.` (69 chars)
- **Full description (≤ 4000 chars)**:
  ```text
  Ok! Note is the lightweight, distraction-free app designed to capture your ideas, manage to-do lists, and keep you organized every day.

  Built with a local-first philosophy, Ok! Note puts your privacy and speed first: no mandatory account creation, zero ads, zero tracking, and your data stays strictly on your device.

  KEY FEATURES:

  📝 Text Notes & Interactive Checklists
  Effortlessly switch between free-form notes and interactive to-do checklists for shopping, daily tasks, or projects.

  ⚡ Lightning Fast & 100% Offline
  Opens instantly and works without an internet connection. Everything is saved locally on your smartphone.

  🔔 Reminders & Local Notifications
  Set reminders on your notes to ensure you never miss an important task, powered by native local notifications.

  🔍 Instant Search
  Quickly find any note or checklist item with fast instant keyword search.

  🔒 Your Privacy, Guaranteed
  • No trackers, no telemetry, no ads.
  • No account or login required.
  • Complete JSON backup and restore with a single tap in Settings to safeguard or transfer your data anytime.

  🎨 Elegant & Customizable
  • Seamless Light and Dark modes for comfortable reading day or night.
  • Clean, modern interface available in both English and French.

  Simplify your note-taking with Ok! Note today!
  ```

### 4. Google Play Data Safety Declarations

- **Data collection & sharing**: Answer **No** (no user data is collected, stored remotely, or shared with third parties).
- **Data encryption in transit**: Not applicable (no network transmission of user notes).
- **Account deletion**: Not applicable (no account system exists).
- **Declared runtime permissions**:
  - `POST_NOTIFICATIONS`: Declared solely for delivering user-scheduled reminders locally.

### 5. Visual Asset Specifications

| Asset | Format & Dimensions |
|---|---|
| **App Icon** | 512 × 512 px, 32-bit PNG (no transparency), max 1 MB |
| **Feature Graphic (Banner)** | 1024 × 500 px, 24-bit PNG or JPEG, max 15 MB |
| **Phone Screenshots** | Min. 2 (max. 8), 16:9 or 9:16 ratio (e.g. 1080 × 1920 or 1080 × 2400) |

## Consequences

- Store copy and privacy commitments are tracked in Git alongside the source code.
- Updates to permissions or feature sets require an update to this record and the Google Play Console simultaneously.
- Simplifies onboarding, store updates, and future deployments to alternate stores (e.g. F-Droid, Amazon Appstore).


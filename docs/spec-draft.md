# LifeOS v4 Specification Draft

Created: 2026-05-05
Updated: 2026-05-28
Status: current working specification

## Purpose

LifeOS v4 is a personal modular Windows desktop application for managing major life areas in one coherent local-first system.

LifeOS v4 is being built exclusively for the owner's own use first. It should optimize for the owner's real daily workflows, even when that makes the current product less generic than a public app would need to be. The product should still keep clean module boundaries, durable data contracts, and reusable architecture where practical, because the long-term plan is to create a separate user-facing application later from the validated LifeOS v4 ideas.

The first version is a personal MVP and private dogfood product, not a public-user launch target. Future mobile versions are expected, but they are not part of the first build.

The main product problem is desynchronization across separate services: tasks, calendar, notes, habits, diary, finance, health, and project context are currently split across multiple apps. LifeOS v4 should become one customizable personal operating system where the owner can start the day, execute work, record data, and keep life areas under control without constant app switching.

## Product Shape

LifeOS v4 starts as a broad 14-module application:

1. Home
2. Tasks
3. Habits
4. Calendar
5. Projects
6. Contacts
7. Notes
8. Quick Notes
9. Diary
10. Physical Health
11. Finance
12. Focus
13. Trading
14. Settings

The central daily hub is Home, Tasks, Habits, and Calendar. Focus is deep and important, can run with or without a selected task, and does not appear as a planned item on Home or Calendar in the MVP.

The product feeling should be a dense, calm, useful personal workspace: more like a custom operating system for daily life than a notebook with extra features.

## Current Scope

Deep MVP modules:

- Home
- Tasks
- Habits
- Calendar
- Focus
- Notes
- Quick Notes

Basic but real MVP modules:

- Projects
- Contacts
- Diary
- Physical Health
- Finance
- Trading
- Settings

Each visible module must have a concrete workflow. A module can be shallow, but it should not be a polished placeholder.

Release-support note: Finance has canonical Rust/SQLite storage for accounts, transactions, and budgets. Quick Notes also uses canonical Rust/SQLite storage and a native desktop mini-window from its first durable implementation. Projects, Contacts, Diary, Physical Health, and Trading are now promoted out of the interim frontend snapshot: their packaged desktop source of truth is canonical SQLite storage, with Diary also writing synchronized Markdown files under `diary/YYYY-MM-DD.md` in the resolved data root. Browser/Vite preview still uses `localStorage` only when the Tauri runtime is unavailable.

Projects, Contacts, Diary, Physical Health, and Trading also have the current
basic-module UX maturity baseline: useful empty states, async loading states,
recoverable error states, honest disabled primary actions, keyboard-reachable
creation/editing flows, stable focus rings, compact Settings shortcuts where the
owner naturally expects configuration, and no visible technical helper copy in
active module UI except explicit release/data limitations.

Standalone reminder records are part of the MVP storage and delivery model, but the visible create/edit management surface for independent reminders is still unresolved. The backend already supports standalone reminder create/list/due paths and Home can show standalone reminder cards. A full Reminders module / notification center is future work unless the owner promotes it earlier; that future module should manage all reminders across LifeOS: create independent reminders, edit them, and delete/edit any reminder including reminders linked to tasks, habits, Calendar events, or later source records.

## Release Target

Current release target: private dogfood only.

Strategic product target: personal-first validation. This repository should not be treated as the future public app itself. After LifeOS v4 becomes ideal for the owner's own use, a new application for users may be created from the proven workflows, architecture lessons, and design decisions. That future public productization is deferred and separate from the current private desktop build.

The current Windows `.exe` / NSIS installer target is an owner-only dogfood
handoff for daily personal use and feedback collection. It may be unsigned and
use the placeholder publisher only when those limits are explicitly documented
in the handoff notes.

The owner is currently a solo developer without a separate legal entity/company. Public release documentation must not invent a publisher identity. A public signed Windows release should use a code-signing certificate tied to the owner's real individual legal name, or wait until an appropriate legal entity/certificate exists.

The private dogfood installer keeps Tauri WebView2 mode `downloadBootstrapper`.
This preserves a small installer, but a target Windows machine without WebView2
may need network access during install. Offline/fixed WebView2 runtime packaging
is deferred unless zero-network install becomes an explicit release requirement.

Windows updates are installer-managed replacements for the same LifeOS product
and install folder. A newer installer should remove or replace old app binaries,
shortcuts, and registry entries for the previous version, while preserving the
install-local runtime data root at `<install directory>\data`. A new version
installed into the same folder picks up the existing data automatically; a
different install folder starts from its own `data`.

Auto-update is deferred from the current private dogfood setup, but remains a
required future capability. The already-started updater scaffold is disabled by
default: startup checks, Settings manual checks, and install/relaunch flow run
only when the frontend is built with `VITE_LIFEOS_UPDATER_ENABLED=1`, and local
bundles create updater artifacts only when the release path explicitly sets
`LIFEOS_UPDATE_RELEASE_ENABLED=true`. The public release workflow maps that
release flag into the Vite updater flag for future updater-enabled builds. When
promoted again, update delivery
should use Tauri's signed updater path so installed Windows desktop builds can
discover, verify, download, and install newer LifeOS versions from an HTTPS
release endpoint after the first updater-enabled build is installed.
Updater-driven installs must keep the same install-local data preservation and
pre-update backup guarantees as manual same-folder installer updates.

The intended future updater endpoint is an owner-controlled Cloudflare R2 bucket
served through the HTTPS custom domain `updates.lifeos.app`. The bucket should
host only static updater files: `latest.json`, signed Windows installer
artifacts, and matching `.sig` files. GitHub Actions should publish production
updater artifacts to R2 through Cloudflare's S3-compatible API only when the
future updater release flag is enabled. Once that flag is enabled, installed
apps should check for updates on startup, Settings should offer a manual check,
and a valid new version should open a `Вышло новое обновление` modal with
`Установить сейчас` and `Позже`; silent updates are not part of the initial
updater UX.

Private dogfood release QA includes an automated packaged desktop smoke,
`npm run qa:packaged`, that launches the built `lifeos-v4.exe` from a clean
install-like sandbox and verifies the install-local data root, SQLite
migrations, readable export, local backup, search, Notes gateway, Quick Notes
mini-window, reminders, repeat launch persistence, same-folder upgrade
pre-update backup, integrity checks, browser-preview Notes safety,
permission-denied/unavailable reminder delivery statuses, Cyrillic/long Windows
path segments, and the data-preserving uninstall/reinstall policy. This
packaged smoke evidence is required in addition to normal unit, integration,
frontend, Rust, and audit gates.

Public production release is blocked until signed artifacts, final publisher
identity, SHA256 hashes, SBOM, build provenance, license gates, and installer
smoke evidence exist. The current release docs must not be interpreted as
public-ready. The manual GitHub Actions workflow has a repeatable `dry-run`
mode that archives release evidence while deliberately blocking public
production as `NotSignedBlocked`, and a `production` mode that requires final
publisher identity plus real signing inputs and timestamped Authenticode
`Valid` artifacts before upload. Production must validate that
`LIFEOS_PUBLIC_PUBLISHER` matches the real signing certificate subject and must
record that signer-subject match in release evidence.

LifeOS-owned Rust crates are private/internal packages, not public crate
releases. Cargo metadata keeps them unpublished with `publish = false` and uses
the root proprietary `LICENSE.txt` through `license-file` rather than a public
SPDX license expression.

## Current Module Specs

Detailed current decisions live in module files:

- [Home](modules/home.md)
- [Tasks](modules/tasks.md)
- [Habits](modules/habits.md)
- [Calendar](modules/calendar.md)
- [Reminders](modules/reminders.md)
- [Focus](modules/focus.md)
- [Projects](modules/projects.md)
- [Contacts](modules/contacts.md)
- [Notes](modules/notes.md)
- [Quick Notes](modules/quick-notes.md)
- [Diary](modules/diary.md)
- [Physical Health](modules/physical-health.md)
- [Finance](modules/finance.md)
- [Trading](modules/trading.md)
- [Settings](modules/settings.md)

## Architecture

LifeOS v4 uses a modular monolith architecture.

High-level layers:

1. Desktop shell: Tauri.
2. UI layer: React + TypeScript.
3. Domain/data boundary: Rust commands and domain services.
4. Storage: SQLite for structured data, Markdown/files for notes and diary-like writing surfaces, readable export artifacts for backup.
5. Search: rebuildable index over structured records and Markdown content.

React owns presentation and local UI state. Rust-owned services own durable business rules, persistence, import/export, backup, and future sync boundaries.

Implementation sequence:

- Build the real desktop application first: Tauri shell, React + TypeScript UI, Rust/domain boundary, local storage, and module registry should start as the production app foundation.
- The current browser/HTML design board remains a visual and product-logic reference for layout, screenshots, and module behavior. It is not the main implementation target.
- Micro visual corrections continue after the app foundation and core vertical slices exist, rather than delaying the real app behind a long prototype-polish phase.
- Keep UI components, routes, design tokens, typed data contracts, and Rust command boundaries reusable from the start so later mobile clients, sync providers, or a future separate public app can reuse validated product models without forcing the current private app to become generic too early.
- Windows `.exe` packaging is a first-class target for the desktop MVP and should be verified early in development.

Main architecture rules:

- Use typed, module-oriented API surfaces.
- Keep domain services explicit: tasks, habits, calendar, focus, notes, projects, health, finance, trading, settings.
- Define source-of-truth rules per data type.
- Treat indexes and caches as rebuildable.
- Keep durable rules in Rust/domain services rather than only React.
- Build backup/export early as a data-contract check.
- The desktop UI module registry is the source of truth for module id, label, icon, route, order, visibility, and capability flags.
- Canonical module ids are camelCase across registry and storage/search payloads (for example `physicalHealth`).
- Future mobile deep links should map to canonical module ids and shared module metadata. Mobile clients may use native route names and should not depend directly on desktop hash-route slugs or desktop shell routing.
- Visible module navigation is derived from the registry; hidden future modules can remain routable, and disabled modules must not become active routes.
- All module routes render through the shared `AppShell` and `Workspace` so the global left rail remains visible across the app.
- The global left rail owns top-level module identity. `Workspace` should not render a repeated visible module-title chrome row, and module-local top-left headers should not repeat the module name as text.
- Home is the eager default renderer screen. Non-default module screens use route/module-level dynamic imports with quiet loading/error states so the initial renderer bundle does not parse every module screen on first launch.
- Performance instrumentation used for audit/optimization work is dev-only and opt-in. It must not change product behavior or appear in user-facing UI. Current debug metrics cover Tauri invoke latency, SQLite open and migration-check time, repository query time, renderer first render and module navigation, reminder polling, and backup/export/pre-update backup duration.
- The desktop runtime uses app-managed SQLite state for typed Tauri commands. Startup opens the resolved runtime database once after any required pre-update backup, applies WAL setup and migrations explicitly, then commands reuse the managed state instead of reopening `LocalDatabase` per command. SQLite command access is serialized to preserve thread safety and command isolation; temp-dir helper APIs remain for deterministic tests.
- Implementation ownership boundaries should keep public contracts stable while avoiding large aggregators: `apps/desktop/src/dataCore.ts` is the frontend data bridge barrel, with domain adapters under `apps/desktop/src/dataCore/`; `apps/desktop/src-tauri/src/lib.rs` remains the Tauri command/public helper surface, with runtime data startup and pre-update backup ownership in `runtime_data.rs`; `crates/lifeos-storage/src/data_safety.rs` remains the public `DataSafetyService` and report surface, with restore/import artifact specs, dry-run/apply staging, and collision/link validation owned by `data_safety/restore_import.rs`.

## Data And Relationships

LifeOS v4 should not start with a universal relationship graph.

Confirmed first-version relationships:

- Home aggregates today's scheduled tasks, timed habits, standalone reminders, and today's Calendar events. Date-level events are summarized in a compact top-right `События` area; empty days show `События: На сегодняшний день событий нет.`.
- Tasks are the main actionable unit. Tasks have an active work status separate
  from completion: the initial statuses are `Не начато`, `В процессе`, and
  `Ожидает`, and waiting tasks can store what exactly they are waiting for.
  Completion is stored through `completed_at_ms`. Inbox shows active tasks
  without a user list; assigning a task to a user list removes it from Inbox and
  makes it appear in that list. Opening Tasks restores the
  last selected target instead of always selecting `Сегодня`.
- Habits provide repeatable daily actions with user-selected icon and color cues.
- Calendar stores events and shows Task projections without duplicating source records: planned task projections use due date/time, and completed-on-day task projections use `completed_at_ms` so Inbox, overdue, and user-list tasks still appear on the day they were completed.
- Reminders can attach to tasks, habits, and Calendar events, and can also exist standalone.
- Focus sessions can start from a selected task or as a taskless free-focus session. Current Focus modes are flexible timer, Pomodoro, breathing, and interval/cardio.
- Notes and Diary are mostly standalone writing surfaces in the MVP.
- Projects are lightweight standalone records in the MVP; tasks do not belong to projects yet.
- Contacts is a lightweight standalone address book in the MVP. It does not link to Tasks, Projects, Calendar, or Notes yet.
- Stage 8 persists Calendar events and reminders as separate structured records. Calendar Month projects dated active task records and completed-on-day task records from the Tasks source but excludes habits and reminders.
- The reminder notification path returns due `windows_system` notification payloads from the Rust/Tauri boundary. FIX-05 adds recurrence-aware due occurrences and persisted delivery attempts/statuses keyed by `(reminder_id, scheduled_for_local, channel)`, so duplicate suppression survives app restarts. The current visible dispatch uses a WebView Browser Notification fallback for private dogfood only; native Windows toast click routing and custom sounds are future work.
- Stage 9 persists habits and habit logs as structured records. Habits are the source of truth for repeatable habit definitions, selected icon/color, progress logs, skip/completion state, and streak/statistics recalculation. Habit time is optional and can be added, changed, or removed from the habit UI; removing it stores `time: null` and removes the habit from timed schedule projections without deleting the habit. Calendar Day, Three-day, and Week can consume timed habit projections; Calendar Month still excludes habits.
- Stage 11 persists Focus sessions as structured records. Focus sessions can link to a selected task by id/title snapshot or use a taskless `Фокус без задачи` snapshot with `task_id: null`, keep their own status, mode, started duration, remaining timer state, sound selection, history, and result note, but they do not complete tasks automatically and do not project into Home or Calendar. While an active Focus session or mini Focus surface is visible, the desktop app pins the Focus window above other OS windows and releases the pin when mini Focus closes, the session ends, or Focus unmounts. Setup settings for flexible, Pomodoro, breathing, interval/cardio, exercise list, and optional sound cues persist through frontend preferences. Imported custom Focus sounds should be copied into an app-owned data media folder such as `media/focus-sounds/` when durable custom-sound storage is implemented. The durable Focus sound library accepts only MP3 (`audio/mpeg`), WAV (`audio/wav`), Ogg/Opus/Vorbis (`audio/ogg`), and M4A/AAC (`audio/mp4`) files. Focus daily statistics and streaks count fully completed sessions only; a streak day requires at least one completed session, with no minimum-minute, mode, or planned-time requirement. Stopped sessions can stay in history and Diary `Что сделано`, but they do not count toward Focus statistics or streaks. `task_title` remains a required snapshot for linked and taskless Focus history/export/search.
- Quick Notes is a standalone lightweight notes module. It stores quick note records in SQLite and can display a selected note in a native always-on-top mini-window for second-monitor reference use during games. The mini-window has view-only and edit modes; edit mode commits plain-text body edits back to the selected Quick Note. It does not link into the broader Notes/Obsidian graph in the MVP.
- Stage 13 gives Projects, Diary, Physical Health, Finance, Trading, and Settings real MVP workflow surfaces. Finance is promoted to canonical Rust/SQLite storage by FIX-03A. Contacts was later added as a visible basic module. Projects, Contacts, Diary, Physical Health, and Trading are now canonical desktop records: Projects, Contacts, Physical Health, and Trading use SQLite tables, while Diary uses SQLite daily fields plus synchronized Markdown files under `diary/YYYY-MM-DD.md`. Browser/Vite preview uses `localStorage` only without the Tauri runtime; packaged frontend preferences such as Notes auto-open live in `<install directory>/data/frontend-preferences.json`. Psychological Health was later removed from the visible MVP module set and disabled in the desktop module registry.
- Stage 14 adds Settings > Data actions for readable export, full LifeOS backup, standalone Obsidian backup, rebuildable search, and integrity checks. These actions read Finance, Projects, Contacts, Diary, Physical Health, Trading, and Quick Notes from canonical storage. The old frontend basic-module snapshot is only an import/migration source and browser fallback, not the packaged desktop data-safety source of truth.

Deferred relationships:

- task to project;
- habit to project/task list/health modules;
- notes to tasks/projects/habits;
- broad graph across all modules;
- sync across devices.

## Storage

Target data model:

- structured modules use a Rust-owned data core backed by SQLite;
- packaged Windows builds resolve the runtime data root to `<installed executable directory>/data`; dev/debug builds keep the standard Tauri app data directory;
- the desktop app opens SQLite from the resolved runtime data root, not from a repository or dev-only path;
- Settings can register external Obsidian folders/vaults for backup sync. They are copied into full LifeOS backup artifacts under `obsidian-vaults/`, then included in encrypted Google Drive `.lifeosbackup` uploads; Settings can also create a standalone local `obsidian-backup-*` artifact containing only those configured external Obsidian folders. This is recovery backup sync, not live readable Drive folder sync or conflict resolution.
- the Tauri desktop process keeps an app-managed database state after startup migration; ordinary structured-data commands and state-backed data-safety commands reuse that state rather than opening a fresh database connection and rechecking migrations per command;
- packaged release startup creates a pre-update backup under `data/backups/pre-update/lifeos-pre-update-v*` before opening SQLite/migrations when existing data belongs to a different app version;
- updater-driven version changes follow the same safety rule: before v2 or any later version touches older user data through SQLite migrations, file-structure changes, or manifest-version rewrites, it must create a pre-update backup that can be used as a rollback point if the update breaks data or startup;
- pre-update backup has a startup-safe two-phase contract: the blocking critical phase copies and validates `lifeos.sqlite3`, SQLite sidecar files, `frontend-records.json`, and `frontend-preferences.json` before migrations; the larger user-file phase is manifest-based, resumable, progress-reporting, and finalized only after `notes/` and `diary/` are copied and validated;
- pre-update artifacts are complete-only. `.in-progress` artifacts and manifests with any status other than `complete` are partial and must not be treated as recovery-ready. Startup resumes interrupted user-file pre-update copies, records upgrade/downgrade direction in the manifest, and blocks completion when the critical SQLite snapshot is corrupt;
- pre-update backups copy `lifeos.sqlite3`, SQLite sidecar files, `notes/`, `diary/`, `frontend-records.json`, and `frontend-preferences.json`; existing backups, exports, and rebuildable search caches are not recursively copied;
- if startup, SQLite open, migration, Notes vault open, or runtime-version marking fails during release startup, LifeOS records `startup-failure.json` in the runtime data root and shows the owner the pre-update backup path when one is available;
- Settings > Data is the in-app rollback entry point for complete pre-update artifacts: it shows latest pre-update status, exposes a complete artifact as a restore/import source, runs dry-run first, and applies through the same backup-before-restore/staged restore flow. Partial `.in-progress` pre-update artifacts stay disabled for apply;
- after restoring data from a pre-update artifact, the safe app version is the artifact's `source_app_version` or a later fixed build that explicitly supports that source data version; the failed target version should not be relaunched against the restored data unless it has been fixed;
- Windows installer/uninstaller flows must preserve `<install directory>/data` while removing old app binaries and shortcuts for the same LifeOS product/identifier;
- Default uninstall/reinstall policy is data-preserving: uninstall removes installer-managed app files, shortcuts, and registry entries but leaves `<install directory>/data`; reinstalling into the same folder reuses those data, while a different install folder starts from its own separate `data`; deleting user data is an explicit manual/future action, not the default uninstaller behavior;
- schema state is tracked in a `schema_migrations` table and migrations must be safe to run repeatedly;
- structured records use stable string `RecordId` values and Unix-millisecond timestamps at the Rust domain boundary;
- the first persisted app settings are theme, language, wake time, and sleep time; wake/sleep default to `07:00`/`22:30` and change only through explicit Settings or Home day-boundary edits;
- notes use Markdown files as the user-facing source;
- Stage 12 stores Notes under the resolved runtime data root at `notes/`, with Markdown `.md` files as the disk source of truth and `_attachments/` as the default app-owned note attachment folder;
- diary's long-term writing source is Markdown under `diary/YYYY-MM-DD.md`, with SQLite `diary_entries` for structured daily fields, indexing/search, validation, and sync metadata;
- indexes and search caches are rebuildable;
- backup/export should produce readable JSON/Markdown artifacts;
- Stage 14 readable exports are written under the resolved runtime data root at `exports/lifeos-export-*`, with structured JSON including canonical Finance, Projects, Contacts, Diary, Physical Health, Trading, and Quick Notes records, copied Notes Markdown/files, copied canonical Diary Markdown, `manifest.json` with `artifact_version: 1`, and documented limitations;
- Stage 14 LifeOS local backups are written under the resolved runtime data root at `backups/lifeos-backup-*`, with a SQLite snapshot that includes canonical structured records, copied Notes folder, copied canonical Diary Markdown, optional frontend fallback snapshot only when supplied, `manifest.json` with `artifact_version: 1`, and `integrity-report.json`;
- Stage 14 Obsidian local backups are written under `backups/obsidian-backup-*`, with configured external Obsidian folders copied under `obsidian-vaults/`, a complete `manifest.json`, and no LifeOS SQLite database snapshot;
- User-triggered readable export, LifeOS backup, and Obsidian backup are cancellable, progress-reporting, complete-only operations. They stage into `.in-progress` directories, finalize only after validation and manifest snapshot validation, and write `status: "complete"` plus relative paths, byte counts, and SHA-256 checksums into `manifest.json`.
- Restore/import dry-run must reject partial or interrupted backup/export artifacts, including missing/invalid manifest snapshots, non-complete manifest status, checksum or byte-count mismatch, missing SQLite backup files, corrupt local backup databases, encrypted artifacts, and unsupported artifact versions. Local backup must validate the copied SQLite snapshot with `PRAGMA integrity_check` before success.
- Restore/import apply is supported for artifact version `1` readable exports and local backups. Apply creates a `backup-before-restore` artifact first, stages the restore, validates links and SQLite integrity before commit, replaces the current installation data using rollback copies, then validates the restored state before reporting success. Collision behavior for v1 is replace-after-safety-backup; source IDs are preserved and there is no preserve-both/remap mode.
- Data-safety export/search code batches habit-log reads across all habits instead of repeated per-habit export loops.
- Stage 14 search cache is rebuilt to a SQLite FTS cache at `search/index.sqlite3` under the resolved runtime data root and indexes SQLite records including Finance, Quick Notes, Projects, Contacts, Diary, Physical Health, and Trading, plus Notes and Diary Markdown;
- structured records append sync-ready entries to a local `change_log` table with record id, module id, operation, changed fields or payload summary, timestamp, and deleted flag;
- the first change-log integration is app settings writes, so storage changes can be tracked before cloud providers exist.
- Calendar events and reminders are structured SQLite records (`calendar_events`, `reminders`) as of Stage 8. Reminder delivery attempts/statuses are stored in `reminder_delivery_attempts` as of FIX-05.
- Habits are structured SQLite records (`habits`, `habit_logs`) as of Stage 9.
- Focus sessions are structured SQLite records (`focus_sessions`) as of Stage 11. `focus_sessions.task_id` is nullable as of FIX-04; integrity checks validate only non-null task links and readable export/search serialize taskless sessions with `task_id: null`.
- Notes search, tags, backlinks, graph edges, and attachment references are rebuildable indexes derived from Markdown files as of Stage 12.
- Quick Notes are structured SQLite records in `quick_notes`. The native mini-window receives selected note text and mode only when the payload changes and does not own a polling, animation, timer, or disk-write loop while displaying content. Edit-mode commits flow back through the desktop process into canonical Quick Notes storage. Runtime verification exposes process count, working set, CPU seconds, and sampled idle CPU percentage.
- Finance accounts, transactions, and budgets are structured SQLite records (`finance_accounts`, `finance_transactions`, `finance_budgets`) as of FIX-03A. Amounts are stored as integer minor units and displayed separately.
- Basic-module records for Projects, Contacts, Diary, Physical Health, and Trading are canonical desktop records as of migration `0012_basic_modules`. Projects use `projects`; Contacts use `contacts`; Diary uses `diary_entries` plus synchronized Markdown files at `diary/YYYY-MM-DD.md`; Physical Health uses `physical_zones`; Trading uses `trading_plays`, `trading_entries`, and `trading_rule_sections`. Existing `frontend-records.json` / `lifeos.basic-modules.v1` records are imported idempotently and cleared from the packaged frontend snapshot after migration. Browser/Vite preview uses `localStorage` only when Tauri is unavailable.

Cross-module attachment storage remains open and tracked in [open questions](open-questions.md). Notes uses its app-owned `_attachments/` folder and preserves imported Obsidian attachment paths in the MVP. Diary has a closed private-dogfood MVP media behavior for day entries: attach, preview, full-screen review, rename, and delete from the day-entry modal, with media metadata/payload stored with the canonical diary entry for local review until a shared durable media strategy exists. Physical Health and Trading have module-local attachment/media fields, but no shared file/media store contract yet.

## Design Direction

Approved direction: Quiet Command Workspace.

Reference files:

- [LifeOS v4 Design](lifeos-v4-design.md)
- [Icon System](icon-system.md)
- [Design Selection](design-selection.md)
- [Module Scenes](module-scenes.md)

Older TickTick, Obsidian, and OpenCode reference analysis files are no longer separate repository files. Treat their active conclusions as consolidated into the module specs, this design section, `lifeos-v4-design.md`, `design-selection.md`, and `module-scenes.md`.

Design rules:

- UI remains Russian-first by default for MVP.
- English language mode is now part of the Settings-owned appearance/language scope. It should translate app chrome, navigation, controls, empty/loading/error states, and module UI copy through a shared i18n boundary; user-created record content is not translated.
- The desktop React app implements that boundary through centralized typed translation keys, Russian/English dictionaries, and a React translation provider/hook. Russian is the complete fallback, and English mode must not translate internal ids, enum values, database fields, route ids, canonical module ids, or storage contracts.
- Light theme remains the production baseline and source visual baseline. Dark theme is a secondary app-wide mode selected from Settings > Appearance and applied through one global shell `data-theme` token boundary, not as a per-module alternate design.
- Themes must be tokenized globally and not mixed per module inside one active UI state.
- Global left rail spans full app height and shows all MVP module icons.
- Global left rail module icons show a compact highlighted module-name label on hover and keyboard focus, using the module color while keeping accessible labels intact.
- The desktop app uses the normal native window frame for now; LifeOS should not add its own app-level top chrome row or internal top offset.
- The Windows desktop app creates a system tray icon by default. The tray icon opens/restores LifeOS, can hide the main window into the tray, and can exit the app.
- The Windows desktop app can be set to launch automatically when the owner signs into Windows. The control is available in Settings.
- Module workspaces fill the available app area.
- Module headers are compact or absent.
- Top-left module names are not repeated inside the workspace. Keep accessible `aria-label`s and meaningful section/current-context titles such as a task list, month, account, body zone, settings group, or calendar range.
- Calendar fills the module workspace.
- Production Calendar follows the supplied light web Month reference while preserving dynamic Month/Week/Three-day/Day views, event creation, date navigation, event editing, and source-task editing from task projections.
- Home is a today-only Life OS 2-style schedule surface.
- Stage 15 visual QA confirms that the production light baseline uses tokenized muted side panels and raised light surfaces across all modules.
- Visible UI must not expose technical/reference helper copy or internal ids; data/search results should use user-facing module names.
- Visible working modules must have useful empty/loading/error states, recoverable retry actions where data loads asynchronously, honest disabled states, keyboard-reachable primary creation/editing flows, and stable focus states.
- Right-clicking ordinary app surfaces must not open native browser/WebView UI; context-menu UI appears only in explicitly designed product surfaces.
- Avoid decorative outer app cards, decorative radial/glow backgrounds, and thick colored side-stripe accents in module surfaces.
- MVP accessibility baseline: interactive elements use native focusable controls where practical; keyboard focus stays visible through the shared `--color-focus` token; icon-only controls have accessible names; dialogs and overlays expose labelled close actions and remain keyboard reachable; text and icons target WCAG AA contrast in the active light baseline and dark secondary theme; nonessential motion respects reduced-motion preferences; standard desktop controls keep practical hit targets, with smaller dense controls allowed only when they remain labelled and keyboard accessible.
- Current Home browser direction uses the newer light two-column timeline reference without a separate old-layout comparison scene.
- The current web design board applies the Home light visual baseline across all module previews: one shared light shell, tinted workspace, compact rail/header, raised light surfaces, dense rows, no module-level dark exceptions, and Tasks-like non-Home geometry for consistent rail/sidebar/header sizing.
- Tasks, Habits, and Calendar use TickTick as the main productivity reference.
- Notes uses Obsidian Companion Gateway as the main knowledge workspace path. The user is expected to have Obsidian installed for primary note editing; LifeOS owns/imports/backs up the local Markdown vault and rebuildable indexes, but the primary Notes route hands the user into the real Obsidian desktop app.
- The visible Notes route is a centered gateway with a primary `Открыть Obsidian` button and a persistent checkbox below it: `Автоматически открывать при нажатии на модуль Notes`.
- When the checkbox is enabled, entering Notes in packaged desktop mode automatically launches Obsidian through `obsidian://choose-vault`. When it is disabled, Notes waits for the manual button. LifeOS must not send the app-data Notes folder as `obsidian://open?path=...`; Obsidian's `path` parameter is for files, not vault folders.
- Notes browser/Vite mode is only a preview and must show the gateway shape honestly without auto-launching Obsidian or producing fake Obsidian launch links for `browser://...` paths.
- Notes remains an exception to the shared LifeOS light module styling, but the current exception is a minimal Obsidian handoff surface, not the previous internal dark file-tree/editor/backlinks workspace. That internal CodeMirror/tabs/metadata workspace is no longer the primary Notes route unless the owner changes direction again.
- Quick Notes uses the shared light LifeOS shell for its main module: compact note list, lightweight text editor, and explicit mini-window action. Its native always-on-top mini-window is the exception: plain text, view-only/edit modes, no React/WebView, no animations, no polling, and no heavy Markdown/graph/backlink work.
- Diary opens as a month-calendar surface first.
- Current browser design decisions: task lists have separate no-selection and selected-editor states; Calendar views use compact headers with full-height grids and a left-only time rail; Projects default to a main-workspace field layout without a right inspector; Diary's initial month view has no side panel or right details panel.
- Current browser annotation decisions: the selected-task editor footer is pinned to the bottom of the right panel; Habits follows the supplied TickTick-like weekly-strip/detail-panel reference; Calendar Month follows the supplied dense TickTick-like month reference.
- The accepted Home/Tasks/Habits/Calendar Month light reference is now applied across the remaining browser module previews, including Calendar Week/Three-day/Day, Contacts, Notes, Focus, Projects, Diary, Physical Health, Finance, Trading, Settings, and module scenes.
- Latest annotation refinements: task quick-add focus outlines the whole add row; icon-only buttons keep glyphs centered in their fixed boxes; Obsidian vault import is surfaced from Settings > Data rather than the Notes right panel.
- Calendar Week/Three-day/Day browser views use the configured day bounds (`07:00-22:30` in the current reference), schedule rows are evenly spaced with explicit positioned grid lines, time labels stay on the left, and schedule blocks span by actual event duration. Projects does not duplicate the project list in the central selected-project workspace.
- Physical Health starts directly at the body-zone workspace without the shared title header; body-zone creation follows the Tasks sidebar-plus pattern, and the selected zone exposes `Заметки` with a modal-backed `Создать заметку` flow plus `Приемы у врача`. The selected-zone content does not duplicate the `Зона` field or a second `Заметки` heading, and attachment picking appears only in the note modal as a compact paperclip button.
- Calendar Week/Three-day/Day time labels sit centered inside left-rail hour bands rather than on horizontal grid lines; day-column grid lines remain explicit and the left rail stays clean behind labels.
- Focus uses a centered timer, optional task selection, lower sound/start-pause/finish/mini-window controls, topmost desktop pinning while active/mini Focus is visible, no duplicated title header above the timer, a result-note panel that appears only after session end, and a right `Статистика` panel with six previous date columns plus today's column, no top total-minutes chip, and left-aligned side time scale labels.
- Finance is account-first in the current design pass: the shared workspace title is hidden, the selected account name edits in the account header, balance displays beside the name, transaction history sits immediately below, and a compact transaction-header add button opens transaction creation. Existing transaction rows reopen the same modal in edit mode. New account currency is limited to `RUB` and `USDT` for now. Transaction recording/editing uses type, amount, `Описание`, date, and optional time; income/expense rows update and restore the selected account balance from persisted transactions. Displayed Finance amounts use spaces as thousands separators, e.g. `100 000 RUB`. Current account icons reuse the main Finance module icon, with custom account icons deferred.
- Diary month cells show only the day number and optional right-aligned `?/10` rating; rating drives a visible red-to-green day color, rated cells have stronger outlines, and day editing starts after selecting a day.
- Diary day editing does not use the shared top workspace header. The day modal is wide, `Что сделано` shows completed Tasks and Habits rows plus manual done items, manual done items use a dot marker, and attached media previews render at the end of the modal after the free writing field. Attached media can open in a full-screen review overlay and supports right-click rename/delete actions.
- Trading uses top-centered equal buttons for `Плеи`, `Фьючерсы`, `Щиткоины`, and `Правила`. `Плеи` (`Plays`) is the default quick-capture list for recording an investment idea or in-the-moment position before the user can fill a detailed trade journal; it stores ticker/idea, date, time, short note/thesis, optional amount, and media separately from finished trade entries. Futures and Shitcoins each have two separate same-format journals: `Реальный` and `На бумаге`. `На бумаге` is for testing a hypothesis without treating the entry as a real trade. Journal rows show deal date, deal time, user-entered pair, status, and mode-specific trade fields in full-width aligned rows, orders rows by deal date/time with newest first, and does not show a right inspector, global trade-field cards, shared top module header, or inline full deal form under the journal. `+ Сделка` opens the full deal modal only in Futures/Shitcoins; the Futures direction control is limited to `Long`/`Short`, status is selected from `Открыта`/`Закрыта`, volume is always labeled/displayed as `Объём, USDT` and stored as digits only, the modal create action says `Добавить сделку`, and media uses photo-first attachment icons. Trading rules are editable as full-height user-created sections with individual titles and bodies; the selected section can be deleted, deleting the last section leaves an empty rules state, and the rule body field starts directly below `Правила раздела` without a large blank gap. `Мини-режим` opens/updates a separate native always-on-top rules mini-window for keeping the selected section visible during active trading, rather than drawing an in-app mini panel; the rules mini-window has view-only and edit modes, and edit mode commits plain-text body edits back to the selected rule section.
- Settings groups include appearance, modules, Home/day settings, notifications, synchronization, and data; primary settings information lives in the central workspace without a right inspector panel. The Appearance group includes the Windows autostart toggle.

## Sync, Privacy, And Security

Cross-device sync is postponed.

The first version is local-first. Data stays on the user's machine unless the user exports or backs it up manually.

Stage 14 local backup/export is not encrypted. FIX-06/FIX-07 makes restore/import dry-run the gate before any recovery action: LifeOS validates `manifest.json`, supported artifact version `1`, artifact kind, manifest status/snapshot/checksums, artifact contents, collisions, and internal linked-record references before apply. Supported v1 apply creates backup-before-restore, stages restored data, validates SQLite integrity and links before and after commit, and replaces the current installation data after the safety backup. Artifact version 1 preserves source IDs and does not remap IDs or links. Passphrase/encrypted restore is deferred and encrypted artifacts are rejected until that contract exists.

MVP does not include encrypted vault, PIN lock, module locks, cloud account auth, or device pairing. The architecture should not block future encryption and sync hardening.

The app should still reserve a provider-neutral storage/sync boundary early. Future sync may target different file storage providers, so local storage, change tracking, export, and provider adapters should not be hard-coded into one cloud service or one machine-only assumption.

Stage 5 establishes a sync-ready boundary without adding cloud accounts. The MVP provider is `local-manual`: it has a local root, no remote root, no OAuth requirement, local/manual capabilities, and a last-sync status that can start as never synced.

Cloud providers such as Google Drive, Yandex Disk, Dropbox, and OneDrive are future adapters. They must plug into the provider-neutral boundary and must not become core storage dependencies. Cloud sync, cloud auth, device pairing, conflict resolution, and conflict UI remain out of MVP scope.

Google Drive direct encrypted backup sync is the selected primary direction for the simple Windows reinstall recovery scenario. The intended user flow is: connect a Google account, choose the backup folder name in Settings, and let LifeOS create/use that named Google Drive folder. Folder links are no longer part of the Settings flow. Once connected, LifeOS creates a complete validated local backup artifact, encrypts it locally with an app-managed encryption passphrase, uploads the encrypted artifact to Google Drive, uploads completion metadata last, and repeats this sync every 5 minutes while the app is running. Manual "sync now" remains available for immediate testing. If upload fails, the app keeps a local pending-upload artifact and shows an honest not-synced/error state. Remote restore downloads a complete encrypted artifact into local staging, resolves the managed passphrase from OS keyring or the LifeOS-managed Drive key document, decrypts locally, then reuses the existing restore/import dry-run and apply flow. This does not make Google Drive a core storage dependency for local app use and does not introduce record-level conflict resolution.

Google Drive `.lifeosbackup` transfer must remain large-file safe. Upload uses the Drive resumable upload session with a file-backed streaming body instead of reading the whole encrypted artifact into memory. Restore download writes response chunks to a temp file in local staging, verifies the downloaded size when completion metadata or Drive response size is known, and publishes the final `.lifeosbackup` only by rename after the download is complete. Failed downloads and known size mismatches must not leave final-looking restore artifacts.

Settings no longer exposes `Хранить последних копий` / `keep_latest_count`. Google Drive sync behaves as a latest-state recovery backup: after a successful encrypted `.lifeosbackup` and completion metadata publication, LifeOS performs internal latest-only cleanup for complete artifact+metadata pairs in the selected Drive folder. Pending or incomplete artifacts without matching completion metadata are not cleanup candidates. Cleanup is not a user setting; a cleanup failure must not turn a successful upload into a failed sync.

Every Google Drive sync should show a compact bottom-right sync indicator: spinner while the encrypted backup is being created/uploaded, a check mark after successful completion, and automatic dismissal after one minute. Window close and tray `Выход` share the same Google Drive close-time backup path by default when Google Drive is connected: LifeOS keeps a small shutdown-sync loading dialog visible, starts the encrypted backup, and exits only after the result is `synced`. If close-time backup ends as `pending_upload` or `error`, LifeOS keeps the app open and reports the issue.

The default Google Drive encryption UX is managed by LifeOS, not by a user-entered recovery key. On connect, LifeOS generates or reuses a managed encryption passphrase, stores it locally only through the OS keyring, and keeps a copy as a LifeOS-managed key document in the selected Google Drive backup folder so reinstall recovery works after reconnecting the same Google account. Settings does not show a recovery-key field in the default flow. This is an explicit private-dogfood tradeoff: Google account access plus the LifeOS client can recover the backup, which is simpler and more reliable for the owner but less private than a separate memorized recovery key.

The Google OAuth boundary is deployment-configured, not committed: process environment variables (`LIFEOS_GOOGLE_OAUTH_CLIENT_ID`, optional `LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET`, `LIFEOS_GOOGLE_DRIVE_SCOPE`, and `LIFEOS_GOOGLE_DRIVE_ALLOW_FULL_SCOPE`) take priority, then a local `google-oauth-config.json` file in the LifeOS runtime data root, then build-time environment values embedded by private packaging. Refresh tokens and local managed encryption passphrases are stored only through the OS keyring/credential boundary and must not be written to SQLite, frontend preferences, OAuth config files, or checked-in fixtures. The remote managed key document is intentionally stored in the LifeOS-owned Google Drive backup folder to support recovery after a Windows reinstall.

The desktop `connect_google_drive_backup` command now performs the primary Google Drive connect flow through the system browser with OAuth 2.0 Authorization Code + PKCE, a random 127.0.0.1 loopback redirect port, `access_type=offline`, and `prompt=consent`. The command stores the refresh token only in the OS keyring, creates or reads the managed encryption key document for the selected Drive folder, then saves only folder/config metadata through `GoogleDriveSyncRepository`. The backend creates or reuses the requested Settings folder name, defaulting to `LifeOS Backups`; legacy folder URL input is ignored by the simple sync setup and must not be exposed in the main Settings UI.

Stage 16 mobile readiness audit adds no mobile code. Mobile work remains postponed until the desktop modules are brought to an ideal state. The first mobile version should include every module that exists in the app when mobile development starts, excluding disabled/deferred modules unless they are promoted before then. The exact read/write depth and mobile workflow shape for each included module remain future planning questions. The current desktop architecture does not block that future scope because the core records use shared Rust/domain contracts, stable string ids, Unix-millisecond timestamps, and provider-neutral sync/storage boundaries. Remaining desktop-only assumptions are documented as future risks: `windows_system` notification payloads, install-local desktop data paths, local-device time without time-zone policy, and a change log that still needs device/operation/revision/conflict metadata before multi-device writes.

## Project Context Files

- [Documentation Map](README.md): entry point and documentation workflow.
- [Decisions Log](decisions-log.md): confirmed answers and decisions by topic/date.
- [Open Questions](open-questions.md): only unresolved or partially unresolved questions.
- [Future Features](future-features.md): deferred ideas.
- [Source Projects](source-projects.md): how old projects are used as references.
- [Implementation Roadmap](implementation-roadmap.md): current priority pointer and historical build sequencing; current module specs override old milestone text.

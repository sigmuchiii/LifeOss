# LifeOS v4 Agent Handoff

Updated: 2026-05-28
Status: compact current-context handoff for new sessions

This file is a short operational handoff. Current product truth lives in
`spec-draft.md`, module specs, `decisions-log.md`, and `open-questions.md`.
Historical details should stay in the decisions log, roadmap, archive, or release
evidence rather than being expanded here.

## Start Here

Read in this order before substantial design or implementation work:

1. `docs/lifeos-v4/README.md`
2. `docs/lifeos-v4/spec-draft.md`
3. this handoff
4. the affected file in `docs/lifeos-v4/modules/`
5. `docs/lifeos-v4/open-questions.md`
6. relevant design/reference/release docs

Documentation rule: any product decision from the owner must be reflected in docs
during the same work session. Resolved questions move to `decisions-log.md` and
the affected specs; `open-questions.md` must contain only Open or Partial items.

## Product Shape

LifeOS v4 is a personal, local-first Windows desktop application for the owner's
daily life management. It is built for private owner dogfood first, not public
production.

Visible MVP modules: Home, Tasks, Habits, Calendar, Projects, Contacts, Notes,
Quick Notes, Diary, Physical Health, Finance, Focus, Trading, Settings.

Psychological Health is disabled/deferred unless explicitly promoted again.

The expected feel is a dense, calm, useful personal operating system. Avoid
marketing-page composition, decorative cards, helper copy, and placeholder UI.

## Release Truth

Current release target: private dogfood only.

Private dogfood builds may be unsigned and use the placeholder publisher if the
limits are documented. Public production remains blocked until signed artifacts,
real publisher identity from a valid code-signing certificate, SHA256 hashes,
SBOMs, provenance, license gates, and installer smoke evidence exist. Production
signing must also prove that `LIFEOS_PUBLIC_PUBLISHER` matches the signer
certificate subject for every executable artifact.

Internal Rust crates remain private/unpublished Cargo packages. They use
workspace `publish = false` and the root `LICENSE.txt` through `license-file`
instead of `license = "UNLICENSED"` so SBOM generation stays warning-clean
without making the project open-source.

Windows packaged runtime data root is `<install directory>\data`. Dev/debug builds
use the standard Tauri app data directory. The installed app must not silently
read old `%APPDATA%` or WebView `localStorage` as active runtime data.

Release startup creates a pre-update backup before migrations/opening SQLite when
runtime data comes from another app version. Complete pre-update artifacts are
rollback sources through Settings > Data restore/import dry-run/apply. Partial
`.in-progress` artifacts are never recovery-ready.

Useful commands from `apps/desktop`: `npm run lint`, `npm test`,
`npm run typecheck`, `npm run build`, `npm run bundle`, `npm run qa:packaged`,
and `npm run release:dry-run`. The dry-run command is evidence only; it records
`NotSignedBlocked` and is not a public distribution command.

## Stack And Boundaries

- Tauri 2 desktop shell.
- React 19 + TypeScript + Vite frontend.
- Rust crates: `lifeos-core`, `lifeos-storage`, `lifeos-sync`.
- SQLite for structured records.
- Markdown/files for Notes and Diary writing surfaces.
- Rebuildable search cache at `search/index.sqlite3`.
- App-managed SQLite state is opened once at startup and reused by typed Tauri
  commands.

`apps/desktop/src/dataCore.ts` is the frontend data API barrel. Domain adapters
live under `apps/desktop/src/dataCore/` so module code does not depend on one
large implementation file.

`apps/desktop/src-tauri/src/lib.rs` remains the command/public helper surface.
Runtime data startup, pre-update backup, and startup failure handling live in
`runtime_data.rs`.

`crates/lifeos-storage/src/data_safety.rs` exposes `DataSafetyService` and report
contracts. Restore/import artifact specs and staged apply helpers live under
`data_safety/restore_import.rs`.

## Storage Status

Canonical desktop storage exists for all visible MVP modules that own durable
records.

- Tasks: SQLite task records.
- Calendar: SQLite calendar events.
- Reminders: SQLite reminders plus `reminder_delivery_attempts`.
- Habits: SQLite habits and habit logs.
- Focus: SQLite focus sessions, including taskless sessions.
- Settings: SQLite settings plus OS-backed autostart state.
- Notes: app-owned `notes/` folder with Markdown as source, `_attachments/`, and
  rebuildable indexes.
- Quick Notes: SQLite records plus a native view/edit mini-window.
- Finance: SQLite accounts, transactions, and budgets.
- Projects: SQLite `projects`.
- Contacts: SQLite `contacts`.
- Diary: SQLite `diary_entries` plus synchronized `diary/YYYY-MM-DD.md`.
- Physical Health: SQLite `physical_zones`.
- Trading: SQLite `trading_plays`, `trading_entries`, and
  `trading_rule_sections`.

`frontend-records.json` and browser `localStorage` are legacy import/fallback
paths only when Tauri commands are unavailable.

## Data Safety

Settings > Data owns readable export, full LifeOS backup, standalone Obsidian
backup, search rebuild/search, integrity check, restore/import dry-run/apply,
pre-update rollback entry points, Obsidian vault import, and the list of external
Obsidian folders included in backup sync.

Readable exports go under `exports/lifeos-export-*`. Full LifeOS backups go
under `backups/lifeos-backup-*`. Standalone Obsidian backups go under
`backups/obsidian-backup-*` and contain only configured external Obsidian folders
under `obsidian-vaults/`. Operations stage into `.in-progress` folders and only
become complete after validation and manifest finalization.

Restore/import apply supports artifact version `1` for readable exports and
local backups. It is dry-run-first, creates a backup-before-restore, stages the
restored state, closes/reopens the app-managed SQLite handle as needed, validates
links and SQLite integrity before and after commit, and uses replace-after-safety
backup behavior. No preserve-both/remap mode exists in v1.

Configured external Obsidian folders are copied into local backup artifacts under
`obsidian-vaults/` and are therefore included in encrypted Google Drive backup
uploads. Restore/import brings them back under the app data root's
`obsidian-vaults/` recovery area rather than writing to old absolute paths.

Export/backup/search/integrity must read canonical storage, not stale frontend
snapshots.

## Module Contracts

Home aggregates today's timed tasks, timed habits, standalone reminders, and
today's Calendar events. It shows a compact `События` summary; empty days say
`События: На сегодняшний день событий нет.`

Tasks are the main actionable unit. Current MVP fields include title,
description, date/time, priority, list, reminders, subtasks, recurrence, and
status. Initial task statuses are `Не начато`, `В процессе`, and `Ожидает`.
`Ожидает` tasks can store what exactly they are waiting for. Completion remains a separate action/state stored through `completed_at_ms`.
Inbox shows active tasks without a user list; assigning a task to a user list
removes it from Inbox and makes it appear in that list.
Tasks reopens to the last selected target, including smart lists, user lists,
Completed, and Trash. Tags, duration estimates, and advanced status workflow
beyond the three initial statuses are deferred.

Habits store repeatable definitions and logs. Habit time is optional and can be
added, changed, or removed from the habit UI; removing time stores `time: null`
and keeps the habit active in Habits. Habit records also carry a user-selected
icon key from the fixed lucide habit palette plus a separate user-selected
color. Calendar Day/Three-day/Week may show timed habit projections; Calendar
Month excludes habits.

Calendar stores events and projects dated plus completed-on-day Tasks from the
Task source without duplicating source records. Current modes are Month, Week,
Three-day, and Day. Agenda is deferred.

Reminders are notification facts, not completable work. Standalone reminder
storage/delivery exists, and linked reminders belong to their source record.
Visible create/edit UI for independent reminders is still open.

Focus can start from a selected task or taskless. Current modes are flexible
timer, Pomodoro, breathing, and interval/cardio. It stores session mode, started
duration, remaining timer state, status, sound selection, history, and result
note. Setup settings, including breathing presets/phases, interval work/rest
stages, rounds, exercise list, and optional sound cues, persist through frontend
preferences. Durable custom sound imports use a fixed allowlist: MP3, WAV,
Ogg/Opus/Vorbis, and M4A/AAC. Focus does not complete tasks and does not project
planned sessions into Home/Calendar. Focus statistics and streaks count fully
completed sessions only; a streak day needs at least one completed session, with
no minimum-minute, mode, or planned-time requirement. Stopped sessions can remain
in history and Diary `Что сделано`, but they do not count toward statistics or
streaks. Runtime Focus sound starts only after a session starts: `rain`, `noise`,
and current-session custom files loop during active sessions, pause/resume with
the session, and stop/cleanup on finish, stop, complete, timer end, replacement,
or unmount. `bell` is cue-like, not an ambient loop, and optional phase/stage
cues remain separate. While a Focus session or mini Focus surface is visible,
the desktop app window is pinned above other OS windows, then unpinned when mini
Focus closes, the session ends, or Focus unmounts.

Notes is the Obsidian Companion Gateway. The current primary Notes route is a
centered `Открыть Obsidian` action plus persistent
`Автоматически открывать при нажатии на модуль Notes`. Packaged mode uses
`obsidian://choose-vault`; browser preview must not auto-launch or create fake
Obsidian links. The old internal file-tree/editor/backlinks workspace is future
fallback only unless re-promoted.

Quick Notes is a separate module for lightweight notes and a low-resource native
always-on-top second-monitor mini-window. The mini-window has view-only and edit
modes, remains plain text, uses no React/WebView, no timers, no animations, no
polling, and no disk writes while only displaying content. Edit mode updates the
selected note body through canonical Quick Notes storage; title editing remains
in the main module.

Projects are lightweight standalone records with editable project fields. No
task/project links, Kanban board, or progress metrics in MVP.

Contacts are a lightweight address book: name required; phone, Telegram/social,
email, category, and note optional. No links to other modules in MVP.

Diary starts as a month calendar. Selecting a day opens a wide modal with rating,
mood, energy, `Что сделано`, free writing, and media. Diary writes Markdown day
files under `diary/YYYY-MM-DD.md` and stores structured fields in SQLite. Current
media behavior is attach/preview/full-screen review/rename/delete; shared media
storage is still open.

Physical Health uses user-defined body zones. A selected zone offers `Заметки`
and `Приемы у врача`. Notes capture complaint/context/triggers and selected
attachment file names; doctor flow captures doctor type, appointment date/time,
and visit information. Deeper medical taxonomy is deferred.

Finance is account-first. Accounts and transactions use canonical storage.
Currencies are currently `RUB` and `USDT`; categories, recurring payments,
broader currencies, and Finance links are deferred.

Trading has `Плеи`, `Фьючерсы`, `Щиткоины`, and `Правила`. Plays are quick
captures. Futures/Shitcoins have real/paper journals and modal-backed deal
creation/editing. Volume is `Объём, USDT` and digits-only. Rules are editable
sections that can be deleted individually; deleting the last section leaves an
empty rules state. The rule body editor starts directly below `Правила раздела`.
`Мини-режим` opens/updates a separate native always-on-top rules mini-window
instead of an in-app mini panel. That mini-window remains plain and low-resource
with view-only and edit modes. Edit mode updates only the selected rule-section
body through canonical Trading storage; section title editing remains in the
Rules screen. The native window should use the normal Windows UI font, internal
text padding, and preserve explicit rule-body line breaks/blank lines.

Projects, Contacts, Diary, Physical Health, and Trading now share the
basic-module UX maturity baseline: useful empty states, async loading and
recoverable error states, honest disabled primary actions, keyboard-reachable
create/edit flows, stable focus rings, expected Settings shortcuts, and no
visible technical helper copy except explicit release/data limitations.

Settings uses sidebar groups: `Оформление`, `Модули`, `Главная`,
`Уведомления`, `Синхронизация`, and `Данные`. It owns theme/language,
wake/sleep, module visibility, notification diagnostics, local sync/data actions,
autostart, backup/export/search/integrity/restore, pre-update rollback, and
Obsidian import. Russian remains the default language, but English mode is now
part of the Settings-owned language scope. Theme and language are persisted in
the app settings record; user-created record content is not translated. The
desktop UI now uses the shared typed i18n dictionary/provider path for app
chrome, navigation, Settings, and primary UI copy across the 14 visible modules,
with Russian as fallback and internal ids/storage contracts left unchanged.

Selected future recovery-sync direction: direct Google Drive encrypted backup
sync for the Windows reinstall scenario. The intended flow is connect Google,
choose the app-created Drive backup folder name in Settings, and let LifeOS
sync automatically every 5 minutes while the app is running. Folder links,
last-copy retention, and close-time backup toggles are no longer part of the
simple Settings flow. Each sync creates a validated local backup, encrypts it
locally with a LifeOS-managed passphrase, uploads only the encrypted complete
artifact, publishes completion metadata last, and restore works by
downloading/decrypting into staging before the existing dry-run/apply restore
flow. This is not live SQLite sync or multi-device conflict resolution.
Google Drive `.lifeosbackup` transfer paths are large-file aware: upload uses
Drive resumable upload with a file-backed streaming body instead of reading the
whole encrypted artifact into memory, and restore download streams into a temp
file in the downloads staging directory before publishing the final artifact by
rename. Failed downloads and size mismatches must not leave a final-looking
`.lifeosbackup`; when completion metadata or Drive response size is known,
downloaded bytes must match before decrypt/dry-run staging proceeds.
Window close and tray `Выход` share the same close-time backup lifecycle:
when Google Drive is connected, LifeOS shows a small shutdown-sync loading
dialog and exits only after the encrypted Google Drive backup reaches `synced`;
pending upload or error keeps the app open with an error.
Google OAuth config is resolved from process env first, then local
`google-oauth-config.json` in the runtime data root, then build-time env values
embedded by private packaging. Supported fields are
`LIFEOS_GOOGLE_OAUTH_CLIENT_ID`, optional
`LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET`, `LIFEOS_GOOGLE_DRIVE_SCOPE`, and
`LIFEOS_GOOGLE_DRIVE_ALLOW_FULL_SCOPE`; refresh tokens and the local managed
encryption passphrase must stay behind the OS keyring boundary, not in SQLite,
frontend preferences, OAuth config files, or checked-in files.
The default Google Drive UX no longer asks for a recovery key. On connect,
LifeOS creates or reads a LifeOS-managed key document in the selected Drive
backup folder; this lets a fresh Windows install recover by reconnecting the
same Google account. The privacy tradeoff is intentional for private dogfood:
Google account access plus the LifeOS client can recover backups.
The desktop `connect_google_drive_backup` command is implemented with system
browser OAuth 2.0 Authorization Code + PKCE, a random `127.0.0.1` loopback
redirect port, `access_type=offline`, and `prompt=consent`. It stores the
refresh token only in the OS keyring, creates or finds the Settings-provided
folder name, ignores legacy folder URL inputs for the simple setup, and saves
only non-secret config through `GoogleDriveSyncRepository`.

Google Drive no longer exposes `keep_latest_count` / `Хранить последних копий`
in Settings. After a successful encrypted `.lifeosbackup` upload and final
completion metadata upload, LifeOS runs internal latest-only cleanup for complete
artifact+metadata pairs in the configured Drive folder. Pending or orphan
artifacts without completion metadata are never deleted by cleanup. Cleanup
failure must not roll back a successful upload or make the user-facing sync look
failed only because old-file cleanup failed. Every sync should show the compact
bottom-right spinner/check indicator; success dismisses after one minute.

## Design And Accessibility

Shared visual contract: light-first app-wide baseline, `40px` global rail, `214px`
contextual sidebar where present, compact `55px` headers, full-height tinted
workspaces, raised light surfaces, dense rows, quiet icon actions, and no
decorative outer cards, nested cards, prompt boxes, chart placeholders, glow
backgrounds, or thick colored side-stripe accents. Dark theme is a secondary
app-wide tokenized mode, not a per-module design variant.

The global rail owns module identity. Do not render repeated top-left module
name headers in shared workspace chrome or module-local sidebars; keep only
meaningful current-context titles such as a selected list, month, account, body
zone, or settings group.

MVP accessibility baseline:

- use native focusable controls where practical;
- preserve visible focus through the shared focus token;
- icon-only controls need accessible names;
- dialogs/overlays need labelled close actions and keyboard reachability;
- respect reduced-motion preferences for nonessential motion;
- target WCAG AA contrast for text and meaningful icons in both light baseline
  and dark secondary theme;
- standard desktop controls should keep practical compact hit targets; smaller
  dense controls are acceptable only when labelled and keyboard accessible.

## Current Open Risks

Keep these in `open-questions.md` until resolved:

- first visible create/edit UI for standalone reminders;
- per-module read/write depth for the future all-module first mobile version;
- mobile offline write policy;
- multi-device sync metadata: device id, operation id, revisions, conflict base,
  tombstones, and clock-skew handling;
- Google Drive backup sync details: final Drive scope/picker policy if future
  user-selected external Drive folders are reintroduced;
- cross-module attachment/media storage outside Notes and current Diary MVP
  behavior;
- deeper Physical Health taxonomy and future attachment/export strategy;
- final public publisher identity and signing inputs;
- deferred Windows auto-update: selected future direction is Tauri signed
  updater plus Cloudflare R2 at `updates.lifeos.app`; do not require updater
  signing/R2 credentials until the updater release path is explicitly enabled.
  Current guarded scaffold is off by default: frontend startup/manual checks
  require `VITE_LIFEOS_UPDATER_ENABLED=1`, updater artifacts require
  `LIFEOS_UPDATE_RELEASE_ENABLED=true`, and the public release workflow maps the
  release flag into the Vite updater flag when future updater builds are
  explicitly enabled.

## Historical Docs

Root `PROJECT_AUDIT_2026-05-13*` files are archived under
`docs/lifeos-v4/archive/` and are historical snapshots only. Do not use old test
counts, preview-only claims, or Stage 17 metrics as current release evidence.

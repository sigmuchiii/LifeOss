# LifeOS v4 Implementation Roadmap

Created: 2026-05-05
Updated: 2026-05-23
Status: current priority pointer plus historical build sequence

## How To Read This File

This file is no longer the main implementation source of truth. Use it to
understand the app-first build sequence and current priority, then verify the
actual current contract in `spec-draft.md`, `agent-handoff.md`, the affected
module spec, and release/security docs.

The milestone list below is historical and intentionally preserved. Do not
implement directly from old milestone bullets when they disagree with current
docs. Known superseded examples include the old internal Obsidian-like Notes
workspace as the primary route, transaction-first Finance, and older Trading
journal naming.

## Current Priority (2026-05-18)

The early P0 hardening items from 2026-05-13 are implemented or covered by the
release gates. Current implementation priority is to keep private dogfood
readiness, data-safety, release evidence, and documentation truth aligned while
closing the remaining items in
[10-out-of-10-readiness-checklist.md](10-out-of-10-readiness-checklist.md).

For current product and release truth, read `spec-draft.md`, `agent-handoff.md`,
the affected module spec, and release docs. The milestone list below is
historical build sequencing and should not override current module specs.

Completed hardening baseline:

1. explicit CSP in the Tauri desktop config;
2. frontend lint gate (`npm run lint`);
3. Rust clippy gate (`cargo clippy --workspace --all-targets -- -D warnings`);
4. formal `cargo audit` allowlist policy with review cadence.

## Principle

LifeOS v4 is too broad for one implementation plan. Work must be split into milestones that each produce working, testable software.

The approved build sequence is app-first:

1. use the current HTML/browser design board as a reference artifact for layout, screenshots, and product logic;
2. create the real Tauri + React + TypeScript desktop app foundation immediately;
3. establish the Rust/domain boundary, SQLite/local storage, module registry, design tokens, and typed app contracts early;
4. verify Windows `.exe` packaging early enough that release constraints shape the app rather than surprise it later;
5. build deep modules as real vertical slices, then polish micro-interactions once the core application works.

The browser design board is not a public website and not a separate product. It remains useful for visual review, but new implementation work should move into the desktop application unless a quick browser sketch is needed to clarify a specific UI decision.

## Milestones

### Milestone 0: Desktop App Foundation And Daily Hub Skeleton

Goal: create the real desktop application foundation, shared UI system, module registry, typed data contracts, local persistence boundary, sync-ready storage boundary, and first daily planning skeleton in a Tauri/React app.

Output:

- Tauri desktop shell with React + TypeScript frontend;
- reusable design-token contract for the app-wide light-first theme;
- typed frontend data contracts mapped to Rust/Tauri command boundaries;
- Rust workspace/crate boundaries for domain, storage, and future sync;
- initial SQLite and Markdown/file storage boundary;
- local settings storage;
- early Windows `.exe` build path;
- provider-neutral sync/storage interfaces, with cloud providers deferred;
- 14-visible-module navigation registry target, with Contacts and Quick Notes visible and Psychological Health disabled/deferred;
- approved design tokens;
- light-first global theme baseline, with dark mode kept in the token contract for a later selectable app-wide theme;
- Home is the first fully interactive vertical slice;
- Home, Tasks, Habits, Calendar, Focus, Notes, and Quick Notes routes as real surfaces;
- basic routes for the seven shallow modules;
- scene routes or overlays for creation/editing flows;
- initial tests for module registry, routing, tokens, and core UI state.

### Milestone 0.5: Persistence, Packaging, And Sync Boundary

Goal: make the desktop foundation durable and release-aware before deep module work.

Output:

- typed Tauri bridge;
- Rust core crate boundary;
- initial SQLite and Markdown/file storage boundary;
- provider-neutral sync contracts and change tracking for future file storage sync;
- local/manual provider only in MVP;
- early Windows `.exe` packaging verification;
- Windows notification capability wiring;
- local settings storage;
- smoke tests for desktop launch and bridge behavior.

### Milestone 1: Tasks Anchor

Goal: build the TickTick-style Tasks module deeply enough to become the planning anchor.

Output:

- task title as the only required field;
- task lists and filters, including Inbox for tasks without date;
- List and Kanban task views;
- Timeline task view deferred;
- grouping controls: manual/custom, date, label if labels are MVP, priority, none;
- sorting controls: manual/custom, date, title, label if labels are MVP, priority;
- add-list flow matching the TickTick-like sidebar model;
- separate completed and trash system lists;
- create/edit task flow;
- optional description, priority, due date, scheduled time, reminders, and subtasks;
- optional task recurrence;
- recurring task behavior modeled after TickTick: completing one occurrence surfaces the next scheduled occurrence;
- date-only tasks without time;
- child-task style subtasks rather than only plain checklist text;
- MVP task status uses `Не начато`, `В процессе`, and `Ожидает`; tags and approximate duration remain deferred;
- task reminders as attachable reminder records or settings;
- project link field;
- right detail panel for editing the task, description, reminders, and subtasks;
- completed view modeled after TickTick: filters, completion-date groups, counts, muted completed rows;
- trash behavior modeled after TickTick: deleted tasks move to Trash and can be cleared from the top-right action;
- SQLite-backed task repository;
- tests for task domain and UI behavior.

### Milestone 2: Habits And Calendar

Goal: connect Habits and Calendar to the daily planning hub.

Output:

- habit CRUD and completion;
- visible add-habit flow;
- recurrence model: daily, weekly by selected weekdays, monthly, and yearly;
- TickTick-like date picker interaction for task and habit dates;
- MVP habit types: checkmark, timed, and quantity/count;
- quantity habits use count/times only in the MVP;
- partial quantity progress is recorded but does not increase streak;
- no MVP habit duration, timer, or checklist habit types;
- multiple completions per day through quantity/count progress;
- habit statistics and recalculation after retroactive edits;
- habit completion states: pending, completed, skipped;
- streak loss when a habit is manually skipped;
- habit reminders as attachable reminder records or settings;
- habit reminder timing relative to habit time;
- day/week/month calendar views;
- Calendar implementation should preserve the three reviewed layout modes: Month, Week, and Day/Agenda, with Month guided by the TickTick-like reference slide;
- Calendar opens to Month by default;
- Calendar events with optional reminders for birthday/holiday-like records;
- reminders attach to tasks, habits, and Calendar events;
- reminder recurrence presets: every day, selected weekdays, every week, selected days of month, every month, every year;
- reminders are one-time by default and repeat only when explicitly configured;
- Windows system notifications for MVP reminder delivery;
- snooze, Telegram, phone delivery, holiday import, and external calendar import are deferred;
- scheduled tasks on calendar;
- timed habits only in Home/today, three-day, and week schedule views when they fit, not in the month calendar;
- shared date/time rules.

### Milestone 3: Home And Focus

Goal: make the day-first operating loop useful.

Output:

- Home daily schedule;
- Home schedule uses the Life OS 2-style vertical time strip, two visible schedule windows (`07:00-14:30` and `14:30-22:00`) in the latest design reference, and no day selector on Home;
- Home uses the common app theme instead of a separate module-only visual treatment;
- today aggregation from tasks and habits;
- completion actions for tasks and habits from Home without direct schedule editing;
- no task moving or rescheduling from Home;
- Home shows today only, with no day switcher, evening review, or progress percentage;
- no dedicated Home block for tasks without time in the MVP;
- tasks outside the wake/sleep boundary remain in Tasks and do not render on Home;
- free windows are visible as timeline space, but Home does not recommend what to do with them in the MVP;
- overlapping schedule items use visual priority, stacking, or compaction without changing source records;
- focus timer;
- centered focus timer surface;
- simple flexible timer and Pomodoro;
- focus sounds and user-imported custom sounds;
- task selection for focus sessions;
- focus mini-window after starting from a selected task;
- no automatic Home/Calendar projection for focus sessions in the MVP;
- no automatic post-focus action in the MVP;
- allowed app/code-context tracking and redirect behavior when the user leaves the expected workspace;
- focus session records;
- optional focus-to-task link.

### Milestone 4: Notes And Basic Modules

Goal: complete the first-version module surface.

Output:

- Markdown notes vault as the source surface;
- Obsidian-like sidebar file explorer, tabs, editor, preview, backlinks, and graph;
- projects with project list, add-project action, description, stage, blockers, and next actions;
- contacts with contact list/search and editable contact card;
- diary monthly calendar with selected day note, rating, and media attachments;
- physical health with body-zone selection, complaint triggers, and doctor visit records;
- Psychological Health remains disabled/deferred unless explicitly promoted again;
- finance as transaction-first workflow; accounts/currency/budget setup deferred;
- trading with two journals: futures and memecoins;
- settings.

### Milestone 5: Backup, Export, Search, Polish

Goal: make local personal use safe and coherent before any future sync work.

Output:

- readable JSON/Markdown export;
- local backup;
- rebuildable search index;
- cross-module integrity checks;
- visual consistency pass;
- known limitations doc.

## Current Next Plan

Stage 1 Desktop App Foundation is implemented in `apps/desktop` with Tauri 2, React, TypeScript, Vite, and Rust crates under `crates/`. The command boundary has expanded well beyond the original `get_app_status`; current typed APIs cover settings/data health, Tasks, Calendar/Reminders, Habits, Focus, Notes gateway/import, Quick Notes, Finance, basic-module storage, data-safety, pre-update rollback, and release smoke helpers.

Stage 2 Design System And Light-First Shell is implemented in `apps/desktop` with the light theme tokens, shared shell, global left rail, workspace wrapper, and core UI primitives.

Stage 3 Module Registry And Routing establishes the typed module registry contract, current visible MVP module routes, shared shell rendering for active module routes, and hidden/disabled module handling for future or deferred registry entries. Contacts is visible; Psychological Health is a disabled deferred registry entry.

Stage 4 Local Data Core is implemented with stable Rust record ids and timestamps, SQLite initialization under the Tauri app data directory, an idempotent first migration, local app settings persistence, a data health check, typed Tauri commands, and a typed frontend bridge.

Stage 5 Sync-Ready Storage Boundary is implemented with a provider-neutral sync provider contract, MVP `local-manual` provider metadata, SQLite-backed `change_log`, and settings writes producing the first real change-log entries. Google Drive, Yandex Disk, Dropbox, OneDrive, OAuth, device pairing, conflict UI, and real cloud sync remain future work.

Stage 6 Windows `.exe` Packaging is implemented with Tauri bundle metadata, an unsigned NSIS Windows bundle target, generated app icon assets, package scripts for frontend/dev/desktop/bundle workflows, and `docs/lifeos-v4/release-checklist.md` documenting unsigned build limitations and future code signing requirements.

Detailed step plan: [LifeOS v4 App-First Development Plan](../superpowers/plans/2026-05-07-lifeos-v4-app-first-development-plan.md).

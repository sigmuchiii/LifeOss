# Diary Module

Status: MVP basic module

## Purpose

Diary is the Daily Note module: a place to record how the day went, what was done, mood, energy, reflection, and media.

## Current Decisions

- Diary starts from a monthly calendar.
- The initial Diary module screen should look like a month calendar first, not like a list or summary dashboard.
- The initial Diary month screen does not show a right selected-day/details panel.
- The initial Diary month screen does not show a top `+ Запись` action; entry editing starts after selecting a day.
- The Diary month header stays compact and the month calendar fills all remaining workspace height.
- The browser reference uses the same accepted light month-grid treatment as Calendar Month, but without a module-local left sidebar and without a right details panel on the initial month screen.
- The initial Diary month screen shows only day numbers and day rating in `?/10` format where a rating exists.
- The initial Diary month screen must not show inline text records such as media counts, done counts, draft labels, or entry snippets inside day cells.
- The rating is right-aligned in the day header, opposite the day number.
- Day cell color is visibly derived from the day rating: `0/10` is red, `10/10` is green, and intermediate ratings move through the gradient.
- Rated day cells use a wider, more visible border than unrated cells.
- Selecting a day opens an overlay/modal with the selected day's details.
- The user fills or edits a diary day only after selecting that day.
- Modal closes with `X` or transparent backdrop.
- User can scroll and edit inside the day entry.
- The Diary route does not show the shared top workspace module header or runtime `Локально` badge; the month surface starts directly under the global rail.
- The day-entry modal should use a wider layout than the default compact modal.
- Diary's long-term writing source is Markdown.
- Diary day files live in a dedicated `diary/YYYY-MM-DD.md` folder under the resolved runtime data root, separate from Notes, so the app can avoid mixing Diary entries with the note vault while keeping backup/export simple.
- SQLite `diary_entries` stores structured daily fields, indexing/cache data, and synchronization metadata around the Markdown day files.
- Diary is separate from Notes as a module, but can use similar Markdown/file logic.
- Diary media is closed for the private dogfood MVP at the current local behavior level: attach from the day modal, preview in the modal, open full-screen review, rename, and delete. This is not a final cross-module media storage policy.

## MVP Fields

Required daily fields:

- day entry;
- day rating;
- mood;
- energy;
- `что сделал`;
- media attachments.

## Stage 13 Desktop Implementation

- The desktop Diary route opens as a month calendar first and fills the workspace.
- Selecting a day opens a modal overlay with close-by-`X` and backdrop behavior.
- The modal exposes rating, mood, energy, `Что сделано`, free day entry, and media attachment controls.
- `Что сделано` renders completed task and habit rows for the selected day, plus manual done items stored on the diary entry.
- The user can add manual done items directly in the `Что сделано` section for items that do not exist in Tasks or Habits.
- Media is attached from the day-entry modal and rendered at the end of the modal after the free day entry. The current MVP stores media metadata/payload with the canonical diary entry for local review until shared media storage is defined.
- Clicking a media preview opens it in a full-screen review overlay.
- Right-clicking a media card opens context actions for `Переименовать` and `Удалить`.
- Manual done items use a dot marker rather than a plus icon.
- Diary records are canonical as of migration `0012_basic_modules`: Markdown day files at `diary/YYYY-MM-DD.md` are the long-term writing source, and structured daily fields are stored in SQLite `diary_entries` so the app can query, search, export, and validate entries reliably.
- Existing `frontend-records.json` / `lifeos.basic-modules.v1.diaryEntries` records are imported idempotently into canonical storage and cleared from the packaged frontend snapshot after migration.
- Settings > Data export, local backup, search, and integrity checks read Diary from canonical storage and validate that each SQLite diary entry has its Markdown file. Browser/Vite `localStorage` is only a fallback when Tauri commands are unavailable.
- Durable shared media storage, media limits, and import/export conflict behavior remain future/system questions until the cross-module attachment strategy is resolved; they are not active Diary MVP blockers.

## Stage 14 Export Behavior

- Diary entries have canonical Markdown files on disk under `diary/YYYY-MM-DD.md`.
- Readable export copies canonical Diary Markdown under `exports/lifeos-export-*/markdown/diary/` and also writes structured `diary_entries.json`.
- Local backup copies the canonical `diary/` folder beside the SQLite snapshot.
- Restore/import apply for artifact version `1` restores Diary SQLite rows and canonical `diary/` Markdown through the staged replace-after-safety-backup flow.

## 2026-05-18 UX Maturity Implementation

- Diary keeps the month calendar as the primary surface and uses useful empty wording inside the day modal for manually completed items and media.
- Async Diary loading has a quiet loading state and a recoverable error state with retry.
- Loading completed Tasks/Habits for `Что сделано` has its own inline loading state; failure shows a retry action without blocking manual done items.
- Primary Diary editing remains keyboard reachable through native month-day buttons and modal fields.
- Focus rings stay stable on day cells, modal fields, manual done-item creation, media controls, and close/context actions.
- Diary exposes a compact Settings shortcut near the month controls for expected diary preferences.
- The active Diary UI should not show technical helper copy or internal storage/runtime wording; release/data limitations belong in Settings/Data or release documentation.

## `Что сделал`

This section should:

- pull completed tasks for the selected day;
- pull completed habits for the selected day;
- pull completed and stopped Focus sessions for the selected day;
- allow manual free-form done items for things not captured by tasks/habits.

If the current implementation does not yet include Focus sessions here, that is an implementation gap rather than an open product question.

The `что сделал` section is the MVP substitute for a separate Productivity module for now.

## Deferred / Open

- Separate Productivity module.
- Templates.
- Privacy/lock.
- Heatmaps/streaks.
- Formal Diary media rules beyond the current attach/preview/rename/delete behavior: durable media limits, export/import conflict behavior, and cross-module attachment strategy.

## Open Questions

See Diary questions in [../open-questions.md](../open-questions.md).

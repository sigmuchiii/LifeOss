# LifeOS v4 Design

Created: 2026-05-05
Status: approved for planning

## How To Read This File

This file contains both current visual rules and historical design exploration.
For implementation, use the latest explicit rule in this file only when it also
agrees with `spec-draft.md`, the affected module spec, and
`docs/lifeos-v4/modules/README.md`. Older Variant B, browser-board, TickTick,
Obsidian, or OpenCode notes are reference history when a later dated section or
module spec supersedes them.

The current production baseline is light-first, dense, Russian-first by default,
and module-specific. English is a secondary Settings-owned language mode. It uses
the shared LifeOS shell, a `40px` global rail, compact
headers, raised light surfaces, real controls, and no decorative outer cards,
technical helper copy, or placeholder UI.

## Summary

LifeOS v4 is a new personal modular desktop application. It starts from scratch while using `Lifeos` as a technical reference and `LifrOs 2` as a product/specification reference only when they provide concrete value.

The first version is a Windows desktop-first owner-only personal MVP with 14 visible modules, a day-first product center, local-first operation, no live multi-device sync, and simple local privacy. Google Drive encrypted backup sync is a recovery path for reinstall scenarios, not live SQLite/file sync. LifeOS v4 is not the public-user product; it is the private system that should become ideal for the owner first, with reusable lessons feeding a separate future application for users.

## Product Decisions

- New project from scratch.
- Windows desktop first.
- Future mobile clients are expected but not part of the first build.
- First version is exclusively for the owner's personal daily use, not public launch.
- A future user-facing product should be created as a separate application after the private LifeOS v4 is validated and made ideal for owner use.
- Broad LifeOS core with 14 visible MVP modules.
- Live multi-device sync is postponed. Google Drive encrypted backup sync is a selected recovery-sync direction, not a shared live data layer.
- Simple local privacy; no encrypted vault in the first version. Remote backup artifacts must be encrypted before upload when Google Drive backup sync is used.
- Modular monolith architecture with Rust-owned core.
- Hybrid storage: SQLite for structured modules, Markdown/file-vault for notes, readable backup/export artifacts.

## First-Version Modules

Deep modules:

1. Home
2. Tasks
3. Habits
4. Calendar
5. Focus
6. Notes
7. Quick Notes

Basic working modules:

1. Projects
2. Contacts
3. Diary
4. Physical Health
5. Finance
6. Trading
7. Settings

Shopping Lists, Food, vibecoding, matrix, countdown utilities, and sync are post-MVP unless explicitly promoted later. Shopping-list style notes are handled in Notes/Obsidian for now. Standalone reminder records are MVP, but a full Reminders module / notification center is post-MVP.

## Product Reference

TickTick is approved as the main reference for the planning modules.

Use TickTick to inform:

- the main planning module layout: global rail, internal navigation column, central list/grid, and right detail panel;
- task list structure;
- smart lists such as Today, Inbox, Next 7 Days, overdue, completed, trash;
- filters and smart views;
- task detail panel;
- task creation/editing flow;
- quick add placement and density;
- habit planning ergonomics;
- calendar planning behavior where it fits LifeOS;
- dense desktop productivity interaction.

TickTick is a reference, not a clone target.

## Module-Specific Design References

- The left app sidebar should use a compact global rail with all 14 visible MVP module icons in every module screen.
- Module workspaces should fill the available app area without decorative outer padding or empty margins around small panels.
- Home should follow the current `LifrOs 2/docs/requirements/home.md` behavior: one full-workspace `Расписание дня` surface, greeting/header band attached to the schedule, two waking-window timeline columns, current-time marker, and timed tasks, habits, reminders, and Calendar events from their source modules. Focus sessions are not shown on Home in the MVP.
- Home should not show Quick Add, lower summary cards, an untimed block, a details card, extra dashboard panels, or a top dashboard row with overdue/event/free-window cards in the current browser design pass.
- Finance should use the existing `Lifeos` finance module as visual/reference material, but the current browser design pass is account-first: account creation lives in the sidebar with a `RUB`/`USDT` currency choice, the shared module header is hidden, the selected account name and balance live in the account header, transaction history fills the selected account workspace, and transaction entry starts from a compact add button in the transaction-history header.
- Contacts should use the shared basic-module light layout: compact contact list/search on the left, quiet sidebar plus action, and one central editable contact card. It is not a Notes subpage and should not introduce a right inspector in MVP.
- Notes should be Obsidian Companion Gateway rather than only Obsidian-like: app-owned/default Markdown vault, Obsidian import, backup/export/search/index ownership, and a primary module surface that hands the owner into the real Obsidian desktop app. The current visible Notes route is a centered `Открыть Obsidian` button plus a persistent `Автоматически открывать при нажатии на модуль Notes` checkbox. When enabled, the checkbox auto-launches `obsidian://choose-vault` on Notes entry; when disabled, the button is manual. Browser preview mode must be visibly preview-only and must not auto-launch Obsidian or produce fake `obsidian://` links for `browser://` localStorage paths. Notes must not send a folder path through `obsidian://open?path=...`, because that Obsidian parameter is for files.
- Quick Notes is a separate lightweight module for short text notes and an always-on-top mini-window. Its mini-window design prioritizes extremely low resource use during gaming: a native Windows text window for second-monitor reference use with explicit view-only and edit modes, plain text only, no React/WebView in the mini-window, no game-overlay requirement, no timers, no animations, no polling, no heavy Markdown/graph/backlink work, no unnecessary autosave churn, and selected text/mode pushed only when the payload changes.
- The main modules should be detailed enough before implementation planning that they show real rows, properties, states, and module-specific panels, not only generic cards.

The Notes module is no longer a LifeOS-native textarea/editor target. It should be designed as a serious local Markdown vault owner plus a companion gateway into the real Obsidian app. Do not copy Obsidian proprietary source code or assets, do not bundle Obsidian, and do not rely on native window embedding as the MVP path.

## Daily Hub

The central connected hub is:

1. Home
2. Tasks
3. Habits
4. Calendar

Focus is deep and important, but it connects through optional task context and dated focus sessions rather than being part of the central hub.

Other modules connect through explicit, limited relationships:

- tasks can appear on Home and Calendar when scheduled;
- habits can appear on Home and daily planning views;
- focus sessions can optionally link to tasks or run without a selected task;
- records can use dates;
- notes and diary remain mostly standalone writing surfaces in the first version.
- project-task links are deferred; projects are lightweight standalone records in the MVP.

LifeOS v4 should not start with a universal relationship graph.

## Architecture

LifeOS v4 uses a modular monolith.

Layers:

1. Tauri desktop shell.
2. React + TypeScript UI.
3. Typed Tauri bridge.
4. Rust-owned domain/data core.
5. SQLite for structured records and relationships.
6. Markdown/file-vault surface for notes.
7. Rebuildable search index.
8. Backup/export in readable JSON/Markdown.

React owns presentation and local UI state. Rust-owned services own durable business rules, persistence, import/export, backup, and future sync boundaries.

## Architecture Risks

Risks:

- Tauri command bridge can become too large.
- Module boundaries can blur inside one SQLite database.
- Markdown and SQLite records can drift.
- Future mobile reuse can fail if durable rules leak into React.
- Backup/export can become incomplete if treated as a late feature.

Mitigations:

- Use typed module APIs.
- Keep explicit domain services.
- Define source-of-truth rules per data type.
- Treat indexes and caches as rebuildable.
- Keep durable rules in Rust/domain services.
- Build backup/export early as a data-contract check.

## Design Direction

Approved Figma board:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq

Latest all-module board capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=8-2

Latest OpenCode-like variant B capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=15-2

Local board source:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-all-modules-v5.html`

OpenCode-like variant B source:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-opencode-variant-v1.html`

Approved direction: Option A, Quiet Command Workspace.

Variant B, OpenCode-like Command Workspace, is now available for review. It is a darker, more app-like alternative created after inspecting the locally installed OpenCode app, then refined with local TickTick and Obsidian references. It keeps the LifeOS product logic but changes the shell to a desktop workspace with a thin drag strip, narrow rail, context sidebar where useful, central work surface, and right inspector where selected entities need detail.

The UI should be a light, calm, dense desktop workspace:

- left icon sidebar;
- contextual top header;
- full-workspace module surfaces;
- no decorative outer padding around module workspaces;
- global left rail spans the full app height, keeps all 14 visible module icons visible, and uses the `40px` production rail token in the current desktop app; older board captures may still show `42px` as historical reference geometry;
- the production desktop app uses the normal native window frame for now and should not add a custom app-level top chrome row or internal top offset;
- module headers are compact context bars or absent; do not stack repeated page titles inside the same screen;
- the global rail owns module identity. Shared workspace chrome and module-local top-left sidebar headers should not repeat literal module names; use accessible labels and meaningful current-context titles instead;
- Calendar owns the full available module workspace;
- Home uses a Life OS 2-style daily schedule surface. The latest Home reference pass is light, schedule-first, today-only, without a context sidebar, and shows two timeline windows (`07:00-14:45` and `14:45-22:30`) with current time, habits, reminders, Calendar events, diary, and sleep cards. Focus sessions are excluded from Home in the MVP;
- Calendar is represented by review slides for Month, Week, Day, and Three-day, with the Month/Week/Day/Three-day behavior closer to the provided TickTick screenshots;
- Tasks, Habits, Calendar, and Focus should borrow TickTick's dense productivity structure where it fits LifeOS;
- Notes is currently the Obsidian Companion Gateway: a minimal handoff surface into the real Obsidian app plus LifeOS-owned vault/import/backup/search responsibility;
- Variant B should show the current visible MVP modules with concrete module detail, not only representative examples;
- The accepted Home/Tasks/Habits/Calendar Month light browser reference now propagates to the rest of the module board: Calendar Week/Three-day/Day, Contacts, Notes gateway, Quick Notes, Focus, Projects, Diary, Physical Health, Finance, Trading, Settings, and module scenes use the same compact rail/header/sidebar geometry, tinted workspace, raised light surfaces, dense rows, and module-specific compact records;
- decorative chart placeholders should not be used as module detail; use rows, records, metrics, and properties instead;
- compact lists, tables, timelines, editors, and detail panels;
- restrained blue primary accent;
- semantic tokens;
- no decorative landing-page layouts inside the app;
- no floating-card composition as the main module layout;
- no nested cards for ordinary workspace structure;
- dark mode as a secondary app-wide tokenized mode.

## Icon System

The global module rail uses the module icon vocabulary from the existing Life OS projects, with `LifrOs 2\.worktrees\phase-0-1-foundation-visual-prototype\src\app\routes.ts` as the primary source.

Current rail mapping:

- Home: `Home`
- Tasks: `CheckSquare`
- Habits: `CalendarCheck`
- Calendar: `CalendarDays`
- Projects: `FolderKanban`
- Contacts: `Contact`
- Notes: `BookOpen`
- Quick Notes: `StickyNote`
- Diary: `NotebookPen`
- Physical Health: `Dumbbell`
- Finance: `CircleDollarSign`
- Focus: `Timer`
- Trading: `LineChart`
- Settings: `Settings`

The HTML design board embeds these as inline SVG paths so the visual artifact stays self-contained and does not depend on ignored old-project folders. The production desktop app uses `lucide-react` directly. The active production rail uses a `40px` rail, `30px` icon buttons, `18px` SVGs, and `strokeWidth={1.8}`. Older board captures with `42px` rails are historical reference dimensions, not the current production token.

## Module UI Contract

Every module should feel like part of one application.

Shared patterns:

- compact or absent module header;
- toolbar;
- search/filter/sort controls;
- create/edit dialogs;
- confirm dialogs;
- empty states inside the relevant work area;
- list/table rows;
- right detail panel where useful;
- compact status badges;
- consistent disabled/loading/error states.

Visible controls must work, be honestly disabled, or be removed.

Right-clicking ordinary app surfaces must not open native browser/WebView UI. Context-menu UI is allowed only where it is explicitly designed as part of the product interaction.

The implementation should not reproduce the design-board issue where duplicated H2/H4 module titles compete with the app header. The source board v5 also avoids `span` tags so the visual hierarchy is represented by clear block/control elements.

Board v5 replaces the simpler v4 module examples with richer working layouts while keeping the same structural constraints: no source-board `span`, H2, or H4 tags. The 2026-05-05 icon pass replaces temporary module text symbols with the source-project lucide icon vocabulary in the global rail and module-local navigation rows.

Variant B has a latest browser-comment pass after node `15:2`. It keeps the OpenCode-inspired shell for the broader board, makes Tasks much closer to TickTick, makes Notes closer to Obsidian, expands the candidate across the visible MVP modules, and updates Home to the provided Life OS 2-style daily schedule logic while keeping the same visual language as the rest of the app.

Variant B browser-comment corrections:

- the top chrome/drag behavior should not create a visible empty strip in previews; drag behavior can live invisibly in the compact header/top region while the module surface starts immediately below it;
- top search is removed;
- global rail and context sidebar are full-height;
- sidebar `Новая запись` is removed;
- prompt technical metadata is removed from visible UI;
- Home is a Life OS 2-style `Расписание дня` surface with a vertical time strip, two schedule windows, current time marker, and concrete cards for today's tasks, habits, calendar events, reminders, diary, and sleep;
- Home day range is exactly wake-to-sleep. If wake is `07:00` and sleep is `22:30`, the schedule is `07:00-22:30`; wake is at the top of the vertical timeline and sleep at the bottom.
- Home's current-time marker includes a pulsing point that moves on the vertical time strip.
- Home no longer uses a separate light-only treatment or any search field inside the module preview;
- Home has no day selector;
- Calendar uses the full module page and now has Month, Week, and Day/Agenda review slides, with Month closer to the provided TickTick calendar reference but styled in the same Variant B visual system;
- Calendar bottom mode/promo strips are removed from all three review slides;
- all visible app UI is Russian-first by default for the MVP;
- English localization is now a Settings-owned secondary language mode;
- the `LifeOS v4 ~\personal operating system` label is removed from every module sidebar;
- Tasks adds `Новый список` and separates regular lists from `Выполнено` and `Корзина`;
- Habits adds `Новая привычка`;
- Habits support daily, selected-weekday, weekly, selected-month-day, monthly, and yearly recurrence, plus checkmark, timed, and quantity/count habit types;
- Quantity habits use count/times only at first; partial progress is recorded and the previous streak stays unchanged without increasing, decreasing, or resetting;
- Habit duration, timer, and checklist types are deferred from the MVP;
- Habit statistics and retroactive recalculation are required;
- Home can mark habits and tasks complete, but cannot move or reschedule them;
- Home shows today only, has no progress summary/evening review, and does not recommend how to fill free windows in the MVP;
- Home does not show a separate block for tasks without time in the MVP;
- tasks outside the wake/sleep window stay in Tasks and do not render on Home;
- overlapping Home items should stack as real cards with small diagonal offsets, without changing their source records; hover/focus raises the inspected card above the rest of the group, and the current web reference should not use decorative stacked duplicate cards;
- Tasks use a TickTick-like MVP model: title required; description, date, time, priority, reminders, subtasks, recurrence, and status optional; initial statuses are `Не начато`, `В процессе`, and `Ожидает`; completion remains separate from status; tags and duration estimate are deferred;
- Month Calendar does not show habits; shorter day/week/three-day schedule views may show timed habits when they fit;
- Birthdays/holidays are Calendar events with optional reminders, not habits;
- Calendar opens to Month by default;
- Home can show relevant Calendar events such as birthdays in addition to today's tasks and habits;
- recurring tasks use a TickTick-like next-occurrence behavior after completion;
- reminders use Windows system notifications in the MVP;
- Habit streaks are shown in Habits, not in the Home schedule;
- Projects uses project names plus `Новый проект`, removes `Срезы`, and shows optional editable project fields in the main workspace. The user defines stages/metadata manually; no field is mandatory. There is no Kanban board in MVP: the left side is a compact user-created project list and the right side is the selected project's information fields;
- Historical Notes direction: the earlier Obsidian-like file explorer/editor workspace is superseded by the Obsidian Companion Gateway unless the owner explicitly re-promotes a LifeOS-native Notes surface;
- Diary is a monthly calendar. Selecting a day opens an overlay/modal with the day entry, day rating, mood, energy, `что сделал`, and media attachments; it closes through `X` or the transparent backdrop;
- Physical Health is based on body-zone selection, complaint context, triggers, and doctor-visit records;
- Finance is account-focused in the browser preview; transaction entry is modal-backed from the transaction-history header add button, account creation supports `RUB` and `USDT` only for now, while broader currencies, budgets, categories, and filters need later confirmed workflows;
- Focus centers a flexible timer/Pomodoro surface, can start from a selected task or without one, opens a mini-window after launch, stays above other desktop windows while active/mini Focus is visible, supports focus sounds/custom imported sounds, performs no automatic completion action, and does not project sessions into Home/Calendar in the MVP;
- Trading has a top-level quick `Плеи` (`Plays`) capture list plus detailed `Фьючерсы` and `Щиткоины` journals, without a left selection table;
- prompt/action boxes are removed from every module surface;
- decorative chart placeholders are removed from module detail areas;
- the current product direction is light-first: the initial app and active browser design should use the light theme. Dark mode is a secondary app-wide tokenized theme, and one active UI state must not mix module-level themes;
- latest Variant B Figma capture is `https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=16-2`.

## Variant B Logic Redesign Pass

Date: 2026-05-05.

Applied to local preview:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-opencode-variant-v1.html`

Purpose: align the design board with the answered product logic before functional implementation.

Changes:

- Home now treats the schedule as a read-only aggregation of today's tasks, timed habits, calendar events, diary item, sleep, and reminders; Focus is removed from Home because it is not planned in MVP.
- Tasks quick-add and detail panel now match the confirmed MVP fields: title, description, date/time, priority, list, recurrence, reminder, subtasks, and status. Tasks reopen to the last selected target instead of always defaulting to `Сегодня`. Task-project links, tags, and duration estimate remain deferred.
- Habits use the new `CalendarCheck`-style module icon, show count/times wording, preserve streak on partial completion, and avoid premature health-module linking.
- Calendar toolbar creation is explicitly `Событие`; week/day views no longer show focus sessions and instead show tasks/events/habit previews where appropriate.
- Focus is redesigned around a centered flexible timer/Pomodoro surface, optional task selection, mini-window, sounds, custom sound import, and no automatic post-session action.
- Historical pass note: Notes copy then explicitly said local Markdown `.md` files as the source of truth, with Obsidian-like file tree, tabs, editor, preview, backlinks, and graph. This is superseded by the later Obsidian Companion Gateway direction unless the owner re-promotes a LifeOS-native Notes surface.
- Added separate interface slides for `Новая задача`, `Дата и повтор`, `Напоминание`, `Мини-фокус`, and `Иконки и темы`.
- Added icon paths for habit, calendar event, reminder, Markdown file, list creation, alarm/time, focus sound, and imported sound.
- Documented the updated theme direction in the board: light-first workspace baseline, dark app-wide secondary theme.
- Figma capture still needs to be refreshed after owner review of the local preview.

## Interview Capture: Habits, Reminders, Calendar, Focus, Notes

Date: 2026-05-06.

These decisions update the next design pass:

- Home habit cards show name, type (`Привычка`), time when present, completion control, count progress when the habit is multiple-times-per-day, the user-selected habit icon, and the user-selected habit color.
- Habit module cards and right/detail panels should follow TickTick's habit UI as the primary reference. MVP starts with one common habit list; categories are not needed yet.
- Habit miss/streak logic is visible in design states: total miss resets streak; partial completion such as `3 из 4` records progress but leaves the previous streak unchanged.
- Reminder records are MVP. Standalone reminders use their own title; linked reminders can inherit the task title. No extra reminder text/description is needed.
- Reminders render on Home as separate yellow schedule cards and use Windows system notifications. Reminder history is not MVP. A full notification center is future work.
- Calendar events have title, date, repeat, description, optional reminder, and default color. Event-specific colors, attachments, and special birthday fields are not MVP.
- Month Calendar should be dense: timed tasks first, events and untimed tasks also visible, and internal cell overflow/scrolling when many records exist.
- Date-level Home event display should not be a large top dashboard card in the current design pass. Timed Calendar events appear directly in the timeline.
- Calendar Day, Three-day, and Week views should use the provided TickTick screenshots as interaction references: full grid, colored blocks, checkbox where relevant, title, and time range.
- Focus centers a circular remaining-time timer with lower sound, start/pause/resume, finish-session, and mini-window controls. It stays topmost while an active session or mini Focus surface is visible, stores session history, shows the result-note panel only after session end, and shows focus streak/statistics by day. App/process control, blocking, redirects, and deviation logs are future work.
- Historical Notes direction: the internal Obsidian-style file tree, tabs, editor, preview, search, tags, graph, attachments, and Obsidian import surface is superseded by the Obsidian Companion Gateway. LifeOS still owns/imports/backs up the Markdown vault and rebuildable indexes; the primary editing path is the real Obsidian desktop app unless a LifeOS-native Notes surface is promoted again.
- Diary is the Daily Note module. It can use/export Markdown and should capture what happened, what was done, feelings, emotions, reflection, rating, and media.
- Project module MVP is not a board. It is a left project switcher plus a selected-project interface with optional fields. The `что мешает реализации` field is plain free text and can be empty.
- Diary `что сделал` should combine completed tasks and completed habits for the selected day with a manual free-text addition.

## Planning Readiness

The general design direction is approved for implementation planning.

The all-module board v5 with the icon pass and the updated Variant B node `14:2` are reference material for implementation and future visual QA.

The next implementation artifact should be the real Tauri + React + TypeScript desktop app. The current browser/HTML board remains useful for layout review and screenshots, but it is no longer the main build target.

## 2026-05-06 Logic Scenes Redesign Preview

Local preview:

`http://127.0.0.1:63239/lifeos-v4-logic-scenes-v1.html`

Local source:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-logic-scenes-v1.html`

Verification screenshot:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-logic-scenes-v1-check.png`

This preview applies the latest TickTick and product-logic answers before implementation planning:

- Home shows today-only schedule, wake/sleep ranges, visible free windows, and overlapping item treatment. The latest browser pass removes the top overdue/event/free-window dashboard cards.
- Tasks shows TickTick-like smart lists, user lists, `Новый список`, Completed/Trash as system views, priority, repeat, reminders, and right detail panel.
- Habits shows TickTick-like list/detail/statistics, quantity progress, skipped/completed states, and `Новая привычка`.
- Calendar includes Month, Week, Three-day, and Day review screens in the shared dark visual system.
- Contacts, Notes, Focus, Projects, Diary, Physical Health, Finance, Trading, and Settings are updated to current logic.
- A dedicated scene board now shows secondary interfaces: new task, date/repeat picker, reminder picker, new habit, calendar event, mini focus, completed/trash, diary day, body-zone health record, account, trading journal, and themes.

Figma refresh status:

- Direct Figma write/capture was blocked by the Figma MCP Starter tool-call limit during this pass.
- The local HTML includes the Figma capture script and should be pushed to the existing Figma file `MZuEFdqQ1iAaEZ6PjptRPq` when the MCP limit is available again.

## 2026-05-07 TickTick Follow-Up Design Notes

- Home is the first fully interactive prototype slice.
- Linked reminders do not become separate Home cards; only standalone reminders use yellow Home schedule cards.
- Timed Calendar events appear in the Home timeline while the event-of-day strip stays compact.
- Calendar Month cells scroll internally when dense.
- Calendar Month orders records as timed tasks, then events, then untimed tasks; reminders are excluded.
- Tasks needs a TickTick-like view switcher for List and Kanban, with Timeline deferred.
- Tasks needs grouping and sorting controls matching TickTick where possible.
- Completed view should show TickTick-like top filters, completion-date groups, counts, and muted completed rows.
- Trash view should show deleted tasks and a top-right clear action.
- Browser design previews should use full-width/full-screen module surfaces, not centered rounded outer containers.
- Browser design previews should keep any review/header area compact so the module itself is the first thing being evaluated.
- Visible app UI must not contain implementation or reference notes. Avoid labels such as `MVP`, `TickTick-like`, `completed/trash`, `detail panel`, `hover`, or `future` inside the product interface. Keep those notes in documentation only.
- Home needs a visible time-settings control for wake/sleep time, and the sleep boundary/card must remain visible on the vertical timeline.
- Tasks should add user lists through a miniature plus on the `Списки` section header.
- Tasks should expose List/Kanban as compact view controls, with a small sort/control button and a three-dot list-actions button. Timeline remains deferred and is not shown as an active header action.
- Task grouping and sorting should be compact menu/dropdown controls, not an always-open explanatory panel.
- Task screens title themselves by the selected list name. The generic module name `Задачи` should not replace the selected list title.
- Task rows should be compact and close to TickTick density.
- Task right panel should look like TickTick's selected-task editor: minimal top controls, large editable title, open editing body, and a bottom row with list/action icons, not a property table.
- Habits need a visible `+ Привычка` add action.
- Calendar needs a visible `+ Событие` add action.
- Notes removes the redundant module header, puts file tabs at the top of the workspace, and uses Obsidian-like folder disclosure chevrons in the file tree.

## 2026-05-07 Module Annotation Corrections

- Settings sidebar contains setting groups: `Оформление`, `Модули`, `Главная`, `Уведомления`, `Синхронизация`, `Данные`.
- Settings must not show the old add-style `Настроить` sidebar button.
- Trading mode name is the visible plural label `Щиткоины`; the internal compatibility key can remain `memecoins`.
- Trading uses a centered mode selector for `Плеи`, `Фьючерсы`, `Щиткоины`, and `Правила`; there is no module-local left sidebar for choosing these modes.
- Finance uses account navigation plus compact `+ Счёт`; transaction creation is a modal-backed transaction-header add action, not an always-visible entry panel or top-right account header action.
- Physical Health needs a compact `+ Зона тела` action in the sidebar.
- Diary opens as a month-calendar surface first; day details are secondary after selecting a date.

## 2026-05-07 Browser Diff Corrections

- Home schedule markers are strict timeline elements: the current-time dot is centered on the vertical line, time labels align to card centers, the two timeline labels split the wake-to-sleep day at the midpoint, and sleep sits at the bottom of the second day window.
- Home boundary cards (`Подъем` and `Сон`) must be inspectable even when overlapped by schedule cards: hover or keyboard focus raises the boundary card above the overlap stack.
- The primary Home browser screen follows the provided light reference: two timeline columns, white schedule cards, colored leading icons, completion circles, and the current-time guide line. The old Home comparison scene is removed from the browser board.
- Task list preview has two separate screens: default list with no selected task and no right panel, plus selected/editing task with the right editor visible.
- Task list content spans the full width of the task workspace section in both states; do not inset the list as a narrower centered column.
- Calendar Month, Week, Three-day, and Day share a compact header pattern. Titles and controls live in the top panel; explanatory helper text is removed from the product UI; calendar grids occupy the remaining workspace.
- Notes uses a flush Obsidian-like editor shell: no padding around the main workspace, tabs touch the top edge, tabs are rounded and close, and visible file names omit `.md`.
- Notes tabs use equal widths and share the tab bar evenly when many tabs are open. The editor shell does not show a bottom vault/status strip.
- Focus includes a direct `Выбрать задачу` action, and timer controls use playback-style icon buttons for pause/stop.
- Project fields are editable user-filled controls in the main workspace. The default project list screen removes the top add button and right inspector.
- Diary starts from a full-height month calendar with compact header, no top add button, and no right day-summary panel.

## 2026-05-07 Health Finance Trading Settings Corrections

- Physical Health is a body-zone-first workflow: add a body zone, then write what bothers the user, under which conditions it appears, and optionally add a doctor appointment inside that zone.
- Finance preview is account-first: only account creation is primary, and income/expense/operation sections are removed from the sidebar.
- Trading uses a top-centered Plays/Futures/Shitcoins/Rules selector, no right inspector, and separate slides for those modes.
- Settings removes the right inspector and keeps the main information in the central workspace.

The next step is to write an implementation plan that starts with the shared foundation before building module depth.

## 2026-05-07 Stage 2 Shell Implementation Contract

Stage 2 establishes the production desktop shell in `apps/desktop` as a light-first app UI, not a decorative preview surface.

Implementation rules now active for future module work:

- The app uses global theme tokens for background, workspace, surface, raised surface, text, muted text, borders, accent, danger, warning, success, focus, and module colors.
- Dark theme tokens are a secondary app-wide theme boundary. The active default remains light.
- The left rail is global, full-height, icon-first, and visible on every module route.
- Each left-rail module icon reveals the module name as a compact highlighted label on hover and keyboard focus. The label should use the module color/tokens and supplement, not replace, accessible labels.
- The 14 visible MVP modules stay in the shared rail order: Home, Tasks, Habits, Calendar, Projects, Contacts, Notes, Quick Notes, Diary, Physical Health, Finance, Focus, Trading, Settings. Psychological Health is disabled unless explicitly promoted again.
- Module workspaces fill the available shell area. They must not be placed inside a centered decorative outer card.
- A compact workspace bar may identify the active module, but future modules should avoid duplicated large page titles inside the content.
- Module-local side panels are allowed when they serve navigation or editing, but nested card composition is not the default layout pattern.
- Shared UI primitives for Stage 2 are `IconButton`, `SegmentedControl`, `InputRow`, `ListRow`, `CompletionMark`, `StatusBadge`, `Modal`, and `Toolbar`.
- Interactive controls must preserve visible keyboard focus through the shared focus token.
- Current MVP accessibility baseline: use native focusable controls where practical; give icon-only actions accessible names; keep dialog/overlay close actions labelled and keyboard reachable; respect reduced-motion preferences for nonessential motion; target WCAG AA contrast for text/icons in both light baseline and dark secondary theme; use practical compact desktop hit targets and allow smaller dense controls only when they remain labelled and keyboard accessible.
- Visible app UI must stay product-facing and Russian-first by default, with English available through the shared i18n boundary. Technical labels such as implementation status, placeholder wording, reference notes, or milestone labels do not belong in module surfaces.

## 2026-05-08 Stage 12 Notes Implementation Contract

Historical note: this section records the earlier LifeOS-native Notes workspace.
It is superseded as the primary Notes surface by the 2026-05-14 Obsidian
Companion Gateway direction unless the owner explicitly re-promotes native Notes.

- Notes storage is local-first and file-based: the Tauri app data directory owns `notes/`, and Markdown `.md` files inside that folder are the source of truth.
- The default note attachment boundary is `notes/_attachments/`; Obsidian imports also preserve attachment/image files in their imported relative folders.
- The Notes UI uses a three-column workspace: file tree, editor/preview workspace, and references/attachments panel.
- The file tree supports nested folders with right/disclosure chevrons that rotate when open.
- Visible note labels in the tree and tabs hide the `.md` suffix.
- Open note tabs are equal width and divide the available tab bar space when many tabs are open.
- The main workspace supports Markdown editing, rendered preview, and a graph view generated from wikilinks.
- Search, tags, backlinks, graph edges, and attachment references are rebuildable from Markdown files and are not separate canonical records.
- The Obsidian import flow accepts a local vault path and copies Markdown files, nested folders, and non-Markdown attachments/images into the app-owned notes folder.
- The Notes workspace has no bottom status strip for vault name, word count, backlink count, or Markdown labels.

## 2026-05-08 Stage 15 Visual QA Contract

- Stage 15 is a visual QA and micro-detail pass after the working flows. It must not redesign the app architecture or replace module workflows.
- The active production UI remains light-first across every module. Dark mode is a secondary app-wide boundary, not a module-specific exception.
- Shared surfaces use tokenized tinted neutrals: background, workspace, muted side panels, surface, raised surface, borders, text, semantic colors, focus, and module colors.
- Module workspaces must fill the available shell width and height. Do not reintroduce centered decorative outer app cards, large empty margins, or nested card composition for ordinary workspace structure.
- Home should stay close to the approved light schedule reference: two timeline columns, full wake-to-sleep range, tinted workspace, light raised cards, colored leading icons, completion circles, current-time dot and guide line, and visible sleep boundary.
- Home schedule cards should use full-border, icon, and background tint treatments. Do not use thick colored side-stripe accents.
- For the browser Home screenshot reference, a narrow semantic leading rail is allowed on schedule cards when matching the approved 2026-05-08 light screenshot; it should read as the item type/color cue, not as unrelated decoration.
- The browser Home reference should not show a decorative lower-right spark mark.
- Focus should stay calm and task-centered. Avoid decorative radial/glow/orb backgrounds; the circular timer and lower session-control dock carry the visual focus.
- Tasks, Calendar, Notes, and Focus should keep dense rows, lucide-style icons, and product-facing empty/loading states. Focus should not duplicate module/task headers above the timer.
- Settings and data surfaces may show user-relevant paths and data-safety results, but search/results must show module names rather than internal ids such as `module_id`.
- Visible product UI must not show technical/reference helper copy, milestone labels, source-reference labels, or explanatory prompt boxes.

## 2026-05-09 Browser-Wide Home-Based Web Redesign

- The current web design board uses the approved Home light screenshot as the visual baseline for every module preview, not only for Home.
- The shared browser shell should read as one app: compact global rail, pale contextual side panels, tinted workspace background, compact module headers, raised light cards/panels, dense rows, semantic badges, and lucide-style icon buttons.
- The shared browser shell now standardizes non-Home module geometry around the Tasks reference: 40px global rail, 214px contextual sidebar when present, compact 55px headers, and full-height tinted workspaces.
- Home remains the geometry reference for visual tone: light workspace, subtle blue rail accent, white raised cards, small semantic color cues, and no decorative lower-right spark.
- Other modules keep their module-specific layouts and workflows while adopting the Home-derived surface treatment. Calendar keeps full grids, Notes keeps the Obsidian-like editor shell, Focus keeps the central timer, Trading keeps the top mode switch, and Settings keeps the group sidebar.
- The active browser design must not contain dark module-level surfaces. Dark mode is a secondary app-wide theme, not a per-module exception.

## 2026-05-09 Tasks Web Reference Matching

- The browser Tasks module now follows the supplied light reference screenshot closely: narrow rail/sidebar geometry, compact `Сегодня` header, a single quick-add input row, separate group labels, raised task cards, dense checkbox rows, red overdue dates, gray right-side time indicators, and small inline tag chips.
- Tasks secondary controls stay quiet: plus icons in quick-add/sidebar list creation are muted, while the selected-task editor footer remains pinned to the bottom of the right panel.
- This reference is for the web design board's default no-selection Tasks state. The selected-task editor state remains a secondary Tasks screen.

## 2026-05-09 Habits Web Reference Matching

- The browser Habits module now borrows the supplied TickTick-like habit layout while preserving the LifeOS light shell: global rail only, compact header actions, broad weekly day strip, simple habit rows, selected habit outline, and a right detail panel.
- The right Habits panel contains the selected habit title, compact metric cards, a monthly registration grid, and a monthly journal block. It should feel like part of LifeOS, not like the orange TickTick shell.

## 2026-05-09 Cross-Module Browser Annotation Corrections

- Calendar Month rows must remain contained inside the module viewport; dense lower rows scroll inside their day cells instead of sliding under the next screen on the design board.
- Empty navigation/file-tree counts are hidden. Do not render pale circular placeholders when a row has no count.
- Notes keeps its Obsidian-like three-column workspace, and the backlinks/graph column stretches to the full workspace height.
- Projects shows `Описание`, `Этап`, and `Что мешает` as vertical labels with editable text fields beside them.
- Physical Health keeps body-zone creation in the left sidebar only. The selected body-zone screen first offers the choice to create a note or add a doctor appointment.
- Finance keeps accounts in the left sidebar and shows transactions in the central workspace. The top header does not duplicate `+ Счёт`.

## 2026-05-10 Browser Reference Corrections

- The selected-task editor footer/source-list row is part of the editor window and stays flush to the bottom of the right panel.
- Habits now follows the supplied TickTick-like screenshot more tightly while preserving LifeOS light shell: compact header actions, weekly progress rings, selected `Сегодня` day, two dense habit rows with streak/completion text, and a right detail panel with metric cards, monthly registration grid, note input, and journal.
- Calendar Month now follows the supplied dense TickTick-like screenshot more tightly: compact header controls, full-height grid, separate light day cells, compact colored records with icons, clipped titles, and right-aligned times.

## 2026-05-10 Production App Design System Implementation Contract

- The browser HTML remains a reference board for future corrections; the production design implementation lives in `apps/desktop`.
- The production desktop app should reuse the accepted light reference as shared design infrastructure: 40px global rail, 214px contextual sidebar where present, compact 55px workspace header, tinted workspace background, raised light surfaces, dense rows, semantic badges, lucide-style icon buttons, compact inputs, and modal surfaces.
- Applying the reference to the app must preserve working module behavior. Navigation, React state, forms, Tauri data calls, local persistence, and module-specific flows are retained and restyled through shared tokens/CSS instead of replaced by static board markup.
- The shared tokens in `apps/desktop/src/app/theme` are the source of truth for light-first production colors, spacing scale, rail/sidebar/header dimensions, border radius, focus ring, and elevations.
- Production-visible buttons and icon buttons must not be decorative. Each one must trigger an existing action, open a modal/menu/picker, switch state, focus the controlled field, or be honestly disabled with a clear `aria-label`/`title`.

## 2026-05-11 Production Calendar Reference Match

- Production Calendar uses the supplied light web Calendar Month screenshot as the direct visual target for the React/Tauri module, not by copying static board markup.
- Calendar Month has no module-local sidebar in this reference; the compact header owns event creation, view switching, Today, previous/next, search, and overflow actions.
- Month uses a Sunday-first grid, month-only title, separate raised light cells, compact colored pills with source icons, clipped titles, and right-aligned times.
- Week, Three-day, and Day share the same light visual system with full-height schedule grids, left time rail, explicit positioned grid lines, and blocks sized by actual start/end time.
- `+ Событие`, view switchers, Today/previous/next, overflow, and event click must have real behavior. Search may remain visible only as an honestly disabled control until calendar search is implemented.

## 2026-05-11 Production Remaining Module Reference Match

- Production Contacts, Notes, Focus, Projects, Diary, Physical Health, Finance, Trading, and Settings follow the same Home/Tasks light design language while keeping their working React state, forms, navigation, and local persistence.
- Historical Notes detail from this pass: file tree navigation, equal tabs, editor/preview, and a full-height backlinks/graph panel were superseded by the 2026-05-14 Obsidian Companion Gateway direction unless a LifeOS-native Notes surface is explicitly promoted again.
- Obsidian vault import remains in Settings > Data; the visible Notes route is the gateway.
- Icon-only buttons must keep their glyph centered in the fixed button box; this is especially visible on the Notes sidebar add button.
- Task quick-add focus should outline the full add field, so adding a task reads as one active row.
- Focus keeps optional task selection, a centered timer, lower sound/start-pause/finish/mini controls, result capture after session end, and a right statistics panel.
- Diary uses a full-height month grid with only day number plus optional `?/10` rating in cells; editing remains modal after selecting a day.
- Physical Health uses action-backed note/doctor modes inside the selected body-zone workspace.
- Psychological Health is no longer part of the visible MVP module set.
- Finance shows account navigation on the left, an editable selected-account header with balance on the right, transaction history immediately below it, and a modal-backed transaction add flow from the transaction-history header.
- Trading uses four working tabs/modes: `Плеи` for quick investment capture, aligned Futures/Shitcoins journal rows, a modal-backed `+ Сделка` flow, and an editable section-based `Правила` screen with mini-mode plus section deletion.
- Settings group rows are clickable, module/notification/sync controls are stateful, and unavailable cloud sync is an honest disabled action.

## 2026-05-12 Tasks Quick Add And Row Selection Corrections

- Production Tasks quick-add remains a single compact row, but typed task text starts at the row's left edge once input begins rather than staying offset by the leading plus icon.
- The quick-add calendar affordance opens a compact date/time popover for the quick task; it should not launch the full new-task modal.
- The quick-add row and task group rows should read flat in the current browser reference, without raised drop shadows.
- Task row selection applies to the whole row, including right-side date/time metadata and empty row space. The completion checkbox remains a separate action.

## 2026-05-12 Production Habits Creation Corrections

- The Habits creation modal should hide internal habit type selection. The default habit is one completion per day, and an explicit `Добавить повторения` control reveals the daily repetition target only when needed.
- Choosing `Дни недели` in the repeat field should reveal compact weekday chips immediately, matching the TickTick-style picker expectation; weekday chips, week strips, and monthly registration grids use Monday-through-Sunday order (`Пн`-`Вс`).
- The selected day label in the Habits week strip should read `Сегодня`, and the blue pill must be wide enough that the word does not touch the edges.
- Habit delete is exposed through the selected habit actions menu rather than as a row-level destructive control.

## 2026-05-12 Projects Header Add Control

- Projects creation follows the Tasks sidebar pattern, but the left sidebar header is action-only in the current production app: it keeps the settings/add controls and does not repeat the visible `Проекты` module title.
- The Projects workspace should not show top-right status pills such as `Локально` or selected-record badges such as `Редактируется`; the workspace content and editable fields should carry the state.
- Projects should not render the shared top workspace module header. The visible screen begins with the Projects sidebar header and the selected-project workspace.
- The selected project name is edited directly in the selected-project header. The field grid starts with `Стадия` and does not duplicate `Название`.
- Remove extra horizontal divider lines in the Projects header area when they create a visual line across the workspace.

## 2026-05-12 Notes Workspace Chrome Correction

Historical note: this section applies only if the LifeOS-native Notes workspace
is promoted again. The current primary Notes route is the Obsidian Companion
Gateway.

- Production Notes does not render the shared workspace title/status chrome above the Obsidian-like workspace.
- The Notes left vault column begins at the top of the module area and replaces the `Файлы` title with an Obsidian-like icon action strip.
- The vault action strip is centered. New note and new folder are real actions; sorting and collapse-style vault controls can remain honest disabled states until those flows exist.
- Notes opens with an empty workspace rather than a fake default editor page: the title/view toolbar and editor/preview split appear only after the user opens or creates a note.
- The right backlinks/tags/attachments/graph panel is hidden by default and appears from an explicit tab-bar icon toggle.

## 2026-05-13 Notes Obsidian Public Model Alignment

Historical note: this section applies only to the superseded native Notes
workspace/future fallback. Current Notes is the Obsidian Companion Gateway.

- Notes uses the public Obsidian API architecture as a product reference rather than copying the closed desktop app: `Vault` informs file/folder operations, `Workspace` informs closable note tabs and pane behavior, and `MetadataCache` informs rebuildable backlinks, tags, attachments, and graph metadata.
- Open note tabs include close controls. Closing the active tab selects another open note when possible or returns the editor area to the empty no-note state.
- The right reference column uses Obsidian-style metadata pane tabs for `Ссылки`, `Теги`, `Вложения`, and `Граф`; it shows one pane at a time and remains hidden by default behind the top tab-bar toggle.
- File-tree drag/drop is the first Notes move interaction: dragging a note onto a folder moves it into that folder, while dropping it on empty file-tree space moves it to the vault root. The visual treatment stays quiet: the dragged row fades and folder/root drop targets receive a subtle accent outline/background.
- Folder drag/drop uses the same quiet file-tree treatment: dragging a folder onto another folder moves the entire subtree, and dropping a folder on empty file-tree space moves that subtree to the vault root.
- Notes file-tree rows also expose explicit move controls. Selecting a row move action enters move mode for that note/folder; folder/root target actions then complete the move so the feature is usable without relying on drag/drop discovery.
- Opened notes show a breadcrumb-style folder path above the note page. The note title is edited as a large inline title at the beginning of the page, not as a separate labeled toolbar field.
- Opened notes use one main note pane at a time. Edit and preview are switched by a compact button on the note surface instead of rendering a permanent second preview screen.

## 2026-05-14 Notes Obsidian Gateway Surface

- This supersedes the prior primary internal Notes workspace direction. The current Notes route should not render the file tree, tabs, CodeMirror editor, right metadata panes, or status strip as the primary user surface.
- The current Notes route is a centered Obsidian gateway with one `Открыть Obsidian` button and a checkbox below it: `Автоматически открывать при нажатии на модуль Notes`.
- The auto-open checkbox controls whether entering Notes launches `obsidian://choose-vault`. Without the checkbox, the button is the only launch action.
- The layout should be quiet and direct, not a helper card inside a larger fake workspace.
- Browser/Vite preview keeps the gateway visual shape but must not emit real Obsidian launch links for preview-only paths.

## 2026-05-12 Physical Health Annotation Corrections

- Production Physical Health does not render the shared workspace title/header above the module surface.
- Body-zone creation follows the Tasks sidebar creation pattern: a quiet plus icon in the `Зоны тела` header reveals the input row.
- The selected-zone note entry point is labeled `Заметки`; the actual `Создать заметку` action lives inside that workflow and opens a modal for the new health note.
- The doctor-workflow entry point is labeled `Приемы у врача`.
- The selected-zone content does not duplicate the active zone as a separate `Зона` field and does not repeat a second `Заметки` heading below the top action surface.
- Physical Health attachment picking appears in the health-note modal as a compact paperclip button; the main selected-zone screen does not show a standalone attachment row. Durable shared attachment storage remains a separate product/storage question.
- The health-note modal save action is visually centered under the modal fields.

## 2026-05-12 Focus Annotation Corrections

- Production Focus does not render the shared workspace title/header or the inner selected-task/status header above the timer.
- The lower center area under the circular timer owns the session controls: sound chooser, start/pause/resume, finish session, and mini-window mode.
- The result-note panel is not a persistent form. It appears only after the timer reaches zero or after the user presses finish session, then saves the session result into Focus history.
- Focus can start without a selected task; taskless sessions use the title `Фокус без задачи`.
- The task selector keeps a visible `Без задачи` option so taskless focus remains available even when active tasks exist.
- The browser/Vite Focus preview must support session start, pause/resume, finish, completion, and history through localStorage when the Tauri runtime is unavailable.
- The Focus statistics panel does not show a top total-minutes chip, and its side time-scale labels are aligned to the left edge.

## 2026-05-12 Diary Modal Layout Correction

- Production Diary does not render the shared workspace title/header or runtime `Локально` badge above the month grid.
- The Diary day-entry modal uses a wider panel than the default modal.
- `Что сделано` is a compact list section, not a textarea: completed task rows and completed habit rows appear first, followed by manually added done items.
- The media attachment control lives in the day modal, and media previews render as the final section after the free day-entry writing field.

## 2026-05-12 Diary Media Interaction Correction

- Diary media preview cards are inspection surfaces: clicking a preview opens a full-screen overlay for reviewing the media at readable size.
- Right-clicking a Diary media card opens a compact context menu with rename and delete actions.
- Manual done items in `Что сделано` use a dot marker rather than a plus icon, because they are existing completed items rather than create actions.

## 2026-05-12 Trading Journal And Rules Correction

- Production Trading does not render the shared workspace title/header above the module surface.
- `Плеи` (`Plays`) is a top-level quick-capture surface on the same selector level as Futures, Shitcoins, and Rules. It uses a compact inline form and same-screen list for ticker/idea, date, time, note/thesis, optional amount, and media.
- Futures and Shitcoins journal screens show the aligned deal table/empty state only; the full parameter form is not visible inline under the table.
- Futures and Shitcoins each expose a local `Реальный` / `На бумаге` journal switch. Both journals use the same layout and fields; paper entries are for hypothesis testing.
- Trading journal rows show both deal date and deal time, and rows are ordered by deal date/time with newest entries first.
- Trading journal rows include a `Статус` column.
- `+ Сделка` opens a modal with all current fields for the active journal mode, including date, time, and status. The modal create button says `Добавить сделку`, media uses photo-first attachment icon controls, and the Rules tab does not show the `+ Сделка` action.
- Trading rules are full-height editable user-created sections on the Rules screen. Each section has a title and body, the selected section can be deleted, the body editor starts directly below `Правила раздела`, and the selected section can use `Мини-режим` to open/update a separate native always-on-top mini-window instead of an in-app panel.
- The Trading rules mini-window is still a plain native text surface with view-only and edit modes, but it must be readable: use a normal Windows system UI font, keep text padded inside the control, preserve explicit new lines and blank lines from the rule body, and wrap only long lines automatically. Edit mode updates only the selected rule-section body.

## 2026-05-13 Native Window Frame Reversion

- Production LifeOS should use the normal native desktop window frame for now.
- The app must not reserve a custom top chrome row, invisible drag row, or any internal top offset inside the WebView.
- Module workspaces, sidebars, and Home should fill the available WebView height from the top edge.
- Any future frameless-window experiment must preserve full-height module surfaces and cannot introduce a visible or invisible strip that pushes content down.

## 2026-05-13 Default Windows Tray Icon

- Production LifeOS creates a Windows system tray icon by default on startup.
- The tray icon uses the app icon and `LifeOS v4` tooltip.
- The initial tray menu contains `Открыть LifeOS`, `Скрыть в трей`, and `Выход`.
- Clicking the tray icon opens/restores the main window; hiding to tray keeps the app running without showing the main window.

## 2026-05-17 Windows Autostart Setting

- Production LifeOS exposes a Settings control for launching the app automatically when the owner signs into Windows.
- The control appears as an `Автозапуск` row in Settings rather than adding a new sidebar group.
- Browser/Vite previews may show the row for layout and interaction testing, but the real behavior belongs to the desktop runtime integration.

## 2026-05-17 Cross-Module Design Synchronization

- Current visible MVP scope is 14 modules in this rail order: Home, Tasks, Habits, Calendar, Projects, Contacts, Notes, Quick Notes, Diary, Physical Health, Finance, Focus, Trading, Settings.
- Psychological Health is disabled/deferred and should not be used as an active module design target unless the owner explicitly promotes it again.
- The shared production visual contract is: light-first app-wide theme, `40px` full-height global rail, `214px` contextual sidebar where present, compact `55px` headers, full-height tinted workspaces, raised light surfaces, dense rows, quiet icon actions, and no decorative outer cards/nested cards/prompt boxes/chart placeholders.
- Notes supersedes the older internal Obsidian-like editor/file-tree route as the primary surface. The current Notes module is a minimal Obsidian Companion Gateway with `Открыть Obsidian` plus the persistent auto-open checkbox; Settings > Data owns Obsidian import.
- Quick Notes is the lightweight notes module for short text records and the always-on-top second-monitor mini-window. Its main module surface follows the shared light shell; the mini-window is the deliberate native Windows exception and should stay plain text, view-only/edit capable, and low-resource.
- Older reference sections that mention 13 visible modules, the old internal Notes file tree/editor/backlinks workspace as the primary route, or `42px`/Variant B rail dimensions are historical unless a later module spec explicitly re-promotes them.

## 2026-05-28 Global Dark Theme

- Light remains the default production baseline and source visual reference.
- Dark is the second global theme, selected from Settings > `Оформление` and applied through the shared shell `data-theme` boundary.
- Dark theme colors must come from `apps/desktop/src/app/theme/theme.css` semantic tokens and token-derived mixes. Module CSS should consume tokens for backgrounds, surfaces, text, borders, focus, disabled state, selected rows, modals, sidebars, calendar grids, task rows, habit rows, and app-shell chrome.
- Dark theme must use tinted dark neutrals rather than pure black, and light-on-dark text must avoid pure white while preserving readable contrast.
- Theme switching must not alter layout geometry: the `40px` rail, `214px` contextual sidebar, compact headers, dense rows, task/detail panel widths, Calendar grids, Home schedule geometry, Notes gateway, and Settings sections keep the same dimensions.
- Dark theme must preserve the LifeOS feel: dense, calm, useful personal workspace. It must not add decorative glow/orb backgrounds, glassmorphism, nested cards, thick side stripes, gradient text, or module-specific dark exceptions.
- Native mini-windows for Quick Notes and Trading Rules remain deliberate desktop exceptions; the main React modules still follow the global theme.

## 2026-05-14 Structural Design Exploration Requirement

- Design exploration must compare genuinely different interface structures, not the same shell recolored into multiple themes.
- A valid LifeOS design option should change at least some of: navigation model, primary workspace structure, action placement, editor/detail placement, density, module switching, and secondary-scene entry points.
- The product logic for module actions stays stable during exploration: creating tasks/events/notes/accounts/transactions, selecting rows, completing tasks/habits, switching Calendar views, toggling Notes metadata, and editing records should remain available even when the visual structure changes.
- Palette-only exploration can be used after a structural direction is chosen, but it is not enough for choosing the application design direction.

## 2026-05-18 Basic Module UX Maturity

- Projects, Contacts, Diary, Physical Health, and Trading use the shared light working-surface contract rather than demo-screen copy.
- Empty states should tell the owner what useful first action is available in that specific module.
- Projects and Contacts are compact exceptions inside the narrow sidebar: empty states should be miniature and title-only (`Создайте проект`, `Добавьте первый контакт`), not multi-line helper blocks.
- Async storage-backed module screens need quiet loading states and retryable error states in the work area that failed to load.
- Primary actions should stay native-control reachable from keyboard and become disabled only when the required user-entered fields are missing.
- Disabled fields should explain the missing user action, such as creating or selecting a record, instead of exposing internal storage/runtime details.
- Focus rings should be stable through the shared focus token and must not resize rows, headers, or editable field layouts.
- Basic modules may expose compact Settings shortcuts where a user would naturally look for module preferences; the shortcut should not compete with the primary creation/editing control.
- Active module UI should not show technical helper copy, internal ids, migration wording, or browser/runtime notes. Honest release/data limitations belong in Settings/Data, release notes, or explicit limitation notices.

## 2026-05-19 Dense Text And Completion Control Robustness

- Tasks visual fixes should preserve the current TickTick-like light design concept and only harden layout/typography.
- Dense task rows, task editor textareas, habit rows, shared list rows, and completion controls must not clip Cyrillic glyphs, slide text outside their intended column/panel, or let long titles/descriptions resize the workspace.
- Long task titles and descriptions should wrap, break, or scroll inside the list/editor surface instead of pushing adjacent metadata, the footer, or the right detail panel out of place.
- Task, habit, Home, and shared completion check marks must be visually centered inside their fixed square/circle control boxes.

## 2026-05-20 App Icon Refresh

- The Tauri app icon no longer uses the temporary `L3` placeholder.
- The current app icon is a text-free LifeOS mark: dark command-workspace tile, white LifeOS axis, and three colored module nodes.
- The icon must stay readable at 32px, so future changes should preserve a bold silhouette and avoid detailed text.
- Shell, tray, installer, and uninstaller should continue using the same generated Tauri icon family from `apps/desktop/src-tauri/icons/`.

## 2026-05-22 Focus Sidebar Scroll Correction

- The Focus setup sidebar remains fixed at the shared contextual sidebar width and should not feel draggable or horizontally movable.
- Focus setup controls must fit inside the sidebar by default. The sidebar may scroll vertically when the active mode has many settings, but it must not show a bottom horizontal scrollbar.
- Dense controls inside the Focus sidebar, including mode segmented controls and breathing presets, should compress within the column instead of pushing the whole sidebar wider.

## 2026-05-23 Habits Optional Time Controls

- Habit time is an optional control, not a mandatory always-visible creation field.
- The habit creation flow should start without a visible time input, expose `Добавить время` to reveal it, and expose `Убрать время` to clear it before saving.
- The selected habit detail surface should let the owner add, change, save, and remove a habit time after creation.
- Removing time keeps the habit record and its logs, stores `time: null`, and removes that habit from timed Home/Calendar schedule projections while leaving it in Habits.

## 2026-05-18 Repeated Module Title Removal

- Visible module names should live in the global rail hover/focus labels and accessible route labels, not as repeated top-left text inside every module.
- `Workspace` should not render a shared `h1` module-title chrome row by default.
- Module-local sidebars that would only repeat the module name, such as Projects, Contacts, Quick Notes, and Focus, should use action-only headers or controls. Keep `aria-label` on the region for accessibility.
- Meaningful local context titles stay visible: task list names, Calendar month/range titles, Diary month title, selected project/contact/account/zone titles, Settings group titles, and section labels such as `Счета`, `Зоны тела`, or `Разделы`.

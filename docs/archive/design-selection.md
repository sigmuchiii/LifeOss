# LifeOS v4 Design Selection

Created: 2026-05-05
Status: approved

Current override: LifeOS v4 now has 14 visible MVP modules after adding Quick Notes as a separate module. Psychological Health was removed from the visible MVP module set on 2026-05-13 and is disabled/deferred unless explicitly promoted again. Older captures in this document may still show previous module boards as historical reference material.

## Figma File

Figma design board:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq

Latest all-module capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=8-2

Latest OpenCode-like variant B capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=15-2

Local visual companion board:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-all-modules-v5.html`

OpenCode-like variant B source:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-opencode-variant-v1.html`

Served in the companion at:

http://localhost:63239/

## Context

The design board was created for choosing the shared module UI direction before implementation planning.

Fixed product constraints shown on the board:

- New project from scratch.
- Windows desktop first.
- 14 visible first-version modules.
- Daily hub: Home, Tasks, Habits, Calendar.
- No sync in the first version.
- Simple local privacy.
- Rust-owned core.
- SQLite + Markdown hybrid storage.

## Options

### Option A: Quiet Command Workspace

Status: approved on 2026-05-05.

Light, dense, operational desktop UI.

Best fit when LifeOS should feel like a serious daily control surface: calm, scannable, consistent across all modules, and not decorative.

Strengths:

- Works well for the then-current broad module breadth; current scope is 14 visible MVP modules after adding Contacts and Quick Notes.
- Supports dense planning, calendar, finance, trading, and settings screens.
- Keeps the app professional and useful for repeated daily use.
- Evolves naturally from the cleaner `LifrOs 2` visual direction.

Risks:

- Needs strong component discipline to avoid becoming generic.
- Personal/reflective modules need warmth through content and micro-layout, not a separate theme.

### Option B: Personal Journal OS

Warmer, softer, more intimate UI.

Strengths:

- Good for notes, diary, a future promoted Psychological Health module, and personal reflection.
- Feels less corporate.

Risks:

- May be too soft for dense modules such as tasks, calendar, finance, trading, and settings.
- Can reduce operational clarity.

### Option C: Dark Technical Console

Dark, high-contrast, power-user UI.

Strengths:

- Good for focus, trading, keyboard-first power use, and technical workflows.
- Strong identity.

Risks:

- Too cold for daily life, diary, health, and long writing sessions.
- Dark mode as primary identity may make the product less calm for broad life use.

## Approved Direction

Option A was the first approved primary direction. The current approved design path is Variant B: an OpenCode-like operational workspace with TickTick-style planning density and Obsidian-style notes.

Support a light-first app-wide theme baseline from the token layer, with dark mode kept as a later selectable app-wide theme. Do not mix separate visual themes inside individual modules during one active UI state.

## Initial Closed Decision

The owner selected Option A on 2026-05-05.

Later browser-review passes moved the active direction to Variant B, documented in the sections below.

## 2026-05-05 All-Module Board Update

Status: superseded by board v3.

The second board is obsolete and should not be used for current Home decisions.

It was replaced because it still reflected the older Home dashboard interpretation.

Figma capture completed into the existing design file at node `2:2`. A follow-up metadata/screenshot verification call was blocked by the Figma Starter MCP tool-call limit, so the returned capture link is the current verification artifact.

## 2026-05-05 All-Module Board v3 Update

Status: superseded by board v4.

Board v3 applies the latest corrections:

- module workspace examples remove decorative outer padding and empty margins;
- each module screen uses a visible left rail with all visible module icons;
- Home follows the current `LifrOs 2/docs/requirements/home.md` logic, not the older dashboard screenshot;
- Home is one full workspace centered on `Расписание дня`;
- Home no longer includes Quick Add, bottom summary cards, an untimed block, or a separate details panel;
- Home shows two waking-window timeline columns, timed tasks/habits/reminders/focus sessions, current time, and schedule item states.

Figma capture completed into the existing design file at node `3:2`.

## 2026-05-05 All-Module Board v4 Update

Status: superseded by board v5.

Board v4 applies the latest owner corrections:

- removed duplicate module title hierarchy: no repeated H2/H4-style module headings inside each screen;
- removed `span` tags from the source design board HTML;
- reduced module headers to compact context bars or removed them where the module should own the full workspace;
- Calendar uses the full available module workspace instead of a framed inner panel;
- the global left rail spans the full app height and keeps all 14 visible module icons visible;
- Home remains based on the current `LifrOs 2/docs/requirements/home.md` schedule surface.

Figma capture completed into the existing design file at node `4:2`.

A follow-up Figma screenshot verification call was blocked by the Figma Starter MCP tool-call limit, so the returned capture link is the current verification artifact.

## 2026-05-05 All-Module Board v5 Update

Status: awaiting owner review before implementation planning.

Board v5 applies the latest owner request:

- Tasks is redesigned closer to TickTick desktop: smart lists, lists, labels, filters, quick add, grouped task rows, selected task state, and right detail panel;
- the daily hub modules are more TickTick-like where useful: Tasks, Habits, Calendar, and Focus use dense productivity layouts instead of generic panels;
- every module is more detailed and shows real working surfaces, properties, metrics, rows, and secondary panels;
- Historical capture note: Notes was redesigned as an Obsidian-like vault workspace with file tree, nested folders, tabs, Markdown editor, preview, backlinks, wikilinks, graph panel, and properties; this is superseded by the Obsidian Companion Gateway direction unless re-promoted.
- Calendar remains full-workspace and is shown as a dense week grid fed by timed tasks;
- source design board still avoids `span`, H2, and H4 tags.

Figma capture completed into the existing design file at node `5:2`.

## 2026-05-05 Icon Pass On Board v5

Status: superseded by the narrow rail update.

The current board keeps the v5 layouts but replaces temporary text/glyph module symbols with the icon vocabulary from the existing Life OS projects.

Primary source:

`C:\Users\Nomoregooners\projects\LifeOS v4\LifrOs 2\.worktrees\phase-0-1-foundation-visual-prototype\src\app\routes.ts`

Secondary reference:

`C:\Users\Nomoregooners\projects\LifeOS v4\Lifeos\apps\desktop\src\app\AppShell.tsx`

Applied module icons:

- Home: `Home`
- Tasks: `CheckSquare`
- Habits: `Repeat2`
- Calendar: `CalendarDays`
- Projects: `FolderKanban`
- Notes: `BookOpen`
- Diary: `NotebookPen`
- Physical Health: `Dumbbell`
- Finance: `CircleDollarSign`
- Focus: `Timer`
- Trading: `LineChart`
- Settings: `Settings`

The design board embeds inline SVG paths for the rail and module-local navigation icons so the local/Figma artifact is self-contained. The future app implementation should use `lucide-react` with the same mapping.

Figma capture completed into the existing design file at node `7:2`.

## 2026-05-05 Narrow Rail Update

Status: current latest capture.

Owner requested the left bar to be narrower. The current board keeps all v5 module layouts and icon choices, but tightens the global module rail:

- historical global rail width: `42px` in this board option; current production rail uses `40px`;
- logo and module icon button width: `28px`;
- rail SVG size: `17px`;
- rail padding: `6px 3px`;
- all 14 visible MVP module icons remain visible in every module screen.

Figma capture completed into the existing design file at node `8:2`.

The capture URL is the current verification artifact for the density-only rail update.

## 2026-05-05 OpenCode-Like Variant B

Status: current dark candidate for owner review, not yet the approved implementation direction.

Reason for variant:

The owner said the current light board reads too much like a notebook with extra features rather than a pleasant application. OpenCode is installed locally and was used as the direct visual reference.

Observed OpenCode patterns translated:

- dark command workspace instead of light notebook surface;
- thin top chrome as an app drag area;
- narrow global rail plus a second context sidebar;
- large central work surface;
- right inspector for selected entity detail;
- compact module-level actions where the module needs quick input;
- thin borders, low glow, restrained accent states;
- full-width screen rows in the board so the workspace is not squeezed into small cards.

The first Variant B capture included six representative screens:

1. Home
2. Tasks
3. Notes
4. Calendar
5. Finance
6. Focus

Local board:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-opencode-variant-v1.html`

Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=10-2

The first Figma capture for this variant used a two-column board and made the app shell too cramped. Node `10:2` switched the variant to one full-width screen per row so the design reads like a real desktop app.

## 2026-05-05 OpenCode-Like Variant B, TickTick And Obsidian Detail Pass

Status: previous Variant B capture.

Owner requested the dark variant to become more practical and less like a notebook:

- Tasks should be much closer to TickTick desktop, using smart lists, quick add, grouped rows, selected task state, checklist/detail fields, date/status/priority metadata, and a right task inspector.
- The main modules should be adjusted toward TickTick where useful, especially Tasks, Habits, Calendar, and Focus.
- Notes should be closer to Obsidian but remain visually inside LifeOS: vault tree, nested folders, tabs, Markdown editor, preview, properties, backlinks, wikilinks, graph panel, and status bar.
- Every module should be more detailed, not just a generic panel demonstration.
- Documents must preserve these decisions so context is not lost.

Applied changes:

- Variant B now includes the full visible module set, not only six representative screens.
- The global rail is narrower than the first Variant B and keeps all 14 visible module icons visible.
- Home remains a command-center daily workspace.
- Tasks is now the most TickTick-like surface in Variant B.
- Habits gets a TickTick-like weekly/check-in layout.
- Calendar remains a full-workspace week grid with timed tasks and focus sessions.
- Projects, Contacts, Diary, Physical Health, Finance, Trading, and Settings now have concrete rows, properties, metrics, and inspector examples. Psychological Health is deferred unless explicitly promoted again.
- Historical dark-direction note: Notes was the Obsidian-like vault surface in this variant. Current Notes primary route is the Obsidian Companion Gateway.
- Source HTML still avoids `span`, H2, and H4 tags.

Local board:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-opencode-variant-v1.html`

Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=11-2

## 2026-05-05 Variant B Browser Comment Fixes

Status: previous Variant B capture.

Applied browser-preview corrections from owner comments:

- the upper chrome is now a much thinner drag area for moving the desktop app;
- top command search was removed from the chrome;
- global rail and left context sidebar now span the full height of each app screen;
- sidebar-level `Новая запись` action was removed because it does not match the TickTick reference;
- bottom prompt technical metadata such as `local-first`, `no sync`, and storage details was removed from visible user UI;
- Home is focused on `Расписание дня` from the Life OS 2 direction, not a task/dashboard surface;
- Calendar no longer renders a right inspector or bottom command prompt and the calendar surface owns the module workspace.

Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=12-2

## 2026-05-05 Variant B Russian UI And Module Focus Fixes

Status: previous Variant B capture.

Applied owner corrections:

- all visible app UI copy is Russian-first for the MVP;
- English is explicitly deferred to a future localization feature;
- the `LifeOS v4 ~\personal operating system` project label was removed from every module sidebar;
- topbar window symbols were removed from every module, leaving a thin app drag strip;
- Home and Calendar do not render context sidebars; Home is schedule-first and Calendar focuses entirely on the week grid;
- Tasks keeps TickTick-like navigation and replaces the old Archive grouping with `Выполнено` and `Корзина`;
- prompt/action boxes were removed from all module surfaces;
- source HTML still avoids `span`, H2, and H4 tags.

Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=13-2

## 2026-05-05 Variant B Life OS 2 Schedule And TickTick Calendar Slides

Status: previous Variant B capture.

Applied owner corrections:

- Home `Расписание дня` is now closer to Life OS 2: a vertical time strip from wake time to sleep time, with settings for `Подъем 06:30`, `Сон 22:30`, current time, and a fixed today-only schedule surface.
- Home no longer includes day selection controls. Other dates belong in Calendar.
- Calendar now has three review slides in the same board: Month, Week, and Day/Agenda.
- Calendar Month is closer to the provided TickTick reference: light dense month grid, Russian labels, compact colored task bars, month/week/day mode controls, and today highlight.
- Calendar Week and Day slides remain available so the owner can compare what to keep or remove.
- Decorative chart blocks were removed from Physical Health, Finance, Trading, and habit detail examples. These modules now show rows, metrics, and records instead of placeholder graphics.
- Visible app UI remains Russian-first; English localization stays in the future backlog.
- Source HTML still avoids `span`, H2, H4, `project-head`, `window-actions`, and prompt/action boxes.

Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=14-2

## 2026-05-05 Variant B Home Reference Pass

Status: previous Variant B capture.

Applied owner request:

- Home is redesigned to match the provided Life OS 2-style screenshot more closely.
- Home uses a light daily control surface even while the broader Variant B board remains the dark/app-like candidate.
- The module shows a top app search, greeting, current date, schedule title, filter icon, narrow left module rail, and no context sidebar.
- `Расписание дня` is the main surface: two vertical timeline columns, `07:00-14:30` and `14:30-22:00`, current-time marker, colored time ranges, and concrete cards for habits, reminders, focus, diary, and sleep.
- Home remains today-only; day switching stays in Calendar.
- This pass is design-only. Functional rules are still planned separately after design approval.

Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=15-2

## 2026-05-05 Variant B Annotation Fix Pass

Status: current latest Variant B capture.

Applied owner annotations:

- Home keeps the Life OS 2 schedule logic but is now styled like the rest of the app, without the module-only light treatment, top search, or window-symbol chrome.
- The global rail contains only module icons; extra pinned search/settings icons were removed.
- Timeline markers on Home were realigned.
- Calendar Month, Week, and Day/Agenda stay as review slides, but all three use the common Variant B visual system and no longer render the bottom mode/promo strip.
- Tasks adds `Новый список`; regular lists are separate from `Выполнено` and `Корзина`.
- Habits adds `Новая привычка`.
- Projects removes `Срезы`, keeps separate project names, adds `Новый проект`, and shows project description, current stage, blockers, and next actions.
- Notes is closer to Obsidian: sidebar file tree, tabs, editor, preview, backlinks, and graph without duplicated file tree in the workspace.
- Diary becomes a monthly calendar with selected-day note, rating, and media attachments.
- Physical Health becomes zone-based with complaint context, triggers, and doctor visit data.
- Finance is transaction-first; account/currency/budget setup is deferred.
- Focus centers the timer and includes task plus app/code-context tracking.
- Trading removes the left selection table and uses two journals: `Фьючерсы` and `Щиткоины`.
- The plan now starts with a light-first global theme baseline and keeps dark mode as a later selectable app-wide theme. English remains a future localization feature.

Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=16-2

## 2026-05-06 Logic Scenes Redesign Preview

Status: local preview ready, Figma refresh pending because the Figma MCP Starter tool-call limit was reached.

Local preview:

http://127.0.0.1:63239/lifeos-v4-logic-scenes-v1.html

Local source:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-logic-scenes-v1.html`

Applied changes:

- Added a full redesign pass based on the latest product logic and TickTick reference pass.
- Kept a shared dark operational visual language across modules.
- Added main module screens for Home, Tasks, Habits, Calendar Month/Week/Three-day/Day, Notes, Focus, Projects, Diary, Physical Health, Finance, Trading, and Settings.
- Added a scene/state section for new task, date/repeat picker, reminder picker, new habit, calendar event, mini focus, Completed/Trash, diary day modal direction, health body-zone record, finance transaction, trading journal, and theme preview.
- Documented the scene inventory in `docs/lifeos-v4/module-scenes.md`.

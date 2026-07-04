# LifeOS v4 Module Scenes

Created: 2026-05-06
Status: active design inventory

This file tracks concrete module scenes and secondary interfaces that must be designed separately from the main module screens.

## Purpose

The design board must show not only top-level module layouts, but also the workflows the user actually touches: creation forms, pickers, detail panels, overlays, focused states, empty/system states, and mini-windows.

## Shared Scene Baseline

- Scenes use the same light LifeOS shell as their parent module unless the module spec names an exception.
- Use the production geometry from the shared design contract: full-height `40px` global rail, `214px` contextual sidebar where present, compact `55px` headers, tinted workspaces, raised light surfaces, dense rows, and quiet icon actions.
- Do not introduce decorative outer cards, nested cards, prompt/explanation boxes, chart placeholders, or module-level dark exceptions inside scene designs.
- Notes scenes follow the current Obsidian Companion Gateway direction, not the superseded internal Obsidian-like file-tree/editor workspace.
- Quick Notes has two scene families: the normal light main module and the deliberately plain native text mini-window.

## TickTick Reference Decisions

- Tasks, Calendar, Habits, Completed, Trash, priority, date picker, repeat picker, and dense calendar views use TickTick as the reference where it fits LifeOS.
- Local TickTick Windows app observed: `C:\Program Files (x86)\TickTick\TickTick.exe`, product version `8.0.6.0`.
- TickTick task navigation separates smart lists, user lists, completed, and trash.
- TickTick calendar reference uses Month, Week, Day, multi-day views, compact colored blocks, time grids for short views, and dense month cells.
- TickTick priority reference: High, Medium, Low, None; different colors in list view; sorting by priority is available.
- TickTick recurring-task reference supports repeat based on due date or completion date. LifeOS should keep recurring behavior TickTick-like, while the exact storage model remains a development decision.

## Global Scenes

- Date picker and repeat picker.
- Reminder picker.
- Attachment picker.
- Confirm delete / move to trash.
- Restore from trash.
- Empty state inside a module work area.
- Error/loading state inside a module work area.
- Theme preview: light-first workspace and later dark app-wide theme.

## Home Scenes

- Primary light two-column Home reference variant.
- Today schedule with wake/sleep bounds.
- Compact overdue indicator without full overdue management.
- `Событие дня` compact strip.
- Overlapping timed items with compact stacking/hover expansion.
- Habit card on Home.
- Task card on Home.
- Reminder card on Home.
- Empty schedule window.

## Tasks Scenes

- Main task list with smart lists and user lists, no selected task, no right editor.
- Main task list with selected task and visible right editor.
- Task view switcher: List and Kanban now; Timeline later.
- Task grouping/sorting controls.
- New task quick-add row.
- Full new task form / detail panel.
- Date and repeat selector.
- Reminder selector.
- Priority selector.
- Subtask editor.
- Completed view with filters, date groups, and muted rows.
- Trash view with restore/manage behavior and clear action.
- New list creation.
- Task detail right panel.

## Habits Scenes

- Habit list for today/week.
- New habit form.
- Habit icon picker in creation and selected-habit detail.
- Habit detail panel.
- Habit completion state.
- Habit skipped state.
- Quantity progress state such as `3 из 4`.
- Retroactive completion/skipped edit.
- Habit statistics panel.

## Calendar Scenes

- Month view with compact month-name header and full-height grid.
- Week view aligned to the Month header/content treatment.
- Three-day view aligned to the Month header/content treatment.
- Day view aligned to the Month header/content treatment.
- New event form.
- Event reminder settings.
- Dense month cell overflow.
- Opening a task/event from a calendar cell.

## Notes Scenes

- Centered Obsidian Companion Gateway.
- Manual `Открыть Obsidian` action.
- Persistent auto-open checkbox below the gateway button.
- Packaged-desktop auto-open path through `obsidian://choose-vault`.
- Honest browser/Vite preview state without fake Obsidian launch links.
- Obsidian vault import from Settings > Data.
- Rebuildable search/tags/backlinks/graph indexes for data/search surfaces.
- Future or fallback internal file-tree/editor operations only if the owner re-promotes a LifeOS-native Notes surface.

## Quick Notes Scenes

- Compact quick-note list.
- Lightweight quick-note editor.
- Open selected note in mini-window.
- Native always-on-top mini-window with view-only and edit modes for
  second-monitor reference/use.
- Browser/Vite in-app approximation of mini-window with honest desktop-only limitation.

## Focus Scenes

- Task selection before focus start.
- Centered timer.
- Pomodoro mode.
- Flexible timer mode.
- Mini focus window, including topmost desktop behavior while active/visible.
- Sound selection and imported sound.
- Session pause/stop.
- Result note after session.
- Focus history/statistics.

## Projects Scenes

- New project.
- Project switcher list.
- Project list screen without right inspector.
- Selected project profile in the main workspace.
- Editable optional user-filled fields.
- `Что мешает реализации` text field.

## Diary Scenes

- Monthly diary calendar without a right details panel.
- Selected day overlay/modal.
- Day rating, mood, energy.
- `Что сделал` with completed tasks/habits plus manual text.
- Media attachments.
- Markdown export/preview direction.

## Health Scenes

- Add body zone.
- Body-zone workspace.
- Complaint note inside a body zone.
- Trigger/context fields inside a body zone.
- Doctor appointment form inside a body zone.
- Psychological health daily note/check-in is historical/deferred and should not appear in active MVP scene boards unless the module is promoted again.

## Finance Scenes

- Account list.
- New account.
- Selected-account header with editable account name and balance.
- Transaction history as the primary selected-account workspace.
- Transaction create/edit modal from the transaction-history header.
- Budget/category/filter scenes are future/deferred unless promoted.

## Trading Scenes

- Plays quick-capture list.
- Futures journal entry.
- Shitcoins journal entry.
- Separate Futures screen.
- Separate Shitcoins screen.
- Separate Rules screen.
- Real/paper journal selector inside Futures and Shitcoins.
- Top-centered equal Trading mode selector.
- Ticker input.
- Reason/result fields.
- Media/screenshot attachment.
- Rules section detach-to-mini-window scene with the MVP target native always-on-top rules mini-window.

## Settings Scenes

- Wake/sleep time settings.
- Theme settings.
- Windows autostart row.
- Module visibility controls.
- Backup/export location.
- Notification permission/diagnostics settings.
- Synchronization group with local-first unavailable cloud state.
- Data export/backup/search/integrity/restore dry-run tools.
- Obsidian import entry point for Notes.
- Language setting with English deferred.

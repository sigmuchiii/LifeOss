# Habits Module

Status: MVP deep module

## Purpose

Habits are repeating actions. The product term is `Привычка`.

A one-off action is not a habit.

## Current Decisions

- Habits can be day-only, timed, or quantity/count based.
- Habit categories are not MVP; start with one common habit list.
- Habit cards/detail behavior should follow TickTick as closely as practical.
- Habit statistics are required.
- Habit module must have a clearly visible add action, such as `+ Привычка`, not only an ambiguous module/action button.
- New habit creation follows the TickTick-like mental model: the user should not choose an exposed internal habit type dropdown in the modal. A normal new habit is `1 раз в день` by default.
- Multiple completions per day are added through a separate `Добавить повторения` control. Until the user opens that control, repetitions stay hidden and default to `1`. If the user sets repetitions above `1`, the habit is stored as a quantity/count habit with that `target_count`.
- Habit time remains a separate optional field. A habit with time and one repetition can be stored as timed; a habit with multiple repetitions can still have an optional time anchor.
- Habit time is controlled explicitly. Creation starts without a visible time input; `Добавить время` reveals it, and `Убрать время` clears it before save. The selected habit detail surface also allows adding, changing, saving, and removing time from an existing habit.
- Removing time stores `time: null`. If the habit has one repetition, it becomes a checkmark habit; if it is a quantity habit, it remains quantity and only loses the optional time anchor.
- When the user selects `Дни недели` in recurrence, the creation UI must immediately show weekday buttons so the user chooses the applicable weekdays for that habit. The UI should keep at least one weekday selected.
- Weekday order in the Habits week strip, weekday picker, and monthly registration grid is Monday through Sunday (`Пн`-`Вс`).
- The selected day badge in the Habits week strip says `Сегодня`, not `Сейчас`, and its pill must have enough horizontal padding so the label does not touch the edges.
- A habit can be deleted from the habit actions menu. Deletion is a soft delete in persisted data and removes the habit from the active list/detail view.
- User can mark habit completed or skipped retroactively.
- Retroactive changes recalculate statistics.
- Habit with a time can have reminders relative to that time.
- Habit with no time remains in Habits in MVP.
- Habits have a user-selected lucide icon from a fixed habit palette. The default icon is `CalendarCheck` stored as `calendar_check`; icon choice is independent from the user-selected color.
- The selected habit detail panel has a dedicated `Редактирование привычки` section for title, optional time, and icon edits. These edits are drafts until the user presses `Сохранить привычку`; choosing an icon in the detail panel must not immediately update the record.
- The current browser Habits reference should match the supplied TickTick-like screenshot: global rail only, compact header actions, wide weekly strip with progress rings and a selected `Сегодня` day, two dense habit rows with streak/completion text, and a right detail panel for the selected habit.

## Recurrence

MVP recurrence presets:

- every day;
- selected weekdays;
- every week;
- selected days of month;
- every month;
- every year.

## Habit Types

MVP:

- checkmark/timed;
- quantity/count.

Not MVP:

- duration;
- timer;
- checklist.

Quantity MVP uses plain count/times only.

## Completion And Streaks

- Pending, completed, and skipped states are needed.
- Skip is a manual secondary action.
- Habit becomes missed at end of day unless user skips earlier.
- Partial quantity completion records progress.
- Partial completion does not increase, decrease, or reset streak.
- Total miss resets streak.
- Habit streaks belong in Habits, not Home.

## Browser Reference Detail

- Habit rows show the user-selected habit icon/avatar, title, fire/streak line, completion percentage line, and a right completion circle.
- The selected habit row uses the user-selected habit color as a narrow semantic leading cue while staying in the shared light LifeOS shell.
- The right detail panel shows the selected habit name, four compact statistic cards, a monthly registration grid, an inline `Оставить заметку...` note field, and a monthly notes journal block.
- The right detail panel also shows a compact `Редактирование привычки` section above statistics. It contains the editable title, explicit add/remove time control, icon picker, and one save action; time and icon are not separate top-level detail cards.
- The monthly registration grid has working previous/next month arrow buttons. Pressing an arrow changes the selected date to the matching day in the adjacent month and clamps to the last available day when the target month is shorter.
- The initial selected habit reference is `Час прогулки одному`, with `Ежемесячная регистрация`, `Всего выполнено`, `Средний показатель`, and `Текущая полоса` statistics visible.
- The production `HabitsModuleScreen` must visually follow the current web reference while preserving the real habit flow: the plus action opens the working creation form, the week strip changes the selected date, habit rows change the selected habit, the row completion circle writes habit progress, and visible menu buttons either open a menu or are honestly disabled with a title.
- Habit rows should stay compact and use one completion circle on the right. Do not add extra placeholder count circles or separate row-level skip/partial buttons into the reference layout; secondary actions, including delete, belong in menus/detail surfaces.
- Habit row typography and the completion circle should follow the same dense-surface robustness rule as Tasks: no clipped Cyrillic text and the check mark centered in the fixed control.

## Home And Calendar

- Timed habits can appear on Home.
- Untimed habits stay in Habits in MVP.
- Month Calendar excludes habits.
- Day, Three-day, and Week views can show timed habits.

Home habit card shows:

- title;
- type label `Привычка`;
- time if present;
- completion control;
- count progress if relevant;
- selected habit color.

Tasks `Сегодня` can show scheduled habit rows as daily action projections, but once a habit is completed for the current date it should disappear from that Tasks Today list. The row completion mark should stay visually centered while the row is visible.

## Reminders

- Habit reminders are configured relative to habit time.
- Example: remind N minutes before habit time.
- Habit-linked reminders are supported reminder-entity sources in the Windows MVP reminder contract.
- A habit-linked reminder stores `source.kind = "habit"` with the source `habit_id` and a title snapshot, usually inherited from the habit title at creation time.
- Reminder delivery follows [Reminders](reminders.md): local-device due calculation, recurrence-aware `scheduled_for_local`, one persisted attempt per occurrence, and Settings diagnostics for permission/failure state.
- Reminder delivery does not mark the habit completed or skipped. Habit progress remains controlled by Habits/Home/Tasks Today habit actions.
- Custom reminder sounds are unsupported in the Windows MVP; Focus sound behavior does not apply to habit reminders.

## Stage 9 Implementation Contract

Stage 9 establishes the Habits foundation in the production desktop app.

Domain/storage:

- Habit domain types live in `crates/lifeos-core/src/habits.rs`.
- SQLite migration `0005_habits.sql` creates `habits` and `habit_logs`.
- `lifeos-storage` exposes `HabitRepository` for habit persistence, progress logs, and statistics recalculation.
- Typed Tauri commands expose `list_habits`, `create_habit`, `update_habit`, `set_habit_progress`, `list_habit_logs`, `get_habit_stats`, `list_habit_logs_bulk`, and `get_habit_stats_bulk`.
- PERF-002 optimization: Home, Habits, Tasks Today, and Diary/basic dashboard habit integrations must use the bulk log/stat commands instead of per-habit `Promise.all(loadedHabits.map(...))` IPC. Bulk logs use date-bounded SQL and return a map keyed by habit id; bulk stats return a map keyed by habit id and must preserve `recalculate_habit_stats` semantics.
- Frontend bridge calls live in `apps/desktop/src/dataCore.ts`.
- Structured habit writes append sync-ready `change_log` entries with module id `habits`.

Persisted habit fields:

- `title`;
- `habit_type`: `checkmark`, `timed`, or `quantity`;
- `recurrence`: every day, selected weekdays, weekly, selected days of month, monthly, yearly;
- `start_date`;
- optional `time`;
- `target_count`;
- user-selected `icon`;
- user-selected `color`;
- timestamps and soft-delete timestamp.

Progress log fields:

- one log per habit/date;
- state: `pending`, `completed`, or `skipped`;
- `progress_count`;
- timestamps.

Statistics:

- current streak;
- longest streak;
- completed count;
- skipped count;
- partial count;
- missed count.

Implemented streak behavior:

- Completed scheduled days increment streak.
- Skipped scheduled days do not increment and do not reset streak.
- Quantity partial progress, for example `3 из 4`, records progress but does not increment, decrease, or reset the streak.
- Total missed scheduled days reset the current streak.
- Retroactive completion or skip edits replace the date log and statistics recalculate from stored logs.

UI:

- `apps/desktop/src/modules/habits/HabitsModuleScreen.tsx` renders the production Habits module.
- The module has a compact `+ Привычка` creation form, recurrence controls, optional weekday picker, explicit add/remove time controls, hidden-by-default repetitions, icon picker, color swatches, habit rows, selected-day retroactive edit date, a selected-habit edit section for title/time/icon, active-habit deletion from the actions menu, and a right statistics panel.
- The production browser preview at `http://127.0.0.1:1420` must support creating and checking habits outside the Tauri runtime through local browser storage so the UX can be reviewed in the browser.
- Duration, timer, and checklist habit types are intentionally not exposed.
- The current browser Habits reference should follow the supplied TickTick-like habit screen while staying in the LifeOS light shell: no extra module-local sidebar, compact header actions, a wide weekly day strip, a focused habit list, selected habit highlighting, and a right detail panel with metric cards, monthly registration grid, and journal block.

Calendar/Home integration boundary:

- `apps/desktop/src/modules/habits/habitViews.ts` can project timed habits for schedule surfaces.
- Calendar Month still excludes habits.
- Calendar Day, Three-day, and Week schedule helpers can include timed habit projections.
- Home integration can reuse the same habit list/progress APIs and timed habit projection boundary.

## Deferred

- Links to projects/task lists.
- Links to Physical/Psychological Health.
- Habit duration that blocks schedule time.
- Habit categories.

## Open Questions

See Habits questions in [../open-questions.md](../open-questions.md).


## Behavior Notes (2026-06-25 Core Fixes)

- Monthly / EverySixMonths / Yearly habits clamp the anchor day to the last day of short months. A habit anchored on the 29th-31st now occurs on the last day of months that lack that day (e.g. Feb 28/29, Apr 30); a Feb-29 yearly anchor occurs on Feb 28 in non-leap years. `SelectedDaysOfMonth` is unaffected. (`habit_occurs_on` in `lifeos-core/src/habits.rs`.)
- `current_streak` no longer drops to 0 while today's occurrence is still pending/unlogged: the current day is treated as in-progress, not a miss. Past gaps still break the streak. (`recalculate_habit_stats`.)
- Habit `time` is normalized to zero-padded `HH:MM` on save.

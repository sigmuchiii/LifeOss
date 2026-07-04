# Calendar Module

Status: MVP deep module

## Purpose

Calendar stores events and provides dense time-based planning views without becoming the place where tasks are created.

TickTick is the main interaction reference for Month, Week, Three-day, and Day views.

## Current Decisions

- Calendar creates events only.
- Tasks are created in Tasks.
- Calendar events are not completable in the current MVP. Home must not show them as completed automatically; a planned event remains uncompleted-looking unless a future explicit Calendar event completion contract is added.
- Birthdays and holidays are Calendar events.
- User adds holidays manually in MVP.
- Calendar import is future work.
- Default Calendar view is Month.
- Time is local device time.
- Calendar events can have reminders such as one day before, one week before, or custom time.
- Calendar event repeat includes `Каждые полгода`, stored as `every_six_months`, in addition to the existing daily, weekly, monthly, and yearly options.
- Calendar views must expose a clear event creation action such as `+ Событие`.
- Production Calendar must match the accepted light web reference directly in the React/Tauri module while preserving dynamic Month, Week, Three-day, and Day views.
- Production Calendar has no persistent module-local sidebar in the accepted Month reference. Event creation starts from the compact header `+ Событие` action and opens a working form.
- Calendar event pills/blocks are clickable and open event details/editing. Task and habit projections remain projections and are not recreated as Calendar records.
- Task projections are clickable edit targets. Clicking a projected task from Calendar opens an edit modal for the original Tasks record and saves through the Tasks update boundary; Calendar still does not create tasks or duplicate them as Calendar records.
- Calendar day cells and schedule/day-review surfaces should also show tasks that were marked completed on that viewed date, based on `completed_at_ms`. This includes Inbox tasks, overdue tasks, and tasks from user lists that were completed today even if their planned due date was earlier or absent.
- Completed-on-day task entries in Calendar are projections of the source Task record. Calendar must not duplicate them as Calendar events and must not change their source list.
- Header controls are functional: Month/Week/Three-day/Day switch views, Today resets the visible date, previous/next changes the visible period, and overflow opens a menu. Calendar search is not shown until a real searchable Calendar surface exists.
- Agenda is deferred from the current MVP. The active Calendar surface is Month, Week, Three-day, and Day only unless the owner explicitly promotes Agenda later.

## Event Fields

MVP fields:

- title;
- date;
- recurrence/repeat;
- description;
- optional reminder;
- default color.

Not MVP:

- event-specific colors;
- event attachments;
- special birthday/contact/age fields.

Birthday/holiday meaning is expressed by event title and date. No separate birthday model is needed in MVP.

## Reminders

- Calendar-event-linked reminders are supported reminder-entity sources in the Windows MVP reminder contract.
- A Calendar-event-linked reminder stores `source.kind = "calendar_event"` with the source `event_id` and a title snapshot, usually inherited from the event title at creation time.
- The event form can keep its event-local reminder field for event editing, but actual reminder notification delivery follows [Reminders](reminders.md): local-device due calculation, recurrence-aware `scheduled_for_local`, one persisted attempt per occurrence, and Settings diagnostics for permission/failure state.
- Reminder notification delivery does not create a separate Calendar event and does not make Calendar events completable.
- Notification click routing back to the Calendar event is explicitly unsupported in the Windows MVP.

## Month View

- The Month screen title is the current month name, for example `Сентябрь`, not `Календарь: месяц`.
- In the production reference match, the Month title is month-only without the year unless a later explicit date-range rule changes it.
- Month weeks start on Monday.
- Do not show explanatory subtitle/helper copy in the Month screen header.
- Month navigation, view switch, today, and event creation controls live in the compact top header.
- The browser Month header follows the supplied TickTick-like screenshot: `+ Событие`, `Месяц`, `Сегодня`, previous/next controls, and overflow actions in one compact header row. Calendar search is removed until a real searchable Calendar surface exists.
- The month grid itself fills all remaining workspace height below the header.
- Month rows must stay contained inside the Calendar module viewport. Dense lower rows must not slide underneath the next screen/module on the web design board; overflow belongs inside day cells.
- Dense TickTick-like grid.
- Show maximum useful information per cell.
- The browser reference uses separate light day cells with compact colored record bars, small source icons, clipped titles, and right-aligned time text where present.
- Timed tasks first with time and title.
- Calendar events appear at the date level after timed tasks.
- Untimed tasks appear below Calendar events.
- Standalone reminders and linked reminders do not appear in Month view.
- Date-only tasks should be visible in Calendar.
- Tasks completed on that date should be visible in Calendar by local date/time from `completed_at_ms`, even when their `due_date` is absent, overdue/earlier, or the task belongs to Inbox or a user list.
- Completed task entries use a muted completed treatment and sit after active timed tasks, Calendar events, and active untimed tasks.
- Habits do not appear in Month.
- If many records exist, day cell should scroll internally.

## Week / Three-Day / Day Views

- Full schedule grid.
- Colored time blocks.
- Checkbox where relevant.
- Title and time range visible.
- Timed habits can appear.
- Completed-on-day tasks appear at the local completion time from `completed_at_ms`, use a muted completed treatment, and remain clickable source Task projections.
- Focus sessions do not appear because they are not planned Calendar records in MVP.
- Week, Three-day, and Day design should follow the provided TickTick screenshots: left time scale, columns by day, block height based on time range, compact title/time, and checkbox where relevant.
- Week, Three-day, and Day screens use the same compact header and full-height content treatment as Month.
- Week view starts on Monday and covers Monday through Sunday for the visible week.
- The browser reference now applies the accepted Calendar Month light shell to Week, Three-day, and Day as well: pale full-height schedule grid, compact header actions, and colored schedule blocks inside the same LifeOS rail/header geometry.
- Week, Three-day, and Day browser grids use the configured day bounds from Home/Settings. The current reference day starts at `07:00` and ends at `22:30`, and colored blocks must span by their actual start/end time instead of fixed visual heights.
- Week, Three-day, and Day time labels live only in the fixed left time rail. Day columns must not render stray time labels inside the event grid.
- Time rows must be evenly spaced from wake time to sleep time; half-hour and hour lines must not create irregular visual gaps.
- Time labels use the same percentage-based time scale as the schedule grid, but labels are centered inside visible hour bands instead of sitting directly on horizontal grid lines. Configured wake/sleep boundaries remain grid boundaries, not clipped edge labels.
- The fixed left time rail stays visually clean: it contains the time labels and rail boundary only, while horizontal schedule lines are drawn in the day columns.
- The browser reference draws schedule grid lines as explicit positioned lines, not repeated CSS background tiles, so labels, day columns, and event blocks stay aligned.
- Production Week, Three-day, and Day must share the same light Calendar header, full-height grid, explicit positioned schedule lines, left time rail, and duration-based event blocks as the web reference.

## 2026-05-11 Production Reference Match

- `CalendarModuleScreen` should not be replaced by static board markup. It keeps persisted Calendar events, projected tasks, and timed habit projections.
- `+ Событие` opens a working create-event modal/form.
- Clicking a Calendar event in Month, Week, Three-day, or Day opens details/editing and can save updates through the Calendar event update boundary.
- The event edit modal includes a `Удалить` action. Pressing it must first show the confirmation text `Вы точно хотите удалить это событие?`; confirming soft-deletes the Calendar event so it disappears from Month, Week, Three-day, and Day views.
- Month uses separate raised light day cells, compact colored record pills with icons, clipped titles, and right-aligned time text.
- Week, Three-day, and Day use the same visual system rather than a list fallback.

## 2026-05-12 Browser Annotation Fixes

- The browser preview at `http://127.0.0.1:1420/#/calendar` must support creating and editing Calendar events without the Tauri runtime by using the same local browser-storage fallback pattern as other browser-reviewable modules.
- Week, Three-day, and Day schedule views must keep time labels, explicit grid lines, day columns, and event blocks on one shared percentage-based time scale. Do not use fixed CSS row templates for time labels that can drift away from the schedule grid.
- Calendar event chips and schedule blocks use a flat treatment without raised drop shadows.
- Week, Three-day, and Day share one neutral left time rail rather than a blue highlighted time column.
- Week, Three-day, and Day time labels are centered inside hour bands and the bottom sleep boundary is not rendered as a clipped time label.
- Remove the disabled Calendar search button from the top-right toolbar until real Calendar search is implemented.
- Recurring Calendar events must project into future Month, Week, Three-day, and Day views. A yearly event dated `2026-04-28` appears again on `2027-04-28`.
- A half-year recurring Calendar event repeats every six calendar months from the original event date on the same day of month. For example, an event dated `2026-01-15` appears on `2026-07-15`, `2027-01-15`, and later six-month occurrences.

## Home Relationship

If today's Calendar event has a concrete time, it also appears inside the Home timeline at that time. Date-level Calendar events remain a compact Home signal rather than a large card.

Home shows today's date-level events in a subtle top-right `События` area. Empty days show `События: На сегодняшний день событий нет.`.

## Stage 8 Implementation Contract

- Shared local date/time, recurrence, Calendar event, and Reminder domain types live in `crates/lifeos-core/src/schedule.rs`.
- SQLite migration `0004_calendar_reminders.sql` creates `calendar_events` and `reminders`.
- `lifeos-storage` exposes `CalendarRepository` for event persistence and `ReminderRepository` for reminder persistence/due notification lookup.
- Typed desktop commands expose `list_calendar_events`, `create_calendar_event`, `update_calendar_event`, `list_reminders`, `create_standalone_reminder`, and `list_due_reminder_notifications`.
- Frontend bridge calls live in `apps/desktop/src/dataCore.ts`.
- The React Calendar module now opens in Month view and has Month, Day, Three-day, and Week view modes.
- Month cells are built by `apps/desktop/src/modules/calendar/calendarViews.ts` and order entries as timed tasks first, Calendar events second, untimed tasks third, and completed-on-day task projections in a muted completed treatment.
- Month view excludes habits and standalone/linked reminders. Day, Three-day, and Week schedule helpers can include timed habits later when the Habits source exists.
- Tasks with date/time are read from the Tasks source and projected into Calendar; Calendar does not create tasks.
- Projected task clicks in Month, Week, Three-day, and Day open a Calendar task-edit form for the source task fields needed in Calendar context: title, due date, due time, priority, and description. Saving calls the same frontend `updateTask` boundary used by Tasks.

## Open Questions

See Calendar questions in [../open-questions.md](../open-questions.md).


## Behavior Notes (2026-06-25 Core Fixes)

- Calendar event `start_time` / `end_time` are normalized to zero-padded `HH:MM` on save (e.g. `9:5` -> `09:05`), keeping stored times consistent and correctly ordered. (`CalendarEvent` normalize/build in `lifeos-core/src/schedule.rs`.)
- Recurring events (Monthly / EverySixMonths / Yearly) share the same last-day-of-month clamp as reminders/habits.

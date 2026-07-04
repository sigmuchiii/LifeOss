# Home Module

Status: MVP deep module

## Purpose

Home is the day-start surface. It shows today's plan in one place so the user can understand the day without jumping between tasks, habits, calendar, and reminders.

## Current Decisions

- Home is a read-only schedule aggregator.
- Home shows only today.
- Home has no day switcher in MVP.
- User cannot move or reschedule items from Home.
- Rescheduling belongs to the source module.
- Wake and sleep time define visible schedule boundaries.
- Wake time is the start of the Home day and sleep time is the end of the Home day. Example: if wake is `07:00` and sleep is `22:30`, the Home schedule range is `07:00-22:30`; wake is always at the beginning of the vertical timeline and sleep is always at the end.
- Default Home day boundaries are `07:00` wake and `22:30` sleep until the user explicitly changes them.
- Source records, including habits or events named `Подъем` or `Сон`, do not change Home day boundaries. Only explicit edits in Settings or the Home day-boundary control change the persisted wake/sleep settings.
- Home must expose a clear day-time settings control for wake time and sleep time.
- Tasks outside wake/sleep boundaries stay in Tasks and do not render on Home.
- Tasks without time do not need a Home block in MVP.
- Free windows remain visible as empty timeline space.
- Home does not recommend how to fill free windows in MVP.
- Home can mark tasks and habits complete.
- Habit streaks do not appear on Home.
- Home should not include evening review, Quick Add, bottom summary cards, untimed task block, or extra dashboard panels in MVP.
- Unfinished tasks become overdue instead of being silently rescheduled.
- If several source items land at the same time or visually collide in the timeline, Home should stack the real cards with small diagonal offsets instead of splitting them into narrow side-by-side columns. A hovered/focused item rises above overlapping items so the user can inspect and use it.
- Home has a compact top-right Calendar event summary. If there are no date-level Calendar events today, it shows `События: На сегодняшний день событий нет.`. If events exist, it shows those events.
- The current web Home reference should not use decorative stacked duplicate cards for overlap treatment; stacking applies only to real source cards.
- Full overdue management belongs in Tasks.
- Home must not show a top dashboard row with overdue/event/free-window cards. These indicators should not occupy the top of the schedule in the current design pass.
- Home UI copy must be user-facing. Do not show implementation notes such as overlap/hover explanations, MVP labels, or references to where internal logic is managed.
- The current browser design uses the provided light reference variant as the primary Home module screen.
- The web Home reference should appear as the product screen itself in the first viewport, without the design-board header or section label above it, and should match the supplied 2026-05-08 light screenshot geometry as closely as practical.
- The current web Home reference uses `07:00-14:45` for the first timeline window and `14:45-22:30` for the second window because `14:45` is the midpoint between wake `07:00` and sleep `22:30`.
- The browser design board does not keep a separate `Главная: старый вариант` scene.

## Home Sources

Home aggregates:

- timed tasks for today;
- timed habits whose recurrence includes today;
- standalone reminders;
- today's timed Calendar events in the timeline.

Focus sessions do not appear on Home in MVP.

Linked reminders do not create separate Home cards. A reminder attached to a task, habit, or Calendar event remains a notification setting for that source record. Only standalone reminders render as their own yellow schedule cards.

## Layout

- Follow Life OS 2-style `Расписание дня`.
- Vertical time strip with current time marker.
- Timeline bounded by wake/sleep time.
- The wake boundary/card must be visible by default at the start of the first wake-to-sleep window, matching the sleep boundary/card treatment.
- The sleep boundary/card must remain visible on the vertical schedule; it must not be clipped or drift outside the visible timeline.
- Two visible time windows are acceptable in the design reference, and their labels should cover the full wake-to-sleep range.
- When wake/sleep times are known, split the two Home timeline windows at the midpoint of the wake-to-sleep range. Example: `07:00-22:30` splits into `07:00-14:45` and `14:45-22:30`.
- No top dashboard cards above the schedule in the current design.
- If a Calendar event has a concrete time, it also appears in the Home timeline at that time.
- Most days may have no Calendar events; the event area should stay subtle or empty rather than dominating the schedule.
- The current-time marker should include a pulsing dot that moves down the vertical time strip according to the current time.
- The current-time marker dot must sit exactly on the vertical timeline line.
- Time labels are vertically centered against their matching cards.
- Time labels render only for actual timeline source cards. The wake/split/sleep boundaries are expressed by the range labels and vertical lines; do not show a standalone `07:00`, `14:45`, or `22:30` time label when there is no item at that time.
- Wake is the first visible boundary/card of the day and belongs at the top of the first wake-to-sleep window. Sleep is the final visible boundary/card of the day and belongs at the bottom of the second wake-to-sleep window, not in the middle of the day layout.
- The wake and sleep boundary cards use the same empty round right-side mark as an incomplete normal task card, not a green checked square.
- If a source schedule card overlaps the wake or sleep boundary card, hovering or keyboard-focusing the visible part of the boundary card must raise `Подъем` or `Сон` above the overlapping source cards.
- Home schedule cards should be a little narrower than the full available column width, leaving visible right-side breathing room.
- Overlapping Home schedule cards keep the same primary width and are offset as a compact stack. Do not shrink overlapped cards into side-by-side columns.
- The vertical timeline rails start at their labeled time windows and must not overlap the range labels; they include a short lower tail below the window end for visual continuity.
- The browser Home reference should not show a decorative lower-right spark mark.
- The primary Home visual treatment uses two vertical timeline columns, light raised schedule cards, colored leading icons, narrow semantic leading rails, completion circles, and a current-time marker with a horizontal guide line across the active time window.
- In the production app header, the Home day settings control is a compact gear icon matching the web reference. It opens a working day-boundary modal/popover with editable wake/sleep fields and a save action only; it must not show a secondary `Открыть настройки` button. The header itself should not show separate wake/sleep chips.

## Cards

Task, habit, reminder, and event cards must be visually distinguishable.

Habit card shows:

- title;
- type label `Привычка`;
- time if present;
- completion control;
- count progress if relevant;
- selected habit color.

Reminder card:

- separate yellow schedule card;
- title;
- time.

Calendar event treatment:

- timed events appear in the main timeline;
- date-level event display is a compact top-right `События` summary, not a large top card;
- event title/date meaning should be clear without a special event type label.

## Open Questions

See Home/Calendar/Tasks questions in [../open-questions.md](../open-questions.md).

## Stage 10 Implementation Contract

- The production Home screen lives in `apps/desktop/src/modules/home/HomeModuleScreen.tsx`.
- The Home aggregation/view model lives in `apps/desktop/src/modules/home/homeViews.ts`.
- Home reads source records through the existing frontend data bridge: settings, tasks, habits/logs, Calendar events, and reminders.
- Home does not persist its own schedule records. It projects source records for today into the wake/sleep timeline.
- Home filters out untimed tasks, untimed habits, linked reminders, deleted records, and records outside the wake/sleep bounds.
- Home keeps scheduled task and habit cards visible after completion during the current view refresh and marks them completed from the source state.
- Completing a task from Home calls the Tasks completion command. Completing a habit from Home calls the Habits progress command for today.
- Calendar events and standalone reminders have no completion action on Home. They may keep the visual right-side circle used by the reference card style, but it must not be an interactive completion button and must not show a check mark or completed state unless a future explicit source completion contract is added.
- If a source item named `Сон` is present at the sleep time, Home renders that source card at the bottom of the second timeline column and does not add a duplicate synthetic sleep-boundary card over it.
- Overlapping Home cards receive compact visual lanes while their original source times remain unchanged.

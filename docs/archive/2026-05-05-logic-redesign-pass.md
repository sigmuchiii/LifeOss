# LifeOS v3 Logic Redesign Pass

Date: 2026-05-05
Status: executed on the local HTML design preview

## Goal

Bring the current design board closer to the product logic already answered in the interview, even though some specification questions remain open.

The design should stop showing old assumptions as if they were confirmed functionality.

## Plan

1. Align Home with the confirmed day-first loop.
   - Home is a read-only schedule aggregator.
   - Home shows only today.
   - Home pulls in today's timed tasks, timed habits, relevant Calendar events, reminders, diary item, and sleep.
   - Home does not show Focus sessions, because Focus is not planned in the MVP.

2. Align Tasks with the TickTick-like MVP model.
   - Title is required.
   - Description, date, time, priority, list, project, recurrence, reminder, and subtasks are optional.
   - Tags, status, and approximate duration are deferred.
   - Completed and Trash remain separated like TickTick system areas.
   - Add an isolated `Новая задача` interface slide.

3. Align Habits with the confirmed habit logic.
   - Rename routine concept to `Привычка`.
   - Use count/times for quantity habits.
   - Partial completion records progress but keeps the previous streak unchanged.
   - No MVP habit links to physical or psychological health.
   - Add a clearer Habit icon.

4. Align Calendar with the confirmed event logic.
   - Calendar creates only events.
   - Birthdays and holidays are Calendar events with optional reminders.
   - Calendar opens to Month by default.
   - Month does not show habits.
   - Week/day can show timed habits as preview where they fit.
   - Add an isolated date/repeat picker slide.

5. Align Reminders as a separate entity.
   - MVP reminder fields: time, repeat, linked source entity.
   - Reminder links to task, habit, or Calendar event.
   - Delivery is Windows system notification.
   - Snooze, Telegram, and phone delivery are future work.
   - Add an isolated reminder interface slide.

6. Align Focus with the latest MVP decision.
   - Centered flexible timer and Pomodoro.
   - Starts from a selected task.
   - Opens as a mini-window after start.
   - Supports built-in and user-imported sounds.
   - Does not appear on Home or Calendar.
   - Does nothing automatically when the timer ends.
   - App/code context tracking remains open/future.

7. Align Notes with the Obsidian-like target.
   - Local Markdown `.md` files are the source.
   - Use file tree, tabs, editor, preview, backlinks, and graph.
   - Avoid duplicated file-tree logic inside the editor workspace.

8. Add icon and theme reference.
   - Add entity/action icons for habits, events, reminders, Markdown files, new lists, reminder time, focus sound, and sound import.
- Start with the light-first theme baseline; keep dark mode as a later selectable app-wide theme.

## Executed

Updated local preview:

`C:\Users\Nomoregooners\projects\LifeOs v3\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v3-opencode-variant-v1.html`

Updated documentation:

- `docs/lifeos-v3/spec-draft.md`
- `docs/lifeos-v3/lifeos-v3-design.md`
- `docs/lifeos-v3/icon-system.md`

## Remaining Design Follow-up

- Visually review the new isolated action slides in the browser.
- Refresh the Figma capture after the owner reviews the local preview.
- Decide whether the Home schedule should show Calendar events as full cards or smaller event chips.
- Decide exact visibility rules for tasks/events/reminders across Month, Week, Day, and Home.
- Decide the final body-zone MVP list for Physical Health.
- Decide exact Obsidian MVP feature cut for Notes.

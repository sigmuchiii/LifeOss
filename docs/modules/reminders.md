# Reminders Entity

Status: MVP entity, full module future

## Purpose

Reminder is a notification fact, not completable work.

## Current Decisions

- Standalone reminders are MVP.
- Full Reminders module / notification center is future work.
- The future standalone `Напоминания` module is the management surface for all reminders across LifeOS: it can create independent reminders, edit them, and delete/edit any reminder, including reminders linked to another source record.
- Current implementation already has standalone reminder storage, creation/list APIs, due-notification calculation, delivery attempts/statuses, Home display, and browser fallback. The unresolved product question is the visible create/edit UI for independent reminders before the full `Напоминания` module exists.
- Reminder can attach to task, habit, or Calendar event.
- Linked reminders are still created from the source record where the user sets the reminder, such as a Task, Habit, or Calendar event.
- Reminder can also exist standalone.
- Reminder is one-time by default.
- Reminder repeats only if user configures recurrence.
- No snooze in MVP.
- No user-facing reminder history / notification center in MVP. Delivery attempts are stored only as diagnostic/status records for duplicate suppression and Settings failure visibility.
- Reminder is not completable.

## Fields

MVP fields:

- title;
- time;
- optional recurrence/repeat;
- optional linked source entity.

Supported recurrence presets follow the same broad set as habits/tasks/events:

- every day;
- selected weekdays;
- every week;
- selected days of month;
- every month;
- every six months;
- every year.

Linked task reminder can inherit task title.

Standalone reminder has its own title.

No extra reminder text/description field is needed in MVP.

## Delivery

- MVP delivery channel: `windows_system`.
- Telegram and phone delivery are future work.
- No privacy masking for notification text in MVP.

## Windows MVP Delivery Contract

Status: closed for the private Windows dogfood MVP as of FIX-05 on 2026-05-14.

Scope:

- Supported source records: standalone reminders, task-linked reminders, habit-linked reminders, and Calendar-event-linked reminders.
- The reminder title is a snapshot used for notification text. Linked reminders may inherit the source title when created, but delivery does not require rereading the source record at dispatch time.
- Local device date/time is the scheduling clock for the Windows MVP.
- Channel is `windows_system` only. Mobile push, Telegram, and cross-device delivery arbitration are future work.

When due:

- A one-time reminder is due when `due_date` is before the local clock date, or when `due_date` equals the local clock date and `due_time <= local_time`.
- A recurring reminder is due for the latest occurrence at or before the local clock. The persisted notification occurrence key is `scheduled_for_local = occurrence_date + "T" + due_time`.
- Recurrence options use the shared reminder/habit/event preset set: every day, selected weekdays, weekly, selected days of month, monthly, every six months, yearly.
- A one-time reminder remains due until LifeOS records one delivery attempt for its scheduled occurrence.

Duplicate suppression and persistence:

- Duplicate suppression is based on `(reminder_id, scheduled_for_local, channel)`.
- SQLite table `reminder_delivery_attempts` stores the first/latest delivery status for that key and suppresses another dispatch for the same occurrence across app restarts.
- Runtime also keeps an in-process guard and reads the legacy delivered-notification key as a compatibility guard, but SQLite delivery attempts are the durable source.
- Any persisted attempt status suppresses another dispatch for the same occurrence: `delivered`, `failed`, `permission_denied`, or `unsupported`.
- Recurring reminders can still notify again when the next recurrence produces a different `scheduled_for_local`.

Permission and failure behavior:

- If notification permission is denied or not granted, LifeOS records a `permission_denied` attempt with an error message, does not crash the app shell, and does not keep retrying that same occurrence.
- If dispatch throws or the notification API is missing, LifeOS records `failed` or `unsupported`.
- Settings > Notifications shows current permission status, latest attempt status, and latest error message.

Click and sound behavior:

- Notification click actions are explicitly unsupported in the Windows MVP. Clicking a notification does not deep-link to the source record.
- Custom reminder sounds are explicitly unsupported in the Windows MVP. LifeOS does not select or play a reminder sound; any sound is the OS/WebView default behavior outside the app contract.
- Focus sounds are a separate Focus feature and do not define reminder sound behavior.

Dispatch boundary:

- The durable delivery status path goes through the Tauri/Rust storage boundary.
- Actual visible toast dispatch currently uses the WebView/Browser Notification fallback. This is allowed only for private dogfood and must not be described as a public-production Windows toast implementation.
- A native Windows toast implementation remains future production hardening, not part of the closed FIX-05 private dogfood MVP contract.

## Home

Standalone reminders appear on Home as separate yellow schedule cards.

Linked reminders do not render as separate Home cards. A reminder attached to a task, habit, or Calendar event remains a notification setting for that source record.

## Calendar

Standalone reminders and linked reminders do not appear in Calendar Month. Standalone and cross-source reminder management belongs to the future notification center / Reminders module.

## Stage 8 Implementation Contract

- Reminder records are persisted in SQLite table `reminders` from migration `0004_calendar_reminders.sql`.
- Reminder domain types live in `crates/lifeos-core/src/schedule.rs`.
- A reminder has title, due date, due time, optional recurrence, and a source.
- Reminder source is explicit: standalone, task, habit, or Calendar event. This keeps standalone reminders and linked reminders separate without turning reminders into completable tasks.
- `ReminderRepository::due_notifications` and desktop command `list_due_reminder_notifications` produce due notification payloads with channel `windows_system`, recurrence-aware `scheduled_for_local`, and persisted delivery-attempt suppression. The backend due path keeps the current frontend polling loop but reads only date/time-bounded SQL candidates from `reminders` before recurrence calculation, rather than scanning the full reminder table.
- `ReminderRepository::record_delivery_attempt`, desktop command `record_reminder_delivery_attempt`, and frontend `recordReminderDeliveryAttempt` persist delivery status in SQLite/browser fallback.
- The desktop frontend starts a global reminder polling runtime from `App` that requests due payloads, dispatches private-dogfood WebView notifications, records delivery status, and deduplicates attempted reminders.
- Browser/Vite fallback now supports standalone reminder create/list and due-notification listing through localStorage, mirroring other module fallbacks where Tauri is unavailable.
- Browser/Vite fallback also stores reminder delivery attempts in localStorage for preview parity. Packaged desktop persistence uses SQLite.
- The app still needs an explicit product decision for where the user creates and edits standalone reminders in the visible UI: a minimal Home/Settings flow, the future `Напоминания` module, or an earlier promotion of that module.
- Full native toast/plugin behavior, notification click routing, custom sounds, snooze, notification history, and richer channel settings remain future work.

## Open Questions

See Reminders questions in [../open-questions.md](../open-questions.md).


## Behavior Notes (2026-06-25 Core Fixes)

- Monthly / EverySixMonths / Yearly reminders clamp the anchor day to the last day of short months: a reminder due on the 29th-31st now fires on the last day of months without that day (e.g. the 31st fires on Feb 28/29, Apr 30) instead of silently never firing. (`recurrence_occurs_on` in `lifeos-core/src/schedule.rs`.)
- `due_time` is normalized to zero-padded `HH:MM` on save. This also fixes `due_reminder_notifications` ordering, which sorts on `scheduled_for_local` lexicographically (previously `9:05` sorted after `10:00`).

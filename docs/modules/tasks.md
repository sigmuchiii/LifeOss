# Tasks Module

Status: MVP deep module

## Purpose

Tasks are the main actionable unit of LifeOS v4.

TickTick is the primary reference for task density, smart lists, quick add, grouping, completed tasks, trash, and right detail panel behavior.

## Current Decisions

- Required field: title.
- Optional fields: description, date, time, priority, list, reminders, subtasks, recurrence, status.
- Initial task statuses are `Не начато`, `В процессе`, and `Ожидает`. Status is separate from completion: a completed task is still controlled by the completion action and `completed_at_ms`.
- When a task status is `Ожидает`, the task can store a short `waiting_for` reason describing what exactly it waits for.
- Not MVP: tags, approximate duration.
- Inbox is the active unassigned-tasks smart list: it shows active tasks with no user list. Assigning a task to a user list removes it from Inbox and makes it appear in that user list. Dated tasks without a user list still appear there and group by date when date grouping is active.
- Task can have date without time.
- Task with time can appear on Home and Calendar.
- Task without time does not need a Home block in MVP.
- Task can be completed.
- The Tasks `Сегодня` smart list includes today's active task records and habits scheduled for today, but habit rows disappear from `Сегодня` after the habit is completed for that day.
- When the owner enters the Tasks module, the app should restore the last selected Tasks target, including smart lists, user lists, Completed, or Trash, instead of always opening `Сегодня`.
- Calendar does not create tasks; tasks are created in Tasks.
- Date picker should use TickTick as the interaction reference.
- Priority is MVP and should influence tasks in a TickTick-like way as closely as practical.
- Task, reminder, and Calendar event are separate concepts: task is completable work; reminder is notification; event is Calendar record.

## Views, Grouping, And Sorting

Tasks should expose TickTick-like view switching:

Current task list screen requirements:

- The main screen title is the selected list name.
- The screen does not show a secondary subtitle such as `Список задач` under the selected list name.
- No selected task state: the right editor panel is hidden and the task list uses the full remaining workspace width.
- Selected/editing state: the selected row is highlighted, the right editor panel is visible, and the source-list footer/action icons appear.
- In both no-selection and selected/editing states, the visible task list area spans the full width of its workspace section instead of sitting inside a narrower padded column.

- List view is MVP.
- Kanban view is MVP if it can be implemented without turning Projects into a board.
- Timeline view is deferred.
- Timeline must not appear as an active visible header control until it is actually implemented.
- The List/Kanban view switch should be compact and TickTick-like: view selection lives behind small controls rather than large module-level buttons.
- A small sort/control button belongs near the task list header.
- A small three-dot action button opens list actions.
- The main title of a task screen is the selected list name, not the generic module name `Задачи`.
- Visible `Список` and `Канбан` header buttons should be removed from the main screen. View switching belongs behind compact controls/actions.
- Do not duplicate grouping/sorting/view state in a second toolbar if the same controls already exist near the list header.
- Task rows should be compact and close to TickTick density.
- Task rows must not show the task description under the title; the description is edited and read in the selected-task detail panel.
- Layout hardening for long text and Cyrillic glyphs must preserve the accepted Tasks design concept; it is not a redesign pass.
- Task rows and the selected-task editor must keep long task names and descriptions contained. Text should wrap or scroll inside the intended area rather than sliding under the next section, overlapping controls, or being clipped.
- Cyrillic glyphs must not be clipped in task rows, editor titles, buttons, metadata, or other dense text surfaces. The reported clipping affects letters such as `у`, `в`, `з`, and `б`; the fix should check similar descenders/ascenders across the Tasks screen and shared row styles.
- In the selected list view, the rounded `Добавить задачу` row sits directly under the list title such as `Сегодня`, followed by the `Просрочено` group when overdue tasks exist.
- The current browser Tasks reference should match the supplied light screenshot: narrow global rail, compact smart-list sidebar, `Сегодня` header, one rounded quick-add row, group labels outside raised task cards, dense checkbox rows, red right-side overdue dates, gray right-side time text/icons, and small inline tag chips where needed.
- The quick-add plus and sidebar new-list plus should be visually quiet, not primary-action blue controls.
- When the quick-add row is active for adding a task, the focus outline belongs around the entire add field, not only around the text input or icon.
- In quick-add, the empty row can show a quiet leading `+` submit icon, but once the user starts typing, the task title starts from the beginning of the row instead of being offset by the icon.
- Pressing Enter while focused in the quick-add text input creates the task immediately.
- The calendar icon at the right edge of quick-add opens a date/time picker and preset menu for that quick task. It must not open the full new-task modal.
- The quick-add row and grouped task row containers should not use raised drop shadows in the active Tasks reference.
- Clicking a task row anywhere in the title, whitespace, or date/time metadata opens that task in the right editor panel. The completion checkbox remains a separate action and should not trigger row selection.
- Switching between task rows in any Tasks list must refresh the right editor to the clicked task's title, description, subtasks, source list, and controls; the editor must not keep stale uncontrolled field values from the previously selected task.
- In the selected-task editor, the source-list/footer action row stays pinned to the bottom of the right editor panel.
- In the browser reference, the selected-task editor footer must be flush to the bottom edge of the right panel; it must not float above the bottom of the editor window.
- The selected-task editor body scrolls inside the right panel when content is taller than the panel, while the task title remains pinned at the top of the editor body and the footer remains pinned at the bottom.
- The vertical divider between the task list and selected-task editor should be draggable so the user can resize the right editor panel. The width should stay bounded and persist locally for the browser/desktop session.
- Priority should not render as separate right-side `P1`/`P2`/`P3` badges in task rows. If priority is visible in the list, it belongs in the completion square/check area.
- Production `TasksModuleScreen` must match the supplied web reference screenshots while preserving real task/list data logic. The Today view includes the `Просрочено` group above `Сегодня`, today's scheduled habits inside the `Сегодня` group, dense shared group rows, overdue due dates in red, timed task/habit metadata in neutral gray, and the selected-task right panel uses action-backed top/footer controls with the footer pinned to the panel bottom.
- Production Tasks must not leave decorative empty controls. Quick-add plus submits the quick-add task, quick-add Enter submits the same flow, quick-add calendar opens a date picker for the quick task, list plus opens list creation, filter/sort/menu controls open compact menus, and right-panel date/reminder/priority/list/delete controls either update the task or open an honest minimal popover.

Grouping options should follow TickTick where practical:

- manual/custom grouping;
- by date;
- by label/tag if labels are promoted into MVP;
- by priority;
- no grouping.

Sorting options should follow TickTick where practical:

- manual/custom order;
- by date;
- by title;
- by label/tag if labels are promoted into MVP;
- by priority.

Grouping and sorting must be presented as compact menu buttons/dropdowns. The task list should not show a large always-open technical grouping/sorting panel.

Tags/labels remain deferred. Until tags are promoted, label-based grouping and sorting stay hidden from the active UI.

## Recurring Tasks

- Recurring tasks are MVP.
- Behavior should be TickTick-like: completing current occurrence creates/shows the next scheduled occurrence.
- Stage 7 implementation stores recurring tasks as separate persisted task records per occurrence. Completing the current occurrence sets `completed_at_ms` on that task and inserts the next occurrence as a new task record with a new `RecordId`.
- The first recurrence cadences are daily, weekly, monthly, and yearly. They advance from the task due date using local device date rules.
- The next occurrence copies title, description, user list, due time, priority, recurrence rule, and reminder offsets. Its status resets to `Не начато`; subtasks are copied with new ids and reset to incomplete.
- Repeat-by-completion-date remains a later refinement; Stage 7 recurrence advances by due date.

## Subtasks

- Subtasks should behave as child tasks, not only plain checklist lines.
- MVP child subtask fields: title and completion status only.
- Advanced child subtask fields such as date, reminder, priority, and project are not MVP unless later promoted.

## Reminders

- Task-linked reminders are supported reminder-entity sources in the Windows MVP reminder contract.
- A task-linked reminder stores `source.kind = "task"` with the source `task_id` and a title snapshot, usually inherited from the task title at creation time.
- The reminder delivery clock, recurrence calculation, duplicate suppression, permission/failure behavior, persisted status, click behavior, and sound behavior follow [Reminders](reminders.md).
- Reminder delivery does not complete, edit, or reschedule the task. Tasks remain the only completable work item.
- If a task-linked reminder has one persisted delivery attempt for `(reminder_id, scheduled_for_local, windows_system)`, LifeOS suppresses another dispatch for that same occurrence even when the attempt failed or permission was denied.
- The current Tasks UI can store task reminder offsets on task records. Promotion of every task reminder offset into a first-class linked reminder record is implementation work inside the reminder boundary, not a separate Calendar event.

## Detail Panel

Right panel should visually follow TickTick's selected-task editor:

- a minimal top control row with completion checkbox, date/reminder entry, priority/action controls;
- large editable title;
- open editor body for description/subtasks/attachments;
- bottom row showing the source list and small editor/action icons;
- footer row pinned to the panel bottom, not positioned as a floating toolbar;
- no property-table layout as the primary task detail UI.

Right panel should functionally allow:

- edit task title;
- write description;
- manage date/time;
- set priority;
- add reminders;
- manage subtasks;
- manage recurrence.

The right panel is also where task description and subtasks are edited in a TickTick-like flow.

## System Areas

- Completed tasks follow TickTick's mental model: a dedicated completed screen with filters, completion-date groups, group counts, and muted completed rows.
- Completed rows should stay visually muted: the checked completion square is neutral rather than bright success-green, and old due dates/times do not render as active overdue warnings.
- Completed tasks can still be projected into Calendar Month and schedule surfaces by `completed_at_ms`; this opens the source Task record and does not move or copy it into Calendar.
- Trash follows TickTick's mental model: deleted tasks move to Trash and can be managed there. The Trash screen includes a top-right clear action for emptying Trash.
- Completed and Trash are system views, not ordinary user lists.
- Smart-list behavior should be TickTick-like: Today, Inbox, Next 7 Days, Overdue, Completed, and Trash are the reference areas.
- Inbox counts and displays active non-deleted, non-completed tasks that do not belong to a user list. Tasks assigned to a user list are counted and displayed in that user list instead.
- Today counts and displays active tasks due today/overdue plus scheduled habits for the current date. Habit rows in Tasks remain habit records and write habit progress, not task records. Completed habit rows should be removed from the Today list after completion.
- Task lists need date/day grouping and sorting/order controls in a TickTick-like way.
- Tasks without a date stay in creation/addition order inside the `Без даты` group instead of being alphabetized by title.
- Task priority should use TickTick as the behavior reference for visual treatment, ordering influence, and priority handling.
- Date-only tasks for today should be visible in the task flow and Calendar, while Home still does not need a timeline block for them in MVP.
- User task lists are added from a compact plus button on the right side of the `Списки` section title, not from a full-width `Новый список` row.
- Visible task UI must be product-facing and Russian-first. Do not show technical copy such as `TickTick-like`, `completed/trash`, `detail panel`, or future/deferred controls in active UI.

## Stage 7 Implementation Contract

- Rust domain model lives in `crates/lifeos-core/src/tasks.rs`.
- SQLite task repository lives in `crates/lifeos-storage/src/tasks.rs`; the base schema is migration `0003_tasks.sql`, with later migrations adding promoted fields such as `tasks.status`.
- Structured task storage uses SQLite tables `tasks` and `task_lists`. `tasks.status` stores `not_started`, `in_progress`, or `waiting`; `tasks.waiting_for` stores the optional reason for `waiting` tasks; completion stays separate in `completed_at_ms`.
- Task create/update/complete/delete/clear-trash operations append `tasks` entries to the sync-ready `change_log`.
- Tauri command helpers and commands expose task list creation, task list reading, task CRUD, recurring completion, and trash clearing.
- Frontend task data calls live in `apps/desktop/src/dataCore.ts`.
- Browser/Vite fallback stores task `status` and normalizes older localStorage records to `not_started`.
- The React Tasks module uses smart lists Today, Inbox, Next 7 days, Overdue, user lists, Completed, and Trash. It persists and restores the last selected target locally, including system targets.
- Quick add creates a title-only task in Inbox or user lists; when used from Today it assigns today's due date, and when used from a user list it assigns that list id.
- In the browser/Vite preview without the Tauri runtime, task lists and quick-added tasks use a localStorage fallback so the `http://127.0.0.1:1420/#/tasks` workflow remains testable. The packaged desktop app still uses the Rust/SQLite task commands as the durable source of truth.
- Completed groups by completion date and has a compact filter control. Trash has a clear action that permanently removes deleted rows.
- Priority appears through the completion square/check area styling, not as separate right-side `P1`/`P2`/`P3` badges.
- Grouping/sorting controls implemented in Stage 7 are date, priority, title sorting, manual order, and no grouping. Label/tag controls remain hidden while tags are deferred.

## Deferred

- Task-project links.
- Task tags.
- Approximate duration.
- Kanban view implementation.
- Repeat-by-completion-date recurrence mode.

## Open Questions

See Tasks questions in [../open-questions.md](../open-questions.md).

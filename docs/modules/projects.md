# Projects Module

Status: MVP basic module

## Purpose

Projects provide a lightweight place to keep important project information. In MVP, they are not a task container.

## Current Decisions

- Creating a project only needs enough data to make it appear in the left project list.
- No project field is mandatory.
- Project opens as its own interface with editable fields.
- Field content can be Markdown-like where useful.
- Stages/statuses are user-defined, not a fixed system list.
- `Что мешает реализации` is an optional plain text field.
- It can stay empty if nothing blocks the project.
- Tasks do not belong to projects in MVP.
- Task-project linking is deferred.
- Notes, Calendar events, focus sessions, and files are not confirmed as project links in MVP; treat them as deferred until clarified.
- No project deadlines or milestones in MVP.
- No Kanban/roadmap board in MVP.
- Archive behavior should be close to task archive/trash mental model where practical.

## Layout

- Left side: compact list of projects the user added.
- Project creation is available from the left project list, not from a duplicate top-header `Новый проект` button.
- Project creation uses a quiet plus icon in the sidebar header, matching the Tasks list-creation pattern. The text entry row appears only after pressing the plus.
- The Projects sidebar header does not repeat the visible `Проекты` module title; the global rail owns module identity.
- Projects does not show the shared top workspace module header; the module starts directly from the Projects sidebar and selected-project header.
- The default project-list screen has no right inspector panel.
- Selected project's important information appears as editable fields in the main workspace.
- The selected project name is edited directly in the selected-project header. Do not duplicate it as a separate `Название` field in the field grid.
- Projects should not draw a horizontal divider under the sidebar/header row when it creates a visual stray line across the workspace.
- The Projects workspace should not show top-right runtime/status pills such as `Локально` or selected-record badges such as `Редактируется`.
- The visible project fields are user-filled inputs, not static explanatory cards.
- The core fields `Описание`, `Этап`, and `Что мешает` are arranged vertically as labels, with editable text fields beside each label.
- The browser reference uses the shared light LifeOS shell: compact global rail, 214px project sidebar, compact header, tinted central workspace, raised editable field rows, and dense project rows without a right inspector.
- The browser selected-project workspace should not duplicate the project list in the central workspace. Project selection stays in the left sidebar; the main workspace shows only editable fields for the selected project.

## Possible Fields

All optional:

- description;
- stage/status;
- what blocks implementation;
- next actions;
- notes/free Markdown-like text.

These fields are editable parameters, not required database fields. User can leave any of them empty.

## Deferred

- Task links.
- Notes links.
- Project Kanban board.
- Roadmap/milestones/deadlines.
- Project progress metrics unless later confirmed.

## Stage 13 Desktop Implementation

- The desktop Projects route now uses a real compact left project list and a central editable project workspace.
- A quiet header plus in the left project list opens the project-title entry row; creating from that row adds a lightweight project record.
- Editable fields are title, description, stage, blockers / `Что мешает`, next actions, and notes.
- Projects records are canonical SQLite records in `projects` as of migration `0012_basic_modules`.
- Existing `frontend-records.json` / `lifeos.basic-modules.v1.projects` records are imported idempotently into canonical storage and cleared from the packaged frontend snapshot after migration.
- Settings > Data export, local backup, search, and integrity checks read Projects from canonical storage. Browser/Vite `localStorage` is only a fallback when Tauri commands are unavailable.
- The UI does not show task ownership, task links, Kanban, roadmap, or progress metrics.

## 2026-05-18 UX Maturity Implementation

- Projects shows useful empty states in both the sidebar list and selected-project workspace instead of a demo placeholder.
- The empty Projects sidebar state stays miniature: title-only copy such as `Создайте проект`, without explanatory helper text about optional fields or the plus control.
- Async project loading has a quiet loading state and a recoverable error state with retry.
- Project creation remains keyboard reachable from the sidebar plus action; the title input receives focus when opened.
- No project field is mandatory, so the create action stays available with a generated fallback title while clearly labelling the optional title field.
- When no project is selected, editable fields are honestly disabled and the workspace explains that the user should create or select a project first.
- The Projects sidebar exposes a compact Settings shortcut for module-related configuration.
- Focus rings stay stable on sidebar rows, creation controls, inline title editing, and editable fields.
- The active Projects UI should not show technical helper copy or internal storage/runtime wording; data limitations belong in Settings/Data or release documentation.
- The Projects route should not show repeated top-left module-name chrome. Keep the sidebar `aria-label` and icon actions, but no visible `Проекты` heading.

## Open Questions

See Projects questions in [../open-questions.md](../open-questions.md).

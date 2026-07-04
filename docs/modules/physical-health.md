# Physical Health Module

Status: MVP basic module

## Purpose

Physical Health records body-zone complaints, context, triggers, and doctor visit information.

## Current Decisions

- User should be able to choose a concrete body zone.
- The only primary creation action in this module is adding a body zone.
- After the user adds a body zone, LifeOS moves them into that zone's interface.
- Inside a body-zone interface the user records what exactly bothers them, in which conditions it appears, and can work with doctor appointments.
- The selected body-zone workspace first offers a clear choice: `Заметки` or `Приемы у врача`.
- The top header does not duplicate the `+ Зона тела` action while a body zone is selected; body-zone creation stays in the left sidebar.
- The shared workspace title/header is hidden on the Physical Health route; the module starts directly with the body-zone sidebar and selected-zone workspace.
- Body-zone creation mirrors the Tasks list creation pattern: a quiet plus icon sits in the `Зоны тела` sidebar header, and the zone-name row appears only after pressing it.
- Sidebar rows without counts do not show empty circular count placeholders.
- `История` and `Врачи` are not separate left-sidebar sections in the current design pass; they belong inside the selected body-zone workflow.
- The browser reference uses the shared light LifeOS module shell: compact global rail, body-zone sidebar, compact selected-zone header, tinted workspace, and two raised action surfaces for notes and doctor appointments.
- In the selected-zone workspace, the first action is named `Заметки`; inside it, a separate `Создать заметку` button opens a modal for creating/editing a health note.
- The selected-zone workspace must not duplicate the active zone as a separate `Зона` field and must not repeat an inner `Заметки` heading under the `Заметки` action surface.
- Physical Health attachment picking belongs inside the health-note creation modal. The current control is a compact paperclip button, while long-term shared attachment storage remains open.
- User records what bothers them and when it appears.
- Examples: after long sitting, after fast running.
- Doctor visit information should be supported.
- Body zones are user-defined free-text records in the current MVP. LifeOS does not provide a default preset zone taxonomy yet.
- Deeper Physical Health model decisions are deferred until active work on this module resumes.
- Future clickable human model is planned.
- Attachments/images are needed here, as in Notes/Tasks/Diary.

## Expected MVP Direction

The first version can use a structured body-zone list instead of a full human model.

Primary flow:

1. Add a body zone.
2. Open the body-zone workspace.
3. Choose `Заметки` or `Приемы у врача`.
4. In a note, record the complaint and conditions/triggers.
5. Optionally add a doctor appointment for that zone.

Potential records:

- body zone;
- complaint;
- trigger/context;
- severity;
- note;
- media/photo;
- doctor visit details.

Future direction:

- clickable human model where body zones open related records.

## Stage 13 Desktop Implementation

- The desktop Physical Health route now starts from a compact body-zone list with `+ Зона тела`.
- Creating a zone immediately selects it and opens the zone workspace.
- The Physical Health route hides the shared workspace header/title so `Физическое здоровье` is not duplicated above the module surface.
- Body-zone creation now follows the Tasks sidebar pattern: a quiet plus in the `Зоны тела` header reveals the zone-name input row.
- The zone workspace first exposes working action surfaces for `Заметки` and `Приемы у врача`; they switch the visible workflow instead of acting as decorative buttons.
- The `Заметки` workflow exposes a right-aligned `Создать заметку` action that opens a modal for complaint, context, triggers, and attachments.
- The selected-zone name appears in the workspace header only; it is not duplicated as an editable `Зона` field.
- The `Заметки` workflow is already named by the top action, so the notes panel does not repeat a `Заметки` heading.
- The note flow stores zone name, complaint, context, triggers, and selected attachment file names in the canonical `physical_zones` record.
- Health-note attachments are added from the note modal through a mini paperclip button; the main selected-zone screen does not show a standalone attachment row.
- The doctor flow stores doctor type, doctor appointment date/time, and visit information.
- `История` and `Врачи` are not separate left-sidebar sections; doctor information belongs inside the selected body-zone workspace.
- Physical Health body-zone records are canonical SQLite records in `physical_zones` as of migration `0012_basic_modules`.
- Existing `frontend-records.json` / `lifeos.basic-modules.v1.physicalZones` records are imported idempotently into canonical storage and cleared from the packaged frontend snapshot after migration.
- Settings > Data export, local backup, search, and integrity checks read Physical Health from canonical storage. Browser/Vite `localStorage` is only a fallback when Tauri commands are unavailable.
- Shared attachment handling remains future work.

## 2026-05-18 UX Maturity Implementation

- Physical Health shows useful empty states for an empty body-zone list, no selected zone, empty zone notes, and empty doctor-visit data.
- Async body-zone loading has a quiet loading state and a recoverable error state with retry.
- Body-zone creation is keyboard reachable from the sidebar plus action; the zone-name input receives focus when the row opens.
- The create action is honestly disabled until a body-zone name is filled.
- The selected-zone workspace is disabled until a zone is selected and explains the user action needed without technical placeholder copy.
- The Physical Health header exposes a compact Settings shortcut for expected health-module configuration.
- Focus rings stay stable on zone rows, creation controls, note/doctor mode actions, modal fields, and attachment controls.
- The active Physical Health UI should not show technical helper copy or internal storage/runtime wording; data limitations belong in Settings/Data or release documentation.

## Open Questions

See Physical Health questions in [../open-questions.md](../open-questions.md).

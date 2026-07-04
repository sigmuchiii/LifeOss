# LifeOS v4 Documentation Map

Status: active documentation index

Use this file as the entry point for new sessions, redesign work, and implementation planning.

## Read Order For A New Session

1. [Specification Draft](spec-draft.md) - short current product truth.
2. [Agent Handoff](agent-handoff.md) - compact product context extracted from chat for new agents.
3. [Module Specs](modules/README.md) - choose the module you will work on.
4. [Open Questions](open-questions.md) - unresolved or partial decisions only.
5. [Decisions Log](decisions-log.md) - confirmed decisions and interview history.
6. [LifeOS v4 Design](lifeos-v4-design.md) - current visual/product UI direction.
7. [Reference Docs](#reference-documents) - read only when the affected work needs that reference.

## Active Documents

- [Specification Draft](spec-draft.md): current high-level scope, architecture, relationships, and design direction.
- [Agent Handoff](agent-handoff.md): new-session product context; `AGENTS.md` stays short and links here.
- [Module Specs](modules/README.md): self-contained module-level specs for Home, Tasks, Habits, Calendar, Projects, Contacts, Notes, Quick Notes, Diary, Physical Health, Finance, Focus, Trading, Settings.
- [Open Questions](open-questions.md): only questions that still need answers.
- [Decisions Log](decisions-log.md): confirmed decisions moved out of the open-question backlog.
- [Future Features](future-features.md): explicitly deferred ideas.
- [Implementation Roadmap](implementation-roadmap.md): current priority pointer plus historical build sequencing; do not let old milestone text override current specs.
- [10/10 Readiness Closure List](10-out-of-10-readiness-checklist.md): список закрытия качества, durability, release и maintainability до состояния 10/10.
- [Release Checklist](release-checklist.md): Windows packaging commands, unsigned-build limitations, and release constraints.
- [Pre-Update Rollback Runbook](pre-update-rollback-runbook.md): owner-facing recovery steps for restoring data from a pre-update artifact and choosing the safe app version after rollback.
- [Security Audit Policy](security-audit-policy.md): `cargo audit` gate, temporary advisory allowlist ownership, and review cadence.
- [Release Security Checklist](release-security-checklist.md): signing, provenance, SBOM generation, and artifact verification gate.

## Reference Documents

- [LifeOS v4 Design](lifeos-v4-design.md): active design direction and UI contracts.
- [Icon System](icon-system.md): module icon mapping and icon rules.
- [Design Selection](design-selection.md): historical design option/capture decisions; use only to trace why a visual direction changed.
- [Source Projects](source-projects.md): how old local projects are used as references.
- [Module Scenes](module-scenes.md): secondary interfaces, creation flows, pickers, overlays, and mini-windows.

Do not add links here to reference files that are not present in this repository. Older TickTick, Obsidian, and OpenCode analysis is now represented through current module specs, `lifeos-v4-design.md`, `design-selection.md`, and `module-scenes.md`.

`decisions-log.md` is the single decision-history source. `open-questions.md` is the single unresolved-question source. Historical plans, old release evidence, and disabled-module notes belong in [Archive](#archive), not in the active read path.

## Archive

- [Historical Project Audit 2026-05-13](archive/historical-project-audit-2026-05-13.md): historical snapshot, not current release truth.
- [Historical Project Audit 2026-05-13 RU](archive/historical-project-audit-2026-05-13-ru.md): Russian historical snapshot, not current release truth.
- [Private Dogfood Release Evidence 2026-05-15](archive/release-evidence-2026-05-15-private-dogfood.md): old candidate evidence superseded by later release/security docs.
- [Historical Milestone 0 Foundation Plan](archive/plans/2026-05-05-lifeos-v4-milestone-0-foundation.md): implemented historical plan, not current implementation guidance.
- [Historical Logic Redesign Pass](archive/plans/2026-05-05-logic-redesign-pass.md): executed HTML preview plan, not current design truth.
- [Disabled Psychological Health Module Notes](archive/modules/psychological-health.md): deferred module context only; do not treat it as a visible MVP module spec.

Archived files should not be used as current test counts, release status, module status, implementation scope, or design truth. Current truth lives in the active docs above and fresh release evidence for each candidate.

## Documentation Update Rules

Every product decision from the user must be reflected in documentation.

The user may answer by voice dictation. Read the whole answer for intent, including side comments and examples. If wording is unclear, document the clear part and ask a narrow follow-up question.

If a new answer conflicts with earlier product logic, keep the conflict visible: add or update an item in [Open Questions](open-questions.md), ask the user which behavior is correct, and then update the relevant specs after the decision.

When the user answers a question:

1. Add the confirmed decision to [Decisions Log](decisions-log.md).
2. Update the affected module file in [modules](modules/README.md).
3. Update [Specification Draft](spec-draft.md) if the decision changes high-level scope, architecture, storage, relationships, or design direction.
4. Remove or rewrite the answered item in [Open Questions](open-questions.md).
5. Move deferred ideas to [Future Features](future-features.md) when they are not MVP.
6. Update design/reference docs when the answer affects layout, interaction, iconography, theme, or visual hierarchy.

`open-questions.md` should shrink as decisions are made. It should not contain resolved history.

Open questions should be written in Russian-first owner-facing language. Keep the status marker as exact English `Open` or `Partial`; translate product terms when practical, and keep exact English only for code identifiers, file names, command names, environment variables, artifact names, or UI/code values that must stay exact.

## Implementation Use

Before implementing a module:

1. Read this README.
2. Read [Specification Draft](spec-draft.md).
3. Read [Agent Handoff](agent-handoff.md).
4. Read the specific module file.
5. Check [Open Questions](open-questions.md) for unresolved blockers.
6. Read relevant reference docs.
7. If implementation requires assuming an unanswered product rule, document the assumption in the module file and add/adjust an open question.

## Current MVP Module And Entity Files

These are the current module/entity spec files. `Reminders` is an MVP entity and Home notification source, while the full visible Reminders module / notification center remains future work unless promoted.

- [Home](modules/home.md)
- [Tasks](modules/tasks.md)
- [Habits](modules/habits.md)
- [Calendar](modules/calendar.md)
- [Reminders](modules/reminders.md)
- [Focus](modules/focus.md)
- [Projects](modules/projects.md)
- [Contacts](modules/contacts.md)
- [Notes](modules/notes.md)
- [Quick Notes](modules/quick-notes.md)
- [Diary](modules/diary.md)
- [Physical Health](modules/physical-health.md)
- [Finance](modules/finance.md)
- [Trading](modules/trading.md)
- [Settings](modules/settings.md)

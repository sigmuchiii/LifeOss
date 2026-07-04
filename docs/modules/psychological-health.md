# Psychological Health Module

Status: disabled/deferred as of 2026-05-13

## Purpose

Psychological Health is not part of the current visible MVP module set. The desktop registry keeps the old `psychologicalHealth` entry disabled so it does not appear in the global rail and `/psychological-health` does not resolve as an active product route.

This file is retained only as historical context unless the user explicitly promotes the module again.

## Current Decisions

- Stage 13 MVP starts with basic mental-state tracking rather than therapy tooling or CBT workflows.
- The module aligns with Diary fields where useful: date, mood, energy, reflection, and a mental-state note.
- Triggers can be recorded as free text.
- The module remains separate from Diary in MVP; no automatic cross-linking is implemented yet.
- Therapy notes, anxiety scales, CBT exercises, reminders, and analytics are future candidates.
- The browser reference uses the shared light LifeOS module shell: compact mental-state sidebar, tinted workspace, raised editable state/reflection rows, and no decorative right inspector in the production pass.

## Stage 13 Desktop Implementation

- The desktop Psychological Health route now has a compact record list and a central editable mental-state workspace.
- `+ Запись` creates a daily record.
- Record rows in the sidebar are selectable controls and update the central workspace selection.
- Editable fields are date, mood, energy, state, triggers, and reflection.
- Stage 13 persists these records in the frontend local record store. Rust/SQLite canonical storage remains a future promotion.

## Open Questions

No active open questions remain for Psychological Health while the module is disabled. Future promotion should reopen scope in [../../open-questions.md](../../open-questions.md) before implementation.

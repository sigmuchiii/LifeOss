# LifeOS v4 Source Project Context

Created: 2026-05-05
Status: working context for a new project from scratch
Language: Russian for product decisions, English filenames for portability

## Source Projects

The new LifeOS v4 project is not a direct continuation of either existing folder. Both existing projects are references.

### `Lifeos`

Role: technical donor and implementation reference.

Useful parts:

- Tauri 2 + React + TypeScript desktop shell.
- Rust-owned runtime boundary.
- Local vault concepts.
- Existing module implementations and tests.
- Sync/pairing experiments.
- Shared UI unification work.

Known cautions:

- Working tree has many existing uncommitted changes.
- The project contains broader modules than the chosen v3 MVP, including food and vibecoding surfaces.
- Some implementation choices are prototype-like and should not be copied blindly.
- Current security/encryption behavior is not the target for a hardened future product without redesign.

### `LifrOs 2`

Role: product/specification donor.

Useful parts:

- Cleaner MVP scope lock.
- The old 13-module MVP list as historical input; current LifeOS v4 has 14 visible MVP modules with Contacts and Quick Notes added, and keeps Psychological Health disabled/deferred.
- Day-first home/dashboard direction.
- Design system documentation.
- Requirements files for individual modules.
- Future-features backlog.

Known cautions:

- It is primarily documentation and planning, not the codebase to continue.
- Some choices were optimized for finishing the old MVP, not for a fresh LifeOS v4 architecture.

## Decision

LifeOS v4 starts as a new project from scratch.

The old projects are optional references, not required dependencies.

The implementation should borrow proven ideas, contracts, and code patterns only when they clearly fit the new architecture. If a source project does not provide value for a specific decision or implementation task, do not force it into the new project.

# LifeOS v4 Module Specs

This folder stores current module-level requirements.

Each module file should be self-contained enough to design and implement that module without reading the whole conversation history.

Use these files when designing or implementing a specific module:

- [Home](home.md)
- [Tasks](tasks.md)
- [Habits](habits.md)
- [Calendar](calendar.md)
- [Reminders](reminders.md)
- [Focus](focus.md)
- [Projects](projects.md)
- [Contacts](contacts.md)
- [Notes](notes.md)
- [Quick Notes](quick-notes.md)
- [Diary](diary.md)
- [Physical Health](physical-health.md)
- [Finance](finance.md)
- [Trading](trading.md)
- [Settings](settings.md)

Confirmed decisions are logged in [../decisions-log.md](../decisions-log.md).

Unresolved questions are tracked in [../open-questions.md](../open-questions.md).

Documentation rules and read order are described in [../README.md](../README.md).

## Shared Visual Contract

These rules apply to every visible module unless the module file explicitly documents an exception.

- The active MVP UI is light-first and uses one shared LifeOS shell. Do not mix module-level dark themes inside the same active app state.
- The global left rail stays visible on every module screen, spans the full app height, and uses the shared production rail geometry from `apps/desktop/src/app/theme/theme.css`: `40px` rail, compact icon buttons, `18px` SVG icons, and `1.8` stroke width.
- Non-Home modules use the shared Tasks-like desktop geometry where it fits: `214px` contextual sidebar when present, compact `55px` workspace headers, full-height tinted workspaces, raised light surfaces, dense rows, and quiet icon actions.
- Module headers are compact or absent. Do not stack a generic module title above a module-specific header, and do not show runtime/status pills such as `Локально` unless they are part of a working product surface.
- Avoid decorative outer app cards, nested cards, prompt/action explanation boxes, decorative chart placeholders, radial/glow backgrounds, and thick colored side-stripe accents.
- A module-specific layout can remove the contextual sidebar, right detail panel, or shared header when the module contract says so. Current examples: Home is a full schedule surface; Calendar Month has no persistent sidebar; Diary starts as a full month grid; Trading uses a top-centered mode selector; Notes is a minimal Obsidian companion gateway; Quick Notes has a normal light main module plus a native mini-window exception.
- Visible controls must either work, open a real modal/menu/picker, toggle real state, focus a controlled field, or be honestly disabled with accessible labels. Do not leave decorative placeholder buttons in active UI.
- Visible copy is Russian-first and user-facing. Do not show implementation notes, reference labels, internal ids, `MVP`, `future`, `TickTick-like`, or similar technical helper text inside the app UI.

## Module Registry Contract

The production desktop app keeps module navigation and routing in `apps/desktop/src/modules/moduleRegistry.ts`.

Each module definition includes:

- `id`
- `label`
- `icon`
- `route`
- `order`
- `visibility`
- `capabilities`

Visibility values:

- `visible`: shown in the global left rail and routable.
- `hidden`: not shown in the rail, but still routable for future/secondary module surfaces.
- `disabled`: not shown in the rail and not resolved as an active route.

The current visible MVP modules remain visible in the order listed above, with Quick Notes added as a separate module after Notes. Contacts is inserted between Projects and Notes. Psychological Health is currently disabled in the registry and should be treated as deferred unless the user promotes it again. Future modules should be added by appending or inserting registry records with sparse `order` values, not by rewriting the shell.

## Basic Module Storage Status

Finance has canonical Rust/SQLite storage for accounts, transactions, and budgets. Quick Notes also uses canonical Rust/SQLite storage and a native mini-window from its first durable implementation. Projects, Contacts, Diary, Physical Health, and Trading are now canonical desktop records as of migration `0012_basic_modules`: Projects use `projects`, Contacts use `contacts`, Diary uses `diary_entries` plus synchronized `diary/YYYY-MM-DD.md` files, Physical Health uses `physical_zones`, and Trading uses `trading_plays`, `trading_entries`, and `trading_rule_sections`. Browser/Vite localStorage remains a preview fallback only when Tauri commands are unavailable.

## Shared Accessibility Baseline

These minimum rules apply to current desktop MVP work unless a module spec documents a stronger requirement.

- Use native focusable controls for interactive elements where practical.
- Preserve visible keyboard focus through the shared focus token from `apps/desktop/src/app/theme/theme.css`.
- Give icon-only actions accessible names; decorative icons should not be the only name of a control.
- Dialogs, overlays, and modals need labelled close actions and must remain keyboard reachable.
- Respect reduced-motion preferences for nonessential animation/transition effects.
- Text and meaningful icons should target WCAG AA contrast in the active light theme.
- Standard desktop controls should keep practical compact hit targets; smaller dense controls are acceptable only when they remain labelled and keyboard accessible.

## Mobile Readiness Note

The registry is a desktop implementation today, but its ids, route slugs, order, visibility, and capability flags are the candidate cross-client module contract for future mobile apps.

Mobile implementation is postponed until the desktop modules are brought to an ideal state. Treat mobile scope decisions as future planning, not as current module requirements.

Owner decision on 2026-05-28: the first mobile version should include every module that exists in LifeOS when mobile development starts. Disabled/deferred modules are still excluded unless they are promoted before mobile work begins. The open mobile question is the read/write depth and workflow shape for each included module.

Mobile clients should not depend on desktop-only registry details such as React/lucide icon components, hash routing, or the desktop shell layout. The current canonical module-id format is camelCase (`physicalHealth` included) across desktop registry and storage/search output, and mobile deep-link naming should map to this canonical id contract. The old `psychologicalHealth` registry entry is disabled and not part of the current visible MVP.

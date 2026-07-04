# LifeOS v4 Icon System

Created: 2026-05-05
Updated: 2026-05-29
Status: approved production mapping

## Source

Use icons from the existing Life OS projects where they provide concrete value.

Primary source:

`C:\Users\Nomoregooners\projects\LifeOS v4\LifrOs 2\.worktrees\phase-0-1-foundation-visual-prototype\src\app\routes.ts`

Secondary reference:

`C:\Users\Nomoregooners\projects\LifeOS v4\Lifeos\apps\desktop\src\app\AppShell.tsx`

Both projects already use `lucide-react` for module navigation. LifeOS v4 should keep that direction instead of using temporary text symbols.

## Global Rail Mapping

| Module | Icon |
| --- | --- |
| Home | `Home` |
| Tasks | `CheckSquare` |
| Habits | `CalendarCheck` |
| Calendar | `CalendarDays` |
| Projects | `FolderKanban` |
| Contacts | `Contact` |
| Notes | `BookOpen` |
| Quick Notes | `StickyNote` |
| Diary | `NotebookPen` |
| Physical Health | `Dumbbell` |
| Finance | `CircleDollarSign` |
| Focus | `Timer` |
| Trading | `LineChart` |
| Settings | `Settings` |

## Design Board Implementation

The current design board embeds the lucide path data inline:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-all-modules-v5.html`

The logic-scenes preview must follow the same rule and must not fall back to text glyphs:

`C:\Users\Nomoregooners\projects\LifeOS v4\.superpowers\brainstorm\session-20260505-020451\content\lifeos-v4-logic-scenes-v1.html`

Reason:

- Figma capture remains self-contained.
- The committed board does not depend on ignored reference-project folders.
- The left rail can show the same icons on every module screen.

Latest Figma capture:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=8-2

Latest available OpenCode-like Variant B capture before the local logic-redesign pass:

https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq?node-id=16-2

## Action And Entity Icons

The logic-redesign pass adds a small entity/action vocabulary around the module rail:

| Concept | Icon |
| --- | --- |
| Habit | `CalendarCheck` |
| Habit icon palette | `CalendarCheck`, `Footprints`, `Dumbbell`, `Droplets`, `BookOpen`, `Brain`, `HeartPulse`, `Moon`, `Utensils`, `Music` |
| Calendar event | `CalendarPlus` |
| Reminder | `BellRing` |
| Markdown note/file | `FileText` |
| Add list | `ListPlus` |
| Reminder time | `AlarmClock` |
| Focus sound | `Volume2` |
| Custom sound import | `Upload` |

These icons should also come from `lucide-react` where available. If a production icon name differs slightly, preserve the same visual meaning rather than the exact temporary inline path name.

## Production Rule

When implementation starts, use `lucide-react` imports directly instead of copied SVG strings.

Baseline rail icon props for the current production shell:

- rail width: `40px` in the production desktop token contract;
- icon button size: `30px` in the production desktop rail;
- SVG size: `18px`;
- stroke width: `1.8`;
- line cap/join: round;
- active color: primary blue token;
- inactive color: muted foreground token.

Module-local navigation rows may reuse the same icons when the row refers to a module concept, for example task rows with `CheckSquare`, note rows with `BookOpen`, finance account rows with `CircleDollarSign`, and calendar references with `CalendarDays`. Habit records use the fixed habit icon palette above; the default stored key is `calendar_check`.

Older design-board captures may still show a `42px` rail, `28px` icon buttons, or the darker Variant B `48px` rail. Treat those as historical reference dimensions. The current production source of truth is the shared token contract in `apps/desktop/src/app/theme/theme.css` and the active rail implementation in `apps/desktop/src/app/shell/LeftRail.tsx`.

## App Icon

The Windows/Tauri app icon source is:

`C:\Users\Nomoregooners\projects\LifeOS v4\apps\desktop\src-tauri\icons\app-icon.svg`

The 2026-05-20 icon refresh replaces the temporary `L3` placeholder with a
text-free LifeOS mark: a dark command-workspace tile, a white LifeOS axis, and
three colored module nodes (`#38bdf8`, `#22c55e`, `#f59e0b`). Generated Tauri
assets live in the same folder:

- `32x32.png`
- `64x64.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.png`
- `icon.ico`

`tauri.conf.json` wires the PNG/ICO set into the app bundle and NSIS installer.
The system tray uses Tauri's default window icon, so shell, tray, installer, and
uninstaller all consume the same generated icon family.

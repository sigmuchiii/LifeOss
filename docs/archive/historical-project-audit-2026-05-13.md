# Project Audit 2026-05-13

Historical archive note: this file is a point-in-time audit snapshot and is not
current release truth. Use active release docs and fresh release evidence for
current status.

Аудит выполнен 2026-05-17 в Windows-окружении текущего репозитория. Код приложения не исправлялся: изменения внесены только в этот отчет.

## Executive Summary

This audit is now structured as an actionable optimization backlog rather than a raw issue dump. Findings are deduplicated, grouped by severity, and ordered by expected user/business effect inside each severity band. Every finding contains `Evidence`, `Recommendation`, and `Verification`; weak or unmeasured performance claims are explicitly marked as `Hypothesis`.

Original audit baseline:

- The current release build passed `lint`, `typecheck`, `test`, `build`, `cargo fmt --check`, `cargo clippy`, `cargo test`, `cargo audit`, and `npm audit`.
- Frontend bundle after `npm run build`: `dist/assets/index-BhyXvRjO.js` 432,448 B raw / 124,389 B gzip / 103,528 B brotli; `dist/assets/index-4I8NSbHz.css` 122,287 B raw / 19,370 B gzip / 16,546 B brotli; whole `dist` 555,129 B raw.
- Warm release launch observation: main process + one new WebView2 child; working set 98-121 MB after 5-8 seconds. GPU was not measured.
- The strongest confirmed optimization targets were N+1 habit/log/stat IPC, repeated SQLite open/migration checks per Tauri command, full recursive Notes copy in update/backup/export flows, reminder polling that scans all reminders, single initial JS chunk for all modules, and obsolete Notes CSS in the production stylesheet. PERF-001, PERF-002, PERF-003 first backend step, PERF-005, and PERF-006 now have implementation work; scenario-level performance measurements are still pending.

Current post-optimization checks observed 2026-05-17:

- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit --audit-level=moderate`, `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace`, `cargo audit --deny warnings`, and `npm run bundle` passed.
- Fresh frontend build output includes main JS `dist/assets/index-C4o3T2vL.js` 266,000 B raw / 82,960 B gzip and CSS `dist/assets/index-DcQMqs_d.css` 104,700 B raw / 16,970 B gzip, plus lazy route chunks for Basic, Settings, Notes, Quick Notes, Tasks, Habits, Calendar, and Focus.
- Fresh bundle output created `target/release/lifeos-v3.exe` 13,197,824 B and `target/release/bundle/nsis/LifeOS v3_0.1.0_x64-setup.exe` 3,302,354 B.
- `npm ls codemirror @codemirror/lang-markdown @codemirror/theme-one-dark` returns an empty tree; CodeMirror is no longer an active desktop dependency.

Highest-priority work:

1. Batch habit logs/stats and remove the highest-fanout frontend IPC pattern.
2. Measure database state reuse after startup migration with seeded command-latency traces.
3. Add progress/cancel/incremental behavior to backup/export and pre-update backup flows without weakening data safety.
4. Replace reminder full-table polling with indexed due queries and next-due scheduling.
5. Split non-default module screens out of the initial renderer bundle and remove obsolete production CSS. Both first implementation steps are now in place; scenario-level renderer traces remain pending.

Key constraints:

- Data-safety optimizations must preserve backup/export integrity, interruption recovery, and partial-backup detection.
- SQLite connection reuse must preserve migration ordering, WAL behavior, thread safety, command isolation, and test determinism.
- Renderer changes need regression and visual checks because LifeOS has many module-specific screens and dense UI states.

## Baseline

### Project Shape

- Repository: `C:\Users\Nomoregooners\projects\LifeOs v3`.
- Product: local-first Windows desktop productivity app, LifeOS v3.
- Stack:
  - Frontend: React 19, TypeScript, Vite, lucide-react, Tauri JS API.
  - Desktop shell: Tauri v2.
  - Backend/domain/storage: Rust workspace, SQLite via `rusqlite` with bundled SQLite.
  - Data model: local SQLite plus Notes files/vault-style Markdown storage.
- Main user scenarios from docs:
  - Home daily schedule aggregation.
  - Tasks smart lists and task detail.
  - Habits logs/stats.
  - Calendar month/week/day.
  - Focus timer.
  - Notes Obsidian gateway.
  - Quick Notes lightweight mini-window concept.
  - Settings/Data export/backup/search/integrity.
  - Basic module snapshots for projects, contacts, diary, physical health, finance/trading.

### Environment

- OS: Microsoft Windows 11 Pro 10.0.26200 64-bit.
- CPU: Intel Core i3-10100F, 4 cores / 8 logical processors.
- RAM: 16,672,376 KB total visible; 2,138,792 KB free at sampling time.
- GPU: NVIDIA GeForce GTX 1660 SUPER, AdapterRAM 4,293,918,720 B, driver 32.0.15.9571.
- Disk C: 595,072,294,912 B used; 404,164,325,376 B free.
- Node: `v22.22.2`.
- npm: `10.9.7`.
- rustc: `rustc 1.95.0 (59807616e 2026-04-14)`.
- cargo: `cargo 1.95.0 (f2d3ce0bd 2026-03-21)`.
- cargo-audit: `cargo-audit-audit 0.22.1`.

### Commands And Results

| Command | Result | Duration |
| --- | --- | ---: |
| `npm run lint` in `apps/desktop` | pass | 10.173 s |
| `npm run typecheck` in `apps/desktop` | pass | 19.037 s |
| `npm test` in `apps/desktop` | pass | 17.529 s |
| `npm run build` in `apps/desktop` | pass | 22.885 s |
| `npm audit --audit-level=moderate` in `apps/desktop` | pass, 0 vulnerabilities | 6.326 s |
| `cargo fmt --all -- --check` | pass | 0.647 s |
| `cargo clippy --workspace --all-targets -- -D warnings` | pass | 33.467 s |
| `cargo test --workspace` | pass | 23.158 s |
| `cargo audit --deny warnings` | pass, 489 crate dependencies scanned | 7.449 s |
| `cargo build --release --workspace` | pass | 145.082 s |
| `npm run bundle` in `apps/desktop` | pass, NSIS installer created | 129.114 s |

### Bundle And Disk Measurements

- Frontend JS: `apps/desktop/dist/assets/index-BhyXvRjO.js` = 432,448 B raw, 124,389 B gzip, 103,528 B brotli.
- Frontend CSS: `apps/desktop/dist/assets/index-4I8NSbHz.css` = 122,287 B raw, 19,370 B gzip, 16,546 B brotli.
- Frontend `dist` total: 555,129 B raw.
- Windows installer: `target/release/bundle/nsis/LifeOS v3_0.1.0_x64-setup.exe` = 3,200,590 B.
- Release exe: `target/release/lifeos-v3.exe` = 12,792,320 B.
- Release target directory recursive total: 4,144 files, 2,084,715,206 B.
- Large release artifacts observed:
  - `target/release/lifeos_desktop_lib.lib` = 102,646,466 B.
  - `target/release/liblifeos_desktop_lib.rlib` = 27,934,758 B.
  - `target/release/lifeos_desktop.pdb` = 5,722,112 B.
- `node_modules`: 9,622 files, 684 directories, 147,758,372 B.
- CodeMirror-related packages: 113 files, 3,018,236 B.
- `lucide-react`: 3,944 files, 30,003,915 B.

Current build deltas:

- Latest built main JS: `apps/desktop/dist/assets/index-C4o3T2vL.js` = 266,000 B raw / 82,960 B gzip.
- Latest built CSS: `apps/desktop/dist/assets/index-DcQMqs_d.css` = 104,700 B raw / 16,970 B gzip.
- Latest NSIS installer: `target/release/bundle/nsis/LifeOS v3_0.1.0_x64-setup.exe` = 3,302,354 B.
- Latest release exe: `target/release/lifeos-v3.exe` = 13,197,824 B.
- CodeMirror dependencies are removed from the active desktop package; `npm ls codemirror @codemirror/lang-markdown @codemirror/theme-one-dark` returns empty.
- Stale `target/release/*lifeos_desktop_lib*` artifacts from earlier crate-type builds can remain in an uncleared target directory. Clean-build target-size comparison remains pending.

### Runtime Observation

Release executable `target\release\lifeos-v3.exe` was launched and sampled after warm startup. Measurement was process-level, not a full user-scenario trace.

| Run | WaitForInputIdle | Process count | Working set | Private bytes | CPU seconds after sample |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 197 ms | 2 | 103,448,576 B | 43,122,688 B | 1.96875 |
| 2 | 63 ms | 2 | 121,241,600 B | 55,603,200 B | 1.671875 |
| 3 | 84 ms | 2 | 111,411,200 B | 48,275,456 B | 1.984375 |

Limitations:

- GPU usage was not measured. Findings that mention GPU/rendering are marked as `Hypothesis` unless backed by direct CSS/runtime evidence.
- Network traffic was not measured. Static code search found no frontend `fetch()` usage; installer WebView2 bootstrap network behavior is based on Tauri config.
- Large-data behavior was not measured with seeded databases or large Notes vaults. Those impacts are marked as `Hypothesis`.

## Findings

Findings were deduplicated by trigger and remediation path. Related data-safety items remain separate because `PERF-004` is startup/pre-update backup and `PERF-012` is user-triggered backup/export. Related database items remain separate because `PERF-002` removes high-fanout IPC/query patterns and `PERF-001` removes repeated per-command database open/migration checks.

### PERF-002

- ID: PERF-002
- Severity: P1
- Status: Implemented 2026-05-17 for habit logs/stats IPC fanout. Performance gain remains a `Hypothesis` until measured with renderer/Tauri traces.
- Area: runtime/io
- Original evidence: `apps/desktop/src/modules/home/HomeModuleScreen.tsx:88`, `apps/desktop/src/modules/habits/HabitsModuleScreen.tsx:123`, `apps/desktop/src/modules/habits/HabitsModuleScreen.tsx:126`, `apps/desktop/src/modules/tasks/TasksModuleScreen.tsx:161`, and `apps/desktop/src/modules/basic/BasicModuleScreens.tsx:305` issued `Promise.all(loadedHabits.map(...))` for logs/stats. Backend `crates/lifeos-storage/src/habits.rs:124` listed logs per habit and `:150-158` computed stats by calling `list_habit_logs` again.
- Impact: Habit-heavy screens scale with O(H) or O(2H) IPC calls and repeated full per-habit log reads. This directly affects Home, Habits, Tasks, and Basic dashboard screens.
- Recommendation: Implemented with bulk commands `list_habit_logs_bulk({ habitIds, fromDate, throughDate })` and `get_habit_stats_bulk({ habitIds, throughDate })`. Bulk SQL is date-bounded and returns maps keyed by habit id.
- Expected gain: Hypothesis: O(H) IPC becomes O(1-2) IPC per screen; large habit histories should show materially faster load and lower CPU.
- Verification: Automated repository coverage seeds 100 habits with 365 logs each and verifies bulk stats match individual recalculation. Renderer/Tauri command-count and responsiveness traces are still needed for measured performance gain.
- Risk: Medium. Stats semantics and recurrence edge cases must match existing `recalculate_habit_stats` behavior.

### PERF-001

- ID: PERF-001
- Severity: P1
- Status: Implemented 2026-05-17 with app-managed DB state. Performance gain remains a `Hypothesis` until command timing is measured.
- Area: runtime/io/startup
- Evidence: The previous repeated `LocalDatabase::open(app_data_dir)?` command pattern in `apps/desktop/src-tauri/src/lib.rs` is replaced by `AppDatabase`, a mutex-backed app-managed state created during Tauri setup. Startup opens the resolved runtime database once after the pre-update backup step and before command handling; typed Tauri commands now accept `tauri::State<AppDatabase>` and run repository calls through that state. `crates/lifeos-storage/src/data_safety.rs` also exposes state-backed export, backup, search-index, and integrity variants that accept the already-open `LocalDatabase`. `crates/lifeos-storage/src/sqlite.rs` still owns WAL setup and ordered idempotent migrations.
- Impact: Ordinary Tauri commands no longer pay repeated connection setup, PRAGMA, and migration-check overhead. This should compound with PERF-002 bulk habit reads, but the latency gain is still unmeasured.
- Recommendation: Implemented. Keep the current app-managed DB state; do not replace it with a broad frontend refactor. Next work is measurement: command timing and scenario traces with seeded data.
- Expected gain: Hypothesis: lower command latency, less disk churn, and faster Home/Tasks/Habits/Settings flows, especially on slower disks and larger datasets.
- Verification: Added desktop command-helper coverage proving `AppDatabase` is `Send + Sync`, applies all migrations, supports parallel state-backed task creation without order-dependent assertions, and runs data-safety export/backup/search-index/integrity through state-backed helpers. Full scenario timing with seeded 100, 1,000, and 10,000 record databases remains pending.
- Risk: Medium. Current mitigation is serialized SQLite access through the state wrapper plus existing migration/WAL tests; long data-safety commands intentionally hold DB state while snapshotting.

### PERF-012

- ID: PERF-012
- Severity: P2
- Status: First safety/responsiveness pass implemented 2026-05-17. Responsiveness and IO gains remain a `Hypothesis` until measured on large vaults.
- Area: io/runtime
- Evidence: User-triggered readable export and local backup now accept operation ids, emit progress events, support cancellation through the Tauri command layer, stage artifacts in `.in-progress` directories, and finalize only after validation. Complete manifests include `status: "complete"`, integrity status, relative paths, byte counts, and SHA-256 checksums. Restore/import dry-run validates the manifest snapshot and rejects partial/interrupted artifacts. Local backup validates the copied SQLite snapshot with `PRAGMA integrity_check`. Readable export and search document building use batched habit-log reads instead of repeated per-habit log calls.
- Impact: Large backups/exports now expose observable progress and can be cancelled without creating an accepted partial artifact. Data safety remains prioritized over speed.
- Recommendation: Keep the complete-only manifest/snapshot contract. Next optimization step is measuring large-vault behavior and considering changed-file/incremental snapshots that still preserve complete-only finalization.
- Expected gain: Hypothesis: better perceived responsiveness and lower peak IO contention for large vaults/data exports.
- Verification: Added interruption-style tests that cancel during export/backup, reopen SQLite, run `PRAGMA integrity_check`, and verify partial artifacts are rejected by restore/import dry-run. Added manifest snapshot tests for complete artifacts and rejection of non-complete status. Large Notes vault duration/UI responsiveness measurements are still pending.
- Risk: High. Backup/export changes must not risk data loss, partial backups being treated as valid, or silent integrity failures. Current state-backed backup/export commands intentionally hold the managed SQLite mutex through the operation to preserve a consistent snapshot; this may block other DB commands during very large operations. Reducing that lock time needs a separate snapshot/transaction design before code changes.

### PERF-004

- ID: PERF-004
- Severity: P2
- Status: Implemented 2026-05-17 with a startup-safe critical snapshot plus resumable Notes phase. Large-vault startup gain remains a `Hypothesis` until measured with realistic Notes data.
- Area: startup/io
- Evidence: `apps/desktop/src-tauri/src/lib.rs` now creates pre-update artifacts in `.in-progress` directories. Startup copies and validates the critical SQLite/frontend snapshot before migrations, writes a non-complete manifest while Notes is pending, and resumes/finalizes the Notes phase separately with file/byte progress events and a complete manifest snapshot. Settings reads and displays the latest pre-update backup status.
- Impact: On version changes with existing data, the post-update startup no longer needs to synchronously copy the full Notes vault before opening the app. Partial pre-update artifacts are visibly non-complete and resumable.
- Recommendation: Keep the complete-only manifest contract. Next work is measurement with realistic 10 MB, 1 GB, and 5 GB Notes vaults and manual kill/restart smoke on a packaged build.
- Expected gain: Hypothesis: significantly faster post-update launch for large Notes vaults; no expected gain on normal launches where no pre-update backup is created.
- Verification: Added desktop command-helper coverage for critical SQLite snapshot validation, non-complete `.in-progress` Notes phase, resumable partial Notes copy, complete final manifest snapshot, downgrade direction, and corrupt database rejection. Large-vault timing and packaged interruption smoke remain pending.
- Risk: High. Backup correctness is more important than startup speed; changes must be validated with corruption, interruption, and downgrade scenarios.

### PERF-003

- ID: PERF-003
- Severity: P2
- Status: First backend step implemented 2026-05-17. The frontend still uses the existing polling loop; backend due selection is now date/time-bounded SQL over reminder due indexes. Idle CPU/disk gain remains a `Hypothesis` until measured with large reminder tables.
- Area: runtime/io/background
- Evidence: `apps/desktop/src/App.tsx:50` starts reminder runtime on app load. `apps/desktop/src/reminderRuntime.ts:14` keeps a 60,000 ms default poll interval, `:45` clamps to at least 5,000 ms, and `:75` calls `listDueNotifications`. Backend `apps/desktop/src-tauri/src/lib.rs:668-677` opens the database and calls repository due notifications. `crates/lifeos-storage/src/reminders.rs` now selects only reminders with `due_date < clock.today` or same-day `due_time <= clock.local_time`, split by one-time vs recurring rows, before applying recurrence calculation and delivery-attempt suppression. Migration `0010_reminder_due_query_indexes.sql` adds partial due indexes for one-time and recurring reminders.
- Impact: The first implementation step removes full-table reminder scans from each poll, while preserving current polling cadence and delivery semantics. Large recurring reminder sets can still produce many due candidates until next-due scheduling is implemented.
- Recommendation: Next step remains next-due scheduling: if no reminders exist or the next due reminder is known, reduce timer wakeups while keeping a fallback periodic reconciliation interval for safety.
- Expected gain: Hypothesis: lower idle CPU/disk usage and fewer SQLite reads; biggest gain on large reminder tables or low-power machines. Controlled command-helper metrics for the small existing reminder command test recorded `ReminderRepository::due_notifications` at 0.512/0.503 ms before and 0.632/0.559 ms after across the two due calls; this tiny fixture is an instrumentation record, not evidence of large-table gain.
- Verification: Added repository coverage for due reminders, future reminders, missed reminders, recurring reminders, empty reminder tables, and a regression proving future rows are not decoded by the due query. Added migration coverage for reminder due indexes. Large-table 10-minute idle traces with 0, 1,000, and 10,000 reminders are still pending.
- Risk: Medium. Reminder delivery correctness is user-visible; current tests cover due/future/missed/recurring/empty cases, but next-due scheduling will need its own timer and reconciliation tests.

### PERF-013

- ID: PERF-013
- Severity: P2
- Status: Implemented 2026-05-17 with a rebuildable SQLite FTS cache. Large-index gain remains partially measured until scenario p50/p95 and memory traces are collected.
- Area: io/runtime
- Evidence: `crates/lifeos-storage/src/data_safety.rs` now rebuilds `search/index.sqlite3` with `search_documents` metadata rows and an FTS5 `search_index` table using the trigram tokenizer. Query execution opens the SQLite cache and uses FTS for normal queries, with normalized SQLite columns only for very short query fallback, then keeps deterministic module/title sorting.
- Impact: Search no longer reparses `search/index.json` or lowercases every title/content in app code on each query. The rebuild path removes the legacy JSON cache when present.
- Recommendation: Keep SQLite FTS as the default search cache. Continue collecting p50/p95 latency and memory traces for realistic 10k/100k document datasets.
- Expected gain: Large-index query latency and transient allocation reduction are now expected from avoiding per-query JSON parse/full app-process scans, but remain a scenario-level measurement item.
- Verification: Added correctness coverage for SQLite FTS cache shape, structured/Markdown/frontend result coverage, case-insensitive queries, and deterministic ordering. Added and ran an ignored local measurement test for synthetic frontend documents: 10,000 docs indexed as 10,001 documents with rebuild 684.475 ms and tail-query search 6.372 ms; 100,000 docs indexed as 100,001 documents with rebuild 8772.575 ms and tail-query search 13.711 ms. Scenario p50/p95 and memory traces remain pending.
- Risk: Medium. FTS tokenization must continue to preserve predictable coverage for punctuation, mixed case, and short queries.

### PERF-005

- ID: PERF-005
- Severity: P2
- Status: Implemented 2026-05-17. Startup/memory gain remains a `Hypothesis` until WebView traces are collected.
- Area: bundle/startup
- Evidence: `apps/desktop/src/modules/moduleScreens.tsx` now keeps only `HomeModuleScreen` as an eager screen import. Non-default route screens use `React.lazy` dynamic imports: Basic module screens share `BasicModuleScreens-C_ivQMuX.js`; Settings, Notes, Quick Notes, Tasks, Habits, Calendar, and Focus emit separate chunks. Fresh build output includes main `dist/assets/index-Dv95zRTW.js` 263,299 B raw / 82,157 B gzip / 70,559 B brotli, plus route chunks such as `BasicModuleScreens-C_ivQMuX.js` 72,000 B raw / 19,676 B gzip, `TasksModuleScreen-DAz5Xq4D.js` 32,702 B raw / 8,710 B gzip, `CalendarModuleScreen-uXsfBcRj.js` 21,207 B raw / 6,404 B gzip, `HabitsModuleScreen-DdMUOSpI.js` 17,783 B raw / 6,224 B gzip, `FocusModuleScreen-CSxpH-TO.js` 14,138 B raw / 4,516 B gzip, `NotesModuleScreen-D_AvnM9M.js` 3,230 B raw / 1,540 B gzip, `QuickNotesModuleScreen-CH65Iqfv.js` 3,311 B raw / 1,433 B gzip, and `SettingsModuleScreen-BiAX8Mxt.js` 2,703 B raw / 1,189 B gzip.
- Impact: The initial renderer no longer has to execute all module screen implementations before Home is visible. The main JS gzip size decreased from the previous 124,389 B baseline to 82,157 B, while non-default routes pay their own first-navigation chunk load.
- Recommendation: Implemented. Keep Home eager while it remains the default screen. Keep Basic, Settings/Data, Notes, Quick Notes, and other non-default screens behind route/module-level dynamic imports. Continue to measure first navigation latency and renderer memory with WebView traces before claiming runtime gain.
- Expected gain: Hypothesis: lower initial JS parse/compile time and a smaller first renderer memory footprint. First navigation into a lazy route may show the quiet module loading state while the chunk loads.
- Verification: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed in `apps/desktop`. Added tests for eager Home, lazy non-default fallback, quiet load error state, and absence of non-default static screen imports. Fresh preview smoke showed Home loading with only the main script and no modulepreload links, then navigating to Notes and Quick Notes resolved to their real screens with the loading state gone.
- Risk: Medium. Current mitigation is quiet loading/error UI and tests that preserve global rail route anchors, focus labels, and module-specific screen coverage. WebView startup sampling and first-navigation trace evidence remain pending.

### PERF-006

- ID: PERF-006
- Severity: P2
- Status: Implemented 2026-05-17. Rendering gain remains a `Hypothesis` until measured in renderer traces.
- Area: bundle/rendering
- Evidence: Current Notes runtime uses gateway/browser-preview state (`apps/desktop/src/modules/notes/NotesModuleScreen.tsx:112-116`). Production CSS now keeps the Notes gateway styles and removes the old internal workspace/parity block for vault tree, tabs, editor/preview, metadata panes, graph/status strip, CodeMirror mount, and related responsive remnants. Notes screen tests still assert old workspace classes are absent from rendered markup, and `apps/desktop/src/modules/notes/NotesModuleScreen.test.tsx` now also asserts those obsolete selectors are absent from production `styles.css`. Dist CSS changed from 122,287 B raw / 19,370 B gzip / 16,546 B brotli to 103,862 B raw / 16,864 B gzip / 14,452 B brotli.
- Impact: Unused CSS increases CSS parse/match work and bundle size. The measured raw source reduction opportunity is material relative to the 122 KB CSS asset, although gzip gain will be smaller.
- Recommendation: Implemented by removing obsolete Notes workspace/parity CSS from the production import path while preserving gateway styles and unrelated shared/module selectors.
- Expected gain: Measured CSS asset reduction: 18,425 B raw, 2,506 B gzip, and 2,094 B brotli. Hypothesis: modest CSS parse/style recalculation improvement.
- Verification: `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` passed in `apps/desktop`; fresh build CSS size was recorded raw/gzip/brotli.
- Risk: Low to medium. Risk is accidental removal of shared selectors still used by tests or future hidden routes.

### PERF-008

- ID: PERF-008
- Severity: P2
- Status: Implemented 2026-05-17. Runtime gain remains a `Hypothesis` until long idle/GPU traces are collected on a packaged build.
- Area: memory/rendering/runtime
- Evidence: Quick Notes records are now persisted by the Rust/SQLite path through migration `0011_quick_notes`, `QuickNotesRepository`, typed Tauri commands, and frontend `dataCore` adapters. The production mini-window is implemented in `apps/desktop/src-tauri/src/quick_note_mini_window.rs` as a single native Windows always-on-top read-only text window. The React module keeps only a browser/Vite preview fallback when native commands are unavailable, saves on explicit/focus/selection boundaries instead of every keystroke, and pushes selected text only when the payload changes.
- Impact: Quick Notes no longer depends on an in-memory React sample state for durable notes, and the optimized mini-window no longer requires a second WebView renderer. The implementation now has the right architecture for measuring the intended second-monitor gaming/reference behavior.
- Recommendation: Implemented. Keep the native mini-window plain text and read-only for MVP. Do not add React/WebView, timers, animations, polling, Markdown rendering, or frequent autosave to the production mini-window path.
- Expected gain: Hypothesis: lower incremental memory/paint cost versus a second WebView-based approach. The app now exposes runtime metrics for process count, working set, CPU seconds, and sampled idle CPU percentage, but packaged 10-minute idle/GPU traces are still pending.
- Verification: Added tests for Quick Notes SQLite create/update/list, Tauri command helpers, mini-window payload dedupe, secondary-monitor positioning/clamping, runtime metrics availability, frontend command adapters, browser preview fallback, and data-safety export/search coverage. Current gates passed: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, and `cargo test --workspace`.
- Risk: Medium. Native Windows lifecycle and focus behavior are covered structurally, but real packaged idle behavior still needs process/GPU traces with main window open, mini-window open, and mini-window idle for 10 minutes.

### PERF-014

- ID: PERF-014
- Severity: P3
- Status: First ownership split implemented 2026-05-17 for the frontend data core. Runtime impact is not claimed.
- Area: build/runtime
- Evidence: Largest source files by measured line count/size: `apps/desktop/src/styles.css` 6,262 lines / 143,126 B; `apps/desktop/src/modules/basic/BasicModuleScreens.tsx` 3,070 lines / 123,216 B; `apps/desktop/src/dataCore.ts` 2,836 lines / 99,279 B; `crates/lifeos-storage/src/data_safety.rs` 1,878 lines / 67,981 B; `apps/desktop/src-tauri/src/lib.rs` 1,459 lines / 52,734 B. Baseline `npm run typecheck` took 19.037 s and `npm run build` took 22.885 s.
- Impact: Monolithic files increase incremental build/typecheck invalidation and make local reasoning slower. Runtime impact is not directly measured.
- Recommendation: Split by stable ownership boundaries: frontend module styles, dataCore command groups, Tauri command modules, and data safety submodules. Do this only with regression tests, not as a broad cosmetic refactor.
- Expected gain: Hypothesis: faster incremental iteration and lower change risk; full clean build improvement may be small.
- Verification: First split moved the Settings/Data safety command group from `apps/desktop/src/dataCore.ts` into `apps/desktop/src/dataCore/dataSafety.ts`, and moved the shared Tauri invoke/dev-metrics boundary into `apps/desktop/src/dataCore/invoke.ts` plus `invokeTypes.ts`. The public `dataCore.ts` import surface remains stable. Local before/after measurements were warm full commands, not true incremental rebuilds because the desktop package has no incremental typecheck/build script. Before split: local import-cycle scan found `devInstrumentation.ts -> dataCore.ts -> devInstrumentation.ts`; `npm run typecheck` passed in 12.753 s; `npm run build` passed in 23.488 s. After split: import-cycle scan reported `CYCLES=0`; `npm test -- src/dataCore.test.ts` passed 28 tests; `npm test` passed 180 tests; `npm run lint` passed; `npm run typecheck` passed in 10.202 s; `npm run build` passed in 18.987 s.
- Risk: Medium. Mechanical splits can introduce import cycles or missed exports.

### PERF-009

- ID: PERF-009
- Severity: P3
- Status: Desktop-only crate-type change applied 2026-05-17 and verified by `npm run bundle`; clean target-size comparison remains pending.
- Area: build/disk
- Evidence: `apps/desktop/src-tauri/Cargo.toml` now sets `crate-type = ["rlib"]` with a comment that `staticlib`/`cdylib` should be restored only for a future mobile/library target. A fresh `npm run bundle` completed successfully and produced `target/release/lifeos-v3.exe` 13,197,824 B plus NSIS installer 3,302,354 B.
- Impact: The active desktop build no longer asks Cargo to produce extra library crate types for the app library. This should reduce clean target artifact churn for desktop-only builds, but an uncleared `target/release` still contains stale `.lib`/`.dll` artifacts from earlier builds, so current directory totals cannot prove the disk gain.
- Recommendation: Keep `rlib` for the current desktop target unless a future mobile/library workflow explicitly needs additional crate types. Verify disk/build gain with a clean `target` or isolated build directory before claiming measured savings.
- Expected gain: Hypothesis: smaller clean release target directory and less link/artifact churn; installer size is not expected to improve materially.
- Verification: `cargo test --workspace`, `cargo clippy --workspace --all-targets -- -D warnings`, and `npm run bundle` passed after the change. Pending: clean target matrix comparing current `rlib` against the old `staticlib`/`cdylib`/`rlib` configuration.
- Risk: Medium. Tauri/mobile/library workflows may depend on non-`rlib` outputs if they are added later; no such current desktop requirement is documented.

### PERF-010

- ID: PERF-010
- Severity: P3
- Status: `Hypothesis`. Current binary sizes are measured; benefit of release profile changes is unproven.
- Area: bundle/build
- Evidence: Release exe is 12,792,320 B and installer is 3,200,590 B. Root `Cargo.toml` does not define explicit release-profile size options such as `strip`, `lto`, `codegen-units`, or `panic`.
- Impact: Binary size may be larger than necessary. No runtime memory/startup regression from current profile was measured.
- Recommendation: Benchmark release profile variants before adopting: `strip = "symbols"`, `lto = "thin"`, `codegen-units = 1`, and `panic = "abort"` as separate measured changes.
- Expected gain: Hypothesis: smaller exe/installer and possibly slightly lower load-time IO; build time may increase.
- Verification: Compare `cargo build --release --workspace`, `npm run bundle`, exe size, installer size, startup sample, and crash/debug symbol workflow.
- Risk: Medium. LTO can slow builds; stripping symbols can make crash diagnosis harder; `panic = "abort"` changes unwind behavior.

### PERF-015

- ID: PERF-015
- Severity: P3
- Status: Confirmed dependency graph evidence; runtime gain is a `Hypothesis` and likely limited.
- Area: dependencies/build
- Evidence: `cargo tree --workspace --duplicates` reported multiple duplicated dependency families, including `bitflags` 1.x/2.x, `hashbrown` 0.12/0.15/0.17, `indexmap` 1.x/2.x, `thiserror` 1.x/2.x, `toml` 0.9/1.1, `windows-sys` 0.59/0.61, and `winreg` 0.10/0.55. `cargo audit` still passed.
- Impact: Duplicate crate versions increase compile graph size and build/cache footprint. Runtime impact was not measured and may be negligible because many duplicates are build-time/transitive Tauri dependencies.
- Recommendation: Audit duplicates by owner. Update direct dependencies where safe, but avoid forcing dependency overrides for Tauri-owned transitive crates unless there is a clear build/security gain.
- Expected gain: Hypothesis: smaller compile graph and faster clean builds; likely limited runtime gain.
- Verification: Compare `cargo tree --duplicates`, `cargo build --release --workspace`, `cargo test --workspace`, and final binary/installer sizes after dependency updates.
- Risk: Medium. Dependency unification can create semver/API incompatibilities or Tauri plugin regressions.

### PERF-007

- ID: PERF-007
- Severity: P3
- Status: Implemented 2026-05-17; CodeMirror is removed from the active desktop package.
- Area: dependencies/bundle
- Evidence: `apps/desktop/package.json` no longer lists `codemirror`, `@codemirror/lang-markdown`, or `@codemirror/theme-one-dark`. `apps/desktop/src/modules/notes/CodeMirrorMarkdownEditor.tsx` is absent. `npm ls codemirror @codemirror/lang-markdown @codemirror/theme-one-dark` returns an empty tree, while Notes gateway tests still assert obsolete CodeMirror/workspace selectors are absent from rendered markup and production CSS.
- Impact: The active install/audit surface no longer includes the unused editor packages. Runtime JS gain remains likely zero because the orphan editor was not imported before removal.
- Recommendation: Keep the internal LifeOS-native Notes editor as a deferred future feature only. If promoted later, reintroduce editor dependencies behind an explicit feature branch/package rather than silently re-adding them to the active MVP package.
- Expected gain: Measured dependency footprint opportunity from the audit was about 3.0 MB in `node_modules`; the active package now realizes that cleanup. Runtime bundle gain remains likely zero.
- Verification: `npm ls codemirror @codemirror/lang-markdown @codemirror/theme-one-dark`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed after the cleanup.
- Risk: Low. Risk rises only if the LifeOS-native internal Notes editor is promoted soon without deliberately restoring its dependencies and tests.

### PERF-011

- ID: PERF-011
- Severity: P3
- Status: Product decision recorded 2026-05-17; keep `downloadBootstrapper` unless zero-network install becomes an explicit release requirement. This is a distribution-policy finding, not a confirmed normal-runtime performance problem.
- Area: network/build
- Evidence: `apps/desktop/src-tauri/tauri.conf.json:44-46` configures WebView2 install mode as `"downloadBootstrapper"`. Static frontend search found no runtime `fetch()` usage in `apps/desktop/src`.
- Impact: Runtime network cost appears absent from measured app code, but first install on a machine without a suitable WebView2 runtime can require network access. This is an installation performance/reliability tradeoff, not a normal runtime issue.
- Recommendation: Keep bootstrapper for the private dogfood installer because current docs do not require zero-network install. Switch to an offline/fixed WebView2 runtime only if zero-network install becomes an explicit release requirement.
- Expected gain: Offline mode would remove install-time network dependency. Tradeoff: installer size would increase significantly.
- Verification: Install on a clean Windows VM with WebView2 absent and network disabled; compare installer success, time, and installer size.
- Risk: Low to medium. Offline runtime packaging increases distribution size and may add update maintenance.

## Optimization Roadmap

### Quick Wins

These are low-to-medium risk changes with clear evidence and constrained blast radius.

1. Add instrumentation first:
   - Measure Tauri command latency, DB open/migration time, repository query time, renderer module first render, reminder polling, and backup/export duration.
   - Output metrics to dev-only logs or a temporary trace file so before/after comparisons are repeatable.
   - Related findings: PERF-001, PERF-002, PERF-003, PERF-004, PERF-012, PERF-013.
2. Batch habit/log/stat reads:
   - Add bulk habit log/stat commands and replace `Promise.all(loadedHabits.map(...))` call sites.
   - Related finding: PERF-002.
3. Remove obsolete production CSS:
   - Remove or move old Notes workspace/parity styles outside the production import path.
   - Keep tests asserting old Notes workspace classes are absent.
   - Related finding: PERF-006.
4. Query due reminders directly:
   - Replace full reminder table scan with SQL filtering for due notifications.
   - Keep current polling loop initially, then optimize scheduling after correctness is proven.
   - Related finding: PERF-003.
5. CodeMirror MVP cleanup:
   - Implemented 2026-05-17: internal Notes editing remains deferred, and CodeMirror dependencies/orphan runtime code are removed from the active desktop package.
   - Related finding: PERF-007.

### Medium Effort

These need coordinated frontend/backend work or scenario-level verification.

1. Introduce app-scoped database state:
   - Implemented 2026-05-17: startup opens one app-managed `AppDatabase`, runs WAL setup/migrations there, and Tauri commands reuse `tauri::State<AppDatabase>`.
   - Related finding: PERF-001.
2. Lazy-load non-default module screens:
   - Implemented 2026-05-17: Home stays eager and non-default module screens use route/module-level dynamic imports.
   - Build now emits separate chunks for Basic, Settings, Notes, Quick Notes, Tasks, Habits, Calendar, and Focus.
   - Related finding: PERF-005.
3. Improve search index execution:
   - Implemented 2026-05-17 with a rebuildable SQLite FTS cache at `search/index.sqlite3`; continue scenario-level latency/memory measurements.
   - Related finding: PERF-013.
4. Split high-churn monolithic files by stable ownership:
   - Prioritize `dataCore.ts`, `BasicModuleScreens.tsx`, `styles.css`, Tauri command modules, and `data_safety.rs`.
   - Use regression tests and avoid broad cosmetic rewrites.
   - Related finding: PERF-014.
5. Audit build dependency and artifact size:
   - Desktop crate type is now reduced to `rlib` and verified by `npm run bundle`; clean target-size comparison remains pending because old release artifacts can stay in an uncleared target directory.
   - Still evaluate release profile variants and duplicate Rust dependencies with measured build matrices.
   - Related findings: PERF-009, PERF-010, PERF-015.

### High Impact Refactors

These can produce the largest user-facing gains, but they are high risk because they touch data safety or platform behavior.

1. Make backup/export incremental, cancellable, and observable:
   - Add progress reporting, cancellation, manifest-based snapshots, final integrity validation, and partial-backup rejection.
   - Related finding: PERF-012.
2. Make pre-update backup startup-safe for large Notes vaults:
   - Implemented 2026-05-17: keep a blocking validated critical DB/frontend snapshot and move Notes copy into a manifest-based resumable phase with progress/status and complete-only finalization.
   - Related finding: PERF-004.
3. Implement the native Quick Notes mini-window:
   - Implemented 2026-05-17 with Rust/SQLite persistence, one native always-on-top read-only text window, changed-payload-only text pushes, secondary-monitor positioning, shutdown cleanup, and runtime metrics.
   - Related finding: PERF-008.
4. WebView2 distribution policy:
   - Decided 2026-05-17: keep `downloadBootstrapper` for private dogfood builds because current docs do not require zero-network install.
   - Only switch away from `downloadBootstrapper` if zero-network install becomes an explicit release requirement.
   - Related finding: PERF-011.

## Verification Plan

Run commands from the repository root unless a command explicitly changes directory.

### Correctness Gate

Required for every optimization branch:

```powershell
Push-Location apps/desktop
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
Pop-Location

cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo audit --deny warnings
```

Metrics to record:

- Pass/fail for each command.
- Duration for `npm run build`, `cargo clippy`, and `cargo test`.
- Any new warnings, skipped tests, or changed snapshots.

### Bundle And Dependency Metrics

Use after any frontend, dependency, or release-profile change:

```powershell
Push-Location apps/desktop
npm run build
node -e "const fs=require('fs'),z=require('zlib'),p='dist/assets'; for (const f of fs.readdirSync(p)) { const b=fs.readFileSync(p+'/'+f); console.log([f,b.length,z.gzipSync(b).length,z.brotliCompressSync(b).length].join('\t')) }"
npm ls codemirror @codemirror/lang-markdown @codemirror/theme-one-dark
Pop-Location

(Get-ChildItem -Recurse apps/desktop/node_modules -File | Measure-Object Length -Sum).Sum
cargo tree --workspace --duplicates
cargo build --release --workspace
Get-Item target/release/lifeos-v3.exe | Select-Object FullName,Length
```

Metrics to record:

- JS and CSS raw/gzip/brotli bytes for every asset in `apps/desktop/dist/assets`.
- Count of generated JS chunks and whether the default route remains eager.
- `node_modules` total bytes and CodeMirror package presence.
- `cargo tree --duplicates` count by duplicated dependency family.
- Release exe size, installer size after `npm run bundle`, and release build duration.

### Startup And Renderer Metrics

Use after DB state, code splitting, release-profile, pre-update backup, or Quick Notes window changes:

```powershell
Measure-Command { cargo build --release --workspace }

$exe = "target\release\lifeos-v3.exe"
1..5 | ForEach-Object {
  $p = Start-Process $exe -PassThru
  $idle = $p.WaitForInputIdle(10000)
  Start-Sleep -Seconds 5
  $root = Get-Process -Id $p.Id
  $children = Get-CimInstance Win32_Process -Filter "ParentProcessId=$($p.Id)" |
    ForEach-Object { Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }
  [PSCustomObject]@{
    Run = $_
    WaitForInputIdle = $idle
    ProcessCount = 1 + @($children).Count
    WorkingSetBytes = ($root.WorkingSet64 + (@($children) | Measure-Object WorkingSet64 -Sum).Sum)
    PrivateBytes = ($root.PrivateMemorySize64 + (@($children) | Measure-Object PrivateMemorySize64 -Sum).Sum)
    CpuSeconds = ($root.CPU + (@($children) | Measure-Object CPU -Sum).Sum)
  }
  Stop-Process -Id $p.Id -Force
}
```

Metrics to record:

- Build duration.
- WaitForInputIdle result/time, process count, working set, private bytes, and CPU seconds after 5 seconds.
- First render time for Home and first navigation time for Basic, Habits, Tasks, Settings/Data, Notes, and Quick Notes.
- Renderer trace evidence for JS parse/compile and lazy-loaded chunk fetch/execute time.

### Database And IPC Metrics

Use after PERF-001 or PERF-002 work. Add temporary dev instrumentation if these values are not currently emitted.

Metrics to record:

- Tauri command count per scenario: Home load, Habits load, Tasks load, Basic dashboard load.
- SQLite query count per scenario.
- Time spent in `LocalDatabase::open`, migration checks, repository calls, and serialization.
- p50/p95 command latency for seeded datasets with 100, 1,000, and 10,000 records.
- Habit stress case: 100 habits with 365 logs each; compare Home/Habits/Tasks load time before/after.

### Reminder Idle Metrics

Use after PERF-003 work:

```powershell
$exe = "target\release\lifeos-v3.exe"
$p = Start-Process $exe -PassThru
Start-Sleep -Seconds 600
$root = Get-Process -Id $p.Id
[PSCustomObject]@{
  WorkingSetBytes = $root.WorkingSet64
  PrivateBytes = $root.PrivateMemorySize64
  CpuSeconds = $root.CPU
}
Stop-Process -Id $p.Id -Force
```

Metrics to record:

- Run the same 10-minute idle trace with reminders disabled, 0 reminders, 1,000 reminders, and 10,000 reminders.
- Reminder command count, DB read count, process CPU seconds, disk reads, timer wakeups, and delivery correctness for due/missed/recurring reminders.

### Backup, Export, And Search Metrics

Use after PERF-004, PERF-012, or PERF-013 work:

Metrics to record:

- Seed Notes vault sizes: 10 MB, 1 GB, and 5 GB.
- Seed search index sizes: 10,000 and 100,000 documents.
- First launch after version change: wall time, files copied, bytes copied, backup manifest status, and restored backup integrity.
- Backup/export: wall time, progress event cadence, cancellation latency, final integrity report, and whether partial backups are rejected.
- Search: p50/p95 query latency, peak working set/private bytes, result count, and ranking correctness for representative queries.

### GPU And Native Window Metrics

Use after Quick Notes mini-window or rendering changes:

- Use the Quick Notes runtime metrics command to record process count, working
  set, CPU seconds, and sampled idle CPU percentage before and after opening
  the mini-window.
- Capture an ETW trace with Windows Performance Recorder/GPUView or an equivalent tool.
- Measure Home timeline animation, module navigation, Notes/Quick Notes surfaces, and mini-window idle behavior.
- Record GPU engine activity, CPU frame time, process count, working set, private bytes, and 10-minute idle CPU seconds.
- Treat GPU optimization claims as unverified until this trace exists.

### Safety Scenarios

Required for database connection reuse and data-safety changes:

- Kill the app during backup/export, restart, and verify the database opens cleanly.
- Kill the app during pre-update backup, restart, and verify the app does not accept a partial backup as complete.
- Run `PRAGMA integrity_check` against the database after interruption tests.
- Verify backup/export manifests include expected file counts, byte counts, and checksums where available.
- Repeat with normal user data, large Notes vaults, and corrupted/interrupted copies.

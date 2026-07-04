# LifeOS v4 Future Features

Created: 2026-05-05
Status: live backlog for deferred ideas

This file stores ideas that are useful but not part of the first personal MVP unless a later decision promotes them.

## Platforms

- iOS app.
- Android app.
- Mobile pairing flow.
- Shared data core usable by desktop and mobile clients.
- First mobile version should reuse the desktop data contracts and future sync boundary rather than introduce a separate mobile-only model.

## Distribution

- Offline/fixed WebView2 runtime packaging for Windows installers, only if zero-network install becomes an explicit release requirement. Current private dogfood builds keep Tauri `downloadBootstrapper` to preserve a small installer. If promoted, verify on a clean Windows VM with WebView2 absent and network disabled, and compare installer size/time against the bootstrapper build.
- Windows auto-update through Tauri signed updater. This is deferred for the
  current private dogfood setup but must be implemented later. The selected
  future hosting path is Cloudflare R2 with the custom domain
  `updates.lifeos.app`, static `latest.json`, signed NSIS installer artifacts,
  and matching `.sig` files. The updater UX should check on startup, expose a
  manual Settings check, and show `Вышло новое обновление` with
  `Установить сейчас` / `Позже`. The current scaffold stays disabled by
  default behind `VITE_LIFEOS_UPDATER_ENABLED=1`, while updater artifact
  generation/publishing stays behind `LIFEOS_UPDATE_RELEASE_ENABLED=true`.

## First Mobile Scope Candidate

Stage 16 mobile readiness audit keeps mobile implementation deferred. The first smartphone app should be planned only after the desktop modules are brought to an ideal state.

Owner decision on 2026-05-18: mobile work stays postponed until the desktop modules are brought to an ideal state. Treat the scope below as a future planning candidate, not an active build target.

Owner decision on 2026-05-28: the first mobile version should include every module that exists in the app when mobile development starts. Disabled/deferred modules stay out unless they are promoted into the app before mobile work begins.

First mobile scope:

- All modules that are visible/active in LifeOS at the start of mobile development.
- Current reference set if mobile started from today's app: Home, Tasks, Habits, Calendar, Projects, Contacts, Notes, Quick Notes, Diary, Physical Health, Finance, Focus, Trading, and Settings.
- Exact read/write depth and mobile workflow shape are still future planning questions for each included module.

Still needs mobile planning:

- Which module actions are read-only, quick-write, or full edit in the first mobile version.
- How Notes, Obsidian/Markdown files, attachments, and media behave on mobile.
- Which Settings controls are required on mobile versus desktop-only.

Mobile readiness preconditions:

- Reuse Rust/domain data contracts and stable record ids; do not introduce a mobile-only schema.
- Promote any first-mobile module to canonical storage before mobile writes to it.
- Replace desktop-only notification channel assumptions with a platform-neutral delivery contract.
- Add multi-device sync metadata such as device/client identity, stable operation ids, per-record revision or equivalent conflict base, tombstone rules, and conflict handling.
- Treat canonical module ids, visibility, and capability metadata as cross-client contracts. Mobile deep links should map to canonical module ids; mobile clients do not need to reuse desktop hash-route slugs, desktop icon components, or shell routing directly.
- Settle local time, time zone, and device clock behavior before mobile reminders/calendar writes.

## Localization

- English interface language pack after the Russian-first MVP is stable.
- Language switcher in Settings.
- Translation workflow for module names, task states, calendar labels, notes UI, finance labels, and onboarding copy.

## Themes

- Dark workspace as a selectable app-wide theme after the light-first baseline is stable.
- Theme switcher in Settings.
- Per-theme visual QA so modules never mix dark and light treatments inside one active UI state.

## Sync And Cloud

- Cross-device sync.
- Provider-adapter architecture for different file storage backends, built on the provider-neutral sync/storage boundary rather than inside the core data model.
- Multi-device change metadata for safe mobile writes: device id, global operation id, revision/conflict base, tombstone retention, and clock-skew handling.
- Google Drive integration as a future adapter.
- Yandex Disk / Dropbox / OneDrive / other cloud-folder compatibility as future adapters.
- Google Drive BYOC credentials flow.
- Conflict detection and manual conflict resolution.
- Device pairing with QR/token flow.
- Sync health/status dashboard.
- Provider adapter test harness for auth state, capabilities, remote root handling, and change-log replay.
- Restore/import preserve-both/remap collision modes, cross-version restore migration policy beyond artifact version `1`, and encrypted/passphrase-protected restore artifacts.
- Shared cross-module attachment/media store for modules beyond Notes and the current Diary MVP behavior, including folder layout, file naming, retention, export/import conflict rules, and future sync behavior.

## Security

- Hardened encrypted vault.
- PIN/app lock.
- Module-level lock for diary or a future promoted Psychological Health module.
- Strong recovery flow.
- Better secret management for cloud credentials.
- Encrypted attachments.

## Modules Not In First Version

- Psychological Health module, unless explicitly promoted again.
- Food / nutrition module.
- Recipes.
- Shopping lists.
- Meal planning.
- Vibecoding / development journal module.
- Standalone Reminders module that promotes reminder records already used by source modules into a dedicated management surface for creating independent reminders and editing/deleting any reminder, including linked reminders.
- Eisenhower matrix.
- Countdown utilities.
- Desktop widgets.

## Advanced Knowledge Features

- Advanced Obsidian import beyond the MVP scope that will be decided for Markdown/folders/attachments/tags/links/properties.
- LifeOS-native internal Notes editor/workspace fallback, including CodeMirror-style Markdown editing, file tree, tabs, and metadata/reference panes, only if explicitly promoted after the Obsidian Companion Gateway direction.
- LifeOS bridge plugin for Obsidian if deeper bidirectional state is needed after Companion Mode.
- Native Windows embedding of the Obsidian desktop window inside LifeOS only if explicitly promoted and proven stable; it is not the MVP path.
- Advanced wikilink maintenance, including automatic rename updates.
- Advanced backlinks analytics beyond the basic reference panel.
- Advanced graph analytics beyond the basic graph/reference panel.
- Templates.
- Frontmatter tags and advanced note properties.
- Plugin system.
- OCR.
- Semantic search.
- AI-assisted knowledge retrieval.
- Diary templates.
- Diary privacy/lock behavior beyond the general future module-lock direction.
- Diary streaks, heatmaps, or analytics beyond the current month grid with rating.
- Formal Diary media rules beyond the current no-extra-rules MVP behavior: durable limits, export/import conflict behavior, and cross-module media strategy.

## Advanced Planning

- Home block for today's tasks without time.
- Home suggestions for what to do in free windows.
- Home evening review or daily progress summary if promoted later.
- Advanced task status workflow beyond the current `Не начато`, `В процессе`, and `Ожидает` statuses.
- Task tags and advanced labels.
- Task Timeline view.
- Task duration/estimate field.
- Multi-channel reminders: desktop OS notifications, mobile push, Telegram, and other delivery channels.
- Reminder snooze.
- Reminder attachments to diary, notes, finance, and other non-planning modules.
- In-app-only reminder mode if Windows notifications prove insufficient.
- External holiday/calendar import.
- Calendar drag-and-drop.
- Calendar event resize.
- External calendar import/export.
- ICS export.
- Smart filters.
- Command palette.
- Hotkeys.
- Project links to notes, calendar events, focus sessions, files, and tasks.
- Project progress or health metrics.

## Advanced Quick Notes

- Multiple simultaneous Quick Notes mini-windows.
- Global hotkey for opening or switching Quick Notes.
- Tray quick-open action for Quick Notes.
- Markdown preview, tags, backlinks, graph, attachments, or live indexing for Quick Notes.
- Game overlay / exclusive-fullscreen overlay behavior.

## Advanced Habits

- Habit duration type.
- Habit timer type.
- Habit checklist type.
- Habit links to projects or task lists.
- Habit links to Physical Health and a future promoted Psychological Health module.
- Habit categories and subcategories beyond the first simple grouping model.
- Custom units for quantity habits, such as liters, pages, kilometers, minutes, or user-defined units.

## Advanced Focus

- Advanced post-focus workflows beyond the MVP result note.
- Automatic diary writeback after focus.
- Automatic task update after focus.
- Planned focus sessions on Home or Calendar.
- More focus timer modes beyond simple flexible timer and Pomodoro.
- Focus statistics beyond total minutes, session count, completed count, and the current seven-day minutes chart, such as average session length, task distribution, or heatmaps.

## Advanced Finance

- Accounts setup.
- Custom account icons.
- Broader account currency selection beyond `RUB` and `USDT`.
- Budgets.
- Advanced transaction categories and category analytics.
- Recurring payments.
- Cash/card account types and richer account metadata.
- Links from finance transactions to diary, projects, notes, or other records.
- Exchange rates.
- CSV import.
- Multi-currency analytics.

## Advanced Trading

- Exchange import.
- Automatic P/L.
- Partial closes.
- Risk/RR metrics.
- Chart screenshots.
- Versioned trading rules.
- Watchlists.
- Structured risk-rule records beyond the current editable rules note.
- Links from trading records to Finance transactions.
- Trading stats beyond the current journal rows.

## Advanced Health

- Visual body map.
- Lab result recognition.
- Doctor/contact directory.
- Deep CBT workflow.
- Mood tracker.
- Trigger journal.
- Mental health correlations.
- Physical metrics such as sleep, water, steps, workouts, weight, pain, or medication.
- Links from health records to habits, diary, reminders, and other modules.

## Productization

- Separate public/user-facing application based on validated LifeOS v4 workflows, architecture patterns, and design decisions after the private owner-use product becomes ideal for daily use.
- Dedicated public-product discovery, positioning, onboarding, pricing, privacy model, and support model instead of assuming the private LifeOS v4 app can be shipped directly to users.
- Public-user onboarding.
- Account system.
- Product analytics only if privacy model is explicitly redesigned.
- Multi-user or collaboration features.

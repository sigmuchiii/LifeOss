# LifeOS v4 Decisions Log

Created: 2026-05-06
Status: confirmed decisions and interpreted owner answers

This file stores confirmed product decisions so `open-questions.md` can stay focused on unresolved questions only.

Read this file chronologically. Later dated sections supersede earlier ones when product direction changes; for current scope, start with `spec-draft.md`, `agent-handoff.md`, and the affected module spec.

## 2026-05-31: Home Boundary Card Hover Reveal

- Home boundary cards `Подъем` and `Сон` are real visible timeline cards, not passive background markers.
- If a schedule card overlaps a boundary card, hovering the visible part of the boundary card must raise it above the schedule cards so the user can inspect `Подъем` or `Сон`.
- Boundary cards must also be keyboard-focusable enough to reveal the same raised state without a mouse.

## 2026-05-31: Home Overlapping Schedule Cards

- Home schedule items that collide visually in the timeline should stack on top of each other instead of splitting into narrow side-by-side columns.
- Stacked cards keep their source time and use a small diagonal offset so more than one card remains discoverable.
- Hovering or keyboard-focusing a stacked card raises that real card above the rest of the group so its title, metadata, and action can be inspected or used.
- This is a real-card overlap treatment, not decorative duplicate cards.

## 2026-05-31: Habits Detail Editing Section

- Selected habit details use a dedicated `Редактирование привычки` section for changing the habit title, optional time, and icon.
- Habit title editing is required in the detail panel. The header can still show the current habit name, but the editable title field lives in the edit section.
- Time and icon are no longer separate top-level detail controls. They belong inside the edit section so the main detail panel stays focused on stats, monthly registration, and notes.
- Changes in the edit section are draft edits until the user presses `Сохранить привычку`. Icon selection in the detail panel must not immediately write to the habit record.

## 2026-05-31: Habits Monthly Registration Navigation

- The left/right arrow controls in a selected habit's `Ежемесячная регистрация` card are working month navigation buttons, not decorative icons.
- Pressing the left arrow shows the previous month; pressing the right arrow shows the next month.
- Navigation keeps the same selected day number when possible and clamps to the target month's last day when needed, for example May 31 to June 30.

## 2026-05-31: Home Calendar Event Completion Display

- Calendar events shown on Home must not look completed just because they are scheduled for today.
- In the current MVP, Calendar events still do not have a stored completion state. Home may show the same right-side status circle used by the reference card style, but for Calendar events and standalone reminders that circle is static and empty, not a checked completion mark.
- User-completed behavior remains manual for sources that actually support completion on Home: Tasks and Habits. If Calendar event completion is promoted later, it needs an explicit source completion contract rather than an automatic visual check.

## 2026-05-30: Google Drive Connected Status And Restore Boundary

- Settings > `Синхронизация` renders the Google Drive `ready` state as `Подключено`, not `Готово`. This state means the Google account, Drive folder, refresh token, and managed encryption key setup are available; it does not mean old data has been restored into the local install.
- Recovery from an existing Google Drive backup remains an explicit Settings > `Данные` flow: refresh remote backups, download/check a complete `.lifeosbackup`, review the restore/import dry-run, then apply restore/import. Connecting Google Drive or reaching `Подключено` must not automatically mutate local data.
- Restore/import v1 now merges artifact data into the current installation instead of replacing the whole local data folder. Non-colliding current records are preserved, source records are imported, and colliding source IDs update the matching current record after LifeOS creates backup-before-restore.
- Google Drive upload must not perform latest-only cleanup. Existing remote backup pairs are preserved, including older backups needed after reinstall recovery.
- If Google Drive already contains complete LifeOS backups and the current local install has no user data, LifeOS blocks manual/automatic upload and tells the owner to restore from Settings > `Данные` first. This prevents a fresh empty install from becoming the new remote truth.
- Settings lists complete Google Drive backup pairs even if a previous build moved them into Google Drive trash, and marks those rows as `в корзине Google Drive` so they can still be downloaded and checked before restore.
- The initial Google Drive Settings state is `Проверка`, not `Отключено`, until the persisted backend status loads.

## 2026-05-30: Google OAuth Config Required For Installer Builds

- Windows installers that expose Google Drive backup sync must be built with a real Google OAuth Desktop client id available at compile time through `LIFEOS_GOOGLE_OAUTH_CLIENT_ID`, unless a deployment intentionally relies on a local `google-oauth-config.json` file in the runtime data root.
- Windows installers must also include the matching Google OAuth Desktop client secret through `LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET`, because Google rejects token exchange for this desktop client with `client_secret is missing` when only the client id is embedded.
- The normal private dogfood `npm run bundle` path now fails fast when `LIFEOS_GOOGLE_OAUTH_CLIENT_ID` or `LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET` is missing, so future installers do not silently ship with a broken Google Drive connect flow.
- The recommended scope remains `https://www.googleapis.com/auth/drive.file`. Full Drive scope is allowed only with the explicit `LIFEOS_GOOGLE_DRIVE_ALLOW_FULL_SCOPE=1` guard.
- Real OAuth config remains deployment configuration, not committed source. Refresh tokens and managed encryption passphrases remain outside the installer and stay in the OS keyring / managed Drive key document boundary.

## 2026-05-29: Habit Icon Picker And Focus Topmost Session Window

- Habits now support a user-selected lucide icon from a fixed habit palette.
- Habit icon choice is stored on the habit record as an icon key such as `calendar_check` or `droplets`; the default is `calendar_check`.
- Habit icon and habit color are separate choices: icon communicates the habit kind, while color remains the semantic visual accent.
- The Habits creation form exposes icon selection, and the selected habit detail panel can change the icon for an existing habit.
- When Focus has an active session or visible mini Focus surface, the desktop app window should stay above other OS windows, matching the "always visible" expectation of the native Quick Notes mini-window.
- Focus releases that topmost state when the mini Focus surface closes, the session ends, or the Focus screen unmounts.

## 2026-05-29: Editable Mini-Window Modes For Quick Notes And Trading Rules

- Quick Notes mini-window now has two explicit modes: view-only and edit.
- Trading Rules mini-window now has the same two-mode contract: view-only and edit.
- View-only mode keeps the previous low-resource reference behavior.
- Edit mode allows plain-text body editing inside the native mini-window and commits the body back through the desktop process to canonical storage.
- Quick Note titles and Trading rule-section titles remain edited in their main module screens, not in the mini-window.
- The mini-windows remain native desktop exceptions: plain text, no React/WebView mini-window runtime, no polling loop, no animations, and no heavy Markdown/graph/backlink work.

## 2026-05-28: Dark Theme As Second Global Theme

- LifeOS now supports Dark as the second global app theme while Light remains the default and source baseline.
- Theme selection lives in Settings > `Оформление` and uses the existing persisted `theme` field in the app settings record.
- The active theme is applied once at the app shell through `data-theme`; modules consume shared semantic tokens instead of defining per-module dark modes.
- Dark theme uses tinted dark neutrals and non-pure light text, avoids pure `#000`/`#fff`, and keeps the dense calm LifeOS workspace feel.
- Theme switching must preserve existing layout dimensions: `40px` rail, `214px` sidebar, compact headers, dense rows, Calendar grids, modals, task/habit rows, Notes gateway, and Settings sections.
- Decorative glow/orb backgrounds, glassmorphism, nested cards, thick side stripes, gradient text, and module-specific dark exceptions remain disallowed.
- Native Quick Notes and Trading Rules mini-windows remain separate low-resource desktop exceptions and are not redesigned as React themed surfaces.

## 2026-05-28: Focus Session Sound Runtime Lifecycle

- The selected Focus session sound must not start before a session starts. `silent` means no audio.
- While a Focus session is active, `rain`, `noise`, and a current-session custom imported audio file play as quiet looping background audio. Pause pauses the audio, resume continues it, and stop, finish, complete, timer end, sound replacement, or Focus screen unmount stops playback and releases browser audio resources.
- `bell` is not an ambient loop. It is a short lifecycle cue for the selected session sound and must not replace the separate optional phase/stage cues.
- Imported custom Focus sound playback is current-renderer-session only through an object URL until the future app-owned `media/focus-sounds/` durable copy path is implemented. Audio binary data is not stored in SQLite.

## 2026-05-28: Focus Streaks, Focus Audio Formats, And First Mobile Scope

- Focus streak rule: a day counts for the Focus streak when it has at least one fully completed Focus session. There is no minimum-minute threshold, no mode-specific streak split, and no requirement to complete a separately planned amount of Focus time.
- Stopped Focus sessions stay available as history/session facts where the product already records them, but they do not count toward Focus daily statistics or the future Focus streak. Daily Focus total minutes and session totals should be calculated from fully completed sessions only.
- The saved custom Focus sound library uses a fixed allowlist rather than accepting arbitrary `audio/*` files. Supported durable import formats are MP3 (`audio/mpeg`, `.mp3`), WAV (`audio/wav`, `.wav`), Ogg/Opus/Vorbis (`audio/ogg`, `.ogg`, `.oga`), and M4A/AAC in MP4 (`audio/mp4`, `.m4a`). Unsupported audio imports should be rejected with a user-facing error instead of being stored in the durable library.
- The first mobile version should include every module that exists in the app when mobile development starts. Mobile work still waits until the desktop modules are in an ideal state; the remaining mobile planning question is the read/write depth and mobile workflow shape for each included module.

## 2026-05-27: Installed Google OAuth Config Source

- Installed LifeOS builds must not depend only on shell environment variables for Google Drive OAuth, because Explorer-launched `.exe` processes do not reliably inherit the developer terminal environment.
- Google OAuth client config is resolved in this order: process env, local `google-oauth-config.json` in the LifeOS runtime data root, then build-time env embedded during private packaging.
- The supported config fields remain `LIFEOS_GOOGLE_OAUTH_CLIENT_ID`, optional `LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET`, `LIFEOS_GOOGLE_DRIVE_SCOPE`, and `LIFEOS_GOOGLE_DRIVE_ALLOW_FULL_SCOPE`; the local JSON file uses `client_id`, optional `client_secret`, optional `scope`, and optional boolean `allow_full_scope`.
- Real Google client credentials must not be committed. Refresh tokens and managed encryption passphrases must still stay only in the OS keyring boundary or the intentionally remote LifeOS-managed Drive key document, not in OAuth config files, SQLite, frontend preferences, or checked-in fixtures.

## 2026-05-27: Google Drive Five-Minute Sync UX

- The default Google Drive Settings flow is now simple connected-account autosync: connect Google, set the Drive folder name, and LifeOS syncs every 5 minutes while running.
- Settings no longer shows or uses a Google Drive folder link, `Хранить последних копий`, or `Создавать резервную копию при закрытии` for this flow.
- LifeOS uses the named Drive folder from Settings, defaulting to `LifeOS Backups`; legacy folder URL inputs are ignored by the simple setup.
- Superseded on 2026-05-30: successful sync publishes the encrypted `.lifeosbackup` and completion metadata, but must not run latest-only cleanup for complete remote backup pairs because older backups are required for reinstall recovery.
- Each sync shows a compact bottom-right spinner while saving/uploading, changes to a check mark on success, and disappears after one minute.
- Connected Google Drive accounts sync on app exit by default; the shutdown loading dialog waits until the Google Drive result is `synced` before the app performs the real exit.

## 2026-05-26: Calendar Half-Year Event Repeat

- Calendar event recurrence now includes `Каждые полгода`, stored as the shared recurrence preset `every_six_months`.
- A half-year recurring event repeats every six calendar months from the original event date, on the same day of month. For example, an event dated `2026-01-15` appears on `2026-07-15`, `2027-01-15`, and later six-month occurrences.
- The Calendar event create/edit form exposes this preset. Month, Week, Three-day, and Day views project the future occurrences without creating separate Calendar event records.
- The shared recurrence calculation also recognizes `every_six_months` for recurrence-aware reminder due occurrences and browser fallback parity, but the requested visible UI addition is the Calendar event repeat option.

## 2026-05-26: Obsidian Folder Backup Sync

- Because Notes is used through the real Obsidian desktop app, Settings now supports an explicit list of Obsidian folders/vaults that should be included in LifeOS backup sync.
- The first implementation keeps the existing privacy/recovery model: configured Obsidian folders are copied into the complete local backup artifact under `obsidian-vaults/`, then the whole artifact is encrypted before Google Drive upload. Google Drive still receives the encrypted `.lifeosbackup`, not readable Markdown folders.
- Settings now shows two explicit manual backup variants: `Резервная копия LifeOS` for the full app backup and `Резервная копия Obsidian` for a standalone Obsidian-only artifact.
- The standalone Obsidian backup writes `backups/obsidian-backup-*`, includes only configured external Obsidian folders under `obsidian-vaults/`, and does not copy the LifeOS SQLite database.
- This is one-way backup sync for recovery after reinstall, not live Obsidian multi-device sync and not conflict resolution for concurrent Markdown edits.
- Restore/import brings synced Obsidian folders back under the app data root's `obsidian-vaults/` recovery area rather than writing to old absolute paths from the previous Windows installation.

## 2026-05-25: Google Drive Managed Encryption Key UX

- The primary Google Drive backup-sync UX is now Google-account-only for the owner dogfood flow: the user connects Google Drive and can create/restore backups without typing a separate recovery key.
- When no Google Drive folder link is pasted, Settings lets the user name the Drive backup folder before connecting. The backend creates or finds that folder name, defaulting to `LifeOS Backups`.
- Close-time Google Drive sync is blocking for a real exit: window close and tray `Выход` show a small sync dialog and exit only after the encrypted backup reaches `synced`. Pending upload or error keeps LifeOS open with an error instead of silently exiting.
- LifeOS still encrypts every `.lifeosbackup` before upload, but it generates an internal managed encryption passphrase automatically. The passphrase is stored locally only through the OS keyring and is also uploaded into the LifeOS-owned Google Drive backup folder as a managed key document so a fresh Windows install can recover after the same Google account is connected again.
- The privacy/security boundary is an explicit product tradeoff: Google account access plus this LifeOS client is enough to recover the backup. This is less private than a user-memorized recovery key, but it matches the selected "connect account and it works" reliability requirement for the private owner app.
- Settings no longer shows the recovery key input or `Запомнить ключ на этом устройстве` in the default Google Drive flow. `Создать копию сейчас` is disabled until Google Drive is configured/authenticated, then it uses the managed key automatically.
- Settings > `Данные` restore from Google Drive no longer asks for a recovery key in the default flow. It downloads the encrypted artifact, resolves the managed key from OS keyring or Drive, decrypts locally, and then uses the existing dry-run/apply restore gate.
- The older manual recovery-key commands may remain as compatibility/internal surfaces for now, but they are no longer the main user-facing Google Drive backup contract.

## 2026-05-24: Calendar Week Starts On Monday

- Calendar Month and Week views start weeks on Monday, not Sunday. Month headers are ordered `Пн` through `Вс`; Week view covers Monday through Sunday for the visible week.

## 2026-05-24: Google Drive Large Backup Streaming Safety

- Google Drive encrypted backup upload must keep resumable upload semantics while sending the encrypted `.lifeosbackup` from a file-backed streaming body, not by reading the whole artifact into memory.
- Google Drive restore download must stream response chunks into a temp file under restore staging and publish the final `.lifeosbackup` only by rename after the download completes.
- Failed restore downloads and known byte-count mismatches must not leave a final-looking `.lifeosbackup` artifact. Size validation uses completion metadata `byte_count` when available and falls back to Drive/response size when that is the only known size.
- Complete remote backup listing should populate `completed_at_ms` and `byte_count` from completion metadata, with Drive timestamps/size only as fallback data.

## 2026-05-24: Google Drive Remote Backup Retention

- Settings > `Синхронизация` > `Хранить последних копий` is the active retention rule for Google Drive encrypted backups.
- Retention runs after a successful encrypted `.lifeosbackup` upload and after its completion metadata is published. Only then can older remote backups be considered for cleanup.
- Complete remote backups are artifact+metadata pairs. LifeOS sorts them by `completed_at_ms` from completion metadata, falling back to Google Drive `modifiedTime` and then `createdTime` when metadata time is missing.
- LifeOS keeps the newest `keep_latest_count` complete pairs and moves older complete artifact+metadata pairs to trash.
- Pending or incomplete remote artifacts without matching completion metadata must not be deleted by retention.
- If retention cleanup fails, the newly uploaded backup stays uploaded/synced. LifeOS records a cleanup warning/error on the job and Settings shows the warning without changing the upload back to pending/not-synced.

## 2026-05-24: Google Drive Remembered Recovery Key Security Model

- Superseded for the default user-facing flow by `2026-05-25: Google Drive Managed Encryption Key UX`. Keep this section only as historical context for the older manual-key design.

- Historical 2026-05-24 design: Settings > `Синхронизация` had an explicit `Запомнить ключ на этом устройстве` action for the Google Drive recovery key.
- In that superseded design, remembering the recovery key was opt-in and device-local. The only persistent storage for that secret was the OS keyring. SQLite, JSON/config files, frontend records/preferences, and frontend state could not persist the secret, and backend status commands returned only non-secret status such as `remembered: true/false`.
- In that superseded design, if the option was disabled, the key remained session-only: the user could type it for `Создать копию сейчас`, and LifeOS could cache it in memory for the current app session, but app restart cleared that memory path.
- In that superseded design, close-time backup resolved the recovery key from memory first and from the OS keyring second when a remembered key existed. Therefore auto-backup after app restart could work when the user opted into remembering the key on that device, instead of depending only on the in-memory cache.
- `clear_remembered_google_drive_recovery_key` clears the legacy OS keyring entry. It does not create any SQLite/config/frontend secret record.
- In that superseded design, after reinstalling Windows, the OS keyring was expected to be empty and Google Drive restore required the user to enter the recovery key manually before decrypting the downloaded backup artifact.

## 2026-05-23: Google Drive Direct Encrypted Backup Sync

- For the simple reliable recovery-sync experience, the selected primary direction is direct Google Drive integration: the user either connects a Google account and lets LifeOS create/use a `LifeOS Backups` folder, or pastes a Google Drive folder link and authorizes LifeOS.
- This feature remains backup-based sync, not live SQLite/file sync and not multi-device record conflict resolution. Local LifeOS storage remains the source of truth.
- Every remote backup must be encrypted by LifeOS before upload. Google Drive receives encrypted backup artifacts, not readable SQLite, Markdown, media, or manifest contents with private data.
- LifeOS must show a truthful sync state. A backup is `Синхронизировано` only after local backup validation, encryption, upload, checksum verification where available, and final remote completion marker/manifest publication. Failed or interrupted uploads become `Ожидает загрузки` or `Ошибка синхронизации`, not a successful sync.
- On close, LifeOS should create a local validated backup first, encrypt it, upload it to Google Drive, and keep a local pending-upload artifact if internet/auth/API upload fails.
- Closing the main window and tray `Выход` share the same auto-backup-on-close lifecycle. If upload fails after the encrypted artifact exists, LifeOS records the pending upload and may exit; if local backup/encryption fails before a usable pending artifact exists, LifeOS keeps the app open and reports the error.
- After Windows reinstall, the recovery flow is: install LifeOS, connect the same Google account or paste the Drive folder link, list complete encrypted backups, download the selected backup, decrypt locally, run restore/import dry-run, and apply through the existing backup-before-restore flow.
- Superseded by the managed-key UX on 2026-05-25: in the default flow, Google account access plus this LifeOS client can resolve the LifeOS-managed Drive key document and decrypt the downloaded backup artifact locally.
- Local sync-folder approaches such as Proton Drive/Google Drive desktop/OneDrive remain acceptable fallback options, but the primary “connected account/link and it just works” path is Google Drive API plus LifeOS encryption.
- Superseded by `2026-05-27: Installed Google OAuth Config Source`: Desktop Google OAuth config is deployment-configured through process env, local runtime config file, or build-time env. Real Google client credentials must not be committed. The default Drive scope is `drive.file`; full Drive scope is blocked unless explicitly allowed for private dogfood.
- The desktop Google Drive connect flow is implemented as system-browser OAuth 2.0 Authorization Code + PKCE with a random `127.0.0.1` loopback redirect port, `access_type=offline`, and `prompt=consent`. The returned refresh token is persisted only through the OS keyring boundary. SQLite stores only Drive folder/config metadata via `GoogleDriveSyncRepository`.
- Google refresh tokens must live only behind the OS credential/keyring boundary. Real refresh tokens must not be persisted in JSON, SQLite, frontend preferences, or checked-in fixtures. Automated tests use fake token strings and fake/recording Drive clients rather than real Google Drive.

## 2026-05-23: Habits Optional Time Add And Remove

- Habit time remains an optional habit field, not a required habit type choice.
- New habit creation should expose time through an explicit `Добавить время` control and allow immediately removing it with `Убрать время`.
- Existing selected habits should also allow adding, changing, saving, and removing time from the habit detail surface.
- Removing time stores `time: null`. A one-repetition timed habit becomes a regular checkmark habit; a quantity habit stays `quantity` and may simply lose its optional time anchor.
- Timed habit projections on Home and Calendar Day/Three-day/Week depend on the saved optional time, so removing time removes that habit from timed schedule projections while keeping the habit active in Habits.

## 2026-05-22: Trading Rules Mini-Mode Text Readability

- Trading `Правила` mini-mode remains a lightweight native always-on-top read-only text window.
- The mini-window text must use a normal system UI font and internal text padding rather than the raw default edit-control look.
- Rule body line breaks entered in the main Rules editor must be preserved in mini-mode, including explicit new lines and blank lines; automatic wrapping is only for long lines.

## 2026-05-22: Trading Rules Section Delete And Editor Spacing

- The Trading `Правила` screen must allow deleting the selected rule section from the rules list.
- If the last rule section is deleted, the Rules screen shows an empty rules state and should not revive legacy/default rule text as a fake section.
- The rule body editor starts directly under `Правила раздела`; there should be no large empty vertical gap between the label and the editable rule text.

## 2026-05-22: Focus Sidebar Horizontal Scroll Removed

- The Focus setup sidebar should remain fixed-width and should not expose a bottom horizontal scrollbar or feel horizontally movable.
- The full default Focus setup interface should be visible inside the sidebar width, with dense controls compressed inside the column and vertical scrolling only when the selected mode needs more height.

## 2026-05-20: Tasks User Lists Remove Items From Inbox

- Tasks can be assigned to a user-created task list from the task editing surface.
- Inbox now represents active tasks that do not belong to any user list. When a task is assigned to a user list, it disappears from Inbox and appears in that user list instead.
- Dated tasks without a user list can still appear in Inbox, Today, Next 7 Days, and Overdue according to their date rules; user-list assignment only removes the task from Inbox.

## 2026-05-20: Trading Rules Mini-Mode Window

- Trading `Правила` mini-mode must open/update a separate always-on-top desktop mini-window with the selected rule section text.
- The Rules screen must not render mini-mode as a regular in-app mini panel; browser/Vite fallback may use a separate preview window only when Tauri native commands are unavailable.

## 2026-05-20: Tasks No-Date Order, Waiting Reason, And Row Description

- In Tasks, tasks without a date must keep creation/addition order inside the no-date group. They should not fall back to alphabetical title sorting when the active list is grouped by date.
- A task with status `Ожидает` can store a short reason for what exactly it is waiting for. The reason belongs to the task status/editing surface and is stored as task data, while completion remains separate through `completed_at_ms`.
- Task descriptions are edited in the selected-task detail panel only. The task list row must not render the description under the task title.

## 2026-05-20: Focus Functional Timer Modes

- Focus now treats flexible timer, Pomodoro, breathing, and interval/cardio as current MVP modes.
- Changing Focus mode or setup duration before starting a session must immediately update the visible timer and the `start_focus_session` input. Once a session starts, it keeps its own stored mode, planned duration, and remaining timer state until that session is stopped or completed.
- Breathing mode uses phase logic from the local `timer site` project: presets `4-7-8`, `Box`, and `Антистресс`, custom inhale/hold/exhale seconds, target rounds, phase labels, reset, pause/resume, and optional sound cues. The LifeOS UI keeps the shared Focus design rather than copying the timer site's visual design.
- Interval/cardio mode uses the local timer site's stage logic: editable exercises, work seconds, rest between exercises, rest between rounds, rounds, `work`/`rest`/`round-rest` stages, skip current stage, reset, pause/resume, and optional sound cues.
- Focus setup settings persist in app-managed frontend preferences (`frontend-preferences.json` in packaged desktop, browser fallback only in Vite/localStorage). Focus session history remains canonical SQLite through `focus_sessions`.

## 2026-05-19: Grouped Daily-Use Fix Pass

- Calendar should show tasks that were marked completed on the viewed day, using `completed_at_ms` as the completed-on date/time. This includes tasks originally from Inbox, overdue tasks, and any other task source/list; planned due-date projections are not enough for the day review use case. These rows/blocks remain Task projections that open the original source task, not Calendar event copies.
- Tasks `Сегодня` should keep active due-today and overdue tasks, but scheduled habit rows should disappear from `Сегодня` after the habit is completed for the selected day. Habit progress remains written through the Habits boundary, not converted into a task.
- Tasks should reopen to the last list/smart list/system view the owner used, instead of always opening `Сегодня`.
- Task status is promoted into active task work. Initial statuses are `Не начато`, `В процессе`, and `Ожидает`; completion remains a separate completed state/action through `completed_at_ms`. A newly generated next occurrence for a recurring task starts at `Не начато`.
- The Tasks UI must handle long task titles, long descriptions, and Cyrillic glyphs without visual clipping or layout drift. The immediate reported clipping affects letters such as `у`, `в`, `з`, and `б`.
- Focus active work resumes. The module should become functionally usable, including reliable time setting and timer modes based on the local `C:\Users\Nomoregooners\projects\timer site` project logic. Only timer logic should be reused from that project; its visual design should not be copied.
- The app icon should be regenerated as part of the pass and wired into the Tauri icon asset set.
- The current updater request conflicts with the existing deferred updater docs, so the exact implementation level for this pass remains open until the owner confirms whether to enable the updater now or only verify/keep the already-started work deferred.

## 2026-05-20: Grouped Updater Conflict Resolution And App Icon Refresh

- Open question 201 is resolved for this pass without promoting auto-update into the active private dogfood release. The owner did not explicitly confirm enabling the updater now, so the existing "Auto-Update Deferred" decision remains current.
- The already-started Tauri updater implementation may remain in the codebase as guarded scaffold, but startup checks, Settings manual checks, and install/relaunch flow are disabled by default. They activate only when the frontend is built with `VITE_LIFEOS_UPDATER_ENABLED=1`.
- Local/private bundles must not require Tauri updater signing while auto-update is deferred. The checked-in Tauri config keeps `bundle.createUpdaterArtifacts = false`; CI sets it and the frontend `VITE_LIFEOS_UPDATER_ENABLED` build flag from `LIFEOS_UPDATE_RELEASE_ENABLED`, and requires updater signing/R2 inputs only when that variable is `true`.
- The selected future direction remains unchanged: Tauri signed updater, Cloudflare R2 at `updates.lifeos.app`, static `latest.json`, signed NSIS installer artifacts, and matching `.sig` files.
- The app icon was regenerated as an editable SVG source plus Tauri PNG/ICO assets. The mark is a dark command-workspace tile with a white LifeOS axis and three colored module nodes. Tauri shell/tray/bundle continue to consume the configured app icon assets, with the tray using the default window icon.

## 2026-05-19: Internal Rust Crate License Metadata

- LifeOS v4 remains a private/internal project. Fixing SBOM metadata must not be treated as an implicit open-source licensing decision.
- The internal Rust workspace packages `lifeos-core`, `lifeos-storage`, `lifeos-sync`, and `lifeos-desktop` must not be publishable crates. Cargo metadata uses workspace `publish = false`, inherited by each internal package.
- The workspace no longer uses `license = "UNLICENSED"` because `cargo-cyclonedx` treats it as an invalid SPDX license expression and emits warning noise in release dry-runs.
- The chosen closed-project Cargo representation is a root `LICENSE.txt` proprietary notice referenced through workspace `license-file = "LICENSE.txt"` and inherited by each internal package.
- Dependency license gates still apply to third-party production dependencies; the internal license-file policy only describes LifeOS-owned private code.

## 2026-05-19: Auto-Update Deferred

- Auto-update setup is deferred for the current private dogfood release path.
- Auto-update remains a required future capability and should not be discarded.
- The selected future direction remains Tauri signed updater plus Cloudflare R2 static hosting through `updates.lifeos.app`.
- The release workflow should not require updater signing inputs or R2 credentials until the updater release path is explicitly enabled again.

## 2026-05-19: Production Signing Subject Gate

- Public production remains blocked without a real Windows code-signing certificate. The workflow must not substitute a placeholder or self-invented publisher identity to make production green.
- Production signing inputs are valid only when the imported PFX has a private key, Code Signing EKU, non-expired certificate, timestamp URL accepted by the Windows signing toolchain, and `LIFEOS_PUBLIC_PUBLISHER` matching the imported certificate subject identity (`CN`, `O`, or full subject).
- Release evidence must independently re-check every executable artifact's Authenticode signer subject against `LIFEOS_PUBLIC_PUBLISHER` after signing; the temporary CI Tauri config mutation alone is not enough evidence.

## 2026-05-19: Updater Artifact Publishing

- The manual public Windows release workflow is the CI path for updater artifact publication. Both `dry-run` and `production` runs must sign Tauri updater artifacts, generate `target/release/bundle/nsis/latest.json`, and upload the NSIS installer, matching `.sig`, and `latest.json` as GitHub Actions artifacts.
- Cloudflare R2 replaces the VPS as the initial updater host. The owner wants R2 handled as the update artifact store instead of administering a VPS.
- R2 publication is production-only and required for a production updater release: after the existing production release gates pass, the workflow publishes updater artifacts to the configured R2 bucket through Cloudflare's S3-compatible API.
- `latest.json` must be published after the referenced installer and `.sig` are reachable. The CI publish script uploads the installer and `.sig` first, then uploads `latest.json` last.

## 2026-05-18: Open Question And Documentation Drift Closure

- MVP accessibility baseline is confirmed for current desktop work: use native focusable controls for interactive elements, preserve visible `:focus-visible` states through the shared focus token, give icon-only actions accessible names, keep dialog/overlay close actions labelled and keyboard reachable, respect reduced-motion preferences for nonessential motion, target WCAG AA contrast for text/icons in the active light theme, and use standard compact desktop hit targets with smaller dense controls only when they remain labelled and keyboard accessible.
- Diary media is not an active Diary blocker for private dogfood. Current MVP behavior is attach, preview, full-screen review, rename, and delete inside the day-entry modal, with media metadata/payload stored with the canonical diary entry for local review. Durable shared media folders, media limits, and import/export conflict behavior remain future/system questions.
- Cross-module attachment strategy remains unresolved as a system question, not a Diary-specific MVP blocker. Notes owns `notes/_attachments/`; Physical Health and Trading have module-local media/attachment fields; future shared durable storage must decide whether to use an app-wide `attachments/{module}/{record}/` structure or per-module folders/rules.
- Mobile offline writes and multi-device sync metadata are not blockers for the current desktop private dogfood release. The current `change_log` is a local sync-ready audit boundary, but it does not yet define device/client identity, operation ids, record revisions, conflict bases, tombstone retention, or clock-skew handling for mobile writes.
- Standalone reminder storage/delivery exists, but the visible create/edit management surface is not yet decided. The unresolved product choice is whether independent reminder create/edit belongs in a minimal Home/Settings flow, waits for the future `Напоминания` module, or promotes that module earlier.
- Documentation drift cleanup policy for this pass: root historical `PROJECT_AUDIT_2026-05-13*` files are archive material, not current release truth; current release status lives in `release-checklist.md`, `release-security-checklist.md`, `release-evidence-*`, `spec-draft.md`, module specs, and the 10/10 checklist.

## 2026-05-18: Owner Answers To Open Questions

- Release identity: the owner is a solo developer without a separate legal entity/company. Do not invent a publisher identity for public release. Private dogfood builds may remain unsigned or use a clearly documented placeholder; a public Windows release should use a code-signing certificate tied to the owner's real individual legal name, or wait until an appropriate legal entity/certificate exists.
- Reminders are a cross-module notification layer. Tasks, Calendar events, habits, and other source records can own linked reminders where those records are edited. A future standalone `Напоминания` module should manage the whole reminder set: create independent reminders, edit them, and delete/edit any reminder including linked reminders.
- Home should show a compact top-right event summary. If there are no date-level Calendar events today, it should say `События: На сегодняшний день событий нет.`; otherwise it should show the events that exist for today.
- Focus detailed product questions are deferred until active Focus work resumes. For the custom sound storage question where implementation discretion was delegated, imported Focus sounds should be copied into an app-owned data media folder such as `media/focus-sounds/`, not into Notes.
- Diary's long-term writing source is Markdown. The chosen path is a dedicated `diary/YYYY-MM-DD.md` folder under the resolved runtime data root so Diary stays separate from Notes while remaining easy to export/backup. SQLite `diary_entries` may store structured daily fields and indexes/cache around those Markdown files.
- Diary media gets no additional product rules for now beyond the current attach/preview/rename/delete behavior. Formal media limits, import/export conflict behavior, and cross-module attachment strategy remain future/system work rather than active Diary questions.
- Diary `Что сделано` should include Focus sessions as well as completed Tasks, completed Habits, and manual done items. Completed and stopped Focus sessions are both intended to appear there.
- Physical Health deeper medical-model questions are deferred until active work on that module resumes.
- Mobile work is deferred. Before starting a mobile version, the desktop modules should be brought to an ideal state; mobile scope and read/write depth should be re-planned at that later point.
- Trading needs a native always-on-top rules mini-window in the MVP. The earlier in-app `Мини-правила` panel was only an interim affordance and should not be treated as the final rule-reference behavior.

## 2026-05-18: Public Release Pipeline Gate

- Public production release must not be made green by inventing a publisher identity. `LIFEOS_PUBLIC_PUBLISHER` is valid only when it matches the subject/publisher on a real individual code-signing certificate for the owner, or a future legal-entity certificate.
- The public Windows release workflow has two modes. `dry-run` proves the release evidence path without a real certificate, builds unsigned artifacts, records Authenticode `NotSigned`, and writes `NotSignedBlocked` as the signing gate result. `production` requires signing inputs and must fail unless every executable release artifact is `Valid` and timestamped.
- Every public release candidate, including dry-run candidates, must archive SHA256 hashes, Rust SBOM, npm/frontend SBOM, Rust and npm production dependency license inventories/gates, build provenance, installer smoke evidence, and `target/security/release-evidence.json` plus `.md`.
- The local reproducibility command is `npm run release:dry-run` from `apps/desktop`. It is not a public distribution command; its successful unsigned outcome proves the pipeline and the public-production block.

## 2026-05-18: Windows Uninstall/Reinstall Data Policy

- The default packaged Windows uninstall removes installer-managed LifeOS app files, shortcuts, and registry uninstall entries, but preserves `<install directory>\data`.
- Reinstalling LifeOS into the same install folder must reuse the preserved `data` folder and then follow the normal startup/version rules, including pre-update backup when the runtime version marker differs.
- Installing or reinstalling into a different folder starts from that folder's own separate `data` directory and must not auto-read, auto-merge, or delete the data folder from another install location.
- Deleting local user data is not part of the default uninstall/reinstall flow. If a future "delete all local data" action is added, it must be explicit, separate, and documented before implementation.
- Packaged QA should simulate uninstall/reinstall by removing installer-managed files while leaving `data` in place, then verifying that a reinstall-style startup still sees persisted SQLite/Notes/Quick Notes data.

## 2026-05-18: Basic Modules Canonical Storage

- Projects, Contacts, Diary, Physical Health, and Trading must no longer be described as preview-only durable-data modules in the packaged desktop app.
- Their packaged desktop source of truth is canonical storage owned by the Rust data boundary. Projects use the `projects` SQLite table; Contacts use `contacts`; Physical Health uses `physical_zones`; Trading uses `trading_plays`, `trading_entries`, and `trading_rule_sections`.
- Diary uses a hybrid canonical contract: structured daily fields are stored in SQLite `diary_entries`, and each day also has a synchronized Markdown file at `diary/YYYY-MM-DD.md` under the resolved runtime data root.
- Existing `frontend-records.json` / `lifeos.basic-modules.v1` records are a legacy import source and browser/Vite fallback only. Import is idempotent and should clear the promoted module records from the packaged frontend snapshot after successful migration.
- Settings > Data export, local backup, search rebuild, and integrity checks must read Projects, Contacts, Diary, Physical Health, and Trading from canonical storage, not from the current React state snapshot. Browser `localStorage` remains acceptable only when the Tauri runtime is unavailable.
- Historical note: at the moment of this storage decision, restore/apply automation was still blocked by the existing artifact v1 policy. This was superseded later on 2026-05-18 by the staged restore/import apply safety contract.

## 2026-05-18: Code-Backed Open Question Triage

- `open-questions.md` should be Russian-first for owner-facing questions. English terms should be translated when practical, for example `standalone reminders` -> `самостоятельные напоминания`, `canonical storage` -> `основное хранилище`, `mobile surfaces` -> `мобильные экраны`. Keep exact English only for code identifiers, file names, command names, environment variables, artifact names, or UI/code values that must remain exact.
- Calendar Agenda is deferred for the current MVP. The current Calendar contract and React implementation expose only Month, Week, Three-day, and Day view modes; there is no Agenda route, view mode, or render path. Agenda can be promoted later, but it is not part of the active MVP surface.
- Current Calendar/Home visibility rules are closed for the active MVP without Agenda: Calendar Month excludes habits and reminders and orders timed tasks, Calendar events, then untimed tasks; Calendar Day/Three-day/Week can include timed habits; Home shows timed tasks, timed habits, standalone reminders, and timed Calendar events.
- Physical Health body zones are user-defined free-text records in the current MVP. LifeOS does not ship a default body-zone preset list in the active implementation; a preset taxonomy or clickable body model remains future work unless explicitly promoted.
- Future mobile deep links should map to canonical LifeOS module ids and cross-client module metadata. Mobile clients do not need to reuse desktop hash-route slugs or desktop shell route names directly.

## 2026-05-18: Windows Auto-Update Direction

- LifeOS should support update delivery where installed Windows desktop builds can receive newer app versions without the owner manually downloading and reinstalling every later build.
- The intended technical path is Tauri's signed updater for desktop releases: an installed updater-enabled build checks an HTTPS release endpoint, verifies the update signature, downloads the newer installer/update artifact, and applies it through the normal Windows bundle flow.
- The first updater-enabled build may still require manual installation, because older builds without updater support cannot self-update into the updater path.
- Auto-update implementation must preserve the existing install-local data contract: `<install directory>\data` remains stable, and release startup still creates the documented pre-update backup before SQLite/migrations when runtime data belongs to a different app version.
- The initial release endpoint should be an owner-controlled Cloudflare R2 bucket served over HTTPS through `updates.lifeos.app`. The bucket stores only `latest.json`, updater signatures, and installer artifacts.
- Installed apps check for updates on startup, and Settings exposes a manual check action.
- When a newer valid update is found, LifeOS shows a modal saying `Вышло новое обновление` and offers `Установить сейчас` or `Позже`. Updates are not silently applied in the initial updater UX.
- Update safety flow: if a user has LifeOS v1 with a working data folder and installs/updates to LifeOS v2, the first v2 startup must detect data from an older version, create a pre-update backup of the important data folder before any SQLite migration, file-structure change, or manifest-version rewrite, then run migrations/structure updates. If the update succeeds, the user continues normally; if something breaks, the pre-update backup is the rollback point containing data as it existed before v2 touched it.
- Open details remain: private/public channel split, exact Settings placement/copy beyond the modal, updater signing-key custody, final R2 retention policy, and bandwidth/storage monitoring.

## 2026-05-17: WebView2 Installer Distribution Policy

- Current documentation does not define a zero-network Windows install requirement for the private dogfood release.
- The Windows NSIS installer keeps Tauri WebView2 install mode `downloadBootstrapper` for now.
- This keeps the installer small, but a target Windows machine without a suitable WebView2 runtime may need network access during install so the bootstrapper can download WebView2.
- Offline/fixed WebView2 runtime packaging would remove that install-time network dependency, but it would significantly increase installer size and add runtime update/distribution maintenance.
- Do not switch away from `downloadBootstrapper` unless zero-network install becomes an explicit release requirement. If promoted, verification must include install on a clean Windows VM with WebView2 absent and network disabled, plus installer size/time comparison.

## 2026-05-17: Dev-Only Performance Instrumentation

- Performance instrumentation for optimization work must stay development-only and opt-in. It must not add visible UI, notifications, persisted user records, or normal user-facing noise.
- Frontend metrics are enabled only in dev builds with either `VITE_LIFEOS_DEV_METRICS=1` or `localStorage["lifeos-v4:dev-metrics"]="1"`. Setting the localStorage flag to `0`, `false`, `no`, or `off` disables them.
- Rust metrics are emitted only from debug builds when `LIFEOS_DEV_METRICS=1`; release builds keep the Rust metric functions as no-ops. `LIFEOS_DEV_METRICS_FILE` may point to a JSONL trace file, otherwise Rust emits JSON lines to stderr.
- Current metric names cover `tauri.command`, `storage.local_database.open`, `storage.local_database.migration_check`, `repository.query`, `renderer.first_render`, `renderer.module_navigation`, `reminder.poll`, `data_safety.pre_update_backup`, `data_safety.readable_export`, and `data_safety.local_backup`.

## 2026-05-17: App-Managed SQLite State

- The desktop runtime must not reopen `LocalDatabase` for every ordinary Tauri command. Startup resolves the runtime data root, performs pre-update backup if needed, opens one app-managed `AppDatabase`, and lets that explicit open run WAL setup and migrations once.
- Tauri commands reuse the managed database state. SQLite access is serialized through a mutex-backed state wrapper so command isolation, `rusqlite` thread safety, WAL behavior, migration ordering, and deterministic temp-dir command tests are preserved.
- Path-based command helpers remain available for tests and standalone helper coverage, but the real Tauri command path uses `tauri::State<AppDatabase>`.
- Data-safety export, backup, search-index rebuild, and integrity commands have state-backed variants so their repository reads can run against the already-open startup database while keeping existing path-based test APIs.

## 2026-05-17: Cross-Module Design Synchronization

- The active shared visual contract is light-first across modules, with a full-height `40px` global rail, `214px` contextual sidebar where present, compact `55px` headers, tinted workspaces, raised light surfaces, dense rows, quiet icon actions, and no decorative outer cards, nested cards, prompt boxes, chart placeholders, glow backgrounds, or thick colored side-stripe accents.
- The visible MVP rail target is 14 modules in this order: Home, Tasks, Habits, Calendar, Projects, Contacts, Notes, Quick Notes, Diary, Physical Health, Finance, Focus, Trading, Settings.
- Quick Notes uses `StickyNote` as the intended lucide rail icon and stays visually separate from Notes. Its main module follows the shared light shell, while its native mini-window is a plain low-resource text reference window.
- Current Notes design is the Obsidian Companion Gateway. Older documentation that describes the internal file tree/editor/tabs/backlinks workspace as the primary route is historical unless the owner explicitly promotes that surface again.
- Psychological Health remains disabled/deferred and should not be included in active module scene boards or rail mapping unless explicitly promoted.

## 2026-05-17: Windows Autostart Setting

- LifeOS should support automatic app launch when the owner signs into Windows.
- The owner must be able to change this behavior from inside app Settings.
- The MVP control is a desktop/system setting, not a SQLite app setting: packaged/desktop LifeOS reads and writes the operating-system autostart state through the Tauri desktop integration.
- Browser/Vite preview may show the Settings row for layout/testing, but it is not a real OS autostart path.

## 2026-05-17: Contacts Module Scope

- Contacts is promoted into the current visible LifeOS module set as one separate top-level module in the global left rail.
- Contacts uses canonical id `contacts`, route `/contacts`, visible label `Контакты`, and the `Contact` lucide icon.
- Contacts appears after Projects and before Notes in the rail order.
- The first Contacts MVP is a lightweight address book with name, phone, Telegram/social handle, email, category, and free note.
- Only the contact name is required at creation time; all other fields may be empty.
- Contacts uses the interim frontend basic-module snapshot for now and is preview-only for durable data until a canonical Rust/SQLite storage contract is specified.
- Shopping Lists is not added as a separate visible module in the current scope. The owner will keep shopping-list style notes in Notes/Obsidian for now.

## 2026-05-17: Windows Update Data Preservation

- New Windows versions are expected to replace the previous installer-managed LifeOS app files in the same install folder instead of creating parallel active installs.
- The stable packaged data root remains `<install directory>\data`. Installing a newer version into the same folder must pick up existing data from that folder automatically; installing into a different folder still starts from that folder's own `data`.
- Release startup creates a pre-update backup before opening SQLite/migrations when the stored runtime data version differs from the running app version and existing runtime data is present.
- The pre-update backup lives under `data\backups\pre-update\lifeos-pre-update-v*`. The current contract copies and validates the critical SQLite/frontend snapshot before migrations, then copies `notes/` and `diary/` through the manifest-based resumable phase documented in the later pre-update backup safety decision. It intentionally does not recursively copy existing `backups/`, `exports/`, or rebuildable `search/` caches.
- The NSIS bundle uses data-preserving uninstall hooks so update/uninstall flows can remove old app binaries, shortcuts, and registry entries without deleting install-local user data.
- Cleanup applies only to installer-managed LifeOS files for the same product/identifier. Manually copied old executables outside the selected install folder are not automatically deleted.
- Dev/debug builds continue to use the standard Tauri app data directory and skip the pre-update backup path.

## 2026-05-15: Installed Folder Data Root

- Packaged Windows dogfood builds resolve the runtime data root from the installed executable directory: `<install directory>\data`.
- SQLite `lifeos.sqlite3`, Notes `notes/`, exports, backups, search cache, packaged frontend records `frontend-records.json`, and packaged frontend preferences `frontend-preferences.json` live under that data root.
- Installing or copying LifeOS into a different folder starts from that folder's own `data` directory. The app must not automatically read, merge, or migrate old `%APPDATA%` / WebView `localStorage` data.
- Any future migration/import from older AppData or browser-preview storage must be an explicit user action, not startup behavior.
- Dev/debug builds continue to use the standard Tauri app data directory so local development does not write into build-output folders.
- Browser/Vite `localStorage` remains only a preview fallback when the Tauri runtime is unavailable.

## 2026-05-13: P0 Hardening Priority

- Immediate engineering priority is P0 hardening before the next personal release handoff.
- P0 scope for this cycle:
  - enable explicit desktop CSP in Tauri config;
  - enforce frontend lint gate;
  - enforce Rust clippy gate with `-D warnings`;
  - formalize `cargo audit` allowlist policy with owner/review cadence and a fixed review date.

## 2026-05-14: Release Target Truth

- Current release target: private dogfood only.
- The current Windows `.exe` / NSIS installer is acceptable only for a private owner dogfood handoff through a trusted channel.
- Public production release remains blocked until signed artifacts, final publisher identity, SHA256 hashes, SBOM, build provenance, license gates, and installer smoke evidence exist.
- The release docs must not be written or read as public-ready while the build is unsigned, the publisher is `LifeOS v4 Publisher Placeholder`, and public SBOM/provenance/license/smoke gates are incomplete.
- This decision documents release truth only; it does not implement the future CI signing or public release pipeline.

## 2026-05-14: Personal-First Product Strategy

- LifeOS v4 is being built exclusively for the owner's own use first.
- Current product decisions should optimize for the owner's real daily workflow, speed, taste, and usefulness rather than generic public-user fit.
- The app should still keep clean module boundaries, durable data contracts, readable exports, and reusable architecture where practical so validated ideas are not trapped in throwaway prototype code.
- The current LifeOS v4 private desktop app should not be treated as the direct future public-user product.
- After LifeOS v4 becomes ideal for the owner's own use, a new separate application for users may be created from the proven workflows, architecture lessons, and design decisions.
- Public-user onboarding, account system, analytics, pricing, support, and broader product-market decisions are deferred productization work for that future separate app.

## 2026-05-14: Public Windows Release Workflow Gate

- A separate manual GitHub Actions workflow, `.github/workflows/public-windows-release.yml`, is the only documented public Windows release path.
- The private dogfood `npm run bundle` path remains unsigned and uses `tauri build --bundles nsis --no-sign`; it must not be used for public artifacts.
- The public workflow requires frontend lint/typecheck/test/audit/build, Rust fmt/clippy/test/audit, npm SBOM, Rust CycloneDX SBOM, dependency license gate, signed NSIS bundle, Authenticode signature and timestamp verification, SHA256 hashes, installer smoke, and GitHub build provenance before artifact upload.
- Public signing inputs are supplied only through GitHub Actions secrets/repository variables. No certificate material, password, thumbprint, timestamp URL, or final publisher identity is committed to the repository.
- The final public publisher/legal identity is still unknown and blocks any public run until `LIFEOS_PUBLIC_PUBLISHER` is set to a non-placeholder value.

## 2026-05-14: Stage 13 Basic-Module Storage Release Decision

- Minimal safe release decision for FIX-03: Projects, Diary, Physical Health, Finance, and Trading remain preview-only in the private dogfood build until each module is promoted to canonical Rust/SQLite or Markdown storage.
- These modules have real UI workflows, but their current records live in an interim frontend record store and are not release-supported as production-grade durable data.
- Settings is not part of this preview-only group for app settings because theme, language, wake time, and sleep time already use the typed Rust settings boundary.
- Settings > Data may include Projects, Diary, Physical Health, Finance, and Trading in export, local backup, search rebuild, and integrity checks only through the frontend snapshot passed by the Settings screen. That inclusion is best-effort and must not be described as a complete backup, restore, search, or integrity guarantee.
- The canonical-storage promotion order is: Finance -> Diary -> Trading -> Projects -> Physical Health.
- After canonical storage exists for a module, browser localStorage should remain a browser/Vite preview fallback only, not a supported packaged-desktop fallback path.
- Follow-up work should migrate the modules one by one rather than moving all five in a single implementation pass.

## 2026-05-14: FIX-03A Finance Canonical Storage

- Finance is the first Stage 13 basic module promoted out of frontend-only localStorage.
- Finance accounts, transactions, and budgets are canonical Rust/SQLite records in `finance_accounts`, `finance_transactions`, and `finance_budgets`.
- Finance amounts are stored as integer minor units. Display formatting is separate, so packaged desktop Finance balance arithmetic does not depend on JavaScript binary floating-point math.
- Finance exposes typed Tauri command helpers and frontend `dataCore` adapters for account create/list/update, transaction create/list, budget create/list, and idempotent import from the old `lifeos.basic-modules.v1.financeAccounts` snapshot.
- Finance and Settings data actions import any existing localStorage Finance snapshot into canonical storage before clearing Finance from the frontend basic-module snapshot.
- Export, local backup, search rebuild, and integrity checks now read Finance from canonical SQLite storage. Frontend snapshots remain only for Projects, Diary, Physical Health, and Trading until those modules are promoted.
- The remaining FIX-03 promotion order is Diary -> Trading -> Projects -> Physical Health.

## 2026-05-14: FIX-04 Taskless Focus Storage Contract

- Taskless Focus is a valid persisted Focus session and must not create or store a fake task id.
- Focus session payloads use `task_id: null` when the session has no linked task; linked sessions keep the real task id in `task_id`.
- `task_title` remains a required snapshot for both linked and taskless sessions so history, export, backup, and search have a stable user-facing title even if the original task changes or is absent.
- SQLite migration `0008_focus_taskless` makes `focus_sessions.task_id` nullable and converts recognized legacy synthetic taskless ids to `NULL` when the title is `Фокус без задачи` and no matching task exists.
- Integrity checks validate only non-null Focus task links. A linked Focus session that points to a missing task remains an integrity issue.
- Readable export and search keep serializing/indexing Focus sessions as structured records; taskless sessions appear with `task_id: null` and their snapshot title.

## 2026-05-14: FIX-05 Windows MVP Reminder Contract

- Windows MVP reminder delivery uses local device date/time and channel `windows_system`.
- Supported reminder sources are standalone, task-linked, habit-linked, and Calendar-event-linked reminders. Linked reminders store a source id plus a title snapshot; delivery does not reread or mutate the source record.
- A reminder is due when its one-time scheduled local date/time is at or before the poll clock, or when the latest recurrence occurrence is at or before the poll clock. Recurring reminders persist `scheduled_for_local` as the actual occurrence date plus due time.
- Duplicate suppression is durable and keyed by `(reminder_id, scheduled_for_local, channel)`.
- SQLite table `reminder_delivery_attempts` stores delivery attempts/statuses. Any persisted status for an occurrence suppresses another dispatch for that same occurrence: `delivered`, `failed`, `permission_denied`, or `unsupported`.
- Permission denied, missing notification API, and dispatch failures are recorded instead of being silently swallowed. Settings > Notifications shows permission, latest attempt status, and latest error.
- Notification click actions are explicitly unsupported in the Windows MVP. Clicking a notification does not deep-link to the source record.
- Custom reminder sounds are explicitly unsupported in the Windows MVP. LifeOS does not choose a reminder sound; any audible signal is OS/WebView default behavior outside the app contract.
- The durable delivery-status path uses the Tauri/Rust storage boundary. Actual visible dispatch still uses the WebView Browser Notification fallback and is private dogfood only, not a public-production Windows toast implementation.
- Native Windows toast dispatch, click routing, custom sounds, snooze, notification history, and richer channel settings are future work.

## 2026-05-14: FIX-06 Restore/Import Dry-Run And Recovery Policy

- Restore/import is dry-run first. LifeOS must validate a backup/export artifact before any recovery path can be considered.
- Supported restore/import artifact version is `1`. New readable exports and local backups write `artifact_version: 1` in `manifest.json`. Missing, malformed, or unsupported versions block restore/import.
- Dry-run validates the artifact manifest, artifact kind, supported version, readable structured records or backup SQLite snapshot, current-data collisions, and internal linked-record references.
- Supported artifact kinds are `lifeos-v4-readable-export` and `lifeos-v4-local-backup`.
- Historical v1 dry-run policy before 2026-05-18: source IDs were preserved and collisions blocked apply. This is superseded by the 2026-05-18 restore/import apply contract, where v1 collisions are reported and apply replaces current installation data after backup-before-restore.
- ID/link remap behavior for artifact version 1 is explicit no-remap. Linked records must resolve inside the artifact itself. A future importer may add explicit remap tables, but v1 does not infer or rewrite links.
- Historical app state policy before 2026-05-18: automated apply was blocked while LifeOS might be open. This is superseded by the staged desktop apply path that temporarily closes the app-managed SQLite handle.
- Historical rollback requirement: any future automated apply had to create a pre-apply backup and restore it on failure. This is now implemented as backup-before-restore plus staged replacement/rollback.
- Encryption/passphrase decision: current export and backup artifacts are local and unencrypted. Passphrase/encrypted restore is deferred; encrypted artifacts are rejected by dry-run until the encrypted artifact contract exists.
- Historical storage note before 2026-05-18: Finance participated in dry-run while Projects, Diary, Physical Health, and Trading were still preview/frontend-snapshot-only. This is superseded by canonical storage promotion plus staged restore/import apply.
- Settings > Data shows a restore/import dry-run report and must not promise restore without verification.

## 2026-05-14: Notes Obsidian Parity Work Style

- The owner wants the Notes redesign to be handled with minimal owner effort: the agent should choose pragmatic defaults, do the research, update specs, implement, and verify rather than requiring the owner to collect references or manually drive each UI detail.
- The desired end state is no longer just "has Obsidian-like features"; the owner is asking for a result that feels substantially closer to Obsidian itself.
- The owner approved the resolution: `Делай Notes как Obsidian parity. LifeOS-стиль можно нарушать внутри Notes.`
- Notes is now an explicit Obsidian-parity exception inside LifeOS. Keep the global LifeOS module rail and local-first storage boundaries, but the Notes module surface may override the shared light LifeOS module language when that is needed to match Obsidian.
- Notes should prioritize Obsidian workspace fidelity: dense dark workspace geometry, vault/file explorer behavior, pane/tabs model, Markdown editor feel, metadata panes, graph/backlink workflows, keyboard-oriented controls, and a bottom status strip.
- LifeOS must not copy Obsidian proprietary source code or bundled assets. The target is independently implemented visual and behavioral parity, using public behavior and local reference observation.

## 2026-05-14: Notes Obsidian Companion Mode

- Notes should use Obsidian Companion Mode as the practical personal-use path.
- The user is expected to have the Obsidian desktop application installed for primary note editing.
- LifeOS owns and indexes the local Markdown vault folder, currently the app-owned `notes/` folder, and exposes Obsidian launch controls through supported `obsidian://` URI actions.
- LifeOS Notes remains the local shell for vault/file tree, search, preview/indexes, backlinks, graph, attachments, and cross-module context; editing can be handed off to the real Obsidian app.
- This is companion integration, not a supported native embed of the Obsidian desktop window inside the Tauri WebView.
- Native Windows window embedding and a custom LifeOS Obsidian bridge plugin are deferred unless the owner explicitly promotes them later.
- LifeOS must not bundle Obsidian, copy Obsidian proprietary source code/assets, or imply that Obsidian is part of the LifeOS distribution.

## 2026-05-14: Notes Obsidian Companion Workspace Handoff

- The owner asked to integrate Obsidian more strongly, so Notes should feel like an Obsidian-backed workspace inside LifeOS rather than a generic Markdown module with a few external buttons.
- Obsidian Companion controls live as a top workspace handoff ribbon with vault identity, active workspace note, note/link counts, launch status, and vault/note/search actions.
- The left vault tree remains focused on files and folders. It should not carry the primary Companion workflow as a small sidebar card.
- Browser/Vite mode is explicitly a preview vault. It must not pretend that `browser://...` localStorage paths are real Obsidian vault paths; Obsidian launch controls are disabled there with a clear desktop-runtime state.
- Packaged desktop mode remains the intended real-use path for opening the LifeOS notes folder and active Markdown note in the installed Obsidian desktop app.

## 2026-05-14: Notes Automatic Obsidian Handoff

- When the user opens the Notes module in packaged desktop mode, LifeOS should automatically launch the real Obsidian desktop app through `obsidian://choose-vault`.
- Obsidian's documented `open?path=` parameter is for absolute file paths, not vault/folder paths. LifeOS must not send the app-data Notes folder as `open?path=...`, because Obsidian reports `Vault not found`.
- The automatic handoff opens Obsidian's vault manager so the LifeOS notes folder can be chosen/registered as the vault. After that, active-note handoff may use `obsidian://open?path=<absolute-note-file>`.
- The automatic handoff is session-scoped: it should happen once per app/window session, so returning to Notes does not repeatedly steal focus.
- Manual Companion ribbon actions for opening the vault, active note, and current search remain available after the automatic handoff.
- Browser/Vite preview mode must not auto-launch Obsidian and must not synthesize `obsidian://` links for `browser://...` localStorage vault paths.

## 2026-05-14: Notes Obsidian Gateway Surface

- This supersedes the prior primary Notes workspace/ribbon direction: the Notes module surface should now be an Obsidian gateway, not an internal Obsidian-like editor/file-tree workspace.
- The visible Notes route should center a single `Открыть Obsidian` button and show a checkbox below it: `Автоматически открывать при нажатии на модуль Notes`.
- The auto-open checkbox is the owner-controlled gate for automatic handoff. When enabled, entering Notes launches Obsidian through `obsidian://choose-vault`; when disabled, the user opens Obsidian manually with the button.
- LifeOS still owns/imports/backs up the Markdown vault and rebuildable indexes, but daily note editing should happen in the installed Obsidian desktop app.
- Browser/Vite preview must stay honest: show the gateway shape, but do not auto-launch Obsidian and do not emit fake `obsidian://` links for `browser://...` paths.
- The internal CodeMirror/file-tree/tabs/backlinks/graph workspace is no longer the primary Notes route. It can be kept only as reusable/future fallback code unless the owner explicitly changes direction again.

## 2026-05-13: P1 Reminder Runtime And Module-Id Contract

- Browser/Vite fallback now supports standalone reminder create/list and due-notification listing via localStorage, matching existing fallback behavior for Tasks, Calendar, Habits, Focus, and Notes.
- The desktop app now starts a global reminder polling runtime in `App` that requests due reminder payloads, dispatches best-effort notifications, and deduplicates delivered reminders across polls/sessions.
- Canonical module id format is camelCase across desktop registry and storage/search output, including `physicalHealth`.
- Legacy `psychologicalEntries` traces were removed from Stage 13 frontend basic snapshot handling in data safety/export/search surfaces.

## 2026-05-05: Product Foundation

- Build LifeOS v4 as a new project, not a continuation of old folders.
- Old projects are references only when they provide value.
- Windows desktop is first; mobile versions are future.
- Cross-device sync is postponed.
- App is local-first.
- First version is personal-use MVP, not public-user launch.
- Architecture direction: Tauri + React/TypeScript + Rust-owned domain/data services.
- Storage direction: SQLite for structured data, Markdown/files for notes and readable export.
- Main design direction: Quiet Command Workspace.
- Initial app theme is light-first; dark remains a later app-wide theme.
- Historical baseline: UI was Russian-first and English localization was future work. Superseded on 2026-05-28 by the Settings-owned English language mode decision below; Russian remains the default and fallback.

## 2026-05-05: Daily Hub

- Central daily hub is Home, Tasks, Habits, and Calendar.
- Focus is deep, but not part of the planning hub.
- Home is a read-only today schedule aggregator.
- Home does not move, reschedule, or edit source schedule records.
- Home has no day switcher in MVP.
- Wake and sleep time bound the visible Home schedule.
- Free windows can remain visible as empty timeline space.
- Home should not recommend how to fill free time in MVP.
- Unfinished tasks become overdue instead of being silently rescheduled.

## 2026-05-05: Tasks

- TickTick is the primary reference for task behavior and density.
- Required task field: title.
- Optional task fields: description, date, time, priority, reminders, subtasks, recurrence.
- Historical 2026-05-05 state: tags, status, and approximate duration were not MVP. Superseded on 2026-05-19 for status: `Не начато`, `В процессе`, and `Ожидает` are now MVP; tags and approximate duration remain deferred.
- Task can have no date and then belongs to Inbox.
- Task can have date without time.
- Subtasks should behave as child tasks, not only checklist lines.
- Recurring tasks are MVP and follow TickTick-like next-occurrence behavior after completion.
- Completed tasks and Trash follow TickTick's mental model as closely as practical.
- Task detail lives in the right panel.

## 2026-05-05: Habits

- Product term is `Привычка`, not routine.
- Habit is always repeating; one-off action is not a habit.
- Habit recurrence MVP: every day, selected weekdays, every week, selected days of month, every month, every year.
- Habit types MVP: checkmark/timed and quantity/count.
- Quantity unit MVP: plain count/times only.
- Not MVP habit types: duration, timer, checklist.
- Habit can be completed/skipped retroactively.
- Habit statistics are required and recalculate after retroactive edits.
- Partial quantity completion records progress but does not increase, decrease, or reset streak.
- Total missed habit resets streak.
- Untimed habits stay in Habits and do not render on Home in MVP.
- Habit categories are not MVP; start with one common habit list.
- Habit card on Home shows title, type, time if present, completion control, count progress if relevant, and selected color.
- Habit detail/card behavior should follow TickTick as closely as practical.

## 2026-05-05: Reminders

- Reminders are separate entities, not task text.
- Reminder can attach to task, habit, or Calendar event.
- Standalone reminders are MVP.
- Full Reminders module / notification center is future work.
- Reminder fields MVP: title, time, optional recurrence, optional linked entity.
- Linked task reminder can inherit task title.
- Standalone reminder has its own title.
- No extra reminder description text is needed in MVP.
- Reminder recurrence uses the same broad presets as habits/tasks/events.
- Reminder is one-time by default unless user configures repeat.
- Reminder is not completable.
- No snooze in MVP.
- No reminder history in MVP.
- MVP delivery channel: Windows system notification.
- Telegram and phone delivery are future work.
- Home shows standalone reminders as separate yellow schedule cards.
- No privacy masking for notification title/text in MVP.

## 2026-05-05: Calendar

- Calendar creates events only; tasks are created in Tasks.
- Calendar event is not completable.
- Birthdays and holidays are Calendar events, not habits.
- User adds holidays manually in MVP.
- Holiday/calendar imports are future work.
- Calendar default view is Month.
- Calendar events fields MVP: title, date, recurrence, description, optional reminder, default color.
- No special birthday fields in MVP.
- No custom event colors in MVP.
- No event attachments in MVP.
- Month view excludes habits.
- Month view shows dense information: timed tasks first with time/title, then events and untimed tasks.
- Month day cells should support overflow/scrolling when many records exist.
- Day, Three-day, and Week views may show timed habits and should follow TickTick screenshots as reference.
- Home shows today's events separately as a subtle `Событие дня` area near the top.
- Time is local device time in MVP.

## 2026-05-05: Focus

- MVP modes: flexible timer and Pomodoro.
- Focus can start from a user-selected task or as a taskless session.
- Focus sessions do not appear on Home or Calendar in MVP.
- Focus main view centers a circular remaining-time timer/progress ring.
- Focus controls MVP: pause, stop, sound, mode.
- Focus supports built-in sounds and user-imported custom sounds.
- Focus opens/has a mini-window after launch.
- Focus session history is stored.
- After a focus session, user can write a result note.
- Result note belongs to Focus history and does not automatically update task, diary, or calendar.
- Focus stats/streaks by day are desired.
- Allowed app/process tracking, distraction blocking, redirects, and deviation logs are future work.

## 2026-05-05: Notes

- Notes are an Obsidian-like local Markdown workspace.
- Notes source is Markdown files.
- SQLite/indexes may support search/relations but are rebuildable.
- MVP features: app-owned default notes folder, file tree, nested folders, tabs, Markdown editor, preview, graph, search, tags, attachments/images, Obsidian import.
- Vault switching is future work.
- Note templates are future work.
- Notes live independently in MVP and do not link directly to tasks/projects/habits yet.
- Graph should be real rather than only a fake preview; exact relation rules remain open.

## 2026-05-06: Projects

- Projects are lightweight in MVP.
- Creating a project only needs enough data to make it appear in the left project list.
- No project field is mandatory.
- Project opens as a separate interface with editable fields.
- Field content can be Markdown-like where useful.
- Stages/statuses are user-defined, not a fixed system list.
- `Что мешает реализации` is an optional plain text field and can be empty.
- Tasks do not belong to projects in MVP.
- Task-project linking is deferred.
- No project deadlines/milestones in MVP.
- No Kanban/roadmap board in MVP.
- Projects UI: compact left project list, selected project information on the right.
- Project archive should behave like task archive/trash mental model where practical.

## 2026-05-06: Diary

- Diary is the Daily Note module.
- MVP fields: day entry, day rating, mood, energy, `что сделал`, media attachments.
- Diary starts from a monthly calendar.
- Selecting a day opens an overlay/modal with that day's details.
- Day modal closes with `X` or transparent backdrop.
- User can scroll and edit inside the selected day modal.
- `Что сделал сегодня` should pull completed tasks and completed habits for that day.
- User can also add manual text for things not captured as tasks/habits.
- Diary can use/export Markdown with Notes-like file logic.
- Separate Productivity module remains open/future; MVP starts with Diary's `что сделал` section.

## 2026-05-05/06: Other Modules

- Physical Health should include body-zone selection, complaint context/triggers, doctor visit details, and future clickable human model.
- Finance is account-first for the current MVP surface; full transaction creation, currency setup, budgets, and filters are deferred until promoted.
- Trading MVP has two journal modes: Futures and Memecoins.
- Futures requires ticker and uses entry price.
- Memecoins require ticker and use entry market cap plus reasons.
- Trading should not use a left selection table in MVP.

## 2026-05-06: Home And Tasks Follow-Up

- User answers may come through dictation; future agents should interpret full text, not only direct yes/no responses.
- Logic conflicts should be discussed with the user rather than silently resolved by the assistant.
- Home time collisions should be shown compactly to save space.
- Hover/focus can bring an overlapped item visually above others for inspection.
- Full overdue task handling belongs in Tasks.
- Home may show a compact overdue indicator/strip such as `есть просроченные дела`, but not a full overdue list or management UI.
- Completed and Trash behavior should follow TickTick. If local TickTick analysis is not possible or does not reveal the logic, ask the user again.
- MVP subtasks have only title and completion status.
- Date-only/today tasks should be visible in the task flow and Calendar; Home still does not need a timeline block for tasks without time in MVP.
- Tasks need TickTick-like sorting/grouping by day and ordering controls.
- Task priority should use TickTick as the reference for influence/behavior as closely as practical.

## 2026-05-06: TickTick Reference And Scene Design Pass

- The redesign should include module scenes, not only module home screens.
- Scene inventory lives in `docs/lifeos-v4/module-scenes.md`.
- TickTick reference pass confirms design support for Month, Week, Day, and multi-day Calendar views.
- TickTick priority reference uses High, Medium, Low, and None, with different list colors and priority sorting.
- TickTick recurring-task reference includes repeat by due date and repeat by completion date. LifeOS should expose this in the recurrence UI; the exact storage model remains an implementation decision.
- Completed and Trash should be treated as system views, not ordinary user lists.
- The next Figma pass should include at least: Home schedule states, Tasks main/detail/completed/trash/new list, date/repeat picker, reminder picker, Habits main/new/detail/statistics, Calendar Month/Week/Three-day/Day/new event, Notes workspace/import, Focus timer/mini-window/result note, Projects profile/new project, Diary month/day modal, Health body-zone scene, Finance account scene, Trading journal entry, Settings/theme scenes.

## 2026-05-07: Implementation Sequence

- The build sequence changed to app-first: create the real Tauri + React + TypeScript desktop application foundation now.
- The current browser/HTML design board remains a visual and product-logic reference, not the main implementation target.
- Micro visual details should be polished after the desktop foundation and core vertical slices exist, instead of delaying app development behind a long HTML-polish phase.
- Windows desktop distribution as a downloadable `.exe` is a first-class target and should be checked early.
- More modules are expected in the future, so the module registry and app shell must be extensible.
- Cross-device sync remains future work, but the architecture should reserve provider-neutral storage/sync boundaries early for different file storage providers.
- Future smartphone apps are planned, so domain contracts, data models, and sync assumptions should not be desktop-only.

## 2026-05-07: Calendar, Reminders, And Task Reference Answers

- The first fully interactive web-prototype vertical slice should be Home, then continue through modules in order.
- Calendar Month overflow should use internal scrolling inside the day cell.
- Calendar Month ordering: timed tasks first, Calendar events at the date level after timed tasks, then untimed tasks. Reminders do not appear in Month view.
- Standalone reminders belong to the future notification center / Reminders module and should not appear in Calendar Month.
- A reminder attached to an event or task does not appear on Home as a separate card; it remains a notification setting for its source record.
- Calendar events with a concrete time appear in the Home timeline.
- Task views should follow TickTick: List and Kanban in MVP, Timeline deferred.
- Task grouping should follow TickTick where possible: manual/custom, by date, by label/tag if labels are MVP, by priority, and no grouping.
- Task sorting should follow TickTick where possible: manual/custom, date, title, label/tag if labels are MVP, and priority.
- Completed should match the TickTick mental model: a dedicated completed view with filters, completion-date groups, group counts, and muted completed rows.
- Trash should match TickTick: deletion moves tasks to Trash; the Trash view can be cleared from a top-right action.

## 2026-05-07: Browser Design Corrections

- Design preview screens should move toward full-screen module surfaces without centered rounded outer containers.
- Visible UI should not include technical/reference helper text. Implementation notes, future labels, and reference labels belong in documentation, not the product screen.
- Home must show a clear control for setting wake time and sleep time.
- The Home sleep boundary/card must stay visible on the vertical timeline.
- Tasks user lists are added through a miniature plus on the right side of the `Списки` section title.
- Tasks List/Kanban are compact view controls. Timeline is deferred and should not be displayed as an active button.
- Task list actions should be accessed from a small three-dot button, and sorting/grouping should be compact menu controls instead of an always-open panel.

## 2026-05-07: Annotation Corrections For Logic Scenes Preview

- Home top dashboard cards (`Просроченные дела`, `Событие дня`, `Окна дня`) are removed from the current preview.
- Home day range is wake-to-sleep: if wake is `07:00` and sleep is `22:30`, the visible schedule is `07:00-22:30`.
- Wake is always at the start of the Home vertical timeline, and sleep is always at the end.
- Home time settings use an icon-only settings control in the header.
- The current-time marker on Home should include a pulsing dot that moves according to the current time.
- Overlapping Home schedule cards should align neatly when they share time and use compact stacking rather than uneven drift.
- Tasks show the selected list name as the screen title.
- Task rows should be denser and closer to TickTick.
- Visible `Список` and `Канбан` header buttons are removed from the task screen; view/list actions live behind compact controls.
- The duplicate task grouping/sorting/view toolbar is removed when it repeats existing controls.
- The task detail panel should visually follow TickTick's selected-task editor instead of a property table.
- Habits require a visible `+ Привычка` creation action.
- Calendar requires a visible `+ Событие` creation action.
- Notes should more strongly follow Obsidian: no redundant module header, tabs at the top, and folder disclosure chevrons in the file tree.
- Browser previews should not show a visible empty top drag strip, while the future desktop app still keeps a draggable top/header region.

## 2026-05-07: Module Annotation Corrections

- Settings sidebar contains settings groups for appearance, modules, Home, notifications, and data.
- Settings no longer uses a generic add-style `Настроить` sidebar action.
- Trading terminology is plural `Мемекоины`.
- Trading mode selection for `Фьючерсы` and `Мемекоины` belongs at the top center of the screen; the module should not have a left mode-selection sidebar.
- Finance uses account navigation plus compact `+ Счёт`; a later same-day correction removed `+ Транзакция` from the primary preview action.
- Physical Health adds a compact `+ Зона тела` sidebar action.
- Diary starts as a monthly calendar screen, with day details opened after selecting a date.

## 2026-05-07: Agent Documentation Structure

- `AGENTS.md` should stay short and contain only repository-level operating rules plus links to the detailed documentation.
- The detailed new-session product handoff lives in `docs/lifeos-v4/agent-handoff.md`.
- New sessions should use `AGENTS.md` as the entry pointer, then read `docs/lifeos-v4/README.md`, `agent-handoff.md`, the spec draft, the affected module spec, open questions, and relevant design/reference docs.

## 2026-05-07: Browser Diff Corrections For Logic Scenes Preview

- Home current-time dot must sit on the vertical timeline line.
- Home time labels must be centered vertically against their matching cards.
- Sleep represents the end of the day and must sit at the bottom of the second wake-to-sleep window.
- Task list screens use the selected list name as the title and remove the `Список задач` subtitle.
- Tasks now need two explicit states: no selected task with no right editor and full-width list; selected/editing task with right editor and source-list footer.
- Calendar Month title is the current month name. Its explanatory subtitle is removed.
- Calendar Month controls move to the top header, and the calendar grid fills remaining space.
- Calendar Week, Three-day, and Day screens follow the Month screen's compact header and full-height workspace treatment.
- Notes tabs sit at the top boundary, closer together and rounded; visible file names and tabs omit `.md`.
- Notes editor workspace fills the module area without internal outer padding.
- Module preview sections should behave as separate module surfaces instead of one large selected object.
- Project editable fields are user-filled inputs in the main workspace.
- Projects remove the duplicate top `Новый проект` button and the right inspector panel from the default list screen.
- Diary uses a compact header, removes the top `+ Запись` action, removes the right selected-day panel from the initial month screen, and lets the calendar fill the remaining workspace.

## 2026-05-07: Health Finance Trading Settings Corrections

- Physical Health only creates body zones as the primary action. After adding a zone, the user is taken into that zone's workspace to describe what bothers them, the conditions/triggers, and optionally a doctor appointment.
- Physical Health does not show separate `История` and `Врачи` sidebar sections in the current preview; those concepts live inside the selected zone workflow.
- Finance is account-first in the current preview. The section should not show `Операции`, `Доходы`, or `Расходы` as sidebar sections if the only primary creation action is adding `Счёт`.
- Trading mode buttons `Фьючерсы` and `Мемекоины` belong at the very top center, Trading has no right inspector panel, and Memecoins gets its own separate slide.
- Settings has no right inspector panel; all primary settings information is shown in the central workspace.

## 2026-05-07: Task Width Correction

- Task list content spans the full width of the task workspace section in both no-selection and selected/editing states. The list should not sit inside a narrower padded column.

## 2026-05-07: Notes Tabs And Focus Controls

- Notes tabs use equal widths. When there are too many open tabs to fit naturally, all tabs divide the available tab bar width evenly.
- Notes removes the bottom status strip with vault name, word count, backlink count, and Markdown label from the product UI.
- Focus main view has a visible `Выбрать задачу` button.
- Focus pause and stop controls use video-player-style icon buttons instead of text-only buttons.

## 2026-05-07: Home Reference Variant Replacement

- The provided two-column Home reference is the primary Home module screen in the browser design board; this was later updated to the light photo variant.
- The previous Home layout was temporarily kept in the board as `Главная: старый вариант`; this was superseded later the same day by removing the old scene.
- Focus remains excluded from Home and Calendar in the MVP; the updated Home preview does not promote Focus sessions into the daily schedule.

## 2026-05-07: Home Reference Refinement

- The Home screen should be closer to the provided photo reference: compact dark neutral cards, earlier timeline starts, current-time guide line, and tighter placement of card groups against each timeline.
- The separate `Главная: старый вариант` scene is removed from the browser design board.

## 2026-05-07: Stage 1 Desktop Foundation

- Stage 1 implementation target is the real Tauri desktop app under `apps/desktop`, not another HTML design board.
- The foundation uses Tauri 2, React, TypeScript, Vite, and a Rust workspace.
- Rust boundaries are split into `lifeos-core`, `lifeos-storage`, and `lifeos-sync` crates.
- The first Tauri command is `get_app_status`, with a typed frontend call and tests covering the command contract.

## 2026-05-07: Light-First Design Direction

- Plans changed: the initial LifeOS v4 app and active browser design should be built in the light theme first.
- Dark theme remains planned, but only after the light baseline is settled.
- The Home reference is now the light photo variant: white schedule cards, light workspace background, colored icons, completion circles, and current-time guide line.
- Task list quick add appears as a rounded `Добавить задачу` row directly under the selected `Сегодня` list title, followed by `Просрочено`.
- Task priority is not shown as separate right-side `P1/P2/P3` badges in the task list. Priority is indicated in the completion square/check area.

## 2026-05-07: Stage 3 Module Registry Contract

- The production desktop app uses a typed module registry as the source of truth for module identity, label, lucide icon, route, rail order, visibility, and capability flags.
- The 13 MVP modules are visible in this order: Home, Tasks, Habits, Calendar, Projects, Notes, Diary, Physical Health, Psychological Health, Finance, Focus, Trading, Settings.
- Registry order uses sparse numeric values so future modules can be inserted without renumbering the current MVP order.
- Module visibility supports `visible`, `hidden`, and `disabled`: visible modules appear in the left rail, hidden modules can still be routed directly, and disabled modules do not resolve as active routes.
- Capability flags are descriptive contract metadata for shell and later settings/search work. They do not implement module business logic by themselves.
- All module routes render through the shared `AppShell` and `Workspace`; the global left rail remains visible for every module route.

## 2026-05-07: Stage 4 Local Data Core

- Structured local data now uses a Rust-owned SQLite database named `lifeos.sqlite3` opened from the resolved runtime data root.
- SQLite schema state is tracked in `schema_migrations`; migrations must be idempotent and safe to apply on every app startup.
- `lifeos-core` owns stable UUID-backed `RecordId` values, Unix-millisecond timestamp helpers, base errors, and the first app settings type.
- The first persisted settings shape is theme, language, wake time, and sleep time.
- The desktop app exposes typed Tauri commands for `get_data_health`, `read_settings`, and `write_settings`, with a TypeScript bridge for frontend usage.
- Cloud sync, cloud authentication, device pairing, and provider adapters remain out of scope for Stage 4.

## 2026-05-08: Stage 5 Sync-Ready Storage Boundary

- Sync/storage is provider-neutral at the core boundary.
- The MVP provider is `local-manual`: it uses a local root, has no remote root, requires no OAuth/cloud account, exposes local/manual/change-log capabilities, and can start with `never_synced` status.
- Structured storage owns a local `change_log` table and repository for record id, module id, operation, changed fields or payload summary, updated timestamp, and deleted flag.
- Settings writes are the first integrated real storage change that appends a change-log entry.
- Google Drive, Yandex Disk, Dropbox, OneDrive, OAuth, device pairing, conflict UI, and real cloud sync remain future adapters/features and must not become core storage dependencies.

## 2026-05-08: Stage 7 Tasks Anchor

- Tasks now use a Rust-owned domain model with title as the only required field.
- Optional task fields are description, date, time, priority, recurrence, reminders, and subtasks.
- Historical Stage 7 note: tags, status, approximate duration, task-project links, Kanban, and repeat-by-completion-date were not implemented in that stage. Superseded on 2026-05-19 for status: the initial task statuses are now implemented; tags, approximate duration, task-project links, Kanban implementation, and repeat-by-completion-date remain deferred.
- Recurring tasks are stored as separate persisted task records per occurrence. Completing the current occurrence marks that record completed and inserts the next occurrence with a new `RecordId`.
- Stage 7 recurrence advances by due date for daily, weekly, monthly, and yearly cadences using local device date rules.
- Task persistence uses SQLite `tasks` and `task_lists` tables and appends task changes to the existing `change_log`.
- Task priority is represented in the completion square/check area rather than as right-side `P1/P2/P3` badges.
- The Tasks UI includes Today, Inbox, Next 7 days, Overdue, user lists, Completed, and Trash, with a title-only quick-add row under the selected list title.

## 2026-05-08: Stage 8 Calendar And Reminders Foundation

- Calendar events are now structured records with title, date, optional start/end time, recurrence, description, optional reminder, default color, and created/updated/deleted timestamps.
- Calendar and Reminders share local schedule domain types and recurrence presets for every day, selected weekdays, weekly, selected days of month, monthly, and yearly.
- Calendar Month is the default implemented view and orders entries as timed tasks, Calendar events, then untimed tasks.
- Calendar Month reads scheduled tasks from the Tasks source and does not create duplicate task records.
- Calendar Month excludes habits and reminders. Day, Three-day, and Week schedule helpers are present and can include timed habits after the Habits data source exists.
- Reminder records are separate from tasks/events/habits and are not completable. Reminder source is explicit: standalone, task, habit, or Calendar event.
- The implemented notification path produces due reminder payloads with channel `windows_system` through Rust/storage/Tauri helpers. Actual Windows toast dispatch is not yet wired and remains a follow-up integration.

## 2026-05-08: Stage 12 Notes And Markdown Vault

- Notes use an app-owned local folder under the resolved runtime data root at `notes/`.
- Markdown `.md` files inside the notes folder are the Notes source of truth. SQLite is not the canonical store for note content.
- The default note attachment boundary is `notes/_attachments/`, while Obsidian imports preserve imported attachment/image files at their relative paths.
- Visible file-tree labels and open tabs hide the `.md` suffix.
- The Notes file tree supports nested folders and disclosure chevrons.
- Open note tabs use equal widths and divide the available tab bar space when many tabs are open.
- Search, tags, backlinks, graph edges, and attachment references are rebuildable indexes derived from Markdown files.
- Wikilinks are the MVP basis for backlinks and graph generation.
- Obsidian import copies local vault Markdown files, nested folders, and non-Markdown attachments/images into the app-owned notes folder.
- Obsidian plugins, vault switching, note templates, structured frontmatter/properties editing, and note-to-task/project/habit links are not MVP.
- The Notes workspace must not show a bottom status strip for vault name, word count, backlink count, or Markdown labels.

## 2026-05-08: Stage 13 Basic Real Modules

- Projects now use a compact project list and central editable fields. Projects still do not own tasks, and Kanban/progress/deadline concepts remain out of MVP.
- Diary now starts from a month calendar and opens selected days in a modal with rating, mood, energy, `Что сделано`, writing, and media fields.
- Physical Health now starts from `+ Зона тела`; the selected zone contains complaint, context/triggers, doctor appointment, visit notes, and attachments fields.
- Psychological Health MVP is mood/energy/mental-state/reflection tracking aligned with Diary, not a therapy/CBT workflow yet.
- Finance remains account-first in Stage 13. Account creation is primary, and transaction fields exist as an account-local model boundary rather than as a full transaction workflow.
- Trading uses separate `Фьючерсы` and `Мемекоины` journal surfaces with a top-centered mode selector and no right inspector.
- Settings uses the confirmed group sidebar and a central workspace for appearance, modules, Home, notifications, and data. It does not use a right inspector.
- Stage 13 basic-module records persist in a frontend local record store so the surfaces are real and reload-safe. Promoting Projects, Diary, Health, Finance, and Trading records to Rust/SQLite canonical storage remains future work.

## 2026-05-08: Stage 14 Backup, Export, Search, And Data Safety

- Before cloud sync, LifeOS v4 must support local data-safety actions in Settings > Data.
- Readable export creates a data-root `exports/lifeos-export-*` folder with structured JSON for SQLite records, copied Markdown/files for Notes, generated Markdown for Diary entries, a manifest, and explicit limitations.
- Local backup creates a data-root `backups/lifeos-backup-*` folder with a SQLite snapshot, Notes folder copy, frontend basic-module snapshot when supplied by the UI, manifest, and integrity report.
- Search is a rebuildable cache under the data root at `search/index.sqlite3`; it indexes structured SQLite records, Notes Markdown, and Stage 13 frontend basic-module records when Settings passes the current frontend snapshot.
- Cross-module integrity checks cover storage health plus current known references such as task list ids, reminder sources, Focus task references, and missing Notes wikilink targets.
- Historical Stage 14 note before 2026-05-18: automated restore/import was not MVP and recovery was manual while LifeOS was closed. This is superseded by the staged artifact version `1` apply flow; future preserve-both/remap modes remain unresolved.
- Stage 13 basic-module records still live in an interim frontend snapshot. Packaged desktop stores that snapshot under the install-local data root in `frontend-records.json`; browser `localStorage` is preview fallback only when Tauri is unavailable. Export, backup, and search include those records only through the Settings UI snapshot until those modules are promoted to canonical Rust/SQLite or Markdown storage.

## 2026-05-08: Stage 15 Visual QA And Micro Details

- Stage 15 is a polish pass over the working desktop flows, not an architecture redesign.
- The active UI remains light-first across all modules with tokenized tinted neutrals and shared module surfaces.
- Module workspaces must fill the shell and avoid decorative outer app cards, nested card structure for ordinary layout, large empty margins, decorative radial/glow backgrounds, and thick colored side-stripe accents.
- Home should remain close to the approved light two-column schedule reference with raised light cards, colored leading icons, completion circles, current-time guide, and a visible sleep boundary.
- Visible product UI should avoid technical/reference helper copy and internal ids. Data/search results should prefer user-facing module names over raw module ids.

## 2026-05-08: Stage 16 Mobile Readiness Pass

- Stage 16 is an audit and documentation pass only; it does not create iOS or Android code.
- Future smartphone apps should reuse the desktop data contracts and future sync boundary instead of introducing a mobile-only model.
- First likely mobile scope is the daily execution set: Home, Tasks, Habits, Calendar, Focus quick controls, and Reminders.
- Notes and other file-heavy Markdown workflows stay deferred for mobile until mobile file/vault behavior is designed.
- Historical note, superseded on 2026-05-18: Projects, Diary, Physical Health, Psychological Health, Finance, and Trading were deferred for mobile until their Stage 13 frontend-local records were promoted to canonical Rust/SQLite or Markdown storage. Projects, Contacts, Diary, Physical Health, Finance, and Trading now have canonical desktop storage, but mobile work remains deferred until the desktop modules are ideal.
- Desktop-only assumptions found for future mobile work: `windows_system` reminder payloads, install-local desktop data paths in storage/data-safety surfaces, interim frontend snapshots for Stage 13 modules, local-device time without a multi-device time-zone policy, inconsistent module id formats across registry and storage/search surfaces, and a change log that still lacks device/operation/revision/conflict metadata.

## 2026-05-08: Home Web Reference Matching Pass

- The browser Home module should match the supplied light screenshot as the primary visual reference.
- The first web viewport should show the Home product screen itself, without the design-board header or section label above it.
- The reference geometry is a full-height light screen with compact header, global icon rail, two timeline columns, white raised schedule cards, colored leading icons and narrow semantic rails, completion circles, current-time label/dot/guide line, visible lower timeline space, no decorative stacked duplicate cards, and no lower-right spark mark.
- The reference wake/sleep range `07:00-22:30` splits at its midpoint: the left timeline label is `07:00-14:45`, and the right timeline label is `14:45-22:30`.
- The sleep card belongs at the bottom of the second timeline window.

## 2026-05-09: Browser-Wide Home-Based Web Redesign

- The web design board now uses the approved Home light reference as the visual baseline for every module screen.
- All web modules should share the same light shell language: compact global icon rail, pale side panels, tinted workspace background, compact header bars, raised light surfaces, dense rows, semantic badges, and lucide-style icon buttons.
- Non-Home web modules use the Tasks-like reference geometry for consistency: 40px global rail, 214px contextual sidebar when present, compact 55px headers, and full-height tinted workspaces.
- Module-specific structure remains intact. Tasks, Calendar, Notes, Focus, Projects, Diary, Health, Finance, Trading, Settings, and scene boards keep their own workflows while adopting the Home-derived light surfaces.
- The active browser design must not mix module-level dark surfaces with the Home-based light baseline. Dark mode remains a later app-wide theme boundary.

## 2026-05-09: Tasks Web Screenshot Matching Pass

- The default browser Tasks screen should match the supplied light screenshot as the current reference.
- The Tasks reference keeps the TickTick-like smart-list sidebar and default no-selection workspace: compact `Сегодня` header, quick-add row, grouped raised task cards, dense checkbox rows, red overdue dates, gray right-side time indicators, and small inline chips.
- Tasks plus icons for quick-add and sidebar list creation should be subdued secondary controls, and the selected-task editor footer/source-list row should sit at the bottom of the right panel.
- The selected-task editor remains a separate secondary Tasks screen and is not the target of this screenshot-matching pass.

## 2026-05-09: Habits Web Reference Matching Pass

- Habits should use the supplied TickTick-like habit screen as a layout reference without adopting its orange shell branding.
- The browser Habits reference uses LifeOS light shell, global rail only, compact header controls, a weekly day strip, selected habit list row, and a right detail panel with metric cards, monthly registration grid, and journal block.

## 2026-05-09: Cross-Module Browser Annotation Corrections

- Calendar Month cells must stay within the module viewport on the browser design board; overflow is internal to cells/rows, not below the screen boundary.
- Notes and other side navigations should hide empty count placeholders instead of showing unlabeled pale circles.
- Notes backlinks/graph column spans the full workspace height.
- Projects core fields are vertical labels paired with editable user text fields.
- Physical Health selected body-zone screen opens to a choice between creating a note and adding a doctor appointment; the top header does not duplicate `+ Зона тела`.
- Finance uses the left sidebar for accounts and the central workspace for selected-account transactions; the top header does not show `+ Счёт`.

## 2026-05-10: Browser Habits And Calendar Reference Corrections

- The selected-task editor footer/source-list row must sit at the bottom edge of the right editor panel, not float above the panel bottom.
- The browser Habits module should match the supplied TickTick-like reference more closely: weekly strip with progress rings and `Сегодня` selected day, dense habit rows with streak/completion text, and a right detail panel with metric cards, monthly grid, note input, and journal block.
- The browser Calendar Month module should match the supplied dense TickTick-like month screenshot: compact header actions, full workspace grid, separate light day cells, compact colored item bars with icons, title, and right-aligned time.

## 2026-05-10: Accepted Light Reference Propagation To Remaining Modules

- The accepted light browser design language from Home, Tasks, Habits, and Calendar Month now applies to the remaining module previews.
- Calendar Week, Three-day, and Day use the same light calendar shell as Month: compact header, full-height workspace, pale time grid, and compact colored schedule blocks.
- Notes keeps its Obsidian-like file tree, equal tabs, editor, preview, backlinks, and graph, but the workspace is light and consistent with the rest of LifeOS.
- Focus, Projects, Diary, Physical Health, Psychological Health, Finance, Trading, Settings, and module scenes use the shared 40px rail, 214px contextual sidebar where present, compact headers, tinted workspace background, raised light surfaces, dense rows, and module-specific compact controls.
- The browser board should no longer leave the later modules in older dark/generic-card styling after the Home-to-Calendar accepted reference pass.

## 2026-05-10: Browser Annotation Fixes For Calendar Day And Projects

- Calendar Week, Three-day, and Day browser grids follow the same day bounds as Home/Settings: `07:00` wake time to `22:30` sleep time in the current reference.
- Calendar schedule blocks in those views must span by actual start/end time. A `11:00-16:00` block should visually run from 11:00 to 16:00, not use a fixed short/tall placeholder height.
- Projects should not show a duplicate central project list under the selected project's fields. The sidebar owns project selection; the main workspace owns selected-project editable fields.

## 2026-05-10: Browser Annotation Fixes For Diary, Finance, Trading, And Settings

- Calendar Week, Three-day, and Day time labels must stay in the left time rail with evenly spaced grid rows from wake time to sleep time.
- Calendar schedule grid lines in the browser reference should be explicit positioned lines, not repeating background tiles, to avoid visibly uneven time spacing.
- Diary Month has no module-local sidebar in the browser reference; the month calendar expands across the workspace.
- Diary Month cells show only the day number and optional `?/10` rating next to it. Inline entry labels, media counts, or completed-item counts do not appear in the month cells.
- Diary day color follows the rating scale from red at `0/10` to green at `10/10`, and editing/filling the day starts only after selecting that day.
- Finance initially considered a compact transaction-entry area in the selected account workspace, but the later accepted refinement supersedes this: no always-visible new-transaction panel on initial load.
- Trading rows must show deal date and time. Futures break-even result status is named `безубыток`.
- Memecoin entry capitalization and trade reasons belong to each individual pair/deal row, not to global top cards; those top cards are removed from the browser reference.
- Settings sidebar includes `Синхронизация` as a first-class group between notifications and data.

## 2026-05-10: Browser Annotation Fixes For Focus And Remaining Detail Fields

- Focus right panel shows weekday columns for Focus time spent on each day instead of a session property form.
- Focus sound selection is an option grid for built-in sounds/mute state; the separate statistics card and `выбрана` task badge are removed from the browser reference.
- The Focus header action opens the active Focus module in a compact mini-window, tied to the selected task when one exists or to the taskless session otherwise.
- Diary rating remains in `?/10` format but is aligned to the right side of the day header; rated days receive stronger red-to-green color fills.
- Finance transaction creation and transaction rows include time in addition to date.
- Trading deal creation includes an explicit user-entered pair field; journal rows show pairs such as `BTC/USDT` or `PEPE/SOL`, not only ticker names.

## 2026-05-10: Browser Annotation Refinements For Calendar, Focus, Finance, And Trading

- Calendar Week, Three-day, and Day time labels sit inside the left time rows, not directly on horizontal grid lines.
- Focus statistics panel is titled `Статистика`, shows six previous date columns plus today's column on the right, and uses a side time scale instead of captions under each bar.
- Focus sound options do not show secondary captions such as `тихо` or `выкл`.
- The compact Focus control button switches to mini-window mode; the preview should not show a separate floating mini-window card by default.
- Diary rated-day outlines are thicker and more visible.
- Finance does not show an always-visible new-transaction panel on initial load. The `Записать` action opens the transaction modal/window.
- Finance sidebar values are plain text without pill outlines.
- Trading deal entry and journal rows stretch across the available workspace width.

## 2026-05-10: Browser Annotation Refinements For Module Scenes, Finance Icons, And Trading Rules

- The module-scenes board should not include the `Выполнено / Корзина` scene card.
- Finance account icons currently reuse the main Finance module icon; custom per-account icons are deferred.
- Trading journal screens do not show an always-visible `Новая сделка` form. The `+ Сделка` action owns creation.
- Trading rows use explicit columns for pair, time, entry price, leverage, volume, direction, and result.
- Trading top selector has three equal centered buttons: `Фьючерсы`, `Мемекоины`, and `Правила`.
- `Правила` opens its own rules-editing preview screen.

## 2026-05-10: Browser Annotation Refinements For Trading Columns And Rules Note

- Trading journal columns must be visually aligned across the header and every deal row.
- Trading rules should be formatted as a note, not as a two-column form/table.
- The trading rules note can be detached into a mini-window.
- The detached rules mini-window should stay above all other app windows during trading so the rules remain visible.

## 2026-05-10: Production App Design System Application

- The `lifeos-v4-logic-scenes-v1.html` page remains the reference board and must not be deleted, renamed, or replaced during production app styling work.
- The shared light reference is now applied to the real Tauri + React desktop app through global tokens, shell/header styling, contextual sidebar width, raised surfaces, dense rows, badges, buttons, inputs, and modals.
- This production pass is a design-system application over existing module logic. Module screens must keep their current state, forms, data calls, navigation, and interactions instead of being replaced by static reference-board markup.
- Production-visible buttons and icon buttons must not be decorative. They either execute an existing action, open a modal/menu/picker, toggle state, focus a controlled field, or render as honestly disabled with a clear `aria-label`/`title`.

## 2026-05-10: Production Home Reference Match

- Production Home should match the accepted web Home reference directly in the real React/Tauri module, not by replacing or deleting the HTML reference board.
- The Home header uses `Главная`, the accepted subtitle, and only a compact gear settings icon on the right. The gear opens a working day-boundary modal/popover with editable wake/sleep fields and a save action only; it must not show a secondary `Открыть настройки` button.
- Home cards retain source `kind` and `sourceId`. Task and habit completion circles are real completion actions; event/reminder circles are visual only and must not behave like completion buttons.
- Timeline time labels are item-driven: show `07:00`, `14:45`, `22:30`, or any other time beside the vertical line only when an actual source card exists at that time. Empty day-boundary labels stay hidden.
- If `Сон` exists as a source timeline item at the configured sleep time, it renders at the bottom of the second timeline column instead of being duplicated by a synthetic sleep-boundary card.

## 2026-05-10: Production Tasks Reference Match

- Production `TasksModuleScreen` should match the supplied web Tasks reference screenshots directly while preserving the real task/list module logic.
- Today includes an overdue group above today's tasks, with dense grouped rows, compact quick add, smart lists, user lists, and system `Выполнено`/`Корзина` navigation.
- Task rows use red right-side overdue dates and neutral gray right-side timed metadata.
- The selected-task right panel uses TickTick-like action rows: date/reminder, priority, menu, source list, notes/reminder/footer actions, and delete/list assignment must have working actions or minimal popovers rather than empty buttons.
- The right-panel footer/source-list row stays pinned to the bottom edge of the panel.

## 2026-05-11: Production Calendar Reference Match

- Production `CalendarModuleScreen` should match the supplied light web Calendar Month reference directly while preserving the existing dynamic Month, Week, Three-day, and Day views.
- The Calendar HTML reference page remains reference material and must not be deleted or replaced.
- Calendar Month uses no persistent module-local sidebar, starts weeks on Sunday, shows a month-only title, and renders separate raised light day cells with compact colored record pills, icons, clipped titles, and right-aligned times.
- `+ Событие` opens a working create-event form. Calendar events are editable by clicking event pills/blocks. Calendar still creates only events; tasks/habits remain projections from their source modules.
- Month/Week/3 days/Day switchers, Today, previous/next, and overflow menu controls must have real behavior. Unavailable controls, such as search, must be honestly disabled.
- Week, Three-day, and Day use the same visual system as Month: compact header, full-height grid, left time rail, explicit positioned schedule lines, and duration-based blocks.

## 2026-05-11: Production Remaining Modules Reference Match

- Production Notes, Focus, Projects, Diary, Physical Health, Psychological Health, Finance, Trading, and Settings should use the accepted Home/Tasks light reference language while preserving real module state, forms, navigation, and local persistence.
- Notes must keep working file tree navigation, equal tabs, editor/preview, and full-height backlinks/graph panel.
- Focus must keep optional task selection, timer controls, sound controls, mini-mode button, and right statistics panel.
- Diary month cells show only day number plus optional `?/10` rating; editing remains modal after selecting a day.
- Physical Health selected zones expose action-backed note/doctor modes.
- Psychological Health sidebar rows are selectable controls.
- Finance shows account list on the left, transaction history in the main workspace, and a modal-backed `Записать` transaction flow.
- Trading uses working tabs for `Фьючерсы`, `Мемекоины`, and `Правила`, aligned journal rows, and modal-backed `+ Сделка`.
- Settings group rows are clickable, module/notification/sync controls are stateful, and unavailable cloud sync is rendered as an honest disabled action.

## 2026-05-11: Browser Annotation Fixes For Tasks And Notes

- Tasks quick-add focus must outline the whole add field when the user is adding a task, not only the text input.
- The Notes sidebar new-note icon button should stay centered inside its fixed icon-button box.
- Obsidian vault import belongs in Settings > Data as an app-level data action, not inside the Notes right reference/backlinks panel.

## 2026-05-12: Browser Annotation Fixes For Notes Workspace Chrome

- Notes should not show the shared workspace header/title or local runtime status badge above the module surface.
- The Notes file tree starts at the top of the module area and uses an Obsidian-like icon action strip instead of the text title `Файлы`.
- The icon strip should be centered.
- New note and new folder are working vault actions. They create inside the selected folder when one is selected, otherwise at the vault root, following Obsidian's mental model.
- Sorting and collapse-style vault actions can be shown as honest disabled controls until implemented.
- Notes should not show a default fake editor page. The title/view toolbar and editor/preview area appear only after the user opens or creates a note.
- The right backlinks/tags/attachments/graph reference panel is hidden by default and shown from an explicit tab-bar toggle.

## 2026-05-12: Habits Creation UX Corrections

- New habit creation should follow TickTick-like behavior: the user should not see or choose an internal habit type dropdown in the creation modal.
- A newly created habit defaults to `1 раз в день`.
- Multiple daily completions are configured only after the user opens `Добавить повторения`; values above `1` create a quantity/count habit with that target count.
- Selecting `Дни недели` must reveal weekday buttons immediately so the user chooses the habit's active weekdays. At least one weekday should remain selected.
- The selected day badge in the Habits week strip is labeled `Сегодня`, not `Сейчас`.
- Habits weekday order is Monday through Sunday (`Пн`-`Вс`) in the week strip, weekday picker, and monthly registration grid.
- The selected `Сегодня` badge must have enough pill padding so the text does not touch the edge.
- Users can delete a habit from the habit actions menu; deletion is soft-delete in data and removes the habit from active views.
- The browser preview at `http://127.0.0.1:1420` should allow habit creation and progress checks outside Tauri through local browser storage so product review is possible in the browser.

## 2026-05-12: Projects Creation And Status Chrome

- Projects should not show the top-right `Локально` runtime pill or the selected-project `Редактируется` badge in the visible workspace.
- Project creation should mirror Tasks list creation: a quiet plus icon sits on the same left-sidebar header row as `Проекты`, and the project-title entry row appears only after pressing that plus.
- Projects should not show the shared top workspace module header. The Projects screen starts directly with the sidebar `Проекты` row and selected-project workspace.
- The selected project name is edited directly in the selected-project header. The separate `Название` row in the project field grid is removed.
- Remove the extra horizontal divider line under the Projects header area when it reads as a stray line across the workspace.

## 2026-05-12: Tasks Quick Add Interaction Fixes

- In Tasks quick-add, pressing Enter in the text input creates the task immediately through the same quick-add submission path as the leading plus button.
- The quick-add calendar icon is a date picker/preset menu for the quick task, not an entry point to the full new-task modal.
- The leading `+` icon must not overlap or replace typed quick-add text.
- The browser preview at `http://127.0.0.1:1420/#/tasks` must support adding task data without the Tauri runtime by using a localStorage fallback, while the packaged desktop app continues to use Rust/SQLite commands.

## 2026-05-12: Tasks Quick Add Time And Row Selection Refinement

- The Tasks quick-add date popover also includes a time input so a quick-created task can be scheduled with both date and time from the same small window.
- When the user starts typing into quick-add, the title begins at the left edge of the input row instead of being offset by the leading plus icon.
- The quick-add row and task group rows should be flat, without raised drop shadows.
- Selecting a task should work from the whole row, including the right-side date/time metadata and empty row area. The completion checkbox remains an isolated completion action.

## 2026-05-13: Tasks Completed Row Muted State

- Completed task rows should not keep active overdue styling. Their completion square is muted/neutral, and old due dates or times render as completed metadata rather than red overdue warnings.

## 2026-05-13: Tasks Detail Panel Resizing

- The vertical divider between the task list and selected-task editor is an interactive resize handle.
- Dragging the divider changes the selected-task editor width within bounded limits so the task list remains usable.
- The resized width persists locally for browser/desktop use and does not change task data.

## 2026-05-13: Tasks Inbox Shows All Active Tasks

- `Входящие` in Tasks is the all-active-tasks smart list.
- It includes dated tasks, overdue tasks, future tasks, no-date tasks, and tasks assigned to user lists.
- Completed and deleted tasks remain excluded because they belong to the Completed and Trash system views.

## 2026-05-13: Tasks Today Includes Habits

- `Сегодня` in the Tasks module shows both active task records for today/overdue and habits scheduled for the current date.
- Habit rows shown in Tasks remain habit records: completing them writes habit progress for that date rather than creating duplicate task records.
- Deleted habits are excluded from Tasks Today.

## 2026-05-12: Focus Session Control Placement And Result Note Timing

- Focus removes both duplicated title areas: the shared top workspace `Фокус` header and the inner selected-task/status header above the timer.
- Focus session actions sit together in the lower center area under the timer: sound selection, start/pause/resume, finish session, and mini-window.
- The result-note panel appears only after a session ends, either when the timer reaches zero or when the user finishes the session manually.

## 2026-05-12: Focus Taskless Start And Statistics Cleanup

- Focus can start without a selected task.
- When active tasks exist, the Focus task selector still offers `Без задачи` so taskless start remains explicit.
- A taskless session uses the title `Фокус без задачи` and remains a Focus history record without completing any task.
- The browser preview at `http://127.0.0.1:1420/#/focus` must support Focus session start, pause/resume, stop, completion, and history through localStorage when the Tauri runtime is unavailable; packaged desktop mode remains Rust/SQLite-backed.
- The Focus statistics panel header does not show a total-minutes chip such as `0 мин`.
- The Focus statistics side scale labels are aligned to the left edge.

## 2026-05-12: Calendar Browser Creation And Grid Alignment

- The Calendar browser preview at `http://127.0.0.1:1420/#/calendar` must allow event creation and editing without the Tauri runtime through a local browser-storage fallback, while the packaged desktop app continues to use Rust/SQLite commands.
- Week, Three-day, and Day schedule views should keep time labels, explicit grid lines, day columns, and event blocks aligned by one percentage-based time scale. Fixed CSS row templates for time labels are not acceptable because they can drift from the grid.

## 2026-05-12: Calendar Event Styling, Time Rail, Search, And Recurrence

- Calendar event chips and schedule blocks should be flat without raised shadows.
- Week, Three-day, and Day use a shared neutral left time rail; the blue highlighted time column is removed.
- The disabled Calendar search button is removed from the top-right toolbar until a real Calendar search surface is implemented.
- Calendar recurrence must affect displayed occurrences, not just stored form data. Yearly events appear on the same month/day in future years across Month, Week, Three-day, and Day views.
- Calendar event editing includes a `Удалить` button. Deletion requires confirming `Вы точно хотите удалить это событие?` and then soft-deletes the event through the existing update boundary.

## 2026-05-12: Calendar Time Rail Markup Refinement

- Week, Three-day, and Day time labels should be centered inside visible hour bands rather than placed directly on horizontal grid lines.
- Wake/sleep boundaries remain schedule grid boundaries, but the bottom boundary is not rendered as a clipped time label.
- The fixed left time rail should stay clean, without horizontal grid lines running behind the labels; explicit schedule lines remain in the day columns.

## 2026-05-12: Home Day Boundary Ownership

- Home wake/sleep defaults are `07:00` and `22:30`.
- Wake/sleep boundaries change only when the user explicitly edits them in Settings or in the Home day-boundary control.
- Source records, including habits or events named `Подъем` or `Сон`, do not change the persisted wake/sleep boundaries.
- Home shows both default boundary cards: `Подъем` at the top of the first timeline window and `Сон` at the bottom of the second timeline window.
- The Home day-boundary modal edits wake/sleep directly and shows only the save action; it must not include an `Открыть настройки` shortcut button.
- Wake and sleep boundary cards use the same empty round right-side mark as incomplete normal task cards.
- Home schedule cards are slightly narrower than the full available column width. The vertical timeline rails start at their labeled time windows, must not overlap the range labels, and include a short lower tail below the window end.

## 2026-05-12: Physical Health Creation And Note Flow

- The Physical Health route should not show the shared top workspace header/title above the module surface.
- Adding a body zone should follow the Tasks list pattern: a quiet plus icon in the `Зоны тела` sidebar header reveals the zone-name input row.
- The selected-zone action previously named `Создать заметку` is now named `Заметки`.
- Inside `Заметки`, the user gets a separate `Создать заметку` button; pressing it opens a modal window for the new health note.
- The doctor workflow action is named `Приемы у врача`.
- The selected-zone workspace does not repeat the active zone as a separate `Зона` field and does not repeat an inner `Заметки` heading under the `Заметки` action.
- Physical Health attachment picking belongs inside the health-note creation modal, represented by a compact paperclip button. The current Stage 13 implementation stores selected attachment file names in the frontend record while shared durable attachment storage remains open.
- The health-note modal save action is centered under the modal fields.

## 2026-05-12: Diary Day Modal Corrections

- The Diary route should not show the shared top workspace header/title or top-right `Локально` runtime badge above the month grid.
- The day-entry modal should be wider than the previous compact modal so the daily fields, completed list, writing field, and media previews fit without cramped layout.
- `Что сделано` in Diary is not a plain textarea: it shows completed tasks and completed habits for the selected day, and still allows the user to add manual done items for work that was not captured in Tasks or Habits.
- Diary media uses an explicit attach-media control in the day modal. Attached media previews render at the end of the modal after the day writing field.
- The current frontend MVP may store attached Diary media as local record data for review, but durable attachment folder/export rules remain a separate storage question.

## 2026-05-12: Diary Media Review And Context Actions

- Diary attached media previews can be opened into a full-screen review overlay so images and videos can be inspected at readable size.
- Diary media cards support a right-click context menu with `Переименовать` and `Удалить` actions.
- Renaming media changes the display name stored with the diary attachment record.
- Manual `Что сделано` items use a neutral dot marker instead of a plus icon.

## 2026-05-12: Trading Journal And Rules Corrections

- The Trading route should not show the shared top workspace module header/title above the module surface.
- Futures and Memecoins journal screens must not show the full deal parameter form inline under the table.
- `+ Сделка` opens a modal with the full parameters for the active journal mode.
- Each Trading type has two separate same-format journals: `Реальный` and `На бумаге`. `На бумаге` is for testing a hypothesis without treating the entry as a real trade.
- Futures and Memecoins screens switch between `Реальный` and `На бумаге` with a local button/segmented control; new deals are created in the selected journal.
- Trading rows include a `Статус` column.
- Futures deal modal fields are ticker, date, time, direction, entry price, leverage, status, volume, reason, result, and media.
- Futures direction is selected from exactly `Long` or `Short`; the add/edit modal must not allow arbitrary direction text.
- Memecoins deal modal fields are ticker, date, time, entry market cap, status, volume, reason, result, and media.
- Deal status is selected from `Открыта` or `Закрыта`.
- Trading journals are ordered by deal date and time, newest first.
- The new-deal modal submit button says `Добавить сделку`; the journal header action can remain the shorter `+ Сделка`.
- Trading media uses photo-first attachment icon controls, with a fallback file attachment icon.
- The `+ Сделка` action is hidden on the `Правила` tab.
- Trading rules are editable as a full-height note in the Rules screen. The mini-window affordance remains for keeping the rules visible during trading.
## 2026-05-12: Finance Account Header And Transaction Placement

- The Finance route should not show the shared top workspace module header/title above the module surface.
- New account creation needs a clearer compact dialog with account name and currency selection.
- Finance account currency is limited to `RUB` and `USDT` for now; broader currency setup stays deferred.
- The selected account name is editable directly in the account header.
- The account balance is displayed to the right of the account name in the same header.
- The selected-account detail form is removed from the default workspace so transactions move higher.
- Transaction creation belongs in the transaction-history header as a compact add button, not as the top-right account header `Записать` button.
- The transaction modal field previously labeled `Связано с` is now `Описание`.
- Finance transaction recording can include optional time; rows show date and signed amount when time is empty, and `date · time` plus signed amount when time is filled.
- Income transactions increase the selected account balance and expense transactions decrease it. Frontend-local Finance balances are rebuilt from persisted transaction rows on load so existing transaction history cannot leave the account total at zero.

## 2026-05-13: Finance Optional Transaction Time

- Finance transaction creation supports time in addition to date.
- Transaction time is optional rather than mandatory.
- Finance history rows show `date · time` only when a transaction has time; otherwise they show date alone.

## 2026-05-13: Finance Amount Grouping

- Finance displays money amounts with a space as the thousands separator.
- Example: a transaction amount stored as `100000` is shown as `+100 000 RUB`.
- This is display formatting only; stored values and balance arithmetic remain numeric strings without grouping spaces.

## 2026-05-13: Notes Obsidian Public Model Alignment

- Notes uses Obsidian's public architecture vocabulary as the reference boundary: `Vault` maps to local Markdown file/folder operations, `Workspace` maps to note tabs and panes, and `MetadataCache` maps to rebuildable backlinks, tags, attachments, and graph metadata. This remains a product/design reference; LifeOS does not copy Obsidian internals or implement the Obsidian plugin system in the MVP.
- Open note tabs are closable. Closing the active note moves focus to another open tab if one exists; otherwise Notes returns to the empty workspace state.
- The hidden-by-default right reference column is a set of separate metadata panes for backlinks, tags, attachments, and graph. It shows one pane at a time instead of stacking every reference section at once.
- Notes support moving Markdown files between folders from the vault file tree. Dragging a note onto a folder moves it into that folder; dropping it on empty file-tree space moves it back to the vault root. The move preserves Markdown content and uses the same unique-path collision behavior as note creation/rename.
- Notes folders can be nested and moved as folder subtrees from the vault file tree. Dragging a folder onto another folder moves the folder and all nested notes/folders there; dropping a folder on empty file-tree space moves it back to the vault root. Open note tabs are remapped to their new paths after a folder move.
- Notes move behavior must not depend only on drag/drop. File-tree rows also expose explicit move actions: choose the note/folder to move, then choose a folder or root target action.
- Opened notes show a breadcrumb-style path above the note page, and the note title is a large inline title at the beginning of the note surface. Notes should not use a separate labeled `Название` toolbar field for the title.
- Opened Notes use one main note pane at a time. The permanent editor/preview split is removed; a compact note-level button switches between edit and preview modes.

## 2026-05-13: Native Window Frame Reversion

- The prior frameless/invisible-chrome direction is reverted.
- The production desktop app should use the normal native window frame for now.
- LifeOS should not reserve a custom top chrome row, invisible drag row, or internal top offset inside the WebView.
- Every page/module surface should fill the available app height from the top edge of the WebView.

## 2026-05-13: Psychological Health Removed From Visible MVP

- Psychological Health is removed from the visible MVP module set.
- The desktop registry keeps the old `psychologicalHealth` entry disabled so it does not appear in the global rail and `/psychological-health` resolves back to Home.
- The current visible MVP module count is 12: Home, Tasks, Habits, Calendar, Projects, Notes, Diary, Physical Health, Finance, Focus, Trading, and Settings.
- Existing Psychological Health implementation notes and data code are historical/deferred context only unless the user explicitly promotes the module again.

## 2026-05-13: Right-Click Interface Boundary

- Right-clicking ordinary app surfaces should not open any native browser/WebView context menu or other interface.
- Right-click UI is allowed only in explicitly designed product surfaces, such as the Diary media card context actions for rename/delete.

## 2026-05-13: Default Windows Tray Icon

- LifeOS should create a Windows system tray icon by default on app startup.
- The default tray tooltip is `LifeOS v4`.
- The initial tray menu includes `Открыть LifeOS`, `Скрыть в трей`, and `Выход`.
- Clicking the tray icon opens/restores the main LifeOS window; the tray menu can hide the main window without quitting.

## 2026-05-13: Documentation Cleanup And Open Question Triage

- `docs/lifeos-v4/decisions-log.md` is the single confirmed-decision history. The older `docs/lifeos-v4/decisions.md` file was removed to avoid two competing decision logs.
- `docs/lifeos-v4/product-interview.md` was removed as redundant raw discovery capture because its durable decisions have been folded into this decisions log, module specs, and the high-level spec.
- Root `README.md` now reflects the 12 visible MVP modules and treats Psychological Health as disabled/deferred.
- Task labels/tags are not MVP. Label/tag grouping and sorting stay hidden until tags are promoted.
- Timed habits in Home and Calendar Day/Three-day/Week reserve normal schedule blocks in the current MVP implementation. Calendar schedule blocks use a 45-minute default when no explicit end time/duration exists.
- The first Habit detail surface is defined by the current TickTick-like detail panel: selected habit title, four compact stat cards, monthly registration grid, note input, and notes journal. Larger habit detail fields can be future work.
- Focus result notes are stored on the Focus session record in `focus_sessions.result_note`; they do not write back to Diary, Tasks, Calendar, or Markdown in MVP.
- Current Focus MVP statistics are total focused minutes, session count, completed-session count, and a seven-day minutes column chart. Focus streak definition remains open.
- Projects MVP contains standalone editable fields only. Notes/events/focus/files/task links and project progress metrics are deferred.
- Historical note, superseded on 2026-05-18: Diary remains separate from Notes in MVP. It previously used frontend-local records as the current editable source and readable export generated Markdown artifacts; the current canonical Diary direction is Markdown day files at `diary/YYYY-MM-DD.md` plus SQLite `diary_entries` for structured fields and indexing.
- Diary privacy lock, templates, and heatmaps/streaks are deferred; the current MVP month grid shows day number plus optional rating.
- Physical Health MVP uses user-created body zones, not a fixed body-zone taxonomy or clickable body model. Notes capture complaint, context, triggers, and attachments; doctor records capture doctor type, appointment date/time, and visit information.
- Finance MVP is account-first with account name, currency limited to `RUB`/`USDT`, derived balance, and transaction rows containing income/expense type, amount, description, date, and optional time. Categories, budgets, recurring payments, cash/card account types, and cross-module links are deferred.
- Trading MVP is journal-first: Futures and Memecoins use the current modal field sets, Rules is an editable note, and watchlists/stats/structured risk rules/Finance links are deferred.

## 2026-05-13: Personal Dogfood Release Priority

- The next practical release target is a personal-use Windows dogfood build, not a public release.
- The user wants an `.exe` / Windows installer that can be copied to a PC and used in daily work.
- The expected workflow is to use the app personally, collect concrete shortcomings during real usage, then send a grouped fix list for later implementation passes.
- For this stage, unsigned local builds are acceptable as long as SmartScreen/unknown-publisher limitations are stated clearly.
- The handoff package should include exact artifact paths, hashes, signature status, known limitations, backup/export expectations, and a simple issue-capture format.

## 2026-05-13: Trading Plays Quick List

- Trading gets a new top-level list named `Плеи` (`Plays`), placed on the same selector level as `Фьючерсы`, `Щиткоины`, and `Правила`.
- `Плеи` is the main quick-capture surface for recording an investment idea or in-the-moment position when there is no time to fill the full detailed trade journal.
- Plays store quick fields separately from detailed trade entries: ticker/idea, date, time, short note/thesis, optional amount, and media.
- Plays are not real/paper journals and do not show the `Реальный` / `На бумаге` switch. Detailed real/paper separation remains only inside Futures and Shitcoins.
- Automatic conversion from a Play into a detailed Futures/Shitcoins deal is deferred; for now the Play acts as a saved capture to manually turn into a full journal entry later.

## 2026-05-13: Trading Shitcoins And Rule Sections

- The visible Trading label `Мемекоины` is replaced with `Щиткоины`. The internal `memecoins` storage key can remain for compatibility with existing local records.
- The Trading Rules screen changes from one shared note into user-created rule sections.
- Each rule section has a title and body. Example sections include `Колы фьючерсов от других` and `Флип щиткоина на Solana`.
- Rule examples: for external futures calls, analyze win rate, risk, margin availability, take-profit, and evaluate the trade independently; for Solana shitcoin flips, do not hold long without special reasons and document concrete case examples.
- The mini-rules affordance shows the currently selected rule section summary.

## 2026-05-14: Structural Design Exploration Requirement

- Future LifeOS visual option boards must present structurally different interface directions, not only recolored versions of the same shell.
- Acceptable design alternatives should vary navigation model, primary workspace composition, action placement, detail/editor placement, and interaction density while preserving the confirmed product logic for each module.
- Palette-only variations are insufficient for design selection. Color can support a direction, but each candidate must answer what kind of application structure LifeOS should use.

## 2026-05-17: Tasks Right Editor Selection And Scroll Behavior

- Switching between tasks in any Tasks list must update the right editor to the newly selected task, including title, description, subtasks, source list, and controls. The editor must not keep stale field values from the first or previous selected task.
- The selected-task right editor should scroll internally when its content exceeds the available height. The task title remains pinned at the top of the editor body, and the source-list/footer action row remains pinned at the bottom.

## 2026-05-17: Calendar, Finance, And Trading Editing Pass

- Calendar task projections are clickable edit targets. Clicking a task shown in Calendar opens an edit modal for the original Tasks record; saving updates the source task rather than creating a Calendar event copy.
- Finance selected account names remain editable directly in the account header.
- Finance transaction rows are editable from the transaction history. Clicking a row opens the transaction modal in edit mode for type, amount, description, date, and optional time, then recalculates the account balance from canonical transactions.
- Trading deal volume is always a USDT amount. The visible label/header is `Объём, USDT`, and the volume value accepts/stores digits only.

## 2026-05-17: Quick Notes Separate Module

- Quick Notes / Быстрые заметки is a separate visible LifeOS module.
- Quick Notes is not only a tray action and not just a sub-mode of the existing Notes / Obsidian Companion Gateway module.
- The module's core purpose is writing lightweight notes and opening a selected note in a small always-on-top text window.
- The mini-window must be optimized to consume as few resources as practical so it does not noticeably affect the user's PC during games.

## 2026-05-17: Quick Notes Optimized Second-Screen Mini-Window

- Quick Notes mini-window is for second-monitor reference use, not for drawing over the game itself.
- The optimized MVP direction is a lightweight native Windows text mini-window owned by the desktop process, not a second React/WebView route and not an in-app overlay.
- Quick Notes uses canonical Rust/SQLite storage from the start instead of the interim frontend snapshot or Markdown files.
- The MVP mini-window is read-only. Editing happens in the main Quick Notes module, then the selected note text is pushed to the mini-window.
- The mini-window renders plain text only, reuses one window instance, avoids timers, animations, polling, heavy Markdown/graph/backlink work, and avoids disk writes while it is only displaying a note.
- Global hotkey and tray quick-open controls for Quick Notes are deferred until the module and native mini-window are stable.

## 2026-05-17: Quick Notes Native MVP Implementation Contract

- Quick Notes durable records are stored in SQLite through Rust commands and are included in readable export/search data-safety paths.
- The production mini-window is a single native Windows always-on-top read-only text window owned by the desktop process. It is not a second React/WebView route.
- The main editor saves explicitly and on focus/selection boundaries, not on every keystroke or frequent autosave timer.
- The selected note payload is pushed to the mini-window only when the note id/title/body changes.
- The native mini-window chooses a secondary monitor when available, uses no polling/timer/animation/render loop, avoids stealing focus, and is closed through the managed desktop lifecycle.
- Browser/Vite keeps only a dev/demo preview approximation when native Tauri commands are unavailable.
- Runtime verification tracks process count, working set, CPU seconds, and sampled idle CPU percentage.

## 2026-05-17: Global Rail Hover Labels

- Every visible module icon in the global left rail should reveal the module name as a compact highlighted label on pointer hover.
- The same module-name label should appear on keyboard focus so module recognition does not depend only on mouse hover or a native browser tooltip.
- The hover label uses the module color/tokens and keeps the existing accessible `aria-label`, screen-reader text, and `title` fallback.

## 2026-05-17: Settings Sections And Useful Actions

- Settings should be organized as real sidebar sections instead of rendering all controls in one mixed central pile.
- The confirmed Settings sections remain `Оформление`, `Модули`, `Главная`, `Уведомления`, `Синхронизация`, and `Данные`; selecting one shows only that section in the central workspace.
- Settings should include logical actions where the current contracts allow them: reset appearance to the light Russian baseline, reset Home day bounds to `07:00`/`22:30`, bulk-toggle module visibility in the local Settings UI, request/refresh notification diagnostics, and run local backup/search/data-safety actions.

## 2026-05-17: Renderer Module Lazy Loading

- Home remains the eager renderer screen because it is the default route and day-start surface.
- Non-default module screens load through route/module-level dynamic imports: Tasks, Habits, Calendar, Focus, the Basic module bundle for Projects/Contacts/Diary/Physical Health/Finance/Trading, Notes, Quick Notes, and Settings.
- Lazy module navigation keeps the shared `AppShell`, `Workspace`, global rail, route hashes, accessible rail labels, and module-specific view tests intact.
- Lazy loading uses quiet module-level loading and error states instead of decorative placeholders or noisy product copy.

## 2026-05-17: Search Index Execution

- App-wide Settings/Data search uses a rebuildable SQLite FTS cache at `search/index.sqlite3` instead of reparsing a JSON index for every query.
- Rebuilding the search index replaces the previous SQLite cache and removes the legacy `search/index.json` cache when present.
- Search result coverage remains structured records, Notes Markdown, and Settings-supplied frontend basic-module records; result ordering remains deterministic by module and title.

## 2026-05-17: User-Triggered Backup/Export Safety

- Settings-triggered readable export and local backup must be observable and cancellable. The desktop command layer assigns an operation id, emits progress events for phase/files/bytes, and exposes a cancellation command.
- Export/backup artifacts are complete-only. Work is written to `.in-progress` staging directories and finalized only after manifest snapshot validation and final integrity checks.
- Complete manifests write `status: "complete"`, integrity status, relative file paths, byte counts, and SHA-256 checksums. Restore/import dry-run rejects partial/interrupted artifacts, non-complete status, missing snapshots, checksum mismatches, byte-count mismatches, and missing backup database files.
- Local backup validates the copied SQLite snapshot with `PRAGMA integrity_check` before success. Readable export batches habit-log export reads across all habits instead of repeated per-habit calls.

## 2026-05-17: Pre-Update Backup Startup Safety

- Pre-update backup must protect the critical database before any version migration opens SQLite, but it must not make large user-file folders a full blocking startup copy.
- The blocking startup phase copies and validates `lifeos.sqlite3`, SQLite sidecars, `frontend-records.json`, and `frontend-preferences.json`.
- Notes and Diary copy runs as a manifest-based resumable phase. It may continue in the background, emits file/byte progress, updates manifest status while copying, and only finalizes after the snapshot validates.
- Partial pre-update artifacts remain `.in-progress` with non-complete status and must never be treated as complete backups. Interrupted user-file copies resume on a later startup.
- Downgrade/version-reversal startups are backed up too and marked in the manifest. Corrupt critical SQLite snapshots block completion instead of producing a recovery-looking artifact.

## 2026-05-18: Packaged App Smoke QA

- Release QA must include an automated packaged desktop smoke test, not only Rust unit/integration tests and frontend tests.
- The packaged smoke must launch the built `lifeos-v4.exe` from a clean install-like folder and verify the install-local data root, SQLite migrations, readable export, local backup, search index rebuild/search, Notes gateway preference/URI contract, Quick Notes mini-window path, and reminder due/delivery suppression path.
- The owner-facing dogfood gate should run `npm run qa:packaged` from `apps/desktop` after the normal build/test gates. The command builds the unsigned NSIS bundle, copies the release exe into a temporary install sandbox, runs the packaged smoke CLI mode, and writes a JSON report with per-check evidence.

## 2026-05-18: Restore/Import Apply Safety Contract

Superseded on 2026-05-30 for active restore/import policy: apply now merges artifact data into current data after backup-before-restore.

- Restore/import apply is promoted from blocked future work to a supported user operation for artifact version `1` readable exports and local backups, and for complete pre-update backup artifacts in rollback scenarios.
- Restore/import is still dry-run first. Apply is allowed only after strict manifest/version/status/snapshot/checksum checks, artifact content validation, encrypted-artifact rejection, and link validation.
- The collision policy for artifact version `1` is `replace`: current installation data is replaced after creating backup-before-restore. Source IDs are preserved; there is no preserve-both or remap behavior in v1.
- Before apply, LifeOS automatically writes a safety artifact under `backups/backup-before-restore/lifeos-backup-before-restore-*`.
- Apply uses a staged flow: build restored state under `.restore-staging`, validate SQLite integrity and links before commit, replace canonical data paths with rollback copies, validate again, and roll back on commit/post-apply failure.
- The desktop command path temporarily closes the app-managed SQLite handle while replacing files and reopens it after apply. Selecting an old working `data` directory remains a separate "open and use these data" scenario, not restore/import.
- Complete pre-update backup artifacts restore the captured `lifeos.sqlite3`, SQLite sidecars, `notes/`, `diary/`, `frontend-records.json`, and `frontend-preferences.json`. Partial `.in-progress` pre-update artifacts remain blocked.
- Encrypted restore/passphrase restore, preserve-both/remap collision modes, and richer cross-version migration policies remain future work.

## 2026-05-18: Pre-Update Rollback UX

- If release startup fails while creating the pre-update backup, opening/migrating SQLite, opening the Notes vault, or writing the runtime version marker, LifeOS writes `startup-failure.json` in the runtime data root and shows a native startup-failure message with the pre-update backup path when one is available.
- `startup-failure.json` records the failure stage, error message, runtime data root, completed pre-update backup path, manifest path, source app version, failed target app version, version direction, rollback app version, timestamp, and concise owner runbook steps.
- Settings > Data reads the startup failure notice after a later successful startup and surfaces a failed-upgrade rollback block. It also shows the latest pre-update backup status/progress independently of a recorded startup failure.
- Settings > Data offers a complete pre-update artifact as a restore/import source by filling the dry-run path and requiring the existing safe restore flow. Partial `.in-progress` artifacts are visible only as status and are disabled for apply.
- The app-version rule after rollback is explicit: run the pre-update artifact's `source_app_version`, or a later fixed build that explicitly supports that source data version. Do not relaunch the failed target version against restored data unless that build has been fixed.

## 2026-05-18: Basic Module UX Maturity Baseline

- Projects, Contacts, Diary, Physical Health, and Trading must feel like working surfaces rather than demo screens.
- Their active module UI now requires useful empty states, async loading states where data is loaded through storage APIs, recoverable error states with retry actions, honest disabled primary actions, keyboard-reachable creation/editing flows, stable focus rings, and compact Settings shortcuts where configuration is naturally expected.
- Projects empty state in the sidebar should be miniature and title-only. It should not include helper copy about optional fields, the plus button, or creation mechanics.
- Contacts empty state in the sidebar should also be miniature and title-only. It should not include helper copy about optional fields, the plus button, or creation mechanics.
- Projects may create a record with an optional title using a generated fallback, because no project field is mandatory in the MVP.
- Contacts and Physical Health creation submit actions are disabled until the required name/zone field is filled.
- Trading Play, deal, and rule-section submit actions are disabled until the required ticker/idea/title field is filled.
- Diary keeps completed Tasks/Habits loading separate from manual done-item entry so a temporary load failure does not block diary writing.
- Active Projects, Contacts, Diary, Physical Health, and Trading UI must not show technical helper copy or internal storage/runtime wording; release/data limitations belong in Settings/Data or release documentation.

## 2026-05-19: Tasks Dense Text Robustness

- Tasks visual bug fixes are a layout/typography durability pass, not a redesign of the accepted Tasks concept.
- Long task titles and descriptions must remain inside task rows and the right editor panel through wrapping, breaking, ellipsis, or internal scrolling.
- Cyrillic glyphs in dense rows, editor text, buttons, and metadata must not be clipped by too-tight line boxes.
- Task, habit, Home, and shared completion controls must center their check marks inside the fixed control box.

## 2026-05-18: Repeated Top-Left Module Titles Removed

- The global rail is the source of visible module identity. Repeating the same module name in the top-left workspace chrome or local sidebar header is redundant and should be removed.
- `Workspace` no longer renders shared visible module-title chrome by default.
- Projects, Contacts, Quick Notes, Home, Habits, and Focus remove literal top-left module-name headings from their active UI. Their regions keep accessible labels, and controls remain keyboard reachable.
- Meaningful context titles remain visible when they identify the current object or section rather than restating the module: selected project/contact/account/zone titles, task list names, Calendar/Diary month titles, Trading mode labels, Settings group titles, `Счета`, `Зоны тела`, and `Разделы`.

## 2026-05-28: English Language Mode And Dark Theme Integration

- LifeOS v4 remains Russian-first by default.
- English language mode is now part of the Settings-owned appearance/language scope rather than only future backlog.
- Settings remains the owner of both `theme` and `language`; the existing persisted app settings record and Rust/SQLite settings repository should be reused for both selections.
- English mode should translate app chrome, module navigation, controls, empty/loading/error states, dialogs, Settings sections, and module UI labels across the 14 visible modules. User-created content remains as entered and is not translated.
- Light theme remains the baseline. Dark theme is added as a secondary app-wide tokenized mode.
- Theme must be applied globally through the shared theme token boundary. Modules must consume semantic tokens and must not define separate module-level dark themes or mixed active themes.

## 2026-06-25: Notes/Diary File Names Block Windows Reserved Device Names

- Notes and folder names that map to Windows reserved device names must not be written to disk verbatim, because Windows refuses to create files/folders such as `NUL`, `NUL.md`, or `CON` and this previously could break note saving and pre-update backups.
- `sanitize_file_stem` (in `lifeos-storage` notes vault) now escapes a sanitized name with a leading `_` when its first dot-segment matches a reserved device name, case-insensitively: `CON`, `PRN`, `AUX`, `NUL`, `COM0-COM9`, `LPT0-LPT9` (including the superscript `COM`/`LPT` variants). Example: a note titled `NUL` is stored as `_NUL.md`; a folder `AUX` becomes `_AUX`.
- This is a functional file-system safety fix, not a security/encryption change. Names that merely contain a reserved word (e.g. `NULL`, `console`, `COM10`) are left untouched.
- Covered by unit tests in `notes.rs` (`escapes_reserved_device_names`, `escapes_reserved_names_with_extension_segment`, `leaves_safe_names_untouched`, plus `markdown_file_name`/`folder_name` cases).

## 2026-06-25: oauth2 Trimmed to Core Types (drop unused internal HTTP client)

- `oauth2` workspace dependency changed from `default-features = false, features = ["reqwest", "rustls-tls"]` to `default-features = false` (no features).
- Reason: the only oauth2 usage (Google Drive OAuth in `apps/desktop/src-tauri/src/google_drive_backup.rs`) uses core types only — `BasicClient`, `AuthUrl`, `ClientId`, `ClientSecret`, `CsrfToken`, `PkceCodeChallenge`/`PkceCodeVerifier`, `RedirectUrl`, `Scope`, `TokenUrl`. The token exchange is performed manually with the project's own `reqwest::Client` (reqwest 0.13); oauth2's built-in async HTTP client is never called.
- oauth2 5.0.0's `reqwest`/`rustls-tls` features pulled a second, unused reqwest `^0.12` (plus its TLS stack) into the dependency tree alongside the project's direct reqwest `0.13`. Dropping the features removes that duplicate reqwest 0.12, reducing build time and binary size.
- Pure build-hygiene change: no behavior change, no security impact. All dependency versions were verified against live registries (crates.io / npm) and resolve; the project builds. The earlier audit note about "versions ahead of stable" was a false alarm — every pinned version exists and is not yanked.

## 2026-06-25: Core Functional Fixes — Recurrence Clamp, Habit Streak, Time Normalization, Focus Overflow

Four functional bugs found in `lifeos-core` were fixed (no security scope). Covered by `crates/lifeos-core/tests/fixes_2026_06_25.rs` and existing domain tests.

- Monthly / EverySixMonths / Yearly recurrence now clamps the anchor day to the last day of short months. Previously `date.day() == start.day()` meant a monthly reminder/habit anchored on the 29th-31st silently never fired in months without that day (e.g. a payment reminder on the 31st skipped Feb/Apr/Jun/Sep/Nov), and a yearly Feb-29 anchor only fired in leap years. New behavior (helper `day_of_month_matches` + `last_day_of_month` in `schedule.rs` and `habits.rs`): an anchor on the 31st fires on Feb 28/29, Apr 30, etc.; a Feb-29 yearly anchor fires on Feb 28 in non-leap years. Mirrors Apple/Google Calendar. `SelectedDaysOfMonth` (explicit multi-day picks) is intentionally left unclamped.
- Habit `current_streak` no longer resets to 0 when today's occurrence is still pending/unlogged. `recalculate_habit_stats` treats the `through` date (today) as in-progress: an unlogged or pending occurrence there is not counted as a miss and does not break the streak. Past gaps still reset the streak as before. This fixes the streak showing 0 in the morning before the habit is done.
- Time-of-day strings are normalized to zero-padded `HH:MM` on build/normalize for reminders, calendar events (`start_time`/`end_time`), habits, and finance transactions. They were validated leniently (`%H:%M` accepts `9:05`) but stored raw, which broke lexicographic ordering of `scheduled_for_local` in `due_reminder_notifications` (`9:05` sorted after `10:00`) and produced inconsistent stored values.
- Focus session `pause`/`stop`/`build` now use `saturating_mul(60)` (matching `normalized()`) instead of `planned_duration_minutes * 60`, removing an overflow panic risk on a corrupt/oversized duration loaded from storage before validation.

## 2026-06-29: Bento Visual System As Primary Across All Modules

- The Bento design language from the `LifeOS_v3_Bento_Design` mockup is the primary visual system for the whole app, not just Home. `apps/desktop/src/styles/bento.css` (token-only, OKLCH-safe, loaded last) maps the mockup's look onto every module's real class names: Tasks 3-pane (`.tasks-*`), Calendar month/schedule grid + tone classes (`.calendar-*`, tones `violet/blue/green/amber/red/cyan/completed`), Focus 3-column ring layout (`.focus-*`), Habits rows/cards (`.habits-*`), basic modules sidebar+detail (`.basic-*`, `.finance-*`, `.trading-*`, `.diary-*`), Notes/Obsidian gateway (`.notes-obsidian-gateway__*`), and Settings (`.settings-*` + `.settings-accent-*` theme picker as `.theme-grid`/`.theme-opt`/`.theme-swatch`).
- The app does NOT use the mockup's generic `.bento`/`.card`/`.metric` grid — each module keeps its own classes, and `bento.css` bridges the mockup look onto them. This preserves the existing component architecture; the port is visual styling only.
- Accent themes (violet/ocean/forest/sunset/rose/graphite) already matched the mockup and remain selectable in Settings → Appearance via `AccentField`. The active accent drives `<html data-accent>` app-wide; dark-mode accent refinements already exist.

## 2026-06-29: Home Day Metrics Strip

- Home shows a compact day-metrics strip above the two-column timeline (mockup `.metrics`/`.metric`), implemented as `.home-metrics`/`.home-metric__*` to keep it visually consistent with the app's class conventions.
- Metrics are a pure projection over already-loaded records (no new data contracts): open/total tasks today, today's calendar events, completed/total habits that occur today, standalone reminders due today, and a focus-minutes-today slot.
- Focus minutes are a fixed placeholder slot for now (the Focus module tracks completed sessions separately); wiring live focus-minutes today is a future refinement, not part of this decision. Logic lives in `buildHomeMetrics` in `homeViews.ts` and is unit-tested.

## 2026-06-29: Command Palette (Ctrl/Cmd+K)

- A quick module-navigation palette (mockup `.pal`/`.pal-bg`) opens app-wide with `Ctrl+K` / `Cmd+K`. Component: `apps/desktop/src/app/shell/CommandPalette.tsx`, wired in `App.tsx`.
- It filters the localized navigation module list, supports `↑`/`↓` + `Enter` keyboard navigation and `Esc`/backdrop-click to close, and navigates via the same hash route mechanism as the left rail. It is navigation only — no command actions in MVP.


## 2026-07-04 — Перезапуск проекта (LifeOss)

Источник: чат с агентом lifeos (PromptQL, тред онбординга). Правило: всё, что владелец пишет в чат — истина; агент фиксирует изменения в документах.

1. **Перезапуск с нуля.** Приложение строится заново по документации. Прежняя кодовая база (описанная в записях до 2026-06-29) не продолжается; репозиторий `sigmuchiii/LifeOss` начинается с пустого состояния. Документы остаются источником требований.
2. **Официальное название — LifeOss.** Все новые артефакты (README, код, конфиги) используют имя LifeOss. В исторических документах встречается «LifeOS v4» — это прежнее имя, документы не переписываются задним числом.
3. **Репозиторий остаётся публичным** (временно, решение владельца; будет пересмотрено позже).
4. **Визуальный источник истины — Bento v3 дизайн** (`docs/design/bento-design.html`): сайдбар 248px с группами навигации (Обзор / Жизнь / Работа / Система), light-first + тёмная тема через `html.dark`, акцент #6c5ce7, Inter + JetBrains Mono, радиус карточек 18px, ⌘K командная палитра. Отменяет прежнюю геометрию «rail 40px + sidebar 214px» из lifeos-v4-design.md.
5. **Открытые вопросы** (`open-questions.md`) остаются отложенными — не блокируют старт разработки.
6. **Структура документации:** ядро в `docs/`, модульные спеки в `docs/modules/`, историческое в `docs/archive/` (не источник истины), дизайн в `docs/design/`.

## 2026-07-04 — Milestone 0: каркас приложения

1. **Каркас закоммичен**: Tauri 2 + React 19 + TypeScript + Vite; Rust workspace в `src-tauri/` с крейтами `lifeos-core` (реестр модулей) и `lifeos-storage` (SQLite/WAL + миграции, `0001_init`).
2. **Реестр модулей** (`src/moduleRegistry.ts` + зеркало в `lifeos-core`): 14 видимых модулей, camelCase id, группы навигации Обзор / Жизнь / Работа / Система (по Bento-макету); `reminders` и `psychologicalHealth` — hidden.
3. **UI-каркас по Bento**: сайдбар 248px, sticky-топбар с поиском, светлая тема по умолчанию + тёмная (`html.dark`), токены из `docs/design/bento-design.html`, командная палитра Ctrl/Cmd+K (только навигация).
4. **Bundle выключен** (`bundle.active: false`) до этапа релиза; цель — `npm run tauri dev` локально у владельца. Инструкция: `docs/dev-setup.md`.

## 2026-07-04 — Правки UI сайдбара (источник: чат владельца)

- Сайдбар: убрано разделение модулей на группы («Обзор / Жизнь / Работа / Система») — единый список.
- Убрана карточка профиля («Владелец») внизу сайдбара.
- Навигация переведена на компактные иконки (lucide): сайдбар сужен до иконочного рейла 64px, подписи модулей — во всплывающих подсказках и в командной палитре (Ctrl+K).
- Группы модулей остаются в реестре как метаданные, но в сайдбаре не отображаются.

## 2026-07-04 — Старт модуля «Задачи» (первый функциональный модуль)

- Миграция 0002: таблица `tasks` (title, notes, done, priority 0–2, due_date, created_at, completed_at).
- Rust-команды: `tasks_list`, `tasks_add`, `tasks_toggle`, `tasks_update`, `tasks_delete`.
- Экран «Задачи»: добавление с приоритетом, чипы-фильтры (Все / Активные / Выполненные), чекбоксы, бейджи приоритета, удаление по наведению.
- Сортировка списка: невыполненные выше, затем по приоритету, затем по дате создания.

## 2026-07-04 — Модуль «Задачи»: полная TickTick-подобная версия

- По запросу владельца модуль реализован целиком, а не по одной правке.
- Полная ширина: убран `max-width` контента; когда задача не выбрана, список занимает всю ширину рабочей области; правая панель редактора появляется только при выборе задачи (клик по строке).
- Внутренний сайдбар модуля: умные списки «Сегодня» (просроченные + сегодняшние, со счётчиком), «Входящие» (активные без пользовательского списка), «Следующие 7 дней»; пользовательские «Списки» (создание через компактный «+», удаление возвращает задачи во Входящие); внизу — «Выполнено» и «Корзина».
- Быстрое добавление: скруглённая строка под заголовком, Enter создаёт задачу, тихий «+» слева, иконка календаря справа открывает поповер дат (Сегодня/Завтра/Через неделю/Без даты/произвольная дата). Из «Сегодня» задача получает сегодняшнюю дату, из пользовательского списка — этот список.
- Дата и время: у задачи есть дата (можно без времени) и опциональное время; в строках дата справа (просроченные — красным), группировка по датам («Просрочено», «Сегодня», «Завтра», конкретные даты, «Без даты» в порядке создания).
- Приоритет отображается цветом квадрата-чекбокса (жёлтый — важный, красный — срочный), без отдельных бейджей.
- Правая панель редактора: верхняя строка (чекбокс, дата, время, приоритет), крупный заголовок, статус («Не начато / В процессе / Ожидает» + причина ожидания), описание, подзадачи (добавление/отметка/удаление), футер прижат к низу (источник-список + удаление в корзину). Перегородка перетаскивается, ширина панели сохраняется локально.
- Смена выбранной задачи полностью обновляет редактор (React key по id задачи) — без «залипших» значений.
- Системные области: «Выполнено» — группировка по дате выполнения, приглушённые строки; «Корзина» — мягкое удаление (deleted_at), восстановление, «Очистить корзину».
- Модуль запоминает последний выбранный список (localStorage) и открывает его при возврате.
- Хранилище: миграция 0003 — таблицы `task_lists`, `subtasks`; новые колонки `tasks.due_time`, `tasks.status`, `tasks.waiting_for`, `tasks.list_id`, `tasks.deleted_at`. Статусы хранятся как `not_started` / `in_progress` / `waiting`.
- Rust-команды: `tasks_snapshot`, `tasks_add`, `tasks_toggle`, `tasks_update`, `tasks_delete` (в корзину), `tasks_restore`, `trash_clear`, `lists_add`, `lists_delete`, `subtasks_add`, `subtasks_toggle`, `subtasks_delete`.
- Отложено на следующие итерации: повторяющиеся задачи, канбан, напоминания, теги, связи с проектами.

## 2026-07-04 — Темы в настройках, анимации, модули: Сегодня, Привычки, Календарь, Фокус, Быстрые заметки

- Переключатель темы убран из топбара (владелец: пустая полоса с одинокой кнопкой). Топбар: поиск + текущая дата.
- Темы выбираются в модуле «Настройки»: Лаванда (по умолчанию), Тёмная, Полночь, Лес, Закат. Реализация через `html[data-theme]`; выбор хранится в SQLite (`settings`, ключ `theme`) с кэшем в localStorage.
- Анимации: плавное появление экрана при переключении модуля, pop-in поповеров/палитры/редактора, анимация галочки, hover-подъём карточек, transition на кнопках; уважается `prefers-reduced-motion`.
- Модуль «Сегодня»: приветствие по времени суток, статистика (задачи/выполнено/привычки), просроченные и сегодняшние задачи с быстрым добавлением, выполненные за сегодня, привычки-чипы с циклом выполнено→пропущено→пусто.
- Модуль «Привычки»: сетка за 14 дней, расписание по дням недели (Пн–Вс), трёхсостоянийные отметки, серия (🔥) — незапланированные дни не рвут серию, сегодня без отметки не рвёт серию.
- Модуль «Календарь»: месячная сетка с понедельника, чипы задач в ячейках (до 3 + счётчик), панель выбранного дня с отметкой выполнения. Задачи создаются только в «Задачах» (по спеке).
- Модуль «Фокус»: помодоро с пресетами (25/45/60 фокус, 5/15 перерыв), SVG-кольцо прогресса, пауза/сброс; завершённые фокус-сессии сохраняются в SQLite, лог за сегодня с суммой минут. Перерывы не логируются.
- Модуль «Быстрые заметки»: сетка карточек, Ctrl+Enter — сохранить, закрепление, правка по клику (сохранение по расфокусу), удаление.
- Хранилище: миграция 0004 — таблицы `habits`, `habit_marks` (UNIQUE habit_id+date), `quick_notes`, `focus_sessions`. `completed_at`/`ended_at` пишутся в локальном времени устройства.
- Осталось заглушками: Дневник, Здоровье, Проекты, Заметки (Obsidian), Контакты, Финансы, Трейдинг.

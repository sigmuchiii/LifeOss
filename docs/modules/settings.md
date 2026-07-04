# Settings Module

Status: MVP basic module with local data, recovery, and backup-sync controls

## Purpose

Settings should control app-level preferences and local-first infrastructure.

## Confirmed Direction

- Theme selection is needed.
- LifeOS can be configured to launch automatically when the owner signs into Windows.
- The autostart control lives inside Settings and changes the desktop operating-system autostart state rather than the SQLite app-settings record.
- The first persisted settings record stores theme, language, wake time, and sleep time in SQLite through the Rust settings repository.
- Settings persistence uses the resolved runtime data root and must not depend on a repository-local or dev-only database path. Packaged Windows builds resolve this to `<install directory>\data`; dev/debug builds keep the standard Tauri app data directory.
- Settings writes are the first storage integration that appends entries to the local sync-ready `change_log`.
- Light theme remains the baseline app theme.
- Dark theme is a Settings-owned secondary app-wide mode implemented through the global theme token boundary, not per-module themes.
- Settings > `Оформление` is the visible control for switching between Light and Dark. The selected theme is persisted in the existing app settings record and applies globally to the app shell and all modules.
- Wake/sleep time settings are needed for Home schedule boundaries.
- Wake/sleep defaults are `07:00` and `22:30`. They change only when the user explicitly edits them in Settings or in the Home day-boundary control; habits, events, and other source records never rewrite these boundaries.
- Language is Russian-first by default; English language mode is a Settings-owned secondary mode. It translates app chrome, navigation, controls, state copy, and module UI labels, but does not translate user-created record content.
- Backup/export settings are current Settings > Data responsibilities.
- Notification settings will matter as reminders evolve.
- Settings should expose app update status and a manual "check for updates" path once the desktop updater is enabled.
- Until the updater release path is explicitly enabled, Settings shows app updates as `Отложено` and the manual check is disabled. The guarded implementation is kept for verification and future activation, but it is not part of the active private dogfood release.
- When the updater release path is enabled, installed apps check for updates on startup. When a valid newer version is found, LifeOS shows a modal saying `Вышло новое обновление` with `Установить сейчас` and `Позже` actions. The initial updater UX requires user confirmation and does not install silently.
- Settings sidebar should contain settings groups, not generic add/configure actions.
- Confirmed sidebar groups: `Оформление`, `Модули`, `Главная`, `Уведомления`, `Синхронизация`, `Данные`.
- The old sidebar action `Настроить` should not appear as an add-style button.
- Module settings and appearance/theme settings are first-class areas inside Settings.
- Settings should not use a right inspector panel in the current browser preview.
- Main settings information, including theme, modules, Home day range, language, notifications, synchronization, and data/export, belongs in the central workspace.
- Settings must show one selected sidebar group at a time in the central workspace, not all settings sections stacked together on one long page.
- Each Settings group should expose useful local actions where the contract already exists: reset appearance, reset Home day bounds, bulk module visibility toggles, notification permission/diagnostics refresh, local backup/search-index actions, and data export/backup/search/integrity/restore dry-run tools.
- The browser reference uses the shared light LifeOS module shell: compact settings group sidebar, tinted workspace, raised setting summary cards, dense setting rows, compact save action, and no right inspector.
- The current desktop Settings route can read and write wake/sleep settings through typed Tauri commands.
- Settings > Data now exposes local data-safety actions: readable JSON/Markdown export, separate `Резервная копия LifeOS` and `Резервная копия Obsidian` actions, search-index rebuild/search, and integrity checks.
- Settings > Data is also the app-level entry point for importing an Obsidian vault into Notes.
- Settings > Data also lets the owner register Obsidian folders/vaults for backup sync. Registered folders are included in local backup artifacts under `obsidian-vaults/` and therefore included in encrypted Google Drive backup uploads.
- Export artifacts are created in the resolved runtime data root under `exports/lifeos-export-*`.
- LifeOS backup artifacts are created in the resolved runtime data root under `backups/lifeos-backup-*`. Obsidian-only backup artifacts are created separately under `backups/obsidian-backup-*`.
- User-triggered export, LifeOS backup, and Obsidian backup are observable and cancellable from Settings. The Rust data-safety boundary emits progress events by phase, file count, and byte count, and Settings can request cancellation by operation id.
- After a user-triggered data-safety action completes, fails, or is cancelled, the progress card remains visible for review but must expose a `Закрыть` action so the user can dismiss it and continue using Settings.
- User-triggered export, LifeOS backup, and Obsidian backup are complete-only artifacts. Work is first written to an `.in-progress` staging directory, a complete `manifest.json` is written only after final validation, and the artifact is atomically finalized by renaming the staging directory to `lifeos-export-*`, `lifeos-backup-*`, or `obsidian-backup-*`.
- Export and backup manifests include `status: "complete"`, final integrity status, and a manifest snapshot with relative file paths, byte counts, and SHA-256 checksums. Restore/import dry-run rejects missing snapshots, non-complete statuses, checksum/count mismatches, and interrupted partial artifacts.
- Local backup validates the copied SQLite snapshot with `PRAGMA integrity_check` before the backup can be finalized. Readable export and local backup still run final app integrity checks before success.
- `Резервная копия LifeOS` copies configured Obsidian sync folders into the complete LifeOS artifact after SQLite/Notes/Diary files are captured. Folders inside the LifeOS data root are skipped unless they are already covered by the app-owned `notes/` backup path, preventing recursive backup of `backups/`, `exports/`, or staging folders.
- `Резервная копия Obsidian` creates a standalone complete artifact with only the configured external Obsidian folders under `obsidian-vaults/`, plus manifest snapshot/progress metadata. It is useful when the owner wants to refresh vault backups without also snapshotting the full LifeOS database.
- Readable export batches habit-log reads for all exported habits instead of issuing repeated per-habit log queries.
- Packaged release startup also creates automatic pre-update backups under `backups/pre-update/lifeos-pre-update-v*` before opening SQLite/migrations when the stored runtime data version differs from the running app version.
- Pre-update backups are app-owned safety snapshots of install-local data for version replacement. The blocking startup phase copies and validates the critical SQLite snapshot plus SQLite sidecars, `frontend-records.json`, and `frontend-preferences.json` before migrations can open the database.
- Notes and Diary pre-update backup is manifest-based and resumable for large user-file folders. Startup writes an `.in-progress` pre-update artifact with `status: "partial"` / `phase: "files_pending"` after the critical snapshot, then a background phase copies `notes/` and `diary/`, emits progress by files/bytes, updates the manifest during copying, validates the final snapshot, and renames the artifact only after writing `status: "complete"`.
- Settings > Data shows the latest pre-update backup status/progress. A partial `.in-progress` pre-update artifact must never be shown or treated as a complete backup; interruption resumes from the manifest on the next startup. Downgrade transitions are backed up too and marked with `version_direction: "downgrade"`. Corrupt critical SQLite snapshots block startup backup completion instead of producing a complete artifact.
- Pre-update backups copy `lifeos.sqlite3`, SQLite sidecars, `notes/`, `diary/`, `frontend-records.json`, and `frontend-preferences.json`, but do not recursively copy existing backups, exports, or rebuildable search caches.
- If a release startup/migration path fails, LifeOS writes `startup-failure.json` in the runtime data root and shows a native startup-failure message with the pre-update backup path when one exists. Settings > Data reads that notice on later successful startup and shows a failed-upgrade rollback block.
- Settings > Data can use a complete pre-update backup artifact as a restore/import source. The UI fills the artifact path, requires dry-run first, disables partial `.in-progress` artifacts, and applies only through the same backup-before-restore/staged restore flow used by regular restore/import.
- The rollback copy must explain the safe app-version rule: after restoring from a pre-update artifact, run the artifact's `source_app_version` or a later fixed build that explicitly supports that source data version. Do not run the failed target version against restored data unless that build has been fixed.
- Search index cache is rebuilt in the resolved runtime data root as a SQLite FTS cache under `search/index.sqlite3`.
- Restore/import is dry-run first. Settings > Data can run a restore/import dry-run for a backup/export artifact path and show manifest/version/collision/link results without changing data.
- Restore/import apply is enabled for supported artifact version `1` readable exports and local backups. Apply creates `backups/backup-before-restore/lifeos-backup-before-restore-*`, stages restored data, temporarily closes the active SQLite handle in the desktop command path, merges artifact database rows/files into current data, then validates merged SQLite integrity and cross-module links before reporting success.
- Restore/import v1 collision behavior is merge/update: non-colliding current records are preserved, source records are imported, and colliding source IDs update the matching current record. Source IDs are preserved; v1 has no preserve-both or remap mode.
- Module ordering controls, restore/import preserve-both/remap modes, encrypted restore, enabling the deferred updater release path, deeper app update controls, and notification channel configuration remain later work.

## Stage 13 Desktop Implementation

- The desktop Settings route now uses a compact settings group sidebar and a central workspace.
- There is no right inspector panel.
- Central sections cover appearance, modules, Home, notifications, synchronization, and data, but the current selected group is shown alone so the workspace does not become a mixed settings pile.
- Appearance also contains the app-level `Автозапуск` row with `Запускать LifeOS при входе в Windows`.
- Theme, language, wake time, and sleep time use the existing typed settings record; saving still writes through Rust/SQLite and the change log.
- Module visibility rows, notification rows, and synchronization toggles are stateful MVP controls instead of read-only/decorative rows.
- The initial Stage 13 synchronization section was local-first: local backup/search-index toggles were available, while cloud connection was disabled until a provider was promoted. The Google Drive encrypted backup-sync planning and UX below supersede that disabled cloud placeholder for the recovery-backup scenario only.
- Full module ordering, automated sync configuration, and notification channel configuration remain future work.

## 2026-05-17 Desktop Settings Section Pass

- Settings now treats the sidebar groups as real sections. Selecting `Оформление`, `Модули`, `Главная`, `Уведомления`, `Синхронизация`, or `Данные` changes the central workspace to that section only.
- The sidebar rows show compact status metadata such as active-module count, Home day range, notification permission status, and data health.
- `Оформление` can reset theme/language to the light Russian baseline.
- `Модули` can enable all modules or leave only the core daily/default module set visible in the local Settings UI; the Settings module itself cannot be disabled from that screen.
- `Главная` can reset wake/sleep back to `07:00`/`22:30` and shows the resulting day range duration.
- `Уведомления` can request browser/WebView notification permission when supported and refresh reminder delivery diagnostics.
- `Синхронизация` remains local-first but surfaces direct `Резервная копия LifeOS`, `Резервная копия Obsidian`, and search-index rebuild actions.

## 2026-05-28 English Language And Dark Theme Scope

- Settings remains the owner of both language and theme.
- The persisted settings record already owns `theme` and `language`; implementing English mode and dark theme should reuse that record and the existing Rust/SQLite settings repository rather than introducing separate module preferences.
- English mode is a secondary UI language over the Russian-first baseline. It should use a shared i18n dictionary/provider and cover all visible app chrome, module navigation, controls, empty/loading/error states, dialogs, Settings sections, and data-safety status copy across the 14 visible modules. User-created titles, notes, diary text, project/contact/finance/trading records, file names, and imported content stay as entered.
- The desktop implementation uses centralized typed translation keys with Russian and English dictionaries plus a React provider/hook. The `Оформление` language selector writes the existing persisted `language` setting, Russian remains the default and full fallback, and English translations must not rename internal ids, enum values, routes, canonical module ids, database fields, or storage contracts.
- Dark theme is a secondary global tokenized mode. The shell should apply one active `data-theme` value for the whole app; individual modules must consume semantic tokens and must not define separate dark surfaces or module-specific theme overrides.
- The implemented dark theme keeps the production dimensions unchanged: `40px` rail, `214px` contextual sidebar, compact headers, dense rows, modals, calendar grids, task/habit rows, and the Notes gateway remain the same layout in both themes. Native mini-windows remain separate desktop exceptions and must not depend on React theme overrides.
- The reset appearance action continues to reset to the light Russian baseline.

## Stage 14 Desktop Implementation

- Settings > Data can create a readable export through the Rust data-safety boundary.
- Settings > Data can create a LifeOS backup folder with SQLite, Notes files, Diary Markdown files, manifest, and integrity report.
- Settings > Data can create a separate Obsidian backup folder for configured external Obsidian folders without including the LifeOS SQLite database.
- Settings > Data can rebuild the search index and run search over the rebuilt cache.
- Settings > Data can run integrity checks and show issues or warnings.
- Settings > Data can launch the Obsidian vault import flow; the visible Notes route stays focused on the Obsidian Companion Gateway, while file/edit/backlink/graph/tag surfaces are future fallback context unless LifeOS-native Notes is promoted again.
- Projects, Contacts, Diary, Physical Health, and Trading are read from canonical storage for data actions. Projects use `projects`, Contacts use `contacts`, Diary uses `diary_entries` plus `diary/YYYY-MM-DD.md`, Physical Health uses `physical_zones`, and Trading uses `trading_plays`, `trading_entries`, and `trading_rule_sections`.
- Settings imports any existing legacy frontend basic-module snapshot into canonical storage before data actions, then clears promoted records from the packaged frontend snapshot. Browser/Vite preview keeps `localStorage` only when Tauri commands are unavailable.
- Settings > Data must not show a preview-only durable-data warning for Projects, Contacts, Diary, Physical Health, or Trading after canonical migration.
- Restore/import version 1 supports dry-run and in-app apply for readable export and local backup artifacts. Version 1 preserves source IDs, merges artifact data into the current installation after creating a backup-before-restore artifact, validates linked records before and after apply, and does not remap IDs or links.
- Complete pre-update backup artifacts are accepted as a rollback-only restore/import source. They restore `lifeos.sqlite3`, SQLite sidecars, `notes/`, `diary/`, `frontend-records.json`, and `frontend-preferences.json`, and add a dry-run warning that names the app version to run after rollback.
- Complete local backup artifacts may contain `obsidian-vaults/` when the owner has configured external Obsidian folders for backup sync. Restore/import stages those folders back under the app data root's `obsidian-vaults/` recovery area instead of writing to old absolute Windows paths.

## FIX-06/FIX-07 Restore/Import Dry-Run And Apply

- Settings > Data exposes a `Dry-run restore/import` path field and runs the Rust `dry_run_restore_import` command.
- Dry-run accepts either an artifact directory or `manifest.json` path for `lifeos-v4-readable-export` and `lifeos-v4-local-backup` artifacts.
- Supported artifact version is `1`; missing, invalid, or unsupported versions block restore/import.
- A clean dry-run requires a valid manifest, supported version, complete manifest status, matching file snapshot/checksums, readable artifact contents, and no missing linked records inside the artifact. Collisions are reported but do not block v1 apply because the selected policy is merge/update-after-safety-backup.
- Collision behavior is explicit: restore/import v1 merges artifact data into current installation data after creating backup-before-restore. It preserves non-colliding current records, imports source records, and updates matching current records when IDs collide. There is no preserve-both, remap, or silent rename in v1.
- ID/link remap behavior is explicit no-remap in v1. Linked records must resolve inside the artifact; future remap tables are deferred.
- App state policy: the desktop apply command temporarily closes the app-managed SQLite handle before replacing files, then reopens it after apply. Selecting an old working `data` directory remains a separate "open and use these data" flow, not restore/import.
- Safety strategy: apply creates backup-before-restore, stages the restored state under `.restore-staging`, validates SQLite/link/file integrity before merge, merges database rows/files into current data, validates again, and keeps the safety backup available if recovery is needed.
- Settings > Data shows the dry-run report, what will be restored, blocking errors, collision policy, and the safety backup path returned by apply.
- Encryption/passphrase policy: current artifacts are local and unencrypted; encrypted artifacts and passphrase restore are deferred and rejected by dry-run until specified.

## Google Drive Backup Sync Planning

- Settings > `Синхронизация` should offer `Google Drive` as the primary simple backup-sync provider for the Windows reinstall recovery scenario.
- The user flow is: connect a Google account, choose the Google Drive backup folder name in Settings, authorize LifeOS through Google, and let LifeOS sync automatically every 5 minutes while the app is running. Folder links are not part of the Settings flow.
- If Settings > `Данные` has registered Obsidian sync folders, those folders are included in the local backup before encryption/upload. This keeps the Google Drive provider as encrypted backup sync rather than readable cloud folder sync.
- This is backup-based recovery sync, not live sync of `lifeos.sqlite3` and not multi-device record conflict resolution.
- LifeOS should encrypt every remote backup artifact before upload. Google Drive must not receive readable SQLite, Markdown, media, or private manifest contents.
- Google OAuth configuration is resolved in this order: process environment variables (`LIFEOS_GOOGLE_OAUTH_CLIENT_ID`, optional `LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET`, `LIFEOS_GOOGLE_DRIVE_SCOPE`, and `LIFEOS_GOOGLE_DRIVE_ALLOW_FULL_SCOPE`), then a local `google-oauth-config.json` file in the LifeOS runtime data root, then build-time environment values embedded by private packaging. The app must not commit real Google client credentials; the local config file is device/deployment config and must not contain refresh tokens or managed encryption passphrases.
- The desktop connect action uses real Google OAuth 2.0 Authorization Code + PKCE through the system browser. It listens on a random `127.0.0.1` loopback port, requests `access_type=offline` and `prompt=consent`, exchanges the code for tokens, and stores the refresh token only through the OS keyring boundary.
- Google refresh tokens are stored only through the OS keyring/credential boundary. SQLite may store Drive folder config, job state, and status metadata, but never the refresh token.
- The default Google Drive UX does not ask for a user recovery key. LifeOS generates or reuses a managed encryption passphrase, stores it locally only in the OS keyring, and uploads a LifeOS-managed key document into the selected Drive backup folder so reconnecting the same Google account after reinstall can decrypt backups.
- This is an explicit private-dogfood privacy tradeoff: Google account access plus the LifeOS client can recover the backup. The older manual recovery-key command surface may remain internally for compatibility, but it is not the main user-facing Settings contract.
- Close-time Google Drive backup starts by default when Google Drive config exists, a refresh token is available, and no Google Drive backup operation is already running. It resolves the managed passphrase from OS keyring or Drive instead of requiring a typed key.
- The `connect_google_drive_backup` command keeps compatibility fields for older callers, but the simple Settings setup uses only the requested `folder_name`, defaulting to `LifeOS Backups`. Legacy `folder_url`, `auto_backup_on_close`, and `keep_latest_count` values from callers must not affect the user-facing setup.
- Settings must not show `Ссылка на папку Google Drive`, `Хранить последних копий`, or `Создавать резервную копию при закрытии` for the simple sync flow.
- After a successful encrypted `.lifeosbackup` upload and final completion metadata upload, LifeOS preserves existing complete artifact+metadata pairs in the selected Drive folder. Latest-only cleanup is disabled because reinstall recovery must not risk moving the owner's older good backup out of the normal restore list after a fresh empty install uploads.
- If Google Drive already has complete LifeOS backups and the local install has no user data, LifeOS blocks upload and directs the owner to Settings > `Данные` restore first. This applies to manual sync, automatic sync, and close-time sync; the close-time path may skip backup and allow exit rather than uploading an empty install.
- LifeOS should upload only complete local backup artifacts. Local `.in-progress` artifacts, encrypted artifacts without a complete remote marker, and remote folders without the required manifest/metadata must never be offered as restore sources.
- The remote completion marker/manifest should be uploaded last so an interrupted upload is not treated as complete by the remote restore UI.
- Large Google Drive backup artifacts are transferred through streaming paths. Upload keeps Drive resumable semantics and sends the encrypted `.lifeosbackup` from disk without `fs::read`-style whole-file buffering. Restore download writes response chunks to a temp file first, checks the expected byte count when completion metadata or Drive size is known, and renames to the final `.lifeosbackup` only after a complete download.
- A failed Google Drive restore download or known size mismatch must not leave a final-looking `.lifeosbackup` artifact in restore staging. Partial bytes may exist only in temp paths that are cleaned up on failure.
- Settings should show truthful state: `Синхронизировано` only after local validation, encryption, upload and remote completion; otherwise `Ожидает загрузки` or `Ошибка синхронизации`.
- The Google Drive `ready` state is shown as `Подключено`, not `Готово`, because it only confirms account/folder/key setup and does not imply that remote data has been restored into the current local install.
- The initial Google Drive UI state is `Проверка` until persisted backend status loads, so startup does not flash `Отключено` before becoming `Подключено` or `Синхронизировано`.
- Settings > `Данные` remains the restore authority: remote backups are downloaded into local staging first, then the existing restore/import dry-run and apply flow decides whether recovery can proceed.
- Each automatic or manual Google Drive sync should surface a compact bottom-right status animation: spinner while saving/uploading, check mark after success, and automatic dismissal after one minute.
- Closing the main window and tray `Выход` use the same connected-account lifecycle by default. LifeOS shows a small shutdown-sync loading dialog, starts the encrypted Google Drive backup, and performs the real app exit only after the upload reaches `synced`. If the close-time backup ends as `pending_upload` or `error`, LifeOS keeps the app open and reports the issue instead of pretending the backup synced.
- Open planning details remain: final Drive scope/picker policy if LifeOS later reintroduces user-selected external Drive folders.

## 2026-05-23 Frontend Google Drive Settings UX

- The frontend data bridge exposes Google Drive encrypted-backup commands for status, connect/configure, retry pending uploads, backup-now, remote backup listing, and download-for-restore staging.
- The frontend `connectGoogleDriveBackup` call now targets an implemented Tauri command. The command returns `GoogleDriveAuthReport` after browser PKCE auth, keyring token storage, folder validation/creation, and config persistence complete.
- Settings > `Синхронизация` renders a compact Google Drive setup block with folder name for automatic folder creation, fixed `Каждые 5 минут` autosync status, backup-now action, pending retry, pending job count, last success, and error state. It does not show a folder link field, retention count, auto-backup-on-close toggle, or recovery key field in the default flow.
- While Google OAuth is in progress, Settings shows `Вход в Google` and disables the connect action so one user gesture cannot open parallel Google sign-in flows.
- Settings > `Синхронизация` must keep the status truthful: `Подключено` is rendered for the configured `ready` state, `Синхронизировано` is rendered only for the `synced` state, and pending/error states render `Ожидает загрузки` or `Ошибка синхронизации`.
- Settings > `Данные` renders `Восстановить из Google Drive`, lists complete remote backups returned by the backend, including complete pairs currently in Google Drive trash, downloads the selected `.lifeosbackup`, resolves the managed passphrase, then passes the decrypted `manifest.json` path into the existing restore/import dry-run flow.
- This is still encrypted backup sync, not live SQLite sync. When a downloaded encrypted backup is applied through restore/import, the artifact is merged into the current installation with the v1 merge/update policy described above.

## 2026-05-25 Managed Google Drive Key UX

- Settings > `Синхронизация` no longer exposes `Ключ восстановления` or `Запомнить ключ на этом устройстве` in the default Google Drive backup flow.
- `Подключить Google Drive` now also provisions the managed encryption passphrase: if the Drive folder already has a valid LifeOS managed key document, LifeOS writes that passphrase to the OS keyring; if not, LifeOS generates a new passphrase, uploads the managed key document, and then stores the passphrase locally through the OS keyring.
- `Синхронизировать сейчас`, automatic five-minute sync, close-time sync, and Settings > `Данные` Google Drive restore pass an empty recovery password through the UI and rely on backend managed-key resolution.
- `Синхронизировать сейчас` is disabled while the Google Drive state is `not_configured` or `needs_auth`, so the user is directed to connect Google Drive before trying to upload.

## 2026-05-27 Google Drive Five-Minute Sync UX

- The default Google Drive Settings contract is now connected-account autosync, not a user-managed backup-retention screen.
- The user chooses only the Drive folder name before connecting. LifeOS creates/reuses that named folder, syncs every 5 minutes while running, and still allows a manual `Синхронизировать сейчас` action.
- Settings no longer exposes folder URL, last-copy retention, or close-time backup toggles.
- Superseded on 2026-05-30: successful syncs publish the encrypted artifact and completion metadata, but must not run latest-only cleanup because recovery after reinstall depends on preserving older complete remote backup pairs.
- A bottom-right mini status indicator appears during each sync, changes to a check mark on success, and disappears after one minute.
- Connected Google Drive accounts sync on app exit by default; the shutdown loading dialog waits for `synced` before allowing the app to close.

## Open Questions

See Settings/System questions in [../open-questions.md](../open-questions.md).

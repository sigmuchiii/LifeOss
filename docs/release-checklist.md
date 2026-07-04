# LifeOS v4 Release Checklist

Status: Windows private dogfood release checklist
Created: 2026-05-08
Updated: 2026-05-25

This document records the current release constraints for the Windows-first
desktop MVP. It is intentionally honest about unsigned local builds and must
not be read as a public production release checklist.

## Current Release Target

Current release target: private dogfood only.

The current Windows `.exe` / NSIS installer is acceptable only for a private
owner dogfood handoff through a trusted channel. It can be installed and used
daily by the owner to collect concrete product feedback, but it is not a public
production release and must not be described as public-ready.

Public production release is blocked until the release has signed artifacts,
final publisher identity, SHA256 hashes, SBOM, build provenance, license gates,
and installer smoke evidence. The public workflow now has separate `dry-run`
and `production` modes. `dry-run` proves the evidence path with unsigned
artifacts and records `NotSignedBlocked`; it must not be distributed publicly.
`production` requires the real signing inputs and valid timestamped
Authenticode signatures before upload.

## Current Windows Bundle Metadata

- App name: `LifeOS v4`
- Main binary name: `lifeos-v4`
- Identifier: `com.lifeos.v3`
- Version: `0.1.1`
- Bundle target: NSIS installer (`nsis`)
- Installer mode: current user install, no administrator elevation by default
- Publisher: `LifeOS v4 Publisher Placeholder`
- Category: `Productivity`
- Icons: generated LifeOS v4 app icon assets from
  `apps/desktop/src-tauri/icons/app-icon.svg`
- Release executable subsystem: Windows GUI, so launching the installed app
  does not open a command prompt window. Development/debug builds may still use
  console output for logs.
- Packaged runtime data root: `<install directory>\data`. The installed app
  stores `lifeos.sqlite3`, Notes `notes/`, Diary `diary/`, exports, backups,
  search cache, startup failure notices, and packaged frontend records/preferences there instead of auto-reading old
  `%APPDATA%` / WebView `localStorage` data.
- Update data safety: release startup creates a pre-update backup under
  `data\backups\pre-update\lifeos-pre-update-v*` before opening
  SQLite/migrations when existing data belongs to an earlier app version.
  Complete pre-update artifacts can be used as rollback sources through
  Settings > Data restore/import dry-run/apply; failed startup writes
  `startup-failure.json` and shows the pre-update backup path when available.
- NSIS data-preservation hooks are enabled through
  `apps/desktop/src-tauri/installer-hooks.nsh`; installer-managed updates may
  replace/remove old app files, shortcuts, and registry entries, but must not
  delete `<install directory>\data`.
- WebView2 install policy: Tauri `downloadBootstrapper` remains selected for
  private dogfood builds. This keeps the installer small, but install on a
  machine without WebView2 may require network access. Offline/fixed runtime
  packaging is deferred unless zero-network install becomes an explicit release
  requirement.
- Auto-update status: deferred from the current private dogfood setup. The
  checked-in app keeps startup/manual updater checks disabled unless the
  frontend is built with `VITE_LIFEOS_UPDATER_ENABLED=1`. Local/private bundles
  keep `bundle.createUpdaterArtifacts = false`; the public release workflow maps
  `VITE_LIFEOS_UPDATER_ENABLED` and updater artifact creation from
  `LIFEOS_UPDATE_RELEASE_ENABLED`, and must not require updater signing inputs
  or Cloudflare R2 credentials until that variable is `true`.
- Future updater workflow status: when explicitly enabled, the manual workflow
  signs Tauri updater artifacts with `TAURI_SIGNING_PRIVATE_KEY`, generates
  `latest.json`, uploads the installer, `.sig`, and `latest.json` as CI
  artifacts, and publishes production updater files to Cloudflare R2 through the
  S3-compatible API. This does not remove the separate Windows Authenticode
  production gate.
- Future updater hosting target: owner-controlled Cloudflare R2 bucket served
  through `https://updates.lifeos.app`, containing only `latest.json`, signed
  installers, and matching `.sig` files.
- Internal Rust crate license metadata: LifeOS workspace crates are private and
  unpublished (`publish = false`) and use the root proprietary `LICENSE.txt`
  through Cargo `license-file`, not an open-source SPDX license expression.

The publisher value is a placeholder for local packaging only. It is not a legal
publisher identity and does not create trust on Windows.

## Build Commands

Run from `apps/desktop`:

```powershell
$env:LIFEOS_GOOGLE_OAUTH_CLIENT_ID = "<Google Desktop OAuth client id>"
$env:LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET = "<Google Desktop OAuth client secret>"
$env:LIFEOS_GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file"
npm run build
npm run bundle
npm run qa:packaged
npm run release:dry-run
```

`npm run build` runs the TypeScript and Vite frontend production build.
`npm run bundle` runs the unsigned NSIS bundle path through
`scripts/build-google-drive-bundle.ps1`. The script requires a real
`LIFEOS_GOOGLE_OAUTH_CLIENT_ID` and matching
`LIFEOS_GOOGLE_OAUTH_CLIENT_SECRET` so private dogfood installers embed the
Google OAuth Desktop config and can exchange OAuth codes after install. The
default Drive scope is `https://www.googleapis.com/auth/drive.file`; using full
`https://www.googleapis.com/auth/drive` requires the explicit
`LIFEOS_GOOGLE_DRIVE_ALLOW_FULL_SCOPE=1` guard. Do not commit real OAuth client
configuration.
`npm run qa:packaged` runs the automated packaged desktop smoke. It builds the
unsigned NSIS bundle, copies the release `lifeos-v4.exe` into a clean temporary
install sandbox with Cyrillic and a long path segment, launches that copied exe
in smoke mode, and writes a JSON report covering launch, install-local data
root, migrations, repeat launch persistence, same-folder upgrade/pre-update
  backup, backup/export, search, integrity, Notes gateway, browser-preview Notes
  safety, Quick Notes mini-window, reminders including permission-denied and
  unavailable-notification cases, update-data-preservation from an older
  runtime marker, Windows path edge cases, and the uninstall/reinstall
  data-preservation policy.
Set `LIFEOS_QA_FAKE_GOOGLE_DRIVE=1` before `npm run qa:packaged` to add the
credential-free fake-provider Google Drive encrypted backup smoke path. This
mode verifies local backup creation, local encryption into `.lifeosbackup`,
durable pending/uploaded job state, fake remote completion metadata, and
large-file-safe transfer contracts without running real Google OAuth or touching
Google Drive.
`npm run release:dry-run` runs the local public-release dry-run gate: frontend
and Rust quality gates, `cargo audit`, Rust and npm SBOM generation, Rust and
npm production dependency license gates, unsigned NSIS build, packaged smoke,
SHA256 generation, signature status capture, build provenance, and
`target/security/release-evidence.*`. It is expected to end with
`NotSignedBlocked`, not a public production artifact. Rust SBOM generation
should not emit internal-crate `invalid license expression (UNLICENSED)`
warnings; internal crates use `publish = false` plus `license-file` while the
project remains closed.

Expected generated paths after a successful Windows build:

- frontend output: `apps/desktop/dist/`
- release executable: `target/release/lifeos-v4.exe`
- NSIS installer: `target/release/bundle/nsis/`

The exact installer filename is generated by Tauri and may include the app
version and architecture.

## Unsigned Build Limitation

Current builds are unsigned. This means:

- Windows SmartScreen may show an unknown-publisher warning.
- The installer and executable are not suitable for broad public distribution.
- Users must only run builds they created locally or received through a trusted
  private channel.
- No automatic update trust chain exists yet.

Do not hide or work around these warnings in release notes. They are expected
until code signing is configured.

## Public Production Blockers

Before any public production release:

- produce signed artifacts for the release executable and NSIS installer;
- configure updater signing separately from Windows Authenticode signing before
  relying on automatic update delivery;
- choose the final publisher/legal identity;
- buy or provision a Windows code signing certificate;
- store signing credentials outside the repository and outside normal app data;
- configure Tauri Windows signing through certificate settings or `signCommand`;
- configure timestamping so signatures survive certificate expiry;
- generate and publish SHA256 hashes for all distributed artifacts;
- generate SBOM and build provenance evidence for the release;
- run and record dependency license gates;
- run and record installer smoke covering install, launch, uninstall, and
  Windows uninstall entry checks;
- document signing and verification steps for every release;
- publish and verify the updater manifest/artifacts for any release that should
  be discoverable by installed clients.

Stage 6 explicitly does not buy, request, or configure a signing certificate.

## Private Dogfood Verification Gate

Before handing a private Windows dogfood build to the owner:

- use Settings > Data to create a local backup or document why no user data exists yet;
- if testing data migration/export behavior, create a readable export and record the generated `exports/lifeos-export-*` path;
- before relying on an existing backup/export for recovery, run Settings > Data restore/import dry-run against the artifact path and record whether the report is clean;
- run `npm run lint`;
- run `npm test`;
- run `npm run typecheck`;
- run `cargo clippy --workspace --all-targets -- -D warnings`;
- run `cargo test --workspace`;
- run `cargo audit --deny warnings`;
- run `npm run bundle`;
- run `npm run qa:packaged` and retain the JSON report path as packaged smoke
  evidence;
- run `$env:LIFEOS_QA_FAKE_GOOGLE_DRIVE = "1"; npm run qa:packaged` and retain
  the JSON report path as encrypted Google Drive fake-provider smoke evidence;
- record the exact artifact paths, sizes, hashes, and signature status;
- confirm generated `dist/`, `target/`, and bundle outputs are ignored by git;
- run the NSIS installer when practical;
- launch the installed application;
- verify that the installed app creates/uses `<install directory>\data` and
  does not populate old `%APPDATA%` / WebView data as the active runtime store;
- for an update smoke, install a newer build into the same folder and verify it
  uses the existing `data` directory rather than starting empty;
- after launching a newer release build against existing data, verify a
  `data\backups\pre-update\lifeos-pre-update-v*` backup exists when the stored
  runtime data version changed;
- `npm run qa:packaged` must include a passed `update-data-preservation` check:
  the smoke seeds an older runtime marker, legacy SQLite, frontend files, and
  Notes/Diary files before the first launch, then verifies pre-update backup
  contents and the post-launch runtime version marker;
- once the updater is implemented/enabled, run an updater smoke: verify startup
  check and Settings manual check both find the newer version, show
  `Вышло новое обновление`, offer `Установить сейчас` and `Позже`, and only
  apply after confirmation;
- run the NSIS uninstaller and verify installer-managed files and registry
  uninstall entry are removed while `<install directory>\data` remains
  available for recovery or the next install;
- reinstalling into the same folder must reuse the preserved `data` folder;
  reinstalling into a different folder must start from that folder's own
  separate `data`; deleting local user data is not a default uninstall action
  and must be manual or a future explicit data-delete flow;
- note that WebView2 may be downloaded by the installer if it is missing on the
  target Windows machine.
- Google Drive encrypted backup sync private QA:
  - connect Google account;
  - set a folder name in Settings and verify LifeOS creates/uses that named
    Drive folder without a folder-link field;
  - verify Settings does not require a recovery password/key and that connect
    provisions the managed encryption key through OS keyring plus the LifeOS
    Drive key document;
  - trigger `Синхронизировать сейчас`;
  - verify only encrypted `.lifeosbackup` and completion metadata are uploaded,
    upload uses Drive resumable semantics, and the encrypted artifact is sent
    from disk without loading the whole file into memory;
  - verify Settings does not show `Хранить последних копий` or
    `Создавать резервную копию при закрытии`;
  - create enough complete remote backups to exceed one latest state and verify
    old complete artifact+metadata pairs move to trash while orphan/pending
    `.lifeosbackup` files without metadata remain untouched;
  - verify the bottom-right sync indicator shows a spinner while syncing, turns
    into a check mark after success, and disappears after one minute;
  - verify remote backup listing uses completion metadata `completed_at_ms` and
    `byte_count` when present;
  - simulate latest-only cleanup trash/delete failure and verify the latest
    upload remains synced/uploaded instead of becoming pending;
  - close app with Google Drive connected and verify the shutdown loading screen
    waits for `synced` before real exit;
  - simulate offline upload and confirm `Ожидает загрузки`;
  - reinstall/fresh-data launch;
  - reconnect Google Drive;
  - download latest backup and verify restore download streams into a temp file,
    publishes the final `.lifeosbackup` only after rename, and rejects known size
    mismatches without leaving a final-looking artifact;
  - decrypt through the managed Google Drive key without entering a recovery
    password/key;
  - dry-run restore;
  - apply restore.

Use `docs/lifeos-v4/release-security-checklist.md` for the parallel security
truth. Missing public gates must be recorded as public blockers, not treated as
passed dogfood requirements.

## Personal Dogfood Handoff Gate

For the first personal-use handoff, optimize for a trustworthy local build that
can be installed and used daily by the owner. This is not a public release gate.

Required before handing over the file:

- rebuild the current workspace after the latest changes;
- run `npm run lint`, `npm test`, `npm run typecheck`, `npm run build`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace`, and `cargo audit --deny warnings`;
- run `npm run bundle` from `apps/desktop`;
- run `npm run qa:packaged` from `apps/desktop` and keep the generated JSON
  report with the handoff evidence;
- record the generated installer path and release executable path;
- record SHA256 hashes and `NotSigned` / signature status for both artifacts;
- install the NSIS build on the target or current Windows user when practical;
- launch the installed app and confirm it reaches the main shell;
- confirm runtime data appears under the selected install folder's `data`
  directory and that a different install folder starts from its own `data`;
- confirm installing a newer build into the same selected folder keeps the same
  `data` directory and creates a pre-update backup before migrations when the
  previous runtime version differs;
- check that Settings > Data backup/export and restore/import dry-run actions are visible and document any
  backup/export/restore limitation before real personal data is entered;
- include a short known-limits note covering unsigned build warnings,
  dry-run-first restore/import with supported v1 staged apply limits,
  local-only unencrypted data, private-dogfood WebView notification fallback
  instead of final native Windows toasts, and intentionally shallow MVP module
  surfaces;
- ask the user to collect feedback as concrete items: module, exact action,
  expected behavior, actual behavior, screenshot/video if visual, and priority.

## CI Automation Status (2026-05-13)

Repository-level quality gates are now automated in GitHub Actions:

- `.github/workflows/frontend.yml`:
  - `npm ci`
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
- `.github/workflows/rust.yml`:
  - `cargo fmt --all -- --check`
  - `cargo clippy --workspace --all-targets -- -D warnings`
  - `cargo test --workspace`
- `.github/workflows/security-audit.yml`:
  - `cargo audit --deny warnings`

Branch protection should require these checks before merging release-facing
changes.

## Public Windows Release Workflow

The public Windows release path is the manual GitHub Actions workflow:

`/.github/workflows/public-windows-release.yml`

This workflow is separate from the private dogfood `npm run bundle` command.
The dogfood command still runs `tauri build --bundles nsis --no-sign` and must
not be used for public distribution.

The workflow has two modes:

- `dry-run`: default mode. It builds Authenticode-unsigned artifacts with no
  production Windows signing config. If future updater publishing is explicitly
  enabled, it also requires Tauri updater signing so the updater `.sig` and
  `latest.json` path is exercised. It runs the release evidence path, records
  Authenticode `NotSigned`, writes
  `target/security/signatures/signing-gate.json` with `NotSignedBlocked`, and
  uploads evidence for review. These artifacts are internal release-candidate
  evidence only and must not be distributed publicly.
- `production`: requires a real code-signing certificate, final
  `LIFEOS_PUBLIC_PUBLISHER`, certificate thumbprint, certificate password, and
  timestamp URL. It signs Windows executables through a CI-only Tauri config
  mutation and refuses to upload unless every executable artifact has
  Authenticode `Valid` with a timestamp and signer certificate subject matching
  `LIFEOS_PUBLIC_PUBLISHER`. The imported PFX must contain a private key, the
  Code Signing EKU, and must be paired with a real timestamp URL accepted by the
  Windows signing toolchain. If future
  updater publishing is explicitly enabled, production also signs updater
  artifacts through the Tauri updater key and publishes the updater installer,
  `.sig`, and `latest.json` to the configured Cloudflare R2 bucket after the
  release gates pass.

Both modes run the same release gates before upload:

- clean checkout;
- `npm ci`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test`;
- `npm audit --audit-level=moderate`;
- `npm run build`;
- `cargo fmt --all -- --check`;
- `cargo clippy --workspace --all-targets -- -D warnings`;
- `cargo test --workspace`;
- `cargo audit --deny warnings`;
- npm SBOM through `npm sbom --omit dev --sbom-format spdx`;
- Rust SBOM through `cargo-cyclonedx`; missing tool installation fails with a
  clear message;
- Rust and npm production dependency license inventory/gate;
- production-only certificate validation: non-placeholder
  `LIFEOS_PUBLIC_PUBLISHER`, imported PFX private key, Code Signing EKU,
  absolute timestamp URL, and publisher match against the certificate subject;
- production-only temporary CI Tauri signing config using the final publisher,
  certificate thumbprint, `sha256`, and timestamp URL;
- signed production NSIS build through `npx tauri build --bundles nsis`, or
  Authenticode-unsigned dry-run NSIS build without the production Windows
  signing config;
- future-updater-only Tauri updater artifact signing through
  `TAURI_SIGNING_PRIVATE_KEY`;
- future-updater-only manifest generation at
  `target/release/bundle/nsis/latest.json`;
- Authenticode gate: `Valid` plus timestamp plus signer-subject publisher match
  for production, `NotSignedBlocked` for dry-run;
- SHA256 generation for every executable release artifact;
- installer smoke covering silent install, launch, Windows uninstall entry, and
  silent uninstall;
- build provenance JSON with commit, workflow, toolchain, and artifact names;
- release evidence files at `target/security/release-evidence.json` and
  `target/security/release-evidence.md`;
- production-only GitHub build provenance attestation with `actions/attest@v4`
  and `target/security/hashes/SHA256SUMS.txt`.
- production-only Cloudflare R2 updater publish only when
  `LIFEOS_UPDATE_RELEASE_ENABLED=true` and the R2 variables/access-key secrets
  are configured.

Required GitHub Actions inputs before any manual workflow run that should build
signed updater artifacts after auto-update is promoted again:

- Secret: `TAURI_SIGNING_PRIVATE_KEY` - Tauri updater private signing key.
- Secret: `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - optional updater key password;
  leave empty only when the key has no password.
- Repository variable: `LIFEOS_UPDATE_BASE_URL` - expected value:
  `https://updates.lifeos.app`.

Required GitHub Actions inputs before a `production` run:

- Secret: `WINDOWS_CODESIGN_CERTIFICATE_BASE64` - base64-encoded `.pfx`
  certificate.
- Secret: `WINDOWS_CODESIGN_CERTIFICATE_PASSWORD` - PFX export password.
- Repository variable: `WINDOWS_CODESIGN_CERTIFICATE_THUMBPRINT` - certificate
  thumbprint without relying on repository-stored certificate material.
- Repository variable: `WINDOWS_CODESIGN_TIMESTAMP_URL` - timestamp endpoint.
- Repository variable: `LIFEOS_PUBLIC_PUBLISHER` - final legal publisher
  identity from the real code-signing certificate subject. It must match the
  full subject, `CN`, or `O` on the imported certificate and must not be
  `LifeOS v4 Publisher Placeholder`.

Required GitHub Actions inputs to publish updater artifacts to Cloudflare R2
during a successful `production` run after auto-update is promoted again:

- Repository variable: `LIFEOS_UPDATE_RELEASE_ENABLED` - set to `true`.
- Repository variable: `LIFEOS_UPDATE_R2_ACCOUNT_ID`.
- Repository variable: `LIFEOS_UPDATE_R2_BUCKET` - recommended value:
  `lifeos-updates`.
- Repository variable: `LIFEOS_UPDATE_R2_PREFIX` - optional; leave empty for the
  root bucket layout.
- Secret: `LIFEOS_UPDATE_R2_ACCESS_KEY_ID`.
- Secret: `LIFEOS_UPDATE_R2_SECRET_ACCESS_KEY`.

Current blocker: the owner is a solo developer without a separate legal
entity/company. Public release must use the owner's real individual
code-signing certificate subject or wait until an appropriate legal entity and
certificate exist. Until that exact publisher value and signing inputs exist,
`production` runs are expected to fail before artifact upload. `dry-run` runs
are expected to pass and record `NotSignedBlocked`.

## Current Verification Baseline

- The long Stage 17 snapshot from `2026-05-08` is historical evidence only.
- Do not reuse old static metrics (for example old test-count numbers) as a
  current release claim.
- For each new candidate build, rerun the gate commands and capture fresh
  outputs.

Release evidence template for each private dogfood or public dry-run candidate:

- Date/time and git commit SHA.
- Result of each gate command listed in this file.
- Generated artifact paths:
  - `target/release/lifeos-v4.exe`
  - `target/release/bundle/nsis/*.exe`
- SHA256 for each artifact.
- Authenticode signature status for each artifact.
- `npm run qa:packaged` JSON report path and pass/fail status.
- Install smoke notes (install, launch, uninstall, and registry entry checks).
- Update smoke notes (same-folder update, existing data preserved, pre-update
  backup path when applicable, failed-upgrade rollback path if exercised).
- For public dry-run/production candidates: `target/security/release-evidence.json`,
  `target/security/release-evidence.md`,
  `target/security/provenance/build-provenance.json`,
  `target/security/hashes/SHA256SUMS.txt`,
  `target/security/signatures/authenticode.json`, and
  `target/security/signatures/signing-gate.json`.
- For updater-enabled public workflow candidates:
  `target/release/bundle/nsis/*.sig` and
  `target/release/bundle/nsis/latest.json`.

## Deferred Updater Smoke 2026-05-19

Result: deferred before real end-to-end update. Do not treat this as a passed
updater smoke or a current private dogfood release blocker.

2026-05-20 grouped-pass resolution: no explicit owner confirmation enabled
auto-update for the current pass, so the active updater smoke below remains
deferred. The already-started startup/manual/install implementation is guarded
behind `VITE_LIFEOS_UPDATER_ENABLED=1`, and updater artifact creation remains
behind `LIFEOS_UPDATE_RELEASE_ENABLED=true`.

- v1 installed version: `0.1.0`, detected in the Windows uninstall registry as
  `LifeOS v4` installed at
  `C:\Users\Nomoregooners\Downloads\LifeOs\LifeOS v4`.
- v2 update version: not available locally; `apps/desktop/package.json` still
  reports `0.1.0`, and no signed `0.1.1` updater installer was present.
- endpoint: `https://updates.lifeos.app/latest.json`.
- endpoint check: blocked; `Invoke-WebRequest` failed with DNS resolution error
  `The remote name could not be resolved: 'updates.lifeos.app'`.
- update modal shown: not run because no resolvable endpoint and no published
  v2 updater manifest/artifacts were available.
- `Позже` worked: not run.
- `Установить сейчас` worked: not run.
- relaunch worked: not run.
- data folder preserved: not proven by updater smoke. Existing installed v1 data
  folder was present at
  `C:\Users\Nomoregooners\Downloads\LifeOs\LifeOS v4\data` with
  `lifeos.sqlite3`, SQLite sidecars, `frontend-records.json`,
  `frontend-preferences.json`, `runtime-version.json`, `notes\`, and `backups\`.
- pre-update backup path: existing pre-update folders were present under
  `C:\Users\Nomoregooners\Downloads\LifeOs\LifeOS v4\data\backups\pre-update\`,
  but they are not evidence of this updater v1-to-v2 smoke because the updater
  install did not run.
- local updater artifacts: `target\release\bundle\nsis\LifeOS v4_0.1.0_x64-setup.exe`
  existed; no `.sig` and no `latest.json` existed in that folder.
- local secrets/environment: `TAURI_SIGNING_PRIVATE_KEY`,
  `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, `LIFEOS_UPDATE_BASE_URL`,
  `LIFEOS_UPDATE_R2_ACCOUNT_ID`, `LIFEOS_UPDATE_R2_BUCKET`,
  `LIFEOS_UPDATE_R2_ACCESS_KEY_ID`, and
  `LIFEOS_UPDATE_R2_SECRET_ACCESS_KEY` were not present in the local
  environment.
- future updater prerequisites: configure Cloudflare R2 bucket/custom domain for
  `updates.lifeos.app`, provide R2 API credentials or GitHub Actions production
  publish inputs, provide the Tauri updater signing key, build a real `0.1.1`
  signed updater artifact plus `.sig`, publish installer/signature before
  `latest.json`, then run the manual flow documented in
  `docs/lifeos-v4/update-server.md`.

## Known Limitations

- The build is unsigned. Windows SmartScreen and unknown-publisher warnings are
  expected.
- The publisher is still `LifeOS v4 Publisher Placeholder`.
- Restore/import dry-run and apply exist for artifact version `1` backup/export
  artifacts and complete pre-update rollback artifacts. Dry-run validates manifest status/version/kind, file
  snapshot/checksums, artifact contents, collisions, and linked records before
  apply. Apply creates backup-before-restore, stages restored data, replaces
  current data with rollback copies, and validates SQLite integrity/links after
  commit.
- Same-folder update preserves install-local data and release startup creates a
  pre-update backup before SQLite/migrations when the app version changes. This
  backup includes SQLite, sidecars, `notes/`, `diary/`, frontend records, and
  frontend preferences, but not previous backups/exports/search caches. After
  rollback, run the artifact `source_app_version` or a later fixed build that
  explicitly supports that source data version. This does not delete manually
  copied old executables outside the installer-managed LifeOS install folder.
- Export and backup are local and unencrypted.
- Google Drive encrypted backup transfer is streaming for large artifacts:
  resumable upload sends the encrypted file from disk, restore download writes
  chunks to a temp file and publishes the final `.lifeosbackup` by rename only
  after a successful size check when metadata or response length is known.
- Projects, Contacts, Diary, Physical Health, Finance, Trading, and Quick Notes
  have canonical desktop storage. Projects, Contacts, Physical Health, and
  Trading use SQLite tables; Diary uses SQLite daily fields plus
  `data/diary/YYYY-MM-DD.md`; browser `localStorage` remains only a fallback
  when Tauri is unavailable.
- Export, backup, search, and integrity read these visible modules from
  canonical storage. Existing `frontend-records.json` records are legacy import
  inputs and browser fallback data, not the packaged desktop data-safety source
  of truth.
- Reminder scheduling/runtime exists with persisted delivery attempts/statuses,
  recurrence-aware due occurrences, duplicate suppression, and Settings
  diagnostics. Visible dispatch still uses the WebView Notification fallback and
  is private dogfood only; native Windows toast click routing and custom
  reminder sounds are not part of this handoff.
- Cross-device sync, mobile apps, cloud auth, encryption/PIN lock, and conflict
  resolution are not part of this release candidate.
- Several modules are intentionally shallow MVP surfaces rather than complete
  replacements for specialized apps.

## Public Production Release Blockers

The current private dogfood installer is not blocked by these items if the
limitations are documented. Public production release remains blocked until all
of them are closed:

- Signed artifacts: no real production certificate is configured yet. Dry-run
  artifacts are intentionally `NotSigned` and the public workflow records
  `NotSignedBlocked`; production mode requires `Valid` timestamped Authenticode
  signatures for the release executable and NSIS installer.
- Publisher: the checked-in Tauri config still uses
  `LifeOS v4 Publisher Placeholder`. Production mode may set
  `LIFEOS_PUBLIC_PUBLISHER` only to the subject/publisher from the real
  individual or future legal-entity code-signing certificate.
- Hashes: the public workflow and local dry-run script generate
  `target/security/hashes/SHA256SUMS.txt` and `sha256.json`; each production
  candidate must ship/review those exact files.
- SBOM/provenance: the public workflow and local dry-run script generate Rust
  and npm SBOM files plus `target/security/provenance/build-provenance.json`;
  each production candidate must keep those files with the release evidence.
- License gates: Rust and npm production dependency license gates are enforced
  before artifact upload; any denied/unknown license remains a release blocker
  until documented and approved.
- Internal crate licensing: `lifeos-core`, `lifeos-storage`, `lifeos-sync`, and
  `lifeos-desktop` remain private/internal packages with `publish = false` and
  `LICENSE.txt` as the Cargo `license-file`. This is release metadata hygiene,
  not an open-source licensing decision.
- Installer smoke: installer smoke evidence is required at
  `target/security/smoke/installer-smoke.md` for public workflow runs and the
  packaged smoke JSON report remains required for private dogfood.
- Restore/import: readable export, local backup, dry-run validation, and staged
  apply exist for artifact version `1`. Artifact version 1 preserves IDs,
  replaces current installation data after backup-before-restore, does not remap
  links, and rejects encrypted artifacts because passphrase restore is deferred.
- Notifications: due reminder payloads use the current `windows_system`
  boundary with persisted delivery status and duplicate prevention, but public
  production release remains blocked on a real native Windows toast path,
  click-action routing, and sound-channel policy instead of the private-dogfood
  WebView Notification fallback.

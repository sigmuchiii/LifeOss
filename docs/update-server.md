# LifeOS v4 Update Server

Status: deferred Cloudflare R2 static updater hosting plan
Created: 2026-05-19
Updated: 2026-05-20

LifeOS v4 should eventually use Tauri updater v2 for signed desktop update
discovery. This updater setup is deferred for the current private dogfood path,
but the intended future host is an owner-controlled Cloudflare R2 bucket served
through the HTTPS custom domain `updates.lifeos.app`.

The server side remains static. R2 does not run LifeOS app code, databases,
auth, or a release API.

Current repository default: updater startup/manual checks are disabled unless
the frontend is built with `VITE_LIFEOS_UPDATER_ENABLED=1`, and Tauri updater
artifact creation/publishing is disabled unless
`LIFEOS_UPDATE_RELEASE_ENABLED=true` is set for the release workflow. The public
release workflow maps that variable into `VITE_LIFEOS_UPDATER_ENABLED` for
future updater-enabled builds.

## Scope

The update bucket only hosts updater artifacts:

- `latest.json`, the mutable Tauri updater manifest.
- Windows x64 NSIS installer artifacts.
- Tauri updater signature files generated next to the installer.

## Cloudflare Setup

Required Cloudflare resources when auto-update is promoted again:

- Cloudflare account with R2 enabled.
- R2 bucket, recommended name: `lifeos-updates`.
- Custom domain for the bucket: `updates.lifeos.app`.
- Public access through that custom domain.
- R2 API token / S3 API credentials with object read/write access to the bucket.

The intended future updater endpoint is:

```text
https://updates.lifeos.app/latest.json
```

The R2 S3-compatible endpoint used by CI has this shape:

```text
https://<cloudflare-account-id>.r2.cloudflarestorage.com
```

## Static Layout

Use this object layout in the R2 bucket:

```text
latest.json
windows/
  x64/
    lifeos-v4_0.1.1_x64-setup.exe
    lifeos-v4_0.1.1_x64-setup.exe.sig
```

The public URLs are:

```text
https://updates.lifeos.app/latest.json
https://updates.lifeos.app/windows/x64/lifeos-v4_0.1.1_x64-setup.exe
https://updates.lifeos.app/windows/x64/lifeos-v4_0.1.1_x64-setup.exe.sig
```

`latest.json` is the only mutable object. Installer and signature filenames
should include the app version and architecture so already published artifacts
remain addressable while clients are updating.

## Manifest Contract

`latest.json` must stay compatible with Tauri updater v2:

```json
{
  "version": "0.1.1",
  "notes": "Updater smoke release",
  "pub_date": "2026-05-19T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "base64-tauri-updater-signature",
      "url": "https://updates.lifeos.app/windows/x64/lifeos-v4_0.1.1_x64-setup.exe"
    }
  }
}
```

Generate it locally with:

```powershell
cd "C:\Users\Nomoregooners\projects\LifeOS v4\apps\desktop"
npm run updater:manifest -- -Version "0.1.1" -InstallerPath "..\..\target\release\bundle\nsis\LifeOS v4_0.1.1_x64-setup.exe" -SignaturePath "..\..\target\release\bundle\nsis\LifeOS v4_0.1.1_x64-setup.exe.sig" -BaseUrl "https://updates.lifeos.app" -OutputPath "..\..\target\release\bundle\nsis\latest.json" -Notes "Updater smoke release"
```

The script URL-escapes the installer filename in the manifest, so filenames with
spaces are safe for the updater URL.

## Manual Publication To R2

Manual publication steps for a signed updater-enabled build:

1. Build the Windows NSIS installer with Tauri updater signing enabled.
2. Confirm the installer and matching `.sig` file exist under
   `target/release/bundle/nsis/`.
3. Generate `latest.json` with `npm run updater:manifest`.
4. Upload the installer and `.sig` to R2.
5. Upload `latest.json` after the installer and signature are already present.
6. Verify the manifest and installer URLs from a clean machine or browser.

The repository includes an R2 publisher script. It uploads the installer and
`.sig` first, then uploads `latest.json` last.

Required local environment:

```powershell
$env:LIFEOS_UPDATE_R2_ACCOUNT_ID = "<cloudflare-account-id>"
$env:LIFEOS_UPDATE_R2_BUCKET = "lifeos-updates"
$env:LIFEOS_UPDATE_R2_ACCESS_KEY_ID = "<r2-access-key-id>"
$env:LIFEOS_UPDATE_R2_SECRET_ACCESS_KEY = "<r2-secret-access-key>"
$env:LIFEOS_UPDATE_R2_PREFIX = "" # optional, leave empty for root bucket layout
```

Dry-run the object plan:

```powershell
cd "C:\Users\Nomoregooners\projects\LifeOS v4\apps\desktop"
npm run updater:publish-r2 -- --bundle-dir "..\..\target\release\bundle\nsis" --dry-run
```

Publish:

```powershell
npm run updater:publish-r2 -- --bundle-dir "..\..\target\release\bundle\nsis"
```

Verify after upload:

```powershell
Invoke-RestMethod "https://updates.lifeos.app/latest.json"
Invoke-WebRequest "https://updates.lifeos.app/windows/x64/lifeos-v4_0.1.1_x64-setup.exe" -Method Head -UseBasicParsing
```

Do not publish `latest.json` before the installer and `.sig` are reachable,
because installed clients may check the manifest immediately.

## Manual End-To-End Updater Smoke

Use this runbook when validating the real updater path from an installed
updater-enabled v1 build to a newer v2 build. Do not mark the smoke as passed
unless the client downloads from the real HTTPS endpoint and relaunches into the
new installed version.

Required access and inputs:

- a working `updates.lifeos.app` custom domain on the R2 bucket;
- R2 S3 API credentials with write access to the bucket;
- `TAURI_SIGNING_PRIVATE_KEY` and, when applicable,
  `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`;
- a signed updater-enabled v1 installer, normally version `0.1.0`;
- a signed newer v2 installer and matching `.sig`, normally version `0.1.1`;
- a Windows machine where the v1 installer can be installed and relaunched.

Build a signed v2 updater artifact from the v2 source:

```powershell
cd "C:\Users\Nomoregooners\projects\LifeOS v4\apps\desktop"
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content -Raw "C:\path\to\lifeos-v4-updater.key"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "<password or empty string>"
npm ci
npm run build
npx tauri build --bundles nsis
```

Generate `latest.json` for the v2 artifact:

```powershell
$bundle = Resolve-Path "..\..\target\release\bundle\nsis"
$installer = Get-ChildItem $bundle -Filter "*setup.exe" -File | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
$signature = Get-ChildItem $bundle -Filter "*.sig" -File | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
npm run updater:manifest -- -Version "0.1.1" -InstallerPath $installer.FullName -SignaturePath $signature.FullName -BaseUrl "https://updates.lifeos.app" -OutputPath "$bundle\latest.json" -Notes "Updater smoke release"
```

Publish v2 to R2:

```powershell
npm run updater:publish-r2 -- --bundle-dir "$bundle"
```

Manual Windows client flow:

1. Install the updater-enabled v1 build into a known folder.
2. Launch v1 and create visible data, for example a task, a quick note, and a
   note file. Confirm `<install directory>\data` contains `lifeos.sqlite3` and
   the expected app data.
3. Relaunch v1 after v2 is published.
4. Confirm the startup modal appears with `Вышло новое обновление`,
   `Установить сейчас`, and `Позже`.
5. Click `Позже`. Expected: the modal closes, the app keeps running as v1, and
   the installed files do not change.
6. Open Settings and click the manual update check.
7. Click `Установить сейчас`. Expected: the updater downloads the v2 installer,
   verifies the `.sig`, installs, and relaunches.
8. Confirm the installed app is v2, the visible v1 data still loads, and the
   same `<install directory>\data` folder is still used.
9. Confirm a complete pre-update backup exists under
   `<install directory>\data\backups\pre-update\lifeos-pre-update-v*`.

Evidence commands:

```powershell
$install = "C:\path\to\installed\LifeOS v4"
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" |
  Where-Object { $_.DisplayName -like "*LifeOS*" } |
  Select-Object DisplayName,DisplayVersion,InstallLocation,Publisher

Get-Content "$install\data\runtime-version.json"
Get-ChildItem "$install\data" -Force
Get-ChildItem "$install\data\backups\pre-update" -Force |
  Sort-Object LastWriteTimeUtc -Descending |
  Select-Object -First 1 FullName,LastWriteTimeUtc
```

## GitHub Actions Publication

The manual public Windows release workflow,
`.github/workflows/public-windows-release.yml`, can produce and publish updater
artifacts when `LIFEOS_UPDATE_RELEASE_ENABLED` is set to `true`.

Required for both `dry-run` and `production` workflow runs when updater release
publishing is enabled:

- Secret: `TAURI_SIGNING_PRIVATE_KEY` - Tauri updater private signing key.
- Secret: `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - optional password for the
  updater private key; leave empty only when the key has no password.
- Repository variable: `LIFEOS_UPDATE_BASE_URL` - expected value:
  `https://updates.lifeos.app`.

Additional required inputs for `production` R2 publication when updater release
publishing is enabled:

- Repository variable: `LIFEOS_UPDATE_R2_ACCOUNT_ID`.
- Repository variable: `LIFEOS_UPDATE_R2_BUCKET` - recommended value:
  `lifeos-updates`.
- Repository variable: `LIFEOS_UPDATE_R2_PREFIX` - optional; leave empty for
  the root bucket layout.
- Secret: `LIFEOS_UPDATE_R2_ACCESS_KEY_ID`.
- Secret: `LIFEOS_UPDATE_R2_SECRET_ACCESS_KEY`.

When enabled, the workflow generates `latest.json` from the actual NSIS setup
installer and matching `.sig`, uploads the installer, `.sig`, and `latest.json`
as GitHub Actions artifacts, then publishes the production updater artifacts to
R2.

When `LIFEOS_UPDATE_RELEASE_ENABLED` is not `true`, CI disables updater artifact
generation and skips updater manifest/R2 publication. `dry-run` never publishes
to R2.

## Retention Policy

Keep:

- the current release referenced by `latest.json`;
- the last 3 rollback releases with their matching `.sig` files.

Delete older installers only after confirming no active private dogfood machine
needs them for rollback or in-progress updates. R2 should be monitored for
storage and request/bandwidth usage, because updater cost scales with installer
downloads rather than CPU.

Before deletion:

1. Confirm the release is not referenced by `latest.json`.
2. Confirm the release is outside the current plus last 3 rollback window.
3. Keep release evidence, hashes, and smoke notes in repository documentation or
   release evidence storage even after deleting R2 binaries.

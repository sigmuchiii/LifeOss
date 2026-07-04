# LifeOS v4 Release Security Checklist

Status: active  
Created: 2026-05-13  
Updated: 2026-05-20

Use this checklist for each Windows private dogfood candidate and future public
release candidate build. It records release-security truth; it does not create a
public-ready release by itself.

## 0. Release Scope

Current release target: private dogfood only.

Private dogfood installer gate: the current owner-only handoff may proceed with
unsigned artifacts, placeholder publisher, and missing public SBOM/provenance
or license evidence only when those limitations are documented in the handoff
notes and `docs/lifeos-v4/release-checklist.md`.

Public production release is blocked until all public gates are complete:
signed artifacts, final publisher identity, SHA256 hashes, SBOM, build
provenance, license gates, and installer smoke evidence.

Public Windows artifacts must be produced only through
`/.github/workflows/public-windows-release.yml`. That workflow is manual
(`workflow_dispatch`) and has `dry-run` and `production` modes. `dry-run`
proves the public release evidence path without a real certificate and records
`NotSignedBlocked`; dry-run artifacts are not public-distribution artifacts.
Auto-update is deferred from the current private dogfood path. Runtime
startup/manual checks are disabled unless the frontend is built with
`VITE_LIFEOS_UPDATER_ENABLED=1`, and checked-in local bundle config keeps
`createUpdaterArtifacts=false`. When `LIFEOS_UPDATE_RELEASE_ENABLED=true` is
set in the future, the workflow maps that value into the frontend
`VITE_LIFEOS_UPDATER_ENABLED` build flag, requires Tauri updater signing inputs
so the NSIS updater `.sig` and `latest.json` artifacts are produced, and
`production` publishes the updater installer, `.sig`, and manifest to the
configured Cloudflare R2 bucket after the existing release gates pass.
`production` uploads artifacts only after quality, audit, SBOM, license,
signing, hash, signature, provenance, and installer-smoke gates pass.

The private dogfood `npm run bundle` path remains unsigned and is not a public
release path.

## 1. Signing Readiness

- Confirm final legal publisher identity for the release.
- Confirm code-signing certificate is valid and not expired.
- Confirm the imported `.pfx` contains the private key and the Code Signing EKU
  (`1.3.6.1.5.5.7.3.3`).
- Confirm timestamping endpoint is configured for signature longevity.
- Confirm the timestamping endpoint is an absolute HTTP(S) URL accepted by the
  Windows signing toolchain.
- Confirm signing secrets are stored outside repository and outside normal app
  data folders.
- Confirm release artifacts are signed and Authenticode status is not
  `NotSigned`.
- Confirm Authenticode status is `Valid` and `TimeStamperCertificate` exists for
  both `target/release/lifeos-v4.exe` and the NSIS installer.
- Confirm `LIFEOS_PUBLIC_PUBLISHER` matches a publisher identity from the real
  code-signing certificate subject, such as the full subject, `CN`, or `O`.
- Confirm release evidence rechecks every executable signer certificate subject
  against `LIFEOS_PUBLIC_PUBLISHER`; workflow setup alone is not enough.
- When future updater publishing is enabled, confirm Tauri updater signing uses
  the dedicated updater key, not the Windows Authenticode certificate.
- When future updater publishing is enabled, confirm the generated NSIS
  installer has a matching `.sig` file before `latest.json` is uploaded or
  published.

Required GitHub Actions signing inputs for public production:

- Secret: `WINDOWS_CODESIGN_CERTIFICATE_BASE64`.
- Secret: `WINDOWS_CODESIGN_CERTIFICATE_PASSWORD`.
- Repository variable: `WINDOWS_CODESIGN_CERTIFICATE_THUMBPRINT`.
- Repository variable: `WINDOWS_CODESIGN_TIMESTAMP_URL`.
- Repository variable: `LIFEOS_PUBLIC_PUBLISHER`.

Additional GitHub Actions signing inputs when future updater publishing is
enabled:

- Repository variable: `LIFEOS_UPDATE_RELEASE_ENABLED` - set to `true`.
- Secret: `TAURI_SIGNING_PRIVATE_KEY`.
- Secret: `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` when the updater key is
  password-protected.
- Repository variable: `LIFEOS_UPDATE_BASE_URL`.

`LIFEOS_PUBLIC_PUBLISHER` must be the final legal publisher identity. The
placeholder `LifeOS v4 Publisher Placeholder` blocks public release.

Owner context: the current project owner is a solo developer without a separate
legal entity/company. For public signing, use the publisher/subject from a real
individual code-signing certificate, or postpone public release until an
appropriate legal entity and certificate exist.

The final identity source is fixed even though the exact value is not known yet:
`LIFEOS_PUBLIC_PUBLISHER` must equal the subject/publisher on the real
certificate. The repository must not invent a publisher string to make a public
run green.

Required GitHub Actions Cloudflare R2 publication inputs for `production` when
future updater publishing is enabled:

- Repository variable: `LIFEOS_UPDATE_R2_ACCOUNT_ID`.
- Repository variable: `LIFEOS_UPDATE_R2_BUCKET`.
- Repository variable: `LIFEOS_UPDATE_R2_PREFIX` when a non-root bucket prefix
  is used.
- Secret: `LIFEOS_UPDATE_R2_ACCESS_KEY_ID`.
- Secret: `LIFEOS_UPDATE_R2_SECRET_ACCESS_KEY`.

When updater publishing is enabled, missing R2 publication inputs block
`production`. They must not be bypassed by the signing, hash, evidence,
installer smoke, or artifact upload gates.

## 2. Build Provenance

- Record release commit SHA and branch.
- Record build host/runner context (local or CI workflow run URL).
- Confirm release artifacts are built from a clean tree (`git status` clean).
- Confirm release notes include exact artifact paths and SHA256 digests.
- Confirm `target/security/provenance/build-provenance.json` records commit,
  workflow/run context, toolchain versions, and artifact names.
- Confirm `target/security/release-evidence.json` and
  `target/security/release-evidence.md` exist for the exact candidate.
- Confirm CI gate runs passed for the same commit:
  - frontend gate (`frontend.yml`)
  - rust gate (`rust.yml`)
  - security gate (`security-audit.yml`)

## 3. Dependency Audit Gate

Run from repository root:

```powershell
cargo audit --deny warnings
```

- If the gate fails on a new advisory, triage before release.
- If an advisory is intentionally temporary-allowlisted, it must be listed in
  `/.cargo/audit.toml` and documented in
  `docs/lifeos-v4/security-audit-policy.md`.
- Revalidate allowlisted advisories against the current lockfile graph.

## 4. License Gate

Private dogfood builds must state whether dependency license inventory/gating
has been run. A missing license gate is acceptable only as a documented private
dogfood limitation.

Public production release requires recorded license gates for Rust and frontend
dependencies before artifacts can be distributed publicly.

The public workflow currently records and gates licenses with:

```powershell
cargo metadata --locked --format-version 1
cd apps/desktop
npm ls --omit=dev --json --long
```

The fail-safe policy blocks public release when a production dependency has
missing license metadata or a denied copyleft/proprietary pattern such as GPL,
AGPL, LGPL, SSPL, BUSL, or Commons Clause. SPDX-style `OR` expressions are
allowed when at least one permissive alternative such as MIT or Apache-2.0 is
available and the expression is not an `AND` obligation. Any exception must be
documented before the workflow is allowed to upload artifacts.

Internal LifeOS workspace crates are private packages, not open-source release
artifacts. Their Cargo metadata must stay compatible with SBOM tooling without
granting public rights: the workspace uses `publish = false` and
`license-file = "LICENSE.txt"`, while `lifeos-core`, `lifeos-storage`,
`lifeos-sync`, and `lifeos-desktop` inherit `publish.workspace = true` and
`license-file.workspace = true`. Do not replace this with a public SPDX license
expression unless the owner explicitly decides to open-source the project.

## 5. SBOM Procedure

Minimum expected artifacts:

- Rust dependency SBOM (CycloneDX JSON).
- Frontend npm dependency SBOM (SPDX/CycloneDX acceptable).

Suggested commands:

```powershell
# Rust SBOM
cargo install cargo-cyclonedx --locked
cargo cyclonedx --manifest-path Cargo.toml --format json --override-filename rust-sbom.cdx

# Frontend SBOM
cd apps/desktop
npm sbom --omit dev --sbom-format spdx > ../../target/security/sbom/frontend-sbom.spdx.json
```

If `npm sbom` is unavailable in the local npm version, generate equivalent SBOM
with the approved fallback tool and document the fallback in release notes.

The public workflow treats missing `cargo-cyclonedx` installation as a clear
release-blocking failure.

Rust SBOM generation should be warning-clean for internal crate license
metadata. `cargo-cyclonedx` warnings such as `invalid license expression
(UNLICENSED)` are not acceptable release noise for the current private/internal
policy; fix Cargo metadata or document a deliberate exception before handoff.

Local reproducibility command from `apps/desktop`:

```powershell
npm run release:dry-run
```

This command writes the same SBOM, license, hash, signature, provenance, smoke,
and release-evidence files under `target/security/`, then blocks public
production distribution as `NotSignedBlocked`.

## 6. Artifact Verification

- Compute and record SHA256 for:
  - `target/release/lifeos-v4.exe`
  - `target/release/bundle/nsis/*.exe`
- When future updater publishing is enabled, confirm
  `target/release/bundle/nsis/*.sig` exists for the selected NSIS setup
  installer.
- When future updater publishing is enabled, confirm
  `target/release/bundle/nsis/latest.json` exists and references the configured
  `LIFEOS_UPDATE_BASE_URL`.
- Verify Authenticode signature details for each executable.
- Keep hash/signature records together with release notes.
- Confirm installer install-launch-uninstall smoke result is recorded.
- Confirm GitHub build provenance attestation was generated for the executable
  and installer.
- For private dogfood, `NotSigned` is allowed only when explicitly recorded as
  a limitation. For public production, `NotSigned` blocks release.
- For public dry-run, `NotSigned` is the expected gate result and must be
  recorded as `NotSignedBlocked` in
  `target/security/signatures/signing-gate.json`.

## 6.1 Data Recovery Gate

- Confirm same-folder Windows updates preserve `<install directory>\data` while
  replacing/removing installer-managed old app files.
- Confirm a release startup against an earlier runtime data version creates a
  pre-update backup under `data\backups\pre-update\lifeos-pre-update-v*` before
  opening SQLite/migrations.
- Restore/import is dry-run first. Before relying on a backup/export artifact,
  run Settings > Data dry-run against the artifact path and record whether the
  report is clean.
- Supported restore/import artifact version is `1`.
- Dry-run must validate manifest status/version/kind, supported version,
  snapshot/checksums, artifact contents, collisions, and linked-record
  references without modifying app data.
- Apply must create backup-before-restore, stage restored data, validate SQLite
  integrity and links before commit, replace current data with rollback copies,
  validate after commit, and report the safety backup path.
- Current artifacts are local and unencrypted. Passphrase/encrypted restore is
  deferred; encrypted artifacts must be rejected until the encrypted artifact
  contract exists.

## 7. Security Documentation Sync

Before final handoff, verify documentation consistency:

- `docs/lifeos-v4/release-checklist.md`
- `docs/lifeos-v4/security-audit-policy.md`
- `docs/lifeos-v4/spec-draft.md`
- `docs/lifeos-v4/agent-handoff.md`
- this file (`release-security-checklist.md`)

If security process changed in this release, update all three in the same
branch.

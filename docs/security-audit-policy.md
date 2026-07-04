# LifeOS v4 Security Audit Policy

Status: active  
Created: 2026-05-13  
Updated: 2026-05-19

This document defines how `cargo audit` is used as a release gate for the
desktop MVP and how temporary advisory allowlists are managed.

Current release target is private dogfood only. Public production release is
blocked until the full release-security handoff is complete: signed artifacts,
final publisher identity, SHA256 hashes, SBOM, provenance, license gates, and
installer smoke evidence.

For full release-security handoff (signing, provenance, SBOM, hashes, license
gates, installer smoke), use `docs/lifeos-v4/release-security-checklist.md`
together with this policy.

The manual public Windows release workflow is
`/.github/workflows/public-windows-release.yml`. It runs `cargo audit --deny
warnings` after Rust fmt/clippy/test and before signing, SBOM, license,
installer-smoke, provenance, release-evidence, and artifact upload gates. The
workflow supports `dry-run` evidence mode and `production` signed mode.
Production also requires a real Windows code-signing PFX with private key, Code
Signing EKU, timestamp URL, `LIFEOS_PUBLIC_PUBLISHER` matching the
certificate subject, and release evidence proving every executable has
Authenticode `Valid` plus a timestamp and matching signer subject. A passing
`cargo audit` remains necessary but not sufficient for public release.

Internal Rust crate license metadata is part of release-security hygiene even
though it is not a RustSec advisory. The LifeOS workspace crates remain
private/internal: Cargo uses `publish = false` and root `LICENSE.txt` as
`license-file` instead of `license = "UNLICENSED"`, so `cargo-cyclonedx` does
not emit invalid SPDX expression warnings. Do not switch these crates to a
public SPDX license without an explicit owner decision.

## Gate Command

Run from repository root:

```powershell
cargo audit --deny warnings
```

This command must pass before bundling a Windows private dogfood candidate or
any future public release candidate. Passing `cargo audit` alone does not make a
build public production ready.

## Desktop CSP Baseline

The desktop app must keep an explicit CSP string in:

`apps/desktop/src-tauri/tauri.conf.json`

`"csp": null` is not allowed for release candidates. If CSP needs to change for
runtime reasons, update this document and the release checklist in the same
change.

## Allowlist Source

Current allowlist is tracked in:

`/.cargo/audit.toml`

Only advisories listed there are tolerated. Any new advisory that is not listed
must fail the gate and be triaged before release.

## Current Temporary Allowlist (2026-05-13)

The current list is inherited transitively from Tauri/WRY Linux GTK and related
unicode parser dependencies. It is not a direct LifeOS domain dependency choice.

Grouped rationale:

1. GTK3 stack maintenance warnings inherited through Tauri/WRY Linux crates:
   - `RUSTSEC-2024-0411`
   - `RUSTSEC-2024-0412`
   - `RUSTSEC-2024-0413`
   - `RUSTSEC-2024-0414`
   - `RUSTSEC-2024-0415`
   - `RUSTSEC-2024-0416`
   - `RUSTSEC-2024-0417`
   - `RUSTSEC-2024-0418`
   - `RUSTSEC-2024-0419`
   - `RUSTSEC-2024-0420`
2. Additional transitive warnings:
   - `RUSTSEC-2024-0370` (`proc-macro-error` unmaintained)
   - `RUSTSEC-2024-0429` (`glib` unsound iterator advisory)
   - `RUSTSEC-2025-0075`
   - `RUSTSEC-2025-0080`
   - `RUSTSEC-2025-0081`
   - `RUSTSEC-2025-0098`
   - `RUSTSEC-2025-0100`

## Review Cadence

- Review cadence: every 30 days.
- Next review date: 2026-06-13.
- Re-check conditions:
  - Tauri upgrade;
  - WRY upgrade;
  - platform target changes;
  - new advisory entries in the RustSec DB.

## Required Review Outcome

Each review must:

1. Re-run `cargo audit --deny warnings`.
2. Verify each ignored advisory is still transitive and still unavoidable in the
   current dependency graph.
3. Remove IDs from the allowlist immediately when fixed upstream or no longer
   present in the lockfile graph.
4. Update this document's `Updated` field and `Next review date`.

# LifeOS v3 Private Dogfood Release Evidence - 2026-05-15

Status: installer candidate updated

## Build Context

- Date/time: 2026-05-15 21:23:02 +03:00
- Git commit SHA: `e4fe9a22610e1564240405f71ff8a87df4aae92b`
- Worktree state: dirty before this build; candidate was built from the current local workspace state.
- Release target: private dogfood only.
- Signing: unsigned local build; Windows SmartScreen unknown-publisher warnings are expected.
- Windows executable subsystem: `Windows GUI` (`2`), verified from the PE header after the rebuild.
- Packaged data root: installed builds store runtime data under the selected install folder at `data\`.

## Verification Commands

Run from `apps/desktop` unless otherwise noted:

- `npm run lint`: pass
- `npm test`: pass, 22 test files / 157 tests
- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run bundle`: pass

Run from repository root:

- `cargo fmt --all -- --check`: pass
- `cargo test -p lifeos-desktop --test local_data_commands`: pass, 6 tests
- `cargo clippy --workspace --all-targets -- -D warnings`: pass
- `cargo test --workspace`: pass
- `cargo audit --deny warnings`: pass

## Artifacts

Release executable:

- Path: `target/release/lifeos-v3.exe`
- Absolute path: `C:\Users\Nomoregooners\projects\LifeOs v3\target\release\lifeos-v3.exe`
- Size: 12.09 MB / 12,678,656 bytes
- SHA256: `BDA8C7C2851E471E9371E8C67B44F0F9A9335224BF6D1F10EF514C21BEB36BDC`
- Authenticode signature status: `NotSigned`
- PE subsystem: `Windows GUI` (`2`)

NSIS installer:

- Path: `target/release/bundle/nsis/LifeOS v3_0.1.0_x64-setup.exe`
- Absolute path: `C:\Users\Nomoregooners\projects\LifeOs v3\target\release\bundle\nsis\LifeOS v3_0.1.0_x64-setup.exe`
- Size: 3.02 MB / 3,168,823 bytes
- SHA256: `1A15BE3B993484D26158A1913798B37F89B082D1E9FA9F1EF3F80BC1137B8C67`
- Authenticode signature status: `NotSigned`

## Smoke Status

- Silent smoke install ran against `C:\Users\Nomoregooners\AppData\Local\Temp\LifeOSv3SmokeInstall`.
- The installed app launched from that folder and created `data\lifeos.sqlite3` plus `data\notes` inside the selected install folder.
- Smoke install was uninstalled after verification.
- WebView2 install mode remains Tauri `downloadBootstrapper`; the installer may download WebView2 on a target machine where it is missing.

## Known Limits For This Candidate

- Private owner dogfood only; not public-ready.
- Publisher remains `LifeOS v3 Publisher Placeholder`.
- Historical note for this 2026-05-15 evidence: restore/import apply was blocked at the time. This is superseded by the 2026-05-18 restore/import apply safety contract for artifact version `1`.
- Data is local-only and unencrypted.
- Historical note for this 2026-05-15 evidence: Projects, Contacts, Diary, Physical Health, and Trading were preview-only for durable data at the time of this handoff. This is superseded by the 2026-05-18 canonical-storage promotion; browser `localStorage` remains preview fallback only when Tauri is unavailable.
- Reminder visible dispatch still uses the private-dogfood WebView notification fallback rather than a final native Windows toast path.

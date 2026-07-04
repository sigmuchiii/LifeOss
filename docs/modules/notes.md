# Notes Module

Status: MVP deep module

## Purpose

Notes are the Obsidian Companion Gateway for the owner's local Markdown vault.

The primary personal-use editing path is the real Obsidian desktop app. The
user is expected to have Obsidian installed and to open the LifeOS notes folder
as an Obsidian vault. LifeOS owns the Markdown files, imports and backs them up,
and can rebuild search/backlink/tag/graph indexes, but the primary Notes module
surface now hands the user into Obsidian instead of showing an internal
Obsidian-like editor workspace.

Notes remains an explicit exception to the shared LifeOS light module style. The
global LifeOS module rail and local-first storage boundaries remain, but the
current Notes surface is intentionally minimal: a centered `Открыть Obsidian`
button and an auto-open preference below it.

## Current Decisions

- Markdown files are the user-facing source.
- SQLite/indexes may support search and relationships, but they are rebuildable and not the user-facing source.
- App creates/owns a default notes folder after installation under the resolved runtime data root at `notes/`. In packaged Windows builds this is `<install directory>\data\notes`.
- The default notes folder includes `_attachments/` for app-owned note attachments and imported images/files.
- Vault switching is not MVP.
- Notes live independently in MVP.
- Notes do not link directly to tasks/projects/habits in MVP.
- Shopping-list style notes stay in Notes/Obsidian for now. Shopping Lists is not a separate visible LifeOS module in the current scope.
- Obsidian import is MVP. The MVP import flow copies Markdown files, nested folders, and non-Markdown attachment/image files from a local Obsidian vault path into the app-owned notes folder.
- The Obsidian import entry point belongs in Settings > Data, not in the Notes right reference/backlinks panel.
- External Obsidian folders can also be registered in Settings > Data for backup sync without importing them into the app-owned Notes folder. This preserves the user's real Obsidian vault layout while still including those files in encrypted LifeOS backup artifacts.
- Visual and interaction structure should target Obsidian Companion Gateway rather than a generic notes panel.
- Notes may violate the shared LifeOS light module styling inside the Notes module area when needed for the Obsidian handoff. Other modules remain on the shared LifeOS design system.
- Obsidian desktop is a required companion app for the intended primary note-editing workflow.
- Supported integration is companion integration: shared Markdown vault plus `obsidian://` URI actions for opening Obsidian's vault manager, opening an active note by absolute file path, or opening search in Obsidian.
- The primary Notes route replaces the previous internal file tree/editor/backlinks workspace with a centered Obsidian gateway.
- The gateway shows one primary button, `Открыть Obsidian`, which launches `obsidian://choose-vault` in packaged desktop mode. Obsidian's documented `path` parameter is for absolute file paths, not folder/vault paths, so LifeOS must not send the app-data Notes folder through `open?path=...`.
- The gateway shows a checkbox below the button: `Автоматически открывать при нажатии на модуль Notes`.
- The checkbox preference is local and persistent. In packaged desktop builds it is stored under the install-local data root in `frontend-preferences.json`, not in old WebView `localStorage`. When enabled, entering the Notes module should automatically launch Obsidian through `obsidian://choose-vault`; when disabled, Notes waits for the manual button.
- Browser/Vite Notes is a preview-only gateway. It must not auto-launch Obsidian and must not generate fake Obsidian launch links for `browser://...` paths.
- Native embedding of the Obsidian desktop window inside LifeOS is not the current implementation path because it is unsupported and Windows-only fragile.
- A future LifeOS bridge plugin inside Obsidian may be considered later, but it is not part of the current MVP implementation.
- The previous internal Obsidian-parity workspace, including CodeMirror, file-tree actions, tabs, right metadata panes, and status strip, is no longer the primary Notes route. It may be reused later as a fallback or future LifeOS-native notes surface, but it must not appear instead of the gateway unless the owner changes direction again.
- Search, tags, backlinks, graph edges, and attachment references are rebuilt from Markdown files and are not separate canonical records.
- Wikilinks in Markdown are enough for MVP backlinks and graph generation. Obsidian properties/frontmatter are not editable structured data in the MVP.

## MVP Features

- app-owned local notes folder;
- Markdown `.md` files as the disk source of truth;
- centered `Открыть Obsidian` gateway button as the whole primary Notes module surface;
- persistent `Автоматически открывать при нажатии на модуль Notes` checkbox below the button;
- optional automatic packaged-desktop handoff to Obsidian vault manager when the user enters Notes and the checkbox is enabled;
- honest browser-preview state with disabled real Obsidian launch instead of fake `obsidian://` links for preview paths;
- rebuildable search/tags/backlinks/graph indexes from Markdown for export/search/data-safety surfaces;
- attachments/images preserved in `_attachments/` or imported folder paths and shown through the attachment index;
- Obsidian import for local Markdown vaults, folders, and attachments/images, launched from Settings > Data.
- Obsidian desktop app installed separately by the user; LifeOS does not bundle Obsidian.
- file-name safety: note titles and folder names are sanitized (illegal characters stripped, trailing dots/spaces removed) and Windows reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM0-9`, `LPT0-9`) are escaped with a `_` prefix, so a note titled `NUL` is stored as `_NUL.md` and cannot break note writes or pre-update backups on Windows.

## Stage 14 Export And Backup Behavior

- Readable export copies Notes Markdown files and note attachment files into `exports/lifeos-export-*/markdown/notes/`.
- Local backup copies the app-owned `notes/` folder into `backups/lifeos-backup-*/notes/`.
- Local backup also copies explicitly registered external Obsidian folders into `backups/lifeos-backup-*/obsidian-vaults/`. Google Drive backup sync then encrypts and uploads the complete backup artifact, so these folders are recoverable after reinstall without exposing readable Markdown directly to Drive.
- Settings also exposes `Резервная копия Obsidian` as a standalone local backup action. It creates `backups/obsidian-backup-*` with only the configured external Obsidian folders under `obsidian-vaults/`, without copying the LifeOS SQLite database.
- Restore/import restores synced external Obsidian folders under the app data root's `obsidian-vaults/` recovery area rather than writing back to old absolute paths. The user can open or move those recovered vault folders after reinstall.
- Automatic pre-update backup does not block startup on a full recursive Notes/Diary file copy for large vaults. It first creates a critical SQLite/frontend snapshot, then copies app-owned `notes/` and `diary/` folders through a manifest-based resumable background phase and only marks the pre-update artifact complete after the final snapshot is validated.
- Interrupted Notes/Diary pre-update copies remain `.in-progress` with non-complete manifest status and resume on a later startup. A partial pre-update artifact is not a valid recovery artifact.
- Notes search remains rebuildable from Markdown and is included in the Stage 14 app-wide search index.
- Export and backup do not change the canonical Notes source: the app-owned `notes/` folder remains authoritative.

## Not MVP

- note templates;
- vault switching;
- Obsidian plugin system.
- note-to-task/project/habit links.
- structured Obsidian properties/frontmatter editing.
- native embedding of the Obsidian desktop window inside LifeOS.
- LifeOS Obsidian bridge plugin.

## Open Questions

The Obsidian parity override is resolved as of 2026-05-14: LifeOS styling can be
violated inside Notes to reach Obsidian Companion Mode parity.

The Obsidian dependency direction is resolved as of 2026-05-14: use companion
integration through a shared Markdown vault and `obsidian://` actions. Vault
folder paths are not valid `open?path=` targets; use `choose-vault` for vault
setup and file paths for note handoff. Do not attempt native window embedding
unless it is explicitly promoted later.

Cross-module attachment/export questions remain in [../open-questions.md](../open-questions.md).

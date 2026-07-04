# Pre-Update Rollback Runbook

Status: owner-facing recovery procedure

Use this runbook only when a LifeOS version upgrade or downgrade broke startup,
migrations, or data after the new version had a chance to touch the runtime data
folder. For ordinary export/backup recovery, use Settings > Data restore/import
instead.

## What The Artifact Is

Packaged release startup creates a pre-update artifact before opening
SQLite/migrations when existing data belongs to a different LifeOS app version.
The artifact path is:

`<install directory>\data\backups\pre-update\lifeos-pre-update-v*`

A recovery-ready artifact must have:

- no `.in-progress` suffix;
- `manifest.json` with `status: "complete"`;
- `kind: "lifeos-v4-pre-update-backup"`;
- a valid manifest snapshot/checksum set.

Do not manually restore from a partial `.in-progress` artifact unless there is no
other recovery path and you accept that it may be missing user-file folders. The
app UI treats partial artifacts as status only, not as apply-ready backups.

## Preferred In-App Rollback

Use this when a later fixed LifeOS build can start successfully.

1. Open the fixed LifeOS build.
2. Go to Settings > Data.
3. Find the failed-upgrade or Pre-update rollback block.
4. Select the complete pre-update artifact. LifeOS fills the restore/import path.
5. Run dry-run first and read the report.
6. Apply only when dry-run is clean.
7. After apply, use the app version named in the dry-run warning: the artifact
   `source_app_version`, or a later fixed build that explicitly supports that
   source data version.

The apply flow creates `backups\backup-before-restore\lifeos-backup-before-restore-*`
before replacing current data, stages the restored state, validates integrity,
and rolls back if commit/post-apply validation fails.

## Manual Rollback

Use this if LifeOS cannot start far enough to open Settings.

1. Close LifeOS completely, including tray instances.
2. Find the runtime data root. For packaged Windows builds it is usually
   `<install directory>\data`.
3. Find the latest complete pre-update artifact under
   `data\backups\pre-update\lifeos-pre-update-v*`.
4. Open the artifact `manifest.json`.
5. Confirm `status` is `complete`.
6. Note `source_app_version` and `target_app_version`.
7. Rename the current data folder to a failure snapshot, for example
   `data.failed-upgrade-20260518-1530`.
8. Create a fresh `data` folder.
9. Copy the artifact contents into the fresh `data` folder:
   `lifeos.sqlite3`, SQLite sidecars such as `lifeos.sqlite3-wal` /
   `lifeos.sqlite3-shm` / `lifeos.sqlite3-journal` when present, `notes/`,
   `diary/`, `frontend-records.json`, and `frontend-preferences.json`.
10. Do not copy the pre-update artifact `manifest.json` into the runtime data
    root as an app data file; it is backup metadata.
11. Start the app version from `source_app_version`, or a later fixed build that
    explicitly supports data from that source version.

Do not relaunch the failed target version against the restored data unless that
target build has been fixed. Otherwise it may repeat the failed migration or
write a newer schema again.

## Startup Failure Evidence

When release startup fails while creating the backup, opening/migrating SQLite,
opening the Notes vault, or writing the runtime version marker, LifeOS writes:

`<install directory>\data\startup-failure.json`

That file records the failure stage, error message, pre-update backup path,
source app version, failed target app version, rollback app version, timestamp,
and short runbook steps. A later successful startup surfaces this notice in
Settings > Data.

## Safe App Version Rule

After rollback, safe means one of:

- the artifact `source_app_version`;
- a later build that explicitly says it supports data from that source version
  and fixes the failed upgrade path.

Unsafe means the failed `target_app_version` that already broke startup or data,
unless a fixed build with the same version/build identity has been produced and
verified.

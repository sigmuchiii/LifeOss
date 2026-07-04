//! Хранилище LifeOss: SQLite (WAL) + простая система миграций.

use rusqlite::Connection;
use std::path::Path;

pub struct Storage {
    conn: Connection,
}

/// Миграции применяются по порядку, каждая ровно один раз.
const MIGRATIONS: &[(&str, &str)] = &[(
    "0001_init",
    "CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );",
)];

impl Storage {
    pub fn open(path: &Path) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "foreign_keys", "ON")?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS schema_migrations (
                id TEXT PRIMARY KEY,
                applied_at TEXT NOT NULL DEFAULT (datetime('now'))
            );",
        )?;
        let storage = Self { conn };
        storage.migrate()?;
        Ok(storage)
    }

    fn migrate(&self) -> Result<(), rusqlite::Error> {
        for (id, sql) in MIGRATIONS {
            let done: bool = self.conn.query_row(
                "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE id = ?1)",
                [id],
                |r| r.get(0),
            )?;
            if !done {
                self.conn.execute_batch(sql)?;
                self.conn
                    .execute("INSERT INTO schema_migrations (id) VALUES (?1)", [id])?;
            }
        }
        Ok(())
    }

    pub fn schema_version(&self) -> Result<i64, rusqlite::Error> {
        self.conn
            .query_row("SELECT COUNT(1) FROM schema_migrations", [], |r| r.get(0))
    }
}

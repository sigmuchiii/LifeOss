//! Хранилище LifeOss: SQLite (WAL) + простая система миграций.

use rusqlite::Connection;
use std::path::Path;

pub struct Storage {
    conn: Connection,
}

/// Миграции применяются по порядку, каждая ровно один раз.
const MIGRATIONS: &[(&str, &str)] = &[
    (
        "0001_init",
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );",
    ),
    (
        "0002_tasks",
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            notes TEXT NOT NULL DEFAULT '',
            done INTEGER NOT NULL DEFAULT 0,
            priority INTEGER NOT NULL DEFAULT 0,
            due_date TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            completed_at TEXT
        );",
    ),
];

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: i64,
    pub title: String,
    pub notes: String,
    pub done: bool,
    pub priority: i64,
    pub due_date: Option<String>,
    pub created_at: String,
    pub completed_at: Option<String>,
}

const TASK_COLS: &str = "id, title, notes, done, priority, due_date, created_at, completed_at";

fn row_to_task(r: &rusqlite::Row) -> Result<Task, rusqlite::Error> {
    Ok(Task {
        id: r.get(0)?,
        title: r.get(1)?,
        notes: r.get(2)?,
        done: r.get::<_, i64>(3)? != 0,
        priority: r.get(4)?,
        due_date: r.get(5)?,
        created_at: r.get(6)?,
        completed_at: r.get(7)?,
    })
}

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

    // ---- Tasks ----

    pub fn tasks_list(&self) -> Result<Vec<Task>, rusqlite::Error> {
        let sql = format!(
            "SELECT {TASK_COLS} FROM tasks
             ORDER BY done ASC, priority DESC, created_at DESC"
        );
        let mut stmt = self.conn.prepare(&sql)?;
        let rows = stmt.query_map([], |r| row_to_task(r))?;
        rows.collect()
    }

    pub fn tasks_add(&self, title: &str, priority: i64) -> Result<Task, rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO tasks (title, priority) VALUES (?1, ?2)",
            rusqlite::params![title, priority],
        )?;
        let id = self.conn.last_insert_rowid();
        let sql = format!("SELECT {TASK_COLS} FROM tasks WHERE id = ?1");
        self.conn.query_row(&sql, [id], |r| row_to_task(r))
    }

    pub fn tasks_toggle(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE tasks SET
                done = 1 - done,
                completed_at = CASE WHEN done = 0 THEN datetime('now') ELSE NULL END
             WHERE id = ?1",
            [id],
        )?;
        Ok(())
    }

    pub fn tasks_update(
        &self,
        id: i64,
        title: &str,
        notes: &str,
        priority: i64,
        due_date: Option<&str>,
    ) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE tasks SET title = ?2, notes = ?3, priority = ?4, due_date = ?5 WHERE id = ?1",
            rusqlite::params![id, title, notes, priority, due_date],
        )?;
        Ok(())
    }

    pub fn tasks_delete(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn.execute("DELETE FROM tasks WHERE id = ?1", [id])?;
        Ok(())
    }
}

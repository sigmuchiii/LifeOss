//! Хранилище LifeOss: SQLite (WAL) + простая система миграций.

use rusqlite::{Connection, OptionalExtension};
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
    (
        "0003_tasks_full",
        "CREATE TABLE IF NOT EXISTS task_lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS subtasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            done INTEGER NOT NULL DEFAULT 0,
            position INTEGER NOT NULL DEFAULT 0
        );
        ALTER TABLE tasks ADD COLUMN due_time TEXT;
        ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'not_started';
        ALTER TABLE tasks ADD COLUMN waiting_for TEXT;
        ALTER TABLE tasks ADD COLUMN list_id INTEGER;
        ALTER TABLE tasks ADD COLUMN deleted_at TEXT;",
    ),
    (
        "0004_habits_notes_focus",
        "CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            days TEXT NOT NULL DEFAULT '1111111',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            archived_at TEXT
        );
        CREATE TABLE IF NOT EXISTS habit_marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            UNIQUE(habit_id, date)
        );
        CREATE TABLE IF NOT EXISTS quick_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            pinned INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS focus_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            minutes INTEGER NOT NULL,
            label TEXT,
            ended_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );",
    ),
];

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Subtask {
    pub id: i64,
    pub task_id: i64,
    pub title: String,
    pub done: bool,
    pub position: i64,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskList {
    pub id: i64,
    pub name: String,
    pub position: i64,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: i64,
    pub title: String,
    pub notes: String,
    pub done: bool,
    pub priority: i64,
    pub due_date: Option<String>,
    pub due_time: Option<String>,
    pub status: String,
    pub waiting_for: Option<String>,
    pub list_id: Option<i64>,
    pub created_at: String,
    pub completed_at: Option<String>,
    pub deleted_at: Option<String>,
    pub subtasks: Vec<Subtask>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    pub tasks: Vec<Task>,
    pub lists: Vec<TaskList>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Habit {
    pub id: i64,
    pub title: String,
    pub days: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HabitMark {
    pub habit_id: i64,
    pub date: String,
    pub status: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuickNote {
    pub id: i64,
    pub content: String,
    pub pinned: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FocusSession {
    pub id: i64,
    pub minutes: i64,
    pub label: Option<String>,
    pub ended_at: String,
}

const TASK_COLS: &str =
    "id, title, notes, done, priority, due_date, due_time, status, waiting_for, list_id, created_at, completed_at, deleted_at";

fn row_to_task(r: &rusqlite::Row) -> Result<Task, rusqlite::Error> {
    Ok(Task {
        id: r.get(0)?,
        title: r.get(1)?,
        notes: r.get(2)?,
        done: r.get::<_, i64>(3)? != 0,
        priority: r.get(4)?,
        due_date: r.get(5)?,
        due_time: r.get(6)?,
        status: r.get(7)?,
        waiting_for: r.get(8)?,
        list_id: r.get(9)?,
        created_at: r.get(10)?,
        completed_at: r.get(11)?,
        deleted_at: r.get(12)?,
        subtasks: Vec::new(),
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

    // ---- Настройки ----

    pub fn setting_get(&self, key: &str) -> Result<Option<String>, rusqlite::Error> {
        self.conn
            .query_row("SELECT value FROM settings WHERE key = ?1", [key], |r| {
                r.get(0)
            })
            .optional()
    }

    pub fn setting_set(&self, key: &str, value: &str) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [key, value],
        )?;
        Ok(())
    }

    // ---- Снимок задач ----

    pub fn tasks_snapshot(&self) -> Result<Snapshot, rusqlite::Error> {
        let sql = format!("SELECT {TASK_COLS} FROM tasks");
        let mut stmt = self.conn.prepare(&sql)?;
        let mut tasks: Vec<Task> = stmt
            .query_map([], |r| row_to_task(r))?
            .collect::<Result<_, _>>()?;

        let mut stmt = self.conn.prepare(
            "SELECT id, task_id, title, done, position FROM subtasks ORDER BY position, id",
        )?;
        let subs: Vec<Subtask> = stmt
            .query_map([], |r| {
                Ok(Subtask {
                    id: r.get(0)?,
                    task_id: r.get(1)?,
                    title: r.get(2)?,
                    done: r.get::<_, i64>(3)? != 0,
                    position: r.get(4)?,
                })
            })?
            .collect::<Result<_, _>>()?;
        for s in subs {
            if let Some(t) = tasks.iter_mut().find(|t| t.id == s.task_id) {
                t.subtasks.push(s);
            }
        }

        let mut stmt = self
            .conn
            .prepare("SELECT id, name, position FROM task_lists ORDER BY position, id")?;
        let lists: Vec<TaskList> = stmt
            .query_map([], |r| {
                Ok(TaskList {
                    id: r.get(0)?,
                    name: r.get(1)?,
                    position: r.get(2)?,
                })
            })?
            .collect::<Result<_, _>>()?;

        Ok(Snapshot { tasks, lists })
    }

    // ---- Задачи ----

    pub fn tasks_add(
        &self,
        title: &str,
        priority: i64,
        due_date: Option<&str>,
        list_id: Option<i64>,
    ) -> Result<i64, rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO tasks (title, priority, due_date, list_id) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![title, priority, due_date, list_id],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn tasks_toggle(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE tasks SET
                done = 1 - done,
                completed_at = CASE WHEN done = 0 THEN datetime('now', 'localtime') ELSE NULL END
             WHERE id = ?1",
            [id],
        )?;
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    pub fn tasks_update(
        &self,
        id: i64,
        title: &str,
        notes: &str,
        priority: i64,
        due_date: Option<&str>,
        due_time: Option<&str>,
        status: &str,
        waiting_for: Option<&str>,
        list_id: Option<i64>,
    ) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE tasks SET title = ?2, notes = ?3, priority = ?4, due_date = ?5,
                due_time = ?6, status = ?7, waiting_for = ?8, list_id = ?9
             WHERE id = ?1",
            rusqlite::params![id, title, notes, priority, due_date, due_time, status, waiting_for, list_id],
        )?;
        Ok(())
    }

    pub fn tasks_delete(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE tasks SET deleted_at = datetime('now') WHERE id = ?1",
            [id],
        )?;
        Ok(())
    }

    pub fn tasks_restore(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn
            .execute("UPDATE tasks SET deleted_at = NULL WHERE id = ?1", [id])?;
        Ok(())
    }

    pub fn trash_clear(&self) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "DELETE FROM subtasks WHERE task_id IN (SELECT id FROM tasks WHERE deleted_at IS NOT NULL)",
            [],
        )?;
        self.conn
            .execute("DELETE FROM tasks WHERE deleted_at IS NOT NULL", [])?;
        Ok(())
    }

    // ---- Списки ----

    pub fn lists_add(&self, name: &str) -> Result<i64, rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO task_lists (name, position)
             VALUES (?1, COALESCE((SELECT MAX(position) + 1 FROM task_lists), 0))",
            [name],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn lists_delete(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn
            .execute("UPDATE tasks SET list_id = NULL WHERE list_id = ?1", [id])?;
        self.conn
            .execute("DELETE FROM task_lists WHERE id = ?1", [id])?;
        Ok(())
    }

    // ---- Подзадачи ----

    pub fn subtasks_add(&self, task_id: i64, title: &str) -> Result<i64, rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO subtasks (task_id, title, position)
             VALUES (?1, ?2, COALESCE((SELECT MAX(position) + 1 FROM subtasks WHERE task_id = ?1), 0))",
            rusqlite::params![task_id, title],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn subtasks_toggle(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn
            .execute("UPDATE subtasks SET done = 1 - done WHERE id = ?1", [id])?;
        Ok(())
    }

    pub fn subtasks_delete(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn.execute("DELETE FROM subtasks WHERE id = ?1", [id])?;
        Ok(())
    }

    // ---- Привычки ----

    pub fn habits_list(&self) -> Result<Vec<Habit>, rusqlite::Error> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, days FROM habits WHERE archived_at IS NULL ORDER BY id",
        )?;
        stmt.query_map([], |r| {
            Ok(Habit {
                id: r.get(0)?,
                title: r.get(1)?,
                days: r.get(2)?,
            })
        })?
        .collect()
    }

    pub fn habits_add(&self, title: &str, days: &str) -> Result<i64, rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO habits (title, days) VALUES (?1, ?2)",
            [title, days],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn habits_delete(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn
            .execute("DELETE FROM habit_marks WHERE habit_id = ?1", [id])?;
        self.conn.execute("DELETE FROM habits WHERE id = ?1", [id])?;
        Ok(())
    }

    pub fn habit_marks_range(
        &self,
        from: &str,
        to: &str,
    ) -> Result<Vec<HabitMark>, rusqlite::Error> {
        let mut stmt = self.conn.prepare(
            "SELECT habit_id, date, status FROM habit_marks WHERE date >= ?1 AND date <= ?2",
        )?;
        stmt.query_map([from, to], |r| {
            Ok(HabitMark {
                habit_id: r.get(0)?,
                date: r.get(1)?,
                status: r.get(2)?,
            })
        })?
        .collect()
    }

    pub fn habit_mark_set(
        &self,
        habit_id: i64,
        date: &str,
        status: &str,
    ) -> Result<(), rusqlite::Error> {
        if status.is_empty() {
            self.conn.execute(
                "DELETE FROM habit_marks WHERE habit_id = ?1 AND date = ?2",
                rusqlite::params![habit_id, date],
            )?;
        } else {
            self.conn.execute(
                "INSERT INTO habit_marks (habit_id, date, status) VALUES (?1, ?2, ?3)
                 ON CONFLICT(habit_id, date) DO UPDATE SET status = excluded.status",
                rusqlite::params![habit_id, date, status],
            )?;
        }
        Ok(())
    }

    // ---- Быстрые заметки ----

    pub fn qnotes_list(&self) -> Result<Vec<QuickNote>, rusqlite::Error> {
        let mut stmt = self.conn.prepare(
            "SELECT id, content, pinned, created_at, updated_at FROM quick_notes
             ORDER BY pinned DESC, id DESC",
        )?;
        stmt.query_map([], |r| {
            Ok(QuickNote {
                id: r.get(0)?,
                content: r.get(1)?,
                pinned: r.get::<_, i64>(2)? != 0,
                created_at: r.get(3)?,
                updated_at: r.get(4)?,
            })
        })?
        .collect()
    }

    pub fn qnotes_add(&self, content: &str) -> Result<i64, rusqlite::Error> {
        self.conn
            .execute("INSERT INTO quick_notes (content) VALUES (?1)", [content])?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn qnotes_update(
        &self,
        id: i64,
        content: &str,
        pinned: bool,
    ) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE quick_notes SET content = ?2, pinned = ?3, updated_at = datetime('now')
             WHERE id = ?1",
            rusqlite::params![id, content, pinned as i64],
        )?;
        Ok(())
    }

    pub fn qnotes_delete(&self, id: i64) -> Result<(), rusqlite::Error> {
        self.conn
            .execute("DELETE FROM quick_notes WHERE id = ?1", [id])?;
        Ok(())
    }

    // ---- Фокус ----

    pub fn focus_add(&self, minutes: i64, label: Option<&str>) -> Result<i64, rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO focus_sessions (minutes, label) VALUES (?1, ?2)",
            rusqlite::params![minutes, label],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn focus_today(&self) -> Result<Vec<FocusSession>, rusqlite::Error> {
        let mut stmt = self.conn.prepare(
            "SELECT id, minutes, label, ended_at FROM focus_sessions
             WHERE date(ended_at) = date('now', 'localtime') ORDER BY id DESC",
        )?;
        stmt.query_map([], |r| {
            Ok(FocusSession {
                id: r.get(0)?,
                minutes: r.get(1)?,
                label: r.get(2)?,
                ended_at: r.get(3)?,
            })
        })?
        .collect()
    }
}

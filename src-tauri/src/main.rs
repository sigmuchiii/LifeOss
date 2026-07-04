#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Mutex, MutexGuard};
use tauri::Manager;

struct AppState {
    storage: Mutex<lifeos_storage::Storage>,
}

fn lock<'a>(
    state: &'a tauri::State<AppState>,
) -> Result<MutexGuard<'a, lifeos_storage::Storage>, String> {
    state.storage.lock().map_err(|e| e.to_string())
}

#[tauri::command]
fn app_status(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
    let storage = lock(&state)?;
    Ok(serde_json::json!({
        "app": "LifeOss",
        "schemaVersion": storage.schema_version().map_err(|e| e.to_string())?,
        "modules": lifeos_core::registry::MODULE_IDS,
    }))
}

// ---- Настройки ----

#[tauri::command]
fn settings_get(state: tauri::State<AppState>, key: String) -> Result<Option<String>, String> {
    lock(&state)?.setting_get(&key).map_err(|e| e.to_string())
}

#[tauri::command]
fn settings_set(state: tauri::State<AppState>, key: String, value: String) -> Result<(), String> {
    lock(&state)?
        .setting_set(&key, &value)
        .map_err(|e| e.to_string())
}

// ---- Задачи ----

#[tauri::command]
fn tasks_snapshot(state: tauri::State<AppState>) -> Result<lifeos_storage::Snapshot, String> {
    lock(&state)?.tasks_snapshot().map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_add(
    state: tauri::State<AppState>,
    title: String,
    priority: i64,
    due_date: Option<String>,
    list_id: Option<i64>,
) -> Result<i64, String> {
    lock(&state)?
        .tasks_add(&title, priority, due_date.as_deref(), list_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_toggle(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.tasks_toggle(id).map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
fn tasks_update(
    state: tauri::State<AppState>,
    id: i64,
    title: String,
    notes: String,
    priority: i64,
    due_date: Option<String>,
    due_time: Option<String>,
    status: String,
    waiting_for: Option<String>,
    list_id: Option<i64>,
) -> Result<(), String> {
    lock(&state)?
        .tasks_update(
            id,
            &title,
            &notes,
            priority,
            due_date.as_deref(),
            due_time.as_deref(),
            &status,
            waiting_for.as_deref(),
            list_id,
        )
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_delete(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.tasks_delete(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_restore(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.tasks_restore(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn trash_clear(state: tauri::State<AppState>) -> Result<(), String> {
    lock(&state)?.trash_clear().map_err(|e| e.to_string())
}

#[tauri::command]
fn lists_add(state: tauri::State<AppState>, name: String) -> Result<i64, String> {
    lock(&state)?.lists_add(&name).map_err(|e| e.to_string())
}

#[tauri::command]
fn lists_delete(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.lists_delete(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn subtasks_add(state: tauri::State<AppState>, task_id: i64, title: String) -> Result<i64, String> {
    lock(&state)?
        .subtasks_add(task_id, &title)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn subtasks_toggle(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.subtasks_toggle(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn subtasks_delete(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.subtasks_delete(id).map_err(|e| e.to_string())
}

// ---- Привычки ----

#[tauri::command]
fn habits_list(state: tauri::State<AppState>) -> Result<Vec<lifeos_storage::Habit>, String> {
    lock(&state)?.habits_list().map_err(|e| e.to_string())
}

#[tauri::command]
fn habits_add(
    state: tauri::State<AppState>,
    title: String,
    days: String,
    time_of_day: Option<String>,
) -> Result<i64, String> {
    lock(&state)?
        .habits_add(&title, &days, time_of_day.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn habits_delete(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.habits_delete(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn habit_marks_range(
    state: tauri::State<AppState>,
    from: String,
    to: String,
) -> Result<Vec<lifeos_storage::HabitMark>, String> {
    lock(&state)?
        .habit_marks_range(&from, &to)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn habit_mark_set(
    state: tauri::State<AppState>,
    habit_id: i64,
    date: String,
    status: String,
) -> Result<(), String> {
    lock(&state)?
        .habit_mark_set(habit_id, &date, &status)
        .map_err(|e| e.to_string())
}

// ---- Быстрые заметки ----

#[tauri::command]
fn qnotes_list(state: tauri::State<AppState>) -> Result<Vec<lifeos_storage::QuickNote>, String> {
    lock(&state)?.qnotes_list().map_err(|e| e.to_string())
}

#[tauri::command]
fn qnotes_add(state: tauri::State<AppState>, content: String) -> Result<i64, String> {
    lock(&state)?.qnotes_add(&content).map_err(|e| e.to_string())
}

#[tauri::command]
fn qnotes_update(
    state: tauri::State<AppState>,
    id: i64,
    content: String,
    pinned: bool,
) -> Result<(), String> {
    lock(&state)?
        .qnotes_update(id, &content, pinned)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn qnotes_delete(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.qnotes_delete(id).map_err(|e| e.to_string())
}

// ---- Фокус ----

#[tauri::command]
fn focus_add(
    state: tauri::State<AppState>,
    minutes: i64,
    label: Option<String>,
) -> Result<i64, String> {
    lock(&state)?
        .focus_add(minutes, label.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn focus_today(state: tauri::State<AppState>) -> Result<Vec<lifeos_storage::FocusSession>, String> {
    lock(&state)?.focus_today().map_err(|e| e.to_string())
}

// ---- Проекты ----

#[tauri::command]
fn projects_list(state: tauri::State<AppState>) -> Result<Vec<lifeos_storage::Project>, String> {
    lock(&state)?.projects_list().map_err(|e| e.to_string())
}

#[tauri::command]
fn projects_add(state: tauri::State<AppState>, title: String) -> Result<i64, String> {
    lock(&state)?.projects_add(&title).map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
fn projects_update(
    state: tauri::State<AppState>,
    id: i64,
    title: String,
    description: String,
    stage: String,
    blockers: String,
    next_actions: String,
    notes: String,
) -> Result<(), String> {
    lock(&state)?
        .projects_update(
            id,
            &title,
            &description,
            &stage,
            &blockers,
            &next_actions,
            &notes,
        )
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn projects_archive(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.projects_archive(id).map_err(|e| e.to_string())
}

// ---- Дневник ----

#[tauri::command]
fn diary_month(
    state: tauri::State<AppState>,
    month: String,
) -> Result<Vec<lifeos_storage::DiaryEntry>, String> {
    lock(&state)?.diary_month(&month).map_err(|e| e.to_string())
}

#[tauri::command]
fn diary_set(
    state: tauri::State<AppState>,
    date: String,
    rating: Option<i64>,
    mood: String,
    energy: String,
    entry: String,
    done_items: String,
) -> Result<(), String> {
    lock(&state)?
        .diary_set(&date, rating, &mood, &energy, &entry, &done_items)
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            let storage = lifeos_storage::Storage::open(&dir.join("lifeoss.db"))?;
            app.manage(AppState {
                storage: Mutex::new(storage),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_status,
            settings_get,
            settings_set,
            tasks_snapshot,
            tasks_add,
            tasks_toggle,
            tasks_update,
            tasks_delete,
            tasks_restore,
            trash_clear,
            lists_add,
            lists_delete,
            subtasks_add,
            subtasks_toggle,
            subtasks_delete,
            habits_list,
            habits_add,
            habits_delete,
            habit_marks_range,
            habit_mark_set,
            qnotes_list,
            qnotes_add,
            qnotes_update,
            qnotes_delete,
            focus_add,
            focus_today,
            projects_list,
            projects_add,
            projects_update,
            projects_archive,
            diary_month,
            diary_set
        ])
        .run(tauri::generate_context!())
        .expect("error while running LifeOss");
}

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
            subtasks_delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running LifeOss");
}

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Mutex, MutexGuard};
use tauri::Manager;

struct AppState {
    storage: Mutex<lifeos_storage::Storage>,
}

fn lock<'a>(state: &'a tauri::State<AppState>) -> Result<MutexGuard<'a, lifeos_storage::Storage>, String> {
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
fn tasks_list(state: tauri::State<AppState>) -> Result<Vec<lifeos_storage::Task>, String> {
    lock(&state)?.tasks_list().map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_add(state: tauri::State<AppState>, title: String, priority: i64) -> Result<lifeos_storage::Task, String> {
    lock(&state)?.tasks_add(&title, priority).map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_toggle(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.tasks_toggle(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_update(
    state: tauri::State<AppState>,
    id: i64,
    title: String,
    notes: String,
    priority: i64,
    due_date: Option<String>,
) -> Result<(), String> {
    lock(&state)?
        .tasks_update(id, &title, &notes, priority, due_date.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn tasks_delete(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    lock(&state)?.tasks_delete(id).map_err(|e| e.to_string())
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
            tasks_list,
            tasks_add,
            tasks_toggle,
            tasks_update,
            tasks_delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running LifeOss");
}

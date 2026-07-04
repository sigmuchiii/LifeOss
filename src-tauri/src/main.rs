#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::Manager;

struct AppState {
    storage: Mutex<lifeos_storage::Storage>,
}

#[tauri::command]
fn app_status(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
    let storage = state.storage.lock().map_err(|e| e.to_string())?;
    Ok(serde_json::json!({
        "app": "LifeOss",
        "schemaVersion": storage.schema_version().map_err(|e| e.to_string())?,
        "modules": lifeos_core::registry::MODULE_IDS,
    }))
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
        .invoke_handler(tauri::generate_handler![app_status])
        .run(tauri::generate_context!())
        .expect("error while running LifeOss");
}

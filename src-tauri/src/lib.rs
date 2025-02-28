use serde::{Deserialize, Serialize};
use std::fs;
use tauri::State;
// src-tauri/src/main.rs
use tauri::Manager;

#[derive(Serialize, Deserialize)]
struct AppData {
    goals: Vec<Goal>,
    reviews: Vec<WeeklyReview>,
}

#[derive(Serialize, Deserialize)]
struct Goal {
    id: String,
    title: String,
    description: Option<String>,
    start_date: String,
    end_date: String,
    tasks: Vec<Task>,
}

#[derive(Serialize, Deserialize)]
struct Task {
    id: String,
    title: String,
    week: u32,
    completed: bool,
}

#[derive(Serialize, Deserialize)]
struct WeeklyReview {
    week: u32,
    goals_completed: u32,
    tasks_completed: u32,
    notes: String,
}

#[tauri::command]
fn save_data(data: AppData) -> Result<(), String> {
    let json = serde_json::to_string(&data).map_err(|e| e.to_string())?;
    fs::write("app_data.json", json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_data() -> Result<AppData, String> {
    let json = fs::read_to_string("app_data.json")
        .unwrap_or_else(|_| String::from("{\"goals\":[],\"reviews\":[]}"));
    let data: AppData = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![save_data, load_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

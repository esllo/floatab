#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

#[tauri::command]
fn insert_script(
    app_handle: tauri::AppHandle,
    label: String,
    script: String,
) -> Result<bool, bool> {
    let window = app_handle.get_window(&label);

    match window {
        Some(_) => match window.unwrap().eval(&script) {
            Ok(_) => Ok(true),
            Err(_) => Err(false),
        },
        None => Err(false),
    }
}

#[tauri::command]
fn cleanup_windows(app_handle: tauri::AppHandle, labels: Vec<String>) {
    let windows = app_handle.windows();

    for (_, window) in &windows {
        let label = window.label();
        if label == "main" {
            continue;
        }
        if !labels.contains(&label.to_string()) {
            match window.close() {
                _ => (),
            }
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cleanup_windows, insert_script])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

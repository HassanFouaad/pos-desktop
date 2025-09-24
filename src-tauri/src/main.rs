// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db_migration;

#[tauri::command]
async fn migrate_database() -> Result<(), String> {
    db_migration::run_migrations()
        .await
        .map_err(|e| e.to_string())
}

#[tokio::main]
async fn main() {
    // Run migrations first before launching the app
    match db_migration::run_migrations().await {
        Ok(_) => println!("Database migrations completed successfully"),
        Err(e) => eprintln!("Failed to run database migrations: {}", e),
    };

    // Then start the Tauri app
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![migrate_database])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

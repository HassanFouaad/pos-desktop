// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use argon2::{hash_raw, Config, Variant, Version};

#[tokio::main]
async fn main() {
    // Then start the Tauri app
    tauri::Builder::default()
        .plugin(tauri_plugin_stronghold::Builder::new(|password| {
            // Hash the password using argon2 for secure storage
            let config = Config {
                lanes: 4,
                mem_cost: 10_000,
                time_cost: 10,
                variant: Variant::Argon2id,
                version: Version::Version13,
                ..Default::default()
            };

            // Use a fixed salt for device-specific encryption
            // In production, this should be unique per device
            let salt = b"desktop-pos-stronghold-salt-v1";

            let key = hash_raw(password.as_ref(), salt, &config)
                .expect("failed to hash password");

            key.to_vec()
        })
        .build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

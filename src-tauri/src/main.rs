// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


#[tokio::main]
async fn main() {
    // Then start the Tauri app
        tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_stronghold::Builder::new(|password| {
            use argon2::{hash_raw, Config, Variant, Version};
    
            // Hash the password using argon2 for secure storage
            // Optimized for desktop POS: balanced security with fast initialization
            let config = Config {
                lanes: 2,              // Reduced from 4 for faster hashing
                mem_cost: 4096,        // Reduced from 10_000 (4MB is balanced for desktop)
                time_cost: 2,          // Reduced from 10 (2 iterations for responsiveness)
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
        }).build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use argon2::{Argon2, Algorithm, ParamsBuilder, Version};

#[tokio::main]
async fn main() {
    // Then start the Tauri app
        tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_stronghold::Builder::new(|password| {
    
            // Hash the password using argon2 for secure storage
            // Optimized for desktop POS: balanced security with fast initialization
            let params = ParamsBuilder::new()
                .m_cost(50_000)      // Memory cost: 50MB (balanced for desktop)
                .t_cost(2)           // Time cost: 2 iterations for responsiveness
                .p_cost(2)           // Parallelism: 2 lanes
                .output_len(32)      // Output length: 32 bytes
                .build()
                .expect("failed to build argon2 params");
    
            // Create Argon2 instance with Argon2id algorithm
            let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    
            // Use a fixed salt for device-specific encryption
            // In production, this should be unique per device
            let salt = b"hash-salt-v1-pos-desktop";
    
            // Hash the password into a 32-byte output
            let mut output = vec![0u8; 32];
            argon2
                .hash_password_into(password.as_ref(), salt, &mut output)
                .expect("failed to hash password");
    
            output
        }).build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use anyhow::Result;
use std::env;
use std::path::Path;
use std::process::Command;

pub async fn run_migrations() -> Result<()> {
    println!("Running database migrations with yarn db:migrate...");

    // Get the project root directory (parent of src-tauri)
    let current_dir = std::env::current_dir()?;
    let project_root = current_dir
        .parent()
        .ok_or_else(|| anyhow::anyhow!("Failed to find project root directory"))?;

    // Check if DATABASE_URL is set in the environment
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://user:password@localhost:5432/db".to_string());

    // Run yarn db:migrate
    let mut command = if cfg!(target_os = "windows") {
        let mut cmd = Command::new("cmd");
        cmd.args(["/C", "yarn db:migrate"]);
        cmd
    } else {
        let mut cmd = Command::new("sh");
        cmd.args(["-c", "yarn db:migrate"]);
        cmd
    };

    // Set the environment variable and directory
    let status = command
        .env("DATABASE_URL", database_url)
        .current_dir(project_root)
        .status()?;

    if status.success() {
        println!("Database migrations completed successfully!");
        Ok(())
    } else {
        Err(anyhow::anyhow!(
            "Migration command failed with exit code: {:?}",
            status.code()
        ))
    }
}

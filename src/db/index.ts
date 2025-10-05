import BackendConnector from "../features/sync/services/connector";
import { drizzleDb, powerSyncDb } from "./database";

const setupPowerSync = async () => {
  try {
    console.log("Setting up PowerSync");
    powerSyncDb.init();
    const connector = new BackendConnector();
    await powerSyncDb.connect(connector);
    console.log("PowerSync setup successfully");
  } catch (error) {
    console.error("Failed to setup PowerSync", error);
    throw error;
  }
};

await setupPowerSync();
export { drizzleDb };

import { container, inject, singleton } from "tsyringe";
import { powerSyncDb } from "../../../db";
import BackendConnector from "./connector";

@singleton()
class SyncService {
  constructor(
    @inject(BackendConnector) private readonly connector: BackendConnector
  ) {}

  async init() {
    try {
      console.log("Setting up PowerSync");
      powerSyncDb.init();

      console.log("PowerSync initialized");

      await powerSyncDb.connect(this.connector);

      console.log("PowerSync setup successfully");
    } catch (error) {
      console.error("Failed to setup PowerSync", error);
      throw error;
    }
  }
}

container.registerSingleton(SyncService);

export default SyncService;

import { container, singleton } from "tsyringe";
import { powerSyncDb } from "../../../db";
import { PosDeviceRepository } from "../../auth/repositories/pos-device.repository";
import { BackendConnector } from "./connector";

const posDeviceRepository = container.resolve(PosDeviceRepository);
@singleton()
class SyncService {
  constructor() {}

  async init() {
    try {
      console.log("Setting up PowerSync");
      powerSyncDb.init();

      console.log("PowerSync initialized");

      const connector = new BackendConnector(posDeviceRepository);
      await powerSyncDb.connect(connector);

      console.log("PowerSync setup successfully");
    } catch (error) {
      console.error("Failed to setup PowerSync", error);
      throw error;
    }
  }
}

container.registerSingleton(SyncService);

export default SyncService;

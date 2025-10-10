import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
} from "@powersync/web";

import { store } from "../../../store";
import { setConnectionStatus } from "../../../store/globalSlice";
import { PosDeviceRepository } from "../../auth/repositories/pos-device.repository";
import { getSyncData, uploadSyncData } from "../api";

export class BackendConnector implements PowerSyncBackendConnector {
  constructor(private readonly posDeviceRepository: PosDeviceRepository) {}

  async fetchCredentials() {
    const posToken = await this.posDeviceRepository.getPosDevice();

    if (!posToken) {
      throw new Error("No POS token found");
    }

    try {
      // Set status to syncing
      await this.posDeviceRepository.updateConnectionStatus("syncing");
      store.dispatch(setConnectionStatus("syncing"));

      const syncToken = await getSyncData();

      if (!syncToken.data?.token || !syncToken.data?.endpoint) {
        if (syncToken.error?.isNetworkError) {
          // Network error - set offline status
          await this.posDeviceRepository.updateConnectionStatus("offline");
          store.dispatch(setConnectionStatus("offline"));
          throw syncToken.error;
        }

        // Other error - set offline
        await this.posDeviceRepository.updateConnectionStatus("offline");
        store.dispatch(setConnectionStatus("offline"));
        return null;
      }

      // Success - set online status
      await this.posDeviceRepository.updateConnectionStatus("online");
      store.dispatch(setConnectionStatus("online"));

      return {
        endpoint: syncToken.data?.endpoint,
        token: syncToken.data?.token,
        expiresAt: syncToken.data?.expiresAt,
      };
    } catch (error: any) {
      // Any error - set offline status
      await this.posDeviceRepository.updateConnectionStatus("offline");
      store.dispatch(setConnectionStatus("offline"));
      throw error;
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    try {
      // Set status to syncing
      await this.posDeviceRepository.updateConnectionStatus("syncing");
      store.dispatch(setConnectionStatus("syncing"));

      const res = await uploadSyncData(transaction);
      console.log("res", {
        res,
        transaction: transaction,
      });

      if (!res.success) {
        if (res.error?.isNetworkError) {
          // Network error - set offline
          await this.posDeviceRepository.updateConnectionStatus("offline");
          store.dispatch(setConnectionStatus("offline"));
        }
        throw res.error;
      }

      // Success - set online
      await this.posDeviceRepository.updateConnectionStatus("online");
      store.dispatch(setConnectionStatus("online"));

      await transaction.complete();
    } catch (error: any) {
      // Error during upload - set offline
      await this.posDeviceRepository.updateConnectionStatus("offline");
      store.dispatch(setConnectionStatus("offline"));
      throw error;
    }
  }
}

import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
} from "@powersync/web";

import { PosDeviceRepository } from "../../auth/repositories/pos-device.repository";
import { getSyncData, uploadSyncData } from "../api";

export class BackendConnector implements PowerSyncBackendConnector {
  constructor(private readonly posDeviceRepository: PosDeviceRepository) {}

  async fetchCredentials() {
    const posToken = await this.posDeviceRepository.getPosDevice();

    if (!posToken) {
      throw new Error("No POS token found");
    }

    const syncToken = await getSyncData();
    console.log("syncToken", syncToken.data);

    if (!syncToken.data?.token || !syncToken.data?.endpoint) {
      if (syncToken.error?.isNetworkError) {
        throw syncToken.error;
      }

      return null;
    }

    return {
      endpoint: syncToken.data?.endpoint,
      token: syncToken.data?.token,
      expiresAt: syncToken.data?.expiresAt,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    try {
      const res = await uploadSyncData(transaction);
      console.log("res", {
        res,
        transaction: transaction,
      });
      if (!res.success) {
        throw res.error;
      }
      await transaction.complete();
    } catch (error: any) {
      throw error;
    }
  }
}

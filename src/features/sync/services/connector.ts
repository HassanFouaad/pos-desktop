import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
} from "@powersync/core";
import { container, injectable } from "tsyringe";
import { getSyncData, uploadSyncData } from "../api";

@injectable()
export default class BackendConnector implements PowerSyncBackendConnector {
  constructor() {}

  async fetchCredentials() {
    const posToken = await getPosAccessToken();

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

container.registerSingleton(BackendConnector);

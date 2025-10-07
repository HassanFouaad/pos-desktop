import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
} from "@powersync/web";
import { getPosAccessToken } from "../../auth/api/pos-auth";
import { getSyncData, uploadSyncData } from "../api";

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
      if (shouldDiscardDataOnError(error)) {
        // Instead of blocking the queue with these errors, discard the (rest of the) transaction.
        //
        // Note that these errors typically indicate a bug in the application.
        // If protecting against data loss is important, save the failing records
        // elsewhere instead of discarding, and/or notify the user.
        console.error(`Data upload error - discarding`, error);
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw error;
      }
    }
  }
}

// @ts-ignore
function shouldDiscardDataOnError(error: any) {
  // TODO: Ignore non-retryable errors here
  return false;
}

import { CrudTransaction } from "@powersync/web";
import httpClient, { endpoints } from "../../../api";
import { SyncTokenDTO } from "../types/sync-token";

export const getSyncData = async () => {
  return await httpClient.post<SyncTokenDTO>(endpoints.sync.token);
};

export const uploadSyncData = async (data: CrudTransaction) => {
  return await httpClient.post<void>(endpoints.sync.upload, data);
};

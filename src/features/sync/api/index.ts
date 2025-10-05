import httpClient, { endpoints } from "../../../api";
import { SyncTokenDTO } from "../types/sync-token";

export const getSyncData = async () => {
  return await httpClient.post<SyncTokenDTO>(endpoints.sync.token);
};

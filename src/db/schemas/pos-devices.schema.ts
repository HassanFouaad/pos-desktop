import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export type ConnectionStatus = "online" | "offline" | "syncing";

// Local-only table for POS device authentication
export const posDevices = sqliteTable("pos_devices", {
  id: text("id").primaryKey(), // Always "current_device"
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  deviceInfo: text("deviceInfo", { mode: "json" }), // Device information as JSON
  pairingData: text("pairingData", { mode: "json" }), // Store/tenant pairing info as JSON
  connectionStatus: text("connectionStatus")
    .$type<ConnectionStatus>()
    .default("offline"), // Connection status
});

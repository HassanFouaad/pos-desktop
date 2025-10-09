import { eq } from "drizzle-orm";
import { singleton } from "tsyringe";
import { drizzleDb } from "../../../db";
import { posDevices } from "../../../db/schemas";

type PosDeviceSchema = typeof posDevices.$inferInsert;

/**
 * Repository for managing POS device data in local database
 * Replaces Stronghold secure storage for POS device tokens
 */
@singleton()
export class PosDeviceRepository {
  private readonly DEVICE_ID = "current_device";

  /**
   * Upsert POS device data
   */
  async upsertPosDevice(data: Partial<PosDeviceSchema>): Promise<void> {
    const deviceData: PosDeviceSchema = {
      id: this.DEVICE_ID,
      ...data,
      lastUpdatedAt: new Date(),
    };

    const existingDevice = await drizzleDb
      .select()
      .from(posDevices)
      .where(eq(posDevices.id, this.DEVICE_ID))
      .limit(1)
      .execute();

    if (existingDevice?.[0]) {
      await drizzleDb
        .update(posDevices)
        .set(deviceData)
        .where(eq(posDevices.id, this.DEVICE_ID))
        .execute();
    } else {
      await drizzleDb.insert(posDevices).values(deviceData).execute();
    }
  }

  /**
   * Get current POS device data
   */
  async getPosDevice(): Promise<PosDeviceSchema | null> {
    const [device] = await drizzleDb
      .select()
      .from(posDevices)
      .where(eq(posDevices.id, this.DEVICE_ID))
      .limit(1)
      .execute();

    return device || null;
  }

  /**
   * Update POS device tokens
   */
  async updateTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.upsertPosDevice({
      accessToken,
      refreshToken,
    });
  }

  /**
   * Update access token only
   */
  async updateAccessToken(accessToken: string): Promise<void> {
    await this.upsertPosDevice({
      accessToken,
    });
  }

  /**
   * Update refresh token only
   */
  async updateRefreshToken(refreshToken: string): Promise<void> {
    await this.upsertPosDevice({
      refreshToken,
    });
  }

  /**
   * Store device info
   */
  async storeDeviceInfo(deviceInfo: Record<string, unknown>): Promise<void> {
    await this.upsertPosDevice({
      deviceInfo: JSON.stringify(deviceInfo) as any,
    });
  }

  /**
   * Store pairing data
   */
  async storePairingData(pairingData: Record<string, unknown>): Promise<void> {
    await this.upsertPosDevice({
      pairingData: JSON.stringify(pairingData) as any,
    });
  }

  /**
   * Get device info
   */
  async getDeviceInfo(): Promise<Record<string, unknown> | null> {
    const device = await this.getPosDevice();
    if (!device?.deviceInfo) return null;

    try {
      const parsed =
        typeof device.deviceInfo === "string"
          ? JSON.parse(device.deviceInfo)
          : device.deviceInfo;
      return parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  /**
   * Get pairing data
   */
  async getPairingData(): Promise<Record<string, unknown> | null> {
    const device = await this.getPosDevice();
    if (!device?.pairingData) return null;

    try {
      const parsed =
        typeof device.pairingData === "string"
          ? JSON.parse(device.pairingData)
          : device.pairingData;
      return parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  /**
   * Clear all POS device data
   */
  async clearPosDevice(): Promise<void> {
    await drizzleDb
      .delete(posDevices)
      .where(eq(posDevices.id, this.DEVICE_ID))
      .execute();
  }

  /**
   * Clear only tokens (keep device info and pairing data)
   */
  async clearTokens(): Promise<void> {
    await drizzleDb
      .update(posDevices)
      .set({
        accessToken: null,
        refreshToken: null,
        lastUpdatedAt: new Date(),
      })
      .where(eq(posDevices.id, this.DEVICE_ID))
      .execute();
  }
}

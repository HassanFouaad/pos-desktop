/**
 * Device Fingerprint Service
 *
 * Collects hardware and system information to create a unique device fingerprint.
 * This fingerprint is used for device identity binding and security validation.
 */

import { arch, hostname, platform, type, version } from "@tauri-apps/plugin-os";
import { injectable } from "tsyringe";
import { DeviceFingerprint } from "../../../types/pos-auth.types";

/**
 * Device Fingerprint Service
 * Injectable service for collecting and managing device fingerprints
 */
@injectable()
export class DeviceFingerprintService {
  private static readonly FINGERPRINT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private cachedFingerprint: DeviceFingerprint | null = null;
  private fingerprintExpiry: number = 0;

  /**
   * Get MAC address of the primary network interface
   *
   * Note: Tauri doesn't provide direct access to MAC addresses for security reasons.
   * We'll use a combination of hardware ID and machine ID as a stable identifier.
   * For production, this should be enhanced with Tauri plugins or Rust backend.
   */
  private async getMacAddress(): Promise<string> {
    try {
      // For now, generate a stable identifier based on hostname and platform
      // In production, you should use a Tauri plugin to get actual MAC address
      const host = await hostname();
      const plat = await platform();
      const machineType = await type();

      // Create a pseudo-MAC address from stable system identifiers
      const identifier = `${host}-${plat}-${machineType}`;

      console.log("identifier", {
        host,
        plat,
        machineType,
        identifier,
      });
      const hash = await this.simpleHash(identifier);

      // Format as MAC address
      return (
        hash
          .match(/.{1,2}/g)
          ?.slice(0, 6)
          .join(":")
          .toUpperCase() || "00:00:00:00:00:00"
      );
    } catch (error) {
      console.error("Failed to generate MAC address identifier:", error);
      return "00:00:00:00:00:00";
    }
  }

  /**
   * Simple hash function for generating pseudo-MAC
   */
  private async simpleHash(str: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex and pad to 12 characters
    const hex = Math.abs(hash).toString(16).padStart(12, "0");
    return hex.slice(0, 12);
  }

  /**
   * Get hostname of the device
   */
  private async getHostname(): Promise<string> {
    try {
      return (await hostname()) || "Unknown";
    } catch (error) {
      console.error("Failed to get hostname:", error);
      return "Unknown";
    }
  }

  /**
   * Get OS version string
   */
  private async getOsVersion(): Promise<string> {
    try {
      const plat = await platform();
      const ver = await version();
      const archType = await arch();

      return `${plat} ${ver} (${archType})`;
    } catch (error) {
      console.error("Failed to get OS version:", error);
      return "Unknown";
    }
  }

  /**
   * Get CPU model information
   *
   * Note: Tauri doesn't provide CPU information directly.
   * Using architecture as a fallback.
   */
  private async getCpuModel(): Promise<string> {
    try {
      const archType = await arch();
      const plat = await platform();

      // Return architecture info as CPU identifier
      return `${plat} ${archType}`;
    } catch (error) {
      console.error("Failed to get CPU model:", error);
      return "Unknown";
    }
  }

  /**
   * Get total RAM
   *
   * Note: Tauri doesn't provide memory information directly.
   * This would need a custom Tauri command or plugin.
   */
  private async getTotalRAM(): Promise<string> {
    try {
      // For now, return "Unknown"
      // In production, implement a Rust command to get system memory
      return "Unknown";
    } catch (error) {
      console.error("Failed to get total RAM:", error);
      return "Unknown";
    }
  }

  /**
   * Get screen resolution
   */
  private getScreenResolution(): string {
    try {
      const { screen } = window;
      return `${screen.width}x${screen.height}`;
    } catch (error) {
      console.error("Failed to get screen resolution:", error);
      return "Unknown";
    }
  }

  /**
   * Get timezone
   */
  private getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (error) {
      console.error("Failed to get timezone:", error);
      return "UTC";
    }
  }

  /**
   * Collect complete device fingerprint
   *
   * Results are cached for 5 minutes to avoid repeated collection overhead.
   */
  public async collectDeviceFingerprint(): Promise<DeviceFingerprint> {
    // Return cached fingerprint if still valid
    const now = Date.now();
    if (this.cachedFingerprint && now < this.fingerprintExpiry) {
      return this.cachedFingerprint;
    }

    try {
      // Collect all device information
      const [macAddress, hostnameStr, osVersion, cpuModel, totalRAM] =
        await Promise.all([
          this.getMacAddress(),
          this.getHostname(),
          this.getOsVersion(),
          this.getCpuModel(),
          this.getTotalRAM(),
        ]);

      const fingerprint: DeviceFingerprint = {
        macAddress,
        hostname: hostnameStr,
        osVersion,
        cpuModel,
        totalRAM,
        screenResolution: this.getScreenResolution(),
        timezone: this.getTimezone(),
        collectedAt: new Date().toISOString(),
      };

      // Cache the fingerprint
      this.cachedFingerprint = fingerprint;
      this.fingerprintExpiry =
        now + DeviceFingerprintService.FINGERPRINT_CACHE_TTL;

      console.info("Device fingerprint collected successfully");
      return fingerprint;
    } catch (error) {
      console.error("Failed to collect device fingerprint:", error);

      // Return a minimal fallback fingerprint
      return {
        macAddress: "00:00:00:00:00:00",
        hostname: "Unknown",
        osVersion: "Unknown",
        cpuModel: "Unknown",
        totalRAM: "Unknown",
        screenResolution: this.getScreenResolution(),
        timezone: this.getTimezone(),
        collectedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Clear cached fingerprint
   * Useful when you want to force re-collection
   */
  public clearFingerprintCache(): void {
    this.cachedFingerprint = null;
    this.fingerprintExpiry = 0;
  }

  /**
   * Check if device fingerprint is currently cached
   */
  public isFingerprintCached(): boolean {
    return (
      this.cachedFingerprint !== null && Date.now() < this.fingerprintExpiry
    );
  }
}

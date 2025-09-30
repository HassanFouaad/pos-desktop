import { Store } from "@tauri-apps/plugin-store";
import { LogCategory, syncLogger } from "../../../db/sync/logger";

/**
 * Secure token storage interface
 * Defines the methods to store and retrieve authentication tokens securely
 */
export interface SecureTokenStorage {
  /**
   * Store a token securely
   * @param key The key for the token
   * @param token The token value
   * @returns A promise that resolves when the operation is complete
   */
  storeToken(key: string, token: string): Promise<void>;

  /**
   * Retrieve a token by key
   * @param key The key for the token
   * @returns The token value, or null if not found
   */
  getToken(key: string): Promise<string | null>;

  /**
   * Delete a stored token
   * @param key The key for the token to delete
   * @returns A promise that resolves when the operation is complete
   */
  deleteToken(key: string): Promise<void>;

  /**
   * Clear all stored tokens
   * @returns A promise that resolves when the operation is complete
   */
  clearTokens(): Promise<void>;
}

/**
 * Implementation of SecureTokenStorage using Tauri's plugin-store
 * Falls back to localStorage in development mode or if store is unavailable
 */
class TauriSecureStorage implements SecureTokenStorage {
  private readonly IS_DEVELOPMENT = import.meta.env.DEV;
  private readonly PREFIX = "auth_token_";
  private store: Store | null = null;
  private storeInitialized = false;

  constructor() {
    this.initStore();
  }

  /**
   * Initialize the Tauri store
   */
  private async initStore(): Promise<void> {
    if (this.storeInitialized) return;

    try {
      // Create a new store instance for auth tokens
      this.store = await Store.load("auth_tokens.dat");
      this.storeInitialized = true;

      syncLogger.info(LogCategory.AUTH, "Tauri store initialized successfully");
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        "Failed to initialize Tauri store",
        error instanceof Error ? error : new Error(String(error))
      );
      this.store = null;
    }
  }

  /**
   * Store a token securely using Tauri's plugin-store
   * In development, falls back to localStorage with encryption
   */
  public async storeToken(key: string, token: string): Promise<void> {
    const secureKey = this.PREFIX + key;

    try {
      // Make sure store is initialized
      if (!this.storeInitialized) {
        await this.initStore();
      }

      if (this.IS_DEVELOPMENT && !this.store) {
        // In dev mode without store, use simple localStorage with base64 encoding
        localStorage.setItem(secureKey, btoa(token));
        return;
      }

      if (this.store) {
        // Use Tauri's plugin-store
        await this.store.set(secureKey, token);
        await this.store.save();
        return;
      }

      throw new Error("Store not available");
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        `Failed to store token securely: ${key}`,
        error instanceof Error ? error : new Error(String(error))
      );

      // Fall back to localStorage with encryption
      this.storeTokenWithFallback(secureKey, token);
    }
  }

  /**
   * Retrieve a token from secure storage
   */
  public async getToken(key: string): Promise<string | null> {
    const secureKey = this.PREFIX + key;

    try {
      // Make sure store is initialized
      if (!this.storeInitialized) {
        await this.initStore();
      }

      if (this.IS_DEVELOPMENT && !this.store) {
        // In dev mode without store, use localStorage
        const value = localStorage.getItem(secureKey);
        return value ? atob(value) : null;
      }

      if (this.store) {
        // Use Tauri's plugin-store
        const token = await this.store.get<string>(secureKey);
        return token || null;
      }

      throw new Error("Store not available");
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        `Failed to retrieve token from secure storage: ${key}`,
        error instanceof Error ? error : new Error(String(error))
      );

      // Try fallback storage
      return this.getTokenWithFallback(secureKey);
    }
  }

  /**
   * Delete a token from secure storage
   */
  public async deleteToken(key: string): Promise<void> {
    const secureKey = this.PREFIX + key;

    try {
      // Make sure store is initialized
      if (!this.storeInitialized) {
        await this.initStore();
      }

      if (this.IS_DEVELOPMENT && !this.store) {
        localStorage.removeItem(secureKey);
        return;
      }

      if (this.store) {
        // Use Tauri's plugin-store
        await this.store.delete(secureKey);
        await this.store.save();
        return;
      }

      throw new Error("Store not available");
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        `Failed to delete token from secure storage: ${key}`,
        error instanceof Error ? error : new Error(String(error))
      );

      // Remove from fallback if it exists
      localStorage.removeItem(secureKey + "_fallback");
    }
  }

  /**
   * Clear all stored tokens
   */
  public async clearTokens(): Promise<void> {
    try {
      // Make sure store is initialized
      if (!this.storeInitialized) {
        await this.initStore();
      }

      if (this.IS_DEVELOPMENT && !this.store) {
        // In development without store, clear localStorage keys with our prefix
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(this.PREFIX)) {
            localStorage.removeItem(key);
          }
        });
        return;
      }

      if (this.store) {
        // Use Tauri's plugin-store - clear and save
        await this.store.clear();
        await this.store.save();
        return;
      }

      throw new Error("Store not available");
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        "Failed to clear secure storage",
        error instanceof Error ? error : new Error(String(error))
      );

      // Clear fallback storage
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("_fallback")) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Fallback method to store tokens when secure storage is unavailable
   * Uses a simple encryption mechanism with a device-specific key
   * @private
   */
  private storeTokenWithFallback(key: string, token: string): void {
    // This is not truly secure, but better than plaintext
    // In a real app, you would use a proper encryption library
    try {
      // Simple obfuscation with XOR using a device fingerprint
      const deviceKey = this.getDeviceKey();
      const encoded = this.xorEncrypt(token, deviceKey);
      localStorage.setItem(key + "_fallback", encoded);
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        "Failed to store token with fallback method",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Fallback method to retrieve tokens when secure storage is unavailable
   * @private
   */
  private getTokenWithFallback(key: string): string | null {
    try {
      const encoded = localStorage.getItem(key + "_fallback");
      if (!encoded) return null;

      const deviceKey = this.getDeviceKey();
      return this.xorEncrypt(encoded, deviceKey);
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        "Failed to retrieve token with fallback method",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Get a semi-stable device key based on available browser information
   * @private
   */
  private getDeviceKey(): string {
    // This is just a basic implementation
    // A real implementation would use more robust device fingerprinting
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenData = `${screen.width}x${screen.height}x${screen.colorDepth}`;

    // Create a simple hash of device data
    let hash = 0;
    const combinedString = `${userAgent}|${language}|${screenData}`;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return hash.toString(36);
  }

  /**
   * Simple XOR encryption/decryption
   * @private
   */
  private xorEncrypt(text: string, key: string): string {
    let result = "";

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }

    return btoa(result); // base64 encode
  }
}

// Export singleton instance
export const secureStorage = new TauriSecureStorage();

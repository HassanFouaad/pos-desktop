import { appDataDir } from "@tauri-apps/api/path";
import { Client, Stronghold } from "@tauri-apps/plugin-stronghold";
import { config } from "../../../config";

/**
 * Token type enum for differentiating between POS and user tokens
 */
export enum TokenType {
  POS = "pos",
  USER = "user",
}

/**
 * Type for clearing tokens - can be a specific type or all
 */
export type ClearTokenType = TokenType | "all";

/**
 * Secure token storage interface
 * Defines the methods to store and retrieve authentication tokens securely
 */
export interface SecureTokenStorage {
  /**
   * Store a token securely
   * @param key The key for the token
   * @param token The token value
   * @param type The type of token (TokenType.POS | TokenType.USER)
   * @returns A promise that resolves when the operation is complete
   */
  storeToken(key: string, token: string, type: TokenType): Promise<void>;

  /**
   * Retrieve a token by key and type
   * @param key The key for the token
   * @param type The type of token (TokenType.POS | TokenType.USER)
   * @returns The token value, or null if not found
   */
  getToken(key: string, type: TokenType): Promise<string | null>;

  /**
   * Delete a stored token
   * @param key The key for the token to delete
   * @param type The type of token (TokenType.POS | TokenType.USER)
   * @returns A promise that resolves when the operation is complete
   */
  deleteToken(key: string, type: TokenType): Promise<void>;

  /**
   * Clear all stored tokens of a specific type
   * @param type The type of tokens to clear (TokenType.POS | TokenType.USER | 'all')
   * @returns A promise that resolves when the operation is complete
   */
  clearTokens(type: ClearTokenType): Promise<void>;
}

/**
 * Implementation of SecureTokenStorage using Tauri's Stronghold plugin
 * Provides encrypted storage for sensitive authentication tokens
 */
class TauriStrongholdStorage implements SecureTokenStorage {
  private stronghold: Stronghold | null = null;
  private client: Client | null = null;
  private strongholdInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly VAULT_PASSWORD = config.VAULT_PASSWORD;
  private readonly VAULT_FILENAME = config.VAULT_FILENAME;
  private readonly CLIENT_NAME = config.AUTH_CLIENT_NAME;
  private pendingSave = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize the Stronghold vault (optimized with caching and debouncing)
   */
  private async initStronghold(): Promise<void> {
    // If already initialized, return immediately
    if (this.strongholdInitialized && this.stronghold && this.client) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization
    this.initializationPromise = (async () => {
      try {
        const appData = await appDataDir();
        // Normalize path separator
        const separator =
          appData.endsWith("/") || appData.endsWith("\\") ? "" : "/";
        const vaultPath = `${appData}${separator}${this.VAULT_FILENAME}`;

        // Load stronghold
        this.stronghold = await Stronghold.load(vaultPath, this.VAULT_PASSWORD);

        // Load or create client immediately
        try {
          this.client = await this.stronghold.loadClient(this.CLIENT_NAME);
        } catch {
          this.client = await this.stronghold.createClient(this.CLIENT_NAME);
        }

        this.strongholdInitialized = true;
        console.info("Stronghold vault initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Stronghold vault:", error);
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Get the Stronghold client (with optimized initialization)
   */
  private async getClient(): Promise<Client> {
    // Ensure stronghold is initialized
    await this.initStronghold();

    if (!this.client) {
      throw new Error("Stronghold client not initialized");
    }

    return this.client;
  }

  /**
   * Debounced save to avoid frequent disk writes
   */
  private async debouncedSave(): Promise<void> {
    this.pendingSave = true;

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout
    this.saveTimeout = setTimeout(async () => {
      if (this.pendingSave && this.stronghold) {
        try {
          await this.stronghold.save();
          this.pendingSave = false;
        } catch (error) {
          console.error("Failed to save stronghold:", error);
        }
      }
    }, 100); // Debounce by 100ms
  }

  /**
   * Generate storage key with type prefix
   */
  private getStorageKey(key: string, type: TokenType): string {
    return `${type}_${key}`;
  }

  /**
   * Store a token securely using Stronghold (optimized with debounced save)
   */
  public async storeToken(
    key: string,
    token: string,
    type: TokenType
  ): Promise<void> {
    if (!token) {
      console.warn(`Attempted to store empty token for key: ${key}`);
      return;
    }

    try {
      const client = await this.getClient();
      const store = client.getStore();
      const storageKey = this.getStorageKey(key, type);

      // Convert string to Uint8Array for storage
      const data = Array.from(new TextEncoder().encode(token));

      await store.insert(storageKey, data);

      // Use debounced save instead of immediate save
      await this.debouncedSave();
    } catch (error) {
      console.error(
        `Failed to store token: ${type}_${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error(`Failed to store token securely: ${key}`);
    }
  }

  /**
   * Retrieve a token from secure storage
   */
  public async getToken(key: string, type: TokenType): Promise<string | null> {
    try {
      const client = await this.getClient();
      const store = client.getStore();
      const storageKey = this.getStorageKey(key, type);

      const data = await store.get(storageKey);

      if (!data || data.length === 0) {
        return null;
      }

      // Convert Uint8Array back to string
      const value = new TextDecoder().decode(new Uint8Array(data));
      return value;
    } catch (error) {
      console.error(
        `Failed to retrieve token: ${type}_${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Delete a token from secure storage (optimized with debounced save)
   */
  public async deleteToken(key: string, type: TokenType): Promise<void> {
    try {
      const client = await this.getClient();
      const store = client.getStore();
      const storageKey = this.getStorageKey(key, type);

      await store.remove(storageKey);

      // Use debounced save instead of immediate save
      await this.debouncedSave();
    } catch (error) {
      console.error(
        `Failed to delete token: ${type}_${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error(`Failed to delete token: ${key}`);
    }
  }

  /**
   * Clear all stored tokens of a specific type (optimized with debounced save)
   */
  public async clearTokens(type: ClearTokenType): Promise<void> {
    try {
      const client = await this.getClient();
      const store = client.getStore();

      // List of known token keys
      const tokenKeys = [
        "accessToken",
        "refreshToken",
        "deviceInfo",
        "pairingData",
      ];

      if (type === "all") {
        // Clear both POS and user tokens
        for (const key of tokenKeys) {
          try {
            await store.remove(this.getStorageKey(key, TokenType.POS));
          } catch {
            // Ignore errors for keys that don't exist
          }
          try {
            await store.remove(this.getStorageKey(key, TokenType.USER));
          } catch {
            // Ignore errors for keys that don't exist
          }
        }
      } else {
        // Clear tokens for specific type
        for (const key of tokenKeys) {
          try {
            await store.remove(this.getStorageKey(key, type));
          } catch {
            // Ignore errors for keys that don't exist
          }
        }
      }

      // Use debounced save instead of immediate save
      await this.debouncedSave();

      console.info(`Cleared tokens for type: ${type}`);
    } catch (error) {
      console.error(
        `Failed to clear tokens for type: ${type}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error(`Failed to clear tokens: ${type}`);
    }
  }
}

// Export singleton instance
export const secureStorage = new TauriStrongholdStorage();

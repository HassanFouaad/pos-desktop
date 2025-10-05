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
  private readonly VAULT_PASSWORD = config.VAULT_PASSWORD;
  private readonly VAULT_FILENAME = config.VAULT_FILENAME;
  private readonly CLIENT_NAME = config.AUTH_CLIENT_NAME;

  /**
   * Initialize the Stronghold vault
   */
  private async initStronghold(): Promise<void> {
    if (this.strongholdInitialized && this.stronghold) {
      return;
    }

    try {
      const appData = await appDataDir();
      // Normalize path separator (appDataDir may or may not end with separator)
      const separator =
        appData.endsWith("/") || appData.endsWith("\\") ? "" : "/";
      const vaultPath = `${appData}${separator}${this.VAULT_FILENAME}`;
      console.info("Initializing Stronghold vault at:", vaultPath);

      // Create a fresh stronghold
      this.stronghold = await Stronghold.load(vaultPath, this.VAULT_PASSWORD);
      this.strongholdInitialized = true;
      console.info("Stronghold vault loaded successfully");
    } catch (error) {
      console.error("Failed to initialize Stronghold vault:", error);
      throw error;
    }
  }

  /**
   * Get or create the Stronghold client
   * Uses a single client for all token types with key prefixes
   */
  private async getClient(): Promise<Client> {
    // Return cached client if available
    if (this.client) {
      return this.client;
    }

    // Initialize stronghold if needed
    if (!this.stronghold) {
      await this.initStronghold();
    }

    if (!this.stronghold) {
      throw new Error("Stronghold not initialized");
    }

    try {
      // Try to load existing client
      this.client = await this.stronghold.loadClient(this.CLIENT_NAME);
    } catch {
      // Client doesn't exist, create it
      this.client = await this.stronghold.createClient(this.CLIENT_NAME);
    }

    return this.client;
  }

  /**
   * Generate storage key with type prefix
   */
  private getStorageKey(key: string, type: TokenType): string {
    return `${type}_${key}`;
  }

  /**
   * Store a token securely using Stronghold
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

      // Save the stronghold after inserting
      if (this.stronghold) {
        await this.stronghold.save();
        console.info(`Token stored successfully: ${storageKey}`);
      }
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
   * Delete a token from secure storage
   */
  public async deleteToken(key: string, type: TokenType): Promise<void> {
    try {
      const client = await this.getClient();
      const store = client.getStore();
      const storageKey = this.getStorageKey(key, type);

      await store.remove(storageKey);

      // Save the stronghold after removing
      if (this.stronghold) {
        await this.stronghold.save();
        console.info(`Token deleted successfully: ${storageKey}`);
      }
    } catch (error) {
      console.error(
        `Failed to delete token: ${type}_${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error(`Failed to delete token: ${key}`);
    }
  }

  /**
   * Clear all stored tokens of a specific type
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

      // Save the stronghold after clearing
      if (this.stronghold) {
        await this.stronghold.save();
      }

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

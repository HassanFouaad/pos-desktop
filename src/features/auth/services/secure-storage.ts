import { appDataDir } from "@tauri-apps/api/path";
import { Stronghold } from "@tauri-apps/plugin-stronghold";
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
  private strongholdInitialized = false;
  private readonly VAULT_PASSWORD = config.VAULT_PASSWORD; // In production, use a more secure key derivation
  private readonly VAULT_FILENAME = config.VAULT_FILENAME;
  private readonly POS_CLIENT_NAME = config.POS_CLIENT_NAME;
  private readonly USER_CLIENT_NAME = config.USER_CLIENT_NAME;

  /**
   * Initialize the Stronghold vault
   */
  private async initStronghold(): Promise<void> {
    if (this.strongholdInitialized && this.stronghold) {
      return;
    }

    try {
      const appData = await appDataDir();
      const vaultPath = `${appData}/${this.VAULT_FILENAME}`;

      console.info("Initializing Stronghold vault at:", vaultPath);

      // Load or create the stronghold
      this.stronghold = await Stronghold.load(vaultPath, this.VAULT_PASSWORD);
      this.strongholdInitialized = true;

      console.info("Stronghold vault initialized successfully");
    } catch (error) {
      console.error(
        "Failed to initialize Stronghold vault",
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error("Failed to initialize secure storage");
    }
  }

  /**
   * Get or create a client for the specified token type
   */
  private async getClient(type: TokenType) {
    if (!this.stronghold) {
      await this.initStronghold();
    }

    if (!this.stronghold) {
      throw new Error("Stronghold not initialized");
    }

    const clientName =
      type === TokenType.POS ? this.POS_CLIENT_NAME : this.USER_CLIENT_NAME;

    try {
      // Try to load existing client
      return await this.stronghold.loadClient(clientName);
    } catch {
      // Client doesn't exist, create it
      return await this.stronghold.createClient(clientName);
    }
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
      const client = await this.getClient(type);
      const store = client.getStore();

      // Convert string to Uint8Array for storage
      const data = Array.from(new TextEncoder().encode(token));

      await store.insert(key, data);

      // Save the stronghold after inserting
      if (this.stronghold) {
        await this.stronghold.save();
        console.info(`Token stored successfully: ${type}_${key}`);
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
      const client = await this.getClient(type);
      const store = client.getStore();

      const data = await store.get(key);

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
      const client = await this.getClient(type);
      const store = client.getStore();

      await store.remove(key);

      // Save the stronghold after removing
      if (this.stronghold) {
        await this.stronghold.save();
        console.info(`Token deleted successfully: ${type}_${key}`);
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
      if (type === "all") {
        // Clear both POS and user tokens
        await this.clearClientTokens(TokenType.POS);
        await this.clearClientTokens(TokenType.USER);
      } else {
        await this.clearClientTokens(type);
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

  /**
   * Clear all tokens for a specific client
   */
  private async clearClientTokens(type: TokenType): Promise<void> {
    try {
      const client = await this.getClient(type);
      const store = client.getStore();

      // Stronghold doesn't have a clear all method, so we need to remove keys individually
      // We'll maintain a list of known keys
      const keysToRemove = [
        "accessToken",
        "refreshToken",
        "deviceInfo",
        "pairingData",
      ];

      for (const key of keysToRemove) {
        try {
          await store.remove(key);
        } catch {
          // Ignore errors for keys that don't exist
        }
      }

      // Save the stronghold after clearing
      if (this.stronghold) {
        await this.stronghold.save();
      }
    } catch (error) {
      console.error(
        `Failed to clear client tokens for type: ${type}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
}

// Export singleton instance
export const secureStorage = new TauriStrongholdStorage();

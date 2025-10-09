import { container, inject, injectable } from "tsyringe";
import { UsersRepository } from "../../users/repositories/users.repository";
import { PosDeviceRepository } from "../repositories/pos-device.repository";

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
 * Database-based token storage
 * Replaces Stronghold secure storage with local database storage
 * Maintains same interface for backward compatibility
 */

@injectable()
class DbTokenStorage {
  constructor(
    @inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @inject(PosDeviceRepository)
    private readonly posDeviceRepository: PosDeviceRepository
  ) {}

  /**
   * Store a token in the database
   * @param key The key for the token (accessToken, refreshToken, deviceInfo, pairingData)
   * @param token The token value (can be string or object for JSON fields)
   * @param type The type of token (TokenType.POS | TokenType.USER)
   */
  async storeToken(
    key: string,
    token: string | Record<string, unknown>,
    type: TokenType
  ): Promise<void> {
    if (!token) {
      console.warn(`Attempted to store empty token for key: ${key}`);
      return;
    }

    try {
      if (type === TokenType.POS) {
        // Store POS tokens in pos_devices table
        switch (key) {
          case "accessToken":
            await this.posDeviceRepository.updateAccessToken(token as string);
            break;
          case "refreshToken":
            await this.posDeviceRepository.updateRefreshToken(token as string);
            break;
          case "deviceInfo":
            await this.posDeviceRepository.storeDeviceInfo(
              token as Record<string, unknown>
            );
            break;
          case "pairingData":
            await this.posDeviceRepository.storePairingData(
              token as Record<string, unknown>
            );
            break;
          default:
            console.warn(`Unknown POS token key: ${key}`);
        }
      } else {
        // Store USER tokens in users table (current logged-in user)
        const currentUser = await this.usersRepository.getLoggedInUser();
        if (!currentUser) {
          throw new Error("No logged-in user found to store token");
        }

        const updates: Record<string, unknown> = {};
        switch (key) {
          case "accessToken":
            updates.accessToken = token;
            break;
          case "refreshToken":
            updates.refreshToken = token;
            break;
          default:
            console.warn(`Unknown USER token key: ${key}`);
            return;
        }

        await this.usersRepository.upsertUser(
          { id: currentUser.id, ...updates },
          updates.accessToken as string | undefined,
          updates.refreshToken as string | undefined
        );
      }
    } catch (error) {
      console.error(
        `Failed to store token: ${type}_${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error(`Failed to store token: ${key}`);
    }
  }

  /**
   * Retrieve a token from the database
   * @param key The key for the token
   * @param type The type of token (TokenType.POS | TokenType.USER)
   * @returns The token value, or null if not found
   */
  async getToken(
    key: string,
    type: TokenType
  ): Promise<string | Record<string, unknown> | null> {
    try {
      if (type === TokenType.POS) {
        // Get POS tokens from pos_devices table
        const device = await this.posDeviceRepository.getPosDevice();
        if (!device) return null;

        switch (key) {
          case "accessToken":
            return device.accessToken || null;
          case "refreshToken":
            return device.refreshToken || null;
          case "deviceInfo":
            return await this.posDeviceRepository.getDeviceInfo();
          case "pairingData":
            return await this.posDeviceRepository.getPairingData();
          default:
            console.warn(`Unknown POS token key: ${key}`);
            return null;
        }
      } else {
        // Get USER tokens from users table
        const currentUser = await this.usersRepository.getLoggedInUser();
        if (!currentUser) return null;

        switch (key) {
          case "accessToken":
            return currentUser.accessToken || null;
          case "refreshToken":
            return currentUser.refreshToken || null;
          default:
            console.warn(`Unknown USER token key: ${key}`);
            return null;
        }
      }
    } catch (error) {
      console.error(
        `Failed to retrieve token: ${type}_${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Delete a token from the database
   * @param key The key for the token to delete
   * @param type The type of token (TokenType.POS | TokenType.USER)
   */
  async deleteToken(key: string, type: TokenType): Promise<void> {
    try {
      // Deleting is same as storing null/empty value
      await this.storeToken(key, "", type);
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
   * @param type The type of tokens to clear (TokenType.POS | TokenType.USER | 'all')
   */
  async clearTokens(type: ClearTokenType): Promise<void> {
    try {
      if (type === "all") {
        // Clear both POS and user tokens
        await this.posDeviceRepository.clearTokens();
        await this.usersRepository.logoutAllUsers();
      } else if (type === TokenType.POS) {
        // Clear POS tokens only
        await this.posDeviceRepository.clearTokens();
      } else {
        // Clear USER tokens only
        await this.usersRepository.logoutAllUsers();
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
export const dbTokenStorage = container.resolve(DbTokenStorage);

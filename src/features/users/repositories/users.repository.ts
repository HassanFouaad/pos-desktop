import { eq } from "drizzle-orm";
import { singleton } from "tsyringe";
import { drizzleDb } from "../../../db";
import { users } from "../../../db/schemas";
import { AuthResponse } from "../../auth/api/auth";

type UserSchema = typeof users.$inferInsert;

@singleton()
export class UsersRepository {
  /**
   * Inserts or updates a user in the local database.
   * Also ensures all other users are marked as not logged in.
   */
  async upsertUser(
    userData: Partial<AuthResponse["user"]>,
    accessToken?: string,
    refreshToken?: string
  ): Promise<void> {
    const userToInsert: UserSchema = {
      ...userData,
      id: userData.id || "",
      tenantId: userData.tenantId,
      permissions: userData.permissions || [],
      isLoggedIn: true,
      lastLoginAt: new Date().toISOString(),
      refreshToken: refreshToken,
      accessToken: accessToken,
    };

    const foundUser = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.id, userToInsert.id))
      .limit(1)
      .execute();

    if (foundUser?.[0]) {
      await drizzleDb
        .update(users)
        .set(userToInsert)
        .where(eq(users.id, userToInsert.id))
        .execute();
    } else {
      await drizzleDb.insert(users).values(userToInsert).execute();
    }
  }

  /**
   * Finds a user by their username (email in this case) for offline auth.
   */
  async findUserByUsername(username: string): Promise<UserSchema | null> {
    const [user] = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
      .execute();
    return user || null;
  }

  /**
   * Retrieves the currently logged-in user from the local database.
   */
  async getLoggedInUser(): Promise<UserSchema | null> {
    const [user] = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.isLoggedIn, true))
      .limit(1)
      .execute();
    return user || null;
  }

  /**
   * Marks a specific user as logged in and all others as logged out.
   */
  async setLoggedInUser(userId: string): Promise<void> {
    // Use a transaction to ensure atomicity
    await drizzleDb.transaction(async (tx) => {
      await tx.update(users).set({ isLoggedIn: false });
      await tx
        .update(users)
        .set({ isLoggedIn: true, lastLoginAt: new Date().toISOString() })
        .where(eq(users.id, userId));
    });
  }

  /**
   * Marks all users as logged out.
   */
  async logoutAllUsers(): Promise<void> {
    await drizzleDb.update(users).set({ isLoggedIn: false });
  }
}

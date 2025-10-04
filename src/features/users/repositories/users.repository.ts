import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { drizzleDb } from "../../../db/drizzle";
import { DatabaseSchema, users } from "../../../db/schemas";
import { AuthResponse } from "../../auth/api/auth";

type UserSchema = typeof users.$inferInsert;

class UsersRepository {
  private db: ReturnType<typeof drizzle<typeof DatabaseSchema>> =
    drizzleDb.database;

  constructor() {
    this.db = drizzleDb.database;
  }

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
      lastLoginAt: new Date(),
      refreshToken: refreshToken,
      accessToken: accessToken,
    };

    await this.db.insert(users).values(userToInsert).onConflictDoUpdate({
      target: users.id,
      set: userToInsert,
    });
  }

  /**
   * Finds a user by their username (email in this case) for offline auth.
   */
  async findUserByUsername(username: string): Promise<UserSchema | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, username))
      .limit(1)
      .execute();
    return user || null;
  }

  /**
   * Retrieves the currently logged-in user from the local database.
   */
  async getLoggedInUser(): Promise<UserSchema | null> {
    const [user] = await this.db
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
    await this.db.transaction(async (tx) => {
      await tx.update(users).set({ isLoggedIn: false });
      await tx
        .update(users)
        .set({ isLoggedIn: true, lastLoginAt: new Date() })
        .where(eq(users.id, userId));
    });
  }

  /**
   * Marks all users as logged out.
   */
  async logoutAllUsers(): Promise<void> {
    await this.db.update(users).set({ isLoggedIn: false });
  }
}

export const usersRepository = new UsersRepository();

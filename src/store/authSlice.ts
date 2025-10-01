import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import httpClient from "../api";
import { startSync } from "../db/database";
import { LogCategory, syncLogger } from "../db/sync/logger";
import { syncService } from "../db/sync/sync.service";
import {
  login as apiLogin,
  AuthResponse,
  getMe,
  LoginCredentials,
} from "../features/auth/api/auth";
import { secureStorage } from "../features/auth/services/secure-storage";
import { usersRepository } from "../features/users/repositories/users.repository";
import { networkStatus } from "../utils/network-status";
import { removeLocalStorage, setLocalStorage } from "../utils/storage";

/**
 * User model interface
 */
interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  storeId?: number;
  tenantId?: number;
  // Optional properties that may come from the database
  hashedPassword?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  offlineMode: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  initialized: false,
  offlineMode: !navigator.onLine,
};

export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { dispatch }) => {
    try {
      const currentLoggedInUser = await usersRepository.getLoggedInUser();

      // Get token from secure storage instead of localStorage
      let token = await secureStorage.getToken("accessToken");

      // Update offline mode status
      const isNetworkOnline = networkStatus.isNetworkOnline();
      dispatch(authSlice.actions.setOfflineMode(!isNetworkOnline));

      // CRITICAL FIX: If we have a logged in user in the database, use it regardless
      // This ensures users stay logged in when refreshing the app
      if (currentLoggedInUser) {
        // If we have a user but no token, try to get it from the user object
        if (!token && currentLoggedInUser.accessToken) {
          token = currentLoggedInUser.accessToken;
          // Save it to secure storage for future use
          await secureStorage.storeToken("accessToken", token);
        }

        // If we have a user, consider them authenticated even without a token in offline mode
        if (!isNetworkOnline || !token) {
          syncLogger.info(
            LogCategory.AUTH,
            `Using cached user credentials for ${
              currentLoggedInUser.username || currentLoggedInUser.email
            }`,
            { offline: !isNetworkOnline }
          );

          // Try to start sync if we have a token
          if (token) {
            try {
              await startSync(token, String(currentLoggedInUser.id));
              await syncService.start();
            } catch (syncError) {
              syncLogger.error(
                LogCategory.AUTH,
                "Failed to start sync service, but continuing with cached user",
                syncError instanceof Error
                  ? syncError
                  : new Error(String(syncError))
              );
            }
          }

          // Return the cached user without sensitive data
          const userToReturn = { ...currentLoggedInUser };
          delete userToReturn.hashedPassword;
          delete userToReturn.accessToken;
          delete userToReturn.refreshToken;
          delete userToReturn.lastLoginAt;

          return userToReturn;
        }

        // If we're online and have a token, try to refresh it
        if (isNetworkOnline && token) {
          try {
            const newToken = await httpClient.refreshToken();
            if (newToken) {
              token = newToken;
            }

            // Try to get updated user data
            const user = await getMe();

            if (!user.error && user.data) {
              // Successfully got updated user data
              await startSync(token, String(currentLoggedInUser.id));
              await syncService.start();

              await usersRepository.upsertUser(
                user.data as Partial<AuthResponse["user"]>,
                token
              );

              const userToReturn = { ...user.data.user };
              delete userToReturn.hashedPassword;
              delete userToReturn.accessToken;
              delete userToReturn.refreshToken;
              delete userToReturn.lastLoginAt;

              return userToReturn;
            }
          } catch (refreshError) {
            // If refresh fails, fall back to cached user
            syncLogger.warn(
              LogCategory.AUTH,
              "Failed to refresh token, using cached user",
              refreshError instanceof Error
                ? refreshError
                : new Error(String(refreshError))
            );
          }

          // If we get here, either the API call failed or refresh failed
          // Start sync with existing token and use cached user
          try {
            await startSync(token, String(currentLoggedInUser.id));
            await syncService.start();
          } catch (syncError) {
            syncLogger.error(
              LogCategory.AUTH,
              "Failed to start sync service, but continuing with cached user",
              syncError instanceof Error
                ? syncError
                : new Error(String(syncError))
            );
          }

          // Return the cached user without sensitive data
          const userToReturn = { ...currentLoggedInUser };
          delete userToReturn.hashedPassword;
          delete userToReturn.accessToken;
          delete userToReturn.refreshToken;
          delete userToReturn.lastLoginAt;

          return userToReturn;
        }
      }

      // If we get here, we don't have a logged in user
      throw new Error("No logged in user found");
    } catch (error) {
      syncLogger.error(
        LogCategory.AUTH,
        "Auth initialization failed",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials) => {
    const isNetworkOnline = networkStatus.isNetworkOnline();

    if (!isNetworkOnline) {
      const user = await usersRepository.findUserByUsername(
        credentials.username
      );

      if (!user) {
        throw new Error("User not found");
      }

      if (user.hashedPassword !== credentials.password) {
        throw new Error("Invalid password");
      }

      // Store tokens in secure storage
      await secureStorage.storeToken("accessToken", user.accessToken ?? "");
      await secureStorage.storeToken("refreshToken", user.refreshToken ?? "");

      // Keep minimal token info in localStorage for quick UI rendering
      setLocalStorage("hasToken", "true");

      await startSync(user.accessToken ?? "", String(user.id));
      await syncService.start();
      return user;
    }

    const authResponse = await apiLogin(credentials);

    if (authResponse.error || !authResponse.data) {
      throw authResponse.error;
    }

    await Promise.all([
      usersRepository.setLoggedInUser(authResponse.data.user.id),
      usersRepository.upsertUser(
        {
          ...authResponse.data.user,
          hashedPassword: credentials.password,
        },
        authResponse.data.accessToken,
        authResponse.data.refreshToken
      ),
    ]);

    // Store tokens in secure storage
    await secureStorage.storeToken(
      "accessToken",
      authResponse.data.accessToken
    );
    await secureStorage.storeToken(
      "refreshToken",
      authResponse.data.refreshToken
    );

    // Keep minimal token info in localStorage for quick UI rendering
    setLocalStorage("hasToken", "true");

    await startSync(
      authResponse.data.accessToken ?? "",
      String(authResponse.data.user.id)
    );
    await syncService.start();

    return authResponse.data.user;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    syncLogger.info(LogCategory.AUTH, "Logging out user");

    // Clear all tokens from secure storage
    await secureStorage.clearTokens();

    // Clear flags from localStorage
    removeLocalStorage("hasToken");

    // Remove user data from repository
    await usersRepository.logoutAllUsers();

    // Stop the sync service
    await syncService.stop();

    syncLogger.info(LogCategory.AUTH, "User logged out successfully");
  } catch (error) {
    syncLogger.error(
      LogCategory.AUTH,
      "Error during logout",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set offline mode flag
    setOfflineMode: (state, action) => {
      state.offlineMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.initialized = true;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload as User;
      })
      .addCase(initAuth.rejected, (state) => {
        state.initialized = true;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(initAuth.pending, (state) => {
        state.initialized = false;
        state.loading = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.initialized = false;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state) => {
        state.initialized = true;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.pending, (state) => {
        state.initialized = true;
        state.loading = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.initialized = true;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload as User;
      })
      .addCase(login.rejected, (state) => {
        state.initialized = true;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.initialized = true;
        state.loading = true;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;

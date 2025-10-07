import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { drizzleDb } from "../db";
import { users } from "../db/schemas";
import {
  login as apiLogin,
  AuthResponse,
  getMe,
  LoginCredentials,
} from "../features/auth/api/auth";
import {
  dbTokenStorage,
  TokenType,
} from "../features/auth/services/db-token-storage";
import { usersRepository } from "../features/users/repositories/users.repository";
import { removeLocalStorage, setLocalStorage } from "../utils/storage";

/**
 * User model interface
 */
interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  storeId?: string;
  tenantId?: string;
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
      console.log("initAuth");
      const allUsers = await drizzleDb.select().from(users);
      console.log("allUsers", allUsers);
      const currentLoggedInUser = await usersRepository.getLoggedInUser();

      console.log("currentLoggedInUser", currentLoggedInUser);
      // Get USER token from database (not POS token)
      const tokenResult = await dbTokenStorage.getToken(
        "accessToken",
        TokenType.USER
      );
      let token = typeof tokenResult === "string" ? tokenResult : null;

      // Update offline mode status
      const isNetworkOnline = true;
      dispatch(authSlice.actions.setOfflineMode(!isNetworkOnline));

      // CRITICAL FIX: If we have a logged in user in the database, use it regardless
      // This ensures users stay logged in when refreshing the app
      if (currentLoggedInUser) {
        // If we have a user but no token, try to get it from the user object
        if (!token && currentLoggedInUser.accessToken) {
          token = currentLoggedInUser.accessToken;
          // Save it to database for future use
          await dbTokenStorage.storeToken("accessToken", token, TokenType.USER);
        }

        // If we have a user, consider them authenticated even without a token in offline mode
        if (!isNetworkOnline || !token) {
          // Return the cached user without sensitive data
          const userToReturn = { ...currentLoggedInUser };
          delete userToReturn.hashedPassword;
          delete userToReturn.accessToken;
          delete userToReturn.refreshToken;
          delete userToReturn.lastLoginAt;

          return userToReturn;
        }

        // If we're online and have a token, try to get updated user data
        if (isNetworkOnline && token) {
          try {
            // HttpClient will automatically refresh the token if needed on 401
            const user = await getMe();

            if (!user.error && user.data) {
              await usersRepository.upsertUser(
                user.data as Partial<AuthResponse["user"]>,
                token,
                currentLoggedInUser?.refreshToken ?? undefined
              );

              const userToReturn = { ...user.data.user };
              delete userToReturn.hashedPassword;
              delete userToReturn.accessToken;
              delete userToReturn.refreshToken;
              delete userToReturn.lastLoginAt;

              return userToReturn;
            }
          } catch (refreshError) {
            // If getMe fails, continue to use cached user
            console.warn("Failed to refresh user data:", refreshError);
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
      throw error;
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials) => {
    const authResponse = await apiLogin(credentials);

    const isOfflineMode = Boolean(authResponse?.error?.isNetworkError);

    if (isOfflineMode) {
      const user = await usersRepository.findUserByUsername(
        credentials.username
      );

      if (!user) {
        throw new Error("User not found");
      }

      if (user.hashedPassword !== credentials.password) {
        throw new Error("Invalid password");
      }

      await usersRepository.setLoggedInUser(user.id);
      // Store USER tokens in database
      await dbTokenStorage.storeToken(
        "accessToken",
        user.accessToken ?? "",
        TokenType.USER
      );

      await dbTokenStorage.storeToken(
        "refreshToken",
        user.refreshToken ?? "",
        TokenType.USER
      );

      // Keep minimal token info in localStorage for quick UI rendering
      setLocalStorage("hasToken", "true");

      return user;
    }

    if (authResponse.error || !authResponse.data) {
      throw authResponse.error;
    }

    await usersRepository.upsertUser(
      {
        ...authResponse.data.user,
        hashedPassword: credentials.password,
      },
      authResponse.data.accessToken,
      authResponse.data.refreshToken
    );

    await usersRepository.setLoggedInUser(authResponse.data.user.id);

    // Store USER tokens in database
    await dbTokenStorage.storeToken(
      "accessToken",
      authResponse.data.accessToken,
      TokenType.USER
    );
    await dbTokenStorage.storeToken(
      "refreshToken",
      authResponse.data.refreshToken,
      TokenType.USER
    );

    // Keep minimal token info in localStorage for quick UI rendering
    setLocalStorage("hasToken", "true");

    return authResponse.data.user;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    console.info("Logging out user");

    // Clear only USER tokens from database (keep POS tokens for device pairing)
    await dbTokenStorage.clearTokens(TokenType.USER);

    // Clear flags from localStorage
    removeLocalStorage("hasToken");

    // Remove user data from repository
    await usersRepository.logoutAllUsers();

    console.info("User logged out successfully");
  } catch (error) {
    console.error("Error during logout", error);
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

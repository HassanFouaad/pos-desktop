import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { container } from "tsyringe";
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
import { UsersRepository } from "../features/users/repositories/users.repository";
import { removeLocalStorage, setLocalStorage } from "../utils/storage";

const usersRepository = container.resolve(UsersRepository);

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

/**
 * Initialize authentication on app startup
 * 1. Check for logged-in user in local database
 * 2. Attempt to refresh user data from API (if online and token available)
 * 3. Fall back to cached user data if refresh fails (but only for network errors)
 * 4. If no user found or token invalid, throw error to trigger login flow
 */
export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { dispatch }) => {
    // Step 1: Get logged-in user from database
    const currentLoggedInUser = await usersRepository.getLoggedInUser();

    if (!currentLoggedInUser) {
      throw new Error("No logged in user found");
    }

    // Step 2: Ensure we have an access token
    const tokenResult = await dbTokenStorage.getToken(
      "accessToken",
      TokenType.USER
    );
    let token = typeof tokenResult === "string" ? tokenResult : null;

    // If no token in storage but user has it, restore it
    if (!token && currentLoggedInUser.accessToken) {
      token = currentLoggedInUser.accessToken;
      await dbTokenStorage.storeToken("accessToken", token, TokenType.USER);
    }

    // Helper to sanitize user data before returning
    const sanitizeUser = (user: any) => {
      const sanitized = { ...user };
      delete sanitized.hashedPassword;
      delete sanitized.accessToken;
      delete sanitized.refreshToken;
      delete sanitized.lastLoginAt;
      return sanitized;
    };

    // Step 3: Try to get fresh user data from API
    // httpClient will handle token refresh automatically if needed
    if (token) {
      try {
        const response = await getMe();

        if (response.success && response.data) {
          // Update local user data with fresh data from API
          await usersRepository.upsertUser(
            response.data as Partial<AuthResponse["user"]>,
            token,
            currentLoggedInUser.refreshToken ?? undefined
          );

          console.info("User data refreshed from API");
          return sanitizeUser(response.data.user);
        }

        // If API call failed but it's a network error, use cached user
        if (response.error?.isNetworkError) {
          console.info("Network error refreshing user data, using cached user");
          dispatch(authSlice.actions.setOfflineMode(true));
          return sanitizeUser(currentLoggedInUser);
        }

        // If API call failed due to auth error, httpClient will have:
        // 1. Attempted token refresh
        // 2. Cleared tokens if refresh failed
        // 3. Dispatched logout event
        // So we should throw error to trigger login flow
        throw new Error("Failed to authenticate user");
      } catch (error) {
        // Check if this is a network error or auth error
        // Network errors: keep user logged in with cached data
        // Auth errors: throw to trigger login flow
        if (
          error instanceof Error &&
          error.message !== "Failed to authenticate user"
        ) {
          console.info("Using cached user data due to temporary error");
          dispatch(authSlice.actions.setOfflineMode(true));
          return sanitizeUser(currentLoggedInUser);
        }

        throw error;
      }
    }

    // Step 4: No token available - return cached user for offline mode
    console.info("No token available, using cached user in offline mode");
    dispatch(authSlice.actions.setOfflineMode(true));
    return sanitizeUser(currentLoggedInUser);
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

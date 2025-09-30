import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import httpClient from "../api";
import { startSync } from "../db/database";
import { syncService } from "../db/sync/sync.service";
import {
  login as apiLogin,
  AuthResponse,
  getMe,
  LoginCredentials,
} from "../features/auth/api/auth";
import { usersRepository } from "../features/users/repositories/users.repository";
import { networkStatus } from "../utils/network-status";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../utils/storage";

// TODO: Define a proper user type
type User = any;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  initialized: false,
};

export const initAuth = createAsyncThunk("auth/init", async () => {
  const currentLoggedInUser = await usersRepository.getLoggedInUser();
  let token = getLocalStorage("accessToken");

  if (!currentLoggedInUser || !token) {
    throw new Error("Failed to fetch the user");
  }

  const isOnline = networkStatus.isNetworkOnline();

  if (!isOnline) {
    await startSync(token, String(currentLoggedInUser?.id));

    await syncService.start();

    return currentLoggedInUser;
  }

  const newToken = await httpClient.refreshToken();

  if (newToken) {
    token = newToken;
  }

  const user = await getMe();

  if (user.error || !user.data) {
    if (user.error?.code !== "NETWORK_ERROR") {
      throw user.error;
    }

    await startSync(token, String(currentLoggedInUser?.id));

    await syncService.start();

    await usersRepository.upsertUser(
      currentLoggedInUser as Partial<AuthResponse["user"]>,
      token
    );

    return currentLoggedInUser;
  }

  await startSync(token, String(currentLoggedInUser?.id));
  await syncService.start();
  return user.data;
});

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials) => {
    const isOnline = navigator?.onLine;

    if (!isOnline) {
      const user = await usersRepository.findUserByUsername(
        credentials.username
      );

      if (!user) {
        throw new Error("User not found");
      }

      if (user.hashedPassword !== credentials.password) {
        throw new Error("Invalid password");
      }

      setLocalStorage("accessToken", user.accessToken);
      setLocalStorage("refreshToken", user.refreshToken);

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

    setLocalStorage("accessToken", authResponse.data.accessToken);
    setLocalStorage("refreshToken", authResponse.data.refreshToken);

    return authResponse.data.user;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await usersRepository.logoutAllUsers();
  removeLocalStorage("accessToken");
  removeLocalStorage("refreshToken");
  await syncService.stop();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.initialized = true;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
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
        state.user = action.payload;
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

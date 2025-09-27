import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { startSync } from "../db/database";
import { syncService } from "../db/sync/sync.service";
import { authService } from "../features/auth/services/auth.service";
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
  const persistedUser = await authService.getPersistedUser();

  await startSync(String(persistedUser?.id));
  await syncService.start();
  return persistedUser;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
      state.initialized = true;
    },

    logout: (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
    },

    initAuth: (state) => {
      state.initialized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.initialized = true;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(initAuth.rejected, (state) => {
        state.initialized = false;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(initAuth.pending, (state) => {
        state.initialized = false;
        state.loading = true;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

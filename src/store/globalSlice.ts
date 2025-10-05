import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  secureStorage,
  TokenType,
} from "../features/auth/services/secure-storage";
import { getLocalStorage, setLocalStorage } from "../utils/storage";

export type ThemeMode = "light" | "dark";

/**
 * Device pairing state interface
 */
export interface DevicePairingState {
  isPaired: boolean;
  posDeviceId: string | null;
  posDeviceName: string | null;
  storeId: string | null;
  storeName: string | null;
  tenantId: string | null;
  tenantName: string | null;
  lastPairedAt: Date | null;
  pairingCheckComplete: boolean;
}

export interface GlobalState {
  theme: {
    mode: ThemeMode;
  };
  pairing: DevicePairingState;
}

const initialState: GlobalState = {
  theme: {
    // Initialize from localStorage or default to light
    mode: (getLocalStorage("theme") as ThemeMode) || "light",
  },
  pairing: {
    isPaired: false,
    posDeviceId: null,
    posDeviceName: null,
    storeId: null,
    storeName: null,
    tenantId: null,
    tenantName: null,
    lastPairedAt: null,
    pairingCheckComplete: false,
  },
};

/**
 * Check if device is paired by looking for POS tokens in secure storage
 */
export const checkPairingStatus = createAsyncThunk(
  "global/checkPairingStatus",
  async () => {
    try {
      // Check if POS access token exists in stronghold
      const posAccessToken = await secureStorage.getToken(
        "accessToken",
        TokenType.POS
      );

      if (!posAccessToken) {
        return null; // Not paired
      }

      // Get pairing data from stronghold
      const pairingDataStr = await secureStorage.getToken(
        "pairingData",
        TokenType.POS
      );

      if (!pairingDataStr) {
        return null; // No pairing data found
      }

      const pairingData = JSON.parse(pairingDataStr);
      return pairingData;
    } catch (error) {
      console.error("Failed to check pairing status", error);
      return null;
    }
  }
);

/**
 * Global slice for app-wide settings and state
 * Replaces the need for multiple React contexts
 */
const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newMode = state.theme.mode === "light" ? "dark" : "light";
      // Update localStorage
      setLocalStorage("theme", newMode);
      // Update state
      state.theme.mode = newMode;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      // Update localStorage
      setLocalStorage("theme", action.payload);
      // Update state
      state.theme.mode = action.payload;
    },
    setPairingData: (state, action: PayloadAction<DevicePairingState>) => {
      state.pairing = action.payload;
    },
    clearPairingData: (state) => {
      state.pairing = {
        isPaired: false,
        posDeviceId: null,
        posDeviceName: null,
        storeId: null,
        storeName: null,
        tenantId: null,
        tenantName: null,
        lastPairedAt: null,
        pairingCheckComplete: true,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkPairingStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.pairing = {
            ...action.payload,
            isPaired: true,
            pairingCheckComplete: true,
          };
        } else {
          state.pairing = {
            ...initialState.pairing,
            pairingCheckComplete: true,
          };
        }
      })
      .addCase(checkPairingStatus.rejected, (state) => {
        state.pairing = {
          ...initialState.pairing,
          pairingCheckComplete: true,
        };
      });
  },
});

export const { toggleTheme, setThemeMode, setPairingData, clearPairingData } =
  globalSlice.actions;
export default globalSlice.reducer;

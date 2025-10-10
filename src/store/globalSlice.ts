import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { container } from "tsyringe";
import { ConnectionStatus } from "../db/schemas/pos-devices.schema";
import { PosDeviceRepository } from "../features/auth/repositories/pos-device.repository";
import {
  dbTokenStorage,
  TokenType,
} from "../features/auth/services/db-token-storage";
import { StoresService } from "../features/stores/services";
import { PosDTO, StoreDto, TenantDto } from "../features/stores/types";
import { getLocalStorage, setLocalStorage } from "../utils/storage";

export type ThemeMode = "light" | "dark";

/**
 * Device pairing state interface
 */
export interface DevicePairingState {
  isPaired: boolean;
  isLoading: boolean;
  posDeviceName: string | null;
  storeId: string | null;
  storeName: string | null;
  storeCode: string | null;
  tenantId: string | null;
  tenantName: string | null;
  lastPairedAt: string | null;
  pairingCheckComplete: boolean;
}

export interface GlobalState {
  theme: {
    mode: ThemeMode;
  };
  pairing: DevicePairingState;
  store: StoreDto | null;
  tenant: TenantDto | null;
  pos: PosDTO | null;
  connectionStatus: ConnectionStatus;
}

const storesService = container.resolve(StoresService);
const posDeviceRepository = container.resolve(PosDeviceRepository);

const initialState: GlobalState = {
  theme: {
    // Initialize from localStorage or default to light
    mode: (getLocalStorage("theme") as ThemeMode) || "dark",
  },

  pairing: {
    isPaired: false,
    posDeviceName: null,
    storeId: null,
    storeName: null,
    storeCode: null,
    tenantId: null,
    tenantName: null,
    lastPairedAt: null,
    pairingCheckComplete: false,
    isLoading: false,
  },
  pos: null,
  store: null,
  tenant: null,
  connectionStatus: "offline",
};

/**
 * Check if device is paired by looking for POS tokens in database
 * Fetches all pairing-related data in one optimized call
 */
export const checkPairingStatus = createAsyncThunk(
  "global/checkPairingStatus",
  async () => {
    try {
      // Step 1: Check if POS access token exists
      const posAccessTokenResult = await dbTokenStorage.getToken(
        "accessToken",
        TokenType.POS
      );

      const posAccessToken =
        typeof posAccessTokenResult === "string" ? posAccessTokenResult : null;

      if (!posAccessToken) {
        console.info("No POS access token found, device not paired");
        return {
          store: null,
          pairing: null,
          tenant: null,
          pos: null,
          connectionStatus: "offline" as ConnectionStatus,
        };
      }

      // Step 2: Get pairing data from database
      const pairingDataResult = await dbTokenStorage.getToken(
        "pairingData",
        TokenType.POS
      );

      if (!pairingDataResult) {
        console.warn("POS token exists but no pairing data found");
        return {
          store: null,
          pairing: null,
          tenant: null,
          pos: null,
          connectionStatus: "offline" as ConnectionStatus,
        };
      }

      const pairingData =
        typeof pairingDataResult === "string"
          ? JSON.parse(pairingDataResult)
          : pairingDataResult;

      // Step 3: Fetch all device data in parallel including connection status
      const [pos, store, tenant, connectionStatus] = await Promise.all([
        storesService.getCurrentPos(),
        storesService.getCurrentStore(),
        storesService.getCurrentTenant(),
        posDeviceRepository.getConnectionStatus(),
      ]);

      // Helper to normalize date fields
      const normalizeDates = <T extends { createdAt?: any; updatedAt?: any }>(
        obj: T | null
      ): T | null => {
        if (!obj) return null;
        return {
          ...obj,
          createdAt: obj.createdAt
            ? (new Date(obj.createdAt).toISOString() as any)
            : undefined,
          updatedAt: obj.updatedAt
            ? (new Date(obj.updatedAt).toISOString() as any)
            : undefined,
        };
      };

      console.info("Pairing status checked successfully");

      return {
        store: normalizeDates(store),
        pairing: pairingData,
        pos: normalizeDates(pos),
        tenant: normalizeDates(tenant),
        connectionStatus,
      };
    } catch (error) {
      console.error("Failed to check pairing status", error);
      // Return null to indicate failure (will be handled in reducer)
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

    setStore: (state, action: PayloadAction<StoreDto>) => {
      state.store = action.payload;
    },

    setPos: (state, action: PayloadAction<PosDTO>) => {
      state.pos = action.payload;
    },

    setTenant: (state, action: PayloadAction<TenantDto>) => {
      state.tenant = action.payload;
    },

    setPairingData: (state, action: PayloadAction<DevicePairingState>) => {
      state.pairing = {
        ...action.payload,
        lastPairedAt: new Date(
          action.payload?.lastPairedAt ?? new Date()
        ).toISOString(),
      };
    },
    clearPairingData: (state) => {
      state.pairing = {
        isPaired: false,
        posDeviceName: null,
        storeId: null,
        storeName: null,
        storeCode: null,
        tenantId: null,
        tenantName: null,
        lastPairedAt: null,
        pairingCheckComplete: true,
        isLoading: false,
      };
    },
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkPairingStatus.fulfilled, (state, action) => {
        const { store, pos, tenant, pairing, connectionStatus } =
          action.payload || {};

        if (store) {
          state.store = store;
        }

        if (tenant) {
          state.tenant = tenant;
        }

        if (pos) {
          state.pos = pos;
        }

        if (connectionStatus) {
          state.connectionStatus = connectionStatus;
        }

        if (pairing) {
          state.pairing = {
            ...(action.payload?.pairing ?? initialState.pairing),
            lastPairedAt: new Date().toISOString(),
            isPaired: true,
            pairingCheckComplete: true,
            isLoading: false,
          };
        } else {
          state.pairing = {
            ...initialState.pairing,
            isPaired: false,
            pairingCheckComplete: true,
            isLoading: false,
          };
        }
      })
      .addCase(checkPairingStatus.rejected, (state) => {
        state.pairing = {
          ...initialState.pairing,
          isPaired: false,
          pairingCheckComplete: true,
          isLoading: false,
        };
      });
  },
});

export const {
  toggleTheme,
  setThemeMode,
  setPairingData,
  clearPairingData,
  setPos,
  setStore,
  setTenant,
  setConnectionStatus,
} = globalSlice.actions;
export default globalSlice.reducer;

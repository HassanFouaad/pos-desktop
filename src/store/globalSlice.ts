import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { container } from "tsyringe";
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
  posDeviceId: string | null;
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
}

const storesService = container.resolve(StoresService);

const initialState: GlobalState = {
  theme: {
    // Initialize from localStorage or default to light
    mode: (getLocalStorage("theme") as ThemeMode) || "dark",
  },

  pairing: {
    isPaired: false,
    posDeviceId: null,
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
};

/**
 * Check if device is paired by looking for POS tokens in database
 */
export const checkPairingStatus = createAsyncThunk(
  "global/checkPairingStatus",
  async () => {
    try {
      // Check if POS access token exists in database
      const posAccessTokenResult = await dbTokenStorage.getToken(
        "accessToken",
        TokenType.POS
      );

      const posAccessToken =
        typeof posAccessTokenResult === "string" ? posAccessTokenResult : null;

      if (!posAccessToken) {
        return {
          store: null,
          pairing: null,
          tenant: null,
          pos: null,
        };
      }

      // Get pairing data from database
      const pairingDataResult = await dbTokenStorage.getToken(
        "pairingData",
        TokenType.POS
      );

      if (!pairingDataResult) {
        return {
          store: null,
          pairing: null,
          tenant: null,
          pos: null,
        };
      }

      // pairingDataResult is already a Record<string, unknown> if it exists
      const pairingData =
        typeof pairingDataResult === "string"
          ? JSON.parse(pairingDataResult)
          : pairingDataResult;

      const [pos, store, tenant] = await Promise.all([
        storesService.getCurrentPos(),
        storesService.getCurrentStore(),
        storesService.getCurrentTenant(),
      ]);

      if (pos) {
        pos.createdAt = new Date(pos.createdAt).toISOString() as any as Date;
        pos.updatedAt = new Date(pos.updatedAt).toISOString() as any as Date;
      }

      if (store) {
        store.createdAt = new Date(
          store.createdAt
        ).toISOString() as any as Date;
        store.updatedAt = new Date(
          store.updatedAt
        ).toISOString() as any as Date;
      }

      if (tenant) {
        tenant.createdAt = new Date(
          tenant.createdAt
        ).toISOString() as any as Date;
        tenant.updatedAt = new Date(
          tenant.updatedAt
        ).toISOString() as any as Date;
      }

      return {
        store,
        pairing: pairingData,
        pos,
        tenant,
      };
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
        posDeviceId: null,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkPairingStatus.fulfilled, (state, action) => {
        const { store, pos, tenant, pairing } = action.payload || {};

        if (store) {
          state.store = store;
        }

        if (tenant) {
          state.tenant = tenant;
        }

        if (pos) {
          state.pos = pos;
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
} = globalSlice.actions;
export default globalSlice.reducer;

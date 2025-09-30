import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "../utils/storage";

export type ThemeMode = "light" | "dark";

export interface GlobalState {
  theme: {
    mode: ThemeMode;
  };
  // Can be expanded with other global app settings as needed
}

const initialState: GlobalState = {
  theme: {
    // Initialize from localStorage or default to light
    mode: (getLocalStorage("theme") as ThemeMode) || "light",
  },
};

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
  },
});

export const { toggleTheme, setThemeMode } = globalSlice.actions;
export default globalSlice.reducer;

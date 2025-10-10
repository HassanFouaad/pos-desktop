import React from "react";
import ReactDOM from "react-dom/client";
import "reflect-metadata";
import { container } from "tsyringe";
import httpClient from "./api";
import App from "./App";
import "./App.css";
import SyncService from "./features/sync/services/sync";
import { AppProvider } from "./providers/AppProvider";
import { store } from "./store";
import { logout } from "./store/authSlice";
import { clearPairingData } from "./store/globalSlice";

// Import Inter font with multiple weights for better typography
import "@fontsource/inter/300.css"; // Light
import "@fontsource/inter/400.css"; // Regular
import "@fontsource/inter/500.css"; // Medium
import "@fontsource/inter/600.css"; // Semi-bold
import "@fontsource/inter/700.css"; // Bold
import "@fontsource/inter/800.css"; // Extra-bold

// Initialize PowerSync
await container.resolve(SyncService).init();

/**
 * Set up httpClient auth event listener to sync with Redux state
 * This ensures the app state stays in sync when tokens are cleared
 */
httpClient.onAuthStateChange((event) => {
  console.info("Auth state change event:", event);

  if (event.type === "USER_LOGOUT") {
    // User was logged out due to token expiry/invalidity
    // Dispatch logout action to update Redux state
    store.dispatch(logout());
  } else if (event.type === "POS_UNPAIRED") {
    // POS device was unpaired due to token expiry/invalidity
    // Clear pairing data and logout user
    store.dispatch(clearPairingData());
    store.dispatch(logout());
  }
});

/**
 * Application entry point
 * Wraps the main App component with StrictMode for development checks
 * and AppProvider for global context/state management
 */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

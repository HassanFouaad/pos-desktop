import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { AppProvider } from "./providers/AppProvider";
import { store } from "./store";
import { initSyncMonitoring } from "./store/syncSlice";
// Import customer sync handler to register it
import "./features/customers/services/customer-sync-handler";

/**
 * Application entry point
 * Wraps the main App component with StrictMode for development checks
 * and AppProvider for global context/state management
 */

// Initialize sync monitoring
store.dispatch(initSyncMonitoring());
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

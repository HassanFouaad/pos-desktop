import React from "react";
import ReactDOM from "react-dom/client";
import "reflect-metadata";
import { container } from "tsyringe";
import App from "./App";
import "./App.css";
import SyncService from "./features/sync/services/sync";
import { AppProvider } from "./providers/AppProvider";

await container.resolve(SyncService).init();
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

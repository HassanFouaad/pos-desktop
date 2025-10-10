import React from "react";
import ReactDOM from "react-dom/client";
import "reflect-metadata";
import { container } from "tsyringe";
import App from "./App";
import "./App.css";
import SyncService from "./features/sync/services/sync";
import { AppProvider } from "./providers/AppProvider";

// Import Inter font with multiple weights for better typography
import "@fontsource/inter/300.css"; // Light
import "@fontsource/inter/400.css"; // Regular
import "@fontsource/inter/500.css"; // Medium
import "@fontsource/inter/600.css"; // Semi-bold
import "@fontsource/inter/700.css"; // Bold
import "@fontsource/inter/800.css"; // Extra-bold

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

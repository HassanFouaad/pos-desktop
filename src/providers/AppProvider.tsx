import { PGliteProvider } from "@electric-sql/pglite-react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import { database } from "../db/database";
import { RootState, store } from "../store";
import createResponsiveTheme from "../theme";

interface AppProviderProps {
  children: ReactNode;
}

/**
 * ThemeWrapper component that gets theme from Redux and configures Material UI
 */
const ThemeWrapper = ({ children }: { children: ReactNode }) => {
  // Get theme mode from Redux store
  const { mode } = useSelector((state: RootState) => state.global.theme);

  // Create Material UI theme based on current mode
  const theme = createResponsiveTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

/**
 * AppProvider serves as the root provider for the application
 * Uses Redux for global state and theme management instead of React Context
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <ReduxProvider store={store}>
      <ThemeWrapper>
        <PGliteProvider db={database}>{children}</PGliteProvider>
      </ThemeWrapper>
    </ReduxProvider>
  );
}

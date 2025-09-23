import { CssBaseline, ThemeProvider as MUIThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import theme from "../theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

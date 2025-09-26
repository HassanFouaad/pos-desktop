import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import createResponsiveTheme from "../../theme";

export const ThemeProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { mode } = useContext(ThemeContext);
  const theme = createResponsiveTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

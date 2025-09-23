import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: "#red",
    },
    background: {
      default: "#fff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minWidth: "96px",
          minHeight: "48px",
          padding: "12px 24px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            minHeight: "48px",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: "48px",
          height: "48px",
        },
      },
    },
  },
});

export default theme;

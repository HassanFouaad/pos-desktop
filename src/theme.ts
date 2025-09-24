import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";

// Define the base theme
const baseTheme = createTheme({
  palette: {
    primary: {
      main: "#3a36db", // Slightly more vibrant blue
      light: "#6c63ff",
      dark: "#2a28a8",
    },
    secondary: {
      main: "#00b894", // Fresh mint green
      light: "#55efc4",
      dark: "#00856a",
    },
    error: {
      main: "#ff5252", // Bright red
    },
    warning: {
      main: "#ffa726", // Orange
    },
    success: {
      main: "#00c853", // Green
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#212529",
      secondary: "#495057",
    },
  },
  shape: {
    borderRadius: 12, // Larger border radius for touch-friendly UI
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.6rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.4rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.9rem',
    },
    button: {
      textTransform: 'none', // No uppercase for buttons
      fontWeight: 500,
    },
  },
  spacing: 8, // Base spacing unit
});

// Create a touch-optimized theme by extending the base theme
const touchTheme = createTheme(deepmerge(baseTheme, {
  components: {
    // Touch-friendly button styles
    MuiButton: {
      styleOverrides: {
        root: {
          minWidth: "100px",
          minHeight: "56px", // Larger touch target (min 48px recommended)
          padding: "12px 24px",
          borderRadius: "12px",
          fontSize: "1rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          textTransform: "none",
          "&:active": {
            transform: "scale(0.98)",
          },
        },
        sizeLarge: {
          minHeight: "64px",
          fontSize: "1.2rem",
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #3a36db 30%, #6c63ff 90%)",
        },
      },
    },
    // Touch-friendly text field styles
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: "16px",
          "& .MuiInputBase-root": {
            minHeight: "56px", // Larger touch target
            fontSize: "1.1rem",
          },
          "& .MuiInputLabel-root": {
            fontSize: "1.1rem",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            "& fieldset": {
              borderWidth: "1px",
            },
          },
        },
      },
    },
    // Touch-friendly icon button styles
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: "56px", // Larger touch target
          height: "56px", // Larger touch target
          borderRadius: "12px",
        },
        sizeLarge: {
          width: "64px",
          height: "64px",
        },
      },
    },
    // Touch-friendly cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        },
      },
    },
    // Touch-friendly list items
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: "16px 24px", // More padding for touch targets
          "&.MuiListItem-dense": {
            padding: "12px 24px",
          },
        },
      },
    },
    // Touch-friendly table cells
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "16px 24px", // Larger cells for touch
          fontSize: "1rem",
        },
        head: {
          fontWeight: 600,
        },
      },
    },
    // Touch-friendly checkboxes and radio buttons
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "12px", // Larger touch target
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: "12px", // Larger touch target
        },
      },
    },
    // Touch-friendly tabs
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: "56px",
          fontSize: "1rem",
          textTransform: "none",
          fontWeight: 500,
          "&.Mui-selected": {
            fontWeight: 700,
          },
        },
      },
    },
    // Touch-friendly dialogs
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          padding: "16px",
        },
      },
    },
    // Touch-friendly switches
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: "58px",
          height: "38px",
          padding: "12px",
        },
        thumb: {
          width: "20px",
          height: "20px",
        },
        track: {
          borderRadius: "20px",
        },
      },
    },
  },
}));

// Make fonts responsive based on screen size
const theme = responsiveFontSizes(touchTheme);

export default theme;

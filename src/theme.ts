import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material/styles";


// Define the color palettes for light and dark themes
const lightPalette = {
  primary: {
    main: "#3a36db",
    light: "#6c63ff",
    dark: "#2a28a8",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#00b894",
    light: "#55efc4",
    dark: "#00856a",
    contrastText: "#ffffff",
  },
  background: {
    default: "#f8f9fa",
    paper: "#ffffff",
  },
  text: {
    primary: "#212529",
    secondary: "#495057",
  },
  action: {
    hover: 'rgba(58, 54, 219, 0.08)', // Light primary hover for light theme
    disabled: 'rgba(0, 0, 0, 0.26)',
  },
};

const darkPalette = {
  primary: {
    main: "#6c63ff",
    light: "#8a84ff",
    dark: "#3a36db",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#55efc4",
    light: "#8afff7",
    dark: "#00b894",
    contrastText: "#000000",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#e0e0e0",
    secondary: "#a0a0a0",
  },
  action: {
    hover: 'rgba(108, 99, 255, 0.12)', // Lighter primary hover for dark theme
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
};

// Function to create the theme based on the mode (light/dark)
export const getTheme = (mode: 'light' | 'dark'): ThemeOptions => {
  const palette = mode === 'light' ? lightPalette : darkPalette;

  return {
    palette: {
      mode,
      ...palette,
      error: {
        main: "#ff5252",
      },
      warning: {
        main: "#ffa726",
      },
      success: {
        main: "#00c853",
      },
      action: palette.action,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 700 },
      h2: { fontSize: '2.2rem', fontWeight: 700 },
      h3: { fontSize: '1.8rem', fontWeight: 600 },
      h4: { fontSize: '1.6rem', fontWeight: 600 },
      h5: { fontSize: '1.4rem', fontWeight: 500 },
      h6: { fontSize: '1.2rem', fontWeight: 500 },
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.9rem' },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    spacing: 8,
    components: {
      // Flatten all Paper components
      MuiPaper: {
        styleOverrides: {
          root: {
            elevation: 0,
            boxShadow: "none",
            border: "none",
            backgroundImage: "none", // Ensure no gradient backgrounds are inherited
          },
        },
      },
      // Modern, unified button styles
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minWidth: "100px",
            minHeight: "56px",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "1rem",
            textTransform: "none",
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          containedPrimary: {
            color: palette.primary.contrastText,
            "& .MuiSvgIcon-root": {
              color: palette.primary.contrastText,
            },
          },
          text: {
            color: palette.text.secondary,
            "& .MuiSvgIcon-root": {
              color: palette.text.secondary,
            },
          },
          textPrimary: {
            color: palette.primary.main,
            "& .MuiSvgIcon-root": {
              color: palette.primary.main,
            },
          }
        },
      },
      // Unified icon button styles (no circles)
      MuiIconButton: {
        styleOverrides: {
          root: {
            width: "56px",
            height: "56px",
            borderRadius: "12px", // Same as regular buttons
            color: palette.text.secondary,
            "&.Mui-disabled": {
              color: palette.action?.disabled,
            },
            "&:hover": {
              backgroundColor: palette.action?.hover,
            },
          },
          colorPrimary: {
            color: palette.primary.main,
            "&:hover": {
              backgroundColor: palette.action.hover,
            },
          },
        },
      },
      // Flatten cards
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            boxShadow: "none",
            backgroundColor: 'transparent',
          },
        },
      },
      // AppBar should be flat
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            backgroundImage: "none",
            backgroundColor: palette.background.default, // Blends in with background
            color: palette.text.primary
          },
        },
      },
      // Touch-friendly text field styles
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              minHeight: "56px",
              fontSize: "1.1rem",
              borderRadius: "12px",
            },
            "& .MuiInputLabel-root": {
              fontSize: "1.1rem",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderWidth: "1px",
              },
            },
          },
        },
      },
      // Other components...
      MuiListItem: {
        styleOverrides: {
          root: {
            padding: "16px 24px",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "16px 24px",
            fontSize: "1rem",
          },
          head: {
            fontWeight: 600,
          },
        },
      },
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
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "20px",
            padding: "16px",
          },
        },
      },
    },
  };
};

// Create a default theme and allow font size responsiveness
const createResponsiveTheme = (mode: 'light' | 'dark') => {
  const themeOptions = getTheme(mode);
  let theme = createTheme(themeOptions);
  theme = responsiveFontSizes(theme);
  return theme;
}

export default createResponsiveTheme;

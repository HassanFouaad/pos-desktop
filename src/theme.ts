import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from "@mui/material/styles";

// Define the color palettes for light and dark themes
// More vibrant colors for modern digital UI
const lightPalette = {
  primary: {
    main: "#0062FF", // Modern blue
    light: "#4D8DFF",
    dark: "#004FC7",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#00D68F", // Vibrant green
    light: "#33DFAA",
    dark: "#00A86F",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#F7FAFC", // Lighter background for better visibility
    paper: "#FFFFFF",
  },
  text: {
    primary: "#0A1F44", // Darker text for better contrast
    secondary: "#4E5D78",
  },
  action: {
    active: "#0062FF",
    hover: "rgba(0, 98, 255, 0.08)",
    selected: "rgba(0, 98, 255, 0.16)",
    disabled: "rgba(10, 31, 68, 0.38)",
    disabledBackground: "rgba(10, 31, 68, 0.12)",
  },
};

const darkPalette = {
  primary: {
    main: "#4D8DFF", // Lighter blue for dark mode
    light: "#80ADFF",
    dark: "#0062FF",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#33DFAA", // Lighter green for dark mode
    light: "#5FE7BE",
    dark: "#00D68F",
    contrastText: "#000000",
  },
  background: {
    default: "#121826", // Dark blue-gray for less eye strain
    paper: "#1C2433",
  },
  text: {
    primary: "#F2F6FF", // Light text for dark mode
    secondary: "#A6B1C2",
  },
  action: {
    active: "#4D8DFF",
    hover: "rgba(77, 141, 255, 0.12)",
    selected: "rgba(77, 141, 255, 0.20)",
    disabled: "rgba(242, 246, 255, 0.38)",
    disabledBackground: "rgba(242, 246, 255, 0.12)",
  },
};

// Function to create the theme based on the mode (light/dark)
export const getTheme = (mode: "light" | "dark"): ThemeOptions => {
  const palette = mode === "light" ? lightPalette : darkPalette;

  return {
    palette: {
      mode,
      ...palette,
      error: {
        main: "#FF3D71", // Modern red
        light: "#FF708D",
        dark: "#DB2C66",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: "#FFAA00", // Modern orange
        light: "#FFBE33",
        dark: "#DB9100",
        contrastText: "#FFFFFF",
      },
      success: {
        main: "#00D68F", // Modern green
        light: "#33DFAA",
        dark: "#00A86F",
        contrastText: "#FFFFFF",
      },
      info: {
        main: "#0095FF", // Modern blue
        light: "#33AAFF",
        dark: "#0077DB",
        contrastText: "#FFFFFF",
      },
    },
    shape: {
      borderRadius: 16, // Larger border radius for modern look
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.2 },
      h3: { fontSize: "1.875rem", fontWeight: 600, lineHeight: 1.2 },
      h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3 },
      h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.4 },
      h6: { fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.4 },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.6 },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    spacing: 8,
    components: {
      // Eliminate all elevation and shadow for flat design
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      // Touch-optimized Button
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minWidth: "120px",
            minHeight: "56px",
            fontSize: "1rem",
            borderRadius: "12px",
            padding: "12px 24px",
            fontWeight: 600,
            textTransform: "none",
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          contained: {
            "&:hover": {
              boxShadow: "none",
            },
          },
          containedPrimary: {
            boxShadow: "none",
          },
          containedSecondary: {
            boxShadow: "none",
          },
          text: {
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(0, 98, 255, 0.08)"
                  : "rgba(77, 141, 255, 0.12)",
            },
          },
          outlined: {
            borderWidth: "2px",
            "&:hover": {
              borderWidth: "2px",
            },
          },
        },
      },
      // Touch-friendly text fields
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              minHeight: "56px",
              fontSize: "1rem",
              borderRadius: "12px",
            },
            "& .MuiInputLabel-root": {
              fontSize: "1rem",
              fontWeight: 500,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor:
                mode === "light"
                  ? "rgba(10, 31, 68, 0.2)"
                  : "rgba(242, 246, 255, 0.2)",
            },
          },
        },
      },
      // Flat, touch-friendly cards
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: palette.background.paper,
            transition: "transform 0.2s ease-in-out",
          },
        },
      },
      // Enhanced Grid for touch layouts
      MuiGrid: {
        styleOverrides: {
          root: {
            // No custom styles needed as we'll use the Grid properly
          },
        },
      },
      // Touch-friendly tab indicators
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: "1.5px",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: "56px",
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            "&:active": {
              opacity: 0.8,
            },
            "&.Mui-selected": {
              color: palette.primary.main,
            },
          },
        },
      },
      // Touch-friendly list items
      MuiListItem: {
        styleOverrides: {
          root: {
            minHeight: "56px",
            padding: "12px 16px",
            "&:active": {
              backgroundColor:
                mode === "light"
                  ? "rgba(0, 98, 255, 0.08)"
                  : "rgba(77, 141, 255, 0.12)",
            },
          },
        },
      },
      // Modern dialogs with rounded corners
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "20px",
            padding: "16px",
            boxShadow: "none",
          },
        },
      },
      // Touch-optimized floating action button
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            "&:active": {
              boxShadow: "none",
              transform: "scale(0.98)",
            },
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
    },
  };
};

// Create a default theme and allow font size responsiveness
const createResponsiveTheme = (mode: Partial<"light" | "dark">) => {
  const themeOptions = getTheme(mode);
  let theme = createTheme(themeOptions);
  theme = responsiveFontSizes(theme);
  return theme;
};

export default createResponsiveTheme;

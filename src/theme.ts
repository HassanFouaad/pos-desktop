import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from "@mui/material/styles";
import { getComponents } from "./theme/components";
import { darkPalette, lightPalette } from "./theme/palette";
import "./theme/types"; // Import type augmentations

// Function to create the theme based on the mode (light/dark)
export const getTheme = (mode: "light" | "dark"): ThemeOptions => {
  const palette = mode === "light" ? lightPalette : darkPalette;

  return {
    palette,
    shape: {
      borderRadius: 16, // Default border radius for modern look
    },
    customShape: {
      borderRadiusSmall: 8,
      borderRadiusMedium: 12,
      borderRadiusLarge: 16,
      borderRadiusXLarge: 20,
    },
    touchTarget: {
      minimum: 44, // WCAG minimum touch target size
      comfortable: 56, // Comfortable touch target size for POS
      large: 72, // Large touch target size for primary actions
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontSize: "2.5rem",
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: "2.25rem",
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontSize: "1.875rem",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "0em",
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
        letterSpacing: "0.01em",
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.6,
        letterSpacing: "0.01em",
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: "0.02em",
      },
    },
    spacing: 8,
  };
};

// Create a default theme and allow font size responsiveness
const createResponsiveTheme = (mode: "light" | "dark") => {
  const themeOptions = getTheme(mode);
  let theme = createTheme(themeOptions);
  // Apply component overrides after theme is created (needs access to theme)
  theme = createTheme(theme, {
    components: getComponents(theme),
  });
  theme = responsiveFontSizes(theme);
  return theme;
};

export default createResponsiveTheme;

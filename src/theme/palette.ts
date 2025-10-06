import { PaletteOptions } from "@mui/material/styles";

// Helper function to create alpha variants
const createAlphaVariants = (baseColor: string) => {
  // Extract RGB values from hex
  const hex = baseColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return {
    alpha8: `rgba(${r}, ${g}, ${b}, 0.08)`,
    alpha12: `rgba(${r}, ${g}, ${b}, 0.12)`,
    alpha16: `rgba(${r}, ${g}, ${b}, 0.16)`,
  };
};

// Light mode palette - Vibrant Digital Design
export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#0066FF", // Electric blue
    light: "#3385FF",
    dark: "#0047B3",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#0066FF"),
  },
  secondary: {
    main: "#00E5A0", // Neon green
    light: "#33EBB3",
    dark: "#00B37D",
    contrastText: "#000000",
    ...createAlphaVariants("#00E5A0"),
  },
  error: {
    main: "#FF4757", // Vibrant red
    light: "#FF6B77",
    dark: "#E6424D",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#FF4757"),
  },
  warning: {
    main: "#FFB800", // Bright amber
    light: "#FFC733",
    dark: "#E6A600",
    contrastText: "#000000",
    ...createAlphaVariants("#FFB800"),
  },
  success: {
    main: "#00E5A0",
    light: "#33EBB3",
    dark: "#00B37D",
    contrastText: "#000000",
    ...createAlphaVariants("#00E5A0"),
  },
  info: {
    main: "#00B8FF", // Cyber blue
    light: "#33C7FF",
    dark: "#00A3E6",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#00B8FF"),
  },
  background: {
    default: "#F8FAFC", // Pure white-blue
    paper: "#FFFFFF",
    section: "#F1F5F9",
    elevated: "#FFFFFF",
    input: "#FFFFFF",
  },
  text: {
    primary: "#0F172A", // Deep slate - high contrast
    secondary: "#475569",
    disabled: "rgba(15, 23, 42, 0.38)",
  },
  divider: "rgba(15, 23, 42, 0.08)",
  action: {
    active: "#0066FF",
    hover: "rgba(0, 102, 255, 0.08)",
    selected: "rgba(0, 102, 255, 0.12)",
    disabled: "rgba(15, 23, 42, 0.38)",
    disabledBackground: "rgba(15, 23, 42, 0.08)",
  },
};

// Dark mode palette - Deep Digital with High Contrast
export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#3B82F6", // Bright blue - neon effect
    light: "#60A5FA",
    dark: "#2563EB",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#3B82F6"),
  },
  secondary: {
    main: "#10B981", // Neon emerald
    light: "#34D399",
    dark: "#059669",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#10B981"),
  },
  error: {
    main: "#EF4444", // Bright red
    light: "#F87171",
    dark: "#DC2626",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#EF4444"),
  },
  warning: {
    main: "#F59E0B", // Bright amber
    light: "#FBBF24",
    dark: "#D97706",
    contrastText: "#000000",
    ...createAlphaVariants("#F59E0B"),
  },
  success: {
    main: "#10B981",
    light: "#34D399",
    dark: "#059669",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#10B981"),
  },
  info: {
    main: "#06B6D4", // Bright cyan
    light: "#22D3EE",
    dark: "#0891B2",
    contrastText: "#FFFFFF",
    ...createAlphaVariants("#06B6D4"),
  },
  background: {
    default: "#0A0E1A", // Deep dark blue-black
    paper: "#0F1623",
    section: "#151B2B",
    elevated: "#1A2233",
    input: "#0F1623",
  },
  text: {
    primary: "#F1F5F9", // Bright white-blue
    secondary: "#94A3B8",
    disabled: "rgba(241, 245, 249, 0.38)",
  },
  divider: "rgba(148, 163, 184, 0.12)",
  action: {
    active: "#3B82F6",
    hover: "rgba(59, 130, 246, 0.15)",
    selected: "rgba(59, 130, 246, 0.25)",
    disabled: "rgba(241, 245, 249, 0.38)",
    disabledBackground: "rgba(241, 245, 249, 0.08)",
  },
};

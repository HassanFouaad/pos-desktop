// Extend the Theme interface to include custom properties
declare module "@mui/material/styles" {
  interface Theme {
    touchTarget: {
      minimum: number;
      comfortable: number;
      large: number;
    };
    customShape: {
      borderRadiusSmall: number;
      borderRadiusMedium: number;
      borderRadiusLarge: number;
      borderRadiusXLarge: number;
    };
  }

  interface ThemeOptions {
    touchTarget?: {
      minimum?: number;
      comfortable?: number;
      large?: number;
    };
    customShape?: {
      borderRadiusSmall?: number;
      borderRadiusMedium?: number;
      borderRadiusLarge?: number;
      borderRadiusXLarge?: number;
    };
  }

  interface TypeBackground {
    section: string;
    elevated: string;
    input: string;
  }

  interface PaletteColor {
    alpha8: string;
    alpha12: string;
    alpha16: string;
  }

  interface SimplePaletteColorOptions {
    alpha8?: string;
    alpha12?: string;
    alpha16?: string;
  }
}

export {};

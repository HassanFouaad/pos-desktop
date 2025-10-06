import { Button, ButtonProps, Grid } from "@mui/material";
import React from "react";

// Extend the ButtonProps to include touch-specific props
export interface TouchButtonProps extends ButtonProps {
  size?: "small" | "medium" | "large";
  gridProps?: {
    size?: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
  };
}

/**
 * Touch-optimized button component
 * All styling is handled by the theme - no custom styling needed
 */
export const TouchButton = React.forwardRef<
  HTMLButtonElement,
  TouchButtonProps
>((props, ref) => {
  const { children, size = "medium", gridProps, ...rest } = props;

  // If gridProps are provided, wrap in Grid component
  if (gridProps) {
    return (
      <Grid {...gridProps}>
        <Button ref={ref} disableElevation size={size} fullWidth {...rest}>
          {children}
        </Button>
      </Grid>
    );
  }

  // Otherwise return just the button
  return (
    <Button ref={ref} disableElevation size={size} {...rest}>
      {children}
    </Button>
  );
});

TouchButton.displayName = "TouchButton";

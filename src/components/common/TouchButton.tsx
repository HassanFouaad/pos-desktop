import { Button, ButtonProps, Grid, useTheme } from "@mui/material";
import React from "react";

// Extend the ButtonProps to include touch-specific props
export interface TouchButtonProps extends ButtonProps {
  size?: "small" | "medium" | "large";
  touchRipple?: boolean;
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

export const TouchButton = React.forwardRef<
  HTMLButtonElement,
  TouchButtonProps
>((props, ref) => {
  const {
    children,
    size = "medium",
    touchRipple = true,
    gridProps,
    sx,
    ...rest
  } = props;

  const theme = useTheme();

  // Size-specific styles
  const sizeStyles = {
    small: {
      fontSize: theme.typography.body2.fontSize,
      padding: theme.spacing(1, 2),
      minWidth: "60px",
      minHeight: "40px",
    },
    medium: {
      fontSize: theme.typography.body1.fontSize,
      padding: theme.spacing(1.5, 3),
      minWidth: "80px",
      minHeight: "56px",
    },
    large: {
      fontSize: theme.typography.h6.fontSize,
      padding: theme.spacing(2, 4),
      minWidth: "120px",
      minHeight: "72px",
    },
  };

  // Common button styles
  const buttonStyles = {
    fontWeight: 600,
    textTransform: "none",
    borderRadius: "12px",
    transition: "transform 0.1s, background-color 0.2s",
    position: "relative",
    overflow: "hidden",
    "&:active": {
      transform: "scale(0.97)",
    },
    "& .MuiTouchRipple-root": {
      opacity: touchRipple ? 0.8 : 0.4,
    },
    ...sizeStyles[size],
    ...sx,
  };

  // If gridProps are provided, wrap in Grid component
  if (gridProps) {
    return (
      <Grid component="div" {...gridProps}>
        <Button
          ref={ref}
          disableElevation
          fullWidth
          sx={buttonStyles as any}
          {...rest}
        >
          {children}
        </Button>
      </Grid>
    );
  }

  // Otherwise return just the button
  return (
    <Button ref={ref} disableElevation sx={buttonStyles as any} {...rest}>
      {children}
    </Button>
  );
});

TouchButton.displayName = "TouchButton";

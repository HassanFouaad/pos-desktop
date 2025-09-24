import { Button, ButtonProps, styled } from "@mui/material";
import React from "react";

// Extend the ButtonProps to include touch-specific props
export interface TouchButtonProps extends ButtonProps {
  size?: "small" | "medium" | "large" | "xlarge";
  rounded?: boolean;
  touchRipple?: boolean;
}

// Create a styled version of Button with touch-friendly styles
const StyledTouchButton = styled(Button, {
  shouldForwardProp: (prop) => 
    !["rounded", "touchRipple"].includes(prop as string),
})<TouchButtonProps>(({ theme, size, rounded, touchRipple }) => ({
  // Base styles for all touch buttons
  minWidth: "80px",
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  transition: "transform 0.1s, background-color 0.2s, box-shadow 0.2s",
  position: "relative",
  overflow: "hidden",

  // Set larger touch targets by default
  padding: theme.spacing(2, 4),
  borderRadius: rounded ? "50px" : theme.spacing(1),

  // Styles for different sizes
  ...(size === "small" && {
    fontSize: theme.typography.body2.fontSize,
    padding: theme.spacing(1, 2),
    minWidth: "60px",
    minHeight: "40px",
  }),
  ...(size === "medium" && {
    fontSize: theme.typography.body1.fontSize,
    padding: theme.spacing(1.5, 3),
    minWidth: "80px",
    minHeight: "56px",
  }),
  ...(size === "large" && {
    fontSize: theme.typography.h6.fontSize,
    padding: theme.spacing(2, 4),
    minWidth: "120px",
    minHeight: "72px",
  }),
  ...(size === "xlarge" && {
    fontSize: theme.typography.h5.fontSize,
    padding: theme.spacing(3, 6),
    minWidth: "160px",
    minHeight: "96px",
  }),

  // Enhanced ripple effect for better touch feedback
  "& .MuiTouchRipple-root": {
    opacity: touchRipple ? 0.8 : 0.4,
  },

  // Slight scale effect when touched (active)
  "&:active": {
    transform: "scale(0.97)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  },
}));

export const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  (props, ref) => {
    const { 
      children, 
      size = "medium", 
      rounded = false,
      touchRipple = true,
      ...rest 
    } = props;

    return (
      <StyledTouchButton
        ref={ref}
        size={size}
        rounded={rounded}
        touchRipple={touchRipple}
        disableElevation
        {...rest}
      >
        {children}
      </StyledTouchButton>
    );
  }
);

TouchButton.displayName = "TouchButton";

import { Components, Theme } from "@mui/material/styles";

export const getComponents = (theme: Theme): Components<Theme> => ({
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

  // Touch-optimized Button with digital polish
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        minWidth: 120,
        minHeight: theme.touchTarget.comfortable,
        fontSize: theme.typography.body1.fontSize,
        borderRadius: theme.customShape.borderRadiusMedium,
        padding: theme.spacing(1.5, 3),
        fontWeight: 600,
        textTransform: "none",
        transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:active": {
          transform: "scale(0.97)",
        },
      },
      contained: {
        "&:hover": {
          boxShadow: "none",
          transform: "translateY(-1px)",
        },
        "&:active": {
          transform: "translateY(0) scale(0.97)",
        },
      },
      containedPrimary: {
        boxShadow: "none",
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : theme.palette.primary.main,
        "&:hover": {
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
              : theme.palette.primary.light,
        },
      },
      containedSecondary: {
        boxShadow: "none",
      },
      containedSuccess: {
        boxShadow: "none",
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
            : theme.palette.success.main,
        color: "#FFFFFF",
        "&:hover": {
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`
              : theme.palette.success.light,
        },
      },
      containedError: {
        boxShadow: "none",
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
            : theme.palette.error.main,
        color: "#FFFFFF",
        "&:hover": {
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`
              : theme.palette.error.light,
        },
      },
      text: {
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      },
      outlined: {
        borderWidth: 2,
        "&:hover": {
          borderWidth: 2,
          backgroundColor: theme.palette.action.hover,
        },
      },
      sizeLarge: {
        minHeight: theme.touchTarget.large,
        fontSize: theme.typography.h6.fontSize,
        padding: theme.spacing(2, 4),
      },
      sizeSmall: {
        minHeight: theme.touchTarget.minimum,
        fontSize: theme.typography.body2.fontSize,
        padding: theme.spacing(1, 2),
        minWidth: 60,
      },
    },
  },

  // Touch-friendly IconButton
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: theme.touchTarget.minimum,
        minHeight: theme.touchTarget.minimum,
        padding: theme.spacing(1),
        borderRadius: theme.customShape.borderRadiusMedium,
        transition: "transform 0.1s, background-color 0.2s",
        "&:active": {
          transform: "scale(0.98)",
        },
      },
      sizeLarge: {
        minWidth: theme.touchTarget.comfortable,
        minHeight: theme.touchTarget.comfortable,
        padding: theme.spacing(1.5),
      },
      sizeSmall: {
        minWidth: 40,
        minHeight: 40,
        padding: theme.spacing(0.75),
      },
    },
  },

  // Touch-friendly digital text fields
  MuiTextField: {
    defaultProps: {
      variant: "outlined",
    },
    styleOverrides: {
      root: {
        "& .MuiInputBase-root": {
          minHeight: theme.touchTarget.comfortable,
          fontSize: theme.typography.body1.fontSize,
          borderRadius: theme.customShape.borderRadiusMedium,
          backgroundColor: theme.palette.background.input,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&.Mui-focused": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "#FFFFFF"
                : theme.palette.background.elevated,
          },
        },
        "& .MuiInputLabel-root": {
          fontSize: theme.typography.body1.fontSize,
          fontWeight: 500,
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderWidth: 2,
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(15, 23, 42, 0.12)"
              : "rgba(148, 163, 184, 0.15)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(0, 102, 255, 0.3)"
              : "rgba(59, 130, 246, 0.4)",
        },
        "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderWidth: 2,
          borderColor: theme.palette.primary.main,
        },
      },
    },
  },

  MuiInputBase: {
    styleOverrides: {
      root: {
        fontSize: theme.typography.body1.fontSize,
      },
      input: {
        padding: theme.spacing(1.5, 2),
        fontSize: theme.typography.body1.fontSize,
      },
    },
  },

  // Flat, touch-friendly cards with glass effect
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: theme.customShape.borderRadiusLarge,
        overflow: "hidden",
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255, 255, 255, 0.7)"
            : theme.palette.background.paper,
        backdropFilter: theme.palette.mode === "light" ? "blur(20px)" : "none",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        border: `1px solid ${theme.palette.divider}`,
        "&:hover": {
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(0, 102, 255, 0.2)"
              : "rgba(59, 130, 246, 0.3)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(255, 255, 255, 0.9)"
              : theme.palette.background.elevated,
        },
      },
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: theme.spacing(2),
        "&:last-child": {
          paddingBottom: theme.spacing(2),
        },
      },
    },
  },

  MuiCardActionArea: {
    styleOverrides: {
      root: {
        "&:active": {
          transform: "scale(0.98)",
        },
      },
    },
  },

  // Container with consistent padding
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        [theme.breakpoints.up("sm")]: {
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3),
        },
      },
    },
  },

  // Touch-friendly digital tab indicators
  MuiTabs: {
    styleOverrides: {
      root: {
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: 1.5,
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
              : theme.palette.primary.main,
        },
      },
      indicator: {
        height: 3,
        borderRadius: 1.5,
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: theme.touchTarget.comfortable,
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 600,
        textTransform: "none",
        padding: theme.spacing(1.5, 2),
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: theme.customShape.borderRadiusSmall,
        marginRight: theme.spacing(0.5),
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
        "&:active": {
          transform: "scale(0.98)",
        },
        "&.Mui-selected": {
          color: theme.palette.primary.main,
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.primary.alpha8
              : "rgba(59, 130, 246, 0.12)",
        },
      },
    },
  },

  // Touch-friendly list items
  MuiListItem: {
    styleOverrides: {
      root: {
        minHeight: theme.touchTarget.comfortable,
        padding: theme.spacing(1.5, 2),
        borderRadius: theme.customShape.borderRadiusMedium,
        "&:active": {
          backgroundColor: theme.palette.action.hover,
        },
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        minHeight: theme.touchTarget.comfortable,
        padding: theme.spacing(1.5, 2),
        borderRadius: theme.customShape.borderRadiusMedium,
        "&:active": {
          backgroundColor: theme.palette.action.hover,
          transform: "scale(0.99)",
        },
      },
    },
  },

  // Modern digital dialogs with rounded corners
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: theme.customShape.borderRadiusXLarge,
        padding: theme.spacing(2),
        boxShadow:
          theme.palette.mode === "light"
            ? "0 20px 60px rgba(0, 0, 0, 0.15)"
            : "0 20px 60px rgba(0, 0, 0, 0.5)",
        backgroundImage: "none",
        border: `1px solid ${theme.palette.divider}`,
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: theme.spacing(3, 3, 2, 3),
        fontSize: theme.typography.h4.fontSize,
        fontWeight: 700,
        color: theme.palette.text.primary,
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: theme.spacing(2, 3),
        color: theme.palette.text.secondary,
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: theme.spacing(2, 3, 3, 3),
        gap: theme.spacing(2),
      },
    },
  },

  // Touch-optimized floating action button
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: "none",
        minWidth: theme.touchTarget.comfortable,
        minHeight: theme.touchTarget.comfortable,
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

  // Speed dial for navigation
  MuiSpeedDial: {
    styleOverrides: {
      fab: {
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
      },
    },
  },

  MuiSpeedDialAction: {
    styleOverrides: {
      fab: {
        boxShadow: "none",
        minWidth: theme.touchTarget.minimum,
        minHeight: theme.touchTarget.minimum,
        "&:hover": {
          boxShadow: "none",
        },
      },
    },
  },

  // Alert styling - Modern Digital
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: theme.customShape.borderRadiusMedium,
        padding: theme.spacing(2),
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 500,
        borderWidth: 2,
        borderStyle: "solid",
      },
      standardError: {
        backgroundColor: theme.palette.error.alpha8,
        color:
          theme.palette.mode === "light"
            ? theme.palette.error.dark
            : theme.palette.error.light,
        borderColor: theme.palette.error.main,
        "& .MuiAlert-icon": {
          color: theme.palette.error.main,
        },
      },
      standardWarning: {
        backgroundColor: theme.palette.warning.alpha8,
        color:
          theme.palette.mode === "light"
            ? theme.palette.warning.dark
            : theme.palette.warning.light,
        borderColor: theme.palette.warning.main,
        "& .MuiAlert-icon": {
          color: theme.palette.warning.main,
        },
      },
      standardInfo: {
        backgroundColor: theme.palette.info.alpha8,
        color:
          theme.palette.mode === "light"
            ? theme.palette.info.dark
            : theme.palette.info.light,
        borderColor: theme.palette.info.main,
        "& .MuiAlert-icon": {
          color: theme.palette.info.main,
        },
      },
      standardSuccess: {
        backgroundColor: theme.palette.success.alpha8,
        color:
          theme.palette.mode === "light"
            ? theme.palette.success.dark
            : theme.palette.success.light,
        borderColor: theme.palette.success.main,
        "& .MuiAlert-icon": {
          color: theme.palette.success.main,
        },
      },
    },
  },

  // Badge styling - Digital look
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontSize: theme.typography.caption.fontSize,
        fontWeight: 600,
        minWidth: 20,
        height: 20,
        borderRadius: theme.customShape.borderRadiusSmall,
        border: `2px solid ${theme.palette.background.paper}`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 2px 8px rgba(0, 0, 0, 0.1)"
            : "0 2px 8px rgba(0, 0, 0, 0.3)",
      },
      colorPrimary: {
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : theme.palette.primary.main,
      },
    },
  },

  // Chip styling - Digital look
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: theme.customShape.borderRadiusMedium,
        fontSize: theme.typography.body2.fontSize,
        fontWeight: 500,
        height: "auto",
        padding: theme.spacing(0.75, 1),
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-1px)",
        },
      },
      filled: {
        background:
          theme.palette.mode === "light"
            ? theme.palette.primary.alpha12
            : "rgba(59, 130, 246, 0.15)",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? theme.palette.primary.alpha16
            : "rgba(59, 130, 246, 0.2)"
        }`,
      },
      outlined: {
        borderWidth: 2,
      },
    },
  },

  // Tooltip styling
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: theme.palette.text.primary,
        color: theme.palette.background.paper,
        fontSize: theme.typography.body2.fontSize,
        padding: theme.spacing(1, 1.5),
        borderRadius: theme.customShape.borderRadiusMedium,
      },
    },
  },

  // Divider styling
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: theme.palette.divider,
      },
    },
  },

  // AppBar styling (if used)
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
  },

  // Toolbar styling
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: theme.touchTarget.large,
        padding: theme.spacing(0, 2),
        [theme.breakpoints.up("sm")]: {
          padding: theme.spacing(0, 3),
        },
      },
    },
  },
});

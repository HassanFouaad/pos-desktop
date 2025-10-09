import { Close as CloseIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ReactNode } from "react";

export interface ResponsiveDialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
  contentSx?: Record<string, any>;
  titleSx?: Record<string, any>;
  actionsSx?: Record<string, any>;
}

/**
 * Generic responsive dialog component
 * Automatically becomes fullscreen on mobile and tablet devices (below lg breakpoint)
 * Provides consistent styling and behavior across all dialogs
 */
export const ResponsiveDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  showCloseButton = false,
  disableBackdropClick = false,
  contentSx = {},
  titleSx = {},
  actionsSx = {},
}: ResponsiveDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const handleClose = (_event: object, reason: string) => {
    if (disableBackdropClick && reason === "backdropClick") {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
    >
      {title && (
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            ...titleSx,
          }}
        >
          {title}
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              sx={{
                ml: 2,
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent sx={contentSx}>{children}</DialogContent>

      {actions && <DialogActions sx={actionsSx}>{actions}</DialogActions>}
    </Dialog>
  );
};

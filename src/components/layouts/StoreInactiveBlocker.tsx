import { Warning as WarningIcon } from "@mui/icons-material";
import {
  Backdrop,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useStoreStatus } from "../../hooks/useStoreStatus";
import { useAppSelector } from "../../store/hooks";

/**
 * Full-screen blocker that displays when the store is inactive.
 * Prevents all operations and shows a warning message.
 * Uses PowerSync watched queries for real-time monitoring.
 */
export const StoreInactiveBlocker = () => {
  useStoreStatus();
  const store = useAppSelector((state) => state.global.store);
  const theme = useTheme();

  console.log("Store", store);
  // Don't show anything while loading
  if (!store) {
    return null;
  }

  // Don't show blocker if store is active
  if (store.isActive) {
    return null;
  }

  return (
    <Backdrop
      open={!store.isActive}
      sx={{
        color: "#fff",
        zIndex: theme.zIndex.modal + 1000, // Ensure it's above everything
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          mx: 2,
        }}
      >
        <Card
          sx={{
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.background.paper
                : theme.palette.background.elevated,
            border: `3px solid ${theme.palette.error.main}`,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Warning Icon */}
              <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    background:
                      theme.palette.mode === "light"
                        ? `linear-gradient(135deg, ${theme.palette.error.alpha8} 0%, ${theme.palette.error.alpha16} 100%)`
                        : `linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)`,
                    borderRadius: "30%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `3px solid ${theme.palette.error.main}`,
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        opacity: 1,
                      },
                      "50%": {
                        opacity: 0.7,
                      },
                    },
                  }}
                >
                  <WarningIcon
                    sx={{
                      fontSize: 80,
                      color: theme.palette.error.main,
                    }}
                  />
                </Box>
              </Grid>

              {/* Title */}
              <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  fontWeight={700}
                  color="error.main"
                >
                  Store Disabled
                </Typography>
              </Grid>

              {/* Store Info */}
              {store && (
                <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? theme.palette.background.section
                          : theme.palette.background.default,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ letterSpacing: "0.05em", mb: 1 }}
                    >
                      STORE INFORMATION
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {store.name || "Unknown Store"}
                    </Typography>
                    {store.code && (
                      <Typography variant="body2" color="text.secondary">
                        Code: {store.code}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Warning Message */}
              <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? theme.palette.error.alpha8
                        : "rgba(239, 68, 68, 0.12)",
                    borderRadius: 1,
                    border: `2px solid ${
                      theme.palette.mode === "light"
                        ? theme.palette.error.alpha16
                        : "rgba(239, 68, 68, 0.2)"
                    }`,
                  }}
                >
                  <Typography
                    variant="h5"
                    color="error.main"
                    fontWeight={700}
                    gutterBottom
                  >
                    ⚠️ Operations Suspended
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ mt: 2, mb: 2 }}
                  >
                    This store has been disabled by an administrator.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All POS operations are currently suspended. Please contact
                    your system administrator or store manager for assistance.
                  </Typography>
                </Box>
              </Grid>

              {/* Loading Indicator */}
              <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <CircularProgress size={20} color="error" />
                  <Typography variant="body2" color="text.secondary">
                    Monitoring store status...
                  </Typography>
                </Box>
              </Grid>

              {/* Help Text */}
              <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    p: 2,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? theme.palette.background.section
                        : theme.palette.background.default,
                    borderRadius: 1,
                  }}
                >
                  💡 This message will automatically disappear when the store is
                  reactivated
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Backdrop>
  );
};

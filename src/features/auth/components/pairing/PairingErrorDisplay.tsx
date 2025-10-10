/**
 * Pairing Error Display Component
 * Shows detailed, actionable error messages
 */

import {
  Error as ErrorIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { PairingErrorDetails } from "../../utils/pairing-errors";

interface PairingErrorDisplayProps {
  errorDetails: PairingErrorDetails;
}

export function PairingErrorDisplay({
  errorDetails,
}: PairingErrorDisplayProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      {/* Main Error Alert */}
      <Grid size={{ xs: 12 }}>
        <Alert
          severity="error"
          icon={<ErrorIcon fontSize="large" />}
          sx={{
            alignItems: "center",
            "& .MuiAlert-icon": {
              fontSize: "2rem",
            },
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {errorDetails.title}
          </Typography>
          <Typography variant="body2">{errorDetails.message}</Typography>
        </Alert>
      </Grid>

      {/* Actionable Steps */}
      <Grid size={{ xs: 12 }}>
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
            variant="subtitle2"
            fontWeight={600}
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <HelpIcon fontSize="small" />
            What to do next:
          </Typography>
          <List dense disablePadding>
            {errorDetails.steps.map((step, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={step}
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "text.primary",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Grid>
    </Grid>
  );
}

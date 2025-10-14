import { LinkOff as UnpairIcon } from "@mui/icons-material";
import { Grid, useTheme } from "@mui/material";
import { useState } from "react";
import { InfoCard } from "../../../components/cards";
import { TouchButton } from "../../../components/common/TouchButton";
import { UnpairConfirmDialog } from "../../../components/layouts/UnpairConfirmDialog";

/**
 * Allows user to unpair the device from the current store
 * Shows unpair button with confirmation dialog
 */
export const UnpairDeviceCard = () => {
  const theme = useTheme();
  const [showUnpairDialog, setShowUnpairDialog] = useState(false);

  const handleUnpairClick = () => {
    setShowUnpairDialog(true);
  };

  const handleUnpairConfirm = () => {
    setShowUnpairDialog(false);
    // Navigation to pair page will be handled by UnpairConfirmDialog
  };

  const handleUnpairCancel = () => {
    setShowUnpairDialog(false);
  };

  return (
    <>
      <InfoCard
        title="Device Management"
        icon={<UnpairIcon sx={{ fontSize: 32 }} />}
        iconColor={theme.palette.warning.main}
        backgroundColor="paper"
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TouchButton
              size="large"
              variant="outlined"
              color="warning"
              fullWidth
              onClick={handleUnpairClick}
              startIcon={<UnpairIcon />}
            >
              Unpair Device
            </TouchButton>
          </Grid>
        </Grid>
      </InfoCard>

      {/* Unpair Confirmation Dialog */}
      <UnpairConfirmDialog
        open={showUnpairDialog}
        onConfirm={handleUnpairConfirm}
        onCancel={handleUnpairCancel}
      />
    </>
  );
};

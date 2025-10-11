import { Person as PersonIcon, Phone as PhoneIcon } from "@mui/icons-material";
import { Chip, Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { CustomerDTO } from "../../types/customer.dto";

interface CustomerDetailsHeaderProps {
  customer: CustomerDTO;
}

export const CustomerDetailsHeader = ({
  customer,
}: CustomerDetailsHeaderProps) => {
  const theme = useTheme();

  return (
    <InfoCard
      icon={<PersonIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.primary.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        {/* Customer Name */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid size="grow">
              <Typography variant="h5" fontWeight={700}>
                {customer.name || "Walk-in Customer"}
              </Typography>
            </Grid>
            {customer.loyaltyPoints && customer.loyaltyPoints > 0 && (
              <Grid size="auto">
                <Chip
                  label={`${customer.loyaltyPoints} pts`}
                  size="medium"
                  variant="outlined"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Customer Phone */}
        {customer.phone && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size="auto">
                <PhoneIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </Grid>
              <Grid size="auto">
                <Typography variant="body2" color="text.secondary">
                  {customer.phone}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );
};

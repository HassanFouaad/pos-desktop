import { Info as InfoIcon } from "@mui/icons-material";
import { Grid, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { CustomerDTO } from "../../types/customer.dto";

interface CustomerDetailsPersonalProps {
  customer: CustomerDTO;
}

export const CustomerDetailsPersonal = ({
  customer,
}: CustomerDetailsPersonalProps) => {
  const theme = useTheme();

  // Don't render if no personal information
  if (!customer.dateOfBirth && !customer.loyaltyNumber) {
    return null;
  }

  return (
    <InfoCard
      title="Personal Information"
      icon={<InfoIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.info.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        {/* Date of Birth */}
        {customer.dateOfBirth && (
          <Grid size={{ xs: 12 }}>
            <Grid container>
              <Grid size="grow">
                <Typography variant="body2" color="text.secondary">
                  Date of Birth
                </Typography>
              </Grid>
              <Grid size="auto">
                <Typography variant="body1" fontWeight={600}>
                  {dayjs(customer.dateOfBirth).format("MMMM D, YYYY")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Loyalty Number */}
        {customer.loyaltyNumber && (
          <Grid size={{ xs: 12 }}>
            <Grid container>
              <Grid size="grow">
                <Typography variant="body2" color="text.secondary">
                  Loyalty Number
                </Typography>
              </Grid>
              <Grid size="auto">
                <Typography variant="body1" fontWeight={600}>
                  {customer.loyaltyNumber}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );
};

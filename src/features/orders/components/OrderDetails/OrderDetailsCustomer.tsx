import { Person as PersonIcon, Phone as PhoneIcon } from "@mui/icons-material";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../../components/cards/InfoCard";
import { OrderDto } from "../../types/order.types";

interface OrderDetailsCustomerProps {
  order: OrderDto;
  onClick?: () => void;
}

export const OrderDetailsCustomer = ({
  order,
  onClick,
}: OrderDetailsCustomerProps) => {
  const theme = useTheme();

  // Don't render if no customer information
  if (!order.customerName && !order.customerPhone) {
    return null;
  }

  const content = (
    <InfoCard
      title="Customer Information"
      icon={<PersonIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.info.main}
      backgroundColor="paper"
    >
      <Grid container spacing={2}>
        {/* Customer Name */}
        {order.customerName && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size="auto">
                <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </Grid>
              <Grid size="auto">
                <Typography variant="body1" fontWeight={600}>
                  {order.customerName}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Customer Phone */}
        {order.customerPhone && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size="auto">
                <PhoneIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </Grid>
              <Grid size="auto">
                <Typography variant="body2" color="text.secondary">
                  {order.customerPhone}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );

  // If onClick provided, wrap in clickable Box
  if (onClick) {
    return (
      <Box
        onClick={onClick}
        sx={{
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

import {
  AttachMoney,
  CheckCircleOutline,
  HourglassEmpty,
  Inventory,
} from "@mui/icons-material";
import { Card, CardActionArea, Chip, Grid, Typography } from "@mui/material";
import { StoreDto } from "../../stores/types";
import { VariantDetailDTO } from "../types/variant-detail.dto";
import { formatCurrency } from "../utils/pricing";

interface VariantListItemProps {
  variant: VariantDetailDTO;
  store: StoreDto;
  onClick?: (variant: VariantDetailDTO) => void;
}

const InventoryChip = ({
  icon,
  value,
  color = "default",
}: {
  icon: React.ReactNode;
  value: string | number;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}) => (
  <Chip
    icon={icon as React.ReactElement}
    label={`${value}`}
    size="small"
    variant="outlined"
    color={color}
  />
);

export const VariantListItem = ({
  variant,
  store,
  onClick,
}: VariantListItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(variant);
    }
  };

  const formattedPrice = formatCurrency(
    variant.baseSellingPrice,
    store.currency ?? "EGP"
  );

  const cardContent = (
    <>
      <Grid container spacing={2}>
        {/* Product Info */}
        <Grid size={{ xs: 8 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {variant.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {variant.product.name}
          </Typography>
        </Grid>
        <Grid size={{ xs: 4 }} sx={{ textAlign: "right" }}>
          <Typography variant="h5" color="primary.main" fontWeight={700}>
            {formattedPrice}
          </Typography>
        </Grid>

        {/* Inventory Chips */}
        {variant.inventory && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1} sx={{ pt: 2 }}>
              <Grid>
                <InventoryChip
                  icon={<CheckCircleOutline fontSize="small" />}
                  value={variant.inventory.quantityAvailable ?? 0}
                  color="success"
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<Inventory fontSize="small" />}
                  value={variant.inventory.quantityOnHand ?? 0}
                  color="info"
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<HourglassEmpty fontSize="small" />}
                  value={variant.inventory.quantityCommitted ?? 0}
                  color="warning"
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<AttachMoney fontSize="small" />}
                  value={formatCurrency(
                    variant.inventory.totalValue,
                    store.currency ?? "EGP"
                  )}
                  color="primary"
                />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Card sx={{ p: 2 }}>
        {onClick ? (
          <CardActionArea onClick={handleClick}>{cardContent}</CardActionArea>
        ) : (
          cardContent
        )}
      </Card>
    </Grid>
  );
};

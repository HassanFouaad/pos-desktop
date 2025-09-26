import {
  AttachMoney,
  CheckCircleOutline,
  HourglassEmpty,
  Inventory,
  TrendingDown,
  VerticalAlignTop,
} from "@mui/icons-material";
import { Box, Grid, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { StoreDTO } from "../../stores/repositories/stores.repository";
import { VariantDetailDTO } from "../types/variant-detail.dto";
import { formatCurrency } from "../utils/pricing";

interface VariantListItemProps {
  variant: VariantDetailDTO;
  store: StoreDTO;
  onClick?: (variant: VariantDetailDTO) => void;
}

const InventoryDetail = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) => (
  <Tooltip title={`${label}: ${value}`}>
    <Box sx={{ display: "flex", alignItems: "center", color, p: 1 }}>
      {icon}
      <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  </Tooltip>
);

export const VariantListItem = ({
  variant,
  store,
  onClick,
}: VariantListItemProps) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onClick) {
      onClick(variant);
    }
  };

  const formattedPrice = formatCurrency(
    variant.baseSellingPrice,
    store.currency ?? "EGP"
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Paper
        onClick={handleClick}
        sx={{
          p: 2,
          width: 1,
          cursor: onClick ? "pointer" : "default",
          "&:active": {
            transform: onClick ? "scale(0.99)" : "none",
          },
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 8 }}>
            <Typography variant="h6">{variant.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {variant.product.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }} sx={{ textAlign: "right" }}>
            <Typography variant="h6">{formattedPrice}</Typography>
          </Grid>
        </Grid>

        {variant.inventory && (
          <Grid
            container
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: 1,
              borderColor: "divider",
              flexWrap: "nowrap",
              overflowX: "auto",
              justifyContent: "flex-start",
            }}
          >
            <InventoryDetail
              icon={<CheckCircleOutline />}
              label="Available"
              value={variant.inventory.quantityAvailable ?? 0}
              color={theme.palette.success.main}
            />
            <InventoryDetail
              icon={<Inventory />}
              label="On Hand"
              value={variant.inventory.quantityOnHand ?? 0}
              color={theme.palette.info.main}
            />
            <InventoryDetail
              icon={<HourglassEmpty />}
              label="Committed"
              value={variant.inventory.quantityCommitted ?? 0}
              color={theme.palette.warning.dark}
            />
            <InventoryDetail
              icon={<TrendingDown />}
              label="Reorder At"
              value={variant.inventory.reorderPoint ?? 0}
              color={theme.palette.error.main}
            />
            <InventoryDetail
              icon={<VerticalAlignTop />}
              label="Max Stock"
              value={variant.inventory.maxStockLevel ?? 0}
              color={theme.palette.primary.main}
            />
            <InventoryDetail
              icon={<AttachMoney />}
              label="Total Value"
              value={formatCurrency(
                variant.inventory.totalValue,
                store.currency ?? "EGP"
              )}
              color={theme.palette.text.secondary}
            />
          </Grid>
        )}
      </Paper>
    </Grid>
  );
};

import {
  AttachMoney,
  CheckCircleOutline,
  HourglassEmpty,
  Inventory,
  TrendingDown,
  VerticalAlignTop,
} from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  Chip,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { StoreDTO } from "../../stores/repositories/stores.repository";
import { VariantDetailDTO } from "../types/variant-detail.dto";
import { formatCurrency } from "../utils/pricing";

interface VariantListItemProps {
  variant: VariantDetailDTO;
  store: StoreDTO;
  onClick?: (variant: VariantDetailDTO) => void;
}

const InventoryChip = ({
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
  <Chip
    icon={icon as React.ReactElement}
    label={`${value}`}
    size="small"
    variant="outlined"
    sx={{
      color,
      borderColor: color,
      "& .MuiChip-icon": {
        color,
      },
    }}
  />
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
            <Grid
              container
              spacing={1}
              sx={{
                pt: theme.spacing(1),
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Grid>
                <InventoryChip
                  icon={<CheckCircleOutline fontSize="small" />}
                  label="Available"
                  value={variant.inventory.quantityAvailable ?? 0}
                  color={theme.palette.success.main}
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<Inventory fontSize="small" />}
                  label="On Hand"
                  value={variant.inventory.quantityOnHand ?? 0}
                  color={theme.palette.info.main}
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<HourglassEmpty fontSize="small" />}
                  label="Committed"
                  value={variant.inventory.quantityCommitted ?? 0}
                  color={theme.palette.warning.dark}
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<TrendingDown fontSize="small" />}
                  label="Reorder"
                  value={variant.inventory.reorderPoint ?? 0}
                  color={theme.palette.error.main}
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<VerticalAlignTop fontSize="small" />}
                  label="Max"
                  value={variant.inventory.maxStockLevel ?? 0}
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid>
                <InventoryChip
                  icon={<AttachMoney fontSize="small" />}
                  label="Value"
                  value={formatCurrency(
                    variant.inventory.totalValue,
                    store.currency ?? "EGP"
                  )}
                  color={theme.palette.text.secondary}
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
      <Card>
        {onClick ? (
          <CardActionArea onClick={handleClick}>{cardContent}</CardActionArea>
        ) : (
          cardContent
        )}
      </Card>
    </Grid>
  );
};

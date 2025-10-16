import {
  CheckCircleOutline,
  HourglassEmpty,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { Card, Grid, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";
import { InventoryChip } from "./InventoryChip";

interface InventoryData {
  quantityAvailable?: number | null;
  quantityOnHand?: number | null;
  quantityCommitted?: number | null;
}

interface ProductCardProps {
  title: string;
  subtitle?: string;
  price: string;
  icon?: ReactNode;
  inventory?: InventoryData;
  showInventory?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ProductCard = ({
  title,
  subtitle,
  price,
  icon = <InventoryIcon sx={{ fontSize: 32 }} />,
  inventory,
  showInventory = false,
  onClick,
  disabled = false,
  gridSize = { xs: 12, sm: 6, md: 4, lg: 3 },
}: ProductCardProps) => {
  const theme = useTheme();

  return (
    <Grid size={gridSize}>
      <Card
        onClick={disabled ? undefined : onClick}
        sx={{
          p: 2,
          height: 1,
          display: "flex",
          flexDirection: "column",
          cursor: disabled ? "not-allowed" : onClick ? "pointer" : "default",
          opacity: disabled ? 0.5 : 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          transition: "all 0.2s ease",
          "&:hover":
            !disabled && onClick
              ? {
                  borderColor: theme.palette.primary.light,
                  bgcolor: theme.palette.action.hover,
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${theme.palette.primary.light}10`,
                }
              : {},
          "&:active":
            !disabled && onClick
              ? {
                  transform: "translateY(0)",
                  boxShadow: `0 2px 8px ${theme.palette.primary.light}10`,
                }
              : {},
        }}
      >
        {/* Icon */}
        {icon && (
          <Grid
            container
            justifyContent="center"
            sx={{
              mb: 1.5,
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Grid>
        )}

        {/* Title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            textAlign: "center",
            mb: 0.5,
            color: theme.palette.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.5em",
          }}
        >
          {title}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              mb: 1,
              color: theme.palette.text.secondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Price */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: theme.palette.primary.main,
            mb: showInventory && inventory ? 2 : 0,
          }}
        >
          {price}
        </Typography>

        {/* Inventory Info */}
        {showInventory && inventory && (
          <Grid
            container
            spacing={1}
            justifyContent="center"
            sx={{ mt: "auto" }}
          >
            <Grid>
              <InventoryChip
                icon={<CheckCircleOutline fontSize="small" />}
                value={inventory.quantityAvailable ?? 0}
                color="success"
              />
            </Grid>
            <Grid>
              <InventoryChip
                icon={<InventoryIcon fontSize="small" />}
                value={inventory.quantityOnHand ?? 0}
                color="info"
              />
            </Grid>
            <Grid>
              <InventoryChip
                icon={<HourglassEmpty fontSize="small" />}
                value={inventory.quantityCommitted ?? 0}
                color="warning"
              />
            </Grid>
          </Grid>
        )}
      </Card>
    </Grid>
  );
};

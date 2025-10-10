import { Chip } from "@mui/material";

interface InventoryChipProps {
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
}

export const InventoryChip = ({
  icon,
  value,
  color = "default",
}: InventoryChipProps) => (
  <Chip
    icon={icon as React.ReactElement}
    label={`${value}`}
    size="small"
    variant="outlined"
    color={color}
  />
);

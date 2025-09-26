import {
  PeopleAlt as CustomersIcon,
  MoreHoriz as MoreIcon,
  AssignmentTurnedIn as OrdersIcon,
  CurrencyExchange as PaymentIcon,
  ViewModule as ProductsIcon,
  Receipt as ReceiptIcon,
  BarChart as ReportsIcon,
  ShoppingCart as SalesIcon,
} from "@mui/icons-material";
import { Grid, useTheme } from "@mui/material";
import { GridCard } from "../common/GridCard";

interface GridDashboardProps {
  onNavigate: (path: string) => void;
}

export const GridDashboard = ({ onNavigate }: GridDashboardProps) => {
  const theme = useTheme();

  // Dashboard tiles configuration
  const tiles = [
    {
      title: "New Sale",
      icon: <SalesIcon sx={{ fontSize: 36 }} />,
      color: theme.palette.primary.main,
      path: "/sales/new",
    },
    {
      title: "Products",
      icon: <ProductsIcon sx={{ fontSize: 36 }} />,
      color: theme.palette.secondary.main,
      path: "/products",
    },
    {
      title: "Customers",
      icon: <CustomersIcon sx={{ fontSize: 36 }} />,
      color: theme.palette.warning.main,
      path: "/customers",
    },
    {
      title: "Orders",
      icon: <OrdersIcon sx={{ fontSize: 36 }} />,
      color: theme.palette.error.main,
      path: "/orders",
    },
    {
      title: "Payments",
      icon: <PaymentIcon sx={{ fontSize: 36 }} />,
      color: theme.palette.info.main,
      path: "/payments",
    },
    {
      title: "Receipts",
      icon: <ReceiptIcon sx={{ fontSize: 36 }} />,
      color: theme.palette.success.main,
      path: "/receipts",
    },
    {
      title: "Reports",
      icon: <ReportsIcon sx={{ fontSize: 36 }} />,
      color: "#673ab7", // Purple
      path: "/reports",
    },
    {
      title: "More",
      icon: <MoreIcon sx={{ fontSize: 36 }} />,
      color: theme.palette.text.primary,
      path: "/more",
    },
  ];

  return (
    <Grid container spacing={2}>
      {tiles.map((tile) => (
        <GridCard
          key={tile.title}
          title={tile.title}
          icon={tile.icon}
          iconBackground={tile.color}
          onClick={() => onNavigate(tile.path)}
          gridProps={{ size: { xs: 12, sm: 12, md: 4 } }}
        />
      ))}
    </Grid>
  );
};

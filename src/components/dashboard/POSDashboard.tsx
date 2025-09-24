import {
  AssignmentTurnedIn as OrdersIcon,
  BarChart as ReportsIcon,
  CurrencyExchange as PaymentIcon,
  MoreHoriz as MoreIcon,
  PeopleAlt as CustomersIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as SalesIcon,
  ViewModule as ProductsIcon,
} from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import { TouchCard } from "../touch/TouchCard";
import { TouchGridLayout } from "../layout/TouchGridLayout";

interface DashboardTileProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

// Dashboard tile component
const DashboardTile = ({ title, icon, color, onClick }: DashboardTileProps) => (
  <TouchCard
    contentComponent={
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "120px",
        }}
        onClick={onClick}
      >
        <Box
          sx={{
            bgcolor: `${color}22`, // Using alpha transparency
            color: color,
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          {title}
        </Typography>
      </Box>
    }
  />
);

interface POSDashboardProps {
  onNavigate: (path: string) => void;
}

export const POSDashboard = ({ onNavigate }: POSDashboardProps) => {
  // Dashboard tiles configuration
  const tiles = [
    {
      title: "New Sale",
      icon: <SalesIcon fontSize="large" />,
      color: "#3a36db", // primary
      path: "/sales/new",
    },
    {
      title: "Products",
      icon: <ProductsIcon fontSize="large" />,
      color: "#00b894", // secondary
      path: "/products",
    },
    {
      title: "Customers",
      icon: <CustomersIcon fontSize="large" />,
      color: "#f39c12", // orange
      path: "/customers",
    },
    {
      title: "Orders",
      icon: <OrdersIcon fontSize="large" />,
      color: "#e74c3c", // red
      path: "/orders",
    },
    {
      title: "Payments",
      icon: <PaymentIcon fontSize="large" />,
      color: "#9b59b6", // purple
      path: "/payments",
    },
    {
      title: "Receipts",
      icon: <ReceiptIcon fontSize="large" />,
      color: "#3498db", // blue
      path: "/receipts",
    },
    {
      title: "Reports",
      icon: <ReportsIcon fontSize="large" />,
      color: "#2ecc71", // green
      path: "/reports",
    },
    {
      title: "More",
      icon: <MoreIcon fontSize="large" />,
      color: "#34495e", // dark blue/grey
      path: "/more",
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 4, px: 1 }}>
        Quick Access
      </Typography>

      <TouchGridLayout
        columns={{ xs: 2, sm: 3, md: 4, lg: 4, xl: 5 }}
        spacing={2}
      >
        {tiles.map((tile) => (
          <DashboardTile
            key={tile.title}
            title={tile.title}
            icon={tile.icon}
            color={tile.color}
            onClick={() => onNavigate(tile.path)}
          />
        ))}
      </TouchGridLayout>
    </Box>
  );
};

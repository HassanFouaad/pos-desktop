import { Grid } from "@mui/material";
import { OrderList } from "../components/OrdersList";

const OrdersListPage = () => {
  return (
    <Grid
      container
      sx={{
        height: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Grid size={12} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <OrderList />
      </Grid>
    </Grid>
  );
};

export default OrdersListPage;

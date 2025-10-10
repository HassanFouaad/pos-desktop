import { Grid } from "@mui/material";
import { CustomerList } from "../components/CustomerList";

const CustomersPage = () => {
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
        <CustomerList />
      </Grid>
    </Grid>
  );
};

export default CustomersPage;

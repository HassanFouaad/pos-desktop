import { Grid } from "@mui/material";
import { CategorySelection } from "../components/CategorySelection";

const ProductsPage = () => {
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
        <CategorySelection />
      </Grid>
    </Grid>
  );
};

export default ProductsPage;

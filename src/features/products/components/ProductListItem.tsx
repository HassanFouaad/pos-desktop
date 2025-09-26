import {
  Collapse,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { StoreDTO } from "../../stores/repositories/stores.repository";
import { ProductDTO } from "../repositories/products.repository";
import { getProductPrice, getVariantPrice } from "../utils/pricing";

interface ProductListItemProps {
  product: ProductDTO;
  store: StoreDTO;
  onClick?: (product: ProductDTO) => void;
}

export const ProductListItem = ({
  product,
  store,
  onClick,
}: ProductListItemProps) => {
  const [variantsOpen, setVariantsOpen] = useState(false);
  const hasMultipleVariants = product.variants.length > 1;

  const handleClick = () => {
    if (hasMultipleVariants) {
      setVariantsOpen(!variantsOpen);
    } else if (onClick) {
      onClick(product);
    }
  };

  const formattedPrice = getProductPrice(product, store.currency);

  return (
    <Grid size={{ xs: 12 }}>
      <Paper
        sx={{
          width: 1,
          cursor: "pointer",
        }}
      >
        <Grid
          onClick={handleClick}
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            "&:active": {
              transform: "scale(0.99)",
            },
          }}
        >
          <Grid>
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {product.variants.length > 0
                ? `${product.variants.length} variant(s)`
                : "No variants"}
            </Typography>
          </Grid>
          <Grid>
            <Typography variant="h6">{formattedPrice}</Typography>
          </Grid>
        </Grid>
        {hasMultipleVariants && (
          <Collapse in={variantsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {product.variants.map((variant, index) => (
                <div key={variant.id}>
                  <Divider />
                  <ListItem sx={{ pl: 4 }}>
                    <ListItemText primary={variant.name} />
                    <Typography variant="body1">
                      {getVariantPrice(variant, store.currency)}
                    </Typography>
                  </ListItem>
                </div>
              ))}
            </List>
          </Collapse>
        )}
      </Paper>
    </Grid>
  );
};

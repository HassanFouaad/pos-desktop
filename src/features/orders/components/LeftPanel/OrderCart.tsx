import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  removeCartItem,
  selectCartItems,
  selectPreview,
  updateCartItemQuantity,
} from "../../../../store/orderSlice";
import { formatCurrency } from "../../../products/utils/pricing";

interface OrderCartProps {
  currency?: string;
}

export const OrderCart = ({ currency = "EGP" }: OrderCartProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const preview = useAppSelector(selectPreview);

  const handleQuantityChange = (tempId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateCartItemQuantity({ tempId, quantity: newQuantity }));
    } else {
      // If quantity would be 0 or less, remove the item from cart
      dispatch(removeCartItem(tempId));
    }
  };

  const handleRemoveItem = (tempId: string) => {
    dispatch(removeCartItem(tempId));
  };

  if (cartItems.length === 0) {
    return (
      <Grid container sx={{ minHeight: 200 }}>
        <Grid
          size={12}
          sx={{
            textAlign: "center",
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.disabled,
            }}
          >
            No items in cart
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Select products to add them
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={1} sx={{ p: 1.5 }}>
      {cartItems.map((item, index) => {
        // Get preview data for this item
        const previewItem = preview?.items[index];

        return (
          <Grid size={12} key={item.tempId}>
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                overflow: "hidden",
                "&:active": {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <Grid container spacing={1} sx={{ p: 1, minHeight: 56 }}>
                {/* Quantity Controls */}
                <Grid size="auto">
                  <Box
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Grid container>
                      <Grid size="auto">
                        <IconButton
                          onClick={() =>
                            handleQuantityChange(item.tempId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 0}
                          sx={{
                            minWidth: 36,
                            minHeight: 36,
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            "&:disabled": {
                              opacity: 0.3,
                            },
                            "&:active:not(:disabled)": {
                              bgcolor: theme.palette.action.selected,
                            },
                          }}
                        >
                          <RemoveIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Grid>
                      <Grid
                        size="auto"
                        sx={{
                          minWidth: 40,
                          textAlign: "center",
                          px: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: theme.palette.text.primary,
                            userSelect: "none",
                            lineHeight: "36px",
                          }}
                        >
                          {item.quantity}
                        </Typography>
                      </Grid>
                      <Grid size="auto">
                        <IconButton
                          onClick={() =>
                            handleQuantityChange(item.tempId, item.quantity + 1)
                          }
                          disabled={
                            item.quantityAvailable !== undefined &&
                            item.quantity >= item.quantityAvailable
                          }
                          sx={{
                            minWidth: 36,
                            minHeight: 36,
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            "&:disabled": {
                              opacity: 0.3,
                            },
                            "&:active:not(:disabled)": {
                              bgcolor: theme.palette.action.selected,
                            },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Product Info */}
                <Grid size="grow" sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {previewItem?.variantName ||
                      item.variantName ||
                      "Custom Item"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: "0.8rem",
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {previewItem?.productName}
                  </Typography>
                </Grid>

                {/* Price */}
                <Grid
                  size="auto"
                  sx={{
                    textAlign: "right",
                    minWidth: 70,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      fontSize: "1rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {formatCurrency(previewItem?.lineTotal || 0, currency)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.7rem",
                    }}
                  >
                    {formatCurrency(previewItem?.unitPrice || 0, currency)} each
                  </Typography>
                </Grid>

                {/* Delete Button */}
                <Grid size="auto">
                  <IconButton
                    onClick={() => handleRemoveItem(item.tempId)}
                    sx={{
                      minWidth: 36,
                      minHeight: 36,
                      width: 36,
                      height: 36,
                      color: theme.palette.error.main,
                      borderRadius: 1.5,
                      "&:hover": {
                        bgcolor: `${theme.palette.error.main}15`,
                      },
                      "&:active": {
                        bgcolor: `${theme.palette.error.main}25`,
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

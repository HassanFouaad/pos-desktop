import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  TextField,
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

export const OrderCart = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const preview = useAppSelector(selectPreview);

  const handleQuantityChange = (tempId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateCartItemQuantity({ tempId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (tempId: string) => {
    dispatch(removeCartItem(tempId));
  };

  if (cartItems.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.disabled,
            textAlign: "center",
          }}
        >
          No items in cart
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Select products to add them
          </Typography>
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {cartItems.map((item, index) => {
        // Get preview data for this item
        const previewItem = preview?.items[index];

        return (
          <Paper
            key={item.tempId}
            elevation={0}
            sx={{
              p: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: "0.875rem",
                  }}
                >
                  {previewItem?.variantName ||
                    item.variantName ||
                    "Custom Item"}
                </Typography>
                {previewItem?.productName && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                    }}
                  >
                    {previewItem.productName}
                  </Typography>
                )}
              </Box>

              <IconButton
                size="small"
                onClick={() => handleRemoveItem(item.tempId)}
                sx={{
                  color: theme.palette.error.main,
                  width: 28,
                  height: 28,
                  "&:hover": {
                    bgcolor: `${theme.palette.error.main}15`,
                  },
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Variant Attributes */}
            {previewItem?.variantAttributes &&
              Object.keys(previewItem.variantAttributes).length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {Object.entries(previewItem.variantAttributes).map(
                    ([key, value]) => (
                      <Typography
                        key={key}
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          mr: 1,
                        }}
                      >
                        {key}: <strong>{value}</strong>
                      </Typography>
                    )
                  )}
                </Box>
              )}

            {/* Quantity Controls and Price */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              {/* Quantity Controls */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 0.25,
                  bgcolor: theme.palette.background.default,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    handleQuantityChange(item.tempId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  sx={{
                    minWidth: 28,
                    height: 28,
                    "&:disabled": {
                      opacity: 0.5,
                    },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <TextField
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleQuantityChange(item.tempId, value);
                  }}
                  size="small"
                  sx={{
                    width: 50,
                    "& input": {
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      p: "4px",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        border: "none",
                      },
                    },
                  }}
                />

                <IconButton
                  size="small"
                  onClick={() =>
                    handleQuantityChange(item.tempId, item.quantity + 1)
                  }
                  sx={{
                    minWidth: 28,
                    height: 28,
                  }}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Line Total */}
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                  }}
                >
                  ${previewItem?.lineTotal.toFixed(2) || "0.00"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                  }}
                >
                  ${previewItem?.unitPrice.toFixed(2) || "0.00"} each
                </Typography>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};

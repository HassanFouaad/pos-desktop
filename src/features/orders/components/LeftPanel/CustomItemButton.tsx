import { Add as AddIcon } from "@mui/icons-material";
import { Grid, useTheme } from "@mui/material";
import { useState } from "react";
import { TouchButton } from "../../../../components/common/TouchButton";
import { OrderItemStockType } from "../../../../db/enums";
import { useAppDispatch } from "../../../../store/hooks";
import { addCartItem } from "../../../../store/orderSlice";
import { CustomItemFormData, CustomItemModal } from "../Modals/CustomItemModal";

export const CustomItemButton = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleAddCustomItem = (data: CustomItemFormData) => {
    dispatch(
      addCartItem({
        variantName: data.variantName,
        price: data.price,
        quantity: data.quantity,
        stockType: OrderItemStockType.EXTERNAL,
      })
    );
    setModalOpen(false);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Grid
        container
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid size={12}>
          <TouchButton
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleOpenModal}
            startIcon={<AddIcon />}
            sx={{
              justifyContent: "flex-start",
              textAlign: "left",
              py: 1.5,
              color: "primary.main",
              borderColor: "primary.main",
              "&:hover": {
                bgcolor: "primary.lighter",
                borderColor: "primary.main",
              },
            }}
          >
            Add Custom Item
          </TouchButton>
        </Grid>
      </Grid>

      <CustomItemModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddCustomItem}
      />
    </>
  );
};

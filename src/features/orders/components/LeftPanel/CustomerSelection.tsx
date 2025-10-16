import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useState } from "react";
import { TouchButton } from "../../../../components/common/TouchButton";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  selectSelectedCustomer,
  setCustomer,
} from "../../../../store/orderSlice";
import { CustomerDTO } from "../../../customers/types/customer.dto";
import { CustomerSelectionModal } from "../Modals/CustomerSelectionModal";

export const CustomerSelection = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const selectedCustomer = useAppSelector(selectSelectedCustomer);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSelectCustomer = useCallback(
    (customer: CustomerDTO) => {
      dispatch(
        setCustomer({
          id: customer.id,
          name: customer.name || "Unknown Customer",
        })
      );
    },
    [dispatch]
  );

  const handleClearCustomer = useCallback(() => {
    dispatch(setCustomer(null));
  }, [dispatch]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Grid container sx={{ p: 2, bgcolor: "background.paper" }}>
        <Grid size={12}>
          {selectedCustomer.id ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.action.hover,
              }}
            >
              <Avatar sx={{ mr: 1.5 }} />

              <Box sx={{ flexGrow: 1, minWidth: 0, mr: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
                  {selectedCustomer.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    fontSize: "0.75rem",
                  }}
                >
                  Selected Customer
                </Typography>
              </Box>

              <IconButton
                onClick={handleClearCustomer}
                sx={{
                  color: "error.main",
                  bgcolor: `${theme.palette.error.main}15`,
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor: `${theme.palette.error.main}25`,
                  },
                }}
                aria-label="Clear customer"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          ) : (
            <TouchButton
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleOpenModal}
              startIcon={<SearchIcon />}
              sx={{
                justifyContent: "flex-start",
                textAlign: "left",
                py: 1.5,
              }}
            >
              Select Customer (Optional)
            </TouchButton>
          )}
        </Grid>
      </Grid>

      <CustomerSelectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSelectCustomer={handleSelectCustomer}
      />
    </>
  );
};

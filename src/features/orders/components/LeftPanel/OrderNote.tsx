import {
  Add as AddIcon,
  Edit as EditIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useCallback, useState } from "react";
import { TouchButton } from "../../../../components/common/TouchButton";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { selectNotes, setNotes } from "../../../../store/orderSlice";
import { OrderNoteModal } from "../Modals/OrderNoteModal";

export const OrderNote = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectNotes);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSaveNote = useCallback(
    (note: string) => {
      dispatch(setNotes(note));
    },
    [dispatch]
  );

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
          {notes ? (
            <Box
              sx={{
                position: "relative",
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.action.hover,
              }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid size="auto">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: "warning.lighter",
                      color: "warning.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <NotesIcon sx={{ fontSize: 24 }} />
                  </Box>
                </Grid>

                <Grid size="grow" sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: "italic",
                      color: "text.primary",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                    }}
                  >
                    {notes}
                  </Typography>
                </Grid>

                <Grid size="auto">
                  <TouchButton
                    variant="outlined"
                    size="small"
                    onClick={handleOpenModal}
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      minWidth: 80,
                    }}
                  >
                    Edit
                  </TouchButton>
                </Grid>
              </Grid>
            </Box>
          ) : (
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
                color: "text.secondary",
              }}
            >
              Add Order Note (Optional)
            </TouchButton>
          )}
        </Grid>
      </Grid>

      <OrderNoteModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialNote={notes || ""}
        onSave={handleSaveNote}
      />
    </>
  );
};

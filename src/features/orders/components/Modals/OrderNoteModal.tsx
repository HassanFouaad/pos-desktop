import { Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { TouchButton } from "../../../../components/common/TouchButton";

interface OrderNoteModalProps {
  open: boolean;
  onClose: () => void;
  initialNote: string;
  onSave: (note: string) => void;
}

export const OrderNoteModal = ({
  open,
  onClose,
  initialNote,
  onSave,
}: OrderNoteModalProps) => {
  const [note, setNote] = useState(initialNote || "");

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const handleClose = () => {
    setNote(initialNote); // Reset to initial value on cancel
    onClose();
  };

  console.log({
    note,
    initialNote,
  });

  return (
    <ResponsiveDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      title={
        <Typography variant="h5" fontWeight={600}>
          Order Note
        </Typography>
      }
      actions={
        <Grid container spacing={2} sx={{ width: 1 }}>
          <Grid size={{ xs: 6 }}>
            <TouchButton
              fullWidth
              variant="outlined"
              onClick={handleClose}
              size="large"
            >
              Cancel
            </TouchButton>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TouchButton
              fullWidth
              variant="contained"
              onClick={handleSave}
              size="large"
            >
              Save
            </TouchButton>
          </Grid>
        </Grid>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a note to this order for future reference
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={note}
            onChange={(e) => {
              console.log(e.target.value);
              setNote(e.target.value);
            }}
            placeholder="Enter order notes here..."
            variant="outlined"
          />
        </Grid>
      </Grid>
    </ResponsiveDialog>
  );
};

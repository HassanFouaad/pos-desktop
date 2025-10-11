import { Notes as NotesIcon } from "@mui/icons-material";
import { Grid, Typography, useTheme } from "@mui/material";
import { InfoCard } from "../../../../components/cards/InfoCard";

interface CustomerDetailsNotesProps {
  notes: string;
}

export const CustomerDetailsNotes = ({ notes }: CustomerDetailsNotesProps) => {
  const theme = useTheme();

  if (!notes) {
    return null;
  }

  return (
    <InfoCard
      title="Customer Notes"
      icon={<NotesIcon sx={{ fontSize: 32 }} />}
      iconColor={theme.palette.warning.main}
      backgroundColor="paper"
    >
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.primary",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {notes}
          </Typography>
        </Grid>
      </Grid>
    </InfoCard>
  );
};

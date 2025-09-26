import { Close } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { TouchKeyboard } from "../../../components/common/TouchKeyboard";

interface ProductSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export const ProductSearch = ({
  onSearch,
  placeholder = "Search...",
}: ProductSearchProps) => {
  const [text, setText] = useState("");
  const [debouncedText] = useDebounce(text, 500);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    onSearch(debouncedText);
  }, [debouncedText, onSearch]);

  const handleKeyPress = (newText: string) => {
    setText(newText);
  };

  const handleEnter = () => {
    setKeyboardOpen(false);
  };

  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={text}
          placeholder={placeholder}
          onClick={() => setKeyboardOpen(true)}
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
      <Dialog
        open={keyboardOpen}
        onClose={() => setKeyboardOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {placeholder}
            <IconButton onClick={() => setKeyboardOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            value={text}
            placeholder={placeholder}
            sx={{ mb: 2 }}
            InputProps={{
              readOnly: true,
            }}
          />
          <TouchKeyboard
            initialValue={text}
            onKeyPress={handleKeyPress}
            onEnter={handleEnter}
          />
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

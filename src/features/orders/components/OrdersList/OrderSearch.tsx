import { Grid, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

interface OrderSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export const OrderSearch = ({
  onSearch,
  placeholder = "Search by order number...",
}: OrderSearchProps) => {
  const [text, setText] = useState("");
  const [debouncedText] = useDebounce(text, 500);

  useEffect(() => {
    onSearch(debouncedText);
  }, [debouncedText, onSearch]);

  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
      </Grid>
    </Grid>
  );
};

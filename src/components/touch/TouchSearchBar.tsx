import {
  Clear as ClearIcon,
  KeyboardOutlined,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  Modal,
  styled,
  TextField,
} from "@mui/material";
import { useState, useRef } from "react";
import { TouchKeyboard } from "./TouchKeyboard";

const SearchContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: theme.shape.borderRadius, // Use theme's border radius
    backgroundColor: theme.palette.background.paper,
    height: "56px",
    // boxShadow is handled by theme
    fontSize: "1.1rem",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderWidth: "1px",
  },
}));

const KeyboardModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
}));

const KeyboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: theme.spacing(2),
  borderTopRightRadius: theme.spacing(2),
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(4),
  // boxShadow is handled by theme
  width: "100%",
  maxWidth: "900px",
  outline: "none",
}));

export interface TouchSearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch?: (value: string) => void;
  onValueChange?: (value: string) => void;
  showVirtualKeyboard?: boolean;
}

export const TouchSearchBar = ({
  placeholder = "Search...",
  initialValue = "",
  onSearch,
  onValueChange,
  showVirtualKeyboard = true,
}: TouchSearchBarProps) => {
  const [value, setValue] = useState(initialValue);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  const handleClear = () => {
    setValue("");
    if (onValueChange) onValueChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (key: React.KeyboardEvent<HTMLDivElement>) => {
    if (key.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) onSearch(value);
  };

  const toggleKeyboard = () => {
    setShowKeyboard(!showKeyboard);
    if (!showKeyboard && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyboardInput = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  const handleKeyboardEnter = (finalValue: string) => {
    if (onSearch) onSearch(finalValue);
    setShowKeyboard(false);
  };

  return (
    <SearchContainer>
      <StyledTextField
        fullWidth
        inputRef={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onClick={() => showVirtualKeyboard && setShowKeyboard(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" sx={{ fontSize: 28 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <IconButton
                  aria-label="clear search"
                  onClick={handleClear}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              )}
              {showVirtualKeyboard && (
                <IconButton
                  aria-label="virtual keyboard"
                  onClick={toggleKeyboard}
                  edge="end"
                  color={showKeyboard ? "primary" : "default"}
                >
                  <KeyboardOutlined />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />

      {showVirtualKeyboard && (
        <KeyboardModal
          open={showKeyboard}
          onClose={() => setShowKeyboard(false)}
        >
          <ClickAwayListener onClickAway={() => setShowKeyboard(false)}>
            <KeyboardContainer>
              <TouchKeyboard
                initialValue={value}
                onKeyPress={handleKeyboardInput}
                onEnter={handleKeyboardEnter}
                mode="search"
              />
            </KeyboardContainer>
          </ClickAwayListener>
        </KeyboardModal>
      )}
    </SearchContainer>
  );
};

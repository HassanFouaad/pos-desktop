import {
  Backspace as BackspaceIcon,
  KeyboardReturn as EnterIcon,
  SpaceBar as SpaceIcon,
} from "@mui/icons-material";
import { Box, Paper, styled } from "@mui/material";
import { useCallback, useState } from "react";
import { TouchButton } from "./TouchButton";

// Styled components
const KeyboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  // boxShadow is handled by theme
  width: "100%",
  maxWidth: "900px",
  margin: "0 auto",
}));

const KeyboardRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
}));

const Key = styled(TouchButton)(({ theme }) => ({
  minWidth: "40px",
  minHeight: "48px",
  flex: 1,
  padding: theme.spacing(1),
  fontSize: "1rem",
  fontWeight: "normal",
  margin: "2px",
  // borderRadius is inherited from theme
}));

// Define keyboard layouts
const QWERTY_LAYOUT = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m", ",", "."],
];

export type TouchKeyboardMode = "text" | "email" | "search" | "password";

export interface TouchKeyboardProps {
  onKeyPress?: (key: string) => void;
  onEnter?: (value: string) => void;
  onClose?: () => void;
  initialValue?: string;
  mode?: TouchKeyboardMode;
}

export const TouchKeyboard = ({
  onKeyPress,
  onEnter,
  onClose,
  initialValue = "",
  mode = "text",
}: TouchKeyboardProps) => {
  const [value, setValue] = useState(initialValue);
  const [capsLock, setCapsLock] = useState(false);

  // Handle key press
  const handleKeyPress = useCallback(
    (key: string) => {
      let newValue = value;

      if (key === "backspace") {
        newValue = value.slice(0, -1);
      } else if (key === "space") {
        newValue = value + " ";
      } else if (key === "enter") {
        if (onEnter) {
          onEnter(value);
          return;
        }
      } else if (key === "capslock") {
        setCapsLock(!capsLock);
        return;
      } else {
        const keyToAdd = capsLock ? key.toUpperCase() : key;
        newValue = value + keyToAdd;
      }

      setValue(newValue);
      if (onKeyPress) onKeyPress(newValue);
    },
    [value, capsLock, onKeyPress, onEnter]
  );

  // Special keys based on mode
  const getSpecialKeys = () => {
    if (mode === "email") {
      return ["@", ".com", ".net", ".org"];
    }
    if (mode === "search") {
      return [];
    }
    return [];
  };

  return (
    <KeyboardContainer>
      {/* Number row */}
      <KeyboardRow>
        {QWERTY_LAYOUT[0].map((key) => (
          <Key key={key} variant="text" onClick={() => handleKeyPress(key)}>
            {key}
          </Key>
        ))}
      </KeyboardRow>

      {/* First letter row */}
      <KeyboardRow>
        {QWERTY_LAYOUT[1].map((key) => (
          <Key key={key} variant="text" onClick={() => handleKeyPress(key)}>
            {capsLock ? key.toUpperCase() : key}
          </Key>
        ))}
      </KeyboardRow>

      {/* Second letter row */}
      <KeyboardRow>
        <Key
          variant={capsLock ? "contained" : "text"}
          color={capsLock ? "primary" : "inherit"}
          onClick={() => handleKeyPress("capslock")}
          sx={{ flex: 1.5 }}
        >
          Caps
        </Key>
        {QWERTY_LAYOUT[2].map((key) => (
          <Key key={key} variant="text" onClick={() => handleKeyPress(key)}>
            {capsLock ? key.toUpperCase() : key}
          </Key>
        ))}
      </KeyboardRow>

      {/* Third letter row */}
      <KeyboardRow>
        {QWERTY_LAYOUT[3].map((key) => (
          <Key key={key} variant="text" onClick={() => handleKeyPress(key)}>
            {capsLock ? key.toUpperCase() : key}
          </Key>
        ))}
        <Key
          variant="text"
          color="error"
          onClick={() => handleKeyPress("backspace")}
          sx={{ flex: 1.5 }}
        >
          <BackspaceIcon />
        </Key>
      </KeyboardRow>

      {/* Special keys row */}
      <KeyboardRow>
        {getSpecialKeys().map((key) => (
          <Key key={key} variant="text" onClick={() => handleKeyPress(key)}>
            {key}
          </Key>
        ))}
        <Key
          variant="text"
          onClick={() => handleKeyPress("space")}
          sx={{ flex: mode === "email" ? 3 : 6 }}
        >
          <SpaceIcon />
        </Key>
        <Key
          variant="contained"
          color="primary"
          onClick={() => handleKeyPress("enter")}
          sx={{ flex: 2 }}
        >
          <EnterIcon />
        </Key>
      </KeyboardRow>
    </KeyboardContainer>
  );
};

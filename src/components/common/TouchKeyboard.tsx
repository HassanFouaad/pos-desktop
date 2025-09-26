import {
  Backspace as BackspaceIcon,
  KeyboardReturn as EnterIcon,
  SpaceBar as SpaceIcon,
} from "@mui/icons-material";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { TouchButton } from "./TouchButton";

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
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 2,
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Number row */}
      <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
        {QWERTY_LAYOUT[0].map((key) => (
          <Grid key={key} component="div" size={{ xs: 1.2 }}>
            <TouchButton
              fullWidth
              variant="text"
              onClick={() => handleKeyPress(key)}
            >
              <Typography variant="body1">{key}</Typography>
            </TouchButton>
          </Grid>
        ))}
      </Grid>

      {/* First letter row */}
      <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
        {QWERTY_LAYOUT[1].map((key) => (
          <Grid key={key} component="div" size={{ xs: 1.2 }}>
            <TouchButton
              fullWidth
              variant="text"
              onClick={() => handleKeyPress(key)}
            >
              <Typography variant="body1">
                {capsLock ? key.toUpperCase() : key}
              </Typography>
            </TouchButton>
          </Grid>
        ))}
      </Grid>

      {/* Second letter row */}
      <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
        <Grid size={{ xs: 1.8 }}>
          <TouchButton
            fullWidth
            variant={capsLock ? "contained" : "text"}
            color={capsLock ? "primary" : "inherit"}
            onClick={() => handleKeyPress("capslock")}
          >
            <Typography variant="body2">Caps</Typography>
          </TouchButton>
        </Grid>
        {QWERTY_LAYOUT[2].map((key) => (
          <Grid key={key} component="div" size={{ xs: 1.2 }}>
            <TouchButton
              fullWidth
              variant="text"
              onClick={() => handleKeyPress(key)}
            >
              <Typography variant="body1">
                {capsLock ? key.toUpperCase() : key}
              </Typography>
            </TouchButton>
          </Grid>
        ))}
      </Grid>

      {/* Third letter row */}
      <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
        {QWERTY_LAYOUT[3].map((key) => (
          <Grid key={key} component="div" size={{ xs: 1.2 }}>
            <TouchButton
              fullWidth
              variant="text"
              onClick={() => handleKeyPress(key)}
            >
              <Typography variant="body1">
                {capsLock ? key.toUpperCase() : key}
              </Typography>
            </TouchButton>
          </Grid>
        ))}
        <Grid component="div" size={{ xs: 1.8 }}>
          <TouchButton
            fullWidth
            variant="text"
            color="error"
            onClick={() => handleKeyPress("backspace")}
          >
            <BackspaceIcon />
          </TouchButton>
        </Grid>
      </Grid>

      {/* Special keys row */}
      <Grid container spacing={0.5}>
        {getSpecialKeys().map((key) => (
          <Grid
            key={key}
            component="div"
            size={{ xs: mode === "email" ? 3 : 2 }}
          >
            <TouchButton
              fullWidth
              variant="text"
              onClick={() => handleKeyPress(key)}
            >
              <Typography variant="body1">{key}</Typography>
            </TouchButton>
          </Grid>
        ))}
        <Grid component="div" size={{ xs: mode === "email" ? 3 : 6 }}>
          <TouchButton
            fullWidth
            variant="text"
            onClick={() => handleKeyPress("space")}
          >
            <SpaceIcon />
          </TouchButton>
        </Grid>
        <Grid component="div" size={{ xs: 2 }}>
          <TouchButton
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => handleKeyPress("enter")}
          >
            <EnterIcon />
          </TouchButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

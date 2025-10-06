import {
  ArrowBack as BackIcon,
  Close as CloseIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  useTheme as useMuiTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

export interface NavigationAction {
  icon: React.ReactNode;
  name: string;
  onClick: () => void;
}

export interface FloatingNavigationProps {
  showBackButton?: boolean;
  extraActions?: NavigationAction[];
}

export const FloatingNavigation = ({
  showBackButton = false,
  extraActions = [],
}: FloatingNavigationProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  // Use Redux theme state via custom hook
  const { mode, toggleTheme } = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleBack = () => navigate(-1);

  // Default actions
  const defaultActions: NavigationAction[] = [
    {
      icon: mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />,
      name: mode === "dark" ? "Light Mode" : "Dark Mode",
      onClick: toggleTheme,
    },
    {
      icon: <SettingsIcon />,
      name: "Settings",
      onClick: () => navigate("/settings"),
    },
  ];

  // Combine default and extra actions
  const allActions = [...defaultActions, ...extraActions];

  return (
    <>
      {/* Back button */}
      {showBackButton && (
        <Box
          sx={{
            position: "fixed",
            top: (theme) => theme.spacing(2),
            left: (theme) => theme.spacing(2),
            zIndex: muiTheme.zIndex.speedDial,
          }}
        >
          <Tooltip title="Back">
            <Fab
              size="medium"
              color="default"
              aria-label="back"
              onClick={handleBack}
            >
              <BackIcon />
            </Fab>
          </Tooltip>
        </Box>
      )}

      {/* SpeedDial for settings and actions */}
      <Box
        sx={{
          position: "fixed",
          bottom: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
          zIndex: muiTheme.zIndex.speedDial,
        }}
      >
        <SpeedDial
          ariaLabel="navigation actions"
          icon={<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          direction="up"
        >
          {allActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.onClick();
                handleClose();
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    </>
  );
};

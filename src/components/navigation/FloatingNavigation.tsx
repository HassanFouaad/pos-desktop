import {
  ArrowBack as BackIcon,
  Close as CloseIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Fab,
  Grid,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

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
  const theme = useTheme();
  const { mode, toggleTheme } = useContext(ThemeContext);

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
    <Grid container>
      {/* Back button */}
      {showBackButton && (
        <Grid
          component="div"
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <Tooltip title="Back">
            <Fab
              size="medium"
              color="default"
              aria-label="back"
              onClick={handleBack}
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              }}
            >
              <BackIcon />
            </Fab>
          </Tooltip>
        </Grid>
      )}

      {/* SpeedDial for settings and actions */}
      <Grid
        component="div"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: theme.zIndex.speedDial,
        }}
      >
        <SpeedDial
          ariaLabel="navigation actions"
          icon={<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          direction="up"
          FabProps={{
            sx: {
              bgcolor: theme.palette.primary.main,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            },
          }}
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
              FabProps={{
                sx: {
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                },
              }}
            />
          ))}
        </SpeedDial>
      </Grid>
    </Grid>
  );
};

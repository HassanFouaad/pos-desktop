import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Stack,
  styled,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";

// Styled components
const PosContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
}));

const PosAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const NavDrawer = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 280,
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.paper,
  },
}));

const BottomActions = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
  padding: theme.spacing(2),
  zIndex: 10,
}));

// Props interface
export interface POSLayoutModernProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  bottomActions?: ReactNode;
  sidebarContent?: ReactNode;
  appBarContent?: ReactNode;
}

export const POSLayoutModern = ({
  children,
  title = "Modern POS",
  showBackButton = false,
  bottomActions,
  sidebarContent,
  appBarContent,
}: POSLayoutModernProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleBackNavigation = () => {
    navigate(-1);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Only show drawer when sidebar content is provided
  const showDrawer = !!sidebarContent;

  return (
    <PosContainer>
      {/* App Bar */}
      <PosAppBar position="static">
        <Toolbar>
          {showBackButton ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={handleBackNavigation}
              sx={{ mr: 2 }}
            >
              <BackIcon />
            </IconButton>
          ) : (
            showDrawer && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {/* Custom App Bar Content */}
          {appBarContent}
        </Toolbar>
      </PosAppBar>

      {/* Main Content with optional Drawer */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Side Drawer */}
        {showDrawer && (
          <NavDrawer
            variant={isMobile ? "temporary" : "persistent"}
            open={isMobile ? drawerOpen : true}
            onClose={toggleDrawer}
          >
            <Toolbar /> {/* Spacer to match AppBar height */}
            {sidebarContent}
          </NavDrawer>
        )}

        {/* Main Content Area */}
        <MainContent
          sx={{
            width: showDrawer && !isMobile ? "calc(100% - 280px)" : "100%",
          }}
        >
          <Stack
            direction="column"
            sx={{ height: "100%", pb: bottomActions ? 8 : 0 }}
          >
            {children}
          </Stack>
        </MainContent>
      </Box>

      {/* Bottom Action Bar (if provided) */}
      {bottomActions && (
        <BottomActions
          sx={{
            position: "fixed",
            bottom: 0,
            width: "100%",
          }}
        >
          {bottomActions}
        </BottomActions>
      )}
    </PosContainer>
  );
};

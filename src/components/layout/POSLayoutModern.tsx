import { ArrowBack as BackIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  Stack,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
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
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,

  overflowY: "auto",

  padding: theme.spacing(2),

  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const BottomActions = styled(Box)(({ theme }) => ({
  backgroundColor: "transparent",
  padding: theme.spacing(0),
  zIndex: 10,
  position: "fixed",
  bottom: 0,
  width: "100%",
}));

export interface POSLayoutModernProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  bottomActions?: ReactNode;
  appBarContent?: ReactNode;
}

export const POSLayoutModern = ({
  children,
  title = "Modern POS",
  showBackButton = false,
  bottomActions,
  appBarContent,
}: POSLayoutModernProps) => {
  const navigate = useNavigate();

  const handleBackNavigation = () => {
    navigate(-1);
  };

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
          ) : null}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {/* Custom App Bar Content */}
          {appBarContent}
        </Toolbar>
      </PosAppBar>

      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <MainContent>
          <Stack
            direction="column"
            sx={{ height: 1, overflowY: "hidden", overflowX: "hidden" }}
          >
            {children}
          </Stack>
        </MainContent>
      </Box>

      {/* Bottom Action Bar (if provided) */}
      {bottomActions && <BottomActions>{bottomActions}</BottomActions>}
    </PosContainer>
  );
};

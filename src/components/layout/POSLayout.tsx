import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { ReactNode } from "react";
import { logout } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";

interface POSLayoutProps {
  children: ReactNode;
}

export const POSLayout = ({ children }: POSLayoutProps) => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    // No need to navigate here, the ProtectedRoute will handle it on re-render
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Modern POS
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
};

import {
  ShoppingCart as CartIcon,
  Person as CustomerIcon,
  Brightness4 as DarkModeIcon,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import { POSDashboard } from "./components/dashboard/POSDashboard";
import { POSLayoutModern } from "./components/layout/POSLayoutModern";
import { ThemeProviderWrapper } from "./components/theme/ThemeProviderWrapper";
import { NavItem, TouchFooterNav } from "./components/touch/TouchFooterNav";
import { ThemeContext, ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { authService } from "./features/auth/services/auth.service";
import { setAuthTokens, setCurrentUser } from "./store/authSlice";
import { useAppDispatch } from "./store/hooks";

// Main navigation items
const mainNavItems: NavItem[] = [
  { label: "Home", path: "/", icon: <HomeIcon sx={{ fontSize: 64 }} /> },
  {
    label: "Sales",
    path: "/sales",
    icon: <CartIcon sx={{ fontSize: 64 }} />,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: <CustomerIcon sx={{ fontSize: 64 }} />,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: <InventoryIcon sx={{ fontSize: 64 }} />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsIcon sx={{ fontSize: 64 }} />,
  },
];

// Dashboard wrapper with navigation
const DashboardWithNav = () => {
  const navigate = useNavigate();

  return <POSDashboard onNavigate={navigate} />;
};

// Theme Toggle Switch Component
const ThemeToggle = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
};

// POS App with modern layout
function App() {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const persistedUser = await authService.getPersistedUser();
        if (persistedUser) {
          dispatch(setCurrentUser(persistedUser));
          const token = localStorage.getItem("accessToken");
          if (token) {
            dispatch(setAuthTokens({ accessToken: token }));
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <ThemeProviderWrapper>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <POSLayoutModern
                    title="Modern POS"
                    appBarContent={<ThemeToggle />}
                    bottomActions={<TouchFooterNav items={mainNavItems} />}
                  >
                    <DashboardWithNav />
                  </POSLayoutModern>
                }
              />
              {/* These routes would be implemented as needed */}
              <Route
                path="/sales"
                element={
                  <POSLayoutModern showBackButton title="Sales">
                    <div>Sales Module</div>
                  </POSLayoutModern>
                }
              />
              <Route
                path="/customers"
                element={
                  <POSLayoutModern showBackButton title="Customers">
                    <div>Customers Module</div>
                  </POSLayoutModern>
                }
              />
              <Route
                path="/inventory"
                element={
                  <POSLayoutModern showBackButton title="Inventory">
                    <div>Inventory Module</div>
                  </POSLayoutModern>
                }
              />
              <Route
                path="/settings"
                element={
                  <POSLayoutModern showBackButton title="Settings">
                    <div>Settings Module</div>
                  </POSLayoutModern>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ThemeProviderWrapper>
    </ThemeProvider>
  );
}

export default App;

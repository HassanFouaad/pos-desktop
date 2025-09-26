import { CircularProgress, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
// Import the sync service and related handlers
import { syncService } from "./db/sync/sync.service";
// Import handlers to ensure they're registered
import { GridDashboard } from "./components/dashboard/GridDashboard";
import { GridLayout } from "./components/layout/GridLayout";
import { FloatingNavigation } from "./components/navigation/FloatingNavigation";
import { ThemeProviderWrapper } from "./components/theme/ThemeProviderWrapper";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { authService } from "./features/auth/services/auth.service";
import CustomersPage from "./features/customers/pages";
// Import customer handler to ensure it's registered with the sync service
import "./features/customers/services/customer-sync-handler";
import ProductsPage from "./features/products/pages";
import { setAuthTokens, setCurrentUser } from "./store/authSlice";
import { useAppDispatch } from "./store/hooks";

// Dashboard wrapper with navigation
const DashboardWithNav = () => {
  const navigate = useNavigate();
  return <GridDashboard onNavigate={navigate} />;
};

// Module placeholder component
interface ModulePlaceholderProps {
  title: string;
}

const ModulePlaceholder = ({ title }: ModulePlaceholderProps) => (
  <Grid
    container
    justifyContent="center"
    alignItems="center"
    sx={{ height: "100%" }}
  >
    <Grid sx={{ textAlign: "center" }}>{title} Module</Grid>
  </Grid>
);

// Main POS App
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
          // Start the sync service (which will handle customers and other entities)
          await syncService.start();
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Cleanup function to stop the sync service when the app unmounts
    return () => {
      syncService.stop();
    };
  }, [dispatch]);

  if (isInitializing) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh" }}
      >
        <Grid>
          <CircularProgress />
        </Grid>
      </Grid>
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
                  <GridLayout title="Modern POS">
                    <DashboardWithNav />

                    <FloatingNavigation />
                  </GridLayout>
                }
              />

              {/* Sales Module */}
              <Route
                path="/sales/*"
                element={
                  <GridLayout title="Sales">
                    <Grid>
                      <ModulePlaceholder title="Sales" />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* Customers Module */}
              <Route
                path="/customers"
                element={
                  <GridLayout title="Customers">
                    <Grid>
                      <CustomersPage />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* Inventory/Products Module */}
              <Route
                path="/products"
                element={
                  <GridLayout title="Products">
                    <Grid>
                      <ProductsPage />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* Orders Module */}
              <Route
                path="/orders"
                element={
                  <GridLayout title="Orders">
                    <Grid>
                      <ModulePlaceholder title="Orders" />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* Payments Module */}
              <Route
                path="/payments"
                element={
                  <GridLayout title="Payments">
                    <Grid>
                      <ModulePlaceholder title="Payments" />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* Receipts Module */}
              <Route
                path="/receipts"
                element={
                  <GridLayout title="Receipts">
                    <Grid>
                      <ModulePlaceholder title="Receipts" />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* Reports Module */}
              <Route
                path="/reports"
                element={
                  <GridLayout title="Reports">
                    <Grid>
                      <ModulePlaceholder title="Reports" />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* Settings Module */}
              <Route
                path="/settings"
                element={
                  <GridLayout title="Settings">
                    <Grid>
                      <ModulePlaceholder title="Settings" />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
                }
              />

              {/* More Module */}
              <Route
                path="/more"
                element={
                  <GridLayout title="More Options">
                    <Grid>
                      <ModulePlaceholder title="More Options" />
                    </Grid>
                    <FloatingNavigation showBackButton />
                  </GridLayout>
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

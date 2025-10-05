import { Grid } from "@mui/material";
import { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import { GridDashboard } from "./components/dashboard/GridDashboard";
import { GridLayout } from "./components/layout/GridLayout";
import { FloatingNavigation } from "./components/navigation/FloatingNavigation";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import PublicRoute from "./features/auth/components/PublicRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { PairDevicePage } from "./features/auth/pages/PairDevicePage";
import { PreLoginPage } from "./features/auth/pages/PreLoginPage";
import CustomersPage from "./features/customers/pages";
import ProductsPage from "./features/products/pages";
import { initAuth } from "./store/authSlice";
import { checkPairingStatus } from "./store/globalSlice";
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

  useEffect(() => {
    // Check pairing status first, then init auth
    dispatch(checkPairingStatus());
    dispatch(initAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/pair" element={<PairDevicePage />} />
        <Route path="/pre-login" element={<PreLoginPage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

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
                <CustomersPage />
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
  );
}

export default App;

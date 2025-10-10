import { Box, Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import { GridDashboard } from "./components/dashboard/GridDashboard";
import { GridLayout } from "./components/layouts/GridLayout";
import { StoreInactiveBlocker } from "./components/layouts/StoreInactiveBlocker";
import { FloatingNavigation } from "./components/navigation/FloatingNavigation";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import PublicRoute from "./features/auth/components/PublicRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { PairDevicePage } from "./features/auth/pages/PairDevicePage";
import { PreLoginPage } from "./features/auth/pages/PreLoginPage";
import CustomersPage from "./features/customers/pages";
import { CreateOrderPage, OrdersListPage } from "./features/orders";
import ProductsPage from "./features/products/pages";
import ProductListPage from "./features/products/pages/ProductListPage";
import { initAuth } from "./store/authSlice";
import { checkPairingStatus } from "./store/globalSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

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
    justifyContent="flex-start"
    alignItems="center"
    sx={{ height: "100%" }}
  >
    <Grid>
      <Typography variant="h5" textAlign="center">
        {title} Module
      </Typography>
    </Grid>
  </Grid>
);

// Main POS App
function App() {
  const dispatch = useAppDispatch();
  const { isPaired, pairingCheckComplete } = useAppSelector(
    (state) => state.global.pairing
  );
  const { initialized } = useAppSelector((state) => state.auth);

  // Combined initialization effect
  // Step 1: Check pairing status on mount
  // Step 2: Initialize auth only if device is paired
  useEffect(() => {
    // Only run pairing check once on mount
    if (!pairingCheckComplete) {
      dispatch(checkPairingStatus());
      return;
    }

    // Once pairing check is complete and device is paired, initialize auth
    if (isPaired && !initialized) {
      dispatch(initAuth());
    }
  }, [dispatch, pairingCheckComplete, isPaired, initialized]);

  // Show loading screen while checking pairing status
  if (!pairingCheckComplete) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh", width: "100vw" }}
      >
        <Grid sx={{ textAlign: "center" }}>
          <Typography variant="h4">Loading...</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box sx={{ height: "100vh", width: 1, overflow: "auto" }}>
      {/* Real-time store status blocker - monitors store.isActive */}
      <StoreInactiveBlocker />

      <Router>
        <Routes>
          {/* Pairing route - accessible even if not paired */}
          <Route path="/pair" element={<PairDevicePage />} />

          {/* Pre-login route - only accessible if paired but not authenticated */}
          <Route path="/pre-login" element={<PreLoginPage />} />

          {/* Login route - wrapped in PublicRoute for proper navigation */}
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
                <GridLayout>
                  <CreateOrderPage />
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
                  <ProductsPage />
                  <FloatingNavigation showBackButton />
                </GridLayout>
              }
            />

            {/* Product List by Category */}
            <Route
              path="/products/:categoryId"
              element={
                <GridLayout title="Products">
                  <ProductListPage />
                  <FloatingNavigation showBackButton />
                </GridLayout>
              }
            />

            {/* Orders Module */}
            <Route
              path="/orders"
              element={
                <GridLayout title="Orders">
                  <OrdersListPage />
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
    </Box>
  );
}

export default App;

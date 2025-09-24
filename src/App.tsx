import {
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  Person as CustomerIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import { POSLayoutModern } from "./components/layout/POSLayoutModern";
import { TouchFooterNav, NavItem } from "./components/touch/TouchFooterNav";
import { TouchSearchBar } from "./components/touch/TouchSearchBar";
import { POSDashboard } from "./components/dashboard/POSDashboard";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";

// Main navigation items
const mainNavItems: NavItem[] = [
  { label: "Home", path: "/", icon: <HomeIcon /> },
  { label: "Sales", path: "/sales", icon: <CartIcon /> },
  { label: "Customers", path: "/customers", icon: <CustomerIcon /> },
  { label: "Inventory", path: "/inventory", icon: <InventoryIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

// Dashboard wrapper with navigation
const DashboardWithNav = () => {
  const navigate = useNavigate();
  
  return (
    <POSDashboard onNavigate={navigate} />
  );
};

// POS App with modern layout
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <POSLayoutModern 
                title="Modern POS"
                bottomActions={<TouchFooterNav items={mainNavItems} />}
              >
                <DashboardWithNav />
              </POSLayoutModern>
            }
          />
          {/* These routes would be implemented as needed */}
          <Route path="/sales" element={<POSLayoutModern showBackButton title="Sales"><div>Sales Module</div></POSLayoutModern>} />
          <Route path="/customers" element={<POSLayoutModern showBackButton title="Customers"><div>Customers Module</div></POSLayoutModern>} />
          <Route path="/inventory" element={<POSLayoutModern showBackButton title="Inventory"><div>Inventory Module</div></POSLayoutModern>} />
          <Route path="/settings" element={<POSLayoutModern showBackButton title="Settings"><div>Settings Module</div></POSLayoutModern>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

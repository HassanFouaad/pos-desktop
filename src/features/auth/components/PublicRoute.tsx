import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";

// Public route component that handles pairing-aware routing
const PublicRoute = () => {
  const { isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );
  const { isPaired, pairingCheckComplete } = useAppSelector(
    (state) => state.global.pairing
  );
  console.log("PublicRoute", {
    isAuthenticated,
    initialized,
    isPaired,
    pairingCheckComplete,
  });

  // Wait for both checks to complete
  if (!initialized && !pairingCheckComplete) {
    return null;
  }
  console.log("public route after checks", {
    isAuthenticated,
    initialized,
    isPaired,
    pairingCheckComplete,
  });

  // If device is not paired, redirect to pairing page
  if (!isPaired) {
    return <Navigate to="/pair" replace />;
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

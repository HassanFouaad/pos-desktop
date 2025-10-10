import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../../../store/hooks";

export const ProtectedRoute = () => {
  const { isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );
  const { isPaired, pairingCheckComplete } = useAppSelector(
    (state) => state.global.pairing
  );

  // Wait for both auth and pairing checks to complete
  if (!initialized && !pairingCheckComplete) return null;

  // If device is not paired, redirect to pairing page
  if (!isPaired) {
    return <Navigate to="/pair" replace />;
  }

  // If device is paired but user is not authenticated, redirect to pre-login
  if (isPaired && !isAuthenticated) {
    return <Navigate to="/pre-login" replace />;
  }

  return <Outlet />;
};

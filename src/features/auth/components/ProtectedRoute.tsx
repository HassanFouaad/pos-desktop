import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../../../store/hooks";

export const ProtectedRoute = () => {
  const { isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  if (!initialized) return null;

  if (!isAuthenticated && initialized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

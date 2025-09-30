import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";

// Public route component that redirects to dashboard if authenticated
const PublicRoute = () => {
  const isInitialized = useAppSelector((state) => state.auth.initialized);

  if (!isInitialized) {
    return null;
  }

  return <Outlet />;
};

export default PublicRoute;

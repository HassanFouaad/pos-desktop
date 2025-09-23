import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDb, startSync } from "../../../db";
import { setAuthTokens, setCurrentUser } from "../../../store/authSlice";
import { useAppDispatch } from "../../../store/hooks";
import { LoginCredentials, login } from "../api/auth";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const authResponse = await login(data);

      dispatch(setAuthTokens({ accessToken: authResponse.accessToken }));
      dispatch(setCurrentUser(authResponse.user));

      await getDb();
      await startSync(authResponse.accessToken);

      navigate("/");
    } catch (err) {
      console.log(err);
      setError("Failed to sign in. Please check your credentials.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
  );
}

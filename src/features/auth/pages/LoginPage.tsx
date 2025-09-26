import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { LoginCredentials } from "../api/auth";
import { LoginForm } from "../components/LoginForm";
import { authService } from "../services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.loginUser(data);

      navigate("/");
    } catch (err: any) {
      console.log(err);
      setError(
        err.message || "Failed to sign in. Please check your credentials."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../store";
import { login } from "../../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { LoginCredentials } from "../api/auth";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const { loading: isLoading } = useAppSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async (data: LoginCredentials) => {
    setError(null);

    try {
      await dispatch(login(data)).unwrap();

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleBack = () => {
    navigate("/pre-login");
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
      onBack={handleBack}
    />
  );
}

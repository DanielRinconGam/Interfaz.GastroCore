import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { loginRequest, LoginResponse } from "@services/auth/authService";
import { storage } from "@services/auth/storageService";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidLoginData = (data: LoginResponse | null): boolean =>
  !!(
    data?.access_token &&
    data?.token_type &&
    data?.user &&
    typeof data.user.usuario_id === "number" &&
    data.user.nombres &&
    data.user.apellidos &&
    data.user.email
  );

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await storage.getItem("access_token");
        const user = await storage.getItem("user");
        if (token && user) router.replace("/tabs/home");
      } catch (e) {
        console.error("Session check error:", e);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    setErrorMsg("");

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMsg("Email y contraseña son obligatorios.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    const { data, error } = await loginRequest(trimmedEmail, trimmedPassword);

    if (error || !isValidLoginData(data)) {
      setErrorMsg(error || "No fue posible iniciar sesión. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    await storage.setItem("access_token", data!.access_token);
    await storage.setItem("token_type", data!.token_type);
    await storage.setItem("user", JSON.stringify(data!.user));
    router.replace("/tabs/home");
    setLoading(false);
  };

  return {
    email, setEmail,
    password, setPassword,
    loading, checkingSession,
    errorMsg, showPassword,
    setShowPassword, handleLogin,
  };
};
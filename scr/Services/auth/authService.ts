const API_BASE_URL = "https://gastrocore.ddns.net";

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    usuario_id: number;
    nombres: string;
    apellidos: string;
    email: string;
    rol: string;
    activo: boolean;
  };
};

type ApiErrorResponse = {
  detail?: string | { msg?: string } | Array<{ msg?: string }>;
};

const getApiErrorMessage = (data: ApiErrorResponse | null): string | null => {
  if (!data) return null;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.detail === "object" && !Array.isArray(data.detail) && data.detail?.msg)
    return data.detail.msg;
  if (Array.isArray(data.detail) && data.detail.length > 0)
    return data.detail[0]?.msg || null;
  return null;
};

export const loginRequest = async (
  email: string,
  password: string
): Promise<{ data: LoginResponse | null; error: string | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const rawText = await response.text();
    let data = null;
    try { data = rawText ? JSON.parse(rawText) : null; } catch { data = null; }

    if (!response.ok) {
      return { data: null, error: getApiErrorMessage(data) || "No fue posible iniciar sesión. Intenta nuevamente." };
    }
    return { data: data as LoginResponse, error: null };
  } catch {
    return { data: null, error: "No fue posible iniciar sesión. Intenta nuevamente." };
  }
};
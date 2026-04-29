import { storage } from "@services/auth/storageService";

const API_BASE_URL = "https://gastrocore.ddns.net";

export const ME_URL = `${API_BASE_URL}/api/v1/auth/me`;
export const EMPLOYEES_URL = `${API_BASE_URL}/api/v1/employees/`;

export type MeResponse = {
  usuario_id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  activo?: boolean;
};

export type Employee = {
  usuario_id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  activo: boolean;
  created_at: string;
};

export const validateCurrentUser = async () => {
  try {
    const token = await storage.getItem("access_token");
    if (!token) return null;

    const response = await fetch(ME_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) return null;

    const data = await response.json();

    return { token, me: data, hasAccess: true };
  } catch (error) {
    console.log("Error validate:", error);
    return null;
  }
};

export const fetchEmployees = async (token: string): Promise<Employee[]> => {
  try {
    const response = await fetch(EMPLOYEES_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      ...item,
      rol: (item.rol || "").toUpperCase(),
    }));
  } catch (error) {
    console.log("Error empleados:", error);
    return [];
  }
};

export const deleteEmployee = async (id: number, token: string) => {
  try {
    const response = await fetch(`${EMPLOYEES_URL}${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
};

export const toggleEmployeeStatus = async (
  id: number,
  currentStatus: boolean,
  token: string
) => {
  try {
    const response = await fetch(`${EMPLOYEES_URL}${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ activo: !currentStatus }),
    });
    return { ok: response.ok, nextStatus: !currentStatus };
  } catch {
    return { ok: false };
  }
};
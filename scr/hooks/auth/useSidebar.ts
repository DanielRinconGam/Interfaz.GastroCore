import { useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_BASE_URL = "https://gastrocore.ddns.net";

const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") return localStorage.setItem(key, value);
    return await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string) {
    if (Platform.OS === "web") return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  async removeItem(key: string) {
    if (Platform.OS === "web") return localStorage.removeItem(key);
    return await SecureStore.deleteItemAsync(key);
  },
};

type MeResponse = {
  usuario_id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  activo: boolean;
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ["ALL"],
  ADMIN: ["ALL"],
  MESERO: ["dashboard", "mesas", "pedidos"],
  COCINA: ["dashboard", "cocina"],
  CAJA: ["dashboard", "caja"],
};

export function useSidebar(sections: any, router: any) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = await storage.getItem("access_token");

        if (!token) {
          await storage.removeItem("access_token");
          router.replace("/auth/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok || !data) {
          await storage.removeItem("access_token");
          router.replace("/auth/login");
          return;
        }

        setUserRole((data.rol || "").toUpperCase());
      } catch {
        router.replace("/auth/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    validateSession();
  }, []);

  const baseData = sections ?? [
    {
      title: "OPERACIÓN",
      items: [
        { key: "dashboard", label: "Dashboard", route: "../tabs/home", icon: "view-dashboard-outline" },
        { key: "mesas", label: "Mesas", route: "/mesas", icon: "table-furniture" },
        {
          key: "pedidos",
          label: "Pedidos",
          icon: "clipboard-text-outline",
          children: [
            { key: "p-nuevo", label: "Nuevo pedido", route: "/pedidos/nuevo" },
            { key: "p-activos", label: "Activos", route: "/pedidos/activos" },
          ],
        },
        {
          key: "cocina",
          label: "Cocina",
          icon: "chef-hat",
          children: [
            { key: "c-prep", label: "En preparación", route: "/cocina/preparacion" },
          ],
        },
        { key: "caja", label: "Caja", icon: "cash-register", route: "/caja/por-cobrar" },
      ],
    },
    {
      title: "ADMINISTRACIÓN",
      items: [
        { key: "catalogo", label: "Menú / Productos", icon: "silverware-fork-knife", route: "/catalogo/productos" },
        { key: "inventario", label: "Inventario", icon: "package-variant-closed", route: "/inventario/stock" },
        { key: "empleados", label: "Empleados", icon: "badge-account-outline", route: "/tabs/employees" },
      ],
    },
  ];

  const data = useMemo(() => {
    if (!userRole) return [];

    const permissions = ROLE_PERMISSIONS[userRole] || [];

    return baseData
      .map((section: any) => {
        const filteredItems = section.items.filter((item: any) => {
          if (permissions.includes("ALL")) return true;

          if (item.children) {
            item.children = item.children.filter(() =>
              permissions.includes(item.key)
            );
            return item.children.length > 0;
          }

          return permissions.includes(item.key);
        });

        return { ...section, items: filteredItems };
      })
      .filter((section: any) => section.items.length > 0);
  }, [baseData, userRole]);

  return { data, checkingAuth };
}
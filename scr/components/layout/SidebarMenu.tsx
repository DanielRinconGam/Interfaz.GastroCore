import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native";

const PRIMARY = "#46A38C";
const PRIMARY_SOFT = "#EAF7F3";
const TEXT_COLOR = "#475569";
const API_BASE_URL = "https://gastrocore.ddns.net";

const TOP_OFFSET =
  60 + (Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string) {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
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

export default function SidebarMenu({
  sections,
  expandedWidth = 260,
  collapsedWidth = 72,
  isMobile = false,
  mobileOpen = false,
  onCloseMobile,
  collapsed: collapsedProp,
  onToggleCollapsed,
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed =
    collapsedProp !== undefined ? collapsedProp : internalCollapsed;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const widthAnim = useRef(
    new Animated.Value(collapsed ? collapsedWidth : expandedWidth),
  ).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isMobile ? width : collapsed ? collapsedWidth : expandedWidth,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [collapsed, isMobile, width, collapsedWidth, expandedWidth, widthAnim]);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = await storage.getItem("access_token");

        if (!token) {
          await storage.removeItem("access_token");
          await storage.removeItem("token_type");
          await storage.removeItem("user");
          router.replace("/auth/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const rawText = await response.text();

        let data: MeResponse | null = null;

        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch {
          data = null;
        }

        if (!response.ok || !data) {
          await storage.removeItem("access_token");
          await storage.removeItem("token_type");
          await storage.removeItem("user");
          router.replace("/auth/login");
          return;
        }

        await storage.setItem("user", JSON.stringify(data));
        setUserRole((data.rol || "").toUpperCase());
      } catch (error) {
        console.error("Auth validation error:", error);
        await storage.removeItem("access_token");
        await storage.removeItem("token_type");
        await storage.removeItem("user");
        router.replace("/auth/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    validateSession();
  }, [router]);

  const canSeeAdministration =
    userRole === "SUPERADMIN" || userRole === "ADMIN";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await storage.removeItem("access_token");
      await storage.removeItem("token_type");
      await storage.removeItem("user");

      if (isMobile && onCloseMobile) {
        onCloseMobile();
      }

      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/auth/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const baseData = sections ?? [
    {
      title: "OPERACIÓN",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          route: "../tabs/home",
          icon: "view-dashboard-outline",
        },
        {
          key: "mesas",
          label: "Mesas",
          route: "/mesas",
          icon: "table-furniture",
        },
        {
          key: "pedidos",
          label: "Pedidos",
          icon: "clipboard-text-outline",
          children: [
            { key: "p-nuevo", label: "Nuevo pedido", route: "/pedidos/nuevo" },
            { key: "p-activos", label: "Activos", route: "/pedidos/activos" },
            { key: "p-cocina", label: "En cocina", route: "/pedidos/cocina" },
            { key: "p-listos", label: "Listos", route: "/pedidos/listos" },
            {
              key: "p-entregados",
              label: "Entregados",
              route: "/pedidos/entregados",
            },
            {
              key: "p-cancelados",
              label: "Cancelados",
              route: "/pedidos/cancelados",
            },
            {
              key: "p-historial",
              label: "Historial",
              route: "/pedidos/historial",
            },
          ],
        },
        {
          key: "cocina",
          label: "Cocina",
          icon: "chef-hat",
          children: [
            {
              key: "c-prep",
              label: "En preparación",
              route: "/cocina/preparacion",
            },
            { key: "c-prio", label: "Prioridad", route: "/cocina/prioridad" },
          ],
        },
        {
          key: "caja",
          label: "Caja",
          icon: "cash-register",
          route: "/caja/por-cobrar",
        },
      ],
    },
    {
      title: "ADMINISTRACIÓN",
      items: [
        {
          key: "catalogo",
          label: "Menú / Productos",
          icon: "silverware-fork-knife",
          route: "/catalogo/productos",
        },
        {
          key: "inventario",
          label: "Inventario",
          icon: "package-variant-closed",
          route: "/inventario/stock",
        },
        {
          key: "empleados",
          label: "Empleados",
          icon: "badge-account-outline",
          route: "/tabs/employees",
        },
      ],
    },
  ];

  const data = useMemo(() => {
    return baseData.filter((section: any) => {
      if (section.title === "ADMINISTRACIÓN" && !canSeeAdministration) {
        return false;
      }
      return true;
    });
  }, [baseData, canSeeAdministration]);

  const go = (route?: string) => {
    if (route) {
      router.push(route as any);
      if (isMobile && onCloseMobile) onCloseMobile();
    }
  };

  const renderItem = (item: any) => {
    const active = item.route ? pathname.includes(item.route) : false;
    const hasChildren = !!item.children?.length;
    const isOpen = !!openGroups[item.key];

    return (
      <View key={item.key}>
        <Pressable
          onPress={() =>
            hasChildren && !collapsed
              ? setOpenGroups((p) => ({ ...p, [item.key]: !p[item.key] }))
              : go(item.route)
          }
          style={[styles.item, active && styles.itemActive]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={active ? PRIMARY : TEXT_COLOR}
          />
          {!collapsed && (
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          )}
          {!collapsed && hasChildren && (
            <MaterialCommunityIcons
              name={isOpen ? "chevron-down" : "chevron-right"}
              size={16}
              color={TEXT_COLOR}
              style={{ marginLeft: "auto" }}
            />
          )}
        </Pressable>

        {!collapsed && isOpen && hasChildren && (
          <View style={styles.subMenu}>
            {item.children.map((child: any) => (
              <Pressable
                key={child.key}
                onPress={() => go(child.route)}
                style={styles.subItem}
              >
                <Text
                  style={[
                    styles.subLabel,
                    pathname === child.route && styles.labelActive,
                  ]}
                >
                  • {child.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  const content = (
    <Animated.View
      style={[
        styles.sidebar,
        { width: widthAnim },
        isMobile && styles.sidebarMobile,
      ]}
    >
      {!isMobile && (
        <View
          style={[
            styles.headerPC,
            { alignItems: collapsed ? "center" : "flex-end" },
          ]}
        >
          <Pressable
            onPress={() =>
              onToggleCollapsed
                ? onToggleCollapsed()
                : setInternalCollapsed(!collapsed)
            }
            style={({ pressed }) => [
              styles.menuButton,
              { backgroundColor: pressed ? PRIMARY_SOFT : "transparent" },
            ]}
          >
            <MaterialCommunityIcons
              name={collapsed ? "menu" : "menu-open"}
              size={24}
              color={PRIMARY}
            />
          </Pressable>
        </View>
      )}

      {checkingAuth ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {data.map((section: any, i: number) => (
            <View key={i} style={styles.section}>
              {section.title && !collapsed && (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              )}
              {section.items.map(renderItem)}
            </View>
          ))}

          <View style={styles.bottomSection}>
            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              style={({ pressed }) => [
                styles.item,
                styles.logoutItem,
                pressed && styles.logoutItemPressed,
              ]}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color="#DC2626"
                />
              )}

              {!collapsed && (
                <Text style={styles.logoutLabel}>
                  {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );

  return isMobile ? (
    mobileOpen ? (
      <View style={styles.overlayContainer}>{content}</View>
    ) : null
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  sidebar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },
  sidebarMobile: { width: "100%", borderRightWidth: 0 },
  overlayContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
    marginTop: 60,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    backgroundColor: "#FFFFFF",
  },
  headerPC: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    height: 60,
    justifyContent: "center",
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 18,
    flexGrow: 1,
  },
  section: { paddingHorizontal: 12, marginBottom: 15 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
    paddingLeft: 10,
    letterSpacing: 0.5,
    marginTop: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 12,
    marginBottom: 2,
  },
  itemActive: { backgroundColor: PRIMARY_SOFT },
  label: { fontSize: 14, fontWeight: "600", color: TEXT_COLOR },
  labelActive: { color: PRIMARY },
  subMenu: {
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    marginTop: 4,
  },
  subItem: { paddingVertical: 6, paddingLeft: 15 },
  subLabel: { fontSize: 13, color: TEXT_COLOR },
  loaderContainer: {
    flex: 1,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSection: {
    marginTop: "auto",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutItemPressed: {
    backgroundColor: "#FEF2F2",
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },
});

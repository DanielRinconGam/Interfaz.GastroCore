import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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

const TOP_OFFSET =
  60 + (Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

  const widthAnim = useRef(
    new Animated.Value(collapsed ? collapsedWidth : expandedWidth),
  ).current;

  const data = sections ?? [
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

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isMobile ? width : collapsed ? collapsedWidth : expandedWidth,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [collapsed, isMobile, width]);

  const go = (route?: string) => {
    if (route) {
      router.push(route as any);
      if (isMobile && onCloseMobile) onCloseMobile();
    }
  };

  const renderItem = (item: any) => {
    const active = pathname.includes(item.route || "---");
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: isMobile ? 20 : 10 }}
      >
        {data.map((section: any, i: number) => (
          <View key={i} style={styles.section}>
            {section.title && !collapsed && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            {section.items.map(renderItem)}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
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
});

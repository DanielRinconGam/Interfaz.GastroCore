import { usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Animated,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    UIManager,
    View,
} from "react-native";

type MenuItem = {
  key: string;
  label: string;
  route?: string;
  icon?: string;
  children?: MenuItem[];
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

type Props = {
  initialCollapsed?: boolean;
  sections?: MenuSection[];
  expandedWidth?: number;
  collapsedWidth?: number;
  defaultOpenKeys?: string[];
};

const PRIMARY = "#46A38C";
const PRIMARY_SOFT = "#46A38C1A";
const PRIMARY_SOFT_2 = "#46A38C26";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SidebarMenu({
  initialCollapsed = false,
  sections,
  expandedWidth = 260,
  collapsedWidth = 72,
  defaultOpenKeys = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    defaultOpenKeys.forEach((k) => (init[k] = true));
    return init;
  });

  const widthAnim = useMemo(
    () => new Animated.Value(initialCollapsed ? collapsedWidth : expandedWidth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const data: MenuSection[] = sections ?? [
    {
      title: "OPERACIÓN",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          route: "/dashboard",
          icon: "📊",
        },
        { key: "mesas", label: "Mesas", route: "/mesas", icon: "🪑" },
        {
          key: "pedidos",
          label: "Pedidos",
          icon: "🧾",
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
          icon: "👨‍🍳",
          children: [
            {
              key: "c-prep",
              label: "En preparación",
              route: "/cocina/preparacion",
            },
            { key: "c-prio", label: "Prioridad", route: "/cocina/prioridad" },
            { key: "c-listos", label: "Listos", route: "/cocina/listos" },
            { key: "c-hist", label: "Historial", route: "/cocina/historial" },
          ],
        },
        {
          key: "caja",
          label: "Caja",
          icon: "💳",
          children: [
            {
              key: "c-porcobrar",
              label: "Por cobrar",
              route: "/caja/por-cobrar",
            },
            { key: "c-pagos", label: "Pagos", route: "/caja/pagos" },
            { key: "c-hist", label: "Historial", route: "/caja/historial" },
          ],
        },
      ],
    },
    {
      title: "ADMINISTRACIÓN",
      items: [
        {
          key: "catalogo",
          label: "Menú / Productos",
          icon: "🍔",
          children: [
            { key: "cat", label: "Categorías", route: "/catalogo/categorias" },
            { key: "prod", label: "Productos", route: "/catalogo/productos" },
            {
              key: "mods",
              label: "Modificadores",
              route: "/catalogo/modificadores",
            },
            {
              key: "promos",
              label: "Combos / Promos",
              route: "/catalogo/promos",
            },
            {
              key: "disp",
              label: "Disponibilidad",
              route: "/catalogo/disponibilidad",
            },
          ],
        },
        {
          key: "inventario",
          label: "Inventario",
          icon: "📦",
          children: [
            {
              key: "inv-stock",
              label: "Stock actual",
              route: "/inventario/stock",
            },
            {
              key: "inv-mov",
              label: "Movimientos",
              route: "/inventario/movimientos",
            },
            {
              key: "inv-alert",
              label: "Alertas",
              route: "/inventario/alertas",
            },
            {
              key: "inv-prov",
              label: "Proveedores",
              route: "/inventario/proveedores",
            },
          ],
        },
        {
          key: "clientes",
          label: "Clientes",
          icon: "👤",
          children: [
            { key: "cli-lista", label: "Lista", route: "/clientes" },
            {
              key: "cli-hist",
              label: "Historial",
              route: "/clientes/historial",
            },
            {
              key: "cli-frec",
              label: "Frecuentes",
              route: "/clientes/frecuentes",
            },
          ],
        },
        {
          key: "empleados",
          label: "Empleados",
          icon: "👥",
          children: [
            { key: "emp-lista", label: "Lista", route: "/empleados" },
            { key: "emp-roles", label: "Roles", route: "/empleados/roles" },
            { key: "emp-turnos", label: "Turnos", route: "/empleados/turnos" },
            {
              key: "emp-actividad",
              label: "Actividad",
              route: "/empleados/actividad",
            },
          ],
        },
        {
          key: "mesas-config",
          label: "Mesas (configuración)",
          route: "/admin/mesas",
          icon: "🪑",
        },
      ],
    },
    {
      title: "SISTEMA",
      items: [
        {
          key: "reportes",
          label: "Reportes",
          icon: "📈",
          children: [
            {
              key: "rep-dia",
              label: "Ventas día/mes",
              route: "/reportes/ventas",
            },
            {
              key: "rep-prod",
              label: "Por producto",
              route: "/reportes/producto",
            },
            {
              key: "rep-emp",
              label: "Por empleado",
              route: "/reportes/empleado",
            },
            { key: "rep-margen", label: "Margen", route: "/reportes/margen" },
          ],
        },
        {
          key: "config",
          label: "Configuración",
          icon: "⚙️",
          children: [
            {
              key: "conf-perfil",
              label: "Perfil restaurante",
              route: "/config/perfil",
            },
            { key: "conf-brand", label: "Branding", route: "/config/branding" },
            {
              key: "conf-pago",
              label: "Métodos de pago",
              route: "/config/pagos",
            },
            { key: "conf-tax", label: "Impuestos", route: "/config/impuestos" },
            {
              key: "conf-int",
              label: "Integraciones",
              route: "/config/integraciones",
            },
            { key: "conf-idioma", label: "Idioma", route: "/config/idioma" },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    if (collapsed) setOpenGroups({});
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) return;
    const nextOpen: Record<string, boolean> = {};
    for (const section of data) {
      for (const item of section.items) {
        if (item.children?.some((c) => c.route === pathname))
          nextOpen[item.key] = true;
      }
    }
    if (Object.keys(nextOpen).length) {
      setOpenGroups((prev) => ({ ...prev, ...nextOpen }));
    }
  }, [pathname, collapsed]);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    Animated.timing(widthAnim, {
      toValue: next ? collapsedWidth : expandedWidth,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const go = (route?: string) => {
    if (!route) return;
    router.push(route as any);
  };

  const isActiveRoute = (route?: string) => !!route && pathname === route;

  const isGroupActive = (item: MenuItem) => {
    if (isActiveRoute(item.route)) return true;
    if (!item.children?.length) return false;
    return item.children.some((c) => isActiveRoute(c.route));
  };

  const toggleGroup = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderItem = (item: MenuItem) => {
    const hasChildren = !!item.children?.length;
    const active = isGroupActive(item);
    const open = !!openGroups[item.key];

    const onPress = () => {
      if (hasChildren && !collapsed) toggleGroup(item.key);
      else go(item.route);
    };

    return (
      <View key={item.key} style={styles.itemWrap}>
        <Pressable
          onPress={onPress}
          hitSlop={collapsed ? 10 : 6}
          style={({ pressed }) => [
            styles.item,
            collapsed && styles.itemCollapsed,
            active && styles.itemActive,
            pressed && styles.itemPressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
        >
          <View style={[styles.iconBox, active && styles.iconBoxActive]}>
            <Text style={[styles.icon, active && styles.iconActive]}>
              {item.icon ?? "•"}
            </Text>
          </View>

          {!collapsed && (
            <View style={styles.labelRow}>
              <Text style={[styles.label, active && styles.labelActive]}>
                {item.label}
              </Text>

              {hasChildren && (
                <Text style={[styles.chevron, active && styles.chevronActive]}>
                  {open ? "▾" : "▸"}
                </Text>
              )}
            </View>
          )}
        </Pressable>

        {/* Submenu con línea alineada al icono (no al texto) */}
        {!collapsed && hasChildren && open && (
          <View style={styles.subMenu}>
            {item.children!.map((child) => {
              const childActive = isActiveRoute(child.route);
              return (
                <Pressable
                  key={child.key}
                  onPress={() => go(child.route)}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.subMenuItem,
                    childActive && styles.subMenuItemActive,
                    pressed && styles.subMenuItemPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: childActive }}
                >
                  <Text
                    style={[styles.bullet, childActive && styles.bulletActive]}
                  >
                    •
                  </Text>
                  <Text
                    style={[
                      styles.subLabel,
                      childActive && styles.subLabelActive,
                    ]}
                  >
                    {child.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.sidebar,
        { width: widthAnim },
        Platform.OS === "web" ? styles.webShadow : null,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>A</Text>
        </View>

        {!collapsed && <Text style={styles.brand}>Administrador</Text>}

        {/* CAMBIO MÍNIMO #1: botón más pequeño y alineado con la “A” */}
        <Pressable
          onPress={toggleSidebar}
          style={[styles.collapseBtn, collapsed && styles.collapseBtnCollapsed]}
          hitSlop={12}
          accessibilityRole="button"
        >
          <Text style={styles.collapseIcon}>{collapsed ? "›" : "‹"}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((section, idx) => (
          <View
            key={`${section.title ?? "section"}-${idx}`}
            style={styles.section}
          >
            {!!section.title && !collapsed && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            {section.items.map((item) => renderItem(item))}
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#EEF2F7",
    paddingVertical: 12,
    position: "relative",
    zIndex: 999,
    ...Platform.select({
      android: { elevation: 16 },
      default: {},
    }),
  },
  webShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 1000,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFF", fontWeight: "900" },
  brand: { fontSize: 14, fontWeight: "800", color: TEXT_DARK },

  // CAMBIO MÍNIMO #1: más pequeño
  collapseBtn: {
    marginLeft: "auto",
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 2000,
    ...Platform.select({
      android: { elevation: 20 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 5 },
      },
      default: {},
    }),
  },
  // CAMBIO MÍNIMO #1: cuando colapsa, lo alineo a la altura de la “A” y sobresale poco
  collapseBtnCollapsed: {
    position: "absolute",
    right: -8,
    top: 4, // alineado con el centro del logo (36px)
  },
  collapseIcon: { fontSize: 14, color: TEXT_DARK, fontWeight: "900" },

  body: { flex: 1, paddingHorizontal: 8, paddingTop: 6, overflow: "visible" },
  bodyContent: { paddingBottom: 16 },
  section: { marginBottom: 12, overflow: "visible" },
  sectionTitle: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 6,
    letterSpacing: 0.3,
  },

  itemWrap: { overflow: "visible" },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  itemPressed: { backgroundColor: PRIMARY_SOFT },
  itemActive: { backgroundColor: PRIMARY_SOFT_2 },

  itemCollapsed: { paddingHorizontal: 8, justifyContent: "center" },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  iconBoxActive: { backgroundColor: PRIMARY_SOFT_2 },
  icon: { fontSize: 16, color: TEXT_DARK },
  iconActive: { color: PRIMARY },

  labelRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 13, color: TEXT_DARK, fontWeight: "700" },
  labelActive: { color: PRIMARY },

  chevron: {
    marginLeft: "auto",
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "800",
  },
  chevronActive: { color: PRIMARY },

  /*
    CAMBIO MÍNIMO #2: subMenu alineado al icono, no al texto.
    Antes: marginLeft: 52 (alineaba con el texto)
    Ahora: marginLeft ~ 27 (centro del icono) para que la línea "baje" justo debajo del emoji.
    Cálculo aproximado:
      item paddingHorizontal 10
      iconBox width 34
      centro iconBox ~ 10 + 17 = 27
  */
  subMenu: {
    marginLeft: 27,
    paddingLeft: 14, // separación entre línea y contenido
    marginTop: 4,
    marginBottom: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  subMenuItemPressed: { backgroundColor: PRIMARY_SOFT },
  subMenuItemActive: { backgroundColor: PRIMARY_SOFT_2 },

  bullet: { color: "#94A3B8", fontSize: 16, width: 14, textAlign: "center" },
  bulletActive: { color: PRIMARY },

  subLabel: { fontSize: 13, color: "#334155", fontWeight: "700" },
  subLabelActive: { color: PRIMARY },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";

import styles, { PRIMARY, TEXT_COLOR } from "../../../app/css/auth/siderMenuStyles";
import { useSidebar } from "../../hooks/auth/useSidebar";

export default function SidebarMenu({
  sections,
  expandedWidth = 260,
  collapsedWidth = 72,
  isMobile = false,
  mobileOpen = false,
  onCloseMobile,
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const { data, checkingAuth } = useSidebar(sections, router);

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [loggingOut, setLoggingOut] = useState(false);

  const widthAnim = useRef(new Animated.Value(expandedWidth)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: collapsed ? collapsedWidth : expandedWidth,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [collapsed]);

  // 🔴 LOGOUT FUNCIONANDO
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      if (Platform.OS === "web") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("user");
      } else {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("token_type");
        await SecureStore.deleteItemAsync("user");
      }

      router.replace("/auth/login"); 
    } catch (error) {
      router.replace("/auth/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const go = (route?: string) => {
    if (route) {
      router.push(route as any);
      if (isMobile && onCloseMobile) onCloseMobile(); // 🔥 cerrar al navegar en mobile
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
            hasChildren
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
        </Pressable>

        {!collapsed && isOpen && hasChildren && (
          <View style={styles.subMenu}>
            {item.children.map((child: any) => (
              <Pressable key={child.key} onPress={() => go(child.route)}>
                <Text style={styles.subLabel}>• {child.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 🔥 ocultar completamente en mobile si está cerrado
  if (isMobile && !mobileOpen) return null;

  return (
    <>
      {/* 🔥 overlay para cerrar tocando afuera */}
      {isMobile && (
        <Pressable
          onPress={onCloseMobile}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 998,
          }}
        />
      )}

      <Animated.View
        style={[
          styles.sidebar,
          { width: widthAnim },
          isMobile && {
            position: "absolute",
            zIndex: 999,
            height: "100%",
          },
        ]}
      >
        {checkingAuth ? (
          <ActivityIndicator color={PRIMARY} />
        ) : (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            
            {/* 🔹 MENÚ */}
            {data.map((section: any, i: number) => (
              <View key={i} style={styles.section}>
                {!collapsed && (
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                )}
                {section.items.map(renderItem)}
              </View>
            ))}

            {/* 🔻 BOTÓN LOGOUT */}
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
    </>
  );
}
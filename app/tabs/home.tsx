import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  View,
  useWindowDimensions,
} from "react-native";

import AppHeader from "../../scr/components/layout/AppHeader";
import SidebarMenu from "../../scr/components/layout/SidebarMenu";
import styles, { PRIMARY } from "../css/auth/homeStyles";

const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
};

export default function Index() {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await storage.getItem("access_token");

      if (!token) {
        // 🔥 REDIRECCIÓN SEGURA
        router.replace("/auth/login");
        return;
      }

      setIsChecking(false);
    } catch (error) {
      router.replace("/auth/login");
    }
  };

  // 🔥 SE EJECUTA CADA VEZ QUE LA PANTALLA SE ACTIVA
  useFocusEffect(
    useCallback(() => {
      setIsChecking(true); // importante para evitar parpadeos raros
      checkAuth();
    }, [])
  );

  // cerrar menú mobile si cambia tamaño
  useFocusEffect(
    useCallback(() => {
      if (!isMobile) setMobileOpen(false);
    }, [isMobile])
  );

  if (isChecking) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <AppHeader
        restaurantName="Restaurante La 85"
        isMobile={isMobile}
        mobileMenuOpen={mobileOpen}
        onMenuPress={() => setMobileOpen((prev) => !prev)}
      />

      {/* Sidebar Mobile */}
      {isMobile && (
        <SidebarMenu
          isMobile={true}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}

      <View style={styles.body}>
        {/* Sidebar Desktop */}
        {!isMobile && (
          <SidebarMenu
            isMobile={false}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((prev) => !prev)}
          />
        )}

        {/* Contenido */}
        <View style={styles.content}>
          {/* Tu contenido protegido aquí */}
        </View>
      </View>
    </View>
  );
}
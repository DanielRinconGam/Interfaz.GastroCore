import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import AppHeader from "../../scr/components/layout/AppHeader";
import SidebarMenu from "../../scr/components/layout/SidebarMenu";

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getItem("access_token");

      if (!token) {
        router.replace("/auth/login");
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      router.replace("/auth/login");
    }
  };

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#46A38C" />
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

      {isMobile && (
        <SidebarMenu
          isMobile={true}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}

      <View style={styles.body}>
        {!isMobile && (
          <SidebarMenu
            isMobile={false}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((prev) => !prev)}
          />
        )}

        <View style={styles.content}>{/* Tu contenido protegido aquí */}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
});

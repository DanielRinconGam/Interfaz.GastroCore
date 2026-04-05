import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import EmployeeForm from "../../scr/components/employees/EmployeeForm";
import AppHeader from "../../scr/components/layout/AppHeader";
import SidebarMenu from "../../scr/components/layout/SidebarMenu";

const PRIMARY = "#46A38C";
const PRIMARY_SOFT = "#EAF7F3";
const TEXT_MAIN = "#0F172A";
const TEXT_MUTED = "#64748B";
const LINE_COLOR = "#F1F5F9";

const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
};

export default function EmployeesScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();

  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  const filteredData = useMemo(() => {
    const s = q.trim().toLowerCase();
    return MOCK.filter((e) =>
      `${e.name} ${e.email} ${e.role}`.toLowerCase().includes(s),
    );
  }, [q]);

  const renderItem = ({ item }: any) => {
    const isActive = item.status === "active";

    if (isMobile) {
      return (
        <View style={localStyles.mobileWrapper}>
          <View style={localStyles.mobileMainRow}>
            <View style={localStyles.avatarMobile}>
              <Text style={localStyles.avatarText}>{item.initials}</Text>
            </View>
            <View style={localStyles.mobileContent}>
              <Text style={localStyles.mobileName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={localStyles.mobileEmail} numberOfLines={1}>
                {item.email}
              </Text>
              <View style={localStyles.mobileSubInfo}>
                <Text style={localStyles.mobileRoleText}>{item.role}</Text>
                <View style={localStyles.miniDivider} />
                <View
                  style={[
                    localStyles.statusDot,
                    {
                      backgroundColor: isActive ? PRIMARY : "#EF4444",
                      width: 6,
                      height: 6,
                    },
                  ]}
                />
                <Text
                  style={[
                    localStyles.statusText,
                    { color: isActive ? PRIMARY : "#EF4444", fontSize: 12 },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={localStyles.mobileActions}>
              <TouchableOpacity style={localStyles.btnMobile}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={18}
                  color={PRIMARY}
                />
              </TouchableOpacity>
              <TouchableOpacity style={localStyles.btnMobile}>
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={18}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
              <TouchableOpacity style={localStyles.btnMobile}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={localStyles.tr}>
        <View style={[localStyles.td, { flex: 3 }]}>
          <View style={localStyles.avatarSmall}>
            <Text style={localStyles.avatarTextSmall}>{item.initials}</Text>
          </View>
          <Text style={localStyles.tdTextMain}>{item.name}</Text>
        </View>
        <View style={[localStyles.td, { flex: 3 }]}>
          <Text style={localStyles.tdEmail}>{item.email}</Text>
        </View>
        <View style={[localStyles.td, { flex: 2 }]}>
          <Text style={localStyles.roleText}>{item.role}</Text>
        </View>
        <View style={[localStyles.td, { flex: 2 }]}>
          <View style={localStyles.statusContainer}>
            <View
              style={[
                localStyles.statusDot,
                { backgroundColor: isActive ? PRIMARY : "#EF4444" },
              ]}
            />
            <Text
              style={[
                localStyles.statusText,
                { color: isActive ? PRIMARY : "#EF4444" },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <View
          style={[
            localStyles.td,
            {
              flex: 1.5,
              justifyContent: "flex-end",
              flexDirection: "row",
              gap: 8,
            },
          ]}
        >
          <TouchableOpacity style={localStyles.actionIcon}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color={PRIMARY}
            />
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionIcon}>
            <MaterialCommunityIcons
              name="account-off-outline"
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionIcon}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={18}
              color="#FDA4AF"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFF",
        }}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        isMobile={isMobile}
        mobileMenuOpen={mobileOpen}
        onMenuPress={() => setMobileOpen(!mobileOpen)}
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
            onToggleCollapsed={() => setCollapsed(!collapsed)}
          />
        )}

        <View style={styles.content}>
          <View style={styles.fluidContainer}>
            {!showForm && (
              <View style={localStyles.headerRow}>
                <View>
                  <Text style={localStyles.pageTitle}>Empleados</Text>
                  <Text style={localStyles.pageSubtitle}>
                    Panel de control de equipo
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={localStyles.primaryBtn}
                  onPress={() => setShowForm(true)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                  {!isMobile && (
                    <Text style={localStyles.primaryBtnText}>Añadir</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {showForm ? (
              <EmployeeForm
                onBack={() => setShowForm(false)}
                onSuccess={() => {
                  setShowForm(false);
                }}
              />
            ) : (
              <>
                <View style={localStyles.searchBox}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={TEXT_MUTED}
                  />
                  <TextInput
                    style={localStyles.searchInput}
                    placeholder="Buscar..."
                    value={q}
                    onChangeText={setQ}
                  />
                </View>

                <View style={localStyles.listWrapper}>
                  {!isMobile && (
                    <View style={localStyles.tableHeader}>
                      <Text style={[localStyles.th, { flex: 3 }]}>Nombre</Text>
                      <Text style={[localStyles.th, { flex: 3 }]}>Correo</Text>
                      <Text style={[localStyles.th, { flex: 2 }]}>Cargo</Text>
                      <Text style={[localStyles.th, { flex: 2 }]}>Estado</Text>
                      <Text
                        style={[
                          localStyles.th,
                          { flex: 1.5, textAlign: "right" },
                        ]}
                      >
                        Acciones
                      </Text>
                    </View>
                  )}
                  <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => (
                      <View style={localStyles.divider} />
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const MOCK = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@restaurante.com",
    role: "Admin",
    status: "active",
    initials: "JP",
  },
  {
    id: "2",
    name: "Laura Ruiz",
    email: "laura@restaurante.com",
    role: "Mesera",
    status: "active",
    initials: "LR",
  },
  {
    id: "3",
    name: "Carlos Sosa",
    email: "carlos@restaurante.com",
    role: "Chef",
    status: "inactive",
    initials: "CS",
  },
];

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFF" },
  body: { flex: 1, flexDirection: "row" },
  content: { flex: 1, backgroundColor: "#FFF" },
  fluidContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Platform.OS === "web" ? "4%" : 15,
    paddingTop: 15,
  },
});

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pageTitle: { fontSize: 28, fontWeight: "800", color: TEXT_MAIN },
  pageSubtitle: { fontSize: 13, color: TEXT_MUTED },
  primaryBtn: {
    backgroundColor: PRIMARY,
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    gap: 6,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE_COLOR,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  listWrapper: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE_COLOR,
  },
  th: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_MUTED,
    textTransform: "uppercase",
  },
  tr: { flexDirection: "row", paddingVertical: 15, alignItems: "center" },
  td: { flexDirection: "row", alignItems: "center" },
  tdTextMain: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MAIN,
    marginLeft: 12,
  },
  tdEmail: { fontSize: 13, color: TEXT_MUTED },
  roleText: { fontSize: 13, color: TEXT_MAIN, fontWeight: "500" },
  statusContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "700", textTransform: "capitalize" },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: PRIMARY_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextSmall: { color: PRIMARY, fontWeight: "800", fontSize: 11 },
  divider: { height: 1, backgroundColor: LINE_COLOR },
  actionIcon: { padding: 4 },
  mobileWrapper: { paddingVertical: 12 },
  mobileMainRow: { flexDirection: "row", alignItems: "flex-start" },
  avatarMobile: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: PRIMARY_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: PRIMARY, fontWeight: "800", fontSize: 14 },
  mobileContent: { flex: 1, marginLeft: 12, paddingRight: 8 },
  mobileName: { fontSize: 15, fontWeight: "700", color: TEXT_MAIN },
  mobileEmail: { fontSize: 12, color: TEXT_MUTED },
  mobileSubInfo: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  mobileRoleText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
  miniDivider: {
    width: 1,
    height: 10,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  mobileActions: { flexDirection: "row", gap: 2 },
  btnMobile: {
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginLeft: 4,
  },
});

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

import AppToast from "../../scr/components/common/AppToast";
import ConfirmDialog from "../../scr/components/common/ConfirmDialog";
import EmployeeEditForm from "../../scr/components/employees/EmployeeEditForm";
import EmployeeForm from "../../scr/components/employees/EmployeeForm";
import AppHeader from "../../scr/components/layout/AppHeader";
import SidebarMenu from "../../scr/components/layout/SidebarMenu";

const PRIMARY = "#46A38C";
const PRIMARY_SOFT = "#EAF7F3";
const TEXT_MAIN = "#0F172A";
const TEXT_MUTED = "#64748B";
const LINE_COLOR = "#F1F5F9";

const API_BASE_URL = "https://gastrocore.ddns.net";
const ME_URL = `${API_BASE_URL}/api/v1/auth/me`;
const EMPLOYEES_URL = `${API_BASE_URL}/api/v1/employees/`;

const storage = {
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

type Employee = {
  usuario_id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  activo: boolean;
  created_at: string;
};

type ApiErrorResponse = {
  detail?: string;
};

type ApiMessageResponse = {
  mensaje?: string;
};

type ToastState = {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
};

export default function EmployeesScreen() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();

  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isChecking, setIsChecking] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hasAccess, setHasAccess] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(
    null,
  );

  const [statusConfirmVisible, setStatusConfirmVisible] = useState(false);
  const [employeeToToggleStatus, setEmployeeToToggleStatus] =
    useState<Employee | null>(null);
  const [togglingEmployeeId, setTogglingEmployeeId] = useState<number | null>(
    null,
  );

  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
  ) => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  const clearSessionAndGoLogin = async () => {
    await storage.removeItem("access_token");
    await storage.removeItem("token_type");
    await storage.removeItem("user");
    router.replace("/auth/login");
  };

  const validateCurrentUser = async () => {
    const token = await storage.getItem("access_token");

    if (!token) {
      await clearSessionAndGoLogin();
      return null;
    }

    const meResponse = await fetch(ME_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const meRawText = await meResponse.text();

    let meData: MeResponse | ApiErrorResponse | null = null;

    try {
      meData = meRawText ? JSON.parse(meRawText) : null;
    } catch {
      meData = null;
    }

    if (!meResponse.ok) {
      await clearSessionAndGoLogin();
      return null;
    }

    const validatedUser = meData as MeResponse;
    const normalizedRole = (validatedUser?.rol || "").toUpperCase();

    if (
      typeof validatedUser?.usuario_id !== "number" ||
      !validatedUser?.email ||
      validatedUser?.activo !== true
    ) {
      await clearSessionAndGoLogin();
      return null;
    }

    if (normalizedRole !== "SUPERADMIN" && normalizedRole !== "ADMIN") {
      return { token, me: validatedUser, hasAccess: false };
    }

    return { token, me: validatedUser, hasAccess: true };
  };

  const checkAuthAndLoad = async () => {
    try {
      const validation = await validateCurrentUser();

      if (!validation) return;

      if (!validation.hasAccess) {
        setHasAccess(false);
        router.replace("/tabs/home");
        return;
      }

      setHasAccess(true);
      await loadEmployees(validation.token);
    } catch (error) {
      await clearSessionAndGoLogin();
    } finally {
      setIsChecking(false);
    }
  };

  const loadEmployees = async (existingToken?: string) => {
    try {
      setLoadingEmployees(true);

      const token = existingToken || (await storage.getItem("access_token"));

      if (!token) {
        setEmployees([]);
        return;
      }

      const response = await fetch(EMPLOYEES_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const rawText = await response.text();

      let data: Employee[] | ApiErrorResponse | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if ((data as ApiErrorResponse | null)?.detail === "Not authenticated") {
          await clearSessionAndGoLogin();
          return;
        }

        setEmployees([]);
        return;
      }

      if (!Array.isArray(data)) {
        setEmployees([]);
        return;
      }

      const normalizedEmployees = data
        .filter((item) => {
          const role = (item?.rol || "").toUpperCase();

          return (
            typeof item?.usuario_id === "number" &&
            typeof item?.nombres === "string" &&
            typeof item?.apellidos === "string" &&
            typeof item?.email === "string" &&
            typeof item?.rol === "string" &&
            typeof item?.activo === "boolean" &&
            typeof item?.created_at === "string" &&
            role !== "SUPERADMIN"
          );
        })
        .map((item) => ({
          ...item,
          rol: (item.rol || "").toUpperCase(),
        }));

      setEmployees(normalizedEmployees);
    } catch (error) {
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const openEditForm = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setShowEditForm(true);
    setShowForm(false);
  };

  const openDeleteConfirm = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setConfirmVisible(true);
  };

  const closeDeleteConfirm = () => {
    if (deletingEmployeeId !== null) return;
    setConfirmVisible(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      setDeletingEmployeeId(employeeToDelete.usuario_id);

      const validation = await validateCurrentUser();

      if (!validation) return;

      if (!validation.hasAccess) {
        router.replace("/tabs/home");
        return;
      }

      const response = await fetch(
        `${EMPLOYEES_URL}${employeeToDelete.usuario_id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${validation.token}`,
          },
        },
      );

      let data: ApiErrorResponse | null = null;
      const rawText = await response.text();

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (data?.detail === "Not authenticated") {
          await clearSessionAndGoLogin();
          return;
        }

        showToast("No fue posible eliminar el empleado.", "error");
        return;
      }

      setEmployees((prev) =>
        prev.filter((e) => e.usuario_id !== employeeToDelete.usuario_id),
      );

      setConfirmVisible(false);
      setEmployeeToDelete(null);
      showToast("Empleado eliminado correctamente.", "success");
    } catch (error) {
      showToast("No fue posible eliminar el empleado.", "error");
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  const openStatusConfirm = (employee: Employee) => {
    setEmployeeToToggleStatus(employee);
    setStatusConfirmVisible(true);
  };

  const closeStatusConfirm = () => {
    if (togglingEmployeeId !== null) return;
    setStatusConfirmVisible(false);
    setEmployeeToToggleStatus(null);
  };

  const handleToggleEmployeeStatus = async () => {
    if (!employeeToToggleStatus) return;

    try {
      setTogglingEmployeeId(employeeToToggleStatus.usuario_id);

      const validation = await validateCurrentUser();

      if (!validation) return;

      if (!validation.hasAccess) {
        router.replace("/tabs/home");
        return;
      }

      const nextStatus = !employeeToToggleStatus.activo;

      const response = await fetch(
        `${EMPLOYEES_URL}${employeeToToggleStatus.usuario_id}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${validation.token}`,
          },
          body: JSON.stringify({
            activo: nextStatus,
          }),
        },
      );

      const rawText = await response.text();

      let data: ApiMessageResponse | ApiErrorResponse | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if ((data as ApiErrorResponse | null)?.detail === "Not authenticated") {
          await clearSessionAndGoLogin();
          return;
        }

        showToast("No fue posible actualizar el estado del empleado.", "error");
        return;
      }

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.usuario_id === employeeToToggleStatus.usuario_id
            ? { ...employee, activo: nextStatus }
            : employee,
        ),
      );

      setStatusConfirmVisible(false);
      setEmployeeToToggleStatus(null);

      showToast(
        (data as ApiMessageResponse | null)?.mensaje ||
          (nextStatus
            ? "Empleado activado correctamente."
            : "Empleado desactivado correctamente."),
        "success",
      );
    } catch (error) {
      showToast("No fue posible actualizar el estado del empleado.", "error");
    } finally {
      setTogglingEmployeeId(null);
    }
  };

  const filteredData = useMemo(() => {
    const s = q.trim().toLowerCase();

    return employees.filter((e) =>
      `${e.nombres} ${e.apellidos} ${e.email} ${e.rol}`
        .toLowerCase()
        .includes(s),
    );
  }, [q, employees]);

  const getInitials = (nombres: string, apellidos: string) => {
    const first = nombres?.trim()?.charAt(0) || "";
    const second = apellidos?.trim()?.charAt(0) || "";
    return `${first}${second}`.toUpperCase();
  };

  const formatRole = (rol: string) => {
    const normalized = (rol || "").toUpperCase();

    if (normalized === "ADMIN") return "Admin";
    if (normalized === "MESERO") return "Mesero";
    if (normalized === "COCINA") return "Cocina";
    if (normalized === "CAJA") return "Caja";

    return normalized;
  };

  const formatStatus = (activo: boolean) => {
    return activo ? "Activo" : "Inactivo";
  };

  const formatDate = (value: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Employee }) => {
    const isActive = item.activo;
    const fullName = `${item.nombres} ${item.apellidos}`;
    const initials = getInitials(item.nombres, item.apellidos);
    const isDeleting = deletingEmployeeId === item.usuario_id;
    const isToggling = togglingEmployeeId === item.usuario_id;

    if (isMobile) {
      return (
        <View style={localStyles.mobileWrapper}>
          <View style={localStyles.mobileMainRow}>
            <View style={localStyles.avatarMobile}>
              <Text style={localStyles.avatarText}>{initials}</Text>
            </View>

            <View style={localStyles.mobileContent}>
              <Text style={localStyles.mobileName} numberOfLines={1}>
                {fullName}
              </Text>

              <Text style={localStyles.mobileEmail} numberOfLines={1}>
                {item.email}
              </Text>

              <View style={localStyles.mobileSubInfo}>
                <Text style={localStyles.mobileRoleText}>
                  {formatRole(item.rol)}
                </Text>
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
                  {formatStatus(item.activo)}
                </Text>
                <View style={localStyles.miniDivider} />
                <Text style={localStyles.mobileDateText}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </View>

            <View style={localStyles.mobileActions}>
              <TouchableOpacity
                style={localStyles.btnMobile}
                onPress={() => openEditForm(item)}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={18}
                  color={PRIMARY}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.btnMobile}
                onPress={() => openStatusConfirm(item)}
                disabled={isToggling}
              >
                {isToggling ? (
                  <ActivityIndicator size="small" color={TEXT_MUTED} />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      item.activo
                        ? "account-off-outline"
                        : "account-check-outline"
                    }
                    size={18}
                    color={item.activo ? TEXT_MUTED : PRIMARY}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.btnMobile}
                onPress={() => openDeleteConfirm(item)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={18}
                    color="#EF4444"
                  />
                )}
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
            <Text style={localStyles.avatarTextSmall}>{initials}</Text>
          </View>
          <Text style={localStyles.tdTextMain}>{fullName}</Text>
        </View>

        <View style={[localStyles.td, { flex: 3 }]}>
          <Text style={localStyles.tdEmail}>{item.email}</Text>
        </View>

        <View style={[localStyles.td, { flex: 2 }]}>
          <Text style={localStyles.roleText}>{formatRole(item.rol)}</Text>
        </View>

        <View style={[localStyles.td, { flex: 1.6 }]}>
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
              {formatStatus(item.activo)}
            </Text>
          </View>
        </View>

        <View style={[localStyles.td, { flex: 1.8 }]}>
          <Text style={localStyles.tdDate}>{formatDate(item.created_at)}</Text>
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
          <TouchableOpacity
            style={localStyles.actionIcon}
            onPress={() => openEditForm(item)}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color={PRIMARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.actionIcon}
            onPress={() => openStatusConfirm(item)}
            disabled={isToggling}
          >
            {isToggling ? (
              <ActivityIndicator size="small" color="#94A3B8" />
            ) : (
              <MaterialCommunityIcons
                name={
                  item.activo ? "account-off-outline" : "account-check-outline"
                }
                size={18}
                color={item.activo ? "#94A3B8" : PRIMARY}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.actionIcon}
            onPress={() => openDeleteConfirm(item)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <MaterialCommunityIcons
                name="delete-outline"
                size={18}
                color="#FDA4AF"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isChecking) {
    return (
      <View style={localStyles.stateContainer}>
        <ActivityIndicator color={PRIMARY} />
        <Text style={localStyles.stateText}>Verificando permisos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        restaurantName="Restaurante La 85"
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
            <AppToast
              visible={toast.visible}
              message={toast.message}
              type={toast.type}
              onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
            />

            <ConfirmDialog
              visible={confirmVisible}
              title="Eliminar empleado"
              message={
                employeeToDelete
                  ? `¿Seguro que deseas eliminar a ${employeeToDelete.nombres} ${employeeToDelete.apellidos}? Esta acción no se puede deshacer.`
                  : "¿Seguro que deseas eliminar este empleado?"
              }
              confirmText="Sí, eliminar"
              cancelText="No, cancelar"
              destructive
              loading={deletingEmployeeId !== null}
              onCancel={closeDeleteConfirm}
              onConfirm={handleDeleteEmployee}
            />

            <ConfirmDialog
              visible={statusConfirmVisible}
              title={
                employeeToToggleStatus?.activo
                  ? "Desactivar empleado"
                  : "Activar empleado"
              }
              message={
                employeeToToggleStatus
                  ? employeeToToggleStatus.activo
                    ? `¿Estás seguro de desactivar a ${employeeToToggleStatus.nombres} ${employeeToToggleStatus.apellidos}?`
                    : `¿Estás seguro de activar a ${employeeToToggleStatus.nombres} ${employeeToToggleStatus.apellidos}?`
                  : "¿Estás seguro de cambiar el estado de este empleado?"
              }
              confirmText={
                employeeToToggleStatus?.activo
                  ? "Sí, desactivar"
                  : "Sí, activar"
              }
              cancelText="No, cancelar"
              loading={togglingEmployeeId !== null}
              onCancel={closeStatusConfirm}
              onConfirm={handleToggleEmployeeStatus}
            />

            {!showForm && !showEditForm && (
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
                  loadEmployees();
                  showToast("Empleado registrado correctamente.", "success");
                }}
              />
            ) : showEditForm && employeeToEdit ? (
              <EmployeeEditForm
                employee={employeeToEdit}
                onBack={() => {
                  setShowEditForm(false);
                  setEmployeeToEdit(null);
                }}
                onSuccess={(updatedEmployee) => {
                  setEmployees((prev) =>
                    prev.map((emp) =>
                      emp.usuario_id === updatedEmployee.usuario_id
                        ? updatedEmployee
                        : emp,
                    ),
                  );
                  setShowEditForm(false);
                  setEmployeeToEdit(null);
                  showToast("Empleado actualizado correctamente.", "success");
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
                      <Text style={[localStyles.th, { flex: 2 }]}>Rol</Text>
                      <Text style={[localStyles.th, { flex: 1.6 }]}>
                        Estado
                      </Text>
                      <Text style={[localStyles.th, { flex: 1.8 }]}>
                        Creado
                      </Text>
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

                  {loadingEmployees ? (
                    <View style={localStyles.loaderBox}>
                      <ActivityIndicator color={PRIMARY} />
                    </View>
                  ) : (
                    <FlatList
                      data={filteredData}
                      keyExtractor={(item) => item.usuario_id.toString()}
                      renderItem={renderItem}
                      ItemSeparatorComponent={() => (
                        <View style={localStyles.divider} />
                      )}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                      contentContainerStyle={{
                        paddingBottom: 40,
                        flexGrow: filteredData.length === 0 ? 1 : 0,
                      }}
                      style={{
                        flex: 1,
                        minHeight: Math.max(height - 220, 300),
                      }}
                      ListEmptyComponent={
                        <View style={localStyles.emptyBox}>
                          <Text style={localStyles.emptyText}>
                            No hay empleados para mostrar.
                          </Text>
                        </View>
                      }
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFF" },
  body: { flex: 1, flexDirection: "row" },
  content: { flex: 1, backgroundColor: "#FFF" },
  fluidContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Platform.OS === "web" ? "4%" : 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
});

const localStyles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: "#FFF",
  },
  stateText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: "500",
  },

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

  listWrapper: {
    flex: 1,
    minHeight: 0,
  },

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
  tdDate: { fontSize: 13, color: TEXT_MUTED },
  roleText: { fontSize: 13, color: TEXT_MAIN, fontWeight: "500" },

  statusContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "700" },

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
  mobileSubInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  mobileRoleText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
  mobileDateText: { fontSize: 12, color: TEXT_MUTED },
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

  loaderBox: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBox: {
    flex: 1,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

const PRIMARY = "#46A38C";
const PRIMARY_SOFT = "#EAF7F3";
const TEXT_MAIN = "#0F172A";
const TEXT_MUTED = "#64748B";
const LINE_COLOR = "#F1F5F9";
const API_BASE_URL = "https://gastrocore.ddns.net";
const EMPLOYEES_URL = `${API_BASE_URL}/api/v1/employees/`;
const ME_URL = `${API_BASE_URL}/api/v1/auth/me`;
const GENERIC_ERROR =
  "No fue posible actualizar el empleado. Intenta nuevamente.";

const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web") return localStorage.getItem(key);
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

const ROLES = [
  { id: "MESERO", icon: "account-tie-outline", label: "Mesero" },
  { id: "COCINA", icon: "silverware-fork-knife", label: "Cocina" },
  { id: "CAJA", icon: "cash-register", label: "Caja" },
  { id: "ADMIN", icon: "shield-account-outline", label: "Admin" },
];

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
  detail?: string | { msg?: string } | Array<{ msg?: string }>;
};

export default function EmployeeEditForm({
  employee,
  onBack,
  onSuccess,
}: {
  employee: Employee;
  onBack: () => void;
  onSuccess: (updatedEmployee: Employee) => void;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    nombres: employee.nombres || "",
    apellidos: employee.apellidos || "",
    email: employee.email || "",
    rol: (employee.rol || "MESERO").toUpperCase(),
  });

  const clearSessionAndExit = async (message = "Not authenticated") => {
    await storage.removeItem("access_token");
    await storage.removeItem("token_type");
    await storage.removeItem("user");
    setHasAccess(false);
    setErrorMsg(message);
    onBack();
  };

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const token = await storage.getItem("access_token");

        if (!token) {
          await clearSessionAndExit("Not authenticated");
          return;
        }

        const response = await fetch(ME_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const rawText = await response.text();

        let data: MeResponse | ApiErrorResponse | null = null;

        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch {
          data = null;
        }

        if (!response.ok) {
          await clearSessionAndExit("Not authenticated");
          return;
        }

        const meData = data as MeResponse;

        if (
          typeof meData?.usuario_id !== "number" ||
          !meData?.email ||
          !meData?.rol ||
          meData?.activo !== true
        ) {
          await clearSessionAndExit("Not authenticated");
          return;
        }

        const normalizedRole = (meData.rol || "").toUpperCase();

        if (normalizedRole !== "SUPERADMIN" && normalizedRole !== "ADMIN") {
          setHasAccess(false);
          setErrorMsg("No tienes permisos para editar empleados.");
          return;
        }

        setHasAccess(true);
      } catch (error) {
        await clearSessionAndExit("Not authenticated");
      } finally {
        setCheckingAccess(false);
      }
    };

    validateAccess();
  }, []);

  const handleUpdateEmployee = async () => {
    const nombres = formData.nombres.trim();
    const apellidos = formData.apellidos.trim();
    const rol = formData.rol.toUpperCase();

    setErrorMsg("");

    if (!hasAccess) {
      setErrorMsg("No tienes permisos para editar empleados.");
      return;
    }

    if (!nombres || !apellidos) {
      setErrorMsg("Nombres y apellidos son obligatorios.");
      return;
    }

    if (!["ADMIN", "MESERO", "COCINA", "CAJA"].includes(rol)) {
      setErrorMsg(GENERIC_ERROR);
      return;
    }

    if (rol === "SUPERADMIN") {
      setErrorMsg(GENERIC_ERROR);
      return;
    }

    setLoading(true);

    try {
      const token = await storage.getItem("access_token");

      if (!token) {
        await clearSessionAndExit("Not authenticated");
        return;
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
        await clearSessionAndExit("Not authenticated");
        return;
      }

      const validatedUser = meData as MeResponse;
      const normalizedRole = (validatedUser?.rol || "").toUpperCase();

      if (
        typeof validatedUser?.usuario_id !== "number" ||
        !validatedUser?.email ||
        validatedUser?.activo !== true ||
        (normalizedRole !== "SUPERADMIN" && normalizedRole !== "ADMIN")
      ) {
        setErrorMsg("No tienes permisos para editar empleados.");
        return;
      }

      const payload = {
        nombres,
        apellidos,
        rol,
      };

      const response = await fetch(`${EMPLOYEES_URL}${employee.usuario_id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();

      let data: Employee | ApiErrorResponse | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if ((data as ApiErrorResponse | null)?.detail === "Not authenticated") {
          await clearSessionAndExit("Not authenticated");
          return;
        }

        setErrorMsg(GENERIC_ERROR);
        return;
      }

      const updatedEmployee = data as Employee;

      if (
        typeof updatedEmployee?.usuario_id !== "number" ||
        !updatedEmployee?.nombres ||
        !updatedEmployee?.apellidos ||
        !updatedEmployee?.email ||
        !updatedEmployee?.rol ||
        typeof updatedEmployee?.activo !== "boolean" ||
        !updatedEmployee?.created_at
      ) {
        setErrorMsg(GENERIC_ERROR);
        return;
      }

      onSuccess({
        ...updatedEmployee,
        rol: (updatedEmployee.rol || "").toUpperCase(),
      });
    } catch (error) {
      setErrorMsg(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={PRIMARY} />
        <Text style={styles.stateText}>Verificando permisos...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.errorText}>
          {errorMsg || "No tienes permisos para acceder a este módulo."}
        </Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
          <Text style={styles.cancelBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
    >
      <View style={styles.mainWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={18}
              color={PRIMARY}
            />
            <Text style={styles.backText}>Volver a la lista</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Editar empleado</Text>
          <Text style={styles.subtitle}>
            Actualiza los datos del empleado seleccionado.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View
            style={[styles.row, { flexDirection: isMobile ? "column" : "row" }]}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombres</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Daniel"
                value={formData.nombres}
                onChangeText={(v) => setFormData({ ...formData, nombres: v })}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Rincón"
                value={formData.apellidos}
                onChangeText={(v) => setFormData({ ...formData, apellidos: v })}
                editable={!loading}
              />
            </View>
          </View>

          <View
            style={[styles.row, { flexDirection: isMobile ? "column" : "row" }]}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.roleSection}>
            <Text style={styles.label}>Rol asignado</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleItem,
                    {
                      flex: isMobile ? 0 : 1,
                      minWidth: isMobile ? "47%" : 140,
                    },
                    formData.rol === role.id && styles.roleItemActive,
                  ]}
                  onPress={() => setFormData({ ...formData, rol: role.id })}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name={role.icon as any}
                    size={20}
                    color={formData.rol === role.id ? PRIMARY : TEXT_MUTED}
                  />
                  <Text
                    style={[
                      styles.roleItemText,
                      formData.rol === role.id && styles.roleItemTextActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <View style={[styles.footer, isMobile && styles.footerMobile]}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              isMobile && { width: "100%" },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleUpdateEmployee}
            disabled={loading || !hasAccess}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { width: "100%" },
  header: { marginBottom: 25 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 5,
    marginLeft: -5,
  },
  backText: { color: PRIMARY, fontWeight: "600", fontSize: 13 },
  title: { fontSize: 26, fontWeight: "800", color: TEXT_MAIN },
  subtitle: { color: TEXT_MUTED, fontSize: 14, marginTop: 2 },

  formContainer: { width: "100%", gap: 20 },
  row: { gap: 15, width: "100%" },
  inputGroup: { flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_MAIN,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: LINE_COLOR,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: TEXT_MAIN,
    backgroundColor: "#F8FAFC",
  },
  inputDisabled: {
    color: TEXT_MUTED,
    backgroundColor: "#F1F5F9",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "left",
    marginTop: 5,
  },

  roleSection: { marginTop: 5 },
  rolesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE_COLOR,
    backgroundColor: "#FFF",
  },
  roleItemActive: { backgroundColor: PRIMARY_SOFT, borderColor: PRIMARY },
  roleItemText: { fontSize: 13, fontWeight: "700", color: TEXT_MUTED },
  roleItemTextActive: { color: PRIMARY },

  footer: {
    marginTop: 40,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 12,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: LINE_COLOR,
  },
  footerMobile: { flexDirection: "column" },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cancelBtnText: { color: TEXT_MUTED, fontWeight: "600", fontSize: 14 },
  submitBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ web: { alignSelf: "flex-start" } }),
  },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  stateContainer: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
});

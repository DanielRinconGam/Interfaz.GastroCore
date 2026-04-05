import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
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

const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web") return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
};

const ROLES = [
  { id: "MESERO", icon: "account-tie-outline", label: "Mesero" },
  { id: "COCINA", icon: "silverware-fork-knife", label: "Cocina" },
  { id: "CAJA", icon: "cash-register", label: "Caja" },
  { id: "ADMIN", icon: "shield-account-outline", label: "Admin" },
];

export default function EmployeeForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    sucursal_id: 1,
    rol: "MESERO",
  });

  const getApiErrorMessage = (data: any) => {
    if (!data) return null;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.detail === "object") return JSON.stringify(data.detail);
    return null;
  };

  const handleCreateEmployee = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // Recuperamos las credenciales guardadas en el login
      const token = await storage.getItem("access_token");
      const tokenType = (await storage.getItem("token_type")) || "Bearer";

      if (!token) {
        setErrorMsg("No se encontró una sesión activa. Reingresa al sistema.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://gastrocore.ddns.net/api/v1/auth/create-employee",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            // Se envía el token para autorizar la creación del empleado
            Authorization: `${tokenType} ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const rawText = await response.text();
      let data = rawText ? JSON.parse(rawText) : null;

      if (!response.ok) {
        const apiMessage = getApiErrorMessage(data);
        setErrorMsg(apiMessage || "Error al crear el empleado");
        return;
      }

      onSuccess();
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Nuevo Registro</Text>
          <Text style={styles.subtitle}>
            Ingrese los datos para el alta de personal.
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
                placeholder="Ej. Juan"
                value={formData.nombres}
                onChangeText={(v) => setFormData({ ...formData, nombres: v })}
                editable={!loading}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Pérez"
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
                style={styles.input}
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v) => setFormData({ ...formData, email: v })}
                editable={!loading}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={formData.password}
                onChangeText={(v) => setFormData({ ...formData, password: v })}
                editable={!loading}
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
            onPress={handleCreateEmployee}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Confirmar y Guardar</Text>
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
});

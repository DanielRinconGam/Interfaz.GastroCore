import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import styles, {
  PRIMARY,
  TEXT_MUTED,
} from "@css/auth/employeesEditForms";

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

export default function EmployeeEditForm({
  employee,
  onBack,
  onSuccess,
}: {
  employee?: Employee; // ✅ ahora opcional (fix real)
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
    nombres: employee?.nombres || "",
    apellidos: employee?.apellidos || "",
    email: employee?.email || "",
    rol: (employee?.rol || "MESERO").toUpperCase(),
  });

  // 🔄 Sincroniza cuando llega employee
  useEffect(() => {
    if (employee) {
      setFormData({
        nombres: employee.nombres,
        apellidos: employee.apellidos,
        email: employee.email,
        rol: employee.rol.toUpperCase(),
      });
    }
  }, [employee]);

  const clearSessionAndExit = async () => {
    await storage.removeItem("access_token");
    await storage.removeItem("token_type");
    await storage.removeItem("user");
    onBack();
  };

  // 🔐 Validación acceso
  useEffect(() => {
    const validateAccess = async () => {
      try {
        const token = await storage.getItem("access_token");
        if (!token) return await clearSessionAndExit();

        const res = await fetch(ME_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return await clearSessionAndExit();

        const data: MeResponse = await res.json();
        const role = data?.rol?.toUpperCase();

        if (!["ADMIN", "SUPERADMIN"].includes(role)) {
          setErrorMsg("No tienes permisos.");
          return;
        }

        setHasAccess(true);
      } catch {
        await clearSessionAndExit();
      } finally {
        setCheckingAccess(false);
      }
    };

    validateAccess();
  }, []);

  const handleUpdateEmployee = async () => {
    if (!employee) return;

    const nombres = formData.nombres.trim();
    const apellidos = formData.apellidos.trim();
    const rol = formData.rol;

    if (!nombres || !apellidos) {
      setErrorMsg("Campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
      const token = await storage.getItem("access_token");
      if (!token) return await clearSessionAndExit();

      const res = await fetch(`${EMPLOYEES_URL}${employee.usuario_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombres, apellidos, rol }),
      });

      if (!res.ok) {
        setErrorMsg(GENERIC_ERROR);
        return;
      }

      const updated = await res.json();
      onSuccess(updated);
    } catch {
      setErrorMsg(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Validaciones UI
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
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.cancelBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={PRIMARY} />
        <Text style={styles.stateText}>Cargando empleado...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
      <View style={styles.mainWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={PRIMARY} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Editar empleado</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={formData.nombres}
            onChangeText={(v) => setFormData({ ...formData, nombres: v })}
          />

          <TextInput
            style={styles.input}
            value={formData.apellidos}
            onChangeText={(v) => setFormData({ ...formData, apellidos: v })}
          />

          {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleUpdateEmployee}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
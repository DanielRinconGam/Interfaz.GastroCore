import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { storage } from "@services/auth/storageService";
import styles, { PRIMARY, TEXT_MUTED } from "@css/auth/employeeFormsStyles";

const API_BASE_URL = "https://gastrocore.ddns.net";
const EMPLOYEES_URL = `${API_BASE_URL}/api/v1/employees/`;
const ME_URL = `${API_BASE_URL}/api/v1/auth/me`;
const GENERIC_ERROR = "No fue posible actualizar el empleado. Intenta nuevamente.";

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
  employee?: Employee; // 👈 ahora opcional
  onBack: () => void;
  onSuccess: (updatedEmployee: Employee) => void;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Inicialización segura
  const [formData, setFormData] = useState({
    nombres: employee?.nombres || "",
    apellidos: employee?.apellidos || "",
    email: employee?.email || "",
    rol: (employee?.rol || "MESERO").toUpperCase(),
  });

  // ✅ Sincroniza cuando llega employee
  useEffect(() => {
    if (employee) {
      setFormData({
        nombres: employee.nombres || "",
        apellidos: employee.apellidos || "",
        email: employee.email || "",
        rol: (employee.rol || "MESERO").toUpperCase(),
      });
    }
  }, [employee]);

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
        if (!token) return await clearSessionAndExit();

        const response = await fetch(ME_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return await clearSessionAndExit();

        const meData: MeResponse = await response.json();

        const role = (meData?.rol || "").toUpperCase();

        if (!["ADMIN", "SUPERADMIN"].includes(role)) {
          setErrorMsg("No tienes permisos para editar empleados.");
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
    if (!employee) return; // 🔒 protección extra

    const nombres = formData.nombres.trim();
    const apellidos = formData.apellidos.trim();
    const rol = formData.rol.toUpperCase();

    if (!nombres || !apellidos) {
      setErrorMsg("Nombres y apellidos son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      const token = await storage.getItem("access_token");
      if (!token) return await clearSessionAndExit();

      const response = await fetch(`${EMPLOYEES_URL}${employee.usuario_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombres, apellidos, rol }),
      });

      if (!response.ok) {
        setErrorMsg(GENERIC_ERROR);
        return;
      }

      const updatedEmployee: Employee = await response.json();

      onSuccess(updatedEmployee);
    } catch {
      setErrorMsg(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Loader permisos
  if (checkingAccess) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={PRIMARY} />
        <Text>Verificando permisos...</Text>
      </View>
    );
  }

  // 🚫 Sin acceso
  if (!hasAccess) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity onPress={onBack}>
          <Text>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ⏳ Loader de employee
  if (!employee) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={PRIMARY} />
        <Text>Cargando empleado...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.mainWrapper}>
        <Text style={styles.title}>Editar empleado</Text>

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

        <TextInput style={styles.input} value={formData.email} editable={false} />

        {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        <TouchableOpacity onPress={handleUpdateEmployee} disabled={loading}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
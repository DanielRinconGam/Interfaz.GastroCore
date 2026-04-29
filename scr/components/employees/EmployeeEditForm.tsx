import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { storage } from "@services/auth/storageService";
import styles, { PRIMARY } from "@css/auth/employeeFormsStyles";

export default function EmployeeEditForm({
  employee,
  onBack,
  onSuccess,
}: any) {
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    rol: "MESERO",
  });

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

  useEffect(() => {
    const validate = async () => {
      try {
        const token = await storage.getItem("access_token");
        if (!token) return;

        setHasAccess(true);
      } catch {
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    validate();
  }, []);

  const handleUpdate = async () => {
    if (!employee) return;

    try {
      setLoading(true);

      // 🔥 AQUÍ VA TU API PUT
      onSuccess({
        ...employee,
        ...formData,
      });

    } catch {
      setErrorMsg("Error actualizando");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={PRIMARY} />
        <Text>Verificando permisos...</Text>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.stateContainer}>
        <Text>Error: no hay empleado</Text>
        <TouchableOpacity onPress={onBack}>
          <Text>Volver</Text>
        </TouchableOpacity>
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

        <TouchableOpacity onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text>Guardar</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
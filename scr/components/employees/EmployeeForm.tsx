import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "@css/auth/employeeFormsStyles";

const ROLES = [
  { id: "MESERO", label: "Mesero", icon: "account-tie-outline" },
  { id: "COCINA", label: "Cocina", icon: "silverware-fork-knife" },
  { id: "CAJA", label: "Caja", icon: "cash-register" },
  { id: "ADMIN", label: "Admin", icon: "shield-account-outline" },
];

export default function EmployeeForm({ onBack, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    rol: "MESERO",
  });

  const handleCreate = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (
      !formData.nombres ||
      !formData.apellidos ||
      !formData.email ||
      !formData.password
    ) {
      setErrorMsg("Todos los campos son obligatorios");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      // 🔥 SIMULACIÓN (aquí luego conectas tu API real)
      const newEmployee = {
        usuario_id: Date.now(),
        ...formData,
        activo: true,
        created_at: new Date().toISOString(),
      };

      // 🔥 éxito
      setSuccessMsg("✅ Empleado creado correctamente");

      // reset form
      setFormData({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        rol: "MESERO",
      });

      // opcional: avisar al padre
      onSuccess?.(newEmployee);

    } catch {
      setErrorMsg("Error creando empleado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.mainWrapper}>
        <Text style={styles.title}>Crear empleado</Text>

        {/* INPUTS */}
        <TextInput
          style={styles.input}
          placeholder="Nombres"
          value={formData.nombres}
          onChangeText={(v) => setFormData({ ...formData, nombres: v })}
        />

        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={formData.apellidos}
          onChangeText={(v) => setFormData({ ...formData, apellidos: v })}
        />

        <TextInput
          style={styles.input}
          placeholder="Correo"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(v) => setFormData({ ...formData, email: v })}
        />

        {/* PASSWORD */}
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(v) => setFormData({ ...formData, password: v })}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 10, top: 15 }}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
            />
          </TouchableOpacity>
        </View>

        {/* ROLES */}
        <Text style={{ marginBottom: 8, fontWeight: "600" }}>
          Rol del empleado
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {ROLES.map((role) => {
            const selected = formData.rol === role.id;

            return (
              <TouchableOpacity
                key={role.id}
                onPress={() =>
                  setFormData({ ...formData, rol: role.id })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: selected ? "#349881" : "#ccc",
                  backgroundColor: selected ? "#E6F4F1" : "#fff",
                }}
              >
                <MaterialCommunityIcons
                  name={role.icon as any}
                  size={18}
                  color={selected ? "#349881" : "#666"}
                />
                <Text style={{ marginLeft: 6 }}>{role.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* MENSAJES */}
        {!!errorMsg && (
          <Text style={styles.errorText}>{errorMsg}</Text>
        )}

        {!!successMsg && (
          <Text style={{ color: "#16A34A", marginTop: 10 }}>
            {successMsg}
          </Text>
        )}

        {/* BOTÓN */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          style={{
            backgroundColor: "#349881",
            padding: 14,
            borderRadius: 10,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Crear empleado
            </Text>
          )}
        </TouchableOpacity>

        {/* VOLVER */}
        <TouchableOpacity onPress={onBack} style={{ marginTop: 15 }}>
          <Text style={{ textAlign: "center", color: "#64748B" }}>
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
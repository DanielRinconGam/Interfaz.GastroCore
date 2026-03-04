import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import styles from "../css/employeeStyles";

type Employee = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  status: "active" | "inactive";
};

const MOCK: Employee[] = [
  { id: "1", name: "Juan Pérez", email: "juan@rest.com", role: "admin", status: "active" },
  { id: "2", name: "Laura Ruiz", email: "laura@rest.com", role: "staff", status: "active" },
];

export default function EmployeesScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MOCK;
    return MOCK.filter((e) =>
      `${e.name} ${e.email} ${e.role}`.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Empleados</Text>
          <Text style={styles.subtitle}>Administración de usuarios internos</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          // onPress={() => router.push("/tabs/employees/create")}
        >
          <Text style={styles.primaryButtonText}>+ Crear empleado</Text>
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TextInput
          style={styles.search}
          placeholder="Buscar por nombre, correo o rol..."
          value={q}
          onChangeText={setQ}
        />
      </View>

      {/* Tabla */}
      <View style={styles.card}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colName]}>Nombre</Text>
          <Text style={[styles.th, styles.colEmail]}>Correo</Text>
          <Text style={[styles.th, styles.colRole]}>Rol</Text>
          <Text style={[styles.th, styles.colStatus]}>Estado</Text>
          <Text style={[styles.th, styles.colActions]}>Acciones</Text>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <View style={styles.tr}>
              <Text style={[styles.td, styles.colName]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.td, styles.colEmail]} numberOfLines={1}>
                {item.email}
              </Text>
              <Text style={[styles.td, styles.colRole]}>{item.role}</Text>
              <Text style={[styles.td, styles.colStatus]}>{item.status}</Text>

              <View style={[styles.td, styles.colActions, styles.actionsRow]}>
                <TouchableOpacity style={styles.linkBtn}>
                  <Text style={styles.linkText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dangerBtn}>
                  <Text style={styles.dangerText}>Desactivar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
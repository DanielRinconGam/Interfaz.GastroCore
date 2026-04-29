import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import AppToast from "@components/common/AppToast";
import ConfirmDialog from "@components/common/ConfirmDialog";
import EmployeeEditForm from "@components/employees/EmployeeEditForm";
import EmployeeForm from "@components/employees/EmployeeForm";
import AppHeader from "@components/layout/AppHeader";
import SidebarMenu from "@components/layout/SidebarMenu";

import { Employee } from "@services/auth/employessService";
import { useEmployees } from "@hooks/auth/useEmployees";

import styles from "@css/auth/employeeStyles";

export default function EmployeesScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    q, setQ,
    mobileOpen, setMobileOpen,
    collapsed, setCollapsed,
    showForm, setShowForm,
    showEditForm, setShowEditForm,
    employeeToEdit, setEmployeeToEdit,
    isChecking, loadingEmployees,
    setEmployees,
    confirmVisible,
    deletingEmployeeId,
    statusConfirmVisible,
    togglingEmployeeId,
    toast, setToast,
    showToast,
    checkAuthAndLoad,
    loadEmployees,
    openEditForm,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteEmployee,
    openStatusConfirm,
    closeStatusConfirm,
    handleToggleEmployeeStatus,
    filteredData,
    getInitials,
    formatRole,
    formatStatus,
    formatDate,
  } = useEmployees();

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  /* 🔹 ACCIONES */
  const renderActions = (item: Employee) => {
    const isDeleting = deletingEmployeeId === item.usuario_id;
    const isToggling = togglingEmployeeId === item.usuario_id;

    return (
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => openEditForm(item)}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color="#349881" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openStatusConfirm(item)} disabled={isToggling}>
          {isToggling ? (
            <ActivityIndicator size="small" />
          ) : (
            <MaterialCommunityIcons
              name={item.activo ? "account-off-outline" : "account-check-outline"}
              size={18}
              color={item.activo ? "#64748B" : "#349881"}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openDeleteConfirm(item)} disabled={isDeleting}>
          {isDeleting ? (
            <ActivityIndicator size="small" />
          ) : (
            <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  /* 🔹 MOBILE CARD */
  const renderMobileItem = ({ item }: { item: Employee }) => {
    const fullName = `${item.nombres} ${item.apellidos}`;
    const initials = getInitials(item.nombres, item.apellidos);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatRole(item.rol)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{formatStatus(item.activo)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>

        {renderActions(item)}
      </View>
    );
  };

  /* 🔹 DESKTOP ROW */
  const renderDesktopItem = ({ item }: { item: Employee }) => {
    const fullName = `${item.nombres} ${item.apellidos}`;
    const initials = getInitials(item.nombres, item.apellidos);

    return (
      <View style={styles.tr}>
        <View style={[styles.td, styles.colName]}>
          <Text style={styles.initials}>{initials}</Text>
          <Text style={styles.tdText}>{fullName}</Text>
        </View>

        <View style={[styles.td, styles.colEmail]}>
          <Text style={styles.tdText}>{item.email}</Text>
        </View>

        <View style={[styles.td, styles.colRole]}>
          <Text style={styles.tdText}>{formatRole(item.rol)}</Text>
        </View>

        <View style={[styles.td, styles.colStatus]}>
          <Text style={styles.tdText}>{formatStatus(item.activo)}</Text>
        </View>

        <View style={[styles.td, styles.colActions]}>
          {renderActions(item)}
        </View>
      </View>
    );
  };

  /* 🔹 LOADING */
  if (isChecking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#349881" />
        <Text>Verificando permisos...</Text>
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
          isMobile
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
          <AppToast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
          />

          {!showForm && !showEditForm && (
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Empleados</Text>
                <Text style={styles.subtitle}>Panel de control</Text>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={() => setShowForm(true)}>
                <Text style={styles.primaryButtonText}>Añadir</Text>
              </TouchableOpacity>
            </View>
          )}

          {showForm ? (
            <EmployeeForm
              onBack={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                loadEmployees();
                showToast("Empleado creado correctamente", "success");
              }}
            />
          ) : showEditForm && employeeToEdit ? (
            <EmployeeEditForm
              employee={employeeToEdit}
              onBack={() => {
                setShowEditForm(false);
                setEmployeeToEdit(null);
              }}
              onSuccess={(updated) => {
                setEmployees((prev) =>
                  prev.map((e) =>
                    e.usuario_id === updated.usuario_id ? updated : e
                  )
                );
                setShowEditForm(false);
                setEmployeeToEdit(null);
              }}
            />
          ) : (
            <>
              <TextInput
                style={styles.search}
                placeholder="Buscar..."
                value={q}
                onChangeText={setQ}
              />

              {!isMobile && (
                <View style={styles.tableHeader}>
                  <View style={styles.colName}><Text style={styles.th}>Nombre</Text></View>
                  <View style={styles.colEmail}><Text style={styles.th}>Correo</Text></View>
                  <View style={styles.colRole}><Text style={styles.th}>Rol</Text></View>
                  <View style={styles.colStatus}><Text style={styles.th}>Estado</Text></View>
                  <View style={styles.colActions}><Text style={[styles.th, { textAlign: "right" }]}>Acciones</Text></View>
                </View>
              )}

              {loadingEmployees ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.usuario_id.toString()}
                  renderItem={isMobile ? renderMobileItem : renderDesktopItem}
                  ItemSeparatorComponent={() => <View style={styles.sep} />}
                />
              )}
            </>
          )}

          <ConfirmDialog
            visible={confirmVisible}
            title="Eliminar empleado"
            message="¿Seguro que deseas eliminar este empleado?"
            onCancel={closeDeleteConfirm}
            onConfirm={handleDeleteEmployee}
          />

          <ConfirmDialog
            visible={statusConfirmVisible}
            title="Cambiar estado"
            message="¿Deseas cambiar el estado del empleado?"
            onCancel={closeStatusConfirm}
            onConfirm={handleToggleEmployeeStatus}
          />
        </View>
      </View>
    </View>
  );
}
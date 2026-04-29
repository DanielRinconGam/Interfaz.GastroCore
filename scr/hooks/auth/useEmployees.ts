import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Employee,
  deleteEmployee,
  fetchEmployees,
  toggleEmployeeStatus,
  validateCurrentUser,
} from "@services/auth/employessService";
import { storage } from "@services/auth/storageService";

export type ToastState = {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
};

export const useEmployees = () => {
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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(null);
  const [statusConfirmVisible, setStatusConfirmVisible] = useState(false);
  const [employeeToToggleStatus, setEmployeeToToggleStatus] = useState<Employee | null>(null);
  const [togglingEmployeeId, setTogglingEmployeeId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", type: "info" });

  const showToast = (message: string, type: ToastState["type"] = "info") => {
    setToast({ visible: true, message, type });
  };

  const clearSessionAndGoLogin = async () => {
    await storage.removeItem("access_token");
    await storage.removeItem("token_type");
    await storage.removeItem("user");
    router.replace("/auth/login");
  };

  const loadEmployees = async (existingToken?: string) => {
    try {
      setLoadingEmployees(true);
      const token = existingToken || (await storage.getItem("access_token"));
      if (!token) { await clearSessionAndGoLogin(); return; }
      const data = await fetchEmployees(token);
      setEmployees(data);
    } catch (error) {
      console.log("loadEmployees error:", error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const checkAuthAndLoad = async () => {
    try {
      const validation = await validateCurrentUser();
      if (!validation) { await clearSessionAndGoLogin(); return; }
      await loadEmployees(validation.token);
    } catch (error) {
      console.log("checkAuth error:", error);
      await clearSessionAndGoLogin();
    } finally {
      setIsChecking(false);
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
      if (!validation) { await clearSessionAndGoLogin(); return; }

      const result = await deleteEmployee(employeeToDelete.usuario_id, validation.token);
      if (!result.ok) { showToast("Error eliminando empleado", "error"); return; }

      setEmployees((prev) => prev.filter((e) => e.usuario_id !== employeeToDelete.usuario_id));
      setConfirmVisible(false);
      setEmployeeToDelete(null);
      showToast("Empleado eliminado correctamente", "success");
    } catch (error) {
      console.log(error);
      showToast("Error eliminando empleado", "error");
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
      if (!validation) { await clearSessionAndGoLogin(); return; }

      const result = await toggleEmployeeStatus(
        employeeToToggleStatus.usuario_id,
        employeeToToggleStatus.activo,
        validation.token,
      );

      if (!result.ok) { showToast("Error actualizando estado", "error"); return; }

      setEmployees((prev) => prev.map((e) =>
        e.usuario_id === employeeToToggleStatus.usuario_id
          ? { ...e, activo: result.nextStatus ?? e.activo }
          : e
      ));
      setStatusConfirmVisible(false);
      setEmployeeToToggleStatus(null);
      showToast("Estado actualizado correctamente", "success");
    } catch (error) {
      console.log(error);
      showToast("Error actualizando estado", "error");
    } finally {
      setTogglingEmployeeId(null);
    }
  };

  const filteredData = useMemo(() => {
    const search = q.toLowerCase();
    return employees.filter((e) =>
      `${e.nombres} ${e.apellidos} ${e.email} ${e.rol}`.toLowerCase().includes(search)
    );
  }, [q, employees]);

  const getInitials = (n: string, a: string) =>
    `${n?.[0] || ""}${a?.[0] || ""}`.toUpperCase();

  const formatRole = (rol: string) => {
    const n = (rol || "").toUpperCase();
    if (n === "ADMIN") return "Admin";
    if (n === "MESERO") return "Mesero";
    if (n === "COCINA") return "Cocina";
    if (n === "CAJA") return "Caja";
    return n;
  };

  const formatStatus = (activo: boolean) => activo ? "Activo" : "Inactivo";

  const formatDate = (value: string) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-CO");
  };

  return {
    q, setQ,
    mobileOpen, setMobileOpen,
    collapsed, setCollapsed,
    showForm, setShowForm,
    showEditForm, setShowEditForm,
    employeeToEdit, setEmployeeToEdit,
    isChecking, loadingEmployees,
    employees, setEmployees,
    confirmVisible, employeeToDelete, deletingEmployeeId,
    statusConfirmVisible, employeeToToggleStatus, togglingEmployeeId,
    toast, setToast, showToast,
    checkAuthAndLoad, loadEmployees,
    openEditForm,
    openDeleteConfirm, closeDeleteConfirm, handleDeleteEmployee,
    openStatusConfirm, closeStatusConfirm, handleToggleEmployeeStatus,
    filteredData,
    getInitials, formatRole, formatStatus, formatDate,
  };
};
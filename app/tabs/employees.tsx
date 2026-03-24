import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, Switch,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AppHeader from "../../scr/components/layout/AppHeader";
import SidebarMenu from "../../scr/components/layout/SidebarMenu";

const PRIMARY  = "#46A38C";
const PRIMARY_L= "#E8F5F1";
const BG       = "#F0F4F8";
const DARK     = "#0F172A";
const CARD     = "#FFFFFF";
const MUTED    = "#64748B";
const BORDER   = "#E8EDF2";
const ROW_BG   = "#F8FAFC";
const DANGER   = "#EF4444";
const DANGER_L = "#FEF2F2";

const ROLES = ["Administrador", "Mesero", "Cocinero", "Cajero", "Auxiliar"];
const COLORES_ROL: Record<string, { bg: string; color: string }> = {
  Administrador: { bg: "#EEF2FF", color: "#6366F1" },
  Mesero:        { bg: PRIMARY_L, color: PRIMARY    },
  Cocinero:      { bg: "#FEF9EC", color: "#F59E0B"  },
  Cajero:        { bg: "#ECFDF5", color: "#10B981"  },
  Auxiliar:      { bg: "#F1F5F9", color: MUTED      },
};

const INIT_EMPLEADOS = [
  { id: 1, nombre: "Juan Pablo Gómez",   telefono: "3101234567", email: "juan@rest.com",  rol: "Mesero",        activo: true,  turno: "Mañana",  salario: 1400000, fecha_ingreso: "2024-01-15" },
  { id: 2, nombre: "María González",     telefono: "3209876543", email: "maria@rest.com", rol: "Mesero",        activo: true,  turno: "Tarde",   salario: 1400000, fecha_ingreso: "2024-03-01" },
  { id: 3, nombre: "Carlos Rodríguez",   telefono: "3156789012", email: "carlos@rest.com",rol: "Cocinero",      activo: true,  turno: "Mañana",  salario: 1800000, fecha_ingreso: "2023-06-10" },
  { id: 4, nombre: "Ana Torres",         telefono: "3178901234", email: "ana@rest.com",   rol: "Mesero",        activo: true,  turno: "Noche",   salario: 1400000, fecha_ingreso: "2024-07-20" },
  { id: 5, nombre: "Pedro Sánchez",      telefono: "3123456789", email: "pedro@rest.com", rol: "Cocinero",      activo: true,  turno: "Tarde",   salario: 1800000, fecha_ingreso: "2023-11-05" },
  { id: 6, nombre: "Laura Morales",      telefono: "3145678901", email: "laura@rest.com", rol: "Cajero",        activo: true,  turno: "Mañana",  salario: 1500000, fecha_ingreso: "2024-02-14" },
  { id: 7, nombre: "Eliza Admin",        telefono: "3167890123", email: "admin@rest.com", rol: "Administrador", activo: true,  turno: "Mañana",  salario: 3500000, fecha_ingreso: "2022-01-01" },
  { id: 8, nombre: "Roberto Díaz",       telefono: "3189012345", email: "",               rol: "Auxiliar",      activo: false, turno: "Tarde",   salario: 1200000, fecha_ingreso: "2024-09-01" },
];

const INIT_TURNOS = [
  { id: 101, empleado: "Juan Pablo Gómez", rol: "Mesero",   turno: "Mañana", fecha: "2026-03-18", entrada: "07:00", salida: "15:00", horas: 8  },
  { id: 102, empleado: "María González",   rol: "Mesero",   turno: "Tarde",  fecha: "2026-03-18", entrada: "14:00", salida: "22:00", horas: 8  },
  { id: 103, empleado: "Carlos Rodríguez", rol: "Cocinero", turno: "Mañana", fecha: "2026-03-18", entrada: "06:00", salida: "14:00", horas: 8  },
  { id: 104, empleado: "Laura Morales",    rol: "Cajero",   turno: "Mañana", fecha: "2026-03-18", entrada: "07:00", salida: "15:00", horas: 8  },
  { id: 105, empleado: "Ana Torres",       rol: "Mesero",   turno: "Noche",  fecha: "2026-03-17", entrada: "21:00", salida: "05:00", horas: 8  },
  { id: 106, empleado: "Pedro Sánchez",    rol: "Cocinero", turno: "Tarde",  fecha: "2026-03-17", entrada: "13:00", salida: "21:00", horas: 8  },
];

const INIT_ACTIVIDAD = [
  { id: 201, empleado: "Juan Pablo Gómez", accion: "Pedido tomado",    detalle: "Mesa 4 · Pedido #1042", fecha: "2026-03-18 13:22" },
  { id: 202, empleado: "María González",   accion: "Pedido entregado", detalle: "Mesa 7 · Pedido #1043", fecha: "2026-03-18 13:45" },
  { id: 203, empleado: "Carlos Rodríguez", accion: "Plato listo",      detalle: "Bandeja paisa x2",      fecha: "2026-03-18 13:30" },
  { id: 204, empleado: "Laura Morales",    accion: "Pago registrado",  detalle: "Mesa 5 · $76.000",      fecha: "2026-03-18 12:55" },
  { id: 205, empleado: "Ana Torres",       accion: "Pedido tomado",    detalle: "Mesa 2 · Pedido #1044", fecha: "2026-03-18 12:10" },
  { id: 206, empleado: "Carlos Rodríguez", accion: "Plato listo",      detalle: "Churrasco x1",          fecha: "2026-03-18 11:48" },
];

function formatCOP(n: number) { return "$" + Number(n).toLocaleString("es-CO"); }
let nextId = 9000;
function genId() { return ++nextId; }

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.searchWrap}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput style={styles.searchInput} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={MUTED} />
      {value.length > 0 && <TouchableOpacity onPress={() => onChange("")}><Text style={styles.searchClear}>✕</Text></TouchableOpacity>}
    </View>
  );
}
function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}
function initials(nombre: string) {
  return nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

// ── LISTA ─────────────────────────────────────────────────────────────────────
function Lista() {
  const [items, setItems]     = useState(INIT_EMPLEADOS);
  const [search, setSearch]   = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ nombre: "", telefono: "", email: "", rol: "Mesero", turno: "Mañana", salario: "", fecha_ingreso: "", activo: true });

  const filtros = ["Todos", ...ROLES];
  const filtered = items
    .filter(i => filtroRol === "Todos" || i.rol === filtroRol)
    .filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew  = () => { setEditing(null); setForm({ nombre: "", telefono: "", email: "", rol: "Mesero", turno: "Mañana", salario: "", fecha_ingreso: new Date().toISOString().split("T")[0], activo: true }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, telefono: item.telefono, email: item.email, rol: item.rol, turno: item.turno, salario: String(item.salario), fecha_ingreso: item.fecha_ingreso, activo: item.activo }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    const data = { ...form, salario: Number(form.salario) };
    if (editing) setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...data } : i));
    else setItems(prev => [...prev, { id: genId(), ...data }]);
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar empleado", `¿Eliminar a "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar empleado..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}><Text style={styles.btnPrimaryText}>+ Empleado</Text></TouchableOpacity>
      </View>
      <View style={styles.filtroBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtroBarInner}>
          {filtros.map(f => (
            <TouchableOpacity key={f} style={[styles.filtroBtn, filtroRol === f && styles.filtroBtnActive]} onPress={() => setFiltroRol(f)}>
              <Text style={[styles.filtroBtnText, filtroRol === f && styles.filtroBtnTextActive]}>
                {f} ({f === "Todos" ? items.length : items.filter(i => i.rol === f).length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="👤" title="Sin empleados" sub="Registra tu equipo de trabajo" />
          : filtered.map(item => {
              const rc = COLORES_ROL[item.rol] ?? { bg: PRIMARY_L, color: PRIMARY };
              return (
                <View key={item.id} style={styles.rowCard}>
                  <View style={[styles.rowStripe, { backgroundColor: item.activo ? rc.color : "#CBD5E1" }]} />
                  <View style={styles.rowBody}>
                    <View style={styles.rowMain}>
                      <View style={[styles.avatar, { backgroundColor: rc.bg }]}>
                        <Text style={[styles.avatarText, { color: rc.color }]}>{initials(item.nombre)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{item.nombre}</Text>
                        <Text style={styles.rowSub}>📞 {item.telefono}{item.email ? ` · ✉️ ${item.email}` : ""}</Text>
                        <Text style={styles.rowSub}>📅 Ingreso: {item.fecha_ingreso}</Text>
                      </View>
                      <View style={styles.rowRight}>
                        <View style={[styles.rolBadge, { backgroundColor: rc.bg }]}>
                          <Text style={[styles.rolBadgeText, { color: rc.color }]}>{item.rol}</Text>
                        </View>
                        <View style={[styles.estadoPill, { backgroundColor: item.activo ? PRIMARY_L : "#F1F5F9" }]}>
                          <Text style={[styles.estadoPillText, { color: item.activo ? PRIMARY : MUTED }]}>{item.activo ? "Activo" : "Inactivo"}</Text>
                        </View>
                        <Text style={styles.salarioText}>{formatCOP(item.salario)}</Text>
                        <Text style={styles.turnoText}>🕐 {item.turno}</Text>
                      </View>
                    </View>
                    <View style={styles.rowActions}>
                      <TouchableOpacity style={styles.btnEdit} onPress={() => openEdit(item)}><Text style={styles.btnEditText}>✏️ Editar</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.btnDelete} onPress={() => eliminar(item)}><Text style={styles.btnDeleteText}>🗑 Eliminar</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? "Editar empleado" : "Nuevo empleado"}</Text>
            <View style={styles.field}><Text style={styles.fieldLabel}>Nombre *</Text><TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Nombre completo" placeholderTextColor={MUTED} /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Teléfono</Text><TextInput style={styles.fieldInput} value={form.telefono} onChangeText={v => setForm(f => ({ ...f, telefono: v }))} placeholder="3100000000" placeholderTextColor={MUTED} keyboardType="phone-pad" /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Email</Text><TextInput style={styles.fieldInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="correo@ejemplo.com" placeholderTextColor={MUTED} keyboardType="email-address" /></View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Rol</Text>
              <View style={styles.catSelector}>
                {ROLES.map(r => (
                  <TouchableOpacity key={r} style={[styles.catOption, form.rol === r && styles.catOptionActive]} onPress={() => setForm(f => ({ ...f, rol: r }))}>
                    <Text style={[styles.catOptionText, form.rol === r && styles.catOptionTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Turno</Text>
              <View style={styles.catSelector}>
                {["Mañana", "Tarde", "Noche"].map(t => (
                  <TouchableOpacity key={t} style={[styles.catOption, form.turno === t && styles.catOptionActive]} onPress={() => setForm(f => ({ ...f, turno: t }))}>
                    <Text style={[styles.catOptionText, form.turno === t && styles.catOptionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Salario (COP)</Text><TextInput style={styles.fieldInput} value={form.salario} onChangeText={v => setForm(f => ({ ...f, salario: v }))} placeholder="1400000" placeholderTextColor={MUTED} keyboardType="numeric" /></View>
            <View style={styles.fieldRow}><Text style={styles.fieldLabel}>Activo</Text><Switch value={form.activo} onValueChange={v => setForm(f => ({ ...f, activo: v }))} trackColor={{ true: PRIMARY }} /></View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}><Text style={styles.btnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={save}><Text style={styles.btnSaveText}>{editing ? "Guardar" : "Crear"}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── ROLES ─────────────────────────────────────────────────────────────────────
function RolesTab() {
  const empleados = INIT_EMPLEADOS;
  return (
    <ScrollView contentContainerStyle={styles.listContent}>
      {ROLES.map(rol => {
        const rc = COLORES_ROL[rol] ?? { bg: PRIMARY_L, color: PRIMARY };
        const miembros = empleados.filter(e => e.rol === rol && e.activo);
        return (
          <View key={rol} style={styles.rowCard}>
            <View style={[styles.rowStripe, { backgroundColor: rc.color }]} />
            <View style={styles.rowBody}>
              <View style={[styles.rowMain, { marginBottom: miembros.length > 0 ? 10 : 0 }]}>
                <View style={[styles.rolIconBox, { backgroundColor: rc.bg }]}>
                  <Text style={[styles.rolIconText, { color: rc.color }]}>{rol[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{rol}</Text>
                  <Text style={styles.rowSub}>{miembros.length} empleado{miembros.length !== 1 ? "s" : ""} activo{miembros.length !== 1 ? "s" : ""}</Text>
                </View>
                <View style={[styles.rolBadge, { backgroundColor: rc.bg }]}>
                  <Text style={[styles.rolBadgeText, { color: rc.color }]}>{miembros.length}</Text>
                </View>
              </View>
              {miembros.length > 0 && (
                <View style={styles.miembrosWrap}>
                  {miembros.map(m => (
                    <View key={m.id} style={[styles.miembroChip, { backgroundColor: rc.bg }]}>
                      <Text style={[styles.miembroChipText, { color: rc.color }]}>{m.nombre.split(" ")[0]}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );
      })}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── TURNOS ────────────────────────────────────────────────────────────────────
function Turnos() {
  const [items, setItems] = useState(INIT_TURNOS);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ empleado: "", rol: "Mesero", turno: "Mañana", fecha: new Date().toISOString().split("T")[0], entrada: "", salida: "" });

  const turnoColor = (turno: string) => {
    if (turno === "Mañana") return { bg: "#FEF9EC", color: "#B45309" };
    if (turno === "Tarde")  return { bg: "#EFF6FF", color: "#1D4ED8" };
    return                         { bg: "#F5F3FF", color: "#6D28D9" };
  };

  const save = () => {
    if (!form.empleado.trim()) { Alert.alert("Error", "El empleado es obligatorio"); return; }
    const horas = (form.entrada && form.salida) ? 8 : 0;
    setItems(prev => [{ id: genId(), ...form, horas }, ...prev]);
    setModal(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.btnPrimary} onPress={() => setModal(true)}><Text style={styles.btnPrimaryText}>+ Turno</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {items.map(item => {
          const tc = turnoColor(item.turno);
          const rc = COLORES_ROL[item.rol] ?? { bg: PRIMARY_L, color: PRIMARY };
          return (
            <View key={item.id} style={styles.rowCard}>
              <View style={[styles.rowStripe, { backgroundColor: tc.color }]} />
              <View style={styles.rowBody}>
                <View style={[styles.rowMain, { marginBottom: 0 }]}>
                  <View style={[styles.avatar, { backgroundColor: rc.bg }]}>
                    <Text style={[styles.avatarText, { color: rc.color }]}>{initials(item.empleado)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.empleado}</Text>
                    <Text style={styles.rowSub}>📅 {item.fecha} · {item.entrada} – {item.salida}</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <View style={[styles.estadoPill, { backgroundColor: tc.bg }]}>
                      <Text style={[styles.estadoPillText, { color: tc.color }]}>{item.turno}</Text>
                    </View>
                    <View style={[styles.rolBadge, { backgroundColor: rc.bg }]}>
                      <Text style={[styles.rolBadgeText, { color: rc.color }]}>{item.rol}</Text>
                    </View>
                    <Text style={styles.horasText}>{item.horas}h</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo turno</Text>
            <View style={styles.field}><Text style={styles.fieldLabel}>Empleado *</Text><TextInput style={styles.fieldInput} value={form.empleado} onChangeText={v => setForm(f => ({ ...f, empleado: v }))} placeholder="Nombre del empleado" placeholderTextColor={MUTED} /></View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Turno</Text>
              <View style={styles.catSelector}>
                {["Mañana", "Tarde", "Noche"].map(t => (
                  <TouchableOpacity key={t} style={[styles.catOption, form.turno === t && styles.catOptionActive]} onPress={() => setForm(f => ({ ...f, turno: t }))}>
                    <Text style={[styles.catOptionText, form.turno === t && styles.catOptionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.fieldRow2}>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Entrada</Text><TextInput style={styles.fieldInput} value={form.entrada} onChangeText={v => setForm(f => ({ ...f, entrada: v }))} placeholder="07:00" placeholderTextColor={MUTED} /></View>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Salida</Text><TextInput style={styles.fieldInput} value={form.salida} onChangeText={v => setForm(f => ({ ...f, salida: v }))} placeholder="15:00" placeholderTextColor={MUTED} /></View>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}><Text style={styles.btnCancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={save}><Text style={styles.btnSaveText}>Registrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── ACTIVIDAD ─────────────────────────────────────────────────────────────────
function Actividad() {
  const [search, setSearch] = useState("");
  const filtered = INIT_ACTIVIDAD.filter(i => i.empleado.toLowerCase().includes(search.toLowerCase()));

  const accionColor = (accion: string) => {
    if (accion.includes("tomado"))    return { bg: "#FEF9EC", color: "#B45309" };
    if (accion.includes("entregado")) return { bg: PRIMARY_L,  color: PRIMARY   };
    if (accion.includes("listo"))     return { bg: "#ECFDF5",  color: "#065F46" };
    if (accion.includes("pago"))      return { bg: "#EEF2FF",  color: "#6366F1" };
    return                                   { bg: "#F1F5F9",  color: MUTED     };
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por empleado..." />
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="📊" title="Sin actividad" sub="La actividad del equipo aparecerá aquí" />
          : filtered.map(item => {
              const ac = accionColor(item.accion);
              return (
                <View key={item.id} style={styles.rowCard}>
                  <View style={[styles.rowStripe, { backgroundColor: ac.color }]} />
                  <View style={styles.rowBody}>
                    <View style={[styles.rowMain, { marginBottom: 0 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{item.empleado}</Text>
                        <Text style={styles.rowSub}>{item.detalle}</Text>
                      </View>
                      <View style={styles.rowRight}>
                        <View style={[styles.estadoPill, { backgroundColor: ac.bg }]}>
                          <Text style={[styles.estadoPillText, { color: ac.color }]}>{item.accion}</Text>
                        </View>
                        <Text style={styles.actividadFecha}>{item.fecha}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "lista",      label: "Lista",      icon: "👤" },
  { key: "roles",      label: "Roles",      icon: "🎭" },
  { key: "turnos",     label: "Turnos",     icon: "🕐" },
  { key: "actividad",  label: "Actividad",  icon: "📊" },
];

export default function EmpleadosScreen() {
  const params     = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab && TABS.find(t => t.key === params.tab) ? params.tab : "lista";
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <View style={styles.root}>
      <AppHeader restaurantName="Restaurante La 85" isOpen={true} />
      <View style={styles.layout}>
        <SidebarMenu />
        <View style={styles.main}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>👤 Empleados</Text>
            <Text style={styles.pageSubtitle}>{INIT_EMPLEADOS.filter(e => e.activo).length} activos · {INIT_EMPLEADOS.length} total</Text>
          </View>
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarInner}>
              {TABS.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <TouchableOpacity key={tab.key} style={[styles.tab, active && styles.tabActive]} onPress={() => setActiveTab(tab.key)} activeOpacity={0.75}>
                    <Text style={styles.tabIcon}>{tab.icon}</Text>
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          {activeTab === "lista"     && <Lista />}
          {activeTab === "roles"     && <RolesTab />}
          {activeTab === "turnos"    && <Turnos />}
          {activeTab === "actividad" && <Actividad />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  layout: { flex: 1, flexDirection: "row" },
  main:   { flex: 1, flexDirection: "column" },
  pageHeader:   { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  pageTitle:    { fontSize: 22, fontWeight: "800", color: DARK },
  pageSubtitle: { fontSize: 12, color: MUTED, marginTop: 2 },
  tabBar:        { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  tabBarInner:   { paddingHorizontal: 12, paddingVertical: 6, gap: 4, flexDirection: "row" },
  tab:           { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  tabActive:     { backgroundColor: PRIMARY_L },
  tabIcon:       { fontSize: 14 },
  tabLabel:      { fontSize: 13, fontWeight: "600", color: MUTED },
  tabLabelActive:{ color: PRIMARY, fontWeight: "700" },
  filtroBar:      { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  filtroBarInner: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, flexDirection: "row" },
  filtroBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: "#F1F5F9" },
  filtroBtnActive:{ backgroundColor: PRIMARY_L },
  filtroBtnText:  { fontSize: 12, fontWeight: "600", color: MUTED },
  filtroBtnTextActive: { color: PRIMARY },
  toolBar:    { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 8 },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10, height: 40 },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput:{ flex: 1, fontSize: 13, color: DARK },
  searchClear:{ fontSize: 13, color: MUTED, paddingLeft: 6 },
  btnPrimary:    { backgroundColor: PRIMARY, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  btnPrimaryText:{ color: "#fff", fontSize: 13, fontWeight: "700" },
  listContent: { padding: 14, paddingTop: 8 },
  rowCard:   { backgroundColor: CARD, borderRadius: 14, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: BORDER, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  rowStripe: { width: 5, flexShrink: 0 },
  rowBody:   { flex: 1, padding: 14 },
  rowMain:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  rowTitle:  { fontSize: 15, fontWeight: "700", color: DARK },
  rowSub:    { fontSize: 12, color: MUTED, marginTop: 2 },
  rowRight:  { alignItems: "flex-end", gap: 5 },
  rowActions:{ flexDirection: "row", gap: 8 },
  avatar:     { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: "800" },
  rolBadge:   { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  rolBadgeText:{ fontSize: 11, fontWeight: "700" },
  estadoPill:    { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  estadoPillText:{ fontSize: 11, fontWeight: "700" },
  salarioText:   { fontSize: 12, fontWeight: "700", color: PRIMARY },
  turnoText:     { fontSize: 11, color: MUTED },
  horasText:     { fontSize: 13, fontWeight: "700", color: DARK },
  actividadFecha:{ fontSize: 10, color: MUTED },
  rolIconBox:  { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  rolIconText: { fontSize: 18, fontWeight: "800" },
  miembrosWrap:{ flexDirection: "row", flexWrap: "wrap", gap: 6 },
  miembroChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  miembroChipText: { fontSize: 12, fontWeight: "600" },
  btnEdit:       { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  btnEditText:   { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
  btnDelete:     { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: DANGER_L, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  btnDeleteText: { fontSize: 12, color: DANGER, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard:    { backgroundColor: CARD, borderRadius: 20, padding: 20, width: "100%", maxWidth: 440 },
  modalTitle:   { fontSize: 18, fontWeight: "800", color: DARK, marginBottom: 16 },
  modalBtns:    { flexDirection: "row", gap: 10, marginTop: 16 },
  btnCancel:    { flex: 1, backgroundColor: "#F1F5F9", borderRadius: 11, paddingVertical: 12, alignItems: "center" },
  btnCancelText:{ fontSize: 14, fontWeight: "600", color: MUTED },
  btnSave:      { flex: 1, backgroundColor: PRIMARY, borderRadius: 11, paddingVertical: 12, alignItems: "center" },
  btnSaveText:  { fontSize: 14, fontWeight: "700", color: "#fff" },
  field:      { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  fieldInput: { backgroundColor: ROW_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: DARK },
  fieldRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  fieldRow2:  { flexDirection: "row", gap: 10 },
  catSelector:{ flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catOption:  { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: BORDER },
  catOptionActive:    { backgroundColor: PRIMARY_L, borderColor: PRIMARY },
  catOptionText:      { fontSize: 13, color: MUTED, fontWeight: "600" },
  catOptionTextActive:{ color: PRIMARY },
  emptyCard:  { marginTop: 40, backgroundColor: CARD, borderRadius: 20, padding: 40, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  emptyIcon:  { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: DARK },
  emptySub:   { fontSize: 13, color: MUTED, marginTop: 6, textAlign: "center" },
});
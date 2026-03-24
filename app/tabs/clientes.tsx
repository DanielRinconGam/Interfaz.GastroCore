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

const INIT_CLIENTES = [
  { id: 1,  nombre: "Andrés García",    telefono: "3101234567", email: "andres@mail.com",  visitas: 12, total_gastado: 480000, ultima_visita: "2026-03-17", activo: true,  notas: "Le gusta la bandeja paisa"   },
  { id: 2,  nombre: "Lucía Martínez",   telefono: "3209876543", email: "lucia@mail.com",   visitas: 8,  total_gastado: 320000, ultima_visita: "2026-03-15", activo: true,  notas: "Alérgica al mariscos"        },
  { id: 3,  nombre: "Carlos Rivas",     telefono: "3156789012", email: "",                 visitas: 3,  total_gastado: 95000,  ultima_visita: "2026-03-10", activo: true,  notas: ""                            },
  { id: 4,  nombre: "Valentina Ospina", telefono: "3178901234", email: "vale@mail.com",    visitas: 20, total_gastado: 950000, ultima_visita: "2026-03-18", activo: true,  notas: "Cliente VIP - descuento 10%" },
  { id: 5,  nombre: "Miguel Torres",    telefono: "3123456789", email: "miguel@mail.com",  visitas: 1,  total_gastado: 35000,  ultima_visita: "2026-02-28", activo: true,  notas: ""                            },
  { id: 6,  nombre: "Sandra López",     telefono: "3145678901", email: "sandra@mail.com",  visitas: 6,  total_gastado: 240000, ultima_visita: "2026-03-05", activo: false, notas: "Solicitó retiro de datos"    },
];

const INIT_HISTORIAL = [
  { id: 101, cliente: "Valentina Ospina", fecha: "2026-03-18", mesa: 4,  total: 98000,  items: "Bandeja paisa x2, Jugo de lulo x3" },
  { id: 102, cliente: "Andrés García",    fecha: "2026-03-17", mesa: 7,  total: 63000,  items: "Churrasco, Ensalada César" },
  { id: 103, cliente: "Lucía Martínez",   fecha: "2026-03-15", mesa: 2,  total: 45000,  items: "Ajiaco x2, Agua con gas" },
  { id: 104, cliente: "Valentina Ospina", fecha: "2026-03-14", mesa: 4,  total: 120000, items: "Cazuela de mariscos x2, Limonada x2" },
  { id: 105, cliente: "Sandra López",     fecha: "2026-03-05", mesa: 3,  total: 56000,  items: "Bandeja paisa, Jugo de lulo x2" },
  { id: 106, cliente: "Carlos Rivas",     fecha: "2026-03-10", mesa: 8,  total: 38000,  items: "Costillas BBQ" },
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
  const [items, setItems]     = useState(INIT_CLIENTES);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ nombre: "", telefono: "", email: "", notas: "", activo: true });

  const filtered = items.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    i.telefono.includes(search)
  );

  const openNew  = () => { setEditing(null); setForm({ nombre: "", telefono: "", email: "", notas: "", activo: true }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, telefono: item.telefono, email: item.email, notas: item.notas, activo: item.activo }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i));
    } else {
      setItems(prev => [...prev, { id: genId(), ...form, visitas: 0, total_gastado: 0, ultima_visita: new Date().toISOString().split("T")[0] }]);
    }
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar cliente", `¿Eliminar a "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}><Text style={styles.btnPrimaryText}>+ Cliente</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="👥" title="Sin clientes" sub="Registra tu primer cliente" />
          : filtered.map(item => (
            <View key={item.id} style={styles.rowCard}>
              <View style={[styles.rowStripe, { backgroundColor: item.activo ? PRIMARY : "#CBD5E1" }]} />
              <View style={styles.rowBody}>
                <View style={styles.rowMain}>
                  <View style={[styles.avatar, { backgroundColor: item.activo ? PRIMARY_L : "#F1F5F9" }]}>
                    <Text style={[styles.avatarText, { color: item.activo ? PRIMARY : MUTED }]}>{initials(item.nombre)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.nombre}</Text>
                    <Text style={styles.rowSub}>📞 {item.telefono}{item.email ? ` · ✉️ ${item.email}` : ""}</Text>
                    {item.notas ? <Text style={[styles.rowSub, { color: "#92400E" }]}>📌 {item.notas}</Text> : null}
                  </View>
                  <View style={styles.rowRight}>
                    <View style={styles.statMini}>
                      <Text style={styles.statMiniVal}>{item.visitas}</Text>
                      <Text style={styles.statMiniLabel}>visitas</Text>
                    </View>
                    <View style={styles.statMini}>
                      <Text style={[styles.statMiniVal, { color: PRIMARY, fontSize: 12 }]}>{formatCOP(item.total_gastado)}</Text>
                      <Text style={styles.statMiniLabel}>gastado</Text>
                    </View>
                    <View style={[styles.estadoPill, { backgroundColor: item.activo ? PRIMARY_L : "#F1F5F9" }]}>
                      <Text style={[styles.estadoPillText, { color: item.activo ? PRIMARY : MUTED }]}>{item.activo ? "Activo" : "Inactivo"}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.btnEdit} onPress={() => openEdit(item)}><Text style={styles.btnEditText}>✏️ Editar</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.btnDelete} onPress={() => eliminar(item)}><Text style={styles.btnDeleteText}>🗑 Eliminar</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? "Editar cliente" : "Nuevo cliente"}</Text>
            <View style={styles.field}><Text style={styles.fieldLabel}>Nombre *</Text><TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Nombre completo" placeholderTextColor={MUTED} /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Teléfono</Text><TextInput style={styles.fieldInput} value={form.telefono} onChangeText={v => setForm(f => ({ ...f, telefono: v }))} placeholder="3100000000" placeholderTextColor={MUTED} keyboardType="phone-pad" /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Email</Text><TextInput style={styles.fieldInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="correo@ejemplo.com" placeholderTextColor={MUTED} keyboardType="email-address" /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Notas</Text><TextInput style={[styles.fieldInput, { height: 72 }]} value={form.notas} onChangeText={v => setForm(f => ({ ...f, notas: v }))} placeholder="Preferencias, alergias..." placeholderTextColor={MUTED} multiline /></View>
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

// ── HISTORIAL ─────────────────────────────────────────────────────────────────
function Historial() {
  const [search, setSearch] = useState("");
  const filtered = INIT_HISTORIAL.filter(i => i.cliente.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por cliente..." />
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="📋" title="Sin historial" sub="El historial de visitas aparecerá aquí" />
          : filtered.map(item => (
            <View key={item.id} style={styles.rowCard}>
              <View style={[styles.rowStripe, { backgroundColor: PRIMARY }]} />
              <View style={styles.rowBody}>
                <View style={styles.rowMain}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.cliente}</Text>
                    <Text style={styles.rowSub}>📅 {item.fecha} · 🪑 Mesa {item.mesa}</Text>
                    <Text style={styles.rowSub}>🍽 {item.items}</Text>
                  </View>
                  <Text style={styles.historialTotal}>{formatCOP(item.total)}</Text>
                </View>
              </View>
            </View>
          ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── FRECUENTES ────────────────────────────────────────────────────────────────
function Frecuentes() {
  const frecuentes = [...INIT_CLIENTES]
    .filter(c => c.activo)
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 10);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionLabel}>Top clientes por visitas</Text>
        {frecuentes.map((item, idx) => (
          <View key={item.id} style={styles.rowCard}>
            <View style={[styles.rowStripe, { backgroundColor: idx === 0 ? "#F59E0B" : idx === 1 ? "#94A3B8" : idx === 2 ? "#B45309" : PRIMARY }]} />
            <View style={styles.rowBody}>
              <View style={[styles.rowMain, { marginBottom: 0 }]}>
                <View style={[styles.rankBadge, { backgroundColor: idx < 3 ? "#FEF9EC" : PRIMARY_L }]}>
                  <Text style={[styles.rankText, { color: idx < 3 ? "#B45309" : PRIMARY }]}>#{idx + 1}</Text>
                </View>
                <View style={[styles.avatar, { backgroundColor: PRIMARY_L }]}>
                  <Text style={[styles.avatarText, { color: PRIMARY }]}>{initials(item.nombre)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.nombre}</Text>
                  <Text style={styles.rowSub}>📞 {item.telefono}</Text>
                  {item.notas ? <Text style={[styles.rowSub, { color: "#92400E" }]}>📌 {item.notas}</Text> : null}
                </View>
                <View style={styles.rowRight}>
                  <View style={styles.statMini}>
                    <Text style={styles.statMiniVal}>{item.visitas}</Text>
                    <Text style={styles.statMiniLabel}>visitas</Text>
                  </View>
                  <View style={styles.statMini}>
                    <Text style={[styles.statMiniVal, { color: PRIMARY, fontSize: 12 }]}>{formatCOP(item.total_gastado)}</Text>
                    <Text style={styles.statMiniLabel}>gastado</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const TABS = [
  { key: "lista",      label: "Lista",      icon: "👥" },
  { key: "historial",  label: "Historial",  icon: "📋" },
  { key: "frecuentes", label: "Frecuentes", icon: "⭐" },
];

export default function ClientesScreen() {
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
            <Text style={styles.pageTitle}>👥 Clientes</Text>
            <Text style={styles.pageSubtitle}>{INIT_CLIENTES.filter(c => c.activo).length} clientes activos</Text>
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
          {activeTab === "lista"      && <Lista />}
          {activeTab === "historial"  && <Historial />}
          {activeTab === "frecuentes" && <Frecuentes />}
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
  toolBar:    { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 8 },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10, height: 40 },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput:{ flex: 1, fontSize: 13, color: DARK },
  searchClear:{ fontSize: 13, color: MUTED, paddingLeft: 6 },
  btnPrimary:    { backgroundColor: PRIMARY, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  btnPrimaryText:{ color: "#fff", fontSize: 13, fontWeight: "700" },
  listContent: { padding: 14, paddingTop: 8 },
  sectionLabel:{ fontSize: 12, fontWeight: "700", color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 },
  rowCard:   { backgroundColor: CARD, borderRadius: 14, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: BORDER, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  rowStripe: { width: 5, flexShrink: 0 },
  rowBody:   { flex: 1, padding: 14 },
  rowMain:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  rowTitle:  { fontSize: 15, fontWeight: "700", color: DARK },
  rowSub:    { fontSize: 12, color: MUTED, marginTop: 2 },
  rowRight:  { alignItems: "flex-end", gap: 6 },
  rowActions:{ flexDirection: "row", gap: 8 },
  avatar:     { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: "800" },
  statMini:   { alignItems: "flex-end" },
  statMiniVal:{ fontSize: 14, fontWeight: "800", color: DARK },
  statMiniLabel:{ fontSize: 10, color: MUTED },
  estadoPill:    { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  estadoPillText:{ fontSize: 11, fontWeight: "700" },
  historialTotal:{ fontSize: 16, fontWeight: "800", color: PRIMARY },
  rankBadge:  { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  rankText:   { fontSize: 13, fontWeight: "800" },
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
  emptyCard:  { marginTop: 40, backgroundColor: CARD, borderRadius: 20, padding: 40, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  emptyIcon:  { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: DARK },
  emptySub:   { fontSize: 13, color: MUTED, marginTop: 6, textAlign: "center" },
});
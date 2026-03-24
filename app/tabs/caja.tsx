import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import AppHeader from "../../scr/components/layout/AppHeader";
import SidebarMenu from "../../scr/components/layout/SidebarMenu";

const API       = "http://localhost:5000";
const PRIMARY   = "#46A38C";
const PRIMARY_L = "#E8F5F1";
const BG        = "#F0F4F8";
const DARK      = "#0F172A";
const CARD      = "#FFFFFF";
const MUTED     = "#64748B";
const BORDER    = "#E8EDF2";
const ROW_BG    = "#F8FAFC";

// ── Datos quemados ────────────────────────────────────────────────────────────
const MOCK_CUENTAS = [
  {
    id: 5001, estado: "por_cobrar",
    mesa_numero: 4, mesero_nombre: "Juan P.",
    num_personas: 4, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    metodo_pago: null,
    items: [
      { producto_nombre: "Bandeja paisa",      cantidad: 2, precio_unitario: 28000 },
      { producto_nombre: "Ajiaco santafereño", cantidad: 1, precio_unitario: 24000 },
      { producto_nombre: "Jugo de lulo",       cantidad: 3, precio_unitario: 6000  },
    ],
    descuento: 0,
  },
  {
    id: 5002, estado: "por_cobrar",
    mesa_numero: 7, mesero_nombre: "María G.",
    num_personas: 2, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    metodo_pago: null,
    items: [
      { producto_nombre: "Churrasco a la brasa", cantidad: 1, precio_unitario: 45000 },
      { producto_nombre: "Ensalada César",       cantidad: 1, precio_unitario: 18000 },
      { producto_nombre: "Agua con gas",         cantidad: 2, precio_unitario: 4000  },
    ],
    descuento: 5000,
  },
  {
    id: 5003, estado: "por_cobrar",
    mesa_numero: 2, mesero_nombre: "Carlos R.",
    num_personas: 6, tipo_servicio: "domicilio",
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    metodo_pago: null,
    items: [
      { producto_nombre: "Costillas BBQ",     cantidad: 4, precio_unitario: 32000 },
      { producto_nombre: "Caldo de costilla", cantidad: 2, precio_unitario: 12000 },
    ],
    descuento: 0,
  },
  {
    id: 5000, estado: "pagado",
    mesa_numero: 5, mesero_nombre: "Pedro S.",
    num_personas: 2, tipo_servicio: "para_llevar",
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    metodo_pago: "efectivo",
    items: [
      { producto_nombre: "Cazuela de mariscos", cantidad: 2, precio_unitario: 38000 },
      { producto_nombre: "Pan de bono",         cantidad: 4, precio_unitario: 3000  },
    ],
    descuento: 0,
  },
  {
    id: 4998, estado: "pagado",
    mesa_numero: 3, mesero_nombre: "Ana T.",
    num_personas: 4, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    metodo_pago: "tarjeta",
    items: [
      { producto_nombre: "Sancocho trifásico", cantidad: 4, precio_unitario: 26000 },
      { producto_nombre: "Limonada de coco",   cantidad: 4, precio_unitario: 7000  },
    ],
    descuento: 10000,
  },
  {
    id: 4997, estado: "pagado",
    mesa_numero: 8, mesero_nombre: "Laura M.",
    num_personas: 3, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 150 * 60000).toISOString(),
    metodo_pago: "nequi",
    items: [
      { producto_nombre: "Pargo frito",  cantidad: 2, precio_unitario: 35000 },
      { producto_nombre: "Patacones",    cantidad: 3, precio_unitario: 5000  },
      { producto_nombre: "Agua panela",  cantidad: 3, precio_unitario: 5000  },
    ],
    descuento: 0,
  },
];

const METODOS_PAGO = [
  { key: "efectivo", label: "Efectivo",     icon: "💵" },
  { key: "tarjeta",  label: "Tarjeta",      icon: "💳" },
  { key: "nequi",    label: "Nequi",        icon: "📱" },
  { key: "daviplata",label: "Daviplata",    icon: "📲" },
  { key: "transferencia", label: "Transferencia", icon: "🏦" },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "por_cobrar", label: "Por cobrar", icon: "💰", estados: ["por_cobrar"], emptyMsg: "No hay cuentas pendientes por cobrar" },
  { key: "pagos",      label: "Pagos",      icon: "✅", estados: ["pagado"],     emptyMsg: "No hay pagos registrados hoy" },
  { key: "historial",  label: "Historial",  icon: "📋", estados: ["pagado", "anulado"], emptyMsg: "No hay registros en el historial" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function tiempoTranscurrido(fecha: string) {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (diff < 1) return "Ahora";
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}min`;
}
function tiempoColor(fecha: string) {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (diff < 20) return { bg: "#ECFDF5", dot: "#10B981", text: "#065F46" };
  if (diff < 40) return { bg: "#FEF9EC", dot: "#F59E0B", text: "#B45309" };
  return { bg: "#FEF2F2", dot: "#EF4444", text: "#991B1B" };
}
function formatCOP(n: number) {
  return "$" + n.toLocaleString("es-CO");
}
function tipoLabel(tipo: string) {
  if (tipo === "domicilio")   return "🛵 Domicilio";
  if (tipo === "para_llevar") return "🥡 Para llevar";
  return "🍽 Mesa";
}
function metodoPagoLabel(metodo: string) {
  return METODOS_PAGO.find(m => m.key === metodo)?.label ?? metodo;
}
function metodoPagoIcon(metodo: string) {
  return METODOS_PAGO.find(m => m.key === metodo)?.icon ?? "💰";
}

// ── CuentaCard ────────────────────────────────────────────────────────────────
function CuentaCard({ cuenta, onCobrar, readonly }: {
  cuenta: any; onCobrar: (c: any, metodo: string) => void; readonly: boolean;
}) {
  const [showMetodos, setShowMetodos] = useState(false);

  const subtotal   = cuenta.items?.reduce((acc: number, i: any) => acc + i.precio_unitario * i.cantidad, 0) ?? 0;
  const descuento  = cuenta.descuento ?? 0;
  const total      = subtotal - descuento;
  const tc         = tiempoColor(cuenta.created_at);
  const esPagado   = cuenta.estado === "pagado";
  const stripeColor = esPagado ? "#10B981" : "#F59E0B";

  return (
    <View style={styles.card}>
      <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
      <View style={styles.cardBody}>

        {/* Header */}
        <View style={styles.cardHead}>
          <View>
            <Text style={styles.mesa}>Mesa {cuenta.mesa_numero ?? "—"}</Text>
            <Text style={styles.cuentaId}>Cuenta #{cuenta.id}</Text>
          </View>
          <View style={styles.badgesCol}>
            <View style={[styles.pill, { backgroundColor: tc.bg }]}>
              <View style={[styles.dot, { backgroundColor: tc.dot }]} />
              <Text style={[styles.pillText, { color: tc.text }]}>⏱ {tiempoTranscurrido(cuenta.created_at)}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: esPagado ? "#ECFDF5" : "#FEF9EC" }]}>
              <View style={[styles.dot, { backgroundColor: esPagado ? "#10B981" : "#F59E0B" }]} />
              <Text style={[styles.pillText, { color: esPagado ? "#065F46" : "#B45309" }]}>
                {esPagado ? "Pagado" : "Por cobrar"}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta chips */}
        <View style={styles.metaRow}>
          {cuenta.mesero_nombre  && <View style={styles.chip}><Text style={styles.chipText}>👤 {cuenta.mesero_nombre}</Text></View>}
          {cuenta.num_personas   && <View style={styles.chip}><Text style={styles.chipText}>🪑 {cuenta.num_personas} personas</Text></View>}
          {cuenta.tipo_servicio  && <View style={styles.chip}><Text style={styles.chipText}>{tipoLabel(cuenta.tipo_servicio)}</Text></View>}
          {esPagado && cuenta.metodo_pago && (
            <View style={[styles.chip, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
              <Text style={[styles.chipText, { color: "#065F46" }]}>
                {metodoPagoIcon(cuenta.metodo_pago)} {metodoPagoLabel(cuenta.metodo_pago)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Items header */}
        <View style={styles.itemsHeader}>
          <Text style={[styles.itemsHeaderTxt, { width: 32 }]}>Cant.</Text>
          <Text style={[styles.itemsHeaderTxt, { flex: 1 }]}>Producto</Text>
          <Text style={[styles.itemsHeaderTxt, { width: 80, textAlign: "right" }]}>Unitario</Text>
          <Text style={[styles.itemsHeaderTxt, { width: 80, textAlign: "right" }]}>Subtotal</Text>
        </View>

        {/* Items */}
        <View style={styles.itemsList}>
          {cuenta.items?.map((item: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{item.cantidad}</Text>
              </View>
              <Text style={styles.itemNombre} numberOfLines={1}>{item.producto_nombre}</Text>
              <Text style={styles.precioUnit}>{formatCOP(item.precio_unitario)}</Text>
              <Text style={styles.precioTotal}>{formatCOP(item.precio_unitario * item.cantidad)}</Text>
            </View>
          ))}
        </View>

        {/* Resumen */}
        <View style={styles.resumenBox}>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Subtotal</Text>
            <Text style={styles.resumenVal}>{formatCOP(subtotal)}</Text>
          </View>
          {descuento > 0 && (
            <View style={styles.resumenRow}>
              <Text style={[styles.resumenLabel, { color: "#10B981" }]}>Descuento</Text>
              <Text style={[styles.resumenVal, { color: "#10B981" }]}>- {formatCOP(descuento)}</Text>
            </View>
          )}
          <View style={[styles.resumenRow, styles.resumenTotalRow]}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalVal}>{formatCOP(total)}</Text>
          </View>
        </View>

        {/* Botón cobrar */}
        {!readonly && !esPagado && (
          <>
            {!showMetodos ? (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: PRIMARY }]}
                onPress={() => setShowMetodos(true)}
                activeOpacity={0.82}
              >
                <Text style={styles.btnText}>💰 Cobrar {formatCOP(total)}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.metodosWrap}>
                <Text style={styles.metodosTitle}>Selecciona método de pago</Text>
                <View style={styles.metodosGrid}>
                  {METODOS_PAGO.map(m => (
                    <TouchableOpacity
                      key={m.key}
                      style={styles.metodoBtn}
                      onPress={() => { setShowMetodos(false); onCobrar(cuenta, m.key); }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.metodoBtnIcon}>{m.icon}</Text>
                      <Text style={styles.metodoBtnLabel}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setShowMetodos(false)} style={styles.cancelarMetodo}>
                  <Text style={styles.cancelarMetodoText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

      </View>
    </View>
  );
}

// ── Resumen del día ───────────────────────────────────────────────────────────
function ResumenDia({ cuentas }: { cuentas: any[] }) {
  const pagadas   = cuentas.filter(c => c.estado === "pagado");
  const pendientes = cuentas.filter(c => c.estado === "por_cobrar");
  const totalDia  = pagadas.reduce((acc, c) => {
    const sub = c.items?.reduce((a: number, i: any) => a + i.precio_unitario * i.cantidad, 0) ?? 0;
    return acc + sub - (c.descuento ?? 0);
  }, 0);
  const totalPendiente = pendientes.reduce((acc, c) => {
    const sub = c.items?.reduce((a: number, i: any) => a + i.precio_unitario * i.cantidad, 0) ?? 0;
    return acc + sub - (c.descuento ?? 0);
  }, 0);

  return (
    <View style={styles.resumenDiaRow}>
      <View style={[styles.resumenDiaCard, { backgroundColor: "#ECFDF5" }]}>
        <Text style={styles.resumenDiaIcon}>💰</Text>
        <Text style={[styles.resumenDiaVal, { color: "#065F46" }]}>{formatCOP(totalDia)}</Text>
        <Text style={[styles.resumenDiaLabel, { color: "#065F46" }]}>Cobrado hoy</Text>
      </View>
      <View style={[styles.resumenDiaCard, { backgroundColor: "#FEF9EC" }]}>
        <Text style={styles.resumenDiaIcon}>⏳</Text>
        <Text style={[styles.resumenDiaVal, { color: "#B45309" }]}>{formatCOP(totalPendiente)}</Text>
        <Text style={[styles.resumenDiaLabel, { color: "#B45309" }]}>Por cobrar</Text>
      </View>
      <View style={[styles.resumenDiaCard, { backgroundColor: "#EFF6FF" }]}>
        <Text style={styles.resumenDiaIcon}>🧾</Text>
        <Text style={[styles.resumenDiaVal, { color: "#1D4ED8" }]}>{pagadas.length}</Text>
        <Text style={[styles.resumenDiaLabel, { color: "#1D4ED8" }]}>Cuentas cerradas</Text>
      </View>
      <View style={[styles.resumenDiaCard, { backgroundColor: "#F5F3FF" }]}>
        <Text style={styles.resumenDiaIcon}>📋</Text>
        <Text style={[styles.resumenDiaVal, { color: "#6D28D9" }]}>{pendientes.length}</Text>
        <Text style={[styles.resumenDiaLabel, { color: "#6D28D9" }]}>Mesas activas</Text>
      </View>
    </View>
  );
}

// ── TabBar ────────────────────────────────────────────────────────────────────
function TabBar({ activeTab, setActiveTab, counts }: {
  activeTab: string; setActiveTab: (k: string) => void; counts: Record<string, number>;
}) {
  return (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarInner}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          const count  = counts[tab.key] ?? 0;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              {count > 0 && (
                <View style={[styles.tabCount, { backgroundColor: active ? PRIMARY : "#E2E8F0" }]}>
                  <Text style={[styles.tabCountText, { color: active ? "#fff" : MUTED }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ msg }: { msg: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>💰</Text>
      <Text style={styles.emptyTitle}>Sin registros</Text>
      <Text style={styles.emptySub}>{msg}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function CajaScreen() {
  const params     = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab && TABS.find(t => t.key === params.tab) ? params.tab : "por_cobrar";

  const [cuentas, setCuentas]       = useState<any[]>(MOCK_CUENTAS);
  const [loading, setLoading]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState(initialTab);

  useEffect(() => {
    if (params.tab && TABS.find(t => t.key === params.tab)) setActiveTab(params.tab);
  }, [params.tab]);

  // 👇 Cuando el backend esté listo, descomenta esto:
  // const fetchCaja = async () => {
  //   try {
  //     const res = await fetch(`${API}/caja`);
  //     setCuentas(await res.json());
  //   } catch (e) { console.error(e); }
  //   finally { setLoading(false); setRefreshing(false); }
  // };
  // useEffect(() => { fetchCaja(); }, []);

  const cobrarCuenta = (cuenta: any, metodo: string) => {
    setCuentas(prev =>
      prev.map(c => c.id === cuenta.id ? { ...c, estado: "pagado", metodo_pago: metodo } : c)
    );
    // 👇 Backend:
    // fetch(`${API}/caja/${cuenta.id}/cobrar`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ metodo_pago: metodo }) });
  };

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const visibles   = cuentas.filter(c => currentTab.estados.includes(c.estado));
  const readonly   = activeTab === "historial";

  const counts: Record<string, number> = {};
  TABS.forEach(tab => { counts[tab.key] = cuentas.filter(c => tab.estados.includes(c.estado)).length; });

  return (
    <View style={styles.root}>
      <AppHeader restaurantName="Restaurante La 85" isOpen={true} />
      <View style={styles.layout}>
        <SidebarMenu />
        <View style={styles.main}>

          {/* Page header */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>💳 Caja</Text>
              <Text style={styles.pageSubtitle}>Gestión de pagos</Text>
            </View>
            <View style={styles.activosBadge}>
              <Text style={styles.activosText}>{counts["por_cobrar"] ?? 0} por cobrar</Text>
            </View>
          </View>

          {/* Resumen del día */}
          <ResumenDia cuentas={cuentas} />

          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></View>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
                  colors={[PRIMARY]}
                />
              }
            >
              {visibles.length === 0 ? (
                <EmptyState msg={currentTab.emptyMsg} />
              ) : (
                <View style={styles.grid}>
                  {visibles.map(c => (
                    <View key={c.id} style={styles.gridItem}>
                      <CuentaCard cuenta={c} onCobrar={cobrarCuenta} readonly={readonly} />
                    </View>
                  ))}
                </View>
              )}
              <View style={{ height: 32 }} />
            </ScrollView>
          )}

        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  layout: { flex: 1, flexDirection: "row" },
  main:   { flex: 1, flexDirection: "column" },

  pageHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  pageTitle:    { fontSize: 22, fontWeight: "800", color: DARK },
  pageSubtitle: { fontSize: 12, color: MUTED, marginTop: 2 },
  activosBadge: { backgroundColor: "#F59E0B", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  activosText:  { color: "#fff", fontSize: 13, fontWeight: "700" },

  resumenDiaRow:  { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  resumenDiaCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 2 },
  resumenDiaIcon: { fontSize: 18, marginBottom: 2 },
  resumenDiaVal:  { fontSize: 15, fontWeight: "800" },
  resumenDiaLabel:{ fontSize: 10, fontWeight: "600", textAlign: "center" },

  tabBar:        { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  tabBarInner:   { paddingHorizontal: 12, paddingVertical: 6, gap: 4, flexDirection: "row" },
  tab:           { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  tabActive:     { backgroundColor: PRIMARY_L },
  tabIcon:       { fontSize: 14 },
  tabLabel:      { fontSize: 13, fontWeight: "600", color: MUTED },
  tabLabelActive:{ color: PRIMARY, fontWeight: "700" },
  tabCount:      { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, minWidth: 22, alignItems: "center" },
  tabCountText:  { fontSize: 11, fontWeight: "800" },

  scroll:        { flex: 1 },
  scrollContent: { padding: 14, paddingTop: 10 },
  center:        { flex: 1, justifyContent: "center", alignItems: "center" },

  grid:     { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { flexBasis: "48%", flexGrow: 1, minWidth: 300 },

  card:     { backgroundColor: CARD, borderRadius: 16, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  stripe:   { width: 5, flexShrink: 0 },
  cardBody: { flex: 1, padding: 14 },

  cardHead:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  mesa:      { fontSize: 17, fontWeight: "800", color: DARK },
  cuentaId:  { fontSize: 11, color: MUTED, marginTop: 2 },
  badgesCol: { alignItems: "flex-end", gap: 5 },

  pill:     { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: "700" },

  metaRow:  { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip:     { backgroundColor: ROW_BG, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: BORDER },
  chipText: { fontSize: 11, color: MUTED },

  divider: { height: 1, backgroundColor: BORDER, marginBottom: 8 },

  itemsHeader:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 4, paddingBottom: 6, gap: 6 },
  itemsHeaderTxt: { fontSize: 10, fontWeight: "700", color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },

  itemsList:  { gap: 7, marginBottom: 12 },
  itemRow:    { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: ROW_BG, borderRadius: 10, padding: 9, borderWidth: 1, borderColor: BORDER },
  qtyBadge:   { width: 26, height: 26, borderRadius: 7, backgroundColor: PRIMARY, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  qtyText:    { color: "#fff", fontSize: 11, fontWeight: "800" },
  itemNombre: { flex: 1, fontSize: 13, fontWeight: "600", color: DARK },
  precioUnit: { fontSize: 11, color: MUTED, width: 80, textAlign: "right" },
  precioTotal:{ fontSize: 13, fontWeight: "700", color: PRIMARY, width: 80, textAlign: "right" },

  resumenBox:      { backgroundColor: ROW_BG, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  resumenRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 3 },
  resumenLabel:    { fontSize: 12, color: MUTED },
  resumenVal:      { fontSize: 12, fontWeight: "600", color: DARK },
  resumenTotalRow: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 6, paddingTop: 8 },
  totalLabel:      { fontSize: 13, fontWeight: "700", color: DARK },
  totalVal:        { fontSize: 18, fontWeight: "800", color: DARK },

  btn:     { borderRadius: 11, paddingVertical: 13, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },

  metodosWrap:       { backgroundColor: ROW_BG, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  metodosTitle:      { fontSize: 12, fontWeight: "700", color: MUTED, marginBottom: 10, textAlign: "center" },
  metodosGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  metodoBtn:         { flexBasis: "30%", flexGrow: 1, backgroundColor: CARD, borderRadius: 10, padding: 10, alignItems: "center", gap: 4, borderWidth: 1, borderColor: BORDER },
  metodoBtnIcon:     { fontSize: 20 },
  metodoBtnLabel:    { fontSize: 11, fontWeight: "600", color: DARK, textAlign: "center" },
  cancelarMetodo:    { alignItems: "center", paddingVertical: 6 },
  cancelarMetodoText:{ fontSize: 12, color: MUTED, fontWeight: "600" },

  emptyCard:  { marginTop: 40, backgroundColor: CARD, borderRadius: 20, padding: 40, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  emptyIcon:  { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: DARK },
  emptySub:   { fontSize: 13, color: MUTED, marginTop: 6, textAlign: "center" },
});
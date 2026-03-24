import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Modal, Pressable,
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
const MOCK_PEDIDOS = [
  {
    id: 1044, estado: "activo", mesa_numero: 2,
    mesero_nombre: "Carlos R.", num_personas: 6, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 1 * 60000).toISOString(),
    observaciones: "Cliente VIP, atención prioritaria",
    items: [
      { producto_nombre: "Costillas BBQ",     cantidad: 4, precio_unitario: 32000, notas: "Extra salsa" },
      { producto_nombre: "Caldo de costilla", cantidad: 2, precio_unitario: 12000, notas: "" },
    ],
  },
  {
    id: 1045, estado: "activo", mesa_numero: 1,
    mesero_nombre: "Laura M.", num_personas: 3, tipo_servicio: "domicilio",
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    observaciones: "",
    items: [
      { producto_nombre: "Pollo asado",     cantidad: 2, precio_unitario: 22000, notas: "" },
      { producto_nombre: "Arroz con leche", cantidad: 3, precio_unitario: 8000,  notas: "Extra canela" },
    ],
  },
  {
    id: 1042, estado: "en_cocina", mesa_numero: 4,
    mesero_nombre: "Juan P.", num_personas: 4, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    observaciones: "",
    items: [
      { producto_nombre: "Bandeja paisa",      cantidad: 2, precio_unitario: 28000, notas: "Sin chicharrón" },
      { producto_nombre: "Ajiaco santafereño", cantidad: 1, precio_unitario: 24000, notas: "" },
      { producto_nombre: "Jugo de lulo",       cantidad: 3, precio_unitario: 6000,  notas: "En agua, sin azúcar" },
    ],
  },
  {
    id: 1043, estado: "en_cocina", mesa_numero: 7,
    mesero_nombre: "María G.", num_personas: 2, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    observaciones: "",
    items: [
      { producto_nombre: "Churrasco a la brasa", cantidad: 1, precio_unitario: 45000, notas: "Término 3/4, sin papa" },
      { producto_nombre: "Ensalada César",       cantidad: 1, precio_unitario: 18000, notas: "" },
    ],
  },
  {
    id: 1040, estado: "listo", mesa_numero: 5,
    mesero_nombre: "Pedro S.", num_personas: 2, tipo_servicio: "para_llevar",
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    observaciones: "Empacar con cubiertos",
    items: [
      { producto_nombre: "Cazuela de mariscos", cantidad: 2, precio_unitario: 38000, notas: "" },
      { producto_nombre: "Pan de bono",         cantidad: 4, precio_unitario: 3000,  notas: "" },
    ],
  },
  {
    id: 1041, estado: "entregado", mesa_numero: 8,
    mesero_nombre: "Ana T.", num_personas: 5, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    observaciones: "",
    items: [
      { producto_nombre: "Pargo frito",    cantidad: 2, precio_unitario: 35000, notas: "" },
      { producto_nombre: "Patacones",      cantidad: 3, precio_unitario: 5000,  notas: "" },
      { producto_nombre: "Agua con gas",   cantidad: 5, precio_unitario: 4000,  notas: "" },
    ],
  },
  {
    id: 1038, estado: "entregado", mesa_numero: 3,
    mesero_nombre: "Ana T.", num_personas: 4, tipo_servicio: "mesa",
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    observaciones: "",
    items: [
      { producto_nombre: "Sancocho trifásico", cantidad: 4, precio_unitario: 26000, notas: "" },
      { producto_nombre: "Limonada de coco",   cantidad: 4, precio_unitario: 7000,  notas: "" },
    ],
  },
  {
    id: 1036, estado: "cancelado", mesa_numero: 6,
    mesero_nombre: "Carlos R.", num_personas: 1, tipo_servicio: "domicilio",
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    observaciones: "Cliente no contestó",
    items: [
      { producto_nombre: "Hamburguesa criolla", cantidad: 1, precio_unitario: 19000, notas: "Sin cebolla" },
    ],
  },
];

// ── Estado config ─────────────────────────────────────────────────────────────
const ESTADO_CFG: Record<string, {
  color: string; bg: string; dot: string; label: string;
  next?: string; nextLabel?: string;
}> = {
  activo:    { color: "#F59E0B", bg: "#FEF9EC", dot: "#F59E0B", label: "Activo",    next: "en_cocina", nextLabel: "Enviar a cocina" },
  en_cocina: { color: "#3B82F6", bg: "#EFF6FF", dot: "#3B82F6", label: "En cocina", next: "listo",     nextLabel: "Marcar listo" },
  listo:     { color: "#10B981", bg: "#ECFDF5", dot: "#10B981", label: "Listo",     next: "entregado", nextLabel: "Marcar entregado" },
  entregado: { color: "#6366F1", bg: "#EEF2FF", dot: "#6366F1", label: "Entregado" },
  cancelado: { color: "#EF4444", bg: "#FEF2F2", dot: "#EF4444", label: "Cancelado" },
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "activos",    label: "Activos",    icon: "🟡", estados: ["activo"],                  emptyMsg: "No hay pedidos activos" },
  { key: "en_cocina",  label: "En cocina",  icon: "🔵", estados: ["en_cocina"],               emptyMsg: "No hay pedidos en cocina" },
  { key: "listos",     label: "Listos",     icon: "✅", estados: ["listo"],                   emptyMsg: "No hay pedidos listos" },
  { key: "entregados", label: "Entregados", icon: "🟣", estados: ["entregado"],               emptyMsg: "No hay pedidos entregados" },
  { key: "cancelados", label: "Cancelados", icon: "🔴", estados: ["cancelado"],               emptyMsg: "No hay pedidos cancelados" },
  { key: "historial",  label: "Historial",  icon: "📋", estados: ["entregado", "cancelado"],  emptyMsg: "No hay pedidos en el historial" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function tiempoTranscurrido(fecha: string) {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (diff < 1) return "Ahora";
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  return `${h}h ${diff % 60}min`;
}
function tiempoColor(fecha: string) {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (diff < 10) return { bg: "#ECFDF5", dot: "#10B981", text: "#065F46" };
  if (diff < 20) return { bg: "#FEF9EC", dot: "#F59E0B", text: "#B45309" };
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

// ── PedidoCard ────────────────────────────────────────────────────────────────
function PedidoCard({ pedido, onAvanzar, onCancelar, readonly }: {
  pedido: any; onAvanzar: (p: any) => void; onCancelar: (p: any) => void; readonly: boolean;
}) {
  const cfg   = ESTADO_CFG[pedido.estado];
  const tc    = tiempoColor(pedido.created_at);
  const total = pedido.items?.reduce(
    (acc: number, i: any) => acc + (i.precio_unitario ?? 0) * (i.cantidad ?? 1), 0
  ) ?? 0;
  const subtotal = total;
  const descuento = 0;
  const totalFinal = subtotal - descuento;

  return (
    <View style={styles.card}>
      <View style={[styles.stripe, { backgroundColor: cfg?.color ?? MUTED }]} />
      <View style={styles.cardBody}>

        {/* Header */}
        <View style={styles.cardHead}>
          <View>
            <Text style={styles.mesa}>Mesa {pedido.mesa_numero ?? "—"}</Text>
            <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
          </View>
          <View style={styles.badgesCol}>
            <View style={[styles.pill, { backgroundColor: tc.bg }]}>
              <View style={[styles.dot, { backgroundColor: tc.dot }]} />
              <Text style={[styles.pillText, { color: tc.text }]}>⏱ {tiempoTranscurrido(pedido.created_at)}</Text>
            </View>
            {cfg && (
              <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
                <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
                <Text style={[styles.pillText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Meta chips */}
        <View style={styles.metaRow}>
          {pedido.mesero_nombre  && <View style={styles.chip}><Text style={styles.chipText}>👤 {pedido.mesero_nombre}</Text></View>}
          {pedido.num_personas   && <View style={styles.chip}><Text style={styles.chipText}>🪑 {pedido.num_personas} personas</Text></View>}
          {pedido.tipo_servicio  && <View style={styles.chip}><Text style={styles.chipText}>{tipoLabel(pedido.tipo_servicio)}</Text></View>}
          {pedido.observaciones  && (
            <View style={[styles.chip, { backgroundColor: "#FEF9EC", borderColor: "#FDE68A" }]}>
              <Text style={[styles.chipText, { color: "#92400E" }]}>📌 {pedido.observaciones}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Encabezado de items */}
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsHeaderText}>Cant.</Text>
          <Text style={[styles.itemsHeaderText, { flex: 1 }]}>Producto</Text>
          <Text style={styles.itemsHeaderText}>Unitario</Text>
          <Text style={[styles.itemsHeaderText, { minWidth: 70, textAlign: "right" }]}>Subtotal</Text>
        </View>

        {/* Items */}
        <View style={styles.itemsList}>
          {pedido.items?.map((item: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{item.cantidad}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre} numberOfLines={1}>{item.producto_nombre}</Text>
                {item.notas ? <Text style={styles.itemNota} numberOfLines={1}>📝 {item.notas}</Text> : null}
              </View>
              {item.precio_unitario != null && (
                <View style={styles.itemPrecio}>
                  <Text style={styles.precioUnit}>{formatCOP(item.precio_unitario)}</Text>
                  <Text style={styles.precioTotal}>{formatCOP(item.precio_unitario * item.cantidad)}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Resumen de pago */}
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
          <View style={[styles.resumenRow, styles.resumenTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{formatCOP(totalFinal)}</Text>
          </View>
        </View>

        {/* Botones */}
        {!readonly && (
          <View style={styles.botonesRow}>
            {pedido.estado !== "cancelado" && pedido.estado !== "entregado" && (
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => onCancelar(pedido)}
                activeOpacity={0.82}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            {cfg?.next && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: cfg.color, flex: 1 }]}
                onPress={() => onAvanzar(pedido)}
                activeOpacity={0.82}
              >
                <Text style={styles.btnText}>{cfg.nextLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Sin pedidos</Text>
      <Text style={styles.emptySub}>{msg}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PedidosScreen() {
  const params     = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab && TABS.find(t => t.key === params.tab) ? params.tab : "activos";

  const [pedidos, setPedidos]       = useState<any[]>(MOCK_PEDIDOS);
  const [loading, setLoading]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState(initialTab);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (params.tab && TABS.find(t => t.key === params.tab)) setActiveTab(params.tab);
  }, [params.tab]);

  // 👇 Cuando el backend esté listo, descomenta esto:
  // const fetchPedidos = async () => {
  //   try {
  //     const res = await fetch(`${API}/pedidos`);
  //     setPedidos(await res.json());
  //   } catch (e) { console.error(e); }
  //   finally { setLoading(false); setRefreshing(false); }
  // };
  // useEffect(() => {
  //   fetchPedidos();
  //   intervalRef.current = setInterval(fetchPedidos, 30000);
  //   return () => clearInterval(intervalRef.current);
  // }, []);

  const avanzarEstado = (pedido: any) => {
    const cfg = ESTADO_CFG[pedido.estado];
    if (!cfg?.next) return;
    setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, estado: cfg.next } : p));
    // 👇 Backend:
    // fetch(`${API}/pedidos/${pedido.id}/estado`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ estado: cfg.next }) });
  };

  const cancelarPedido = (pedido: any) => {
    Alert.alert(
      "Cancelar pedido",
      `¿Cancelar el pedido #${pedido.id} de Mesa ${pedido.mesa_numero}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar", style: "destructive",
          onPress: () => {
            setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, estado: "cancelado" } : p));
            // 👇 Backend:
            // fetch(`${API}/pedidos/${pedido.id}/estado`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ estado: "cancelado" }) });
          },
        },
      ]
    );
  };

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const visibles   = pedidos.filter(p => currentTab.estados.includes(p.estado));
  const readonly   = activeTab === "historial";

  const counts: Record<string, number> = {};
  TABS.forEach(tab => { counts[tab.key] = pedidos.filter(p => tab.estados.includes(p.estado)).length; });

  const totalActivos = pedidos.filter(p => !["entregado","cancelado"].includes(p.estado)).length;

  return (
    <View style={styles.root}>
      <AppHeader restaurantName="Restaurante La 85" isOpen={true} />
      <View style={styles.layout}>
        <SidebarMenu />
        <View style={styles.main}>

          {/* Page header */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>📋 Pedidos</Text>
              <Text style={styles.pageSubtitle}>Gestión en tiempo real</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.statChip}>
                <Text style={styles.statChipText}>🟡 {counts["activos"] ?? 0} nuevos</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: "#EFF6FF" }]}>
                <Text style={[styles.statChipText, { color: "#1D4ED8" }]}>🔵 {counts["en_cocina"] ?? 0} en cocina</Text>
              </View>
              <View style={styles.activosBadge}>
                <Text style={styles.activosText}>{totalActivos} activos</Text>
              </View>
            </View>
          </View>

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
                  {visibles.map(p => (
                    <View key={p.id} style={styles.gridItem}>
                      <PedidoCard
                        pedido={p}
                        onAvanzar={avanzarEstado}
                        onCancelar={cancelarPedido}
                        readonly={readonly}
                      />
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

  pageHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10, flexWrap: "wrap", gap: 10 },
  pageTitle:    { fontSize: 22, fontWeight: "800", color: DARK },
  pageSubtitle: { fontSize: 12, color: MUTED, marginTop: 2 },
  headerRight:  { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  statChip:     { backgroundColor: "#FEF9EC", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statChipText: { fontSize: 12, fontWeight: "700", color: "#B45309" },
  activosBadge: { backgroundColor: PRIMARY, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  activosText:  { color: "#fff", fontSize: 13, fontWeight: "700" },

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
  scrollContent: { padding: 14, paddingTop: 12 },
  center:        { flex: 1, justifyContent: "center", alignItems: "center" },

  grid:     { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { flexBasis: "48%", flexGrow: 1, minWidth: 300 },

  card:     { backgroundColor: CARD, borderRadius: 16, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  stripe:   { width: 5, flexShrink: 0 },
  cardBody: { flex: 1, padding: 14 },

  cardHead:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  mesa:      { fontSize: 17, fontWeight: "800", color: DARK },
  pedidoId:  { fontSize: 11, color: MUTED, marginTop: 2 },
  badgesCol: { alignItems: "flex-end", gap: 5 },

  pill:     { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: "700" },

  metaRow:  { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip:     { backgroundColor: ROW_BG, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: BORDER },
  chipText: { fontSize: 11, color: MUTED },

  divider: { height: 1, backgroundColor: BORDER, marginBottom: 8 },

  itemsHeader:     { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4, paddingBottom: 6 },
  itemsHeaderText: { fontSize: 10, fontWeight: "700", color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },

  itemsList: { gap: 7, marginBottom: 12 },
  itemRow:   { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: ROW_BG, borderRadius: 10, padding: 9, borderWidth: 1, borderColor: BORDER },
  qtyBadge:  { width: 28, height: 28, borderRadius: 7, backgroundColor: PRIMARY, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  qtyText:   { color: "#fff", fontSize: 12, fontWeight: "800" },
  itemInfo:  { flex: 1, minWidth: 0, gap: 2 },
  itemNombre:{ fontSize: 13, fontWeight: "600", color: DARK },
  itemNota:  { fontSize: 10, color: "#92400E" },
  itemPrecio:{ alignItems: "flex-end", gap: 1, flexShrink: 0 },
  precioUnit:{ fontSize: 10, color: MUTED },
  precioTotal:{ fontSize: 13, fontWeight: "700", color: PRIMARY },

  resumenBox:   { backgroundColor: ROW_BG, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  resumenRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 3 },
  resumenLabel: { fontSize: 12, color: MUTED },
  resumenVal:   { fontSize: 12, fontWeight: "600", color: DARK },
  resumenTotal: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 6, paddingTop: 8 },
  totalLabel:   { fontSize: 13, fontWeight: "700", color: DARK },
  totalVal:     { fontSize: 17, fontWeight: "800", color: DARK },

  botonesRow:     { flexDirection: "row", gap: 8 },
  btn:            { borderRadius: 11, paddingVertical: 12, alignItems: "center" },
  btnText:        { color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  btnCancelar:    { borderRadius: 11, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", borderWidth: 1, borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  btnCancelarText:{ color: "#EF4444", fontSize: 13, fontWeight: "700" },

  emptyCard:  { marginTop: 40, backgroundColor: CARD, borderRadius: 20, padding: 40, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  emptyIcon:  { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: DARK },
  emptySub:   { fontSize: 13, color: MUTED, marginTop: 6, textAlign: "center" },
});
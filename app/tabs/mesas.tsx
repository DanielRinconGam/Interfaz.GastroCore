import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Alert } from "react-native";

import AppHeader from "../../scr/components/layout/AppHeader";
import SidebarMenu from "../../scr/components/layout/SidebarMenu";

const API = "http://localhost:5000";
const PRIMARY = "#46A38C";
const BG = "#F0F4F8";
const DARK = "#0F172A";
const CARD = "#FFFFFF";
const MUTED = "#64748B";

const ESTADO_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  libre:     { color: "#10B981", bg: "#D1FAE5", icon: "✅", label: "Libre" },
  ocupada:   { color: "#EF4444", bg: "#FEE2E2", icon: "🔴", label: "Ocupada" },
  reservada: { color: "#F59E0B", bg: "#FEF3C7", icon: "📋", label: "Reservada" },
};

export default function MesasScreen() {
  const [mesas, setMesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchMesas = async () => {
    try {
      const res = await fetch(`${API}/mesas`);
      setMesas(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchMesas(); }, []);

  const cambiarEstado = async (mesaId: number, nuevoEstado: string) => {
    try {
      await fetch(`${API}/mesas/${mesaId}/estado`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      setModalVisible(false);
      fetchMesas();
    } catch { Alert.alert("Error", "No se pudo actualizar la mesa"); }
  };

  const libres    = mesas.filter(m => m.estado === "libre").length;
  const ocupadas  = mesas.filter(m => m.estado === "ocupada").length;
  const reservadas = mesas.filter(m => m.estado === "reservada").length;

  return (
    <View style={{ flex: 1, flexDirection: "column", backgroundColor: BG }}>
      <AppHeader restaurantName="Restaurante La 85" isOpen={true} />

      <View style={{ flex: 1, flexDirection: "row" }}>
        <SidebarMenu />

        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></View>
          ) : (
            <>
              {/* Resumen */}
              <View style={styles.resumenRow}>
                {[
                  { label: "Libres",    count: libres,    color: "#10B981", bg: "#D1FAE5" },
                  { label: "Ocupadas",  count: ocupadas,  color: "#EF4444", bg: "#FEE2E2" },
                  { label: "Reservadas",count: reservadas,color: "#F59E0B", bg: "#FEF3C7" },
                ].map((s, i) => (
                  <View key={i} style={[styles.resumenCard, { backgroundColor: s.bg }]}>
                    <Text style={[styles.resumenCount, { color: s.color }]}>{s.count}</Text>
                    <Text style={[styles.resumenLabel, { color: s.color }]}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMesas(); }} colors={[PRIMARY]} />}
                contentContainerStyle={styles.grid}
              >
                {mesas.map((mesa) => {
                  const cfg = ESTADO_CONFIG[mesa.estado] || ESTADO_CONFIG.libre;
                  return (
                    <TouchableOpacity key={mesa.id} style={[styles.mesaCard, { borderTopColor: cfg.color }]} onPress={() => { setSelected(mesa); setModalVisible(true); }}>
                      <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.estadoText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
                      </View>
                      <Text style={styles.mesaNumero}>Mesa {mesa.numero}</Text>
                      <View style={styles.capacidadRow}>
                        <Text style={styles.capacidadIcon}>👥</Text>
                        <Text style={styles.capacidadText}>{mesa.capacidad} personas</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mesa {selected?.numero}</Text>
            <Text style={styles.modalSub}>Capacidad: {selected?.capacidad} personas</Text>
            <Text style={styles.modalLabel}>Cambiar estado a:</Text>
            {["libre", "ocupada", "reservada"].map((estado) => {
              const cfg = ESTADO_CONFIG[estado];
              const esActual = selected?.estado === estado;
              return (
                <TouchableOpacity key={estado} style={[styles.estadoBtn, { backgroundColor: esActual ? cfg.bg : "#F8FAFC", borderColor: cfg.color, borderWidth: esActual ? 2 : 1 }]}
                  onPress={() => !esActual && cambiarEstado(selected.id, estado)} disabled={esActual}>
                  <Text style={[styles.estadoBtnText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
                  {esActual && <Text style={[styles.actualTag, { color: cfg.color }]}>Actual</Text>}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  resumenRow: { flexDirection: "row", padding: 16, gap: 10 },
  resumenCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  resumenCount: { fontSize: 26, fontWeight: "800" },
  resumenLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 8, gap: 12, paddingHorizontal: 16 },
  mesaCard: { width: "46%", backgroundColor: CARD, borderRadius: 16, padding: 16, borderTopWidth: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  estadoBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 10 },
  estadoText: { fontSize: 11, fontWeight: "700" },
  mesaNumero: { fontSize: 20, fontWeight: "800", color: DARK, marginBottom: 6 },
  capacidadRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  capacidadIcon: { fontSize: 13 },
  capacidadText: { fontSize: 12, color: MUTED },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: DARK, textAlign: "center" },
  modalSub: { fontSize: 14, color: MUTED, textAlign: "center", marginBottom: 20 },
  modalLabel: { fontSize: 13, color: MUTED, fontWeight: "600", marginBottom: 10 },
  estadoBtn: { borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  estadoBtnText: { fontSize: 15, fontWeight: "700" },
  actualTag: { fontSize: 11, fontWeight: "600" },
  cancelBtn: { backgroundColor: "#F1F5F9", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 4 },
  cancelText: { fontSize: 15, fontWeight: "600", color: MUTED },
});
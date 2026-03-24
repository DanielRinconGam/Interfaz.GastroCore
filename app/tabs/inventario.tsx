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
const WARN     = "#F59E0B";
const WARN_L   = "#FEF9EC";

// ── Mock data ─────────────────────────────────────────────────────────────────
const INIT_STOCK = [
  { id: 1,  nombre: "Pollo",           unidad: "kg",   stock: 15,  minimo: 5,   precio_costo: 8500,  categoria: "Carnes"    },
  { id: 2,  nombre: "Res (lomo)",      unidad: "kg",   stock: 8,   minimo: 4,   precio_costo: 22000, categoria: "Carnes"    },
  { id: 3,  nombre: "Cerdo",           unidad: "kg",   stock: 3,   minimo: 4,   precio_costo: 12000, categoria: "Carnes"    },
  { id: 4,  nombre: "Arroz",           unidad: "kg",   stock: 30,  minimo: 10,  precio_costo: 2800,  categoria: "Granos"    },
  { id: 5,  nombre: "Fríjol",          unidad: "kg",   stock: 12,  minimo: 5,   precio_costo: 4500,  categoria: "Granos"    },
  { id: 6,  nombre: "Papa pastusa",    unidad: "kg",   stock: 25,  minimo: 8,   precio_costo: 1800,  categoria: "Verduras"  },
  { id: 7,  nombre: "Tomate",          unidad: "kg",   stock: 4,   minimo: 3,   precio_costo: 2200,  categoria: "Verduras"  },
  { id: 8,  nombre: "Lulo",            unidad: "kg",   stock: 6,   minimo: 4,   precio_costo: 3500,  categoria: "Frutas"    },
  { id: 9,  nombre: "Coco",            unidad: "und",  stock: 10,  minimo: 5,   precio_costo: 4000,  categoria: "Frutas"    },
  { id: 10, nombre: "Aceite",          unidad: "lt",   stock: 2,   minimo: 3,   precio_costo: 9500,  categoria: "Despensa"  },
  { id: 11, nombre: "Sal",             unidad: "kg",   stock: 5,   minimo: 2,   precio_costo: 1200,  categoria: "Despensa"  },
  { id: 12, nombre: "Mariscos mix",    unidad: "kg",   stock: 4,   minimo: 3,   precio_costo: 28000, categoria: "Carnes"    },
];

const INIT_MOVIMIENTOS = [
  { id: 101, producto: "Pollo",        tipo: "entrada",  cantidad: 10, unidad: "kg",  fecha: "2026-03-18", responsable: "Carlos R.", nota: "Compra semanal" },
  { id: 102, producto: "Arroz",        tipo: "entrada",  cantidad: 20, unidad: "kg",  fecha: "2026-03-18", responsable: "Carlos R.", nota: "" },
  { id: 103, producto: "Res (lomo)",   tipo: "salida",   cantidad: 2,  unidad: "kg",  fecha: "2026-03-18", responsable: "Juan P.",   nota: "Uso cocina" },
  { id: 104, producto: "Aceite",       tipo: "salida",   cantidad: 3,  unidad: "lt",  fecha: "2026-03-17", responsable: "María G.",  nota: "Uso cocina" },
  { id: 105, producto: "Papa pastusa", tipo: "entrada",  cantidad: 15, unidad: "kg",  fecha: "2026-03-17", responsable: "Carlos R.", nota: "Compra mercado" },
  { id: 106, producto: "Lulo",         tipo: "ajuste",   cantidad: -2, unidad: "kg",  fecha: "2026-03-16", responsable: "Admin",     nota: "Producto dañado" },
];

const INIT_PROVEEDORES = [
  { id: 201, nombre: "Carnes El Boyacense",   contacto: "3101234567", email: "boyacense@mail.com",  categoria: "Carnes",   activo: true  },
  { id: 202, nombre: "Distribuidora La 14",   contacto: "3209876543", email: "la14@mail.com",       categoria: "Granos",   activo: true  },
  { id: 203, nombre: "Frutería Don Jesús",    contacto: "3156789012", email: "donje@mail.com",      categoria: "Frutas",   activo: true  },
  { id: 204, nombre: "Verduras del Campo",    contacto: "3178901234", email: "campo@mail.com",      categoria: "Verduras", activo: true  },
  { id: 205, nombre: "Mariscos del Pacífico", contacto: "3123456789", email: "pacifico@mail.com",   categoria: "Carnes",   activo: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCOP(n: number) { return "$" + Number(n).toLocaleString("es-CO"); }
let nextId = 9000;
function genId() { return ++nextId; }

function stockColor(item: any) {
  if (item.stock === 0)            return { color: DANGER,  bg: DANGER_L,  label: "Agotado"  };
  if (item.stock <= item.minimo)   return { color: WARN,    bg: WARN_L,    label: "Bajo"     };
  return                                  { color: PRIMARY, bg: PRIMARY_L, label: "OK"       };
}

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

// ── STOCK ─────────────────────────────────────────────────────────────────────
function Stock() {
  const [items, setItems]     = useState(INIT_STOCK);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ nombre: "", unidad: "kg", stock: "", minimo: "", precio_costo: "", categoria: "" });

  const alertas = items.filter(i => i.stock <= i.minimo);
  const filtered = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew  = () => { setEditing(null); setForm({ nombre: "", unidad: "kg", stock: "", minimo: "", precio_costo: "", categoria: "" }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, unidad: item.unidad, stock: String(item.stock), minimo: String(item.minimo), precio_costo: String(item.precio_costo), categoria: item.categoria }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    const data = { ...form, stock: Number(form.stock), minimo: Number(form.minimo), precio_costo: Number(form.precio_costo) };
    if (editing) setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...data } : i));
    else setItems(prev => [...prev, { id: genId(), ...data }]);
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {alertas.length > 0 && (
        <View style={styles.alertaBanner}>
          <Text style={styles.alertaBannerText}>⚠️ {alertas.length} producto{alertas.length > 1 ? "s" : ""} con stock bajo o agotado</Text>
        </View>
      )}
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}><Text style={styles.btnPrimaryText}>+ Producto</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="📦" title="Sin productos" sub="Agrega ítems al inventario" />
          : filtered.map(item => {
              const sc = stockColor(item);
              return (
                <View key={item.id} style={styles.rowCard}>
                  <View style={[styles.rowStripe, { backgroundColor: sc.color }]} />
                  <View style={styles.rowBody}>
                    <View style={styles.rowMain}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{item.nombre}</Text>
                        <Text style={styles.rowSub}>{item.categoria} · Costo: {formatCOP(item.precio_costo)}/{item.unidad}</Text>
                      </View>
                      <View style={styles.rowRight}>
                        <View style={[styles.estadoPill, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.estadoPillText, { color: sc.color }]}>{sc.label}</Text>
                        </View>
                        <View style={styles.stockBadge}>
                          <Text style={styles.stockVal}>{item.stock}</Text>
                          <Text style={styles.stockUnit}>{item.unidad}</Text>
                        </View>
                        <Text style={styles.stockMin}>Mín: {item.minimo} {item.unidad}</Text>
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
            <Text style={styles.modalTitle}>{editing ? "Editar producto" : "Nuevo producto"}</Text>
            <View style={styles.field}><Text style={styles.fieldLabel}>Nombre *</Text><TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Ej: Pollo" placeholderTextColor={MUTED} /></View>
            <View style={styles.fieldRow2}>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Unidad</Text><TextInput style={styles.fieldInput} value={form.unidad} onChangeText={v => setForm(f => ({ ...f, unidad: v }))} placeholder="kg, lt, und" placeholderTextColor={MUTED} /></View>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Categoría</Text><TextInput style={styles.fieldInput} value={form.categoria} onChangeText={v => setForm(f => ({ ...f, categoria: v }))} placeholder="Carnes..." placeholderTextColor={MUTED} /></View>
            </View>
            <View style={styles.fieldRow2}>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Stock actual</Text><TextInput style={styles.fieldInput} value={form.stock} onChangeText={v => setForm(f => ({ ...f, stock: v }))} keyboardType="numeric" placeholder="0" placeholderTextColor={MUTED} /></View>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Stock mínimo</Text><TextInput style={styles.fieldInput} value={form.minimo} onChangeText={v => setForm(f => ({ ...f, minimo: v }))} keyboardType="numeric" placeholder="0" placeholderTextColor={MUTED} /></View>
            </View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Precio de costo (COP)</Text><TextInput style={styles.fieldInput} value={form.precio_costo} onChangeText={v => setForm(f => ({ ...f, precio_costo: v }))} keyboardType="numeric" placeholder="0" placeholderTextColor={MUTED} /></View>
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

// ── MOVIMIENTOS ───────────────────────────────────────────────────────────────
function Movimientos() {
  const [items, setItems]     = useState(INIT_MOVIMIENTOS);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ producto: "", tipo: "entrada", cantidad: "", unidad: "kg", responsable: "", nota: "" });

  const filtered = items.filter(i => i.producto.toLowerCase().includes(search.toLowerCase()));

  const tipoColor = (tipo: string) => {
    if (tipo === "entrada") return { color: PRIMARY, bg: PRIMARY_L };
    if (tipo === "salida")  return { color: DANGER,  bg: DANGER_L  };
    return                         { color: WARN,    bg: WARN_L    };
  };

  const save = () => {
    if (!form.producto.trim() || !form.cantidad) { Alert.alert("Error", "Completa los campos obligatorios"); return; }
    const today = new Date().toISOString().split("T")[0];
    setItems(prev => [{ id: genId(), ...form, cantidad: Number(form.cantidad), fecha: today }, ...prev]);
    setModal(false);
    setForm({ producto: "", tipo: "entrada", cantidad: "", unidad: "kg", responsable: "", nota: "" });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar movimiento..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={() => setModal(true)}><Text style={styles.btnPrimaryText}>+ Movimiento</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="📋" title="Sin movimientos" sub="Registra entradas y salidas" />
          : filtered.map(item => {
              const tc = tipoColor(item.tipo);
              return (
                <View key={item.id} style={styles.rowCard}>
                  <View style={[styles.rowStripe, { backgroundColor: tc.color }]} />
                  <View style={styles.rowBody}>
                    <View style={styles.rowMain}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{item.producto}</Text>
                        <Text style={styles.rowSub}>👤 {item.responsable} · 📅 {item.fecha}</Text>
                        {item.nota ? <Text style={styles.rowSub}>📝 {item.nota}</Text> : null}
                      </View>
                      <View style={styles.rowRight}>
                        <View style={[styles.estadoPill, { backgroundColor: tc.bg }]}>
                          <Text style={[styles.estadoPillText, { color: tc.color }]}>{item.tipo}</Text>
                        </View>
                        <View style={styles.stockBadge}>
                          <Text style={[styles.stockVal, { color: tc.color }]}>{item.tipo === "salida" ? "-" : "+"}{Math.abs(item.cantidad)}</Text>
                          <Text style={styles.stockUnit}>{item.unidad}</Text>
                        </View>
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
            <Text style={styles.modalTitle}>Nuevo movimiento</Text>
            <View style={styles.field}><Text style={styles.fieldLabel}>Producto *</Text><TextInput style={styles.fieldInput} value={form.producto} onChangeText={v => setForm(f => ({ ...f, producto: v }))} placeholder="Nombre del producto" placeholderTextColor={MUTED} /></View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tipo</Text>
              <View style={styles.catSelector}>
                {["entrada", "salida", "ajuste"].map(t => (
                  <TouchableOpacity key={t} style={[styles.catOption, form.tipo === t && styles.catOptionActive]} onPress={() => setForm(f => ({ ...f, tipo: t }))}>
                    <Text style={[styles.catOptionText, form.tipo === t && styles.catOptionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.fieldRow2}>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Cantidad *</Text><TextInput style={styles.fieldInput} value={form.cantidad} onChangeText={v => setForm(f => ({ ...f, cantidad: v }))} keyboardType="numeric" placeholder="0" placeholderTextColor={MUTED} /></View>
              <View style={[styles.field, { flex: 1 }]}><Text style={styles.fieldLabel}>Unidad</Text><TextInput style={styles.fieldInput} value={form.unidad} onChangeText={v => setForm(f => ({ ...f, unidad: v }))} placeholder="kg, lt, und" placeholderTextColor={MUTED} /></View>
            </View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Responsable</Text><TextInput style={styles.fieldInput} value={form.responsable} onChangeText={v => setForm(f => ({ ...f, responsable: v }))} placeholder="Nombre" placeholderTextColor={MUTED} /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Nota</Text><TextInput style={styles.fieldInput} value={form.nota} onChangeText={v => setForm(f => ({ ...f, nota: v }))} placeholder="Observación opcional" placeholderTextColor={MUTED} /></View>
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

// ── ALERTAS ───────────────────────────────────────────────────────────────────
function Alertas() {
  const [items] = useState(INIT_STOCK);
  const alertas = items.filter(i => i.stock <= i.minimo);
  const agotados = alertas.filter(i => i.stock === 0);
  const bajos    = alertas.filter(i => i.stock > 0 && i.stock <= i.minimo);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.alertaResumen}>
        <View style={[styles.alertaResCard, { backgroundColor: DANGER_L }]}>
          <Text style={styles.alertaResIcon}>🚨</Text>
          <Text style={[styles.alertaResVal, { color: DANGER }]}>{agotados.length}</Text>
          <Text style={[styles.alertaResLabel, { color: DANGER }]}>Agotados</Text>
        </View>
        <View style={[styles.alertaResCard, { backgroundColor: WARN_L }]}>
          <Text style={styles.alertaResIcon}>⚠️</Text>
          <Text style={[styles.alertaResVal, { color: WARN }]}>{bajos.length}</Text>
          <Text style={[styles.alertaResLabel, { color: WARN }]}>Stock bajo</Text>
        </View>
        <View style={[styles.alertaResCard, { backgroundColor: PRIMARY_L }]}>
          <Text style={styles.alertaResIcon}>✅</Text>
          <Text style={[styles.alertaResVal, { color: PRIMARY }]}>{items.length - alertas.length}</Text>
          <Text style={[styles.alertaResLabel, { color: PRIMARY }]}>Normales</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {alertas.length === 0
          ? <EmptyState icon="✅" title="Sin alertas" sub="Todos los productos tienen stock suficiente" />
          : alertas.map(item => {
              const sc = stockColor(item);
              return (
                <View key={item.id} style={styles.rowCard}>
                  <View style={[styles.rowStripe, { backgroundColor: sc.color }]} />
                  <View style={styles.rowBody}>
                    <View style={styles.rowMain}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{item.nombre}</Text>
                        <Text style={styles.rowSub}>{item.categoria}</Text>
                        <View style={styles.alertaBarWrap}>
                          <View style={styles.alertaBarBg}>
                            <View style={[styles.alertaBarFill, { width: `${Math.min((item.stock / (item.minimo * 2)) * 100, 100)}%` as any, backgroundColor: sc.color }]} />
                          </View>
                          <Text style={[styles.alertaBarText, { color: sc.color }]}>{item.stock}/{item.minimo * 2} {item.unidad}</Text>
                        </View>
                      </View>
                      <View style={styles.rowRight}>
                        <View style={[styles.estadoPill, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.estadoPillText, { color: sc.color }]}>{sc.label}</Text>
                        </View>
                        <Text style={styles.stockMin}>Mín: {item.minimo} {item.unidad}</Text>
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

// ── PROVEEDORES ───────────────────────────────────────────────────────────────
function Proveedores() {
  const [items, setItems]     = useState(INIT_PROVEEDORES);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ nombre: "", contacto: "", email: "", categoria: "", activo: true });

  const filtered = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew  = () => { setEditing(null); setForm({ nombre: "", contacto: "", email: "", categoria: "", activo: true }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, contacto: item.contacto, email: item.email, categoria: item.categoria, activo: item.activo }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    if (editing) setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i));
    else setItems(prev => [...prev, { id: genId(), ...form }]);
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar proveedor", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar proveedor..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}><Text style={styles.btnPrimaryText}>+ Proveedor</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="🏭" title="Sin proveedores" sub="Agrega tus proveedores" />
          : filtered.map(item => (
            <View key={item.id} style={styles.rowCard}>
              <View style={[styles.rowStripe, { backgroundColor: item.activo ? PRIMARY : "#CBD5E1" }]} />
              <View style={styles.rowBody}>
                <View style={styles.rowMain}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.nombre}</Text>
                    <Text style={styles.rowSub}>📞 {item.contacto}</Text>
                    <Text style={styles.rowSub}>✉️ {item.email}</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <View style={styles.countBadge}><Text style={styles.countBadgeText}>{item.categoria}</Text></View>
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
            <Text style={styles.modalTitle}>{editing ? "Editar proveedor" : "Nuevo proveedor"}</Text>
            <View style={styles.field}><Text style={styles.fieldLabel}>Nombre *</Text><TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Nombre del proveedor" placeholderTextColor={MUTED} /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Teléfono</Text><TextInput style={styles.fieldInput} value={form.contacto} onChangeText={v => setForm(f => ({ ...f, contacto: v }))} placeholder="3100000000" placeholderTextColor={MUTED} keyboardType="phone-pad" /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Email</Text><TextInput style={styles.fieldInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="email@proveedor.com" placeholderTextColor={MUTED} keyboardType="email-address" /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Categoría</Text><TextInput style={styles.fieldInput} value={form.categoria} onChangeText={v => setForm(f => ({ ...f, categoria: v }))} placeholder="Carnes, Frutas..." placeholderTextColor={MUTED} /></View>
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

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "stock",        label: "Stock actual",  icon: "📦" },
  { key: "movimientos",  label: "Movimientos",   icon: "🔄" },
  { key: "alertas",      label: "Alertas",       icon: "⚠️" },
  { key: "proveedores",  label: "Proveedores",   icon: "🏭" },
];

export default function InventarioScreen() {
  const params     = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab && TABS.find(t => t.key === params.tab) ? params.tab : "stock";
  const [activeTab, setActiveTab] = useState(initialTab);
  const alertCount = INIT_STOCK.filter(i => i.stock <= i.minimo).length;

  return (
    <View style={styles.root}>
      <AppHeader restaurantName="Restaurante La 85" isOpen={true} />
      <View style={styles.layout}>
        <SidebarMenu />
        <View style={styles.main}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>📦 Inventario</Text>
            <Text style={styles.pageSubtitle}>{INIT_STOCK.length} productos · {alertCount} alertas</Text>
          </View>
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarInner}>
              {TABS.map(tab => {
                const active = activeTab === tab.key;
                const isAlerta = tab.key === "alertas" && alertCount > 0;
                return (
                  <TouchableOpacity key={tab.key} style={[styles.tab, active && styles.tabActive]} onPress={() => setActiveTab(tab.key)} activeOpacity={0.75}>
                    <Text style={styles.tabIcon}>{tab.icon}</Text>
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                    {isAlerta && (
                      <View style={[styles.tabCount, { backgroundColor: active ? DANGER : DANGER_L }]}>
                        <Text style={[styles.tabCountText, { color: active ? "#fff" : DANGER }]}>{alertCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          {activeTab === "stock"       && <Stock />}
          {activeTab === "movimientos" && <Movimientos />}
          {activeTab === "alertas"     && <Alertas />}
          {activeTab === "proveedores" && <Proveedores />}
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
  tabCount:      { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, minWidth: 22, alignItems: "center" },
  tabCountText:  { fontSize: 11, fontWeight: "800" },
  alertaBanner:  { backgroundColor: WARN_L, borderBottomWidth: 1, borderBottomColor: "#FDE68A", paddingHorizontal: 16, paddingVertical: 10 },
  alertaBannerText: { fontSize: 13, fontWeight: "700", color: "#92400E" },
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
  rowMain:   { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  rowTitle:  { fontSize: 15, fontWeight: "700", color: DARK },
  rowSub:    { fontSize: 12, color: MUTED, marginTop: 2 },
  rowRight:  { alignItems: "flex-end", gap: 6 },
  rowActions:{ flexDirection: "row", gap: 8 },
  estadoPill:    { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  estadoPillText:{ fontSize: 11, fontWeight: "700" },
  countBadge:    { backgroundColor: "#EEF2FF", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  countBadgeText:{ fontSize: 11, fontWeight: "700", color: "#6366F1" },
  stockBadge: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  stockVal:   { fontSize: 20, fontWeight: "800", color: DARK },
  stockUnit:  { fontSize: 11, color: MUTED },
  stockMin:   { fontSize: 10, color: MUTED },
  btnEdit:       { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  btnEditText:   { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
  btnDelete:     { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: DANGER_L, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  btnDeleteText: { fontSize: 12, color: DANGER, fontWeight: "600" },
  alertaResumen:  { flexDirection: "row", gap: 10, padding: 14, paddingBottom: 4 },
  alertaResCard:  { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 2 },
  alertaResIcon:  { fontSize: 18 },
  alertaResVal:   { fontSize: 22, fontWeight: "800" },
  alertaResLabel: { fontSize: 10, fontWeight: "600" },
  alertaBarWrap:  { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  alertaBarBg:    { flex: 1, height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  alertaBarFill:  { height: 6, borderRadius: 3 },
  alertaBarText:  { fontSize: 11, fontWeight: "700", minWidth: 60 },
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
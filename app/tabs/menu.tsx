import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl, Switch,
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const INIT_CATEGORIAS = [
  { id: 1, nombre: "Entradas",       descripcion: "Aperitivos y sopas",          activa: true  },
  { id: 2, nombre: "Platos fuertes", descripcion: "Carnes, pescados y más",      activa: true  },
  { id: 3, nombre: "Bebidas",        descripcion: "Jugos, gaseosas y cocteles",  activa: true  },
  { id: 4, nombre: "Postres",        descripcion: "Dulces y helados",            activa: true  },
  { id: 5, nombre: "Combos",         descripcion: "Menús del día",               activa: false },
];

const INIT_PRODUCTOS = [
  { id: 101, nombre: "Ajiaco santafereño",   categoria_id: 1, categoria: "Entradas",       precio: 24000, disponible: true,  descripcion: "Sopa tradicional con pollo y papas" },
  { id: 102, nombre: "Caldo de costilla",    categoria_id: 1, categoria: "Entradas",       precio: 12000, disponible: true,  descripcion: "Caldo reconfortante con costilla de res" },
  { id: 103, nombre: "Bandeja paisa",        categoria_id: 2, categoria: "Platos fuertes", precio: 28000, disponible: true,  descripcion: "Plato típico antioqueño completo" },
  { id: 104, nombre: "Churrasco a la brasa", categoria_id: 2, categoria: "Platos fuertes", precio: 45000, disponible: true,  descripcion: "Corte de res a la parrilla" },
  { id: 105, nombre: "Cazuela de mariscos",  categoria_id: 2, categoria: "Platos fuertes", precio: 38000, disponible: true,  descripcion: "Mariscos frescos en salsa criolla" },
  { id: 106, nombre: "Pargo frito",          categoria_id: 2, categoria: "Platos fuertes", precio: 35000, disponible: false, descripcion: "Pargo entero frito con patacones" },
  { id: 107, nombre: "Costillas BBQ",        categoria_id: 2, categoria: "Platos fuertes", precio: 32000, disponible: true,  descripcion: "Costillas ahumadas con salsa BBQ" },
  { id: 108, nombre: "Jugo de lulo",         categoria_id: 3, categoria: "Bebidas",        precio: 6000,  disponible: true,  descripcion: "Jugo natural de lulo" },
  { id: 109, nombre: "Limonada de coco",     categoria_id: 3, categoria: "Bebidas",        precio: 7000,  disponible: true,  descripcion: "Limonada con leche de coco" },
  { id: 110, nombre: "Agua con gas",         categoria_id: 3, categoria: "Bebidas",        precio: 4000,  disponible: true,  descripcion: "Agua mineral 500ml" },
  { id: 111, nombre: "Arroz con leche",      categoria_id: 4, categoria: "Postres",        precio: 8000,  disponible: true,  descripcion: "Postre tradicional con canela" },
  { id: 112, nombre: "Sancocho trifásico",   categoria_id: 1, categoria: "Entradas",       precio: 26000, disponible: true,  descripcion: "Sancocho con tres tipos de carne" },
];

const INIT_MODIFICADORES = [
  { id: 201, nombre: "Término de la carne", tipo: "único",    opciones: ["3/4", "Bien cocido", "Término medio", "Azul"],              activo: true  },
  { id: 202, nombre: "Extras",              tipo: "múltiple", opciones: ["Extra salsa", "Sin cebolla", "Sin papa", "Doble porción"],   activo: true  },
  { id: 203, nombre: "Tamaño bebida",       tipo: "único",    opciones: ["Pequeño", "Mediano", "Grande"],                             activo: true  },
  { id: 204, nombre: "Proteína",            tipo: "único",    opciones: ["Pollo", "Res", "Cerdo", "Vegetariano"],                     activo: false },
];

const INIT_COMBOS = [
  { id: 301, nombre: "Menú del día",   precio: 18000, descripcion: "Sopa + plato + bebida",        activo: true,  items: "Ajiaco · Bandeja paisa · Jugo de lulo" },
  { id: 302, nombre: "Combo familiar", precio: 95000, descripcion: "4 platos + 4 bebidas",         activo: true,  items: "4× Bandeja paisa · 4× Jugo de lulo" },
  { id: 303, nombre: "Happy hour",     precio: 12000, descripcion: "2 bebidas por el precio de 1", activo: false, items: "2× Limonada de coco" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCOP(n: number) { return "$" + Number(n).toLocaleString("es-CO"); }
let nextId = 9000;
function genId() { return ++nextId; }

// ── Componentes reutilizables ─────────────────────────────────────────────────

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.searchWrap}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange("")}>
          <Text style={styles.searchClear}>✕</Text>
        </TouchableOpacity>
      )}
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

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
function Categorias({ productos }: { productos: any[] }) {
  const [items, setItems]         = useState(INIT_CATEGORIAS);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [form, setForm]           = useState({ nombre: "", descripcion: "", activa: true });

  const filtered = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew  = () => { setEditing(null); setForm({ nombre: "", descripcion: "", activa: true }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, descripcion: item.descripcion, activa: item.activa }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i));
    } else {
      setItems(prev => [...prev, { id: genId(), ...form }]);
    }
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar categoría", `¿Eliminar "${item.nombre}"? Los productos asociados quedarán sin categoría.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar categoría..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}>
          <Text style={styles.btnPrimaryText}>+ Categoría</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="📂" title="Sin categorías" sub="Crea tu primera categoría" />
          : filtered.map(item => {
              const count = productos.filter(p => p.categoria_id === item.id).length;
              return (
                <View key={item.id} style={styles.rowCard}>
                  <View style={[styles.rowStripe, { backgroundColor: item.activa ? PRIMARY : "#CBD5E1" }]} />
                  <View style={styles.rowBody}>
                    <View style={styles.rowMain}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{item.nombre}</Text>
                        {item.descripcion ? <Text style={styles.rowSub}>{item.descripcion}</Text> : null}
                      </View>
                      <View style={styles.rowRight}>
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>{count} productos</Text>
                        </View>
                        <View style={[styles.estadoPill, { backgroundColor: item.activa ? PRIMARY_L : "#F1F5F9" }]}>
                          <Text style={[styles.estadoPillText, { color: item.activa ? PRIMARY : MUTED }]}>
                            {item.activa ? "Activa" : "Inactiva"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.rowActions}>
                      <TouchableOpacity style={styles.btnEdit} onPress={() => openEdit(item)}>
                        <Text style={styles.btnEditText}>✏️ Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnDelete} onPress={() => eliminar(item)}>
                        <Text style={styles.btnDeleteText}>🗑 Eliminar</Text>
                      </TouchableOpacity>
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
            <Text style={styles.modalTitle}>{editing ? "Editar categoría" : "Nueva categoría"}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre *</Text>
              <TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Ej: Platos fuertes" placeholderTextColor={MUTED} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput style={[styles.fieldInput, { height: 72 }]} value={form.descripcion} onChangeText={v => setForm(f => ({ ...f, descripcion: v }))} placeholder="Descripción breve" placeholderTextColor={MUTED} multiline />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Activa</Text>
              <Switch value={form.activa} onValueChange={v => setForm(f => ({ ...f, activa: v }))} trackColor={{ true: PRIMARY }} />
            </View>
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

// ── PRODUCTOS ─────────────────────────────────────────────────────────────────
function Productos({ categorias }: { categorias: any[] }) {
  const [items, setItems]     = useState(INIT_PRODUCTOS);
  const [search, setSearch]   = useState("");
  const [filtCat, setFiltCat] = useState(0);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ nombre: "", descripcion: "", precio: "", categoria_id: 0, disponible: true });

  const filtered = items
    .filter(i => filtCat === 0 || i.categoria_id === filtCat)
    .filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew  = () => { setEditing(null); setForm({ nombre: "", descripcion: "", precio: "", categoria_id: categorias[0]?.id ?? 0, disponible: true }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, descripcion: item.descripcion, precio: String(item.precio), categoria_id: item.categoria_id, disponible: item.disponible }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    if (!form.precio || isNaN(Number(form.precio))) { Alert.alert("Error", "El precio debe ser un número"); return; }
    const cat = categorias.find(c => c.id === form.categoria_id);
    const data = { ...form, precio: Number(form.precio), categoria: cat?.nombre ?? "" };
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...data } : i));
    } else {
      setItems(prev => [...prev, { id: genId(), ...data }]);
    }
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar producto", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  const toggleDisponible = (item: any) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, disponible: !i.disponible } : i));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}>
          <Text style={styles.btnPrimaryText}>+ Producto</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro categoría */}
      <View style={styles.filtroBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtroBarInner}>
          <TouchableOpacity style={[styles.filtroBtn, filtCat === 0 && styles.filtroBtnActive]} onPress={() => setFiltCat(0)}>
            <Text style={[styles.filtroBtnText, filtCat === 0 && styles.filtroBtnTextActive]}>Todos ({items.length})</Text>
          </TouchableOpacity>
          {categorias.filter(c => c.activa).map(c => (
            <TouchableOpacity key={c.id} style={[styles.filtroBtn, filtCat === c.id && styles.filtroBtnActive]} onPress={() => setFiltCat(c.id)}>
              <Text style={[styles.filtroBtnText, filtCat === c.id && styles.filtroBtnTextActive]}>
                {c.nombre} ({items.filter(i => i.categoria_id === c.id).length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.gridContent}>
        {filtered.length === 0
          ? <EmptyState icon="🍽" title="Sin productos" sub="Crea tu primer producto" />
          : (
            <View style={styles.prodGrid}>
              {filtered.map(item => (
                <View key={item.id} style={styles.prodCard}>
                  <View style={[styles.prodStripe, { backgroundColor: item.disponible ? PRIMARY : "#CBD5E1" }]} />
                  <View style={styles.prodBody}>
                    <View style={styles.prodHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prodNombre} numberOfLines={1}>{item.nombre}</Text>
                        <Text style={styles.prodCat}>{item.categoria}</Text>
                      </View>
                      <Text style={styles.prodPrecio}>{formatCOP(item.precio)}</Text>
                    </View>
                    {item.descripcion ? <Text style={styles.prodDesc} numberOfLines={2}>{item.descripcion}</Text> : null}
                    <View style={styles.prodFooter}>
                      <TouchableOpacity
                        style={[styles.dispToggle, { backgroundColor: item.disponible ? PRIMARY_L : "#F1F5F9" }]}
                        onPress={() => toggleDisponible(item)}
                      >
                        <View style={[styles.dispDot, { backgroundColor: item.disponible ? PRIMARY : "#CBD5E1" }]} />
                        <Text style={[styles.dispText, { color: item.disponible ? PRIMARY : MUTED }]}>
                          {item.disponible ? "Disponible" : "No disponible"}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.prodActions}>
                        <TouchableOpacity style={styles.btnEdit} onPress={() => openEdit(item)}>
                          <Text style={styles.btnEditText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={() => eliminar(item)}>
                          <Text style={styles.btnDeleteText}>🗑</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? "Editar producto" : "Nuevo producto"}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre *</Text>
              <TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Ej: Bandeja paisa" placeholderTextColor={MUTED} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Precio (COP) *</Text>
              <TextInput style={styles.fieldInput} value={form.precio} onChangeText={v => setForm(f => ({ ...f, precio: v }))} placeholder="Ej: 28000" placeholderTextColor={MUTED} keyboardType="numeric" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Categoría</Text>
              <View style={styles.catSelector}>
                {categorias.filter(c => c.activa).map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catOption, form.categoria_id === c.id && styles.catOptionActive]}
                    onPress={() => setForm(f => ({ ...f, categoria_id: c.id }))}
                  >
                    <Text style={[styles.catOptionText, form.categoria_id === c.id && styles.catOptionTextActive]}>{c.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput style={[styles.fieldInput, { height: 72 }]} value={form.descripcion} onChangeText={v => setForm(f => ({ ...f, descripcion: v }))} placeholder="Descripción del producto" placeholderTextColor={MUTED} multiline />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Disponible</Text>
              <Switch value={form.disponible} onValueChange={v => setForm(f => ({ ...f, disponible: v }))} trackColor={{ true: PRIMARY }} />
            </View>
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

// ── MODIFICADORES ─────────────────────────────────────────────────────────────
function Modificadores() {
  const [items, setItems]     = useState(INIT_MODIFICADORES);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ nombre: "", tipo: "único", opciones: "", activo: true });

  const filtered = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew  = () => { setEditing(null); setForm({ nombre: "", tipo: "único", opciones: "", activo: true }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, tipo: item.tipo, opciones: item.opciones.join(", "), activo: item.activo }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    const opciones = form.opciones.split(",").map(o => o.trim()).filter(Boolean);
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, nombre: form.nombre, tipo: form.tipo, opciones, activo: form.activo } : i));
    } else {
      setItems(prev => [...prev, { id: genId(), nombre: form.nombre, tipo: form.tipo, opciones, activo: form.activo }]);
    }
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar modificador", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar modificador..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}>
          <Text style={styles.btnPrimaryText}>+ Modificador</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="⚙️" title="Sin modificadores" sub="Crea opciones para tus productos" />
          : filtered.map(item => (
            <View key={item.id} style={styles.rowCard}>
              <View style={[styles.rowStripe, { backgroundColor: item.activo ? "#6366F1" : "#CBD5E1" }]} />
              <View style={styles.rowBody}>
                <View style={styles.rowMain}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.nombre}</Text>
                    <View style={styles.opcionesWrap}>
                      {item.opciones.map((o: string, i: number) => (
                        <View key={i} style={styles.opcionChip}><Text style={styles.opcionChipText}>{o}</Text></View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.rowRight}>
                    <View style={[styles.estadoPill, { backgroundColor: "#EEF2FF" }]}>
                      <Text style={[styles.estadoPillText, { color: "#6366F1" }]}>{item.tipo}</Text>
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
            <Text style={styles.modalTitle}>{editing ? "Editar modificador" : "Nuevo modificador"}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre *</Text>
              <TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Ej: Término de la carne" placeholderTextColor={MUTED} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tipo</Text>
              <View style={styles.catSelector}>
                {["único", "múltiple"].map(t => (
                  <TouchableOpacity key={t} style={[styles.catOption, form.tipo === t && styles.catOptionActive]} onPress={() => setForm(f => ({ ...f, tipo: t }))}>
                    <Text style={[styles.catOptionText, form.tipo === t && styles.catOptionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Opciones (separadas por coma)</Text>
              <TextInput style={[styles.fieldInput, { height: 72 }]} value={form.opciones} onChangeText={v => setForm(f => ({ ...f, opciones: v }))} placeholder="Ej: Sin cebolla, Extra salsa, Sin papa" placeholderTextColor={MUTED} multiline />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Activo</Text>
              <Switch value={form.activo} onValueChange={v => setForm(f => ({ ...f, activo: v }))} trackColor={{ true: PRIMARY }} />
            </View>
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

// ── COMBOS ────────────────────────────────────────────────────────────────────
function Combos() {
  const [items, setItems]     = useState(INIT_COMBOS);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]       = useState({ nombre: "", descripcion: "", precio: "", items: "", activo: true });

  const filtered = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew  = () => { setEditing(null); setForm({ nombre: "", descripcion: "", precio: "", items: "", activo: true }); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ nombre: item.nombre, descripcion: item.descripcion, precio: String(item.precio), items: item.items, activo: item.activo }); setModal(true); };

  const save = () => {
    if (!form.nombre.trim() || !form.precio) { Alert.alert("Error", "Nombre y precio son obligatorios"); return; }
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form, precio: Number(form.precio) } : i));
    } else {
      setItems(prev => [...prev, { id: genId(), ...form, precio: Number(form.precio) }]);
    }
    setModal(false);
  };

  const eliminar = (item: any) => {
    Alert.alert("Eliminar combo", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setItems(prev => prev.filter(i => i.id !== item.id)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar combo..." />
        <TouchableOpacity style={styles.btnPrimary} onPress={openNew}>
          <Text style={styles.btnPrimaryText}>+ Combo</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.length === 0
          ? <EmptyState icon="🎁" title="Sin combos" sub="Crea combos y promociones" />
          : filtered.map(item => (
            <View key={item.id} style={styles.rowCard}>
              <View style={[styles.rowStripe, { backgroundColor: item.activo ? "#F59E0B" : "#CBD5E1" }]} />
              <View style={styles.rowBody}>
                <View style={styles.rowMain}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.nombre}</Text>
                    <Text style={styles.rowSub}>{item.descripcion}</Text>
                    <Text style={[styles.rowSub, { marginTop: 4 }]}>🍽 {item.items}</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.comboPrecio}>{formatCOP(item.precio)}</Text>
                    <View style={[styles.estadoPill, { backgroundColor: item.activo ? "#FEF9EC" : "#F1F5F9" }]}>
                      <Text style={[styles.estadoPillText, { color: item.activo ? "#B45309" : MUTED }]}>{item.activo ? "Activo" : "Inactivo"}</Text>
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
            <Text style={styles.modalTitle}>{editing ? "Editar combo" : "Nuevo combo"}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre *</Text>
              <TextInput style={styles.fieldInput} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Ej: Menú del día" placeholderTextColor={MUTED} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Precio (COP) *</Text>
              <TextInput style={styles.fieldInput} value={form.precio} onChangeText={v => setForm(f => ({ ...f, precio: v }))} placeholder="Ej: 18000" placeholderTextColor={MUTED} keyboardType="numeric" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput style={styles.fieldInput} value={form.descripcion} onChangeText={v => setForm(f => ({ ...f, descripcion: v }))} placeholder="Ej: Sopa + plato + bebida" placeholderTextColor={MUTED} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Productos incluidos</Text>
              <TextInput style={[styles.fieldInput, { height: 60 }]} value={form.items} onChangeText={v => setForm(f => ({ ...f, items: v }))} placeholder="Ej: Ajiaco · Bandeja paisa · Jugo" placeholderTextColor={MUTED} multiline />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Activo</Text>
              <Switch value={form.activo} onValueChange={v => setForm(f => ({ ...f, activo: v }))} trackColor={{ true: PRIMARY }} />
            </View>
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

// ── DISPONIBILIDAD ────────────────────────────────────────────────────────────
function Disponibilidad() {
  const [items, setItems]   = useState(INIT_PRODUCTOS);
  const [search, setSearch] = useState("");

  const filtered = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));
  const activos = items.filter(i => i.disponible).length;

  const toggle = (item: any) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, disponible: !i.disponible } : i));
  };

  const toggleAll = (val: boolean) => {
    setItems(prev => prev.map(i => ({ ...i, disponible: val })));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolBar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
        <View style={styles.dispBtns}>
          <TouchableOpacity style={[styles.btnSmall, { backgroundColor: PRIMARY_L }]} onPress={() => toggleAll(true)}>
            <Text style={[styles.btnSmallText, { color: PRIMARY }]}>Activar todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSmall, { backgroundColor: DANGER_L }]} onPress={() => toggleAll(false)}>
            <Text style={[styles.btnSmallText, { color: DANGER }]}>Desactivar todos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dispResumen}>
        <View style={[styles.dispResCard, { backgroundColor: PRIMARY_L }]}>
          <Text style={[styles.dispResVal, { color: PRIMARY }]}>{activos}</Text>
          <Text style={[styles.dispResLabel, { color: PRIMARY }]}>Disponibles</Text>
        </View>
        <View style={[styles.dispResCard, { backgroundColor: DANGER_L }]}>
          <Text style={[styles.dispResVal, { color: DANGER }]}>{items.length - activos}</Text>
          <Text style={[styles.dispResLabel, { color: DANGER }]}>No disponibles</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.map(item => (
          <TouchableOpacity key={item.id} style={styles.dispRow} onPress={() => toggle(item)} activeOpacity={0.8}>
            <View style={[styles.dispIndicator, { backgroundColor: item.disponible ? PRIMARY : "#CBD5E1" }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.nombre}</Text>
              <Text style={styles.rowSub}>{item.categoria} · {formatCOP(item.precio)}</Text>
            </View>
            <View style={[styles.dispToggleBig, { backgroundColor: item.disponible ? PRIMARY : "#E2E8F0" }]}>
              <Text style={styles.dispToggleBigText}>{item.disponible ? "ON" : "OFF"}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "categorias",    label: "Categorías",    icon: "📂" },
  { key: "productos",     label: "Productos",     icon: "🍽" },
  { key: "modificadores", label: "Modificadores", icon: "⚙️" },
  { key: "promos",        label: "Combos/Promos", icon: "🎁" },
  { key: "disponibilidad",label: "Disponibilidad",icon: "✅" },
];

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function MenuScreen() {
  const params     = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab && TABS.find(t => t.key === params.tab) ? params.tab : "categorias";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [categorias, setCategorias] = useState(INIT_CATEGORIAS);
  const [productos]                 = useState(INIT_PRODUCTOS);

  return (
    <View style={styles.root}>
      <AppHeader restaurantName="Restaurante La 85" isOpen={true} />
      <View style={styles.layout}>
        <SidebarMenu />
        <View style={styles.main}>

          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>🍴 Menú / Productos</Text>
              <Text style={styles.pageSubtitle}>{productos.filter(p => p.disponible).length} productos activos</Text>
            </View>
          </View>

          {/* Tabs */}
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

          {activeTab === "categorias"     && <Categorias productos={productos} />}
          {activeTab === "productos"      && <Productos categorias={categorias} />}
          {activeTab === "modificadores"  && <Modificadores />}
          {activeTab === "promos"         && <Combos />}
          {activeTab === "disponibilidad" && <Disponibilidad />}

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

  filtroBar:      { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  filtroBarInner: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, flexDirection: "row" },
  filtroBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: "#F1F5F9" },
  filtroBtnActive:{ backgroundColor: PRIMARY_L },
  filtroBtnText:  { fontSize: 12, fontWeight: "600", color: MUTED },
  filtroBtnTextActive: { color: PRIMARY },

  listContent: { padding: 14, paddingTop: 8 },
  gridContent: { padding: 14, paddingTop: 8 },

  // Row card (categorías, modificadores, combos)
  rowCard:   { backgroundColor: CARD, borderRadius: 14, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: BORDER, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  rowStripe: { width: 5, flexShrink: 0 },
  rowBody:   { flex: 1, padding: 14 },
  rowMain:   { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  rowTitle:  { fontSize: 15, fontWeight: "700", color: DARK },
  rowSub:    { fontSize: 12, color: MUTED, marginTop: 2 },
  rowRight:  { alignItems: "flex-end", gap: 6 },
  rowActions:{ flexDirection: "row", gap: 8 },

  countBadge:     { backgroundColor: "#EEF2FF", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  countBadgeText: { fontSize: 11, fontWeight: "700", color: "#6366F1" },
  estadoPill:     { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  estadoPillText: { fontSize: 11, fontWeight: "700" },
  comboPrecio:    { fontSize: 16, fontWeight: "800", color: "#F59E0B" },

  opcionesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 },
  opcionChip:   { backgroundColor: "#EEF2FF", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  opcionChipText:{ fontSize: 11, color: "#6366F1", fontWeight: "600" },

  btnEdit:       { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  btnEditText:   { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
  btnDelete:     { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: DANGER_L, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  btnDeleteText: { fontSize: 12, color: DANGER, fontWeight: "600" },

  // Producto grid
  prodGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  prodCard:  { flexBasis: "31%", flexGrow: 1, minWidth: 220, backgroundColor: CARD, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: BORDER, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  prodStripe:{ height: 5 },
  prodBody:  { padding: 12 },
  prodHead:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  prodNombre:{ fontSize: 14, fontWeight: "700", color: DARK, flex: 1, marginRight: 8 },
  prodCat:   { fontSize: 11, color: MUTED, marginTop: 2 },
  prodPrecio:{ fontSize: 15, fontWeight: "800", color: PRIMARY },
  prodDesc:  { fontSize: 12, color: MUTED, marginBottom: 10, lineHeight: 17 },
  prodFooter:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  prodActions:{ flexDirection: "row", gap: 6 },

  dispToggle:    { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  dispDot:       { width: 6, height: 6, borderRadius: 3 },
  dispText:      { fontSize: 11, fontWeight: "700" },

  // Disponibilidad
  dispBtns:   { flexDirection: "row", gap: 6 },
  btnSmall:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  btnSmallText:{ fontSize: 12, fontWeight: "700" },
  dispResumen:{ flexDirection: "row", gap: 10, paddingHorizontal: 14, paddingBottom: 8 },
  dispResCard:{ flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  dispResVal: { fontSize: 22, fontWeight: "800" },
  dispResLabel:{ fontSize: 11, fontWeight: "600", marginTop: 2 },
  dispRow:    { backgroundColor: CARD, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: BORDER },
  dispIndicator:{ width: 4, height: 40, borderRadius: 2 },
  dispToggleBig:{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  dispToggleBigText:{ fontSize: 12, fontWeight: "800", color: "#fff" },

  // Modal
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
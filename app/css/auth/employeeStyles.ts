import { StyleSheet } from "react-native";

const primary = "#349881";
const bg = "#F3FAF8";
const border = "#E2E8F0";
const text = "#0C2723";
const muted = "#64748B";

export default StyleSheet.create({
  page: { flex: 1, backgroundColor: bg },

  body: { flex: 1, flexDirection: "row" },
  content: { flex: 1, padding: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  title: { fontSize: 26, fontWeight: "bold", color: text },
  subtitle: { color: muted },

  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: border,
  },

  primaryButton: {
    backgroundColor: primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  primaryButtonText: { color: "#fff", fontWeight: "bold" },

  /* TABLE */
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
  },

  th: { fontWeight: "bold", color: muted },

  tr: {
    flexDirection: "row",
    paddingVertical: 14,
    alignItems: "center",
  },

  td: { justifyContent: "center" },

  tdText: { color: text },

  initials: {
    fontWeight: "bold",
    color: primary,
    marginRight: 6,
  },

  colName: { flex: 2, flexDirection: "row", alignItems: "center", gap: 6 },
  colEmail: { flex: 3 },
  colRole: { flex: 1 },
  colStatus: { flex: 1 },
  colActions: { flex: 2, alignItems: "flex-end" },

  sep: { height: 1, backgroundColor: border },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },

  /* MOBILE CARD */
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: border,
  },

  cardHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: primary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },

  name: { fontWeight: "bold", color: text },
  email: { color: muted, fontSize: 12 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  metaText: { fontSize: 12, color: muted },
  metaDot: { fontSize: 12, color: muted },
});
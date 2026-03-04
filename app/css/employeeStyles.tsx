import { StyleSheet } from "react-native";

const niagara = {
  50: "#F3FAF8",
  200: "#ABE4D2",
  400: "#46A38C",
  500: "#349881",
  700: "#236255",
  950: "#0C2723",
};

const c = {
  bg: niagara[50],
  surface: "#FFFFFF",
  border: niagara[200],
  text: niagara[950],
  muted: niagara[700],
  primary: niagara[400],
  primaryPressed: niagara[500],
  onPrimary: "#FFFFFF",
};

export default StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: c.bg,
    padding: 20,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: c.text,
  },

  subtitle: {
    marginTop: 4,
    color: c.muted,
  },

  toolbar: {
    marginBottom: 12,
  },

  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: c.text,
  },

  primaryButton: {
    backgroundColor: c.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  primaryButtonText: {
    color: c.onPrimary,
    fontWeight: "800",
  },

  card: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: c.bg,
  },

  th: {
    fontWeight: "800",
    color: c.muted,
    fontSize: 12,
  },

  tr: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  td: {
    color: c.text,
    fontSize: 13,
  },

  sep: {
    height: 1,
    backgroundColor: c.border,
  },

  colName: { flex: 2 },
  colEmail: { flex: 3 },
  colRole: { flex: 1 },
  colStatus: { flex: 1 },
  colActions: { flex: 2 },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },

  linkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.border,
  },

  linkText: {
    color: c.text,
    fontWeight: "700",
  },

  dangerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },

  dangerText: {
    color: "#991B1B",
    fontWeight: "800",
  },
});
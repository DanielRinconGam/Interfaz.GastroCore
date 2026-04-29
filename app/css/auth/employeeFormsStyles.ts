import { StyleSheet } from "react-native";
import { Platform } from "react-native";

export const PRIMARY = "#46A38C";
export const PRIMARY_SOFT = "#EAF7F3";
export const TEXT_MAIN = "#0F172A";
export const TEXT_MUTED = "#64748B";
export const LINE_COLOR = "#F1F5F9";

export default StyleSheet.create({
  mainWrapper: { width: "100%" },
  header: { marginBottom: 25 },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 5, marginLeft: -5 },
  backText: { color: PRIMARY, fontWeight: "600", fontSize: 13 },
  title: { fontSize: 26, fontWeight: "800", color: TEXT_MAIN },
  subtitle: { color: TEXT_MUTED, fontSize: 14, marginTop: 2 },
  formContainer: { width: "100%", gap: 20 },
  row: { gap: 15, width: "100%" },
  inputGroup: { flex: 1 },
  label: { fontSize: 11, fontWeight: "700", color: TEXT_MAIN, marginBottom: 8, textTransform: "uppercase" },
  input: { borderWidth: 1, borderColor: LINE_COLOR, borderRadius: 8, padding: 12, fontSize: 14, color: TEXT_MAIN, backgroundColor: "#F8FAFC" },
  errorText: { color: "#EF4444", fontSize: 13, fontWeight: "500", textAlign: "left", marginTop: 5 },
  roleSection: { marginTop: 5 },
  rolesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  roleItem: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: LINE_COLOR, backgroundColor: "#FFF" },
  roleItemActive: { backgroundColor: PRIMARY_SOFT, borderColor: PRIMARY },
  roleItemText: { fontSize: 13, fontWeight: "700", color: TEXT_MUTED },
  roleItemTextActive: { color: PRIMARY },
  footer: { marginTop: 40, flexDirection: "row-reverse", justifyContent: "flex-start", gap: 12, paddingVertical: 25, borderTopWidth: 1, borderTopColor: LINE_COLOR },
  footerMobile: { flexDirection: "column" },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, alignItems: "center" },
  cancelBtnText: { color: TEXT_MUTED, fontWeight: "600", fontSize: 14 },
  submitBtn: { backgroundColor: PRIMARY, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, alignItems: "center", justifyContent: "center", ...Platform.select({ web: { alignSelf: "flex-start" } }) },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  stateContainer: { minHeight: 260, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  stateText: { fontSize: 14, color: TEXT_MUTED, fontWeight: "500" },
});
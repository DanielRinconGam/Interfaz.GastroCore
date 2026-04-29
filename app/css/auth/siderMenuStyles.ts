import { StyleSheet } from "react-native";

export const PRIMARY = "#46A38C";
export const PRIMARY_SOFT = "#EAF7F3";
export const TEXT_COLOR = "#475569";

export default StyleSheet.create({
  sidebar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },

  section: {
    paddingHorizontal: 12,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
    paddingLeft: 10,
    letterSpacing: 0.5,
    marginTop: 5,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 12,
    marginBottom: 2,
  },

  itemActive: {
    backgroundColor: PRIMARY_SOFT,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_COLOR,
  },

  labelActive: {
    color: PRIMARY,
  },

  subMenu: {
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    marginTop: 4,
  },

  subLabel: {
    fontSize: 13,
    color: TEXT_COLOR,
    paddingVertical: 6,
    paddingLeft: 15,
  },

  // 🔻 NUEVO: PARA LOGOUT
  bottomSection: {
    marginTop: "auto",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  logoutItem: {
    marginTop: 8,
  },

  logoutItemPressed: {
    backgroundColor: "#FEF2F2",
  },

  logoutLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },
});
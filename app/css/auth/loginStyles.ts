import { StyleSheet } from "react-native";

const niagara = {
  50: "#F3FAF8",
  100: "#D5F2E8",
  200: "#ABE4D2",
  300: "#7ACEB7",
  400: "#46A38C",
  500: "#349881",
  600: "#287968",
  700: "#236255",
  800: "#204F46",
  900: "#1F423C",
  950: "#0C2723",
};

const colors = {
  bg: "#F3FAF8",
  surface: "#FFFFFF",
  border: niagara[200],

  text: niagara[950],
  textMuted: niagara[700],
  textSoft: niagara[600],

  primary: niagara[400],
  primaryDark: niagara[800],

  inputBg: "#FBFDFC",
  inputBorder: "#D9EAE4",

  onPrimary: "#FFFFFF",
  shadow: "#000000",
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  scrollContainerMobile: {
    padding: 0,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.bg,
  },

  card: {
    overflow: "hidden",
    backgroundColor: colors.surface,
  },

  cardDesktop: {
    width: "100%",
    maxWidth: 980,
    minHeight: 620,
    flexDirection: "row",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },

  cardMobile: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    backgroundColor: colors.bg,
  },

  brandPanel: {
    overflow: "hidden",
    position: "relative",
  },

  brandPanelDesktop: {
    width: "43%",
    minHeight: 620,
  },

  brandPanelMobile: {
    width: "100%",
    height: 240,
    overflow: "hidden",
    zIndex: 1,
  },

  brandGradient: {
    flex: 1,
    justifyContent: "center",
  },

  logoWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoWrapperDesktop: {
    paddingHorizontal: 36,
    paddingVertical: 36,
  },

  logoWrapperMobile: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 52,
  },

  logoDesktop: {
    width: 250,
    height: 250,
  },

  logoMobile: {
    width: 150,
    height: 150,
  },

  formPanel: {
    backgroundColor: colors.surface,
    justifyContent: "center",
  },

  formPanelDesktop: {
    flex: 1,
    paddingHorizontal: 42,
    paddingVertical: 42,
  },

  formPanelMobile: {
    flex: 1,
    marginTop: -26,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 34,
    minHeight: 520,
    zIndex: 5,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  formTitle: {
    fontSize: 27,
    color: colors.text,
    marginBottom: 8,
  },

  formSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 30,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: colors.textSoft,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: colors.inputBg,
    color: colors.text,
  },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 24,
  },

  forgotPass: {
    fontSize: 13,
    color: colors.primaryDark,
  },

  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  loginButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
  },

  helperText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    marginBottom: 14,
  },

  loginButtonDisabled: {
    opacity: 0.75,
  },
});

export default styles;

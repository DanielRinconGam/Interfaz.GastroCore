import { StyleSheet, Dimensions } from "react-native";

// Obtenemos el ancho de la pantalla actual
const { width } = Dimensions.get("window");

/**
 * Niagara palette (Primary)
 */
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
  bg: niagara[50],
  surface: "#FFFFFF",
  border: niagara[200],

  text: niagara[950],
  textMuted: niagara[700],
  textSoft: niagara[600],

  primary: niagara[400],
  primaryPressed: niagara[500],
  primaryDark: niagara[800],

  inputBg: niagara[50],
  inputBorder: niagara[200],

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
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    width: "100%",
    maxWidth: 900,
    borderRadius: 20,
    flexDirection: width > 768 ? "row" : "column",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,

    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  welcomeWrapper: {
    width: width > 768 ? "45%" : "100%",
    minHeight: 250,
    overflow: "hidden",

    // Bordes correctos dependiendo del layout
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: width > 768 ? 20 : 0,
    borderTopRightRadius: width > 768 ? 0 : 20,
  },
  welcomeSection: {
    flex: 1, // ✅ importante para que la imagen llene el wrapper
    padding: 40,
    justifyContent: "center",
  },
  logoPlaceholder: {
    color: colors.onPrimary,
    fontSize: 24,
    fontWeight: "bold",
    position: "absolute",
    top: 30,
    left: 30,
  },
  welcomeText: {
    color: colors.onPrimary,
    fontSize: 42,
    fontWeight: "bold",
    lineHeight: 50,
    letterSpacing: 1.2
  },

  formSection: {
    flex: 1,
    padding: 40,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 30,
  },

  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: colors.textSoft,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.inputBg,
    color: colors.text,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  rememberMe: {
    fontSize: 12,
    color: colors.textMuted,
  },
  forgotPass: {
    fontSize: 12,
    color: colors.textSoft,
  },

  loginButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  newText: {
    color: colors.textMuted,
  },
  signupText: {
    color: colors.primaryDark,
    fontWeight: "bold",
  },
});

export default styles;
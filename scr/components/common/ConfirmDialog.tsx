import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY = "#46A38C";
const TEXT_MAIN = "#0F172A";
const TEXT_MUTED = "#64748B";
const LINE_COLOR = "#E2E8F0";

type ConfirmDialogProps = {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  visible,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name={destructive ? "trash-can-outline" : "help-circle-outline"}
              size={26}
              color={destructive ? "#EF4444" : PRIMARY}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                destructive && styles.confirmBtnDanger,
                loading && styles.disabledBtn,
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmText}>
                {loading ? "Procesando..." : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      } as any,
      default: {
        elevation: 8,
      },
    }),
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_MAIN,
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE_COLOR,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MUTED,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  confirmBtnDanger: {
    backgroundColor: "#EF4444",
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disabledBtn: {
    opacity: 0.7,
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ToastType = "success" | "error" | "info" | "warning";

type AppToastProps = {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
};

const TONE = {
  success: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#065F46",
    icon: "check-circle",
  },
  error: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#991B1B",
    icon: "close-circle",
  },
  info: {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    text: "#1D4ED8",
    icon: "information",
  },
  warning: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
    icon: "alert-circle",
  },
} as const;

function ToastCard({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  const tone = TONE[type];
  const isWeb = Platform.OS === "web";

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        isWeb ? styles.wrapperDesktop : styles.wrapperMobile,
      ]}
    >
      <View
        style={[
          styles.toast,
          isWeb ? styles.toastDesktop : styles.toastMobile,
          {
            backgroundColor: tone.bg,
            borderColor: tone.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            isWeb ? styles.iconWrapDesktop : styles.iconWrapMobile,
            { backgroundColor: tone.border },
          ]}
        >
          <MaterialCommunityIcons
            name={tone.icon as any}
            size={isWeb ? 18 : 20}
            color={tone.text}
          />
        </View>

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              isWeb ? styles.titleDesktop : styles.titleMobile,
              { color: tone.text },
            ]}
          >
            {type === "success"
              ? "Listo"
              : type === "error"
                ? "Ocurrió un problema"
                : type === "warning"
                  ? "Atención"
                  : "Información"}
          </Text>

          <Text
            style={[
              styles.message,
              isWeb ? styles.messageDesktop : styles.messageMobile,
              { color: tone.text },
            ]}
          >
            {message}
          </Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={18} color={tone.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AppToast({
  visible,
  message,
  type = "info",
  duration = 2800,
  onClose,
}: AppToastProps) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  if (Platform.OS === "web") {
    return <ToastCard message={message} type={type} onClose={onClose} />;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <ToastCard message={message} type={type} onClose={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  wrapper: {
    width: "100%",
    zIndex: 99999,
  },

  wrapperDesktop: {
    position: "fixed" as any,
    right: 16,
    bottom: 16,
    left: "auto" as any,
    width: "auto" as any,
    alignItems: "flex-end",
  },

  wrapperMobile: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    alignItems: "center",
  },

  toast: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  toastDesktop: {
    width: 420,
    maxWidth: "calc(100vw - 32px)" as any,
    minHeight: 58,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    boxShadow: "0 10px 24px rgba(15,23,42,0.12)" as any,
  },

  toastMobile: {
    width: "100%",
    maxWidth: 460,
    minHeight: 70,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    elevation: 8,
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconWrapDesktop: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  iconWrapMobile: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  content: {
    flex: 1,
  },

  title: {
    fontWeight: "800",
  },

  titleDesktop: {
    fontSize: 13,
    marginBottom: 2,
  },

  titleMobile: {
    fontSize: 14,
    marginBottom: 3,
  },

  message: {
    fontWeight: "600",
  },

  messageDesktop: {
    fontSize: 13,
    lineHeight: 18,
  },

  messageMobile: {
    fontSize: 14,
    lineHeight: 19,
  },

  closeBtn: {
    alignSelf: "flex-start",
    padding: 2,
    marginTop: 1,
  },
});

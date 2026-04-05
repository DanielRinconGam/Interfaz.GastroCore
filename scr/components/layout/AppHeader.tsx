import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#46A38C";
const TEXT_COLOR = "#475569";
const LOGO_SOURCE = require("../../../assets/images/logo-h-white.png");

export const HEADER_HEIGHT = 60;
export const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0;
export const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + STATUS_BAR_HEIGHT;

export default function AppHeader({
  restaurantName,
  isMobile = false,
  mobileMenuOpen = false,
  onMenuPress,
}: any) {
  return (
    <View style={styles.safeAreaWrapper}>
      <View style={styles.container}>
        <View style={styles.left}>
          <Image
            source={LOGO_SOURCE}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.right}>
          <Text
            style={[styles.restaurant, isMobile && styles.restaurantMobile]}
            numberOfLines={1}
          >
            {restaurantName}
          </Text>

          {isMobile && (
            <Pressable
              onPress={onMenuPress}
              style={styles.menuButton}
              hitSlop={15}
            >
              <Ionicons
                name={mobileMenuOpen ? "close" : "menu"}
                size={28}
                color={PRIMARY}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaWrapper: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    zIndex: 1000,
    marginBottom: 0,
    paddingBottom: 0,
  },
  container: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  left: { flexDirection: "row", alignItems: "center" },
  logoImage: { height: 28, width: 120, tintColor: PRIMARY },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    gap: 12,
  },
  restaurant: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_COLOR,
    textAlign: "right",
  },
  restaurantMobile: { fontSize: 14 },
  menuButton: { padding: 4, marginLeft: 4 },
});

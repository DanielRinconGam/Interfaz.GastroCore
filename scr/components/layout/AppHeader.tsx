import { StyleSheet, Text, View } from "react-native";

type Props = {
  restaurantName: string;
  productName?: string;
  isOpen?: boolean;
};

const PRIMARY = "#46A38C";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";

export default function AppHeader({
  restaurantName,
  productName = "GastroCore",
  isOpen = true,
}: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.product}>{productName}</Text>
      </View>
      
      <View style={styles.right}>
        <Text style={styles.restaurant} numberOfLines={1}>
          {restaurantName}
        </Text>

        <View style={styles.statusWrap}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOpen ? PRIMARY : "#EF4444" },
            ]}
          />
          <Text style={styles.statusText}>
            {isOpen ? "Abierto" : "Cerrado"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  product: {
    fontSize: 15,
    fontWeight: "900",
    color: PRIMARY,
    letterSpacing: 0.5,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  restaurant: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_DARK,
  },

  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MUTED,
  },
});

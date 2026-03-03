import { StyleSheet, Text, View } from "react-native";
import AppHeader from "../scr/components/layout/AppHeader";
import SidebarMenu from "../scr/components/layout/SidebarMenu";

export default function Index() {
  return (
    <View style={styles.page}>
      {/* Header full width */}
      <AppHeader restaurantName="Restaurante La 85" isOpen={true} />

      {/* Body: Sidebar + Content */}
      <View style={styles.body}>
        <SidebarMenu />

        <View style={styles.content}>
          <Text style={styles.title}>Contenido de prueba</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#F8FAFC",
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
});

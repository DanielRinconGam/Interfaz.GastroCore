import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const PRIMARY = "#46A38C";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";

export default function Register() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(
        "https://promisingly-unslurred-hosea.ngrok-free.dev/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            email,
            password,
            confirm_password: confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert("Cuenta creada");
        router.replace("/");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>A</Text>
        </View>

        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Completa los datos para registrarte</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="correo@empresa.com"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={handleRegister}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Crear cuenta</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Volver al login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    gap: 16,
    ...Platform.select({
      android: { elevation: 10 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
    }),
  },

  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  logoText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 22,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 10,
  },

  inputGroup: { gap: 6 },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },

  button: {
    height: 50,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  buttonPressed: {
    backgroundColor: "#3D8E79",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },

  link: {
    textAlign: "center",
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
});

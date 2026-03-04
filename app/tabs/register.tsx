import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import styles from "../css/loginStyles";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* ✅ Formulario A LA IZQUIERDA */}
          <View style={styles.formSection}>
            <Text style={styles.loginTitle}>Crear cuenta</Text>
            <Text style={styles.loginSubtitle}>
              Regístrate para comenzar a usar GastroCore.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="username@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Registrarme</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.newText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity>
                <Text style={styles.signupText}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ✅ Logo / bloque A LA DERECHA */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Gastro{"\n"}Core</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import styles from "../css/auth/loginStyles";

const API_BASE_URL = "https://35.209.108.84";
const GENERIC_LOGIN_ERROR =
  "No fue posible iniciar sesión. Intenta nuevamente.";

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    usuario_id: number;
    nombres: string;
    apellidos: string;
    email: string;
    es_global: boolean;
    cargo: string | null;
    rol: string | null;
  };
};

type ApiErrorResponse = {
  detail?: string | { msg?: string } | Array<{ msg?: string }>;
};

const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string) {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
  });

  if (!fontsLoaded) return null;

  const getApiErrorMessage = (data: ApiErrorResponse | null) => {
    if (!data) return null;

    if (typeof data.detail === "string") {
      return data.detail;
    }

    return null;
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const url = `${API_BASE_URL}/api/v1/auth/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const rawText = await response.text();

      let data: LoginResponse | ApiErrorResponse | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const apiMessage = getApiErrorMessage(data as ApiErrorResponse | null);
        setErrorMsg(apiMessage || GENERIC_LOGIN_ERROR);
        return;
      }

      const loginData = data as LoginResponse;

      if (
        !loginData?.access_token ||
        !loginData?.token_type ||
        !loginData?.user
      ) {
        setErrorMsg(GENERIC_LOGIN_ERROR);
        return;
      }

      await storage.setItem("access_token", loginData.access_token);
      await storage.setItem("token_type", loginData.token_type);
      await storage.setItem("user", JSON.stringify(loginData.user));

      router.replace("/tabs/home");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg(GENERIC_LOGIN_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.mainContainer}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isMobile && styles.scrollContainerMobile,
          !isMobile && { minHeight: height },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            isMobile ? styles.cardMobile : styles.cardDesktop,
          ]}
        >
          <View
            style={[
              styles.brandPanel,
              isMobile ? styles.brandPanelMobile : styles.brandPanelDesktop,
            ]}
          >
            <LinearGradient
              colors={["#1F6B5C", "#349881", "#5FB3A2", "#9ED6C8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              locations={[0, 0.35, 0.7, 1]}
              style={styles.brandGradient}
            >
              <View
                style={[
                  styles.logoWrapper,
                  isMobile
                    ? styles.logoWrapperMobile
                    : styles.logoWrapperDesktop,
                ]}
              >
                <Image
                  source={require("../../assets/images/logo-white.png")}
                  style={isMobile ? styles.logoMobile : styles.logoDesktop}
                  resizeMode="contain"
                />
              </View>
            </LinearGradient>
          </View>

          <View
            style={[
              styles.formPanel,
              isMobile ? styles.formPanelMobile : styles.formPanelDesktop,
            ]}
          >
            <Text
              style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}
            >
              Inicio de sesión
            </Text>

            <Text
              style={[
                styles.formSubtitle,
                { fontFamily: "Poppins_400Regular" },
              ]}
            >
              Ingresa tus credenciales para continuar.
            </Text>

            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, { fontFamily: "Poppins_600SemiBold" }]}
              >
                Correo electrónico
              </Text>

              <TextInput
                style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
                placeholder="usuario@correo.com"
                placeholderTextColor="#7A8F89"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, { fontFamily: "Poppins_600SemiBold" }]}
              >
                Contraseña
              </Text>

              <TextInput
                style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
                placeholder="••••••••"
                placeholderTextColor="#7A8F89"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity activeOpacity={0.8} disabled={loading}>
                <Text
                  style={[
                    styles.forgotPass,
                    { fontFamily: "Poppins_400Regular" },
                  ]}
                >
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <Text
                style={[styles.errorText, { fontFamily: "Poppins_400Regular" }]}
              >
                {errorMsg}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.loginButtonText,
                    { fontFamily: "Poppins_600SemiBold" },
                  ]}
                >
                  Iniciar sesión
                </Text>
              )}
            </TouchableOpacity>

            <Text
              style={[styles.helperText, { fontFamily: "Poppins_400Regular" }]}
            >
              Si no tienes acceso, solicita tu cuenta al equipo administrador.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

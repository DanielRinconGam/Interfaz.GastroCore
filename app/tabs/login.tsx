import {
    Poppins_400Regular,
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import styles from "../css/loginStyles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
  });
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={[styles.card, { flexDirection: isMobile ? "column" : "row" }]}
        >
          {/* IMAGEN */}
          <View
            style={[
              styles.welcomeWrapper,
              {
                width: isMobile ? "100%" : "45%",
                minHeight: isMobile ? 220 : 250,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: isMobile ? 0 : 20,
                borderBottomRightRadius: isMobile ? 0 : 0,
              },
            ]}
          >
            <ImageBackground
              source={require("../../assets/images/BackgroundLogin.png")}
              style={styles.welcomeSection}
              resizeMode="cover"
            >
              <Text
                style={[
                  styles.welcomeText,
                  { fontFamily: "Poppins_600SemiBold" },
                ]}
              >
                Gastro{"\n"}Core
              </Text>
            </ImageBackground>
          </View>

          {/* FORM */}
          <View style={styles.formSection}>
            <Text style={styles.loginTitle}>Inicio de sesión</Text>
            <Text style={styles.loginSubtitle}>
              Bienvenido de vuelta, por favor ingresa tus credenciales.
            </Text>

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

            <View style={styles.row}>
              <TouchableOpacity>
                <Text style={styles.forgotPass}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.replace("../tabs/home")}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            {/*
                        <View style={styles.signupContainer}>
                            <Text style={styles.newText}>¿Nuevo Usuario? </Text>
                            <TouchableOpacity>
                                <Text style={styles.signupText}>Registrate!</Text>
                            </TouchableOpacity>
                        </View> */}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "@css/auth/loginStyles";

type Props = {
  email: string;
  password: string;
  loading: boolean;
  errorMsg: string;
  showPassword: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onLogin: () => void;
};

export const LoginForm = ({
  email,
  password,
  loading,
  errorMsg,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onLogin,
}: Props) => (
  <View>
    <Text style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}>
      Inicio de sesión
    </Text>
    <Text style={[styles.formSubtitle, { fontFamily: "Poppins_400Regular" }]}>
      Ingresa tus credenciales para continuar.
    </Text>

    <View style={styles.inputGroup}>
      <Text style={[styles.label, { fontFamily: "Poppins_600SemiBold" }]}>
        Correo electrónico
      </Text>
      <TextInput
        style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
        placeholder="usuario@correo.com"
        placeholderTextColor="#7A8F89"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
    </View>

    <View style={styles.inputGroup}>
      <Text style={[styles.label, { fontFamily: "Poppins_600SemiBold" }]}>
        Contraseña
      </Text>
      <View style={{ position: "relative", justifyContent: "center" }}>
        <TextInput
          style={[
            styles.input,
            { fontFamily: "Poppins_400Regular", paddingRight: 50 },
          ]}
          placeholder="••••••••"
          placeholderTextColor="#7A8F89"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
        <TouchableOpacity
          onPress={onTogglePassword}
          disabled={loading}
          style={{
            position: "absolute",
            right: 14,
            height: "100%",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#1F6B5C"
          />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.optionsRow}>
      <TouchableOpacity activeOpacity={0.8} disabled={loading}>
        <Text style={[styles.forgotPass, { fontFamily: "Poppins_400Regular" }]}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>
    </View>

    {!!errorMsg && (
      <Text style={[styles.errorText, { fontFamily: "Poppins_400Regular" }]}>
        {errorMsg}
      </Text>
    )}

    <TouchableOpacity
      style={[styles.loginButton, loading && styles.loginButtonDisabled]}
      activeOpacity={0.9}
      onPress={onLogin}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text
          style={[styles.loginButtonText, { fontFamily: "Poppins_600SemiBold" }]}
        >
          Iniciar sesión
        </Text>
      )}
    </TouchableOpacity>

    <Text style={[styles.helperText, { fontFamily: "Poppins_400Regular" }]}>
      Si no tienes acceso, solicita tu cuenta al equipo administrador.
    </Text>
  </View>
);
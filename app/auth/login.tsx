import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { BrandPanel } from "@components/auth/BrandPanel";
import { LoginForm } from "@components/auth/LoginForm";
import { useLogin } from "@hooks/auth/useLogin";
import styles from "@css/auth/loginStyles"; 

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular });

  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    checkingSession,
    errorMsg,
    showPassword,
    setShowPassword,
    handleLogin,
  } = useLogin();

  if (!fontsLoaded || checkingSession) return null;

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
          <BrandPanel isMobile={isMobile} />
          <View
            style={[
              styles.formPanel,
              isMobile ? styles.formPanelMobile : styles.formPanelDesktop,
            ]}
          >
            <LoginForm
              email={email}
              password={password}
              loading={loading}
              errorMsg={errorMsg}
              showPassword={showPassword}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              onLogin={handleLogin}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
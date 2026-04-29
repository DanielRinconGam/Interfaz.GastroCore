import { LinearGradient } from "expo-linear-gradient";
import { Image, View } from "react-native";
import styles from "@css/auth/loginStyles";

type Props = { isMobile: boolean };

export const BrandPanel = ({ isMobile }: Props) => (
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
          isMobile ? styles.logoWrapperMobile : styles.logoWrapperDesktop,
        ]}
      >
        <Image
          source={require("../../../assets/images/logo-white.png")}
          style={isMobile ? styles.logoMobile : styles.logoDesktop}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  </View>
);
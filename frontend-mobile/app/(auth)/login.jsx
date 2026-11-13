import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { loginCustomer } from "../../src/services/auth.service";

const { width, height } = Dimensions.get("window");

/* ================= PREMIUM PALETTE ================= */
const PREMIUM = {
  midnight: "#0B132B",
  midnightLight: "#1C2541",
  royal: "#2563EB",
  royalLight: "#EFF6FF",
  platinum: "#F8FAFC",
  silver: "#94A3B8",
  silverLight: "#E2E8F0",
  charcoal: "#1E293B",
  danger: "#DC2626",
  white: "#FFFFFF",
};

/* ================= ANIMATION HELPERS ================= */
function Reveal({ delay = 0, distance = 20, style, children }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Animasi Hujan Tiket
function FallingTicket({ delay, startX, duration, size, rotationDir }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fall = Animated.loop(
      Animated.timing(translateY, {
        toValue: height + 100,
        duration: duration,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const spin = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration * 1.5,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    fall.start();
    spin.start();

    return () => {
      fall.stop();
      spin.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", rotationDir === "right" ? "360deg" : "-360deg"],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.fallingTicket,
        {
          left: startX,
          transform: [{ translateY }, { rotate: spin }],
        },
      ]}
    >
      <Ionicons name="ticket" size={size} color="rgba(37, 99, 235, 0.08)" />
    </Animated.View>
  );
}

/* ================= MAIN SCREEN ================= */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleLogin = async () => {
    setError("");
    Keyboard.dismiss();

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginCustomer({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.success) {
        setError(result.message || "Login gagal.");
        return;
      }

      if (result.user?.role !== "customer") {
        setError("Aplikasi mobile ini hanya dapat digunakan oleh Customer.");
        return;
      }

      if (result.requiresOtp) {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email: result.user.email },
        });
        return;
      }

      if (result.token) {
        router.replace("/(tabs)");
        return;
      }

      setError("Respons login tidak dikenali.");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Tidak dapat terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* 1. ANIMASI HUJAN TIKET */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <FallingTicket delay={0} startX={width * 0.1} duration={7000} size={30} rotationDir="right" />
          <FallingTicket delay={1500} startX={width * 0.8} duration={9000} size={40} rotationDir="left" />
          <FallingTicket delay={3000} startX={width * 0.4} duration={8000} size={25} rotationDir="right" />
          <FallingTicket delay={5000} startX={width * 0.7} duration={10000} size={35} rotationDir="left" />
        </View>

        {/* 2. ORNAMEN BACKGROUND */}
        <LinearGradient
          colors={["#FFFFFF", PREMIUM.platinum, "#E2E8F0"]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <View style={styles.bgOrnament1} pointerEvents="none" />
        <View style={styles.bgOrnament2} pointerEvents="none" />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            <Reveal delay={100}>
              <Pressable style={styles.back} onPress={() => router.replace("/")}>
                <View style={styles.backCircle}>
                  <Ionicons name="arrow-back" size={20} color={PREMIUM.midnight} />
                </View>
              </Pressable>
            </Reveal>

            <Reveal delay={200} style={styles.headerContainer}>
              <LinearGradient
                colors={[PREMIUM.midnight, PREMIUM.royal, "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Ionicons name="ticket" size={32} color={PREMIUM.white} />
              </LinearGradient>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Masuk ke akun TicketVerse untuk melanjutkan pengalaman event-mu.
              </Text>
            </Reveal>

            {/* ================= FORM CARD ================= */}
            <Reveal delay={250} style={styles.formCardWrapper}>
              <View style={styles.formCard}>
                <View style={styles.form}>
                  
                  {/* INPUT EMAIL */}
                  <Reveal delay={300}>
                    <Text style={styles.label}>Email Address</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        isEmailFocused && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={isEmailFocused ? PREMIUM.royal : PREMIUM.silver}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Masukkan email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                      />
                    </View>
                  </Reveal>

                  {/* INPUT PASSWORD */}
                  <Reveal delay={350}>
                    <Text style={styles.label}>Password</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        isPasswordFocused && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={isPasswordFocused ? PREMIUM.royal : PREMIUM.silver}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Masukkan password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="password"
                        textContentType="password"
                        editable={!loading}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color={isPasswordFocused ? PREMIUM.royal : PREMIUM.silver}
                        />
                      </Pressable>
                    </View>
                  </Reveal>

                  <Reveal delay={400}>
                    <Pressable
                      style={styles.forgot}
                      onPress={() => router.push("/(auth)/forgot-password")}
                    >
                      <Text style={styles.forgotText}>Lupa password?</Text>
                    </Pressable>
                  </Reveal>

                  {error ? (
                    <Reveal delay={0} distance={10}>
                      <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={18} color={PREMIUM.danger} />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    </Reveal>
                  ) : null}

                  <Reveal delay={450}>
                    <Animated.View style={{ transform: [{ scale: scaleValue }], marginTop: 24 }}>
                      <Pressable
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={handleLogin}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={loading ? ["#94A3B8", "#64748B"] : [PREMIUM.midnight, PREMIUM.royal]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.button}
                        >
                          {loading ? (
                            <ActivityIndicator color={PREMIUM.white} />
                          ) : (
                            <>
                              <Text style={styles.buttonText}>Masuk</Text>
                              <Ionicons name="arrow-forward" size={20} color={PREMIUM.white} />
                            </>
                          )}
                        </LinearGradient>
                      </Pressable>
                    </Animated.View>
                  </Reveal>

                </View>
              </View>
            </Reveal>

            <Reveal delay={600} style={styles.registerRow}>
              <Text style={styles.registerText}>Belum memiliki akun? </Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.registerLink}>Daftar sekarang</Text>
              </Pressable>
            </Reveal>

            <Reveal delay={700}>
              <Text style={styles.footer}>© 2026 TicketVerse. All rights reserved.</Text>
            </Reveal>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.platinum,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60, 
    paddingBottom: 120, // Padding bawah diperbesar agar form bisa naik saat keyboard muncul
    justifyContent: "flex-start", 
  },

  fallingTicket: {
    position: "absolute",
    top: -100,
    zIndex: 0,
  },

  bgOrnament1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(37, 99, 235, 0.04)",
  },
  bgOrnament2: {
    position: "absolute",
    bottom: -50,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(11, 19, 43, 0.03)",
  },

  back: { marginBottom: 24, alignSelf: "flex-start" },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
  },
  
  headerContainer: { marginBottom: 30 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  title: { 
    fontSize: 34, 
    color: PREMIUM.midnight, 
    fontWeight: "900", 
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  subtitle: { 
    fontSize: 15, 
    lineHeight: 24, 
    color: "#64748B", 
    marginTop: 12,
    maxWidth: 320,
    fontWeight: "500",
  },

  formCardWrapper: {
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 10,
    zIndex: 2,
  },
  formCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  form: { marginTop: -5 },
  label: { 
    fontSize: 13, 
    fontWeight: "800", 
    color: PREMIUM.midnight, 
    marginBottom: 10, 
    marginTop: 18, 
    letterSpacing: 0.3,
  },
  inputWrapper: {
    height: 60,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F8FAFC",
  },
  inputWrapperFocused: {
    borderColor: PREMIUM.royal,
    backgroundColor: PREMIUM.white,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  input: { 
    flex: 1, 
    color: PREMIUM.midnight, 
    fontSize: 15, 
    height: "100%",
    paddingVertical: 0,
    // PENTING UNTUK ANDROID:
    textAlignVertical: "center", 
    includeFontPadding: false, 
    // Catatan: fontWeight sengaja TIDAK DIGUNAKAN di sini agar secureTextEntry tidak bug
  },
  
  forgot: { alignSelf: "flex-end", marginTop: 16, marginBottom: 8 },
  forgotText: { color: PREMIUM.royal, fontSize: 13, fontWeight: "800" },
  
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { flex: 1, color: "#B91C1C", fontSize: 13, lineHeight: 20, fontWeight: "600" },

  button: {
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: { 
    color: PREMIUM.white, 
    fontWeight: "900", 
    fontSize: 17, 
    letterSpacing: 0.5,
  },

  registerRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 40,
    zIndex: 2,
  },
  registerText: { 
    color: "#64748B", 
    fontSize: 14,
    fontWeight: "500",
  },
  registerLink: { 
    color: PREMIUM.royal, 
    fontWeight: "900", 
    fontSize: 14,
  },
  footer: { 
    color: "#94A3B8", 
    fontSize: 12, 
    textAlign: "center", 
    marginTop: 40, 
    fontWeight: "500",
    letterSpacing: 0.3,
    zIndex: 2,
  },
});
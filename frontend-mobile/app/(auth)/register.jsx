import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { registerCustomer } from "../../src/services/auth.service";

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
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ================= FALLING TICKET COMPONENT ================= */
function FallingTicket({ delay, startX, duration, size, rotationDir }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animasi Jatuh
    const fall = Animated.loop(
      Animated.timing(translateY, {
        toValue: height + 100,
        duration: duration,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    // Animasi Putar
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
      <Ionicons name="ticket" size={size} color="rgba(37, 99, 235, 0.12)" />
    </Animated.View>
  );
}

/* ================= MAIN SCREEN ================= */
export default function RegisterPage() {
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleRegister = async () => {
    if (!form.fullname.trim() || !form.email.trim() || !form.password) {
      Alert.alert("Perhatian", "Nama lengkap, email, dan password wajib diisi.");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Perhatian", "Password minimal 6 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Perhatian", "Konfirmasi password tidak sama.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullname: form.fullname.trim(),
        username: form.username.trim() || null,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || null,
      };

      const result = await registerCustomer(payload);

      if (!result.success) {
        Alert.alert("Registrasi gagal", result.message);
        return;
      }

      Alert.alert(
        "Registrasi berhasil",
        "Akun Customer berhasil dibuat. Silakan login menggunakan email dan password kamu.",
        [{ text: "Lanjut Login", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (error) {
      Alert.alert(
        "Registrasi gagal",
        error.response?.data?.message || "Tidak dapat terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. ANIMASI HUJAN TIKET */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <FallingTicket delay={0} startX={width * 0.1} duration={7000} size={30} rotationDir="right" />
        <FallingTicket delay={1500} startX={width * 0.8} duration={9000} size={40} rotationDir="left" />
        <FallingTicket delay={3000} startX={width * 0.4} duration={8000} size={25} rotationDir="right" />
        <FallingTicket delay={5000} startX={width * 0.7} duration={10000} size={35} rotationDir="left" />
        <FallingTicket delay={2000} startX={width * 0.2} duration={8500} size={20} rotationDir="right" />
      </View>

      {/* 2. ORNAMEN BACKGROUND */}
      <View style={styles.bgOrnament1} />
      <View style={styles.bgOrnament2} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Reveal delay={100}>
            <Pressable style={styles.back} onPress={() => router.replace("/")}>
              <Ionicons name="arrow-back" size={22} color={PREMIUM.midnight} />
            </Pressable>
          </Reveal>

          <Reveal delay={200} style={styles.headerContainer}>
            <LinearGradient colors={[PREMIUM.midnight, PREMIUM.royal]} style={styles.logo}>
              <Ionicons name="person-add" size={26} color={PREMIUM.white} />
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Daftar dan temukan pengalaman event terbaik bersama TicketVerse.
            </Text>
          </Reveal>

          {/* ================= FORM CARD ================= */}
          <Reveal delay={250} style={styles.formCardWrapper}>
            <View style={styles.formCard}>
              <View style={styles.form}>
                <Reveal delay={300}>
                  <Input
                    label="Nama Lengkap *"
                    placeholder="Masukkan nama lengkap"
                    value={form.fullname}
                    onChangeText={(v) => updateField("fullname", v)}
                    icon="person-outline"
                    isFocused={focusedInput === "fullname"}
                    onFocus={() => setFocusedInput("fullname")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </Reveal>

                <Reveal delay={350}>
                  <Input
                    label="Username"
                    placeholder="Masukkan username"
                    value={form.username}
                    onChangeText={(v) => updateField("username", v)}
                    autoCapitalize="none"
                    icon="at-outline"
                    isFocused={focusedInput === "username"}
                    onFocus={() => setFocusedInput("username")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </Reveal>

                <Reveal delay={400}>
                  <Input
                    label="Email *"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChangeText={(v) => updateField("email", v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail-outline"
                    isFocused={focusedInput === "email"}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </Reveal>

                <Reveal delay={450}>
                  <Input
                    label="Nomor Telepon"
                    placeholder="Masukkan nomor telepon"
                    value={form.phone}
                    onChangeText={(v) => updateField("phone", v)}
                    keyboardType="phone-pad"
                    icon="call-outline"
                    isFocused={focusedInput === "phone"}
                    onFocus={() => setFocusedInput("phone")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </Reveal>

                <Reveal delay={500}>
                  <Text style={styles.label}>Password *</Text>
                  <View style={[styles.inputWrapper, focusedInput === "password" && styles.inputWrapperFocused]}>
                    <Ionicons name="lock-closed-outline" size={19} color={focusedInput === "password" ? PREMIUM.royal : PREMIUM.silver} />
                    <TextInput
                      style={styles.input}
                      placeholder="Minimal 6 karakter"
                      placeholderTextColor={PREMIUM.silver}
                      value={form.password}
                      onChangeText={(v) => updateField("password", v)}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={PREMIUM.silver} />
                    </Pressable>
                  </View>
                </Reveal>

                <Reveal delay={550}>
                  <Text style={styles.label}>Konfirmasi Password *</Text>
                  <View style={[styles.inputWrapper, focusedInput === "confirmPassword" && styles.inputWrapperFocused]}>
                    <Ionicons name="shield-checkmark-outline" size={19} color={focusedInput === "confirmPassword" ? PREMIUM.royal : PREMIUM.silver} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ulangi password"
                      placeholderTextColor={PREMIUM.silver}
                      value={form.confirmPassword}
                      onChangeText={(v) => updateField("confirmPassword", v)}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput("confirmPassword")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </Reveal>

                <Reveal delay={600}>
                  <Animated.View style={{ transform: [{ scale: scaleValue }], marginTop: 32 }}>
                    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handleRegister} disabled={loading}>
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
                            <Text style={styles.buttonText}>Buat Akun</Text>
                            <Ionicons name="arrow-forward" size={18} color={PREMIUM.white} />
                          </>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                </Reveal>
              </View>
            </View>
          </Reveal>

          <Reveal delay={700} style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.loginLink}>Masuk</Text>
            </Pressable>
          </Reveal>

          <Reveal delay={800}>
            <Text style={styles.footer}>© 2026 TicketVerse. All rights reserved.</Text>
          </Reveal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Input({ label, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry, icon, isFocused, onFocus, onBlur }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        {icon && <Ionicons name={icon} size={19} color={isFocused ? PREMIUM.royal : PREMIUM.silver} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={PREMIUM.silver}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "sentences"}
          secureTextEntry={secureTextEntry}
          autoCorrect={false}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.platinum },
  content: { flexGrow: 1, padding: 24, paddingTop: 50, paddingBottom: 40 },
  
  /* ===== FALLING TICKET ANIMATION ===== */
  fallingTicket: {
    position: "absolute",
    top: -100,
    zIndex: 0, // Tetap di belakang
  },

  /* ===== BACKGROUND ORNAMENTS ===== */
  bgOrnament1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(37, 99, 235, 0.06)",
  },
  bgOrnament2: {
    position: "absolute",
    bottom: -50,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(11, 19, 43, 0.04)",
  },

  back: { marginBottom: 20, alignSelf: "flex-start" },
  
  /* ===== HEADER ===== */
  headerContainer: { marginBottom: 24 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  title: { 
    fontSize: 32, 
    color: PREMIUM.midnight, 
    fontWeight: "900", 
    letterSpacing: -1,
    lineHeight: 38,
  },
  subtitle: { 
    fontSize: 14, 
    lineHeight: 22, 
    color: PREMIUM.silver, 
    marginTop: 10,
    fontWeight: "500",
  },

  /* ===== FORM CARD ===== */
  formCardWrapper: {
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
    zIndex: 2, // Agar form berada di atas animasi hujan tiket
  },
  formCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
  },

  /* ===== FORM & INPUT ===== */
  form: { marginTop: -10 },
  label: { 
    fontSize: 12, 
    fontWeight: "900", 
    color: PREMIUM.midnight, 
    marginTop: 18, 
    marginBottom: 10, 
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrapper: {
    height: 56,
    borderWidth: 1.5,
    borderColor: PREMIUM.silverLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PREMIUM.platinum,
    gap: 12,
  },
  inputWrapperFocused: { 
    borderColor: PREMIUM.royal, 
    backgroundColor: PREMIUM.royalLight,
    shadowColor: PREMIUM.royal,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: { 
    flex: 1, 
    color: PREMIUM.midnight, 
    fontSize: 14, 
    outlineStyle: "none",
    fontWeight: "600",
  },

  /* ===== BUTTON ===== */
  button: {
    height: 58,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: { 
    color: PREMIUM.white, 
    fontWeight: "900", 
    fontSize: 16, 
    letterSpacing: 0.5,
  },

  /* ===== FOOTER ===== */
  loginRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 35,
    zIndex: 2,
  },
  loginText: { 
    color: PREMIUM.silver, 
    fontSize: 13,
    fontWeight: "500",
  },
  loginLink: { 
    color: PREMIUM.royal, 
    fontWeight: "900", 
    fontSize: 13,
  },
  footer: { 
    color: PREMIUM.silver, 
    textAlign: "center", 
    fontSize: 11, 
    marginTop: 40, 
    fontWeight: "500",
    letterSpacing: 0.5,
    zIndex: 2,
  },
});
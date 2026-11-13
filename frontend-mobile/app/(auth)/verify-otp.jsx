import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import api from "../../src/services/api";
import { verifyLoginOTP } from "../../src/services/auth.service";

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
      <Ionicons name="ticket" size={size} color="rgba(37, 99, 235, 0.12)" />
    </Animated.View>
  );
}

/* ================= MAIN SCREEN ================= */
export default function VerifyOTPPage() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleVerify = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert("Perhatian", "Masukkan kode OTP 6 digit.");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyLoginOTP({ email, otp: otp.trim() });

      if (!result.success) {
        Alert.alert("Verifikasi gagal", result.message);
        return;
      }
      if (result.user?.role !== "customer") {
        Alert.alert("Akses ditolak", "Akun ini bukan akun Customer.");
        return;
      }
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Verifikasi gagal",
        error.response?.data?.message || "Gagal memverifikasi OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const response = await api.post("/auth/resend-otp", { email });
      Alert.alert(
        response.data.success ? "Berhasil" : "Gagal",
        response.data.message
      );
    } catch (error) {
      Alert.alert(
        "Gagal",
        error.response?.data?.message || "OTP tidak dapat dikirim ulang."
      );
    } finally {
      setResending(false);
    }
  };

  // Helper untuk memecah string OTP menjadi array 6 digit
  const renderOtpBoxes = () => {
    return Array(6)
      .fill("")
      .map((_, index) => {
        const digit = otp[index] || "";
        const isCurrentFocus = isFocused && otp.length === index;
        return (
          <View
            key={index}
            style={[
              styles.otpBox,
              isCurrentFocus && styles.otpBoxFocused,
              digit && styles.otpBoxFilled,
            ]}
          >
            <Text style={styles.otpText}>{digit}</Text>
          </View>
        );
      });
  };

  return (
    <View style={styles.container}>
      {/* 1. ANIMASI HUJAN TIKET */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <FallingTicket delay={0} startX={width * 0.1} duration={7000} size={30} rotationDir="right" />
        <FallingTicket delay={1500} startX={width * 0.8} duration={9000} size={40} rotationDir="left" />
        <FallingTicket delay={3000} startX={width * 0.4} duration={8000} size={25} rotationDir="right" />
        <FallingTicket delay={5000} startX={width * 0.7} duration={10000} size={35} rotationDir="left" />
      </View>

      {/* 2. ORNAMEN BACKGROUND */}
      <View style={styles.bgOrnament1} />
      <View style={styles.bgOrnament2} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Reveal delay={100}>
            <Pressable style={styles.back} onPress={() => router.replace("/(auth)/login")}>
              <Ionicons name="arrow-back" size={22} color={PREMIUM.midnight} />
            </Pressable>
          </Reveal>

          <Reveal delay={200} style={styles.headerContainer}>
            <LinearGradient colors={[PREMIUM.midnight, PREMIUM.royal]} style={styles.logo}>
              <Ionicons name="mail-unread" size={32} color={PREMIUM.white} />
            </LinearGradient>
            <Text style={styles.title}>Cek Email Kamu</Text>
            <Text style={styles.subtitle}>
              Kami telah mengirimkan 6 digit kode verifikasi ke:
            </Text>
            <View style={styles.emailBadge}>
              <Ionicons name="mail-outline" size={14} color={PREMIUM.royal} />
              <Text style={styles.emailText}>{email || "email@kamu.com"}</Text>
            </View>
          </Reveal>

          {/* ================= FORM CARD ================= */}
          <Reveal delay={250} style={styles.formCardWrapper}>
            <View style={styles.formCard}>
              
              <Text style={styles.label}>KODE VERIFIKASI</Text>
              
              {/* Kotak OTP Kustom (6 Kotak) */}
              <Pressable onPress={() => inputRef.current?.focus()}>
                <View style={styles.otpContainer}>
                  {renderOtpBoxes()}
                </View>
                {/* Input TextInput asli disembunyikan, hanya menangkap ketikan */}
                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </Pressable>

              <Animated.View style={{ transform: [{ scale: scaleValue }], marginTop: 32 }}>
                <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handleVerify} disabled={loading}>
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
                        <Text style={styles.buttonText}>Verifikasi & Masuk</Text>
                        <Ionicons name="arrow-forward" size={18} color={PREMIUM.white} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendLabel}>Tidak menerima kode? </Text>
                <Pressable onPress={handleResend} disabled={resending}>
                  {resending ? (
                    <ActivityIndicator color={PREMIUM.royal} size="small" />
                  ) : (
                    <Text style={styles.resendText}>Kirim Ulang</Text>
                  )}
                </Pressable>
              </View>

            </View>
          </Reveal>

          <Reveal delay={600}>
            <Text style={styles.footer}>© 2026 TicketVerse. All rights reserved.</Text>
          </Reveal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.platinum },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40, justifyContent: "center" },

  /* ===== FALLING TICKET ANIMATION ===== */
  fallingTicket: {
    position: "absolute",
    top: -100,
    zIndex: 0,
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

  back: { position: "absolute", top: 50, left: 24, zIndex: 10, padding: 8 },

  /* ===== HEADER ===== */
  headerContainer: { alignItems: "center", marginBottom: 30 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { 
    fontSize: 28, 
    color: PREMIUM.midnight, 
    fontWeight: "900", 
    textAlign: "center", 
    letterSpacing: -0.8,
  },
  subtitle: { 
    fontSize: 14, 
    lineHeight: 22, 
    color: PREMIUM.silver, 
    marginTop: 10,
    textAlign: "center",
    maxWidth: 280,
    fontWeight: "500",
  },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: PREMIUM.royalLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  emailText: { color: PREMIUM.royal, fontWeight: "800", fontSize: 13 },

  /* ===== FORM CARD ===== */
  formCardWrapper: {
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
    zIndex: 2,
  },
  formCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    alignItems: "center",
  },
  
  label: { 
    fontSize: 11, 
    fontWeight: "900", 
    color: PREMIUM.midnight, 
    marginBottom: 16, 
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  /* ===== KOTAK OTP KUSTOM ===== */
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  otpBox: {
    width: 44,
    height: 56,
    borderRadius: 12,
    backgroundColor: PREMIUM.platinum,
    borderWidth: 1.5,
    borderColor: PREMIUM.silverLight,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFocused: {
    borderColor: PREMIUM.royal,
    backgroundColor: PREMIUM.royalLight,
    shadowColor: PREMIUM.royal,
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  otpBoxFilled: {
    borderColor: PREMIUM.royal,
    backgroundColor: PREMIUM.white,
  },
  otpText: {
    fontSize: 24,
    fontWeight: "900",
    color: PREMIUM.midnight,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },

  /* ===== BUTTON ===== */
  button: {
    width: "100%",
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
  resendContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 24,
  },
  resendLabel: { 
    color: PREMIUM.silver, 
    fontSize: 13,
    fontWeight: "500",
  },
  resendText: { 
    color: PREMIUM.royal, 
    fontWeight: "900", 
    fontSize: 13,
  },
  footer: { 
    color: PREMIUM.silver, 
    fontSize: 11, 
    textAlign: "center", 
    marginTop: 40, 
    fontWeight: "500",
    letterSpacing: 0.5,
    zIndex: 2,
  },
});
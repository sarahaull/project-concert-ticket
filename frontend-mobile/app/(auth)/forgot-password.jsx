
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import api from "../../src/services/api";

const COLORS = {
  midnight: "#0B132B",
  midnightLight: "#1C2541",
  royal: "#2563EB",
  royalDark: "#1D4ED8",
  royalLight: "#EFF6FF",
  background: "#F5F8FD",
  white: "#FFFFFF",
  charcoal: "#1E293B",
  silver: "#94A3B8",
  border: "#E2E8F0",
  success: "#059669",
  danger: "#DC2626",
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const otpRef = useRef(null);
  const passwordRef = useRef(null);

  const getErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Terjadi kesalahan. Silakan coba kembali."
    );
  };

  const normalizeEmail = (value) =>
    String(value || "").trim().toLowerCase();

  const validateEmail = () => {
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      Alert.alert("Perhatian", "Email wajib diisi.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        "Email tidak valid",
        "Masukkan alamat email dengan format yang benar."
      );
      return false;
    }

    return true;
  };

  // ==========================================
  // STEP 1: REQUEST RESET PASSWORD
  // POST /api/auth/forgot-password
  // ==========================================

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    try {
      setLoading(true);

      const cleanEmail = normalizeEmail(email);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email: cleanEmail,
        }
      );

      const result = response?.data;

      if (result?.success === false) {
        Alert.alert(
          "Gagal",
          result?.message || "Gagal mengirim OTP."
        );
        return;
      }

      setEmail(cleanEmail);
      setStep("otp");

      Alert.alert(
        "OTP Terkirim",
        result?.message ||
          "Kode OTP reset password telah dikirim ke email kamu."
      );

      setTimeout(() => {
        otpRef.current?.focus();
      }, 350);
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error?.response?.data || error
      );

      Alert.alert("Gagal", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY RESET OTP
  // POST /api/auth/verify-reset-otp
  // ==========================================

  const handleVerifyOTP = async () => {
    const cleanOTP = otp.trim();

    if (!cleanOTP) {
      Alert.alert("Perhatian", "Masukkan kode OTP terlebih dahulu.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOTP)) {
      Alert.alert(
        "OTP tidak valid",
        "Masukkan kode OTP 6 digit."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/verify-reset-otp",
        {
          email: normalizeEmail(email),
          otp: cleanOTP,
        }
      );

      const result = response?.data;

      if (result?.success === false) {
        Alert.alert(
          "Verifikasi Gagal",
          result?.message || "Kode OTP tidak valid."
        );
        return;
      }

      setStep("password");

      Alert.alert(
        "Verifikasi Berhasil",
        result?.message || "OTP valid. Silakan buat password baru."
      );

      setTimeout(() => {
        passwordRef.current?.focus();
      }, 350);
    } catch (error) {
      console.error(
        "VERIFY RESET OTP ERROR:",
        error?.response?.data || error
      );

      Alert.alert(
        "Verifikasi Gagal",
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 3: RESET PASSWORD
  // POST /api/auth/reset-password
  // ==========================================

  const handleResetPassword = async () => {
    if (!password.trim()) {
      Alert.alert("Perhatian", "Password baru wajib diisi.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password terlalu pendek",
        "Password minimal terdiri dari 6 karakter."
      );
      return;
    }

    if (!confirmPassword) {
      Alert.alert(
        "Perhatian",
        "Silakan konfirmasi password baru."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password tidak cocok",
        "Konfirmasi password harus sama dengan password baru."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/reset-password",
        {
          email: normalizeEmail(email),
          otp: otp.trim(),
          password,
          confirmPassword,
        }
      );

      const result = response?.data;

      if (result?.success === false) {
        Alert.alert(
          "Gagal",
          result?.message || "Password gagal diperbarui."
        );
        return;
      }

      Alert.alert(
        "Password Berhasil Diubah",
        result?.message ||
          "Password berhasil diubah. Silakan login kembali.",
        [
          {
            text: "Login Sekarang",
            onPress: () => {
              router.replace("/(auth)/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error?.response?.data || error
      );

      Alert.alert(
        "Gagal Mengubah Password",
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleBack = () => {
    if (loading) return;

    if (step === "otp") {
      setStep("email");
      setOtp("");
      return;
    }

    if (step === "password") {
      setStep("otp");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    router.back();
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "email", label: "Email" },
      { key: "otp", label: "Verifikasi" },
      { key: "password", label: "Password" },
    ];

    const currentIndex = steps.findIndex(
      (item) => item.key === step
    );

    return (
      <View style={styles.progressContainer}>
        {steps.map((item, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <React.Fragment key={item.key}>
              <View style={styles.progressItem}>
                <View
                  style={[
                    styles.progressCircle,
                    (active || completed) &&
                      styles.progressCircleActive,
                  ]}
                >
                  {completed ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={COLORS.white}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.progressNumber,
                        active && styles.progressNumberActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.progressLabel,
                    active && styles.progressLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </View>

              {index !== steps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    completed && styles.progressLineActive,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const getStepContent = () => {
    if (step === "email") {
      return {
        icon: "mail-outline",
        title: "Lupa Password?",
        description:
          "Jangan khawatir! Masukkan email yang terdaftar. Kami akan mengirimkan kode verifikasi untuk membantu mengatur ulang password kamu.",
      };
    }

    if (step === "otp") {
      return {
        icon: "shield-checkmark-outline",
        title: "Verifikasi Email",
        description:
          "Masukkan 6 digit kode OTP yang telah kami kirimkan ke alamat email kamu.",
      };
    }

    return {
      icon: "lock-closed-outline",
      title: "Password Baru",
      description:
        "Buat password baru yang kuat dan mudah kamu ingat untuk menjaga keamanan akun TicketVerse.",
    };
  };

  const content = getStepContent();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={COLORS.midnight}
              />
            </Pressable>

            <View style={styles.brand}>
              <LinearGradient
                colors={[COLORS.midnight, COLORS.royal]}
                style={styles.brandIcon}
              >
                <Ionicons
                  name="ticket"
                  size={19}
                  color={COLORS.white}
                />
              </LinearGradient>

              <View>
                <Text style={styles.brandName}>TICKETVERSE</Text>
                <Text style={styles.brandCaption}>
                  YOUR EVENT EXPERIENCE
                </Text>
              </View>
            </View>
          </View>

          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.heroDecorationOne} />
            <View style={styles.heroDecorationTwo} />

            <LinearGradient
              colors={[COLORS.midnight, COLORS.midnightLight]}
              style={styles.heroCard}
            >
              <View style={styles.heroTop}>
                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgeText}>
                    ACCOUNT SECURITY
                  </Text>
                </View>

                <Ionicons
                  name="shield-checkmark-outline"
                  size={25}
                  color="#93C5FD"
                />
              </View>

              <Text style={styles.heroTitle}>
                Your account,{"\n"}
                <Text style={styles.heroHighlight}>
                  always protected.
                </Text>
              </Text>

              <Text style={styles.heroDescription}>
                Reset your password securely and get back to
                discovering extraordinary events.
              </Text>

              <View style={styles.heroBottom}>
                <Ionicons
                  name="lock-closed"
                  size={12}
                  color="#93C5FD"
                />
                <Text style={styles.heroBottomText}>
                  SECURE PASSWORD RECOVERY
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            {renderStepIndicator()}

            <View style={styles.formIconWrapper}>
              <LinearGradient
                colors={["#EFF6FF", "#DBEAFE"]}
                style={styles.formIcon}
              >
                <Ionicons
                  name={content.icon}
                  size={29}
                  color={COLORS.royal}
                />
              </LinearGradient>
            </View>

            <Text style={styles.formTitle}>{content.title}</Text>

            <Text style={styles.formDescription}>
              {content.description}
            </Text>

            {/* EMAIL STEP */}
            {step === "email" && (
              <View style={styles.formFields}>
                <Text style={styles.inputLabel}>
                  ALAMAT EMAIL
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color={COLORS.silver}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="nama@email.com"
                    placeholderTextColor="#B0BAC9"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="send"
                    onSubmitEditing={handleSendOTP}
                  />
                </View>

                <Text style={styles.helperText}>
                  Gunakan email yang terhubung dengan akun TicketVerse.
                </Text>

                <PrimaryButton
                  title="Kirim Kode OTP"
                  icon="paper-plane-outline"
                  loading={loading}
                  onPress={handleSendOTP}
                />
              </View>
            )}

            {/* OTP STEP */}
            {step === "otp" && (
              <View style={styles.formFields}>
                <View style={styles.emailInfo}>
                  <Ionicons
                    name="mail"
                    size={16}
                    color={COLORS.royal}
                  />

                  <Text style={styles.emailInfoText}>
                    {email}
                  </Text>
                </View>

                <Text style={styles.inputLabel}>
                  KODE VERIFIKASI
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="keypad-outline"
                    size={19}
                    color={COLORS.silver}
                  />

                  <TextInput
                    ref={otpRef}
                    style={styles.input}
                    placeholder="Masukkan 6 digit OTP"
                    placeholderTextColor="#B0BAC9"
                    value={otp}
                    onChangeText={(value) =>
                      setOtp(value.replace(/\D/g, "").slice(0, 6))
                    }
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyOTP}
                  />
                </View>

                <View style={styles.otpNotice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={COLORS.royal}
                  />

                  <Text style={styles.otpNoticeText}>
                    Kode OTP berlaku selama 10 menit.
                  </Text>
                </View>

                <PrimaryButton
                  title="Verifikasi OTP"
                  icon="shield-checkmark-outline"
                  loading={loading}
                  onPress={handleVerifyOTP}
                />

                <Pressable
                  style={styles.changeEmailButton}
                  onPress={() => {
                    if (loading) return;
                    setStep("email");
                    setOtp("");
                  }}
                  disabled={loading}
                >
                  <Text style={styles.changeEmailText}>
                    Gunakan email lain
                  </Text>
                </Pressable>
              </View>
            )}

            {/* PASSWORD STEP */}
            {step === "password" && (
              <View style={styles.formFields}>
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.success}
                  />
                  <Text style={styles.verifiedText}>
                    Email berhasil diverifikasi
                  </Text>
                </View>

                <Text style={styles.inputLabel}>
                  PASSWORD BARU
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={COLORS.silver}
                  />

                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor="#B0BAC9"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="next"
                  />

                  <Pressable
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={19}
                      color={COLORS.silver}
                    />
                  </Pressable>
                </View>

                <Text style={styles.passwordHint}>
                  Password minimal 6 karakter.
                </Text>

                <Text style={styles.inputLabel}>
                  KONFIRMASI PASSWORD
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={COLORS.silver}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan ulang password"
                    placeholderTextColor="#B0BAC9"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />

                  <Pressable
                    onPress={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={19}
                      color={COLORS.silver}
                    />
                  </Pressable>
                </View>

                <PrimaryButton
                  title="Simpan Password Baru"
                  icon="checkmark-circle-outline"
                  loading={loading}
                  onPress={handleResetPassword}
                />
              </View>
            )}

            {/* SECURITY FOOTER */}
            <View style={styles.securityFooter}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={COLORS.success}
              />

              <Text style={styles.securityText}>
                Informasi akun kamu dilindungi dengan aman.
              </Text>
            </View>
          </View>

          {/* BACK TO LOGIN */}
          <Pressable
            style={styles.loginLink}
            onPress={() => router.replace("/(auth)/login")}
            disabled={loading}
          >
            <Ionicons
              name="arrow-back"
              size={15}
              color={COLORS.royal}
            />

            <Text style={styles.loginLinkText}>
              Kembali ke halaman Login
            </Text>
          </Pressable>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <View style={styles.footerBrand}>
              <Ionicons
                name="ticket"
                size={13}
                color={COLORS.royal}
              />
              <Text style={styles.footerBrandText}>
                TICKETVERSE
              </Text>
            </View>

            <Text style={styles.footerText}>
              Your Premium Event Experience
            </Text>

            <Text style={styles.footerCopyright}>
              © 2026 TicketVerse. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==========================================
// REUSABLE BUTTON
// ==========================================

function PrimaryButton({
  title,
  icon,
  loading,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !loading && styles.primaryButtonPressed,
        loading && styles.primaryButtonDisabled,
      ]}
    >
      <LinearGradient
        colors={[COLORS.royal, COLORS.royalDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryButtonGradient}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.white}
          />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>
              {title}
            </Text>

            <Ionicons
              name={icon}
              size={18}
              color={COLORS.white}
            />
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  // HEADER

  header: {
    paddingTop: Platform.OS === "android" ? 42 : 58,
    paddingHorizontal: 22,
    paddingBottom: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  brandIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  brandName: {
    color: COLORS.midnight,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  brandCaption: {
    color: COLORS.silver,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 3,
  },

  // HERO

  hero: {
    marginHorizontal: 20,
    marginBottom: 25,
    position: "relative",
  },

  heroCard: {
    borderRadius: 25,
    padding: 23,
    overflow: "hidden",
  },

  heroDecorationOne: {
    position: "absolute",
    width: 145,
    height: 145,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.12)",
    right: -35,
    top: -45,
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 95,
    height: 95,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.10)",
    right: 10,
    top: 10,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(37,99,235,0.20)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.20)",
  },

  heroBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#60A5FA",
  },

  heroBadgeText: {
    color: "#BFDBFE",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 24,
    letterSpacing: -0.8,
  },

  heroHighlight: {
    color: "#60A5FA",
  },

  heroDescription: {
    color: "#A8B7CE",
    fontSize: 11,
    lineHeight: 19,
    marginTop: 10,
    maxWidth: 270,
  },

  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
  },

  heroBottomText: {
    color: "#93C5FD",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  // FORM CARD

  formCard: {
    marginHorizontal: 20,
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.055,
    shadowRadius: 18,
    elevation: 4,
  },

  // PROGRESS

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  progressItem: {
    alignItems: "center",
    gap: 7,
  },

  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  progressCircleActive: {
    backgroundColor: COLORS.royal,
    borderColor: COLORS.royal,
  },

  progressNumber: {
    color: COLORS.silver,
    fontSize: 11,
    fontWeight: "800",
  },

  progressNumberActive: {
    color: COLORS.white,
  },

  progressLabel: {
    color: COLORS.silver,
    fontSize: 9,
    fontWeight: "700",
  },

  progressLabelActive: {
    color: COLORS.royal,
    fontWeight: "900",
  },

  progressLine: {
    height: 2,
    width: 47,
    backgroundColor: COLORS.border,
    marginHorizontal: 9,
    marginBottom: 19,
  },

  progressLineActive: {
    backgroundColor: COLORS.royal,
  },

  // FORM CONTENT

  formIconWrapper: {
    alignItems: "center",
    marginBottom: 15,
  },

  formIcon: {
    width: 65,
    height: 65,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  formTitle: {
    textAlign: "center",
    color: COLORS.midnight,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  formDescription: {
    color: COLORS.silver,
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
    marginBottom: 25,
  },

  formFields: {
    width: "100%",
  },

  inputLabel: {
    color: COLORS.charcoal,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 9,
    marginTop: 13,
  },

  inputWrapper: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: "#FAFCFF",
    gap: 11,
  },

  input: {
    flex: 1,
    color: COLORS.midnight,
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 14,
  },

  helperText: {
    color: COLORS.silver,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 9,
    marginBottom: 19,
  },

  passwordHint: {
    color: COLORS.silver,
    fontSize: 10,
    marginTop: 8,
    marginBottom: 6,
  },

  // OTP

  emailInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.royalLight,
    borderRadius: 11,
    marginBottom: 13,
  },

  emailInfoText: {
    color: COLORS.royal,
    fontSize: 11,
    fontWeight: "800",
  },

  otpNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    marginBottom: 19,
  },

  otpNoticeText: {
    color: COLORS.silver,
    fontSize: 10,
    fontWeight: "600",
  },

  changeEmailButton: {
    alignItems: "center",
    paddingVertical: 15,
  },

  changeEmailText: {
    color: COLORS.royal,
    fontSize: 11,
    fontWeight: "800",
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 11,
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    marginBottom: 10,
  },

  verifiedText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "800",
  },

  // BUTTON

  primaryButton: {
    width: "100%",
    borderRadius: 13,
    overflow: "hidden",
    marginTop: 5,
    shadowColor: COLORS.royal,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 3,
  },

  primaryButtonGradient: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    paddingHorizontal: 15,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  primaryButtonPressed: {
    opacity: 0.85,
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  // SECURITY

  securityFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    marginTop: 23,
    paddingTop: 18,
  },

  securityText: {
    color: COLORS.silver,
    fontSize: 9,
    fontWeight: "600",
  },

  // LOGIN

  loginLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 10,
  },

  loginLinkText: {
    color: COLORS.royal,
    fontSize: 11,
    fontWeight: "900",
  },

  // FOOTER

  footer: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },

  footerLine: {
    width: 42,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.royal,
    opacity: 0.35,
    marginBottom: 17,
  },

  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  footerBrandText: {
    color: COLORS.midnight,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footerText: {
    color: COLORS.silver,
    fontSize: 10,
    marginTop: 7,
  },

  footerCopyright: {
    color: "#B0BAC9",
    fontSize: 9,
    marginTop: 8,
  },
});

import { useState, useRef, useCallback, useEffect } from "react";
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
  Keyboard,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { loginCustomer } from "../../src/services/auth.service";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#1E3A8A",
  primaryMid: "#1E40AF",
  primaryBright: "#2563EB",
  primaryGlow: "#3B82F6",
  primarySoft: "#EFF6FF",
  primaryRing: "#DBEAFE",

  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  bgTint: "#F1F5FB",

  border: "#E5E9F0",
  borderFocus: "#2563EB",

  text: "#0F172A",
  textMuted: "#64748B",
  textSoft: "#94A3B8",
  textOnDark: "#FFFFFF",
  textOnDarkSoft: "rgba(255,255,255,0.75)",

  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",

  white: "#FFFFFF",
};

const INPUT_HEIGHT = 56;
const HERO_HEIGHT = height * 0.42;

function FadeInOnser({ delay = 0, offset = 20, duration = 650, style, children }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
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
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offset, 0],
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

function ScaleIn({ delay = 0, duration = 500, style, children }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 1],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
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

function FloatingOrb({ size, startX, startY, color, duration, delay }) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: startX,
          top: startY,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const emailFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const animateFocus = (value, toValue) => {
    Animated.timing(value, {
      toValue,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const handleEmailFocus = () => {
    setIsEmailFocused(true);
    animateFocus(emailFocus, 1);
  };
  const handleEmailBlur = () => {
    setIsEmailFocused(false);
    animateFocus(emailFocus, 0);
  };
  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
    animateFocus(passwordFocus, 1);
  };
  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
    animateFocus(passwordFocus, 0);
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handleLogin = useCallback(async () => {
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
  }, [email, password]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.hero}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryMid, COLORS.primaryBright]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <FloatingOrb
              size={150}
              startX={-50}
              startY={-40}
              color="rgba(255,255,255,0.08)"
              duration={3800}
              delay={0}
            />
            <FloatingOrb
              size={110}
              startX={width - 120}
              startY={30}
              color="rgba(255,255,255,0.1)"
              duration={4200}
              delay={400}
            />
            <FloatingOrb
              size={70}
              startX={width * 0.5}
              startY={-20}
              color="rgba(96,165,250,0.4)"
              duration={3400}
              delay={800}
            />

            <View style={styles.heroCurve} pointerEvents="none" />

            <FadeInOnser delay={0} offset={8}>
              <Pressable
                style={styles.back}
                onPress={() => router.replace("/")}
                hitSlop={12}
              >
                <View style={styles.backCircle}>
                  <Ionicons name="arrow-back" size={20} color={COLORS.white} />
                </View>
              </Pressable>
            </FadeInOnser>

            <FadeInOnser delay={120} offset={22}>
              <View style={styles.heroContent}>
                <View style={styles.brandRow}>
                  <ScaleIn delay={180} duration={500}>
                    <View style={styles.brandIcon}>
                      <Ionicons
                        name="ticket"
                        size={22}
                        color={COLORS.primaryBright}
                      />
                    </View>
                  </ScaleIn>
                  <Text style={styles.brandText}>TicketVerse</Text>
                </View>

                <Text style={styles.heroTitle}>Selamat datang kembali</Text>
                <Text style={styles.heroSubtitle}>
                  Masuk untuk melanjutkan perjalanan event-mu.
                </Text>
              </View>
            </FadeInOnser>
          </View>

          <View style={styles.cardWrap}>
            <FadeInOnser delay={220} offset={40} duration={720}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Masuk</Text>
                  <View style={styles.secureBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={12}
                      color={COLORS.primaryBright}
                    />
                    <Text style={styles.secureText}>Aman</Text>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <Animated.View
                    style={[
                      styles.inputWrapper,
                      {
                        borderColor: emailFocus.interpolate({
                          inputRange: [0, 1],
                          outputRange: [COLORS.border, COLORS.borderFocus],
                        }),
                        backgroundColor: emailFocus.interpolate({
                          inputRange: [0, 1],
                          outputRange: [COLORS.bgSoft, COLORS.white],
                        }),
                      },
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={
                        isEmailFocused ? COLORS.primaryMid : COLORS.textSoft
                      }
                    />
                    <TextInput
                      ref={emailRef}
                      style={styles.input}
                      placeholder="nama@email.com"
                      placeholderTextColor={COLORS.textSoft}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={handleEmailFocus}
                      onBlur={handleEmailBlur}
                      selectionColor={COLORS.primaryMid}
                      cursorColor={COLORS.primaryMid}
                      underlineColorAndroid="transparent"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      autoComplete="email"
                      textContentType="emailAddress"
                      importantForAutofill="no"
                      allowFontScaling={false}
                      testID="login-email-input"
                    />
                  </Animated.View>
                </View>

                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Password</Text>
                    <Pressable
                      onPress={() => router.push("/(auth)/forgot-password")}
                      hitSlop={8}
                    >
                      <Text style={styles.labelLink}>Lupa?</Text>
                    </Pressable>
                  </View>
                  <Animated.View
                    style={[
                      styles.inputWrapper,
                      {
                        borderColor: passwordFocus.interpolate({
                          inputRange: [0, 1],
                          outputRange: [COLORS.border, COLORS.borderFocus],
                        }),
                        backgroundColor: passwordFocus.interpolate({
                          inputRange: [0, 1],
                          outputRange: [COLORS.bgSoft, COLORS.white],
                        }),
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={
                        isPasswordFocused ? COLORS.primaryMid : COLORS.textSoft
                      }
                    />
                    <TextInput
                      ref={passwordRef}
                      style={styles.input}
                      placeholder="Masukkan password"
                      placeholderTextColor={COLORS.textSoft}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={handlePasswordFocus}
                      onBlur={handlePasswordBlur}
                      selectionColor={COLORS.primaryMid}
                      cursorColor={COLORS.primaryMid}
                      underlineColorAndroid="transparent"
                      returnKeyType="done"
                      blurOnSubmit={false}
                      onSubmitEditing={handleLogin}
                      autoComplete="password"
                      textContentType="password"
                      importantForAutofill="no"
                      allowFontScaling={false}
                      testID="login-password-input"
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={12}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={COLORS.textSoft}
                      />
                    </Pressable>
                  </Animated.View>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={COLORS.danger}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <Pressable
                    onPress={handleLogin}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={
                        loading
                          ? ["#93C5FD", "#60A5FA"]
                          : [
                              COLORS.primaryMid,
                              COLORS.primaryBright,
                              COLORS.primaryGlow,
                            ]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Masuk</Text>
                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={COLORS.white}
                          />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>atau</Text>
                  <View style={styles.divider} />
                </View>

                <Pressable
                  onPress={() => router.push("/(auth)/register")}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.secondaryText}>
                    Belum punya akun?{" "}
                    <Text style={styles.secondaryLink}>Daftar</Text>
                  </Text>
                </Pressable>
              </View>
            </FadeInOnser>
          </View>

          <FadeInOnser delay={420} offset={12}>
            <View style={styles.trustRow}>
              <Ionicons
                name="lock-closed"
                size={11}
                color={COLORS.textSoft}
              />
              <Text style={styles.trustText}>
                Data kamu terenkripsi & aman
              </Text>
            </View>
            <Text style={styles.copyright}>© 2026 TicketVerse</Text>
          </FadeInOnser>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },

  hero: {
    height: HERO_HEIGHT,
    minHeight: 260,
    paddingHorizontal: 24,
    paddingTop: 52,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    position: "relative",
  },
  heroCurve: {
    position: "absolute",
    bottom: -30,
    left: -40,
    right: -40,
    height: 60,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  orb: {
    position: "absolute",
  },

  back: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    marginTop: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.6,
    lineHeight: 32,
    maxWidth: 280,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: COLORS.textOnDarkSoft,
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 300,
    fontWeight: "500",
  },

  cardWrap: {
    marginTop: -36,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryMid,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
  },
  secureText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primaryBright,
    letterSpacing: 0.3,
  },

  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  labelLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryBright,
  },

  inputWrapper: {
    height: INPUT_HEIGHT,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    height: INPUT_HEIGHT,
    marginLeft: 10,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 14,
    borderRadius: 10,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
    marginLeft: 8,
  },

  button: {
    height: INPUT_HEIGHT,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    shadowColor: COLORS.primaryMid,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.textSoft,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  secondaryButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bgSoft,
  },
  secondaryText: {
    fontSize: 13.5,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  secondaryLink: {
    color: COLORS.primaryBright,
    fontWeight: "800",
  },

  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  trustText: {
    fontSize: 11,
    color: COLORS.textSoft,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  copyright: {
    fontSize: 11,
    color: COLORS.textSoft,
    textAlign: "center",
    marginTop: 12,
    letterSpacing: 0.3,
  },
});
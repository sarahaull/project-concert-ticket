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

const PREMIUM = {
  midnight: "#0B132B",
  midnightLight: "#1C2541",
  royal: "#2563EB",
  royalGlow: "#3B82F6",
  royalLight: "#EFF6FF",
  violet: "#7C3AED",
  cyan: "#06B6D4",
  gold: "#F59E0B",
  platinum: "#F8FAFC",
  silver: "#94A3B8",
  silverLight: "#E2E8F0",
  charcoal: "#1E293B",
  danger: "#DC2626",
  success: "#10B981",
  warning: "#F59E0B",
  white: "#FFFFFF",
};

function Float({ amplitude = 6, rotate = 0, duration = 2400, style, children }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`${-rotate}deg`, `${rotate}deg`] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Pulse({ style, minScale = 0.95, maxScale = 1.1, duration = 3000, children }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [minScale, maxScale] }) },
          ],
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

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
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Shimmer({ style }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          transform: [
            {
              translateX: v.interpolate({
                inputRange: [0, 1],
                outputRange: [-200, 400],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: 100, height: "100%" }}
      />
    </Animated.View>
  );
}

function TwinkleStar({ top, left, size, delay, color }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: 1400,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.9] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }],
      }}
    />
  );
}

function AuroraOrb({ style, colors, duration = 8000, offsetX = 40, offsetY = 30 }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, offsetX] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -offsetY] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: 999 }}
      />
    </Animated.View>
  );
}

function FallingTicket({ delay, startX, duration, size, rotationDir }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();

    const fall = Animated.loop(
      Animated.timing(translateY, {
        toValue: height + 100,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const spin = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration * 1.5,
        delay,
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
          opacity: opacityAnim,
          transform: [{ translateY }, { rotate: spin }],
        },
      ]}
    >
      <Ionicons name="ticket" size={size} color="rgba(37, 99, 235, 0.14)" />
    </Animated.View>
  );
}

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: PREMIUM.silverLight };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: "Lemah", color: PREMIUM.danger };
    if (score <= 3) return { level: 2, label: "Sedang", color: PREMIUM.warning };
    return { level: 3, label: "Kuat", color: PREMIUM.success };
  };

  const strength = getStrength();
  if (!password) return null;

  return (
    <View style={styles.strengthRow}>
      <View style={styles.strengthBars}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              {
                backgroundColor: i <= strength.level ? strength.color : PREMIUM.silverLight,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
    </View>
  );
}

function FieldLabel({ icon, label, required }) {
  return (
    <View style={styles.labelRow}>
      <View style={styles.labelIconBox}>
        <Ionicons name={icon} size={11} color={PREMIUM.royal} />
      </View>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.labelRequired}> *</Text> : null}
      </Text>
    </View>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle" size={12} color={PREMIUM.danger} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});

  const scaleValue = useRef(new Animated.Value(1)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(lineAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const lineWidth = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 110],
  });

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const next = {};

    if (!form.fullname.trim()) next.fullname = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) next.email = "Email wajib diisi.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Format email tidak valid.";

    if (!form.password) next.password = "Password wajib diisi.";
    else if (form.password.length < 6) next.password = "Password minimal 6 karakter.";

    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Konfirmasi password tidak sama.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

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

  const emailValid = form.email.length > 0 && /^\S+@\S+\.\S+$/.test(form.email);
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AuroraOrb
          style={styles.aurora1}
          colors={["rgba(37,99,235,0.30)", "rgba(124,58,237,0.12)", "transparent"]}
          duration={9000}
        />
        <AuroraOrb
          style={styles.aurora2}
          colors={["rgba(6,182,212,0.22)", "rgba(37,99,235,0.12)", "transparent"]}
          duration={11000}
          offsetX={-30}
          offsetY={40}
        />
        <AuroraOrb
          style={styles.aurora3}
          colors={["rgba(245,158,11,0.12)", "rgba(124,58,237,0.08)", "transparent"]}
          duration={13000}
          offsetX={20}
          offsetY={-20}
        />
      </View>

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <TwinkleStar top={80} left={width * 0.15} size={3} delay={0} color={PREMIUM.royal} />
        <TwinkleStar top={160} left={width * 0.8} size={4} delay={600} color={PREMIUM.cyan} />
        <TwinkleStar top={300} left={width * 0.25} size={2} delay={1100} color={PREMIUM.violet} />
        <TwinkleStar top={480} left={width * 0.7} size={3} delay={1800} color={PREMIUM.royal} />
      </View>

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <FallingTicket delay={0} startX={width * 0.1} duration={7000} size={30} rotationDir="right" />
        <FallingTicket delay={1500} startX={width * 0.8} duration={9000} size={40} rotationDir="left" />
        <FallingTicket delay={3000} startX={width * 0.4} duration={8000} size={25} rotationDir="right" />
        <FallingTicket delay={5000} startX={width * 0.7} duration={10000} size={35} rotationDir="left" />
        <FallingTicket delay={2000} startX={width * 0.2} duration={8500} size={20} rotationDir="right" />
      </View>

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
              <View style={styles.backIconBox}>
                <Ionicons name="arrow-back" size={20} color={PREMIUM.midnight} />
              </View>
              <Text style={styles.backText}>Kembali</Text>
            </Pressable>
          </Reveal>

          <Reveal delay={200} style={styles.headerContainer}>
            <View style={styles.logoWrapper}>
              <Pulse duration={2600} minScale={1} maxScale={1.15} style={styles.logoPulseRing} />
              <Float amplitude={4} rotate={0} duration={3000} style={styles.logoFloatBadge}>
                <View style={styles.logoBadgeIcon}>
                  <Ionicons name="star" size={11} color={PREMIUM.gold} />
                </View>
              </Float>
              <LinearGradient colors={[PREMIUM.midnight, PREMIUM.royal]} style={styles.logo}>
                <Ionicons name="person-add" size={26} color={PREMIUM.white} />
              </LinearGradient>
            </View>

            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>JOIN THE COMMUNITY</Text>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Animated.View style={[styles.titleLine, { width: lineWidth }]} />
            <Text style={styles.subtitle}>
              Daftar dan temukan pengalaman event terbaik bersama TicketVerse.
            </Text>
          </Reveal>

          <Reveal delay={250} style={styles.formCardWrapper}>
            <View style={styles.formCard}>
              <LinearGradient
                colors={[PREMIUM.royal, PREMIUM.violet, PREMIUM.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.formCardTopBorder}
              />

              <View style={styles.form}>
                <Reveal delay={300}>
                  <View style={styles.fieldWrapper}>
                    <FieldLabel icon="person" label="Nama Lengkap" required />
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === "fullname" && styles.inputWrapperFocused,
                        errors.fullname && styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={19}
                        color={focusedInput === "fullname" ? PREMIUM.royal : PREMIUM.silver}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Masukkan nama lengkap"
                        placeholderTextColor={PREMIUM.silver}
                        value={form.fullname}
                        onChangeText={(v) => updateField("fullname", v)}
                        onFocus={() => setFocusedInput("fullname")}
                        onBlur={() => setFocusedInput(null)}
                        autoCorrect={false}
                      />
                    </View>
                    <FieldError message={errors.fullname} />
                  </View>
                </Reveal>

                <Reveal delay={340}>
                  <View style={styles.fieldWrapper}>
                    <FieldLabel icon="at" label="Username" />
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === "username" && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="at-outline"
                        size={19}
                        color={focusedInput === "username" ? PREMIUM.royal : PREMIUM.silver}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Masukkan username"
                        placeholderTextColor={PREMIUM.silver}
                        value={form.username}
                        onChangeText={(v) => updateField("username", v)}
                        autoCapitalize="none"
                        onFocus={() => setFocusedInput("username")}
                        onBlur={() => setFocusedInput(null)}
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                </Reveal>

                <Reveal delay={380}>
                  <View style={styles.fieldWrapper}>
                    <FieldLabel icon="mail" label="Email" required />
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === "email" && styles.inputWrapperFocused,
                        errors.email && styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={19}
                        color={focusedInput === "email" ? PREMIUM.royal : PREMIUM.silver}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="nama@email.com"
                        placeholderTextColor={PREMIUM.silver}
                        value={form.email}
                        onChangeText={(v) => updateField("email", v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        autoCorrect={false}
                      />
                      {emailValid ? (
                        <Ionicons name="checkmark-circle" size={19} color={PREMIUM.success} />
                      ) : null}
                    </View>
                    <FieldError message={errors.email} />
                  </View>
                </Reveal>

                <Reveal delay={420}>
                  <View style={styles.fieldWrapper}>
                    <FieldLabel icon="call" label="Nomor Telepon" />
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === "phone" && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="call-outline"
                        size={19}
                        color={focusedInput === "phone" ? PREMIUM.royal : PREMIUM.silver}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Masukkan nomor telepon"
                        placeholderTextColor={PREMIUM.silver}
                        value={form.phone}
                        onChangeText={(v) => updateField("phone", v)}
                        keyboardType="phone-pad"
                        onFocus={() => setFocusedInput("phone")}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>
                </Reveal>

                <Reveal delay={460}>
                  <View style={styles.fieldWrapper}>
                    <FieldLabel icon="lock" label="Password" required />
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === "password" && styles.inputWrapperFocused,
                        errors.password && styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={19}
                        color={focusedInput === "password" ? PREMIUM.royal : PREMIUM.silver}
                      />
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
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={PREMIUM.silver}
                        />
                      </Pressable>
                    </View>
                    <PasswordStrength password={form.password} />
                    <FieldError message={errors.password} />
                  </View>
                </Reveal>

                <Reveal delay={500}>
                  <View style={styles.fieldWrapper}>
                    <FieldLabel icon="shield-checkmark" label="Konfirmasi Password" required />
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === "confirmPassword" && styles.inputWrapperFocused,
                        errors.confirmPassword && styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={19}
                        color={focusedInput === "confirmPassword" ? PREMIUM.royal : PREMIUM.silver}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Ulangi password"
                        placeholderTextColor={PREMIUM.silver}
                        value={form.confirmPassword}
                        onChangeText={(v) => updateField("confirmPassword", v)}
                        secureTextEntry={!showConfirmPassword}
                        onFocus={() => setFocusedInput("confirmPassword")}
                        onBlur={() => setFocusedInput(null)}
                      />
                      {passwordsMatch ? (
                        <Ionicons name="checkmark-circle" size={19} color={PREMIUM.success} />
                      ) : null}
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                          name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={PREMIUM.silver}
                        />
                      </Pressable>
                    </View>
                    <FieldError message={errors.confirmPassword} />
                  </View>
                </Reveal>

                <Reveal delay={560}>
                  <View style={styles.termsRow}>
                    <View style={styles.termsIconBox}>
                      <Ionicons name="information-circle" size={14} color={PREMIUM.royal} />
                    </View>
                    <Text style={styles.termsText}>
                      Dengan mendaftar, kamu menyetujui{" "}
                      <Text style={styles.termsLink}>Syarat & Ketentuan</Text> serta{" "}
                      <Text style={styles.termsLink}>Kebijakan Privasi</Text> TicketVerse.
                    </Text>
                  </View>
                </Reveal>

                <Reveal delay={620}>
                  <Animated.View style={{ transform: [{ scale: scaleValue }], marginTop: 24 }}>
                    <Pressable
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={loading ? ["#94A3B8", "#64748B"] : [PREMIUM.midnight, PREMIUM.royal]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                      >
                        {!loading && (
                          <View style={styles.shimmerContainer}>
                            <Shimmer />
                          </View>
                        )}
                        {loading ? (
                          <ActivityIndicator color={PREMIUM.white} />
                        ) : (
                          <>
                            <Text style={styles.buttonText}>Buat Akun</Text>
                            <View style={styles.buttonArrow}>
                              <Ionicons name="arrow-forward" size={16} color={PREMIUM.royal} />
                            </View>
                          </>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                </Reveal>
              </View>
            </View>
          </Reveal>

          <Reveal delay={720} style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <View style={styles.loginLinkWrapper}>
                <Text style={styles.loginLink}>Masuk</Text>
                <Ionicons name="arrow-forward" size={13} color={PREMIUM.royal} />
              </View>
            </Pressable>
          </Reveal>

          <Reveal delay={780}>
            <View style={styles.footerRow}>
              <Ionicons name="shield-checkmark" size={12} color={PREMIUM.silver} />
              <Text style={styles.footer}>2026 TicketVerse. All rights reserved.</Text>
            </View>
          </Reveal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.platinum },
  content: { flexGrow: 1, padding: 24, paddingTop: 50, paddingBottom: 40 },

  aurora1: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 999,
    opacity: 0.6,
  },
  aurora2: {
    position: "absolute",
    top: 400,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 999,
    opacity: 0.5,
  },
  aurora3: {
    position: "absolute",
    bottom: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 999,
    opacity: 0.4,
  },

  fallingTicket: {
    position: "absolute",
    top: -100,
    zIndex: 0,
  },

  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  backText: {
    color: PREMIUM.midnight,
    fontWeight: "800",
    fontSize: 13,
  },

  headerContainer: { marginBottom: 28 },
  logoWrapper: {
    position: "relative",
    width: 72,
    height: 72,
    marginBottom: 22,
  },
  logoPulseRing: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: PREMIUM.royal,
    opacity: 0.15,
  },
  logoFloatBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    zIndex: 5,
  },
  logoBadgeIcon: {
    backgroundColor: PREMIUM.white,
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    shadowColor: PREMIUM.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PREMIUM.royal,
  },
  eyebrow: {
    color: PREMIUM.royal,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.2,
  },

  title: {
    fontSize: 32,
    color: PREMIUM.midnight,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 38,
  },
  titleLine: {
    height: 3,
    borderRadius: 2,
    backgroundColor: PREMIUM.royal,
    marginTop: 12,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: PREMIUM.silver,
    fontWeight: "500",
  },

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
    overflow: "hidden",
    position: "relative",
  },
  formCardTopBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  form: { marginTop: 12 },

  fieldWrapper: { marginTop: 16 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  labelIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: PREMIUM.royalLight,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: PREMIUM.midnight,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  labelRequired: {
    color: PREMIUM.danger,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: PREMIUM.danger,
    backgroundColor: "#FEF2F2",
  },
  input: {
    flex: 1,
    color: PREMIUM.midnight,
    fontSize: 14,
    outlineStyle: "none",
    fontWeight: "600",
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  errorText: {
    color: PREMIUM.danger,
    fontSize: 11,
    fontWeight: "600",
  },

  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  strengthBars: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 22,
    padding: 14,
    backgroundColor: PREMIUM.royalLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  termsIconBox: {
    marginTop: 1,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: PREMIUM.charcoal,
    fontWeight: "500",
  },
  termsLink: {
    color: PREMIUM.royal,
    fontWeight: "900",
  },

  button: {
    height: 58,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
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
  buttonArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderRadius: 16,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    zIndex: 2,
  },
  loginText: {
    color: PREMIUM.silver,
    fontSize: 13,
    fontWeight: "500",
  },
  loginLinkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loginLink: {
    color: PREMIUM.royal,
    fontWeight: "900",
    fontSize: 13,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 32,
    zIndex: 2,
  },
  footer: {
    color: PREMIUM.silver,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
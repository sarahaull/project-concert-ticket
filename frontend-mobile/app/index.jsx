import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  Platform,
  Easing,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");
const IS_LOGGED_IN = false;

const SCREEN_WIDTH = width || 375;
const CARD_WIDTH = SCREEN_WIDTH * 0.78;
const NOTCH_SIZE = 24;

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
  success: "#10B981",
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
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
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

function ScalePressable({ onPress, style, scaleTo = 0.96, children }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) =>
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable onPress={onPress} onPressIn={() => animateTo(scaleTo)} onPressOut={() => animateTo(1)}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

function Reveal({ delay = 0, distance = 30, style, children }) {
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
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
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
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) },
        ],
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
        toValue: (height || 800) + 100,
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
      <Ionicons name="ticket" size={size} color="rgba(59, 130, 246, 0.18)" />
    </Animated.View>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(lineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const widthInterpolate = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 72],
  });

  return (
    <Reveal delay={200}>
      <View style={styles.sectionHeaderBox}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowIconBox}>
            <Ionicons name="sparkles" size={12} color={PREMIUM.royal} />
          </View>
          <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Animated.View style={[styles.eyebrowLine, { width: widthInterpolate }]} />
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </Reveal>
  );
}

function TicketCard({ title, price, type, imageUrl, color, stock, onPress }) {
  return (
    <ScalePressable onPress={onPress} scaleTo={0.96}>
      <View style={styles.ticketCardWrapper}>
        <LinearGradient
          colors={color}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ticketTopSection}
        >
          <Image source={{ uri: imageUrl }} style={styles.ticketImage} />
          <LinearGradient
            colors={["transparent", "rgba(11,19,43,0.92)"]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.ticketTopContent}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketTypeBadge}>
                <Ionicons name="star" size={9} color={PREMIUM.gold} />
                <Text style={styles.ticketType}>{type}</Text>
              </View>
              <View style={styles.ticketDotWrapper}>
                <Pulse duration={1500} minScale={0.6} maxScale={1.2}>
                  <View style={styles.ticketDot} />
                </Pulse>
              </View>
            </View>
            <View>
              <Text style={styles.ticketTitle} numberOfLines={2}>
                {title}
              </Text>
              <View style={styles.stockBadge}>
                <Ionicons name="flame" size={10} color={PREMIUM.gold} />
                <Text style={styles.stockText}>{stock} tiket tersisa</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.ticketDividerWrapper}>
          <View style={styles.dashedLine} />
          <View style={[styles.notch, { left: -NOTCH_SIZE / 2 }]} />
          <View style={[styles.notch, { right: -NOTCH_SIZE / 2 }]} />
        </View>

        <View style={styles.ticketBottomSection}>
          <View style={styles.ticketFooter}>
            <View>
              <Text style={styles.priceLabel}>Harga Tiket</Text>
              <Text style={styles.ticketPrice}>{price}</Text>
            </View>
            <View style={styles.btnPesan}>
              <Text style={styles.btnPesanText}>Pesan</Text>
              <Ionicons name="arrow-forward" size={14} color={PREMIUM.midnight} />
            </View>
          </View>

          <View style={styles.barcodeContainer}>
            {[1, 2, 1, 4, 1, 2, 1, 3, 1, 2, 1].map((w, i) => (
              <View key={i} style={[styles.barcodeLine, { width: w }]} />
            ))}
            <Text style={styles.barcodeText}>TV-VIP-001</Text>
          </View>
        </View>
      </View>
    </ScalePressable>
  );
}

function SeatRow({ count, color, size = 8 }) {
  const seats = Array.from({ length: count });
  return (
    <View style={styles.seatRow}>
      {seats.map((_, i) => (
        <View
          key={i}
          style={[
            styles.seatUnit,
            {
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size / 3,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function LandingPage() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navBackgroundColor = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: ["rgba(248, 250, 252, 0.6)", "rgba(11, 19, 43, 0.98)"],
    extrapolate: "clamp",
  });

  const textColor = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [PREMIUM.midnight, PREMIUM.white],
    extrapolate: "clamp",
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -60],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [1, 0.92],
    extrapolate: "clamp",
  });

  const handlePesanTiket = () => {
    if (!IS_LOGGED_IN) {
      setShowAuthModal(true);
    } else {
      router.push("/events");
    }
  };

  const handleLoginNavigation = () => {
    setShowAuthModal(false);
    setTimeout(() => router.push("/(auth)/login"), 200);
  };

  const handleRegisterNavigation = () => {
    setShowAuthModal(false);
    setTimeout(() => router.push("/(auth)/register"), 200);
  };

  const steps = [
    {
      icon: "search",
      n: "01",
      t: "Pilih Event",
      d: "Jelajahi daftar konser atau festival yang tersedia dan temukan yang paling kamu suka.",
      last: false,
    },
    {
      icon: "ticket",
      n: "02",
      t: "Pilih Kursi & Bayar",
      d: "Tentukan kategori tiket atau posisi duduk terbaikmu, lalu selesaikan pembayaran dengan aman.",
      last: false,
    },
    {
      icon: "qr-code",
      n: "03",
      t: "Dapatkan E-Ticket",
      d: "E-Ticket dan barcode akan langsung dikirimkan. Tunjukkan saat di pintu masuk venue.",
      last: true,
    },
  ];

  const stats = [
    { icon: "calendar", value: "120+", label: "Event Aktif" },
    { icon: "people", value: "50K+", label: "Pengguna" },
    { icon: "star", value: "4.9", label: "Rating" },
  ];

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AuroraOrb
          style={styles.aurora1}
          colors={["rgba(37,99,235,0.35)", "rgba(124,58,237,0.15)", "transparent"]}
          duration={9000}
        />
        <AuroraOrb
          style={styles.aurora2}
          colors={["rgba(6,182,212,0.25)", "rgba(37,99,235,0.15)", "transparent"]}
          duration={11000}
          offsetX={-30}
          offsetY={40}
        />
        <AuroraOrb
          style={styles.aurora3}
          colors={["rgba(245,158,11,0.15)", "rgba(124,58,237,0.1)", "transparent"]}
          duration={13000}
          offsetX={20}
          offsetY={-20}
        />
        <AuroraOrb
          style={styles.aurora4}
          colors={["rgba(37,99,235,0.18)", "rgba(6,182,212,0.12)", "transparent"]}
          duration={15000}
          offsetX={50}
          offsetY={-40}
        />
      </View>

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <FallingTicket delay={0} startX={SCREEN_WIDTH * 0.1} duration={6000} size={35} rotationDir="right" />
        <FallingTicket delay={1000} startX={SCREEN_WIDTH * 0.8} duration={8000} size={45} rotationDir="left" />
        <FallingTicket delay={2500} startX={SCREEN_WIDTH * 0.4} duration={7000} size={30} rotationDir="right" />
        <FallingTicket delay={4000} startX={SCREEN_WIDTH * 0.6} duration={9000} size={40} rotationDir="left" />
        <FallingTicket delay={5500} startX={SCREEN_WIDTH * 0.2} duration={6500} size={25} rotationDir="right" />
      </View>

      <Animated.View style={[styles.navbarWrapper, { backgroundColor: navBackgroundColor }]}>
        <View style={styles.navbar}>
          <View style={styles.brand}>
            <View style={styles.logoContainer}>
              <Float
                amplitude={3}
                rotate={-15}
                duration={3000}
                style={{ position: "absolute", top: -16, right: -10, zIndex: 5 }}
              >
                <View style={styles.ticketIconWrapper}>
                  <Ionicons name="ticket" size={16} color={PREMIUM.royal} />
                </View>
              </Float>
              <LinearGradient colors={[PREMIUM.midnight, PREMIUM.royal]} style={styles.logoGradient}>
                <Ionicons name="ticket" size={20} color={PREMIUM.white} />
              </LinearGradient>
            </View>
            <View>
              <Animated.Text style={[styles.brandText, { color: textColor }]}>TicketVerse</Animated.Text>
              <Animated.Text style={[styles.brandTagline, { color: textColor }]}>
                Premium Ticket Platform
              </Animated.Text>
            </View>
          </View>

          <ScalePressable onPress={() => router.push("/(auth)/login")}>
            <View style={styles.loginNav}>
              <View style={styles.shimmerContainer}>
                <Shimmer />
              </View>
              <Text style={styles.loginNavText}>Masuk</Text>
            </View>
          </ScalePressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ transform: [{ translateY: heroTranslateY }, { scale: heroScale }] }}>
          <Reveal delay={200} distance={40} style={styles.heroWrapper}>
            <LinearGradient
              colors={[PREMIUM.midnight, PREMIUM.midnightLight, "#2A3B6B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop",
                }}
                style={styles.heroBackgroundImage}
                blurRadius={4}
              />
              <LinearGradient
                colors={["rgba(11,19,43,0.55)", "rgba(11,19,43,0.85)", "rgba(37,99,235,0.5)"]}
                style={StyleSheet.absoluteFillObject}
              />

              <TwinkleStar top={30} left={40} size={3} delay={0} color="#ffffff" />
              <TwinkleStar top={80} left={200} size={4} delay={400} color="#93C5FD" />
              <TwinkleStar top={140} left={80} size={2} delay={800} color="#ffffff" />
              <TwinkleStar top={60} left={280} size={3} delay={1200} color="#FBBF24" />
              <TwinkleStar top={200} left={300} size={2} delay={600} color="#ffffff" />
              <TwinkleStar top={260} left={50} size={3} delay={1000} color="#93C5FD" />
              <TwinkleStar top={340} left={220} size={2} delay={1500} color="#ffffff" />
              <TwinkleStar top={120} left={150} size={2} delay={1800} color="#ffffff" />
              <TwinkleStar top={300} left={120} size={3} delay={700} color="#FBBF24" />

              <Float amplitude={10} rotate={5} duration={3200} style={styles.heroFloatIcon}>
                <Ionicons name="musical-notes" size={90} color="rgba(255,255,255,0.08)" />
              </Float>

              <Float amplitude={6} rotate={-8} duration={2800} style={styles.heroFloatIcon2}>
                <Ionicons name="headset" size={60} color="rgba(255,255,255,0.06)" />
              </Float>

              <View style={styles.heroContent}>
                <Reveal delay={400} distance={20}>
                  <View style={styles.badge}>
                    <Pulse duration={1800} minScale={0.6} maxScale={1}>
                      <View style={styles.badgeDot} />
                    </Pulse>
                    <Text style={styles.badgeText}>PREMIUM EXPERIENCE</Text>
                    <Ionicons name="sparkles" size={11} color="#93C5FD" />
                  </View>
                </Reveal>

                <Reveal delay={500} distance={20}>
                  <Text style={styles.heroTitle}>
                    Discover Your{"\n"}
                    <Text style={styles.heroHighlight}>Next Vibe.</Text>
                  </Text>
                </Reveal>

                <Reveal delay={600} distance={20}>
                  <Text style={styles.heroDescription}>
                    Temukan konser favoritmu, pesan tiket dengan mudah, dan ciptakan pengalaman yang tak
                    terlupakan.
                  </Text>
                </Reveal>

                <Reveal delay={700} distance={20}>
                  <ScalePressable onPress={handlePesanTiket} style={styles.primaryButton}>
                    <View style={styles.shimmerContainer}>
                      <Shimmer />
                    </View>
                    <Text style={styles.primaryButtonText}>Mulai Jelajahi</Text>
                    <View style={styles.arrowIcon}>
                      <Ionicons name="arrow-forward" size={16} color={PREMIUM.midnight} />
                    </View>
                  </ScalePressable>
                </Reveal>

                <Reveal delay={850} distance={20}>
                  <View style={styles.heroStats}>
                    {stats.map((s) => (
                      <View key={s.label} style={styles.heroStatItem}>
                        <Ionicons name={s.icon} size={14} color="#93C5FD" />
                        <View>
                          <Text style={styles.heroStatValue}>{s.value}</Text>
                          <Text style={styles.heroStatLabel}>{s.label}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </Reveal>
              </View>
            </LinearGradient>
          </Reveal>
        </Animated.View>

        <View style={styles.waveDivider}>
          <View style={styles.wave} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="TICKET SELECTION"
            title="Pilih Kategori Tiketmu"
            subtitle="Setiap kategori memberikan pengalaman konser yang berbeda."
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
          >
            <TicketCard
              title="VIP Front Row"
              price="Rp 1.500.000"
              type="VIP ACCESS"
              stock="12"
              imageUrl="https://images.unsplash.com/photo-1540039155732-684736882207?q=80&w=600&auto=format&fit=crop"
              color={["#0B132B", "#1C2541", "#2563EB"]}
              onPress={handlePesanTiket}
            />
            <TicketCard
              title="Festival Zone"
              price="Rp 750.000"
              type="FESTIVAL"
              stock="48"
              imageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop"
              color={["#0F172A", "#1E293B", "#475569"]}
              onPress={handlePesanTiket}
            />
            <TicketCard
              title="Regular Tier"
              price="Rp 350.000"
              type="REGULAR"
              stock="120"
              imageUrl="https://images.unsplash.com/photo-1470229722913-7c092beb2d50?q=80&w=600&auto=format&fit=crop"
              color={["#1E1B4B", "#312E81", "#4F46E5"]}
              onPress={handlePesanTiket}
            />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="SEAT INFORMATION"
            title="Denah Tempat Duduk"
            subtitle="Pilih posisi terbaikmu untuk pengalaman konser yang maksimal."
          />

          <Reveal delay={300} distance={30}>
            <LinearGradient
              colors={[PREMIUM.white, PREMIUM.royalLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.seatMapCard}
            >
              <View style={styles.stageWrapper}>
                <LinearGradient colors={[PREMIUM.midnight, PREMIUM.royal]} style={styles.stage}>
                  <Ionicons name="mic" size={14} color={PREMIUM.white} />
                  <Text style={styles.stageText}>STAGE / PANGGUNG</Text>
                </LinearGradient>
                <Pulse duration={2400} minScale={1} maxScale={1.4} style={styles.stageGlow} />
              </View>

              <View style={styles.seatArea}>
                <View style={styles.seatZoneBlock}>
                  <View style={styles.seatZoneLabelRow}>
                    <Ionicons name="star" size={10} color={PREMIUM.white} />
                    <Text style={styles.seatZoneLabel}>VIP FRONT ROW</Text>
                  </View>
                  <SeatRow count={12} color={PREMIUM.white} size={7} />
                </View>

                <View style={styles.seatZoneBlockFestival}>
                  <View style={styles.seatZoneLabelRow}>
                    <Ionicons name="people" size={10} color={PREMIUM.white} />
                    <Text style={styles.seatZoneLabel}>FESTIVAL</Text>
                  </View>
                  <SeatRow count={16} color={PREMIUM.white} size={6} />
                  <SeatRow count={16} color={PREMIUM.white} size={6} />
                </View>

                <View style={styles.seatZoneBlockRegular}>
                  <View style={styles.seatZoneLabelRow}>
                    <Ionicons name="ticket" size={10} color={PREMIUM.white} />
                    <Text style={styles.seatZoneLabel}>REGULAR</Text>
                  </View>
                  <SeatRow count={18} color={PREMIUM.white} size={5} />
                  <SeatRow count={18} color={PREMIUM.white} size={5} />
                  <SeatRow count={18} color={PREMIUM.white} size={5} />
                </View>
              </View>

              <View style={styles.seatLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: PREMIUM.royal }]} />
                  <Text style={styles.legendText}>VIP</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: PREMIUM.silver }]} />
                  <Text style={styles.legendText}>Festival</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: PREMIUM.midnightLight }]} />
                  <Text style={styles.legendText}>Regular</Text>
                </View>
              </View>
            </LinearGradient>
          </Reveal>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="HOW TO ORDER"
            title="Langkah Mudah Pesan Tiket"
            subtitle="Hanya tiga langkah untuk mendapatkan tiket konser impianmu."
          />

          <View style={styles.stepsContainer}>
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={300 + i * 100} distance={20}>
                <View style={styles.stepCard}>
                  <View style={styles.stepIconWrapper}>
                    <LinearGradient
                      colors={[PREMIUM.royal, PREMIUM.violet]}
                      style={styles.stepIconGradient}
                    >
                      <Ionicons name={s.icon} size={22} color={PREMIUM.white} />
                    </LinearGradient>
                    {!s.last && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepTextContent}>
                    <View style={styles.stepNumberRow}>
                      <Text style={styles.stepNumber}>{s.n}</Text>
                      <View style={styles.stepNumberLine} />
                    </View>
                    <Text style={styles.stepTitle}>{s.t}</Text>
                    <Text style={styles.stepDescription}>{s.d}</Text>
                  </View>
                </View>
              </Reveal>
            ))}
          </View>
        </View>

        <Reveal delay={300} distance={40}>
          <LinearGradient colors={[PREMIUM.white, PREMIUM.royalLight]} style={styles.bottomCta}>
            <View style={styles.ctaGlow} pointerEvents="none" />
            <View style={styles.ctaIconBox}>
              <LinearGradient
                colors={[PREMIUM.midnight, PREMIUM.royal]}
                style={styles.ctaIconGradient}
              >
                <Ionicons name="rocket" size={22} color={PREMIUM.white} />
              </LinearGradient>
            </View>
            <Text style={styles.bottomTitle}>Siap menemukan event berikutnya?</Text>
            <Text style={styles.bottomDescription}>
              Bergabung sekarang dan mulai pengalaman konsermu.
            </Text>

            <ScalePressable onPress={handlePesanTiket} style={styles.bottomButton}>
              <View style={styles.shimmerContainer}>
                <Shimmer />
              </View>
              <Text style={styles.bottomButtonText}>Daftar Sekarang</Text>
              <Ionicons name="arrow-forward" size={18} color={PREMIUM.white} />
            </ScalePressable>
          </LinearGradient>
        </Reveal>

        <Reveal delay={400}>
          <View style={styles.footerRow}>
            <Ionicons name="ticket" size={14} color={PREMIUM.silver} />
            <Text style={styles.copyright}>2026 TicketVerse. All rights reserved.</Text>
          </View>
        </Reveal>
      </Animated.ScrollView>

      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowAuthModal(false)} />

          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalIconCircle}>
              <LinearGradient
                colors={[PREMIUM.midnight, PREMIUM.royal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalIconGradient}
              >
                <Pulse duration={2000} minScale={0.9} maxScale={1.1}>
                  <Ionicons name="lock-closed" size={32} color={PREMIUM.white} />
                </Pulse>
              </LinearGradient>
            </View>

            <Text style={styles.modalTitle}>Akses Terbatas</Text>
            <Text style={styles.modalDescription}>
              Anda harus masuk atau mendaftar terlebih dahulu untuk memesan tiket dan mengakses fitur
              eksklusif TicketVerse.
            </Text>

            <View style={styles.modalFeatureList}>
              <View style={styles.modalFeatureItem}>
                <View style={styles.modalFeatureIcon}>
                  <Ionicons name="ticket" size={14} color={PREMIUM.royal} />
                </View>
                <Text style={styles.modalFeatureText}>Pesan tiket eksklusif</Text>
              </View>
              <View style={styles.modalFeatureItem}>
                <View style={styles.modalFeatureIcon}>
                  <Ionicons name="notifications" size={14} color={PREMIUM.royal} />
                </View>
                <Text style={styles.modalFeatureText}>Notifikasi event terbaru</Text>
              </View>
              <View style={styles.modalFeatureItem}>
                <View style={styles.modalFeatureIcon}>
                  <Ionicons name="heart" size={14} color={PREMIUM.royal} />
                </View>
                <Text style={styles.modalFeatureText}>Simpan event favorit</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <ScalePressable onPress={handleLoginNavigation} style={styles.modalLoginButton}>
                <LinearGradient
                  colors={[PREMIUM.midnight, PREMIUM.royal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalLoginGradient}
                >
                  <View style={styles.shimmerContainer}>
                    <Shimmer />
                  </View>
                  <Text style={styles.modalLoginText}>Masuk ke Akun</Text>
                  <Ionicons name="log-in-outline" size={18} color={PREMIUM.white} />
                </LinearGradient>
              </ScalePressable>

              <ScalePressable onPress={handleRegisterNavigation} style={styles.modalRegisterButton}>
                <Text style={styles.modalRegisterText}>Buat Akun Baru</Text>
                <Ionicons name="person-add-outline" size={16} color={PREMIUM.royal} />
              </ScalePressable>
            </View>

            <Pressable style={styles.modalCancel} onPress={() => setShowAuthModal(false)}>
              <Text style={styles.modalCancelText}>Nanti Saja</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.platinum },
  content: { paddingTop: 100, paddingBottom: 60, flexGrow: 1 },

  aurora1: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 999,
    opacity: 0.6,
  },
  aurora2: {
    position: "absolute",
    top: 200,
    right: -120,
    width: 300,
    height: 300,
    borderRadius: 999,
    opacity: 0.5,
  },
  aurora3: {
    position: "absolute",
    top: 500,
    left: 50,
    width: 250,
    height: 250,
    borderRadius: 999,
    opacity: 0.4,
  },
  aurora4: {
    position: "absolute",
    top: 900,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.35,
  },

  fallingTicket: {
    position: "absolute",
    top: -100,
    zIndex: 0,
  },

  navbarWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.2)",
  },
  navbar: {
    height: 80,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 40 : 0,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoContainer: {
    position: "relative",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  logoGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  ticketIconWrapper: {
    backgroundColor: PREMIUM.white,
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  brandText: { fontSize: 22, fontWeight: "900", letterSpacing: -0.8 },
  brandTagline: { fontSize: 9, fontWeight: "700", opacity: 0.7, letterSpacing: 0.6, marginTop: 2 },
  loginNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: PREMIUM.royal,
    borderRadius: 12,
    backgroundColor: PREMIUM.white,
    overflow: "hidden",
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  loginNavText: { color: PREMIUM.royal, fontWeight: "900", fontSize: 13 },

  heroWrapper: {
    marginHorizontal: 20,
    borderRadius: 32,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
  hero: {
    borderRadius: 32,
    padding: 28,
    minHeight: 500,
    overflow: "hidden",
    justifyContent: "center",
  },
  heroBackgroundImage: { ...StyleSheet.absoluteFillObject },
  heroFloatIcon: { position: "absolute", right: 20, top: 60 },
  heroFloatIcon2: { position: "absolute", right: 60, bottom: 80, opacity: 0.8 },
  heroContent: { zIndex: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    alignSelf: "flex-start",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#60A5FA" },
  badgeText: { color: PREMIUM.white, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heroTitle: {
    color: PREMIUM.white,
    fontSize: 46,
    lineHeight: 54,
    fontWeight: "900",
    letterSpacing: -1.5,
    textShadowColor: "rgba(59,130,246,0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  heroHighlight: { color: "#93C5FD" },
  heroDescription: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 18,
    maxWidth: "90%",
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: PREMIUM.white,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 32,
    overflow: "hidden",
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: { color: PREMIUM.midnight, fontWeight: "900", fontSize: 14 },
  arrowIcon: { backgroundColor: PREMIUM.royalLight, borderRadius: 20, padding: 6 },
  shimmerContainer: { ...StyleSheet.absoluteFillObject, overflow: "hidden", borderRadius: 16 },

  heroStats: {
    flexDirection: "row",
    marginTop: 32,
    gap: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  heroStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroStatValue: {
    color: PREMIUM.white,
    fontSize: 14,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "#93C5FD",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  waveDivider: { alignItems: "center", marginTop: 32, marginBottom: -10 },
  wave: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: PREMIUM.royal,
    opacity: 0.4,
  },

  section: { paddingTop: 48 },
  sectionHeaderBox: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  eyebrowIconBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: PREMIUM.royalLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionEyebrow: {
    color: PREMIUM.royal,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 2.5,
  },
  sectionTitle: {
    color: PREMIUM.midnight,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 34,
    letterSpacing: -0.8,
  },
  eyebrowLine: {
    height: 3,
    borderRadius: 2,
    backgroundColor: PREMIUM.royal,
    marginTop: 12,
    marginBottom: 12,
  },
  sectionSubtitle: {
    color: PREMIUM.silver,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },

  horizontalScrollContent: { paddingHorizontal: 24, paddingBottom: 20, gap: 16 },
  ticketCardWrapper: {
    width: CARD_WIDTH,
    backgroundColor: PREMIUM.white,
    borderRadius: 26,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  ticketTopSection: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
    height: 190,
  },
  ticketImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  ticketTopContent: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ticketType: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, color: PREMIUM.white },
  ticketDotWrapper: {
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
  },
  ticketDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  ticketTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: PREMIUM.white,
    letterSpacing: -0.8,
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  stockText: {
    color: PREMIUM.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  ticketDividerWrapper: {
    height: NOTCH_SIZE,
    position: "relative",
    justifyContent: "center",
    backgroundColor: PREMIUM.white,
    zIndex: 10,
  },
  dashedLine: {
    borderBottomWidth: 2,
    borderColor: PREMIUM.silverLight,
    borderStyle: "dashed",
    marginHorizontal: 16,
  },
  notch: {
    position: "absolute",
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    backgroundColor: PREMIUM.platinum,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    zIndex: 2,
  },
  ticketBottomSection: {
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: PREMIUM.white,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: PREMIUM.silver,
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  ticketPrice: { fontSize: 22, fontWeight: "900", color: PREMIUM.midnight },
  btnPesan: {
    backgroundColor: PREMIUM.royalLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  btnPesanText: { color: PREMIUM.midnight, fontWeight: "900", fontSize: 13 },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 3,
  },
  barcodeLine: { height: 20, backgroundColor: PREMIUM.silverLight, borderRadius: 1 },
  barcodeText: {
    marginLeft: "auto",
    color: PREMIUM.silver,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  seatMapCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    alignItems: "center",
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  stageWrapper: {
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  stage: {
    width: "80%",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 2,
  },
  stageText: { color: PREMIUM.white, fontWeight: "900", fontSize: 12, letterSpacing: 2 },
  stageGlow: {
    position: "absolute",
    bottom: -10,
    width: "60%",
    height: 20,
    backgroundColor: PREMIUM.royal,
    opacity: 0.4,
    borderRadius: 20,
    transform: [{ scaleX: 1.5 }],
  },
  seatArea: { width: "100%", alignItems: "center", gap: 14 },
  seatZoneBlock: {
    width: "70%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PREMIUM.royal,
    borderRadius: 14,
    alignItems: "center",
    gap: 10,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  seatZoneBlockFestival: {
    width: "85%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PREMIUM.silver,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
  },
  seatZoneBlockRegular: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PREMIUM.midnightLight,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
  },
  seatZoneLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  seatZoneLabel: {
    color: PREMIUM.white,
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  seatRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  seatUnit: {
    opacity: 0.85,
  },
  seatLegend: {
    flexDirection: "row",
    marginTop: 30,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontSize: 11,
    color: PREMIUM.silver,
    fontWeight: "700",
  },

  stepsContainer: { paddingHorizontal: 24, marginTop: 20, gap: 16 },
  stepCard: {
    flexDirection: "row",
    backgroundColor: PREMIUM.white,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  stepIconWrapper: { alignItems: "center", marginRight: 18 },
  stepIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: PREMIUM.royalLight,
    marginTop: 8,
    marginBottom: -32,
  },
  stepTextContent: { flex: 1, justifyContent: "center" },
  stepNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: "900",
    color: PREMIUM.royal,
    letterSpacing: 2,
  },
  stepNumberLine: {
    flex: 1,
    height: 1,
    backgroundColor: PREMIUM.royalLight,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: PREMIUM.midnight,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 12,
    color: PREMIUM.silver,
    lineHeight: 20,
    fontWeight: "500",
  },

  bottomCta: {
    marginHorizontal: 24,
    marginTop: 48,
    padding: 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    overflow: "hidden",
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: PREMIUM.royal,
    opacity: 0.1,
  },
  ctaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaIconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomTitle: {
    fontSize: 24,
    color: PREMIUM.midnight,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  bottomDescription: {
    color: PREMIUM.silver,
    fontSize: 14,
    marginTop: 10,
    lineHeight: 22,
    fontWeight: "500",
  },
  bottomButton: {
    backgroundColor: PREMIUM.midnight,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
    overflow: "hidden",
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomButtonText: { color: PREMIUM.white, fontWeight: "900", fontSize: 15 },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 40,
  },
  copyright: {
    color: PREMIUM.silver,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 19, 43, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: PREMIUM.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 44 : 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalDragHandle: {
    width: 45,
    height: 5,
    borderRadius: 3,
    backgroundColor: PREMIUM.silverLight,
    marginBottom: 24,
  },
  modalIconCircle: {
    marginBottom: 20,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  modalIconGradient: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: PREMIUM.midnight,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  modalDescription: {
    fontSize: 14,
    color: PREMIUM.silver,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  modalFeatureList: {
    width: "100%",
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  modalFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalFeatureIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: PREMIUM.royalLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFeatureText: {
    fontSize: 12,
    color: PREMIUM.charcoal,
    fontWeight: "600",
  },
  modalActions: { width: "100%", gap: 12 },
  modalLoginButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modalLoginGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 10,
  },
  modalLoginText: { color: PREMIUM.white, fontWeight: "900", fontSize: 15, letterSpacing: 0.3 },
  modalRegisterButton: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 16,
    backgroundColor: PREMIUM.royalLight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  modalRegisterText: { color: PREMIUM.royal, fontWeight: "900", fontSize: 15 },
  modalCancel: { marginTop: 20, paddingVertical: 10 },
  modalCancelText: { color: PREMIUM.silver, fontSize: 14, fontWeight: "700" },
});
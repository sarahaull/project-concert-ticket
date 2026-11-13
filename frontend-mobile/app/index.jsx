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

// Fallback width untuk berjaga-jaga jika dimensions 0 saat render awal
const SCREEN_WIDTH = width || 375;
const CARD_WIDTH = SCREEN_WIDTH * 0.78;
const NOTCH_SIZE = 24;

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
  success: "#059669",
  warning: "#D97706",
  white: "#FFFFFF",
};

/* ================= ANIMATION HELPERS ================= */

function Float({ amplitude = 6, rotate = 0, duration = 2400, style, children }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
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

function ScalePressable({ onPress, style, scaleTo = 0.96, children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue) =>
    Animated.spring(scale, { toValue, friction: 6, tension: 160, useNativeDriver: true }).start();

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
    const fall = Animated.loop(
      Animated.timing(translateY, {
        toValue: (height || 800) + 100,
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
      <Ionicons name="ticket" size={size} color="rgba(37, 99, 235, 0.15)" />
    </Animated.View>
  );
}

/* ================= MAIN SCREEN ================= */
export default function LandingPage() {
  const scrollY = useRef(new Animated.Value(0)).current;

  // State untuk Modal Login
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navBackgroundColor = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: ["rgba(248, 250, 252, 0.95)", "rgba(11, 19, 43, 0.98)"],
    extrapolate: "clamp",
  });

  const textColor = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [PREMIUM.midnight, PREMIUM.white],
    extrapolate: "clamp",
  });

  const handlePesanTiket = (ticketType) => {
    if (!IS_LOGGED_IN) {
      // Tampilkan Custom Modal alih-alih Alert
      setShowAuthModal(true);
    } else {
      router.push("/events");
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. FALLING TICKETS BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <FallingTicket delay={0} startX={SCREEN_WIDTH * 0.1} duration={6000} size={35} rotationDir="right" />
        <FallingTicket delay={1000} startX={SCREEN_WIDTH * 0.8} duration={8000} size={45} rotationDir="left" />
        <FallingTicket delay={2500} startX={SCREEN_WIDTH * 0.4} duration={7000} size={30} rotationDir="right" />
        <FallingTicket delay={4000} startX={SCREEN_WIDTH * 0.6} duration={9000} size={40} rotationDir="left" />
        <FallingTicket delay={5500} startX={SCREEN_WIDTH * 0.2} duration={6500} size={25} rotationDir="right" />
      </View>

      {/* 2. NAVBAR */}
      <Animated.View style={[styles.navbarWrapper, { backgroundColor: navBackgroundColor }]}>
        <View style={styles.navbar}>
          <View style={styles.brand}>
            <View style={styles.logoContainer}>
              <Animated.View style={styles.ticketEmergeWrapper}>
                <Float amplitude={3} rotate={-15} duration={3000}>
                  <View style={styles.ticketIconWrapper}>
                    <Ionicons name="ticket" size={16} color={PREMIUM.royal} />
                  </View>
                </Float>
              </Animated.View>

              <LinearGradient
                colors={[PREMIUM.midnight, PREMIUM.royal]}
                style={styles.logoGradient}
              >
                <Ionicons name="ticket" size={20} color={PREMIUM.white} />
              </LinearGradient>
            </View>
            <Animated.Text style={[styles.brandText, { color: textColor }]}>TicketVerse</Animated.Text>
          </View>

          <ScalePressable onPress={() => router.push("/(auth)/login")}>
            <View style={styles.loginNav}>
              <Text style={styles.loginNavText}>Masuk</Text>
            </View>
          </ScalePressable>
        </View>
      </Animated.View>

      {/* 3. SCROLL CONTENT */}
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
        {/* ================= HERO SECTION ================= */}
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
              colors={["rgba(11,19,43,0.6)", "rgba(11,19,43,0.85)", "rgba(37,99,235,0.4)"]}
              style={StyleSheet.absoluteFillObject}
            />

            <Float amplitude={10} rotate={5} duration={3200} style={styles.heroFloatIcon}>
              <Ionicons name="musical-notes" size={80} color="rgba(255,255,255,0.08)" />
            </Float>

            <View style={styles.heroContent}>
              <Reveal delay={400} distance={20}>
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>PREMIUM EXPERIENCE</Text>
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
                  Temukan konser favoritmu, pesan tiket dengan mudah, dan ciptakan pengalaman yang tak terlupakan.
                </Text>
              </Reveal>

              <Reveal delay={700} distance={20}>
                <ScalePressable
                  onPress={() => handlePesanTiket("Eksplorasi")}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Mulai Jelajahi</Text>
                  <View style={styles.arrowIcon}>
                    <Ionicons name="arrow-forward" size={16} color={PREMIUM.midnight} />
                  </View>
                </ScalePressable>
              </Reveal>
            </View>
          </LinearGradient>
        </Reveal>

        {/* ================= TICKET SELECTION ================= */}
        <View style={styles.section}>
          <Reveal delay={200} style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>TICKET SELECTION</Text>
              <Text style={styles.sectionTitle}>Pilih Kategori Tiketmu</Text>
            </View>
          </Reveal>

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
              imageUrl="https://images.unsplash.com/photo-1540039155732-684736882207?q=80&w=600&auto=format&fit=crop"
              color={["#0B132B", "#1C2541", "#2563EB"]}
              onPress={() => handlePesanTiket("VIP")}
            />
            <TicketCard
              title="Festival Zone"
              price="Rp 750.000"
              type="FESTIVAL"
              imageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop"
              color={["#0F172A", "#1E293B", "#475569"]}
              onPress={() => handlePesanTiket("Festival")}
            />
            <TicketCard
              title="Regular Tier"
              price="Rp 350.000"
              type="REGULAR"
              imageUrl="https://images.unsplash.com/photo-1470229722913-7c092beb2d50?q=80&w=600&auto=format&fit=crop"
              color={["#1E1B4B", "#312E81", "#4F46E5"]}
              onPress={() => handlePesanTiket("Regular")}
            />
          </ScrollView>
        </View>

        {/* ================= SEAT MAP SECTION ================= */}
        <View style={styles.section}>
          <Reveal delay={200}>
            <Text style={styles.sectionEyebrow}>SEAT INFORMATION</Text>
            <Text style={styles.sectionTitle}>Denah Tempat Duduk</Text>
            <Text style={styles.sectionSubtitle}>
              Pilih posisi terbaikmu untuk pengalaman konser yang maksimal.
            </Text>
          </Reveal>

          <Reveal delay={300} distance={30}>
            <LinearGradient
              colors={[PREMIUM.white, PREMIUM.royalLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.seatMapCard}
            >
              <View style={styles.stageWrapper}>
                <LinearGradient
                  colors={[PREMIUM.midnight, PREMIUM.midnightLight]}
                  style={styles.stage}
                >
                  <Text style={styles.stageText}>STAGE / PANGGUNG</Text>
                </LinearGradient>
                <View style={styles.stageGlow} />
              </View>

              <View style={styles.seatArea}>
                <View style={styles.seatZoneVip}>
                  <Text style={styles.seatZoneText}>VIP FRONT ROW</Text>
                </View>
                <View style={styles.seatZoneFestival}>
                  <Text style={styles.seatZoneText}>FESTIVAL</Text>
                </View>
                <View style={styles.seatZoneRegular}>
                  <Text style={styles.seatZoneText}>REGULAR</Text>
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

        {/* ================= HOW TO ORDER SECTION ================= */}
        <View style={styles.section}>
          <Reveal delay={200}>
            <Text style={styles.sectionEyebrow}>HOW TO ORDER</Text>
            <Text style={styles.sectionTitle}>Langkah Mudah Pesan Tiket</Text>
          </Reveal>

          <View style={styles.stepsContainer}>
            <Reveal delay={300} distance={20}>
              <View style={styles.stepCard}>
                <View style={styles.stepIconWrapper}>
                  <LinearGradient colors={[PREMIUM.royal, "#1D4ED8"]} style={styles.stepIconGradient}>
                    <Ionicons name="search" size={22} color={PREMIUM.white} />
                  </LinearGradient>
                  <View style={styles.stepLine} />
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepNumber}>01</Text>
                  <Text style={styles.stepTitle}>Pilih Event</Text>
                  <Text style={styles.stepDescription}>
                    Jelajahi daftar konser atau festival yang tersedia dan temukan yang paling kamu suka.
                  </Text>
                </View>
              </View>
            </Reveal>

            <Reveal delay={400} distance={20}>
              <View style={styles.stepCard}>
                <View style={styles.stepIconWrapper}>
                  <LinearGradient colors={[PREMIUM.royal, "#1D4ED8"]} style={styles.stepIconGradient}>
                    <Ionicons name="ticket" size={22} color={PREMIUM.white} />
                  </LinearGradient>
                  <View style={styles.stepLine} />
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepNumber}>02</Text>
                  <Text style={styles.stepTitle}>Pilih Kursi & Bayar</Text>
                  <Text style={styles.stepDescription}>
                    Tentukan kategori tiket atau posisi duduk terbaikmu, lalu selesaikan pembayaran dengan aman.
                  </Text>
                </View>
              </View>
            </Reveal>

            <Reveal delay={500} distance={20}>
              <View style={styles.stepCard}>
                <View style={styles.stepIconWrapper}>
                  <LinearGradient colors={[PREMIUM.royal, "#1D4ED8"]} style={styles.stepIconGradient}>
                    <Ionicons name="qr-code" size={22} color={PREMIUM.white} />
                  </LinearGradient>
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepNumber}>03</Text>
                  <Text style={styles.stepTitle}>Dapatkan E-Ticket</Text>
                  <Text style={styles.stepDescription}>
                    E-Ticket dan barcode akan langsung dikirimkan. Tunjukkan saat di pintu masuk venue.
                  </Text>
                </View>
              </View>
            </Reveal>
          </View>
        </View>

        {/* ================= BOTTOM CTA ================= */}
        <Reveal delay={300} distance={40}>
          <LinearGradient
            colors={[PREMIUM.white, PREMIUM.royalLight]}
            style={styles.bottomCta}
          >
            <Text style={styles.bottomTitle}>Siap menemukan event berikutnya?</Text>
            <Text style={styles.bottomDescription}>
              Bergabung sekarang dan mulai pengalaman konsermu.
            </Text>

            <ScalePressable
              onPress={() => handlePesanTiket("Pendaftaran")}
              style={styles.bottomButton}
            >
              <Text style={styles.bottomButtonText}>Daftar Sekarang</Text>
              <Ionicons name="arrow-forward" size={18} color={PREMIUM.white} />
            </ScalePressable>
          </LinearGradient>
        </Reveal>

        <Reveal delay={400}>
          <Text style={styles.copyright}>© 2026 TicketVerse. All rights reserved.</Text>
        </Reveal>
      </Animated.ScrollView>

      {/* ================= CUSTOM AUTH MODAL ================= */}
      <Modal
        visible={showAuthModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowAuthModal(false)} 
          />
          
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />
            
            <View style={styles.modalIconCircle}>
              <LinearGradient
                colors={[PREMIUM.midnight, PREMIUM.royal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalIconGradient}
              >
                <Ionicons name="lock-closed" size={32} color={PREMIUM.white} />
              </LinearGradient>
            </View>

            <Text style={styles.modalTitle}>Akses Terbatas</Text>
            <Text style={styles.modalDescription}>
              Anda harus masuk atau mendaftar terlebih dahulu untuk memesan tiket dan mengakses fitur eksklusif TicketVerse.
            </Text>

            <View style={styles.modalActions}>
              <ScalePressable
                onPress={() => {
                  setShowAuthModal(false);
                  router.push("/(auth)/login");
                }}
                style={styles.modalLoginButton}
              >
                <LinearGradient
                  colors={[PREMIUM.midnight, PREMIUM.royal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalLoginGradient}
                >
                  <Text style={styles.modalLoginText}>Masuk ke Akun</Text>
                  <Ionicons name="log-in-outline" size={18} color={PREMIUM.white} />
                </LinearGradient>
              </ScalePressable>

              <ScalePressable
                onPress={() => {
                  setShowAuthModal(false);
                  router.push("/(auth)/register");
                }}
                style={styles.modalRegisterButton}
              >
                <Text style={styles.modalRegisterText}>Buat Akun Baru</Text>
              </ScalePressable>
            </View>

            <Pressable 
              style={styles.modalCancel} 
              onPress={() => setShowAuthModal(false)}
            >
              <Text style={styles.modalCancelText}>Nanti Saja</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= SUB-COMPONENTS ================= */

function TicketCard({ title, price, type, imageUrl, color, onPress }) {
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
            colors={["transparent", "rgba(11,19,43,0.85)"]}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.ticketTopContent}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketTypeBadge}>
                <Text style={styles.ticketType}>{type}</Text>
              </View>
            </View>
            <Text style={styles.ticketTitle} numberOfLines={2}>{title}</Text>
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
            <View style={styles.barcodeLine} />
            <View style={[styles.barcodeLine, { width: 2 }]} />
            <View style={styles.barcodeLine} />
            <View style={[styles.barcodeLine, { width: 4 }]} />
            <View style={styles.barcodeLine} />
            <View style={[styles.barcodeLine, { width: 2 }]} />
            <View style={styles.barcodeLine} />
            <View style={[styles.barcodeLine, { width: 3 }]} />
            <View style={styles.barcodeLine} />
            <Text style={styles.barcodeText}>TV-{Math.floor(Math.random() * 10000)}</Text>
          </View>
        </View>
      </View>
    </ScalePressable>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PREMIUM.platinum },
  content: { paddingTop: 100, paddingBottom: 60, flexGrow: 1 },

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
  ticketEmergeWrapper: {
    position: "absolute",
    top: -16,
    right: -10,
    zIndex: 5,
  },
  ticketIconWrapper: {
    backgroundColor: PREMIUM.white,
    padding: 4,
    borderRadius: 6,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  brandText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  loginNav: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: PREMIUM.royal,
    borderRadius: 12,
    backgroundColor: PREMIUM.white,
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  loginNavText: { color: PREMIUM.royal, fontWeight: "900", fontSize: 13 },

  heroWrapper: {
    marginHorizontal: 20,
    borderRadius: 32,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
  },
  hero: {
    borderRadius: 32,
    padding: 28,
    minHeight: 460,
    overflow: "hidden",
    justifyContent: "center",
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroFloatIcon: {
    position: "absolute",
    right: 20,
    top: 60,
  },
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
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PREMIUM.royalLight },
  badgeText: { color: PREMIUM.white, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heroTitle: {
    color: PREMIUM.white,
    fontSize: 46,
    lineHeight: 54,
    fontWeight: "900",
    letterSpacing: -1.5,
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
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: { color: PREMIUM.midnight, fontWeight: "900", fontSize: 14 },
  arrowIcon: { backgroundColor: PREMIUM.royalLight, borderRadius: 20, padding: 6 },

  section: { paddingTop: 48 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionEyebrow: {
    color: PREMIUM.royal,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: PREMIUM.midnight,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 34,
    letterSpacing: -0.8,
    paddingHorizontal: 24,
  },
  sectionSubtitle: {
    color: PREMIUM.silver,
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 24,
    fontWeight: "500",
  },

  horizontalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  ticketCardWrapper: {
    width: CARD_WIDTH,
    backgroundColor: PREMIUM.white,
    borderRadius: 26,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  ticketTopSection: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
    height: 180,
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
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ticketType: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: PREMIUM.white,
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: PREMIUM.white,
    letterSpacing: -0.8,
    marginTop: 10,
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
  ticketPrice: {
    fontSize: 22,
    fontWeight: "900",
    color: PREMIUM.midnight,
  },
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
  btnPesanText: {
    color: PREMIUM.midnight,
    fontWeight: "900",
    fontSize: 13,
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 3,
  },
  barcodeLine: {
    width: 1.5,
    height: 20,
    backgroundColor: PREMIUM.silverLight,
    borderRadius: 1,
  },
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
    shadowOpacity: 0.05,
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
    alignItems: "center",
    zIndex: 2,
  },
  stageText: {
    color: PREMIUM.white,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 2,
  },
  stageGlow: {
    position: "absolute",
    bottom: -10,
    width: "60%",
    height: 20,
    backgroundColor: PREMIUM.royal,
    opacity: 0.3,
    borderRadius: 20,
    transform: [{ scaleX: 1.5 }],
  },
  seatArea: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  seatZoneVip: {
    width: "70%",
    paddingVertical: 16,
    backgroundColor: PREMIUM.royal,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: PREMIUM.royal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  seatZoneFestival: {
    width: "85%",
    paddingVertical: 16,
    backgroundColor: PREMIUM.silver,
    borderRadius: 12,
    alignItems: "center",
  },
  seatZoneRegular: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: PREMIUM.midnightLight,
    borderRadius: 12,
    alignItems: "center",
  },
  seatZoneText: {
    color: PREMIUM.white,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.5,
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
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: PREMIUM.silver,
    fontWeight: "700",
  },

  stepsContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 16,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: PREMIUM.white,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
  stepIconWrapper: {
    alignItems: "center",
    marginRight: 18,
  },
  stepIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: PREMIUM.royalLight,
    marginTop: 8,
    marginBottom: -32,
  },
  stepTextContent: {
    flex: 1,
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: "900",
    color: PREMIUM.royal,
    letterSpacing: 2,
    marginBottom: 4,
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
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
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
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomButtonText: { color: PREMIUM.white, fontWeight: "900", fontSize: 15 },
  copyright: {
    color: PREMIUM.silver,
    textAlign: "center",
    fontSize: 11,
    marginTop: 40,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  /* ================= MODAL STYLES ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 19, 43, 0.65)", // Warna Midnight transparan
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
    shadowOpacity: 0.1,
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
    shadowOpacity: 0.3,
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
    marginBottom: 28,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  modalActions: {
    width: "100%",
    gap: 12,
  },
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
  modalLoginText: {
    color: PREMIUM.white,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  modalRegisterButton: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 16,
    backgroundColor: PREMIUM.royalLight,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  modalRegisterText: {
    color: PREMIUM.royal,
    fontWeight: "900",
    fontSize: 15,
  },
  modalCancel: {
    marginTop: 20,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: PREMIUM.silver,
    fontSize: 14,
    fontWeight: "700",
  },
});
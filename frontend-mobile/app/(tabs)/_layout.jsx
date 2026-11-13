import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform, Pressable, Animated } from "react-native";
import { useEffect, useRef } from "react";

/* ================= PREMIUM PALETTE ================= */
const PREMIUM = {
  midnight: "#0B132B",
  royal: "#2563EB",
  royalLight: "#EFF6FF",
  silver: "#94A3B8",
  silverLight: "#E2E8F0",
  white: "#FFFFFF",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PREMIUM.royal,
        tabBarInactiveTintColor: PREMIUM.silver,
        tabBarStyle: styles.floatingTabBar,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="compass" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="tickets"
        options={{
          title: "Tiket Saya",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="ticket" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifikasi",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="notifications" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

/* ================= ANIMATED TAB ICON ================= */
function TabIcon({ name, focused }) {
  // Value untuk animasi scale (membesar/mengecil)
  const scaleValue = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  // Value untuk background opacity (muncul/hilang)
  const bgOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  // Value untuk posisi titik indikator
  const indicatorY = useRef(new Animated.Value(focused ? 0 : -10)).current;
  const indicatorOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    // Animasi Spring (Memantul) untuk ikon
    Animated.spring(scaleValue, {
      toValue: focused ? 1 : 0.85,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();

    // Animasi Fade untuk background biru
    Animated.timing(bgOpacity, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Animasi Titik Indikator (Fade & Geser)
    Animated.parallel([
      Animated.timing(indicatorY, {
        toValue: focused ? 0 : -6,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: focused ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const iconName = focused ? name : `${name}-outline`;

  return (
    <View style={styles.iconContainer}>
      {/* Titik Indikator Aktif */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            opacity: indicatorOpacity,
            transform: [{ translateY: indicatorY }],
          },
        ]}
      />

      {/* Pembungkus Ikon (Background biru pudar) */}
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.activeBg,
              { opacity: bgOpacity },
            ]}
          />
          <Ionicons
            name={iconName}
            size={22}
            color={focused ? PREMIUM.royal : PREMIUM.silver}
          />
        </View>
      </Animated.View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  floatingTabBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 24,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: "transparent",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: PREMIUM.white,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PREMIUM.royal,
    marginBottom: 4,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    overflow: "hidden", // Penting agar background animasi tidak meluber
  },
  activeBg: {
    backgroundColor: PREMIUM.royalLight,
    borderRadius: 14,
  },
});
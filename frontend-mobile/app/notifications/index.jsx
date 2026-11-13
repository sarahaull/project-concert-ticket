
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { COLORS } from "../../src/constants/colors";
import { getSavedUser } from "../../src/services/auth.service";
import notificationService from "../../src/services/notification.service";

/* =====================================================
   PREMIUM COLORS - TICKETVERSE
===================================================== */

const C = {
  navy: "#0B132B",
  navyLight: "#1C2541",
  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueSoft: "#EFF6FF",
  blueBorder: "#DBEAFE",

  background: "#F5F7FB",
  white: "#FFFFFF",

  text: "#172033",
  muted: "#94A3B8",
  border: "#E8EDF5",

  green: "#059669",
  greenSoft: "#ECFDF5",

  orange: "#D97706",
  orangeSoft: "#FFFBEB",

  red: "#DC2626",
  redSoft: "#FEF2F2",

  purple: "#7C3AED",
  purpleSoft: "#F5F3FF",
};

/* =====================================================
   HELPERS
===================================================== */

const isRead = (value) => {
  return (
    value === true ||
    Number(value) === 1 ||
    String(value).toLowerCase() === "true"
  );
};

const getTimeAgo = (value) => {
  if (!value) return "Baru saja";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const diff = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (diff < 60) return "Baru saja";

  if (diff < 3600) {
    return `${Math.floor(diff / 60)} menit lalu`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)} jam lalu`;
  }

  if (diff < 604800) {
    return `${Math.floor(diff / 86400)} hari lalu`;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getFullDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =====================================================
   NOTIFICATION ICON
===================================================== */

const getNotificationStyle = (title = "", message = "") => {
  const value = `${title} ${message}`.toLowerCase();

  if (
    value.includes("pembayaran") ||
    value.includes("payment") ||
    value.includes("berhasil") ||
    value.includes("lunas")
  ) {
    return {
      icon: "checkmark-circle",
      color: C.green,
      background: C.greenSoft,
      label: "PEMBAYARAN",
    };
  }

  if (
    value.includes("tiket") ||
    value.includes("ticket") ||
    value.includes("pesanan") ||
    value.includes("order")
  ) {
    return {
      icon: "ticket",
      color: C.blue,
      background: C.blueSoft,
      label: "TIKET",
    };
  }

  if (
    value.includes("event") ||
    value.includes("acara") ||
    value.includes("konser")
  ) {
    return {
      icon: "musical-notes",
      color: C.purple,
      background: C.purpleSoft,
      label: "EVENT",
    };
  }

  if (
    value.includes("gagal") ||
    value.includes("dibatalkan") ||
    value.includes("cancel")
  ) {
    return {
      icon: "alert-circle",
      color: C.red,
      background: C.redSoft,
      label: "INFORMASI",
    };
  }

  return {
    icon: "notifications",
    color: C.blue,
    background: C.blueSoft,
    label: "INFORMASI",
  };
};

/* =====================================================
   NOTIFICATION CARD
===================================================== */

function NotificationCard({
  item,
  onPress,
  index,
}) {
  const read = isRead(item.is_read);

  const type = getNotificationStyle(
    item.title,
    item.message
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationCard,
        pressed && styles.cardPressed,
      ]}
    >
      {/* LEFT ACCENT */}
      <View
        style={[
          styles.cardAccent,
          {
            backgroundColor: read
              ? "transparent"
              : C.blue,
          },
        ]}
      />

      {/* ICON */}
      <View
        style={[
          styles.notificationIcon,
          { backgroundColor: type.background },
        ]}
      >
        <Ionicons
          name={type.icon}
          size={22}
          color={type.color}
        />
      </View>

      {/* CONTENT */}
      <View style={styles.notificationContent}>
        <View style={styles.notificationTop}>
          <Text style={styles.notificationType}>
            {type.label}
          </Text>

          {!read && (
            <View style={styles.unreadIndicator} />
          )}
        </View>

        <Text
          style={[
            styles.notificationTitle,
            !read && styles.notificationTitleUnread,
          ]}
          numberOfLines={2}
        >
          {item.title || "Notifikasi TicketVerse"}
        </Text>

        <Text
          style={styles.notificationMessage}
          numberOfLines={3}
        >
          {item.message || "Ada informasi terbaru untuk Anda."}
        </Text>

        <View style={styles.notificationFooter}>
          <View style={styles.timeWrapper}>
            <Ionicons
              name="time-outline"
              size={12}
              color={C.muted}
            />

            <Text style={styles.notificationTime}>
              {getTimeAgo(item.created_at)}
            </Text>
          </View>

          <Text style={styles.detailText}>
            Lihat detail
          </Text>

          <Ionicons
            name="chevron-forward"
            size={13}
            color={C.blue}
          />
        </View>
      </View>
    </Pressable>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({ unreadOnly, onExplore }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCircleOuter}>
        <View style={styles.emptyCircleInner}>
          <Ionicons
            name={
              unreadOnly
                ? "checkmark-done-circle-outline"
                : "notifications-off-outline"
            }
            size={43}
            color={C.blue}
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        {unreadOnly
          ? "Semua sudah terbaca!"
          : "Belum ada notifikasi"}
      </Text>

      <Text style={styles.emptyDescription}>
        {unreadOnly
          ? "Kamu tidak memiliki notifikasi yang belum dibaca."
          : "Informasi pembayaran, tiket, dan event terbaru akan muncul di sini."}
      </Text>

      {!unreadOnly && (
        <Pressable
          style={styles.emptyButton}
          onPress={onExplore}
        >
          <Text style={styles.emptyButtonText}>
            Jelajahi Event
          </Text>

          <Ionicons
            name="arrow-forward"
            size={15}
            color={C.white}
          />
        </Pressable>
      )}
    </View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD DATA ================= */

  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      let currentUserId = userId;

      if (!currentUserId) {
        const user = await getSavedUser();

        currentUserId =
          user?.id ||
          user?.user_id ||
          user?.userId;

        if (!currentUserId) {
          throw new Error(
            "Sesi login tidak ditemukan. Silakan login kembali."
          );
        }

        setUserId(currentUserId);
      }

      const result =
        await notificationService.getNotifications(
          currentUserId
        );

      const sorted = [...result].sort((a, b) => {
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      });

      setNotifications(sorted);
    } catch (err) {
      console.error(
        "LOAD NOTIFICATIONS ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat notifikasi."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  /* ================= FILTER ================= */

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (item) => !isRead(item.is_read)
    ).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter(
        (item) => !isRead(item.is_read)
      );
    }

    return notifications;
  }, [notifications, activeTab]);

  /* ================= MARK ONE AS READ ================= */

  const handleNotificationPress = async (item) => {
    if (isRead(item.is_read)) {
      Alert.alert(
        item.title || "Notifikasi",
        `${item.message || ""}\n\n${getFullDate(item.created_at)}`
      );
      return;
    }

    // Optimistic update
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === item.id
          ? { ...notification, is_read: true }
          : notification
      )
    );

    try {
      await notificationService.markAsRead(item.id);

      Alert.alert(
        item.title || "Notifikasi",
        `${item.message || ""}\n\n${getFullDate(item.created_at)}`
      );
    } catch (err) {
      console.error("MARK READ ERROR:", err);

      // Restore original state
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === item.id
            ? { ...notification, is_read: false }
            : notification
        )
      );

      Alert.alert(
        "Gagal",
        "Notifikasi tidak dapat ditandai sudah dibaca."
      );
    }
  };

  /* ================= MARK ALL AS READ ================= */

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    try {
      setMarkingAll(true);

      await notificationService.markAllAsRead(
        notifications
      );

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      Alert.alert(
        "Berhasil",
        "Semua notifikasi sudah ditandai sebagai dibaca."
      );
    } catch (err) {
      console.error("MARK ALL READ ERROR:", err);

      await loadNotifications(true);

      Alert.alert(
        "Informasi",
        err?.message || "Gagal memperbarui notifikasi."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={C.background}
        />

        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="large"
            color={C.blue}
          />
        </View>

        <Text style={styles.loadingTitle}>
          TICKETVERSE
        </Text>

        <Text style={styles.loadingSubtitle}>
          Menyiapkan notifikasi...
        </Text>
      </View>
    );
  }

  /* ================= RENDER ================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={C.navy}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Notifikasi
          </Text>

          <Text style={styles.headerSubtitle}>
            Semua informasi terbaru untukmu
          </Text>
        </View>

        <View style={styles.headerBell}>
          <Ionicons
            name="notifications-outline"
            size={21}
            color={C.blue}
          />

          {unreadCount > 0 && (
            <View style={styles.headerBellDot} />
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNotifications(true)}
            tintColor={C.blue}
            colors={[C.blue]}
          />
        }
      >
        {/* HERO CARD */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[C.navy, C.navyLight, "#263B70"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroCircleOne} />
            <View style={styles.heroCircleTwo} />

            <View style={styles.heroContent}>
              <View style={styles.heroLabel}>
                <View style={styles.heroLabelDot} />

                <Text style={styles.heroEyebrow}>
                  NOTIFICATION CENTER
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                Stay in the{"\n"}loop with us.
              </Text>

              <Text style={styles.heroDescription}>
                Jangan lewatkan informasi penting
                seputar tiket dan event favoritmu.
              </Text>
            </View>

            <View style={styles.heroCounter}>
              <View style={styles.heroCounterIcon}>
                <Ionicons
                  name="mail-unread-outline"
                  size={22}
                  color="#BFDBFE"
                />
              </View>

              <View>
                <Text style={styles.heroCounterLabel}>
                  BELUM DIBACA
                </Text>

                <Text style={styles.heroCounterValue}>
                  {unreadCount}
                </Text>
              </View>
            </View>

            <Ionicons
              name="notifications"
              size={90}
              color="rgba(255,255,255,0.045)"
              style={styles.heroDecoration}
            />

            <View style={styles.heroAccent} />
          </LinearGradient>
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              YOUR UPDATES
            </Text>

            <Text style={styles.sectionTitle}>
              Kotak Masuk
            </Text>
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              disabled={markingAll}
              style={styles.markAllButton}
            >
              {markingAll ? (
                <ActivityIndicator
                  size="small"
                  color={C.blue}
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={C.blue}
                  />

                  <Text style={styles.markAllText}>
                    Baca semua
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* FILTER TABS */}
        <View style={styles.tabsContainer}>
          <Pressable
            onPress={() => setActiveTab("all")}
            style={[
              styles.tab,
              activeTab === "all" && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.tabTextActive,
              ]}
            >
              Semua
            </Text>

            <View
              style={[
                styles.tabCount,
                activeTab === "all" && styles.tabCountActive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  activeTab === "all" && styles.tabCountTextActive,
                ]}
              >
                {notifications.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("unread")}
            style={[
              styles.tab,
              activeTab === "unread" && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "unread" && styles.tabTextActive,
              ]}
            >
              Belum Dibaca
            </Text>

            <View
              style={[
                styles.tabCount,
                activeTab === "unread" && styles.tabCountActive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  activeTab === "unread" && styles.tabCountTextActive,
                ]}
              >
                {unreadCount}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* NOTIFICATION LIST */}
        <View style={styles.listContainer}>
          {error ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="cloud-offline-outline"
                size={30}
                color={C.red}
              />

              <Text style={styles.errorTitle}>
                Gagal memuat notifikasi
              </Text>

              <Text style={styles.errorMessage}>
                {error}
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={() => loadNotifications()}
              >
                <Ionicons
                  name="refresh"
                  size={15}
                  color={C.white}
                />

                <Text style={styles.retryText}>
                  Coba Lagi
                </Text>
              </Pressable>
            </View>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              unreadOnly={activeTab === "unread"}
              onExplore={() => router.push("/events")}
            />
          ) : (
            <>
              <View style={styles.listInfo}>
                <Text style={styles.listInfoText}>
                  {activeTab === "unread"
                    ? `${filteredNotifications.length} notifikasi belum dibaca`
                    : `${filteredNotifications.length} notifikasi`}
                </Text>

                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color={C.green}
                />
              </View>

              {filteredNotifications.map((item, index) => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  index={index}
                  onPress={() =>
                    handleNotificationPress(item)
                  }
                />
              ))}
            </>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <View style={styles.footerLogo}>
            <Ionicons
              name="ticket"
              size={15}
              color={C.blue}
            />

            <Text style={styles.footerBrand}>
              TICKETVERSE
            </Text>
          </View>

          <Text style={styles.footerText}>
            Your Premium Event Experience
          </Text>

          <Text style={styles.footerVersion}>
            ALL YOUR MOMENTS, ONE PLACE.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.background,
  },

  loadingIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },

  loadingTitle: {
    color: C.navy,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 3,
  },

  loadingSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 8,
  },

  /* HEADER */

  header: {
    paddingTop: 57,
    paddingBottom: 20,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.background,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: C.navy,
    letterSpacing: -0.6,
  },

  headerSubtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
    fontWeight: "500",
  },

  headerBell: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: C.blueSoft,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: C.blueBorder,
  },

  headerBellDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.red,
    right: 9,
    top: 8,
    borderWidth: 1.5,
    borderColor: C.white,
  },

  /* SCROLL */

  scrollContent: {
    paddingBottom: 40,
  },

  /* HERO */

  heroWrapper: {
    marginHorizontal: 20,
    borderRadius: 25,
    backgroundColor: C.navy,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },

  heroCard: {
    minHeight: 226,
    borderRadius: 25,
    overflow: "hidden",
    padding: 23,
    position: "relative",
  },

  heroCircleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.12)",
    right: -55,
    top: -65,
  },

  heroCircleTwo: {
    position: "absolute",
    width: 115,
    height: 115,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.12)",
    right: 12,
    top: 12,
  },

  heroContent: {
    zIndex: 2,
    width: "75%",
  },

  heroLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#60A5FA",
  },

  heroEyebrow: {
    color: "#BFDBFE",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2,
  },

  heroTitle: {
    fontSize: 27,
    lineHeight: 34,
    color: C.white,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 17,
  },

  heroDescription: {
    color: "#AAB9D1",
    fontSize: 10,
    lineHeight: 17,
    marginTop: 8,
    maxWidth: 230,
  },

  heroCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 19,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.13)",
    zIndex: 2,
  },

  heroCounterIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(37,99,235,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },

  heroCounterLabel: {
    color: "#93C5FD",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  heroCounterValue: {
    color: C.white,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 3,
  },

  heroDecoration: {
    position: "absolute",
    right: 13,
    top: 63,
  },

  heroAccent: {
    position: "absolute",
    bottom: 0,
    left: 23,
    width: 55,
    height: 3,
    backgroundColor: C.blue,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 33,
    marginHorizontal: 22,
    marginBottom: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionEyebrow: {
    color: C.blue,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },

  sectionTitle: {
    color: C.navy,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 5,
  },

  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: C.blueSoft,
    borderWidth: 1,
    borderColor: C.blueBorder,
    borderRadius: 10,
  },

  markAllText: {
    color: C.blue,
    fontSize: 10,
    fontWeight: "800",
  },

  /* TABS */

  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 22,
    padding: 5,
    backgroundColor: "#EAEFF6",
    borderRadius: 14,
    marginBottom: 19,
    gap: 5,
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    paddingVertical: 11,
    borderRadius: 10,
  },

  tabActive: {
    backgroundColor: C.white,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  tabText: {
    fontSize: 11,
    color: "#7C8AA0",
    fontWeight: "700",
  },

  tabTextActive: {
    color: C.navy,
    fontWeight: "900",
  },

  tabCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 7,
    backgroundColor: "#DFE6EF",
    alignItems: "center",
    justifyContent: "center",
  },

  tabCountActive: {
    backgroundColor: C.blueSoft,
  },

  tabCountText: {
    fontSize: 9,
    color: "#718096",
    fontWeight: "900",
  },

  tabCountTextActive: {
    color: C.blue,
  },

  /* LIST */

  listContainer: {
    paddingHorizontal: 22,
  },

  listInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    paddingHorizontal: 2,
  },

  listInfoText: {
    fontSize: 10,
    color: C.muted,
    fontWeight: "600",
  },

  /* NOTIFICATION CARD */

  notificationCard: {
    backgroundColor: C.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.78,
  },

  cardAccent: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  notificationIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  notificationContent: {
    flex: 1,
    minWidth: 0,
  },

  notificationTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  notificationType: {
    color: C.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.blue,
  },

  notificationTitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#475569",
  },

  notificationTitleUnread: {
    color: C.navy,
    fontWeight: "900",
  },

  notificationMessage: {
    fontSize: 10,
    color: "#7E8BA0",
    lineHeight: 17,
    marginTop: 5,
  },

  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    gap: 5,
    flexWrap: "wrap",
  },

  timeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },

  notificationTime: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "600",
  },

  detailText: {
    color: C.blue,
    fontSize: 9,
    fontWeight: "800",
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 35,
  },

  emptyCircleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F4F7FC",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 25,
    backgroundColor: C.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 19,
  },

  emptyDescription: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 260,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.blue,
    paddingHorizontal: 19,
    paddingVertical: 12,
    borderRadius: 11,
    marginTop: 20,
  },

  emptyButtonText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "900",
  },

  /* ERROR */

  errorCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.navy,
    marginTop: 13,
  },

  errorMessage: {
    color: C.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 17,
  },

  retryButton: {
    backgroundColor: C.blue,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 17,
  },

  retryText: {
    color: C.white,
    fontWeight: "800",
    fontSize: 10,
  },

  /* FOOTER */

  footer: {
    alignItems: "center",
    marginTop: 38,
    marginBottom: 20,
  },

  footerLine: {
    width: 40,
    height: 2,
    backgroundColor: C.blue,
    opacity: 0.35,
    marginBottom: 18,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  footerBrand: {
    fontSize: 10,
    color: C.navy,
    fontWeight: "900",
    letterSpacing: 2.3,
  },

  footerText: {
    fontSize: 10,
    color: C.muted,
    marginTop: 7,
  },

  footerVersion: {
    fontSize: 8,
    color: "#B5C0D0",
    letterSpacing: 1.5,
    fontWeight: "800",
    marginTop: 12,
  },
});

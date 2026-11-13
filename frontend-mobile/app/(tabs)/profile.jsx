import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { COLORS } from "../../src/constants/colors";
import api from "../../src/services/api";
import {
  getSavedUser,
  logoutCustomer,
} from "../../src/services/auth.service";

// MURNI DARI ENV, TANPA HARDCODE
const API_BASE_URL = String(
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const API_HOST = API_BASE_URL.replace(/\/api$/i, "");

const getImageUrl = (path) => {
  if (!path) return null;

  const value = String(path).trim();

  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const cleanPath = value.replace(/^\/?api(?=\/)/i, "");

  // Jika env belum di-set, kembalikan path bersih agar tidak error
  if (!API_HOST) {
    return cleanPath;
  }

  return `${API_HOST}/${cleanPath.replace(/^\/+/, "")}`;
};

const getArray = (data, key) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  return [];
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfile = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const savedUser = await getSavedUser();

      setUser(savedUser || null);

      const results = await Promise.allSettled([
        api.get("/user/profile"),
        api.get("/tickets"),
      ]);

      const [profileResult, ticketResult] = results;

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value.data;

        setUser(
          data.user ||
          data.profile ||
          savedUser ||
          null
        );
      } else {
        console.log(
          "PROFILE ERROR:",
          profileResult.reason?.response?.data ||
            profileResult.reason?.message
        );
      }

      if (ticketResult.status === "fulfilled") {
        const data = ticketResult.value.data;

        setTickets(getArray(data, "tickets"));
      } else {
        console.log(
          "TICKET ERROR:",
          ticketResult.reason?.response?.data ||
            ticketResult.reason?.message
        );
      }
    } catch (error) {
      console.error(
        "LOAD PROFILE ERROR:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Gagal Memuat Profil",
        error.response?.data?.message ||
          "Tidak dapat mengambil informasi profil."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const displayName =
    user?.fullname ||
    user?.full_name ||
    user?.name ||
    "Customer";

  const email = user?.email || "-";

  const avatarPath =
    user?.profile_image ||
    user?.profile_picture ||
    user?.avatar ||
    user?.photo ||
    user?.image ||
    null;

  const avatarUrl = getImageUrl(avatarPath);

  const uniqueEvents = new Set(
    tickets
      .map((ticket) => {
        return (
          ticket.event_id ||
          ticket.eventId ||
          ticket.event?.id
        );
      })
      .filter(Boolean)
  );

  const totalTickets = tickets.reduce((total, ticket) => {
    return total + Math.max(1, Number(ticket.quantity || 1));
  }, 0);

  const totalEvents = uniqueEvents.size;

  const handleLogout = () => {
    Alert.alert(
      "Keluar dari Akun",
      "Apakah kamu yakin ingin keluar dari TicketVerse?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            if (loggingOut) return;

            try {
              setLoggingOut(true);

              await logoutCustomer();

              router.replace("/");
            } catch (error) {
              console.error("LOGOUT ERROR:", error);

              Alert.alert(
                "Gagal Keluar",
                "Terjadi kesalahan saat keluar dari akun."
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleMenu = (menu) => {
    switch (menu) {
      case "notifications":
        router.push("/notifications");
        break;

      case "edit":
        router.push("/profile/edit");
        break;

      case "password":
        router.push("/profile/change-password");
        break;

      case "help":
        Alert.alert(
          "Pusat Bantuan",
          "Silakan hubungi tim TicketVerse untuk mendapatkan bantuan."
        );
        break;

      default:
        break;
    }
  };

  const menuItems = [
    {
      id: "edit",
      icon: "person-outline",
      title: "Edit Profil",
      subtitle: "Perbarui informasi akun kamu",
      color: "#3976D5",
      background: "#EAF1FC",
    },
    {
      id: "password",
      icon: "shield-checkmark-outline",
      title: "Keamanan Akun",
      subtitle: "Ubah password dan keamanan",
      color: "#159568",
      background: "#E6F7EF",
    },
    {
      id: "notifications",
      icon: "notifications-outline",
      title: "Notifikasi",
      subtitle: "Lihat informasi dan pemberitahuan",
      color: "#D99024",
      background: "#FFF5E5",
    },
    {
      id: "help",
      icon: "help-circle-outline",
      title: "Pusat Bantuan",
      subtitle: "Bantuan dan informasi TicketVerse",
      color: "#8B62CB",
      background: "#F1EBFC",
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Memuat profil kamu...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfile(true)}
            tintColor={COLORS.primary}
          />
        }
      >
        <LinearGradient
          colors={[
            COLORS.navy,
            COLORS.primaryDark,
            COLORS.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBg}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerEyebrow}>
                TICKETVERSE ACCOUNT
              </Text>

              <Text style={styles.headerTitle}>
                Profil Saya
              </Text>
            </View>

            <Pressable
              style={styles.headerRefresh}
              onPress={() => loadProfile(true)}
            >
              <Ionicons
                name="refresh-outline"
                size={21}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <View style={styles.headerDecorationOne} />
          <View style={styles.headerDecorationTwo} />

          <View style={styles.headerBottom}>
            <View style={styles.memberBadge}>
              <Ionicons
                name="shield-checkmark"
                size={13}
                color="#FFFFFF"
              />

              <Text style={styles.memberBadgeText}>
                CUSTOMER MEMBER
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <LinearGradient
                  colors={["#315F9D", "#19365F"]}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarInitial}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}

              <View style={styles.onlineBadge}>
                <Ionicons
                  name="checkmark"
                  size={12}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.profileIdentity}>
              <Text style={styles.profileName} numberOfLines={2}>
                {displayName}
              </Text>

              <Text style={styles.profileEmail} numberOfLines={1}>
                {email}
              </Text>

              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={13}
                  color="#159568"
                />

                <Text style={styles.verifiedText}>
                  Akun Customer
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.editButton}
              onPress={() => handleMenu("edit")}
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          <View style={styles.profileDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="ticket-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.statValue}>
                {totalTickets}
              </Text>

              <Text style={styles.statLabel}>
                Total Tiket
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#159568"
                />
              </View>

              <Text style={styles.statValue}>
                {totalEvents}
              </Text>

              <Text style={styles.statLabel}>
                Event Diikuti
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.accountInfoSection}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>
                  Informasi Akun
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Detail akun TicketVerse kamu
                </Text>
              </View>

              <Ionicons
                name="person-circle-outline"
                size={23}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoCard}>
              <InfoRow
                icon="person-outline"
                label="Nama Lengkap"
                value={displayName}
              />

              <View style={styles.infoDivider} />

              <InfoRow
                icon="mail-outline"
                label="Email"
                value={email}
              />

              <View style={styles.infoDivider} />

              <InfoRow
                icon="calendar-outline"
                label="Bergabung Sejak"
                value={formatDate(
                  user?.created_at ||
                  user?.createdAt
                )}
              />
            </View>
          </View>

          <View style={styles.menuSection}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>
                  Pengaturan
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Kelola akun dan preferensi kamu
                </Text>
              </View>

              <Ionicons
                name="settings-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.menuContainer}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => handleMenu(item.id)}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: item.background },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={21}
                      color={item.color}
                    />
                  </View>

                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>
                      {item.title}
                    </Text>

                    <Text style={styles.menuSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#A0AABD"
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.supportCard}>
            <LinearGradient
              colors={["#EAF1FC", "#F5F8FE"]}
              style={styles.supportGradient}
            >
              <View style={styles.supportIcon}>
                <Ionicons
                  name="headset-outline"
                  size={25}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>
                  Butuh Bantuan?
                </Text>

                <Text style={styles.supportDescription}>
                  Kami siap membantu pengalaman event kamu.
                </Text>
              </View>

              <Ionicons
                name="arrow-forward-circle"
                size={25}
                color={COLORS.primary}
              />
            </LinearGradient>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator color="#DC4444" />
            ) : (
              <Ionicons
                name="log-out-outline"
                size={21}
                color="#DC4444"
              />
            )}

            <Text style={styles.logoutText}>
              {loggingOut ? "Sedang Keluar..." : "Keluar dari Akun"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <View style={styles.footerLogo}>
              <Ionicons
                name="ticket"
                size={16}
                color={COLORS.primary}
              />

              <Text style={styles.footerBrand}>
                TicketVerse
              </Text>
            </View>

            <Text style={styles.version}>
              Version 1.0.0
            </Text>

            <Text style={styles.footerCopyright}>
              Your Event Experience
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 13,
  },

  loadingText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
  },

  headerBg: {
    height: 225,
    paddingTop: 58,
    paddingHorizontal: 23,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },

  headerEyebrow: {
    color: "#B8CDE9",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 7,
  },

  headerRefresh: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerDecorationOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.06)",
    right: -65,
    top: 30,
  },

  headerDecorationTwo: {
    position: "absolute",
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: "rgba(255,255,255,0.06)",
    right: 85,
    bottom: -70,
  },

  headerBottom: {
    position: "absolute",
    bottom: 24,
    left: 23,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  memberBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  profileCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 18,
    marginTop: -47,
    borderRadius: 23,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#142B4D",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    position: "relative",
    marginRight: 13,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "#EAF1FC",
  },

  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
  },

  onlineBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#159568",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  profileIdentity: {
    flex: 1,
  },

  profileName: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  profileEmail: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },

  verifiedText: {
    color: "#159568",
    fontSize: 10,
    fontWeight: "700",
  },

  editButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#EAF1FC",
    justifyContent: "center",
    alignItems: "center",
  },

  profileDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#EAF1FC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  statValue: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },

  statDivider: {
    width: 1,
    height: 55,
    backgroundColor: COLORS.border,
  },

  content: {
    paddingHorizontal: 19,
    paddingTop: 27,
  },

  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EAF1FC",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },

  infoValue: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 50,
  },

  menuSection: {
    marginTop: 27,
  },

  menuContainer: {
    gap: 10,
  },

  menuItem: {
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  menuItemPressed: {
    opacity: 0.7,
  },

  menuIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  menuInfo: {
    flex: 1,
  },

  menuLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "800",
  },

  menuSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 5,
  },

  supportCard: {
    marginTop: 24,
    borderRadius: 17,
    overflow: "hidden",
  },

  supportGradient: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  supportIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  supportInfo: {
    flex: 1,
  },

  supportTitle: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "900",
  },

  supportDescription: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 5,
    lineHeight: 15,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FBD5D5",
  },

  logoutText: {
    color: "#DC4444",
    fontSize: 12,
    fontWeight: "900",
  },

  footer: {
    alignItems: "center",
    marginTop: 27,
    marginBottom: 35,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  footerBrand: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "900",
  },

  version: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 8,
  },

  footerCopyright: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 5,
  },
});
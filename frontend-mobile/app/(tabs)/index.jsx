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
import api from "../../src/services/api";
import { getSavedUser, logoutCustomer } from "../../src/services/auth.service";

// MURNI DARI ENV, TANPA HARDCODE
const API_BASE_URL = String(
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const API_HOST = API_BASE_URL.replace(/\/api$/i, "");

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
  danger: "#DC2626",
  white: "#FFFFFF",
};

const EMPTY_STATS = {
  total: 0,
  active: 0,
  expired: 0,
  totalSpent: 0,
};

const EVENT_IMAGE_HEIGHT = 185;

/* HELPERS */

const getImageUrl = (path) => {
  if (!path) return null;

  const value = String(path).trim();

  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const cleanPath = value.replace(/^\/?api(?=\/)/i, "");

  // Jika env belum di-set, kembalikan path bersih agar tidak error
  if (!API_HOST) {
    return cleanPath;
  }

  return `${API_HOST}/${cleanPath.replace(/^\/+/, "")}`;
};

const getResponseData = (response) => response?.data || {};

const getArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
};

const isPaid = (status) => {
  return ["paid", "success", "settlement", "completed"].includes(
    String(status || "").trim().toLowerCase()
  );
};

const formatDate = (value) => {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDateParts = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString("id-ID", {
      month: "short",
    }).toUpperCase(),
  };
};

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getEventName = (event) =>
  event?.event_name || event?.name || "Event";

const getEventDate = (event) =>
  event?.event_date || event?.date || null;

const getEventPoster = (event) =>
  event?.poster || event?.image || event?.event_poster || null;

const getTicketQuantity = (ticket) =>
  Math.max(0, Number(ticket?.quantity || 1));

const getUniqueOrders = (orders) => {
  const unique = new Map();

  orders.forEach((order) => {
    const id = order?.id ?? order?.order_code;

    if (id !== undefined && id !== null) {
      if (!unique.has(String(id))) {
        unique.set(String(id), order);
      }
    }
  });

  return Array.from(unique.values());
};

const calculateStats = (tickets, orders) => {
  const now = new Date();

  let total = 0;
  let active = 0;
  let expired = 0;

  tickets.forEach((ticket) => {
    const quantity = getTicketQuantity(ticket);

    total += quantity;

    const paid = isPaid(ticket.payment_status);
    const eventDate = ticket.event_date
      ? new Date(ticket.event_date)
      : null;

    const hasValidDate =
      eventDate && !Number.isNaN(eventDate.getTime());

    if (paid && (!hasValidDate || eventDate >= now)) {
      active += quantity;
    } else if (paid && hasValidDate && eventDate < now) {
      expired += quantity;
    }
  });

  const totalSpent = getUniqueOrders(orders).reduce((sum, order) => {
    if (!isPaid(order.payment_status)) return sum;

    return sum + Number(order.total_price || 0);
  }, 0);

  return {
    total,
    active,
    expired,
    totalSpent,
  };
};

/* IMAGE */

function RemoteImage({
  path,
  style,
  fallbackStyle,
  icon = "image-outline",
  iconColor = PREMIUM.royal,
  iconSize = 30,
}) {
  const [failed, setFailed] = useState(false);
  const imageUrl = getImageUrl(path);

  if (!imageUrl || failed) {
    return (
      <View style={[styles.imageFallback, style, fallbackStyle]}>
        <Ionicons
          name={icon}
          size={iconSize}
          color={iconColor}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

/* BARCODE */

function Barcode({
  seed = 1,
  bars = 26,
  height = 22,
  color = PREMIUM.midnight,
}) {
  let number = Number(String(seed).replace(/\D/g, "")) || 7;

  const items = Array.from({ length: bars }, () => {
    number = (number * 9301 + 49297) % 233280;

    return {
      width: 1 + (number % 3),
      gap: 1 + ((number >> 3) % 2),
    };
  });

  return (
    <View style={{ flexDirection: "row", height, alignItems: "stretch" }}>
      {items.map((item, index) => (
        <View
          key={index}
          style={{
            width: item.width,
            marginRight: item.gap,
            backgroundColor: color,
            opacity: 0.85,
          }}
        />
      ))}
    </View>
  );
}

/* SECTION HEADING */

function SectionHeading({ eyebrow, title, onSeeAll, icon }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {onSeeAll ? (
        <Pressable
          style={styles.seeAllButton}
          onPress={onSeeAll}
        >
          <Text style={styles.seeAllText}>Semua</Text>
          <Ionicons
            name="arrow-forward"
            size={13}
            color={PREMIUM.royal}
          />
        </Pressable>
      ) : null}

      {icon ? (
        <View style={styles.sectionIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={PREMIUM.royal}
          />
        </View>
      ) : null}
    </View>
  );
}

/* EVENT TICKET */

function EventTicket({ event }) {
  const parts = getDateParts(getEventDate(event));

  return (
    <Pressable
      style={({ pressed }) => [
        styles.eventCard,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/events/${event.id}`)}
    >
      <View style={styles.eventImageArea}>
        <RemoteImage
          path={getEventPoster(event)}
          style={styles.eventImage}
          fallbackStyle={styles.eventImageFallback}
          icon="musical-notes"
          iconColor="#FFFFFF"
          iconSize={38}
        />

        <LinearGradient
          colors={[
            "rgba(11,19,43,0.05)",
            "rgba(11,19,43,0.88)",
          ]}
          style={styles.eventImageOverlay}
        />

        <View style={styles.eventTopRow}>
          <View style={styles.eventCategoryBadge}>
            <Text style={styles.eventCategoryText}>
              {event.category_name || "EVENT"}
            </Text>
          </View>

          <View style={styles.eventArrowBadge}>
            <Ionicons
              name="arrow-up-right"
              size={17}
              color={PREMIUM.royal}
            />
          </View>
        </View>

        <View style={styles.eventImageContent}>
          <Text style={styles.eventName} numberOfLines={2}>
            {getEventName(event)}
          </Text>

          <View style={styles.eventDateMeta}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color="#BFDBFE"
            />

            <Text style={styles.eventDateMetaText}>
              {formatDate(getEventDate(event))}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.eventPerforation}>
        <View style={styles.eventNotchLeft} />
        <View style={styles.eventDashedLine} />
        <View style={styles.eventNotchRight} />
      </View>

      <View style={styles.eventInformation}>
        {parts ? (
          <View style={styles.dateBlock}>
            <Text style={styles.dateDay}>{parts.day}</Text>
            <Text style={styles.dateMonth}>{parts.month}</Text>
          </View>
        ) : (
          <View style={styles.dateBlock}>
            <Ionicons
              name="calendar-outline"
              size={19}
              color={PREMIUM.royal}
            />
          </View>
        )}

        <View style={styles.eventVenue}>
          <Text style={styles.venueLabel}>VENUE</Text>
          <Text style={styles.venueName} numberOfLines={1}>
            {event.venue_name || "Lokasi belum tersedia"}
          </Text>
        </View>

        <View style={styles.ticketExplore}>
          <Text style={styles.ticketExploreText}>Explore</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={PREMIUM.royal}
          />
        </View>
      </View>

      <View style={styles.eventStub}>
        <Barcode seed={event.id} />
        <Text style={styles.stubCode}>
          NO. {String(event.id).padStart(5, "0")}
        </Text>
      </View>

      <View style={styles.eventBottomAccent} />
    </Pressable>
  );
}

/* SCREEN */

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [banners, setBanners] = useState([]);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const savedUser = await getSavedUser();
      setUser(savedUser || null);

      const results = await Promise.allSettled([
        api.get("/banners/home"),
        api.get("/events"),
        api.get("/tickets"),
        api.get("/orders"),
        api.get("/user/profile"),
      ]);

      const [
        bannerResult,
        eventResult,
        ticketResult,
        orderResult,
        profileResult,
      ] = results;

      let loadedTickets = tickets;
      let loadedOrders = orders;

      if (bannerResult.status === "fulfilled") {
        const data = getResponseData(bannerResult.value);

        setBanners(
          getArray(data, "banners")
            .filter(
              (banner) =>
                banner.is_active === undefined ||
                banner.is_active === true ||
                Number(banner.is_active) === 1
            )
            .sort(
              (a, b) =>
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
            )
        );
      }

      if (eventResult.status === "fulfilled") {
        const data = getResponseData(eventResult.value);
        setEvents(getArray(data, "events"));
      }

      if (ticketResult.status === "fulfilled") {
        const data = getResponseData(ticketResult.value);
        loadedTickets = getArray(data, "tickets");
        setTickets(loadedTickets);
      }

      if (orderResult.status === "fulfilled") {
        const data = getResponseData(orderResult.value);
        loadedOrders = getArray(data, "orders");
        setOrders(loadedOrders);
      }

      if (profileResult.status === "fulfilled") {
        const data = getResponseData(profileResult.value);
        const profile = data.user || data.profile || null;

        setUser(profile || savedUser || null);
      } else {
        setUser(savedUser || null);
      }

      if (
        ticketResult.status === "fulfilled" ||
        orderResult.status === "fulfilled"
      ) {
        setStats(calculateStats(loadedTickets, loadedOrders));
      }
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);
      Alert.alert("Informasi", "Dashboard gagal memuat data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Keluar Akun",
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
            try {
              await logoutCustomer();
              router.replace("/");
            } catch (error) {
              Alert.alert("Gagal", "Tidak dapat keluar dari akun.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingRing}>
          <ActivityIndicator
            size="large"
            color={PREMIUM.royal}
          />
        </View>

        <Text style={styles.loadingTitle}>TICKETVERSE</Text>
        <Text style={styles.loadingText}>
          Menyiapkan dashboard Anda...
        </Text>
      </View>
    );
  }

  const displayName =
    user?.fullname ||
    user?.name ||
    user?.full_name ||
    "Customer";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={PREMIUM.platinum}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={PREMIUM.royal}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerUser}>
            <Text style={styles.greeting}>
              Selamat datang kembali
            </Text>

            <Text style={styles.username} numberOfLines={1}>
              {displayName}
            </Text>

            <View style={styles.memberBadge}>
              <View style={styles.memberBadgeDot} />
              <Text style={styles.memberBadgeText}>
                PREMIUM MEMBER
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerIcon}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={PREMIUM.midnight}
              />
              <View style={styles.notificationDot} />
            </Pressable>

            <Pressable
              style={styles.avatar}
              onPress={() => router.push("/profile")}
            >
              <LinearGradient
                colors={[PREMIUM.midnight, PREMIUM.royal]}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.headerIcon}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={PREMIUM.danger}
              />
            </Pressable>
          </View>
        </View>

        {/* HERO */}

        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[
              PREMIUM.midnight,
              PREMIUM.midnightLight,
              "#2A3B6B",
            ]}
            style={styles.heroCard}
          >
            <View style={styles.heroDecorationOne} />
            <View style={styles.heroDecorationTwo} />

            <View style={styles.heroContent}>
              <View style={styles.welcomeLabel}>
                <View style={styles.welcomeLabelDot} />
                <Text style={styles.welcomeEyebrow}>
                  EXCLUSIVE EXPERIENCE
                </Text>
              </View>

              <Text style={styles.welcomeTitle}>
                Curated moments{"\n"}for the extraordinary.
              </Text>

              <Text style={styles.welcomeDescription}>
                Akses koleksi event terbaik dengan pengalaman
                yang tak terlupakan.
              </Text>

              <Pressable
                style={styles.exploreButton}
                onPress={() => router.push("/events")}
              >
                <Text style={styles.exploreButtonText}>
                  Jelajahi Koleksi
                </Text>

                <View style={styles.exploreButtonIcon}>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={PREMIUM.royal}
                  />
                </View>
              </Pressable>
            </View>

            <View style={styles.heroDecorationIcon}>
              <Ionicons
                name="musical-notes"
                size={76}
                color="rgba(37,99,235,0.22)"
              />
            </View>

            <View style={styles.heroStub}>
              <View style={styles.heroStubDash} />

              <View>
                <Text style={styles.heroStubLabel}>
                  TIKET AKTIF
                </Text>
                <Text style={styles.heroStubValue}>
                  {stats.active}
                </Text>
              </View>

              <Barcode
                seed={stats.total + 11}
                bars={24}
                height={27}
                color="#BFDBFE"
              />
            </View>

            <View style={styles.heroBottomAccent} />
          </LinearGradient>
        </View>

        {/* STATISTICS */}

        <View style={styles.statsSection}>
          <SectionHeading
            eyebrow="OVERVIEW"
            title="Aktivitas Tiket"
            icon="analytics-outline"
          />

          <View style={styles.statsGrid}>
            {[
              {
                label: "TOTAL TIKET",
                value: stats.total,
                icon: "ticket-outline",
                color: PREMIUM.royal,
                background: "#EFF6FF",
              },
              {
                label: "AKTIF",
                value: stats.active,
                icon: "checkmark-circle-outline",
                color: PREMIUM.success,
                background: "#ECFDF5",
              },
              {
                label: "SELESAI",
                value: stats.expired,
                icon: "time-outline",
                color: PREMIUM.warning,
                background: "#FFFBEB",
              },
            ].map((item) => (
              <View key={item.label} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: item.background },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color={item.color}
                  />
                </View>

                <Text style={styles.statValue}>
                  {item.value}
                </Text>

                <Text style={styles.statLabel}>
                  {item.label}
                </Text>

                <View
                  style={[
                    styles.statAccent,
                    { backgroundColor: item.color },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* BANNERS */}

        {banners.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHorizontalPadding}>
              <SectionHeading
                eyebrow="HIGHLIGHTS"
                title="Informasi Terbaru"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bannerScroll}
            >
              {banners.map((banner) => (
                <Pressable
                  key={banner.id}
                  style={styles.bannerCard}
                  onPress={() => {
                    const link = banner.button_link || banner.link;

                    if (link) router.push(link);
                  }}
                >
                  <RemoteImage
                    path={banner.image}
                    style={styles.bannerImage}
                    iconColor="#FFFFFF"
                  />

                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(11,19,43,0.95)",
                    ]}
                    style={styles.bannerOverlay}
                  >
                    <View style={styles.bannerLabel}>
                      <View style={styles.bannerLabelDot} />
                      <Text style={styles.bannerLabelText}>
                        TICKETVERSE
                      </Text>
                    </View>

                    <Text
                      style={styles.bannerTitle}
                      numberOfLines={2}
                    >
                      {banner.title}
                    </Text>

                    {banner.subtitle ? (
                      <Text
                        style={styles.bannerSubtitle}
                        numberOfLines={2}
                      >
                        {banner.subtitle}
                      </Text>
                    ) : null}
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* EVENTS */}

        <View style={styles.section}>
          <View style={styles.sectionHorizontalPadding}>
            <SectionHeading
              eyebrow="CURATED"
              title="Event Pilihan"
              onSeeAll={() => router.push("/events")}
            />
          </View>

          {events.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={PREMIUM.royal}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Belum ada event
              </Text>

              <Text style={styles.emptyDescription}>
                Event yang telah dipublikasikan akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View style={styles.eventList}>
              {events.slice(0, 5).map((event) => (
                <EventTicket
                  key={event.id}
                  event={event}
                />
              ))}
            </View>
          )}
        </View>

        {/* MY TICKETS */}

        <View style={styles.section}>
          <View style={styles.sectionHorizontalPadding}>
            <SectionHeading
              eyebrow="MY COLLECTION"
              title="Tiket Saya"
              onSeeAll={() => router.push("/my-tickets")}
            />
          </View>

          {tickets.length === 0 ? (
            <Pressable
              style={styles.emptyCard}
              onPress={() => router.push("/events")}
            >
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="ticket-outline"
                  size={28}
                  color={PREMIUM.royal}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Belum ada tiket
              </Text>

              <Text style={styles.emptyDescription}>
                Pesan tiket event favoritmu sekarang.
              </Text>

              <View style={styles.emptyLinkWrapper}>
                <Text style={styles.emptyLink}>
                  Temukan event
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color={PREMIUM.royal}
                />
              </View>
            </Pressable>
          ) : (
            <View style={styles.myTicketList}>
              {tickets.slice(0, 3).map((ticket) => {
                const paid = isPaid(ticket.payment_status);

                return (
                  <Pressable
                    key={ticket.id}
                    style={({ pressed }) => [
                      styles.myTicketCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => router.push("/my-tickets")}
                  >
                    <View
                      style={[
                        styles.myTicketEdge,
                        {
                          backgroundColor: paid
                            ? PREMIUM.success
                            : PREMIUM.warning,
                        },
                      ]}
                    />

                    <View style={styles.myTicketIcon}>
                      <Ionicons
                        name="ticket"
                        size={22}
                        color={PREMIUM.royal}
                      />
                    </View>

                    <View style={styles.myTicketInfo}>
                      <Text
                        style={styles.myTicketName}
                        numberOfLines={1}
                      >
                        {ticket.event_name || "Event"}
                      </Text>

                      <Text style={styles.myTicketCategory}>
                        {ticket.category_name || "Kategori Tiket"}
                      </Text>

                      <Text style={styles.myTicketDate}>
                        {formatDate(ticket.event_date)}
                      </Text>
                    </View>

                    <View style={styles.myTicketRight}>
                      <View
                        style={[
                          styles.ticketStatusBadge,
                          {
                            backgroundColor: paid
                              ? "#ECFDF5"
                              : "#FFFBEB",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.ticketStatusText,
                            {
                              color: paid
                                ? PREMIUM.success
                                : PREMIUM.warning,
                            },
                          ]}
                        >
                          {paid
                            ? "LUNAS"
                            : String(
                                ticket.payment_status || "PENDING"
                              ).toUpperCase()}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={PREMIUM.silver}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* SPENDING */}

        <View style={styles.section}>
          <View style={styles.sectionHorizontalPadding}>
            <SectionHeading
              eyebrow="FINANCIAL"
              title="Ringkasan Pengeluaran"
            />
          </View>

          <LinearGradient
            colors={[PREMIUM.midnight, PREMIUM.midnightLight]}
            style={styles.spendingCard}
          >
            <View style={styles.spendingIcon}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.spendingInfo}>
              <Text style={styles.spendingLabel}>
                TOTAL PENGELUARAN
              </Text>

              <Text style={styles.spendingValue}>
                {formatRupiah(stats.totalSpent)}
              </Text>
            </View>

            <View style={styles.spendingTrend}>
              <Ionicons
                name="trending-up"
                size={19}
                color={PREMIUM.royal}
              />
            </View>
          </LinearGradient>
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <View style={styles.footerDivider} />

          <View style={styles.footerLogo}>
            <Ionicons
              name="ticket"
              size={15}
              color={PREMIUM.royal}
            />
            <Text style={styles.footerBrand}>
              TICKETVERSE
            </Text>
          </View>

          <Text style={styles.footerText}>
            Your Premium Event Experience
          </Text>

          <View style={styles.footerDot} />
        </View>
      </ScrollView>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.platinum,
  },

  scrollContent: {
    paddingBottom: 125,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: PREMIUM.platinum,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingRing: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  loadingTitle: {
    color: PREMIUM.midnight,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
  },

  loadingText: {
    color: PREMIUM.silver,
    fontSize: 11,
    marginTop: 8,
  },

  cardPressed: {
    opacity: 0.9,
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerUser: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  greeting: {
    color: PREMIUM.silver,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  username: {
    color: PREMIUM.midnight,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 9,
    backgroundColor: PREMIUM.royalLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  memberBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PREMIUM.royal,
  },

  memberBadgeText: {
    color: PREMIUM.royal,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
  },

  notificationDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PREMIUM.danger,
    right: 8,
    top: 7,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    overflow: "hidden",
  },

  avatarGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  heroWrapper: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 5,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },

  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
  },

  heroDecorationOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    right: -35,
    top: -50,
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 95,
    height: 95,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    right: 20,
    top: 25,
  },

  heroContent: {
    padding: 23,
    paddingBottom: 22,
    width: "100%",
  },

  welcomeLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  welcomeLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PREMIUM.royal,
  },

  welcomeEyebrow: {
    color: "#BFDBFE",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 32,
    marginTop: 16,
    letterSpacing: -0.6,
  },

  welcomeDescription: {
    color: "#B5C1D8",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 9,
    maxWidth: 260,
  },

  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    paddingLeft: 15,
    paddingRight: 7,
    paddingVertical: 7,
    gap: 10,
    marginTop: 19,
  },

  exploreButtonText: {
    color: PREMIUM.midnight,
    fontSize: 10,
    fontWeight: "900",
  },

  exploreButtonIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: PREMIUM.royalLight,
    alignItems: "center",
    justifyContent: "center",
  },

  heroDecorationIcon: {
    position: "absolute",
    right: 15,
    top: 90,
  },

  heroStub: {
    minHeight: 72,
    paddingHorizontal: 23,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(191,219,254,0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroStubLabel: {
    color: "#93C5FD",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  heroStubValue: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
  },

  heroBottomAccent: {
    height: 3,
    width: 65,
    backgroundColor: PREMIUM.royal,
    marginLeft: 23,
  },

  statsSection: {
    paddingHorizontal: 22,
    marginTop: 32,
  },

  section: {
    marginTop: 34,
  },

  sectionHorizontalPadding: {
    paddingHorizontal: 22,
  },

  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
    minHeight: 42,
  },

  sectionEyebrow: {
    color: PREMIUM.royal,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 5,
  },

  sectionTitle: {
    color: PREMIUM.midnight,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  sectionIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: PREMIUM.royalLight,
    justifyContent: "center",
    alignItems: "center",
  },

  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: PREMIUM.royalLight,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  seeAllText: {
    color: PREMIUM.royal,
    fontSize: 10,
    fontWeight: "900",
  },

  statsGrid: {
    flexDirection: "row",
    gap: 9,
  },

  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    overflow: "hidden",
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    color: PREMIUM.midnight,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 12,
  },

  statLabel: {
    color: PREMIUM.silver,
    fontSize: 8,
    marginTop: 5,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  statAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },

  bannerScroll: {
    paddingHorizontal: 22,
    paddingBottom: 5,
  },

  bannerCard: {
    width: 285,
    height: 165,
    borderRadius: 19,
    overflow: "hidden",
    marginRight: 13,
    backgroundColor: PREMIUM.midnight,
    elevation: 3,
  },

  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  imageFallback: {
    backgroundColor: PREMIUM.midnightLight,
    alignItems: "center",
    justifyContent: "center",
  },

  bannerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 17,
  },

  bannerLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(37,99,235,0.2)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 8,
  },

  bannerLabelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PREMIUM.royal,
  },

  bannerLabelText: {
    color: "#DBEAFE",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  bannerSubtitle: {
    color: "#CBD5E1",
    fontSize: 10,
    marginTop: 5,
  },

  eventList: {
    paddingHorizontal: 22,
    gap: 18,
  },

  eventCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    elevation: 3,
    shadowColor: PREMIUM.midnight,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  eventImageArea: {
    height: EVENT_IMAGE_HEIGHT,
    width: "100%",
    position: "relative",
    backgroundColor: PREMIUM.midnightLight,
    overflow: "hidden",
  },

  eventImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  eventImageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PREMIUM.midnightLight,
  },

  eventImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  eventTopRow: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eventCategoryBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    maxWidth: "75%",
  },

  eventCategoryText: {
    color: PREMIUM.midnight,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  eventArrowBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: PREMIUM.royalLight,
    justifyContent: "center",
    alignItems: "center",
  },

  eventImageContent: {
    position: "absolute",
    bottom: 17,
    left: 17,
    right: 17,
  },

  eventName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27,
  },

  eventDateMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 9,
  },

  eventDateMetaText: {
    color: "#BFDBFE",
    fontSize: 10,
    fontWeight: "700",
  },

  eventPerforation: {
    height: 25,
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 18,
  },

  eventDashedLine: {
    width: "100%",
    height: 1,
    borderTopWidth: 1,
    borderColor: PREMIUM.silverLight,
    borderStyle: "dashed",
  },

  eventNotchLeft: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PREMIUM.platinum,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: PREMIUM.silverLight,
    left: -11,
    top: 2,
  },

  eventNotchRight: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PREMIUM.platinum,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: PREMIUM.silverLight,
    right: -11,
    top: 2,
  },

  eventInformation: {
    width: "100%",
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    gap: 10,
  },

  dateBlock: {
    width: 43,
    height: 47,
    borderRadius: 11,
    backgroundColor: PREMIUM.royalLight,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  dateDay: {
    color: PREMIUM.midnight,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 19,
  },

  dateMonth: {
    color: PREMIUM.royal,
    fontSize: 8,
    fontWeight: "900",
    marginTop: 2,
  },

  eventVenue: {
    flex: 1,
    minWidth: 0,
  },

  venueLabel: {
    color: PREMIUM.silver,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  venueName: {
    color: PREMIUM.charcoal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },

  ticketExplore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: PREMIUM.royalLight,
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  ticketExploreText: {
    color: PREMIUM.royal,
    fontSize: 9,
    fontWeight: "900",
  },

  eventStub: {
    minHeight: 40,
    backgroundColor: PREMIUM.platinum,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.silverLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  stubCode: {
    color: PREMIUM.silver,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  eventBottomAccent: {
    height: 3,
    width: "100%",
    backgroundColor: PREMIUM.royal,
  },

  emptyCard: {
    marginHorizontal: 22,
    padding: 27,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: PREMIUM.royalLight,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: PREMIUM.midnight,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 14,
  },

  emptyDescription: {
    color: PREMIUM.silver,
    textAlign: "center",
    fontSize: 10,
    marginTop: 7,
    lineHeight: 17,
  },

  emptyLinkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },

  emptyLink: {
    color: PREMIUM.royal,
    fontSize: 11,
    fontWeight: "900",
  },

  myTicketList: {
    paddingHorizontal: 22,
    gap: 13,
  },

  myTicketCard: {
    width: "100%",
    minHeight: 86,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PREMIUM.silverLight,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingLeft: 14,
    paddingRight: 12,
    overflow: "hidden",
  },

  myTicketEdge: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  myTicketIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PREMIUM.royalLight,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  myTicketInfo: {
    flex: 1,
    minWidth: 0,
  },

  myTicketName: {
    color: PREMIUM.midnight,
    fontSize: 13,
    fontWeight: "900",
  },

  myTicketCategory: {
    color: PREMIUM.royal,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },

  myTicketDate: {
    color: PREMIUM.silver,
    fontSize: 9,
    marginTop: 4,
  },

  myTicketRight: {
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minWidth: 64,
  },

  ticketStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  ticketStatusText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  spendingCard: {
    marginHorizontal: 22,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },

  spendingIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: PREMIUM.royal,
    alignItems: "center",
    justifyContent: "center",
  },

  spendingInfo: {
    flex: 1,
    minWidth: 0,
  },

  spendingLabel: {
    color: "#93C5FD",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  spendingValue: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
  },

  spendingTrend: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(37,99,235,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  footer: {
    alignItems: "center",
    marginTop: 38,
    marginBottom: 25,
    paddingHorizontal: 22,
  },

  footerDivider: {
    width: 42,
    height: 2,
    backgroundColor: PREMIUM.royal,
    opacity: 0.4,
    marginBottom: 18,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  footerBrand: {
    color: PREMIUM.midnight,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footerText: {
    color: PREMIUM.silver,
    fontSize: 10,
    marginTop: 7,
  },

  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PREMIUM.royal,
    marginTop: 13,
  },
});
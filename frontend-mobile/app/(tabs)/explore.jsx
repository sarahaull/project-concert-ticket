import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import eventService from "../../src/services/event.service";
import { COLORS } from "../../src/constants/colors";

const FILTERS = ["Semua", "Musik", "Festival", "Konser", "Lainnya"];

// Base URL sepenuhnya diambil dari environment variable.
// Tidak ada fallback / hardcode URL di sini.
const API_BASE_URL = String(
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const API_HOST = API_BASE_URL.replace(/\/api$/i, "");

const getImageUrl = (path) => {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const cleanPath = String(path).replace(/^\/api/i, "");

  // Jika env belum diset, kembalikan path apa adanya
  if (!API_HOST) {
    return cleanPath;
  }

  return `${API_HOST}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
};

const formatDate = (date) => {
  if (!date) return "Tanggal belum tersedia";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tanggal belum tersedia";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return null;
  return String(time).slice(0, 5);
};

const getCategory = (event) => {
  return event?.category_name || "Event";
};

const getLocation = (event) => {
  const venue = event?.venue_name || "";
  const city = event?.city || "";

  if (venue && city) return `${venue}, ${city}`;
  return venue || city || "Lokasi belum tersedia";
};

const getEventStatus = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "available") {
    return {
      label: "Tiket tersedia",
      color: "#16865D",
      background: "#E8F7F0",
    };
  }

  if (value === "limited") {
    return {
      label: "Tiket terbatas",
      color: "#C47B16",
      background: "#FFF4DF",
    };
  }

  if (value === "sold_out" || value === "sold out") {
    return {
      label: "Habis",
      color: "#D34B4B",
      background: "#FDECEC",
    };
  }

  return {
    label: status || "Informasi tersedia",
    color: "#667085",
    background: "#F1F3F6",
  };
};

const getFilterCategory = (category) => {
  const value = String(category || "").toLowerCase();

  if (value.includes("musik")) return "Musik";
  if (value.includes("festival")) return "Festival";
  if (value.includes("konser")) return "Konser";

  return "Lainnya";
};

function EventTicketCard({ event }) {
  const imageUrl = getImageUrl(event?.poster);
  const status = getEventStatus(event?.status);
  const eventTime = formatTime(event?.event_time);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.ticketCard,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/events/${event.id}`)}
    >
      <View style={styles.ticketPosterWrapper}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.ticketPoster}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={["#1C2850", "#435CA1", "#8098D5"]}
            style={styles.posterPlaceholder}
          >
            <Ionicons name="musical-notes" size={42} color="#FFFFFF" />
            <Text style={styles.posterPlaceholderText}>TICKETVERSE</Text>
          </LinearGradient>
        )}

        <LinearGradient
          colors={["rgba(8, 15, 38, 0.02)", "rgba(8, 15, 38, 0.88)"]}
          style={styles.posterOverlay}
        />

        <View style={styles.posterTopRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {getCategory(event)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.background },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.posterTitleContainer}>
          <Text style={styles.posterEventName} numberOfLines={2}>
            {event?.event_name || "Event Tanpa Nama"}
          </Text>

          <Text style={styles.posterOrganizer} numberOfLines={1}>
            {event?.organizer_name || "TicketVerse Event"}
          </Text>
        </View>
      </View>

      <View style={styles.ticketDivider}>
        <View style={styles.ticketNotchLeft} />
        <View style={styles.ticketDashedLine} />
        <View style={styles.ticketNotchRight} />
      </View>

      <View style={styles.ticketInformation}>
        <View style={styles.ticketMetaList}>
          <View style={styles.ticketMetaItem}>
            <View style={styles.metaIconBox}>
              <Ionicons name="calendar-outline" size={17} color="#5269AD" />
            </View>

            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Tanggal acara</Text>
              <Text style={styles.metaValue}>
                {formatDate(event?.event_date)}
              </Text>
            </View>
          </View>

          <View style={styles.ticketMetaItem}>
            <View style={styles.metaIconBox}>
              <Ionicons name="location-outline" size={17} color="#5269AD" />
            </View>

            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Lokasi acara</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {getLocation(event)}
              </Text>
            </View>
          </View>

          {eventTime ? (
            <View style={styles.ticketMetaItem}>
              <View style={styles.metaIconBox}>
                <Ionicons name="time-outline" size={17} color="#5269AD" />
              </View>

              <View style={styles.metaTextContainer}>
                <Text style={styles.metaLabel}>Waktu acara</Text>
                <Text style={styles.metaValue}>{eventTime} WIB</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.ticketAction}>
          <View style={styles.ticketActionCircle}>
            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
          </View>
          <Text style={styles.ticketActionText}>DETAIL</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function AllEventsScreen() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await eventService.getAll();

      const data = response?.data || response || {};
      const eventList = Array.isArray(data)
        ? data
        : Array.isArray(data.events)
          ? data.events
          : [];

      setEvents(eventList);
    } catch (err) {
      console.error("LOAD EVENTS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat daftar acara."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (selectedFilter !== "Semua") {
      result = result.filter(
        (event) => getFilterCategory(event?.category_name) === selectedFilter
      );
    }

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((event) => {
        const searchableText = [
          event?.event_name,
          event?.category_name,
          event?.venue_name,
          event?.city,
          event?.organizer_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword);
      });
    }

    return result;
  }, [events, search, selectedFilter]);

  const handleSearchClear = () => {
    setSearch("");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            tintColor="#5269AD"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerEyebrow}>EXPLORE TICKETVERSE</Text>
              <Text style={styles.headerTitle}>Semua Acara</Text>
              <Text style={styles.headerSubtitle}>
                Temukan pengalaman seru berikutnya.
              </Text>
            </View>

            <Pressable
              style={styles.notificationButton}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#26365F"
              />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <LinearGradient
            colors={["#18264E", "#354D8E", "#627CC1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroDecorationOne} />
            <View style={styles.heroDecorationTwo} />

            <View style={styles.heroContent}>
              <View style={styles.heroLabel}>
                <Ionicons name="sparkles" size={13} color="#F8DFA0" />
                <Text style={styles.heroLabelText}>YOUR NEXT EXPERIENCE</Text>
              </View>

              <Text style={styles.heroTitle}>
                Momen seru{"\n"}dimulai dari sini.
              </Text>

              <Text style={styles.heroDescription}>
                Pilih acara favoritmu dan amankan tiketnya sekarang.
              </Text>

              <View style={styles.heroBottom}>
                <View style={styles.heroEventCount}>
                  <Ionicons name="ticket-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.heroEventCountText}>
                    {events.length} acara tersedia
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.heroIconCircle}>
              <Ionicons name="ticket" size={48} color="#F6D994" />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={21} color="#8993A9" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari konser, festival, atau lokasi..."
              placeholderTextColor="#A2AABC"
              style={styles.searchInput}
              returnKeyType="search"
            />

            {search.length > 0 ? (
              <Pressable onPress={handleSearchClear}>
                <Ionicons name="close-circle" size={20} color="#929BAD" />
              </Pressable>
            ) : (
              <View style={styles.searchRightIcon}>
                <Ionicons name="options-outline" size={19} color="#5269AD" />
              </View>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Jelajahi acara</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih acara sesuai minatmu
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {FILTERS.map((filter) => {
              const active = selectedFilter === filter;

              return (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.filterChip,
                    active && styles.filterChipActive,
                  ]}
                >
                  {filter === "Semua" && (
                    <Ionicons
                      name="grid-outline"
                      size={14}
                      color={active ? "#FFFFFF" : "#6F7A91"}
                    />
                  )}

                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>Event pilihan</Text>
              <Text style={styles.listSubtitle}>
                {filteredEvents.length} acara ditemukan
              </Text>
            </View>

            <View style={styles.sortLabel}>
              <Ionicons name="time-outline" size={15} color="#77839B" />
              <Text style={styles.sortText}>Terbaru</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5269AD" />
              <Text style={styles.loadingText}>
                Sedang memuat acara...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={35}
                  color="#8290AA"
                />
              </View>

              <Text style={styles.emptyTitle}>Gagal memuat acara</Text>
              <Text style={styles.emptyDescription}>{error}</Text>

              <Pressable
                style={styles.retryButton}
                onPress={() => loadEvents()}
              >
                <Ionicons name="refresh" size={17} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Coba lagi</Text>
              </Pressable>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="ticket-outline"
                  size={37}
                  color="#8290AA"
                />
              </View>

              <Text style={styles.emptyTitle}>Acara tidak ditemukan</Text>
              <Text style={styles.emptyDescription}>
                Coba kata kunci atau kategori yang berbeda.
              </Text>

              <Pressable
                style={styles.resetButton}
                onPress={() => {
                  setSearch("");
                  setSelectedFilter("Semua");
                }}
              >
                <Text style={styles.resetButtonText}>Reset pencarian</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.eventList}>
              {filteredEvents.map((event) => (
                <EventTicketCard key={event.id} event={event} />
              ))}
            </View>
          )}

          <View style={styles.bottomInfo}>
            <Ionicons name="shield-checkmark-outline" size={17} color="#8490A6" />
            <Text style={styles.bottomInfoText}>
              Temukan dan pesan tiket acara favoritmu di TicketVerse.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 23,
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#8290AD",
    marginBottom: 7,
  },

  headerTitle: {
    fontSize: 29,
    fontWeight: "900",
    color: "#192747",
    letterSpacing: -0.8,
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#8993A8",
    marginTop: 5,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EDF0F6",
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E66C73",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  heroBanner: {
    minHeight: 205,
    borderRadius: 25,
    padding: 21,
    overflow: "hidden",
    position: "relative",
    marginBottom: 25,
  },

  heroDecorationOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.055)",
    top: -90,
    right: 10,
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -85,
    right: 80,
  },

  heroContent: {
    zIndex: 2,
    maxWidth: "78%",
  },

  heroLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 13,
  },

  heroLabelText: {
    color: "#E8D9AF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  heroDescription: {
    color: "#D4DCF0",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
    maxWidth: 230,
  },

  heroBottom: {
    flexDirection: "row",
    marginTop: 17,
  },

  heroEventCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  heroEventCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  heroIconCircle: {
    position: "absolute",
    right: 17,
    top: 65,
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
  },

  content: {
    paddingHorizontal: 22,
    paddingBottom: 35,
  },

  searchContainer: {
    height: 55,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDF0F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 11,
    marginBottom: 28,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#26334F",
    height: "100%",
  },

  searchRightIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F0F3FA",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1D2A49",
  },

  sectionSubtitle: {
    fontSize: 11,
    color: "#929BAD",
    marginTop: 4,
  },

  filterContainer: {
    gap: 9,
    paddingBottom: 24,
  },

  filterChip: {
    height: 37,
    borderRadius: 13,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9ECF3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  filterChipActive: {
    backgroundColor: "#354D8E",
    borderColor: "#354D8E",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#78839A",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  listTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1D2A49",
  },

  listSubtitle: {
    fontSize: 11,
    color: "#929BAD",
    marginTop: 4,
  },

  sortLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EDF0F5",
  },

  sortText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#77839B",
  },

  eventList: {
    gap: 17,
  },

  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EDF0F5",
    elevation: 3,
    shadowColor: "#1B2A4A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 12,
  },

  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },

  ticketPosterWrapper: {
    height: 175,
    backgroundColor: "#263B70",
    position: "relative",
  },

  ticketPoster: {
    width: "100%",
    height: "100%",
  },

  posterPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  posterPlaceholderText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
  },

  posterOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  posterTopRow: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },

  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  posterTitleContainer: {
    position: "absolute",
    left: 17,
    right: 17,
    bottom: 17,
  },

  posterEventName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 26,
    letterSpacing: -0.3,
  },

  posterOrganizer: {
    color: "#D9E0F0",
    fontSize: 10,
    marginTop: 5,
    fontWeight: "600",
  },

  ticketDivider: {
    height: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 13,
  },

  ticketNotchLeft: {
    position: "absolute",
    left: -11,
    top: -11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F7F8FC",
  },

  ticketNotchRight: {
    position: "absolute",
    right: -11,
    top: -11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F7F8FC",
  },

  ticketDashedLine: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "#DCE1EC",
    borderStyle: "dashed",
  },

  ticketInformation: {
    paddingHorizontal: 17,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  ticketMetaList: {
    flex: 1,
    gap: 12,
  },

  ticketMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  metaIconBox: {
    width: 33,
    height: 33,
    borderRadius: 11,
    backgroundColor: "#F0F3FA",
    alignItems: "center",
    justifyContent: "center",
  },

  metaTextContainer: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 9,
    color: "#A0A8B8",
    fontWeight: "600",
    marginBottom: 3,
  },

  metaValue: {
    fontSize: 11,
    color: "#34415E",
    fontWeight: "800",
  },

  ticketAction: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#EDF0F5",
    paddingLeft: 12,
    alignSelf: "stretch",
  },

  ticketActionCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#354D8E",
    alignItems: "center",
    justifyContent: "center",
  },

  ticketActionText: {
    color: "#7180A2",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  loadingContainer: {
    paddingVertical: 65,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#8993A8",
    fontSize: 12,
    marginTop: 12,
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EDF0F5",
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#F0F3FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 16,
    color: "#26334F",
    fontWeight: "900",
  },

  emptyDescription: {
    fontSize: 11,
    color: "#929BAD",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 7,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#354D8E",
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  resetButton: {
    marginTop: 17,
    backgroundColor: "#354D8E",
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 12,
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  bottomInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 28,
    paddingHorizontal: 10,
  },

  bottomInfoText: {
    fontSize: 10,
    color: "#929BAD",
    textAlign: "center",
    flex: 1,
  },
});
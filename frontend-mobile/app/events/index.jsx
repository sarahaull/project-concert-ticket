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
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import eventService from "../../src/services/event.service";

const { width } = Dimensions.get("window");

const COLORS = {
  navy: "#0B132B",
  navyLight: "#1C2541",
  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueLight: "#EFF6FF",
  background: "#F5F7FB",
  white: "#FFFFFF",
  text: "#17233D",
  muted: "#94A3B8",
  border: "#E5EAF2",
  green: "#059669",
  greenLight: "#ECFDF5",
  orange: "#D97706",
  orangeLight: "#FFFBEB",
  red: "#DC2626",
};

// MURNI DARI ENV, TANPA HARDCODE
const API_BASE_URL = String(
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const API_HOST = API_BASE_URL.replace(/\/api$/i, "");

/* =====================================================
   HELPERS
===================================================== */

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

const getEventName = (event) =>
  event?.event_name || event?.name || "Untitled Event";

const getEventDate = (event) =>
  event?.event_date || event?.date || null;

const getEventImage = (event) =>
  event?.poster ||
  event?.image ||
  event?.event_poster ||
  null;

const getCategory = (event) =>
  event?.category_name || "Other";

const formatDate = (value) => {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal belum tersedia";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getDateParts = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return {
    day: date.getDate(),
    month: date
      .toLocaleDateString("id-ID", { month: "short" })
      .toUpperCase(),
  };
};

const getEventStatus = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "available") {
    return {
      label: "AVAILABLE",
      color: COLORS.green,
      background: COLORS.greenLight,
    };
  }

  if (value === "limited") {
    return {
      label: "LIMITED TICKETS",
      color: COLORS.orange,
      background: COLORS.orangeLight,
    };
  }

  if (value === "sold out" || value === "sold_out") {
    return {
      label: "SOLD OUT",
      color: COLORS.red,
      background: "#FEF2F2",
    };
  }

  return {
    label: status
      ? String(status).toUpperCase()
      : "EVENT",
    color: COLORS.blue,
    background: COLORS.blueLight,
  };
};

/* =====================================================
   IMAGE COMPONENT
===================================================== */

function EventImage({
  path,
  style,
  iconSize = 36,
}) {
  const [failed, setFailed] = useState(false);

  const imageUrl = getImageUrl(path);

  if (!imageUrl || failed) {
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <Ionicons
          name="musical-notes-outline"
          size={iconSize}
          color="#93C5FD"
        />

        <Text style={styles.placeholderText}>
          TICKETVERSE
        </Text>
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

/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>
          {eyebrow}
        </Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      {action && (
        <Pressable
          onPress={onAction}
          style={styles.sectionAction}
        >
          <Text style={styles.sectionActionText}>
            {action}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color={COLORS.blue}
          />
        </Pressable>
      )}
    </View>
  );
}

/* =====================================================
   FEATURED EVENT
===================================================== */

function FeaturedEvent({ event, onPress }) {
  if (!event) return null;

  const date = formatDate(getEventDate(event));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredCard,
        pressed && { opacity: 0.93 },
      ]}
    >
      <EventImage
        path={getEventImage(event)}
        style={styles.featuredImage}
        iconSize={48}
      />

      <LinearGradient
        colors={[
          "rgba(11,19,43,0.05)",
          "rgba(11,19,43,0.48)",
          "rgba(11,19,43,0.97)",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.featuredTop}>
        <View style={styles.featuredBadge}>
          <Ionicons
            name="sparkles"
            size={11}
            color={COLORS.blue}
          />

          <Text style={styles.featuredBadgeText}>
            FEATURED EVENT
          </Text>
        </View>

        <View style={styles.featuredArrow}>
          <Ionicons
            name="arrow-up-outline"
            size={17}
            color={COLORS.navy}
          />
        </View>
      </View>

      <View style={styles.featuredContent}>
        <Text style={styles.featuredCategory}>
          {getCategory(event).toUpperCase()}
        </Text>

        <Text
          style={styles.featuredTitle}
          numberOfLines={2}
        >
          {getEventName(event)}
        </Text>

        <View style={styles.featuredMeta}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color="#BFDBFE"
          />

          <Text style={styles.featuredMetaText}>
            {date}
          </Text>
        </View>

        <View style={styles.featuredMeta}>
          <Ionicons
            name="location-outline"
            size={14}
            color="#BFDBFE"
          />

          <Text
            style={styles.featuredMetaText}
            numberOfLines={1}
          >
            {event?.venue_name || "Venue belum tersedia"}
          </Text>
        </View>

        <View style={styles.featuredButton}>
          <Text style={styles.featuredButtonText}>
            Lihat Event
          </Text>

          <Ionicons
            name="arrow-forward"
            size={15}
            color={COLORS.navy}
          />
        </View>
      </View>
    </Pressable>
  );
}

/* =====================================================
   EVENT CARD
===================================================== */

function EventCard({ event, onPress }) {
  const date = getDateParts(getEventDate(event));

  const status = getEventStatus(event?.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.eventCard,
        pressed && { opacity: 0.94 },
      ]}
    >
      <View style={styles.eventImageContainer}>
        <EventImage
          path={getEventImage(event)}
          style={styles.eventImage}
          iconSize={30}
        />

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {getCategory(event)}
          </Text>
        </View>

        <View
          style={[
            styles.eventStatus,
            { backgroundColor: status.background },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: status.color },
            ]}
          />

          <Text
            style={[
              styles.eventStatusText,
              { color: status.color },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.eventContent}>
        <Text
          style={styles.eventTitle}
          numberOfLines={2}
        >
          {getEventName(event)}
        </Text>

        {event?.artist_name ? (
          <View style={styles.eventInfoRow}>
            <Ionicons
              name="musical-notes-outline"
              size={13}
              color={COLORS.blue}
            />

            <Text
              style={styles.eventInfoText}
              numberOfLines={1}
            >
              {event.artist_name}
            </Text>
          </View>
        ) : null}

        <View style={styles.eventInfoRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={COLORS.muted}
          />

          <Text
            style={styles.eventInfoText}
            numberOfLines={1}
          >
            {event?.venue_name || "Lokasi belum tersedia"}
          </Text>
        </View>

        <View style={styles.eventInfoRow}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={COLORS.muted}
          />

          <Text style={styles.eventInfoText}>
            {formatDate(getEventDate(event))}
          </Text>
        </View>

        <View style={styles.eventCardDivider} />

        <View style={styles.eventFooter}>
          <View style={styles.eventDateBlock}>
            {date ? (
              <>
                <Text style={styles.eventDateDay}>
                  {date.day}
                </Text>

                <Text style={styles.eventDateMonth}>
                  {date.month}
                </Text>
              </>
            ) : (
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.blue}
              />
            )}
          </View>

          <View style={styles.eventFooterText}>
            <Text style={styles.eventFooterLabel}>
              VENUE
            </Text>

            <Text
              style={styles.eventFooterVenue}
              numberOfLines={1}
            >
              {event?.city || event?.venue_name || "Indonesia"}
            </Text>
          </View>

          <View style={styles.eventExplore}>
            <Ionicons
              name="arrow-forward"
              size={17}
              color={COLORS.blue}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({ searching, onReset }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="calendar-outline"
          size={34}
          color={COLORS.blue}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {searching
          ? "Event tidak ditemukan"
          : "Belum ada event"}
      </Text>

      <Text style={styles.emptyDescription}>
        {searching
          ? "Coba gunakan kata kunci atau kategori lainnya."
          : "Event yang sudah dipublikasikan akan muncul di sini."}
      </Text>

      {searching && (
        <Pressable
          onPress={onReset}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>
            Reset pencarian
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* =====================================================
   MAIN SCREEN
===================================================== */

export default function ExploreEventsScreen() {
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("Semua");

  const [sortBy, setSortBy] = useState("Terbaru");

  /* ================= LOAD EVENTS ================= */

  const loadEvents = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await eventService.getAll();

      const result = response?.data ?? response;

      const eventList = Array.isArray(result)
        ? result
        : Array.isArray(result?.events)
        ? result.events
        : [];

      setEvents(eventList);
    } catch (err) {
      console.error(
        "LOAD EVENTS ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
        "Tidak dapat memuat event. Periksa koneksi backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  /* ================= CATEGORIES ================= */

  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        events
          .map((item) => getCategory(item))
          .filter((item) => item !== "Other")
      ),
    ];

    return ["Semua", ...unique];
  }, [events]);

  /* ================= FILTER EVENTS ================= */

  const filteredEvents = useMemo(() => {
    let result = [...events];

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((event) => {
        const searchable = [
          event?.event_name,
          event?.name,
          event?.artist_name,
          event?.category_name,
          event?.venue_name,
          event?.city,
          event?.organizer_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(keyword);
      });
    }

    if (selectedCategory !== "Semua") {
      result = result.filter(
        (event) =>
          getCategory(event) === selectedCategory
      );
    }

    if (sortBy === "Terlama") {
      result.sort(
        (a, b) =>
          Number(a.id || 0) - Number(b.id || 0)
      );
    } else if (sortBy === "Tanggal") {
      result.sort((a, b) => {
        const dateA = new Date(
          getEventDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getEventDate(b) || 0
        ).getTime();

        return dateA - dateB;
      });
    } else {
      result.sort(
        (a, b) =>
          Number(b.id || 0) - Number(a.id || 0)
      );
    }

    return result;
  }, [events, search, selectedCategory, sortBy]);

  /* ================= FEATURED ================= */

  const featuredEvent = useMemo(() => {
    if (search.trim() || selectedCategory !== "Semua") {
      return null;
    }

    return events[0] || null;
  }, [events, search, selectedCategory]);

  const listEvents = useMemo(() => {
    if (!featuredEvent) return filteredEvents;

    return filteredEvents.filter(
      (event) =>
        String(event.id) !== String(featuredEvent.id)
    );
  }, [filteredEvents, featuredEvent]);

  const openDetail = (id) => {
    if (!id) return;

    router.push({
      pathname: "/events/[id]",
      params: { id: String(id) },
    });
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("Semua");
    setSortBy("Terbaru");
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.loadingLogo}>
          <Ionicons
            name="ticket"
            size={32}
            color={COLORS.white}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.blue}
          style={{ marginTop: 22 }}
        />

        <Text style={styles.loadingTitle}>
          DISCOVER EVENTS
        </Text>

        <Text style={styles.loadingSubtitle}>
          Menyiapkan pengalaman terbaik untukmu...
        </Text>
      </View>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            tintColor={COLORS.blue}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerEyebrow}>
                TICKETVERSE
              </Text>

              <Text style={styles.headerTitle}>
                Jelajahi{"\n"}
                <Text style={styles.headerTitleBlue}>
                  Event.
                </Text>
              </Text>

              <Text style={styles.headerDescription}>
                Temukan pengalaman luar biasa
                {"\n"}di setiap momen.
              </Text>
            </View>

            <Pressable
              style={styles.headerIcon}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={COLORS.navy}
              />
            </Pressable>
          </View>

          {/* SEARCH */}

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={21}
              color={COLORS.muted}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari konser, festival, artis..."
              placeholderTextColor={COLORS.muted}
              style={styles.searchInput}
              returnKeyType="search"
            />

            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={COLORS.muted}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* ERROR */}

        {!!error && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={COLORS.red}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.errorTitle}>
                Gagal memuat event
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>

            <Pressable onPress={() => loadEvents()}>
              <Ionicons
                name="refresh"
                size={20}
                color={COLORS.blue}
              />
            </Pressable>
          </View>
        )}

        {!error && (
          <>
            {/* FEATURED */}

            {featuredEvent && (
              <View style={styles.featuredSection}>
                <SectionHeader
                  eyebrow="EDITOR'S CHOICE"
                  title="Event Unggulan"
                />

                <FeaturedEvent
                  event={featuredEvent}
                  onPress={() =>
                    openDetail(featuredEvent.id)
                  }
                />
              </View>
            )}

            {/* CATEGORY */}

            <View style={styles.categorySection}>
              <SectionHeader
                eyebrow="FIND YOUR VIBE"
                title="Kategori Event"
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {categories.map((category) => {
                  const active =
                    selectedCategory === category;

                  return (
                    <Pressable
                      key={category}
                      onPress={() =>
                        setSelectedCategory(category)
                      }
                      style={[
                        styles.categoryChip,
                        active && styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          active && styles.categoryTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ALL EVENTS */}

            <View style={styles.allEventsSection}>
              <SectionHeader
                eyebrow="EXPLORE COLLECTION"
                title="Semua Event"
              />

              <View style={styles.resultRow}>
                <Text style={styles.resultText}>
                  Menampilkan{" "}
                  <Text style={styles.resultCount}>
                    {filteredEvents.length} event
                  </Text>
                </Text>

                <Pressable
                  style={styles.sortButton}
                  onPress={() =>
                    setSortBy((current) =>
                      current === "Terbaru"
                        ? "Tanggal"
                        : current === "Tanggal"
                        ? "Terlama"
                        : "Terbaru"
                    )
                  }
                >
                  <Ionicons
                    name="swap-vertical"
                    size={14}
                    color={COLORS.blue}
                  />

                  <Text style={styles.sortText}>
                    {sortBy}
                  </Text>
                </Pressable>
              </View>

              {filteredEvents.length === 0 ? (
                <EmptyState
                  searching={
                    !!search || selectedCategory !== "Semua"
                  }
                  onReset={resetFilters}
                />
              ) : (
                <View style={styles.eventGrid}>
                  {listEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onPress={() =>
                        openDetail(event.id)
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            {/* BOTTOM INFORMATION */}

            <View style={styles.bottomBanner}>
              <LinearGradient
                colors={[COLORS.navy, COLORS.navyLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bottomBannerGradient}
              >
                <View style={styles.bottomBannerIcon}>
                  <Ionicons
                    name="ticket-outline"
                    size={24}
                    color={COLORS.white}
                  />
                </View>

                <Text style={styles.bottomBannerTitle}>
                  Make every moment memorable.
                </Text>

                <Text style={styles.bottomBannerText}>
                  Your next unforgettable experience
                  starts here.
                </Text>
              </LinearGradient>
            </View>
          </>
        )}

        {/* FOOTER */}

        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons
              name="ticket"
              size={15}
              color={COLORS.blue}
            />

            <Text style={styles.footerBrand}>
              TICKETVERSE
            </Text>
          </View>

          <Text style={styles.footerText}>
            Your Premium Event Experience
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
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 45,
  },

  /* HEADER */

  header: {
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.blue,
    letterSpacing: 3,
  },

  headerTitle: {
    color: COLORS.navy,
    fontSize: 39,
    fontWeight: "900",
    lineHeight: 43,
    letterSpacing: -1.8,
    marginTop: 12,
  },

  headerTitleBlue: {
    color: COLORS.blue,
  },

  headerDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
    fontWeight: "500",
    marginTop: 10,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  /* SEARCH */

  searchContainer: {
    marginTop: 25,
    height: 55,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    paddingVertical: 0,
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  eyebrow: {
    color: COLORS.blue,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 5,
  },

  sectionTitle: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.blueLight,
    borderRadius: 10,
  },

  sectionActionText: {
    fontSize: 10,
    color: COLORS.blue,
    fontWeight: "900",
  },

  /* FEATURED */

  featuredSection: {
    marginTop: 10,
    paddingHorizontal: 22,
  },

  featuredCard: {
    height: 350,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: COLORS.navy,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 7,
  },

  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  featuredTop: {
    position: "absolute",
    top: 17,
    left: 17,
    right: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  featuredBadgeText: {
    color: COLORS.navy,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  featuredArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  featuredContent: {
    position: "absolute",
    left: 21,
    right: 21,
    bottom: 22,
  },

  featuredCategory: {
    color: "#93C5FD",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },

  featuredTitle: {
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  featuredMetaText: {
    color: "#DBEAFE",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },

  featuredButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 19,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 11,
  },

  featuredButtonText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "900",
  },

  /* CATEGORY */

  categorySection: {
    marginTop: 34,
  },

  categoryScroll: {
    paddingHorizontal: 22,
    paddingBottom: 5,
    gap: 9,
  },

  categoryChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 11,
  },

  categoryChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },

  categoryText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },

  categoryTextActive: {
    color: COLORS.white,
  },

  /* ALL EVENTS */

  allEventsSection: {
    marginTop: 34,
    paddingHorizontal: 22,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  resultText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  resultCount: {
    color: COLORS.navy,
    fontWeight: "900",
  },

  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sortText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "800",
  },

  eventGrid: {
    gap: 18,
  },

  /* EVENT CARD */

  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 12,
    elevation: 3,
  },

  eventImageContainer: {
    height: 185,
    backgroundColor: COLORS.navyLight,
    position: "relative",
    overflow: "hidden",
  },

  eventImage: {
    width: "100%",
    height: "100%",
  },

  categoryBadge: {
    position: "absolute",
    top: 13,
    left: 13,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },

  categoryBadgeText: {
    color: COLORS.navy,
    fontSize: 9,
    fontWeight: "900",
  },

  eventStatus: {
    position: "absolute",
    top: 13,
    right: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  eventStatusText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  eventContent: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 14,
  },

  eventTitle: {
    color: COLORS.navy,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginBottom: 10,
  },

  eventInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 7,
  },

  eventInfoText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "600",
    flex: 1,
  },

  eventCardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 15,
    marginBottom: 13,
  },

  eventFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  eventDateBlock: {
    width: 47,
    height: 49,
    backgroundColor: COLORS.blueLight,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  eventDateDay: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.navy,
    lineHeight: 21,
  },

  eventDateMonth: {
    fontSize: 8,
    color: COLORS.blue,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 2,
  },

  eventFooterText: {
    flex: 1,
  },

  eventFooterLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  eventFooterVenue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },

  eventExplore: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: COLORS.blueLight,
    alignItems: "center",
    justifyContent: "center",
  },

  /* IMAGE FALLBACK */

  imagePlaceholder: {
    backgroundColor: COLORS.navyLight,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: "#BFDBFE",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 9,
  },

  /* EMPTY */

  emptyContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 35,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    backgroundColor: COLORS.blueLight,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 17,
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
  },

  resetButton: {
    backgroundColor: COLORS.blueLight,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 17,
  },

  resetButtonText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "900",
  },

  /* ERROR */

  errorCard: {
    marginHorizontal: 22,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  errorTitle: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: "900",
  },

  errorText: {
    color: "#991B1B",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 16,
  },

  /* BOTTOM BANNER */

  bottomBanner: {
    marginHorizontal: 22,
    marginTop: 35,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.13,
    shadowRadius: 15,
    elevation: 5,
  },

  bottomBannerGradient: {
    padding: 23,
  },

  bottomBannerIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "rgba(37,99,235,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17,
  },

  bottomBannerTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  bottomBannerText: {
    color: "#BFDBFE",
    fontSize: 11,
    marginTop: 8,
    lineHeight: 18,
  },

  /* FOOTER */

  footer: {
    alignItems: "center",
    marginTop: 35,
    paddingBottom: 15,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  footerBrand: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 7,
    fontWeight: "600",
  },

  /* LOADING */

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingLogo: {
    width: 68,
    height: 68,
    borderRadius: 21,
    backgroundColor: COLORS.navy,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingTitle: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 23,
  },

  loadingSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 8,
  },
});
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../src/constants/colors";
import eventService from "../../src/services/event.service";

// MURNI DARI ENV, TANPA HARDCODE
const API_URL = String(
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const API_HOST = API_URL.replace(/\/api$/i, "");
const SERVICE_FEE = 5000;
const MAX_TICKETS = 6;

const unwrap = (response) => {
  let result = response?.data ?? response;

  for (let i = 0; i < 5; i++) {
    if (
      result &&
      !Array.isArray(result) &&
      typeof result === "object" &&
      result.data !== undefined
    ) {
      result = result.data;
    } else {
      break;
    }
  }

  return result;
};

const getEventPayload = (response) => {
  const result = unwrap(response);
  return result?.event ?? result;
};

const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;

  const image = path.trim();

  if (/^https?:\/\//i.test(image)) return image;

  if (image.startsWith("//")) {
    return `https:${image}`;
  }

  // Jika env belum di-set, kembalikan path bersih agar tidak error
  if (!API_HOST) {
    return image.replace(/^\/+/, "");
  }

  return `${API_HOST}/${image.replace(/^\/+/, "")}`;
};

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "Tanggal belum tersedia";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tanggal belum tersedia";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStock = (item) => {
  if (!item) return 0;

  const value =
    item.remaining_ticket ??
    item.remainingTicket ??
    item.stock ??
    item.available_quantity ??
    item.quota ??
    0;

  return Math.max(0, Number(value) || 0);
};

const getParamValue = (value) => {
  return Array.isArray(value) ? value[0] : value;
};

const parseSeatIds = (value) => {
  if (!value) return [];

  const rawIds = Array.isArray(value)
    ? value
    : String(value).split(",");

  return [
    ...new Set(
      rawIds
        .map((id) => Number(String(id).trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];
};

export default function CheckoutScreen() {
  const params = useLocalSearchParams();

  const eventId = getParamValue(params.eventId);
  const categoryId = getParamValue(params.categoryId);
  const quantityParam = getParamValue(params.quantity);
  const seatIdsParam = getParamValue(params.seatIds);

  const qty = Math.max(1, Math.floor(Number(quantityParam) || 1));

  const seatIds = useMemo(
    () => parseSeatIds(seatIdsParam),
    [seatIdsParam]
  );

  const [event, setEvent] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!eventId) {
        setErrorMessage("ID event tidak ditemukan pada URL.");
        setLoading(false);
        return;
      }

      if (!categoryId) {
        setErrorMessage("ID kategori tiket tidak ditemukan pada URL.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const response = await eventService.getById(eventId);
        const eventData = getEventPayload(response);

        const currentEventId = eventData?.id ?? eventData?.event_id;

        if (!eventData || !currentEventId) {
          setEvent(null);
          setCategory(null);
          setErrorMessage("Event tidak ditemukan atau belum dipublikasikan.");
          return;
        }

        const categories = Array.isArray(eventData.ticket_categories)
          ? eventData.ticket_categories
          : Array.isArray(eventData.ticketCategories)
            ? eventData.ticketCategories
            : [];

        const foundCategory = categories.find(
          (item) => String(item.id) === String(categoryId)
        );

        setEvent(eventData);
        setCategory(foundCategory || null);

        if (!foundCategory) {
          setErrorMessage("Kategori tiket tidak ditemukan untuk event ini.");
        }
      } catch (error) {
        console.error(
          "CHECKOUT LOAD ERROR:",
          error?.response?.data || error?.message || error
        );

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal memuat data checkout.";

        setErrorMessage(message);

        if (!isRefresh) {
          setEvent(null);
          setCategory(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId, categoryId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stock = useMemo(() => getStock(category), [category]);

  const price = Number(category?.price ?? 0);
  const subtotal = price * qty;
  const total = category ? subtotal + SERVICE_FEE : 0;

  const poster = getImageUrl(
    event?.poster ||
      event?.image ||
      event?.event_poster ||
      event?.poster_url
  );

  const eventName = event?.event_name || event?.name || "Event";
  const venue = event?.venue_name || event?.location || "Lokasi belum tersedia";
  const city = event?.city || null;
  const eventDate = event?.event_date || event?.date;
  const eventTime = event?.event_time || event?.time;
  const categoryName = category?.category_name || category?.name || "—";

  const seatMode = String(
    category?.seat_mode ??
      category?.seatMode ??
      category?.seat_type ??
      category?.seatType ??
      ""
  ).toUpperCase();

  const isNumberedCategory = seatMode === "NUMBERED";

  const isStockInsufficient = stock < qty;
  const isSoldOut = stock <= 0;

  const isSeatSelectionInvalid = isNumberedCategory && seatIds.length !== qty;

  const handleContinue = () => {
    if (!event || !category) {
      Alert.alert(
        "Data tidak tersedia",
        "Silakan kembali ke halaman event dan pilih tiket ulang."
      );
      return;
    }

    if (isSoldOut) {
      Alert.alert("Tiket Habis", "Stok tiket sudah tidak tersedia.");
      return;
    }

    if (qty > MAX_TICKETS) {
      Alert.alert(
        "Melebihi batas pembelian",
        `Maksimal pembelian adalah ${MAX_TICKETS} tiket.`
      );
      return;
    }

    if (qty > stock) {
      Alert.alert(
        "Stok tidak mencukupi",
        `Sisa tiket hanya ${stock}. Silakan pilih jumlah lain.`
      );
      return;
    }

    if (isNumberedCategory && seatIds.length !== qty) {
      Alert.alert(
        "Pilih Kursi",
        `Silakan pilih ${qty} kursi terlebih dahulu. Kursi yang diterima: ${seatIds.length}.`
      );
      return;
    }

    const currentEventId = event.id ?? event.event_id;

    router.push({
      pathname: "/checkout/order-summary",
      params: {
        eventId: String(currentEventId),
        categoryId: String(category.id),
        quantity: String(qty),
        seatIds: seatIds.join(","),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Memuat checkout...</Text>
      </View>
    );
  }

  if (!event || !category) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons name="alert-circle" size={42} color={COLORS.muted} />
        </View>

        <Text style={styles.heading}>Data pesanan tidak ditemukan</Text>

        <Text style={styles.emptyDescription}>
          {errorMessage || "Coba kembali ke halaman event dan pilih tiket ulang."}
        </Text>

        <Pressable style={styles.retryButton} onPress={() => loadData()}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryText}>Coba Lagi</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.link}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <View style={styles.backIconWrapper}>
            <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
          </View>
          <Text style={styles.heading}>Checkout</Text>
        </Pressable>

        <Text style={styles.pageTitle}>Konfirmasi Tiket</Text>

        <Text style={styles.subtitle}>
          Pastikan detail tiket sudah benar sebelum membuat pesanan.
        </Text>

        <View style={styles.card}>
          {poster ? (
            <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
          ) : null}

          <View style={styles.eventInfoHeader}>
            <View style={styles.labelWrapper}>
              <Text style={styles.label}>EVENT</Text>
            </View>
          </View>

          <Text style={styles.eventName}>{eventName}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="calendar" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.infoText}>
              {formatDate(eventDate)}
              {eventTime ? ` • ${eventTime}` : ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.infoText}>
              {venue}
              {city ? `, ${city}` : ""}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>KATEGORI TIKET</Text>
          <Text style={styles.categoryName}>{categoryName}</Text>

          {isNumberedCategory ? (
            <View style={styles.seatInfo}>
              <View style={styles.seatInfoIcon}>
                <Ionicons name="grid" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.seatInfoTitle}>Kursi bernomor</Text>
                <Text style={styles.seatInfoDescription}>
                  {seatIds.length} dari {qty} kursi terpilih
                </Text>
              </View>
              {isSeatSelectionInvalid ? (
                <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              )}
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Harga tiket</Text>
            <Text style={styles.value}>{rupiah(price)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Jumlah tiket</Text>
            <Text style={styles.value}>{qty} tiket</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sisa stok</Text>
            <Text style={[styles.value, isSoldOut && styles.stockEmpty]}>
              {stock} tiket
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Batas pembelian</Text>
            <Text style={styles.value}>Maksimal {MAX_TICKETS} tiket</Text>
          </View>

          {isSoldOut ? (
            <View style={[styles.warningBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={[styles.warningText, { color: COLORS.danger }]}>
                Tiket kategori ini sudah habis.
              </Text>
            </View>
          ) : null}

          {!isSoldOut && isStockInsufficient ? (
            <View style={[styles.warningBox, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
              <Text style={[styles.warningText, { color: "#B45309" }]}>
                Jumlah tiket melebihi stok yang tersedia.
              </Text>
            </View>
          ) : null}

          {isSeatSelectionInvalid ? (
            <View style={[styles.warningBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={[styles.warningText, { color: COLORS.danger }]}>
                Jumlah kursi belum sesuai. Kembali dan pilih {qty} kursi.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Subtotal ({qty} × {rupiah(price)})</Text>
            <Text style={styles.value}>{rupiah(subtotal)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Biaya layanan</Text>
            <Text style={styles.value}>{rupiah(SERVICE_FEE)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{rupiah(total)}</Text>
          </View>

          <Text style={styles.note}>
            Biaya tambahan dari penyedia pembayaran, jika ada, akan ditampilkan pada halaman pembayaran.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalBottomLabel}>Total Pembayaran</Text>
          <Text style={styles.totalBottom}>{rupiah(total)}</Text>
        </View>

        <Pressable
          style={[
            styles.button,
            (isSoldOut || isStockInsufficient || qty > MAX_TICKETS || isSeatSelectionInvalid) &&
              styles.disabled,
          ]}
          onPress={handleContinue}
          disabled={isSoldOut || isStockInsufficient || qty > MAX_TICKETS || isSeatSelectionInvalid}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Lanjutkan</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 24,
  },
  muted: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },
  heading: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageTitle: {
    color: COLORS.navy,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  poster: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: COLORS.border,
  },
  eventInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelWrapper: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  label: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  eventName: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  categoryName: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  infoIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.frost,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
    fontWeight: "600",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  rowLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "800",
  },
  totalLabel: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 15,
  },
  total: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  note: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 14,
    fontWeight: "500",
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  totalBottomLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  totalBottom: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 25,
    backgroundColor: COLORS.frost,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  emptyDescription: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  backButton: {
    marginTop: 16,
    padding: 10,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  stockEmpty: {
    color: COLORS.danger,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    lineHeight: 18,
  },
  seatInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#D3E2F5",
  },
  seatInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  seatInfoTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  seatInfoDescription: {
    color: COLORS.primaryDark,
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
});
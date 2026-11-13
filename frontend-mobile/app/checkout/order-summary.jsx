import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { createOrder } from "../../src/services/order.service";

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

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

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

export default function OrderSummaryScreen() {
  const params = useLocalSearchParams();

  const eventId = getParamValue(params.eventId);
  const categoryId = getParamValue(params.categoryId);
  const quantityParam = getParamValue(params.quantity);
  const seatIdsParam = getParamValue(params.seatIds);

  const qty = Math.max(1, Math.floor(Number(quantityParam) || 1));

  const seatIds = useMemo(() => {
    if (!seatIdsParam) return [];

    return String(seatIdsParam)
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);
  }, [seatIdsParam]);

  const [event, setEvent] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const price = Number(category?.price ?? 0);
  const total = price * qty;

  const stock = useMemo(() => getStock(category), [category]);

  const isSoldOut = stock <= 0;
  const isStockInsufficient = stock < qty;
  const isQuantityInvalid = qty > MAX_TICKETS || qty < 1;

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!eventId || !categoryId) {
        setErrorMessage("Data event atau kategori tidak ditemukan pada URL.");
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
        const result = unwrap(response);
        const eventData = result?.event ?? result;

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
          "ORDER SUMMARY ERROR:",
          error?.response?.data || error?.message || error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Tidak dapat memuat ringkasan pesanan."
        );

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

  const handleCreateOrder = async () => {
    if (processing) return;

    if (!event || !category) {
      Alert.alert(
        "Data tidak tersedia",
        "Silakan kembali ke halaman event dan pilih tiket kembali."
      );
      return;
    }

    if (isSoldOut) {
      Alert.alert("Tiket Habis", "Stok tiket sudah tidak tersedia.");
      return;
    }

    if (isQuantityInvalid) {
      Alert.alert(
        "Jumlah tiket tidak valid",
        `Jumlah pembelian minimal 1 dan maksimal ${MAX_TICKETS} tiket.`
      );
      return;
    }

    if (isStockInsufficient) {
      Alert.alert(
        "Stok tidak tersedia",
        `Sisa tiket hanya ${stock}. Silakan pilih jumlah lain.`
      );
      return;
    }

    if (seatIds.length > 0 && seatIds.length !== qty) {
      Alert.alert(
        "Jumlah kursi tidak sesuai",
        `Kamu memilih ${seatIds.length} kursi untuk ${qty} tiket.`
      );
      return;
    }

    try {
      setProcessing(true);

      const orderCode = `TV-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2, 8)
        .toUpperCase()}`;

      const payload = {
        order_code: orderCode,
        ticket_category_id: Number(categoryId),
        quantity: qty,
      };

      if (seatIds.length > 0) {
        payload.seat_ids = seatIds;
      }

      const response = await createOrder(payload);
      const result = unwrap(response);

      const order = result?.order ?? result?.data?.order ?? result;
      const payment =
        result?.payment ?? order?.payment ?? result?.data?.payment;

      if (!order?.id) {
        throw new Error(
          result?.message || "Backend tidak mengembalikan ID pesanan."
        );
      }

      const snapToken =
        payment?.snap_token ??
        payment?.token ??
        order?.snap_token ??
        "";

      const redirectUrl =
        payment?.redirect_url ??
        payment?.redirectUrl ??
        payment?.payment_url ??
        order?.redirect_url ??
        "";

      if (!snapToken && !redirectUrl) {
        throw new Error(
          "Pesanan berhasil dibuat, tetapi data pembayaran Midtrans tidak ditemukan."
        );
      }

      router.replace({
        pathname: "/checkout/payment",
        params: {
          orderId: String(order.id),
          orderCode: String(order.order_code || orderCode),
          snapToken: String(snapToken),
          redirectUrl: String(redirectUrl),
          total: String(order.total_price ?? order.total_amount ?? total),
        },
      });
    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error?.response?.data || error?.message || error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Terjadi kesalahan saat membuat pesanan.";

      Alert.alert("Gagal membuat pesanan", message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Memuat ringkasan...</Text>
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

  const eventName = event.event_name || event.name || "Event";
  const categoryName = category.category_name || category.name || "Kategori tiket";

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
          <Text style={styles.heading}>Ringkasan Pesanan</Text>
        </Pressable>

        <Text style={styles.pageTitle}>Konfirmasi Pesanan</Text>

        <Text style={styles.subtitle}>
          Periksa kembali pesanan sebelum membuat transaksi.
        </Text>

        <View style={styles.card}>
          <View style={styles.eventHeader}>
            <View style={styles.iconWrapper}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>EVENT</Text>
              <Text style={styles.eventName}>{eventName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.eventHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: COLORS.lightBlue }]}>
              <Ionicons name="ticket" size={20} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>KATEGORI TIKET</Text>
              <Text style={styles.categoryName}>{categoryName}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Harga satuan</Text>
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

          {seatIds.length > 0 ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Nomor Kursi</Text>
              <Text style={[styles.value, { color: COLORS.primary, flex: 1, textAlign: 'right' }]}>
                {seatIds.join(", ")}
              </Text>
            </View>
          ) : null}

          {isSoldOut ? (
            <View style={[styles.warningBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={[styles.warningText, { color: COLORS.danger }]}>
                Tiket kategori ini sudah habis.
              </Text>
            </View>
          ) : null}

          {isStockInsufficient && !isSoldOut ? (
            <View style={[styles.warningBox, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
              <Text style={[styles.warningText, { color: "#B45309" }]}>
                Jumlah tiket melebihi stok yang tersedia.
              </Text>
            </View>
          ) : null}

          {isQuantityInvalid ? (
            <View style={[styles.warningBox, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
              <Text style={[styles.warningText, { color: "#B45309" }]}>
                Jumlah pembelian maksimal {MAX_TICKETS} tiket.
              </Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total pesanan</Text>
            <Text style={styles.total}>{rupiah(total)}</Text>
          </View>
        </View>

        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Ionicons name="information-circle" size={20} color="#1D4ED8" />
          </View>
          <Text style={styles.noticeText}>
            Setelah pesanan dibuat, lanjutkan pembayaran melalui Midtrans. Tiket baru dianggap lunas setelah status pembayaran dikonfirmasi oleh backend.
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
            (processing || isSoldOut || isStockInsufficient || isQuantityInvalid) &&
              styles.disabled,
          ]}
          onPress={handleCreateOrder}
          disabled={processing || isSoldOut || isStockInsufficient || isQuantityInvalid}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Buat Pesanan</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
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
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.frost,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  eventName: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  categoryName: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
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
    fontWeight: "800",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  totalLabel: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 15,
  },
  total: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 20,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D3E2F5",
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    flex: 1,
    lineHeight: 20,
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
  link: {
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 15,
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
  stockEmpty: {
    color: COLORS.danger,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    lineHeight: 18,
  },
});
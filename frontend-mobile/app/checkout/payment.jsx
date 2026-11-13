import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../src/constants/colors";
import { getMidtransPaymentStatus } from "../../src/services/payment.service";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getParamValue = (value) =>
  Array.isArray(value) ? value[0] : value;

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

const SUCCESS_STATUSES = ["settlement", "capture", "success", "paid"];
const FAILED_STATUSES = ["deny", "cancel", "cancelled", "expire", "expired", "failure", "failed"];

const normalizeStatus = (value) => {
  const status = String(value || "pending").trim().toLowerCase();
  if (SUCCESS_STATUSES.includes(status)) return "Success";
  if (FAILED_STATUSES.includes(status)) return "Failed";
  return "Pending";
};

export default function PaymentScreen() {
  const params = useLocalSearchParams();

  const orderId = getParamValue(params.orderId);
  const orderCode = getParamValue(params.orderCode);
  const redirectUrl = getParamValue(params.redirectUrl);
  const total = getParamValue(params.total);

  const [checking, setChecking] = useState(false);
  const [opening, setOpening] = useState(false);
  const [status, setStatus] = useState("Pending");

  const openPayment = useCallback(async () => {
    if (!redirectUrl) {
      Alert.alert(
        "Link pembayaran tidak tersedia",
        "URL pembayaran Midtrans tidak ditemukan. Silakan periksa kembali pesanan."
      );
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(String(redirectUrl));
    } catch {
      Alert.alert("Link tidak valid", "URL pembayaran tidak valid.");
      return;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const validHost =
      hostname === "app.midtrans.com" ||
      hostname === "app.sandbox.midtrans.com";

    if (parsedUrl.protocol !== "https:" || !validHost) {
      Alert.alert(
        "Link pembayaran tidak valid",
        "URL bukan berasal dari halaman resmi Midtrans."
      );
      return;
    }

    try {
      setOpening(true);
      await Linking.openURL(String(redirectUrl));
    } catch (error) {
      console.error("OPEN PAYMENT ERROR:", error?.message || error);
      Alert.alert(
        "Gagal membuka pembayaran",
        error?.message || "Tidak dapat membuka halaman pembayaran Midtrans."
      );
    } finally {
      setOpening(false);
    }
  }, [redirectUrl]);

  const checkStatus = useCallback(async () => {
    if (checking) return;

    if (!orderCode) {
      Alert.alert(
        "Kode pesanan tidak ditemukan",
        "Tidak dapat memeriksa status pembayaran."
      );
      return;
    }

    try {
      setChecking(true);

      const response = await getMidtransPaymentStatus(orderCode);
      const result = unwrap(response);

      const paymentStatus =
        result?.payment_status ||
        result?.transaction_status ||
        result?.payment?.transaction_status ||
        result?.payment?.payment_status ||
        result?.payment?.status ||
        result?.order?.payment_status ||
        result?.status ||
        "pending";

      const normalized = normalizeStatus(paymentStatus);
      setStatus(normalized);

      if (normalized === "Success") {
        Alert.alert(
          "Pembayaran berhasil",
          "Pembayaran telah dikonfirmasi oleh server.",
          [
            {
              text: "Lihat Tiket",
              onPress: () => router.replace("/my-tickets"),
            },
          ]
        );
        return;
      }

      if (normalized === "Failed") {
        Alert.alert(
          "Pembayaran belum berhasil",
          `Status pembayaran: ${paymentStatus}`
        );
        return;
      }

      Alert.alert(
        "Pembayaran masih diproses",
        "Pembayaran belum dikonfirmasi. Silakan selesaikan pembayaran atau periksa kembali beberapa saat lagi."
      );
    } catch (error) {
      console.error(
        "CHECK PAYMENT ERROR:",
        error?.response?.data || error?.message || error
      );
      Alert.alert(
        "Gagal memeriksa pembayaran",
        error?.response?.data?.message ||
          error?.message ||
          "Tidak dapat mengambil status pembayaran."
      );
    } finally {
      setChecking(false);
    }
  }, [orderCode, checking]);

  const getStatusStyle = () => {
    if (status === "Success") {
      return {
        badge: styles.successBadge,
        text: styles.successText,
        icon: "checkmark-circle",
        color: COLORS.success,
      };
    }
    if (status === "Failed") {
      return {
        badge: styles.failedBadge,
        text: styles.failedText,
        icon: "close-circle",
        color: COLORS.danger,
      };
    }
    return {
      badge: styles.pendingBadge,
      text: styles.pendingText,
      icon: "time",
      color: COLORS.warning,
    };
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.iconCircle}
          >
            <Ionicons name="card" size={38} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.title}>Selesaikan Pembayaran</Text>
          <Text style={styles.subtitle}>
            Pesanan kamu sudah berhasil dibuat. Lanjutkan pembayaran melalui halaman resmi Midtrans.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.label}>KODE PESANAN</Text>
              <Text style={styles.orderCode}>{orderCode || "-"}</Text>
            </View>
            <View style={[styles.statusBadge, statusStyle.badge]}>
              <Ionicons name={statusStyle.icon} size={14} color={statusStyle.color} />
              <Text style={[styles.statusText, statusStyle.text]}>{status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>ID Pesanan</Text>
            <Text style={styles.value}>{orderId || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Pembayaran</Text>
            <Text style={styles.total}>{rupiah(total)}</Text>
          </View>
        </View>

        <View style={styles.information}>
          <View style={styles.shieldIcon}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.success} />
          </View>
          <Text style={styles.informationText}>
            Pembayaran diproses melalui Midtrans yang aman dan terenkripsi. Status transaksi akan diperbarui secara otomatis setelah server menerima notifikasi pembayaran.
          </Text>
        </View>

        {status !== "Success" && (
          <Pressable
            style={[styles.payButtonContainer, (opening || !redirectUrl) && styles.disabled]}
            onPress={openPayment}
            disabled={opening || !redirectUrl}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payButton}
            >
              {opening ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                  <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}

        <Pressable
          style={[styles.checkButton, checking && styles.disabled]}
          onPress={checkStatus}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color={COLORS.primary} />
              <Text style={styles.checkButtonText}>Periksa Status Pembayaran</Text>
            </>
          )}
        </Pressable>

        {status === "Success" && (
          <Pressable
            style={styles.ticketButtonContainer}
            onPress={() => router.replace("/my-tickets")}
          >
            <LinearGradient
              colors={[COLORS.success, "#15803D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ticketButton}
            >
              <Ionicons name="ticket" size={18} color="#FFFFFF" />
              <Text style={styles.ticketButtonText}>Lihat Tiket Saya</Text>
            </LinearGradient>
          </Pressable>
        )}

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
    maxWidth: "85%",
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  orderCode: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  pendingText: { color: "#92400E" },
  successBadge: { backgroundColor: "#DCFCE7" },
  successText: { color: "#166534" },
  failedBadge: { backgroundColor: "#FEE2E2" },
  failedText: { color: "#991B1B" },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
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
    fontWeight: "800",
    fontSize: 14,
  },
  total: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 18,
  },
  information: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 24,
  },
  shieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  informationText: {
    flex: 1,
    color: "#166534",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
  },
  payButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 12,
  },
  payButton: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  checkButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  checkButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  ticketButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  ticketButton: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  ticketButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  homeButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  homeButtonText: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
});
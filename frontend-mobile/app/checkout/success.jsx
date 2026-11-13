
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/colors";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams();

  const orderId = params.orderId;
  const orderCode = params.orderCode;
  const eventName = params.eventName;
  const categoryName = params.categoryName;
  const quantity = params.quantity;
  const total = params.total;
  const redirectUrl = params.redirectUrl;

  const handlePayment = () => {
    if (
      !redirectUrl ||
      !/^https:\/\/app\.(sandbox\.)?midtrans\.com\//i.test(
        String(redirectUrl)
      )
    ) {
      return;
    }

    router.replace({
      pathname: "/checkout/payment",
      params: {
        orderId: String(orderId || ""),
        orderCode: String(orderCode || ""),
        redirectUrl: String(redirectUrl),
        total: String(total || 0),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={52} color="#FFFFFF" />
      </View>

      <Text style={styles.title}>Pesanan Berhasil Dibuat!</Text>

      <Text style={styles.subtitle}>
        Pesanan kamu berhasil dibuat. Silakan lanjutkan pembayaran
        melalui Midtrans untuk mendapatkan tiket.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>KODE PESANAN</Text>
        <Text style={styles.orderCode}>{orderCode || "-"}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>NAMA EVENT</Text>
        <Text style={styles.value}>{eventName || "-"}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Kategori Tiket</Text>
          <Text style={styles.value}>{categoryName || "-"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Jumlah Tiket</Text>
          <Text style={styles.value}>{quantity || 0} tiket</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>ID Pesanan</Text>
          <Text style={styles.value}>{orderId || "-"}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.total}>{rupiah(total)}</Text>
        </View>

        <View style={styles.pending}>
          <Ionicons name="time-outline" size={18} color="#92400E" />
          <Text style={styles.pendingText}>Menunggu Pembayaran</Text>
        </View>
      </View>

      <Pressable style={styles.payButton} onPress={handlePayment}>
        <Ionicons name="card-outline" size={20} color="#FFFFFF" />
        <Text style={styles.payButtonText}>Bayar Sekarang</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </Pressable>

      <Pressable
        style={styles.homeButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: "#F4F7FC",
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#0D1F42",
    textAlign: "center",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginVertical: 15,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
  },
  label: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  orderCode: {
    color: "#0D1F42",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 7,
  },
  value: {
    color: "#0D1F42",
    fontSize: 13,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 17,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 15,
  },
  totalLabel: {
    color: "#0D1F42",
    fontWeight: "800",
  },
  total: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 18,
  },
  pending: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  pendingText: {
    color: "#92400E",
    fontWeight: "800",
    fontSize: 12,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    padding: 17,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 22,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    flex: 1,
    textAlign: "center",
  },
  homeButton: {
    alignItems: "center",
    padding: 17,
  },
  homeButtonText: {
    color: "#64748B",
    fontWeight: "800",
  },
});

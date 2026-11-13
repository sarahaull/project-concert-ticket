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
  StatusBar,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";

import { COLORS } from "../../src/constants/colors";
import api from "../../src/services/api";
import { getSavedUser } from "../../src/services/auth.service";

// MURNI DARI ENV, TANPA HARDCODE
const API_BASE_URL = String(
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/api\/?$/, "").replace(/\/+$/, "");

const isPaid = (status) => {
  const value = String(status || "").toLowerCase().trim();
  return ["paid", "success", "settlement", "completed", "berhasil", "lunas"].includes(value);
};

const getArray = (response, keys = []) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getImageUrl = (value) => {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }
  
  // Jika env belum di-set, kembalikan path bersih agar tidak error
  if (!API_BASE_URL) {
    return value.replace(/^\/+/, "");
  }

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const formatDate = (date, time) => {
  if (!date) return "Jadwal belum tersedia";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return `${date}${time ? ` • ${time}` : ""}`;
  }
  const formatted = parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return `${formatted}${time ? ` • ${String(time).slice(0, 5)}` : ""}`;
};

const getTicketImage = (ticket) => {
  const event = ticket?.event || {};
  const order = ticket?.order || {};
  const detail = ticket?.order_detail || ticket?.orderDetail || {};

  return getImageUrl(
    ticket?.poster || ticket?.event_poster || ticket?.image ||
    event?.poster || event?.image || order?.poster || detail?.event?.poster
  );
};

const normalizeTicket = (ticket) => {
  const event = ticket?.event || {};
  const order = ticket?.order || {};
  const detail = ticket?.order_detail || ticket?.orderDetail || {};
  const category = ticket?.ticket_category || ticket?.ticketCategory || detail?.ticket_category || detail?.ticketCategory || {};

  const eventName = ticket?.event_name || event?.event_name || event?.name || order?.event_name || "Event TicketVerse";
  const categoryName = ticket?.category_name || ticket?.ticket_category_name || category?.category_name || category?.name || "Regular";
  const eventDate = ticket?.event_date || event?.event_date || event?.date || order?.event_date;
  const eventTime = ticket?.event_time || event?.event_time || event?.time || order?.event_time;
  const venue = ticket?.venue_name || ticket?.venue || event?.venue_name || event?.venue || order?.venue_name || "Lokasi belum tersedia";
  const ticketCode = ticket?.ticket_code || ticket?.code || ticket?.qr_code || `TKT-${ticket?.id || "-"}`;

  return {
    ...ticket,
    displayId: ticket?.id,
    eventName,
    categoryName,
    dateLabel: formatDate(eventDate, eventTime),
    venue,
    ticketCode: String(ticketCode),
    image: getTicketImage(ticket),
    status: ticket?.check_in ? "Sudah digunakan" : "Valid",
    used: Boolean(ticket?.check_in),
  };
};

export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const savedUser = await getSavedUser();

      const [ordersResponse, ticketsResponse] = await Promise.all([
        api.get("/orders"),
        api.get("/tickets"),
      ]);

      const orders = getArray(ordersResponse, ["orders"]);
      const allTickets = getArray(ticketsResponse, ["tickets"]);

      const userId = savedUser?.id || savedUser?.user_id;

      const userOrders = orders.filter((order) => {
        const orderUserId = order?.user_id || order?.userId;
        if (userId && orderUserId) return String(orderUserId) === String(userId);
        return true;
      });

      const paidOrders = userOrders.filter((order) => isPaid(order?.payment_status || order?.status));
      const paidOrderIds = new Set(paidOrders.map((order) => String(order.id)));

      const validTickets = allTickets.filter((ticket) => {
        const orderId = ticket?.order_id || ticket?.orderId || ticket?.order?.id || ticket?.order_detail?.order_id || ticket?.orderDetail?.order_id;
        if (orderId) return paidOrderIds.has(String(orderId));
        return isPaid(ticket?.payment_status || ticket?.order?.payment_status || ticket?.status);
      });

      const normalized = validTickets
        .map(normalizeTicket)
        .sort((a, b) => Number(b.displayId || 0) - Number(a.displayId || 0));

      setTickets(normalized);
    } catch (err) {
      console.error("FETCH MY TICKETS ERROR:", err?.response?.data || err?.message || err);
      setError(err?.response?.data?.message || "Tidak dapat mengambil data tiket. Silakan coba kembali.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const handleRefresh = () => fetchTickets(true);
  const handleOpenTicket = (ticket) => setSelectedTicket(ticket);
  const handleCloseTicket = () => setSelectedTicket(null);

  const unusedTickets = tickets.filter((ticket) => !ticket.used).length;
  const usedTickets = tickets.filter((ticket) => ticket.used).length;

  const renderTicket = (ticket) => (
    <View key={String(ticket.displayId)} style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketImageContainer}>
          {ticket.image ? (
            <Image source={{ uri: ticket.image }} style={styles.ticketImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={["#152D59", "#3159A4", "#182D54"]} style={styles.ticketImagePlaceholder}>
              <Ionicons name="musical-notes" size={42} color="#FFFFFF" />
            </LinearGradient>
          )}
          <LinearGradient colors={["transparent", "rgba(9, 21, 45, 0.85)"]} style={styles.imageOverlay} />
          
          <View style={styles.imageTopRow}>
            <View style={styles.brandBadge}>
              <Ionicons name="ticket" size={12} color="#FFFFFF" />
              <Text style={styles.brandText}>TICKETVERSE</Text>
            </View>
            <View style={[styles.statusBadge, ticket.used && styles.usedBadge]}>
              <View style={[styles.statusDot, ticket.used && styles.usedDot]} />
              <Text style={styles.statusText}>{ticket.status}</Text>
            </View>
          </View>

          <View style={styles.imageEventInfo}>
            <Text style={styles.categoryText}>{ticket.categoryName.toUpperCase()}</Text>
            <Text style={styles.eventTitle} numberOfLines={2}>{ticket.eventName}</Text>
            <View style={styles.imageLocation}>
              <Ionicons name="location" size={13} color="#DCE7FF" />
              <Text style={styles.imageLocationText} numberOfLines={1}>{ticket.venue}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.ticketBody}>
        <View style={styles.cutoutLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.cutoutRight} />

        <View style={styles.ticketDetails}>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>TANGGAL EVENT</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{ticket.dateLabel}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="pricetag" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>KATEGORI</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{ticket.categoryName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.codeContainer}>
          <View style={styles.codeWrapper}>
            <Text style={styles.codeLabel}>KODE TIKET</Text>
            <Text style={styles.codeValue}>{ticket.ticketCode}</Text>
          </View>
        </View>
      </View>

      <Pressable style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.8 }]} onPress={() => handleOpenTicket(ticket)}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark || "#173A78"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionGradient}
        >
          <Ionicons name="qr-code" size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Tampilkan QR Code</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>YOUR COLLECTION</Text>
            <Text style={styles.headerTitle}>Tiket Saya</Text>
            <Text style={styles.headerSubtitle}>Semua pengalaman event kamu, dalam satu tempat.</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="ticket" size={26} color={COLORS.primary} />
          </View>
        </View>

        <LinearGradient
          colors={[COLORS.navy, COLORS.primaryDark, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>TOTAL TIKET DIMILIKI</Text>
              <Text style={styles.summaryNumber}>{tickets.length}</Text>
              <Text style={styles.summaryCaption}>Tiket dari transaksi berhasil</Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons name="ticket-outline" size={32} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <View style={styles.summaryStatIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#8BF0C1" />
              </View>
              <View>
                <Text style={styles.summaryStatNumber}>{unusedTickets}</Text>
                <Text style={styles.summaryStatLabel}>Belum digunakan</Text>
              </View>
            </View>

            <View style={styles.summaryStatSeparator} />

            <View style={styles.summaryStat}>
              <View style={styles.summaryStatIcon}>
                <Ionicons name="checkmark-done-circle" size={16} color="#BBD3FF" />
              </View>
              <View>
                <Text style={styles.summaryStatNumber}>{usedTickets}</Text>
                <Text style={styles.summaryStatLabel}>Sudah digunakan</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Koleksi Tiket</Text>
            <Text style={styles.sectionSubtitle}>Tiket event yang berhasil kamu beli</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{tickets.length}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Memuat tiket kamu...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cloud-offline" size={36} color={COLORS.warning} />
            </View>
            <Text style={styles.emptyTitle}>Gagal Memuat Tiket</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => fetchTickets()}>
              <Ionicons name="refresh" size={17} color="#FFFFFF" />
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="ticket" size={38} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Tiket</Text>
            <Text style={styles.emptyDescription}>
              Tiket dari pesanan yang berhasil dibayar akan muncul di halaman ini. Yuk, temukan event menarik berikutnya!
            </Text>
            <Pressable style={styles.exploreButton} onPress={() => router.push("/events")}>
              <Text style={styles.exploreButtonText}>Jelajahi Event</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          tickets.map(renderTicket)
        )}

        <View style={styles.bottomNote}>
          <Ionicons name="shield-checkmark" size={17} color={COLORS.muted} />
          <Text style={styles.bottomNoteText}>Simpan tiket kamu dan tunjukkan kepada petugas saat memasuki event.</Text>
        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedTicket)} transparent animationType="slide" onRequestClose={handleCloseTicket}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>DIGITAL TICKET</Text>
                <Text style={styles.modalTitle}>Detail Tiket</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={handleCloseTicket}>
                <Ionicons name="close" size={22} color={COLORS.navy} />
              </Pressable>
            </View>

            {selectedTicket && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={styles.qrCard}>
                  <View style={styles.qrIcon}>
                    <Ionicons name="qr-code" size={50} color={COLORS.primary} />
                  </View>
                  <Text style={styles.qrTitle}>Kode Tiket Kamu</Text>
                  <Text style={styles.qrDescription}>Gunakan kode ini untuk identifikasi tiket saat check-in.</Text>
                  
                  <View style={styles.codeBox}>
                    <Text style={styles.codeBoxValue}>{selectedTicket.ticketCode}</Text>
                  </View>

                  <View style={styles.qrStatus}>
                    <Ionicons
                      name={selectedTicket.used ? "checkmark-done-circle" : "checkmark-circle"}
                      size={17}
                      color={selectedTicket.used ? COLORS.muted : COLORS.success}
                    />
                    <Text style={[styles.qrStatusText, selectedTicket.used && { color: COLORS.muted }]}>
                      {selectedTicket.used ? "Tiket sudah digunakan" : "Tiket valid"}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalEventInfo}>
                  <Text style={styles.modalEventName}>{selectedTicket.eventName}</Text>
                  
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar" size={18} color={COLORS.primary} />
                    <Text style={styles.modalInfoText}>{selectedTicket.dateLabel}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="location" size={18} color={COLORS.primary} />
                    <Text style={styles.modalInfoText}>{selectedTicket.venue}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="pricetag" size={18} color={COLORS.primary} />
                    <Text style={styles.modalInfoText}>{selectedTicket.categoryName}</Text>
                  </View>
                </View>

                <Text style={styles.modalDisclaimer}>
                  Jangan bagikan kode tiket kepada orang lain. Petugas event akan melakukan verifikasi sebelum kamu masuk.
                </Text>
              </ScrollView>
            )}

            <Pressable style={styles.modalCloseAction} onPress={handleCloseTicket}>
              <Text style={styles.modalCloseActionText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 35 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerEyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 5 },
  headerTitle: { color: COLORS.navy, fontSize: 29, fontWeight: "900", letterSpacing: -0.8 },
  headerSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 5, fontWeight: "500" },
  headerIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryCard: {
    borderRadius: 25,
    padding: 21,
    marginBottom: 30,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 7,
  },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { color: "#C8D8F5", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  summaryNumber: { color: "#FFFFFF", fontSize: 43, fontWeight: "900", marginTop: 3 },
  summaryCaption: { color: "#C8D8F5", fontSize: 11, marginTop: 1 },
  summaryIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 19 },
  summaryStats: { flexDirection: "row", alignItems: "center" },
  summaryStat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  summaryStatIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryStatNumber: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  summaryStatLabel: { color: "#C8D8F5", fontSize: 10, marginTop: 2 },
  summaryStatSeparator: { width: 1, height: 35, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 17 },
  sectionTitle: { color: COLORS.navy, fontSize: 19, fontWeight: "900" },
  sectionSubtitle: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  countBadgeText: { color: COLORS.primary, fontSize: 13, fontWeight: "900" },

  ticketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  ticketHeader: {
    height: 170,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    backgroundColor: COLORS.primaryDark,
  },
  ticketImageContainer: { width: "100%", height: "100%", position: "relative" },
  ticketImage: { width: "100%", height: "100%", position: "absolute" },
  ticketImagePlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  imageTopRow: {
    position: "absolute",
    top: 15,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  brandText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  usedBadge: { backgroundColor: "#E2E8F0" },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  usedDot: { backgroundColor: COLORS.muted },
  statusText: { color: COLORS.success, fontSize: 9, fontWeight: "900" },
  imageEventInfo: { position: "absolute", bottom: 16, left: 18, right: 18 },
  categoryText: { color: "#A9C9FF", fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 5 },
  eventTitle: { color: "#FFFFFF", fontSize: 20, lineHeight: 25, fontWeight: "900" },
  imageLocation: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  imageLocationText: { color: "#DCE7FF", fontSize: 11, fontWeight: "600", flex: 1 },

  ticketBody: {
    position: "relative",
    backgroundColor: COLORS.surface,
  },
  cutoutLeft: {
    position: "absolute",
    top: -12,
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  cutoutRight: {
    position: "absolute",
    top: -12,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  dashedLine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    zIndex: 5,
  },
  ticketDetails: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    gap: 15,
  },
  detailItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.frost,
    justifyContent: "center",
    alignItems: "center",
  },
  detailTextContainer: { flex: 1 },
  detailLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 3 },
  detailValue: { color: COLORS.navy, fontSize: 12, fontWeight: "800" },
  codeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  codeWrapper: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  codeLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  codeValue: { color: COLORS.primary, fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  actionButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    gap: 10,
  },
  actionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", flex: 1, textAlign: "center" },

  centerState: { alignItems: "center", paddingVertical: 55 },
  stateText: { color: COLORS.muted, fontSize: 13, fontWeight: "600", marginTop: 13 },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: COLORS.frost,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17,
  },
  emptyTitle: { color: COLORS.navy, fontSize: 18, fontWeight: "900" },
  emptyDescription: { color: COLORS.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 8, fontWeight: "500" },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 21,
  },
  exploreButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 11,
    marginTop: 18,
  },
  retryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  bottomNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, paddingHorizontal: 10 },
  bottomNoteText: { color: COLORS.muted, fontSize: 11, lineHeight: 17, flex: 1, fontWeight: "500" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(9, 20, 40, 0.65)", justifyContent: "flex-end" },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 25,
    maxHeight: "90%",
  },
  modalHandle: { width: 45, height: 5, borderRadius: 5, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalEyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.7 },
  modalTitle: { color: COLORS.navy, fontSize: 24, fontWeight: "900", marginTop: 4 },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.frost,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { paddingBottom: 15 },
  qrCard: {
    backgroundColor: COLORS.background,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrIcon: {
    width: 110,
    height: 110,
    borderRadius: 24,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  qrTitle: { color: COLORS.navy, fontSize: 18, fontWeight: "900" },
  qrDescription: { color: COLORS.muted, fontSize: 12, textAlign: "center", lineHeight: 18, marginTop: 7, fontWeight: "500" },
  codeBox: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  codeBoxValue: { color: COLORS.primaryDark, fontSize: 18, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" },
  qrStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 17 },
  qrStatusText: { color: COLORS.success, fontSize: 12, fontWeight: "800" },
  modalEventInfo: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 20, marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
  modalEventName: { color: COLORS.navy, fontSize: 17, fontWeight: "900", marginBottom: 16 },
  modalInfoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  modalInfoText: { color: COLORS.text, fontSize: 13, fontWeight: "600", flex: 1 },
  modalDisclaimer: { color: COLORS.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 18, paddingHorizontal: 10, fontWeight: "500" },
  modalCloseAction: { backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 15 },
  modalCloseActionText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
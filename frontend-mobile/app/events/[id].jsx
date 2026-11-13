import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../src/constants/colors";
import eventService from "../../src/services/event.service";

const { width } = Dimensions.get("window");

// MURNI DARI ENV, TANPA HARDCODE
const API_URL = String(
  process.env.EXPO_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const API_HOST = API_URL.replace(/\/api$/i, "");

const SERVICE_FEE = 5000;

const unwrap = (response) => {
  let result = response?.data ?? response;
  for (let i = 0; i < 4; i++) {
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

const getImageUrl = (value) => {
  if (!value) return null;
  let path = value;
  if (typeof value === "object") {
    path = value.url || value.path || value.image_url || value.image || value.filename || null;
  }
  if (typeof path !== "string") return null;
  const image = path.trim();
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("//")) return `https:${image}`;
  
  const cleanImage = image.replace(/^\/+/, "").replace(/^uploads\//i, "");
  
  // Jika env belum di-set, kembalikan path bersih agar tidak error
  if (!API_HOST) {
    return cleanImage;
  }

  return `${API_HOST}/uploads/${cleanImage}`;
};

const getSeatMap = (event) => {
  return getImageUrl(
    event?.seat_map_image ||
    event?.seatMapImage ||
    event?.seat_map ||
    event?.seatMap ||
    event?.layout_image ||
    event?.layoutImage
  );
};

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "Tanggal belum tersedia";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Tanggal belum tersedia";
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "Belum ditentukan";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Belum ditentukan";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusLabel = (status) => {
  const map = {
    "Coming Soon": "Segera Hadir",
    Available: "Tersedia",
    Limited: "Terbatas",
    "Sold Out": "Habis",
  };
  return map[status] || status || "—";
};

const statusColor = (status) => {
  const map = {
    "Coming Soon": { bg: "#FEF3C7", fg: "#B45309" },
    Available: { bg: "#DCFCE7", fg: "#15803D" },
    Limited: { bg: "#FED7AA", fg: "#C2410C" },
    "Sold Out": { bg: "#FEE2E2", fg: "#B91C1C" },
  };
  return map[status] || { bg: COLORS.border, fg: COLORS.muted };
};

const getEventPayload = (response) => {
  const result = unwrap(response);
  return result?.event ?? result;
};

const getStock = (item) => {
  const value =
    item?.remaining_ticket ??
    item?.remainingTicket ??
    item?.stock ??
    item?.available_quantity ??
    0;
  return Math.max(0, Number(value) || 0);
};

const getSeatStatus = (seat) => {
  const value = String(seat?.status || "").toLowerCase();
  if (["booked", "reserved", "sold", "terpesan", "terjual", "occupied"].includes(value)) return "booked";
  if (["blocked", "unavailable", "disabled", "terisi"].includes(value)) return "unavailable";
  return "available";
};

const getSeatLabel = (seat) => {
  return `${seat?.row_label || ""}${seat?.seat_number || ""}` || String(seat?.id || "");
};

export default function EventDetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [seats, setSeats] = useState([]);

  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setErrorMessage("ID event tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setErrorMessage("");

        const response = await eventService.getById(id);
        const eventData = getEventPayload(response);

        if (!eventData || !(eventData.id ?? eventData.event_id)) {
          setEvent(null);
          setCategories([]);
          setSections([]);
          setSeats([]);
          setSelected(null);
          return;
        }

        const eventCategories = Array.isArray(eventData.ticket_categories) ? eventData.ticket_categories : [];
        const eventSections = Array.isArray(eventData.sections) ? eventData.sections : [];
        const eventSeats = Array.isArray(eventData.seats) ? eventData.seats : [];

        setEvent(eventData);
        setCategories(eventCategories);
        setSections(eventSections);
        setSeats(eventSeats);

        setSelected((current) => {
          const currentCategory = eventCategories.find(
            (item) => String(item.id) === String(current?.id) && getStock(item) > 0
          );
          return currentCategory || eventCategories.find((item) => getStock(item) > 0) || null;
        });

        setSelectedSeats([]);
        setQuantity(1);
      } catch (error) {
        console.error("EVENT DETAIL ERROR:", error?.response?.data || error?.message || error);
        const message = error?.response?.data?.message || error?.message || "Gagal mengambil detail event. Periksa koneksi server.";
        setErrorMessage(message);

        if (!isRefresh) {
          setEvent(null);
          setCategories([]);
          setSections([]);
          setSeats([]);
          setSelected(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stock = useMemo(() => getStock(selected), [selected]);
  const price = Number(selected?.price || 0);
  const subtotal = price * quantity;
  const total = subtotal + SERVICE_FEE;

  const selectedSections = useMemo(() => {
    if (!selected) return [];
    return sections.filter((section) => String(section.ticket_category_id) === String(selected.id));
  }, [sections, selected]);

  const isNumbered = useMemo(() => {
    return selectedSections.some((section) => String(section.seat_mode || "").toUpperCase() === "NUMBERED");
  }, [selectedSections]);

  const seatMap = useMemo(() => getSeatMap(event), [event]);

  const availableSeatsForSelected = useMemo(() => {
    if (!selected) return [];
    const sectionIds = selectedSections.map((section) => String(section.id));
    return seats.filter((seat) => sectionIds.includes(String(seat.section_id)));
  }, [seats, selectedSections, selected]);

  const seatSummary = useMemo(() => {
    const available = availableSeatsForSelected.filter((seat) => getSeatStatus(seat) === "available").length;
    const booked = availableSeatsForSelected.filter((seat) => getSeatStatus(seat) === "booked").length;
    const unavailable = availableSeatsForSelected.filter((seat) => getSeatStatus(seat) === "unavailable").length;
    return { available, booked, unavailable, total: availableSeatsForSelected.length };
  }, [availableSeatsForSelected]);

  const isSoldOut = categories.length > 0 && categories.every((item) => getStock(item) <= 0);

  const changeQuantity = (amount) => {
    const next = quantity + amount;
    if (next < 1 || next > stock) return;
    setQuantity(next);
    setSelectedSeats((previous) => previous.slice(0, next));
  };

  const handleSelectCategory = (item) => {
    if (getStock(item) <= 0) {
      Alert.alert("Tiket Habis", "Kategori tiket ini sudah habis.");
      return;
    }
    setSelected(item);
    setQuantity(1);
    setSelectedSeats([]);
  };

  const toggleSeat = (seat) => {
    if (getSeatStatus(seat) !== "available") return;

    setSelectedSeats((previous) => {
      const seatId = String(seat.id);
      const alreadySelected = previous.some((id) => String(id) === seatId);

      if (alreadySelected) {
        return previous.filter((id) => String(id) !== seatId);
      }

      if (previous.length >= quantity) {
        Alert.alert("Maksimal Kursi", `Kamu hanya dapat memilih ${quantity} kursi.`);
        return previous;
      }

      return [...previous, seat.id];
    });
  };

  const handleContinue = () => {
    if (!selected) {
      Alert.alert("Pilih Tiket", "Silakan pilih kategori tiket terlebih dahulu.");
      return;
    }
    if (stock <= 0) {
      Alert.alert("Tiket Habis", "Stok tiket tidak tersedia.");
      return;
    }
    if (quantity < 1 || quantity > stock) {
      Alert.alert("Jumlah Tidak Valid", "Jumlah tiket melebihi stok.");
      return;
    }
    if (isNumbered && selectedSeats.length !== quantity) {
      Alert.alert("Pilih Kursi", `Silakan pilih ${quantity} kursi terlebih dahulu.`);
      return;
    }

    const eventId = event?.id ?? event?.event_id;

    if (!eventId || !selected?.id) {
      Alert.alert("Kesalahan", "Data event atau kategori tidak valid.");
      return;
    }

    router.push({
      pathname: "/checkout",
      params: {
        eventId: String(eventId),
        categoryId: String(selected.id),
        quantity: String(quantity),
        seatIds: selectedSeats.join(","),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Memuat detail event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons name="calendar-outline" size={42} color={COLORS.muted} />
        </View>
        <Text style={styles.emptyTitle}>Event tidak ditemukan</Text>
        <Text style={styles.emptyDescription}>
          {errorMessage || "Event mungkin sudah tidak tersedia."}
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

  const poster = getImageUrl(event.poster || event.image || event.event_poster);
  const eventName = event.event_name || event.name || "Event Tanpa Nama";
  const venue = event.venue_name || event.location || "Lokasi belum tersedia";
  const city = event.city || null;
  const description = event.description || "";
  const eventDate = event.event_date || event.date;
  const eventTime = event.event_time || event.time;
  const artistName = event.artist_name || event.artist?.artist_name;
  const categoryName = event.category_name;
  const saleStart = event.ticket_sale_start;
  const saleEnd = event.ticket_sale_end;
  const eventStatus = event.status;
  const sc = statusColor(eventStatus);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={[COLORS.primary]} />
        }
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <View style={styles.backIconWrapper}>
            <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
          </View>
          <Text style={styles.backText}>Detail Event</Text>
        </Pressable>

        <View style={styles.posterContainer}>
          {poster ? (
            <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterEmpty]}>
              <Ionicons name="musical-notes" size={48} color={COLORS.muted} />
              <Text style={styles.muted}>Poster tidak tersedia</Text>
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(13,31,66,0.85)"]}
            style={styles.posterGradient}
          />
          {eventStatus && (
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.fg }]}>
                {statusLabel(eventStatus)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{eventName}</Text>

          {categoryName && (
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Ionicons name="pricetag" size={12} color={COLORS.primary} />
                <Text style={styles.chipText}>{categoryName}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.info}>
              {formatDate(eventDate)}
              {eventTime ? ` • ${eventTime}` : ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.info}>
              {venue}
              {city ? `, ${city}` : ""}
            </Text>
          </View>

          {artistName && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="musical-notes" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.info}>{artistName}</Text>
            </View>
          )}

          {(saleStart || saleEnd) && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="time" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Penjualan Tiket</Text>
                <Text style={styles.info}>
                  {formatDateTime(saleStart)} → {formatDateTime(saleEnd)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {description ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tentang Event</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.seatMapHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Denah Lokasi</Text>
              <Text style={styles.muted}>Lihat tata letak area dan posisi kursi.</Text>
            </View>
            <Ionicons name="map" size={24} color={COLORS.primary} />
          </View>

          {seatMap ? (
            <View style={styles.seatMapImageContainer}>
              <Image
                source={{ uri: seatMap }}
                style={styles.seatMapImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.emptyMap}>
              <Ionicons name="image" size={40} color={COLORS.muted} />
              <Text style={styles.emptyCardTitle}>Denah Belum Tersedia</Text>
              <Text style={styles.muted}>Organizer belum mengunggah gambar denah.</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pilih Kategori Tiket</Text>
          <Text style={styles.categoryCount}>{categories.length} Kategori</Text>
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="ticket" size={36} color={COLORS.muted} />
            <Text style={styles.emptyCardTitle}>Tiket Belum Tersedia</Text>
            <Text style={styles.muted}>Belum ada kategori tiket untuk event ini.</Text>
          </View>
        ) : (
          categories.map((item) => {
            const itemStock = getStock(item);
            const active = String(selected?.id) === String(item.id);
            const soldOut = itemStock <= 0;
            const quota = Number(item.quota) || 0;

            const itemSections = sections.filter((section) => String(section.ticket_category_id) === String(item.id));
            const numbered = itemSections.some((section) => String(section.seat_mode).toUpperCase() === "NUMBERED");

            return (
              <Pressable
                key={String(item.id)}
                disabled={soldOut}
                onPress={() => handleSelectCategory(item)}
                style={[
                  styles.category,
                  active && styles.categoryActive,
                  soldOut && styles.soldOut,
                ]}
              >
                <View style={styles.categoryTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.categoryName, active && { color: COLORS.primaryDark }]}>
                      {item.category_name || item.name || "Kategori Tiket"}
                    </Text>
                    <Text style={styles.muted}>
                      {soldOut ? "Tiket habis" : `${itemStock} tiket tersedia${quota ? ` dari ${quota}` : ""}`}
                    </Text>
                  </View>
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                </View>

                <View style={styles.categoryFooter}>
                  <Text style={[styles.price, active && { color: COLORS.primary }]}>
                    {rupiah(item.price)}
                  </Text>
                  <View style={styles.badgeRow}>
                    {numbered && (
                      <View style={styles.numberedBadge}>
                        <Text style={styles.numberedText}>NUMBERED</Text>
                      </View>
                    )}
                    {soldOut && (
                      <View style={styles.soldOutBadge}>
                        <Text style={styles.soldOutText}>SOLD OUT</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        {selected && isNumbered ? (
          <View style={styles.card}>
            <View style={styles.seatMapHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Pemilihan Kursi</Text>
                <Text style={styles.muted}>{selected.category_name || selected.name}</Text>
              </View>
              <View style={styles.numberedBadge}>
                <Text style={styles.numberedText}>NUMBERED</Text>
              </View>
            </View>

            <View style={styles.stageContainer}>
              <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.stage}>
                <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
                <Text style={styles.stageText}>STAGE / PANGGUNG</Text>
              </LinearGradient>
            </View>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, styles.legendAvailable]} />
                <Text style={styles.legendText}>Tersedia</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, styles.legendSelected]} />
                <Text style={styles.legendText}>Dipilih</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, styles.legendBooked]} />
                <Text style={styles.legendText}>Terpesan</Text>
              </View>
            </View>

            <View style={styles.seatSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{seatSummary.available}</Text>
                <Text style={styles.summaryLabel}>Tersedia</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{seatSummary.booked}</Text>
                <Text style={styles.summaryLabel}>Terpesan</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{selectedSeats.length}/{quantity}</Text>
                <Text style={styles.summaryLabel}>Dipilih</Text>
              </View>
            </View>

            {selectedSections.map((section) => {
              const sectionSeats = availableSeatsForSelected.filter((seat) => String(seat.section_id) === String(section.id));

              return (
                <View key={String(section.id)} style={styles.sectionSeatContainer}>
                  <View style={styles.sectionSeatHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionSeatName}>{section.section_name}</Text>
                      <Text style={styles.muted}>{section.section_code}</Text>
                    </View>
                    <Text style={styles.categoryCount}>{sectionSeats.length} Kursi</Text>
                  </View>

                  <View style={styles.seatGrid}>
                    {sectionSeats.map((seat) => {
                      const seatId = String(seat.id);
                      const isSelected = selectedSeats.some((id) => String(id) === seatId);
                      const seatStatus = getSeatStatus(seat);
                      const isBooked = seatStatus === "booked";
                      const isUnavailable = seatStatus === "unavailable";

                      return (
                        <Pressable
                          key={seatId}
                          disabled={isBooked || isUnavailable}
                          onPress={() => toggleSeat(seat)}
                          style={[
                            styles.seatBox,
                            isBooked && styles.seatBooked,
                            isUnavailable && styles.seatUnavailable,
                            isSelected && styles.seatSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.seatText,
                              isSelected && styles.seatTextSelected,
                              (isBooked || isUnavailable) && styles.seatTextBooked,
                            ]}
                          >
                            {getSeatLabel(seat)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {sectionSeats.length === 0 && (
                    <Text style={styles.muted}>Belum ada kursi pada section ini.</Text>
                  )}
                </View>
              );
            })}

            {selectedSections.length === 0 && (
              <View style={styles.emptySeats}>
                <Ionicons name="grid" size={35} color={COLORS.muted} />
                <Text style={styles.emptyCardTitle}>Section Belum Tersedia</Text>
                <Text style={styles.muted}>Belum ada section untuk kategori tiket ini.</Text>
              </View>
            )}

            <Text style={styles.selectedSeatText}>
              Kursi terpilih:{" "}
              <Text style={{ color: COLORS.primary, fontWeight: "800" }}>
                {selectedSeats.length > 0
                  ? availableSeatsForSelected
                      .filter((seat) => selectedSeats.some((id) => String(id) === String(seat.id)))
                      .map(getSeatLabel)
                      .join(", ")
                  : "Belum ada"}
              </Text>
            </Text>
          </View>
        ) : null}

        {selected && stock > 0 ? (
          <View style={styles.card}>
            <View style={styles.quantityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.categoryName}>Jumlah Tiket</Text>
                <Text style={styles.muted}>Maksimal {stock} tiket</Text>
              </View>

              <View style={styles.quantityControl}>
                <Pressable
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityDisabled]}
                  onPress={() => changeQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={COLORS.navy} />
                </Pressable>
                <Text style={styles.quantity}>{quantity}</Text>
                <Pressable
                  style={[styles.quantityButton, quantity >= stock && styles.quantityDisabled]}
                  onPress={() => changeQuantity(1)}
                  disabled={quantity >= stock}
                >
                  <Ionicons name="add" size={20} color={COLORS.navy} />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {isSoldOut ? (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle" size={28} color={COLORS.danger} />
            <Text style={styles.emptyCardTitle}>Semua Tiket Habis</Text>
            <Text style={styles.muted}>Silakan pilih event lainnya.</Text>
          </View>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.total}>{rupiah(total)}</Text>
          <Text style={styles.totalDetail}>
            {quantity} × {rupiah(price)} + biaya layanan {rupiah(SERVICE_FEE)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            (!selected || stock <= 0 || (isNumbered && selectedSeats.length !== quantity)) && styles.disabled,
          ]}
          disabled={!selected || stock <= 0 || (isNumbered && selectedSeats.length !== quantity)}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Lanjutkan</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
    paddingTop: 10,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 25,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
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
  backText: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: "800",
  },
  posterContainer: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  poster: {
    width: "100%",
    height: 260,
    backgroundColor: COLORS.border,
  },
  posterGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  posterEmpty: {
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.navy,
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.frost,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.navy,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  categoryCount: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "700",
  },
  description: {
    color: COLORS.text,
    lineHeight: 24,
    fontSize: 14,
    marginTop: 10,
  },
  category: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  categoryTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    color: COLORS.navy,
    fontWeight: "900",
    marginBottom: 4,
  },
  categoryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  price: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: "900",
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  soldOut: {
    opacity: 0.6,
    backgroundColor: COLORS.frost,
  },
  soldOutBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldOutText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: "900",
  },
  numberedBadge: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  numberedText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },
  seatMapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  seatMapImageContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  seatMapImage: {
    width: "100%",
    height: 200,
  },
  emptyMap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  stageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  stage: {
    width: "80%",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  stageText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendAvailable: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  legendSelected: {
    backgroundColor: COLORS.primary,
  },
  legendBooked: {
    backgroundColor: COLORS.muted,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: "700",
  },
  seatSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.frost,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.lightBlue,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  summaryDivider: {
    height: 30,
    width: 1,
    backgroundColor: COLORS.border,
  },
  sectionSeatContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionSeatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionSeatName: {
    fontSize: 15,
    color: COLORS.navy,
    fontWeight: "900",
  },
  seatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  seatBox: {
    width: Math.min(48, (width - 100) / 5),
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  seatSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  seatBooked: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  seatUnavailable: {
    backgroundColor: COLORS.frost,
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  seatText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.text,
  },
  seatTextSelected: {
    color: "#FFFFFF",
  },
  seatTextBooked: {
    color: COLORS.muted,
  },
  selectedSeatText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    lineHeight: 20,
  },
  emptySeats: {
    alignItems: "center",
    padding: 25,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3E2F5",
  },
  quantityDisabled: {
    opacity: 0.4,
  },
  quantity: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "900",
    minWidth: 28,
    textAlign: "center",
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  total: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  totalDetail: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
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
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.navy,
    marginTop: 12,
    textAlign: "center",
  },
  emptyDescription: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
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
  emptyTitle: {
    fontSize: 20,
    color: COLORS.navy,
    fontWeight: "900",
    textAlign: "center",
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
  muted: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});
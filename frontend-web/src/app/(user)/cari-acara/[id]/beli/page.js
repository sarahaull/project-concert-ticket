"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ticket,
  CalendarDays,
  MapPin,
  Clock3,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Armchair,
  RefreshCw,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Tag,
  Users,
  Info,
  Sparkles,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const MAX_QUANTITY = 6;
const SERVICE_FEE = 5000;

const PAYMENT_METHODS = [
  { value: "qris", label: "QRIS", icon: QrCode },
  { value: "ewallet", label: "E-Wallet", icon: Smartphone },
  { value: "bank", label: "Transfer Bank", icon: Building2 },
  { value: "card", label: "Kartu Kredit", icon: CreditCard },
];

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatTanggal = (value) => {
  if (!value) return "Tanggal belum ditentukan";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const generateOrderCode = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TV-${Date.now()}-${random}`;
};

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.error)) return data.error.join(", ");
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.error?.message === "string") return data.error.message;
  return data?.message || fallback;
};

const getCategoryName = (category) =>
  category?.category_name ??
  category?.name ??
  category?.ticket_category_name ??
  "Kategori tiket";

const getCategoryPrice = (category) =>
  Number(category?.price ?? category?.ticket_price ?? 0);

const getCategoryStock = (category) =>
  Number(
    category?.remaining_ticket ??
      category?.remaining_tickets ??
      category?.stock ??
      0
  );

const getSeatStatus = (seat) =>
  String(seat?.display_status ?? seat?.status ?? "Available").toLowerCase();

const isSeatAvailable = (seat) =>
  ["available", "tersedia", ""].includes(getSeatStatus(seat));

const getSeatLabel = (seat) => `${seat.row_label || ""}-${seat.seat_number}`;

const extractCategories = (data) => {
  if (Array.isArray(data)) return data;
  return (
    data?.ticket_categories ??
    data?.ticketCategories ??
    data?.categories ??
    data?.data?.ticket_categories ??
    data?.data?.ticketCategories ??
    data?.data ??
    []
  );
};

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#112250] ring-1 ring-[#DDE4ED]">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export default function BeliTiketPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [agree, setAgree] = useState(false);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState("qris");

  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [refreshingSeats, setRefreshingSeats] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const apiRequest = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: { ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      throw new Error(
        getErrorMessage(data, `Permintaan gagal. HTTP ${response.status}`)
      );
    }
    return data;
  }, []);

  const loadSeatMap = useCallback(
    async (showLoading = false) => {
      if (!eventId) return;
      if (showLoading) setRefreshingSeats(true);
      try {
        const data = await apiRequest(
          `${API_URL}/api/seats/events/${encodeURIComponent(eventId)}`
        );
        if (!Array.isArray(data?.sections)) {
          throw new Error("Format data denah kursi dari backend tidak valid.");
        }
        setSections(data.sections);
        setNotice("");
        return data.sections;
      } catch (err) {
        console.error("LOAD SEAT MAP ERROR:", err);
        setError(err.message || "Gagal memuat denah kursi.");
        throw err;
      } finally {
        if (showLoading) setRefreshingSeats(false);
      }
    },
    [eventId, apiRequest]
  );

  const loadData = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const [eventData, categoriesData, seatData] = await Promise.all([
        apiRequest(`${API_URL}/api/events/${encodeURIComponent(eventId)}`),
        apiRequest(
          `${API_URL}/api/ticket-categories/event/${encodeURIComponent(eventId)}`
        ),
        apiRequest(
          `${API_URL}/api/seats/events/${encodeURIComponent(eventId)}`
        ),
      ]);

      const eventResult =
        eventData?.event ??
        eventData?.data?.event ??
        eventData?.data ??
        eventData;

      if (!eventResult?.id) throw new Error("Data acara tidak ditemukan.");

      const categories = extractCategories(categoriesData);
      if (!Array.isArray(categories))
        throw new Error("Data kategori tiket tidak valid.");

      const validCategories = categories.filter(
        (category) =>
          String(category.event_id ?? category.eventId) ===
          String(eventResult.id)
      );

      const seatSections = Array.isArray(seatData?.sections)
        ? seatData.sections
        : [];

      setEvent(eventResult);
      setTicketCategories(validCategories);
      setSections(seatSections);

      const firstAvailable = validCategories.find(
        (category) => getCategoryStock(category) > 0
      );
      setSelectedTicketId(firstAvailable ? String(firstAvailable.id) : "");
      setQuantity(1);
      setSelectedSeatIds([]);
    } catch (err) {
      console.error("LOAD BUY TICKET ERROR:", err);
      setError(err?.message || "Gagal memuat informasi acara.");
    } finally {
      setLoading(false);
    }
  }, [eventId, apiRequest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedTicket = useMemo(
    () =>
      ticketCategories.find(
        (ticket) => String(ticket.id) === String(selectedTicketId)
      ) || null,
    [ticketCategories, selectedTicketId]
  );

  const ticketPrice = selectedTicket ? getCategoryPrice(selectedTicket) : 0;
  const remainingStock = selectedTicket ? getCategoryStock(selectedTicket) : 0;
  const maxQuantity = Math.max(0, Math.min(MAX_QUANTITY, remainingStock));

  const categorySections = useMemo(() => {
    if (!selectedTicket) return [];
    return sections.filter(
      (section) =>
        String(section.ticket_category_id) === String(selectedTicket.id)
    );
  }, [sections, selectedTicket]);

  const requiresSeatSelection = categorySections.some(
    (section) =>
      String(section.seat_mode || "GENERAL").toUpperCase() === "NUMBERED"
  );

  const selectedSeats = useMemo(
    () =>
      categorySections.flatMap((section) =>
        (section.seats || [])
          .filter((seat) => selectedSeatIds.includes(Number(seat.id)))
          .map((seat) => ({
            ...seat,
            section_name: section.section_name,
            section_code: section.section_code,
          }))
      ),
    [categorySections, selectedSeatIds]
  );

  const seatSelectionValid = requiresSeatSelection
    ? selectedSeatIds.length === Number(quantity)
    : selectedSeatIds.length === 0;

  const subtotal = ticketPrice * quantity;
  const serviceFee = selectedTicket ? SERVICE_FEE : 0;
  const total = subtotal + serviceFee;

  const handleSelectTicket = (ticket) => {
    if (getCategoryStock(ticket) <= 0) {
      setError("Kategori tiket ini sudah habis.");
      return;
    }
    setSelectedTicketId(String(ticket.id));
    setQuantity(1);
    setSelectedSeatIds([]);
    setError("");
    setNotice("");
  };

  const handleQuantityChange = (nextQuantity) => {
    const nextValue = Number(nextQuantity);
    if (!Number.isInteger(nextValue)) return;
    const safeValue = Math.max(
      1,
      Math.min(MAX_QUANTITY, remainingStock, nextValue)
    );
    setQuantity(safeValue);
    setSelectedSeatIds((previous) => previous.slice(0, safeValue));
    setError("");
    setNotice("");
  };

  const handleToggleSeat = (seat) => {
    if (creatingOrder) return;
    if (
      !isSeatAvailable(seat) &&
      !selectedSeatIds.includes(Number(seat.id))
    ) {
      return;
    }
    const seatId = Number(seat.id);
    setSelectedSeatIds((previous) => {
      if (previous.includes(seatId)) {
        return previous.filter((id) => id !== seatId);
      }
      if (previous.length >= quantity) {
        setError(`Kamu hanya dapat memilih ${quantity} kursi.`);
        return previous;
      }
      setError("");
      setNotice("");
      return [...previous, seatId];
    });
  };

  const handleContinue = async () => {
    setError("");
    setNotice("");

    if (!selectedTicket) {
      setError("Pilih kategori tiket terlebih dahulu.");
      return;
    }
    if (remainingStock <= 0) {
      setError("Stok tiket kategori ini sudah habis.");
      return;
    }
    if (
      !Number.isInteger(Number(quantity)) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      setError("Jumlah tiket tidak valid.");
      return;
    }
    if (quantity > remainingStock) {
      setError(`Stok tiket hanya tersisa ${remainingStock}.`);
      return;
    }
    if (
      requiresSeatSelection &&
      selectedSeatIds.length !== Number(quantity)
    ) {
      setError(`Pilih tepat ${quantity} kursi sebelum melanjutkan.`);
      return;
    }
    if (new Set(selectedSeatIds).size !== selectedSeatIds.length) {
      setError("Terdapat kursi yang dipilih lebih dari satu kali.");
      return;
    }
    if (!agree) {
      setError("Silakan setujui ketentuan pembelian terlebih dahulu.");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    setCreatingOrder(true);
    try {
      if (requiresSeatSelection) {
        await loadSeatMap(false);
        const latestSections = await apiRequest(
          `${API_URL}/api/seats/events/${encodeURIComponent(eventId)}`
        );
        const latestSeats = (latestSections?.sections || []).flatMap(
          (section) =>
            (section.seats || []).map((seat) => ({
              ...seat,
              ticket_category_id: section.ticket_category_id,
            }))
        );
        const selectedStillAvailable = selectedSeatIds.every((id) => {
          const seat = latestSeats.find(
            (item) => Number(item.id) === Number(id)
          );
          return (
            seat &&
            String(seat.ticket_category_id) === String(selectedTicket.id) &&
            isSeatAvailable(seat)
          );
        });
        if (!selectedStillAvailable) {
          setSelectedSeatIds([]);
          throw new Error(
            "Ada kursi yang baru saja dipesan pengguna lain. Silakan pilih ulang."
          );
        }
      }

      const orderCode = generateOrderCode();
      const payload = {
        order_code: orderCode,
        ticket_category_id: Number(selectedTicket.id),
        quantity: Number(quantity),
      };
      if (requiresSeatSelection) {
        payload.seat_ids = selectedSeatIds.map(Number);
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        throw new Error("Sesi login berakhir. Silakan login kembali.");
      }
      if (!response.ok || data?.success !== true) {
        throw new Error(
          getErrorMessage(
            data,
            `Gagal membuat pesanan. HTTP ${response.status}`
          )
        );
      }

      const order = data?.order;
      const payment = data?.payment;
      if (!order?.id)
        throw new Error("Backend tidak mengembalikan informasi pesanan.");
      if (!payment?.snap_token)
        throw new Error(
          "Pesanan telah diproses, tetapi Snap Token tidak ditemukan. Periksa transaksi di backend sebelum mencoba kembali."
        );

      const finalSubtotal = Number(order.subtotal ?? subtotal);
      const finalServiceFee = Number(order.service_fee ?? SERVICE_FEE);
      const finalTotal = Number(
        order.total_price ?? order.total ?? finalSubtotal + finalServiceFee
      );

      const checkoutData = {
        order,
        payment,
        orderId: order.id,
        orderCode: order.order_code ?? orderCode,
        eventId: order.event_id ?? event.id,
        eventTitle:
          order.event_name ??
          event.event_name ??
          event.name ??
          event.title ??
          "Event",
        ticketCategoryId: selectedTicket.id,
        ticketCategoryName: getCategoryName(selectedTicket),
        quantity: Number(order.quantity ?? quantity),
        seatMode:
          order.seat_mode ??
          (requiresSeatSelection ? "NUMBERED" : "GENERAL"),
        seatIds: order.seat_ids ?? selectedSeatIds,
        selectedSeats: selectedSeats.map((seat) => ({
          id: seat.id,
          label: getSeatLabel(seat),
          section: seat.section_name,
        })),
        subtotal: finalSubtotal,
        serviceFee: finalServiceFee,
        total: finalTotal,
        preferredPaymentMethod,
        paymentStatus: order.payment_status ?? "Pending",
        snapToken: payment.snap_token,
        redirectUrl: payment.redirect_url ?? null,
      };

      sessionStorage.setItem(
        "ticketverse_checkout",
        JSON.stringify(checkoutData)
      );

      router.push(`/cari-acara/${order.event_id ?? event.id}/pembayaran`);
    } catch (err) {
      console.error("CREATE ORDER ERROR:", err);
      setError(err?.message || "Terjadi kesalahan saat membuat pesanan.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const eventTitle =
    event?.event_name ?? event?.name ?? event?.title ?? "Event";
  const eventDate =
    event?.event_date ?? event?.date ?? event?.start_date ?? null;
  const eventTime =
    event?.event_time ?? event?.start_time ?? event?.time ?? null;
  const eventVenue =
    event?.venue_name ??
    event?.venue?.venue_name ??
    event?.venue?.name ??
    event?.location ??
    event?.address ??
    "Lokasi belum ditentukan";
  const eventCity = event?.city || "";
  const eventPoster =
    event?.poster ??
    event?.poster_url ??
    event?.image_url ??
    event?.image ??
    null;

  const posterUrl = eventPoster
    ? eventPoster.startsWith("http")
      ? eventPoster
      : `${API_URL}${eventPoster.startsWith("/") ? "" : "/"}${eventPoster}`
    : null;

  const mapQuery = encodeURIComponent(`${eventVenue} ${eventCity}`.trim());
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const canContinue =
    !!selectedTicket &&
    remainingStock > 0 &&
    !creatingOrder &&
    seatSelectionValid &&
    (!requiresSeatSelection || selectedSeatIds.length === quantity) &&
    ticketCategories.length > 0;

  const disabledReason = (() => {
    if (ticketCategories.length === 0) return "Kategori tiket belum tersedia.";
    if (!selectedTicket) return "Pilih kategori tiket terlebih dahulu.";
    if (remainingStock <= 0) return "Stok tiket kategori ini habis.";
    if (requiresSeatSelection && selectedSeatIds.length !== quantity)
      return `Pilih ${quantity} kursi untuk melanjutkan.`;
    if (!agree) return "Setujui ketentuan pembelian untuk melanjutkan.";
    return "";
  })();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-[#112250]" />
          <h2 className="mt-4 text-sm font-bold text-slate-900">
            Memuat data acara...
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Menghubungkan ke TicketVerse.
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={36} className="mx-auto text-red-500" />
          <h2 className="mt-4 text-base font-bold text-slate-900">
            Acara Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Informasi acara tidak dapat dimuat."}
          </p>
          <button
            onClick={loadData}
            className="mt-6 w-full rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white hover:bg-[#1A326A]"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-12">
      <section className="rounded-2xl border border-[#DDE4ED] bg-white p-5 shadow-[0_4px_20px_rgba(17,34,80,0.03)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Kembali"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                Pemesanan Tiket
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Beli Tiket
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Pilih tiket dan kursi favoritmu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:self-center">
            <ShieldCheck size={14} />
            Transaksi Aman
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm font-medium leading-6 text-red-700">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-xs font-bold text-red-600 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          
          <section className="overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
            <div className="p-5 sm:p-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-[#EEF3F9] px-2.5 py-1 text-[10px] font-bold text-[#112250]">
                  Event Terpilih
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                {eventTitle}
              </h2>
              {event.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {event.description}
                </p>
              )}

              <div className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1F42] to-[#112250] shadow-inner ring-1 ring-slate-900/10">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={eventTitle}
                    className="h-full w-full object-cover object-center transition duration-700 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-white/40">
                    <Ticket size={48} opacity={0.5} />
                    <span className="mt-2 text-xs">Poster tidak tersedia</span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#FBFCFE] p-4 transition hover:bg-white hover:shadow-sm">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#112250]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatTanggal(eventDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#FBFCFE] p-4 transition hover:bg-white hover:shadow-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#112250]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Lokasi
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 line-clamp-2">
                      {eventVenue}
                    </p>
                  </div>
                </div>

                {eventTime && (
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#FBFCFE] p-4 sm:col-span-2 transition hover:bg-white hover:shadow-sm">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#112250]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Waktu
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {eventTime} WIB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm sm:h-56">
                <iframe
                  title="Peta Lokasi Acara"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={mapEmbedUrl}
                  className="absolute inset-0 grayscale opacity-90 transition duration-500 hover:grayscale-0 hover:opacity-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-5 shadow-[0_8px_30px_rgba(17,34,80,0.05)] sm:p-6">
            <SectionHeader
              icon={Tag}
              title="Pilih Kategori Tiket"
              subtitle="Pilih kategori sesuai kebutuhanmu."
            />

            {ticketCategories.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <Ticket size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">
                  Kategori belum tersedia
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Organizer belum menyediakan kategori tiket.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {ticketCategories.map((ticket) => {
                  const selected =
                    String(ticket.id) === String(selectedTicketId);
                  const stock = getCategoryStock(ticket);
                  const soldOut = stock <= 0;
                  const price = getCategoryPrice(ticket);
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      disabled={soldOut || creatingOrder}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-[#112250] bg-[#F8FAFC] ring-1 ring-[#112250] shadow-sm"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      } ${soldOut ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            selected
                              ? "border-[#112250] bg-[#112250] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected && <CheckCircle2 size={12} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">
                            {getCategoryName(ticket)}
                          </p>
                          {ticket.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {ticket.description}
                            </p>
                          )}
                          <p
                            className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                              soldOut ? "text-red-600" : "text-emerald-600"
                            }`}
                          >
                            {soldOut
                              ? "Tiket habis"
                              : `Tersedia ${stock} tiket`}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-[#112250]">
                          {formatRupiah(price)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          per tiket
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-5 shadow-[0_8px_30px_rgba(17,34,80,0.05)] sm:p-6">
            <SectionHeader
              icon={Users}
              title="Jumlah Tiket"
              subtitle={`Maksimal ${MAX_QUANTITY} tiket dalam satu pesanan.`}
            />

            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-[#FBFCFE] p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {selectedTicket
                    ? getCategoryName(selectedTicket)
                    : "Pilih kategori tiket"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatRupiah(ticketPrice)} per tiket
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Kurangi jumlah"
                  disabled={!selectedTicket || quantity <= 1 || creatingOrder}
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tambah jumlah"
                  disabled={
                    !selectedTicket ||
                    quantity >= maxQuantity ||
                    creatingOrder
                  }
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </section>

          {requiresSeatSelection && (
            <section className="overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <div className="p-5 sm:p-6">
                <SectionHeader
                  icon={Armchair}
                  title="Pilih Denah Kursi"
                  subtitle="Pilih kursi yang masih tersedia."
                  action={
                    <button
                      type="button"
                      disabled={refreshingSeats || creatingOrder}
                      onClick={() => loadSeatMap(true)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCw
                        size={13}
                        className={refreshingSeats ? "animate-spin" : ""}
                      />
                      Perbarui
                    </button>
                  }
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                    <span className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-100 shadow-sm" />
                    Tersedia
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                    <span className="h-3 w-3 rounded-full border-2 border-[#112250] bg-[#112250] shadow-sm" />
                    Pilihanmu
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                    <span className="h-3 w-3 rounded-full border-2 border-slate-300 bg-slate-200 shadow-sm" />
                    Terisi
                  </div>
                </div>

                {categorySections.length === 0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-red-200 bg-red-50 p-5 text-center">
                    <AlertCircle size={24} className="mx-auto text-red-500" />
                    <p className="mt-2 text-sm font-bold text-red-700">
                      Denah kursi belum tersedia
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                      Kategori ini memakai kursi bernomor, tetapi belum memiliki
                      section.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-8">
                    {categorySections.map((section) => {
                      const seats = section.seats || [];
                      
                      // Ambil semua posisi Y unik untuk menentukan baris (Row A, B, C...)
                      const uniqueY = [...new Set(seats.map(s => Number(s.position_y) || 0))].sort((a, b) => a - b);
                      const getRowLabel = (y) => {
                        const idx = uniqueY.indexOf(Number(y));
                        return idx >= 0 ? String.fromCharCode(65 + idx) : "";
                      };

                      let maxX = 10;
                      let maxY = 10;
                      seats.forEach(seat => {
                        const x = Number(seat.position_x) || 0;
                        const y = Number(seat.position_y) || 0;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                      });

                      const paddedMaxX = maxX + (maxX * 0.25); // Padding kiri-kanan untuk label baris
                      const paddedMaxY = maxY + (maxY * 0.15);

                      return (
                        <div
                          key={section.id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-[#F8FAFC] px-4 py-3">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">
                                {section.section_name}
                              </h3>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                Section {section.section_code}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#112250] ring-1 ring-slate-200 shadow-sm">
                              {seats.filter(isSeatAvailable).length} tersedia
                            </span>
                          </div>

                          {seats.length === 0 ? (
                            <p className="py-8 text-center text-xs text-slate-400 italic">
                              Belum ada kursi pada section ini.
                            </p>
                          ) : (
                            <div className="overflow-x-auto p-4 sm:p-6">
                              <div className="min-w-[500px]">
                                {/* STAGE MELENGKUNG */}
                                <div className="relative mx-auto mb-10 w-3/4 max-w-md">
                                  <div className="flex h-8 w-full items-center justify-center rounded-b-[50%] bg-gradient-to-b from-[#112250] to-[#0D1F42] shadow-[0_15px_30px_-5px_rgba(17,34,80,0.4)]">
                                  </div>
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.4em] text-[#112250]/60 uppercase">
                                    Panggung
                                  </div>
                                </div>

                                {/* AREA KURSI DENGAN DOT PATTERN */}
                                <div
                                  className="relative mx-auto rounded-xl bg-slate-50/50 p-6 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"
                                  style={{
                                    aspectRatio: `${paddedMaxX} / ${paddedMaxY}`,
                                  }}
                                >
                                  {seats.map((seat) => {
                                    const seatId = Number(seat.id);
                                    const selected = selectedSeatIds.includes(seatId);
                                    const available = isSeatAvailable(seat);
                                    const disabled = !available || (!selected && selectedSeatIds.length >= quantity);
                                        
                                    const leftPos = ((Number(seat.position_x) || 0) / paddedMaxX * 100) + 10; // Geser sedikit untuk label
                                    const topPos = ((Number(seat.position_y) || 0) / paddedMaxY * 100);
                                    const rowLabel = getRowLabel(seat.position_y);

                                    // Tampilkan label baris hanya pada ujung kiri baris tersebut
                                    const isFirstInRow = seats.find(s => 
                                      Number(s.position_y) === Number(seat.position_y) && 
                                      Number(s.position_x) === Math.min(...seats.filter(s2 => Number(s2.position_y) === Number(seat.position_y)).map(s2 => Number(s2.position_x)))
                                    )?.id === seat.id;

                                    return (
                                      <div key={seat.id}>
                                        {isFirstInRow && (
                                          <span 
                                            className="absolute text-[11px] font-bold text-slate-400 -translate-y-1/2"
                                            style={{ 
                                              left: `${leftPos - 12}%`, 
                                              top: `${topPos}%` 
                                            }}
                                          >
                                            {rowLabel}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          aria-label={`Kursi ${rowLabel}-${seat.seat_number}`}
                                          aria-pressed={selected}
                                          title={`${rowLabel}-${seat.seat_number} - ${
                                            selected ? "Pilihanmu" : available ? "Tersedia" : "Sudah dipesan"
                                          }`}
                                          disabled={disabled && !selected}
                                          onClick={() => handleToggleSeat(seat)}
                                          style={{
                                            position: "absolute",
                                            left: `${leftPos}%`,
                                            top: `${topPos}%`,
                                            transform: "translate(-50%, -50%)",
                                          }}
                                          className={`flex h-8 min-w-8 items-center justify-center rounded-t-lg rounded-b-sm border-2 px-1 text-[10px] font-extrabold shadow-sm transition-all duration-200 sm:h-9 sm:min-w-9 sm:text-[11px] ${
                                            selected
                                              ? "z-10 scale-110 border-[#112250] bg-[#112250] text-white ring-2 ring-[#112250]/30 shadow-md"
                                              : available
                                                ? "border-emerald-400 bg-emerald-50 text-emerald-800 hover:-translate-y-1 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-md"
                                                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70"
                                          }`}
                                        >
                                          {seat.seat_number}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-[#DDE4ED] bg-[#F8FAFC] p-5 shadow-inner">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Armchair size={18} className="text-[#112250]" />
                      <p className="text-sm font-bold text-[#112250]">
                        Kursi Dipilih
                      </p>
                    </div>
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-bold shadow-sm ${
                        seatSelectionValid
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {selectedSeatIds.length} / {quantity} Kursi
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((seat) => (
                        <span
                          key={seat.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDE4ED] bg-white px-2.5 py-1.5 text-xs font-bold text-[#112250] shadow-sm"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#112250] text-[8px] text-white">
                            {seat.section_code}
                          </span>
                          {seat.row_label}-{seat.seat_number}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Belum ada kursi yang dipilih. Silakan klik kursi berwarna hijau pada denah di atas.
                      </p>
                    )}
                  </div>
                  <p className="mt-4 text-[11px] leading-5 text-slate-500 flex items-start gap-1.5">
                    <ShieldCheck size={14} className="shrink-0 text-slate-400" />
                    Kursi akan dikunci oleh sistem selama 10 menit setelah pesanan berhasil dibuat.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-5 shadow-[0_8px_30px_rgba(17,34,80,0.05)] sm:p-6">
            <SectionHeader
              icon={CreditCard}
              title="Preferensi Pembayaran"
              subtitle="Metode final dipilih di halaman pembayaran Midtrans."
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const active = preferredPaymentMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    disabled={creatingOrder}
                    onClick={() => setPreferredPaymentMethod(method.value)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                      active
                        ? "border-[#112250] bg-[#F8FAFC] ring-1 ring-[#112250]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-[#112250] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] leading-5 text-slate-400">
              Preferensi ini hanya untuk tampilan. Backend Midtrans tetap
              menentukan metode yang digunakan saat checkout.
            </p>
          </section>

          <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-5 shadow-[0_8px_30px_rgba(17,34,80,0.05)] sm:p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agree}
                disabled={creatingOrder}
                onChange={(e) => {
                  setAgree(e.target.checked);
                  setError("");
                }}
                className="mt-0.5 h-4 w-4 accent-[#112250]"
              />
              <span className="text-xs leading-6 text-slate-500">
                Saya menyetujui ketentuan pembelian tiket dan memahami bahwa
                pesanan akan diproses setelah pembayaran berhasil dikonfirmasi
                oleh sistem TicketVerse.
              </span>
            </label>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <section className="relative overflow-hidden rounded-[28px] border border-[#DDE4ED] bg-white shadow-[0_24px_80px_-15px_rgba(17,34,80,0.15)]">
            <div className="absolute top-0 right-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br from-[#EEF3F9] to-transparent blur-2xl" />
            
            <div className="relative border-b border-slate-100 bg-white/80 p-6 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#112250] to-[#1A326A] text-white shadow-lg shadow-[#112250]/30">
                  <ShoppingBag size={22} />
                  <Sparkles size={12} className="absolute -top-1 -right-1 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-[#112250]">
                    Ringkasan Pesanan
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Konfirmasi detail sebelum lanjut.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative p-6">
              <div className="border-b border-dashed border-slate-200 pb-5">
                <p className="text-base font-bold leading-snug text-slate-900">
                  {eventTitle}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#EEF3F9] px-2.5 py-1 text-xs font-bold text-[#112250]">
                  <Ticket size={12} />
                  {selectedTicket
                    ? getCategoryName(selectedTicket)
                    : "Kategori belum dipilih"}
                </div>
                {requiresSeatSelection && (
                  <p className="mt-2.5 text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {selectedSeatIds.length} kursi dipilih
                  </p>
                )}
              </div>

              {requiresSeatSelection && (
                <div className="mt-4 border-b border-dashed border-slate-200 pb-5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Detail Kursi
                  </p>
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat.id}
                          className="rounded-lg border border-[#DDE4ED] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] font-bold text-[#112250] shadow-sm"
                        >
                          {seat.section_code} - {seat.row_label}-{seat.seat_number}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Belum memilih kursi.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 space-y-3.5">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Harga tiket</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(ticketPrice)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Jumlah tiket</span>
                  <span className="font-semibold text-slate-900">
                    {quantity} tiket
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Biaya layanan</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(serviceFee)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center justify-between gap-1 rounded-2xl bg-gradient-to-r from-[#0D1F42] to-[#112250] p-4 text-white shadow-inner sm:flex-row">
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
                  Total Pembayaran
                </span>
                <span className="text-2xl font-black text-white">
                  {formatRupiah(total)}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <p className="text-[11px] font-medium leading-5 text-emerald-800">
                    Pembayaran via Midtrans. Validasi stok & reservasi kursi
                    dilakukan backend secara aman.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#112250] px-5 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(17,34,80,0.25)] transition hover:bg-[#1A326A] hover:shadow-[0_12px_28px_rgba(17,34,80,0.35)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Membuat Pesanan...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center gap-2">
                        Lanjut ke Pembayaran
                        <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
                      </span>
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    </>
                  )}
                </button>

                {!canContinue && disabledReason && (
                  <div className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 p-2.5 border border-amber-100 text-center text-[11px] font-medium text-amber-700">
                    <AlertCircle size={13} />
                    {disabledReason}
                  </div>
                )}

                <button
                  type="button"
                  disabled={creatingOrder}
                  onClick={() => router.back()}
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                  Batal
                </button>
              </div>

              <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">
                Dengan melanjutkan, pesanan dibuat dan stok tiket diperbarui
                oleh sistem TicketVerse.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
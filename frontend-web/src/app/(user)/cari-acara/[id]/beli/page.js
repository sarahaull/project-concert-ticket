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
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";

// =====================================================
// CONFIGURATION
// =====================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const MAX_QUANTITY = 6;
const SERVICE_FEE = 5000;

// =====================================================
// PAYMENT PREFERENCES
// Catatan: metode pembayaran final tetap dipilih di Midtrans.
// =====================================================

const PAYMENT_METHODS = [
  { value: "qris", label: "QRIS", icon: QrCode },
  { value: "ewallet", label: "E-Wallet", icon: Smartphone },
  { value: "bank", label: "Transfer Bank", icon: Building2 },
  { value: "card", label: "Kartu Kredit", icon: CreditCard },
];

// =====================================================
// HELPERS
// =====================================================

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
  if (Array.isArray(data?.error)) {
    return data.error.join(", ");
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  if (typeof data?.error?.message === "string") {
    return data.error.message;
  }

  return data?.message || fallback;
};

const getEventIdFromCategory = (category) =>
  category?.event_id ??
  category?.eventId ??
  category?.event?.id ??
  null;

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

// =====================================================
// MAIN PAGE
// =====================================================

export default function BeliTiketPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);

  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [preferredPaymentMethod, setPreferredPaymentMethod] =
    useState("qris");
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ===================================================
  // LOAD EVENT AND TICKET CATEGORIES
  // ===================================================

  const loadData = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setError("");

    try {
      const [eventResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/api/events/${encodeURIComponent(eventId)}`, {
          method: "GET",
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/ticket-categories`, {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      const eventData = await eventResponse.json().catch(() => ({}));
      const categoriesData = await categoriesResponse
        .json()
        .catch(() => ({}));

      if (!eventResponse.ok) {
        throw new Error(
          getErrorMessage(eventData, "Gagal mengambil detail acara.")
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          getErrorMessage(
            categoriesData,
            "Gagal mengambil kategori tiket."
          )
        );
      }

      const eventResult =
        eventData?.event ??
        eventData?.data?.event ??
        eventData?.data ??
        eventData;

      if (!eventResult?.id) {
        throw new Error("Data acara tidak ditemukan.");
      }

      const rawCategories = Array.isArray(categoriesData)
        ? categoriesData
        : Array.isArray(categoriesData?.ticketCategories)
          ? categoriesData.ticketCategories
          : Array.isArray(categoriesData?.ticket_categories)
            ? categoriesData.ticket_categories
            : Array.isArray(categoriesData?.categories)
              ? categoriesData.categories
              : Array.isArray(categoriesData?.data)
                ? categoriesData.data
                : Array.isArray(categoriesData?.data?.ticketCategories)
                  ? categoriesData.data.ticketCategories
                  : [];

      const filteredCategories = rawCategories.filter((category) => {
        const categoryEventId = getEventIdFromCategory(category);

        return (
          categoryEventId !== null &&
          String(categoryEventId) === String(eventResult.id)
        );
      });

      setEvent(eventResult);
      setTicketCategories(filteredCategories);

      const firstAvailable = filteredCategories.find(
        (category) => getCategoryStock(category) > 0
      );

      if (firstAvailable) {
        setSelectedTicketId(String(firstAvailable.id));
      } else {
        setSelectedTicketId("");
      }
    } catch (err) {
      console.error("LOAD EVENT ERROR:", err);
      setError(
        err?.message ||
          "Gagal memuat informasi acara. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===================================================
  // SELECTED TICKET
  // ===================================================

  const selectedTicket = useMemo(
    () =>
      ticketCategories.find(
        (ticket) => String(ticket.id) === String(selectedTicketId)
      ) || null,
    [ticketCategories, selectedTicketId]
  );

  const ticketPrice = selectedTicket
    ? getCategoryPrice(selectedTicket)
    : 0;

  const remainingStock = selectedTicket
    ? getCategoryStock(selectedTicket)
    : 0;

  const maxQuantity = Math.max(
    0,
    Math.min(MAX_QUANTITY, remainingStock)
  );

  const subtotal = ticketPrice * Number(quantity || 0);
  const serviceFee = selectedTicket ? SERVICE_FEE : 0;
  const total = subtotal + serviceFee;

  // ===================================================
  // SELECT TICKET CATEGORY
  // ===================================================

  const handleSelectTicket = (ticket) => {
    if (getCategoryStock(ticket) <= 0) {
      setError("Kategori tiket ini sudah habis.");
      return;
    }

    setSelectedTicketId(String(ticket.id));
    setQuantity(1);
    setError("");
    setNotice("");
  };

  // ===================================================
  // CHANGE QUANTITY
  // ===================================================

  const handleQuantityChange = (nextQuantity) => {
    if (!selectedTicket) {
      setError("Pilih kategori tiket terlebih dahulu.");
      return;
    }

    const parsedQuantity = Number(nextQuantity);

    if (!Number.isFinite(parsedQuantity)) return;

    const nextValue = Math.max(
      1,
      Math.min(MAX_QUANTITY, remainingStock, parsedQuantity)
    );

    setQuantity(nextValue);
    setError("");
    setNotice("");
  };

  // ===================================================
  // CREATE ORDER
  // ===================================================

  const handleContinue = async () => {
    setError("");
    setNotice("");

    if (!selectedTicket) {
      setError("Pilih kategori tiket terlebih dahulu.");
      return;
    }

    if (remainingStock <= 0) {
      setError("Stok tiket untuk kategori ini sudah habis.");
      return;
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1 ||
      Number(quantity) > MAX_QUANTITY
    ) {
      setError(
        `Jumlah tiket harus antara 1 sampai ${MAX_QUANTITY}.`
      );
      return;
    }

    if (Number(quantity) > remainingStock) {
      setError(`Stok tiket tersisa ${remainingStock}.`);
      return;
    }

    if (!agree) {
      setError("Centang persetujuan sebelum melanjutkan.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    setCreatingOrder(true);

    try {
      const orderCode = generateOrderCode();

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_code: orderCode,
          ticket_category_id: Number(selectedTicket.id),
          quantity: Number(quantity),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("token");
        setError("Sesi login berakhir. Silakan login kembali.");
        router.push("/login");
        return;
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

      if (!order) {
        throw new Error(
          "Respons backend tidak memuat data pesanan."
        );
      }

      if (!payment?.snap_token) {
        throw new Error(
          "Pesanan dibuat, tetapi Snap Token tidak ditemukan. Periksa konfigurasi Midtrans dan respons backend sebelum mencoba kembali."
        );
      }

      const finalOrderCode =
        order.order_code ??
        order.orderCode ??
        order.code ??
        orderCode;

      const finalSubtotal =
        Number(
          order.subtotal ??
            order.sub_total ??
            ticketPrice * Number(quantity)
        ) || 0;

      const finalServiceFee =
        Number(
          order.service_fee ??
            order.serviceFee ??
            order.fee ??
            SERVICE_FEE
        ) || 0;

      const finalTotal =
        Number(
          order.total_price ??
            order.total ??
            order.gross_amount ??
            finalSubtotal + finalServiceFee
        ) || 0;

      const checkoutData = {
        order,
        payment,
        orderCode: String(finalOrderCode),
        eventId: event.id,
        eventTitle:
          event.event_name ??
          event.name ??
          event.title ??
          "Event",
        ticketCategoryId: selectedTicket.id,
        ticketCategoryName: getCategoryName(selectedTicket),
        quantity: Number(quantity),
        subtotal: finalSubtotal,
        serviceFee: finalServiceFee,
        total: finalTotal,
        preferredPaymentMethod,
        paymentStatus:
          order.payment_status ??
          order.status_pembayaran ??
          "Pending",
      };

      try {
        sessionStorage.setItem(
          "ticketverse_checkout",
          JSON.stringify(checkoutData)
        );
      } catch (storageError) {
        console.error("GAGAL MENYIMPAN CHECKOUT:", storageError);
        throw new Error(
          "Data checkout tidak dapat disimpan di browser. Aktifkan session storage lalu coba lagi."
        );
      }

      router.push(`/cari-acara/${event.id}/pembayaran`);
    } catch (err) {
      console.error("CREATE ORDER ERROR:", err);
      setError(
        err?.message ||
          "Terjadi kesalahan saat membuat pesanan. Silakan coba lagi."
      );
    } finally {
      setCreatingOrder(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
            <Loader2 size={26} className="animate-spin text-[#112250]" />
          </div>
          <h2 className="mt-4 text-base font-bold text-[#14213D]">
            Memuat data acara...
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Menyiapkan formulir pembelian tiket Anda.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // EVENT NOT FOUND / LOAD ERROR
  // ===================================================

  if (!event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={28} />
          </div>
          <h2 className="mt-5 text-lg font-bold text-[#14213D]">
            Acara Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Informasi acara tidak dapat dimuat."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/cari-acara")}
              className="w-full rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A]"
            >
              Kembali ke Daftar Acara
            </button>
            <button
              type="button"
              onClick={loadData}
              className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // EVENT DETAILS
  // ===================================================

  const eventTitle =
    event.event_name ?? event.name ?? event.title ?? "Event";

  const eventDate =
    event.event_date ?? event.date ?? event.start_date ?? null;

  const eventTime =
    event.event_time ?? event.start_time ?? event.time ?? null;

  const eventVenue =
    event.venue_name ??
    event.venue?.venue_name ??
    event.venue?.name ??
    event.location ??
    event.address ??
    "Lokasi belum ditentukan";

  const eventPoster =
    event.poster ??
    event.poster_url ??
    event.image_url ??
    event.image ??
    null;

  // ===================================================
  // MAIN RENDER
  // ===================================================

  return (
    <div className="w-full min-w-0">
      {/* HEADER HALAMAN */}
      <section className="relative isolate overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6">
        <div className="relative w-full px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
                title="Kembali"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  <Ticket size={14} />
                  Pemesanan Tiket
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                  Beli Tiket
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Pilih kategori tiket, tentukan jumlahnya, lalu lanjutkan ke pembayaran.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
              <ShieldCheck size={16} />
              Pemesanan Aman
            </div>
          </div>
        </div>
      </section>

      {/* ERROR & NOTICE ALERT */}
      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-medium leading-6 text-red-700">{error}</p>
        </div>
      )}
      {notice && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium leading-6 text-emerald-700">{notice}</p>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* KIRI: KONTEN FORMULIR */}
        <div className="space-y-6">
          
          {/* EVENT CARD */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {eventPoster && (
              <div className="relative h-48 overflow-hidden bg-slate-100 sm:h-64">
                <img
                  src={eventPoster}
                  alt={eventTitle}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                    <Sparkles size={12} />
                    Event Terpilih
                  </span>
                </div>
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#14213D]">{eventTitle}</h2>
              {event.description && (
                <p className="mt-2 text-sm leading-6 text-slate-500">{event.description}</p>
              )}
              <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#112250]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal Acara</p>
                    <p className="mt-1 font-semibold text-slate-800">{formatTanggal(eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#112250]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lokasi</p>
                    <p className="mt-1 font-semibold text-slate-800">{eventVenue}</p>
                  </div>
                </div>
                {eventTime && (
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3 sm:col-span-2">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#112250]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waktu</p>
                      <p className="mt-1 font-semibold text-slate-800">{eventTime}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* TICKET CATEGORIES */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#112250]">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#14213D]">Pilih Kategori Tiket</h2>
                <p className="mt-0.5 text-xs text-slate-500">Pilih tiket sesuai kebutuhanmu.</p>
              </div>
            </div>

            {ticketCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                <Ticket className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">Belum ada kategori tiket</p>
                <p className="mt-1 text-sm text-slate-500">Kategori tiket untuk acara ini belum tersedia atau belum berhasil dimuat.</p>
                <button
                  type="button"
                  onClick={loadData}
                  className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Muat Ulang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ticketCategories.map((ticket) => {
                  const selected = String(ticket.id) === String(selectedTicketId);
                  const stock = getCategoryStock(ticket);
                  const price = getCategoryPrice(ticket);
                  const soldOut = stock <= 0;

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      disabled={soldOut || creatingOrder}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-[#112250] bg-blue-50/50 ring-1 ring-[#112250]"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      } ${soldOut ? "cursor-not-allowed bg-slate-50 opacity-60" : ""}`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? "border-[#112250] bg-[#112250] text-white" : "border-slate-300 bg-white"
                        }`}>
                          {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">{getCategoryName(ticket)}</p>
                          {ticket.description && (
                            <p className="mt-1 text-xs leading-5 text-slate-500">{ticket.description}</p>
                          )}
                          <p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${soldOut ? "text-red-600" : "text-slate-400"}`}>
                            {soldOut ? "Tiket habis" : `Sisa ${stock} tiket`}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-extrabold text-[#112250]">{formatRupiah(price)}</p>
                        <p className="mt-1 text-[10px] font-medium text-slate-400">per tiket</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* QUANTITY */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#14213D]">Jumlah Tiket</h2>
            <p className="mt-1 text-xs text-slate-500">Maksimal {MAX_QUANTITY} tiket dalam satu pesanan.</p>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div>
                <p className="font-bold text-slate-900">
                  {selectedTicket ? getCategoryName(selectedTicket) : "Belum ada kategori dipilih"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedTicket ? `${formatRupiah(ticketPrice)} per tiket` : "Pilih kategori tiket terlebih dahulu."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Kurangi jumlah tiket"
                  disabled={!selectedTicket || quantity <= 1 || creatingOrder}
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#112250] hover:text-[#112250] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-base font-bold text-[#14213D]">{quantity}</span>
                <button
                  type="button"
                  aria-label="Tambah jumlah tiket"
                  disabled={!selectedTicket || quantity >= maxQuantity || creatingOrder}
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#112250] hover:text-[#112250] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            {selectedTicket && remainingStock > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Info size={13} />
                Maksimal pembelian saat ini {maxQuantity} tiket (stok & batas sistem).
              </p>
            )}
          </section>

          {/* PAYMENT PREFERENCES */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-bold text-[#14213D]">Preferensi Pembayaran</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Pilih preferensi. Metode pembayaran final tetap tersedia di halaman Midtrans.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const active = preferredPaymentMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    disabled={creatingOrder}
                    onClick={() => setPreferredPaymentMethod(method.value)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[#112250] bg-blue-50/50 ring-1 ring-[#112250]"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-[#112250] text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-bold ${active ? "text-[#112250]" : "text-slate-700"}`}>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* TERMS */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agree}
                disabled={creatingOrder}
                onChange={(e) => { setAgree(e.target.checked); setError(""); }}
                className="mt-1 h-4 w-4 shrink-0 accent-[#112250] rounded border-slate-300"
              />
              <span className="text-xs leading-6 text-slate-500">
                Saya menyetujui ketentuan pembelian tiket dan memahami bahwa pesanan akan diproses setelah pembayaran berhasil dikonfirmasi oleh sistem.
              </span>
            </label>
          </section>
        </div>

        {/* KANAN: RINGKASAN PESANAN */}
        <aside className="h-fit lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {/* HEADER SUMMARY */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#112250] text-white shadow-sm">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#14213D]">Ringkasan Pesanan</h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">Periksa sebelum melanjutkan.</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* EVENT INFO */}
              <div className="border-b border-slate-100 pb-4">
                <p className="text-sm font-bold leading-6 text-slate-900">{eventTitle}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {selectedTicket ? getCategoryName(selectedTicket) : "Kategori belum dipilih"}
                </p>
              </div>

              {/* BREAKDOWN */}
              <div className="mt-5 space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Harga tiket</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(ticketPrice)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Jumlah tiket</span>
                  <span className="font-semibold text-slate-900">{quantity} tiket</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Biaya layanan</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(serviceFee)}</span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <span className="text-sm font-bold text-[#14213D]">Total pembayaran</span>
                <span className="text-xl font-black text-[#112250]">{formatRupiah(total)}</span>
              </div>

              {/* NOTE */}
              <div className="mt-5 rounded-xl bg-slate-50 p-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-[11px] leading-5 font-medium text-slate-500">
                    Pembayaran diproses melalui Midtrans. Status transaksi dikonfirmasi oleh backend.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedTicket || remainingStock <= 0 || creatingOrder || ticketCategories.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3.5 text-sm font-bold text-white transition shadow-sm hover:bg-[#1A326A] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Membuat Pesanan...
                    </>
                  ) : (
                    <>
                      Lanjut ke Pembayaran
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={creatingOrder}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
              </div>

              <p className="mt-4 text-center text-[10px] leading-4 text-slate-400 font-medium">
                Dengan melanjutkan, pesanan akan dibuat dan stok tiket dapat berkurang. Pastikan kategori serta jumlah tiket sudah benar.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
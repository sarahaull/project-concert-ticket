
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  Users,
  ShieldCheck,
  ChevronRight,
  Share2,
  Heart,
  CheckCircle2,
  Building2,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wallet,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

/* =========================================================
   API CONFIG
========================================================= */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=90";

/* =========================================================
   API HELPERS
========================================================= */

function getAssetUrl(path) {
  if (!path) return null;

  const value = String(path).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `${API_URL}/${value.replace(/^\/+/, "")}`;
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Respons server tidak valid.");
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        data.error ||
        `Request gagal (${response.status})`
    );
  }

  return data;
}

function extractArray(response, keys = []) {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.ticket_categories)) {
    return response.data.ticket_categories;
  }

  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }

  return [];
}

/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

  // Menghindari pergeseran tanggal akibat timezone
  // ketika backend mengirim YYYY-MM-DD.
  const raw = String(value);
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    : new Date(raw);

  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "-";

  const time = String(value);
  return `${time.slice(0, 5)} WIB`;
}

function formatDateTime(value) {
  if (!value) return null;

  const date = new Date(String(value).replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function formatDateTimeLabel(value) {
  const date = formatDateTime(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTicketRemaining(ticket) {
  const quota = Number(ticket.quota || 0);

  if (
    ticket.remaining_ticket === null ||
    ticket.remaining_ticket === undefined
  ) {
    return quota;
  }

  return Math.max(0, Number(ticket.remaining_ticket) || 0);
}

function getSaleStatus(event) {
  const now = new Date();

  const start = formatDateTime(event?.ticket_sale_start);
  const end = formatDateTime(event?.ticket_sale_end);

  if (start && now < start) {
    return {
      available: false,
      label: "Penjualan Belum Dibuka",
      description: `Penjualan dibuka ${formatDateTimeLabel(
        event.ticket_sale_start
      )}.`,
      type: "upcoming",
    };
  }

  if (end && now > end) {
    return {
      available: false,
      label: "Penjualan Ditutup",
      description: "Periode penjualan tiket event ini telah berakhir.",
      type: "closed",
    };
  }

  return {
    available: true,
    label: "Penjualan Tersedia",
    description: "Tiket dapat dipesan selama kuota masih tersedia.",
    type: "open",
  };
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#EEF1F5] bg-[#FBFCFE] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#98A3B2]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-5 text-[#52627A]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ title, description }) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#EEF1F5] bg-[#FBFCFE] p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#526B92]">
        <CheckCircle2 size={16} />
      </div>

      <div>
        <p className="text-xs font-bold text-[#112250]">{title}</p>
        <p className="mt-1 text-[11px] leading-5 text-[#8995A5]">
          {description}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#526B92]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-[#A0A9B6]">
          {label}
        </p>

        <p className="truncate text-xs font-semibold text-[#52627A]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   TICKET CATEGORY CARD
========================================================= */

function TicketCategoryCard({ ticket }) {
  const quota = Number(ticket.quota || 0);
  const remaining = getTicketRemaining(ticket);
  const sold = Math.max(0, quota - remaining);

  const percentage =
    quota > 0 ? Math.min(100, (sold / quota) * 100) : 0;

  const soldOut = quota > 0 && remaining <= 0;

  return (
    <div className="rounded-xl border border-[#E5EAF1] bg-white p-4 transition hover:border-[#A9BAD2] hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#112250]">
              {ticket.category_name || "Kategori Tiket"}
            </h3>

            {soldOut && (
              <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
                HABIS
              </span>
            )}
          </div>

          <p className="mt-2 text-lg font-bold text-[#526B92]">
            {formatCurrency(ticket.price)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8793A3]">
          <Ticket size={14} />
          <span>ID #{ticket.id}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span className="text-[#8793A3]">Ketersediaan tiket</span>
          <span className="font-semibold text-[#52627A]">
            {remaining.toLocaleString("id-ID")} /{" "}
            {quota.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#E8ECF2]">
          <div
            className="h-full rounded-full bg-[#526B92] transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-[#98A3B2]">
          <span>Terjual {sold.toLocaleString("id-ID")}</span>
          <span>
            {soldOut ? "Kuota habis" : `${remaining.toLocaleString("id-ID")} tersedia`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function EventDetailPage() {
  const params = useParams();
  const eventId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [event, setEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [liked, setLiked] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  /* =======================================================
     FETCH EVENT
  ======================================================= */

  const fetchEventDetail = useCallback(
    async (isRefresh = false) => {
      if (!eventId) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setTicketError("");

      try {
        // Endpoint detail event.
        const eventResponse = await apiRequest(
          `/api/events/${encodeURIComponent(eventId)}`
        );

        const eventData =
          eventResponse.event ||
          eventResponse.data?.event ||
          eventResponse.data ||
          eventResponse;

        if (!eventData?.id) {
          throw new Error("Data event tidak ditemukan.");
        }

        setEvent(eventData);

        // Endpoint kategori tiket khusus event.
        // Tidak mengambil seluruh kategori tiket.
        try {
          const ticketResponse = await apiRequest(
            `/api/ticket-categories/event/${encodeURIComponent(eventId)}`
          );

          const tickets = extractArray(ticketResponse, [
            "ticket_categories",
            "ticketCategories",
            "categories",
            "tickets",
          ]);

          setTicketCategories(tickets);
        } catch (ticketErr) {
          console.error("GET EVENT TICKETS ERROR:", ticketErr);
          setTicketCategories([]);
          setTicketError(
            ticketErr.message ||
              "Kategori tiket belum dapat dimuat."
          );
        }
      } catch (err) {
        console.error("GET EVENT DETAIL ERROR:", err);
        setError(
          err.message || "Gagal mengambil detail event."
        );
        setEvent(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    fetchEventDetail();

    // Tidak ada request yang dijalankan jika ID belum tersedia.
  }, [fetchEventDetail]);

  /* =======================================================
     TICKET STATISTICS
  ======================================================= */

  const ticketStats = useMemo(() => {
    const validTickets = ticketCategories.filter(
      (ticket) => ticket && ticket.id !== undefined
    );

    const quota = validTickets.reduce(
      (total, ticket) =>
        total + Math.max(0, Number(ticket.quota) || 0),
      0
    );

    const remaining = validTickets.reduce(
      (total, ticket) =>
        total + getTicketRemaining(ticket),
      0
    );

    const sold = Math.max(0, quota - remaining);

    const prices = validTickets
      .map((ticket) => Number(ticket.price))
      .filter((price) => Number.isFinite(price) && price >= 0);

    const price =
      prices.length > 0 ? Math.min(...prices) : 0;

    return {
      price,
      quota,
      remaining,
      sold,
      totalCategories: validTickets.length,
    };
  }, [ticketCategories]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const percentage =
    ticketStats.quota > 0
      ? Math.min(
          100,
          Math.round(
            (ticketStats.sold / ticketStats.quota) * 100
          )
        )
      : 0;

  const isSoldOut =
    ticketStats.totalCategories > 0 &&
    ticketStats.remaining <= 0;

  const saleStatus = useMemo(
    () => getSaleStatus(event),
    [event]
  );

  const canBuy =
    ticketStats.totalCategories > 0 &&
    ticketStats.remaining > 0 &&
    saleStatus.available;

  const formattedDate = useMemo(
    () => formatDate(event?.event_date),
    [event?.event_date]
  );

  const formattedTime = useMemo(
    () => formatTime(event?.event_time),
    [event?.event_time]
  );

  const posterUrl = getAssetUrl(event?.poster);

  const organizerName =
    event?.organizer_name ||
    event?.organizer ||
    event?.artist_name ||
    "Penyelenggara Event";

  const locationName = [
    event?.venue_name,
    event?.city,
  ]
    .filter(Boolean)
    .join(", ");

  /* =======================================================
     SHARE EVENT
  ======================================================= */

  const handleShare = async () => {
    const shareData = {
      title: event?.event_name || "TicketVerse Event",
      text: `Lihat event ${event?.event_name || ""} di TicketVerse`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setShareMessage("Link event berhasil disalin.");
        setTimeout(() => setShareMessage(""), 2500);
      } else {
        setShareMessage("Browser tidak mendukung fitur berbagi.");
        setTimeout(() => setShareMessage(""), 2500);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("SHARE EVENT ERROR:", err);
      }
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-5">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-[#526B92]"
          />

          <p className="mt-4 text-sm font-semibold text-[#52627A]">
            Memuat detail event...
          </p>

          <p className="mt-1 text-xs text-[#98A3B2]">
            Menghubungkan ke server TicketVerse
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR / 404
  ======================================================= */

  if (error || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EEF3F9] text-[#526B92]">
            <Ticket size={34} />
          </div>

          <div className="mt-6 text-6xl font-bold tracking-tight text-[#112250]">
            404
          </div>

          <h1 className="mt-3 text-xl font-bold text-[#112250]">
            Event tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8490A1]">
            {error ||
              "Event yang kamu cari mungkin sudah tidak tersedia atau alamat event tidak valid."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => fetchEventDetail()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white transition hover:bg-[#1A326A]"
            >
              <RefreshCw size={15} />
              Coba Lagi
            </button>

            <Link
              href="/cari-acara"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DDE4ED] bg-white px-5 text-sm font-semibold text-[#52627A] transition hover:bg-[#F8FAFC]"
            >
              <ArrowLeft size={15} />
              Kembali
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F6F8FB] text-[#112250]">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative h-[440px] overflow-hidden bg-[#0D1F42]">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`Poster ${event.event_name || "event"}`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            <ImageIcon size={64} strokeWidth={1.2} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#07162F] via-[#07162F]/65 to-[#07162F]/20" />
        <div className="absolute inset-0 bg-[#07162F]/10" />

        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-between px-5 py-7 sm:px-8 lg:px-12 xl:px-16">
          {/* TOP BAR */}

          <div className="flex items-center justify-between gap-3">
            <Link
              href="/cari-acara"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-[#112250]"
            >
              <ArrowLeft size={15} />
              Kembali ke Event
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/20 text-white backdrop-blur-md transition hover:bg-white hover:text-[#112250]"
                aria-label="Bagikan event"
              >
                <Share2 size={17} />
              </button>

              <button
                type="button"
                onClick={() => setLiked((value) => !value)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/20 backdrop-blur-md transition ${
                  liked
                    ? "text-red-400"
                    : "text-white hover:bg-white hover:text-[#112250]"
                }`}
                aria-label="Simpan event"
              >
                <Heart
                  size={17}
                  fill={liked ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {shareMessage && (
            <div className="absolute right-5 top-20 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#112250] shadow-lg">
              {shareMessage}
            </div>
          )}

          {/* HERO CONTENT */}

          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#112250] shadow-sm">
                {event.category_name || "Event"}
              </span>

              {isSoldOut && (
                <span className="rounded-full border border-white/15 bg-red-500/80 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
                  Tiket Habis
                </span>
              )}

              {!saleStatus.available && (
                <span className="rounded-full border border-white/15 bg-amber-500/90 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
                  {saleStatus.label}
                </span>
              )}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
              {organizerName}
            </p>

            <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {event.event_name || "Event TicketVerse"}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-100/85">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} />
                {formattedDate}
              </div>

              <div className="flex items-center gap-2">
                <Clock3 size={15} />
                {formattedTime}
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={15} />
                {event.city || event.venue_name || "-"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_370px]">
          {/* LEFT */}

          <div className="space-y-6">
            {/* EVENT INFORMATION */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                    Event
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#112250]">
                    Informasi Event
                  </h2>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                  <Info size={20} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<CalendarDays size={18} />}
                  label="Tanggal"
                  value={formattedDate}
                />

                <InfoItem
                  icon={<Clock3 size={18} />}
                  label="Waktu"
                  value={formattedTime}
                />

                <InfoItem
                  icon={<MapPin size={18} />}
                  label="Lokasi"
                  value={locationName || "-"}
                />

                <InfoItem
                  icon={<Users size={18} />}
                  label="Kapasitas"
                  value={`${ticketStats.quota.toLocaleString("id-ID")} tiket`}
                />
              </div>
            </section>

            {/* DESCRIPTION */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                Deskripsi
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#112250]">
                Tentang Event
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#68778C]">
                {event.description ||
                  "Belum ada deskripsi untuk event ini."}
              </p>
            </section>

            {/* TICKET CATEGORIES */}

            <section
              id="kategori-tiket"
              className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                    Pilihan Tiket
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#112250]">
                    Kategori Tiket
                  </h2>

                  <p className="mt-1 text-xs text-[#8A96A8]">
                    Pilih kategori tiket sesuai kebutuhanmu.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#526B92]">
                  <Ticket size={16} />
                  {ticketStats.totalCategories} kategori
                </div>
              </div>

              {ticketError && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">
                      Kategori tiket belum berhasil dimuat
                    </p>
                    <p className="mt-1">{ticketError}</p>
                    <button
                      type="button"
                      onClick={() => fetchEventDetail(true)}
                      className="mt-2 font-bold underline"
                    >
                      Muat ulang data
                    </button>
                  </div>
                </div>
              )}

              {!ticketError && ticketCategories.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#DDE4ED] bg-[#FBFCFE] px-5 py-10 text-center">
                  <Ticket
                    size={32}
                    className="mx-auto text-[#B7C2D0]"
                  />

                  <p className="mt-3 text-sm font-bold text-[#52627A]">
                    Tiket belum tersedia
                  </p>

                  <p className="mt-1 text-xs text-[#98A3B2]">
                    Organizer belum menambahkan kategori tiket untuk event ini.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {ticketCategories.map((ticket) => (
                    <TicketCategoryCard
                      key={ticket.id}
                      ticket={ticket}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* HIGHLIGHTS */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                Kenapa hadir?
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#112250]">
                Pengalaman yang kamu dapatkan
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FeatureItem
                  title="Tiket resmi"
                  description="Pesan tiket melalui platform TicketVerse."
                />

                <FeatureItem
                  title="Informasi lengkap"
                  description="Detail tanggal, waktu, dan lokasi tersedia."
                />

                <FeatureItem
                  title="Transaksi aman"
                  description="Proses pemesanan dilakukan melalui alur transaksi TicketVerse."
                />

                <FeatureItem
                  title="E-ticket"
                  description="Tiket digital tersedia setelah pembayaran berhasil."
                />
              </div>
            </section>

            {/* ORGANIZER */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                Organizer
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                  <Building2 size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#112250]">
                    {organizerName}
                  </p>

                  <p className="mt-1 text-xs text-[#8A96A8]">
                    Penyelenggara event
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT / TICKET */}

          <aside>
            <div className="sticky top-6 rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_15px_45px_rgba(17,34,80,0.08)]">
              {/* PRICE */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#98A3B2]">
                    Harga tiket
                  </p>

                  <p className="mt-1 text-2xl font-bold tracking-tight text-[#112250]">
                    {ticketStats.totalCategories > 0
                      ? formatCurrency(ticketStats.price)
                      : "Belum tersedia"}
                  </p>

                  <p className="mt-1 text-[11px] text-[#98A3B2]">
                    Harga kategori termurah
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                  <Wallet size={20} />
                </div>
              </div>

              <div className="my-6 border-t border-[#EEF1F5]" />

              {/* AVAILABILITY */}

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8793A3]">
                    Ketersediaan tiket
                  </span>

                  <span className="font-semibold text-[#52627A]">
                    {percentage}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8ECF2]">
                  <div
                    className="h-full rounded-full bg-[#526B92] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-[#98A3B2]">
                    {ticketStats.sold.toLocaleString("id-ID")} terjual
                  </span>

                  <span className="font-semibold text-[#52627A]">
                    {ticketStats.remaining.toLocaleString("id-ID")} tersisa
                  </span>
                </div>
              </div>

              {/* SALE STATUS */}

              <div
                className={`mt-5 rounded-xl p-3 ${
                  saleStatus.available
                    ? "bg-emerald-50"
                    : "bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Info
                    size={15}
                    className={`mt-0.5 shrink-0 ${
                      saleStatus.available
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  />

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        saleStatus.available
                          ? "text-emerald-800"
                          : "text-amber-800"
                      }`}
                    >
                      {saleStatus.label}
                    </p>

                    <p
                      className={`mt-1 text-[10px] leading-5 ${
                        saleStatus.available
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {saleStatus.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* BUY BUTTON */}

              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-semibold text-[#98A3B2]"
                >
                  <Ticket size={17} />
                  Tiket Habis
                </button>
              ) : ticketStats.totalCategories === 0 ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-semibold text-[#98A3B2]"
                >
                  <Ticket size={17} />
                  Tiket Belum Tersedia
                </button>
              ) : !saleStatus.available ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-semibold text-[#98A3B2]"
                >
                  <Clock3 size={17} />
                  {saleStatus.type === "upcoming"
                    ? "Penjualan Belum Dibuka"
                    : "Penjualan Ditutup"}
                </button>
              ) : (
                <Link
                  href={`/cari-acara/${event.id}/beli`}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#112250] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,34,80,0.16)] transition hover:bg-[#1A326A] hover:shadow-[0_12px_28px_rgba(17,34,80,0.22)]"
                >
                  <Ticket size={17} />
                  Beli Tiket
                  <ChevronRight size={16} />
                </Link>
              )}

              {/* CATEGORY SHORTCUT */}

              <a
                href="#kategori-tiket"
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] text-xs font-semibold text-[#52627A] transition hover:bg-[#F6F8FB]"
              >
                <Tag size={14} />
                Lihat kategori tiket
              </a>

              {/* SECURE */}

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#8A96A8]">
                <ShieldCheck size={14} />
                Transaksi melalui TicketVerse
              </div>

              <div className="my-5 border-t border-[#EEF1F5]" />

              {/* EVENT SUMMARY */}

              <div className="space-y-3">
                <SummaryRow
                  icon={<CalendarDays size={15} />}
                  label="Tanggal"
                  value={formattedDate}
                />

                <SummaryRow
                  icon={<Clock3 size={15} />}
                  label="Waktu"
                  value={formattedTime}
                />

                <SummaryRow
                  icon={<MapPin size={15} />}
                  label="Lokasi"
                  value={locationName || "-"}
                />

                <SummaryRow
                  icon={<Ticket size={15} />}
                  label="Kategori"
                  value={`${ticketStats.totalCategories} kategori tiket`}
                />
              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={() => fetchEventDetail(true)}
                disabled={refreshing}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] py-2.5 text-xs font-semibold text-[#52627A] transition hover:bg-[#F6F8FB] disabled:opacity-60"
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Memperbarui..." : "Refresh informasi"}
              </button>
            </div>
          </aside>
        </div>

        {/* FOOTER */}

        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-[#DDE4ED] py-5 text-[11px] text-[#98A3B2] sm:flex-row">
          <p>TicketVerse · Event Experience Platform</p>
          <p>Event #{event.id}</p>
        </div>
      </div>
    </main>
  );
}

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
  Sparkles,
  TrendingUp,
} from "lucide-react";

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");

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

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

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

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#EEF1F5] bg-[#FBFCFE] p-4 transition duration-300 hover:border-[#DDE4ED] hover:bg-white hover:shadow-sm">
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
    <div className="flex gap-3 rounded-2xl border border-[#EEF1F5] bg-[#FBFCFE] p-4 transition duration-300 hover:border-[#DDE4ED] hover:bg-white hover:shadow-sm">
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

function TicketCategoryCard({ ticket }) {
  const quota = Number(ticket.quota || 0);
  const remaining = getTicketRemaining(ticket);
  const sold = Math.max(0, quota - remaining);

  const percentage =
    quota > 0 ? Math.min(100, (sold / quota) * 100) : 0;

  const soldOut = quota > 0 && remaining <= 0;
  const almostSoldOut = quota > 0 && remaining > 0 && (remaining / quota) < 0.2;

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#E5EAF1] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#112250]/30 hover:shadow-[0_20px_40px_-15px_rgba(17,34,80,0.15)]">
      
      {/* Ornamen Latar Belakang */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#EEF3F9] to-transparent blur-2xl transition duration-500 group-hover:scale-150 group-hover:bg-[#DCE7F7]/60" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold text-[#112250]">
              {ticket.category_name || "Kategori Tiket"}
            </h3>

            {soldOut ? (
              <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                HABIS
              </span>
            ) : almostSoldOut ? (
              <span className="animate-pulse rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
                HAMPIR HABIS
              </span>
            ) : (
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                TERSEDIA
              </span>
            )}
          </div>

          {/* HARGA GLOWING */}
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-[32px] font-black leading-none tracking-tight text-[#112250] [text-shadow:0_0_20px_rgba(17,34,80,0.4)] transition-all duration-300 group-hover:[text-shadow:0_0_30px_rgba(17,34,80,0.6)]">
              {formatCurrency(ticket.price)}
            </p>
            <span className="text-[11px] font-semibold text-[#98A3B2]">/ tiket</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#E5EAF1] bg-[#F8FAFC] px-3.5 py-2 text-xs font-bold text-[#526B92] shadow-sm transition-colors group-hover:border-[#112250]/20 group-hover:bg-white">
          <Ticket size={14} className="text-[#112250]" />
          <span>#{ticket.id}</span>
        </div>
      </div>

      {/* PROGRESS BAR & STATISTIK */}
      <div className="relative mt-6 rounded-xl border border-[#F1F4F9] bg-[#FBFCFE] p-4 transition-colors group-hover:bg-[#F8FAFC]">
        <div className="mb-3 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#8793A3]">Ketersediaan Tiket</span>
          <span className="font-bold text-[#112250]">
            {remaining.toLocaleString("id-ID")} <span className="font-medium text-[#98A3B2]">/ {quota.toLocaleString("id-ID")}</span>
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-[#E8ECF2] shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              soldOut
                ? "bg-red-400"
                : "bg-gradient-to-r from-[#526B92] via-[#112250] to-[#1A326A] group-hover:shadow-[0_0_12px_rgba(17,34,80,0.6)]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1.5 font-medium text-[#98A3B2]">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Terjual {sold.toLocaleString("id-ID")}
          </span>
          <span className={`font-bold ${soldOut ? "text-red-500" : "text-[#112250]"}`}>
            {soldOut ? "Kuota habis" : `${remaining.toLocaleString("id-ID")} tersedia`}
          </span>
        </div>
      </div>
    </div>
  );
}

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
  }, [fetchEventDetail]);

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

  return (
    <main className="min-h-screen bg-[#F6F8FB] text-[#112250] pb-16">
      
      <section className="relative w-full overflow-hidden bg-[#0D1F42]">
        <div className="absolute inset-0 z-0">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt="background"
              className="h-full w-full scale-[1.8] object-cover object-center blur-2xl opacity-60"
            />
          ) : (
            <div className="h-full w-full bg-[#112250]" />
          )}
        </div>

        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,#07162F_100%)] opacity-90" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#07162F] via-[#07162F]/70 to-transparent" />
        
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent bg-[length:24px_24px] bg-repeat opacity-30" />

        <div className="relative z-20 mx-auto flex w-full max-w-[1200px] flex-col justify-between px-5 py-8 sm:px-8 lg:px-12">
          
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/cari-acara"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-[#112250]"
            >
              <ArrowLeft size={15} className="transition group-hover:-translate-x-0.5" />
              Kembali ke Event
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white hover:text-[#112250]"
                aria-label="Bagikan event"
              >
                <Share2 size={17} />
              </button>

              <button
                type="button"
                onClick={() => setLiked((value) => !value)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md transition ${
                  liked
                    ? "text-red-400 hover:bg-white hover:text-red-500"
                    : "text-white hover:bg-white hover:text-[#112250]"
                }`}
                aria-label="Simpan event"
              >
                <Heart size={17} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {shareMessage && (
            <div className="absolute right-5 top-20 z-50 animate-fade-in rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#112250] shadow-xl">
              {shareMessage}
            </div>
          )}

          <div className="mt-12 flex flex-col-reverse items-start gap-10 md:flex-row md:items-end md:justify-between lg:mt-16">
            
            <div className="w-full max-w-3xl flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-white px-3.5 py-1.5 text-[10px] font-bold text-[#112250] shadow-sm">
                  {event.category_name || "Event"}
                </span>

                {isSoldOut && (
                  <span className="rounded-full border border-red-500/30 bg-red-500/90 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur">
                    TIKET HABIS
                  </span>
                )}

                {!saleStatus.available && !isSoldOut && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/90 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur">
                    {saleStatus.label.toUpperCase()}
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                {organizerName}
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                {event.event_name || "Event TicketVerse"}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-blue-100/90">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-blue-300" />
                  {formattedDate}
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={16} className="text-blue-300" />
                  {formattedTime}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-300" />
                  {event.city || event.venue_name || "-"}
                </div>
              </div>
            </div>

            <div className="w-full shrink-0 sm:w-[260px] md:w-[300px]">
              <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/20 bg-[#112250]/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={`Poster ${event.event_name || "event"}`}
                    className="h-full w-full object-contain object-center transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-white/40">
                    <ImageIcon size={48} strokeWidth={1.2} />
                    <span className="mt-3 text-xs font-medium">Poster tidak tersedia</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-12 mt-2">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          
          <div className="space-y-8">
            
            <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-7 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#EEF1F5] pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                    Event
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#112250]">
                    Informasi Event
                  </h2>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3F9] text-[#526B92] ring-1 ring-[#DDE4ED]">
                  <Info size={22} />
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

            <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-7 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-[#526B92]" />
                <h2 className="text-xl font-bold text-[#112250]">
                  Tentang Event
                </h2>
              </div>

              <div className="prose prose-sm max-w-none text-[#68778C]">
                <p className="whitespace-pre-line text-sm leading-8">
                  {event.description ||
                    "Belum ada deskripsi untuk event ini."}
                </p>
              </div>
            </section>

            <section
              id="kategori-tiket"
              className="rounded-[24px] border border-[#DDE4ED] bg-white p-7 shadow-[0_8px_30px_rgba(17,34,80,0.05)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#EEF1F5] pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                    Pilihan Tiket
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#112250]">
                    Kategori Tiket
                  </h2>

                  <p className="mt-1.5 text-sm text-[#8A96A8]">
                    Pilih kategori tiket sesuai kebutuhanmu.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-[#EEF3F9] px-4 py-2.5 text-xs font-bold text-[#112250]">
                  <Ticket size={16} />
                  {ticketStats.totalCategories} Kategori
                </div>
              </div>

              {ticketError && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">
                      Kategori tiket belum berhasil dimuat
                    </p>
                    <p className="mt-1 text-amber-700">{ticketError}</p>
                    <button
                      type="button"
                      onClick={() => fetchEventDetail(true)}
                      className="mt-3 inline-flex items-center gap-1.5 font-bold text-amber-900 hover:underline"
                    >
                      <RefreshCw size={14} /> Muat ulang data
                    </button>
                  </div>
                </div>
              )}

              {!ticketError && ticketCategories.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#DDE4ED] bg-[#FBFCFE] px-5 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3F9]">
                    <Ticket size={28} className="text-[#B7C2D0]" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-[#52627A]">
                    Tiket belum tersedia
                  </p>

                  <p className="mt-1 text-xs text-[#98A3B2]">
                    Organizer belum menambahkan kategori tiket untuk event ini.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {ticketCategories.map((ticket) => (
                    <TicketCategoryCard
                      key={ticket.id}
                      ticket={ticket}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-7 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-[#526B92]" />
                <h2 className="text-xl font-bold text-[#112250]">
                  Pengalaman yang kamu dapatkan
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-7 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                Organizer
              </p>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3F9] text-[#526B92] ring-1 ring-[#DDE4ED]">
                  <Building2 size={24} />
                </div>

                <div className="min-w-0">
                  <p className="text-base font-bold text-[#112250]">
                    {organizerName}
                  </p>

                  <p className="mt-1 text-xs text-[#8A96A8]">
                    Penyelenggara event
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside>
            <div className="sticky top-8 rounded-[24px] border border-[#DDE4ED] bg-white p-7 shadow-[0_20px_60px_rgba(17,34,80,0.08)]">
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#98A3B2]">
                    Harga tiket
                  </p>

                  <p className="mt-1.5 text-[28px] font-bold leading-none tracking-tight text-[#112250]">
                    {ticketStats.totalCategories > 0
                      ? formatCurrency(ticketStats.price)
                      : "Belum tersedia"}
                  </p>

                  <p className="mt-2 text-[11px] text-[#98A3B2]">
                    Harga kategori termurah
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3F9] text-[#526B92] ring-1 ring-[#DDE4ED]">
                  <Wallet size={22} />
                </div>
              </div>

              <div className="my-7 border-t border-[#EEF1F5]" />

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#8793A3]">
                    Ketersediaan tiket
                  </span>

                  <span className="font-bold text-[#112250]">
                    {percentage}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-[#E8ECF2]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#526B92] to-[#112250] transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-[#98A3B2]">
                    {ticketStats.sold.toLocaleString("id-ID")} terjual
                  </span>

                  <span className="font-semibold text-[#52627A]">
                    {ticketStats.remaining.toLocaleString("id-ID")} tersisa
                  </span>
                </div>
              </div>

              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  saleStatus.available
                    ? "bg-emerald-50/50 border-emerald-100"
                    : "bg-amber-50/50 border-amber-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Info
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      saleStatus.available
                        ? "text-emerald-600"
                        : "text-amber-600"
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
                      className={`mt-1 text-[11px] leading-5 ${
                        saleStatus.available
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {saleStatus.description}
                    </p>
                  </div>
                </div>
              </div>

              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-bold text-[#98A3B2]"
                >
                  <Ticket size={18} />
                  Tiket Habis
                </button>
              ) : ticketStats.totalCategories === 0 ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-bold text-[#98A3B2]"
                >
                  <Ticket size={18} />
                  Tiket Belum Tersedia
                </button>
              ) : !saleStatus.available ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-bold text-[#98A3B2]"
                >
                  <Clock3 size={18} />
                  {saleStatus.type === "upcoming"
                    ? "Penjualan Belum Dibuka"
                    : "Penjualan Ditutup"}
                </button>
              ) : (
                <Link
                  href={`/cari-acara/${event.id}/beli`}
                  className="group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#112250] text-sm font-bold text-white shadow-[0_8px_20px_rgba(17,34,80,0.2)] transition hover:bg-[#1A326A] hover:shadow-[0_12px_28px_rgba(17,34,80,0.3)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Ticket size={18} />
                    Beli Tiket
                    <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
                  </span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              )}

              <a
                href="#kategori-tiket"
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] text-xs font-bold text-[#52627A] transition hover:bg-[#F6F8FB] hover:text-[#112250]"
              >
                <Tag size={15} />
                Lihat kategori tiket
              </a>

              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-[#8A96A8]">
                <ShieldCheck size={14} className="text-emerald-500" />
                Transaksi aman melalui TicketVerse
              </div>

              <div className="my-6 border-t border-[#EEF1F5]" />

              <div className="space-y-4">
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

              <button
                type="button"
                onClick={() => fetchEventDetail(true)}
                disabled={refreshing}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] bg-[#FBFCFE] py-3 text-xs font-bold text-[#52627A] transition hover:bg-[#F6F8FB] hover:text-[#112250] disabled:opacity-60"
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

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-[#DDE4ED] py-6 text-[11px] text-[#98A3B2] sm:flex-row">
          <p>© 2024 TicketVerse · Event Experience Platform</p>
          <p>Event ID #{event.id}</p>
        </div>
      </div>
    </main>
  );
}
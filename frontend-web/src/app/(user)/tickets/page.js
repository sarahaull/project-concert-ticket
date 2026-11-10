
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Ticket,
  CalendarDays,
  Clock10,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  TicketCheck,
  TicketX,
  Sparkles,
  ImageOff,
  Armchair,
  Hash,
  Music2,
  Copy,
  Check,
} from "lucide-react";

// =====================================================
// API CONFIGURATION
// Mendukung NEXT_PUBLIC_API_URL dengan atau tanpa /api
// =====================================================

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const TICKETS_ENDPOINT = `${API_BASE}/api/tickets`;

// =====================================================
// FORMAT HELPERS
// =====================================================

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate);
};

const formatShortDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate);
};

const formatTime = (time) => {
  if (!time) return "-";

  const value = String(time);
  return value.length >= 5 ? value.substring(0, 5) : value;
};

const getTicketStatus = (ticket) => {
  const paymentStatus = String(ticket.payment_status || "")
    .trim()
    .toLowerCase();

  const checkIn = String(ticket.check_in || "")
    .trim()
    .toLowerCase();

  if (
    paymentStatus === "cancelled" ||
    paymentStatus === "canceled"
  ) {
    return "cancelled";
  }

  if (paymentStatus === "expired") return "expired";

  if (
    paymentStatus === "failed" ||
    paymentStatus === "deny"
  ) {
    return "cancelled";
  }

  if (
    paymentStatus === "paid" ||
    paymentStatus === "success" ||
    paymentStatus === "settlement"
  ) {
    return checkIn === "sudah" ? "used" : "active";
  }

  if (paymentStatus === "pending") return "pending";

  return "unknown";
};

const getPosterUrl = (ticket) => {
  const candidates = [
    ticket.poster,
    ticket.event_poster,
    ticket.event_image,
    ticket.image,
    ticket.poster_url,
    ticket.event_poster_url,
    ticket.cover,
    ticket.cover_url,
    ticket.banner,
    ticket.banner_url,
    ticket.thumbnail,
    ticket.event_thumbnail,
  ];

  const found = candidates.find(
    (value) =>
      typeof value === "string" && value.trim() !== ""
  );

  if (!found) return null;

  const value = found.trim();

  if (
    /^https?:\/\//i.test(value) ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE}${value}`;
  }

  const filename = value.replace(/^uploads[\\/]/i, "");

  return `${API_BASE}/uploads/${filename}`;
};

const getSeatLabel = (ticket) => {
  const section =
    ticket.section_name ||
    ticket.section_code ||
    "";

  const row = ticket.seat_row || "";
  const number = ticket.seat_number || "";

  if (!section && !row && !number) {
    return null;
  }

  return {
    section: section || "Section tidak tersedia",
    row: row || "-",
    number: number || "-",
  };
};

const getTicketPrice = (ticket) => {
  const price = Number(ticket.price || 0);

  if (price > 0) return price;

  const subtotal = Number(ticket.subtotal || 0);
  const quantity = Number(ticket.quantity || 1);

  if (subtotal > 0 && quantity > 0) {
    return subtotal / quantity;
  }

  return 0;
};

// =====================================================
// STATUS BADGE
// =====================================================

const StatusBadge = ({ status }) => {
  const statusMap = {
    active: {
      label: "Aktif",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2,
    },
    used: {
      label: "Sudah Digunakan",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: TicketCheck,
    },
    expired: {
      label: "Kadaluarsa",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: XCircle,
    },
    cancelled: {
      label: "Dibatalkan",
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      icon: XCircle,
    },
    pending: {
      label: "Menunggu Pembayaran",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
    },
    unknown: {
      label: "Status Tidak Tersedia",
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      icon: AlertCircle,
    },
  };

  const config = statusMap[status] || statusMap.unknown;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

// =====================================================
// POSTER
// =====================================================

const PosterImage = ({ ticket }) => {
  const [imageError, setImageError] = useState(false);

  const posterUrl = getPosterUrl(ticket);

  if (!posterUrl || imageError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#112250] via-[#3B507D] to-[#112250]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            <ImageOff className="h-8 w-8 text-white" />
          </div>

          <p className="line-clamp-2 text-lg font-bold text-white">
            {ticket.event_name || "Event"}
          </p>

          <p className="mt-2 text-[11px] font-medium uppercase tracking-widest text-white/60">
            TicketVerse
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={posterUrl}
      alt={ticket.event_name || "Poster Event"}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      onError={() => setImageError(true)}
    />
  );
};

// =====================================================
// SEAT INFORMATION
// =====================================================

const SeatInformation = ({ ticket }) => {
  const seat = getSeatLabel(ticket);

  return (
    <div className="rounded-xl border border-[#E5C27A]/40 bg-gradient-to-br from-[#FFFDF7] to-[#F8F5EC] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#112250] text-white">
            <Armchair className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
              Posisi Tempat Duduk
            </p>
            <p className="text-xs font-bold text-[#112250]">
              {seat ? "Kursi Anda" : "Informasi kursi"}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-[#E5C27A]/50 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#92713A]">
          {seat ? "Terdaftar" : "General"}
        </span>
      </div>

      {seat ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#E5C27A]/30 bg-white p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9B907F]">
              Section
            </p>
            <p className="mt-1 truncate text-sm font-black text-[#112250]">
              {seat.section}
            </p>
          </div>

          <div className="rounded-lg border border-[#E5C27A]/30 bg-white p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9B907F]">
              Baris
            </p>
            <p className="mt-1 text-sm font-black text-[#112250]">
              {seat.row}
            </p>
          </div>

          <div className="rounded-lg border border-[#E5C27A]/30 bg-white p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9B907F]">
              Nomor Kursi
            </p>
            <p className="mt-1 text-sm font-black text-[#112250]">
              {seat.number}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#D8D0C4] bg-white/70 px-3 py-3">
          <p className="text-xs font-semibold text-[#3B507D]">
            Tiket ini tidak memiliki nomor kursi khusus.
          </p>
          <p className="mt-1 text-[10px] leading-5 text-[#9B907F]">
            Kemungkinan tiket menggunakan area berdiri atau
            tempat duduk bebas (General Admission).
          </p>
        </div>
      )}

      {ticket.seat_id && (
        <p className="mt-2 text-right text-[9px] font-medium text-[#9B907F]">
          Seat ID: {ticket.seat_id}
        </p>
      )}
    </div>
  );
};

// =====================================================
// TICKET CARD
// Satu record dari API = satu tiket yang diterbitkan.
// =====================================================

const TicketCard = ({ ticket }) => {
  const status = getTicketStatus(ticket);
  const price = getTicketPrice(ticket);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (status !== "active" && status !== "used") return;

    const qrValue = ticket.qr_code || ticket.ticket_code;

    if (!qrValue) {
      alert("QR Code tiket belum tersedia.");
      return;
    }

    const qrUrl =
      "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=" +
      encodeURIComponent(qrValue);

    window.open(qrUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyCode = async () => {
    if (!ticket.ticket_code) return;

    try {
      await navigator.clipboard.writeText(ticket.ticket_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Gagal menyalin kode tiket:", error);
    }
  };

  return (
    <article className="group relative w-full overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#112250]/20 hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row">
        {/* POSTER EVENT */}
        <div className="relative h-56 flex-shrink-0 overflow-hidden sm:min-h-[340px] sm:h-auto sm:w-[34%] lg:w-[32%]">
          <PosterImage ticket={ticket} />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent sm:to-transparent" />

          <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
            <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              {ticket.category_name || "Event"}
            </span>

            <StatusBadge status={status} />
          </div>

          <div className="absolute bottom-4 left-4 right-4 sm:hidden">
            <h3 className="line-clamp-2 text-lg font-bold text-white">
              {ticket.event_name || "Event"}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/90">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatShortDate(ticket.event_date)}
              </span>

              <span className="flex items-center gap-1">
                <Clock10 className="h-3.5 w-3.5" />
                {formatTime(ticket.event_time)} WIB
              </span>
            </div>
          </div>
        </div>

        {/* PERFORATED EDGE */}
        <div className="relative hidden w-8 flex-shrink-0 items-center justify-center bg-white sm:flex">
          <div className="absolute bottom-0 left-1/2 top-0 border-l-2 border-dashed border-[#D8D0C4]/60" />
          <div className="absolute left-1/2 top-4 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#D8D0C4]/60 bg-[#F0F4F8]" />
          <div className="absolute bottom-4 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#D8D0C4]/60 bg-[#F0F4F8]" />

          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap bg-white px-2 text-[8px] font-bold uppercase tracking-widest text-[#9B907F]">
            TicketVerse
          </span>
        </div>

        {/* TICKET DETAILS */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="hidden line-clamp-2 text-lg font-bold text-[#112250] transition group-hover:text-[#3B507D] sm:block">
                  {ticket.event_name || "Event"}
                </h3>

                <p className="mt-1 hidden text-xs text-[#9B907F] sm:block">
                  {ticket.artist_name || "TicketVerse Event"}
                </p>
              </div>

              <span className="hidden max-w-[150px] shrink-0 truncate rounded-md border border-[#D8D0C4]/40 bg-[#F7F8FA] px-2 py-1 font-mono text-[10px] font-bold text-[#3B507D] sm:inline-block">
                {ticket.order_code || "-"}
              </span>
            </div>

            {/* EVENT INFORMATION */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs font-medium text-[#3B507D]/80">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#3B507D]" />
                  <span>{formatDate(ticket.event_date)}</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-medium text-[#3B507D]/80">
                  <Clock10 className="h-4 w-4 shrink-0 text-[#3B507D]" />
                  <span>{formatTime(ticket.event_time)} WIB</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-medium text-[#3B507D]/80">
                  <MapPin className="h-4 w-4 shrink-0 text-[#3B507D]" />
                  <span className="line-clamp-1">
                    {ticket.venue_name || ticket.city || "Lokasi event"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs font-medium text-[#3B507D]/80">
                  <Ticket className="h-4 w-4 shrink-0 text-[#3B507D]" />
                  <span>{ticket.category_name || "Kategori tiket"}</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-medium text-[#3B507D]/80">
                  <Music2 className="h-4 w-4 shrink-0 text-[#3B507D]" />
                  <span className="truncate">
                    {ticket.artist_name || "Artis tidak tersedia"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-medium text-[#3B507D]/80">
                  <Hash className="h-4 w-4 shrink-0 text-[#3B507D]" />
                  <span className="truncate font-mono text-[11px]">
                    {ticket.ticket_code || `Tiket #${ticket.id}`}
                  </span>
                </div>
              </div>
            </div>

            {/* SEAT INFORMATION */}
            <div className="mt-5">
              <SeatInformation ticket={ticket} />
            </div>

            {/* TICKET CODE */}
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#D8D0C4]/40 bg-[#F7F8FA] px-3 py-2">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#9B907F]">
                  Kode Tiket
                </p>
                <p className="mt-0.5 truncate font-mono text-xs font-bold text-[#112250]">
                  {ticket.ticket_code || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!ticket.ticket_code}
                title="Salin kode tiket"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D8D0C4]/50 bg-white text-[#3B507D] transition hover:border-[#112250] hover:text-[#112250] disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* PRICE AND ACTIONS */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[#D8D0C4]/40 pt-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
                Harga Tiket
              </p>

              <p className="mt-0.5 text-xl font-black tracking-tight text-[#112250]">
                {formatRupiah(price)}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href={`/tickets/${ticket.id}`}
                title="Lihat tiket"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D0C4]/50 bg-white text-[#3B507D] transition hover:border-[#112250] hover:bg-[#112250]/5 hover:text-[#112250]"
              >
                <Eye className="h-4 w-4" />
              </Link>

              <button
                type="button"
                title="Download QR"
                onClick={handleDownload}
                disabled={status !== "active" && status !== "used"}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D0C4]/50 bg-white text-[#3B507D] transition hover:border-[#112250] hover:bg-[#112250]/5 hover:text-[#112250] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
              </button>

              <Link
                href={`/tickets/${ticket.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#112250] to-[#3B507D] px-4 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Detail
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

// =====================================================
// MAIN PAGE
// =====================================================

export default function TicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const requestInProgress = useRef(false);

  // ---------------------------------------------------
  // FETCH TICKETS FROM BACKEND
  // GET /api/tickets
  // ---------------------------------------------------

  const fetchTickets = useCallback(
    async (showLoading = true) => {
      if (requestInProgress.current) return;

      requestInProgress.current = true;

      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(TICKETS_ENDPOINT, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message ||
              `Gagal mengambil tiket. HTTP ${response.status}`
          );
        }

        const ticketRows = Array.isArray(data.tickets)
          ? data.tickets
          : [];

        setTickets(ticketRows);
      } catch (err) {
        console.error("GET TICKETS ERROR:", err);

        setError(
          err?.message ||
            "Terjadi kesalahan saat mengambil data tiket."
        );
      } finally {
        requestInProgress.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  // ---------------------------------------------------
  // INITIAL LOAD + AUTO REFRESH
  // ---------------------------------------------------

  useEffect(() => {
    fetchTickets(true);

    const interval = setInterval(() => {
      fetchTickets(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  // ---------------------------------------------------
  // FILTER + SEARCH
  // ---------------------------------------------------

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const status = getTicketStatus(ticket);

      if (filter !== "all" && status !== filter) {
        return false;
      }

      if (search.trim()) {
        const keyword = search.trim().toLowerCase();

        const seat = getSeatLabel(ticket);

        const searchableText = [
          ticket.event_name,
          ticket.category_name,
          ticket.order_code,
          ticket.ticket_code,
          ticket.venue_name,
          ticket.city,
          ticket.artist_name,
          ticket.section_name,
          ticket.section_code,
          ticket.seat_row,
          ticket.seat_number,
          seat?.section,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(keyword)) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, filter, search]);

  // ---------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------

  const totalTickets = tickets.length;

  const activeTickets = tickets.filter(
    (ticket) => getTicketStatus(ticket) === "active"
  ).length;

  const usedTickets = tickets.filter(
    (ticket) => getTicketStatus(ticket) === "used"
  ).length;

  const pendingTickets = tickets.filter(
    (ticket) => getTicketStatus(ticket) === "pending"
  ).length;

  const expiredTickets = tickets.filter(
    (ticket) => getTicketStatus(ticket) === "expired"
  ).length;

  const statusFilters = [
    { value: "all", label: "Semua", icon: Ticket },
    { value: "active", label: "Aktif", icon: CheckCircle2 },
    { value: "used", label: "Digunakan", icon: TicketCheck },
    { value: "pending", label: "Menunggu Pembayaran", icon: Clock },
    { value: "expired", label: "Kadaluarsa", icon: AlertCircle },
    { value: "cancelled", label: "Dibatalkan", icon: TicketX },
  ];

  // ---------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D8D0C4]/40 bg-white shadow-lg">
            <Loader2
              size={26}
              className="animate-spin text-[#112250]"
            />
          </div>

          <h2 className="mt-4 text-base font-bold text-[#112250]">
            Memuat tiket...
          </h2>

          <p className="mt-1 text-sm text-[#9B907F]">
            Mengambil data tiket dan posisi kursi dari server.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------

  if (error && tickets.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#112250]">
            Gagal Memuat Tiket
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#9B907F]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchTickets(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------

  return (
    <div className="w-full min-w-0">
      {/* HEADER */}
      <section className="relative isolate mb-6 overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-gradient-to-br from-[#112250] via-[#1A326A] to-[#3B507D] shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,194,122,0.15),transparent_50%)]" />

        <div className="relative w-full px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C27A]">
                <Sparkles size={14} />
                Koleksi Tiket
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Tiket Saya
              </h1>

              <p className="mt-1 text-sm text-white/70">
                Kelola tiket, QR Code, dan posisi tempat duduk
                event Anda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
                <Ticket className="h-4 w-4" />
                <span>{totalTickets} tiket</span>
              </div>

              <button
                type="button"
                onClick={() => fetchTickets(false)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Perbarui
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REFRESH WARNING */}
      {error && tickets.length > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => fetchTickets(false)}
            className="shrink-0 font-bold underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* STATISTICS */}
      {tickets.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#D8D0C4]/40 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#112250]/10 text-[#112250]">
              <Ticket className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
                Total
              </p>
              <p className="mt-0.5 text-lg font-black text-[#112250]">
                {totalTickets}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Aktif
              </p>
              <p className="mt-0.5 text-lg font-black text-emerald-700">
                {activeTickets}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-200/80 bg-blue-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <TicketCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Digunakan
              </p>
              <p className="mt-0.5 text-lg font-black text-blue-700">
                {usedTickets}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Pending
              </p>
              <p className="mt-0.5 text-lg font-black text-amber-700">
                {pendingTickets}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#D8D0C4]/40 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B907F]" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari event, kategori, kode tiket, atau nomor kursi..."
            className="w-full rounded-xl border border-[#D8D0C4]/40 bg-[#F7F8FA] py-3 pl-10 pr-4 text-sm text-[#112250] outline-none transition placeholder:text-[#9B907F] focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
          />
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((item) => {
            const Icon = item.icon;
            const active = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-[#112250] to-[#3B507D] text-white shadow-sm"
                    : "border border-[#D8D0C4]/40 bg-white text-[#3B507D] hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* EMPTY STATE / TICKET LIST */}
      {filteredTickets.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-white px-6 py-16 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F8FA] text-[#9B907F]">
            <Ticket className="h-8 w-8" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-[#112250]">
            {tickets.length === 0
              ? "Belum Ada Tiket"
              : "Tidak Ada Tiket"}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#9B907F]">
            {tickets.length === 0
              ? "Tiket akan muncul setelah pesanan berhasil dibayar dan tiket diterbitkan oleh sistem."
              : "Tidak ditemukan tiket yang sesuai dengan filter atau kata kunci Anda."}
          </p>

          {tickets.length === 0 ? (
            <Link
              href="/cari-acara"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Ticket className="h-4 w-4" />
              Cari Event
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="mx-auto grid w-full grid-cols-1 gap-5">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
            />
          ))}
        </div>
      )}
    </div>
  );
}

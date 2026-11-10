
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Hash,
  Users,
  Music,
  Building2,
  ChevronRight,
  User,
  Mail,
  Phone,
  AtSign,
  Armchair,
  Rows3,
  MapPinned,
  RefreshCw,
  ImageOff,
} from "lucide-react";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const TICKET_DETAIL_ENDPOINT = `${API_BASE}/api/tickets`;

// ============================================================
// HELPERS
// ============================================================

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
};

const formatDateTime = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
};

const formatTime = (time) => {
  if (!time) return "-";

  const value = String(time);

  return value.length >= 5 ? value.substring(0, 5) : value;
};

const getPaymentStatus = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (["paid", "success", "settlement"].includes(normalized)) {
    return {
      label: "Pembayaran Berhasil",
      value: status,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  }

  if (normalized === "pending") {
    return {
      label: "Menunggu Pembayaran",
      value: status,
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertCircle,
    };
  }

  if (["cancelled", "canceled", "deny", "failed"].includes(normalized)) {
    return {
      label: "Pembayaran Gagal / Dibatalkan",
      value: status,
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertCircle,
    };
  }

  if (normalized === "expired") {
    return {
      label: "Pesanan Kedaluwarsa",
      value: status,
      className: "bg-gray-100 text-gray-600 border-gray-200",
      icon: AlertCircle,
    };
  }

  return {
    label: status || "Tidak diketahui",
    value: status || "-",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: AlertCircle,
  };
};

const getCheckInStatus = (status) => {
  const checkedIn = String(status || "").toLowerCase() === "sudah";

  if (checkedIn) {
    return {
      label: "Sudah Check-in",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  }

  return {
    label: "Belum Check-in",
    className: "bg-blue-50 text-[#3B507D] border-blue-200",
    icon: Ticket,
  };
};

const getAssetUrl = (value) => {
  if (!value || typeof value !== "string") return null;

  const path = value.trim();

  if (!path) return null;

  if (/^(https?:\/\/|data:)/i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE}${path}`;
  }

  return `${API_BASE}/uploads/${path.replace(/^uploads[\\/]/i, "")}`;
};

const getInitials = (name) => {
  if (!name) return "CU";

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getSeatInformation = (ticket) => {
  const mode = String(ticket?.seat_mode || "").toUpperCase();

  if (ticket?.seat_number) {
    return {
      type: "Kursi Bernomor",
      section: ticket.section_name || "Section belum tersedia",
      row: ticket.row_label || "-",
      number: ticket.seat_number,
    };
  }

  if (mode === "GENERAL" || !ticket?.seat_id) {
    return {
      type: "General Admission",
      section: ticket.section_name || ticket.category_name || "Area Umum",
      row: null,
      number: null,
    };
  }

  return {
    type: "Informasi kursi belum tersedia",
    section: ticket.section_name || "-",
    row: ticket.row_label || null,
    number: null,
  };
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

const StatusBadge = ({ status, children }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${status.className}`}
    >
      {children}
      {status.label}
    </span>
  );
};

const InfoItem = ({
  icon: Icon,
  label,
  value,
  mono = false,
  full = false,
}) => {
  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-xl border border-[#D8D0C4]/30 bg-[#F7F8FA] p-3 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon className="h-4 w-4 text-[#3B507D]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#9B907F]">
          {label}
        </p>

        <p
          className={`mt-0.5 break-words text-sm font-semibold text-[#112250] ${
            mono ? "font-mono" : ""
          }`}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
};

const SectionHeading = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#112250]">
        <Icon className="h-5 w-5 text-white" />
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-bold text-[#112250] sm:text-lg">
          {title}
        </h2>

        <p className="text-xs text-[#9B907F]">
          {description}
        </p>
      </div>
    </div>
  );
};

// ============================================================
// CUSTOMER PHOTO
// ============================================================

const CustomerAvatar = ({ customer }) => {
  const [imageError, setImageError] = useState(false);

  const photoUrl = getAssetUrl(customer?.customer_photo);

  if (!photoUrl || imageError) {
    return (
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#112250] to-[#3B507D] text-lg font-extrabold text-white">
        {getInitials(customer?.customer_name)}
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={customer?.customer_name || "Customer"}
      className="h-16 w-16 flex-shrink-0 rounded-2xl border border-[#D8D0C4]/40 object-cover"
      onError={() => setImageError(true)}
    />
  );
};

// ============================================================
// EVENT POSTER
// ============================================================

const EventPoster = ({ ticket }) => {
  const [imageError, setImageError] = useState(false);

  const posterUrl = getAssetUrl(ticket?.poster);

  if (!posterUrl || imageError) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#112250] to-[#3B507D] text-white">
        <ImageOff className="h-9 w-9 text-white/70" />
        <p className="mt-3 text-sm font-bold">
          {ticket?.event_name || "Event"}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-white/60">
          TicketVerse
        </p>
      </div>
    );
  }

  return (
    <img
      src={posterUrl}
      alt={ticket?.event_name || "Poster Event"}
      className="h-48 w-full rounded-2xl object-cover"
      onError={() => setImageError(true)}
    />
  );
};

// ============================================================
// QR CODE
// ============================================================

const QRCodeBox = ({ value }) => {
  if (!value) {
    return (
      <div className="flex h-60 w-60 flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8D0C4] bg-[#F7F8FA] text-center">
        <QrCode className="h-10 w-10 text-[#9B907F]" />
        <p className="mt-3 text-xs text-[#9B907F]">
          QR Code belum tersedia
        </p>
      </div>
    );
  }

  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/" +
    `?size=500x500&data=${encodeURIComponent(value)}`;

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-3xl border border-[#D8D0C4]/50 bg-white p-3 shadow-lg">
        <img
          src={qrUrl}
          alt="QR Code Tiket"
          className="h-52 w-52 object-contain sm:h-60 sm:w-60"
        />
      </div>

      <div className="mt-4 flex max-w-full items-center gap-2 rounded-full border border-[#D8D0C4]/40 bg-[#F7F8FA] px-4 py-2">
        <QrCode className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
        <span className="break-all font-mono text-xs font-semibold text-[#112250]">
          {value}
        </span>
      </div>
    </div>
  );
};

// ============================================================
// SEAT INFORMATION
// ============================================================

const SeatInformation = ({ ticket }) => {
  const seat = getSeatInformation(ticket);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-xl">
      <div className="border-b border-[#D8D0C4]/30 px-5 py-5 sm:px-6">
        <SectionHeading
          icon={Armchair}
          title="Informasi Tempat Duduk"
          description="Lokasi tempat duduk berdasarkan denah event"
        />
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-2xl border border-[#E5C27A]/40 bg-gradient-to-br from-[#FFFDF7] to-[#F8F4E9] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B907F]">
                Area / Section
              </p>

              <h3 className="mt-1 text-xl font-extrabold text-[#112250]">
                {seat.section}
              </h3>
            </div>

            <span className="rounded-full border border-[#E5C27A]/50 bg-white px-3 py-1.5 text-[10px] font-bold text-[#3B507D]">
              {seat.type}
            </span>
          </div>

          {seat.number ? (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white bg-white/80 p-4">
                <div className="flex items-center gap-2 text-[#9B907F]">
                  <Rows3 className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Baris
                  </span>
                </div>

                <p className="mt-2 text-2xl font-black text-[#112250]">
                  {seat.row || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-white bg-white/80 p-4">
                <div className="flex items-center gap-2 text-[#9B907F]">
                  <Armchair className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Nomor Kursi
                  </span>
                </div>

                <p className="mt-2 text-2xl font-black text-[#112250]">
                  {seat.number}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-white bg-white/80 p-4">
              <div className="flex items-center gap-2 text-[#3B507D]">
                <Users className="h-4 w-4" />
                <p className="text-xs font-bold">
                  Tidak menggunakan nomor kursi khusus
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#9B907F]">
                Tiket ini menggunakan area umum. Ikuti petunjuk
                section dan pengaturan tempat dari penyelenggara event.
              </p>
            </div>
          )}
        </div>

        {ticket?.seat_id && !ticket?.seat_number && (
          <p className="mt-3 text-xs leading-5 text-amber-700">
            ID kursi tercatat, tetapi detail baris atau nomor kursi
            belum tersedia pada data backend.
          </p>
        )}
      </div>
    </section>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();

  const ticketId = params?.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // ----------------------------------------------------------
  // FETCH DETAIL TIKET
  // ----------------------------------------------------------

  const fetchTicket = useCallback(
    async (showLoading = true) => {
      if (!ticketId) {
        setError("ID tiket tidak ditemukan.");
        setLoading(false);
        return;
      }

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

        const response = await fetch(
          `${TICKET_DETAIL_ENDPOINT}/${encodeURIComponent(ticketId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const raw = await response.text();

        let data = {};

        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error("Response backend bukan JSON yang valid.");
        }

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          throw new Error(
            data?.message || "Anda tidak memiliki akses ke tiket ini."
          );
        }

        if (response.status === 404) {
          throw new Error(
            data?.message || "Tiket tidak ditemukan atau bukan milik Anda."
          );
        }

        if (!response.ok || !data?.success || !data?.ticket) {
          throw new Error(
            data?.message || "Gagal mengambil detail tiket."
          );
        }

        setTicket(data.ticket);
      } catch (err) {
        console.error("GET DETAIL TICKET ERROR:", err);

        setError(
          err?.message ||
            "Terjadi kesalahan saat mengambil detail tiket."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [ticketId, router]
  );

  useEffect(() => {
    fetchTicket(true);
  }, [fetchTicket]);

  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  const paymentStatus = useMemo(
    () => getPaymentStatus(ticket?.payment_status),
    [ticket?.payment_status]
  );

  const checkInStatus = useMemo(
    () => getCheckInStatus(ticket?.check_in),
    [ticket?.check_in]
  );

  const PaymentIcon = paymentStatus.icon;
  const CheckInIcon = checkInStatus.icon;

  const ticketPrice = Number(ticket?.price || 0);
  const orderQuantity = Number(ticket?.order_quantity || 1);
  const subtotal = Number(ticket?.subtotal || ticketPrice * orderQuantity);

  const ticketCreatedAt = formatDateTime(ticket?.ticket_created_at);
  const orderDate = formatDateTime(ticket?.order_date);

  // ----------------------------------------------------------
  // COPY TICKET CODE
  // ----------------------------------------------------------

  const handleCopy = async () => {
    if (!ticket?.ticket_code) return;

    try {
      await navigator.clipboard.writeText(ticket.ticket_code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("GAGAL COPY TICKET CODE:", err);
      alert("Kode tiket tidak dapat disalin.");
    }
  };

  // ----------------------------------------------------------
  // DOWNLOAD QR
  // ----------------------------------------------------------

  const handleDownloadQR = async () => {
    if (!ticket?.qr_code) {
      alert("QR Code belum tersedia.");
      return;
    }

    const qrUrl =
      "https://api.qrserver.com/v1/create-qr-code/" +
      `?size=600x600&data=${encodeURIComponent(ticket.qr_code)}`;

    try {
      const response = await fetch(qrUrl);

      if (!response.ok) {
        throw new Error("QR tidak dapat diunduh.");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = `${ticket.ticket_code || "ticket"}-qr.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("DOWNLOAD QR ERROR:", err);
      window.open(qrUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ----------------------------------------------------------
  // PRINT
  // ----------------------------------------------------------

  const handlePrint = () => {
    window.print();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#3B507D]/10 border-t-[#3B507D]" />
            <Ticket className="h-6 w-6 text-[#3B507D]" />
          </div>

          <p className="mt-4 text-sm font-bold text-[#112250]">
            Memuat detail tiket...
          </p>

          <p className="mt-1 text-xs text-[#9B907F]">
            Menghubungkan ke server TicketVerse
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !ticket) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-[#D8D0C4]/40 bg-white p-6 text-center shadow-xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle className="h-8 w-8 text-rose-500" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-[#112250]">
            Detail Tiket Tidak Ditemukan
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9B907F]">
            {error ||
              "Data tiket tidak tersedia atau tidak dapat diakses."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/50 bg-white px-5 py-3 text-sm font-bold text-[#112250] transition hover:bg-[#F7F8FA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>

            <button
              type="button"
              onClick={() => fetchTicket(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>

            <Link
              href="/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/50 bg-white px-5 py-3 text-sm font-bold text-[#112250] transition hover:bg-[#F7F8FA]"
            >
              <Ticket className="h-4 w-4" />
              Tiket Saya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <div className="w-full min-w-0">
      {/* BREADCRUMB */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 rounded-xl border border-[#D8D0C4]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#112250] shadow-sm transition hover:-translate-x-0.5 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali
        </button>

        <div className="flex items-center gap-2 text-xs text-[#9B907F] sm:text-sm">
          <Link href="/tickets" className="transition hover:text-[#3B507D]">
            Tiket Saya
          </Link>

          <ChevronRight className="h-4 w-4" />

          <span className="font-semibold text-[#112250]">
            Detail Tiket
          </span>
        </div>
      </div>

      {/* EVENT HEADER */}

      <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#112250] via-[#243B68] to-[#3B507D] shadow-2xl">
        <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#E5C27A]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Ticket className="h-3.5 w-3.5" />
                  E-Ticket
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                    ticket.check_in === "Sudah"
                      ? "border-emerald-300/30 bg-emerald-400/20 text-emerald-100"
                      : "border-amber-300/30 bg-amber-400/20 text-amber-100"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {checkInStatus.label}
                </span>
              </div>

              <h1 className="max-w-4xl text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                {ticket.event_name || "Event"}
              </h1>

              <p className="mt-2 text-sm text-white/70 sm:text-base">
                {ticket.category_name || "Tiket Event"}
                <span className="mx-2 text-white/30">•</span>
                {ticket.venue_name || "Venue belum tersedia"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#E5C27A]" />
                  {formatDate(ticket.event_date)}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#E5C27A]" />
                  {formatTime(ticket.event_time)} WIB
                </span>

                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E5C27A]" />
                  {ticket.city || "Kota belum tersedia"}
                </span>
              </div>
            </div>

            <div className="w-full max-w-[230px] flex-shrink-0 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
              <EventPoster ticket={ticket} />

              <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/50">
                    TicketVerse
                  </p>
                  <p className="text-sm font-bold text-white">
                    Official E-Ticket
                  </p>
                </div>

                <ShieldCheck className="h-5 w-5 text-[#E5C27A]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATUS CARDS */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-4 shadow-lg sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <PaymentIcon className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
                Status Pembayaran
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-[#112250]">
                {paymentStatus.label}
              </p>
            </div>

            <div className="ml-auto">
              <StatusBadge status={paymentStatus}>
                <PaymentIcon className="h-3 w-3" />
              </StatusBadge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-4 shadow-lg sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <CheckInIcon className="h-5 w-5 text-[#3B507D]" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
                Status Check-in
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-[#112250]">
                {checkInStatus.label}
              </p>
            </div>

            <div className="ml-auto">
              <StatusBadge status={checkInStatus}>
                <CheckInIcon className="h-3 w-3" />
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT COLUMN */}

        <div className="min-w-0 space-y-6 xl:col-span-2">
          {/* CUSTOMER INFORMATION */}

          <section className="overflow-hidden rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-xl">
            <div className="border-b border-[#D8D0C4]/30 px-5 py-5 sm:px-6">
              <SectionHeading
                icon={User}
                title="Informasi Customer"
                description="Data pemilik tiket berdasarkan akun yang melakukan pemesanan"
              />
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-[#F7F8FA] to-white p-4">
                <CustomerAvatar customer={ticket} />

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
                    Nama Pemilik Tiket
                  </p>

                  <h3 className="mt-1 break-words text-lg font-extrabold text-[#112250]">
                    {ticket.customer_name || "Customer"}
                  </h3>

                  <p className="mt-1 text-xs text-[#9B907F]">
                    Customer ID: #{ticket.customer_id || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={User}
                  label="Nama Lengkap"
                  value={ticket.customer_name}
                />

                <InfoItem
                  icon={AtSign}
                  label="Username"
                  value={ticket.customer_username}
                />

                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={ticket.customer_email}
                  full
                />

                <InfoItem
                  icon={Phone}
                  label="Nomor Telepon"
                  value={ticket.customer_phone}
                />

                <InfoItem
                  icon={Hash}
                  label="ID Customer"
                  value={ticket.customer_id ? `#${ticket.customer_id}` : "-"}
                  mono
                />
              </div>
            </div>
          </section>

          {/* EVENT INFORMATION */}

          <section className="overflow-hidden rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-xl">
            <div className="border-b border-[#D8D0C4]/30 px-5 py-5 sm:px-6">
              <SectionHeading
                icon={Calendar}
                title="Informasi Event"
                description="Informasi acara yang terhubung dengan tiket"
              />
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#112250] to-[#3B507D] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Nama Event
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                  {ticket.event_name || "-"}
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/80">
                    {ticket.category_name || "Kategori umum"}
                  </span>

                  {ticket.artist_name && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/80">
                      <Music className="h-3 w-3" />
                      {ticket.artist_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Calendar}
                  label="Tanggal Event"
                  value={formatDate(ticket.event_date)}
                />

                <InfoItem
                  icon={Clock}
                  label="Waktu Event"
                  value={`${formatTime(ticket.event_time)} WIB`}
                />

                <InfoItem
                  icon={MapPin}
                  label="Venue"
                  value={ticket.venue_name}
                />

                <InfoItem
                  icon={Building2}
                  label="Kota"
                  value={ticket.city}
                />

                <InfoItem
                  icon={Music}
                  label="Artis"
                  value={ticket.artist_name}
                />

                <InfoItem
                  icon={Ticket}
                  label="Kategori"
                  value={ticket.category_name}
                />
              </div>
            </div>
          </section>

          {/* SEAT INFORMATION */}

          <SeatInformation ticket={ticket} />

          {/* TICKET AND ORDER INFORMATION */}

          <section className="overflow-hidden rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-xl">
            <div className="border-b border-[#D8D0C4]/30 px-5 py-5 sm:px-6">
              <SectionHeading
                icon={Hash}
                title="Informasi Tiket dan Pesanan"
                description="Rincian transaksi dan identitas e-ticket"
              />
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Hash}
                  label="Kode Pesanan"
                  value={ticket.order_code}
                  mono
                />

                <InfoItem
                  icon={Hash}
                  label="ID Tiket"
                  value={ticket.id ? `#${ticket.id}` : "-"}
                  mono
                />

                <InfoItem
                  icon={Hash}
                  label="ID Order Detail"
                  value={ticket.order_detail_id}
                  mono
                />

                <InfoItem
                  icon={Ticket}
                  label="ID Kategori"
                  value={ticket.ticket_category_id}
                  mono
                />

                <InfoItem
                  icon={Users}
                  label="Jumlah dalam Pesanan"
                  value={`${orderQuantity} tiket`}
                />

                <InfoItem
                  icon={CreditCard}
                  label="Harga per Tiket"
                  value={formatRupiah(ticketPrice)}
                />

                <InfoItem
                  icon={Calendar}
                  label="Tanggal Pemesanan"
                  value={orderDate}
                  full
                />

                <InfoItem
                  icon={Calendar}
                  label="Tiket Diterbitkan"
                  value={ticketCreatedAt}
                  full
                />
              </div>

              <div className="mt-5 rounded-2xl border border-[#E5C27A]/40 bg-[#E5C27A]/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
                      Kode Tiket
                    </p>

                    <p className="mt-1 break-all font-mono text-base font-extrabold tracking-wide text-[#112250] sm:text-lg">
                      {ticket.ticket_code || "-"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!ticket.ticket_code}
                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#112250] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Salin Kode
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#D8D0C4]/40 bg-[#F7F8FA] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#9B907F]">
                    Subtotal kategori pada pesanan
                  </span>

                  <span className="text-sm font-bold text-[#112250]">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#D8D0C4]/40 pt-3">
                  <span className="text-xs font-bold text-[#112250]">
                    Total pesanan
                  </span>

                  <span className="text-lg font-black text-[#112250]">
                    {formatRupiah(ticket.order_total)}
                  </span>
                </div>

                <p className="mt-2 text-[10px] leading-5 text-[#9B907F]">
                  Total pesanan merupakan nilai keseluruhan order dan
                  dapat mencakup biaya layanan atau kategori tiket lain.
                </p>
              </div>
            </div>
          </section>

          {/* IMPORTANT INFORMATION */}

          <section className="rounded-3xl border border-[#D8D0C4]/30 bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <ShieldCheck className="h-5 w-5 text-[#3B507D]" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#112250] sm:text-base">
                  Informasi Penting
                </h3>

                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                  <li>
                    Tunjukkan QR Code tiket kepada petugas saat memasuki
                    area event.
                  </li>
                  <li>
                    Pastikan nama event, kategori, dan posisi kursi
                    sesuai dengan tiket.
                  </li>
                  <li>
                    Satu tiket hanya dapat digunakan untuk satu kali
                    proses check-in.
                  </li>
                  <li>
                    Jangan membagikan QR Code kepada orang lain.
                  </li>
                  <li>
                    Simpan kode tiket sampai proses check-in selesai.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: QR AND SUMMARY */}

        <div className="min-w-0 xl:col-span-1">
          <div className="space-y-5 xl:sticky xl:top-24">
            {/* QR CARD */}

            <section className="overflow-hidden rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-2xl">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#112250] to-[#3B507D] px-5 py-6 text-center">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-[#E5C27A]/10 blur-2xl" />

                <div className="relative z-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-white">
                    QR Code Tiket
                  </h2>

                  <p className="mt-1 text-xs text-white/60">
                    Tunjukkan QR ini saat check-in
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <QRCodeBox value={ticket.qr_code} />

                <div
                  className={`mt-5 flex items-center gap-3 rounded-2xl border p-4 ${checkInStatus.className}`}
                >
                  <CheckInIcon className="h-5 w-5 flex-shrink-0" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold">
                      {checkInStatus.label}
                    </p>

                    <p className="mt-0.5 text-[10px] opacity-70">
                      Status tiket dari server
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    disabled={!ticket.qr_code}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Download QR
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/50 bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#112250] transition hover:bg-white hover:shadow-md"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Tiket
                  </button>
                </div>

                <div className="mt-5 border-t border-dashed border-[#D8D0C4]/50 pt-5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B907F]">
                    Ticket Code
                  </p>

                  <p className="mt-1 break-all font-mono text-xs font-bold text-[#112250]">
                    {ticket.ticket_code || "-"}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#D8D0C4]/30 bg-[#F7F8FA] px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#9B907F]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Tiket resmi TicketVerse
                </div>
              </div>
            </section>

            {/* CUSTOMER SUMMARY */}

            <section className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#112250]/10">
                  <User className="h-5 w-5 text-[#112250]" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B907F]">
                    Pemilik Tiket
                  </p>

                  <p className="truncate text-sm font-bold text-[#112250]">
                    {ticket.customer_name || "Customer"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-[#D8D0C4]/40 pt-4">
                <div className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-[#9B907F]">Kategori</span>
                  <span className="text-right font-bold text-[#112250]">
                    {ticket.category_name || "-"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-[#9B907F]">Section</span>
                  <span className="text-right font-bold text-[#112250]">
                    {ticket.section_name || "Area umum"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-[#9B907F]">Harga tiket</span>
                  <span className="text-right font-bold text-[#112250]">
                    {formatRupiah(ticketPrice)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-[#9B907F]">Pembayaran</span>
                  <span className="text-right font-bold text-[#112250]">
                    {ticket.payment_status || "-"}
                  </span>
                </div>
              </div>
            </section>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => fetchTicket(false)}
              disabled={refreshing}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/40 bg-white px-4 py-3 text-xs font-bold text-[#112250] shadow-sm transition hover:bg-[#F7F8FA] disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Memperbarui..." : "Perbarui Informasi Tiket"}
            </button>

            <Link
              href="/tickets"
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#D8D0C4]/40 bg-white px-4 py-3 text-sm font-semibold text-[#112250] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Ticket className="h-4 w-4 text-[#3B507D]" />
              Lihat Semua Tiket
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* PRINT STYLE */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          nav,
          header,
          aside,
          footer {
            display: none !important;
          }

          button,
          a {
            display: none !important;
          }

          .xl\\:sticky {
            position: static !important;
          }

          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  Tag,
  Pencil,
  Trash2,
  Loader2,
  Ticket,
  Users,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Armchair,
  RefreshCw,
  LayoutGrid,
  ChevronRight,
  BarChart3,
  Building2,
  Layers3,
  Sparkles,
  TrendingUp,
  Music2,
  ShieldCheck,
  ShieldAlert,
  Hourglass,
  Zap,
  CircleDot,
  Info,
} from "lucide-react";

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_ROOT.endsWith("/api")
  ? API_ROOT
  : `${API_ROOT}/api`;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Permintaan gagal (${response.status})`);
  }
  return data;
}

function getPosterUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ROOT}/${path.replace(/^\/+/, "")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value) {
  return value ? String(value).substring(0, 5) : "-";
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function getStatusConfig(status) {
  const configs = {
    "Coming Soon": {
      label: "Coming Soon",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: Timer,
      dot: "bg-slate-400",
    },
    Available: {
      label: "Available",
      className: "bg-sky-50 text-sky-700 border-sky-200",
      icon: CheckCircle2,
      dot: "bg-sky-500",
    },
    Limited: {
      label: "Limited",
      className: "bg-sky-50 text-sky-700 border-sky-200",
      icon: AlertCircle,
      dot: "bg-sky-500",
    },
    "Sold Out": {
      label: "Sold Out",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: XCircle,
      dot: "bg-slate-500",
    },
    Cancelled: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-500 border-slate-200",
      icon: XCircle,
      dot: "bg-slate-400",
    },
  };
  return (
    configs[status] || {
      label: status || "-",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: AlertCircle,
      dot: "bg-slate-400",
    }
  );
}

function getApprovalConfig(status) {
  const configs = {
    Draft: {
      label: "Draft",
      className: "bg-slate-50 text-slate-600 border-slate-200",
      icon: Pencil,
    },
    Pending: {
      label: "Menunggu Persetujuan",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Hourglass,
    },
    Approved: {
      label: "Disetujui",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldCheck,
    },
    Rejected: {
      label: "Ditolak",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: ShieldAlert,
    },
  };
  return (
    configs[status] || {
      label: status || "Draft",
      className: "bg-slate-50 text-slate-600 border-slate-200",
      icon: AlertCircle,
    }
  );
}

export default function DetailEventOrganizerPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [seatError, setSeatError] = useState("");

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    const organizerData = await apiRequest("/organizer/events");

    const myEvents = Array.isArray(organizerData.data)
      ? organizerData.data
      : [];

    const ownedEvent = myEvents.find(
      (item) => Number(item.id) === Number(eventId)
    );

    if (!ownedEvent) {
      throw new Error(
        "Event tidak ditemukan atau bukan milik akun organizer ini."
      );
    }

    const data = await apiRequest(`/events/${eventId}`);

    if (!data.event) {
      throw new Error("Detail event tidak ditemukan.");
    }

    if (
      Number(data.event.organizer_id) !==
      Number(ownedEvent.organizer_id)
    ) {
      throw new Error("Akses ke event ini tidak diizinkan.");
    }

    setEvent(data.event);
  }, [eventId]);

  const fetchTickets = useCallback(async () => {
    if (!eventId) return;
    try {
      setTicketError("");
      const data = await apiRequest(`/ticket-categories/event/${eventId}`);
      setTickets(
        Array.isArray(data.ticket_categories) ? data.ticket_categories : []
      );
    } catch (err) {
      setTicketError(err.message);
      setTickets([]);
    }
  }, [eventId]);

  const fetchSeats = useCallback(async () => {
    if (!eventId) return;
    try {
      setSeatError("");
      const data = await apiRequest(`/seats/events/${eventId}`);
      setSections(Array.isArray(data.sections) ? data.sections : []);
    } catch (err) {
      setSeatError(err.message);
      setSections([]);
    }
  }, [eventId]);

  const fetchAll = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      setError("");
      try {
        await fetchEvent();
        await Promise.all([fetchTickets(), fetchSeats()]);
      } catch (err) {
        setError(err.message || "Gagal mengambil detail event.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchEvent, fetchTickets, fetchSeats]
  );

  useEffect(() => {
    if (eventId) fetchAll(true);
  }, [eventId, fetchAll]);

  const ticketStats = useMemo(() => {
    const quota = tickets.reduce(
      (sum, item) => sum + Number(item.quota || 0),
      0
    );
    const remaining = tickets.reduce(
      (sum, item) => sum + Number(item.remaining_ticket || 0),
      0
    );
    const sold = Math.max(0, quota - remaining);
    const estimatedValue = tickets.reduce((sum, item) => {
      const itemSold = Math.max(
        0,
        Number(item.quota || 0) - Number(item.remaining_ticket || 0)
      );
      return sum + itemSold * Number(item.price || 0);
    }, 0);
    return {
      quota,
      remaining,
      sold,
      estimatedValue,
      percentage:
        quota > 0 ? Math.round((sold / quota) * 100) : 0,
    };
  }, [tickets]);

  const seatStats = useMemo(() => {
    const allSeats = sections.flatMap((section) => section.seats || []);
    return {
      sections: sections.length,
      total: allSeats.length,
      available: allSeats.filter((seat) => seat.status === "Available").length,
      reserved: allSeats.filter((seat) => seat.status === "Reserved").length,
      sold: allSeats.filter(
        (seat) => seat.status === "Sold" || seat.status === "Booked"
      ).length,
    };
  }, [sections]);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus event "${event.event_name}"?\n\nData yang masih terhubung dengan transaksi dapat menyebabkan penghapusan ditolak backend.`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const data = await apiRequest(`/events/${eventId}`, {
        method: "DELETE",
      });
      alert(data.message || "Event berhasil dihapus.");
      router.push("/organizer/event");
      router.refresh();
    } catch (err) {
      alert(err.message || "Gagal menghapus event.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-sky-500/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg">
              <Loader2 className="h-7 w-7 animate-spin text-[#0B1220]" />
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-700">
            Memuat detail event...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Menyiapkan data tiket dan denah kursi
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-5">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-xl">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="relative mt-5 text-xl font-bold text-slate-900">
              Detail Event Tidak Tersedia
            </h2>
            <p className="relative mt-2 text-sm leading-6 text-slate-500">
              {error || "Data event tidak ditemukan."}
            </p>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-5">
            <button
              onClick={() => router.push("/organizer/event")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1B2942]"
            >
              <ArrowLeft size={17} />
              Kembali ke Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;
  const approvalStatus = event.approval_status || "Draft";
  const approvalConfig = getApprovalConfig(approvalStatus);
  const ApprovalIcon = approvalConfig.icon;
  const posterUrl = getPosterUrl(event.poster);

  return (
    <div className="w-full min-w-0 space-y-6">

      {/* ================= HERO HEADER ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-[#2F3F63]/40 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] shadow-[0_8px_32px_rgba(11,18,32,0.18)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative p-6 sm:p-8">
          <Link
            href="/organizer/event"
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[12px] font-semibold text-white/80 backdrop-blur transition hover:bg-white/[0.14] hover:text-white"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Event
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                {event.event_name}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} className="text-sky-300" />
                  {formatDate(event.event_date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={13} className="text-sky-300" />
                  {formatTime(event.event_time)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} className="text-sky-300" />
                  {event.venue_name}, {event.city}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fetchAll(false)}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.14] disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => router.push(`/organizer/event/edit/${event.id}`)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.14]"
              >
                <Pencil size={15} />
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/90 px-3.5 text-[13px] font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${statusConfig.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${approvalConfig.className}`}
            >
              <ApprovalIcon size={12} />
              {approvalConfig.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
              <Tag size={12} />
              {event.category_name || "Tanpa Kategori"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
              <Music2 size={12} />
              {event.artist_name || "Artis belum diisi"}
            </span>
          </div>
        </div>
      </section>

      {/* ================= HERO CARD: POSTER + INFO ================= */}
      <section className="overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-[#0B1220] to-[#2F3F63] lg:min-h-[460px]">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={event.event_name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
                  <Ticket size={30} />
                </div>
                <p className="mt-4 text-sm font-medium">
                  Poster belum tersedia
                </p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${statusConfig.className}`}
              >
                <StatusIcon size={12} />
                {statusConfig.label}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Event ID
              </p>
              <p className="mt-0.5 text-[15px] font-bold text-white">
                #{event.id}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center border-l border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              <CircleDot size={12} className="text-sky-500" />
              Informasi Event
            </div>

            <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#0B1220] sm:text-[26px]">
              {event.event_name}
            </h2>

            {event.description && (
              <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-slate-500">
                {event.description}
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={CalendarDays}
                label="Tanggal Event"
                value={formatDate(event.event_date)}
              />
              <InfoItem
                icon={Clock3}
                label="Waktu"
                value={formatTime(event.event_time)}
              />
              <InfoItem
                icon={MapPin}
                label="Lokasi"
                value={event.venue_name}
                subValue={event.city}
              />
              <InfoItem
                icon={UserRound}
                label="Artis"
                value={event.artist_name}
              />
              <InfoItem
                icon={Tag}
                label="Kategori"
                value={event.category_name}
              />
              <InfoItem
                icon={Ticket}
                label="Kategori Tiket"
                value={`${tickets.length} kategori`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
                <BarChart3 size={13} />
              </span>
              Ringkasan Event
            </h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Statistik berdasarkan kategori tiket dan denah event.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Ticket}
            label="Total Kategori"
            value={tickets.length}
            description="Kategori tiket event"
          />
          <StatCard
            icon={Users}
            label="Tiket Terjual"
            value={formatNumber(ticketStats.sold)}
            description={`${ticketStats.percentage}% dari kuota`}
          />
          <StatCard
            icon={Wallet}
            label="Sisa Tiket"
            value={formatNumber(ticketStats.remaining)}
            description={`Dari ${formatNumber(ticketStats.quota)} kuota`}
          />
          <StatCard
            icon={Armchair}
            label="Total Kursi"
            value={formatNumber(seatStats.total)}
            description={`${seatStats.sections} section denah`}
          />
        </div>
      </section>

      {/* ================= TICKET CARD STYLE LIST ================= */}
      <section className="rounded-2xl border border-sky-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 border-b border-sky-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Ticket size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                Kategori Tiket
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Informasi harga, kuota, dan ketersediaan tiket.
              </p>
            </div>
          </div>
          <Link
            href={`/organizer/event/${event.id}/tiket`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#1B2942]"
          >
            <Pencil size={14} />
            Kelola Tiket
            <ChevronRight size={14} />
          </Link>
        </div>

        {ticketError ? (
          <ErrorPanel message={ticketError} onRetry={fetchTickets} />
        ) : tickets.length === 0 ? (
          <EmptyPanel
            icon={Ticket}
            title="Belum Ada Kategori Tiket"
            description="Tambahkan kategori tiket untuk mulai mengatur harga dan kuota event."
          />
        ) : (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tickets.map((ticket) => (
                <TicketStubCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                    <TrendingUp size={14} className="text-sky-600" />
                    Progres Penjualan Tiket
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">
                    {formatNumber(ticketStats.sold)} dari{" "}
                    {formatNumber(ticketStats.quota)} tiket terjual.
                  </p>
                </div>
                <span className="text-[20px] font-bold tracking-[-0.02em] text-[#0B1220]">
                  {ticketStats.percentage}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B1220] to-[#2F3F63] transition-all duration-700"
                  style={{ width: `${ticketStats.percentage}%` }}
                />
              </div>
            </div>
          </>
        )}
      </section>

      {/* ================= SEAT MANAGEMENT ================= */}
      <section className="rounded-2xl border border-sky-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 border-b border-sky-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                Denah Kursi Event
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Ringkasan section dan konfigurasi kursi.
              </p>
            </div>
          </div>
          <Link
            href={`/organizer/event/${event.id}/denah-kursi`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3.5 text-[12.5px] font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            <Armchair size={14} />
            Kelola Denah
            <ChevronRight size={14} />
          </Link>
        </div>

        {seatError ? (
          <ErrorPanel message={seatError} onRetry={fetchSeats} />
        ) : sections.length === 0 ? (
          <EmptyPanel
            icon={Armchair}
            title="Denah Kursi Belum Dibuat"
            description="Buat section dan tambahkan konfigurasi kursi untuk event ini."
          />
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Total Section" value={seatStats.sections} />
              <MiniStat label="Total Kursi" value={seatStats.total} />
              <MiniStat label="Tersedia" value={seatStats.available} />
              <MiniStat
                label="Terjual / Reserved"
                value={seatStats.reserved + seatStats.sold}
              />
            </div>

            <div className="mt-5 space-y-3">
              {sections.map((section) => {
                const seats = section.seats || [];
                const available = seats.filter(
                  (seat) => seat.status === "Available"
                ).length;
                const reserved = seats.filter(
                  (seat) => seat.status === "Reserved"
                ).length;
                const sold = seats.filter(
                  (seat) =>
                    seat.status === "Sold" || seat.status === "Booked"
                ).length;

                return (
                  <div
                    key={section.id}
                    className="group rounded-xl border border-sky-100 p-4 transition hover:border-sky-300 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                          <Layers3 size={16} />
                        </div>
                        <div>
                          <h3 className="text-[13.5px] font-semibold text-slate-800">
                            {section.section_name}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {section.section_code} · {section.seat_mode}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Kategori: {section.category_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[13.5px] font-bold text-[#0B1220]">
                          {formatRupiah(section.price)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {seats.length} kursi
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <SeatCount
                        label="Tersedia"
                        value={available}
                        tone="available"
                      />
                      <SeatCount
                        label="Reserved"
                        value={reserved}
                        tone="reserved"
                      />
                      <SeatCount
                        label="Terjual"
                        value={sold}
                        tone="sold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ================= SALE PERIOD + VENUE ================= */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-sky-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="text-[14.5px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                Periode Penjualan
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Jadwal penjualan tiket event.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            <SaleDate
              label="Mulai Penjualan"
              value={event.ticket_sale_start}
            />
            <SaleDate
              label="Akhir Penjualan"
              value={event.ticket_sale_end}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-[14.5px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                Informasi Venue
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Tempat penyelenggaraan event.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white p-5">
            <h3 className="text-[16px] font-semibold text-slate-900">
              {event.venue_name || "-"}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-[12.5px] text-slate-500">
              <MapPin size={14} className="text-sky-600" />
              {event.city || "Lokasi tidak tersedia"}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Info size={11} />
              Data venue diambil dari informasi event backend.
            </p>
          </div>
        </div>
      </section>

      {/* ================= ESTIMATED SALES ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-sky-50/60 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B1220] shadow-sm ring-1 ring-sky-100">
              <Zap size={18} className="text-sky-600" />
            </div>
            <div>
              <h3 className="text-[13.5px] font-semibold text-[#0B1220]">
                Estimasi Nilai Tiket Terjual
              </h3>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                Dihitung dari harga kategori tiket dikalikan jumlah tiket
                yang terjual. Bukan laporan pendapatan aktual.
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Estimasi
            </p>
            <p className="mt-0.5 text-[24px] font-bold tracking-[-0.02em] text-[#0B1220]">
              {formatRupiah(ticketStats.estimatedValue)}
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER BACK ================= */}
      <div className="flex justify-start pb-3">
        <Link
          href="/organizer/event"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Kembali ke Daftar Event
        </Link>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, subValue }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-sky-100 bg-sky-50/50 p-3 transition hover:border-sky-200">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm ring-1 ring-sky-100">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[12.5px] font-semibold text-slate-800">
          {value || "-"}
        </p>
        {subValue && (
          <p className="mt-0.5 text-[11px] text-slate-500">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-sky-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_8px_24px_rgba(14,165,233,0.10)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-300/30 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.02em] text-[#0B1220]">
            {value}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-500">
            {description}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100 transition group-hover:scale-110">
          <Icon size={18} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[2.5px] w-full bg-gradient-to-r from-[#0B1220] to-sky-500 opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 transition hover:border-sky-200 hover:shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-[18px] font-bold tracking-[-0.01em] text-[#0B1220]">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function SeatCount({ label, value, tone = "available" }) {
  const tones = {
    available: "border-sky-100 bg-sky-50/60 text-sky-700",
    reserved: "border-slate-200 bg-slate-50 text-slate-700",
    sold: "border-slate-200 bg-slate-100 text-slate-700",
  };
  const cls = tones[tone] || tones.available;

  return (
    <div className={`rounded-lg border p-2.5 ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] opacity-80">
        {label}
      </p>
      <p className="mt-0.5 text-[15px] font-bold">{formatNumber(value)}</p>
    </div>
  );
}

function SaleDate({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-sky-100 bg-sky-50/50 p-3.5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-[12.5px] font-bold text-slate-800">
          {formatDateTime(value)}
        </p>
      </div>
      <CalendarDays className="h-4 w-4 shrink-0 text-sky-600" />
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, description }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-sky-200 bg-sky-50/40 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm ring-1 ring-sky-100">
        <Icon size={22} />
      </div>
      <h3 className="mt-3 text-[13px] font-semibold text-slate-700">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
        <div>
          <p className="text-[13px] font-semibold text-rose-800">
            Gagal memuat data
          </p>
          <p className="mt-0.5 text-[12px] text-rose-600">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2.5 rounded-lg bg-rose-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketStubCard({ ticket }) {
  const quota = Number(ticket.quota || 0);
  const remaining = Number(ticket.remaining_ticket || 0);
  const sold = Math.max(0, quota - remaining);
  const percentage = quota > 0 ? Math.round((sold / quota) * 100) : 0;

  const statusLabel =
    remaining <= 0 ? "Sold Out" : percentage >= 80 ? "Hampir Habis" : "Tersedia";
  const statusStyle =
    remaining <= 0
      ? "bg-slate-100 text-slate-600 border-slate-200"
      : percentage >= 80
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : "bg-sky-50 text-sky-700 border-sky-200";

  return (
    <div className="group relative">
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-sky-400/0 via-sky-400/0 to-sky-400/0 opacity-0 blur-md transition duration-500 group-hover:from-sky-400/15 group-hover:via-sky-400/15 group-hover:to-sky-400/15 group-hover:opacity-100" />

      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-sky-300 group-hover:shadow-[0_12px_32px_rgba(14,165,233,0.12)]">

        <div className="relative bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Kategori Tiket
              </p>
              <p className="mt-0.5 truncate text-[14px] font-semibold text-white">
                {ticket.category_name}
              </p>
              <p className="mt-0.5 text-[10.5px] text-white/50">
                ID #{ticket.id}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-white/80">
              <Ticket size={14} />
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/50">
                Harga
              </p>
              <p className="mt-0.5 text-[17px] font-bold text-white">
                {formatRupiah(ticket.price)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusStyle}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="relative h-0">
          <div className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-sky-100 bg-[#F7F8FB] shadow-inner" />
          <div className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-sky-100 bg-[#F7F8FB] shadow-inner" />
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-sky-100" />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="grid grid-cols-3 gap-2">
            <StubStat label="Kuota" value={quota} />
            <StubStat label="Terjual" value={sold} tone="sold" />
            <StubStat label="Sisa" value={remaining} tone="remaining" />
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="font-medium text-slate-500">Progres</span>
              <span className="font-semibold text-slate-700">
                {percentage}%
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0B1220] to-[#2F3F63] transition-all duration-700"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-sky-100 pt-2.5 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={9} />
              TicketVerse
            </span>
            <span>#{String(ticket.id).padStart(5, "0")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StubStat({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-sky-50/60 text-slate-800 border-sky-100",
    sold: "bg-sky-50 text-sky-700 border-sky-100",
    remaining: "bg-slate-50 text-slate-700 border-slate-100",
  };
  const cls = tones[tone] || tones.slate;

  return (
    <div className={`rounded-md border px-2 py-1.5 ${cls}`}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.06em] opacity-70">
        {label}
      </p>
      <p className="mt-0.5 text-[12.5px] font-bold">{formatNumber(value)}</p>
    </div>
  );
}
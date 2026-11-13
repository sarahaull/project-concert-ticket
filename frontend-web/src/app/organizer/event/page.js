"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Plus,
  Search,
  CalendarDays,
  MapPin,
  Clock3,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Ticket,
  Music2,
  ChevronRight,
  AlertCircle,
  XCircle,
  Loader2,
  SlidersHorizontal,
  X,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Send,
  Hourglass,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const RAW_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL
  : `${RAW_API_URL}/api`;

const API_ORIGIN = RAW_API_URL.replace(/\/api$/i, "");

const API_ENDPOINTS = {
  organizerEvents: "/events/organizer/my-events",
  organizerStats: "/organizer/stats",
  ticketCategories: "/ticket-categories",
  deleteEvent: (id) => `/events/${id}`,
  submitEvent: (id) => `/events/${id}/submit`,
};

const STATUS_OPTIONS = [
  "All",
  "Coming Soon",
  "Available",
  "Limited",
  "Sold Out",
];

const APPROVAL_OPTIONS = ["All", "Draft", "Pending", "Approved", "Rejected"];

const STATUS_CONFIG = {
  "Coming Soon": {
    label: "Coming Soon",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
  Available: {
    label: "Available",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  Limited: {
    label: "Limited",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  "Sold Out": {
    label: "Sold Out",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

const APPROVAL_CONFIG = {
  Draft: {
    label: "Draft",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: Pencil,
  },
  Pending: {
    label: "Menunggu Persetujuan",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Hourglass,
  },
  Approved: {
    label: "Disetujui",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: ShieldCheck,
  },
  Rejected: {
    label: "Ditolak",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: ShieldAlert,
  },
};

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

async function parseResponse(response) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Response backend tidak valid. HTTP ${response.status}.`);
  }
  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || data.error || `Permintaan gagal. HTTP ${response.status}.`
    );
  }
  return data;
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData
      ? {}
      : options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  return parseResponse(response);
}

function getArray(data, key) {
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data?.[key])) return data.data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatDateShort(value) {
  if (!value) return "-";
  const parts = String(value).slice(0, 10).split("-");
  if (parts.length !== 3) return "-";
  const [year, month, day] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function formatRupiah(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatNumber(value) {
  const number = Number(value);
  return new Intl.NumberFormat("id-ID").format(
    Number.isFinite(number) ? number : 0
  );
}

function getPosterUrl(poster) {
  if (!poster) return "";
  const value = String(poster).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}/${value.replace(/^\/+/, "")}`;
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className: "border-slate-200 bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
    }
  );
}

function getApprovalConfig(status) {
  return (
    APPROVAL_CONFIG[status] || {
      label: status || "Belum diketahui",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      icon: AlertCircle,
    }
  );
}

function getTicketSummary(eventId, ticketCategories) {
  const tickets = ticketCategories.filter(
    (item) => Number(item.event_id) === Number(eventId)
  );
  const totalQuota = tickets.reduce(
    (sum, item) => sum + (Number(item.quota) || 0),
    0
  );
  const remaining = tickets.reduce(
    (sum, item) => sum + (Number(item.remaining_ticket) || 0),
    0
  );
  const prices = tickets
    .map((item) => Number(item.price))
    .filter(Number.isFinite);
  return {
    count: tickets.length,
    totalQuota,
    remaining,
    sold: Math.max(totalQuota - remaining, 0),
    startingPrice: prices.length ? Math.min(...prices) : null,
  };
}

export default function OrganizerEventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [organizerStats, setOrganizerStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [ticketWarning, setTicketWarning] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [approvalFilter, setApprovalFilter] = useState("All");

  const [deleteModal, setDeleteModal] = useState(null);
  const [submitModal, setSubmitModal] = useState(null);

  const fetchEvents = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      setTicketWarning("");

      const token = getToken();
      if (!token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const [eventsResult, ticketsResult, statsResult] =
        await Promise.allSettled([
          apiRequest(API_ENDPOINTS.organizerEvents),
          apiRequest(API_ENDPOINTS.ticketCategories),
          apiRequest(API_ENDPOINTS.organizerStats),
        ]);

      if (eventsResult.status === "rejected") {
        throw eventsResult.reason;
      }

      const eventsData = eventsResult.value;
      const eventList = getArray(eventsData, "events");
      setEvents(eventList);

      if (ticketsResult.status === "fulfilled") {
        setTicketCategories(getArray(ticketsResult.value, "ticket_categories"));
      } else {
        console.error("LOAD TICKET CATEGORIES ERROR:", ticketsResult.reason);
        setTicketCategories([]);
        setTicketWarning(
          "Kategori tiket belum dapat dimuat. Informasi kuota tiket sementara tidak tersedia."
        );
      }

      if (statsResult.status === "fulfilled") {
        setOrganizerStats(statsResult.value.stats || null);
      } else {
        console.error("LOAD ORGANIZER STATS ERROR:", statsResult.reason);
        setOrganizerStats(null);
      }
    } catch (err) {
      console.error("FETCH ORGANIZER EVENTS ERROR:", err);
      setError(err.message || "Gagal mengambil data event.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const enrichedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      ticketSummary: getTicketSummary(event.id, ticketCategories),
    }));
  }, [events, ticketCategories]);

  const filteredEvents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return enrichedEvents.filter((event) => {
      const searchableText = [
        event.event_name,
        event.artist_name,
        event.category_name,
        event.venue_name,
        event.city,
        event.approval_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || searchableText.includes(keyword);
      const matchesStatus =
        statusFilter === "All" || event.status === statusFilter;
      const matchesApproval =
        approvalFilter === "All" ||
        (event.approval_status || "Draft") === approvalFilter;

      return matchesSearch && matchesStatus && matchesApproval;
    });
  }, [enrichedEvents, search, statusFilter, approvalFilter]);

  const stats = useMemo(() => {
    const totalQuota = enrichedEvents.reduce(
      (sum, event) => sum + event.ticketSummary.totalQuota,
      0
    );
    const remainingTickets = enrichedEvents.reduce(
      (sum, event) => sum + event.ticketSummary.remaining,
      0
    );

    const localStats = {
      total: events.length,
      available: events.filter((event) => event.status === "Available").length,
      comingSoon: events.filter((event) => event.status === "Coming Soon")
        .length,
      limited: events.filter((event) => event.status === "Limited").length,
      soldOut: events.filter((event) => event.status === "Sold Out").length,
      totalQuota,
      remainingTickets,
      pending: events.filter((event) => event.approval_status === "Pending")
        .length,
      approved: events.filter((event) => event.approval_status === "Approved")
        .length,
      rejected: events.filter((event) => event.approval_status === "Rejected")
        .length,
    };

    return {
      ...localStats,
      total: Number(organizerStats?.totalEvents ?? localStats.total),
    };
  }, [events, enrichedEvents, organizerStats]);

  const handleSubmitApproval = async () => {
    const selectedEvent = submitModal;
    if (!selectedEvent?.id || submittingId) return;

    const approvalStatus = selectedEvent.approval_status || "Draft";
    if (!["Draft", "Rejected"].includes(approvalStatus)) {
      setSubmitError("Event ini tidak dapat diajukan pada status sekarang.");
      return;
    }

    try {
      setSubmittingId(selectedEvent.id);
      setSubmitError("");

      const summary = getTicketSummary(selectedEvent.id, ticketCategories);

      if (summary.count < 1) {
        throw new Error(
          "Event belum memiliki kategori tiket. Tambahkan minimal satu kategori tiket sebelum mengajukan persetujuan."
        );
      }

      const result = await apiRequest(
        API_ENDPOINTS.submitEvent(selectedEvent.id),
        { method: "POST" }
      );

      if (result.success === false) {
        throw new Error(result.message || "Pengajuan event gagal.");
      }

      setSubmitModal(null);
      setSubmitError("");
      await fetchEvents(true);

      window.alert(
        result.message ||
          "Event berhasil diajukan dan sedang menunggu persetujuan Super Admin."
      );
    } catch (err) {
      console.error("SUBMIT EVENT ERROR:", err);
      setSubmitError(err.message || "Gagal mengajukan persetujuan event.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal?.id || deleting) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const result = await apiRequest(
        API_ENDPOINTS.deleteEvent(deleteModal.id),
        { method: "DELETE" }
      );

      if (result.success === false) {
        throw new Error(result.message || "Event gagal dihapus.");
      }

      setEvents((previous) =>
        previous.filter((event) => Number(event.id) !== Number(deleteModal.id))
      );

      setTicketCategories((previous) =>
        previous.filter((item) => Number(item.event_id) !== Number(deleteModal.id))
      );

      setDeleteModal(null);
      await fetchEvents(true);
    } catch (err) {
      console.error("DELETE EVENT ERROR:", err);
      setDeleteError(err.message || "Gagal menghapus event.");
    } finally {
      setDeleting(false);
    }
  };

  const goToEdit = (id) => router.push(`/organizer/event/edit/${id}`);
  const goToDetail = (id) => router.push(`/organizer/event/${id}`);
  const goToTickets = (id) => router.push(`/organizer/event/${id}/tiket`);

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0) +
    (approvalFilter !== "All" ? 1 : 0);

  return (
    <div className="w-full min-w-0 text-[#0B1220]">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            <span>Organizer</span>
            <ChevronRight size={12} className="text-white/30" />
            <span className="text-white/90">Kelola Event</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
                <Sparkles size={12} className="text-sky-300" />
                Event Management Suite
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                Kelola Event Anda
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Pantau performa event, kelola tiket, dan ajukan persetujuan
                penerbitan event kepada Super Admin dalam satu dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchEvents(true)}
                disabled={refreshing || loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.14] disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                href="/organizer/event/tambah"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0B1220] shadow-lg shadow-black/10 transition hover:bg-slate-100"
              >
                <Plus size={16} />
                Buat Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {ticketWarning && !loading && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[12.5px] leading-5 text-amber-800">
            {ticketWarning}
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-[13px] font-semibold text-red-800">
                Gagal memuat data
              </p>
              <p className="mt-0.5 text-[12.5px] text-red-600">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchEvents()}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Event"
          value={stats.total}
          hint="Event yang Anda kelola"
          icon={CalendarDays}
          accent="slate"
        />
        <StatCard
          label="Event Aktif"
          value={stats.available}
          hint="Sedang tersedia untuk publik"
          icon={Zap}
          accent="sky"
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={stats.pending}
          hint="Dalam review Super Admin"
          icon={Hourglass}
          accent="amber"
        />
        <StatCard
          label="Tiket Tersedia"
          value={stats.remainingTickets}
          hint={`Dari ${formatNumber(stats.totalQuota)} total kuota`}
          icon={Ticket}
          accent="emerald"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <MiniStat
          label="Event Disetujui"
          value={stats.approved}
          icon={ShieldCheck}
          tone="emerald"
        />
        <MiniStat
          label="Event Ditolak"
          value={stats.rejected}
          icon={XCircle}
          tone="rose"
        />
        <MiniStat
          label="Event Sold Out"
          value={stats.soldOut}
          icon={TrendingUp}
          tone="violet"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                <LayersIcon />
                Daftar Event
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {loading
                  ? "Memuat data event..."
                  : `${formatNumber(filteredEvents.length)} dari ${formatNumber(
                      events.length
                    )} event ditampilkan`}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:flex-wrap">
              <div className="relative w-full sm:w-[280px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari event, artis, venue..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative">
                <SlidersHorizontal
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 w-full min-w-[150px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#0B1220]/40"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "Semua Status" : status}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="h-9 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#0B1220]/40"
              >
                {APPROVAL_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "All"
                      ? "Semua Persetujuan"
                      : status === "Pending"
                      ? "Menunggu"
                      : status === "Approved"
                      ? "Disetujui"
                      : status === "Rejected"
                      ? "Ditolak"
                      : "Draft"}
                  </option>
                ))}
              </select>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setApprovalFilter("All");
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-xl bg-[#0B1220]/10" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220]/[0.06]">
                <Loader2 size={22} className="animate-spin text-[#0B1220]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-semibold text-slate-800">
                Memuat data event...
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                Mengambil data event dan kategori tiket
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0B1220]/[0.04] text-[#0B1220]">
              {events.length === 0 ? (
                <Sparkles size={22} />
              ) : (
                <Search size={22} />
              )}
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-slate-900">
              {events.length === 0
                ? "Belum ada event"
                : "Event tidak ditemukan"}
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">
              {events.length === 0
                ? "Mulai dengan membuat event pertamamu. Anda dapat mengatur tiket, jadwal, dan mengajukan persetujuan penerbitan."
                : "Coba ubah kata kunci pencarian atau filter yang digunakan."}
            </p>
            {events.length === 0 && (
              <Link
                href="/organizer/event/tambah"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
              >
                <Plus size={15} />
                Buat Event Pertama
              </Link>
            )}
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                submitting={submittingId === event.id}
                onSubmit={() => {
                  setSubmitError("");
                  setSubmitModal(event);
                }}
                onDelete={() => {
                  setDeleteError("");
                  setDeleteModal(event);
                }}
                onEdit={() => goToEdit(event.id)}
                onDetail={() => goToDetail(event.id)}
                onManageTickets={() => goToTickets(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {submitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submittingId) {
              setSubmitModal(null);
              setSubmitError("");
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/[0.06]">
            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Send size={18} />
              </div>
              <h2 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                Ajukan Persetujuan Event?
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                Event{" "}
                <strong className="text-slate-800">
                  {submitModal.event_name}
                </strong>{" "}
                akan dikirim kepada Super Admin untuk diperiksa.
              </p>
              <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-sky-700"
                  />
                  <p className="text-[12px] leading-5 text-sky-800">
                    Setelah diajukan, status event menjadi Pending. Event belum
                    akan tampil di halaman publik sampai disetujui oleh Super
                    Admin.
                  </p>
                </div>
              </div>
              {submitError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <p className="text-[12px] leading-5 text-red-700">
                    {submitError}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSubmitModal(null);
                  setSubmitError("");
                }}
                disabled={Boolean(submittingId)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitApproval}
                disabled={Boolean(submittingId)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingId ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Mengajukan...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Ya, Ajukan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteModal(null);
              setDeleteError("");
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/[0.06]">
            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={18} />
              </div>
              <h2 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                Hapus Event?
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                Event{" "}
                <strong className="text-slate-700">
                  {deleteModal.event_name}
                </strong>{" "}
                akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              {deleteError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <p className="text-[12px] leading-5 text-red-700">
                    {deleteError}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteModal(null);
                  setDeleteError("");
                }}
                disabled={deleting}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Hapus Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayersIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    </span>
  );
}

function StatCard({ label, value, hint, icon: Icon, accent = "slate" }) {
  const accents = {
    slate: {
      iconWrap: "bg-[#0B1220]/[0.06] text-[#0B1220]",
      bar: "from-[#0B1220] to-slate-600",
      glow: "bg-slate-300/40",
    },
    sky: {
      iconWrap: "bg-sky-50 text-sky-600",
      bar: "from-sky-400 to-blue-500",
      glow: "bg-sky-300/40",
    },
    amber: {
      iconWrap: "bg-amber-50 text-amber-600",
      bar: "from-amber-400 to-orange-500",
      glow: "bg-amber-300/40",
    },
    emerald: {
      iconWrap: "bg-emerald-50 text-emerald-600",
      bar: "from-emerald-400 to-teal-500",
      glow: "bg-emerald-300/40",
    },
  };
  const a = accents[accent] || accents.slate;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${a.glow} opacity-0 blur-2xl transition duration-500 group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#0B1220]">
            {formatNumber(value)}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-500">
            {hint}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${a.iconWrap} transition group-hover:scale-110`}
        >
          <Icon size={18} />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-[2.5px] w-full bg-gradient-to-r ${a.bar} opacity-0 transition group-hover:opacity-100`}
      />
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    rose: "border-rose-100 bg-rose-50/60 text-rose-700",
    violet: "border-violet-100 bg-violet-50/60 text-violet-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };
  const cls = tones[tone] || tones.slate;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow-sm ${cls}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={15} />
        <span className="text-[12px] font-semibold">{label}</span>
      </div>
      <span className="text-[16px] font-semibold tracking-[-0.01em]">
        {formatNumber(value)}
      </span>
    </div>
  );
}

function EventCard({
  event,
  submitting,
  onSubmit,
  onDelete,
  onEdit,
  onDetail,
  onManageTickets,
}) {
  const posterUrl = getPosterUrl(event.poster);
  const status = getStatusConfig(event.status);
  const approvalStatus = event.approval_status || "Draft";
  const approval = getApprovalConfig(approvalStatus);
  const ApprovalIcon = approval.icon;

  const {
    count: ticketCount = 0,
    startingPrice = null,
    totalQuota = 0,
    remaining = 0,
    sold = 0,
  } = event.ticketSummary || {};

  const soldPercentage =
    totalQuota > 0 ? Math.min(Math.round((sold / totalQuota) * 100), 100) : 0;

  const canSubmit = ["Draft", "Rejected"].includes(approvalStatus);
  const canEdit = ["Draft", "Rejected"].includes(approvalStatus);
  const isPending = approvalStatus === "Pending";
  const isApproved = approvalStatus === "Approved";
  const isRejected = approvalStatus === "Rejected";

  return (
    <div className="group relative flex flex-col transition duration-500 hover:-translate-y-1.5">
      <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-sky-400/0 via-violet-400/0 to-emerald-400/0 opacity-0 blur-xl transition duration-500 group-hover:from-sky-400/20 group-hover:via-violet-400/20 group-hover:to-emerald-400/20 group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-500 group-hover:border-slate-300 group-hover:shadow-[0_20px_48px_rgba(16,24,40,0.12)]">
        <div className="relative h-[200px] overflow-hidden bg-[#0B1220]">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={event.event_name || "Event"}
              className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.08]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63]">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-blue-200">
                  <Music2 size={22} />
                </div>
                <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/80">
                  TICKETVERSE
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1200ms] group-hover:translate-x-full" />

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] font-semibold shadow-sm backdrop-blur ${status.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          {event.category_name && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-md bg-white/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#0B1220] shadow-sm">
                {event.category_name}
              </span>
            </div>
          )}

          {startingPrice !== null && (
            <div className="absolute bottom-3 right-3 rounded-md bg-[#0B1220]/90 px-2.5 py-1.5 text-white shadow-lg backdrop-blur">
              <p className="text-[8.5px] font-medium uppercase tracking-[0.1em] text-slate-300">
                Mulai dari
              </p>
              <p className="text-[12.5px] font-bold leading-tight">
                {formatRupiah(startingPrice)}
              </p>
            </div>
          )}
        </div>

        <div className="relative h-0">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-[#f7f8fb] shadow-inner" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-[#f7f8fb] shadow-inner" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-200" />
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[14.5px] font-semibold leading-5 tracking-[-0.01em] text-[#0B1220]">
              {event.event_name || "Untitled Event"}
            </h3>
            {event.artist_name && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                <Music2 size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">{event.artist_name}</span>
              </div>
            )}
          </div>

          <div className="mt-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] font-semibold ${approval.className}`}
            >
              <ApprovalIcon size={12} />
              {approval.label}
            </span>

            {isPending && (
              <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/70 px-2.5 py-2 text-[11px] leading-5 text-amber-800">
                Event sedang diperiksa oleh Super Admin.
              </p>
            )}

            {isApproved && (
              <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-2 text-[11px] leading-5 text-emerald-800">
                Event telah disetujui dan siap ditampilkan ke publik.
              </p>
            )}

            {isRejected && (
              <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/70 px-2.5 py-2 text-[11px] leading-5 text-rose-700">
                <strong className="font-semibold">Alasan:</strong>{" "}
                {event.rejection_reason || "Tidak ada alasan yang diberikan."}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoTile
              icon={CalendarDays}
              label="Tanggal"
              value={formatDateShort(event.event_date)}
            />
            <InfoTile
              icon={Clock3}
              label="Waktu"
              value={formatTime(event.event_time)}
            />
            <InfoTile
              icon={Building2}
              label="Venue"
              value={event.venue_name || "-"}
            />
            <InfoTile icon={MapPin} label="Kota" value={event.city || "-"} />
          </div>

          <div className="mt-3 rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#0B1220] shadow-sm ring-1 ring-slate-100">
                  <Ticket size={13} />
                </div>
                <div>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Tiket
                  </p>
                  <p className="text-[11.5px] font-semibold text-slate-800">
                    {formatNumber(ticketCount)} kategori
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9.5px] font-medium uppercase tracking-[0.08em] text-slate-400">
                  Tersisa
                </p>
                <p className="text-[13px] font-bold text-[#0B1220]">
                  {formatNumber(remaining)}
                </p>
              </div>
            </div>

            <div className="mt-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[10px]">
                <span className="font-medium text-slate-500">Terjual</span>
                <span className="font-semibold text-slate-700">
                  {soldPercentage}%
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B1220] to-[#2F3F63] transition-all duration-700"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                <span>{formatNumber(sold)} terjual</span>
                <span>Kuota {formatNumber(totalQuota)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3.5">
            {canSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#0B1220] px-2.5 text-[11.5px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                {submitting
                  ? "Mengajukan..."
                  : approvalStatus === "Rejected"
                  ? "Ajukan Ulang"
                  : "Ajukan"}
              </button>
            )}

            {isPending && (
              <div className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 text-[11.5px] font-semibold text-amber-700">
                <Hourglass size={12} />
                Menunggu Review
              </div>
            )}

            {isApproved && (
              <div className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[11.5px] font-semibold text-emerald-700">
                <ShieldCheck size={12} />
                Disetujui
              </div>
            )}

            <button
              type="button"
              onClick={onManageTickets}
              title="Kelola tiket"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
            >
              <Ticket size={13} />
            </button>

            <button
              type="button"
              onClick={onDetail}
              title="Lihat detail"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
            >
              <Eye size={13} />
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                title="Edit event"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
              >
                <Pencil size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              title="Hapus event"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
            >
              <Trash2 size={13} />
            </button>

            <button
              type="button"
              onClick={onDetail}
              title="Buka detail"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0B1220]/[0.04] text-[#0B1220] transition hover:bg-[#0B1220]/[0.08]"
            >
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-100 bg-white px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className="shrink-0 text-slate-400" />
        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
      </div>
      <p
        title={String(value)}
        className="mt-0.5 truncate text-[11.5px] font-semibold text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}
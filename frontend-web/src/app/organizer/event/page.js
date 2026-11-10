
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
  CheckCircle2,
  XCircle,
  Loader2,
  SlidersHorizontal,
  X,
  Building2,
  ArrowUpRight,
} from "lucide-react";

/* ============================================================
   API CONFIG
============================================================ */

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_ROOT.endsWith("/api")
  ? API_ROOT
  : `${API_ROOT}/api`;

const API_ORIGIN = API_ROOT.replace(/\/api$/, "");

const STATUS_OPTIONS = [
  "All",
  "Coming Soon",
  "Available",
  "Limited",
  "Sold Out",
];

const STATUS_CONFIG = {
  "Coming Soon": {
    label: "Coming Soon",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
    icon: Clock3,
  },
  Available: {
    label: "Available",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  Limited: {
    label: "Limited",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    icon: AlertCircle,
  },
  "Sold Out": {
    label: "Sold Out",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

/* ============================================================
   HELPERS
============================================================ */

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
    throw new Error("Response server tidak valid.");
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        data.error ||
        `Permintaan gagal. HTTP ${response.status}`
    );
  }

  return data;
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

function formatDateShort(value) {
  if (!value) return "-";

  // Menghindari perubahan tanggal karena timezone.
  const dateValue = String(value).slice(0, 10);
  const parts = dateValue.split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return "-";
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

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_ORIGIN}/${value.replace(/^\/+/, "")}`;
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className: "border-slate-200 bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
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
    .filter((price) => Number.isFinite(price));

  return {
    count: tickets.length,
    totalQuota,
    remaining,
    sold: Math.max(totalQuota - remaining, 0),
    startingPrice: prices.length ? Math.min(...prices) : null,
  };
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function OrganizerEventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ============================================================
     FETCH EVENT ORGANIZER
     GET /api/organizer/events
  ============================================================ */

  const fetchEvents = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      if (!getToken()) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const [eventsData, ticketsData] = await Promise.all([
        apiRequest("/organizer/events"),
        apiRequest("/ticket-categories"),
      ]);

      const eventList = Array.isArray(eventsData.events)
        ? eventsData.events
        : Array.isArray(eventsData.data)
        ? eventsData.data
        : [];

      const ticketList = Array.isArray(ticketsData.ticket_categories)
        ? ticketsData.ticket_categories
        : Array.isArray(ticketsData.data)
        ? ticketsData.data
        : [];

      setEvents(eventList);
      setTicketCategories(ticketList);
    } catch (err) {
      console.error("FETCH ORGANIZER EVENTS ERROR:", err);

      setError(
        err.message || "Gagal mengambil data event dari server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /* ============================================================
     EVENT + TICKET SUMMARY
  ============================================================ */

  const enrichedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      ticketSummary: getTicketSummary(
        event.id,
        ticketCategories
      ),
    }));
  }, [events, ticketCategories]);

  /* ============================================================
     SEARCH + FILTER
  ============================================================ */

  const filteredEvents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return enrichedEvents.filter((event) => {
      const searchableText = [
        event.event_name,
        event.artist_name,
        event.category_name,
        event.venue_name,
        event.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !keyword || searchableText.includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrichedEvents, search, statusFilter]);

  /* ============================================================
     STATISTICS
  ============================================================ */

  const stats = useMemo(() => {
    const totalQuota = enrichedEvents.reduce(
      (sum, event) =>
        sum + event.ticketSummary.totalQuota,
      0
    );

    const remainingTickets = enrichedEvents.reduce(
      (sum, event) =>
        sum + event.ticketSummary.remaining,
      0
    );

    return {
      total: events.length,

      available: events.filter(
        (event) => event.status === "Available"
      ).length,

      comingSoon: events.filter(
        (event) => event.status === "Coming Soon"
      ).length,

      limited: events.filter(
        (event) => event.status === "Limited"
      ).length,

      soldOut: events.filter(
        (event) => event.status === "Sold Out"
      ).length,

      totalQuota,
      remainingTickets,
    };
  }, [events, enrichedEvents]);

  /* ============================================================
     DELETE EVENT
     DELETE /api/events/:id
  ============================================================ */

  const handleDelete = async () => {
    if (!deleteModal?.id) return;

    try {
      setDeleting(true);

      await apiRequest(`/events/${deleteModal.id}`, {
        method: "DELETE",
      });

      setEvents((previous) =>
        previous.filter(
          (event) => Number(event.id) !== Number(deleteModal.id)
        )
      );

      setTicketCategories((previous) =>
        previous.filter(
          (item) => Number(item.event_id) !== Number(deleteModal.id)
        )
      );

      setDeleteModal(null);
    } catch (err) {
      console.error("DELETE EVENT ERROR:", err);
      alert(err.message || "Gagal menghapus event.");
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="w-full min-w-0 text-[#0F172A]">
      {/* HEADER */}
      <div className="mb-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
              <span>Organizer</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-slate-600">
                Event
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden h-11 w-1 rounded-full bg-[#112250] sm:block" />

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                  Kelola Event
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Kelola event, tiket, jadwal, dan informasi penjualan
                  dalam satu tempat.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/organizer/event/tambah"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1A326A]"
          >
            <Plus size={18} />
            Buat Event
          </Link>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          title="Total Event"
          value={formatNumber(stats.total)}
          description="Event yang kamu kelola"
          icon={CalendarDays}
        />

        <OverviewCard
          title="Event Available"
          value={formatNumber(stats.available)}
          description="Event tersedia"
          icon={CheckCircle2}
        />

        <OverviewCard
          title="Coming Soon"
          value={formatNumber(stats.comingSoon)}
          description="Event segera hadir"
          icon={Clock3}
        />

        <OverviewCard
          title="Tiket Tersedia"
          value={formatNumber(stats.remainingTickets)}
          description={`Dari ${formatNumber(stats.totalQuota)} total kuota`}
          icon={Ticket}
        />
      </div>

      {/* STATUS SUMMARY */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatusSummary
          label="Available"
          value={stats.available}
          color="blue"
        />

        <StatusSummary
          label="Coming Soon"
          value={stats.comingSoon}
          color="slate"
        />

        <StatusSummary
          label="Limited"
          value={stats.limited}
          color="amber"
        />

        <StatusSummary
          label="Sold Out"
          value={stats.soldOut}
          color="rose"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* TOOLBAR */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Semua Event
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Kelola event dan pantau kesiapan penjualan tiket.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}
              <div className="relative w-full sm:w-[310px]">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari event, artis, venue..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* STATUS FILTER */}
              <div className="relative">
                <SlidersHorizontal
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 w-full min-w-[175px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "Semua Status" : status}
                    </option>
                  ))}
                </select>
              </div>

              {/* REFRESH */}
              <button
                type="button"
                onClick={() => fetchEvents(true)}
                disabled={refreshing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && !loading && (
          <div className="m-4 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:m-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Gagal memuat data
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchEvents()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#112250]/5">
                <Loader2
                  size={25}
                  className="animate-spin text-[#112250]"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Memuat event...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Mengambil data event dan kategori tiket
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#112250]/5 text-[#112250]">
              <CalendarDays size={28} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              {events.length === 0
                ? "Belum ada event"
                : "Event tidak ditemukan"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {events.length === 0
                ? "Mulai dengan membuat event pertamamu dan siapkan tiket untuk pelanggan."
                : "Coba ubah kata kunci pencarian atau filter status."}
            </p>

            {events.length === 0 && (
              <Link
                href="/organizer/event/tambah"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#112250] px-4 text-sm font-semibold text-white transition hover:bg-[#1A326A]"
              >
                <Plus size={17} />
                Buat Event
              </Link>
            )}
          </div>
        )}

        {/* EVENT LIST */}
        {!loading && !error && filteredEvents.length > 0 && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-bold text-slate-800">
                  {filteredEvents.length}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-800">
                  {events.length}
                </span>{" "}
                event
              </p>

              {(search || statusFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="text-xs font-bold text-[#112250] hover:text-[#1A326A]"
                >
                  Reset filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={() => setDeleteModal(event)}
                  onEdit={() =>
                    router.push(`/organizer/event/edit/${event.id}`)
                  }
                  onDetail={() =>
                    router.push(`/organizer/event/${event.id}`)
                  }
                  onManageTickets={() =>
                    router.push(
                      `/organizer/event/${event.id}/tiket`
                    )
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={22} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Hapus Event?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Event{" "}
                <span className="font-semibold text-slate-700">
                  "{deleteModal.event_name}"
                </span>{" "}
                akan dihapus secara permanen. Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
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

/* ============================================================
   OVERVIEW CARD
============================================================ */

function OverviewCard({ title, value, description, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#112250]/[0.03] transition duration-500 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[#0F172A]">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS SUMMARY
============================================================ */

function StatusSummary({ label, value, color }) {
  const colors = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${colors[color]}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {formatNumber(value)}
      </p>
    </div>
  );
}

/* ============================================================
   EVENT CARD
============================================================ */

function EventCard({
  event,
  onDelete,
  onEdit,
  onDetail,
  onManageTickets,
}) {
  const posterUrl = getPosterUrl(event.poster);
  const status = getStatusConfig(event.status);

  const {
    count: ticketCount = 0,
    startingPrice = null,
    totalQuota = 0,
    remaining = 0,
    sold = 0,
  } = event.ticketSummary || {};

  const soldPercentage =
    totalQuota > 0
      ? Math.min(Math.round((sold / totalQuota) * 100), 100)
      : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#112250]/20 hover:shadow-lg">
      {/* POSTER */}
      <div className="relative h-[230px] overflow-hidden bg-[#0F172A]">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={event.event_name || "Event"}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#112250] via-[#243B68] to-[#3B507D]">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-blue-200">
                <Music2 size={27} />
              </div>

              <p className="mt-3 text-xs font-semibold tracking-wider text-blue-100">
                TICKETVERSE
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* STATUS */}
        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold shadow-sm backdrop-blur ${status.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* CATEGORY */}
        {event.category_name && (
          <div className="absolute bottom-4 left-4">
            <span className="rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#112250] shadow-sm">
              {event.category_name}
            </span>
          </div>
        )}

        {/* PRICE */}
        {startingPrice !== null && (
          <div className="absolute bottom-4 right-4 rounded-lg bg-[#0F172A]/85 px-3 py-2 text-white shadow-lg backdrop-blur">
            <p className="text-[9px] font-medium uppercase tracking-wider text-slate-300">
              Mulai dari
            </p>

            <p className="text-sm font-bold">
              {formatRupiah(startingPrice)}
            </p>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-bold leading-6 text-[#0F172A]">
            {event.event_name || "Untitled Event"}
          </h3>

          {event.artist_name && (
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Music2 size={13} className="shrink-0 text-[#112250]" />
              <span className="truncate">
                {event.artist_name}
              </span>
            </div>
          )}
        </div>

        {/* EVENT INFORMATION */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <InfoItem
            icon={CalendarDays}
            label="Tanggal"
            value={formatDateShort(event.event_date)}
          />

          <InfoItem
            icon={Clock3}
            label="Waktu"
            value={formatTime(event.event_time)}
          />

          <InfoItem
            icon={Building2}
            label="Venue"
            value={event.venue_name || "-"}
          />

          <InfoItem
            icon={MapPin}
            label="Lokasi"
            value={event.city || "-"}
          />
        </div>

        {/* TICKET SUMMARY */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#112250] shadow-sm">
                <Ticket size={15} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tiket
                </p>

                <p className="text-xs font-bold text-slate-800">
                  {formatNumber(ticketCount)} kategori
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-medium text-slate-400">
                Tersisa
              </p>

              <p className="text-sm font-bold text-[#112250]">
                {formatNumber(remaining)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px]">
              <span className="font-medium text-slate-400">
                Tiket terjual
              </span>

              <span className="font-bold text-slate-600">
                {soldPercentage}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#112250] transition-all"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>Terjual: {formatNumber(sold)}</span>
              <span>Kuota: {formatNumber(totalQuota)}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onManageTickets}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#112250] px-3 text-xs font-bold text-white transition hover:bg-[#1A326A]"
          >
            <Ticket size={14} />
            Kelola Tiket
          </button>

          <button
            type="button"
            onClick={onDetail}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
          >
            <Eye size={14} />
            Detail
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
            title="Edit event"
          >
            <Pencil size={14} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
            title="Hapus event"
          >
            <Trash2 size={14} />
          </button>

          <button
            type="button"
            onClick={onDetail}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#112250]/5 text-[#112250] transition hover:bg-[#112250]/10"
            title="Buka detail event"
          >
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500">
          <Icon size={13} />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p
            title={String(value)}
            className="mt-0.5 truncate text-[11px] font-semibold text-slate-700"
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

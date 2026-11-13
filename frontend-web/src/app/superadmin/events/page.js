"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  MagnifyingGlassIcon,
  TicketIcon,
  CalendarIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  SparklesIcon,
  ChevronRightIcon as ChevronRightSolid,
  ShieldCheckIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const RAW_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_ROOT = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL
  : `${RAW_API_URL}/api`;

const API_ORIGIN = API_ROOT.replace(/\/api$/, "");

const ITEMS_PER_PAGE = 5;

const APPROVAL_FILTERS = [
  { value: "All", label: "Semua Persetujuan" },
  { value: "Pending", label: "Menunggu Persetujuan" },
  { value: "Approved", label: "Disetujui" },
  { value: "Rejected", label: "Ditolak" },
  { value: "Draft", label: "Draf" },
];

const EVENT_STATUS_LABELS = {
  "Coming Soon": "Segera Hadir",
  Available: "Tersedia",
  Limited: "Terbatas",
  "Sold Out": "Habis Terjual",
  Cancelled: "Dibatalkan",
  Completed: "Selesai",
  Draft: "Draf",
};

const APPROVAL_LABELS = {
  Pending: "Menunggu",
  Approved: "Disetujui",
  Rejected: "Ditolak",
  Draft: "Draf",
};

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    null
  );
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error(
      "Token autentikasi tidak ditemukan. Silakan login kembali sebagai Super Admin."
    );
  }

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(`${API_ROOT}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  const rawText = await response.text();
  let result = {};
  try {
    result = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(`Respons server tidak valid. HTTP ${response.status}.`);
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        result.error ||
        `Request gagal (${response.status}).`
    );
  }
  return result;
}

function extractArray(result, keys = []) {
  if (Array.isArray(result)) return result;
  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data?.[key])) return result.data[key];
  }
  if (Array.isArray(result?.data)) return result.data;
  return [];
}

function normalizeEvent(event) {
  return {
    ...event,
    id: event.id,
    name: event.event_name || "Tanpa Nama Event",
    category: event.category_name || "-",
    artist: event.artist_name || "-",
    date: event.event_date || null,
    time: event.event_time || null,
    location: event.venue_name || "-",
    city: event.city || "",
    organizer: event.organizer_name || "Tidak diketahui",
    organizerEmail: event.organizer_email || "-",
    status: event.status || "Coming Soon",
    approvalStatus: event.approval_status || "Pending",
    rejectionReason: event.rejection_reason || "",
    poster: event.poster || null,
  };
}

function formatDate(date) {
  if (!date) return "-";
  const dateOnly = String(date).slice(0, 10);
  const parts = dateOnly.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    if (year && month && day) {
      const localDate = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(localDate);
    }
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function formatTime(time) {
  if (!time) return "-";
  return String(time).slice(0, 5);
}

function getEventStatusStyle(status) {
  const styles = {
    Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Limited: "bg-amber-50 text-amber-700 border-amber-200",
    "Coming Soon": "bg-sky-50 text-sky-700 border-sky-200",
    "Sold Out": "bg-violet-50 text-violet-700 border-violet-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    Completed: "bg-slate-100 text-slate-600 border-slate-200",
    Draft: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

function getApprovalStyle(status) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
    Draft: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

function getTicketSummary(eventId, ticketCategories) {
  const categories = ticketCategories.filter(
    (item) => Number(item.event_id) === Number(eventId)
  );
  const quota = categories.reduce(
    (total, item) => total + Number(item.quota || 0),
    0
  );
  const remaining = categories.reduce(
    (total, item) => total + Number(item.remaining_ticket || 0),
    0
  );
  const sold = categories.reduce((total, item) => {
    const itemQuota = Number(item.quota || 0);
    const itemRemaining = Number(item.remaining_ticket || 0);
    return total + Math.max(itemQuota - itemRemaining, 0);
  }, 0);
  const revenue = categories.reduce((total, item) => {
    const itemQuota = Number(item.quota || 0);
    const itemRemaining = Number(item.remaining_ticket || 0);
    const itemSold = Math.max(itemQuota - itemRemaining, 0);
    return total + itemSold * Number(item.price || 0);
  }, 0);
  const prices = categories
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price >= 0);
  const minimumPrice = prices.length > 0 ? Math.min(...prices) : null;
  return {
    categories: categories.length,
    quota,
    remaining,
    sold,
    revenue,
    minimumPrice,
  };
}

export default function ManajemenEvent() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApproval, setFilterApproval] = useState("All");
  const [filterEventStatus, setFilterEventStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [ticketWarning, setTicketWarning] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingApproval, setProcessingApproval] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  const fetchEvents = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      setTicketWarning("");

      const [eventResult, ticketResult] = await Promise.all([
        apiRequest("/sadmin/event-approvals?status=All"),
        apiRequest("/ticket-categories").catch((err) => {
          console.error("FETCH TICKET CATEGORIES ERROR:", err);
          setTicketWarning(
            "Data kategori tiket belum berhasil dimuat. Informasi penjualan dan pendapatan mungkin belum lengkap."
          );
          return { ticket_categories: [] };
        }),
      ]);

      const eventData = extractArray(eventResult, ["events"]);
      const ticketData = extractArray(ticketResult, ["ticket_categories"]);

      setEvents(eventData.map(normalizeEvent));
      setTicketCategories(ticketData);
    } catch (err) {
      console.error("FETCH SUPER ADMIN EVENTS ERROR:", err);
      setError(
        err.message || "Terjadi kesalahan saat mengambil data event."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    return events.filter((event) => {
      const matchSearch =
        event.name.toLowerCase().includes(keyword) ||
        event.category.toLowerCase().includes(keyword) ||
        event.artist.toLowerCase().includes(keyword) ||
        event.location.toLowerCase().includes(keyword) ||
        event.city.toLowerCase().includes(keyword) ||
        event.organizer.toLowerCase().includes(keyword) ||
        event.organizerEmail.toLowerCase().includes(keyword);
      const matchApproval =
        filterApproval === "All" || event.approvalStatus === filterApproval;
      const matchEventStatus =
        filterEventStatus === "Semua" || event.status === filterEventStatus;
      return matchSearch && matchApproval && matchEventStatus;
    });
  }, [events, searchTerm, filterApproval, filterEventStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  );
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterApproval, filterEventStatus]);

  const statistics = useMemo(() => {
    const total = events.length;
    const pending = events.filter(
      (event) => event.approvalStatus === "Pending"
    ).length;
    const approved = events.filter(
      (event) => event.approvalStatus === "Approved"
    ).length;
    const rejected = events.filter(
      (event) => event.approvalStatus === "Rejected"
    ).length;

    let totalSold = 0;
    let totalCapacity = 0;
    let totalRevenue = 0;

    events.forEach((event) => {
      const summary = getTicketSummary(event.id, ticketCategories);
      totalSold += summary.sold;
      totalCapacity += summary.quota;
      totalRevenue += summary.revenue;
    });

    return {
      total,
      pending,
      approved,
      rejected,
      totalSold,
      totalCapacity,
      totalRevenue,
    };
  }, [events, ticketCategories]);

  const salesPercentage =
    statistics.totalCapacity > 0
      ? Math.min(
          (statistics.totalSold / statistics.totalCapacity) * 100,
          100
        )
      : 0;

  const openApprovalModal = (event, action) => {
    setSelectedEvent(event);
    setApprovalAction(action);
    setRejectionReason("");
    setApprovalError("");
  };

  const closeApprovalModal = () => {
    if (processingApproval) return;
    setSelectedEvent(null);
    setApprovalAction(null);
    setRejectionReason("");
    setApprovalError("");
  };

  const submitApproval = async () => {
    if (!selectedEvent || !approvalAction || processingApproval) return;
    if (approvalAction === "reject" && !rejectionReason.trim()) {
      setApprovalError("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      setProcessingApproval(true);
      setApprovalError("");

      const payload =
        approvalAction === "approve"
          ? { action: "approve" }
          : {
              action: "reject",
              rejection_reason: rejectionReason.trim(),
            };

      const result = await apiRequest(
        `/sadmin/events/${selectedEvent.id}/approval`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      if (result.success === false) {
        throw new Error(
          result.message || "Gagal memproses persetujuan event."
        );
      }

      const updatedEvent = result.event;
      setEvents((previous) =>
        previous.map((event) => {
          if (Number(event.id) !== Number(selectedEvent.id)) return event;
          return normalizeEvent({ ...event, ...updatedEvent });
        })
      );

      setSelectedEvent(null);
      setApprovalAction(null);
      setRejectionReason("");
      setApprovalError("");
    } catch (err) {
      console.error("EVENT APPROVAL ERROR:", err);
      setApprovalError(
        err.message || "Gagal memproses persetujuan event."
      );
    } finally {
      setProcessingApproval(false);
    }
  };

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (filterApproval !== "All" ? 1 : 0) +
    (filterEventStatus !== "Semua" ? 1 : 0);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterApproval("All");
    setFilterEventStatus("Semua");
  };

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
            <span>Super Admin</span>
            <ChevronRightSolid className="h-3 w-3 text-white/30" />
            <span className="text-white/90">Manajemen Event</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
                <ShieldCheckIcon className="h-3 w-3 text-emerald-300" />
                Event Approval Console
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                Manajemen Event
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Pantau seluruh event TicketVerse, tinjau pengajuan dari
                organizer, dan kelola persetujuan penerbitan event dalam satu
                dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchEvents(true)}
                disabled={refreshing || loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.14] disabled:opacity-60"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && !loading && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="text-[13px] font-semibold text-red-800">
                Gagal memuat data event
              </p>
              <p className="mt-0.5 break-words text-[12.5px] text-red-600">
                {error}
              </p>
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

      {ticketWarning && !error && !loading && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[12.5px] leading-5 text-amber-800">
            {ticketWarning}
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Event"
          value={formatNumber(statistics.total)}
          hint="Seluruh event terdaftar"
          icon={TicketIcon}
          accent="slate"
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={formatNumber(statistics.pending)}
          hint="Dalam review Super Admin"
          icon={ClockIcon}
          accent="amber"
        />
        <StatCard
          label="Event Disetujui"
          value={formatNumber(statistics.approved)}
          hint="Sudah tayang di publik"
          icon={CheckCircleIcon}
          accent="emerald"
        />
        <StatCard
          label="Event Ditolak"
          value={formatNumber(statistics.rejected)}
          hint="Perlu revisi organizer"
          icon={XCircleIcon}
          accent="rose"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-300/20 opacity-0 blur-2xl transition group-hover:opacity-100" />
          <div className="relative mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Ringkasan Penjualan
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Akumulasi tiket terjual dari semua event
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <ChartBarIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="relative flex items-end justify-between gap-3">
            <div>
              <p className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-[#0B1220]">
                {formatNumber(statistics.totalSold)}
              </p>
              <p className="mt-1 text-[12px] font-medium text-slate-500">
                Tiket terjual
              </p>
            </div>
            <p className="text-[13px] font-bold text-sky-600">
              {salesPercentage.toFixed(1)}%
            </p>
          </div>

          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
              style={{ width: `${salesPercentage}%` }}
            />
          </div>

          <div className="relative mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{formatNumber(statistics.totalSold)} terjual</span>
            <span>{formatNumber(statistics.totalCapacity)} kapasitas</span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-300/20 opacity-0 blur-2xl transition group-hover:opacity-100" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Estimasi Pendapatan
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Harga kategori × tiket terjual
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BanknotesIcon className="h-4 w-4" />
            </div>
          </div>

          <p className="relative mt-4 text-[26px] font-semibold leading-none tracking-[-0.02em] text-[#0B1220]">
            {formatCurrency(statistics.totalRevenue)}
          </p>

          <p className="relative mt-2 text-[11px] text-slate-400">
            Nilai estimasi, bukan laporan pencairan transaksi.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
                  <FunnelIcon className="h-3.5 w-3.5" />
                </span>
                Daftar Event
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {loading
                  ? "Memuat data event..."
                  : `Menampilkan ${formatNumber(
                      filteredEvents.length
                    )} dari ${formatNumber(events.length)} event`}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:flex-wrap">
              <div className="relative w-full sm:w-[280px]">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari event, artis, organizer..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={filterApproval}
                onChange={(e) => setFilterApproval(e.target.value)}
                className="h-9 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#0B1220]/40"
              >
                {APPROVAL_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={filterEventStatus}
                onChange={(e) => setFilterEventStatus(e.target.value)}
                className="h-9 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#0B1220]/40"
              >
                <option value="Semua">Semua Status Event</option>
                {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
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
                <ArrowPathIcon className="h-5 w-5 animate-spin text-[#0B1220]" />
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

        {!loading && currentEvents.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0B1220]/[0.04] text-[#0B1220]">
              {events.length === 0 ? (
                <SparklesIcon className="h-6 w-6" />
              ) : (
                <MagnifyingGlassIcon className="h-6 w-6" />
              )}
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-slate-900">
              {events.length === 0
                ? "Belum ada event"
                : "Event tidak ditemukan"}
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">
              {events.length === 0
                ? "Belum ada event yang terdaftar di database. Event akan muncul di sini setelah organizer membuat event."
                : "Coba ubah kata kunci pencarian atau filter yang digunakan."}
            </p>
            {events.length > 0 && activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {!loading && currentEvents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead className="border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
                <tr className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-3.5">No</th>
                  <th className="px-5 py-3.5">Nama Event</th>
                  <th className="px-5 py-3.5">Organizer</th>
                  <th className="px-5 py-3.5">Kategori / Artis</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Lokasi</th>
                  <th className="px-5 py-3.5 text-center">Penjualan</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Persetujuan</th>
                  <th className="px-5 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentEvents.map((event, index) => {
                  const ticket = getTicketSummary(
                    event.id,
                    ticketCategories
                  );
                  const percentage =
                    ticket.quota > 0
                      ? Math.min((ticket.sold / ticket.quota) * 100, 100)
                      : 0;

                  return (
                    <tr
                      key={event.id}
                      className="group transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4 text-[12px] text-slate-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      <td className="max-w-[230px] px-5 py-4">
                        <p className="truncate text-[13px] font-semibold text-[#0B1220]">
                          {event.name}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          ID Event: {event.id}
                        </p>
                        {event.rejectionReason && (
                          <p className="mt-1 max-w-[220px] truncate text-[10.5px] font-medium text-rose-600">
                            Alasan: {event.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="max-w-[190px] px-5 py-4">
                        <div className="flex items-start gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
                            <BuildingOffice2Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-[#0B1220]">
                              {event.organizer}
                            </p>
                            <p className="mt-0.5 truncate text-[10.5px] text-slate-400">
                              {event.organizerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700">
                          {event.category}
                        </span>
                        <p className="mt-1.5 text-[10.5px] text-slate-400">
                          {event.artist}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#0B1220]">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {formatDate(event.date)}
                        </div>
                        {event.time && (
                          <p className="mt-0.5 pl-5 text-[10.5px] text-slate-400">
                            {formatTime(event.time)}
                          </p>
                        )}
                      </td>

                      <td className="max-w-[170px] px-5 py-4">
                        <div className="flex items-start gap-1.5 text-[12px] text-[#0B1220]">
                          <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {event.location}
                            </p>
                            {event.city && (
                              <p className="mt-0.5 truncate text-[10.5px] text-slate-400">
                                {event.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[12px] font-bold text-[#0B1220]">
                            {formatNumber(ticket.sold)}
                            <span className="text-[10.5px] font-normal text-slate-400">
                              {" "}
                              / {formatNumber(ticket.quota)}
                            </span>
                          </span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-[9.5px] text-slate-400">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-[10.5px] font-semibold ${getEventStatusStyle(
                            event.status
                          )}`}
                        >
                          {EVENT_STATUS_LABELS[event.status] || event.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-[10.5px] font-semibold ${getApprovalStyle(
                            event.approvalStatus
                          )}`}
                        >
                          {APPROVAL_LABELS[event.approvalStatus] ||
                            event.approvalStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/superadmin/events/${event.id}`)
                            }
                            title="Detail Event"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                          </button>

                          {event.approvalStatus === "Pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  openApprovalModal(event, "approve")
                                }
                                title="Setujui Event"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                              >
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openApprovalModal(event, "reject")
                                }
                                title="Tolak Event"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                              >
                                <XCircleIcon className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredEvents.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/50 px-6 py-4 sm:flex-row">
            <span className="text-[12px] text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-[#0B1220]">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-[#0B1220]">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-[#0B1220]">
                {filteredEvents.length}
              </span>{" "}
              event
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((previous) => Math.max(previous - 1, 1))
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-[12.5px] font-semibold text-[#0B1220]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(previous + 1, totalPages)
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedEvent && approvalAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeApprovalModal();
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/[0.06]">
            <div className="p-6">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  approvalAction === "approve"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {approvalAction === "approve" ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5" />
                )}
              </div>
              <h2 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                {approvalAction === "approve"
                  ? "Setujui Event?"
                  : "Tolak Event?"}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                Event{" "}
                <strong className="text-slate-700">{selectedEvent.name}</strong>{" "}
                oleh {selectedEvent.organizer}.
              </p>

              {approvalAction === "approve" ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-[12px] leading-5 text-emerald-800">
                      Setelah disetujui, event akan tayang dan dapat diakses oleh
                      customer di halaman publik.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Alasan Penolakan{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    placeholder="Masukkan alasan mengapa event ditolak..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Alasan ini akan disimpan pada data event.
                  </p>
                </div>
              )}

              {approvalError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-[12px] leading-5 text-red-700">
                    {approvalError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={processingApproval}
                onClick={closeApprovalModal}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  processingApproval ||
                  (approvalAction === "reject" && !rejectionReason.trim())
                }
                onClick={submitApproval}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  approvalAction === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {processingApproval ? (
                  <>
                    <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                    Memproses...
                  </>
                ) : approvalAction === "approve" ? (
                  <>
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Ya, Setujui
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-3.5 w-3.5" />
                    Ya, Tolak
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
    rose: {
      iconWrap: "bg-rose-50 text-rose-600",
      bar: "from-rose-400 to-pink-500",
      glow: "bg-rose-300/40",
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
          <p className="mt-2 break-words text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#0B1220]">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-[12px] font-medium text-slate-500">
              {hint}
            </p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${a.iconWrap} transition group-hover:scale-110`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-[2.5px] w-full bg-gradient-to-r ${a.bar} opacity-0 transition group-hover:opacity-100`}
      />
    </div>
  );
}
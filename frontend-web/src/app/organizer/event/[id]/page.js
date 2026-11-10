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
  Eye,
} from "lucide-react";

/* =====================================================
   API CONFIGURATION
===================================================== */

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
    throw new Error(
      data.message || `Permintaan gagal (${response.status})`
    );
  }

  return data;
}

/* =====================================================
   FORMAT HELPERS
===================================================== */

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

function getStatusConfig(status) {
  const configs = {
    "Coming Soon": {
      label: "Coming Soon",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: Timer,
    },
    Available: {
      label: "Available",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CheckCircle2,
    },
    Limited: {
      label: "Limited",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertCircle,
    },
    "Sold Out": {
      label: "Sold Out",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
    },
    Cancelled: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-500 border-slate-200",
      icon: XCircle,
    },
  };

  return configs[status] || {
    label: status || "-",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: AlertCircle,
  };
}

/* =====================================================
   MAIN PAGE
===================================================== */

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

  /* =====================================================
     FETCH DATA
  ===================================================== */

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    // Pastikan event benar-benar milik organizer login.
    const organizerData = await apiRequest("/organizer/events");

    const myEvents = Array.isArray(organizerData.events)
      ? organizerData.events
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

    if (
      Number(data.event?.organizer_id) !==
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

      const data = await apiRequest(
        `/ticket-categories/event/${eventId}`
      );

      setTickets(
        Array.isArray(data.ticket_categories)
          ? data.ticket_categories
          : []
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

      const data = await apiRequest(
        `/seats/events/${eventId}`
      );

      setSections(
        Array.isArray(data.sections)
          ? data.sections
          : []
      );
    } catch (err) {
      setSeatError(err.message);
      setSections([]);
    }
  }, [eventId]);

  const fetchAll = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    setError("");

    try {
      await fetchEvent();

      await Promise.all([
        fetchTickets(),
        fetchSeats(),
      ]);
    } catch (err) {
      setError(err.message || "Gagal mengambil detail event.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchEvent, fetchTickets, fetchSeats]);

  useEffect(() => {
    if (eventId) fetchAll(true);
  }, [eventId, fetchAll]);

  /* =====================================================
     TICKET STATISTICS
  ===================================================== */

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
        Number(item.quota || 0) -
        Number(item.remaining_ticket || 0)
      );

      return sum + itemSold * Number(item.price || 0);
    }, 0);

    return {
      quota,
      remaining,
      sold,
      estimatedValue,
      percentage: quota > 0
        ? Math.round((sold / quota) * 100)
        : 0,
    };
  }, [tickets]);

  /* =====================================================
     SEAT STATISTICS
  ===================================================== */

  const seatStats = useMemo(() => {
    const allSeats = sections.flatMap(
      (section) => section.seats || []
    );

    return {
      sections: sections.length,
      total: allSeats.length,
      available: allSeats.filter(
        (seat) => seat.status === "Available"
      ).length,
      reserved: allSeats.filter(
        (seat) => seat.status === "Reserved"
      ).length,
      sold: allSeats.filter(
        (seat) => seat.status === "Sold" ||
          seat.status === "Booked"
      ).length,
    };
  }, [sections]);

  /* =====================================================
     DELETE EVENT
  ===================================================== */

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

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-7 w-7 animate-spin text-[#112250]" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat detail event organizer...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Detail Event Tidak Tersedia
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Data event tidak ditemukan."}
          </p>

          <button
            onClick={() => router.push("/organizer/event")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white hover:bg-[#233D70]"
          >
            <ArrowLeft size={17} />
            Kembali ke Event
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     EVENT DATA
  ===================================================== */

  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;
  const posterUrl = getPosterUrl(event.poster);

  /* =====================================================
     MAIN RENDER
  ===================================================== */

  return (
    <div className="w-full min-w-0">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/organizer/event"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#112250]"
            >
              <ArrowLeft size={16} />
              Kembali ke Event Saya
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Detail Event
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Kelola informasi, tiket, denah kursi, dan penjualan event.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => fetchAll(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(`/organizer/event/edit/${event.id}`)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} />
              Edit Event
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {deleting ? "Menghapus..." : "Hapus"}
            </button>

          </div>
        </div>

        {/* EVENT HERO */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">

            <div className="relative min-h-[320px] bg-gradient-to-br from-[#112250] to-[#495B7D] lg:min-h-[430px]">
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
                  <Ticket size={64} />
                  <p className="mt-4 text-sm">
                    Poster belum tersedia
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#112250]/5 px-3 py-1.5 text-xs font-bold text-[#112250]">
                  EVENT ORGANIZER
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusConfig.className}`}
                >
                  <StatusIcon size={14} />
                  {statusConfig.label}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold leading-tight text-[#0F172A] sm:text-3xl">
                {event.event_name}
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                ID Event: #{event.id}
              </p>

              {event.description && (
                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-500">
                  {event.description}
                </p>
              )}

              <div className="mt-7 grid gap-4 sm:grid-cols-2">

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

              </div>
            </div>
          </div>
        </section>

        {/* STATISTICS */}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">
              Ringkasan Event
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Statistik berdasarkan kategori tiket dan denah event.
            </p>
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
              value={ticketStats.sold.toLocaleString("id-ID")}
              description={`${ticketStats.percentage}% dari kuota`}
            />

            <StatCard
              icon={Wallet}
              label="Sisa Tiket"
              value={ticketStats.remaining.toLocaleString("id-ID")}
              description={`Dari ${ticketStats.quota.toLocaleString("id-ID")} kuota`}
            />

            <StatCard
              icon={Armchair}
              label="Total Kursi"
              value={seatStats.total.toLocaleString("id-ID")}
              description={`${seatStats.sections} section denah`}
            />

          </div>
        </section>

        {/* TICKET MANAGEMENT */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                <Ticket size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Kategori Tiket
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Informasi harga, kuota, dan ketersediaan tiket.
                </p>
              </div>
            </div>

            <Link
              href={`/organizer/events/${event.id}/tiket`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-4 py-3 text-sm font-bold text-white hover:bg-[#233D70]"
            >
              <Pencil size={16} />
              Kelola Kategori Tiket
              <ChevronRight size={16} />
            </Link>

          </div>

          {ticketError ? (
            <ErrorPanel
              message={ticketError}
              onRetry={fetchTickets}
            />
          ) : tickets.length === 0 ? (
            <EmptyPanel
              icon={Ticket}
              title="Belum Ada Kategori Tiket"
              description="Tambahkan kategori tiket untuk mulai mengatur harga dan kuota event."
            />
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-4">Kategori</th>
                    <th className="px-4 py-4">Harga</th>
                    <th className="px-4 py-4">Kuota</th>
                    <th className="px-4 py-4">Terjual</th>
                    <th className="px-4 py-4">Sisa</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => {
                    const quota = Number(ticket.quota || 0);
                    const remaining = Number(
                      ticket.remaining_ticket || 0
                    );

                    const sold = Math.max(0, quota - remaining);

                    const percentage = quota > 0
                      ? Math.round((sold / quota) * 100)
                      : 0;

                    return (
                      <tr
                        key={ticket.id}
                        className="border-b border-slate-50 transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-5">
                          <p className="text-sm font-bold text-slate-800">
                            {ticket.category_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            ID #{ticket.id}
                          </p>
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-[#112250]">
                          {formatRupiah(ticket.price)}
                        </td>

                        <td className="px-4 py-5 text-sm text-slate-600">
                          {quota.toLocaleString("id-ID")}
                        </td>

                        <td className="px-4 py-5 text-sm font-bold text-emerald-700">
                          {sold.toLocaleString("id-ID")}
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-slate-700">
                          {remaining.toLocaleString("id-ID")}
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ${
                              remaining <= 0
                                ? "bg-rose-50 text-rose-600"
                                : percentage >= 80
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {remaining <= 0
                              ? "Sold Out"
                              : percentage >= 80
                              ? "Hampir Habis"
                              : "Tersedia"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Progres Penjualan Tiket
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {ticketStats.sold} dari {ticketStats.quota} tiket terjual.
                </p>
              </div>

              <span className="text-xl font-bold text-[#112250]">
                {ticketStats.percentage}%
              </span>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#112250] transition-all"
                style={{
                  width: `${ticketStats.percentage}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* SEAT MANAGEMENT */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                <LayoutGrid size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Denah Kursi Event
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Ringkasan section dan konfigurasi kursi.
                </p>
              </div>
            </div>

            <Link
              href={`/organizer/events/${event.id}/denah-kursi`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#112250]/20 bg-[#112250]/5 px-4 py-3 text-sm font-bold text-[#112250] hover:bg-[#112250]/10"
            >
              <Armchair size={17} />
              Kelola Denah Kursi
              <ChevronRight size={16} />
            </Link>

          </div>

          {seatError ? (
            <ErrorPanel
              message={seatError}
              onRetry={fetchSeats}
            />
          ) : sections.length === 0 ? (
            <EmptyPanel
              icon={Armchair}
              title="Denah Kursi Belum Dibuat"
              description="Buat section dan tambahkan konfigurasi kursi untuk event ini."
            />
          ) : (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-4">

                <MiniStat
                  label="Total Section"
                  value={seatStats.sections}
                />

                <MiniStat
                  label="Total Kursi"
                  value={seatStats.total}
                />

                <MiniStat
                  label="Tersedia"
                  value={seatStats.available}
                />

                <MiniStat
                  label="Terpesan / Terjual"
                  value={seatStats.reserved + seatStats.sold}
                />

              </div>

              <div className="mt-6 space-y-4">

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
                      seat.status === "Sold" ||
                      seat.status === "Booked"
                  ).length;

                  return (
                    <div
                      key={section.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                            <Layers3 size={20} />
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-800">
                              {section.section_name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              {section.section_code} · {section.seat_mode}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Kategori: {section.category_name}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-[#112250]">
                            {formatRupiah(section.price)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {seats.length} kursi
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3">

                        <SeatCount
                          label="Tersedia"
                          value={available}
                          color="text-emerald-700 bg-emerald-50"
                        />

                        <SeatCount
                          label="Reserved"
                          value={reserved}
                          color="text-amber-700 bg-amber-50"
                        />

                        <SeatCount
                          label="Terjual"
                          value={sold}
                          color="text-slate-700 bg-slate-100"
                        />

                      </div>
                    </div>
                  );
                })}

              </div>
            </>
          )}

        </section>

        {/* SALE PERIOD */}

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                <Wallet size={21} />
              </div>

              <div>
                <h2 className="font-bold text-[#0F172A]">
                  Periode Penjualan
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Jadwal penjualan tiket event.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">

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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                <Building2 size={21} />
              </div>

              <div>
                <h2 className="font-bold text-[#0F172A]">
                  Informasi Venue
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tempat penyelenggaraan event.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">

              <h3 className="text-lg font-bold text-slate-900">
                {event.venue_name || "-"}
              </h3>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} />
                {event.city || "Lokasi tidak tersedia"}
              </p>

              <p className="mt-4 text-xs text-slate-400">
                Data venue diambil dari informasi event backend.
              </p>

            </div>
          </div>

        </section>

        {/* ESTIMATED SALES */}

        <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">

          <div className="flex items-start gap-3">
            <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[#112250]" />

            <div>
              <h3 className="text-sm font-bold text-[#112250]">
                Estimasi Nilai Tiket Terjual
              </h3>

              <p className="mt-1 text-2xl font-bold text-[#112250]">
                {formatRupiah(ticketStats.estimatedValue)}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Dihitung dari harga kategori tiket dikalikan jumlah
                tiket yang terjual berdasarkan kuota dan sisa tiket.
                Angka ini bukan laporan pendapatan transaksi aktual
                atau pembayaran yang sudah berhasil.
              </p>
            </div>
          </div>

        </section>

        {/* FOOTER */}

        <div className="flex justify-start pb-5">
          <Link
            href="/organizer/event"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Kembali ke Daftar Event
          </Link>
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function InfoItem({ icon: Icon, label, value, subValue }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#112250] shadow-sm">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-slate-800">
          {value || "-"}
        </p>

        {subValue && (
          <p className="mt-1 text-xs text-slate-500">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-2 text-xl font-bold text-[#112250]">
        {Number(value).toLocaleString("id-ID")}
      </p>
    </div>
  );
}

function SeatCount({ label, value, color }) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <p className="text-xs">{label}</p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}

function SaleDate({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-800">
          {formatDateTime(value)}
        </p>
      </div>

      <CalendarDays className="h-5 w-5 shrink-0 text-[#112250]" />
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, description }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-slate-300" />

      <h3 className="mt-3 text-sm font-bold text-slate-700">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />

        <div>
          <p className="text-sm font-bold text-rose-800">
            Gagal memuat data
          </p>

          <p className="mt-1 text-xs text-rose-600">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
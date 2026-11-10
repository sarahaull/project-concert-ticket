
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Tag,
  Ticket,
  Users,
  Wallet,
  Image as ImageIcon,
  Pencil,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  LayoutGrid,
  CalendarCheck,
  Building2,
  Music2,
  Info,
  Armchair,
} from "lucide-react";

/* =========================================================
   API CONFIG
========================================================= */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Permintaan gagal (${response.status})`
    );
  }

  if (data.success === false) {
    throw new Error(data.message || "Gagal mengambil data dari server.");
  }

  return data;
}

/* =========================================================
   HELPERS
========================================================= */

function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

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

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function formatDateTime(value) {
  if (!value) return "-";

  const normalized = String(value).replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getStatusStyle(status) {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("active") ||
    value.includes("aktif") ||
    value.includes("publish") ||
    value.includes("berlangsung")
  ) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
  }

  if (
    value.includes("cancel") ||
    value.includes("batal") ||
    value.includes("reject")
  ) {
    return "bg-red-50 text-red-700 ring-red-600/10";
  }

  if (value.includes("complete") || value.includes("selesai")) {
    return "bg-blue-50 text-blue-700 ring-blue-600/10";
  }

  return "bg-amber-50 text-amber-700 ring-amber-600/10";
}

function getSeatStatusStyle(status) {
  const value = String(status || "").toLowerCase();

  if (value === "available") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (value === "reserved") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (value === "sold") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getSeatStatusLabel(status) {
  const value = String(status || "").toLowerCase();

  if (value === "available") return "Tersedia";
  if (value === "reserved") return "Dipesan";
  if (value === "sold") return "Terjual";

  return status || "Tidak diketahui";
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function SectionTitle({ icon: Icon, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-800">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800 sm:text-2xl">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SEAT SECTION CARD
========================================================= */

function SeatSectionCard({ section }) {
  const seats = Array.isArray(section.seats) ? section.seats : [];

  const available = seats.filter(
    (seat) => String(seat.status).toLowerCase() === "available"
  ).length;

  const reserved = seats.filter(
    (seat) => String(seat.status).toLowerCase() === "reserved"
  ).length;

  const sold = seats.filter(
    (seat) => String(seat.status).toLowerCase() === "sold"
  ).length;

  const rows = useMemo(() => {
    const grouped = new Map();

    seats.forEach((seat) => {
      const row = String(seat.row_label || "-");

      if (!grouped.has(row)) {
        grouped.set(row, []);
      }

      grouped.get(row).push(seat);
    });

    return Array.from(grouped.entries())
      .map(([row, rowSeats]) => ({
        row,
        seats: [...rowSeats].sort((a, b) => {
          return String(a.seat_number).localeCompare(
            String(b.seat_number),
            undefined,
            { numeric: true }
          );
        }),
      }))
      .sort((a, b) =>
        a.row.localeCompare(b.row, undefined, { numeric: true })
      );
  }, [seats]);

  const numbered = String(section.seat_mode).toUpperCase() === "NUMBERED";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              {section.section_name}
            </h3>

            <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
              {section.section_code}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Kategori: {section.category_name || "-"}
          </p>

          <p className="mt-2 text-sm font-bold text-blue-700">
            {formatRupiah(section.price)}
          </p>
        </div>

        <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
          {numbered ? "Nomor Kursi" : "General Admission"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-[10px] font-medium text-emerald-700 sm:text-xs">
            Tersedia
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {available}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-[10px] font-medium text-amber-700 sm:text-xs">
            Dipesan
          </p>
          <p className="mt-1 text-xl font-bold text-amber-700">
            {reserved}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-[10px] font-medium text-blue-700 sm:text-xs">
            Terjual
          </p>
          <p className="mt-1 text-xl font-bold text-blue-700">
            {sold}
          </p>
        </div>
      </div>

      {seats.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
          <Armchair size={25} className="mx-auto text-slate-300" />
          <p className="mt-2 text-xs font-medium text-slate-500">
            Belum ada kursi pada section ini.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-700">
              Visualisasi Kursi
            </p>

            <p className="text-[11px] text-slate-400">
              {seats.length} kursi
            </p>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              Tersedia
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              Dipesan
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              Terjual
            </span>
          </div>

          {numbered ? (
            <div className="space-y-4">
              {rows.map((row) => (
                <div
                  key={row.row}
                  className="flex flex-wrap items-center gap-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {row.row}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {row.seats.map((seat) => (
                      <div
                        key={seat.id}
                        title={`Baris ${seat.row_label}, Kursi ${seat.seat_number} - ${getSeatStatusLabel(seat.status)}`}
                        className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-[10px] font-bold ${getSeatStatusStyle(seat.status)}`}
                      >
                        {seat.seat_number}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-800">
                    {seats.length}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Total kuota kursi
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-700">
                    {available}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tersedia
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-700">
                    {sold}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Terjual
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function DetailEventPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [seatSections, setSeatSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seatLoading, setSeatLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [seatError, setSeatError] = useState("");

  /* =======================================================
     LOAD EVENT
  ======================================================= */

  const fetchEvent = useCallback(async () => {
    const response = await apiRequest(`/api/events/${eventId}`);

    const eventData =
      response.event ||
      response.data ||
      response;

    if (!eventData || !eventData.id) {
      throw new Error("Data event tidak ditemukan.");
    }

    setEvent(eventData);
  }, [eventId]);

  /* =======================================================
     LOAD TICKET CATEGORIES
  ======================================================= */

  const fetchTicketCategories = useCallback(async () => {
    try {
      setTicketError("");

      const response = await apiRequest(
        `/api/ticket-categories/event/${eventId}`
      );

      const categories = extractArray(response, [
        "ticket_categories",
        "ticketCategories",
        "categories",
      ]);

      setTicketCategories(categories);
    } catch (err) {
      console.error("TICKET CATEGORY ERROR:", err);
      setTicketCategories([]);
      setTicketError(err.message || "Gagal mengambil kategori tiket.");
    }
  }, [eventId]);

  /* =======================================================
     LOAD SEAT MAP
  ======================================================= */

  const fetchSeatMap = useCallback(async () => {
    try {
      setSeatLoading(true);
      setSeatError("");

      const response = await apiRequest(
        `/api/seats/events/${eventId}`
      );

      setSeatSections(
        Array.isArray(response.sections)
          ? response.sections
          : []
      );
    } catch (err) {
      console.error("SEAT MAP ERROR:", err);
      setSeatSections([]);
      setSeatError(err.message || "Gagal mengambil denah kursi.");
    } finally {
      setSeatLoading(false);
    }
  }, [eventId]);

  /* =======================================================
     LOAD ALL DATA
  ======================================================= */

  const fetchData = useCallback(async (showRefresh = false) => {
    if (!eventId) return;

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      await fetchEvent();

      await Promise.all([
        fetchTicketCategories(),
        fetchSeatMap(),
      ]);
    } catch (err) {
      console.error("DETAIL EVENT ERROR:", err);
      setError(err.message || "Gagal mengambil detail event.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    eventId,
    fetchEvent,
    fetchTicketCategories,
    fetchSeatMap,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =======================================================
     TICKET STATISTICS
  ======================================================= */

  const ticketStats = useMemo(() => {
    const totalQuota = ticketCategories.reduce(
      (total, ticket) => total + Number(ticket.quota || 0),
      0
    );

    const remaining = ticketCategories.reduce(
      (total, ticket) =>
        total + Number(ticket.remaining_ticket ?? ticket.quota ?? 0),
      0
    );

    const sold = Math.max(0, totalQuota - remaining);

    const totalTypes = ticketCategories.length;

    const lowestPrice =
      totalTypes > 0
        ? Math.min(
            ...ticketCategories.map((ticket) =>
              Number(ticket.price || 0)
            )
          )
        : 0;

    return {
      totalQuota,
      remaining,
      sold,
      totalTypes,
      lowestPrice,
    };
  }, [ticketCategories]);

  const seatStats = useMemo(() => {
    const allSeats = seatSections.flatMap((section) =>
      Array.isArray(section.seats) ? section.seats : []
    );

    return {
      total: allSeats.length,
      available: allSeats.filter(
        (seat) => String(seat.status).toLowerCase() === "available"
      ).length,
      reserved: allSeats.filter(
        (seat) => String(seat.status).toLowerCase() === "reserved"
      ).length,
      sold: allSeats.filter(
        (seat) => String(seat.status).toLowerCase() === "sold"
      ).length,
    };
  }, [seatSections]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-blue-600"
          />
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Memuat detail event...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Menghubungkan ke server TicketVerse
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={27} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Detail event gagal dimuat
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => fetchData()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Coba Lagi
            </button>

            <Link
              href="/organizer/event"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  /* =======================================================
     EVENT DATA
  ======================================================= */

  const posterUrl = getAssetUrl(event.poster);
  const seatMapUrl = getAssetUrl(event.seat_map_image);

  const eventName = event.event_name || "Tanpa nama event";
  const venueName = event.venue_name || "Venue belum tersedia";

  const venueLocation = [venueName, event.city]
    .filter(Boolean)
    .join(", ");

  const eventDate = formatDate(event.event_date);
  const eventTime = formatTime(event.event_time);
  const status = event.status || "Coming Soon";

  const editUrl = `/organizer/event/edit/${event.id}`;
  const ticketUrl = `/organizer/event/${event.id}/tiket`;
  const seatMapUrlPage = `/organizer/event/${event.id}/denah-kursi`;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/organizer/event"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              <ArrowLeft size={17} />
              Kembali ke daftar event
            </Link>

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh data
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                  Event Management
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs text-slate-400">
                  Detail Event
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Detail Event
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Informasi lengkap dan pengaturan event yang kamu kelola.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={ticketUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                <Ticket size={16} />
                Kelola Tiket
              </Link>

              <Link
                href={seatMapUrlPage}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                <LayoutGrid size={16} />
                Kelola Denah
              </Link>

              <Link
                href={editUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit Event
              </Link>
            </div>
          </div>
        </div>

        {/* TICKET / SEAT WARNINGS */}
        {ticketError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>Kategori tiket: {ticketError}</p>
          </div>
        )}

        {seatError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>Denah kursi: {seatError}</p>
          </div>
        )}

        {/* EVENT HERO */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[340px_1fr]">

            {/* POSTER */}
            <div className="relative min-h-[250px] bg-slate-100 lg:min-h-[320px]">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={`Poster ${eventName}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={42} strokeWidth={1.3} />
                  <p className="mt-3 text-sm font-medium">
                    Poster belum tersedia
                  </p>
                </div>
              )}

              <div className="absolute left-4 top-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${getStatusStyle(status)}`}
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
                  {status}
                </span>
              </div>
            </div>

            {/* EVENT SUMMARY */}
            <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {event.category_name && (
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    {event.category_name}
                  </span>
                )}

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Event ID: #{event.id}
                </span>
              </div>

              <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                {eventName}
              </h2>

              <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-500">
                {event.description || "Belum ada deskripsi untuk event ini."}
              </p>

              <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Tanggal Event"
                  value={eventDate}
                />

                <InfoItem
                  icon={Clock3}
                  label="Waktu Event"
                  value={`${eventTime} WIB`}
                />

                <InfoItem
                  icon={MapPin}
                  label="Lokasi"
                  value={venueLocation}
                />

                <InfoItem
                  icon={Music2}
                  label="Artist"
                  value={event.artist_name || "-"}
                />
              </div>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Ticket}
            label="Kategori Tiket"
            value={ticketStats.totalTypes}
            description="Jenis tiket yang dibuat"
          />

          <StatCard
            icon={Users}
            label="Total Kuota Tiket"
            value={ticketStats.totalQuota.toLocaleString("id-ID")}
            description="Total kapasitas kategori tiket"
          />

          <StatCard
            icon={CheckCircle2}
            label="Tiket Terjual"
            value={ticketStats.sold.toLocaleString("id-ID")}
            description="Perkiraan dari kuota dan sisa tiket"
          />

          <StatCard
            icon={Wallet}
            label="Harga Mulai"
            value={formatRupiah(ticketStats.lowestPrice)}
            description="Harga kategori termurah"
          />
        </section>

        {/* CONTENT GRID */}
        <div className="grid items-start gap-6 xl:grid-cols-[1.25fr_0.75fr]">

          {/* LEFT */}
          <div className="space-y-6">

            {/* EVENT INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={Info}
                title="Informasi Event"
                description="Rincian informasi utama event."
              />

              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <InfoItem
                  icon={Tag}
                  label="Nama Event"
                  value={event.event_name}
                />

                <InfoItem
                  icon={LayoutGrid}
                  label="Kategori Event"
                  value={event.category_name}
                />

                <InfoItem
                  icon={Music2}
                  label="Artist / Pengisi Acara"
                  value={event.artist_name}
                />

                <InfoItem
                  icon={Building2}
                  label="Venue"
                  value={venueName}
                />

                <InfoItem
                  icon={CalendarCheck}
                  label="Tanggal Pelaksanaan"
                  value={eventDate}
                />

                <InfoItem
                  icon={Clock3}
                  label="Jam Pelaksanaan"
                  value={`${eventTime} WIB`}
                />
              </div>
            </section>

            {/* TICKET CATEGORIES */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={Ticket}
                title="Kategori Tiket"
                description="Daftar kategori tiket yang terhubung dengan event ini."
                action={
                  <Link
                    href={ticketUrl}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-blue-700 transition hover:text-blue-800"
                  >
                    Kelola tiket
                    <ExternalLink size={13} />
                  </Link>
                }
              />

              {ticketCategories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <Ticket size={30} className="mx-auto text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Belum ada kategori tiket
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Tambahkan kategori tiket untuk event ini.
                  </p>

                  <Link
                    href={ticketUrl}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Ticket size={14} />
                    Atur Kategori Tiket
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketCategories.map((ticket) => {
                    const quota = Number(ticket.quota || 0);
                    const remaining = Number(
                      ticket.remaining_ticket ?? quota
                    );

                    const sold = Math.max(0, quota - remaining);

                    const percentage =
                      quota > 0
                        ? Math.min(100, (sold / quota) * 100)
                        : 0;

                    return (
                      <div
                        key={ticket.id}
                        className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-slate-50/60"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800">
                              {ticket.category_name || "Kategori Tiket"}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-blue-700">
                              {formatRupiah(ticket.price)}
                            </p>
                          </div>

                          <span className="w-fit rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            ID Tiket #{ticket.id}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              Penjualan tiket
                            </span>

                            <span className="font-semibold text-slate-700">
                              {sold.toLocaleString("id-ID")} / {quota.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
                            <span>
                              Terjual: {sold.toLocaleString("id-ID")}
                            </span>

                            <span>
                              Tersedia: {remaining.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SEAT MAP */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={LayoutGrid}
                title="Denah Kursi"
                description="Section dan kursi yang tersimpan pada event ini."
                action={
                  <Link
                    href={seatMapUrlPage}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-blue-700 transition hover:text-blue-800"
                  >
                    Kelola denah
                    <ExternalLink size={13} />
                  </Link>
                }
              />

              {seatLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 py-10 text-sm text-slate-500">
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                  Memuat data denah kursi...
                </div>
              ) : seatError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
                  <AlertCircle
                    size={28}
                    className="mx-auto text-amber-600"
                  />
                  <p className="mt-3 text-sm font-semibold text-amber-800">
                    Denah kursi gagal dimuat
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {seatError}
                  </p>
                  <button
                    type="button"
                    onClick={fetchSeatMap}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    <RefreshCw size={13} />
                    Coba Lagi
                  </button>
                </div>
              ) : seatSections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center">
                  <LayoutGrid
                    size={32}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Denah kursi belum tersedia
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Belum ada section atau kursi yang dibuat untuk event ini.
                  </p>

                  <Link
                    href={seatMapUrlPage}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <LayoutGrid size={14} />
                    Buat Denah Kursi
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* TOTAL SEAT STATISTICS */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] text-slate-500">
                        Total Kursi
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {seatStats.total}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-[10px] text-emerald-700">
                        Tersedia
                      </p>
                      <p className="mt-1 text-xl font-bold text-emerald-700">
                        {seatStats.available}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-[10px] text-amber-700">
                        Dipesan
                      </p>
                      <p className="mt-1 text-xl font-bold text-amber-700">
                        {seatStats.reserved}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-[10px] text-blue-700">
                        Terjual
                      </p>
                      <p className="mt-1 text-xl font-bold text-blue-700">
                        {seatStats.sold}
                      </p>
                    </div>
                  </div>

                  {seatSections.map((section) => (
                    <SeatSectionCard
                      key={section.id}
                      section={section}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* SEAT MAP IMAGE */}
            {seatMapUrl && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionTitle
                  icon={ImageIcon}
                  title="Gambar Denah"
                  description="Gambar denah yang tersimpan pada event."
                />

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={seatMapUrl}
                    alt={`Denah kursi ${eventName}`}
                    className="max-h-[500px] w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="border-t border-slate-200 bg-white px-4 py-3">
                    <a
                      href={seatMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      <ExternalLink size={14} />
                      Lihat denah ukuran penuh
                    </a>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT */}
          <aside className="space-y-6">

            {/* TICKET SALE PERIOD */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={CalendarCheck}
                title="Periode Penjualan"
                description="Jadwal pembukaan dan penutupan tiket."
              />

              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    Penjualan Dibuka
                  </p>
                  <p className="mt-2 text-sm font-bold text-emerald-900">
                    {formatDateTime(event.ticket_sale_start)}
                  </p>
                </div>

                <div className="rounded-xl bg-rose-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">
                    Penjualan Ditutup
                  </p>
                  <p className="mt-2 text-sm font-bold text-rose-900">
                    {formatDateTime(event.ticket_sale_end)}
                  </p>
                </div>
              </div>
            </section>

            {/* VENUE */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={MapPin}
                title="Lokasi Event"
                description="Informasi tempat pelaksanaan."
              />

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Building2 size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      {venueName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {event.city || "Kota belum tersedia"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={ExternalLink}
                title="Aksi Event"
                description="Lanjutkan pengelolaan event."
              />

              <div className="space-y-2.5">
                <Link
                  href={editUrl}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <span className="flex items-center gap-3">
                    <Pencil size={17} className="text-blue-700" />
                    <span className="text-sm font-semibold text-slate-700">
                      Edit informasi event
                    </span>
                  </span>
                  <ExternalLink size={15} className="text-slate-400" />
                </Link>

                <Link
                  href={ticketUrl}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <span className="flex items-center gap-3">
                    <Ticket size={17} className="text-blue-700" />
                    <span className="text-sm font-semibold text-slate-700">
                      Kelola kategori tiket
                    </span>
                  </span>
                  <ExternalLink size={15} className="text-slate-400" />
                </Link>

                <Link
                  href={seatMapUrlPage}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <span className="flex items-center gap-3">
                    <LayoutGrid size={17} className="text-blue-700" />
                    <span className="text-sm font-semibold text-slate-700">
                      Kelola denah kursi
                    </span>
                  </span>
                  <ExternalLink size={15} className="text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => router.push("/organizer/events")}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <ArrowLeft size={17} className="text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      Kembali ke daftar event
                    </span>
                  </span>
                  <ExternalLink size={15} className="text-slate-400" />
                </button>
              </div>
            </section>

            {/* FOOTER INFO */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <Info
                size={17}
                className="mt-0.5 shrink-0 text-blue-700"
              />
              <p className="text-xs leading-5 text-blue-800">
                Informasi pada halaman ini ditampilkan berdasarkan data yang
                tersimpan di server TicketVerse. Gunakan tombol refresh untuk
                mengambil data terbaru.
              </p>
            </div>
          </aside>
        </div>

        {/* BOTTOM */}
        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
          <p>TicketVerse · Organizer Event Management</p>
          <p>Detail Event #{event.id}</p>
        </div>
      </div>
    </main>
  );
}

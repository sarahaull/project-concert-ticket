
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TicketIcon,
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  ChartPieIcon,
  MusicalNoteIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? API_URL
  : `${API_URL}/api`;

const formatRupiah = (value) => {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("id-ID");
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized === "aktif" ||
    normalized === "available" ||
    normalized === "approved" ||
    normalized === "published"
  ) {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }

  if (normalized === "selesai" || normalized === "completed") {
    return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  }

  if (
    normalized === "draft" ||
    normalized === "draf" ||
    normalized === "pending"
  ) {
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }

  if (
    normalized === "rejected" ||
    normalized === "ditolak" ||
    normalized === "cancelled" ||
    normalized === "batal"
  ) {
    return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  }

  return "bg-gray-500/10 text-gray-600 border-gray-500/20";
};

const getDisplayStatus = (status) => {
  if (!status) return "Tidak diketahui";

  const normalized = String(status).toLowerCase();

  const labels = {
    active: "Aktif",
    available: "Aktif",
    approved: "Disetujui",
    published: "Dipublikasikan",
    draft: "Draf",
    pending: "Menunggu",
    rejected: "Ditolak",
    cancelled: "Dibatalkan",
    completed: "Selesai",
  };

  return labels[normalized] || status;
};

export default function DetailEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return "";

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      ""
    );
  };

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchEventDetail = async () => {
      setLoading(true);
      setError("");

      try {
        const token = getToken();

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const [eventResponse, categoryResponse] = await Promise.all([
          fetch(`${API_BASE}/events/${id}`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),
          fetch(`${API_BASE}/ticket-categories/event/${id}`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),
        ]);

        const eventResult = await eventResponse.json().catch(() => ({}));
        const categoryResult = await categoryResponse.json().catch(() => ({}));

        if (!eventResponse.ok || eventResult.success === false) {
          throw new Error(
            eventResult.message || "Gagal mengambil detail event."
          );
        }

        if (!eventResult.event) {
          throw new Error("Data event tidak ditemukan.");
        }

        if (!categoryResponse.ok || categoryResult.success === false) {
          throw new Error(
            categoryResult.message || "Gagal mengambil kategori tiket."
          );
        }

        if (!isMounted) return;

        setEvent(eventResult.event);

        setTicketCategories(
          Array.isArray(categoryResult.ticket_categories)
            ? categoryResult.ticket_categories
            : []
        );
      } catch (err) {
        console.error("Fetch event detail error:", err);

        if (isMounted) {
          setError(
            err.message ||
              "Terjadi kesalahan saat mengambil data dari server."
          );
          setEvent(null);
          setTicketCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEventDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const salesSummary = useMemo(() => {
    const totalCapacity = ticketCategories.reduce(
      (total, item) => total + Number(item.quota || 0),
      0
    );

    const remainingTickets = ticketCategories.reduce(
      (total, item) => total + Number(item.remaining_ticket || 0),
      0
    );

    const soldTickets = ticketCategories.reduce((total, item) => {
      const quota = Number(item.quota || 0);
      const remaining = Number(item.remaining_ticket || 0);

      return total + Math.max(0, quota - remaining);
    }, 0);

    const totalRevenue = ticketCategories.reduce((total, item) => {
      const quota = Number(item.quota || 0);
      const remaining = Number(item.remaining_ticket || 0);
      const sold = Math.max(0, quota - remaining);
      const price = Number(item.price || 0);

      return total + sold * price;
    }, 0);

    const soldPercentage =
      totalCapacity > 0
        ? Math.min(100, Math.round((soldTickets / totalCapacity) * 100))
        : 0;

    const lowestPrice =
      ticketCategories.length > 0
        ? Math.min(
            ...ticketCategories.map((item) => Number(item.price || 0))
          )
        : 0;

    return {
      totalCapacity,
      remainingTickets,
      soldTickets,
      totalRevenue,
      soldPercentage,
      lowestPrice,
    };
  }, [ticketCategories]);

  const getCategoryPercentage = (item) => {
    const quota = Number(item.quota || 0);
    const remaining = Number(item.remaining_ticket || 0);
    const sold = Math.max(0, quota - remaining);

    return quota > 0 ? Math.min(100, (sold / quota) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-64 w-full flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e0e8f0] border-t-[#8ab4f8]" />
        <p className="text-sm font-semibold text-[#7e91b2]">
          Memuat detail event...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-64 w-full flex-col items-center justify-center space-y-4 px-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-rose-400" />

        <p className="text-lg font-bold text-[#0a1628]">
          Gagal Memuat Detail Event
        </p>

        <p className="max-w-lg text-center text-sm text-slate-500">
          {error || "Event yang kamu cari tidak ditemukan."}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => router.refresh()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Coba Lagi
          </button>

          <button
            onClick={() => router.push("/superadmin/events")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Kembali ke Daftar Event
          </button>
        </div>
      </div>
    );
  }

  const eventName = event.event_name || event.name || "Tanpa Nama Event";
  const eventStatus = event.status || event.approval_status || "-";
  const eventDate = event.event_date || event.date;
  const eventTime = event.event_time || event.time;

  const venueName = event.venue_name || event.location || "-";
  const city = event.city || "";
  const fullLocation = city
    ? `${venueName}, ${city}`
    : venueName;

  const categoryName = event.category_name || event.category || "-";
  const artistName = event.artist_name || "-";

  const eventDescription = event.description || "";
  const poster = event.poster || "";

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <section className="relative w-full overflow-hidden rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />

        <div className="absolute -right-16 -top-16 h-64 w-64 animate-pulse rounded-full bg-[#5a8ad0]/15 blur-3xl" />

        <div className="absolute -bottom-20 left-20 h-48 w-48 animate-pulse rounded-full bg-[#8ab4f8]/10 blur-3xl delay-75" />

        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Link
              href="/superadmin/events"
              className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa0c0] transition-colors hover:text-white"
            >
              <ArrowLeftIcon className="h-3 w-3" />
              Kembali ke Daftar Event
            </Link>

            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-bold tracking-[-0.03em] text-white sm:text-[32px]">
                {eventName}
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusBadge(
                  eventStatus
                )}`}
              >
                {getDisplayStatus(eventStatus)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#8aa0c0]">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(eventDate)}
              </span>

              {eventTime && (
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  {String(eventTime).slice(0, 5)}
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" />
                {fullLocation}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              router.push(`/superadmin/events/edit/${event.id}`)
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 sm:self-auto"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit Event
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] backdrop-blur-sm">
            <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#0a1628]">
              <span className="h-4 w-1 rounded-full bg-[#8ab4f8]" />
              Informasi Event
            </h2>

            {poster && (
              <div className="mb-6 overflow-hidden rounded-xl border border-[#e0e8f0] bg-[#f8fafc]">
                <img
                  src={poster}
                  alt={eventName}
                  className="max-h-[420px] w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                label="Kategori Event"
                value={categoryName}
                icon={<ChartPieIcon className="h-4 w-4" />}
              />

              <InfoCard
                label="Artis / Pengisi Acara"
                value={artistName}
                icon={<MusicalNoteIcon className="h-4 w-4" />}
              />

              <InfoCard
                label="Harga Tiket Mulai"
                value={
                  ticketCategories.length > 0
                    ? formatRupiah(salesSummary.lowestPrice)
                    : "Belum tersedia"
                }
                icon={<CurrencyDollarIcon className="h-4 w-4" />}
              />

              <InfoCard
                label="Kapasitas Total"
                value={`${formatNumber(salesSummary.totalCapacity)} Orang`}
                icon={<UserGroupIcon className="h-4 w-4" />}
              />

              <div className="rounded-xl border border-[#e0e8f0] bg-[#f8fafc] p-4 sm:col-span-2">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#7e91b2]">
                  Lokasi Event
                </p>

                <div className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5a7aad]" />

                  <div>
                    <p className="text-sm font-bold text-[#0a1628]">
                      {venueName}
                    </p>

                    {city && (
                      <p className="mt-1 text-xs text-slate-500">
                        {city}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {event.ticket_sale_start && (
                <InfoCard
                  label="Penjualan Dimulai"
                  value={formatDate(event.ticket_sale_start)}
                  icon={<CalendarIcon className="h-4 w-4" />}
                />
              )}

              {event.ticket_sale_end && (
                <InfoCard
                  label="Penjualan Berakhir"
                  value={formatDate(event.ticket_sale_end)}
                  icon={<CalendarIcon className="h-4 w-4" />}
                />
              )}
            </div>

            {eventDescription && (
              <div className="mt-4 rounded-xl border border-[#e0e8f0] bg-[#f8fafc] p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#7e91b2]">
                  Deskripsi Event
                </p>

                <p className="whitespace-pre-line text-sm leading-relaxed text-[#0a1628]">
                  {eventDescription}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] backdrop-blur-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0a1628]">
                <span className="h-4 w-1 rounded-full bg-[#4a6b9a]" />
                Status Penjualan Tiket
              </h2>

              <span className="rounded-lg border border-[#d0d8e4] bg-[#f0f5fc] px-3 py-1 text-xs font-bold text-[#0a1628]">
                {salesSummary.soldPercentage}% Terjual
              </span>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs font-semibold text-[#7e91b2]">
                <span>
                  {formatNumber(salesSummary.soldTickets)} Terjual
                </span>

                <span>
                  {formatNumber(salesSummary.totalCapacity)} Kapasitas
                </span>
              </div>

              <div className="h-4 w-full overflow-hidden rounded-full bg-[#e0e8f0] shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8ab4f8] to-[#4a6b9a] transition-all duration-1000 ease-out"
                  style={{
                    width: `${salesSummary.soldPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Tiket Terjual"
                value={salesSummary.soldTickets}
                icon={<TicketIcon className="h-5 w-5" />}
                color="emerald"
              />

              <StatCard
                label="Sisa Tiket"
                value={salesSummary.remainingTickets}
                icon={<UserGroupIcon className="h-5 w-5" />}
                color="amber"
              />
            </div>

            {ticketCategories.length === 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                <InformationCircleIcon className="mx-auto mb-2 h-7 w-7 text-slate-400" />

                <p className="text-sm font-semibold text-slate-600">
                  Belum ada kategori tiket untuk event ini.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 shadow-lg">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />

            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-sm">
                <ArrowTrendingUpIcon className="h-6 w-6 text-[#8ab4f8]" />
              </div>

              <h3 className="mb-1 text-sm font-bold text-white">
                Estimasi Pendapatan
              </h3>

              <p className="mb-4 text-[10px] text-[#8aa0c0]">
                Berdasarkan tiket terjual dan harga kategori
              </p>

              <p className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {formatRupiah(salesSummary.totalRevenue)}
              </p>

              <p className="mt-3 text-[10px] leading-relaxed text-[#8aa0c0]">
                Perhitungan estimasi berdasarkan kuota dikurangi sisa tiket,
                dikalikan harga masing-masing kategori.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-[#0a1628]">
              <ChartPieIcon className="h-4 w-4 text-[#4a6b9a]" />
              Rincian Kategori Tiket
            </h3>

            {ticketCategories.length > 0 ? (
              <div className="space-y-5">
                {ticketCategories.map((item) => {
                  const quota = Number(item.quota || 0);
                  const remaining = Number(item.remaining_ticket || 0);
                  const sold = Math.max(0, quota - remaining);
                  const percentage = getCategoryPercentage(item);

                  return (
                    <div key={item.id}>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#0a1628]">
                            {item.category_name || "Kategori Tiket"}
                          </p>

                          <p className="mt-1 text-[10px] text-[#7e91b2]">
                            {formatRupiah(item.price)}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold text-[#0a1628]">
                            {formatNumber(sold)} / {formatNumber(quota)}
                          </p>

                          <p className="text-[10px] text-[#7e91b2]">
                            {Math.round(percentage)}% terjual
                          </p>
                        </div>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e0e8f0]">
                        <div
                          className="h-full rounded-full bg-[#8ab4f8] transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <p className="mt-1.5 text-right text-[10px] text-[#7e91b2]">
                        Sisa {formatNumber(remaining)} tiket
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <TicketIcon className="mx-auto mb-2 h-8 w-8 text-slate-300" />

                <p className="text-xs font-medium text-slate-400">
                  Belum ada data kategori tiket.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0a1628]">
              <InformationCircleIcon className="h-4 w-4 text-[#4a6b9a]" />
              Informasi Tambahan
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-[#7e91b2]">ID Event</span>
                <span className="break-all text-right font-bold text-[#0a1628]">
                  {event.id}
                </span>
              </div>

              {event.created_at && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#7e91b2]">Dibuat</span>
                  <span className="text-right font-bold text-[#0a1628]">
                    {formatDate(event.created_at)}
                  </span>
                </div>
              )}

              {event.organizer_name && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#7e91b2]">Organizer</span>
                  <span className="text-right font-bold text-[#0a1628]">
                    {event.organizer_name}
                  </span>
                </div>
              )}

              {event.approval_status && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#7e91b2]">Status Approval</span>
                  <span className="text-right font-bold text-[#0a1628]">
                    {event.approval_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeInUp 0.6s ease both;
        }

        .delay-75 {
          animation-delay: 0.75s;
        }

        .fade-in {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-[#e0e8f0] bg-[#f8fafc] p-4">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7e91b2]">
        {icon}
        {label}
      </p>

      <p className="break-words text-sm font-bold text-[#0a1628]">
        {value || "-"}
      </p>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e0e8f0] bg-[#f8fafc] p-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          colorClasses[color] || "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-[#7e91b2]">
          {label}
        </p>

        <p className="text-sm font-bold text-[#0a1628]">
          {formatNumber(value)}
        </p>
      </div>
    </div>
  );
}

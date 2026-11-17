"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  CalendarDays,
  Ticket,
  WalletCards,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  MapPin,
  Clock3,
  MoreHorizontal,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const PERIODS = [
  { label: "7 Hari Terakhir", days: 7 },
  { label: "30 Hari Terakhir", days: 30 },
  { label: "3 Bulan Terakhir", days: 90 },
  { label: "1 Tahun", days: 365 },
];

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getToken = () => {
  if (typeof window === "undefined") return null;
  const possibleKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "auth_token",
    "userToken",
    "jwt",
  ];
  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (value && value !== "undefined" && value !== "null") {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "string") return parsed;
        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
      } catch {
        return value;
      }
    }
  }
  const possibleUserKeys = ["user", "currentUser", "auth", "login"];
  for (const key of possibleUserKeys) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;
      const parsed = JSON.parse(value);
      if (parsed?.token) return parsed.token;
      if (parsed?.accessToken) return parsed.accessToken;
      if (parsed?.data?.token) return parsed.data.token;
    } catch {
      continue;
    }
  }
  return null;
};

const apiRequest = async (endpoint, token) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("Respons server tidak valid.");
  }
  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Gagal mengambil data (${response.status}).`
    );
  }
  return result;
};

const getStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "paid")
    return {
      label: "Berhasil",
      className: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  if (value === "pending")
    return {
      label: "Menunggu",
      className: "bg-amber-50 text-amber-700",
      icon: Clock3,
    };
  if (
    value.includes("refund") ||
    value === "cancelled" ||
    value === "canceled" ||
    value === "failed" ||
    value === "expire" ||
    value === "expired"
  )
    return {
      label: "Dibatalkan / Refund",
      className: "bg-red-50 text-red-700",
      icon: XCircle,
    };
  return {
    label: status || "Tidak diketahui",
    className: "bg-[#F3F6FA] text-[#526B92]",
    icon: AlertCircle,
  };
};

export default function DashboardOrganizerPage() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    const token = getToken();
    if (!token) {
      setError(
        "Token login tidak ditemukan. Silakan login kembali sebagai Event Organizer."
      );
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [statsResponse, eventsResponse, bookingsResponse] =
        await Promise.all([
          apiRequest("/api/organizer/stats", token),
          apiRequest("/api/organizer/events", token),
          apiRequest("/api/organizer/bookings", token),
        ]);
      setStats(statsResponse.data || {});
      setEvents(
        Array.isArray(eventsResponse.data) ? eventsResponse.data : []
      );
      setBookings(
        Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []
      );
    } catch (err) {
      console.error("DASHBOARD ORGANIZER ERROR:", err);
      setError(err.message || "Gagal mengambil data dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const paidBookings = useMemo(
    () =>
      bookings.filter(
        (item) => String(item.payment_status).toLowerCase() === "paid"
      ),
    [bookings]
  );

  const totalParticipants = useMemo(
    () =>
      paidBookings.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ),
    [paidBookings]
  );

  const totalOrders = useMemo(
    () => new Set(bookings.map((item) => item.order_id)).size,
    [bookings]
  );

  const pendingOrders = useMemo(
    () =>
      bookings.filter(
        (item) => String(item.payment_status).toLowerCase() === "pending"
      ),
    [bookings]
  );

  const refundOrders = useMemo(
    () =>
      bookings.filter((item) => {
        const status = String(item.payment_status).toLowerCase();
        return (
          status.includes("refund") ||
          status === "cancelled" ||
          status === "canceled" ||
          status === "failed" ||
          status === "expired" ||
          status === "expire"
        );
      }),
    [bookings]
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyBookings = paidBookings.filter((item) => {
      const date = new Date(item.order_date);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
    return {
      tickets: monthlyBookings.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ),
      revenue: monthlyBookings.reduce(
        (sum, item) => sum + Number(item.subtotal || 0),
        0
      ),
      orders: new Set(monthlyBookings.map((item) => item.order_id)).size,
    };
  }, [paidBookings]);

  const chartData = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - period + 1);
    start.setHours(0, 0, 0, 0);
    const bucketCount = 8;
    const bucketSize = Math.max(1, Math.ceil(period / bucketCount));
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index * bucketSize);
      return { date, revenue: 0, tickets: 0 };
    });
    paidBookings.forEach((item) => {
      const date = new Date(item.order_date);
      if (Number.isNaN(date.getTime())) return;
      if (date < start || date > now) return;
      const dayDifference = Math.floor(
        (date - start) / (1000 * 60 * 60 * 24)
      );
      const index = Math.min(
        bucketCount - 1,
        Math.floor(dayDifference / bucketSize)
      );
      buckets[index].revenue += Number(item.subtotal || 0);
      buckets[index].tickets += Number(item.quantity || 0);
    });
    return buckets;
  }, [paidBookings, period]);

  const chartTotal = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const chartMax = Math.max(...chartData.map((item) => item.revenue), 1);

  const chartPoints = chartData.map((item, index) => {
    const x = (index / (chartData.length - 1)) * 800;
    const y = 230 - (item.revenue / chartMax) * 190;
    return { x, y };
  });

  const chartPath = chartPoints
    .map(
      (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const chartAreaPath = [chartPath, "L 800 245", "L 0 245", "Z"].join(" ");

  const latestBookings = useMemo(
    () =>
      [...bookings]
        .sort(
          (a, b) =>
            new Date(b.order_date).getTime() -
            new Date(a.order_date).getTime()
        )
        .slice(0, 6),
    [bookings]
  );

  const activeEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((event) => {
        const date = new Date(event.event_date);
        return (
          !Number.isNaN(date.getTime()) &&
          date >= today &&
          ["Available", "Limited"].includes(event.status)
        );
      })
      .slice(0, 4);
  }, [events]);

  const statsCards = [
    {
      title: "Total Event",
      value: formatNumber(stats?.total_events),
      description: `${formatNumber(stats?.upcoming_events)} event mendatang`,
      icon: CalendarDays,
    },
    {
      title: "Tiket Terjual",
      value: formatNumber(stats?.sold_tickets),
      description: "Tiket dengan pembayaran berhasil",
      icon: Ticket,
    },
    {
      title: "Total Pendapatan",
      value: formatRupiah(stats?.total_revenue),
      description: "Dari transaksi tiket berhasil",
      icon: WalletCards,
    },
    {
      title: "Total Peserta",
      value: formatNumber(totalParticipants),
      description: "Berdasarkan tiket yang dibayar",
      icon: Users,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#112250]" />
        <div className="text-center">
          <p className="font-semibold text-[#112250]">
            Memuat Dashboard Organizer
          </p>
          <p className="mt-1 text-sm text-[#8490A1]">
            Mengambil data terbaru dari server...
          </p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-5">
        <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#112250]">
            Dashboard Gagal Dimuat
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#8490A1]">{error}</p>
          <button
            onClick={() => loadDashboard()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1A376B]"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8490A1]">
            <span>Organizer</span>
            <span>/</span>
            <span className="text-[#112250]">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#112250] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#8490A1]">
            Pantau performa event dan penjualan tiket kamu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] bg-white px-4 py-3 text-xs font-semibold text-[#526B92] transition hover:bg-[#F6F8FB] active:scale-[0.98] disabled:opacity-50 sm:text-sm"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <Link
            href="/organizer/event/tambah"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-[#112250]/15 transition hover:-translate-y-0.5 hover:bg-[#0D1F42] active:scale-[0.98] sm:text-sm"
          >
            <Plus size={18} />
            Buat Event
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-[#DDE4ED] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#B9C7DD] hover:shadow-lg"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#F5F7FC] transition-transform duration-500 group-hover:scale-125" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#112250] transition-colors duration-300 group-hover:bg-[#112250] group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-[#B5C0D0] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#112250]"
                  />
                </div>
                <p className="mt-5 text-sm font-medium text-[#8490A1]">
                  {item.title}
                </p>
                <h3 className="mt-1 break-words text-2xl font-bold tracking-tight text-[#112250]">
                  {item.value}
                </h3>
                <p className="mt-2 text-xs text-[#8490A1]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHART + SUMMARY */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-[#DDE4ED] bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 border-b border-[#EEF1F5] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#112250]">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="font-bold text-[#112250]">
                  Grafik Penjualan
                </h2>
                <p className="text-xs text-[#8490A1]">
                  Berdasarkan transaksi pembayaran berhasil
                </p>
              </div>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="rounded-lg border border-[#DDE4ED] bg-white px-3 py-2 text-xs font-medium text-[#526B92] outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 sm:text-sm"
            >
              {PERIODS.map((item) => (
                <option key={item.days} value={item.days}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="p-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs text-[#8490A1]">
                  Total Penjualan pada periode ini
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#112250]">
                  {formatRupiah(chartTotal)}
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#ECFDF3] px-2.5 py-1.5 text-xs font-semibold text-[#16803C]">
                <CheckCircle2 size={14} />
                Data Transaksi Paid
              </div>
            </div>

            <div className="h-[240px] w-full">
              <svg
                viewBox="0 0 800 270"
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="organizerSalesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#112250" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#112250" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#112250" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[40, 95, 150, 205, 245].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="800"
                    y2={y}
                    stroke="#EEF1F5"
                    strokeDasharray="4 5"
                  />
                ))}

                {/* Area dengan animasi Fade */}
                <path
                  d={chartAreaPath}
                  fill="url(#organizerSalesGradient)"
                  style={{ animation: "areaFade 1000ms ease-out both" }}
                />

                {/* Garis dengan animasi Draw */}
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#112250"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 2400,
                    strokeDashoffset: 2400,
                    animation: "lineDraw 1400ms cubic-bezier(0.22,1,0.36,1) forwards",
                  }}
                />

                {/* Titik dengan animasi Pop-up */}
                {chartPoints.map((point, index) => (
                  <g
                    key={index}
                    style={{
                      opacity: 0,
                      transformOrigin: `${point.x}px ${point.y}px`,
                      animation: `pointPop 500ms cubic-bezier(0.34,1.56,0.64,1) ${
                        900 + index * 80
                      }ms forwards`,
                    }}
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="10"
                      fill="#112250"
                      opacity="0.1"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4.5"
                      fill="#112250"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {chartData.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-[10px] text-[#8490A1] sm:text-[11px]">
                    {item.date.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#EEF1F5] pt-4">
              <span className="text-xs text-[#8490A1]">
                Total tiket terjual dalam grafik
              </span>
              <span className="text-sm font-bold text-[#112250]">
                {formatNumber(
                  chartData.reduce((sum, item) => sum + item.tickets, 0)
                )}{" "}
                tiket
              </span>
            </div>
          </div>
        </section>

        {/* RINGKASAN PENJUALAN */}
        <section className="rounded-2xl border border-[#DDE4ED] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#112250]">
                Ringkasan Penjualan
              </h2>
              <p className="mt-1 text-xs text-[#8490A1]">
                Statistik bulan ini
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#112250]">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="space-y-6">
            <SummaryItem
              label="Tiket Terjual"
              value={formatNumber(monthlyData.tickets)}
              description="Tiket berstatus Paid"
              icon={Ticket}
              percentage={
                stats?.sold_tickets
                  ? Math.min(
                      100,
                      (monthlyData.tickets / Number(stats.sold_tickets)) * 100
                    )
                  : 0
              }
            />
            <SummaryItem
              label="Pendapatan"
              value={formatRupiah(monthlyData.revenue)}
              description="Pendapatan bulan ini"
              icon={WalletCards}
              percentage={
                stats?.total_revenue
                  ? Math.min(
                      100,
                      (monthlyData.revenue / Number(stats.total_revenue)) * 100
                    )
                  : 0
              }
            />
            <SummaryItem
              label="Pesanan Berhasil"
              value={formatNumber(monthlyData.orders)}
              description="Order berstatus Paid"
              icon={CheckCircle2}
              percentage={
                totalOrders
                  ? Math.min(100, (monthlyData.orders / totalOrders) * 100)
                  : 0
              }
            />
            <SummaryItem
              label="Pesanan Pending"
              value={formatNumber(pendingOrders.length)}
              description="Menunggu pembayaran"
              icon={Clock3}
              percentage={
                bookings.length
                  ? Math.min(
                      100,
                      (pendingOrders.length / bookings.length) * 100
                    )
                  : 0
              }
            />
            <SummaryItem
              label="Refund / Dibatalkan"
              value={formatNumber(refundOrders.length)}
              description="Transaksi dengan status terkait"
              icon={XCircle}
              percentage={
                bookings.length
                  ? Math.min(
                      100,
                      (refundOrders.length / bookings.length) * 100
                    )
                  : 0
              }
            />
          </div>

          <Link
            href="/organizer/laporan/penjualan"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] py-3 text-sm font-semibold text-[#526B92] transition hover:border-[#112250] hover:text-[#112250]"
          >
            Lihat Laporan Lengkap
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      {/* TABLE + UPCOMING EVENTS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="overflow-hidden rounded-2xl border border-[#DDE4ED] bg-white shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] p-5">
            <div>
              <h2 className="font-bold text-[#112250]">
                Penjualan Terbaru
              </h2>
              <p className="mt-1 text-xs text-[#8490A1]">
                Transaksi tiket dari database
              </p>
            </div>
            <Link
              href="/organizer/penjualan/pesanan"
              className="text-sm font-semibold text-[#112250] hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          {latestBookings.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Belum Ada Transaksi"
              description="Transaksi pembelian tiket akan muncul di sini."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EEF1F5] bg-[#FAFBFC] text-left">
                    {["Pembeli", "Event", "Tiket", "Total", "Status"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8490A1]"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {latestBookings.map((booking, index) => (
                    <SalesRow
                      key={`${booking.order_id}-${booking.event_id}-${booking.ticket_category}-${index}`}
                      booking={booking}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#DDE4ED] bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] p-5">
            <div>
              <h2 className="font-bold text-[#112250]">
                Event Mendatang
              </h2>
              <p className="mt-1 text-xs text-[#8490A1]">
                Event dengan penjualan tersedia
              </p>
            </div>
            <Link
              href="/organizer/event"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8490A1] transition hover:bg-[#F6F8FB] hover:text-[#112250]"
            >
              <MoreHorizontal size={19} />
            </Link>
          </div>

          <div className="space-y-4 p-5">
            {activeEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Belum Ada Event Aktif"
                description="Buat event atau aktifkan penjualan tiket untuk menampilkannya."
              />
            ) : (
              activeEvents.map((event) => (
                <ActiveEvent key={event.id} event={event} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* SUMMARY ACTIVITY */}
      <div className="rounded-2xl border border-[#DDE4ED] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#112250]">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#112250]">
                Ringkasan Aktivitas
              </h3>
              <p className="text-xs text-[#8490A1]">
                Seluruh transaksi yang tercatat untuk akun organizer ini
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <div>
              <p className="text-xs text-[#8490A1]">Total pesanan</p>
              <p className="mt-1 font-bold text-[#112250]">
                {formatNumber(totalOrders)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8490A1]">Total event</p>
              <p className="mt-1 font-bold text-[#112250]">
                {formatNumber(events.length)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8490A1]">Event selesai</p>
              <p className="mt-1 font-bold text-[#112250]">
                {formatNumber(stats?.past_events)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STYLE UNTUK ANIMASI SVG */}
      <style jsx>{`
        @keyframes lineDraw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes areaFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pointPop {
          0% {
            opacity: 0;
            transform: scale(0.2);
          }
          60% {
            opacity: 1;
            transform: scale(1.25);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------- Sub Components ---------------------------- */

function SummaryItem({ label, value, description, icon: Icon, percentage }) {
  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-[#8490A1]" />
          <div>
            <p className="text-sm text-[#526B92]">{label}</p>
            <p className="text-[10px] text-[#A0AABB]">{description}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-[#112250]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#112250] to-[#2563EB] transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(0, Math.min(100, percentage || 0))}%`,
          }}
        />
      </div>
    </div>
  );
}

function SalesRow({ booking }) {
  const status = getStatus(booking.payment_status);
  const StatusIcon = status.icon;
  const initials = String(booking.customer_name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();

  return (
    <tr className="border-b border-[#F0F2F5] transition hover:bg-[#FAFBFD] last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#112250] text-xs font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#112250]">
              {booking.customer_name || "Pengguna"}
            </p>
            <p className="text-[11px] text-[#8490A1]">
              {booking.order_code || `Order #${booking.order_id}`}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="max-w-[170px] truncate text-sm font-medium text-[#526B92]">
          {booking.event_name || "-"}
        </p>
        <p className="mt-1 text-[11px] text-[#8490A1]">
          {formatDate(booking.order_date)}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-lg bg-[#EEF4FF] px-2.5 py-1 text-xs font-semibold text-[#112250]">
          {booking.ticket_category || "-"} x {formatNumber(booking.quantity)}
        </span>
      </td>
      <td className="px-5 py-4 text-sm font-bold text-[#112250]">
        {formatRupiah(booking.subtotal)}
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${status.className}`}
        >
          <StatusIcon size={13} />
          {status.label}
        </span>
      </td>
    </tr>
  );
}

function ActiveEvent({ event }) {
  const sold = Number(event.sold_tickets || 0);
  const quota = Number(event.total_quota || 0);
  const percentage = quota > 0 ? Math.min(100, (sold / quota) * 100) : 0;
  const location = [event.venue_name, event.city].filter(Boolean).join(", ");

  return (
    <div className="rounded-xl border border-[#EEF1F5] p-4 transition hover:border-[#D5DEEC] hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[#112250]">
            {event.event_name}
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#8490A1]">
              <MapPin size={13} />
              <span className="truncate">
                {location || "Lokasi belum tersedia"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8490A1]">
              <Clock3 size={13} />
              {formatDate(event.event_date)}
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-[#EEF4FF] px-2.5 py-1 text-xs font-bold text-[#112250]">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-[#8490A1]">Tiket terjual</span>
          <span className="font-semibold text-[#112250]">
            {formatNumber(sold)} / {formatNumber(quota)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#112250] to-[#2563EB] transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          {event.status}
        </span>
        <Link
          href={`/organizer/event/${event.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#112250] hover:underline"
        >
          <Eye size={13} />
          Detail
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F6FA]">
        <Icon size={22} className="text-[#8490A1]" />
      </div>
      <h3 className="mt-3 text-sm font-bold text-[#112250]">{title}</h3>
      <p className="mt-1 max-w-[250px] text-xs leading-5 text-[#8490A1]">
        {description}
      </p>
    </div>
  );
}
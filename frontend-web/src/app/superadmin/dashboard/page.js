"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

import {
  CreditCardIcon,
  CalendarIcon,
  UsersIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  TicketIcon,
  SparklesIcon,
  FireIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import { RefreshCw } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;
const SADMIN_URL = `${API_URL}/sadmin`;

const formatNumber = (number) =>
  new Intl.NumberFormat("id-ID").format(Number(number) || 0);

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getRelativeTime = (date) => {
  if (!date) return "-";
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "-";
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
};

/* ---------------------------------- Cards --------------------------------- */

function StatsCard({ title, value, subtitle, icon: Icon, accent, loading }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-10 transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: accent }}
      />
      <div className="relative flex justify-between items-start mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
          <SparklesIcon className="h-3 w-3" />
          Live
        </span>
      </div>
      <p className="relative text-[11px] font-medium uppercase tracking-wider text-[#7e91b2]">
        {title}
      </p>
      <p className="relative mt-1 break-words text-xl font-bold text-[#0a1628]">
        {loading ? "..." : value}
      </p>
      <p className="relative mt-1 text-[10px] text-[#7e91b2]">{subtitle}</p>
    </div>
  );
}

function SystemCard({ icon, iconBg, iconColor, title, value, subtitle }) {
  return (
    <div className="group rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          <span className={iconColor}>{icon}</span>
        </div>
        <p className="text-[11px] font-medium text-[#7e91b2]">{title}</p>
      </div>
      <p className="mt-2 break-words text-[20px] font-bold text-[#0a1628]">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-[#7e91b2]">{subtitle}</p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[#7e91b2]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ab4f8] border-t-transparent" />
        <span className="text-xs">Memuat grafik...</span>
      </div>
    </div>
  );
}

/* -------------------------------- Dashboard ------------------------------- */

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    users: 0,
    customers: 0,
    organizers: 0,
    superAdmins: 0,
    events: 0,
    tickets: 0,
  });

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const getHeaders = useCallback(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchData = useCallback(
    async (url) => {
      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Gagal mengambil data. Status ${response.status}`
        );
      }
      return result;
    },
    [getHeaders]
  );

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const [summaryResult, usersResult, eventsResult, transactionsResult] =
          await Promise.all([
            fetchData(`${SADMIN_URL}/summary`),
            fetchData(`${SADMIN_URL}/users/recent`),
            fetchData(`${SADMIN_URL}/events/recent`),
            fetchData(`${SADMIN_URL}/transactions/recent`),
          ]);

        setSummary({
          users: Number(summaryResult.summary?.users || 0),
          customers: Number(summaryResult.summary?.customers || 0),
          organizers: Number(summaryResult.summary?.organizers || 0),
          superAdmins: Number(summaryResult.summary?.superAdmins || 0),
          events: Number(summaryResult.summary?.events || 0),
          tickets: Number(summaryResult.summary?.tickets || 0),
        });

        setUsers(Array.isArray(usersResult.users) ? usersResult.users : []);
        setEvents(Array.isArray(eventsResult.events) ? eventsResult.events : []);
        setTransactions(
          Array.isArray(transactionsResult.transactions)
            ? transactionsResult.transactions
            : []
        );
      } catch (err) {
        setError(
          err.message || "Gagal menghubungkan dashboard dengan backend."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchData]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const paidTransactions = useMemo(
    () =>
      transactions.filter(
        (item) => String(item.payment_status || "").toLowerCase() === "paid"
      ),
    [transactions]
  );

  const pendingTransactions = useMemo(
    () =>
      transactions.filter(
        (item) => String(item.payment_status || "").toLowerCase() === "pending"
      ),
    [transactions]
  );

  const recentPaidRevenue = useMemo(
    () =>
      paidTransactions.reduce(
        (total, item) => total + Number(item.total_price || 0),
        0
      ),
    [paidTransactions]
  );

  const chartTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (selectedPeriod === "month") {
      const now = new Date();
      filtered = filtered.filter((item) => {
        const date = new Date(item.order_date);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    }

    if (selectedPeriod === "3months") {
      const limit = new Date();
      limit.setMonth(limit.getMonth() - 3);
      filtered = filtered.filter(
        (item) => new Date(item.order_date) >= limit
      );
    }

    return filtered
      .sort((a, b) => new Date(a.order_date) - new Date(b.order_date))
      .slice(-10);
  }, [transactions, selectedPeriod]);

  /* ------------------------------ Chart data ------------------------------ */

  const revenueData = useMemo(() => {
    return {
      labels: chartTransactions.map((item) => {
        const date = new Date(item.order_date);
        return Number.isNaN(date.getTime())
          ? "-"
          : date.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
            });
      }),
      datasets: [
        {
          label: "Nilai Transaksi",
          data: chartTransactions.map((item) =>
            Number(item.total_price || 0)
          ),
          borderColor: "#8ab4f8",
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "rgba(138,180,248,0.1)";
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );
            gradient.addColorStop(0, "rgba(138,180,248,0.3)");
            gradient.addColorStop(0.5, "rgba(138,180,248,0.08)");
            gradient.addColorStop(1, "rgba(138,180,248,0)");
            return gradient;
          },
          fill: true,
          tension: 0.42,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: "#8ab4f8",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          borderWidth: 2.5,
        },
      ],
    };
  }, [chartTransactions]);

  const doughnutData = useMemo(() => {
    const paid = paidTransactions.length;
    const pending = pendingTransactions.length;
    const failed = transactions.filter((item) =>
      ["failed", "cancelled", "canceled", "expire", "expired"].includes(
        String(item.payment_status || "").toLowerCase()
      )
    ).length;
    const other = Math.max(0, transactions.length - paid - pending - failed);

    return {
      labels: ["Berhasil", "Menunggu", "Gagal / Kedaluwarsa", "Lainnya"],
      datasets: [
        {
          data: [paid, pending, failed, other],
          backgroundColor: ["#6bcf8a", "#f5bd58", "#ef7777", "#8ab4f8"],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [transactions, paidTransactions, pendingTransactions]);

  /* ------------------------------ Chart opt ------------------------------- */

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10,22,40,0.95)",
        titleColor: "#e0e8f0",
        bodyColor: "#8aa0c0",
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) => formatRupiah(context.raw),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#7e91b2", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(74,107,154,0.08)" },
        border: { display: false },
        ticks: {
          color: "#7e91b2",
          font: { size: 10 },
          callback: (value) => `Rp ${(Number(value) / 1000000).toFixed(0)} jt`,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#7e91b2",
          font: { size: 10 },
          boxWidth: 8,
          padding: 14,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(10,22,40,0.95)",
        titleColor: "#e0e8f0",
        bodyColor: "#8aa0c0",
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  /* ------------------------------ Activities ------------------------------ */

  const activities = useMemo(() => {
    const userActivities = users.map((user) => ({
      id: `user-${user.id}`,
      text: `Pengguna baru terdaftar — ${user.fullname || user.email}`,
      date: user.created_at,
      type: "user",
    }));

    const eventActivities = events.map((event) => ({
      id: `event-${event.id}`,
      text: `Event baru ditambahkan — ${event.event_name}`,
      date: event.created_at,
      type: "event",
    }));

    const transactionActivities = transactions.map((transaction) => ({
      id: `transaction-${transaction.id}`,
      text: `Transaksi ${transaction.payment_status || "baru"} — ${
        transaction.order_code || `#${transaction.id}`
      }`,
      date: transaction.order_date,
      type: "transaction",
    }));

    return [...userActivities, ...eventActivities, ...transactionActivities]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [users, events, transactions]);

  const systemStatus = error ? "Perlu diperiksa" : "Terhubung";

  /* -------------------------------- Render -------------------------------- */

  return (
    <div className="w-full space-y-6">
      {/* HERO */}
      <section className="relative w-full overflow-hidden rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 animate-pulse rounded-full bg-[#5a8ad0]/15 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8ab4f8]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa0c0]">
                Overview
              </p>
            </div>

            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-white">
              Selamat datang,{" "}
              <span className="bg-gradient-to-r from-[#8ab4f8] to-[#b0c8e0] bg-clip-text text-transparent">
                Super Admin
              </span>
            </h1>

            <p className="mt-1.5 max-w-xl text-sm text-[#8aa0c0]">
              Ringkasan aktivitas platform TicketVerse berdasarkan data backend.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {systemStatus}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-[10px] font-medium text-blue-400">
                <SparklesIcon className="h-3 w-3" />
                Live Data
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-xs font-medium rounded-xl px-3 py-2 outline-none backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all"
            >
              <option className="text-black" value="all">
                Semua Data
              </option>
              <option className="text-black" value="month">
                Bulan Ini
              </option>
              <option className="text-black" value="3months">
                3 Bulan Terakhir
              </option>
            </select>

            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] text-[#0a1628] text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-[0_8px_25px_rgba(138,180,248,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Perbarui Data
            </button>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Gagal memuat sebagian data dashboard</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs">
              Pastikan token Super Admin masih berlaku dan backend berjalan.
            </p>
          </div>
        </div>
      )}

      {/* STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Pengguna"
          value={formatNumber(summary.users)}
          subtitle={`${formatNumber(summary.customers)} customer · ${formatNumber(summary.organizers)} organizer`}
          icon={UsersIcon}
          accent="#8ab4f8"
          loading={loading}
        />
        <StatsCard
          title="Pendapatan 10 Transaksi"
          value={formatRupiah(recentPaidRevenue)}
          subtitle={`${paidTransactions.length} transaksi berstatus Paid`}
          icon={CreditCardIcon}
          accent="#6bcf8a"
          loading={loading}
        />
        <StatsCard
          title="Total Event"
          value={formatNumber(summary.events)}
          subtitle={`${events.length} event terbaru dimuat`}
          icon={CalendarIcon}
          accent="#8ab4f8"
          loading={loading}
        />
        <StatsCard
          title="Total Tiket"
          value={formatNumber(summary.tickets)}
          subtitle="Tiket tercatat di platform"
          icon={TicketIcon}
          accent="#c084fc"
          loading={loading}
        />
      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-[15px] font-bold text-[#0a1628] mb-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#8ab4f8]" />
            Tren Transaksi Terbaru
          </h2>
          <p className="text-[11px] text-[#7e91b2] mb-6">
            Nilai pesanan berdasarkan transaksi terbaru
          </p>
          <div className="h-[300px]">
            {loading ? (
              <ChartSkeleton />
            ) : chartTransactions.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Belum ada data transaksi.
              </div>
            ) : (
              <Line data={revenueData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-[15px] font-bold text-[#0a1628] mb-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#4a6b9a]" />
            Status Pembayaran
          </h2>
          <p className="text-[11px] text-[#7e91b2] mb-6">
            Distribusi transaksi terbaru
          </p>
          <div className="h-[300px]">
            {loading ? (
              <ChartSkeleton />
            ) : transactions.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Belum ada data pembayaran.
              </div>
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
          </div>
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Berhasil</span>
              <span className="font-semibold text-emerald-600">
                {paidTransactions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Menunggu</span>
              <span className="font-semibold text-amber-600">
                {pendingTransactions.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LISTS */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#0a1628] flex items-center gap-2">
                <FireIcon className="h-4 w-4 text-amber-500" />
                Event Terbaru
              </h2>
              <p className="mt-0.5 text-[11px] text-[#7e91b2]">
                Event yang baru ditambahkan
              </p>
            </div>
            <Link
              href="/superadmin/events"
              className="flex items-center gap-1 text-[11px] font-semibold text-[#5a7aad] hover:text-[#0a1628]"
            >
              Lihat semua
              <ArrowUpRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Memuat event...
              </p>
            ) : events.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Belum ada event.
              </p>
            ) : (
              events.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-[#f0f5fc]"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] text-white">
                    {event.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          event.poster.startsWith("http")
                            ? event.poster
                            : `${API_BASE.replace(/\/api$/, "")}/uploads/${event.poster.replace(
                                /^\/+/,
                                ""
                              )}`
                        }
                        alt={event.event_name || "Event"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <CalendarIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0a1628]">
                      {event.event_name || "Tanpa nama"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[#7e91b2]">
                      {event.organizer_name || "Organizer belum tersedia"}
                    </p>
                  </div>
                  <span className="max-w-[90px] truncate rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-600">
                    {event.approval_status || event.status || "Event"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#0a1628] flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-[#3B507D]" />
                Pengguna Terbaru
              </h2>
              <p className="mt-0.5 text-[11px] text-[#7e91b2]">
                Akun yang baru bergabung
              </p>
            </div>
            <Link
              href="/superadmin/users"
              className="flex items-center gap-1 text-[11px] font-semibold text-[#5a7aad] hover:text-[#0a1628]"
            >
              Lihat semua
              <ArrowUpRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Memuat pengguna...
              </p>
            ) : users.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Belum ada pengguna.
              </p>
            ) : (
              users.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-[#f0f5fc]"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] text-sm font-bold text-white">
                    {(user.fullname || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0a1628]">
                      {user.fullname || "Tanpa nama"}
                    </p>
                    <p className="truncate text-xs text-[#7e91b2]">
                      {user.email || "-"}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-600">
                    {user.role || "User"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
          <div className="mb-4">
            <h2 className="text-[15px] font-bold text-[#0a1628] flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-[#3B507D]" />
              Aktivitas Sistem
            </h2>
            <p className="mt-0.5 text-[11px] text-[#7e91b2]">
              Aktivitas terbaru TicketVerse
            </p>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Memuat aktivitas...
              </p>
            ) : activities.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Belum ada aktivitas.
              </p>
            ) : (
              activities.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="relative flex flex-shrink-0 flex-col items-center">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#5a8ad0] shadow-[0_0_8px_rgba(90,138,208,0.4)]" />
                    {index !== activities.length - 1 && (
                      <span className="absolute top-4 h-8 w-px bg-[#d0d8e4]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-[#0a1628] sm:text-sm">
                      {activity.text}
                    </p>
                    <p className="mt-1 text-[10px] text-[#7e91b2]">
                      {getRelativeTime(activity.date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SYSTEM */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemCard
          icon={<CheckCircleIcon className="h-4 w-4" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          title="Status Sistem"
          value={systemStatus}
          subtitle="Status koneksi dashboard"
        />
        <SystemCard
          icon={<CalendarIcon className="h-4 w-4" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Total Event"
          value={formatNumber(summary.events)}
          subtitle="Data dari database events"
        />
        <SystemCard
          icon={<TicketIcon className="h-4 w-4" />}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Total Tiket"
          value={formatNumber(summary.tickets)}
          subtitle="Data dari database tickets"
        />
        <SystemCard
          icon={<ClockIcon className="h-4 w-4" />}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Transaksi Pending"
          value={formatNumber(pendingTransactions.length)}
          subtitle="Dari data terbaru yang dimuat"
        />
      </section>

      <p className="text-right text-[10px] text-slate-400">
        Data dashboard diambil dari backend TicketVerse.
      </p>
    </div>
  );
}
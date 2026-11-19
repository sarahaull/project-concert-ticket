"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Ticket,
  ReceiptText,
  Search,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Clock3,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  Info,
  CircleSlash,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const easePremium = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: easePremium },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase();

const isPaid = (status) =>
  ["paid", "success", "settlement", "completed"].includes(
    normalizeStatus(status)
  );

const getPaymentStatus = (status) => {
  const normalized = normalizeStatus(status);

  if (isPaid(status)) {
    return {
      label: "Berhasil",
      className: "bg-sky-50 text-sky-700 border-sky-200",
      dot: "bg-sky-500",
      icon: CheckCircle2,
    };
  }

  if (["pending", "unpaid", "waiting", "authorize"].includes(normalized)) {
    return {
      label: "Menunggu",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      icon: Clock3,
    };
  }

  if (
    ["failed", "cancel", "cancelled", "expire", "expired", "deny"].includes(
      normalized
    )
  ) {
    return {
      label: "Gagal",
      className: "bg-slate-100 text-slate-500 border-slate-200",
      dot: "bg-slate-300",
      icon: XCircle,
    };
  }

  return {
    label: status || "Tidak diketahui",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-300",
    icon: Clock3,
  };
};

export default function PendapatanOrganizerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Gagal mengambil data pendapatan.");
      }

      const orderData = Array.isArray(result.orders) ? result.orders : [];
      setOrders(orderData);
    } catch (err) {
      console.error("FETCH ORGANIZER REVENUE ERROR:", err);
      setError(
        err.message || "Terjadi kesalahan saat mengambil data pendapatan."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const groupedOrders = useMemo(() => {
    const grouped = new Map();

    orders.forEach((item) => {
      const orderId = item.id;

      if (!grouped.has(orderId)) {
        grouped.set(orderId, {
          id: item.id,
          order_code: item.order_code,
          fullname: item.fullname,
          email: item.email,
          payment_status: item.payment_status,
          order_date: item.order_date,
          total_price: Number(item.total_price) || 0,
          quantity: 0,
          subtotal: 0,
          event_name: item.event_name || "-",
          event_id: item.event_id,
          payment_method: item.payment_method || "-",
          details: [],
        });
      }

      const order = grouped.get(orderId);
      const quantity = Number(item.quantity) || 0;
      const subtotal = Number(item.subtotal) || 0;

      order.quantity += quantity;
      order.subtotal += subtotal;

      order.details.push({
        category_name: item.category_name || "-",
        quantity,
        subtotal,
      });
    });

    return Array.from(grouped.values()).sort(
      (a, b) =>
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  }, [orders]);

  const eventOptions = useMemo(() => {
    const uniqueEvents = new Map();
    groupedOrders.forEach((order) => {
      if (order.event_id) {
        uniqueEvents.set(String(order.event_id), order.event_name);
      }
    });
    return Array.from(uniqueEvents.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [groupedOrders]);

  const isWithinPeriod = useCallback(
    (dateValue) => {
      if (periodFilter === "all") return true;
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return false;

      const now = new Date();

      if (periodFilter === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }
      if (periodFilter === "year") {
        return date.getFullYear() === now.getFullYear();
      }
      if (periodFilter === "last30") {
        const start = new Date();
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        return date >= start && date <= now;
      }
      return true;
    },
    [periodFilter]
  );

  const filteredOrders = useMemo(() => {
    return groupedOrders.filter((order) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        !keyword ||
        String(order.order_code || "").toLowerCase().includes(keyword) ||
        String(order.fullname || "").toLowerCase().includes(keyword) ||
        String(order.email || "").toLowerCase().includes(keyword) ||
        String(order.event_name || "").toLowerCase().includes(keyword);

      const status = normalizeStatus(order.payment_status);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && isPaid(status)) ||
        (statusFilter === "pending" &&
          ["pending", "unpaid", "waiting", "authorize"].includes(status)) ||
        (statusFilter === "failed" &&
          ["failed", "cancel", "cancelled", "expire", "expired", "deny"].includes(
            status
          ));

      const matchesPeriod = isWithinPeriod(order.order_date);

      const matchesEvent =
        eventFilter === "all" || String(order.event_id) === eventFilter;

      return matchesSearch && matchesStatus && matchesPeriod && matchesEvent;
    });
  }, [groupedOrders, search, statusFilter, isWithinPeriod, eventFilter]);

  const statistics = useMemo(() => {
    const paidOrders = filteredOrders.filter((order) =>
      isPaid(order.payment_status)
    );

    const pendingOrders = filteredOrders.filter((order) =>
      ["pending", "unpaid", "waiting", "authorize"].includes(
        normalizeStatus(order.payment_status)
      )
    );

    const failedOrders = filteredOrders.filter((order) =>
      ["failed", "cancel", "cancelled", "expire", "expired", "deny"].includes(
        normalizeStatus(order.payment_status)
      )
    );

    const revenue = paidOrders.reduce(
      (total, order) => total + order.subtotal,
      0
    );

    const soldTickets = paidOrders.reduce(
      (total, order) => total + order.quantity,
      0
    );

    return {
      revenue,
      transactions: paidOrders.length,
      soldTickets,
      pending: pendingOrders.length,
      failed: failedOrders.length,
    };
  }, [filteredOrders]);

  const monthlyRevenue = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const result = MONTH_NAMES.map((month, index) => ({
      month,
      index,
      revenue: 0,
    }));

    groupedOrders.forEach((order) => {
      if (!isPaid(order.payment_status)) return;

      const date = new Date(order.order_date);
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== currentYear)
        return;

      result[date.getMonth()].revenue += order.subtotal;
    });

    return result;
  }, [groupedOrders]);

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );

  const handleExport = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      "Kode Pesanan",
      "Nama Pembeli",
      "Email",
      "Nama Event",
      "Jumlah Tiket",
      "Total",
      "Status Pembayaran",
      "Tanggal Pesanan",
    ];

    const rows = filteredOrders.map((order) => [
      order.order_code,
      order.fullname,
      order.email,
      order.event_name,
      order.quantity,
      order.subtotal,
      order.payment_status,
      formatDate(order.order_date),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pendapatan-ticketverse-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setEventFilter("all");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <RefreshCw size={22} className="animate-spin text-sky-600" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Memuat data pendapatan
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Menghubungkan ke server TicketVerse...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easePremium }}
        className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <AlertCircle size={22} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Data pendapatan tidak dapat dimuat
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{error}</p>
        <button
          type="button"
          onClick={() => fetchOrders()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="w-full min-w-0 space-y-6"
    >
      {/* HEADER */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            <span>Organizer</span>
            <span className="text-slate-300">/</span>
            <span className="text-sky-600">Keuangan</span>
          </div>

          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[30px]">
            Pendapatan
          </h1>

          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-500">
            Pantau pemasukan dan transaksi penjualan tiket event Anda secara
            real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* ERROR REFRESH */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-start gap-3 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-[12.5px] text-amber-800"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER BAR */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <CalendarDays size={17} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-800">
              Periode Pendapatan
            </p>
            <p className="text-[11px] text-slate-400">
              Sesuaikan periode data yang ingin dilihat
            </p>
          </div>
        </div>

        <div className="relative">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-[12.5px] font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:w-52"
          >
            <option value="all">Semua Periode</option>
            <option value="month">Bulan Ini</option>
            <option value="last30">30 Hari Terakhir</option>
            <option value="year">Tahun Ini</option>
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </motion.div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          icon={<Wallet size={20} />}
          label="Total Pendapatan"
          value={formatRupiah(statistics.revenue)}
          hint="Dari transaksi berhasil"
          badge="Paid"
          accent
        />

        <StatCard
          index={1}
          icon={<ReceiptText size={20} />}
          label="Transaksi Berhasil"
          value={statistics.transactions}
          hint="Pesanan berstatus paid"
          badge="Orders"
        />

        <StatCard
          index={2}
          icon={<Ticket size={20} />}
          label="Tiket Terjual"
          value={statistics.soldTickets.toLocaleString("id-ID")}
          hint="Berdasarkan pesanan berhasil"
          badge="Tickets"
        />

        <StatCard
          index={3}
          icon={<Clock3 size={20} />}
          label="Menunggu Pembayaran"
          value={statistics.pending}
          hint="Transaksi belum dibayar"
          badge="Pending"
        />
      </div>

      {/* CHART */}
      <motion.section
        variants={fadeUp}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Grafik Pendapatan
            </h2>
            <p className="mt-1 text-[12px] text-slate-400">
              Ringkasan pendapatan bulanan tahun {new Date().getFullYear()}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11.5px] font-medium text-slate-500">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
            Pendapatan berhasil
          </div>
        </div>

        <div className="p-5">
          {monthlyRevenue.every((item) => item.revenue === 0) ? (
            <div className="flex h-56 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                <TrendingUp size={22} />
              </div>
              <p className="mt-3 text-[13px] font-semibold text-slate-700">
                Belum ada pendapatan
              </p>
              <p className="mt-1 text-[11.5px] text-slate-400">
                Data pendapatan akan muncul setelah transaksi berhasil.
              </p>
            </div>
          ) : (
            <div className="flex h-64 items-end gap-2 sm:gap-4">
              {monthlyRevenue.map((item, idx) => {
                const height =
                  item.revenue > 0
                    ? Math.max((item.revenue / maxRevenue) * 100, 5)
                    : 0;
                const isCurrentMonth = item.index === new Date().getMonth();

                return (
                  <div
                    key={item.month}
                    className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <div className="relative flex h-full w-full items-end justify-center">
                      {item.revenue > 0 && (
                        <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg group-hover:block">
                          {formatRupiah(item.revenue)}
                        </div>
                      )}

                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{
                          duration: 0.9,
                          delay: 0.15 + idx * 0.03,
                          ease: easePremium,
                        }}
                        className={`w-full max-w-12 rounded-t-lg transition-colors ${
                          isCurrentMonth
                            ? "bg-sky-600"
                            : "bg-sky-400 group-hover:bg-sky-600"
                        }`}
                        style={{
                          minHeight: item.revenue > 0 ? "5px" : "0px",
                        }}
                      />
                    </div>

                    <span
                      className={`mt-3 text-[10px] font-medium sm:text-[11px] ${
                        isCurrentMonth
                          ? "text-sky-700"
                          : "text-slate-400"
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* TABLE */}
      <motion.section
        variants={fadeUp}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Riwayat Pendapatan
            </h2>
            <p className="mt-1 text-[12px] text-slate-400">
              Daftar transaksi dari seluruh event milik Anda
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari transaksi..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:w-52"
              />
            </div>

            <div className="relative">
              <Filter
                size={13}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[12px] font-medium text-slate-600 outline-none focus:border-sky-400 sm:w-40"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Berhasil</option>
                <option value="pending">Menunggu</option>
                <option value="failed">Gagal</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-[12px] font-medium text-slate-600 outline-none focus:border-sky-400 sm:w-48"
              >
                <option value="all">Semua Event</option>
                {eventOptions.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
              <CircleSlash size={24} />
            </div>
            <h3 className="mt-4 text-[13.5px] font-semibold text-slate-800">
              Tidak ada transaksi ditemukan
            </h3>
            <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-slate-400">
              Belum ada data yang sesuai dengan pencarian atau filter yang Anda
              pilih.
            </p>
            {(search || statusFilter !== "all" || eventFilter !== "all") && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 text-[12px] font-semibold text-sky-600 hover:text-sky-700"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Transaksi
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pembeli
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Event
                    </th>
                    <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tiket
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pendapatan
                    </th>
                    <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence initial={false}>
                    {filteredOrders.map((order, idx) => {
                      const status = getPaymentStatus(order.payment_status);
                      const StatusIcon = status.icon;

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: Math.min(idx * 0.02, 0.2),
                            ease: easePremium,
                          }}
                          className="transition hover:bg-slate-50/60"
                        >
                          <td className="px-5 py-4">
                            <p className="text-[12px] font-semibold text-slate-800">
                              {order.order_code || `ORD-${order.id}`}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              ID #{order.id}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-[12px] font-semibold text-slate-700">
                              {order.fullname || "Pembeli"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {order.email || "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-48 truncate text-[12px] font-medium text-slate-700">
                              {order.event_name}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              {order.quantity}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-[11.5px] font-medium text-slate-600">
                              {formatDate(order.order_date)}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <p className="text-[12px] font-bold text-slate-800">
                              {formatRupiah(order.subtotal)}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                            >
                              <StatusIcon size={11} />
                              {status.label}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-[11.5px] text-slate-500">
                Menampilkan{" "}
                <span className="font-bold text-slate-800">
                  {filteredOrders.length}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-800">
                  {groupedOrders.length}
                </span>{" "}
                transaksi
              </p>
              <p className="text-[11.5px] text-slate-500">
                Total transaksi berhasil:{" "}
                <span className="font-bold text-sky-700">
                  {statistics.transactions}
                </span>
              </p>
            </div>
          </>
        )}
      </motion.section>

      {/* INFORMATION */}
      <motion.div
        variants={fadeUp}
        className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 ring-1 ring-sky-100">
          <Info size={16} />
        </div>
        <div>
          <p className="text-[12.5px] font-semibold text-sky-900">
            Informasi perhitungan pendapatan
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-sky-900/70">
            Total pendapatan pada halaman ini dihitung dari subtotal detail
            tiket pada pesanan dengan status pembayaran Paid. Transaksi pending
            dan gagal tidak dimasukkan ke dalam total pendapatan. Nilai ini
            merupakan total penjualan tiket, bukan saldo pencairan dana atau
            nominal setelah potongan biaya layanan.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, hint, badge, accent = false, index = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: easePremium }}
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        accent ? "border-sky-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${
            accent
              ? "bg-sky-50 text-sky-600 ring-sky-100"
              : "bg-slate-50 text-slate-600 ring-slate-100"
          }`}
        >
          {icon}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            accent
              ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
              : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
          }`}
        >
          {badge}
        </span>
      </div>

      <p className="mt-5 text-[11.5px] font-medium uppercase tracking-[0.05em] text-slate-400">
        {label}
      </p>
      <h2
        className={`mt-1.5 break-all text-xl font-bold tracking-tight ${
          accent ? "text-sky-900" : "text-slate-900"
        }`}
      >
        {value}
      </h2>
      <p className="mt-2 text-[11px] text-slate-400">{hint}</p>
    </motion.div>
  );
}
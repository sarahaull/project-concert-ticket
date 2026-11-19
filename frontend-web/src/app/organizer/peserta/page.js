"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Ticket,
  CheckCircle2,
  Clock3,
  Search,
  RefreshCw,
  Download,
  CalendarDays,
  ChevronDown,
  Filter,
  UserRound,
  Mail,
  AlertCircle,
  Eye,
  X,
  Music2,
  Info,
  CircleSlash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const easePremium = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: easePremium },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

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

const formatDateTime = (dateValue, timeValue) => {
  if (!dateValue) return "-";
  const date = formatDate(dateValue);
  return timeValue ? `${date} • ${timeValue}` : date;
};

const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase();

const isPaid = (status) =>
  ["paid", "success", "settlement", "completed"].includes(
    normalizeStatus(status)
  );

const getPaymentStatus = (status) => {
  const value = normalizeStatus(status);

  if (isPaid(value)) {
    return {
      label: "Berhasil",
      className: "border-sky-200 bg-sky-50 text-sky-700",
      icon: CheckCircle2,
    };
  }

  if (["pending", "unpaid", "waiting", "authorize"].includes(value)) {
    return {
      label: "Menunggu",
      className: "border-slate-200 bg-slate-100 text-slate-600",
      icon: Clock3,
    };
  }

  if (
    ["failed", "cancel", "cancelled", "expire", "expired", "deny"].includes(
      value
    )
  ) {
    return {
      label: "Gagal",
      className: "border-slate-200 bg-slate-100 text-slate-500",
      icon: AlertCircle,
    };
  }

  return {
    label: status || "Tidak diketahui",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: Clock3,
  };
};

export default function DataPengunjungOrganizerPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchVisitors = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        if (!token) {
          router.replace("/login");
          return;
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

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          throw new Error(
            result.message || "Anda tidak memiliki akses ke data pengunjung."
          );
        }

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Gagal mengambil data pengunjung."
          );
        }

        setOrders(Array.isArray(result.orders) ? result.orders : []);
      } catch (err) {
        console.error("FETCH ORGANIZER VISITORS ERROR:", err);
        setError(
          err.message || "Terjadi kesalahan saat mengambil data pengunjung."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const visitorRows = useMemo(() => {
    return orders.map((item, index) => ({
      rowId: `${item.id}-${item.order_detail_id || index}`,
      orderId: item.id,
      orderCode: item.order_code,
      userId: item.user_id,

      fullname: item.fullname || "Nama tidak tersedia",
      email: item.email || "-",

      eventId: item.event_id,
      eventName: item.event_name || "Event tidak tersedia",
      eventDate: item.event_date,
      eventTime: item.event_time,

      categoryId: item.ticket_category_id,
      categoryName: item.category_name || "-",

      quantity: Number(item.quantity) || 0,
      subtotal: Number(item.subtotal) || 0,

      paymentStatus: item.payment_status,
      orderDate: item.order_date,
    }));
  }, [orders]);

  const eventOptions = useMemo(() => {
    const uniqueEvents = new Map();
    visitorRows.forEach((visitor) => {
      if (visitor.eventId) {
        uniqueEvents.set(String(visitor.eventId), visitor.eventName);
      }
    });
    return Array.from(uniqueEvents.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [visitorRows]);

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
      if (periodFilter === "last30") {
        const start = new Date();
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        return date >= start && date <= now;
      }
      if (periodFilter === "year") {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    },
    [periodFilter]
  );

  const filteredVisitors = useMemo(() => {
    return visitorRows.filter((visitor) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        visitor.fullname.toLowerCase().includes(keyword) ||
        visitor.email.toLowerCase().includes(keyword) ||
        String(visitor.orderCode || "").toLowerCase().includes(keyword) ||
        visitor.eventName.toLowerCase().includes(keyword);

      const status = normalizeStatus(visitor.paymentStatus);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && isPaid(status)) ||
        (statusFilter === "pending" &&
          ["pending", "unpaid", "waiting", "authorize"].includes(status)) ||
        (statusFilter === "failed" &&
          ["failed", "cancel", "cancelled", "expire", "expired", "deny"].includes(
            status
          ));

      const matchesEvent =
        eventFilter === "all" || String(visitor.eventId) === eventFilter;

      const matchesPeriod = isWithinPeriod(visitor.orderDate);

      return matchesSearch && matchesStatus && matchesEvent && matchesPeriod;
    });
  }, [visitorRows, search, statusFilter, eventFilter, isWithinPeriod]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, eventFilter, periodFilter, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVisitors.length / pageSize)
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedVisitors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVisitors.slice(start, start + pageSize);
  }, [filteredVisitors, currentPage, pageSize]);

  const startIndex =
    filteredVisitors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredVisitors.length);

  const statistics = useMemo(() => {
    const paidVisitors = filteredVisitors.filter((visitor) =>
      isPaid(visitor.paymentStatus)
    );

    const pendingVisitors = filteredVisitors.filter((visitor) =>
      ["pending", "unpaid", "waiting", "authorize"].includes(
        normalizeStatus(visitor.paymentStatus)
      )
    );

    const totalTickets = paidVisitors.reduce(
      (total, visitor) => total + visitor.quantity,
      0
    );

    const uniqueBuyers = new Set(paidVisitors.map((visitor) => visitor.userId));

    return {
      totalBuyers: uniqueBuyers.size,
      totalTickets,
      successfulTransactions: paidVisitors.length,
      pendingTransactions: pendingVisitors.length,
    };
  }, [filteredVisitors]);

  const handleExport = () => {
    if (filteredVisitors.length === 0) return;

    const headers = [
      "No",
      "Kode Pesanan",
      "Nama Pengunjung",
      "Email",
      "Nama Event",
      "Kategori Tiket",
      "Jumlah Tiket",
      "Status Pembayaran",
      "Tanggal Pesanan",
      "Tanggal Event",
    ];

    const rows = filteredVisitors.map((visitor, index) => [
      index + 1,
      visitor.orderCode,
      visitor.fullname,
      visitor.email,
      visitor.eventName,
      visitor.categoryName,
      visitor.quantity,
      visitor.paymentStatus,
      formatDate(visitor.orderDate),
      formatDateTime(visitor.eventDate, visitor.eventTime),
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
    link.download = `data-pengunjung-ticketverse-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setEventFilter("all");
    setStatusFilter("all");
    setPeriodFilter("all");
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
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
            Memuat data pengunjung
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Menghubungkan ke server TicketVerse...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && visitorRows.length === 0) {
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
          Data pengunjung tidak dapat dimuat
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{error}</p>
        <button
          type="button"
          onClick={() => fetchVisitors()}
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
      <motion.div
        variants={fadeUp}
        className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            <span>Organizer</span>
            <span className="text-slate-300">/</span>
            <span>Pesanan Tiket</span>
            <span className="text-slate-300">/</span>
            <span className="text-sky-600">Data Pengunjung</span>
          </div>

          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[30px]">
            Data Pengunjung
          </h1>

          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-500">
            Pantau daftar pembeli dan pemesanan tiket dari seluruh event Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => fetchVisitors(true)}
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
            disabled={filteredVisitors.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          icon={<Users size={20} />}
          label="Total Pembeli"
          value={statistics.totalBuyers.toLocaleString("id-ID")}
          hint="Pembeli dengan transaksi berhasil"
          badge="Pengunjung"
          accent
        />
        <StatCard
          index={1}
          icon={<Ticket size={20} />}
          label="Tiket Terjual"
          value={statistics.totalTickets.toLocaleString("id-ID")}
          hint="Total tiket dari pembayaran berhasil"
          badge="Tiket"
        />
        <StatCard
          index={2}
          icon={<CheckCircle2 size={20} />}
          label="Transaksi Berhasil"
          value={statistics.successfulTransactions}
          hint="Pesanan dengan pembayaran berhasil"
          badge="Berhasil"
        />
        <StatCard
          index={3}
          icon={<Clock3 size={20} />}
          label="Menunggu Pembayaran"
          value={statistics.pendingTransactions}
          hint="Pesanan yang belum dibayar"
          badge="Pending"
        />
      </div>

      <motion.section
        variants={fadeUp}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <Filter size={17} />
          </div>
          <div>
            <h2 className="text-[13.5px] font-semibold text-slate-800">
              Filter Pengunjung
            </h2>
            <p className="mt-0.5 text-[11.5px] text-slate-400">
              Cari dan sesuaikan data pengunjung yang ingin dipantau
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, kode..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="relative">
            <Music2
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[12px] font-medium text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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

          <div className="relative">
            <Filter
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[12px] font-medium text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
            <CalendarDays
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[12px] font-medium text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="all">Semua Periode</option>
              <option value="month">Bulan Ini</option>
              <option value="last30">30 Hari Terakhir</option>
              <option value="year">Tahun Ini</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {(search ||
          eventFilter !== "all" ||
          statusFilter !== "all" ||
          periodFilter !== "all") && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11.5px] font-semibold text-sky-600 transition hover:text-sky-700"
            >
              Reset Filter
            </button>
          </div>
        )}
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Daftar Pengunjung
            </h2>
            <p className="mt-1 text-[12px] text-slate-400">
              Data pembeli berdasarkan transaksi pemesanan tiket
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-[11.5px] font-semibold text-sky-700 ring-1 ring-sky-100">
            <Users size={13} />
            {filteredVisitors.length} data ditemukan
          </div>
        </div>

        {filteredVisitors.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
              <CircleSlash size={24} />
            </div>
            <h3 className="mt-4 text-[13.5px] font-semibold text-slate-800">
              Tidak ada data pengunjung
            </h3>
            <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-slate-400">
              Data pengunjung akan ditampilkan setelah terdapat pesanan tiket
              pada event Anda, atau sesuaikan filter pencarian.
            </p>
            {(search ||
              eventFilter !== "all" ||
              statusFilter !== "all" ||
              periodFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-[12px] font-semibold text-sky-600 hover:text-sky-700"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="w-12 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      No
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pengunjung
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Kode Pesanan
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Event
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Kategori
                    </th>
                    <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jumlah
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tgl Pesanan
                    </th>
                    <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pembayaran
                    </th>
                    <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Detail
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="wait">
                    {paginatedVisitors.map((visitor, idx) => {
                      const status = getPaymentStatus(visitor.paymentStatus);
                      const StatusIcon = status.icon;
                      const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                      return (
                        <motion.tr
                          key={visitor.rowId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: Math.min(idx * 0.025, 0.25),
                            ease: easePremium,
                          }}
                          className="group transition hover:bg-slate-50/60"
                        >
                          <td className="px-4 py-4">
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-700">
                              {rowNumber}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                                <UserRound size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-48 truncate text-[12px] font-semibold text-slate-800">
                                  {visitor.fullname}
                                </p>
                                <p className="mt-0.5 flex max-w-48 items-center gap-1 truncate text-[10.5px] text-slate-400">
                                  <Mail size={10} />
                                  {visitor.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-[12px] font-semibold text-slate-700">
                              {visitor.orderCode || `ORD-${visitor.orderId}`}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              ID #{visitor.orderId}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-44 truncate text-[12px] font-medium text-slate-700">
                              {visitor.eventName}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                              <CalendarDays size={10} />
                              {formatDate(visitor.eventDate)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10.5px] font-semibold text-slate-600">
                              {visitor.categoryName}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex min-w-8 justify-center rounded-md bg-sky-50 px-2 py-1 text-[11.5px] font-bold text-sky-700">
                              {visitor.quantity}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-[11.5px] font-medium text-slate-600">
                              {formatDate(visitor.orderDate)}
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

                          <td className="px-5 py-4 text-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => setSelectedVisitor(visitor)}
                              title="Lihat detail pengunjung"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                            >
                              <Eye size={15} />
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11.5px] text-slate-500">
                  Menampilkan{" "}
                  <span className="font-bold text-slate-800">{startIndex}</span>
                  {" – "}
                  <span className="font-bold text-slate-800">{endIndex}</span>
                  {" dari "}
                  <span className="font-bold text-slate-800">
                    {filteredVisitors.length}
                  </span>{" "}
                  data
                </p>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Per hal.</span>
                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-[11px] font-semibold text-slate-700 outline-none focus:border-sky-400"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={11}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                  Prev
                </motion.button>

                {getPageNumbers().map((page) => (
                  <motion.button
                    key={page}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[11.5px] font-semibold transition ${
                      page === currentPage
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={13} />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.section>

      <motion.div
        variants={fadeUp}
        className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 ring-1 ring-sky-100">
          <Info size={16} />
        </div>
        <div>
          <p className="text-[12.5px] font-semibold text-sky-900">
            Informasi monitoring pengunjung
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-sky-900/70">
            Halaman ini hanya digunakan untuk memantau data pembeli dan pesanan
            tiket. Data pembeli ditampilkan berdasarkan transaksi yang
            dikembalikan backend. Jumlah pembeli pada ringkasan dihitung dari
            akun pembeli unik dengan pembayaran berhasil.
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedVisitor && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedVisitor(null)}
          >
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: easePremium }}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    Detail Pengunjung
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-slate-400">
                    Informasi pesanan dan pembeli
                  </p>
                </div>

                <motion.button
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setSelectedVisitor(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <UserRound size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-900">
                      {selectedVisitor.fullname}
                    </p>
                    <p className="mt-0.5 break-all text-[11.5px] text-slate-500">
                      {selectedVisitor.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Informasi Pesanan
                  </h4>

                  <div className="space-y-2.5">
                    <DetailRow
                      label="Kode Pesanan"
                      value={
                        selectedVisitor.orderCode ||
                        `ORD-${selectedVisitor.orderId}`
                      }
                    />
                    <DetailRow
                      label="Tanggal Pesanan"
                      value={formatDate(selectedVisitor.orderDate)}
                    />
                    <DetailRow
                      label="Jumlah Tiket"
                      value={`${selectedVisitor.quantity} tiket`}
                    />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11.5px] text-slate-500">
                        Status Pembayaran
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          getPaymentStatus(selectedVisitor.paymentStatus)
                            .className
                        }`}
                      >
                        {
                          getPaymentStatus(selectedVisitor.paymentStatus)
                            .label
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h4 className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Informasi Event
                  </h4>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {selectedVisitor.eventName}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-[11.5px] text-slate-500">
                      <CalendarDays size={14} className="text-sky-500" />
                      {formatDateTime(
                        selectedVisitor.eventDate,
                        selectedVisitor.eventTime
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[11.5px] text-slate-500">
                      <Ticket size={14} className="text-sky-500" />
                      {selectedVisitor.categoryName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSelectedVisitor(null)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-slate-800"
                >
                  Tutup Detail
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        className={`mt-1.5 text-xl font-bold tracking-tight ${
          accent ? "text-sky-900" : "text-slate-900"
        }`}
      >
        {value}
      </h2>
      <p className="mt-2 text-[11px] text-slate-400">{hint}</p>
    </motion.div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11.5px] text-slate-500">{label}</span>
      <span className="text-right text-[11.5px] font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}
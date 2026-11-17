
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  Ticket,
  Clock,
  RefreshCw,
  Search,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Banknote,
  Receipt,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 8;

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatus = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "paid" || normalized === "success") {
    return {
      label: "Berhasil",
      className: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (normalized === "pending") {
    return {
      label: "Menunggu",
      className: "bg-amber-50 text-amber-700",
      icon: Clock,
    };
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "expired"
  ) {
    return {
      label: "Gagal",
      className: "bg-red-50 text-red-700",
      icon: AlertCircle,
    };
  }

  return {
    label: status || "Tidak diketahui",
    className: "bg-slate-100 text-slate-600",
    icon: AlertCircle,
  };
};

const isPaid = (order) => {
  const status = String(order.payment_status || "").toLowerCase();
  return status === "paid" || status === "success";
};

const getOrderDate = (order) => {
  return order.order_date || order.created_at || order.createdAt || null;
};

const getMonthKey = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

export default function PendapatanPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data pendapatan."
        );
      }

      if (result.success === false) {
        throw new Error(
          result.message || "Backend gagal mengambil data transaksi."
        );
      }

      // Kontrak Backend: { success: true, orders: [...] }
      const orderData = Array.isArray(result.orders)
        ? result.orders
        : [];

      setOrders(orderData);
    } catch (err) {
      console.error("Fetch pendapatan error:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter berdasarkan bulan
  const monthOrders = useMemo(() => {
    if (!selectedMonth) return orders;

    return orders.filter((order) => {
      const date = getOrderDate(order);
      return date && getMonthKey(date) === selectedMonth;
    });
  }, [orders, selectedMonth]);

  // Statistik pendapatan
  const statistics = useMemo(() => {
    const paidOrders = monthOrders.filter(isPaid);

    const totalRevenue = paidOrders.reduce(
      (total, order) => total + (Number(order.total_price) || 0),
      0
    );

    const pendingOrders = monthOrders.filter(
      (order) =>
        String(order.payment_status || "").toLowerCase() === "pending"
    );

    const pendingAmount = pendingOrders.reduce(
      (total, order) => total + (Number(order.total_price) || 0),
      0
    );

    return {
      totalRevenue,
      totalTransactions: monthOrders.length,
      paidTransactions: paidOrders.length,
      pendingTransactions: pendingOrders.length,
      pendingAmount,
    };
  }, [monthOrders]);

  // Grafik pendapatan enam bulan terakhir
  const chartData = useMemo(() => {
    const today = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      months.push({
        key: getMonthKey(date),
        label: new Intl.DateTimeFormat("id-ID", {
          month: "short",
        }).format(date),
        revenue: 0,
      });
    }

    orders.filter(isPaid).forEach((order) => {
      const key = getMonthKey(getOrderDate(order));
      const month = months.find((item) => item.key === key);

      if (month) {
        month.revenue += Number(order.total_price) || 0;
      }
    });

    const maxRevenue = Math.max(
      ...months.map((item) => item.revenue),
      1
    );

    return months.map((item) => ({
      ...item,
      height: (item.revenue / maxRevenue) * 100,
    }));
  }, [orders]);

  // Pencarian dan filter transaksi
  const filteredOrders = useMemo(() => {
    return monthOrders.filter((order) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        String(order.order_code || "").toLowerCase().includes(keyword) ||
        String(order.fullname || "").toLowerCase().includes(keyword) ||
        String(order.email || "").toLowerCase().includes(keyword);

      const status = String(
        order.payment_status || ""
      ).toLowerCase();

      let matchesStatus = true;

      if (statusFilter === "paid") {
        matchesStatus = isPaid(order);
      } else if (statusFilter === "pending") {
        matchesStatus = status === "pending";
      } else if (statusFilter === "gagal") {
        matchesStatus = [
          "failed",
          "cancelled",
          "canceled",
          "expired",
        ].includes(status);
      }

      return matchesSearch && matchesStatus;
    });
  }, [monthOrders, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedMonth]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Organizer</span>
              <span>/</span>
              <span className="font-medium text-[#112250]">
                Pendapatan
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#112250] sm:text-3xl">
              Pendapatan
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Pantau pendapatan dan transaksi tiket event kamu.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b356e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Memuat..." : "Refresh Data"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0 text-red-600"
                size={20}
              />
              <div>
                <p className="font-semibold text-red-700">
                  Gagal mengambil data
                </p>
                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchOrders()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* FILTER BULAN */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#112250]">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Periode Pendapatan
              </p>
              <p className="text-xs text-slate-500">
                Pilih bulan untuk melihat ringkasan transaksi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth("")}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Semua
              </button>
            )}
          </div>
        </div>

        {/* STATISTIK */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <div className="text-center">
              <Loader2
                size={34}
                className="mx-auto animate-spin text-[#112250]"
              />
              <p className="mt-3 text-sm text-slate-500">
                Mengambil data pendapatan...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* TOTAL PENDAPATAN */}
              <div className="rounded-2xl bg-[#112250] p-5 text-white shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-white/10 p-3">
                    <Wallet size={23} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-200">
                    <TrendingUp size={15} />
                    Pendapatan
                  </span>
                </div>

                <p className="mt-5 text-sm text-blue-100">
                  Total Pendapatan
                </p>

                <h2 className="mt-2 break-all text-2xl font-bold sm:text-3xl">
                  {formatRupiah(statistics.totalRevenue)}
                </h2>

                <p className="mt-3 text-xs text-blue-200">
                  Hanya transaksi berhasil dibayar
                </p>
              </div>

              {/* TRANSAKSI BERHASIL */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <CheckCircle2 size={23} />
                  </div>
                  <ArrowUpRight
                    size={19}
                    className="text-emerald-500"
                  />
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Transaksi Berhasil
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {statistics.paidTransactions}
                </h2>

                <p className="mt-3 text-xs text-slate-400">
                  Pesanan berstatus Paid
                </p>
              </div>

              {/* TRANSAKSI PENDING */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <Clock size={23} />
                  </div>
                  <ArrowDownRight
                    size={19}
                    className="text-amber-500"
                  />
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Menunggu Pembayaran
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {statistics.pendingTransactions}
                </h2>

                <p className="mt-3 text-xs text-slate-400">
                  {formatRupiah(statistics.pendingAmount)}
                </p>
              </div>

              {/* TOTAL TRANSAKSI */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <Receipt size={23} />
                  </div>
                  <Ticket
                    size={19}
                    className="text-blue-500"
                  />
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Total Transaksi
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {statistics.totalTransactions}
                </h2>

                <p className="mt-3 text-xs text-slate-400">
                  Semua status pembayaran
                </p>
              </div>
            </div>

            {/* GRAFIK PENDAPATAN */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-[#112250]">
                    Grafik Pendapatan
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pendapatan transaksi Paid selama enam bulan terakhir.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3159a8]" />
                  Pendapatan
                </div>
              </div>

              <div className="mt-8 flex h-56 items-end justify-around gap-3 border-b border-slate-100 px-2">
                {chartData.map((item) => (
                  <div
                    key={item.key}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="hidden text-center text-[10px] text-slate-400 sm:block">
                      {item.revenue > 0
                        ? formatRupiah(item.revenue)
                        : ""}
                    </span>

                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        title={`${item.label}: ${formatRupiah(item.revenue)}`}
                        className="w-full max-w-14 rounded-t-lg bg-[#3159a8] transition-all duration-500 hover:bg-[#112250]"
                        style={{
                          height: `${Math.max(item.height, item.revenue > 0 ? 4 : 0)}%`,
                        }}
                      />
                    </div>

                    <span className="pb-2 text-xs font-medium text-slate-500">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Data grafik dihitung dari tanggal transaksi dan total harga
                pesanan berstatus Paid.
              </p>
            </div>

            {/* RIWAYAT TRANSAKSI */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <h2 className="text-lg font-bold text-[#112250]">
                      Riwayat Pendapatan
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Daftar transaksi dan status pembayaran pembeli.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Cari transaksi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-64"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
                    >
                      <option value="semua">Semua Status</option>
                      <option value="paid">Berhasil</option>
                      <option value="pending">Pending</option>
                      <option value="gagal">Gagal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLE DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Kode Pesanan
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Pembeli
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedOrders.map((order) => {
                      const status = getStatus(order.payment_status);
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={order.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-6 py-5">
                            <span className="text-sm font-bold text-[#112250]">
                              {order.order_code || `#${order.id}`}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-slate-800">
                              {order.fullname || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {order.email || "-"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                            {formatDate(getOrderDate(order))}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <span className="text-sm font-bold text-slate-800">
                              {formatRupiah(order.total_price)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                            >
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CARD MOBILE */}
              <div className="divide-y divide-slate-100 md:hidden">
                {paginatedOrders.map((order) => {
                  const status = getStatus(order.payment_status);
                  const StatusIcon = status.icon;

                  return (
                    <div key={order.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#112250]">
                            {order.order_code || `#${order.id}`}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(getOrderDate(order))}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {order.fullname || "-"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.email || "-"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs text-slate-500">
                          Total transaksi
                        </span>
                        <span className="text-sm font-bold text-[#112250]">
                          {formatRupiah(order.total_price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* EMPTY STATE */}
              {paginatedOrders.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Receipt size={27} />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Tidak ada transaksi
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Belum ada transaksi yang sesuai dengan pencarian atau filter.
                  </p>
                </div>
              )}

              {/* PAGINATION */}
              {filteredOrders.length > 0 && (
                <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                  <p className="text-xs text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-800">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>
                    {" - "}
                    <span className="font-semibold text-slate-800">
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredOrders.length
                      )}
                    </span>
                    {" dari "}
                    <span className="font-semibold text-slate-800">
                      {filteredOrders.length}
                    </span>{" "}
                    transaksi
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span className="px-3 text-sm font-medium text-slate-600">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* INFORMASI */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <CircleDollarSign
                size={21}
                className="mt-0.5 shrink-0 text-blue-700"
              />

              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Informasi perhitungan pendapatan
                </p>
                <p className="mt-1 text-xs leading-relaxed text-blue-700">
                  Total pendapatan dihitung dari jumlah total transaksi
                  yang berstatus Paid. Transaksi Pending dan Gagal tidak
                  dimasukkan ke dalam total pendapatan.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

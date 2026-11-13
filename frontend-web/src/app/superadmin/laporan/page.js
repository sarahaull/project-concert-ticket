"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Wallet,
  ShoppingBag,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Search,
  CalendarDays,
  Filter,
  AlertCircle,
  Ticket,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
const API_BASE = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const firstDayOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const ITEMS_PER_PAGE = 10;

/* ==========================================
   KOMPONEN UI
========================================== */

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e0e8f0]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#7e91b2]">
            {title}
          </p>
          <h3 className="mt-1 break-words text-lg font-extrabold leading-tight tracking-tight text-[#112250] sm:text-xl">
            {value}
          </h3>
        </div>
      </div>
      <p className="mt-3 truncate text-[11px] font-medium text-[#7e91b2]">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  let style = "bg-gray-100 text-gray-600 border-gray-200";
  if (normalized === "paid") {
    style = "bg-[#112250] text-white border-[#112250]";
  } else if (normalized === "pending") {
    style = "bg-gray-50 text-gray-500 border-gray-200 border-dashed";
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

/* ==========================================
   PAGINATION HELPER
========================================== */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

/* ==========================================
   MAIN PAGE
========================================== */

export default function LaporanSuperAdminPage() {
  const [startDate, setStartDate] = useState(() => firstDayOfMonth());
  const [endDate, setEndDate] = useState(() => today());
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [summary, setSummary] = useState({
    totalTransactions: 0,
    paidTransactions: 0,
    pendingTransactions: 0,
    otherTransactions: 0,
    revenue: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      setCurrentPage(1);

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!token)
          throw new Error("Token login tidak ditemukan. Silakan login kembali.");

        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (status !== "All") params.set("status", status);

        const response = await fetch(
          `${API_BASE}/sadmin/reports?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(data.message || "Gagal mengambil data laporan.");

        setSummary({
          totalTransactions: Number(data.summary?.totalTransactions || 0),
          paidTransactions: Number(data.summary?.paidTransactions || 0),
          pendingTransactions: Number(data.summary?.pendingTransactions || 0),
          otherTransactions: Number(data.summary?.otherTransactions || 0),
          revenue: Number(data.summary?.revenue || 0),
        });

        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : []
        );
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil laporan.");
        setTransactions([]);
        setSummary({
          totalTransactions: 0,
          paidTransactions: 0,
          pendingTransactions: 0,
          otherTransactions: 0,
          revenue: 0,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [startDate, endDate, status]
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return transactions;
    return transactions.filter((item) =>
      [
        item.order_code,
        item.buyer_name,
        item.buyer_email,
        item.event_names,
        item.payment_status,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    );
  }, [transactions, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    if (!filteredTransactions.length) {
      alert("Tidak ada data transaksi untuk diekspor.");
      return;
    }
    const headers = [
      "Kode Pesanan",
      "Nama Pembeli",
      "Email",
      "Event",
      "Jumlah Tiket",
      "Total Pembayaran",
      "Status Pembayaran",
      "Tanggal Transaksi",
    ];
    const rows = filteredTransactions.map((item) => [
      item.order_code,
      item.buyer_name,
      item.buyer_email,
      item.event_names,
      item.ticket_quantity,
      item.total_price,
      item.payment_status,
      formatDate(item.order_date),
    ]);
    const escapeCSV = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-ticketverse-${startDate}-${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setStartDate(firstDayOfMonth());
    setEndDate(today());
    setStatus("All");
    setSearch("");
    setCurrentPage(1);
  };

  return (
    // PERHATIKAN: Tidak ada min-h-screen atau background di sini.
    // Wrapper ini akan transparan dan mengikuti layout dashboard utamamu.
    <div className="w-full space-y-6 text-[#112250]">
      
      {/* ============ HERO HEADER ============ */}
      <section className="relative w-full overflow-hidden rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 animate-pulse rounded-full bg-[#5a8ad0]/15 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa0c0]">
              <FileText size={13} />
              <span>Super Admin / Laporan</span>
            </div>
            <h1 className="text-[26px] font-bold tracking-tight text-white sm:text-[32px]">
              Laporan Transaksi
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-[#8aa0c0]">
              Pantau performa penjualan dan pendapatan platform.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={() => fetchReports(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              disabled={loading || filteredTransactions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] px-5 py-2.5 text-xs font-bold text-[#0a1628] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(138,180,248,0.3)] disabled:opacity-50"
            >
              <Download size={14} />
              Ekspor CSV
            </button>
          </div>
        </div>
      </section>

      {/* ============ ERROR ============ */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">Gagal memuat laporan</p>
            <p className="mt-1 break-words text-xs">{error}</p>
            <button
              onClick={() => fetchReports(true)}
              className="mt-2 text-xs font-bold underline hover:text-red-900"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* ============ SUMMARY ============ */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Transaksi"
          value={formatNumber(summary.totalTransactions)}
          description="Pesanan sesuai filter"
          icon={ShoppingBag}
        />
        <StatCard
          title="Berhasil (Paid)"
          value={formatNumber(summary.paidTransactions)}
          description="Pembayaran lunas"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending"
          value={formatNumber(summary.pendingTransactions)}
          description="Menunggu pembayaran"
          icon={Clock3}
        />
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(summary.revenue)}
          description="Hanya dari status Paid"
          icon={Wallet}
        />
      </section>

      {/* ============ FILTER ============ */}
      <section className="rounded-2xl border border-[#e0e8f0]/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Filter size={16} className="text-[#112250]" />
          <h2 className="text-sm font-bold text-[#112250]">
            Filter Pencarian
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Tanggal Mulai
            </label>
            <div className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
              />
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Tanggal Akhir
            </label>
            <div className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
              />
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
            >
              <option value="All">Semua Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-1 lg:items-end">
            <button
              onClick={() => fetchReports()}
              disabled={loading}
              className="flex-1 rounded-lg bg-[#112250] py-2.5 text-xs font-bold text-white transition hover:bg-[#3B507D] disabled:opacity-50"
            >
              Terapkan
            </button>
            <button
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* ============ TABLE / LIST ============ */}
      <section className="overflow-hidden rounded-2xl border border-[#e0e8f0]/60 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <h2 className="text-sm font-bold text-[#112250]">
            Daftar Transaksi
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari kode, nama, atau event..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
            />
          </div>
        </div>

        {/* ==== DESKTOP TABLE ==== */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-gray-50">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5">Kode Pesanan</th>
                <th className="px-5 py-3.5">Pembeli</th>
                <th className="px-5 py-3.5">Event</th>
                <th className="px-5 py-3.5 text-center">Tiket</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <RefreshCw
                      size={20}
                      className="mx-auto animate-spin text-gray-400"
                    />
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      Memuat data...
                    </p>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <FileText size={24} className="mx-auto text-gray-300" />
                    <p className="mt-2 text-sm font-bold text-[#112250]">
                      Tidak ada transaksi
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Data tidak ditemukan untuk filter ini.
                    </p>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-[#112250]">
                        {item.order_code || `#${item.id}`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-bold text-[#112250]">
                        {item.buyer_name || "Pengguna"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {item.buyer_email || "-"}
                      </p>
                    </td>
                    <td className="max-w-[200px] px-5 py-3">
                      <p className="truncate text-xs font-medium text-gray-700">
                        {item.event_names || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#112250]">
                        <Ticket size={13} className="text-gray-400" />
                        {formatNumber(item.ticket_quantity)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[11px] font-medium text-gray-500">
                      {formatDate(item.order_date)}
                    </td>
                    <td className="px-5 py-3 text-xs font-bold text-[#112250]">
                      {formatRupiah(item.total_price)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.payment_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ==== MOBILE CARD LIST ==== */}
        <div className="divide-y divide-gray-100 md:hidden">
          {loading ? (
            <div className="px-5 py-10 text-center">
              <RefreshCw
                size={20}
                className="mx-auto animate-spin text-gray-400"
              />
              <p className="mt-2 text-xs font-medium text-gray-500">
                Memuat data...
              </p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <FileText size={24} className="mx-auto text-gray-300" />
              <p className="mt-2 text-sm font-bold text-[#112250]">
                Tidak ada transaksi
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Data tidak ditemukan untuk filter ini.
              </p>
            </div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#112250]">
                      {item.order_code || `#${item.id}`}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-[#112250]">
                      {item.buyer_name || "Pengguna"}
                    </p>
                    <p className="truncate text-[11px] text-gray-500">
                      {item.buyer_email || "-"}
                    </p>
                  </div>
                  <StatusBadge status={item.payment_status} />
                </div>

                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Event
                  </p>
                  <p className="line-clamp-2 text-xs font-medium text-gray-700">
                    {item.event_names || "-"}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Tiket
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-[#112250]">
                      <Ticket size={12} className="text-gray-400" />
                      {formatNumber(item.ticket_quantity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Total
                    </p>
                    <p className="mt-0.5 break-words text-xs font-bold text-[#112250]">
                      {formatRupiah(item.total_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Tanggal
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-gray-600">
                      {formatDate(item.order_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ============ PAGINATION ============ */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:px-5">
          <span className="text-[11px] font-medium text-gray-500">
            Menampilkan{" "}
            <strong className="text-[#112250]">
              {filteredTransactions.length === 0 ? 0 : startIndex + 1}
            </strong>{" "}
            -{" "}
            <strong className="text-[#112250]">
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                filteredTransactions.length
              )}
            </strong>{" "}
            dari{" "}
            <strong className="text-[#112250]">
              {filteredTransactions.length}
            </strong>{" "}
            transaksi
          </span>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                page === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-8 items-center justify-center text-gray-400"
                  >
                    <MoreHorizontal size={14} />
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-[#112250] text-white"
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
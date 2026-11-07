"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShoppingCart,
  Wallet,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ReceiptText,
  User,
  Mail,
  CalendarDays,
  Hash,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 10;

export default function PenjualanPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // FORMAT RUPIAH
  // ============================================================

  const formatRupiah = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "Rp0";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // ============================================================
  // FORMAT TANGGAL
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  };

  // ============================================================
  // FETCH ORDERS
  // ============================================================

  const fetchOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil data penjualan"
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(
        err.message ||
          "Terjadi kesalahan saat mengambil data penjualan"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // ============================================================
  // FILTER DATA
  // ============================================================

  const filteredOrders = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        String(order.order_code || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.fullname || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.email || "")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "Semua" ||
        order.payment_status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const totalOrders = orders.length;

    const paidOrders = orders.filter(
      (order) =>
        order.payment_status === "Paid"
    );

    const pendingOrders = orders.filter(
      (order) =>
        order.payment_status === "Pending"
    );

    const cancelledOrders = orders.filter(
      (order) =>
        order.payment_status ===
        "Cancelled"
    );

    const expiredOrders = orders.filter(
      (order) =>
        order.payment_status ===
        "Expired"
    );

    const totalRevenue =
      paidOrders.reduce(
        (total, order) =>
          total +
          Number(order.total_price || 0),
        0
      );

    return {
      totalOrders,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      cancelledOrders:
        cancelledOrders.length,
      expiredOrders:
        expiredOrders.length,
      totalRevenue,
    };
  }, [orders]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedOrders =
    filteredOrders.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ============================================================
  // STATUS
  // ============================================================

  const getStatusConfig = (status) => {
    switch (status) {
      case "Paid":
        return {
          label: "Paid",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };

      case "Pending":
        return {
          label: "Pending",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock3,
        };

      case "Cancelled":
        return {
          label: "Cancelled",
          className:
            "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };

      case "Expired":
        return {
          label: "Expired",
          className:
            "bg-slate-100 text-slate-600 border-slate-200",
          icon: AlertCircle,
        };

      default:
        return {
          label: status || "-",
          className:
            "bg-slate-100 text-slate-600 border-slate-200",
          icon: AlertCircle,
        };
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

              <p className="text-sm font-medium text-slate-500">
                Memuat data penjualan...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Organizer
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Penjualan
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm text-slate-500">
              Pantau transaksi tiket dan status
              pembayaran yang masuk ke sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {refreshing
              ? "Memuat..."
              : "Refresh"}
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Gagal memuat data
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchOrders()
                }
                className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL ORDER */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Order
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {summary.totalOrders}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Semua transaksi
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <ReceiptText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* PENDAPATAN */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Pendapatan
                </p>

                <p className="mt-2 truncate text-xl font-bold text-slate-900">
                  {formatRupiah(
                    summary.totalRevenue
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Dari order Paid
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* PAID */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pembayaran Berhasil
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {summary.paidOrders}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Order berstatus Paid
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Menunggu Pembayaran
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {summary.pendingOrders}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Order masih Pending
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            FILTER
        ====================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari kode order atau customer..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS */}

            <div className="flex flex-wrap gap-2">
              {[
                "Semua",
                "Paid",
                "Pending",
                "Cancelled",
                "Expired",
              ].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      status
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    statusFilter === status
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Daftar Penjualan
                </h2>

                <p className="text-sm text-slate-500">
                  {filteredOrders.length} transaksi
                  ditemukan
                </p>
              </div>

              <div className="text-xs text-slate-400">
                Halaman {currentPage} dari{" "}
                {totalPages}
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tanggal
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map(
                    (order) => {
                      const status =
                        getStatusConfig(
                          order.payment_status
                        );

                      const StatusIcon =
                        status.icon;

                      return (
                        <tr
                          key={order.id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* ORDER */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                <Hash className="h-4 w-4 text-blue-600" />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {order.order_code ||
                                    "-"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  ID #{order.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CUSTOMER */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                <User className="h-4 w-4 text-slate-500" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800">
                                  {order.fullname ||
                                    "Customer"}
                                </p>

                                <p className="flex max-w-[220px] items-center gap-1 truncate text-xs text-slate-400">
                                  <Mail className="h-3 w-3 shrink-0" />

                                  {order.email ||
                                    "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays className="h-4 w-4 text-slate-400" />

                              {formatDate(
                                order.order_date
                              )}
                            </div>
                          </td>

                          {/* TOTAL */}

                          <td className="px-5 py-4 text-right">
                            <p className="font-bold text-slate-900">
                              {formatRupiah(
                                order.total_price
                              )}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />

                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                          <ReceiptText className="h-6 w-6 text-slate-400" />
                        </div>

                        <h3 className="mt-4 font-bold text-slate-800">
                          Tidak ada transaksi
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Belum ada data yang
                          sesuai dengan pencarian
                          atau filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}

          <div className="divide-y divide-slate-100 md:hidden">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map(
                (order) => {
                  const status =
                    getStatusConfig(
                      order.payment_status
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <div
                      key={order.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <ReceiptText className="h-4 w-4 text-blue-600" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {order.order_code ||
                                "-"}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID #{order.id}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />

                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-slate-400" />

                          <div>
                            <p className="text-xs text-slate-400">
                              Customer
                            </p>

                            <p className="text-sm font-semibold text-slate-800">
                              {order.fullname ||
                                "Customer"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-slate-400" />

                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">
                              Email
                            </p>

                            <p className="truncate text-sm text-slate-600">
                              {order.email ||
                                "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          <div>
                            <p className="text-xs text-slate-400">
                              Tanggal Order
                            </p>

                            <p className="text-sm text-slate-600">
                              {formatDate(
                                order.order_date
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm font-medium text-slate-500">
                          Total
                        </span>

                        <span className="text-base font-bold text-slate-900">
                          {formatRupiah(
                            order.total_price
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <ReceiptText className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  Tidak ada transaksi
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada data yang sesuai.
                </p>
              </div>
            )}
          </div>

          {/* ====================================================
              PAGINATION
          ==================================================== */}

          {filteredOrders.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) *
                    ITEMS_PER_PAGE +
                    1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,
                    filteredOrders.length
                  )}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {filteredOrders.length}
                </span>{" "}
                transaksi
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-bold text-white">
                  {currentPage}
                </div>

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================
            INFO
        ====================================================== */}

        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="text-sm font-bold text-blue-900">
                Informasi penjualan
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Organizer hanya memantau transaksi
                dari halaman ini. Order berstatus
                Pending masih menunggu pembayaran
                dari customer dan tidak memerlukan
                approval manual dari organizer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
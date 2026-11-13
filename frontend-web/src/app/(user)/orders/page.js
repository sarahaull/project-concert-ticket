"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Loader2,
  Receipt,
  Search,
  Ticket,
  XCircle,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Music2,
  Info,
  MapPin,
  CircleDollarSign,
  Sparkles,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const ORDER_API = `${API_BASE}/api/orders`;
const PAYMENT_STATUS_API = `${API_BASE}/api/payments/midtrans-status`;

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "-";
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function firstValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ""
  );
}

function normalizeOrder(order) {
  const details =
    order.order_details ||
    order.orderDetails ||
    order.details ||
    order.items ||
    [];

  const detailList = Array.isArray(details)
    ? details
    : details
      ? [details]
      : [];

  const event = order.event || order.events || {};

  const detailQuantity = detailList.reduce((total, detail) => {
    return total + (Number(detail.quantity) || 0);
  }, 0);

  const quantity =
    Number(
      firstValue(
        order.quantity,
        order.total_quantity,
        order.totalQuantity,
        detailQuantity,
        0
      )
    ) || 0;

  const categoryNames = detailList
    .map((detail) =>
      firstValue(
        detail.category_name,
        detail.ticket_category_name,
        detail.categoryName,
        detail.ticketCategoryName
      )
    )
    .filter(Boolean);

  const categoryName = firstValue(
    order.category_name,
    order.ticket_category_name,
    order.categoryName,
    order.ticketCategoryName,
    [...new Set(categoryNames)].join(", ")
  );

  const eventName = firstValue(
    order.event_name,
    order.eventName,
    order.event_title,
    order.eventTitle,
    event.event_name,
    event.eventName,
    event.title,
    event.name
  );

  const totalPrice =
    Number(
      firstValue(order.total_price, order.totalPrice, order.total, 0)
    ) || 0;

  return {
    ...order,
    id: order.id,
    order_code: firstValue(order.order_code, order.orderCode, order.code),
    payment_status: firstValue(
      order.payment_status,
      order.paymentStatus,
      order.status
    ),
    event_id: firstValue(order.event_id, order.eventId, event.id),
    event_name: eventName,
    category_name: categoryName,
    quantity,
    total_price: totalPrice,
    order_date: firstValue(
      order.order_date,
      order.orderDate,
      order.created_at,
      order.createdAt
    ),
    event_date: firstValue(
      order.event_date,
      order.eventDate,
      event.event_date,
      event.eventDate
    ),
    event_time: firstValue(
      order.event_time,
      order.eventTime,
      event.event_time,
      event.eventTime
    ),
    venue_name: firstValue(
      order.venue_name,
      order.venueName,
      order.location,
      event.venue_name,
      event.venueName,
      event.location
    ),
    city: order.city || "",
    details: detailList,
  };
}

function isPaidStatus(status) {
  return ["paid", "success", "settlement"].includes(normalizeStatus(status));
}

function isPendingStatus(status) {
  return normalizeStatus(status) === "pending";
}

function isCancelledStatus(status) {
  return ["cancelled", "canceled"].includes(normalizeStatus(status));
}

function isFailedStatus(status) {
  return ["failed", "deny"].includes(normalizeStatus(status));
}

function getStatusConfig(status) {
  if (isPaidStatus(status)) {
    return {
      label: "Pembayaran Berhasil",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
      dot: "bg-emerald-500",
    };
  }
  if (isPendingStatus(status)) {
    return {
      label: "Menunggu Pembayaran",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
      dot: "bg-amber-500",
    };
  }
  if (isCancelledStatus(status)) {
    return {
      label: "Dibatalkan",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
      dot: "bg-red-500",
    };
  }
  if (normalizeStatus(status) === "expired") {
    return {
      label: "Kedaluwarsa",
      className: "border-slate-200 bg-slate-100 text-slate-600",
      icon: AlertCircle,
      dot: "bg-slate-400",
    };
  }
  if (isFailedStatus(status)) {
    return {
      label: "Pembayaran Gagal",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: AlertCircle,
      dot: "bg-red-500",
    };
  }
  return {
    label: status || "Status Tidak Diketahui",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: Receipt,
    dot: "bg-slate-400",
  };
}

function getStatusDescription(status) {
  if (isPaidStatus(status)) {
    return {
      title: "Pembayaran berhasil dikonfirmasi",
      description:
        "Pembayaran kamu telah diterima. Tiket dapat dilihat melalui halaman Tiket Saya setelah tiket berhasil diterbitkan oleh sistem.",
      className: "border-emerald-100 bg-emerald-50/50 text-emerald-800",
      icon: CheckCircle2,
    };
  }
  if (isPendingStatus(status)) {
    return {
      title: "Pesanan sedang menunggu pembayaran",
      description:
        "Transaksi sudah dibuat, tetapi pembayaran belum dikonfirmasi oleh Midtrans. Status pesanan akan diperbarui setelah sistem menerima konfirmasi pembayaran.",
      className: "border-amber-100 bg-amber-50/50 text-amber-800",
      icon: Clock3,
    };
  }
  if (isCancelledStatus(status)) {
    return {
      title: "Pesanan telah dibatalkan",
      description:
        "Transaksi ini telah dibatalkan sehingga tiket belum dapat diterbitkan.",
      className: "border-red-100 bg-red-50/50 text-red-800",
      icon: XCircle,
    };
  }
  if (normalizeStatus(status) === "expired") {
    return {
      title: "Batas waktu pembayaran telah berakhir",
      description:
        "Pesanan sudah melewati batas waktu pembayaran. Silakan melakukan pemesanan baru jika ingin membeli tiket.",
      className: "border-slate-200 bg-slate-50 text-slate-700",
      icon: AlertCircle,
    };
  }
  if (isFailedStatus(status)) {
    return {
      title: "Pembayaran tidak berhasil",
      description:
        "Transaksi belum berhasil diproses. Silakan lakukan pemesanan kembali jika ingin membeli tiket.",
      className: "border-red-100 bg-red-50/50 text-red-800",
      icon: AlertCircle,
    };
  }
  return {
    title: "Status pesanan belum diketahui",
    description:
      "Status transaksi belum dapat dikenali. Silakan perbarui data atau hubungi administrator jika masalah berlanjut.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Info,
  };
}

async function parseApiResponse(response) {
  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error("Respons server tidak valid.");
  }
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Sesi login berakhir. Silakan login kembali.");
  }
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Permintaan gagal (${response.status}).`);
  }
  return data;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const requestInProgress = useRef(false);
  const mountedRef = useRef(false);

  const getAuthToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const requestOrders = useCallback(async (token) => {
    const response = await fetch(ORDER_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const data = await parseApiResponse(response);
    const rawOrders = Array.isArray(data.orders)
      ? data.orders
      : Array.isArray(data.data)
        ? data.data
        : [];
    return rawOrders.map(normalizeOrder);
  }, []);

  const checkPendingPayment = useCallback(async (orderCode, token) => {
    if (!orderCode) return null;
    try {
      const response = await fetch(
        `${PAYMENT_STATUS_API}/${encodeURIComponent(orderCode)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );
      const data = await parseApiResponse(response);
      if (!data.success) return null;
      return {
        order_code: data.order_code || orderCode,
        payment_status: data.payment_status,
        transaction_status: data.transaction_status,
        payment_method: data.payment_method,
      };
    } catch (err) {
      console.warn(`Gagal memeriksa status ${orderCode}:`, err.message);
      return null;
    }
  }, []);

  const fetchOrders = useCallback(
    async (showLoading = true, checkPayments = true) => {
      if (requestInProgress.current) return;
      requestInProgress.current = true;

      try {
        if (showLoading) setLoading(true);
        else setRefreshing(true);

        setError("");
        const token = getAuthToken();

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const currentOrders = await requestOrders(token);

        if (!mountedRef.current) return;
        setOrders(currentOrders);

        const pendingOrders = currentOrders.filter(
          (order) => isPendingStatus(order.payment_status) && order.order_code
        );

        if (checkPayments && pendingOrders.length > 0) {
          const statusResults = await Promise.allSettled(
            pendingOrders.map((order) =>
              checkPendingPayment(order.order_code, token)
            )
          );

          const hasStatusResponse = statusResults.some(
            (result) =>
              result.status === "fulfilled" && result.value !== null
          );

          if (hasStatusResponse && mountedRef.current) {
            const updatedOrders = await requestOrders(token);
            if (mountedRef.current) setOrders(updatedOrders);
          }
        }
      } catch (err) {
        console.error("GET ORDERS ERROR:", err);
        if (mountedRef.current) {
          setError(
            err.message || "Terjadi kesalahan saat mengambil riwayat pesanan."
          );
        }
      } finally {
        requestInProgress.current = false;
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [getAuthToken, requestOrders, checkPendingPayment]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders(true, true);
    const interval = window.setInterval(() => {
      fetchOrders(false, true);
    }, 15000);
    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
    };
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const status = normalizeStatus(order.payment_status);
      let matchesStatus = filterStatus === "all";
      if (filterStatus === "paid") matchesStatus = isPaidStatus(status);
      if (filterStatus === "pending") matchesStatus = isPendingStatus(status);
      if (filterStatus === "cancelled") matchesStatus = isCancelledStatus(status);
      if (filterStatus === "expired") matchesStatus = status === "expired";
      if (filterStatus === "failed") matchesStatus = isFailedStatus(status);

      const searchableText = [order.order_code, order.event_name, order.category_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!keyword || searchableText.includes(keyword));
    });
  }, [orders, search, filterStatus]);

  const statusCounts = useMemo(() => {
    const count = (callback) =>
      orders.filter((order) => callback(order.payment_status)).length;
    return {
      all: orders.length,
      paid: count(isPaidStatus),
      pending: count(isPendingStatus),
      cancelled: count(isCancelledStatus),
      expired: count((status) => normalizeStatus(status) === "expired"),
      failed: count(isFailedStatus),
    };
  }, [orders]);

  const totalPaid = useMemo(() => {
    return orders
      .filter((order) => isPaidStatus(order.payment_status))
      .reduce((total, order) => total + Number(order.total_price || 0), 0);
  }, [orders]);

  return (
    <div className="w-full min-w-0 space-y-6 text-[#112250] pb-12">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0D1F42] via-[#112250] to-[#1A326A] shadow-[0_20px_50px_-15px_rgba(17,34,80,0.3)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-16 bottom-[-100px] h-56 w-56 rounded-full bg-[#E5C27A]/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative w-full px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#E5C27A] backdrop-blur-md">
                <Sparkles size={13} />
                Riwayat Transaksi
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Pesanan Saya
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100/80">
                Pantau seluruh transaksi, status pembayaran, dan informasi
                pemesanan tiket acara kamu dalam satu tempat.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fetchOrders(false, true)}
                disabled={refreshing || loading}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : "transition group-hover:rotate-180"}
                />
                Perbarui Data
              </button>

              <Link
                href="/cari-acara"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E5C27A] px-6 py-3 text-xs font-bold text-[#112250] shadow-[0_0_20px_rgba(229,194,122,0.3)] transition hover:-translate-y-0.5 hover:bg-[#d8b46b] hover:shadow-[0_0_30px_rgba(229,194,122,0.5)]"
              >
                <Ticket size={16} />
                Cari Acara
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Receipt size={22} />}
          label="Total Pesanan"
          value={statusCounts.all}
          description="Seluruh transaksi"
          className="bg-blue-50 text-blue-600"
          accentColor="bg-blue-400"
        />
        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          label="Berhasil"
          value={statusCounts.paid}
          description={formatRupiah(totalPaid)}
          className="bg-emerald-50 text-emerald-600"
          accentColor="bg-emerald-400"
        />
        <SummaryCard
          icon={<Clock3 size={22} />}
          label="Pending"
          value={statusCounts.pending}
          description="Menunggu Midtrans"
          className="bg-amber-50 text-amber-600"
          accentColor="bg-amber-400"
        />
        <SummaryCard
          icon={<XCircle size={22} />}
          label="Tidak Berhasil"
          value={statusCounts.cancelled + statusCounts.expired + statusCounts.failed}
          description="Batal, kedaluwarsa, gagal"
          className="bg-red-50 text-red-600"
          accentColor="bg-red-400"
        />
      </div>

      <section className="rounded-[24px] border border-[#DDE4ED] bg-white p-5 shadow-[0_8px_30px_rgba(17,34,80,0.04)] sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="relative w-full">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kode pesanan, nama event, atau kategori..."
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm text-[#112250] outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>
              Semua ({statusCounts.all})
            </FilterButton>
            <FilterButton active={filterStatus === "paid"} onClick={() => setFilterStatus("paid")}>
              Berhasil ({statusCounts.paid})
            </FilterButton>
            <FilterButton active={filterStatus === "pending"} onClick={() => setFilterStatus("pending")}>
              Pending ({statusCounts.pending})
            </FilterButton>
            <FilterButton active={filterStatus === "cancelled"} onClick={() => setFilterStatus("cancelled")}>
              Dibatalkan ({statusCounts.cancelled})
            </FilterButton>
            <FilterButton active={filterStatus === "expired"} onClick={() => setFilterStatus("expired")}>
              Kedaluwarsa ({statusCounts.expired})
            </FilterButton>
            <FilterButton active={filterStatus === "failed"} onClick={() => setFilterStatus("failed")}>
              Gagal ({statusCounts.failed})
            </FilterButton>
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex min-h-[400px] items-center justify-center rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.04)]">
          <div className="text-center">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] shadow-inner">
              <Loader2 size={30} className="animate-spin text-[#112250]" />
            </div>
            <p className="mt-5 text-sm font-bold text-[#112250]">
              Memuat riwayat pesanan...
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Mengambil informasi transaksi kamu
            </p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[24px] border border-red-200 bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.04)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#112250]">
                Gagal mengambil pesanan
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchOrders(true, true)}
                className="mt-5 rounded-xl bg-[#112250] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1A326A]"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="rounded-[24px] border border-[#DDE4ED] bg-white px-6 py-20 text-center shadow-[0_8px_30px_rgba(17,34,80,0.04)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#EEF3F9] to-[#E1EAF6] text-[#526B92] ring-4 ring-white shadow-inner">
            <Receipt size={36} />
          </div>
          <h2 className="mt-6 text-xl font-bold text-[#112250]">
            {orders.length === 0 ? "Belum Ada Pesanan" : "Pesanan Tidak Ditemukan"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            {orders.length === 0
              ? "Kamu belum memiliki transaksi. Temukan acara menarik dan pesan tiket melalui TicketVerse."
              : "Tidak ada pesanan yang sesuai dengan kata kunci atau filter yang dipilih."}
          </p>
          {orders.length === 0 && (
            <Link
              href="/cari-acara"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#112250]/20 transition hover:-translate-y-0.5 hover:bg-[#1A326A]"
            >
              <Ticket size={18} />
              Cari Acara
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#112250]">
                Daftar Transaksi
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredOrders.length} dari {orders.length} pesanan
              </p>
            </div>
            {refreshing && (
              <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#112250] shadow-sm ring-1 ring-slate-200">
                <Loader2 size={14} className="animate-spin" />
                Memperbarui
              </span>
            )}
          </div>

          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const status = getStatusConfig(order.payment_status);
  const statusInfo = getStatusDescription(order.payment_status);
  const StatusIcon = status.icon;
  const DescriptionIcon = statusInfo.icon;

  const eventName = order.event_name || "Informasi event belum tersedia";
  const categoryName = order.category_name || "Kategori tiket belum tersedia";
  const quantity = Number(order.quantity) || 0;
  const total = Number(order.total_price) || 0;
  const isPaid = isPaidStatus(order.payment_status);

  const hasIncompleteData =
    !order.event_name || !order.category_name || quantity <= 0;

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(17,34,80,0.1)]">
      <div className={`absolute left-0 top-0 h-full w-1.5 ${status.dot}`} />

      <div className="p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3F9] text-[#112250] ring-1 ring-[#DDE4ED]">
              <Ticket size={26} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#8A96A8]">
                  Kode Pesanan
                </p>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {order.order_code || `ORDER-${order.id}`}
                </span>
              </div>
              <h2 className="mt-1.5 text-xl font-bold leading-snug text-[#112250]">
                {eventName}
              </h2>
            </div>
          </div>

          <div className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold shadow-sm ${status.className}`}>
            <StatusIcon size={15} />
            {status.label}
          </div>
        </div>

        <div className={`mt-6 rounded-2xl border p-4 sm:p-5 ${statusInfo.className}`}>
          <div className="flex items-start gap-3.5">
            <DescriptionIcon size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold">{statusInfo.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed opacity-90 sm:text-sm">
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        {hasIncompleteData && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50 p-3.5 text-orange-800">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-5">
              Sebagian informasi detail tiket belum tersedia pada respons server.
              Periksa kembali data relasi detail pesanan pada backend.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-5 border-t border-dashed border-slate-200 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrderInfo icon={<Ticket size={18} />} label="Kategori Tiket" value={categoryName} />
          <OrderInfo icon={<Music2 size={18} />} label="Jumlah Tiket" value={`${quantity} tiket`} />
          <OrderInfo icon={<CalendarDays size={18} />} label="Tanggal Pemesanan" value={formatDate(order.order_date)} />
          <OrderInfo icon={<CreditCard size={18} />} label="Total Pesanan" value={formatRupiah(total)} />
        </div>

        {(order.event_date || order.event_time || order.venue_name || order.city) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-[#F8FAFC] px-5 py-4 border border-slate-100">
            {order.event_date && (
              <div className="flex items-center gap-2 text-sm text-[#52627A]">
                <CalendarDays size={16} className="text-[#112250]" />
                <span className="font-medium">{formatDate(order.event_date)}</span>
              </div>
            )}
            {order.event_time && (
              <div className="flex items-center gap-2 text-sm text-[#52627A]">
                <Clock3 size={16} className="text-[#112250]" />
                <span className="font-medium">{formatTime(order.event_time)} WIB</span>
              </div>
            )}
            {(order.venue_name || order.city) && (
              <div className="flex items-center gap-2 text-sm text-[#52627A]">
                <MapPin size={16} className="text-[#112250]" />
                <span className="font-medium">
                  {[order.venue_name, order.city].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        )}

        {Array.isArray(order.details) && order.details.length > 1 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-[#F8FAFC] px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526B92]">
                Rincian Kategori Tiket
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {order.details.map((detail, index) => (
                <div key={detail.id || `${detail.ticket_category_id}-${index}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#112250]">
                      {detail.category_name || detail.ticket_category_name || "Kategori tiket"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {Number(detail.quantity) || 0} tiket × {formatRupiah(detail.price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#112250]">
                    {formatRupiah(detail.subtotal || Number(detail.price || 0) * Number(detail.quantity || 0))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 border-t border-dashed border-slate-200 bg-[#F8FAFC] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#98A3B2]">
            Total Pembayaran
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-[#112250] [text-shadow:0_0_20px_rgba(17,34,80,0.15)]">
            {formatRupiah(total)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isPaid && (
            <Link
              href="/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] bg-white px-5 py-3 text-sm font-bold text-[#526B92] shadow-sm transition hover:border-[#112250] hover:text-[#112250]"
            >
              <Ticket size={17} />
              Lihat Tiket
            </Link>
          )}
          {order.id && (
            <Link
              href={`/orders/${order.id}`}
              className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#112250] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(17,34,80,0.2)] transition hover:bg-[#1A326A] hover:shadow-[0_12px_28px_rgba(17,34,80,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Detail Pesanan
                <ChevronRight size={17} className="transition group-hover/btn:translate-x-0.5" />
              </span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function SummaryCard({ icon, label, value, description, className, accentColor }) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#DDE4ED] bg-white p-5 shadow-[0_4px_20px_rgba(17,34,80,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(17,34,80,0.08)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentColor} opacity-0 transition duration-300 group-hover:opacity-100`} />
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}>
          {icon}
        </div>
        <CircleDollarSign size={20} className="text-slate-200 transition group-hover:text-[#E5C27A]" />
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-[#112250]">{value}</p>
      <p className="mt-2 text-[11px] font-medium text-slate-400">{description}</p>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
        active
          ? "bg-[#112250] text-white shadow-md shadow-[#112250]/20"
          : "border border-transparent bg-[#F8FAFC] text-[#526B92] hover:bg-slate-200/50 hover:text-[#112250]"
      }`}
    >
      {children}
    </button>
  );
}

function OrderInfo({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#526B92]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#98A3B2]">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-bold leading-5 text-[#112250]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
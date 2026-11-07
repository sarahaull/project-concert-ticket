"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  const firstDetail = detailList[0] || {};

  const event =
    order.event ||
    order.events ||
    firstDetail.event ||
    firstDetail.events ||
    {};

  const category =
    order.ticket_category ||
    order.ticketCategory ||
    order.category ||
    firstDetail.ticket_category ||
    firstDetail.ticketCategory ||
    firstDetail.category ||
    {};

  const eventName = firstValue(
    order.event_name,
    order.eventName,
    order.event_title,
    order.eventTitle,
    event.event_name,
    event.eventName,
    event.title,
    event.name,
    firstDetail.event_name,
    firstDetail.eventName
  );

  const categoryName = firstValue(
    order.category_name,
    order.ticket_category_name,
    order.categoryName,
    order.ticketCategoryName,
    category.category_name,
    category.categoryName,
    category.name,
    firstDetail.category_name,
    firstDetail.ticket_category_name,
    firstDetail.categoryName,
    firstDetail.ticketCategoryName
  );

  const detailQuantity = detailList.reduce((total, detail) => {
    return total + (Number(detail.quantity) || 0);
  }, 0);

  const quantity = Number(
    firstValue(
      order.quantity,
      order.total_quantity,
      order.totalQuantity,
      detailQuantity,
      0
    )
  ) || 0;

  const total = Number(
    firstValue(
      order.total_price,
      order.totalPrice,
      order.total,
      order.subtotal,
      0
    )
  ) || 0;

  return {
    ...order,
    id: order.id,
    order_code: firstValue(
      order.order_code,
      order.orderCode,
      order.code
    ),
    payment_status: firstValue(
      order.payment_status,
      order.paymentStatus,
      order.status
    ),
    event_name: eventName,
    category_name: categoryName,
    quantity,
    total_price: total,
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
    details: detailList,
  };
}

function getStatusConfig(status) {
  switch (normalizeStatus(status)) {
    case "paid":
    case "success":
    case "settlement":
      return {
        label: "Pembayaran Berhasil",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
      };

    case "pending":
      return {
        label: "Menunggu Pembayaran",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Dibatalkan",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
      };

    case "expired":
      return {
        label: "Kadaluarsa",
        className: "border-slate-200 bg-slate-100 text-slate-600",
        icon: AlertCircle,
      };

    case "failed":
    case "deny":
      return {
        label: "Pembayaran Gagal",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: AlertCircle,
      };

    default:
      return {
        label: status || "Status Tidak Diketahui",
        className: "border-slate-200 bg-slate-100 text-slate-600",
        icon: Receipt,
      };
  }
}

function getStatusDescription(status) {
  switch (normalizeStatus(status)) {
    case "paid":
    case "success":
    case "settlement":
      return {
        title: "Pembayaran berhasil dikonfirmasi",
        description:
          "Pembayaran kamu telah diterima. Tiket dapat dilihat melalui halaman Tiket Saya setelah tiket berhasil diterbitkan.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: CheckCircle2,
      };

    case "pending":
      return {
        title: "Pesanan sedang menunggu pembayaran",
        description:
          "Transaksi sudah dibuat, tetapi pembayaran belum dikonfirmasi oleh Midtrans. Setelah pembayaran berhasil, status pesanan dan penerbitan tiket akan diperbarui secara otomatis.",
        className: "border-amber-200 bg-amber-50 text-amber-800",
        icon: Clock3,
      };

    case "cancelled":
    case "canceled":
      return {
        title: "Pesanan telah dibatalkan",
        description:
          "Transaksi ini telah dibatalkan sehingga tiket belum dapat diterbitkan.",
        className: "border-red-200 bg-red-50 text-red-800",
        icon: XCircle,
      };

    case "expired":
      return {
        title: "Batas waktu pembayaran telah berakhir",
        description:
          "Pesanan sudah melewati batas waktu pembayaran. Silakan melakukan pemesanan baru jika ingin membeli tiket.",
        className: "border-slate-200 bg-slate-100 text-slate-700",
        icon: AlertCircle,
      };

    case "failed":
    case "deny":
      return {
        title: "Pembayaran tidak berhasil",
        description:
          "Transaksi belum berhasil diproses. Silakan lakukan pemesanan kembali jika ingin membeli tiket.",
        className: "border-red-200 bg-red-50 text-red-800",
        icon: AlertCircle,
      };

    default:
      return {
        title: "Status pesanan belum diketahui",
        description:
          "Status transaksi belum dapat dikenali. Silakan muat ulang halaman.",
        className: "border-slate-200 bg-slate-50 text-slate-700",
        icon: Info,
      };
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(ORDER_API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

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
        return;
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Gagal mengambil data pesanan.");
      }

      const rawOrders = Array.isArray(data.orders)
        ? data.orders
        : Array.isArray(data.data)
          ? data.data
          : [];

      const normalizedOrders = rawOrders.map(normalizeOrder);

      setOrders(normalizedOrders);

      const pendingOrders = normalizedOrders.filter(
        (order) =>
          normalizeStatus(order.payment_status) === "pending" &&
          order.order_code
      );

      if (pendingOrders.length > 0) {
        await Promise.allSettled(
          pendingOrders.map((order) =>
            fetch(
              `${PAYMENT_STATUS_API}/${encodeURIComponent(order.order_code)}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
                cache: "no-store",
              }
            )
          )
        );

        const updatedResponse = await fetch(ORDER_API, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();

          if (Array.isArray(updatedData.orders)) {
            setOrders(updatedData.orders.map(normalizeOrder));
          }
        }
      }
    } catch (err) {
      console.error("GET ORDERS ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil pesanan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeStatus(order.payment_status);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "paid" &&
          ["paid", "success", "settlement"].includes(status)) ||
        (filterStatus === "pending" && status === "pending") ||
        (filterStatus === "cancelled" &&
          ["cancelled", "canceled"].includes(status)) ||
        (filterStatus === "expired" && status === "expired") ||
        (filterStatus === "failed" &&
          ["failed", "deny"].includes(status));

      const searchableText = [
        order.order_code,
        order.event_name,
        order.category_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!keyword || searchableText.includes(keyword))
      );
    });
  }, [orders, search, filterStatus]);

  const statusCounts = useMemo(() => {
    const count = (statuses) =>
      orders.filter((order) =>
        statuses.includes(normalizeStatus(order.payment_status))
      ).length;

    return {
      all: orders.length,
      paid: count(["paid", "success", "settlement"]),
      pending: count(["pending"]),
      cancelled: count(["cancelled", "canceled"]),
      expired: count(["expired"]),
      failed: count(["failed", "deny"]),
    };
  }, [orders]);

  const totalPaid = useMemo(() => {
    return orders
      .filter((order) =>
        ["paid", "success", "settlement"].includes(
          normalizeStatus(order.payment_status)
        )
      )
      .reduce(
        (total, order) => total + Number(order.total_price || 0),
        0
      );
  }, [orders]);

  return (
    <div className="w-full min-w-0 text-[#112250]">
      <section className="relative isolate mb-6 overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-gradient-to-br from-[#112250] via-[#1A326A] to-[#3B507D] shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,194,122,0.15),transparent_50%)]" />

        <div className="relative w-full px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C27A]">
                <Receipt size={15} />
                Riwayat Transaksi
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Pesanan Saya
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Pantau seluruh transaksi, status pembayaran, dan informasi
                pemesanan tiket acara kamu.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fetchOrders(false)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Perbarui Data
              </button>

              <Link
                href="/cari-acara"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5C27A]/40 bg-[#E5C27A] px-5 py-2.5 text-xs font-bold text-[#112250] shadow-sm transition hover:bg-[#d8b46b]"
              >
                <Ticket size={16} />
                Cari Acara
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Receipt size={21} />}
          label="Total Pesanan"
          value={statusCounts.all}
          description="Seluruh transaksi"
          className="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          icon={<CheckCircle2 size={21} />}
          label="Pembayaran Berhasil"
          value={statusCounts.paid}
          description={formatRupiah(totalPaid)}
          className="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          icon={<Clock3 size={21} />}
          label="Menunggu Pembayaran"
          value={statusCounts.pending}
          description="Menunggu konfirmasi Midtrans"
          className="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          icon={<XCircle size={21} />}
          label="Tidak Berhasil"
          value={
            statusCounts.cancelled +
            statusCounts.expired +
            statusCounts.failed
          }
          description="Dibatalkan, kadaluarsa, atau gagal"
          className="bg-red-50 text-red-600"
        />
      </div>

      <section className="mt-6 mb-7 rounded-2xl border border-[#D8D0C4]/40 bg-white p-4 shadow-lg sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B907F]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kode pesanan, nama event, atau kategori..."
              className="w-full rounded-xl border border-[#D8D0C4]/40 bg-[#F7F8FA] py-3.5 pl-11 pr-4 text-sm text-[#112250] outline-none transition placeholder:text-[#9B907F] focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filterStatus === "all"}
              onClick={() => setFilterStatus("all")}
            >
              Semua ({statusCounts.all})
            </FilterButton>

            <FilterButton
              active={filterStatus === "paid"}
              onClick={() => setFilterStatus("paid")}
            >
              Berhasil ({statusCounts.paid})
            </FilterButton>

            <FilterButton
              active={filterStatus === "pending"}
              onClick={() => setFilterStatus("pending")}
            >
              Pending ({statusCounts.pending})
            </FilterButton>

            <FilterButton
              active={filterStatus === "cancelled"}
              onClick={() => setFilterStatus("cancelled")}
            >
              Dibatalkan ({statusCounts.cancelled})
            </FilterButton>

            <FilterButton
              active={filterStatus === "expired"}
              onClick={() => setFilterStatus("expired")}
            >
              Kadaluarsa ({statusCounts.expired})
            </FilterButton>

            <FilterButton
              active={filterStatus === "failed"}
              onClick={() => setFilterStatus("failed")}
            >
              Gagal ({statusCounts.failed})
            </FilterButton>
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-[#D8D0C4]/40 bg-white shadow-lg">
          <div className="text-center">
            <Loader2
              size={34}
              className="mx-auto animate-spin text-[#112250]"
            />

            <p className="mt-4 text-sm font-semibold text-[#112250]">
              Memuat riwayat pesanan...
            </p>

            <p className="mt-1 text-xs text-[#9B907F]">
              Mengambil informasi transaksi kamu
            </p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle size={21} />
            </div>

            <div>
              <h2 className="font-bold text-[#112250]">
                Gagal mengambil pesanan
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#9B907F]">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchOrders(true)}
                className="mt-4 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-[#D8D0C4]/40 bg-white px-6 py-16 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
            <Receipt size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#112250]">
            {orders.length === 0
              ? "Belum Ada Pesanan"
              : "Pesanan Tidak Ditemukan"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9B907F]">
            {orders.length === 0
              ? "Kamu belum memiliki transaksi. Temukan acara menarik dan pesan tiket melalui TicketVerse."
              : "Tidak ada pesanan yang sesuai dengan kata kunci atau filter yang dipilih."}
          </p>

          {orders.length === 0 && (
            <Link
              href="/cari-acara"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Ticket size={18} />
              Cari Acara
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#112250]">
                Daftar Transaksi
              </h2>

              <p className="mt-1 text-xs text-[#9B907F]">
                Menampilkan {filteredOrders.length} dari {orders.length} pesanan
              </p>
            </div>

            {refreshing && (
              <span className="flex items-center gap-2 text-xs font-medium text-[#3B507D]">
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

  const eventName =
    order.event_name || "Informasi event belum tersedia";

  const categoryName =
    order.category_name || "Kategori tiket belum tersedia";

  const quantity = Number(order.quantity) || 0;
  const total = Number(order.total_price) || 0;
  const orderDate = order.order_date;

  const isPaid = [
    "paid",
    "success",
    "settlement",
  ].includes(normalizeStatus(order.payment_status));

  const hasIncompleteData =
    !order.event_name ||
    !order.category_name ||
    quantity <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[#112250]/20 hover:shadow-2xl">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#3B507D]">
              <Ticket size={23} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9B907F]">
                Kode Pesanan
              </p>

              <p className="mt-1 break-all text-sm font-extrabold text-[#112250]">
                {order.order_code || `ORDER-${order.id}`}
              </p>

              <h2 className="mt-2 text-lg font-bold leading-snug text-[#112250]">
                {eventName}
              </h2>
            </div>
          </div>

          <div
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${status.className}`}
          >
            <StatusIcon size={15} />
            {status.label}
          </div>
        </div>

        <div className={`mt-5 rounded-xl border p-4 ${statusInfo.className}`}>
          <div className="flex items-start gap-3">
            <DescriptionIcon size={19} className="mt-0.5 shrink-0" />

            <div>
              <p className="text-sm font-bold">{statusInfo.title}</p>

              <p className="mt-1 text-xs leading-6 opacity-90 sm:text-sm">
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        {hasIncompleteData && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-orange-800">
            <Info size={17} className="mt-0.5 shrink-0" />

            <p className="text-xs leading-5">
              Sebagian informasi detail tiket belum tersedia pada respons
              server. Periksa kembali relasi detail pesanan pada backend.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-5 border-t border-[#D8D0C4]/30 pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <OrderInfo
            icon={<Ticket size={18} />}
            label="Kategori Tiket"
            value={categoryName}
          />

          <OrderInfo
            icon={<Music2 size={18} />}
            label="Jumlah Tiket"
            value={`${quantity} tiket`}
          />

          <OrderInfo
            icon={<CalendarDays size={18} />}
            label="Tanggal Pemesanan"
            value={formatDate(orderDate)}
          />

          <OrderInfo
            icon={<CreditCard size={18} />}
            label="Total Pesanan"
            value={formatRupiah(total)}
          />
        </div>

        {(order.event_date || order.event_time || order.venue_name) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-[#F7F8FA] px-4 py-3.5">
            {order.event_date && (
              <div className="flex items-center gap-2 text-sm text-[#3B507D]">
                <CalendarDays size={16} className="text-[#112250]" />
                <span>{formatDate(order.event_date)}</span>
              </div>
            )}

            {order.event_time && (
              <div className="flex items-center gap-2 text-sm text-[#3B507D]">
                <Clock3 size={16} className="text-[#112250]" />
                <span>{formatTime(order.event_time)} WIB</span>
              </div>
            )}

            {order.venue_name && (
              <div className="flex items-center gap-2 text-sm text-[#3B507D]">
                <MapPin size={16} className="text-[#112250]" />
                <span>{order.venue_name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-[#D8D0C4]/30 bg-gradient-to-r from-[#F7F8FA] to-[#E5C27A]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-medium text-[#9B907F]">
            Total Pembayaran
          </p>

          <p className="mt-1 text-xl font-extrabold tracking-tight text-[#112250]">
            {formatRupiah(total)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {isPaid && (
            <Link
              href="/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/40 bg-white px-4 py-3 text-sm font-bold text-[#3B507D] transition hover:bg-[#112250]/5 hover:text-[#112250]"
            >
              <Ticket size={17} />
              Lihat Tiket
            </Link>
          )}

          {order.id && (
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Detail Pesanan
              <ChevronRight size={17} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function SummaryCard({ icon, label, value, description, className }) {
  return (
    <div className="group rounded-2xl border border-[#D8D0C4]/40 bg-white p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}>
          {icon}
        </div>

        <CircleDollarSign
          size={19}
          className="text-[#D8D0C4] transition group-hover:text-[#E5C27A]"
        />
      </div>

      <p className="mt-5 text-sm font-medium text-[#9B907F]">{label}</p>

      <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#112250]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#9B907F]">{description}</p>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition duration-200 ${
        active
          ? "bg-gradient-to-r from-[#112250] to-[#3B507D] text-white shadow-sm"
          : "border border-transparent bg-[#F7F8FA] text-[#3B507D] hover:border-[#D8D0C4]/40 hover:bg-[#112250]/5"
      }`}
    >
      {children}
    </button>
  );
}

function OrderInfo({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 shrink-0 text-[#3B507D]">{icon}</div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9B907F]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold leading-5 text-[#112250]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
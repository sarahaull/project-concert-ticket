
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  Music2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Ticket,
  XCircle,
  Copy,
  UserRound,
  Mail,
} from "lucide-react";

// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const ORDER_API = `${API_BASE}/api/orders`;
const PAYMENT_STATUS_API = `${API_BASE}/api/payments/midtrans-status`;

// =====================================================
// HELPER
// =====================================================

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

  // Handle MySQL DATE: YYYY-MM-DD without timezone conversion.
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] = value.split("-").map(Number);

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(year, month - 1, day));
  }

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
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Respons server tidak valid.");
  }
}

// =====================================================
// NORMALIZE ORDER
// Sesuai response getAllOrders() backend customer
// =====================================================

function normalizeOrder(rawOrder) {
  if (!rawOrder || typeof rawOrder !== "object") {
    return null;
  }

  const detailsRaw =
    rawOrder.order_details ||
    rawOrder.orderDetails ||
    rawOrder.details ||
    [];

  const details = Array.isArray(detailsRaw)
    ? detailsRaw
    : detailsRaw
      ? [detailsRaw]
      : [];

  const quantityFromDetails = details.reduce(
    (total, detail) => total + parseNumber(detail.quantity),
    0
  );

  const quantity = parseNumber(
    firstValue(
      rawOrder.quantity,
      rawOrder.total_quantity,
      rawOrder.totalQuantity,
      quantityFromDetails,
      0
    )
  );

  const detailSubtotal = details.reduce(
    (total, detail) => {
      const subtotal = parseNumber(detail.subtotal);

      if (subtotal > 0) return total + subtotal;

      return (
        total +
        parseNumber(detail.price) *
          parseNumber(detail.quantity)
      );
    },
    0
  );

  const categoryPrice = parseNumber(
    firstValue(
      details[0]?.price,
      rawOrder.ticket_price,
      rawOrder.category_price,
      0
    )
  );

  return {
    ...rawOrder,

    id: firstValue(
      rawOrder.id,
      rawOrder.order_id,
      rawOrder.orderId
    ),

    user_id: rawOrder.user_id,

    order_code: firstValue(
      rawOrder.order_code,
      rawOrder.orderCode,
      rawOrder.code
    ),

    payment_status: firstValue(
      rawOrder.payment_status,
      rawOrder.paymentStatus,
      rawOrder.transaction_status,
      rawOrder.transactionStatus,
      rawOrder.status
    ),

    payment_method: firstValue(
      rawOrder.payment_method,
      rawOrder.paymentMethod,
      rawOrder.payment_type,
      rawOrder.paymentType,
      rawOrder.bank
    ),

    event_id: firstValue(
      rawOrder.event_id,
      rawOrder.eventId
    ),

    event_name: firstValue(
      rawOrder.event_name,
      rawOrder.eventName,
      rawOrder.event_title,
      rawOrder.eventTitle
    ),

    artist_name: firstValue(
      rawOrder.artist_name,
      rawOrder.artistName
    ),

    event_date: firstValue(
      rawOrder.event_date,
      rawOrder.eventDate,
      rawOrder.tanggal_acara
    ),

    event_time: firstValue(
      rawOrder.event_time,
      rawOrder.eventTime,
      rawOrder.waktu_acara
    ),

    venue_name: firstValue(
      rawOrder.venue_name,
      rawOrder.venueName,
      rawOrder.location,
      rawOrder.lokasi
    ),

    city: firstValue(
      rawOrder.city,
      rawOrder.venue_city,
      rawOrder.venueCity,
      rawOrder.kota
    ),

    category_name: firstValue(
      rawOrder.category_name,
      rawOrder.ticket_category_name,
      rawOrder.categoryName,
      rawOrder.ticketCategoryName,
      details
        .map((detail) => detail.category_name)
        .filter(Boolean)
        .join(", ")
    ),

    category_price: categoryPrice,

    quantity,

    total_price: parseNumber(
      firstValue(
        rawOrder.total_price,
        rawOrder.totalPrice,
        rawOrder.total_amount,
        rawOrder.totalAmount,
        rawOrder.total,
        0
      )
    ),

    subtotal: detailSubtotal,

    order_date: firstValue(
      rawOrder.order_date,
      rawOrder.orderDate,
      rawOrder.created_at,
      rawOrder.createdAt
    ),

    updated_at: firstValue(
      rawOrder.updated_at,
      rawOrder.updatedAt
    ),

    fullname: firstValue(
      rawOrder.fullname,
      rawOrder.buyer?.fullname,
      rawOrder.user?.fullname
    ),

    email: firstValue(
      rawOrder.email,
      rawOrder.buyer?.email,
      rawOrder.user?.email
    ),

    details,
  };
}

// =====================================================
// STATUS CONFIGURATION
// =====================================================

function getStatusConfig(status) {
  switch (normalizeStatus(status)) {
    case "paid":
    case "success":
    case "settlement":
      return {
        label: "Pembayaran Berhasil",
        description: "Pembayaran telah dikonfirmasi.",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
      };

    case "pending":
      return {
        label: "Menunggu Pembayaran",
        description:
          "Menunggu konfirmasi pembayaran dari Midtrans.",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Dibatalkan",
        description: "Pesanan telah dibatalkan.",
        className:
          "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
      };

    case "expired":
      return {
        label: "Kadaluarsa",
        description: "Batas waktu pembayaran telah berakhir.",
        className:
          "border-slate-200 bg-slate-100 text-slate-600",
        icon: AlertCircle,
      };

    case "failed":
    case "deny":
      return {
        label: "Pembayaran Gagal",
        description: "Pembayaran tidak berhasil diproses.",
        className:
          "border-red-200 bg-red-50 text-red-700",
        icon: AlertCircle,
      };

    default:
      return {
        label: status || "Status Tidak Diketahui",
        description: "Status transaksi belum dapat dikenali.",
        className:
          "border-slate-200 bg-slate-100 text-slate-600",
        icon: Info,
      };
  }
}

function getStatusDetails(status) {
  switch (normalizeStatus(status)) {
    case "paid":
    case "success":
    case "settlement":
      return {
        title: "Pembayaran berhasil dikonfirmasi!",
        description:
          "Pembayaran kamu telah diterima oleh Midtrans. Tiket dapat diperiksa melalui halaman Tiket Saya setelah proses penerbitan tiket selesai.",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        icon: CheckCircle2,
      };

    case "pending":
      return {
        title: "Pesanan menunggu pembayaran",
        description:
          "Transaksi sudah dibuat, tetapi pembayaran belum dikonfirmasi. Selesaikan pembayaran sesuai instruksi Midtrans. Status pesanan akan diperbarui setelah backend menerima konfirmasi.",
        className:
          "border-amber-200 bg-amber-50 text-amber-900",
        icon: Clock3,
      };

    case "cancelled":
    case "canceled":
      return {
        title: "Pesanan telah dibatalkan",
        description:
          "Transaksi ini telah dibatalkan sehingga tiket belum diterbitkan. Silakan membuat pesanan baru jika ingin membeli tiket.",
        className:
          "border-red-200 bg-red-50 text-red-900",
        icon: XCircle,
      };

    case "expired":
      return {
        title: "Pembayaran telah kedaluwarsa",
        description:
          "Batas waktu pembayaran sudah berakhir. Silakan kembali mencari acara dan membuat pesanan baru.",
        className:
          "border-slate-200 bg-slate-100 text-slate-800",
        icon: AlertCircle,
      };

    case "failed":
    case "deny":
      return {
        title: "Pembayaran tidak berhasil",
        description:
          "Transaksi tidak berhasil diproses. Silakan periksa status transaksi sebelum membuat pesanan baru.",
        className:
          "border-red-200 bg-red-50 text-red-900",
        icon: AlertCircle,
      };

    default:
      return {
        title: "Status transaksi belum diketahui",
        description:
          "Informasi status pembayaran belum tersedia atau menggunakan status yang belum dikenali.",
        className:
          "border-slate-200 bg-slate-50 text-slate-800",
        icon: Info,
      };
  }
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusWarning, setStatusWarning] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  // ---------------------------------------------------
  // Ambil daftar pesanan customer dari backend.
  //
  // Backend getAllOrders() sudah membatasi data customer
  // berdasarkan user_id dari token.
  //
  // Tidak menggunakan GET /orders/:id karena controller
  // detail saat ini belum melakukan validasi kepemilikan.
  // ---------------------------------------------------

  const getOrdersFromBackend = useCallback(async (token) => {
    const response = await fetch(ORDER_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await readResponse(response);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
      throw new Error("Sesi login berakhir. Silakan login kembali.");
    }

    if (response.status === 403) {
      throw new Error(
        "Akun ini tidak memiliki akses ke riwayat pesanan customer."
      );
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || "Gagal mengambil data pesanan."
      );
    }

    const rawOrders = Array.isArray(data.orders)
      ? data.orders
      : Array.isArray(data.data)
        ? data.data
        : [];

    return rawOrders
      .map(normalizeOrder)
      .filter(Boolean);
  }, [router]);

  // ---------------------------------------------------
  // Sinkronisasi status Midtrans
  //
  // PENTING:
  // Endpoint backend menerima order_code,
  // bukan ID numerik order.
  // ---------------------------------------------------

  const synchronizePaymentStatus = useCallback(
    async (token, orderCode) => {
      if (!orderCode) {
        throw new Error("Kode pesanan tidak tersedia.");
      }

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

      const data = await readResponse(response);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        throw new Error("Sesi login berakhir. Silakan login kembali.");
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Gagal memeriksa status pembayaran."
        );
      }

      return data;
    },
    [router]
  );

  // ---------------------------------------------------
  // FETCH DETAIL ORDER
  // ---------------------------------------------------

  const fetchOrder = useCallback(
    async (showLoading = false) => {
      if (!orderId) {
        setError("ID pesanan tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");
        setStatusWarning("");
        setCopyMessage("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        // 1. Ambil pesanan milik customer yang sedang login.
        let orders = await getOrdersFromBackend(token);

        let currentOrder = orders.find(
          (item) => String(item.id) === String(orderId)
        );

        if (!currentOrder) {
          throw new Error(
            "Pesanan tidak ditemukan pada akun kamu."
          );
        }

        // 2. Jika pending, periksa status aktual melalui Midtrans.
        if (
          normalizeStatus(currentOrder.payment_status) === "pending" &&
          currentOrder.order_code
        ) {
          try {
            await synchronizePaymentStatus(
              token,
              currentOrder.order_code
            );

            // 3. Ambil ulang daftar pesanan setelah sinkronisasi.
            // Backend akan mengembalikan status terbaru dari database.
            orders = await getOrdersFromBackend(token);

            const latestOrder = orders.find(
              (item) => String(item.id) === String(orderId)
            );

            if (latestOrder) {
              currentOrder = latestOrder;
            }
          } catch (statusError) {
            console.error(
              "PAYMENT STATUS SYNC ERROR:",
              statusError
            );

            setStatusWarning(
              statusError.message ||
                "Status pembayaran belum dapat diperbarui dari Midtrans."
            );
          }
        }

        setOrder(currentOrder);
      } catch (err) {
        console.error("GET ORDER DETAIL ERROR:", err);

        setError(
          err.message ||
            "Terjadi kesalahan saat mengambil detail pesanan."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      orderId,
      router,
      getOrdersFromBackend,
      synchronizePaymentStatus,
    ]
  );

  useEffect(() => {
    fetchOrder(true);
  }, [fetchOrder]);

  // ---------------------------------------------------
  // AUTO REFRESH UNTUK PESANAN PENDING
  // ---------------------------------------------------

  useEffect(() => {
    if (
      !order ||
      normalizeStatus(order.payment_status) !== "pending"
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      fetchOrder(false);
    }, 20000);

    return () => window.clearInterval(interval);
  }, [order?.id, order?.payment_status, fetchOrder]);

  // ---------------------------------------------------
  // DERIVED DATA
  // ---------------------------------------------------

  const status = useMemo(
    () => getStatusConfig(order?.payment_status),
    [order?.payment_status]
  );

  const statusDetails = useMemo(
    () => getStatusDetails(order?.payment_status),
    [order?.payment_status]
  );

  const StatusIcon = status.icon;
  const StatusDetailsIcon = statusDetails.icon;

  const normalizedStatus = normalizeStatus(
    order?.payment_status
  );

  const isPaid = [
    "paid",
    "success",
    "settlement",
  ].includes(normalizedStatus);

  const isPending = normalizedStatus === "pending";

  const eventName =
    order?.event_name || "Informasi acara belum tersedia";

  const categoryName =
    order?.category_name || "Informasi kategori belum tersedia";

  const quantity = parseNumber(order?.quantity);
  const total = parseNumber(order?.total_price);

  const categoryPrice = parseNumber(
    order?.category_price
  );

  const subtotal =
    parseNumber(order?.subtotal) > 0
      ? parseNumber(order?.subtotal)
      : categoryPrice * quantity;

  const serviceFee = Math.max(total - subtotal, 0);

  // ---------------------------------------------------
  // COPY ORDER CODE
  // ---------------------------------------------------

  const handleCopyOrderCode = async () => {
    if (!order?.order_code) return;

    try {
      await navigator.clipboard.writeText(order.order_code);
      setCopyMessage("Kode pesanan berhasil disalin.");

      window.setTimeout(() => {
        setCopyMessage("");
      }, 2500);
    } catch (err) {
      console.error("COPY ORDER CODE ERROR:", err);
      setCopyMessage(
        "Tidak dapat menyalin kode pesanan dari browser."
      );
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#D8D0C4]/30 bg-white p-8 text-center shadow-lg">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-[#3B507D]"
          />

          <h1 className="mt-5 text-lg font-bold text-[#112250]">
            Memuat Detail Pesanan
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#9B907F]">
            Sedang mengambil informasi transaksi kamu dari server.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3B507D] transition hover:text-[#112250]"
        >
          <ArrowLeft size={17} />
          Kembali ke Pesanan Saya
        </Link>

        <section className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle size={28} />
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-[#112250]">
            Gagal Memuat Detail Pesanan
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#9B907F]">
            {error || "Data pesanan tidak tersedia."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => fetchOrder(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              <RefreshCw size={17} />
              Coba Lagi
            </button>

            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/40 bg-white px-5 py-3 text-sm font-bold text-[#3B507D] transition hover:bg-[#F7F8FA]"
            >
              Kembali ke Pesanan
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // =====================================================
  // MAIN CONTENT
  // =====================================================

  return (
    <div className="min-w-0 w-full text-[#112250]">
      {/* HEADER */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-[#D8D0C4]/30 bg-white shadow-lg">
        <div className="border-b border-[#D8D0C4]/30 bg-gradient-to-r from-[#112250]/5 via-white to-[#E5C27A]/10 p-5 sm:p-6">
          <Link
            href="/orders"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3B507D] transition hover:text-[#112250]"
          >
            <ArrowLeft size={17} />
            Kembali ke Pesanan Saya
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#3B507D]">
                <Receipt size={15} />
                Riwayat Transaksi
                <ChevronRight size={13} />
                Detail Pesanan
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#112250] sm:text-3xl">
                Detail Pesanan
              </h1>

              <p className="mt-1 text-sm leading-6 text-[#9B907F]">
                Informasi lengkap pesanan dan status pembayaran tiket kamu.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchOrder(false)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#D8D0C4]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B507D] shadow-sm transition hover:border-[#E5C27A] hover:bg-[#E5C27A]/10 hover:text-[#112250] disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Perbarui Status
            </button>
          </div>
        </div>
      </section>

      {/* WARNING SINKRONISASI */}
      {statusWarning && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-bold">
              Status pembayaran belum tersinkronisasi
            </p>

            <p className="mt-1 text-xs leading-5">
              {statusWarning} Data pesanan tetap ditampilkan berdasarkan
              informasi terakhir yang tersimpan di backend.
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-3">
        {/* LEFT CONTENT */}
        <div className="min-w-0 space-y-5 lg:col-span-2">
          {/* EVENT AND ORDER INFORMATION */}
          <section className="overflow-hidden rounded-2xl border border-[#D8D0C4]/30 bg-white shadow-lg">
            <div className="border-b border-[#D8D0C4]/30 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#112250]/5 text-[#3B507D]">
                    <Ticket size={27} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9B907F]">
                      Kode Pesanan
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="break-all text-sm font-extrabold text-[#112250]">
                        {order.order_code || `ORDER-${order.id}`}
                      </p>

                      {order.order_code && (
                        <button
                          type="button"
                          onClick={handleCopyOrderCode}
                          title="Salin kode pesanan"
                          className="rounded-lg p-1.5 text-[#3B507D] transition hover:bg-[#112250]/5"
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </div>

                    {copyMessage && (
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        {copyMessage}
                      </p>
                    )}

                    <h2 className="mt-3 break-words text-lg font-extrabold leading-snug text-[#112250] sm:text-xl">
                      {eventName}
                    </h2>

                    {order.artist_name && (
                      <p className="mt-1 flex items-center gap-2 text-sm text-[#3B507D]/80">
                        <Music2 size={15} />
                        {order.artist_name}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${status.className}`}
                >
                  <StatusIcon size={15} />
                  {status.label}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* PAYMENT STATUS */}
              <div
                className={`rounded-xl border p-4 sm:p-5 ${statusDetails.className}`}
              >
                <div className="flex items-start gap-3">
                  <StatusDetailsIcon
                    size={22}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <h3 className="font-bold">
                      {statusDetails.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 opacity-90">
                      {statusDetails.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* EVENT INFORMATION */}
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#112250]">
                  <CalendarDays size={16} className="text-[#3B507D]" />
                  Informasi Acara
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <DetailInfo
                    icon={<CalendarDays size={18} />}
                    label="Tanggal Acara"
                    value={formatDate(order.event_date)}
                  />

                  <DetailInfo
                    icon={<Clock3 size={18} />}
                    label="Waktu Acara"
                    value={
                      order.event_time
                        ? `${formatTime(order.event_time)} WIB`
                        : "-"
                    }
                  />

                  <DetailInfo
                    icon={<MapPin size={18} />}
                    label="Lokasi Acara"
                    value={order.venue_name || "-"}
                  />

                  <DetailInfo
                    icon={<MapPin size={18} />}
                    label="Kota"
                    value={order.city || "-"}
                  />
                </div>
              </div>

              {/* TICKET INFORMATION */}
              <div className="mt-7 border-t border-[#D8D0C4]/30 pt-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#112250]">
                  <Ticket size={16} className="text-[#3B507D]" />
                  Informasi Tiket
                </h3>

                <div className="mt-4 overflow-hidden rounded-xl border border-[#D8D0C4]/40 bg-[#F7F8FA]/70">
                  {order.details.length > 0 ? (
                    order.details.map((detail, index) => (
                      <div
                        key={detail.id || `${detail.ticket_category_id}-${index}`}
                        className="border-b border-[#D8D0C4]/30 p-4 last:border-b-0 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3B507D] shadow-sm">
                              <Ticket size={20} />
                            </div>

                            <div className="min-w-0">
                              <p className="break-words font-bold text-[#112250]">
                                {detail.category_name ||
                                  categoryName}
                              </p>

                              <p className="mt-1 text-sm text-[#9B907F]">
                                {parseNumber(detail.quantity)} tiket
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-xs text-[#9B907F]">
                              Harga satuan
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#112250]">
                              {formatRupiah(detail.price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#D8D0C4]/40 pt-3">
                          <span className="text-sm text-[#9B907F]">
                            Subtotal kategori
                          </span>

                          <span className="text-sm font-bold text-[#112250]">
                            {formatRupiah(
                              parseNumber(detail.subtotal) ||
                                parseNumber(detail.price) *
                                  parseNumber(detail.quantity)
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-5">
                      <p className="font-bold text-[#112250]">
                        {categoryName}
                      </p>

                      <p className="mt-1 text-sm text-[#9B907F]">
                        {quantity} tiket
                      </p>

                      {categoryPrice > 0 && (
                        <p className="mt-2 text-sm font-semibold text-[#3B507D]">
                          {formatRupiah(categoryPrice)} / tiket
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-[#D8D0C4]/40 bg-white px-4 py-4 sm:px-5">
                    <span className="text-sm font-semibold text-[#3B507D]">
                      Total tiket
                    </span>

                    <span className="text-sm font-extrabold text-[#112250]">
                      {quantity} tiket
                    </span>
                  </div>
                </div>
              </div>

              {/* BUYER INFORMATION */}
              {(order.fullname || order.email) && (
                <div className="mt-7 border-t border-[#D8D0C4]/30 pt-6">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#112250]">
                    <UserRound
                      size={16}
                      className="text-[#3B507D]"
                    />
                    Informasi Pemesan
                  </h3>

                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <DetailInfo
                      icon={<UserRound size={18} />}
                      label="Nama Pemesan"
                      value={order.fullname || "-"}
                    />

                    <DetailInfo
                      icon={<Mail size={18} />}
                      label="Email Pemesan"
                      value={order.email || "-"}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* TRANSACTION INFORMATION */}
          <section className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-5 shadow-lg sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#112250]">
              <Receipt size={17} className="text-[#3B507D]" />
              Informasi Transaksi
            </h2>

            <p className="mt-1 text-sm text-[#9B907F]">
              Rincian waktu dan status transaksi pesanan kamu.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <DetailInfo
                icon={<Receipt size={18} />}
                label="ID Pesanan"
                value={String(order.id ?? "-")}
              />

              <DetailInfo
                icon={<Receipt size={18} />}
                label="Kode Pesanan"
                value={order.order_code || "-"}
              />

              <DetailInfo
                icon={<CalendarDays size={18} />}
                label="Tanggal Pemesanan"
                value={formatDate(order.order_date)}
              />

              <DetailInfo
                icon={<CreditCard size={18} />}
                label="Metode Pembayaran"
                value={order.payment_method || "Midtrans"}
              />

              <DetailInfo
                icon={<Clock3 size={18} />}
                label="Pembaruan Terakhir"
                value={
                  order.updated_at
                    ? formatDate(order.updated_at)
                    : "-"
                }
              />

              <DetailInfo
                icon={<ShieldCheck size={18} />}
                label="Status Transaksi"
                value={status.label}
              />
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
          {/* PAYMENT SUMMARY */}
          <section className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-5 shadow-lg sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-[#3B507D]" />

              <h2 className="text-base font-extrabold text-[#112250]">
                Ringkasan Pembayaran
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <PriceRow
                label="Kategori Tiket"
                value={categoryName}
              />

              <PriceRow
                label="Jumlah Tiket"
                value={`${quantity} tiket`}
              />

              <PriceRow
                label="Subtotal Tiket"
                value={formatRupiah(subtotal)}
              />

              <PriceRow
                label="Biaya Layanan"
                value={formatRupiah(serviceFee)}
              />

              <div className="border-t border-dashed border-[#D8D0C4]/50 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#3B507D]">
                    Total Pembayaran
                  </span>

                  <span className="text-xl font-extrabold tracking-tight text-[#112250]">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`mt-5 rounded-xl border p-3.5 ${status.className}`}>
              <div className="flex items-start gap-2.5">
                <StatusIcon
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-bold">
                    {status.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 opacity-90">
                    {status.description}
                  </p>
                </div>
              </div>
            </div>

            {isPaid && (
              <Link
                href="/tickets"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:scale-[1.02] hover:shadow-lg"
              >
                <Ticket size={18} />
                Lihat Tiket Saya
                <ChevronRight size={17} />
              </Link>
            )}

            {isPending && (
              <button
                type="button"
                onClick={() => fetchOrder(false)}
                disabled={refreshing}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:shadow-lg disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                Periksa Pembayaran
              </button>
            )}

            <Link
              href="/orders"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/40 bg-white px-5 py-3 text-sm font-bold text-[#3B507D] transition hover:bg-[#F7F8FA]"
            >
              <ArrowLeft size={17} />
              Daftar Pesanan
            </Link>
          </section>

          {/* PAYMENT SECURITY INFO */}
          <section className="rounded-2xl border border-[#E5C27A]/40 bg-gradient-to-br from-[#E5C27A]/15 to-[#F7F8FA] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3B507D] shadow-sm">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#112250]">
                  Informasi Pembayaran
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#3B507D]/80">
                  Status transaksi diperiksa melalui backend TicketVerse
                  dan Midtrans. Pembayaran dinyatakan berhasil setelah
                  status dikonfirmasi oleh server.
                </p>
              </div>
            </div>
          </section>

          {/* HELP */}
          <section className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <Info
                size={19}
                className="mt-0.5 shrink-0 text-[#9B907F]"
              />

              <div>
                <h3 className="text-sm font-bold text-[#112250]">
                  Butuh Bantuan?
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#9B907F]">
                  Simpan kode pesanan kamu untuk membantu proses
                  pengecekan transaksi jika terjadi kendala.
                </p>

                <button
                  type="button"
                  onClick={handleCopyOrderCode}
                  disabled={!order.order_code}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#3B507D] transition hover:text-[#112250] disabled:opacity-50"
                >
                  <Copy size={14} />
                  Salin Kode Pesanan
                </button>

                {copyMessage && (
                  <p className="mt-2 text-xs font-medium text-emerald-600">
                    {copyMessage}
                  </p>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {refreshing && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#3B507D]">
          <Loader2 size={15} className="animate-spin" />
          Memperbarui informasi pesanan...
        </div>
      )}
    </div>
  );
}

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

function DetailInfo({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 shrink-0 text-[#3B507D]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9B907F]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#112250]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[#9B907F]">
        {label}
      </span>

      <span className="max-w-[60%] break-words text-right text-sm font-semibold text-[#112250]">
        {value || "-"}
      </span>
    </div>
  );
}

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

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeOrder(order) {
  if (!order || typeof order !== "object") {
    return null;
  }

  const rawDetails =
    order.order_details ||
    order.orderDetails ||
    order.details ||
    order.items ||
    [];

  const details = Array.isArray(rawDetails)
    ? rawDetails
    : rawDetails
      ? [rawDetails]
      : [];

  const firstDetail = details[0] || {};

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

  const venue =
    order.venue ||
    order.venues ||
    event.venue ||
    event.venues ||
    firstDetail.venue ||
    firstDetail.venues ||
    {};

  const quantityFromDetails = details.reduce((sum, detail) => {
    return sum + parseNumber(detail.quantity);
  }, 0);

  const quantity = parseNumber(
    firstValue(
      order.quantity,
      order.total_quantity,
      order.totalQuantity,
      quantityFromDetails,
      0
    )
  );

  const total = parseNumber(
    firstValue(
      order.total_price,
      order.totalPrice,
      order.total_amount,
      order.totalAmount,
      order.total,
      order.subtotal,
      0
    )
  );

  const categoryPrice = parseNumber(
    firstValue(
      order.category_price,
      order.ticket_price,
      order.ticketPrice,
      firstDetail.price,
      firstDetail.unit_price,
      firstDetail.unitPrice,
      category.price,
      0
    )
  );

  return {
    ...order,

    // ID dan kode pesanan
    id: firstValue(
      order.id,
      order.order_id,
      order.orderId
    ),

    order_code: firstValue(
      order.order_code,
      order.orderCode,
      order.code
    ),

    // Status pembayaran
    payment_status: firstValue(
      order.payment_status,
      order.paymentStatus,
      order.transaction_status,
      order.transactionStatus,
      order.status
    ),

    payment_method: firstValue(
      order.payment_method,
      order.paymentMethod,
      order.payment_type,
      order.paymentType,
      order.bank
    ),

    // Informasi acara
    event_id: firstValue(
      order.event_id,
      order.eventId,
      event.id,
      event.event_id,
      event.eventId,
      firstDetail.event_id,
      firstDetail.eventId
    ),

    event_name: firstValue(
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
    ),

    artist_name: firstValue(
      order.artist_name,
      order.artistName,
      event.artist_name,
      event.artistName,
      event.artist?.name,
      event.artists?.artist_name,
      event.artists?.name
    ),

    event_date: firstValue(
      order.event_date,
      order.eventDate,
      order.tanggal_acara,
      order.tanggalAcara,
      event.event_date,
      event.eventDate,
      event.tanggal_acara,
      event.tanggalAcara,
      event.date,
      firstDetail.event_date,
      firstDetail.eventDate
    ),

    event_time: firstValue(
      order.event_time,
      order.eventTime,
      order.waktu_acara,
      order.waktuAcara,
      event.event_time,
      event.eventTime,
      event.waktu_acara,
      event.waktuAcara,
      event.time,
      firstDetail.event_time,
      firstDetail.eventTime
    ),

    // Informasi lokasi
    venue_name: firstValue(
      order.venue_name,
      order.venueName,
      order.location,
      order.lokasi,
      event.venue_name,
      event.venueName,
      event.location,
      event.lokasi,
      venue.venue_name,
      venue.venueName,
      venue.name,
      venue.location,
      firstDetail.venue_name,
      firstDetail.venueName
    ),

    city: firstValue(
      order.city,
      order.venue_city,
      order.venueCity,
      order.kota,
      event.city,
      event.venue_city,
      event.venueCity,
      event.kota,
      venue.city,
      venue.venue_city,
      venue.venueCity,
      firstDetail.city,
      firstDetail.venue_city
    ),

    // Informasi kategori tiket
    category_name: firstValue(
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
    ),

    category_price: categoryPrice,

    // Jumlah dan total pembayaran
    quantity,

    total_price: total,

    // Tanggal transaksi
    order_date: firstValue(
      order.order_date,
      order.orderDate,
      order.created_at,
      order.createdAt
    ),

    updated_at: firstValue(
      order.updated_at,
      order.updatedAt
    ),

    details,
  };
}

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
        description: "Menunggu konfirmasi pembayaran dari Midtrans.",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Dibatalkan",
        description: "Pesanan telah dibatalkan.",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
      };

    case "expired":
      return {
        label: "Kadaluarsa",
        description: "Batas waktu pembayaran telah berakhir.",
        className: "border-slate-200 bg-slate-100 text-slate-600",
        icon: AlertCircle,
      };

    case "failed":
    case "deny":
      return {
        label: "Pembayaran Gagal",
        description: "Pembayaran tidak berhasil diproses.",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: AlertCircle,
      };

    default:
      return {
        label: status || "Status Tidak Diketahui",
        description: "Status transaksi belum dapat dikenali.",
        className: "border-slate-200 bg-slate-100 text-slate-600",
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
        title: "Pembayaran berhasil!",
        description:
          "Transaksi kamu telah dikonfirmasi. Kamu dapat membuka halaman Tiket Saya untuk memeriksa tiket yang sudah diterbitkan.",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        icon: CheckCircle2,
      };

    case "pending":
      return {
        title: "Pesanan menunggu pembayaran",
        description:
          "Selesaikan pembayaran sesuai instruksi transaksi. Status akan diperbarui setelah Midtrans mengonfirmasi pembayaran.",
        className: "border-amber-200 bg-amber-50 text-amber-900",
        icon: Clock3,
      };

    case "cancelled":
    case "canceled":
      return {
        title: "Pesanan dibatalkan",
        description:
          "Transaksi ini telah dibatalkan. Jika ingin membeli tiket, silakan buat pesanan baru.",
        className: "border-red-200 bg-red-50 text-red-900",
        icon: XCircle,
      };

    case "expired":
      return {
        title: "Pembayaran telah kedaluwarsa",
        description:
          "Batas waktu pembayaran sudah berakhir. Kamu dapat kembali mencari acara dan membuat pesanan baru.",
        className: "border-slate-200 bg-slate-100 text-slate-800",
        icon: AlertCircle,
      };

    case "failed":
    case "deny":
      return {
        title: "Pembayaran tidak berhasil",
        description:
          "Transaksi tidak berhasil diproses. Periksa status transaksi sebelum mencoba melakukan pembayaran kembali.",
        className: "border-red-200 bg-red-50 text-red-900",
        icon: AlertCircle,
      };

    default:
      return {
        title: "Status transaksi belum diketahui",
        description:
          "Informasi status pembayaran belum tersedia atau menggunakan status yang belum dikenali.",
        className: "border-slate-200 bg-slate-50 text-slate-800",
        icon: Info,
      };
  }
}

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

        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${ORDER_API}/${encodeURIComponent(orderId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

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
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          throw new Error(
            "Kamu tidak memiliki izin untuk melihat pesanan ini."
          );
        }

        if (response.status === 404) {
          throw new Error("Pesanan tidak ditemukan.");
        }

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || "Gagal mengambil detail pesanan."
          );
        }

        const rawOrder =
          data.order ||
          data.data?.order ||
          data.data?.order_detail ||
          data.data ||
          (Array.isArray(data.orders)
            ? data.orders.find(
                (item) => String(item.id) === String(orderId)
              )
            : null) ||
          (data.id !== undefined ? data : null);

        if (!rawOrder || typeof rawOrder !== "object") {
          throw new Error(
            "Data pesanan tidak ditemukan pada respons server."
          );
        }

        const normalized = normalizeOrder(rawOrder);

        if (!normalized) {
          throw new Error("Format data pesanan tidak valid.");
        }

        setOrder(normalized);

        if (
          normalizeStatus(normalized.payment_status) === "pending" &&
          normalized.id
        ) {
          try {
            const statusResponse = await fetch(
              `${PAYMENT_STATUS_API}/${encodeURIComponent(normalized.id)}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
                cache: "no-store",
              }
            );

            if (statusResponse.ok) {
              const latestResponse = await fetch(
                `${ORDER_API}/${encodeURIComponent(orderId)}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                  cache: "no-store",
                }
              );

              if (latestResponse.ok) {
                const latestData = await latestResponse.json();

                const latestRawOrder =
                  latestData.order ||
                  latestData.data?.order ||
                  latestData.data ||
                  (Array.isArray(latestData.orders)
                    ? latestData.orders.find(
                        (item) =>
                          String(item.id) === String(orderId)
                      )
                    : null) ||
                  (latestData.id !== undefined
                    ? latestData
                    : null);

                if (latestRawOrder) {
                  const latestOrder = normalizeOrder(latestRawOrder);

                  if (latestOrder) {
                    setOrder(latestOrder);
                  }
                }
              }
            }
          } catch (statusError) {
            console.error(
              "CHECK PAYMENT STATUS ERROR:",
              statusError
            );
          }
        }
      } catch (err) {
        console.error("GET ORDER DETAIL ERROR:", err);
        setError(
          err.message || "Terjadi kesalahan saat mengambil detail pesanan."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId, router]
  );

  useEffect(() => {
    fetchOrder(true);
  }, [fetchOrder]);

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

  const isPaid = ["paid", "success", "settlement"].includes(
    normalizeStatus(order?.payment_status)
  );

  const eventName =
    order?.event_name || "Informasi acara belum tersedia";

  const categoryName =
    order?.category_name || "Informasi kategori belum tersedia";

  const quantity = parseNumber(order?.quantity);
  const total = parseNumber(order?.total_price);
  const categoryPrice = parseNumber(order?.category_price);

  const calculatedSubtotal =
    categoryPrice > 0 && quantity > 0
      ? categoryPrice * quantity
      : total;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
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

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl">
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

  return (
    <div className="min-w-0">
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

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
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

                    <p className="mt-1 break-all text-sm font-extrabold text-[#112250]">
                      {order.order_code || `ORDER-${order.id}`}
                    </p>

                    <h2 className="mt-3 text-lg font-extrabold leading-snug text-[#112250] sm:text-xl">
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
              <div
                className={`rounded-xl border p-4 sm:p-5 ${statusDetails.className}`}
              >
                <div className="flex items-start gap-3">
                  <StatusDetailsIcon
                    size={22}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <h3 className="font-bold">{statusDetails.title}</h3>

                    <p className="mt-1 text-sm leading-6 opacity-90">
                      {statusDetails.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#112250]">
                  <CalendarDays size={16} className="text-[#3B507D]" />
                  Informasi Acara
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

              <div className="mt-7 border-t border-[#D8D0C4]/30 pt-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#112250]">
                  <Ticket size={16} className="text-[#3B507D]" />
                  Informasi Tiket
                </h3>

                <div className="mt-4 rounded-xl border border-[#D8D0C4]/40 bg-[#F7F8FA]/70 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3B507D] shadow-sm">
                        <Ticket size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-bold text-[#112250]">
                          {categoryName}
                        </p>

                        <p className="mt-1 text-sm text-[#9B907F]">
                          {quantity} tiket
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-[#9B907F]">
                        Harga satuan
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#112250]">
                        {categoryPrice > 0
                          ? formatRupiah(categoryPrice)
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#D8D0C4]/40 pt-4">
                    <span className="text-sm text-[#9B907F]">
                      Jumlah tiket
                    </span>

                    <span className="text-sm font-bold text-[#112250]">
                      {quantity} tiket
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-5 shadow-lg sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-[#3B507D]" />

              <h2 className="text-base font-extrabold text-[#112250]">
                Ringkasan Pembayaran
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <PriceRow label="Kategori Tiket" value={categoryName} />

              <PriceRow
                label="Jumlah"
                value={`${quantity} tiket`}
              />

              <PriceRow
                label="Harga Tiket"
                value={formatRupiah(calculatedSubtotal)}
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

            <div
              className={`mt-5 rounded-xl border p-3.5 ${status.className}`}
            >
              <div className="flex items-start gap-2.5">
                <StatusIcon size={18} className="mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-bold">{status.label}</p>

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

            <Link
              href="/orders"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/40 bg-white px-5 py-3 text-sm font-bold text-[#3B507D] transition hover:bg-[#F7F8FA]"
            >
              <ArrowLeft size={17} />
              Daftar Pesanan
            </Link>
          </section>

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
                  Status transaksi diperoleh dari backend. Pembayaran
                  dinyatakan berhasil setelah status dikonfirmasi oleh
                  Midtrans, bukan hanya berdasarkan halaman pembayaran.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <Info size={19} className="mt-0.5 shrink-0 text-[#9B907F]" />

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
                  onClick={() => {
                    if (order.order_code) {
                      navigator.clipboard
                        .writeText(order.order_code)
                        .catch((err) =>
                          console.error("COPY ORDER CODE ERROR:", err)
                        );
                    }
                  }}
                  disabled={!order.order_code}
                  className="mt-3 text-xs font-bold text-[#3B507D] transition hover:text-[#112250] disabled:opacity-50"
                >
                  Salin Kode Pesanan
                </button>
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

function DetailInfo({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 shrink-0 text-[#3B507D]">{icon}</div>

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
      <span className="text-sm text-[#9B907F]">{label}</span>

      <span className="max-w-[60%] break-words text-right text-sm font-semibold text-[#112250]">
        {value || "-"}
      </span>
    </div>
  );
}
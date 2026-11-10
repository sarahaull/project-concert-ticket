
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Ticket,
  Building2,
  QrCode,
  Smartphone,
  CreditCard,
  Clock,
  ChevronRight,
  Info,
  RefreshCw,
} from "lucide-react";

// =====================================================
// CONFIGURATION
// =====================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

const IS_PRODUCTION =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

const SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

const CHECKOUT_KEY = "ticketverse_checkout";

const STATUS_INTERVAL = 1500;
const MAX_STATUS_ATTEMPTS = 10;

// =====================================================
// PAYMENT METHODS
// =====================================================

const PAYMENT_METHODS = [
  { value: "QRIS", label: "QRIS", icon: QrCode },
  { value: "E-Wallet", label: "E-Wallet", icon: Smartphone },
  { value: "Transfer", label: "Transfer Bank", icon: Building2 },
  { value: "Credit Card", label: "Kartu Kredit", icon: CreditCard },
];

// =====================================================
// HELPERS
// =====================================================

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.error)) {
    return data.error.join(", ");
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  if (typeof data?.error?.message === "string") {
    return data.error.message;
  }

  return data?.message || fallback;
};

const normalizeStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  const statuses = {
    paid: "Paid",
    settlement: "Paid",
    success: "Paid",
    pending: "Pending",
    authorize: "Pending",
    capture: "Pending",
    cancelled: "Cancelled",
    cancel: "Cancelled",
    expired: "Expired",
    expire: "Expired",
    failed: "Failed",
    deny: "Failed",
  };

  return statuses[value] || status || "Pending";
};

const getStatusColor = (status) => {
  switch (normalizeStatus(status)) {
    case "Paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "Expired":
    case "Cancelled":
    case "Failed":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

// =====================================================
// MAIN PAGE
// =====================================================

export default function PembayaranPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = String(params?.id || "");

  const mountedRef = useRef(false);
  const processingRef = useRef(false);
  const redirectingRef = useRef(false);

  const [checkout, setCheckout] = useState(null);

  const [selectedMethod, setSelectedMethod] = useState("QRIS");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [paymentResult, setPaymentResult] = useState("Pending");

  // ===================================================
  // MOUNT
  // ===================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ===================================================
  // LOAD CHECKOUT
  // ===================================================

  useEffect(() => {
    let active = true;

    const loadCheckout = () => {
      try {
        const stored = sessionStorage.getItem(CHECKOUT_KEY);

        if (!stored) {
          throw new Error(
            "Data checkout tidak ditemukan. Silakan ulangi pembelian."
          );
        }

        const parsed = JSON.parse(stored);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("Data checkout tidak valid.");
        }

        const orderCode =
          parsed.orderCode ||
          parsed.order?.order_code;

        const snapToken = parsed.payment?.snap_token;

        if (!orderCode || !snapToken) {
          throw new Error(
            "Kode pesanan atau Snap Token tidak ditemukan."
          );
        }

        if (
          parsed.eventId &&
          String(parsed.eventId) !== eventId
        ) {
          throw new Error(
            "Data checkout tidak sesuai dengan acara yang dipilih."
          );
        }

        if (!parsed.order || !parsed.order.id) {
          throw new Error(
            "Informasi pesanan tidak lengkap. Silakan ulangi pembelian."
          );
        }

        if (
          !Number.isInteger(Number(parsed.quantity)) ||
          Number(parsed.quantity) < 1
        ) {
          throw new Error("Jumlah tiket pada checkout tidak valid.");
        }

        if (active) {
          setCheckout({
            ...parsed,
            orderCode: String(orderCode),
          });

          const preferences = {
            qris: "QRIS",
            ewallet: "E-Wallet",
            bank: "Transfer",
            card: "Credit Card",
          };

          setSelectedMethod(
            preferences[parsed.preferredPaymentMethod] || "QRIS"
          );
        }
      } catch (err) {
        console.error("LOAD CHECKOUT ERROR:", err);

        if (active) {
          setError(
            err?.message || "Gagal membaca data checkout."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCheckout();

    return () => {
      active = false;
    };
  }, [eventId]);

  // ===================================================
  // LOAD MIDTRANS SNAP
  // ===================================================

  useEffect(() => {
    if (!checkout) return;

    if (!CLIENT_KEY) {
      setError(
        "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum dikonfigurasi."
      );
      return;
    }

    if (window.snap) {
      setSnapReady(true);
      return;
    }

    let script = document.getElementById("midtrans-snap");

    if (script) {
      const handleLoad = () => {
        if (mountedRef.current) {
          setSnapReady(true);
        }
      };

      const handleError = () => {
        if (mountedRef.current) {
          setError("Gagal memuat layanan pembayaran Midtrans.");
        }
      };

      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);

      return () => {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      };
    }

    script = document.createElement("script");

    script.id = "midtrans-snap";
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", CLIENT_KEY);
    script.async = true;

    script.onload = () => {
      if (mountedRef.current) {
        setSnapReady(true);
      }
    };

    script.onerror = () => {
      if (mountedRef.current) {
        setError("Gagal memuat layanan pembayaran Midtrans.");
      }
    };

    document.body.appendChild(script);
  }, [checkout]);

  // ===================================================
  // CHECKOUT DETAILS
  // ===================================================

  const orderCode = checkout?.orderCode || "-";

  const eventTitle =
    checkout?.eventTitle ||
    checkout?.order?.event_name ||
    "Event";

  const category =
    checkout?.ticketCategoryName ||
    checkout?.order?.ticket_category_name ||
    "Tiket";

  const quantity = Number(checkout?.quantity) || 1;

  const subtotal = Number(
    checkout?.subtotal ??
      checkout?.order?.subtotal ??
      0
  );

  const serviceFee = Number(
    checkout?.serviceFee ??
      checkout?.order?.service_fee ??
      5000
  );

  const total = Number(
    checkout?.total ??
      checkout?.order?.total_price ??
      subtotal + serviceFee
  );

  const seatIds =
    checkout?.seatIds ||
    checkout?.order?.seat_ids ||
    [];

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
  }, []);

  // ===================================================
  // API REQUEST
  // ===================================================

  const apiRequest = useCallback(
    async (endpoint) => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Sesi login tidak ditemukan. Silakan login kembali."
        );
      }

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("token");

        router.replace("/login");

        throw new Error(
          "Sesi login telah berakhir. Silakan login kembali."
        );
      }

      if (!response.ok || data?.success !== true) {
        throw new Error(
          getErrorMessage(
            data,
            `Permintaan gagal. HTTP ${response.status}`
          )
        );
      }

      return data;
    },
    [getToken, router]
  );

  // ===================================================
  // CHECK PAYMENT STATUS FROM BACKEND
  // ===================================================

  const checkPaymentStatus = useCallback(async () => {
    if (!checkout?.orderCode) {
      throw new Error("Kode pesanan tidak tersedia.");
    }

    const data = await apiRequest(
      `/api/payments/midtrans-status/${encodeURIComponent(
        checkout.orderCode
      )}`
    );

    const status = normalizeStatus(
      data.payment_status ||
        data.order_status ||
        data.data?.payment_status
    );

    return {
      status,
      data,
    };
  }, [checkout, apiRequest]);

  // ===================================================
  // SAVE PAYMENT STATUS
  // ===================================================

  const savePaymentStatus = useCallback(
    (status) => {
      try {
        const updatedCheckout = {
          ...checkout,
          paymentStatus: status,
        };

        sessionStorage.setItem(
          CHECKOUT_KEY,
          JSON.stringify(updatedCheckout)
        );
      } catch (err) {
        console.error("SAVE CHECKOUT ERROR:", err);
      }
    },
    [checkout]
  );

  // ===================================================
  // REDIRECT TO ORDERS
  // ===================================================

  const redirectToOrders = useCallback(
    (status, text) => {
      if (redirectingRef.current) return;

      redirectingRef.current = true;

      const normalizedStatus = normalizeStatus(status);

      savePaymentStatus(normalizedStatus);

      setPaymentResult(normalizedStatus);
      setMessage(text);
      setProcessing(false);
      setRedirecting(true);

      processingRef.current = false;

      setTimeout(() => {
        router.replace("/orders");
      }, 2000);
    },
    [router, savePaymentStatus]
  );

  // ===================================================
  // VERIFY PAYMENT STATUS
  // ===================================================

  const verifyPayment = useCallback(
    async (options = {}) => {
      if (checkingStatus) return null;

      setCheckingStatus(true);
      setError("");

      try {
        const result = await checkPaymentStatus();

        const status = result.status;

        setPaymentResult(status);
        savePaymentStatus(status);

        if (status === "Paid") {
          redirectToOrders(
            "Paid",
            "Pembayaran berhasil diverifikasi oleh server. Tiket Anda sedang disiapkan."
          );

          return status;
        }

        if (
          status === "Expired" ||
          status === "Cancelled" ||
          status === "Failed"
        ) {
          setMessage(
            `Status pembayaran: ${status}. Silakan periksa detail pesanan Anda.`
          );

          if (options.redirectOnTerminal) {
            redirectToOrders(
              status,
              `Transaksi berstatus ${status}. Silakan periksa Pesanan Saya.`
            );
          }

          return status;
        }

        setMessage(
          "Pembayaran masih menunggu konfirmasi Midtrans."
        );

        return status;
      } catch (err) {
        console.error("VERIFY PAYMENT ERROR:", err);

        setError(
          err?.message ||
            "Gagal memverifikasi status pembayaran."
        );

        return null;
      } finally {
        setCheckingStatus(false);
      }
    },
    [
      checkingStatus,
      checkPaymentStatus,
      savePaymentStatus,
      redirectToOrders,
    ]
  );

  // ===================================================
  // HANDLE PAYMENT SUCCESS
  // ===================================================

  const handlePaymentSuccess = useCallback(async () => {
    if (redirectingRef.current) return;

    setProcessing(true);

    processingRef.current = true;

    setError("");

    setMessage(
      "Pembayaran diterima. Memverifikasi transaksi melalui backend..."
    );

    let lastStatus = "Pending";

    for (let attempt = 0; attempt < MAX_STATUS_ATTEMPTS; attempt++) {
      if (redirectingRef.current) return;

      try {
        const result = await checkPaymentStatus();

        lastStatus = result.status;

        setPaymentResult(lastStatus);

        savePaymentStatus(lastStatus);

        if (lastStatus === "Paid") {
          redirectToOrders(
            "Paid",
            "Pembayaran berhasil diverifikasi. Tiket Anda telah diproses."
          );

          return;
        }

        if (
          ["Cancelled", "Expired", "Failed"].includes(lastStatus)
        ) {
          redirectToOrders(
            lastStatus,
            `Status transaksi: ${lastStatus}. Silakan periksa Pesanan Saya.`
          );

          return;
        }
      } catch (err) {
        console.error(
          `STATUS CHECK ${attempt + 1}:`,
          err
        );
      }

      if (attempt < MAX_STATUS_ATTEMPTS - 1) {
        await delay(STATUS_INTERVAL);
      }
    }

    // Jangan menganggap pembayaran berhasil
    // jika server belum mengonfirmasi status Paid.

    processingRef.current = false;

    setProcessing(false);

    setMessage(
      "Pembayaran sedang disinkronkan. Status terbaru dapat diperiksa melalui Pesanan Saya."
    );

    setPaymentResult(lastStatus);
  }, [
    checkPaymentStatus,
    savePaymentStatus,
    redirectToOrders,
  ]);

  // ===================================================
  // HANDLE PAYMENT PENDING
  // ===================================================

  const handlePaymentPending = useCallback(async () => {
    if (redirectingRef.current) return;

    processingRef.current = false;

    setProcessing(false);

    setMessage(
      "Transaksi sedang menunggu konfirmasi pembayaran."
    );

    await verifyPayment({
      redirectOnTerminal: true,
    });
  }, [verifyPayment]);

  // ===================================================
  // HANDLE PAYMENT ERROR
  // ===================================================

  const handlePaymentError = useCallback(() => {
    processingRef.current = false;

    setProcessing(false);

    setError(
      "Pembayaran belum berhasil diproses. Silakan periksa status transaksi sebelum mencoba kembali."
    );

    setMessage("");
  }, []);

  // ===================================================
  // HANDLE SNAP CLOSE
  // ===================================================

  const handlePaymentClose = useCallback(() => {
    processingRef.current = false;

    setProcessing(false);

    setMessage(
      "Jendela pembayaran ditutup. Pesanan Anda tetap tersimpan. Periksa status pembayaran sebelum melakukan transaksi baru."
    );
  }, []);

  // ===================================================
  // OPEN MIDTRANS
  // ===================================================

  const handlePayment = useCallback(() => {
    setError("");
    setMessage("");

    if (processingRef.current || redirectingRef.current) {
      return;
    }

    if (!checkout?.payment?.snap_token) {
      setError("Snap Token tidak tersedia.");
      return;
    }

    if (!window.snap || !snapReady) {
      setError(
        "Midtrans belum siap. Silakan tunggu beberapa saat."
      );
      return;
    }

    if (!getToken()) {
      router.replace("/login");
      return;
    }

    processingRef.current = true;

    setProcessing(true);

    try {
      window.snap.pay(
        checkout.payment.snap_token,
        {
          onSuccess: () => {
            handlePaymentSuccess();
          },

          onPending: () => {
            handlePaymentPending();
          },

          onError: () => {
            handlePaymentError();
          },

          onClose: () => {
            handlePaymentClose();
          },
        }
      );
    } catch (err) {
      console.error("MIDTRANS SNAP ERROR:", err);

      processingRef.current = false;

      setProcessing(false);

      setError(
        err?.message ||
          "Gagal membuka halaman pembayaran Midtrans."
      );
    }
  }, [
    checkout,
    snapReady,
    getToken,
    router,
    handlePaymentSuccess,
    handlePaymentPending,
    handlePaymentError,
    handlePaymentClose,
  ]);

  // ===================================================
  // MANUAL CHECK STATUS
  // ===================================================

  const handleManualCheck = async () => {
    await verifyPayment({
      redirectOnTerminal: true,
    });
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2
              size={26}
              className="animate-spin text-[#112250]"
            />
          </div>

          <h2 className="mt-4 text-base font-bold text-[#14213D]">
            Memuat detail pembayaran...
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Menghubungkan data pesanan dengan backend.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // CHECKOUT ERROR
  // ===================================================

  if (!checkout) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#14213D]">
            Checkout Tidak Ditemukan
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Data transaksi tidak tersedia."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(`/cari-acara/${eventId}/beli`)
            }
            className="mt-6 w-full rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A]"
          >
            Kembali ke Pembelian
          </button>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Lihat Pesanan Saya
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // REDIRECTING
  // ===================================================

  if (redirecting) {
    const isPaid = paymentResult === "Paid";

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${
              isPaid
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 size={36} />
            ) : (
              <Clock size={36} />
            )}
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#14213D]">
            {isPaid
              ? "Pembayaran Berhasil"
              : "Status Pesanan Diperbarui"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {message}
          </p>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kode Pesanan
            </p>

            <p className="mt-1 break-all text-sm font-bold text-slate-800">
              {orderCode}
            </p>
          </div>

          <p className="mt-4 text-xl font-black text-[#112250]">
            {formatRupiah(total)}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#112250]" />
            Mengarahkan ke Pesanan Saya...
          </div>

          <button
            type="button"
            onClick={() => router.replace("/orders")}
            className="mt-5 w-full rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A]"
          >
            Lihat Pesanan Saya
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN PAYMENT PAGE
  // ===================================================

  return (
    <div className="w-full min-w-0">

      {/* HEADER */}

      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={() => router.back()}
                disabled={processing}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                title="Kembali"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  <ShieldCheck size={14} />
                  Secure Checkout
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                  Pembayaran
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Selesaikan transaksi melalui Midtrans.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <ShieldCheck size={16} />
              Transaksi Aman
            </div>
          </div>
        </div>
      </section>

      {/* ALERT */}

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <p className="text-sm font-medium leading-6 text-red-700">
            {error}
          </p>
        </div>
      )}

      {message && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <p className="text-sm font-medium leading-6 text-blue-700">
            {message}
          </p>
        </div>
      )}

      {/* MAIN LAYOUT */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

        {/* LEFT */}

        <div className="space-y-6">

          {/* ORDER DETAILS */}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#112250]">
                <Ticket className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#14213D]">
                  Detail Pesanan
                </h2>

                <p className="mt-0.5 break-all text-xs text-slate-500">
                  {orderCode}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">

              <h3 className="text-base font-bold text-[#14213D]">
                {eventTitle}
              </h3>

              <div className="mt-4 space-y-3 text-sm">

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Kategori Tiket
                  </span>

                  <span className="text-right font-semibold text-slate-800">
                    {category}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Jumlah Tiket
                  </span>

                  <span className="font-semibold text-slate-800">
                    {quantity} tiket
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Harga Satuan
                  </span>

                  <span className="font-semibold text-slate-800">
                    {formatRupiah(
                      quantity > 0 ? subtotal / quantity : 0
                    )}
                  </span>
                </div>

                {seatIds.length > 0 && (
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-slate-500">
                      Kursi Pilihan
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {seatIds.map((seatId) => (
                        <span
                          key={seatId}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#112250]"
                        >
                          ID Kursi #{seatId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* PAYMENT METHOD */}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-base font-bold text-[#14213D]">
                Preferensi Pembayaran
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Metode pembayaran final tersedia pada halaman Midtrans.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;

                const active =
                  selectedMethod === method.value;

                return (
                  <button
                    key={method.value}
                    type="button"
                    disabled={processing}
                    onClick={() => setSelectedMethod(method.value)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[#112250] bg-blue-50/50 ring-1 ring-[#112250]"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        active
                          ? "bg-[#112250] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <span
                      className={`text-sm font-bold ${
                        active
                          ? "text-[#112250]"
                          : "text-slate-700"
                      }`}
                    >
                      {method.label}
                    </span>

                    {active && (
                      <CheckCircle2
                        size={16}
                        className="ml-auto text-[#112250]"
                      />
                    )}
                  </button>
                );
              })}

            </div>
          </section>

          {/* SECURITY */}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#14213D]">
                  Transaksi Anda Dilindungi
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Pembayaran diproses melalui Midtrans.
                  Konfirmasi akhir transaksi dilakukan oleh backend
                  berdasarkan status pembayaran yang diverifikasi.
                </p>
              </div>

            </div>
          </section>

        </div>

        {/* RIGHT: SUMMARY */}

        <aside className="h-fit lg:sticky lg:top-24">

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

            {/* SUMMARY HEADER */}

            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">

              <h2 className="text-base font-bold text-[#14213D]">
                Ringkasan Pembayaran
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Periksa rincian transaksi Anda.
              </p>

            </div>

            <div className="p-6">

              {/* STATUS */}

              <div className="mb-5 flex items-center justify-between gap-3">

                <span className="text-xs font-semibold text-slate-500">
                  Status Pesanan
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold ${getStatusColor(
                    paymentResult
                  )}`}
                >
                  {paymentResult}
                </span>

              </div>

              {/* BREAKDOWN */}

              <div className="space-y-3">

                <div className="flex justify-between gap-4 text-sm">

                  <span className="text-slate-500">
                    {category} × {quantity}
                  </span>

                  <span className="font-semibold text-slate-800">
                    {formatRupiah(subtotal)}
                  </span>

                </div>

                <div className="flex justify-between gap-4 text-sm">

                  <span className="text-slate-500">
                    Biaya Layanan
                  </span>

                  <span className="font-semibold text-slate-800">
                    {formatRupiah(serviceFee)}
                  </span>

                </div>

              </div>

              {/* TOTAL */}

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">

                <span className="text-sm font-bold text-[#14213D]">
                  Total Pembayaran
                </span>

                <span className="text-xl font-black text-[#112250]">
                  {formatRupiah(total)}
                </span>

              </div>

              {/* ORDER CODE */}

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3.5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Kode Pesanan
                </p>

                <p className="mt-1 break-all text-xs font-bold text-slate-800">
                  {orderCode}
                </p>

              </div>

              {/* MIDTRANS BUTTON */}

              <button
                type="button"
                onClick={handlePayment}
                disabled={
                  processing ||
                  !snapReady ||
                  paymentResult === "Paid" ||
                  paymentResult === "Expired" ||
                  paymentResult === "Cancelled"
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1A326A] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
              >
                {processing || !snapReady ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    {processing
                      ? "Memproses..."
                      : "Memuat Midtrans..."}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />

                    Bayar Sekarang

                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* CHECK STATUS */}

              <button
                type="button"
                onClick={handleManualCheck}
                disabled={checkingStatus || processing}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memeriksa Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Periksa Status Pembayaran
                  </>
                )}
              </button>

              {/* INFO */}

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">

                <div className="flex items-start gap-2.5">

                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                  <p className="text-[11px] font-medium leading-5 text-slate-600">
                    Status pembayaran akan diverifikasi langsung
                    melalui backend TicketVerse dan Midtrans.
                    Tiket hanya diterbitkan setelah pembayaran
                    dinyatakan berhasil.
                  </p>

                </div>

              </div>

              <p className="mt-4 text-center text-[10px] font-medium leading-4 text-slate-400">
                Pembayaran menggunakan{" "}
                {IS_PRODUCTION ? "Midtrans Production" : "Midtrans Sandbox"}.
                Jangan menutup halaman sebelum transaksi selesai.
              </p>

            </div>

          </section>

        </aside>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
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
  Sparkles,
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

const SNAP_URL = "https://app.sandbox.midtrans.com/snap/snap.js";

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
// FORMAT RUPIAH
// =====================================================

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

// =====================================================
// DELAY
// =====================================================

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// =====================================================
// MAIN PAGE
// =====================================================

export default function PembayaranPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params?.id;

  const [checkout, setCheckout] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("QRIS");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [paymentResult, setPaymentResult] = useState(null);
  const [snapReady, setSnapReady] = useState(false);

  // ===================================================
  // LOAD CHECKOUT DATA
  // ===================================================

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ticketverse_checkout");

      if (!stored) {
        setError(
          "Data checkout tidak ditemukan. Silakan ulangi pembelian."
        );
        return;
      }

      const parsed = JSON.parse(stored);

      if (!parsed.orderCode || !parsed.payment?.snap_token) {
        setError(
          "Snap Token atau kode pesanan tidak ditemukan. Silakan ulangi pembelian."
        );
        return;
      }

      setCheckout(parsed);

      const preference = {
        qris: "QRIS",
        ewallet: "E-Wallet",
        bank: "Transfer",
        card: "Credit Card",
      };

      setSelectedMethod(preference[parsed.preferredPaymentMethod] || "QRIS");
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Data checkout tidak dapat dibaca.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================================================
  // LOAD MIDTRANS SNAP
  // ===================================================

  useEffect(() => {
    if (!checkout) return;

    if (!CLIENT_KEY) {
      setError("Client Key Midtrans belum dikonfigurasi.");
      return;
    }

    if (window.snap) {
      setSnapReady(true);
      return;
    }

    let script = document.getElementById("midtrans-snap");

    if (script) {
      const handleLoad = () => setSnapReady(true);
      const handleError = () =>
        setError("Gagal memuat layanan pembayaran Midtrans.");

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

    script.onload = () => setSnapReady(true);

    script.onerror = () => {
      setError("Gagal memuat layanan pembayaran Midtrans.");
    };

    document.body.appendChild(script);
  }, [checkout]);

  // ===================================================
  // CHECKOUT DETAILS
  // ===================================================

  const orderCode = checkout?.orderCode || "-";
  const eventTitle = checkout?.eventTitle || "Event";
  const category = checkout?.ticketCategoryName || "Tiket";

  const quantity = Number(checkout?.quantity) || 1;
  const subtotal = Number(checkout?.subtotal) || 0;
  const serviceFee = Number(checkout?.serviceFee) || 0;

  const total = Number(checkout?.total) || subtotal + serviceFee;

  // ===================================================
  // CHECK PAYMENT STATUS
  // ===================================================

  const checkPaymentStatus = useCallback(async () => {
    if (!checkout?.orderCode) return null;

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Sesi login tidak ditemukan. Silakan login kembali."
      );
    }

    const response = await fetch(
      `${API_URL}/api/payments/midtrans-status/${encodeURIComponent(
        checkout.orderCode
      )}`,
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

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message || "Gagal memeriksa status pembayaran."
      );
    }

    return data.payment_status || data.order_status || null;
  }, [checkout]);

  // ===================================================
  // REDIRECT TO ORDERS
  // ===================================================

  const redirectToOrders = useCallback(
    (status, text) => {
      if (redirecting) return;

      try {
        const updatedCheckout = {
          ...checkout,
          paymentStatus: status,
        };

        sessionStorage.setItem(
          "ticketverse_checkout",
          JSON.stringify(updatedCheckout)
        );
      } catch (err) {
        console.error("Gagal menyimpan checkout:", err);
      }

      setPaymentResult(status);
      setMessage(text);
      setProcessing(false);
      setRedirecting(true);

      setTimeout(() => {
        router.replace("/orders");
      }, 1500);
    },
    [checkout, redirecting, router]
  );

  // ===================================================
  // HANDLE PAYMENT SUCCESS
  // ===================================================

  const handlePaymentSuccess = async () => {
    if (processing || redirecting) return;

    setProcessing(true);
    setError("");

    setMessage("Pembayaran diterima. Sedang memverifikasi transaksi...");

    let lastStatus = null;

    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const status = await checkPaymentStatus();

        lastStatus = status;

        if (status === "Paid") {
          redirectToOrders(
            "Paid",
            "Pembayaran berhasil! Tiket Anda telah diproses. Mengarahkan ke Pesanan Saya..."
          );
          return;
        }

        if (status === "Cancelled" || status === "Expired") {
          redirectToOrders(
            status,
            "Status pesanan telah diperbarui. Silakan periksa Pesanan Saya."
          );
          return;
        }
      } catch (err) {
        console.error(
          `Verifikasi pembayaran percobaan ${attempt + 1}:`,
          err
        );
      }

      if (attempt < 7) {
        await delay(1500);
      }
    }

    redirectToOrders(
      lastStatus || "Pending",
      "Pembayaran telah diterima dan sedang disinkronkan. Silakan periksa status terbaru di Pesanan Saya."
    );
  };

  // ===================================================
  // HANDLE PAYMENT PENDING
  // ===================================================

  const handlePaymentPending = () => {
    redirectToOrders(
      "Pending",
      "Transaksi sedang diproses oleh Midtrans. Status pesanan dapat dilihat di Pesanan Saya."
    );
  };

  // ===================================================
  // HANDLE PAYMENT ERROR
  // ===================================================

  const handlePaymentError = () => {
    setError(
      "Pembayaran belum berhasil diproses. Silakan periksa status pesanan sebelum mencoba kembali."
    );

    setProcessing(false);
    setRedirecting(false);
  };

  // ===================================================
  // HANDLE CLOSE SNAP
  // ===================================================

  const handlePaymentClose = () => {
    setMessage(
      "Jendela pembayaran ditutup. Pesanan Anda tetap tersimpan dan dapat diperiksa melalui Pesanan Saya."
    );

    setProcessing(false);
  };

  // ===================================================
  // OPEN MIDTRANS PAYMENT
  // ===================================================

  const handlePayment = () => {
    setError("");
    setMessage("");

    if (!checkout?.payment?.snap_token) {
      setError("Snap Token tidak tersedia. Silakan ulangi pembelian.");
      return;
    }

    if (!window.snap || !snapReady) {
      setError("Midtrans belum siap. Silakan coba beberapa saat lagi.");
      return;
    }

    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }

    if (processing) return;

    try {
      setProcessing(true);

      window.snap.pay(checkout.payment.snap_token, {
        onSuccess: handlePaymentSuccess,
        onPending: handlePaymentPending,
        onError: handlePaymentError,
        onClose: handlePaymentClose,
      });
    } catch (err) {
      console.error("Midtrans Snap error:", err);

      setError(err?.message || "Gagal membuka pembayaran Midtrans.");

      setProcessing(false);
    }
  };

  // ===================================================
  // LOADING PAGE
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
            <Loader2 size={26} className="animate-spin text-[#112250]" />
          </div>
          <h2 className="mt-4 text-base font-bold text-[#14213D]">
            Memuat detail pembayaran...
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Menyiapkan data transaksi Anda.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // CHECKOUT NOT FOUND
  // ===================================================

  if (!checkout) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={28} />
          </div>
          <h2 className="mt-5 text-lg font-bold text-[#14213D]">
            Checkout Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => router.push(`/cari-acara/${eventId}/beli`)}
            className="mt-6 w-full rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A]"
          >
            Kembali ke Pembelian
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // REDIRECTING SCREEN
  // ===================================================

  if (redirecting) {
    const isPaid = paymentResult === "Paid";

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${
              isPaid ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            {isPaid ? <CheckCircle2 size={36} /> : <Clock size={36} />}
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#14213D]">
            {isPaid ? "Pembayaran Berhasil" : "Pesanan Tersimpan"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>

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
      {/* HEADER HALAMAN */}
      <section className="relative isolate overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6">
        <div className="relative w-full px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
                title="Kembali"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                
                <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                  Pembayaran
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Selesaikan pembayaran melalui Midtrans.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
              <ShieldCheck size={16} />
              Terenkripsi & Aman
            </div>
          </div>
        </div>
      </section>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-medium leading-6 text-red-700">{error}</p>
        </div>
      )}

      {/* INFO MESSAGE */}
      {message && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm font-medium leading-6 text-blue-700">{message}</p>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* KIRI: DETAIL PESANAN & PREFERENSI */}
        <div className="space-y-6">
          {/* DETAIL PESANAN */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#112250]">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#14213D]">Detail Pesanan</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500 break-all">
                  {orderCode}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
              <h3 className="text-base font-bold text-[#14213D]">{eventTitle}</h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Kategori Tiket</span>
                  <span className="text-right font-semibold text-slate-800">{category}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Jumlah</span>
                  <span className="font-semibold text-slate-800">{quantity} tiket</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Harga Satuan</span>
                  <span className="font-semibold text-slate-800">
                    {formatRupiah(quantity > 0 ? subtotal / quantity : 0)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* PAYMENT PREFERENCES */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-bold text-[#14213D]">
                Preferensi Pembayaran
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Metode pembayaran final dipilih di halaman Midtrans.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const active = selectedMethod === method.value;

                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedMethod(method.value)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[#112250] bg-blue-50/50 ring-1 ring-[#112250]"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active
                          ? "bg-[#112250] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        active ? "text-[#112250]" : "text-slate-700"
                      }`}
                    >
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* INFO SECURITY */}
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
                  Semua pembayaran diproses melalui gateway Midtrans yang
                  terenkripsi. Kami tidak menyimpan detail kartu atau metode
                  pembayaran Anda.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* KANAN: RINGKASAN PEMBAYARAN */}
        <aside className="h-fit lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
              <h2 className="text-base font-bold text-[#14213D]">
                Ringkasan Pembayaran
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Periksa rincian sebelum melanjutkan.
              </p>
            </div>

            <div className="p-6">
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
                  <span className="text-slate-500">Biaya layanan</span>
                  <span className="font-semibold text-slate-800">
                    {formatRupiah(serviceFee)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <span className="text-sm font-bold text-[#14213D]">Total</span>
                <span className="text-xl font-black text-[#112250]">
                  {formatRupiah(total)}
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Kode Pesanan
                </p>
                <p className="mt-1 break-all text-xs font-bold text-slate-800">
                  {orderCode}
                </p>
              </div>

              {/* PAYMENT BUTTON */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={processing || !snapReady}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3.5 text-sm font-bold text-white transition shadow-sm hover:bg-[#1A326A] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
              >
                {processing || !snapReady ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {processing ? "Memproses..." : "Memuat Midtrans..."}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Bayar Sekarang
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[10px] leading-4 font-medium text-slate-400">
                Pembayaran diproses secara aman melalui Midtrans Sandbox.
                Status pembayaran diverifikasi oleh server dan tiket
                diterbitkan setelah pembayaran berhasil.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import {
  QrCodeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// API CONFIGURATION
// ============================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Pastikan base URL hanya memiliki satu prefix /api.
const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");

const TICKETS_URL = `${API_URL}/api/tickets`;

const getToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
};

// ============================================================
// HELPERS
// ============================================================

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

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

const statusConfig = {
  SUCCESS: {
    label: "Valid",
    color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
  },
  INVALID: {
    label: "Tidak Valid",
    color: "bg-red-500/20 border-red-500/30 text-red-400",
  },
  ALREADY_USED: {
    label: "Sudah Digunakan",
    color: "bg-amber-500/20 border-amber-500/30 text-amber-400",
  },
  UNPAID: {
    label: "Belum Dibayar",
    color: "bg-amber-500/20 border-amber-500/30 text-amber-400",
  },
  FORBIDDEN: {
    label: "Tidak Diizinkan",
    color: "bg-red-500/20 border-red-500/30 text-red-400",
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status || "Tidak diketahui",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ValidasiETicket() {
  const [ticketCode, setTicketCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const [history, setHistory] = useState([]);

  const [stats, setStats] = useState({
    valid: 0,
    invalid: 0,
    alreadyUsed: 0,
  });

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [pageError, setPageError] = useState("");

  // ==========================================================
  // HITUNG STATISTIK HARI INI
  // ==========================================================

  const calculateStats = (items) => {
    const today = new Date();

    const todayHistory = items.filter((item) => {
      if (!item.created_at) return false;

      const date = new Date(item.created_at);

      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    });

    return {
      valid: todayHistory.filter(
        (item) => item.result === "SUCCESS"
      ).length,

      invalid: todayHistory.filter(
        (item) =>
          item.result === "INVALID" ||
          item.result === "FORBIDDEN"
      ).length,

      alreadyUsed: todayHistory.filter(
        (item) =>
          item.result === "ALREADY_USED" ||
          item.result === "UNPAID"
      ).length,
    };
  };

  // ==========================================================
  // FETCH RIWAYAT CHECK-IN
  // ==========================================================

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);

    try {
      setHistoryError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali."
        );
      }

      const response = await fetch(
        `${TICKETS_URL}/check-in/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Sesi login telah berakhir. Silakan login kembali."
        );
      }

      if (response.status === 403) {
        throw new Error(
          data.message || "Akun tidak memiliki akses riwayat check-in."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Gagal mengambil riwayat check-in. HTTP ${response.status}`
        );
      }

      const historyData = Array.isArray(data.history)
        ? data.history
        : [];

      setHistory(historyData);

      // Statistik dihitung dari riwayat hari ini.
      setStats(calculateStats(historyData));
    } catch (error) {
      console.error("FETCH CHECK-IN HISTORY ERROR:", error);

      setHistoryError(
        error.message || "Gagal menghubungkan ke server."
      );
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ==========================================================
  // VALIDASI TIKET
  // ==========================================================

  const handleValidate = async (e) => {
    e.preventDefault();

    const qrCode = ticketCode.trim();

    if (!qrCode) return;

    if (qrCode.length !== 64) {
      setScanResult({
        status: "invalid",
        message: "QR Code harus terdiri dari 64 karakter.",
        data: null,
      });

      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setPageError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali."
        );
      }

      const response = await fetch(
        `${TICKETS_URL}/check-in`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            qr_code: qrCode,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(
          "Sesi login telah berakhir. Silakan login kembali."
        );
      }

      if (response.ok && data.success) {
        setScanResult({
          status: "valid",
          message: data.message || "Check-in berhasil.",
          data: data.ticket || null,
        });

        setTicketCode("");
      } else {
        setScanResult({
          status:
            response.status === 409 ? "used" : "invalid",
          message: data.message || "Validasi tiket gagal.",
          data: data.ticket || null,
        });
      }

      // Refresh riwayat setelah proses scan.
      await fetchHistory();
    } catch (error) {
      console.error("CHECK-IN ERROR:", error);

      setPageError(
        error.message || "Terjadi kesalahan koneksi ke server."
      );
    } finally {
      setIsScanning(false);
    }
  };

  // ==========================================================
  // RESULT STYLE
  // ==========================================================

  const getResultStyle = () => {
    if (scanResult?.status === "valid") {
      return {
        wrapper: "bg-emerald-50 border-emerald-200",
        icon: "bg-emerald-100 text-emerald-600",
        title: "text-emerald-800",
        Icon: CheckCircleIcon,
      };
    }

    if (scanResult?.status === "used") {
      return {
        wrapper: "bg-amber-50 border-amber-200",
        icon: "bg-amber-100 text-amber-600",
        title: "text-amber-800",
        Icon: ClockIcon,
      };
    }

    return {
      wrapper: "bg-red-50 border-red-200",
      icon: "bg-red-100 text-red-600",
      title: "text-red-800",
      Icon: XCircleIcon,
    };
  };

  const clearResult = () => {
    setScanResult(null);
    setTicketCode("");
    setPageError("");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}

      <section className="relative w-full overflow-hidden rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />

        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl" />

        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/superadmin"
              className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa0c0] transition-colors hover:text-white"
            >
              <ArrowLeftIcon className="h-3 w-3" />
              Kembali ke Dashboard
            </Link>

            <h1 className="text-[26px] font-bold tracking-[-0.03em] text-white sm:text-[32px]">
              Validasi{" "}
              <span className="bg-gradient-to-r from-[#8ab4f8] to-[#b0c8e0] bg-clip-text text-transparent">
                E-Ticket
              </span>
            </h1>

            <p className="mt-1.5 max-w-xl text-sm text-[#8aa0c0]">
              Validasi QR Code tiket pengunjung langsung melalui
              database TicketVerse.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm sm:self-auto">
            <ShieldCheckIcon className="h-5 w-5 text-[#8ab4f8]" />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8aa0c0]">
                Backend
              </p>

              <p className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                API
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE ERROR */}

      {pageError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
          <div>{pageError}</div>
        </div>
      )}

      {/* MAIN */}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        <div className="space-y-6 xl:col-span-2">

          {/* FORM VALIDASI */}

          <div className="rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)]">
            <div className="mb-5">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0a1628]">
                <span className="h-4 w-1 rounded-full bg-[#8ab4f8]" />
                Scan / Input QR Code Tiket
              </h2>

              <p className="mt-1 text-[11px] text-[#7e91b2]">
                Masukkan isi QR Code asli dari E-Ticket, bukan kode pesanan.
              </p>
            </div>

            <form onSubmit={handleValidate} className="space-y-4">
              <div className="relative">
                <QrCodeIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7e91b2]" />

                <input
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="Masukkan QR Code (64 karakter)"
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#d0d8e4] bg-[#f8fafc] py-4 pl-12 pr-4 text-sm font-medium text-[#0a1628] outline-none transition-all placeholder:text-[#a0b0c8] focus:border-[#8ab4f8] focus:ring-4 focus:ring-[#8ab4f8]/10"
                />
              </div>

              <p className="text-[10px] text-[#7e91b2]">
                Panjang kode: {ticketCode.trim().length}/64 karakter
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isScanning || !ticketCode.trim()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Memvalidasi...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-4 w-4" />
                      Validasi Tiket
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearResult}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d0d8e4] bg-[#f0f5fc] px-6 py-3.5 text-sm font-semibold text-[#0a1628] transition hover:bg-[#e0e8f0]"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* HASIL VALIDASI */}

            {scanResult && (
              <div
                className={`mt-6 rounded-xl border p-5 ${getResultStyle().wrapper}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getResultStyle().icon}`}
                  >
                    {(() => {
                      const Icon = getResultStyle().Icon;
                      return <Icon className="h-7 w-7" />;
                    })()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-bold ${getResultStyle().title}`}
                    >
                      {scanResult.message}
                    </h3>

                    {scanResult.data && (
                      <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-[#7e91b2]">
                            Nama Pemegang
                          </p>
                          <p className="font-semibold text-[#0a1628]">
                            {scanResult.data.customer_name || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-[#7e91b2]">
                            Kategori Tiket
                          </p>
                          <p className="font-semibold text-[#0a1628]">
                            {scanResult.data.category_name || "-"}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="mb-1 text-[#7e91b2]">
                            Nama Event
                          </p>
                          <p className="font-semibold text-[#0a1628]">
                            {scanResult.data.event_name || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-[#7e91b2]">
                            Kode Tiket
                          </p>
                          <p className="font-semibold text-[#0a1628]">
                            {scanResult.data.ticket_code || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-[#7e91b2]">
                            Harga Tiket
                          </p>
                          <p className="font-semibold text-[#0a1628]">
                            {formatRupiah(scanResult.data.price)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HISTORY */}

          <div className="rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0a1628]">
                  <ClockIcon className="h-4 w-4 text-[#3B507D]" />
                  Riwayat Validasi Terbaru
                </h2>

                <p className="mt-1 text-[11px] text-[#7e91b2]">
                  Riwayat pemeriksaan tiket dari backend.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="rounded-lg border border-[#e0e8f0] p-2 text-[#5a7aad] transition hover:bg-[#f0f5fc] disabled:opacity-50"
                title="Refresh riwayat"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${
                    loadingHistory ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>

            {historyError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <p className="font-semibold">
                  Gagal memuat riwayat
                </p>
                <p className="mt-1">{historyError}</p>

                <button
                  type="button"
                  onClick={fetchHistory}
                  className="mt-2 font-semibold underline"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#e0e8f0]">
                    <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-[#7e91b2]">
                      Kode Tiket
                    </th>

                    <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-[#7e91b2]">
                      Pemegang
                    </th>

                    <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-[#7e91b2]">
                      Status
                    </th>

                    <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#7e91b2]">
                      Waktu
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e0e8f0]/50">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <ArrowPathIcon className="mx-auto h-6 w-6 animate-spin text-blue-500" />

                        <p className="mt-2 text-xs text-slate-400">
                          Memuat riwayat...
                        </p>
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-xs text-[#7e91b2]"
                      >
                        Belum ada riwayat validasi.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-[#f0f5fc]"
                      >
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <TicketIcon className="h-4 w-4 shrink-0 text-[#5a7aad]" />

                            <span className="text-xs font-semibold text-[#0a1628]">
                              {item.ticket_code || `Scan #${item.id}`}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 pr-4">
                          <div>
                            <p className="text-xs font-medium text-[#0a1628]">
                              {item.customer_name || "Tidak diketahui"}
                            </p>

                            <p className="mt-1 max-w-[180px] truncate text-[10px] text-[#7e91b2]">
                              {item.event_name || "Event tidak diketahui"}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 pr-4">
                          <StatusBadge status={item.result} />
                        </td>

                        <td className="py-3.5 text-right">
                          <span className="text-xs text-[#7e91b2]">
                            {formatDate(item.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDEBAR STATISTIK */}

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e0e8f0]/50 bg-white/90 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)]">
            <h2 className="mb-5 text-[15px] font-bold text-[#0a1628]">
              Statistik Hari Ini
            </h2>

            <div className="space-y-4">
              {[
                {
                  label: "Valid",
                  value: stats.valid,
                  Icon: CheckCircleIcon,
                  color: "text-emerald-600",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Tidak Valid",
                  value: stats.invalid,
                  Icon: XCircleIcon,
                  color: "text-red-600",
                  bg: "bg-red-500/10",
                },
                {
                  label: "Sudah Digunakan / Belum Dibayar",
                  value: stats.alreadyUsed,
                  Icon: ClockIcon,
                  color: "text-amber-600",
                  bg: "bg-amber-500/10",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#e0e8f0] bg-[#f8fafc] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                    >
                      <item.Icon className="h-4 w-4" />
                    </div>

                    <span className="text-xs font-medium text-[#0a1628]">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-[#0a1628]">
                    {item.value}
                  </span>
                </div>
              ))}

              {loadingHistory && (
                <p className="text-center text-[10px] text-slate-400">
                  Memperbarui statistik...
                </p>
              )}
            </div>
          </div>

          {/* PANDUAN */}

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />

            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
              </div>

              <h3 className="mb-3 text-sm font-bold text-white">
                Panduan Validasi
              </h3>

              <ul className="mt-3 list-inside list-disc space-y-2 text-[11px] leading-5 text-[#8aa0c0]">
                <li>Gunakan QR Code asli dari E-Ticket.</li>
                <li>Pastikan pembayaran tiket sudah berhasil.</li>
                <li>Satu tiket hanya dapat digunakan satu kali.</li>
                <li>Jangan membagikan QR Code kepada orang lain.</li>
                <li>Periksa nama pemegang dan event setelah validasi.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

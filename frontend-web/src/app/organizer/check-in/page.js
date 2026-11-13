"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Ticket,
  User,
  CalendarDays,
  ScanLine,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Armchair,
  QrCode,
  Info,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function CheckInPage() {
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isScanningRef = useRef(false);
  const mountedRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      isScanningRef.current = false;
      if (mountedRef.current) setIsScanning(false);
      return;
    }

    try {
      if (isScanningRef.current) {
        await scanner.stop();
      }
    } catch (err) {
      console.error("STOP SCANNER ERROR:", err);
    } finally {
      isScanningRef.current = false;

      if (mountedRef.current) {
        setIsScanning(false);
      }

      try {
        await scanner.clear();
      } catch (err) {
        console.error("CLEAR SCANNER ERROR:", err);
      }
    }
  }, []);

  const handleCheckIn = useCallback(async (qrCode) => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;

    if (mountedRef.current) {
      setIsProcessing(true);
      setError("");
    }

    try {
      await stopScanner();

      const token = localStorage.getItem("token");

      if (!token) {
        if (mountedRef.current) {
          setResult({
            type: "error",
            message: "Sesi login tidak ditemukan. Silakan login kembali.",
          });
        }
        return;
      }

      const response = await fetch(`${API_BASE}/api/tickets/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qr_code: qrCode.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        let message = data.message || "Check-in gagal.";

        if (response.status === 401) {
          message = "Sesi login berakhir. Silakan login kembali.";
        } else if (response.status === 403) {
          message =
            data.message ||
            "Kamu tidak memiliki akses untuk memindai tiket event ini.";
        } else if (response.status === 409) {
          message =
            data.message || "Tiket ini sudah pernah digunakan untuk check-in.";
        }

        if (mountedRef.current) {
          setResult({
            type: "error",
            message,
            status: response.status,
          });
        }

        return;
      }

      if (mountedRef.current) {
        setResult({
          type: "success",
          message: data.message || "Check-in berhasil.",
          ticket: data.ticket || {},
        });
      }
    } catch (err) {
      console.error("CHECK-IN ERROR:", err);

      if (mountedRef.current) {
        setResult({
          type: "error",
          message: "Tidak dapat terhubung ke server. Periksa koneksi backend.",
        });
      }
    } finally {
      isProcessingRef.current = false;

      if (mountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [stopScanner]);

  const startScanner = useCallback(async () => {
    if (cameraLoading || isScanningRef.current) return;

    try {
      setCameraLoading(true);
      setError("");
      setResult(null);

      isProcessingRef.current = false;

      const { Html5Qrcode } = await import("html5-qrcode");

      if (!mountedRef.current) return;

      const readerElement = document.getElementById("qr-reader");

      if (!readerElement) {
        throw new Error("Elemen scanner tidak ditemukan.");
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;

          const qrCode = decodedText?.trim();

          if (!qrCode) return;

          await handleCheckIn(qrCode);
        },
        () => {}
      );

      isScanningRef.current = true;

      if (mountedRef.current) {
        setIsScanning(true);
      }
    } catch (err) {
      console.error("START SCANNER ERROR:", err);

      if (mountedRef.current) {
        setError(
          "Kamera tidak dapat dibuka. Pastikan browser memiliki izin kamera dan halaman menggunakan HTTPS atau localhost."
        );
        setIsScanning(false);
      }

      isScanningRef.current = false;
    } finally {
      if (mountedRef.current) {
        setCameraLoading(false);
      }
    }
  }, [cameraLoading, handleCheckIn]);

  const resetScanner = async () => {
    await stopScanner();

    isProcessingRef.current = false;

    setResult(null);
    setError("");

    await startScanner();
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      const scanner = scannerRef.current;

      if (scanner) {
        if (isScanningRef.current) {
          scanner
            .stop()
            .catch(() => {})
            .finally(() => {
              scanner.clear().catch(() => {});
              isScanningRef.current = false;
            });
        } else {
          scanner.clear().catch(() => {});
        }
      }
    };
  }, []);

  return (
    <div className="w-full min-w-0 text-[#0B1220]">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            <span>Organizer</span>
            <ChevronRight size={12} className="text-white/30" />
            <span className="text-white/90">Check-in Tiket</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
                <Sparkles size={12} className="text-sky-300" />
                Gate Check-in Suite
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                Check-in Tiket
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Pindai QR Code tiket pengunjung untuk memverifikasi kehadiran.
                Setiap tiket hanya dapat digunakan untuk satu kali check-in.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[12px] font-semibold text-white/80 backdrop-blur">
              <ShieldCheck size={15} className="text-sky-300" />
              Event Organizer
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <div>
            <p className="text-[12.5px] font-semibold text-rose-800">
              Kamera tidak tersedia
            </p>
            <p className="mt-0.5 text-[12.5px] leading-5 text-rose-700">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-b from-sky-50/50 to-white px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <Camera size={14} />
              </span>
              <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                Scanner QR
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[11.5px] font-semibold">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isScanning
                    ? "animate-pulse bg-emerald-500"
                    : "bg-slate-300"
                }`}
              />
              <span
                className={
                  isScanning ? "text-emerald-600" : "text-slate-400"
                }
              >
                {isScanning ? "Kamera Aktif" : "Kamera Nonaktif"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="relative min-h-[350px] overflow-hidden rounded-xl border border-slate-200 bg-[#0B1220]">
              <div
                id="qr-reader"
                className="min-h-[350px] w-full overflow-hidden"
              />

              {!isScanning && !cameraLoading && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-sky-300">
                    <QrCode size={30} />
                  </div>

                  <p className="mt-4 text-[13.5px] font-semibold text-white">
                    Scanner belum aktif
                  </p>

                  <p className="mt-2 max-w-xs text-[12px] leading-5 text-slate-400">
                    Aktifkan kamera untuk mulai memindai QR Code tiket.
                  </p>
                </div>
              )}

              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B1220] text-white">
                  <Loader2 size={32} className="animate-spin text-sky-400" />
                  <p className="mt-3 text-[12.5px] font-medium">
                    Menyiapkan kamera...
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B1220]/95 text-white">
                  <Loader2 size={36} className="animate-spin text-sky-400" />
                  <p className="mt-4 text-[13.5px] font-semibold">
                    Memverifikasi tiket...
                  </p>
                  <p className="mt-1 text-[12px] text-slate-400">
                    Mohon tunggu sebentar.
                  </p>
                </div>
              )}
            </div>

            {!isScanning && !result && (
              <button
                type="button"
                onClick={startScanner}
                disabled={cameraLoading || isProcessing}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cameraLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Camera size={17} />
                )}

                {cameraLoading ? "Membuka Kamera..." : "Buka Kamera"}
              </button>
            )}

            {isScanning && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 p-3 text-[12.5px] font-semibold text-sky-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-sky-600" />
                Arahkan QR Code tiket ke kotak scanner.
              </div>
            )}

            {result && (
              <button
                type="button"
                onClick={resetScanner}
                disabled={cameraLoading || isProcessing}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RotateCcw size={16} />
                Scan Tiket Berikutnya
              </button>
            )}
          </div>
        </section>

        <section className="space-y-6">
          {!result && (
            <div className="overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="border-b border-sky-100 bg-gradient-to-b from-sky-50/50 to-white px-5 py-4">
                <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                    <Ticket size={14} />
                  </span>
                  Menunggu Scan
                </h2>
              </div>

              <div className="p-5">
                <p className="text-[12.5px] leading-6 text-slate-500">
                  Informasi tiket akan ditampilkan setelah QR Code berhasil
                  dipindai dan diverifikasi oleh server.
                </p>

                <div className="mt-4 space-y-2">
                  <InfoItem
                    icon={<CheckCircle2 size={16} />}
                    text="Tiket wajib sudah dibayar."
                  />

                  <InfoItem
                    icon={<ScanLine size={16} />}
                    text="QR Code harus valid dan terdaftar."
                  />

                  <InfoItem
                    icon={<ShieldCheck size={16} />}
                    text="Tiket harus berasal dari event milik EO."
                  />

                  <InfoItem
                    icon={<Ticket size={16} />}
                    text="Setiap tiket hanya dapat check-in satu kali."
                  />
                </div>
              </div>
            </div>
          )}

          {result?.type === "success" && (
            <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="border-b border-emerald-100 bg-gradient-to-b from-emerald-50 to-white px-6 py-7 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={30} />
                </div>

                <h2 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-emerald-800">
                  Check-in Berhasil
                </h2>

                <p className="mt-1.5 text-[12.5px] leading-5 text-emerald-700">
                  {result.message}
                </p>
              </div>

              <div className="space-y-4 p-6">
                <TicketInfo
                  icon={<Ticket size={16} />}
                  label="Kode Tiket"
                  value={result.ticket?.ticket_code}
                />

                <TicketInfo
                  icon={<User size={16} />}
                  label="Pemesan"
                  value={result.ticket?.fullname}
                />

                <TicketInfo
                  icon={<CalendarDays size={16} />}
                  label="Event"
                  value={result.ticket?.event_name}
                />

                <TicketInfo
                  icon={<Ticket size={16} />}
                  label="Kategori"
                  value={result.ticket?.category_name}
                />

                {result.ticket?.seat_number && (
                  <TicketInfo
                    icon={<Armchair size={16} />}
                    label="Nomor Kursi"
                    value={result.ticket.seat_number}
                  />
                )}

                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3.5">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={15} />
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em]">
                      Status Check-in
                    </p>
                  </div>

                  <p className="mt-1.5 text-[13px] font-semibold text-emerald-800">
                    Sudah Check-in
                  </p>
                </div>

                <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <Clock size={12} />
                  Tiket berhasil diverifikasi oleh sistem.
                </div>
              </div>
            </div>
          )}

          {result?.type === "error" && (
            <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white px-6 py-7 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <XCircle size={30} />
                </div>

                <h2 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-rose-800">
                  Check-in Gagal
                </h2>

                <p className="mt-1.5 text-[12.5px] leading-6 text-rose-700">
                  {result.message}
                </p>

                {result.status === 409 && (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-100/70 px-3 py-2 text-[11.5px] font-medium text-rose-700">
                    Tiket ini sudah pernah digunakan sebelumnya.
                  </p>
                )}
              </div>

              <div className="p-6">
                <button
                  type="button"
                  onClick={resetScanner}
                  disabled={cameraLoading || isProcessing}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:opacity-60"
                >
                  <RotateCcw size={16} />
                  Scan Lagi
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-sky-200/80 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <ShieldCheck size={16} />
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-[#0B1220]">
                  Verifikasi Keamanan
                </h3>
                <p className="mt-1.5 text-[11.5px] leading-5 text-slate-600">
                  Validasi pembayaran, kepemilikan event, dan status penggunaan
                  tiket dilakukan langsung oleh backend. Jangan menerima tiket
                  hanya berdasarkan tampilan QR Code.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ icon, text }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-sky-100 bg-sky-50/50 p-2.5 text-[12px] text-slate-600">
      <span className="shrink-0 text-sky-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function TicketInfo({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-[12.5px] font-semibold text-slate-800">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
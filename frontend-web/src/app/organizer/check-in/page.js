"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CheckInPage() {
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [scannerReady, setScannerReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const startScanner = async () => {
    try {
      setError("");
      setResult(null);
      isProcessingRef.current = false;

      const { Html5Qrcode } = await import("html5-qrcode");

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      setScannerReady(true);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 280,
            height: 280,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;

          isProcessingRef.current = true;

          await handleCheckIn(decodedText);
        },
        () => {
          // Error scanning diabaikan agar scanner tetap berjalan.
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("START SCANNER ERROR:", err);

      setError(
        "Kamera tidak dapat dibuka. Pastikan browser memiliki izin menggunakan kamera."
      );

      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (err) {
      console.error("STOP SCANNER ERROR:", err);
    }

    setIsScanning(false);
  };

  const handleCheckIn = async (qrCode) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Sesi login tidak ditemukan. Silakan login kembali.");
        await stopScanner();
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/tickets/check-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            qr_code: qrCode,
          }),
        }
      );

      const data = await response.json();

      await stopScanner();

      if (!response.ok || !data.success) {
        setResult({
          type: "error",
          message: data.message || "Check-in gagal.",
        });

        return;
      }

      setResult({
        type: "success",
        message: data.message || "Check-in berhasil.",
        ticket: data.ticket,
      });
    } catch (err) {
      console.error("CHECK-IN ERROR:", err);

      await stopScanner();

      setResult({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    }
  };

  const resetScanner = async () => {
    setResult(null);
    setError("");
    isProcessingRef.current = false;

    await startScanner();
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear().catch(() => {});
          });
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <ScanLine size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Check-in Tiket
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Scan QR Code pada e-ticket customer untuk melakukan check-in.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR UMUM */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">Kamera tidak tersedia</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* SCANNER */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Camera
                  size={19}
                  className="text-blue-600"
                />

                <h2 className="font-semibold text-slate-900">
                  Scanner QR
                </h2>
              </div>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-2xl bg-slate-950">
                <div
                  id="qr-reader"
                  className="min-h-[350px] w-full"
                />
              </div>

              {!isScanning && !result && (
                <button
                  type="button"
                  onClick={startScanner}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <Camera size={19} />
                  Buka Kamera
                </button>
              )}

              {isScanning && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-600">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
                  Kamera aktif — arahkan QR ke kotak scanner
                </div>
              )}

              {result && (
                <button
                  type="button"
                  onClick={resetScanner}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RotateCcw size={18} />
                  Scan Tiket Berikutnya
                </button>
              )}
            </div>
          </section>

          {/* RESULT */}
          <section>
            {!result && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Ticket size={24} />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  Menunggu Scan
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Setelah QR Code berhasil terbaca, informasi tiket dan
                  status check-in akan muncul di sini.
                </p>

                <div className="mt-5 space-y-3">
                  <InfoItem
                    icon={<CheckCircle2 size={18} />}
                    text="Tiket harus sudah dibayar"
                  />

                  <InfoItem
                    icon={<ScanLine size={18} />}
                    text="QR Code harus valid"
                  />

                  <InfoItem
                    icon={<Ticket size={18} />}
                    text="Tiket yang sudah digunakan tidak dapat check-in lagi"
                  />
                </div>
              </div>
            )}

            {result?.type === "success" && (
              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                <div className="bg-emerald-50 px-6 py-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={34} />
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-emerald-800">
                    Check-in Berhasil
                  </h2>

                  <p className="mt-1 text-sm text-emerald-700">
                    Tiket berhasil digunakan untuk masuk event.
                  </p>
                </div>

                <div className="space-y-4 p-6">
                  <TicketInfo
                    icon={<Ticket size={18} />}
                    label="Kode Tiket"
                    value={result.ticket?.ticket_code}
                  />

                  <TicketInfo
                    icon={<User size={18} />}
                    label="Pemesan"
                    value={result.ticket?.fullname || "-"}
                  />

                  <TicketInfo
                    icon={<CalendarDays size={18} />}
                    label="Event"
                    value={result.ticket?.event_name || "-"}
                  />

                  <TicketInfo
                    icon={<Ticket size={18} />}
                    label="Kategori"
                    value={result.ticket?.category_name || "-"}
                  />

                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                      Status
                    </p>

                    <p className="mt-1 font-bold text-emerald-700">
                      Sudah Check-in
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result?.type === "error" && (
              <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
                <div className="bg-red-50 px-6 py-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <XCircle size={34} />
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-red-800">
                    Check-in Gagal
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {result.message}
                  </p>
                </div>

                <div className="p-6">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <RotateCcw size={18} />
                    Scan Lagi
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
      <span className="text-blue-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function TicketInfo({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-blue-600">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words font-semibold text-slate-800">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
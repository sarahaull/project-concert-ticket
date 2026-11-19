"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Mail,
  CreditCard,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const TICKET_CHECKIN_URL = `${API_BASE}/api/tickets/check-in`;

const easePremium = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.07,
      ease: easePremium,
    },
  }),
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easePremium },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.25, ease: easePremium },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easePremium },
  },
};

export default function CheckInPage() {
  const scannerRef = useRef(null);
  const mountedRef = useRef(false);

  const isProcessingRef = useRef(false);
  const isScanningRef = useRef(false);
  const cameraLoadingRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "-";
    const value = String(timeValue);
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
    return value;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const number = Number(value);
    if (Number.isNaN(number)) return String(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      isScanningRef.current = false;
      if (mountedRef.current) setIsScanning(false);
      return;
    }
    try {
      if (isScanningRef.current) await scanner.stop();
    } catch (err) {
      console.error("STOP SCANNER ERROR:", err);
    }
    isScanningRef.current = false;
    if (mountedRef.current) setIsScanning(false);
    try {
      await scanner.clear();
    } catch (err) {
      console.error("CLEAR SCANNER ERROR:", err);
    }
  }, []);

  const handleCheckIn = useCallback(
    async (qrCode) => {
      if (isProcessingRef.current) return;
      const scannedCode = String(qrCode || "").trim();
      if (!scannedCode) return;

      isProcessingRef.current = true;
      if (mountedRef.current) {
        setIsProcessing(true);
        setError("");
      }

      try {
        await stopScanner();
        if (!mountedRef.current) return;

        const token = localStorage.getItem("token");
        if (!token) {
          setResult({
            type: "error",
            message: "Sesi login tidak ditemukan. Silakan login kembali.",
            status: 401,
          });
          return;
        }

        const response = await fetch(TICKET_CHECKIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ qr_code: scannedCode }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          let message = data.message || "Check-in gagal.";
          if (response.status === 400)
            message = data.message || "Pembayaran tiket belum berhasil.";
          if (response.status === 401)
            message =
              data.message || "Sesi login berakhir. Silakan login kembali.";
          if (response.status === 403)
            message =
              data.message ||
              "Kamu tidak memiliki akses untuk memindai tiket event ini.";
          if (response.status === 404)
            message =
              data.message || "QR Code tidak ditemukan atau tidak valid.";
          if (response.status === 409)
            message = data.message || "Tiket ini sudah pernah digunakan.";

          if (mountedRef.current) {
            setResult({
              type: "error",
              message,
              status: response.status,
              backendData: data,
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
            message:
              "Tidak dapat terhubung ke server. Periksa koneksi backend.",
          });
        }
      } finally {
        isProcessingRef.current = false;
        if (mountedRef.current) setIsProcessing(false);
      }
    },
    [stopScanner]
  );

  const startScanner = useCallback(async () => {
    if (cameraLoadingRef.current || isScanningRef.current) return;

    cameraLoadingRef.current = true;
    if (mountedRef.current) {
      setCameraLoading(true);
      setError("");
      setResult(null);
    }

    try {
      isProcessingRef.current = false;

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );
      if (!mountedRef.current) return;

      const readerElement = document.getElementById("qr-reader");
      if (!readerElement) {
        throw new Error("Elemen scanner #qr-reader tidak ditemukan.");
      }

      // Gunakan decoder JavaScript html5-qrcode agar pembacaan QR konsisten
      // pada Chrome/Edge, webcam laptop, dan kamera HP.
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader", {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          useBarCodeDetectorIfSupported: false,
        });
      }

      // Pastikan instance tidak sedang menjalankan kamera.
      if (isScanningRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (stopError) {
          console.warn("Scanner sebelumnya sudah berhenti:", stopError);
        }
        isScanningRef.current = false;
      }

      // Bersihkan tampilan video lama sebelum memulai sesi baru.
      try {
        await scannerRef.current.clear();
      } catch (clearError) {
        console.warn("Scanner belum perlu dibersihkan:", clearError);
      }

      // Pilih kamera berdasarkan daftar perangkat. Jangan selalu memaksa
      // facingMode environment karena itu sering gagal pada webcam laptop.
      let cameras = [];
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (enumerateError) {
        console.warn("Gagal mengambil daftar kamera:", enumerateError);
      }

      const selectedCamera =
        cameras.find((camera) =>
          /back|rear|environment|belakang/i.test(camera.label || "")
        ) || cameras[0];

      const cameraConfig = selectedCamera
        ? selectedCamera.id
        : { facingMode: "environment" };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(
              Math.min(viewfinderWidth, viewfinderHeight, 420) * 0.8
            );
            return {
              width: Math.max(180, size),
              height: Math.max(180, size),
            };
          },
          aspectRatio: 1,
          disableFlip: false,
          videoConstraints: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        async (decodedText) => {
          const qrCode = String(decodedText || "").trim();
          if (!qrCode || isProcessingRef.current) return;
          // handleCheckIn mengunci isProcessingRef secara sinkron sebelum
          // menjalankan request, sehingga frame berikutnya tidak dobel.
          await handleCheckIn(qrCode);
        },
        () => {
          // Gagal decode adalah kondisi normal saat QR belum masuk frame.
        }
      );

      isScanningRef.current = true;
      if (mountedRef.current) setIsScanning(true);
    } catch (err) {
      console.error("START SCANNER ERROR:", err);
      isScanningRef.current = false;

      const message = String(err?.message || err || "");
      let userMessage =
        "Kamera tidak dapat dibuka. Periksa izin kamera browser dan pastikan tidak digunakan aplikasi lain.";

      if (/permission|denied|notallowed/i.test(message)) {
        userMessage =
          "Izin kamera ditolak. Klik ikon kamera di address bar browser, izinkan akses kamera, lalu muat ulang halaman.";
      } else if (/notfound|no camera|requested device not found/i.test(message)) {
        userMessage =
          "Kamera tidak ditemukan. Sambungkan kamera atau pilih perangkat kamera yang tersedia.";
      } else if (/notreadable|could not start video source|track start/i.test(message)) {
        userMessage =
          "Kamera sedang digunakan aplikasi lain atau tidak dapat dibuka. Tutup aplikasi lain yang memakai kamera, lalu coba lagi.";
      } else if (/secure|https/i.test(message)) {
        userMessage =
          "Akses kamera membutuhkan HTTPS atau localhost. Buka aplikasi melalui http://localhost:3000 atau alamat HTTPS.";
      } else if (message) {
        userMessage = message;
      }

      if (mountedRef.current) {
        setError(userMessage);
        setIsScanning(false);
      }

      try {
        if (scannerRef.current) {
          await scannerRef.current.clear();
        }
      } catch (clearError) {
        console.error("SCANNER CLEANUP ERROR:", clearError);
      }
    } finally {
      cameraLoadingRef.current = false;
      if (mountedRef.current) setCameraLoading(false);
    }
  }, [handleCheckIn]);

  const resetScanner = useCallback(async () => {
    if (cameraLoadingRef.current || isProcessingRef.current) return;
    await stopScanner();
    isProcessingRef.current = false;
    if (mountedRef.current) {
      setResult(null);
      setError("");
    }
    await startScanner();
  }, [stopScanner, startScanner]);

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

  const ticket = result?.ticket || {};
  const customerName = ticket.customer_name || ticket.fullname || "-";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full min-w-0 text-[#0B1220]"
    >
      {/* HEADER */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl"
        />

        <motion.div
          animate={{ backgroundPositionX: ["0px", "32px"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <motion.div
            variants={fadeUp}
            custom={1}
            className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50"
          >
            <span>Organizer</span>
            <ChevronRight size={12} className="text-white/30" />
            <span className="text-white/90">Check-in Tiket</span>
          </motion.div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <motion.div
                variants={fadeUp}
                custom={2}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles size={12} className="text-sky-300" />
                </motion.span>
                Gate Check-in Suite
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={3}
                className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]"
              >
                Check-in Tiket
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={4}
                className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60"
              >
                Pindai QR Code tiket pengunjung untuk memverifikasi kehadiran.
                Setiap tiket hanya dapat digunakan untuk satu kali check-in.
              </motion.p>
            </div>

            <motion.div
              variants={fadeUp}
              custom={5}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[12px] font-semibold text-white/80 backdrop-blur"
            >
              <ShieldCheck size={15} className="text-sky-300" />
              Event Organizer
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ERROR KAMERA */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.35, ease: easePremium }}
            className="mb-5 flex items-start gap-3 overflow-hidden rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
            </motion.div>
            <div>
              <p className="text-[12.5px] font-semibold text-rose-800">
                Kamera tidak tersedia
              </p>
              <p className="mt-0.5 text-[12.5px] leading-5 text-rose-700">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* SCANNER */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={6}
          className="overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-b from-sky-50/50 to-white px-5 py-4">
            <div className="flex items-center gap-2">
              <motion.span
                whileHover={{ rotate: -8, scale: 1.08 }}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100"
              >
                <Camera size={14} />
              </motion.span>
              <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                Scanner QR
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[11.5px] font-semibold">
              <motion.span
                animate={
                  isScanning
                    ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }
                    : {}
                }
                transition={{ duration: 1.4, repeat: Infinity }}
                className={`h-1.5 w-1.5 rounded-full ${
                  isScanning ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <span
                className={isScanning ? "text-emerald-600" : "text-slate-400"}
              >
                {isScanning ? "Kamera Aktif" : "Kamera Nonaktif"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easePremium }}
              className="relative min-h-[350px] overflow-hidden rounded-xl border border-slate-200 bg-[#0B1220]"
            >
              <div id="qr-reader" className="min-h-[350px] w-full overflow-hidden" />

              {/* Scan line effect when scanning */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-[5]"
                  >
                    <motion.div
                      animate={{ y: ["0%", "100%", "0%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-sky-400/25 to-transparent"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {!isScanning && !cameraLoading && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-sky-300"
                    >
                      <QrCode size={30} />
                    </motion.div>
                    <p className="mt-4 text-[13.5px] font-semibold text-white">
                      Scanner belum aktif
                    </p>
                    <p className="mt-2 max-w-xs text-[12px] leading-5 text-slate-400">
                      Aktifkan kamera untuk mulai memindai QR Code tiket.
                    </p>
                  </motion.div>
                )}

                {cameraLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B1220] text-white"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 size={32} className="text-sky-400" />
                    </motion.div>
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="mt-3 text-[12.5px] font-medium"
                    >
                      Menyiapkan kamera...
                    </motion.p>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B1220]/95 text-white"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 size={36} className="text-sky-400" />
                    </motion.div>
                    <motion.p
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="mt-4 text-[13.5px] font-semibold"
                    >
                      Memverifikasi tiket...
                    </motion.p>
                    <p className="mt-1 text-[12px] text-slate-400">
                      Menghubungkan dengan server TicketVerse.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {!isScanning && !result && (
                <motion.button
                  key="open-camera"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
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
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 p-3 text-[12.5px] font-semibold text-sky-700"
                >
                  <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-sky-600"
                  />
                  Arahkan QR Code tiket ke kotak scanner.
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {result && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={resetScanner}
                  disabled={cameraLoading || isProcessing}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  <RotateCcw size={16} />
                  Scan Tiket Berikutnya
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* PANEL HASIL */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={slideInRight}
          className="space-y-6"
        >
          <AnimatePresence mode="wait">
            {!result && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: easePremium }}
                className="overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              >
                <div className="border-b border-sky-100 bg-gradient-to-b from-sky-50/50 to-white px-5 py-4">
                  <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                    <motion.span
                      whileHover={{ rotate: -8, scale: 1.08 }}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100"
                    >
                      <Ticket size={14} />
                    </motion.span>
                    Menunggu Scan
                  </h2>
                </div>

                <div className="p-5">
                  <p className="text-[12.5px] leading-6 text-slate-500">
                    Informasi tiket akan ditampilkan setelah QR Code berhasil
                    dipindai dan diverifikasi oleh server.
                  </p>

                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="mt-4 space-y-2"
                  >
                    {[
                      {
                        icon: <CheckCircle2 size={16} />,
                        text: "Tiket wajib sudah dibayar.",
                      },
                      {
                        icon: <ScanLine size={16} />,
                        text: "QR Code harus valid dan terdaftar.",
                      },
                      {
                        icon: <ShieldCheck size={16} />,
                        text: "Tiket harus berasal dari event milik EO.",
                      },
                      {
                        icon: <Ticket size={16} />,
                        text: "Setiap tiket hanya dapat check-in satu kali.",
                      },
                    ].map((item, idx) => (
                      <motion.div key={idx} variants={fadeUp}>
                        <InfoItem icon={item.icon} text={item.text} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {result?.type === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.5, ease: easePremium }}
                className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              >
                <div className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-b from-emerald-50 to-white px-6 py-7 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="pointer-events-none absolute inset-0 bg-emerald-200/20 blur-3xl"
                  />
                  <motion.div
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.15,
                      }}
                    >
                      <CheckCircle2 size={30} />
                    </motion.div>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative mt-4 text-[17px] font-semibold tracking-[-0.01em] text-emerald-800"
                  >
                    Check-in Berhasil
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative mt-1.5 text-[12.5px] leading-5 text-emerald-700"
                  >
                    {result.message}
                  </motion.p>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 p-6"
                >
                  {[
                    {
                      icon: <Ticket size={16} />,
                      label: "Kode Tiket",
                      value: ticket.ticket_code,
                    },
                    {
                      icon: <User size={16} />,
                      label: "Nama Pemesan",
                      value: customerName,
                    },
                    {
                      icon: <Mail size={16} />,
                      label: "Email Pemesan",
                      value: ticket.customer_email,
                    },
                    {
                      icon: <CalendarDays size={16} />,
                      label: "Event",
                      value: ticket.event_name,
                    },
                    {
                      icon: <CalendarDays size={16} />,
                      label: "Tanggal Event",
                      value: formatDate(ticket.event_date),
                    },
                    {
                      icon: <Clock size={16} />,
                      label: "Waktu Event",
                      value: formatTime(ticket.event_time),
                    },
                    {
                      icon: <Ticket size={16} />,
                      label: "Kategori Tiket",
                      value: ticket.category_name,
                    },
                    {
                      icon: <CreditCard size={16} />,
                      label: "Harga Tiket",
                      value: formatCurrency(ticket.price),
                    },
                  ].map((item, idx) => (
                    <motion.div key={idx} variants={fadeUp}>
                      <TicketInfo
                        icon={item.icon}
                        label={item.label}
                        value={item.value}
                      />
                    </motion.div>
                  ))}

                  {(ticket.section_name || ticket.seat_number) && (
                    <motion.div variants={fadeUp}>
                      <TicketInfo
                        icon={<Armchair size={16} />}
                        label="Tempat Duduk"
                        value={[
                          ticket.section_name,
                          ticket.section_code,
                          ticket.seat_row ? `Baris ${ticket.seat_row}` : null,
                          ticket.seat_number
                            ? `Nomor ${ticket.seat_number}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" - ")}
                      />
                    </motion.div>
                  )}

                  <motion.div
                    variants={fadeUp}
                    className="rounded-lg border border-emerald-100 bg-emerald-50 p-3.5"
                  >
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={15} />
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em]">
                        Status Check-in
                      </p>
                    </div>
                    <p className="mt-1.5 text-[13px] font-semibold text-emerald-800">
                      Sudah Check-in
                    </p>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400"
                  >
                    <Clock size={12} />
                    Tiket berhasil diverifikasi oleh sistem.
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {result?.type === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.5, ease: easePremium }}
                className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              >
                <div className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white px-6 py-7 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="pointer-events-none absolute inset-0 bg-rose-200/20 blur-3xl"
                  />
                  <motion.div
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600"
                  >
                    <motion.div
                      animate={{ rotate: [0, -8, 8, -8, 0] }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <XCircle size={30} />
                    </motion.div>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative mt-4 text-[17px] font-semibold tracking-[-0.01em] text-rose-800"
                  >
                    Check-in Gagal
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative mt-1.5 text-[12.5px] leading-6 text-rose-700"
                  >
                    {result.message}
                  </motion.p>

                  {result.status === 409 && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 }}
                      className="relative mt-3 rounded-lg border border-rose-200 bg-rose-100/70 px-3 py-2 text-[11.5px] font-medium text-rose-700"
                    >
                      Tiket ini sudah pernah digunakan sebelumnya.
                    </motion.p>
                  )}
                  {result.status === 400 && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 }}
                      className="relative mt-3 rounded-lg border border-rose-200 bg-rose-100/70 px-3 py-2 text-[11.5px] font-medium text-rose-700"
                    >
                      Tiket belum memenuhi persyaratan pembayaran.
                    </motion.p>
                  )}
                  {result.status === 403 && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 }}
                      className="relative mt-3 rounded-lg border border-rose-200 bg-rose-100/70 px-3 py-2 text-[11.5px] font-medium text-rose-700"
                    >
                      Akses check-in ditolak oleh backend.
                    </motion.p>
                  )}
                </div>

                <div className="p-6">
                  <motion.button
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={resetScanner}
                    disabled={cameraLoading || isProcessing}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:opacity-60"
                  >
                    <RotateCcw size={16} />
                    Scan Lagi
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-sky-200/80 bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(14,165,233,0.08)]"
          >
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.08 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100"
              >
                <ShieldCheck size={16} />
              </motion.div>
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
          </motion.div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon, text }) {
  return (
    <motion.div
      whileHover={{ x: 3, borderColor: "rgb(186 230 253)" }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2.5 rounded-lg border border-sky-100 bg-sky-50/50 p-2.5 text-[12px] text-slate-600"
    >
      <span className="shrink-0 text-sky-600">{icon}</span>
      <span>{text}</span>
    </motion.div>
  );
}

function TicketInfo({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <motion.div
        whileHover={{ rotate: -8, scale: 1.08 }}
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100"
      >
        {icon}
      </motion.div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[12.5px] font-semibold text-slate-800">
          {value !== null && value !== undefined && value !== ""
            ? value
            : "-"}
        </p>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCodeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TicketIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const mockHistory = [
  {
    id: "TRX-2025-0610-001",
    name: "Aisyah Putri",
    event: "Coldplay - Music of The Spheres",
    ticketType: "VIP",
    price: 2500000,
    status: "valid",
    time: "10:45 WIB",
    date: "10 Jun 2025",
  },
  {
    id: "TRX-2025-0610-002",
    name: "Muhammad Alif",
    event: "Blackpink - Born Pink",
    ticketType: "Festival",
    price: 1800000,
    status: "valid",
    time: "10:42 WIB",
    date: "10 Jun 2025",
  },
  {
    id: "TRX-2025-0610-003",
    name: "Jonathan Lee",
    event: "NCT Dream - The Dream Show 3",
    ticketType: "VIP",
    price: 2200000,
    status: "invalid",
    time: "10:38 WIB",
    date: "10 Jun 2025",
  },
  {
    id: "TRX-2025-0610-004",
    name: "Nadia Rahma",
    event: "Sheila On 7 - Tunggu Aku di Jakarta",
    ticketType: "Festival",
    price: 1500000,
    status: "valid",
    time: "10:35 WIB",
    date: "10 Jun 2025",
  },
  {
    id: "TRX-2025-0610-005",
    name: "David Setiawan",
    event: "Deep Purple - The Long Goodbye",
    ticketType: "VIP",
    price: 2800000,
    status: "pending",
    time: "10:30 WIB",
    date: "10 Jun 2025",
  },
];

export default function ValidasiETicket() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState(mockHistory);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleValidate = (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const foundTicket = mockHistory.find(
        (t) => t.id.toLowerCase() === ticketCode.trim().toLowerCase()
      );

      if (foundTicket) {
        setScanResult({
          status: foundTicket.status,
          data: foundTicket,
          message:
            foundTicket.status === "valid"
              ? "E-Ticket Valid & Berhasil Divalidasi"
              : foundTicket.status === "invalid"
              ? "E-Ticket Tidak Valid / Sudah Digunakan"
              : "E-Ticket Masih Dalam Proses Verifikasi",
        });
      } else {
        setScanResult({
          status: "invalid",
          data: null,
          message: "Kode E-Ticket tidak ditemukan dalam sistem",
        });
      }
      setIsScanning(false);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    const styles = {
      valid: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
      invalid: "bg-red-500/20 border-red-500/30 text-red-400",
      pending: "bg-amber-500/20 border-amber-500/30 text-amber-400",
    };
    const labels = {
      valid: "Valid",
      invalid: "Tidak Valid",
      pending: "Pending",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${styles[status]}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === "valid"
              ? "bg-emerald-400"
              : status === "invalid"
              ? "bg-red-400"
              : "bg-amber-400"
          } animate-pulse`}
        />
        {labels[status]}
      </span>
    );
  };

  return (
    <div
      className={`w-full space-y-6 ${
        isLoaded ? "animate-in fade-in duration-500" : "opacity-0"
      }`}
    >
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-[#4a6b9a]/15 blur-2xl animate-pulse delay-150" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/superadmin"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white">
              Validasi{" "}
              <span className="bg-gradient-to-r from-[#8ab4f8] to-[#b0c8e0] bg-clip-text text-transparent">
                E-Ticket
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Pindai atau masukkan kode E-Ticket untuk memverifikasi keaslian
              tiket pengunjung secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm self-start sm:self-auto">
            <ShieldCheckIcon className="w-5 h-5 text-[#8ab4f8]" />
            <div>
              <p className="text-[10px] text-[#8aa0c0] uppercase tracking-wider font-semibold">
                Scanner Status
              </p>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
            <div className="mb-5">
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#8ab4f8]" />
                Scan / Input Kode Tiket
              </h2>
              <p className="text-[11px] text-[#7e91b2] mt-0.5">
                Masukkan kode unik E-Ticket atau scan QR Code
              </p>
            </div>

            <form onSubmit={handleValidate} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <QrCodeIcon className="h-5 w-5 text-[#7e91b2]" />
                </div>
                <input
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="Contoh: TRX-2025-0610-001"
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-4 focus:ring-[#8ab4f8]/10 transition-all"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isScanning || !ticketCode.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:shadow-[0_8px_25px_rgba(10,22,40,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isScanning ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memvalidasi...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      Validasi Tiket
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 bg-[#f0f5fc] text-[#0a1628] text-sm font-semibold px-6 py-3.5 rounded-xl border border-[#d0d8e4] hover:bg-[#e0e8f0] transition-all duration-300"
                >
                  <QrCodeIcon className="w-4 h-4" />
                  Buka Kamera
                </button>
              </div>
            </form>

            {scanResult && (
              <div
                className={`mt-6 p-5 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                  scanResult.status === "valid"
                    ? "bg-emerald-50 border-emerald-200"
                    : scanResult.status === "invalid"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      scanResult.status === "valid"
                        ? "bg-emerald-100 text-emerald-600"
                        : scanResult.status === "invalid"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {scanResult.status === "valid" ? (
                      <CheckCircleIcon className="w-7 h-7" />
                    ) : scanResult.status === "invalid" ? (
                      <XCircleIcon className="w-7 h-7" />
                    ) : (
                      <ClockIcon className="w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-bold ${
                        scanResult.status === "valid"
                          ? "text-emerald-800"
                          : scanResult.status === "invalid"
                          ? "text-red-800"
                          : "text-amber-800"
                      }`}
                    >
                      {scanResult.message}
                    </h3>
                    {scanResult.data && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[#7e91b2] mb-0.5">Nama Pemegang</p>
                          <p className="font-semibold text-[#0a1628]">
                            {scanResult.data.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#7e91b2] mb-0.5">Tipe Tiket</p>
                          <p className="font-semibold text-[#0a1628]">
                            {scanResult.data.ticketType}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[#7e91b2] mb-0.5">Event</p>
                          <p className="font-semibold text-[#0a1628]">
                            {scanResult.data.event}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-[#3B507D]" />
                  Riwayat Validasi Terbaru
                </h2>
                <p className="text-[11px] text-[#7e91b2] mt-0.5">
                  Aktivitas pemindaian tiket hari ini
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e0e8f0]">
                    <th className="pb-3 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">
                      Kode Tiket
                    </th>
                    <th className="pb-3 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">
                      Pemegang
                    </th>
                    <th className="pb-3 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="pb-3 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider text-right">
                      Waktu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e8f0]/50">
                  {history.map((item, index) => (
                    <tr
                      key={index}
                      className="group hover:bg-[#f0f5fc] transition-colors duration-200"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <TicketIcon className="w-4 h-4 text-[#5a7aad]" />
                          <span className="text-xs font-semibold text-[#0a1628]">
                            {item.id}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[#0a1628]">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[#7e91b2] truncate max-w-[150px]">
                            {item.event}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-xs text-[#7e91b2]">
                          {item.time}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
            <div className="mb-4">
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#4a6b9a]" />
                Statistik Hari Ini
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e0e8f0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircleIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-[#0a1628]">
                    Valid
                  </span>
                </div>
                <span className="text-sm font-bold text-[#0a1628]">248</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e0e8f0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
                    <XCircleIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-[#0a1628]">
                    Tidak Valid
                  </span>
                </div>
                <span className="text-sm font-bold text-[#0a1628]">12</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e0e8f0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-[#0a1628]">
                    Pending
                  </span>
                </div>
                <span className="text-sm font-bold text-[#0a1628]">5</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 shadow-[0_8px_30px_rgba(10,20,40,0.25)] relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Panduan Validasi
              </h3>
              <ul className="text-[11px] text-[#8aa0c0] space-y-2 mt-3 list-disc list-inside">
                <li>Pastikan QR Code tidak rusak atau terlipat.</li>
                <li>Periksa kecocokan nama pada E-Ticket dengan identitas.</li>
                <li>E-Ticket hanya dapat digunakan satu kali.</li>
                <li>Hubungi supervisor jika terjadi kendala sistem.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(138, 180, 248, 0.15),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 6s ease-in-out infinite;
        }

        .animate-in {
          animation: fadeInUp 0.6s ease both;
        }

        .delay-75 {
          animation-delay: 0.75s;
        }
        .delay-150 {
          animation-delay: 1.5s;
        }

        .fade-in {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
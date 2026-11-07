"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  CreditCardIcon,
  CalendarIcon,
  UsersIcon,
  ArrowsRightLeftIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  TicketIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// ============================================================
// FORMAT
// ============================================================

const formatNumber = (number) => {
  return new Intl.NumberFormat("id-ID").format(number);
};

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============================================================
// STATISTICS — Premium dengan Gradien Menarik
// ============================================================

const statsData = [
  {
    title: "Total Pengguna",
    value: "56.231",
    change: "+9.3%",
    icon: UsersIcon,
    gradient: "from-[#0a1628] via-[#1a2f4a] to-[#2a4a7a]",
    accent: "#8ab4f8",
    glow: "rgba(138,180,248,0.15)",
  },
  {
    title: "Pendapatan",
    value: formatRupiah(2458750000),
    change: "+18.6%",
    icon: CreditCardIcon,
    gradient: "from-[#0a1628] via-[#1a2f3a] to-[#4a6b5a]",
    accent: "#6bcf8a",
    glow: "rgba(107,207,138,0.15)",
  },
  {
    title: "Total Event",
    value: "128",
    change: "+15.2%",
    icon: CalendarIcon,
    gradient: "from-[#0a1628] via-[#1a2a3a] to-[#4a5a7a]",
    accent: "#8ab4f8",
    glow: "rgba(138,180,248,0.15)",
  },
  {
    title: "Transaksi",
    value: "31.658",
    change: "+14.7%",
    icon: ArrowsRightLeftIcon,
    gradient: "from-[#0a1628] via-[#1a2a3a] to-[#5a4a6a]",
    accent: "#c084fc",
    glow: "rgba(192,132,252,0.15)",
  },
];

// ============================================================
// CATEGORY
// ============================================================

const categoryData = {
  labels: ["VIP", "Festival", "Konser", "Fan Meeting", "Lainnya"],
  datasets: [
    {
      data: [35.2, 28.1, 22.4, 8.7, 5.6],
      backgroundColor: ["#8ab4f8", "#4a6b9a", "#2a4a7a", "#6b8fc0", "#b0c8e0"],
      borderColor: "#ffffff",
      borderWidth: 3,
      hoverOffset: 10,
    },
  ],
};

// ============================================================
// EVENTS
// ============================================================

const topEvents = [
  {
    name: "COLDPLAY",
    subtitle: "Music of The Spheres World Tour",
    sold: 4860,
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=300&fit=crop",
  },
  {
    name: "BLACKPINK",
    subtitle: "Born Pink World Tour",
    sold: 3945,
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=300&h=300&fit=crop",
  },
  {
    name: "NCT DREAM",
    subtitle: "The Dream Show 3",
    sold: 2756,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop",
  },
  {
    name: "Sheila On 7",
    subtitle: "Tunggu Aku di Jakarta",
    sold: 2301,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop",
  },
  {
    name: "Deep Purple",
    subtitle: "The Long Goodbye Tour",
    sold: 1967,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  },
];

// ============================================================
// USERS
// ============================================================

const newUsers = [
  { name: "Aisyah Putri", email: "aisyahp@gmail.com" },
  { name: "Muhammad Alif", email: "alif.muhammad@gmail.com" },
  { name: "Jonathan Lee", email: "jonathanlee@gmail.com" },
  { name: "Nadia Rahma", email: "nadirahma@gmail.com" },
  { name: "David Setiawan", email: "davidsetiawan@gmail.com" },
];

// ============================================================
// ACTIVITIES
// ============================================================

const recentActivities = [
  {
    text: "Event baru ditambahkan — Coldplay",
    time: "2 jam lalu",
    type: "event",
  },
  {
    text: "Transaksi berhasil — TRX-2025-0610-001",
    time: "3 jam lalu",
    type: "transaction",
  },
  {
    text: "Refund diproses — REF-2025-0609-018",
    time: "5 jam lalu",
    type: "refund",
  },
  {
    text: "User baru terdaftar — aisyahp@gmail.com",
    time: "6 jam lalu",
    type: "user",
  },
  {
    text: "Banner diperbarui — Summer Festival Promo",
    time: "8 jam lalu",
    type: "banner",
  },
];

// ============================================================
// STAT CARD — Premium Version dengan Animasi
// ============================================================

function StatsCard({ title, value, change, icon: Icon, gradient, accent, glow }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative min-w-0 overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: `linear-gradient(135deg, #0a1628 0%, #13213b 50%, #1b2f4e 100%)`,
        boxShadow: isHovered
          ? `0 20px 60px ${glow || "rgba(138,180,248,0.15)"}`
          : `0 4px 20px rgba(10,20,40,0.08)`,
      }}
    >
      {/* Decorative glow orbs */}
      <div
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-all duration-700"
        style={{
          background: accent || "#5a8ad0",
          opacity: isHovered ? 0.2 : 0.05,
          transform: isHovered ? "scale(1.2)" : "scale(1)",
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full blur-3xl transition-all duration-700"
        style={{
          background: accent || "#5a8ad0",
          opacity: isHovered ? 0.15 : 0.03,
          transform: isHovered ? "scale(1.3)" : "scale(1)",
        }}
      />

      {/* Shimmer border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent, ${accent}40, transparent)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8aa0c0]">
              {title}
            </p>
            <p className="mt-2 text-[26px] sm:text-[28px] font-bold tracking-[-0.02em] text-white leading-tight break-words">
              {value}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold transition-colors duration-300"
                style={{ color: accent || "#8ab4f8" }}
              >
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
                {change}
              </span>
              <span className="text-[10px] text-[#7e91b2]">dari periode lalu</span>
            </div>
          </div>
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300"
            style={{
              borderColor: isHovered ? `${accent}60` : "#4a6b9a/30",
              background: isHovered ? `rgba(26,47,74,0.7)` : "rgba(26,47,74,0.5)",
              boxShadow: isHovered ? `0 0 30px ${glow || "rgba(138,180,248,0.1)"}` : "none",
            }}
          >
            <Icon
              className="w-5 h-5 transition-all duration-300"
              style={{
                color: isHovered ? accent || "#8ab4f8" : "#8ab4f8",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("bulan ini");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // ==========================================================
  // REVENUE CHART — Premium Colors
  // ==========================================================

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [
      {
        label: "Pendapatan",
        data: [120000000, 180000000, 220000000, 290000000, 350000000, 410000000, 480000000, 520000000, 580000000, 620000000, 680000000, 758750000],
        borderColor: "#8ab4f8",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(138,180,248,0.25)");
          gradient.addColorStop(0.5, "rgba(138,180,248,0.08)");
          gradient.addColorStop(1, "rgba(138,180,248,0)");
          return gradient;
        },
        fill: true,
        tension: 0.42,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: "#8ab4f8",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "Tiket Terjual",
        data: [1200, 1800, 2200, 2900, 3500, 4100, 4800, 5200, 5800, 6200, 6800, 7587],
        borderColor: "#4a6b9a",
        backgroundColor: "rgba(74,107,154,0.05)",
        fill: true,
        tension: 0.42,
        borderDash: [6, 4],
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#4a6b9a",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        yAxisID: "y1",
      },
    ],
  };

  // ==========================================================
  // CHART OPTIONS — Refined
  // ==========================================================

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#8aa0c0",
          font: { size: 11, weight: "500" },
          boxWidth: 8,
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(10,22,40,0.95)",
        titleColor: "#e0e8f0",
        bodyColor: "#8aa0c0",
        padding: 14,
        cornerRadius: 12,
        displayColors: true,
        borderColor: "rgba(74,107,154,0.3)",
        borderWidth: 1,
        backdropColor: "rgba(10,22,40,0.8)",
        backdropPadding: 10,
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: "rgba(74,107,154,0.06)" },
        ticks: {
          color: "#7e91b2",
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: false,
        border: { display: false },
        grid: { color: "rgba(74,107,154,0.06)" },
        ticks: {
          color: "#7e91b2",
          font: { size: 9 },
          callback: (value) => `Rp ${(value / 1000000).toFixed(0)}M`,
        },
      },
      y1: {
        position: "right",
        border: { display: false },
        grid: { drawOnChartArea: false },
        ticks: {
          color: "#7e91b2",
          font: { size: 9 },
          callback: (value) => `${(value / 1000).toFixed(0)}K`,
        },
      },
    },
  };

  // ==========================================================
  // DOUGHNUT OPTIONS — Premium
  // ==========================================================

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#8aa0c0",
          font: { size: 10, weight: "500" },
          boxWidth: 8,
          padding: 14,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(10,22,40,0.95)",
        titleColor: "#e0e8f0",
        bodyColor: "#8aa0c0",
        padding: 12,
        cornerRadius: 12,
        borderColor: "rgba(74,107,154,0.3)",
        borderWidth: 1,
      },
    },
  };

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className={`w-full space-y-6 ${isLoaded ? "animate-in fade-in duration-500" : "opacity-0"}`}>
      {/* ======================================================
          WELCOME — Premium Hero dengan Efek Glow
          ====================================================== */}

      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        {/* Background dengan gradien dan efek */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />

        {/* Decorative orbs dengan animasi */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-[#4a6b9a]/15 blur-2xl animate-pulse delay-150" />

        {/* Shimmer border */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-[#8ab4f8]/20 to-transparent animate-shimmer" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8ab4f8] shadow-[0_0_12px_rgba(138,180,248,0.6)] animate-pulse" />
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0]">
              Overview
            </p>
          </div>

          <h1 className="mt-3 text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white">
            Selamat datang, <span className="bg-gradient-to-r from-[#8ab4f8] to-[#b0c8e0] bg-clip-text text-transparent">Super Admin</span>
          </h1>

          <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
            Berikut ringkasan aktivitas platform TicketVerse hari ini. Kelola dan pantau dengan mudah.
          </p>

          {/* Badge status */}
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Normal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-medium text-blue-400">
              <SparklesIcon className="w-3 h-3" />
              Live
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================
          STATISTICS — dengan Animasi Stagger
          ====================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`transition-all duration-700 delay-${index * 100}`}
            style={{
              animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
            }}
          >
            <StatsCard {...stat} />
          </div>
        ))}
      </section>

      {/* ======================================================
          CHARTS
          ====================================================== */}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="xl:col-span-2 min-w-0 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#8ab4f8]" />
                Grafik Pendapatan
              </h2>
              <p className="text-[11px] text-[#7e91b2] mt-0.5">
                Perbandingan pendapatan dan tiket terjual
              </p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="self-start sm:self-auto bg-white border border-[#d0d8e4] rounded-xl px-3 py-2 text-[11px] font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 cursor-pointer transition"
            >
              <option value="bulan ini">Bulan Ini</option>
              <option value="3 bulan">3 Bulan</option>
              <option value="tahun ini">Tahun Ini</option>
            </select>
          </div>

          <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[350px]">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* CATEGORY DOUGHNUT */}
        <div className="min-w-0 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
          <div className="mb-5">
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#4a6b9a]" />
              Kategori Penjualan
            </h2>
            <p className="text-[11px] text-[#7e91b2] mt-0.5">
              Distribusi tiket terjual
            </p>
          </div>

          <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[350px]">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>
      </section>

      {/* ======================================================
          BOTTOM CONTENT
          ====================================================== */}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EVENT TERLARIS */}
        <div className="min-w-0 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
                <FireIcon className="w-4 h-4 text-amber-500" />
                Event Terlaris
              </h2>
              <p className="text-[11px] text-[#7e91b2] mt-0.5">
                Berdasarkan tiket terjual
              </p>
            </div>
            <Link
              href="/superadmin/events"
              className="text-[11px] font-semibold text-[#5a7aad] hover:text-[#0a1628] transition-colors flex items-center gap-1"
            >
              Lihat semua
              <ArrowUpRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {topEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f0f5fc] transition-all duration-200 hover:translate-x-1"
              >
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-[#e0e8f0]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0a1628] truncate">
                    {event.name}
                  </p>
                  <p className="text-[11px] text-[#7e91b2] truncate mt-0.5">
                    {event.subtitle}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#0a1628]">
                    {formatNumber(event.sold)}
                  </p>
                  <p className="text-[9px] text-[#7e91b2]">terjual</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* USER BARU */}
        <div className="min-w-0 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-[#3B507D]" />
                Pengguna Baru
              </h2>
              <p className="text-[11px] text-[#7e91b2] mt-0.5">
                Bergabung dalam 24 jam terakhir
              </p>
            </div>
            <Link
              href="/superadmin/users"
              className="text-[11px] font-semibold text-[#5a7aad] hover:text-[#0a1628] transition-colors flex items-center gap-1"
            >
              Lihat semua
              <ArrowUpRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {newUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f0f5fc] transition-all duration-200 hover:translate-x-1"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0a1628] truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#7e91b2] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AKTIVITAS */}
        <div className="min-w-0 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-[#3B507D]" />
              Aktivitas Sistem
            </h2>
            <p className="text-[11px] text-[#7e91b2] mt-0.5">Terbaru di TicketVerse</p>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full mt-1.5 bg-[#5a8ad0] shadow-[0_0_8px_rgba(90,138,208,0.4)] group-hover:shadow-[0_0_16px_rgba(90,138,208,0.6)] transition-all duration-300" />
                  {index !== recentActivities.length - 1 && (
                    <span className="absolute top-4 w-px h-8 bg-[#d0d8e4] group-hover:bg-[#8ab4f8] transition-colors duration-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-[#0a1628] leading-relaxed">
                    {activity.text}
                  </p>
                  <p className="text-[10px] text-[#7e91b2] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          SYSTEM SUMMARY — Premium Cards
          ====================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemCard
          icon={<CheckCircleIcon className="w-4 h-4" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          title="Status Sistem"
          value="All Systems Operational"
          subtitle="Version 1.0.0"
          borderColor="border-emerald-500/20"
          glowColor="rgba(16,185,129,0.1)"
        />
        <SystemCard
          icon={<CalendarIcon className="w-4 h-4" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          title="Event Aktif"
          value="72"
          subtitle="dari 128 events"
          borderColor="border-blue-500/20"
          glowColor="rgba(59,130,246,0.1)"
        />
        <SystemCard
          icon={<TicketIcon className="w-4 h-4" />}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          title="Tiket Terjual"
          value="18.246"
          subtitle="dari 24.789 tiket"
          borderColor="border-purple-500/20"
          glowColor="rgba(168,85,247,0.1)"
        />
        <SystemCard
          icon={<ClockIcon className="w-4 h-4" />}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
          title="Pending"
          value="312"
          subtitle="perlu verifikasi"
          borderColor="border-amber-500/20"
          glowColor="rgba(245,158,11,0.1)"
        />
      </section>

      {/* ======================================================
          STYLE — Animations
          ====================================================== */}

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

        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
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

// ============================================================
// SYSTEM CARD — Premium
// ============================================================

function SystemCard({ icon, iconBg, iconColor, title, value, subtitle, borderColor, glowColor }) {
  return (
    <div
      className="group rounded-2xl bg-white/90 backdrop-blur-sm border p-5 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300 hover:-translate-y-1"
      style={{ borderColor: borderColor || "rgba(224,232,240,0.5)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
          style={{
            background: iconBg || "#e6f0fa",
            boxShadow: glowColor ? `0 0 20px ${glowColor}` : "none",
          }}
        >
          <span className={iconColor || "text-[#4a6b9a]"}>{icon}</span>
        </div>
        <p className="text-[11px] font-medium text-[#7e91b2]">{title}</p>
      </div>
      <p className="text-[20px] font-bold text-[#0a1628] mt-2">{value}</p>
      <p className="text-[11px] text-[#7e91b2] mt-0.5">{subtitle}</p>
    </div>
  );
}
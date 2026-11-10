"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UsersIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function LaporanAnalitik() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeRange, setTimeRange] = useState("6 Bulan Terakhir");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: [120000000, 180000000, 220000000, 290000000, 350000000, 410000000],
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
    ],
  };

  const ticketData = {
    labels: ["VIP", "Festival", "Konser", "Fan Meeting", "Lainnya"],
    datasets: [
      {
        label: "Tiket Terjual",
        data: [3500, 2800, 2200, 800, 500],
        backgroundColor: [
          "rgba(138,180,248,0.8)",
          "rgba(74,107,154,0.8)",
          "rgba(42,74,122,0.8)",
          "rgba(107,143,192,0.8)",
          "rgba(176,200,224,0.8)",
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10,22,40,0.95)",
        titleColor: "#e0e8f0",
        bodyColor: "#8aa0c0",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#7e91b2", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(74,107,154,0.1)" },
        ticks: {
          color: "#7e91b2",
          font: { size: 10 },
          callback: (value) => `Rp ${(value / 1000000).toFixed(0)}M`,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { grid: { display: false }, ticks: { color: "#7e91b2", font: { size: 10 } } },
      y: { grid: { color: "rgba(74,107,154,0.1)" }, ticks: { color: "#7e91b2", font: { size: 10 } } },
    },
  };

  return (
    <div className={`w-full space-y-6 ${isLoaded ? "animate-in fade-in duration-500" : "opacity-0"}`}>
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link href="/superadmin" className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3">
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-[#8ab4f8]" />
              Laporan & Analitik
            </h1>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Pantau performa penjualan, pendapatan, dan tren tiket secara menyeluruh.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-xs font-medium rounded-xl px-3 py-2 outline-none backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all"
            >
              <option className="text-black" value="6 Bulan Terakhir">6 Bulan Terakhir</option>
              <option className="text-black" value="Tahun Ini">Tahun Ini</option>
              <option className="text-black" value="Bulan Ini">Bulan Ini</option>
            </select>
            <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] text-[#0a1628] text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-[0_8px_25px_rgba(138,180,248,0.3)] hover:-translate-y-0.5 transition-all">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Ekspor PDF
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Pendapatan", value: formatRupiah(1570000000), icon: CurrencyDollarIcon, trend: "+18.2%", color: "text-emerald-500" },
          { title: "Tiket Terjual", value: "9,800", icon: TicketIcon, trend: "+12.5%", color: "text-emerald-500" },
          { title: "Pengunjung Baru", value: "3,240", icon: UsersIcon, trend: "+5.1%", color: "text-emerald-500" },
          { title: "Event Aktif", value: "12", icon: CalendarIcon, trend: "Stabil", color: "text-blue-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-[#f0f5fc] rounded-lg text-[#4a6b9a]">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#7e91b2] uppercase tracking-wider">{stat.title}</p>
            <p className="text-xl font-bold text-[#0a1628] mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-[15px] font-bold text-[#0a1628] mb-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#8ab4f8]" />
            Tren Pendapatan
          </h2>
          <p className="text-[11px] text-[#7e91b2] mb-6">Pendapatan kotor dari penjualan tiket</p>
          <div className="h-[280px]">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-[15px] font-bold text-[#0a1628] mb-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#4a6b9a]" />
            Distribusi Kategori Tiket
          </h2>
          <p className="text-[11px] text-[#7e91b2] mb-6">Jumlah tiket terjual berdasarkan kategori</p>
          <div className="h-[280px]">
            <Bar data={ticketData} options={barOptions} />
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.6s ease both; }
        .delay-75 { animation-delay: 0.75s; }
        .fade-in { opacity: 1; }
      `}</style>
    </div>
  );
}
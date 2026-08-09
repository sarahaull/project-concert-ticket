// app/superadmin/dashboard/page.js
'use client';

import { useState } from 'react';
import {
  CreditCardIcon,
  CalendarIcon,
  UsersIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Link from 'next/link';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// ============================================================
// DATA DUMMY
// ============================================================
const statsData = [
  {
    title: 'Total Pendapatan',
    value: 'Rp 2.458.750.000',
    change: '+18.6%',
    icon: CreditCardIcon,
    bg: 'bg-[#3B507D]/10',
    textColor: 'text-[#3B507D]',
  },
  {
    title: 'Total Events',
    value: '128',
    change: '+15.2%',
    icon: CalendarIcon,
    bg: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
  },
  {
    title: 'Total Users',
    value: '56.231',
    change: '+9.3%',
    icon: UsersIcon,
    bg: 'bg-amber-500/10',
    textColor: 'text-amber-600',
  },
  {
    title: 'Transaksi',
    value: '31.658',
    change: '+14.7%',
    icon: ArrowsRightLeftIcon,
    bg: 'bg-rose-500/10',
    textColor: 'text-rose-600',
  },
  {
    title: 'Refunds',
    value: '684',
    change: '-5.4%',
    icon: ArrowsRightLeftIcon,
    bg: 'bg-red-500/10',
    textColor: 'text-red-600',
  },
];

const categoryData = {
  labels: ['VIP', 'Festival', 'Konser', 'Fan Meeting', 'Lainnya'],
  datasets: [
    {
      data: [35.2, 28.1, 22.4, 8.7, 5.6],
      backgroundColor: ['#112250', '#3B507D', '#BEB7A7', '#E7E2CE', '#F5F4F0'],
      borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
      borderWidth: 2,
    },
  ],
};

const topEvents = [
  {
    name: 'COLDPLAY',
    subtitle: 'Music of The Spheres World Tour',
    sold: 4860,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=100&h=100&fit=crop&crop=center',
  },
  {
    name: 'BLACKPINK',
    subtitle: 'Born Pink World Tour',
    sold: 3945,
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=100&h=100&fit=crop&crop=center',
  },
  {
    name: 'NCT DREAM',
    subtitle: 'The Dream Show 3',
    sold: 2756,
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100&h=100&fit=crop&crop=center',
  },
  {
    name: 'Sheila On 7',
    subtitle: 'Tunggu Aku di Jakarta',
    sold: 2301,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop&crop=center',
  },
  {
    name: 'Deep Purple',
    subtitle: 'The Long Goodbye Tour',
    sold: 1967,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
  },
];

const newUsers = [
  { name: 'Aisyah Putri', email: 'aisyahp@gmail.com' },
  { name: 'Muhammad Alif', email: 'alif.muhammad@gmail.com' },
  { name: 'Jonathan Lee', email: 'jonathanlee@gmail.com' },
  { name: 'Nadia Rahma', email: 'nadirahma@gmail.com' },
  { name: 'David Setiawan', email: 'davidsetiawan@gmail.com' },
];

const recentActivities = [
  { text: 'Event baru ditambahkan - Coldplay', time: '2 jam lalu', type: 'event' },
  { text: 'Transaksi berhasil - TRX-2025-0610-001', time: '3 jam lalu', type: 'transaction' },
  { text: 'Refund diproses - REF-2025-0609-018', time: '5 jam lalu', type: 'refund' },
  { text: 'User baru terdaftar - aisyahp@gmail.com', time: '6 jam lalu', type: 'user' },
  { text: 'Banner diperbarui - Summer Festival Promo', time: '8 jam lalu', type: 'banner' },
];

const systemSummary = {
  status: 'All System Operational',
  version: '1.0.0',
  activeEvents: 72,
  totalEvents: 128,
  soldTickets: 18246,
  totalTickets: 24789,
  pendingTransactions: 312,
  pendingRefunds: 28,
  uptime: '99.9%',
  database: 'Normal',
};

// ============================================================
// STATS CARD
// ============================================================
const StatsCard = ({ title, value, change, icon: Icon, bg, textColor }) => {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-[#112250]/60 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-[#112250] mt-1 break-words">{value}</p>
          <p className={`text-[10px] sm:text-xs font-medium mt-1.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {change} dari periode lalu
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-xl ${bg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${textColor}`} />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('bulan ini');

  // Data grafik pendapatan
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: [120000000, 180000000, 220000000, 290000000, 350000000, 410000000, 480000000, 520000000, 580000000, 620000000, 680000000, 758750000],
        borderColor: '#3B507D',
        backgroundColor: 'rgba(59, 80, 125, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#112250',
        pointBorderColor: '#3B507D',
        pointBorderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Tiket Terjual',
        data: [1200, 1800, 2200, 2900, 3500, 4100, 4800, 5200, 5800, 6200, 6800, 7587],
        borderColor: '#BEB7A7',
        backgroundColor: 'rgba(190, 183, 167, 0.2)',
        fill: true,
        tension: 0.4,
        borderDash: [5, 5],
        pointBackgroundColor: '#E7E2CE',
        pointBorderColor: '#BEB7A7',
        pointBorderWidth: 2,
        pointRadius: 3,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#112250',
          font: { size: 10 },
          boxWidth: 12,
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#F5F4F0',
        borderColor: '#3B507D',
        borderWidth: 1,
        titleColor: '#112250',
        bodyColor: '#112250',
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(17,34,80,0.05)', drawBorder: false },
        ticks: { color: '#112250', font: { size: 9 } },
      },
      y: {
        grid: { color: 'rgba(17,34,80,0.05)', drawBorder: false },
        ticks: {
          color: '#112250',
          font: { size: 9 },
          callback: (value) => `Rp ${(value / 1000000).toFixed(0)}M`,
        },
      },
      y1: {
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#112250',
          font: { size: 9 },
          callback: (value) => `${(value / 1000).toFixed(0)}K`,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#112250',
          font: { size: 10 },
          boxWidth: 10,
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    cutout: '65%',
  };

  const typeColors = {
    event: 'border-[#3B507D]/30',
    transaction: 'border-emerald-600/30',
    refund: 'border-rose-600/30',
    user: 'border-amber-600/30',
    banner: 'border-purple-600/30',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-[#112250]">Selamat datang, Super Admin</h2>
        <p className="text-sm text-[#112250]/60 mt-1">Berikut ringkasan aktivitas platform TicketVerse hari ini.</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {statsData.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <h3 className="text-sm font-semibold text-[#112250]">Grafik Pendapatan</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full sm:w-auto bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg px-3 py-1.5 text-xs text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
            >
              <option value="bulan ini">Bulan Ini</option>
              <option value="3 bulan">3 Bulan</option>
              <option value="tahun ini">Tahun Ini</option>
            </select>
          </div>
          <div className="h-48 sm:h-56 md:h-64">
            <Line data={revenueData} options={options} />
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#112250] mb-4">Penjualan Tiket Berdasarkan Kategori</h3>
          <div className="h-44 sm:h-52 md:h-56">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Events */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#112250] mb-4">Event Terlaris</h3>
          <div className="space-y-2 sm:space-y-3">
            {topEvents.map((event, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-[#F5F4F0] transition-colors duration-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#E7E2CE]">
                  <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#112250] truncate">{event.name}</p>
                  <p className="text-[10px] sm:text-xs text-[#112250]/60 truncate">{event.subtitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#3B507D]">
                    {event.sold?.toLocaleString() ?? '0'}
                  </p>
                  <p className="text-[8px] sm:text-[10px] text-[#112250]/40">terjual</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#112250] mb-4">Pengguna Baru</h3>
          <div className="space-y-2 sm:space-y-2.5">
            {newUsers.map((user, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-[#F5F4F0] transition-colors duration-200">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#3B507D]/30 to-[#112250]/30 flex items-center justify-center text-xs font-semibold text-[#112250] flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#112250] truncate">{user.name}</p>
                  <p className="text-[10px] sm:text-xs text-[#112250]/60 truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#112250] mb-4">Aktivitas Sistem Terbaru</h3>
          <div className="space-y-2 sm:space-y-2.5">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 rounded-xl hover:bg-[#F5F4F0] transition-colors duration-200">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 sm:mt-2 border ${typeColors[activity.type] || 'border-[#BEB7A7]/30'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-[#112250]">{activity.text}</p>
                  <p className="text-[8px] sm:text-[10px] text-[#112250]/40 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-3 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs text-[#112250]/60">Status Sistem</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs sm:text-sm font-medium text-[#112250] truncate">{systemSummary.status}</p>
          </div>
          <p className="text-[8px] sm:text-xs text-[#112250]/40 mt-1">Version {systemSummary.version}</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-3 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs text-[#112250]/60">Total Events Aktif</p>
          <p className="text-base sm:text-lg font-bold text-[#112250] mt-1">{systemSummary.activeEvents}</p>
          <p className="text-[8px] sm:text-xs text-[#112250]/40">dari {systemSummary.totalEvents} events</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-3 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs text-[#112250]/60">Tiket Terjual</p>
          <p className="text-base sm:text-lg font-bold text-[#112250] mt-1">
            {systemSummary.soldTickets?.toLocaleString() ?? '0'}
          </p>
          <p className="text-[8px] sm:text-xs text-[#112250]/40">
            dari {systemSummary.totalTickets?.toLocaleString() ?? '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-3 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs text-[#112250]/60">Transaksi Pending</p>
          <p className="text-base sm:text-lg font-bold text-[#112250] mt-1">{systemSummary.pendingTransactions}</p>
          <p className="text-[8px] sm:text-xs text-[#112250]/40">perlu verifikasi</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-4 sm:p-6 text-center shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-[#112250]">Kelola semua event musik dalam satu platform</h3>
        <p className="text-xs sm:text-sm text-[#112250]/60 mt-1">TicketVerse membantu kamu mengelola event, penjualan tiket, dan analisis dengan mudah.</p>
        <Link
          href="/superadmin/events"
          className="inline-block mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium text-sm sm:text-base hover:shadow-lg hover:shadow-[#3B507D]/30 transition-all duration-300 hover:scale-105"
        >
          Kelola Event Sekarang
        </Link>
      </div>
    </div>
  );
}
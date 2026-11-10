"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TicketIcon,
  CalendarIcon,
  HashtagIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const categories = {
  1: {
    name: "VIP",
    code: "VIP",
    description: "Tiket dengan akses dan fasilitas eksklusif. Termasuk area khusus di depan panggung, akses masuk prioritas, dan merchandise eksklusif.",
    status: "Aktif",
    totalEvents: 24,
    totalTickets: 4280,
    createdAt: "12 Agustus 2026",
    updatedAt: "28 Agustus 2026",
    percentage: 45,
  },
  2: {
    name: "Festival",
    code: "FEST",
    description: "Tiket untuk area festival dan standing. Nikmati pengalaman menonton konser dari area standing yang luas dan dekat dengan panggung.",
    status: "Aktif",
    totalEvents: 38,
    totalTickets: 12560,
    createdAt: "10 Agustus 2026",
    updatedAt: "27 Agustus 2026",
    percentage: 60,
  },
  3: {
    name: "Regular",
    code: "REG",
    description: "Tiket reguler untuk pengunjung umum. Akses standar ke area konser dengan fasilitas umum yang memadai.",
    status: "Aktif",
    totalEvents: 42,
    totalTickets: 18420,
    createdAt: "08 Agustus 2026",
    updatedAt: "26 Agustus 2026",
    percentage: 75,
  },
};

export default function TicketCategoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  const category = categories[params.id] || categories[1];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link 
              href="/superadmin/kategori-tiket" 
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Daftar Kategori
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white">
                {category.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {category.status}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Detail lengkap dan statistik penggunaan kategori tiket ini.
            </p>
          </div>
          <Link
            href={`/superadmin/kategori-tiket/${params.id}/edit`}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-sm font-bold px-5 py-3 rounded-xl transition-all duration-300 self-start sm:self-auto"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Edit Kategori
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 shadow-lg relative overflow-hidden text-white">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#8ab4f8]/10 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
                <TicketIcon className="w-10 h-10 text-[#8ab4f8]" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] mb-1">
                  Kode Kategori
                </p>
                <h2 className="text-2xl font-bold tracking-wide text-white font-mono">
                  {category.code}
                </h2>
                <p className="mt-2 text-xs text-[#8aa0c0] max-w-md leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] p-6">
            <h2 className="text-[15px] font-bold text-[#0a1628] mb-5 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#8ab4f8]" />
              Statistik Penggunaan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e0e8f0] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider">Terhubung ke Event</p>
                  <p className="text-lg font-bold text-[#0a1628]">{category.totalEvents} Event</p>
                </div>
              </div>
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e0e8f0] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <TicketIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider">Total Tiket Terjual</p>
                  <p className="text-lg font-bold text-[#0a1628]">
                    {new Intl.NumberFormat("id-ID").format(category.totalTickets)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] p-6">
            <h2 className="text-[15px] font-bold text-[#0a1628] mb-5 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#4a6b9a]" />
              Informasi Lengkap
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-[#e0e8f0]/50">
                <span className="text-xs font-semibold text-[#7e91b2]">Nama Kategori</span>
                <span className="text-sm font-bold text-[#0a1628]">{category.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e8f0]/50">
                <span className="text-xs font-semibold text-[#7e91b2]">Kode Unik</span>
                <span className="text-sm font-mono font-bold text-[#4a6b9a] bg-[#f0f5fc] px-2 py-1 rounded">{category.code}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e8f0]/50">
                <span className="text-xs font-semibold text-[#7e91b2]">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  {category.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#e0e8f0]/50">
                <span className="text-xs font-semibold text-[#7e91b2]">Dibuat Pada</span>
                <span className="text-sm font-semibold text-[#0a1628]">{category.createdAt}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-semibold text-[#7e91b2]">Terakhir Diperbarui</span>
                <span className="text-sm font-semibold text-[#0a1628] flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-[#7e91b2]" />
                  {category.updatedAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-[#0a1628] mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-[#4a6b9a]" />
              Distribusi Penjualan
            </h3>
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e0e8f0"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-[#e0e8f0]"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - category.percentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8ab4f8" />
                      <stop offset="100%" stopColor="#4a6b9a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#0a1628]">{category.percentage}%</span>
                  <span className="text-[10px] font-semibold text-[#7e91b2] uppercase">Terjual</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#7e91b2]">Total Kapasitas</span>
                <span className="font-bold text-[#0a1628]">{new Intl.NumberFormat("id-ID").format(category.totalTickets + 5000)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#7e91b2]">Tiket Terjual</span>
                <span className="font-bold text-[#0a1628]">{new Intl.NumberFormat("id-ID").format(category.totalTickets)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#7e91b2]">Sisa Tiket</span>
                <span className="font-bold text-[#0a1628]">{new Intl.NumberFormat("id-ID").format(5000)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
                <InformationCircleIcon className="w-6 h-6 text-[#8ab4f8]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Catatan</h3>
              <p className="text-[11px] text-[#8aa0c0] leading-relaxed">
                Kategori ini digunakan secara otomatis ketika Anda membuat event baru dan memilih tipe tiket yang sesuai. Anda tidak dapat menghapus kategori yang masih terhubung dengan event aktif.
              </p>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.6s ease both; }
        .delay-75 { animation-delay: 0.75s; }
        .fade-in { opacity: 1; }
      `}</style>
    </div>
  );
}
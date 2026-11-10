'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TicketIcon,
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';

const mockEventsData = [
  { id: '1', name: 'Coldplay - Music of The Spheres', category: 'Konser', date: '2025-11-15', location: 'Gelora Bung Karno, Jakarta', price: 2500000, capacity: 5000, sold: 4860, status: 'Aktif' },
  { id: '2', name: 'Blackpink - Born Pink', category: 'Konser', date: '2025-12-20', location: 'Stadion Utama GBK, Jakarta', price: 1800000, capacity: 4500, sold: 3945, status: 'Aktif' },
  { id: '3', name: 'NCT Dream - The Dream Show 3', category: 'Konser', date: '2026-01-10', location: 'ICE BSD, Tangerang', price: 2200000, capacity: 3000, sold: 2756, status: 'Draf' },
];

export default function DetailEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundEvent = mockEventsData.find((e) => String(e.id) === String(id)) || mockEventsData[0];
      setEvent(foundEvent);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#e0e8f0] border-t-[#8ab4f8] rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#7e91b2]">Memuat detail event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <InformationCircleIcon className="w-12 h-12 text-[#d0d8e4]" />
        <p className="text-lg font-bold text-[#0a1628]">Event Tidak Ditemukan</p>
        <button onClick={() => router.push('/superadmin/events')} className="text-sm font-semibold text-[#5a7aad] hover:underline">
          Kembali ke Daftar Event
        </button>
      </div>
    );
  }

  const soldPercentage = Math.round((event.sold / event.capacity) * 100);
  const remainingTickets = event.capacity - event.sold;
  const totalRevenue = event.sold * event.price;

  const getStatusBadge = (status) => {
    const classes = {
      Aktif: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      Selesai: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      Draf: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      Batal: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-full ${
      classes[status] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }`;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link 
              href="/superadmin/events" 
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Daftar Event
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white">
                {event.name}
              </h1>
              <span className={getStatusBadge(event.status)}>{event.status}</span>
            </div>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl flex items-center gap-4">
              <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {event.date}</span>
              <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {event.location}</span>
            </p>
          </div>
          <button
            onClick={() => router.push(`/superadmin/events/edit/${event.id}`)}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-sm font-bold px-5 py-3 rounded-xl transition-all duration-300 self-start sm:self-auto"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Edit Event
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] p-6">
            <h2 className="text-[15px] font-bold text-[#0a1628] mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#8ab4f8]" />
              Informasi Event
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e0e8f0]">
                <p className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1">Kategori</p>
                <p className="text-sm font-bold text-[#0a1628]">{event.category}</p>
              </div>
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e0e8f0]">
                <p className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1">Harga Dasar</p>
                <p className="text-sm font-bold text-[#4a6b9a]">
                  Rp {Number(event.price).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="sm:col-span-2 bg-[#f8fafc] p-4 rounded-xl border border-[#e0e8f0]">
                <p className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1">Lokasi Lengkap</p>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-[#5a7aad]" />
                  <p className="text-sm font-semibold text-[#0a1628]">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-[#0a1628] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#4a6b9a]" />
                Status Penjualan Tiket
              </h2>
              <span className="text-xs font-bold text-[#0a1628] bg-[#f0f5fc] px-3 py-1 rounded-lg border border-[#d0d8e4]">
                {soldPercentage}% Terjual
              </span>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-[#7e91b2] mb-2">
                <span>{Number(event.sold).toLocaleString('id-ID')} Terjual</span>
                <span>{Number(event.capacity).toLocaleString('id-ID')} Kapasitas</span>
              </div>
              <div className="w-full h-4 bg-[#e0e8f0] rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#8ab4f8] to-[#4a6b9a] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e0e8f0]">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <TicketIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#7e91b2] font-semibold uppercase">Tiket Terjual</p>
                  <p className="text-sm font-bold text-[#0a1628]">{Number(event.sold).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e0e8f0]">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <UserGroupIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#7e91b2] font-semibold uppercase">Sisa Tiket</p>
                  <p className="text-sm font-bold text-[#0a1628]">{Number(remainingTickets).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
                <ArrowTrendingUpIcon className="w-6 h-6 text-[#8ab4f8]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Estimasi Pendapatan</h3>
              <p className="text-[10px] text-[#8aa0c0] mb-4">Berdasarkan tiket terjual</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                Rp {Number(totalRevenue).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-[#0a1628] mb-4 flex items-center gap-2">
              <ChartPieIcon className="w-4 h-4 text-[#4a6b9a]" />
              Rincian Kategori
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7e91b2] font-medium">VIP</span>
                <span className="font-bold text-[#0a1628]">1,500 <span className="text-[10px] font-normal text-[#7e91b2]">(30%)</span></span>
              </div>
              <div className="w-full h-1.5 bg-[#e0e8f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#8ab4f8] w-[30%] rounded-full" />
              </div>
              
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-[#7e91b2] font-medium">Festival</span>
                <span className="font-bold text-[#0a1628]">2,000 <span className="text-[10px] font-normal text-[#7e91b2]">(40%)</span></span>
              </div>
              <div className="w-full h-1.5 bg-[#e0e8f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#4a6b9a] w-[40%] rounded-full" />
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-[#7e91b2] font-medium">Tribun</span>
                <span className="font-bold text-[#0a1628]">1,360 <span className="text-[10px] font-normal text-[#7e91b2]">(30%)</span></span>
              </div>
              <div className="w-full h-1.5 bg-[#e0e8f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#b0c8e0] w-[30%] rounded-full" />
              </div>
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
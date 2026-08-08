// app/(user)/dashboard/tickets/page.js
'use client';

import { useState } from 'react';
import {
  Ticket,
  Calendar,
  Clock10,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  User,
  CalendarDays,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Format Rupiah
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Data dummy tiket
const myTickets = [
  {
    id: 1,
    event_name: 'Konser Musik Jakarta 2026',
    date: '2026-08-15',
    time: '19:00',
    venue: 'Stadion Utama GBK',
    category: 'Musik',
    image: 'https://picsum.photos/seed/concert/800/400',
    price: 250000,
    quantity: 2,
    status: 'active',
    booking_code: 'TKT-2026-001',
    seat: 'A12, A13',
    purchase_date: '2026-01-15',
    organizer: 'Event Organizer Indonesia',
    barcode: 'https://barcode.tec-it.com/barcode.ashx?data=TKT-2026-001&code=Code128&dpi=96',
  },
  {
    id: 2,
    event_name: 'Seminar Teknologi AI',
    date: '2026-09-20',
    time: '09:00',
    venue: 'Convention Hall',
    category: 'Teknologi',
    image: 'https://picsum.photos/seed/ai/800/400',
    price: 150000,
    quantity: 1,
    status: 'active',
    booking_code: 'TKT-2026-002',
    seat: 'B05',
    purchase_date: '2026-02-10',
    organizer: 'Tech Academy',
    barcode: 'https://barcode.tec-it.com/barcode.ashx?data=TKT-2026-002&code=Code128&dpi=96',
  },
  {
    id: 3,
    event_name: 'Pertandingan Sepak Bola',
    date: '2026-10-05',
    time: '15:30',
    venue: 'Stadion Utama',
    category: 'Olahraga',
    image: 'https://picsum.photos/seed/football/800/400',
    price: 300000,
    quantity: 4,
    status: 'used',
    booking_code: 'TKT-2026-003',
    seat: 'C01-C04',
    purchase_date: '2026-01-20',
    organizer: 'PSSI',
    barcode: 'https://barcode.tec-it.com/barcode.ashx?data=TKT-2026-003&code=Code128&dpi=96',
  },
  {
    id: 4,
    event_name: 'Festival Kuliner Nusantara',
    date: '2026-11-12',
    time: '10:00',
    venue: 'Gelora Bung Karno',
    category: 'Kuliner',
    image: 'https://picsum.photos/seed/food/800/400',
    price: 100000,
    quantity: 3,
    status: 'expired',
    booking_code: 'TKT-2026-004',
    seat: 'D05-D07',
    purchase_date: '2025-12-01',
    organizer: 'Kuliner Nusantara',
    barcode: 'https://barcode.tec-it.com/barcode.ashx?data=TKT-2026-004&code=Code128&dpi=96',
  },
  {
    id: 5,
    event_name: 'Konser Rock 2026',
    date: '2026-07-10',
    time: '20:00',
    venue: 'Stadion Gelora Bung Karno',
    category: 'Musik',
    image: 'https://picsum.photos/seed/rock/800/400',
    price: 350000,
    quantity: 2,
    status: 'cancelled',
    booking_code: 'TKT-2026-005',
    seat: 'E10, E11',
    purchase_date: '2026-01-05',
    organizer: 'Rock Production',
    barcode: 'https://barcode.tec-it.com/barcode.ashx?data=TKT-2026-005&code=Code128&dpi=96',
  },
];

// Status badge (tetap menggunakan warna yang sesuai, hanya diubah sedikit untuk konsistensi)
const StatusBadge = ({ status }) => {
  const statusMap = {
    active: { label: 'Aktif', color: 'bg-emerald-500', icon: CheckCircle2 },
    used: { label: 'Digunakan', color: 'bg-blue-500', icon: Clock },
    expired: { label: 'Kadaluarsa', color: 'bg-rose-500', icon: XCircle },
    cancelled: { label: 'Dibatalkan', color: 'bg-gray-500', icon: XCircle },
  };
  const { label, color, icon: Icon } = statusMap[status] || statusMap.expired;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

// ===== TIKET LANDSCAPE - TEMA BIRU =====
const TicketCard = ({ ticket }) => {
  return (
    <div className="group relative w-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative bg-white border-2 border-blue-200/60 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
        
        {/* Gambar */}
        <div className="relative sm:w-[45%] lg:w-[40%] h-56 sm:h-auto min-h-[280px] flex-shrink-0 overflow-hidden">
          <img
            src={ticket.image}
            alt={ticket.event_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent sm:to-transparent" />
          
          {/* Badge kategori & status */}
          <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
              {ticket.category}
            </span>
            <StatusBadge status={ticket.status} />
          </div>

          {/* Info event di overlay bawah (mobile) */}
          <div className="absolute bottom-4 left-4 right-4 sm:hidden">
            <h3 className="text-lg font-bold text-white drop-shadow-lg line-clamp-1">
              {ticket.event_name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-white/90 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(ticket.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock10 className="h-3.5 w-3.5" />
                {ticket.time} WIB
              </span>
            </div>
          </div>

          {/* Efek potongan tiket di sisi kanan gambar */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-10 bg-white rounded-l-full border-2 border-r-0 border-blue-200 shadow-inner hidden sm:block" />
        </div>

        {/* Garis putus-putus vertikal */}
        <div className="hidden sm:flex relative items-center justify-center w-8 flex-shrink-0 bg-white">
          <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-blue-200" />
          <div className="absolute left-1/2 -translate-x-1/2 top-4 w-5 h-5 bg-white rounded-full border-2 border-blue-200" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-5 h-5 bg-white rounded-full border-2 border-blue-200" />
          <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -rotate-90 bg-white px-2 text-[8px] font-medium text-blue-400 uppercase tracking-wider whitespace-nowrap">
            ✂ potong
          </span>
        </div>

        {/* Detail tiket */}
        <div className="flex-1 p-5 sm:p-6 bg-white flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="hidden sm:block text-xl font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-1">
              {ticket.event_name}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 sm:mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span>{new Date(ticket.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Clock10 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span>{ticket.time} WIB</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="line-clamp-1">{ticket.venue}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Ticket className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span>{ticket.quantity} tiket</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{ticket.organizer}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="text-xs font-mono bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                    {ticket.booking_code}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Harga + Barcode + Tombol */}
          <div className="mt-4 pt-4 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400">Harga</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatRupiah(ticket.price)}
                </p>
              </div>
              <div className="w-24 sm:w-28">
                <img
                  src={ticket.barcode}
                  alt="Barcode"
                  className="w-full h-auto"
                />
                <p className="text-[6px] text-blue-400 text-center tracking-widest truncate">
                  {ticket.booking_code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition">
                <Download className="h-4 w-4" />
              </button>
              <button className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105">
                Detail
              </button>
            </div>
          </div>
        </div>

        {/* Efek sudut tiket */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-12 bg-gray-100 rounded-r-full border-2 border-r-0 border-blue-200 hidden sm:block" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-12 bg-gray-100 rounded-l-full border-2 border-l-0 border-blue-200 hidden sm:block" />
      </div>
    </div>
  );
};

// ===== MAIN PAGE =====
export default function TicketsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTickets = myTickets.filter((ticket) => {
    if (filter !== 'all' && ticket.status !== filter) return false;
    if (search && !ticket.event_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=11',
  };

  return (
    <DashboardLayout user={user}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🎫 Tiket Saya
          </h2>
          <p className="text-gray-500 mt-1">Kelola semua tiket konser Anda dalam satu tempat.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200/50">
          <Ticket className="h-4 w-4" />
          <span>{myTickets.length} tiket</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tiket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'active', label: 'Aktif' },
            { value: 'used', label: 'Digunakan' },
            { value: 'expired', label: 'Kadaluarsa' },
            { value: 'cancelled', label: 'Dibatalkan' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                filter === item.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Tiket */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-white/50 rounded-2xl border border-gray-200/50">
          <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">Tidak ada tiket</h3>
          <p className="text-gray-400 mt-1">Tidak ditemukan tiket yang sesuai dengan filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
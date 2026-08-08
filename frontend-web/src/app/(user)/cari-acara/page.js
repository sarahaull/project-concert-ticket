// app/(user)/search/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  MapPin,
  Bell,
  Heart,
  Star,
  ArrowRight,
  SlidersHorizontal,
  X,
  Menu,
  Clock,
  User,
  Ticket,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

// ===== FORMAT RUPIAH =====
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// ===== DATA DUMMY ACARA =====
const events = [
  {
    id: 1,
    name: 'Coldplay Music of the Spheres World Tour',
    venue: 'Gelora Bung Karno Stadium, Jakarta',
    date: '2025-06-15',
    time: '19:00 WIB',
    price: 900000,
    image: 'https://picsum.photos/seed/coldplay/400/300',
    category: 'Konser',
    rating: 4.8,
    label: 'COLDPLAY',
    subLabel: 'MUSIC OF SPHERES',
    month: 'NOVEMBER 2025',
    type: 'LIVE IN CONCERT',
    organizer: 'Live Nation',
    seat: 'VIP A1',
    barcode: '#TKT-001',
  },
  {
    id: 2,
    name: 'Sheila On 7 Live in Concert',
    venue: 'Jatim Expo, Surabaya',
    date: '2025-07-20',
    time: '19:00 WIB',
    price: 350000,
    image: 'https://picsum.photos/seed/sheila/400/300',
    category: 'Konser',
    rating: 4.7,
    label: 'SHEILA ON 7',
    subLabel: '',
    month: 'JULY 2025',
    type: 'LIVE IN CONCERT',
    organizer: 'Show Promoter',
    seat: 'Festival',
    barcode: '#TKT-002',
  },
  {
    id: 3,
    name: 'YOASOBI Live in Jakarta',
    venue: 'ICE BSD, Tangerang',
    date: '2025-09-05',
    time: '19:00 WIB',
    price: 1100000,
    image: 'https://picsum.photos/seed/yoasobi/400/300',
    category: 'Konser',
    rating: 4.9,
    label: 'YOASOBI',
    subLabel: '',
    month: 'SEPTEMBER 2025',
    type: 'LIVE IN JAKARTA',
    organizer: 'Sony Music',
    seat: 'VIP B2',
    barcode: '#TKT-003',
  },
  {
    id: 4,
    name: 'Bruno Mars Live in Jakarta',
    venue: 'Indonesia Arena, Jakarta',
    date: '2025-09-13',
    time: '20:00 WIB',
    price: 1500000,
    image: 'https://picsum.photos/seed/bruno/400/300',
    category: 'Konser',
    rating: 4.9,
    label: 'BRUNO MARS',
    subLabel: 'LIVE IN JAKARTA',
    month: 'SEPTEMBER 2025',
    type: 'LIVE IN CONCERT',
    organizer: 'Live Nation',
    seat: 'VIP C3',
    barcode: '#TKT-004',
  },
  {
    id: 5,
    name: 'We The Fest 2025',
    venue: 'GBK Sports Complex, Jakarta',
    date: '2025-07-19',
    time: 'Various',
    price: 750000,
    image: 'https://picsum.photos/seed/wtf/400/300',
    category: 'Festival',
    rating: 4.6,
    label: 'We The Fest',
    subLabel: '2025',
    month: 'JULY 2025',
    type: 'FESTIVAL',
    organizer: 'Ismaya Live',
    seat: 'Festival',
    barcode: '#TKT-005',
  },
  {
    id: 6,
    name: 'JIWA Festival 2025',
    venue: 'Bali International Expo',
    date: '2025-10-11',
    time: 'Various',
    price: 650000,
    image: 'https://picsum.photos/seed/jiwa/400/300',
    category: 'Festival',
    rating: 4.5,
    label: 'JIWA FEST',
    subLabel: '2025',
    month: 'OCTOBER 2025',
    type: 'FESTIVAL',
    organizer: 'Ismaya Live',
    seat: 'Festival',
    barcode: '#TKT-006',
  },
  {
    id: 7,
    name: 'Djakarta Warehouse Project 2025',
    venue: 'Jiexpo Kemayoran, Jakarta',
    date: '2025-12-12',
    time: 'Various',
    price: 1250000,
    image: 'https://picsum.photos/seed/dwp/400/300',
    category: 'Festival',
    rating: 4.7,
    label: 'DWP 2025',
    subLabel: '',
    month: 'DECEMBER 2025',
    type: 'FESTIVAL',
    organizer: 'Ismaya Live',
    seat: 'VIP',
    barcode: '#TKT-007',
  },
  {
    id: 8,
    name: 'NIKI Buzz World Tour',
    venue: 'Tennis Indoor Senayan, Jakarta',
    date: '2025-10-10',
    time: '19:00 WIB',
    price: 750000,
    image: 'https://picsum.photos/seed/niki/400/300',
    category: 'Konser',
    rating: 4.8,
    label: 'NIKI',
    subLabel: 'BUZZ WORLD TOUR',
    month: 'OCTOBER 2025',
    type: 'LIVE IN CONCERT',
    organizer: '88rising',
    seat: 'VIP D4',
    barcode: '#TKT-008',
  },
];

// ===== OPSI FILTER =====
const categories = ['Semua Kategori', 'Konser', 'Festival', 'Musik', 'Kuliner'];
const locations = ['Semua Lokasi', 'Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Tangerang'];

// ============================================================
//  KOMPONEN TIKET CARD – DESAIN BARU (VERTIKAL / POSTER)
// ============================================================
const EventTicketCard = ({ event }) => {
  const getBarHeight = (index) => 8 + ((index * 7) % 20);

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="relative bg-white rounded-2xl shadow-md hover:shadow-2xl hover:shadow-sapphire/20 transition-all duration-400 hover:-translate-y-1 overflow-hidden border border-warm-taupe/30">

        {/* Gambar (full width di atas) */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Overlay gradasi */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
          
          {/* Badge kategori & rating */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-navy/80 backdrop-blur-sm text-[10px] font-semibold text-ivory border border-warm-taupe/30">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400/90 text-white text-[10px] font-semibold flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-white" />
              {event.rating}
            </span>
          </div>
          
          {/* Tombol Wishlist */}
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition shadow-md">
            <Heart className="h-5 w-5 text-gray-400 hover:text-rose-500 transition" />
          </button>

          {/* Badge Organizer di bawah gambar */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/90 border border-white/10">
            {event.organizer}
          </div>

          {/* Badge "Mulai dari" di kanan bawah */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-navy text-xs font-bold shadow-md">
            {formatRupiah(event.price)}
          </div>
        </div>

        {/* Detail Info (bagian bawah) */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-navy text-base group-hover:text-sapphire transition leading-tight">
                {event.label}
              </h3>
              {event.subLabel && (
                <p className="text-sm text-gray-600 font-medium -mt-0.5">{event.subLabel}</p>
              )}
              <p className="text-[11px] text-sapphire/60 font-medium">{event.type}</p>
            </div>
            <span className="text-xs text-sapphire font-semibold bg-champagne/50 px-3 py-1 rounded-full border border-warm-taupe/30 whitespace-nowrap">
              {event.month}
            </span>
          </div>

          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sapphire flex-shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sapphire" />
              <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {event.time}</span>
            </div>
          </div>

          {/* Elemen Tiket di bagian bawah (strip + barcode) */}
          <div className="mt-3 pt-3 border-t-2 border-dashed border-warm-taupe/40 relative">
            {/* Potongan tiket (kiri & kanan) */}
            <div className="absolute -top-2 -left-3 w-4 h-4 bg-ivory rounded-full border-2 border-warm-taupe/30" />
            <div className="absolute -top-2 -right-3 w-4 h-4 bg-ivory rounded-full border-2 border-warm-taupe/30" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-warm-taupe">{event.barcode}</span>
                <div className="flex items-end h-5 gap-[1px]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-navy/50"
                      style={{ width: '1.5px', height: `${getBarHeight(i) * 0.5 + 4}px` }}
                    />
                  ))}
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-navy to-sapphire text-ivory text-xs font-bold hover:shadow-lg transition-all hover:scale-105">
                Lihat Detail
              </button>
            </div>

            {/* Strip gradien di bawah */}
            <div className="absolute -bottom-4 left-0 right-0 h-1.5 bg-gradient-to-r from-navy via-sapphire to-champagne rounded-b-full" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================================
//  MAIN SEARCH PAGE
// ============================================================
export default function SearchPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [date, setDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const FilterPanel = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-warm-taupe/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy text-lg flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-sapphire" />
          Filter Pencarian
        </h3>
        <button
          onClick={() => setShowMobileFilter(false)}
          className="md:hidden p-2 hover:bg-champagne/50 rounded-full transition"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-warm-taupe uppercase tracking-wider mb-2">
          Tanggal
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-warm-taupe/30 focus:ring-2 focus:ring-sapphire/40 focus:border-transparent text-navy bg-ivory/50"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-warm-taupe uppercase tracking-wider mb-2">
          Lokasi
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-warm-taupe/30 focus:ring-2 focus:ring-sapphire/40 focus:border-transparent text-navy bg-ivory/50"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-warm-taupe uppercase tracking-wider mb-2">
          Kategori
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-warm-taupe/30 focus:ring-2 focus:ring-sapphire/40 focus:border-transparent text-navy bg-ivory/50"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-warm-taupe uppercase tracking-wider mb-2">
          Rentang Harga
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-navy">
            <span>{formatRupiah(priceRange[0])}</span>
            <span>{formatRupiah(priceRange[1])}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5000000}
            step={100000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-sapphire h-2 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <button className="w-full py-3 bg-gradient-to-r from-navy to-sapphire text-ivory rounded-xl font-medium hover:shadow-lg transition-all">
          Terapkan Filter
        </button>
        <button
          onClick={() => {
            setSelectedCategory('Semua Kategori');
            setSelectedLocation('Semua Lokasi');
            setDate('');
            setPriceRange([0, 5000000]);
          }}
          className="w-full py-3 bg-white border border-warm-taupe/30 text-navy rounded-xl font-medium hover:bg-champagne/50 transition-all"
        >
          Reset Filter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory/50 flex">
      <Sidebar open={mobileMenuOpen} setOpen={setMobileMenuOpen} />

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-warm-taupe/20 px-6 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-champagne/50 text-navy transition"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-sm font-medium text-navy">Cari Acara</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-champagne/50 text-sapphire transition">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
              <Search className="h-8 w-8 text-sapphire" />
              Cari Acara
            </h1>
            <p className="text-sapphire/70 mt-1">
              Temukan konser, festival, dan live event favoritmu.
            </p>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Cari acara, artis, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-warm-taupe/30 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sapphire/40 focus:border-transparent text-navy placeholder-gray-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-taupe" />
            <button
              onClick={() => setShowMobileFilter(true)}
              className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-navy text-ivory rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-sapphire/70">
                  Menampilkan <span className="font-semibold text-navy">{events.length}</span> dari 126 acara
                </p>
                <Link href="#" className="text-sm text-sapphire hover:text-navy flex items-center gap-1">
                  Lihat semua <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Grid tiket 2 kolom (desain baru) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {events.map((event) => (
                  <EventTicketCard key={event.id} event={event} />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-8">
                {[1, 2, 3, 4, 5, '...', 11].map((page, idx) => (
                  <button
                    key={idx}
                    className={`w-10 h-10 rounded-full font-medium transition ${
                      page === 1
                        ? 'bg-navy text-ivory'
                        : 'bg-white text-navy hover:bg-champagne/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <div className="mt-10 bg-gradient-to-r from-champagne/80 to-ivory rounded-2xl p-6 border border-warm-taupe/30 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-navy/10 text-navy">
                      <Bell className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy text-lg">Jangan Lewatkan Event Seni!</h4>
                      <p className="text-sm text-sapphire/70">
                        Aktifkan notifikasi untuk dapat update event terbaru dan promo menarik.
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-navy to-sapphire text-ivory rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap">
                    Aktifkan Notifikasi
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:block md:col-span-1">
              <div className="sticky top-24">
                <FilterPanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMobileFilter && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-ivory shadow-2xl z-50 overflow-y-auto p-4 md:hidden animate-slide-right">
            <FilterPanel />
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slide-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
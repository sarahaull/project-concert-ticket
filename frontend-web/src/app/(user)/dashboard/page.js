// app/(user)/dashboard/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Ticket,
    CalendarCheck,
    CalendarX,
    DollarSign,
    Calendar,
    MapPin,
    Clock,
    Mail,
    Phone,
    MapPin as MapPinIcon,
    History,
    Star,
    ChevronRight,
    User,
    Sparkles,
    TrendingUp,
    Music,
    Coffee,
    Mic,
    Utensils,
    Barcode,
    ArrowRight,
    Disc3,
    Gift,
    Percent,
    Flame,
    Zap,
    Crown,
    Bell,
    Heart,
    CreditCard,
    ChevronLeft,
} from 'lucide-react';

// ===== FORMAT RUPIAH =====
const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// ===== DATA DUMMY =====
const totalTickets = 12;
const activeTickets = 5;
const expiredTickets = 3;
const totalSpent = 1250000;

const upcomingEvents = [
    {
        id: 1,
        name: 'Coldplay Music of the Spheres World Tour',
        date: '2025-06-15',
        time: '19:00',
        venue: 'Stadion Utama GBK, Jakarta',
        status: 'Aktif',
        image: 'https://picsum.photos/seed/coldplay/600/400',
        category: 'Musik',
        price: 250000,
        organizer: 'Event Organizer',
        seat: 'A12',
        barcode: '#TKT-001',
        daysLeft: 2,
    },
    {
        id: 2,
        name: 'Sheila On 7 Live in Concert',
        date: '2025-07-20',
        time: '20:00',
        venue: 'Tennis Indoor Senayan, Jakarta',
        status: 'Aktif',
        image: 'https://picsum.photos/seed/sheila/600/400',
        category: 'Musik',
        price: 180000,
        organizer: 'Show Promoter',
        seat: 'B05',
        barcode: '#TKT-002',
        daysLeft: 5,
    },
    {
        id: 3,
        name: 'YAGASDI Live in Jakarta',
        date: '2025-08-10',
        time: '18:30',
        venue: 'ICE BSD, Tangerang',
        status: 'Aktif',
        image: 'https://picsum.photos/seed/yagasdi/600/400',
        category: 'Musik',
        price: 220000,
        organizer: 'Indo Promo',
        seat: 'C01',
        barcode: '#TKT-003',
        daysLeft: 12,
    },
    {
        id: 4,
        name: 'Festival Kuliner Nusantara',
        date: '2025-11-12',
        time: '10:00',
        venue: 'Gelora Bung Karno, Jakarta',
        status: 'Aktif',
        image: 'https://picsum.photos/seed/food/600/400',
        category: 'Kuliner',
        price: 100000,
        organizer: 'Kuliner Nusantara',
        seat: 'D05',
        barcode: '#TKT-004',
        daysLeft: 30,
    },
];

// ===== DATA REKOMENDASI — dengan gambar lebih mencolok =====
const recommendedEvents = [
    {
        id: 101,
        name: '🎸 Jazz Festival 2025',
        date: '2025-12-10',
        time: '18:00',
        venue: 'Taman Ismail Marzuki',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
        category: 'Musik',
        price: 180000,
        rating: 4.8,
        attendees: '2.4k',
        gradient: 'from-amber-500/90 via-orange-500/80 to-rose-500/70',
        bgColor: 'bg-gradient-to-br from-amber-400 to-rose-500',
    },
    {
        id: 102,
        name: '⚡ EDM Night Jakarta',
        date: '2025-12-25',
        time: '20:00',
        venue: 'Beach Club Ancol',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
        category: 'Musik',
        price: 320000,
        rating: 4.9,
        attendees: '3.1k',
        gradient: 'from-cyan-500/90 via-blue-500/80 to-purple-600/70',
        bgColor: 'bg-gradient-to-br from-cyan-400 to-purple-600',
    },
    {
        id: 103,
        name: '🎻 Orchestra Symphony',
        date: '2026-01-05',
        time: '19:30',
        venue: 'Aula Simfonia Jakarta',
        image: 'https://images.unsplash.com/photo-1507838153414-b4b793384a0e?w=600&q=80',
        category: 'Musik',
        price: 275000,
        rating: 4.7,
        attendees: '1.8k',
        gradient: 'from-emerald-500/90 via-teal-500/80 to-cyan-600/70',
        bgColor: 'bg-gradient-to-br from-emerald-400 to-cyan-600',
    },
    {
        id: 104,
        name: '🇰🇷 K-Pop Fan Meeting',
        date: '2026-01-20',
        time: '16:00',
        venue: 'ICE BSD',
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80',
        category: 'Musik',
        price: 450000,
        rating: 4.9,
        attendees: '5.2k',
        gradient: 'from-pink-500/90 via-rose-500/80 to-fuchsia-600/70',
        bgColor: 'bg-gradient-to-br from-pink-400 to-fuchsia-600',
    },
    {
        id: 105,
        name: '🍔 Food & Music Fest',
        date: '2026-02-14',
        time: '11:00',
        venue: 'SCBD, Jakarta',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
        category: 'Kuliner',
        price: 150000,
        rating: 4.6,
        attendees: '3.8k',
        gradient: 'from-yellow-500/90 via-amber-500/80 to-orange-600/70',
        bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-600',
    },
    {
        id: 106,
        name: '🎤 Acoustic Night',
        date: '2026-03-01',
        time: '19:00',
        venue: 'The Pallas, Bandung',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
        category: 'Musik',
        price: 95000,
        rating: 4.5,
        attendees: '1.2k',
        gradient: 'from-indigo-500/90 via-purple-500/80 to-violet-600/70',
        bgColor: 'bg-gradient-to-br from-indigo-400 to-violet-600',
    },
];

// ===== DATA PROMO =====
const promos = [
    {
        id: 1,
        title: 'Diskon 20% Tiket Konser',
        description: 'Gunakan kode CONCERT20 untuk semua tiket konser',
        code: 'CONCERT20',
        discount: '20%',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
        valid_until: '2025-09-30',
    },
    {
        id: 2,
        title: 'Beli 2 Gratis 1',
        description: 'Untuk pembelian tiket konser musik tertentu',
        code: 'BUY2GET1',
        discount: 'B2G1',
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80',
        valid_until: '2025-10-15',
    },
    {
        id: 3,
        title: 'Flash Sale 50%',
        description: 'Diskon 50% untuk 100 tiket pertama',
        code: 'FLASH50',
        discount: '50%',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80',
        valid_until: '2025-08-20',
    },
];

// ===== DATA NOTIFIKASI =====
const notifications = [
    {
        id: 1,
        title: 'Tiket Coldplay akan segera dimulai!',
        description: 'Jangan lupa siapkan e-ticket Anda.',
        time: '2 jam yang lalu',
        type: 'info',
    },
    {
        id: 2,
        title: 'Pembayaran Berhasil!',
        description: 'Pembayaran tiket Sheila On 7 telah berhasil.',
        time: '1 hari yang lalu',
        type: 'success',
    },
    {
        id: 3,
        title: 'Acara baru untukmu!',
        description: 'YAGASDI Live in Jakarta telah ditambahkan.',
        time: '2 hari yang lalu',
        type: 'event',
    },
];

// ===== DATA RECENT BOOKINGS =====
const recentBookings = [
    {
        id: 1,
        event_name: 'Coldplay Music of the Spheres World Tour',
        event_date: '2025-06-15',
        quantity: 2,
        total: 500000,
        status: 'confirmed',
    },
    {
        id: 2,
        event_name: 'Sheila On 7 Live in Concert',
        event_date: '2025-07-20',
        quantity: 1,
        total: 180000,
        status: 'pending',
    },
    {
        id: 3,
        event_name: 'YAGASDI Live in Jakarta',
        event_date: '2025-08-10',
        quantity: 4,
        total: 880000,
        status: 'confirmed',
    },
    {
        id: 4,
        event_name: 'Festival Kuliner Nusantara',
        event_date: '2025-11-12',
        quantity: 3,
        total: 300000,
        status: 'pending',
    },
];

// ===== USER =====
const user = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+62 812 3456 7890',
    address: 'Jakarta, Indonesia',
    created_at: '2024-01-01',
    avatar: 'https://i.pravatar.cc/150?img=11',
};

// ============================================================
//  KOMPONEN STATS CARD
// ============================================================
const StatsCard = ({ title, value, icon, subtitle, trend }) => {
    const iconMap = {
        ticket: Ticket,
        active: CalendarCheck,
        expired: CalendarX,
        money: DollarSign,
        heart: Heart,
    };
    const Icon = iconMap[icon] || Ticket;

    const gradients = {
        ticket: 'bg-gradient-to-br from-navy to-sapphire',
        active: 'bg-gradient-to-br from-emerald-600 to-teal-400',
        expired: 'bg-gradient-to-br from-rose-500 to-pink-400',
        money: 'bg-gradient-to-br from-amber-500 to-orange-400',
        heart: 'bg-gradient-to-br from-rose-400 to-pink-500',
    };
    const grad = gradients[icon] || gradients.ticket;

    return (
        <div className={`group relative overflow-hidden rounded-2xl ${grad} p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-white/70 text-xs uppercase tracking-wider font-medium">{title}</p>
                    <p className="text-3xl font-extrabold mt-1 tracking-tight">{value}</p>
                    {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
                </div>
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 shadow-inner">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {trend && (
                <div className="relative z-10 mt-3 flex items-center gap-1 text-xs font-medium text-white/80">
                    <TrendingUp className="h-3 w-3" />
                    {trend}
                </div>
            )}
        </div>
    );
};

// ============================================================
//  TICKET CARD – BENTUK TIKET UNIK
// ============================================================
const TicketCard = ({ event }) => {
    const getBarHeight = (index) => 8 + ((index * 7) % 20);

    return (
        <Link href={`/dashboard/tickets/${event.id}`} className="block group">
            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-sapphire/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-warm-taupe/30">

                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy via-sapphire to-champagne" />

                <div className="flex flex-col md:flex-row h-full pt-2">
                    <div className="relative md:w-44 h-44 md:h-auto flex-shrink-0 overflow-hidden">
                        <img
                            src={event.image}
                            alt={event.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-navy/80 backdrop-blur-sm text-[10px] font-semibold text-ivory border border-warm-taupe/30">
                                {event.category}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-[10px] font-semibold text-white shadow-lg flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                {event.status}
                            </span>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center w-8 flex-shrink-0 bg-white">
                        <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-warm-taupe/50" />
                        <div className="absolute left-1/2 -translate-x-1/2 top-3 w-5 h-5 bg-ivory rounded-full border-2 border-warm-taupe/50" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-5 h-5 bg-ivory rounded-full border-2 border-warm-taupe/50" />
                        <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -rotate-90 bg-white px-2 text-[8px] font-bold text-warm-taupe uppercase tracking-widest whitespace-nowrap">
                            ✂ potong
                        </span>
                    </div>

                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-navy text-base group-hover:text-sapphire transition line-clamp-1">
                                {event.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-xs text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-sapphire" />
                                    <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-sapphire" />
                                    <span>{event.time} WIB</span>
                                </div>
                                <div className="flex items-center gap-1.5 col-span-2">
                                    <MapPin className="w-4 h-4 text-sapphire flex-shrink-0" />
                                    <span className="truncate">{event.venue}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-sapphire" />
                                    <span className="truncate">{event.organizer}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Ticket className="w-4 h-4 text-sapphire" />
                                    <span>Kursi {event.seat}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-rose-400" />
                                    <span className="text-rose-500 font-semibold">{event.daysLeft} Hari</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-dashed border-warm-taupe/40 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-warm-taupe">Harga</p>
                                <p className="text-lg font-extrabold bg-gradient-to-r from-navy to-sapphire bg-clip-text text-transparent">
                                    {formatRupiah(event.price)}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:block w-16">
                                    <div className="flex items-end h-8 gap-[1px]">
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="bg-navy/70"
                                                style={{ width: '2px', height: `${getBarHeight(i)}px` }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[6px] text-warm-taupe text-center tracking-wider mt-0.5">
                                        {event.barcode}
                                    </p>
                                </div>
                                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-navy to-sapphire text-ivory text-xs font-bold hover:shadow-lg hover:shadow-sapphire/30 transition-all hover:scale-105">
                                    Detail
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-ivory rounded-full border-2 border-warm-taupe/50" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-ivory rounded-full border-2 border-warm-taupe/50" />
            </div>
        </Link>
    );
};

// ============================================================
//  REKOMENDASI CARD — MENCOLOK DENGAN GAMBAR DAN GRADIENT
// ============================================================
const RecommendationCard = ({ event }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    return (
        <div className="group relative w-[300px] md:w-[340px] flex-shrink-0 snap-start bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-warm-taupe/20">
            {/* Gambar dengan overlay gradient mencolok */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient overlay warna-warni mencolok dari gambar yang diberikan */}
                <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} mix-blend-overlay`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Tombol Wishlist */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200 border border-white/30 z-10"
                    aria-label="Tambahkan ke wishlist"
                >
                    <Heart
                        className={`h-5 w-5 transition-colors duration-200 ${isWishlisted
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-gray-500 hover:text-rose-400'
                            }`}
                    />
                </button>

                {/* Badge kategori & rating */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[9px] font-bold text-white border border-white/20 uppercase tracking-wider">
                        {event.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400/90 backdrop-blur-sm text-[9px] font-bold text-white flex items-center gap-0.5 shadow-lg">
                        <Star className="h-3 w-3 fill-white" />
                        {event.rating}
                    </span>
                </div>

                {/* Badge attendees di bawah */}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-sapphire/80 backdrop-blur-sm text-[9px] font-bold text-ivory shadow-lg flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    {event.attendees} tertarik
                </div>

                {/* Efek glow di bagian bawah gambar */}
                <div className="absolute -bottom-6 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Konten card */}
            <div className="p-4">
                <h4 className="font-bold text-navy text-base group-hover:text-sapphire transition line-clamp-1">
                    {event.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1.5">
                    <Calendar className="h-3.5 w-3.5 text-sapphire flex-shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="text-warm-taupe">•</span>
                    <Clock className="h-3.5 w-3.5 text-sapphire flex-shrink-0" />
                    <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-sapphire flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-taupe/30">
                    <div>
                        <p className="text-[9px] uppercase tracking-wider text-warm-taupe">Mulai dari</p>
                        <p className="text-base font-extrabold bg-gradient-to-r from-navy to-sapphire bg-clip-text text-transparent">
                            {formatRupiah(event.price)}
                        </p>
                    </div>
                    <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-navy to-sapphire text-ivory text-xs font-bold hover:shadow-lg hover:shadow-sapphire/30 transition-all hover:scale-105 flex items-center gap-1.5">
                        Pesan
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Strip warna mencolok di bagian bawah */}
            <div className={`h-1.5 w-full ${event.bgColor}`} />
        </div>
    );
};

// ============================================================
//  PROMO CARD
// ============================================================
const PromoCard = ({ promo }) => {
    return (
        <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl hover:shadow-sapphire/15 transition-all duration-400 hover:-translate-y-1 overflow-hidden border border-warm-taupe/30">
            <div className="relative h-32 overflow-hidden">
                <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy/60 to-sapphire/30" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500/90 text-[8px] font-bold text-white flex items-center gap-1">
                    <Flame className="h-2.5 w-2.5" />
                    {promo.discount}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[8px] font-medium text-ivory border border-white/20">
                    ⏳ {promo.valid_until}
                </div>
            </div>
            <div className="p-3">
                <h4 className="font-semibold text-navy text-sm group-hover:text-sapphire transition line-clamp-1">
                    {promo.title}
                </h4>
                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{promo.description}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-warm-taupe/30">
                    <span className="text-xs font-mono bg-champagne/50 text-navy px-2 py-0.5 rounded border border-warm-taupe/30">
                        {promo.code}
                    </span>
                    <button className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-medium hover:shadow-md transition-all hover:scale-105">
                        Klaim
                    </button>
                </div>
            </div>
        </div>
    );
};


const Banner = ({ imageUrl }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&q=80';
  const bgImage = imageUrl || defaultImage;

  // Nilai deterministik untuk sparkle (berdasarkan indeks)
  const sparkles = Array.from({ length: 12 }).map((_, i) => {
    // Fungsi pseudo-random sederhana dari indeks
    const top = ((i * 37 + 13) % 100);
    const left = ((i * 73 + 7) % 100);
    const delay = ((i * 11 + 5) % 30) / 10;
    const duration = 2 + ((i * 19 + 3) % 30) / 10;
    return { top, left, delay, duration };
  });

  return (
    <div className="relative overflow-hidden rounded-2xl mb-12">
      {/* Efek glow di bawah banner */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-2xl rounded-full animate-glow-pulse" />
      
      {/* Banner utama dengan animasi swing */}
      <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl shadow-2xl will-change-transform animate-swing origin-bottom">
        
        {/* Gambar */}
        <img
          src={bgImage}
          alt="Concert Banner"
          className="absolute inset-0 w-full h-full object-cover object-center rounded-2xl"
        />
        
        {/* Overlay gradasi */}
        <div className="absolute inset-0 bg-gradient-to-tr from-navy/80 via-sapphire/60 to-champagne/20 rounded-2xl" />
        
        {/* Efek cahaya sorot */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent mix-blend-overlay rounded-2xl" />
        
        {/* Partikel cahaya (sparkle) dengan nilai deterministik */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {sparkles.map((s, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/60 rounded-full animate-sparkle will-change-transform"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl animate-float-delay" />
          <div className="absolute top-1/3 left-1/2 w-40 h-40 bg-pink-400/10 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl animate-float" />
        </div>

        {/* Konten */}
        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 backdrop-blur-sm text-amber-200 text-xs font-semibold border border-amber-400/30 animate-pulse-slow">
              🔥 Konser Terbaru
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
              🎫 Tiket Terbatas
            </span>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
            Temukan konser <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-pink-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              favoritmu
            </span> <br className="hidden sm:block" />
            sekarang!
          </h2>
          
          <p className="text-white/90 text-sm md:text-base mt-3 max-w-lg drop-shadow">
            Dapatkan tiket untuk konser terbaik dan nikmati pengalaman musik yang tak terlupakan.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-bold shadow-lg hover:shadow-amber-400/30 transition-all hover:scale-105 hover:-translate-y-0.5 flex items-center gap-2 animate-bounce-once">
              Jelajahi Sekarang <ArrowRight className="h-5 w-5" />
            </button>
            <button className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 transition-all hover:scale-105">
              Lihat Tiket
            </button>
          </div>
        </div>

        {/* Ikon musik dekoratif */}
        <div className="absolute bottom-8 right-8 text-white/20 text-6xl animate-float">🎵</div>
        <div className="absolute top-6 right-20 text-white/10 text-5xl animate-float-delay">🎶</div>
        <div className="absolute bottom-20 right-40 text-white/15 text-4xl animate-float-slow">🎸</div>
        <div className="absolute top-1/2 left-1/4 text-white/5 text-7xl animate-float-slow">🎤</div>
      </div>
    </div>
  );
};

// ============================================================
//  NOTIFICATION ITEM
// ============================================================
const NotificationItem = ({ notif }) => {
    const bgColor = {
        info: 'bg-sapphire/10 border-sapphire/20',
        success: 'bg-emerald-50 border-emerald-200',
        event: 'bg-amber-50 border-amber-200',
    }[notif.type] || 'bg-gray-50 border-gray-200';

    const iconColor = {
        info: 'text-sapphire',
        success: 'text-emerald-600',
        event: 'text-amber-600',
    }[notif.type] || 'text-gray-600';

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl border ${bgColor} transition hover:shadow-sm`}>
            <div className={`p-1.5 rounded-full bg-white/80 ${iconColor}`}>
                <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy">{notif.title}</p>
                <p className="text-xs text-gray-500">{notif.description}</p>
                <p className="text-[10px] text-warm-taupe mt-1">{notif.time}</p>
            </div>
        </div>
    );
};

// ============================================================
//  MAIN DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Scroll horizontal dengan tombol
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
        }
    };

    const bannerImage = '/images/bn2.png';

    return (
        <div className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

            {/* Banner dengan efek goyang, glow, dan sparkle */}
            <Banner imageUrl={bannerImage} />

            {/* Welcome Section */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-navy flex items-center gap-2">
                        Halo, {user.name} <span className="text-2xl animate-pulse">👋</span>
                        <span className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-champagne to-ivory text-navy text-xs font-semibold border border-warm-taupe/30 shadow-sm">
                            VIP
                        </span>
                    </h2>
                    <p className="text-sapphire/70 mt-1">Siap untuk menemukan konser impianmu selanjutnya?</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-navy bg-champagne/50 px-4 py-2 rounded-xl border border-warm-taupe/30 shadow-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>Member Premium</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-warm-taupe bg-ivory px-3 py-1.5 rounded-full border border-warm-taupe/30">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>Pro</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Tiket"
                    value={totalTickets}
                    icon="ticket"
                    subtitle="+2 bulan ini"
                    trend="↑ 8%"
                />
                <StatsCard
                    title="Akan Datang"
                    value={activeTickets}
                    icon="active"
                    subtitle="Konser mendatang"
                    trend="● Aktif"
                />
                <StatsCard
                    title="Pengeluaran"
                    value={formatRupiah(totalSpent)}
                    icon="money"
                    subtitle="Total semua pesanan"
                    trend="↑ 12%"
                />
                <StatsCard
                    title="Wishlist"
                    value={5}
                    icon="heart"
                    subtitle="Acara favorit"
                    trend="❤️ 3 baru"
                />
            </div>

            {/* ===== TIKET SAYA ===== */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-sapphire" /> Tiket Saya
                        </h3>
                        <p className="text-xs text-warm-taupe">Akan Datang • Selamat</p>
                    </div>
                    <Link href="/dashboard/tickets" className="text-sm text-sapphire hover:text-navy font-medium flex items-center gap-1 group">
                        Lihat semua
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {upcomingEvents.slice(0, 2).map((event) => (
                        <TicketCard key={event.id} event={event} />
                    ))}
                </div>
            </div>

            {/* ===== NOTIFIKASI + REKOMENDASI (HORIZONTAL SCROLL) ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-warm-taupe/30 p-5 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                <Bell className="h-5 w-5 text-sapphire" /> Notifikasi
                            </h3>
                            <Link href="/dashboard/notifications" className="text-xs text-sapphire hover:text-navy font-medium">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {notifications.map((notif) => (
                                <NotificationItem key={notif.id} notif={notif} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-warm-taupe/30 p-5 hover:shadow-xl transition-shadow duration-300 relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" /> Rekomendasi Untukmu
                                <span className="ml-2 text-[10px] font-normal bg-gradient-to-r from-amber-400 to-pink-500 text-white px-2.5 py-0.5 rounded-full animate-pulse-slow">
                                    🔥 Populer
                                </span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={scrollLeft}
                                    className="p-1.5 rounded-full bg-navy/10 hover:bg-navy/20 text-navy transition-all hover:scale-110 disabled:opacity-30"
                                    aria-label="Geser kiri"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={scrollRight}
                                    className="p-1.5 rounded-full bg-navy/10 hover:bg-navy/20 text-navy transition-all hover:scale-110 disabled:opacity-30"
                                    aria-label="Geser kanan"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <Link href="/dashboard/explore" className="text-xs text-sapphire hover:text-navy font-medium ml-1">
                                    Lihat Semua
                                </Link>
                            </div>
                        </div>

                        {/* Container scroll horizontal dengan snap */}
                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {recommendedEvents.map((event) => (
                                <RecommendationCard key={event.id} event={event} />
                            ))}
                        </div>

                        {/* Indikator scroll (garis progress) */}
                        <div className="flex justify-center gap-1 mt-2">
                            {recommendedEvents.map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-1 rounded-full bg-warm-taupe/30 transition-all duration-300"
                                    style={{
                                        width: idx === 0 ? '24px' : '8px',
                                        background: idx === 0 ? 'linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d)' : '',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== PROMO ===== */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                        <Gift className="h-5 w-5 text-rose-500" /> Dapatkan Diskon Spesial!
                        <span className="ml-2 text-xs font-normal text-warm-taupe bg-ivory px-2.5 py-0.5 rounded-full border border-warm-taupe/30">
                            Hemat hingga 50%
                        </span>
                    </h3>
                    <Link href="/dashboard/promos" className="text-sm text-sapphire hover:text-navy font-medium flex items-center gap-1 group">
                        Lihat semua
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {promos.map((promo) => (
                        <PromoCard key={promo.id} promo={promo} />
                    ))}
                </div>
            </div>

            {/* ===== RIWAYAT & PROFIL ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-warm-taupe/30 p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                <History className="h-5 w-5 text-sapphire" /> Riwayat Pemesanan
                            </h3>
                            <Link href="/dashboard/history" className="text-sm text-sapphire hover:text-navy font-medium">
                                Lihat semua
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-warm-taupe/30">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-warm-taupe uppercase tracking-wider">Event</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-warm-taupe uppercase tracking-wider">Tanggal</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-warm-taupe uppercase tracking-wider">Tiket</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-warm-taupe uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-warm-taupe uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-warm-taupe/20">
                                    {recentBookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-champagne/30 transition-colors duration-200 group"
                                        >
                                            <td className="px-4 py-3 text-sm text-navy font-medium group-hover:text-sapphire transition">
                                                {booking.event_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(booking.event_date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{booking.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-navy font-medium">{formatRupiah(booking.total)}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed'
                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                        }`}
                                                >
                                                    {booking.status === 'confirmed' ? '✅ Dikonfirmasi' : '⏳ Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-warm-taupe/30 p-6 text-center sticky top-24 hover:shadow-xl transition-shadow duration-300">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full ring-4 ring-champagne shadow-lg overflow-hidden">
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                                <span className="text-white text-xs font-bold">✓</span>
                            </div>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-navy">{user.name}</h3>
                        <p className="text-sm text-warm-taupe">Member sejak {new Date(user.created_at).getFullYear()}</p>
                        <div className="mt-4 border-t border-warm-taupe/30 pt-4 space-y-2 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-champagne/30 p-2 rounded-xl">
                                <Mail className="h-4 w-4 text-sapphire flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-champagne/30 p-2 rounded-xl">
                                <Phone className="h-4 w-4 text-sapphire flex-shrink-0" />
                                <span>{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-champagne/30 p-2 rounded-xl">
                                <MapPinIcon className="h-4 w-4 text-sapphire flex-shrink-0" />
                                <span>{user.address}</span>
                            </div>
                        </div>
                        <button className="mt-6 w-full bg-gradient-to-r from-navy to-sapphire text-ivory py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-sapphire/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            ✎ Edit Profil
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animations & Hide Scrollbar */}
            <style jsx>{`
                @keyframes slow-zoom {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-16px) rotate(8deg); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-float-delay {
                    animation: float 5s ease-in-out infinite 1s;
                }
                .animate-float-slow {
                    animation: float 6s ease-in-out infinite 2s;
                }

                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }

                @keyframes bounce-once {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-bounce-once {
                    animation: bounce-once 1.5s ease-in-out infinite;
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.97); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }

                @keyframes swing {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(1.2deg); }
                    75% { transform: rotate(-1.2deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-swing {
                    animation: swing 4s ease-in-out infinite;
                    transform-origin: bottom center;
                }

                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1) translateX(-50%); }
                    50% { opacity: 1; transform: scale(1.1) translateX(-50%); }
                }
                .animate-glow-pulse {
                    animation: glow-pulse 3s ease-in-out infinite;
                }

                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .animate-sparkle {
                    animation: sparkle var(--duration, 2.5s) ease-in-out infinite;
                }

                /* Sembunyikan scrollbar horizontal */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
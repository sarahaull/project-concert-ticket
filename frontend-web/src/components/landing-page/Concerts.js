"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Ticket,
  Heart,
  ArrowRight,
  Music,
  Users,
  ShieldCheck,
  Lock,
  LogIn,
  UserPlus,
  X,
  Volume2,
  Check,
} from "lucide-react";

// Curated Real Concert Fallback Data (Cleaned: No Emojis, No Yellow)
const staticConcerts = [
  {
    id: 1,
    title: "Coldplay: Music of the Spheres World Tour",
    artist: "Coldplay • Guest: Rahmania Astrini",
    date: "15 Des 2026",
    fullDate: "Sabtu, 15 Desember 2026",
    time: "Open 17:00 • Show 19:30 WIB",
    location: "Stadion Utama GBK, Jakarta",
    price: "Rp 800.000",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80",
    available: 120,
    rating: "4.9 / 5.0",
    category: "Pop",
    stage: "Main Stadium Stage",
    featured: true,
    tag: "SELLING FAST",
    viewers: "1.840 penonton memantau",
  },
  {
    id: 2,
    title: "BLACKPINK 'BORN PINK' Encore Jakarta",
    artist: "BLACKPINK (Jisoo, Jennie, Rosé, Lisa)",
    date: "22 Des 2026",
    fullDate: "Minggu, 22 Desember 2026",
    time: "Open 16:30 • Show 19:00 WIB",
    location: "Gelora Bung Karno, Jakarta",
    price: "Rp 1.350.000",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
    available: 85,
    rating: "5.0 / 5.0",
    category: "K-Pop",
    stage: "VIP Soundcheck Zone",
    featured: true,
    tag: "STADIUM TOUR",
    viewers: "2.310 penonton memantau",
  },
  {
    id: 3,
    title: "Sheila On 7: Tunggu Aku Di Kotamu",
    artist: "Sheila On 7",
    date: "05 Jan 2027",
    fullDate: "Jumat, 05 Januari 2027",
    time: "Open 17:00 • Show 20:00 WIB",
    location: "Stadion Kridosono, Yogyakarta",
    price: "Rp 375.000",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80",
    available: 340,
    rating: "4.9 / 5.0",
    category: "Rock",
    stage: "Outdoor Festival Stage",
    featured: true,
    tag: "TOUR KHUSUS",
    viewers: "1.120 penonton memantau",
  },
  {
    id: 4,
    title: "Java Jazz Festival 2027: Special Edition",
    artist: "Tulus, Laufey, Maliq & D'Essentials",
    date: "12 Jan 2027",
    fullDate: "Sabtu, 12 Januari 2027",
    time: "Open 15:00 • Show 16:30 WIB",
    location: "JIEXPO Kemayoran, Jakarta",
    price: "Rp 650.000",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80",
    available: 520,
    rating: "4.8 / 5.0",
    category: "Jazz",
    stage: "Hall D2 & B3 Indoor",
    featured: false,
    tag: "FESTIVAL RESMI",
    viewers: "890 penonton memantau",
  },
  {
    id: 5,
    title: "Djakarta Warehouse Project (DWP) 2026",
    artist: "Martin Garrix, DJ Snake, Alan Walker",
    date: "18 Des 2026",
    fullDate: "Jumat - Minggu, 18 Des 2026",
    time: "Open 17:00 • Show Until Dawn",
    location: "GWK Cultural Park, Bali",
    price: "Rp 950.000",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    available: 410,
    rating: "4.9 / 5.0",
    category: "EDM",
    stage: "Garuda Arena Stage",
    featured: true,
    tag: "3 DAYS PASS",
    viewers: "3.400 penonton memantau",
  },
  {
    id: 6,
    title: "Bernadya: Tur Berjalan Bersama",
    artist: "Bernadya Ribka",
    date: "28 Des 2026",
    fullDate: "Sabtu, 28 Desember 2026",
    time: "Open 17:30 • Show 19:00 WIB",
    location: "Dago Tea House, Bandung",
    price: "Rp 250.000",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    available: 190,
    rating: "4.8 / 5.0",
    category: "Pop",
    stage: "Amphitheater Dago",
    featured: false,
    tag: "INTIMATE SHOW",
    viewers: "750 penonton memantau",
  },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

function getPosterUrl(poster, fallback) {
  if (!poster || typeof poster !== "string") return fallback;
  const trimmed = poster.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${API_BASE}${trimmed}`;
  return `${API_BASE}/uploads/events/${trimmed}`;
}

function formatCurrency(value) {
  if (!value || isNaN(Number(value))) return "Mulai Rp 250.000";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(dateStr) {
  if (!dateStr) return "Des 2026";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Resilient unoptimized image component for dynamic/backend uploads
function PosterImage({ src, alt, fallback }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsError(false);
  }, [src]);

  return (
    <Image
      src={isError || !imgSrc ? fallback : imgSrc}
      alt={alt || "Poster Konser"}
      fill
      unoptimized
      onError={() => {
        if (!isError) {
          setIsError(true);
          setImgSrc(fallback);
        }
      }}
      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

export default function Concerts() {
  const router = useRouter();
  const [concerts, setConcerts] = useState(staticConcerts);
  const [selectedGenre, setSelectedGenre] = useState("Semua");
  const [liked, setLiked] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState(null);

  // Login check
  const checkIsLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return Boolean(token && user);
  };

  // Fetch real events from Backend API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/api/events`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          const eventList = data.events || data.data;
          if (Array.isArray(eventList) && eventList.length > 0) {
            const mapped = eventList.map((e, idx) => ({
              id: e.id,
              title: e.event_name || e.title || "Konser Musik Spesial",
              artist: e.artist_name || e.artist || "Musisi Spesial",
              date: formatDate(e.event_date || e.date),
              fullDate: e.event_date ? formatDate(e.event_date) : "Desember 2026",
              time: e.event_time ? `Show ${e.event_time} WIB` : "19:00 WIB",
              location: e.venue_name ? `${e.venue_name}, ${e.city || "Indonesia"}` : (e.location || "Jakarta"),
              price: formatCurrency(e.min_price || e.price),
              image: getPosterUrl(e.poster, staticConcerts[idx % staticConcerts.length].image),
              fallbackImage: staticConcerts[idx % staticConcerts.length].image,
              available: e.total_seats || e.quota || 150,
              rating: "4.9 / 5.0",
              category: e.category_name || e.category || "Pop",
              stage: e.venue_name || "Main Stage Arena",
              featured: idx < 3 || Boolean(e.featured),
              tag: idx === 0 ? "POPULER" : "PILIHAN",
              viewers: `${Math.floor(Math.random() * 800 + 600)} penonton memantau`,
            }));
            setConcerts(mapped);
          }
        }
      } catch (err) {
        console.warn("Backend API events unavailable, using curated list:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const genres = useMemo(() => {
    const unique = new Set(concerts.map((c) => c.category).filter(Boolean));
    return ["Semua", ...Array.from(unique)];
  }, [concerts]);

  const filteredConcerts = useMemo(() => {
    if (selectedGenre === "Semua") return concerts;
    return concerts.filter((c) => c.category === selectedGenre);
  }, [concerts, selectedGenre]);

  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Click on ticket / book action with strict auth check
  const handleBookingAction = (concert, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const isLoggedIn = checkIsLoggedIn();
    if (!isLoggedIn) {
      setSelectedConcert(concert);
      setShowAuthModal(true);
    } else {
      router.push(`/cari-acara/${concert.id}`);
    }
  };

  const handleModalLogin = () => {
    if (typeof window !== "undefined" && selectedConcert) {
      sessionStorage.setItem("targetConcertRedirect", `/cari-acara/${selectedConcert.id}`);
    }
    setShowAuthModal(false);
    router.push("/login");
  };

  const handleModalRegister = () => {
    if (typeof window !== "undefined" && selectedConcert) {
      sessionStorage.setItem("targetConcertRedirect", `/cari-acara/${selectedConcert.id}`);
    }
    setShowAuthModal(false);
    router.push("/register");
  };

  return (
    <section id="concerts" className="relative py-28 sm:py-36 bg-[#060a17] text-white overflow-hidden">
      {/* Real concert crowd background texture with dark sapphire studio grade */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80&auto=format&fit=crop"
          alt="Concert Crowd Lights"
          fill
          className="object-cover object-top mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a17] via-[#060a17]/90 to-[#060a17]" />
      </div>

      {/* Subtle stage lighting glow in clean sapphire/blue */}
      <div className="absolute -top-32 left-1/4 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Clean, Spacious, Professional */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span>JADWAL KONSER RESMI 2026 - 2027</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase"
          >
            Lineup Konser &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
              Tiket Pilihan
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-slate-300 font-light max-w-xl mx-auto leading-relaxed"
          >
            Tiket resmi langsung dari promotor partner terverifikasi. Pilih kategori terbaik, amankan posisi, dan nikmati konser tanpa kendala calo.
          </motion.p>

          {/* Genre Category Chips (Clean, Professional) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {genres.map((genre) => {
              const active = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                      : "bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Concert Cards Grid (Clean Luxury Ticket Pass Styling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredConcerts.map((concert, idx) => (
              <motion.div
                key={concert.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                onClick={(e) => handleBookingAction(concert, e)}
                className="group relative flex flex-col rounded-3xl bg-[#0c142b]/80 hover:bg-[#101b38] border border-white/10 hover:border-blue-400/50 shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer backdrop-blur-xl"
              >
                {/* Clean Physical Ticket Stub Cutouts on Left and Right */}
                <div className="absolute top-[210px] -left-3 w-6 h-6 rounded-full bg-[#060a17] z-20 border-r border-white/15" />
                <div className="absolute top-[210px] -right-3 w-6 h-6 rounded-full bg-[#060a17] z-20 border-l border-white/15" />

                {/* Poster Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <PosterImage
                    src={concert.image}
                    alt={concert.title}
                    fallback={concert.fallbackImage || staticConcerts[idx % staticConcerts.length].image}
                  />

                  {/* Dark Stage Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c142b] via-transparent to-black/40" />

                  {/* Top Badges (No Yellow, No Emojis) */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider shadow">
                      {concert.category}
                    </span>
                    {concert.tag && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-black/75 text-blue-300 border border-blue-400/30 backdrop-blur-md uppercase tracking-wider">
                        {concert.tag}
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart */}
                  <button
                    onClick={(e) => toggleLike(concert.id, e)}
                    className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center transition-all"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked[concert.id]
                          ? "text-rose-500 fill-rose-500 scale-110"
                          : "text-white/80 hover:text-white"
                      }`}
                    />
                  </button>

                  {/* Clean viewer badge */}
                  <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-white/10 text-[10px] font-semibold text-slate-300 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    <span>{concert.viewers}</span>
                  </div>
                </div>

                {/* Ticket Body Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Concert Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {concert.title}
                    </h3>

                    {/* Artist & Stage */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                      <Music className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="font-medium text-white/90 truncate">{concert.artist}</span>
                    </div>

                    {/* Event Specs (Date & Location) */}
                    <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="font-semibold text-white">{concert.fullDate || concert.date}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 truncate">{concert.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{concert.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforated Dashed Line Divider */}
                  <div className="my-4 border-t border-dashed border-white/15" />

                  {/* Ticket Footer (Price + Book Button) */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Harga Resmi</p>
                      <p className="text-base sm:text-lg font-bold text-white">
                        {concert.price}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleBookingAction(concert, e)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Pesan Tiket</span>
                    </button>
                  </div>

                  {/* Clean Ticket Barcode graphic */}
                  <div className="mt-3 flex items-center justify-between opacity-30 font-mono text-[9px] tracking-widest text-slate-400 select-none">
                    <span>||||||| | ||||| |||| |||||||| ||||</span>
                    <span className="uppercase text-[8px]">OFFICIAL PASS</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Explore All Link */}
        <div className="text-center mt-12 sm:mt-16">
          <Link
            href="/cari-acara"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-semibold text-sm tracking-wide shadow-xl hover:border-blue-400 transition-all hover:scale-105"
          >
            <span>Lihat Semua Konser & Jadwal Lengkap</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </Link>
        </div>
      </div>

      {/* ========================================================
          AUTH REQUIRED MODAL (POPUP LOGIN / REGISTER)
         ======================================================== */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card (Clean Sapphire & Silver Styling) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-3xl bg-[#0d162e] border border-blue-500/30 p-6 sm:p-8 shadow-2xl text-left z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon & Warning Pill */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Autentikasi Akun
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Silakan Masuk Terlebih Dahulu
                  </h3>
                </div>
              </div>

              {/* Concert Preview */}
              {selectedConcert && (
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-5 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                    <PosterImage
                      src={selectedConcert.image}
                      alt={selectedConcert.title}
                      fallback={selectedConcert.fallbackImage || staticConcerts[0].image}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{selectedConcert.title}</p>
                    <p className="text-[11px] text-blue-300 font-medium truncate">{selectedConcert.artist}</p>
                    <p className="text-[10px] text-slate-400 truncate">{selectedConcert.fullDate || selectedConcert.date}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
                Untuk menjamin keamanan pemesanan tiket resmi dan menghindari transaksi bot, Anda wajib masuk ke akun TicketVerse atau mendaftar terlebih dahulu.
              </p>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleModalLogin}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun Saya</span>
                </button>

                <button
                  type="button"
                  onClick={handleModalRegister}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Baru</span>
                </button>
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Batal, Kembali ke Halaman Utama
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

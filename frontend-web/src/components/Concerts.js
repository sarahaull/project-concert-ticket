'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  TicketIcon,
  MusicalNoteIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon, FireIcon } from '@heroicons/react/24/solid';

// Data konser dengan tambahan K-Pop
const concerts = [
  {
    id: 1,
    title: 'Konser Rock Festival 2026',
    artist: 'GIGI, Sheila on 7, Padi',
    date: '15 November 2026',
    time: '19:00 - 23:00 WIB',
    location: 'Stadion Utama GBK, Jakarta',
    price: 'Rp 350.000 - Rp 1.200.000',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&crop=center',
    available: 250,
    rating: 4.8,
    category: 'Rock',
    featured: true,
    color: 'from-rose-400/80 to-orange-400/80',
    gradient: 'from-rose-50 to-orange-50/60',
    border: 'border-rose-200/30',
    tag: '🔥 Terlaris',
  },
  {
    id: 2,
    title: 'Jazz Night Under The Stars',
    artist: 'KLA Project, Tulus, Maliq & D\'Essentials',
    date: '28 November 2026',
    time: '18:30 - 22:30 WIB',
    location: 'Taman Ismail Marzuki, Jakarta',
    price: 'Rp 250.000 - Rp 850.000',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
    available: 180,
    rating: 4.9,
    category: 'Jazz',
    featured: false,
    color: 'from-violet-400/80 to-indigo-400/80',
    gradient: 'from-violet-50 to-indigo-50/60',
    border: 'border-violet-200/30',
    tag: '🎷 Eksklusif',
  },
  {
    id: 3,
    title: 'K-Pop Super Concert 2026',
    artist: 'BTS, BLACKPINK, TWICE, Stray Kids',
    date: '8 Desember 2026',
    time: '18:00 - 22:00 WIB',
    location: 'Gelora Bung Karno, Jakarta',
    price: 'Rp 500.000 - Rp 2.500.000',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop&crop=center',
    available: 500,
    rating: 4.9,
    category: 'K-Pop',
    featured: true,
    color: 'from-pink-400/80 to-rose-400/80',
    gradient: 'from-pink-50 to-rose-50/60',
    border: 'border-pink-200/30',
    tag: '🌟 Mega Event',
  },
  {
    id: 4,
    title: 'EDM Festival 2026',
    artist: 'DJ Snake, Alan Walker, R3HAB',
    date: '5 Desember 2026',
    time: '20:00 - 02:00 WIB',
    location: 'Carnival Beach, Bali',
    price: 'Rp 450.000 - Rp 1.500.000',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop&crop=center',
    available: 320,
    rating: 4.7,
    category: 'EDM',
    featured: true,
    color: 'from-cyan-400/80 to-blue-400/80',
    gradient: 'from-cyan-50 to-blue-50/60',
    border: 'border-cyan-200/30',
    tag: '🎧 All Night',
  },
  {
    id: 5,
    title: 'Pop Music Extravaganza',
    artist: 'Raisa, Isyana Sarasvati, Kunto Aji',
    date: '12 Desember 2026',
    time: '18:00 - 22:00 WIB',
    location: 'ICE BSD, Tangerang',
    price: 'Rp 200.000 - Rp 750.000',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
    available: 400,
    rating: 4.6,
    category: 'Pop',
    featured: false,
    color: 'from-emerald-400/80 to-teal-400/80',
    gradient: 'from-emerald-50 to-teal-50/60',
    border: 'border-emerald-200/30',
    tag: '🎤 Favorit',
  },
  {
    id: 6,
    title: 'K-Indie Fest 2026',
    artist: 'AKMU, Crush, Lee Hi, Dean',
    date: '18 Desember 2026',
    time: '17:00 - 21:00 WIB',
    location: 'Taman Mini Indonesia Indah, Jakarta',
    price: 'Rp 180.000 - Rp 650.000',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop&crop=center',
    available: 280,
    rating: 4.7,
    category: 'K-Pop',
    featured: false,
    color: 'from-fuchsia-400/80 to-violet-400/80',
    gradient: 'from-fuchsia-50 to-violet-50/60',
    border: 'border-fuchsia-200/30',
    tag: '🎶 Intimate',
  },
];

// Daftar genre unik untuk filter
const genres = ['Semua', ...new Set(concerts.map(c => c.category))];

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.94 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

export default function Concerts() {
  const [liked, setLiked] = useState({});
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('Semua');

<<<<<<< HEAD
  // Pisahkan konser menjadi trending (featured) dan mendatang (non-featured)
  const trendingConcerts = concerts.filter(c => c.featured);
  const upcomingConcerts = concerts.filter(c => !c.featured);
=======
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoadingApi(true);
        const { fetchApi } = await import('@/utils/api');
        const response = await fetchApi('/tickets');
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          const mapped = response.data.map((t, idx) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            date: t.date,
            time: t.time || '19:00 WIB',
            location: t.venue,
            price: t.formatted_price || `Rp ${Number(t.price).toLocaleString('id-ID')}`,
            image: t.poster || concerts[idx % concerts.length]?.image || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&crop=center',
            available: t.available || t.quota || 100,
            rating: Number(t.rating) || 4.8,
            category: t.category || 'Pop',
            featured: Boolean(t.featured),
            color: concerts[idx % concerts.length]?.color || 'from-rose-400/80 to-orange-400/80',
            gradient: concerts[idx % concerts.length]?.gradient || 'from-rose-50 to-orange-50/60',
            border: concerts[idx % concerts.length]?.border || 'border-rose-200/30',
            tag: t.tag || '🔥 Popular',
          }));
          setConcertsState(mapped);
        }
      } catch (err) {
        console.warn('Menggunakan fallback data konser lokal:', err.message);
      } finally {
        setIsLoadingApi(false);
      }
    };

    fetchTickets();
  }, []);

  const trendingConcerts = concertsState.filter(c => c.featured);
  const upcomingConcerts = concertsState.filter(c => !c.featured);
  const allDisplayConcerts = concertsState;
>>>>>>> b1ebdba (update landing page dan tampilan user)

  const filteredTrending = selectedGenre === 'Semua'
    ? trendingConcerts
    : trendingConcerts.filter(c => c.category === selectedGenre);

  const filteredUpcoming = selectedGenre === 'Semua'
    ? upcomingConcerts
    : upcomingConcerts.filter(c => c.category === selectedGenre);

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderConcertGrid = (concertsList, emptyMessage = 'Tidak ada konser') => (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedGenre}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
          },
          exit: {
            opacity: 0,
            transition: { staggerChildren: 0.03, staggerDirection: -1 },
          },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
      >
        {concertsList.map((concert, index) => (
          <motion.div
            key={concert.id}
            custom={index}
            variants={cardVariants}
            layout
            onHoverStart={() => setHoveredId(concert.id)}
            onHoverEnd={() => setHoveredId(null)}
            className="relative group"
          >
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="relative bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-xl shadow-navy/10 border border-warm-taupe/30 transition-all duration-500 hover:shadow-2xl hover:shadow-sapphire/20"
            >
              {/* Glow efek saat hover */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${concert.color} opacity-0 group-hover:opacity-30 rounded-2xl md:rounded-3xl blur-2xl transition-opacity duration-700 -z-10`}
              />

              {/* Background gradasi halus di card */}
              <div className={`absolute inset-0 bg-gradient-to-br ${concert.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-5`} />

              {/* Image Container */}
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                <Image
                  src={concert.image}
                  alt={concert.title}
                  fill
                  className={`object-cover transition-transform duration-1000 ${
                    hoveredId === concert.id ? 'scale-110' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent" />

                {/* Overlay warna kategori saat hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${concert.color} opacity-0 group-hover:opacity-30 transition-opacity duration-700`}
                />

                {/* Featured & Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                  {concert.featured && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-amber-400/30"
                    >
                      <FireIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Trending
                    </motion.div>
                  )}
                  <span className="bg-navy/40 backdrop-blur-sm text-ivory text-[9px] sm:text-[10px] font-medium px-2.5 py-1 rounded-full border border-warm-taupe/30">
                    {concert.tag}
                  </span>
                </div>

                {/* Tombol Like */}
                <motion.button
                  whileTap={{ scale: 0.7 }}
                  onClick={() => toggleLike(concert.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300"
                >
                  <HeartIcon
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                      liked[concert.id]
                        ? 'text-rose-500 fill-rose-500 scale-110'
                        : 'text-warm-taupe hover:text-rose-400'
                    }`}
                  />
                </motion.button>

                {/* Rating */}
                <div className="absolute top-3 right-14 z-10 flex items-center gap-1 bg-navy/40 backdrop-blur-sm px-2 py-1 rounded-full border border-warm-taupe/30">
                  <StarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span className="text-ivory text-[10px] sm:text-xs font-bold">{concert.rating}</span>
                </div>

                {/* Info bawah gambar */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`bg-gradient-to-r ${concert.color} text-white text-[9px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm`}
                    >
                      {concert.category}
                    </span>
                    <span className="flex items-center gap-1 text-ivory/90 text-[9px] sm:text-xs font-medium bg-navy/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <UsersIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {concert.available}
                    </span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: hoveredId === concert.id ? 1 : 0, x: hoveredId === concert.id ? 0 : 10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-2xl border border-white/50"
                  >
                    <p className="text-[7px] sm:text-[8px] font-medium text-warm-taupe uppercase tracking-wider">Mulai dari</p>
                    <p className="text-xs sm:text-sm font-extrabold text-sapphire">
                      {concert.price.split(' - ')[0]}
                    </p>
                  </motion.div>
                </div>

                {/* K-Pop Special Badge */}
                {concert.category === 'K-Pop' && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-2xl shadow-pink-400/40">
                      <span className="text-base sm:text-lg">🇰🇷</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3">
                <div>
                  <h3
                    className={`text-base sm:text-lg md:text-xl font-bold text-navy transition-colors duration-300 line-clamp-1 ${
                      hoveredId === concert.id ? 'text-sapphire' : ''
                    }`}
                  >
                    {concert.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-sapphire/70 font-medium mt-0.5 flex items-center gap-1.5 truncate">
                    <MusicalNoteIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{concert.artist}</span>
                  </p>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm text-warm-taupe/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-champagne/50 flex items-center justify-center flex-shrink-0 border border-warm-taupe/20">
                      <CalendarIcon className="w-3.5 h-3.5 text-sapphire" />
                    </div>
                    <span className="text-[11px] sm:text-xs truncate">
                      {concert.date} <span className="text-warm-taupe/40">•</span> {concert.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-champagne/50 flex items-center justify-center flex-shrink-0 border border-warm-taupe/20">
                      <MapPinIcon className="w-3.5 h-3.5 text-sapphire" />
                    </div>
                    <span className="text-[11px] sm:text-xs truncate">{concert.location}</span>
                  </div>
                </div>

                {/* Tombol CTA Premium */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group/btn mt-2"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-sapphire to-navy rounded-xl blur opacity-0 group-hover/btn:opacity-30 transition duration-300" />
                  <Link
                    href={`/booking/${concert.id}`}
                    className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-sapphire to-navy text-ivory py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-sapphire/20 hover:shadow-xl hover:shadow-sapphire/30 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <TicketIcon className="w-4 h-4" />
                      Pesan Tiket
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-block"
                      >
                        →
                      </motion.span>
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-sapphire via-navy to-sapphire"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <section
      id="concerts"
      className="relative py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, #F8F4F0 0%, #FFFFFF 40%, #F0EDE8 80%, #E8E0D8 100%)',
      }}
    >
      {/* Dekorasi Background Premium */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-gradient-to-br from-sapphire/10 to-champagne/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] sm:w-[700px] h-[600px] sm:h-[700px] bg-gradient-to-tl from-sapphire/10 to-rose-200/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-champagne/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, #6ABAFF 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/70 backdrop-blur-xl border border-warm-taupe/20 shadow-xl shadow-navy/5 mb-4 sm:mb-5"
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
            </div>
            <span className="text-[10px] sm:text-sm font-semibold text-sapphire tracking-wide">
              🎫 {concerts.length} Konser Mendatang
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-navy"
          >
            Temukan{' '}
            <span className="bg-gradient-to-r from-sapphire via-sapphire/80 to-navy bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Konser
            </span>{' '}
            Favoritmu
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-warm-taupe/80 leading-relaxed mt-3 sm:mt-4 max-w-2xl mx-auto px-2"
          >
            Dari K-Pop hingga Rock, temukan konser impianmu dan pesan tiket sekarang juga!
          </motion.p>

          {/* Filter Genre */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
          >
            {genres.map((genre) => (
              <motion.button
                key={genre}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-semibold transition-all duration-300 ${
                  selectedGenre === genre
                    ? 'bg-gradient-to-r from-sapphire to-navy text-ivory shadow-xl shadow-sapphire/30'
                    : 'bg-white/60 backdrop-blur-sm text-navy hover:bg-white/90 border border-warm-taupe/30'
                }`}
              >
                {genre === 'K-Pop' ? '🇰🇷 K-Pop' : genre}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Bagian 1: Konser Trending */}
        {filteredTrending.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
            >
              <FireIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy">Konser Trending</h3>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-300 to-transparent" />
            </motion.div>
            {renderConcertGrid(filteredTrending, 'Tidak ada konser trending untuk genre ini')}
          </div>
        )}

        {/* Bagian 2: Konser Mendatang */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
          >
            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-sapphire" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy">Konser Mendatang</h3>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-sapphire/50 to-transparent" />
          </motion.div>
          {renderConcertGrid(filteredUpcoming, 'Tidak ada konser mendatang untuk genre ini')}
        </div>

        {/* Tombol Lihat Semua */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-10 sm:mt-12"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="#"
              className="group inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-full bg-white/80 backdrop-blur-xl text-sapphire font-bold text-sm sm:text-base border-2 border-sapphire/20 shadow-xl shadow-sapphire/10 hover:shadow-2xl hover:bg-white transition-all duration-300"
            >
              <span>Lihat Semua Konser</span>
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* CSS Animasi */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s ease infinite;
        }
        .shadow-3xl {
          box-shadow: 0 30px 60px -15px rgba(26, 42, 108, 0.15);
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </section>
  );
}
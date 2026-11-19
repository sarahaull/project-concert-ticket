'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Ticket, CalendarCheck, CalendarX, DollarSign, Calendar,
  MapPin, Clock, Mail, Phone, History, Star, ChevronRight,
  User, Sparkles, TrendingUp, ArrowRight, Bell, Heart,
  ChevronLeft, Pencil, Check, Image as ImageIcon,
} from 'lucide-react';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '').replace(/\/api$/i, '');

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return '-';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
};

const formatTime = (time) => time ? String(time).slice(0, 5) : '-';

const getMediaUrl = (path) => {
  if (!path) return '';

  const value = String(path).trim();

  if (
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  return value.startsWith('/')
    ? `${API_BASE}${value}`
    : `${API_BASE}/${value}`;
};

const getEventPoster = (event) => {
  return getMediaUrl(
    event?.poster ||
    event?.event_poster ||
    event?.image ||
    event?.image_url ||
    event?.poster_url
  );
};

const getProfilePhoto = (user) => {
  return getMediaUrl(
    user?.photo ||
    user?.profile_image ||
    user?.profile_picture ||
    user?.avatar
  );
};

const extractList = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];

    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }
  }

  if (Array.isArray(response?.data)) return response.data;

  return [];
};

const isPaid = (value) => {
  return [
    'paid',
    'success',
    'completed',
    'berhasil',
    'lunas',
  ].includes(String(value || '').toLowerCase());
};

const getDaysLeft = (date, time = '00:00:00') => {
  if (!date) return 0;

  const eventDate = new Date(date);

  if (Number.isNaN(eventDate.getTime())) return 0;

  const parts = String(time).split(':');

  eventDate.setHours(
    Number(parts[0]) || 0,
    Number(parts[1]) || 0,
    Number(parts[2]) || 0,
    0
  );

  return Math.max(
    0,
    Math.ceil((eventDate.getTime() - Date.now()) / 86400000)
  );
};

const getStartingPrice = (event) => {
  if (!event) return null;

  const categories =
    event.ticket_categories ||
    event.ticketCategories ||
    [];

  const categoryPrices = Array.isArray(categories)
    ? categories
        .map((ticket) => Number(ticket.price))
        .filter((price) => Number.isFinite(price) && price > 0)
    : [];

  const directPrices = [
    event.min_price,
    event.starting_price,
    event.ticket_price,
    event.price,
  ]
    .map((price) => {
      if (price === null || price === undefined || price === '') {
        return null;
      }

      return Number(price);
    })
    .filter((price) => Number.isFinite(price) && price > 0);

  const allPrices = [
    ...categoryPrices,
    ...directPrices,
  ];

  return allPrices.length
    ? Math.min(...allPrices)
    : null;
};

const ImagePlaceholder = ({ className = '' }) => (
  <div className={`flex items-center justify-center bg-[#F1F5F9] ${className}`}>
    <ImageIcon className="h-9 w-9 text-[#CBD5E1]" />
  </div>
);

const StatsCard = ({ title, value, icon, subtitle, trendLabel }) => {
  const iconMap = {
    ticket: Ticket,
    active: CalendarCheck,
    expired: CalendarX,
    money: DollarSign,
    heart: Heart,
  };

  const Icon = iconMap[icon] || Ticket;

  const accents = {
    ticket: 'bg-blue-50 text-blue-700 bg-blue-600',
    active: 'bg-sky-50 text-sky-600 bg-sky-500',
    expired: 'bg-slate-100 text-slate-600 bg-slate-500',
    money: 'bg-indigo-50 text-indigo-600 bg-indigo-500',
    heart: 'bg-cyan-50 text-cyan-600 bg-cyan-500',
  };

  const [iconBg, iconColor, bar] = (accents[icon] || accents.ticket).split(' ');

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-blue-900/10">
      <div className={`absolute left-0 top-0 h-full w-1.5 ${bar}`} />

      <div className="flex items-start justify-between gap-3 px-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-1.5 truncate text-2xl font-black text-[#112250] lg:text-3xl">
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${iconBg} transition-transform group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      {trendLabel && (
        <div className="mt-4 flex items-center gap-1.5 border-t border-blue-50 px-1.5 pt-3 text-[11px] font-medium text-blue-600">
          <TrendingUp className="h-3.5 w-3.5" />
          {trendLabel}
        </div>
      )}
    </div>
  );
};

const TicketCard = ({ event }) => {
  const poster = getEventPoster(event);

  return (
    <Link href={`/tickets/${event.id}`} className="group block min-w-0">
      <div className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-900/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/10 lg:flex-row">
        <div className="relative h-44 w-full flex-shrink-0 overflow-hidden sm:h-48 lg:h-auto lg:w-44 xl:w-48">
          {poster ? (
            <img
              src={poster}
              alt={event.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#112250]/90 via-[#112250]/30 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/20 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-md">
              {event.category || 'Event'}
            </span>

            <span className="rounded-md bg-blue-500 px-2.5 py-1 text-[9px] font-bold text-white">
              Aktif
            </span>
          </div>
        </div>

        <div className="relative hidden w-8 flex-shrink-0 items-center justify-center lg:flex">
          <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-blue-200" />
          <div className="absolute -left-2 top-2 h-4 w-4 rounded-full border-r border-blue-200 bg-[#F8FAFC]" />
          <div className="absolute -left-2 bottom-2 h-4 w-4 rounded-full border-r border-blue-200 bg-[#F8FAFC]" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[#112250] transition-colors group-hover:text-blue-600">
              {event.name}
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs text-slate-500 sm:grid-cols-2">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                {formatDate(event.date)}
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                {formatTime(event.time)} WIB
              </div>

              <div className="flex min-w-0 items-center gap-1.5 font-medium sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                <span className="truncate">{event.venue}</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span className="truncate">{event.organizer}</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <Ticket className="h-3.5 w-3.5 text-blue-500" />
                {event.seat === 'General'
                  ? 'General Admission'
                  : `Kursi ${event.seat}`}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-blue-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Harga
              </p>

              <p className="text-base font-black text-[#112250]">
                {event.price > 0
                  ? formatRupiah(event.price)
                  : 'Harga belum tersedia'}
              </p>
            </div>

            <span className="flex items-center justify-center gap-1.5 self-start rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition-colors group-hover:bg-[#112250] group-hover:text-white sm:self-auto">
              Detail <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const RecommendationCard = ({
  event,
  userId,
  onWishlistChange,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(
    Boolean(event.isWishlisted)
  );

  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(Boolean(event.isWishlisted));
  }, [event.isWishlisted]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    const token = localStorage.getItem('token');

    if (!token) {
      window.alert('Silakan login terlebih dahulu.');
      return;
    }

    const currentEventId = event?.id ?? event?.event_id;

    if (!userId || !currentEventId) {
      window.alert('Data pengguna atau event tidak ditemukan.');
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        if (!event.wishlistId) {
          throw new Error('ID wishlist tidak ditemukan.');
        }

        const response = await fetch(
          `${API_BASE}/api/wishlist/${event.wishlistId}`,
          {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Gagal menghapus wishlist.');
        }

        setIsWishlisted(false);
        onWishlistChange?.(currentEventId, false);
      } else {
        const response = await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userId,
            event_id: currentEventId,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Gagal menambahkan wishlist.');
        }

        setIsWishlisted(true);

        onWishlistChange?.(
          currentEventId,
          true,
          data.wishlist || data.data || data
        );
      }
    } catch (error) {
      console.error('WISHLIST ERROR:', error);
      window.alert(error.message || 'Gagal memperbarui wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const poster = getEventPoster(event);

  return (
    <div className="group relative flex w-[260px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-900/5 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-blue-900/10">
      <div className="relative h-40 overflow-hidden bg-[#F1F5F9]">
        {poster ? (
          <img
            src={poster}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#112250]/80 via-[#112250]/20 to-transparent" />

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-md transition hover:scale-110 hover:bg-white disabled:opacity-50"
          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
        >
          {wishlistLoading ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          ) : (
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted
                  ? 'fill-blue-600 text-blue-600'
                  : 'text-slate-400'
              }`}
            />
          )}
        </button>

        <span className="absolute left-2.5 top-2.5 rounded-md bg-white/20 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">
          {event.category || 'Event'}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col border-t border-dashed border-blue-100 p-4">
        <h4 className="truncate text-sm font-bold text-[#112250]">
          {event.name}
        </h4>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-500">
          <Calendar className="h-3 w-3 text-blue-500" />
          {formatDate(event.date)}

          <span className="text-blue-200">|</span>

          <Clock className="h-3 w-3 text-blue-500" />
          {formatTime(event.time)}
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-500">
          <MapPin className="h-3 w-3 flex-shrink-0 text-blue-500" />
          <span className="truncate">{event.venue}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Mulai dari
            </p>

            <p className="truncate text-sm font-black text-[#112250]">
              {event.price > 0
                ? formatRupiah(event.price)
                : 'Harga belum tersedia'}
            </p>
          </div>

          <Link
            href={`/cari-acara/${event.id}`}
            className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 transition hover:bg-[#112250] hover:text-white"
          >
            Pesan <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const Banner = ({ banners = [] }) => {
  const router = useRouter();
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [isPointerInside, setIsPointerInside] = useState(false);
  const touchStartX = useRef(0);
  const AUTOPLAY_MS = 7000;

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 6,
        size: 2 + Math.random() * 4,
        opacity: 0.15 + Math.random() * 0.4,
      })),
    []
  );

  useEffect(() => {
    setActiveIndex(0);
    setProgressKey((k) => k + 1);
  }, [banners]);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
      setProgressKey((k) => k + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const currentBanner = banners[activeIndex];

  const navigateTo = (path) => {
    if (!path) return;
    if (/^https?:\/\//i.test(path)) {
      window.location.href = path;
      return;
    }
    router.push(path.startsWith('/') ? path : `/${path}`);
  };

  const changeSlide = (direction) => {
    if (!banners.length) return;
    setActiveIndex((current) => (current + direction + banners.length) % banners.length);
    setProgressKey((k) => k + 1);
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
    setProgressKey((k) => k + 1);
  };

  const handlePointerMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (!currentBanner) {
    return (
      <div className="banner-empty relative mb-6 flex min-h-[220px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#112250] to-blue-900 px-6 text-center shadow-lg shadow-blue-900/20 sm:mb-8 sm:min-h-[280px]">
        <div className="banner-float absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="banner-float-delayed absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative z-10">
          <Sparkles className="banner-icon-pulse mx-auto h-10 w-10 text-blue-300" />
          <h2 className="mt-4 text-2xl font-black text-white">Selamat Datang di TicketVerse</h2>
          <p className="mt-2 text-sm font-medium text-blue-100/80">Temukan dan nikmati event favoritmu.</p>
          <Link href="/events" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-400 hover:scale-105 active:scale-95">
            Jelajahi Event <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="banner-premium group relative mb-6 overflow-hidden rounded-3xl shadow-lg shadow-blue-900/10 sm:mb-8"
      onMouseEnter={() => { setIsPaused(true); setIsPointerInside(true); }}
      onMouseLeave={() => { setIsPaused(false); setIsPointerInside(false); }}
      onMouseMove={handlePointerMove}
    >
      <div
        className="relative h-64 overflow-hidden rounded-3xl sm:h-72 md:h-80 lg:h-96"
        onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].screenX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].screenX;
          if (Math.abs(diff) > 50) changeSlide(diff > 0 ? 1 : -1);
        }}
      >
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={banner.id}
              className="banner-slide-layer absolute inset-0"
              style={{
                transform: isActive
                  ? 'translateX(0) scale(1)'
                  : `translateX(${index < activeIndex ? '-8%' : '8%'}) scale(1.06)`,
                opacity: isActive ? 1 : 0,
                transition: 'transform 1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.9s ease',
                zIndex: isActive ? 2 : 1,
              }}
            >
              {banner.image && (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className={`absolute inset-0 h-full w-full object-cover ${
                    isActive ? 'banner-kenburns' : ''
                  }`}
                  style={{
                    transform: isPointerInside
                      ? `scale(1.1) translate(${(pointer.x - 50) * -0.03}%, ${(pointer.y - 50) * -0.03}%)`
                      : undefined,
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="banner-vignette absolute inset-0" />
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#112250]/95 via-[#112250]/65 to-transparent" />
        <div className="banner-aurora pointer-events-none absolute inset-0 z-10" />

        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {particles.map((p) => (
            <span
              key={p.id}
              className="banner-particle"
              style={{
                left: `${p.left}%`,
                bottom: '-10px',
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {isPointerInside && (
          <div
            className="banner-cursor-glow pointer-events-none absolute z-10"
            style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
          />
        )}

        <div
          key={currentBanner.id}
          className="relative z-20 flex h-full max-w-2xl flex-col justify-center px-5 sm:px-8 md:px-12"
        >
          <span className="banner-anim banner-anim-1 mb-3 w-fit rounded-md border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm">
            {currentBanner.subtitle}
          </span>

          <h2 className="banner-anim banner-anim-2 banner-title-reveal text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            <span>{currentBanner.title}</span>
          </h2>

          <p className="banner-anim banner-anim-3 mt-3 max-w-lg text-xs font-medium leading-relaxed text-blue-100/90 drop-shadow-sm sm:text-sm md:text-base">
            {currentBanner.description}
          </p>

          {currentBanner.button_text && (
            <div className="banner-anim banner-anim-4 mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigateTo(currentBanner.button_link)}
                className="group/btn relative flex items-center gap-2 overflow-hidden rounded-xl bg-blue-500 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-blue-400 hover:shadow-lg sm:text-sm active:scale-95"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <span className="relative">{currentBanner.button_text}</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>

              {currentBanner.secondary_button_text && (
                <button
                  type="button"
                  onClick={() => navigateTo(currentBanner.secondary_button_link)}
                  className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105 active:scale-95 sm:text-sm"
                >
                  {currentBanner.secondary_button_text}
                </button>
              )}
            </div>
          )}
        </div>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Banner sebelumnya"
              className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/40 hover:scale-110 active:scale-95 sm:block"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Banner selanjutnya"
              className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/40 hover:scale-110 active:scale-95 sm:block"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
              {banners.map((banner, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Pilih banner ${index + 1}`}
                    className="banner-dot relative flex h-3.5 w-3.5 items-center justify-center"
                  >
                    <svg viewBox="0 0 36 36" className="h-3.5 w-3.5 -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="4"
                      />
                      {isActive && (
                        <circle
                          key={progressKey}
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#60a5fa"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray="94.2"
                          className="banner-ring-progress"
                          style={{
                            animationDuration: `${AUTOPLAY_MS}ms`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                          }}
                        />
                      )}
                    </svg>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .banner-premium {
          isolation: isolate;
        }

        @keyframes bannerFadeUp {
          0%   { opacity: 0; transform: translateY(28px) scale(0.98); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .banner-anim {
          opacity: 0;
          animation: bannerFadeUp 1s cubic-bezier(0.22, 1.2, 0.36, 1) forwards;
        }
        .banner-anim-1 { animation-delay: 0.15s; }
        .banner-anim-2 { animation-delay: 0.30s; }
        .banner-anim-3 { animation-delay: 0.50s; }
        .banner-anim-4 { animation-delay: 0.70s; }

        @keyframes bannerTitleReveal {
          0%   { clip-path: inset(0 100% 0 0); transform: translateY(8px); }
          100% { clip-path: inset(0 0 0 0); transform: translateY(0); }
        }
        .banner-title-reveal > span {
          display: inline-block;
          background: linear-gradient(90deg, #ffffff 0%, #dbeafe 50%, #ffffff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: bannerTitleReveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards,
                     bannerTitleShine 4s linear 1.5s infinite;
        }
        @keyframes bannerTitleShine {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes bannerKenburns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.14); }
        }
        .banner-kenburns {
          animation: bannerKenburns 9s ease-out forwards;
          transition: transform 0.6s ease-out;
        }

        @keyframes bannerAurora {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .banner-aurora {
          background:
            radial-gradient(circle at 20% 30%, rgba(96, 165, 250, 0.18), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.16), transparent 45%);
          background-size: 200% 200%;
          animation: bannerAurora 12s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        .banner-vignette {
          background: radial-gradient(ellipse at center, transparent 40%, rgba(17, 34, 80, 0.55) 100%);
          pointer-events: none;
        }

        @keyframes bannerParticleFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-320px) translateX(20px); opacity: 0; }
        }
        .banner-particle {
          position: absolute;
          background: radial-gradient(circle, rgba(191, 219, 254, 0.9), rgba(96, 165, 250, 0.4));
          border-radius: 9999px;
          animation-name: bannerParticleFloat;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          pointer-events: none;
          filter: blur(0.5px);
        }

        .banner-cursor-glow {
          width: 320px;
          height: 320px;
          margin-left: -160px;
          margin-top: -160px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.25), transparent 65%);
          border-radius: 9999px;
          transition: left 0.15s ease-out, top 0.15s ease-out;
          mix-blend-mode: screen;
        }

        @keyframes bannerRingFill {
          from { stroke-dashoffset: 94.2; }
          to   { stroke-dashoffset: 0; }
        }
        .banner-ring-progress {
          animation-name: bannerRingFill;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .banner-dot:hover svg circle:first-child {
          stroke: rgba(255, 255, 255, 0.6);
        }

        @keyframes bannerFloat {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(10px, -10px); }
        }
        .banner-float { animation: bannerFloat 6s ease-in-out infinite; }
        .banner-float-delayed { animation: bannerFloat 6s ease-in-out 2s infinite; }

        @keyframes bannerIconPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.15); opacity: 0.8; }
        }
        .banner-icon-pulse { animation: bannerIconPulse 2.5s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .banner-anim,
          .banner-kenburns,
          .banner-aurora,
          .banner-particle,
          .banner-ring-progress,
          .banner-title-reveal > span,
          .banner-float,
          .banner-float-delayed,
          .banner-icon-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const NotificationItem = ({ notif }) => (
  <div className="flex min-w-0 items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 transition-colors hover:bg-blue-50">
    <div className="rounded-lg bg-white p-1.5 text-blue-600 shadow-sm">
      <Bell className="h-3.5 w-3.5" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-bold text-[#112250]">
        {notif.title || 'Notifikasi'}
      </p>

      <p className="break-words text-[11px] font-medium leading-relaxed text-slate-500">
        {notif.message || notif.description || ''}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-blue-400">
        {formatDate(notif.created_at)}
      </p>
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const scrollContainerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [banners, setBanners] = useState([]);

  const [error, setError] = useState('');

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
        return null;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API error ${url}:`, err);
      return null;
    }
  }, [router]);

  const fetchEventDetails = useCallback(async (event) => {
    const eventId = event?.id ?? event?.event_id;

    if (!eventId) return event;

    try {
      const response = await fetch(
        `${API_BASE}/api/events/${eventId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        console.error(
          `Gagal mengambil detail event ${eventId}:`,
          response.status
        );

        return {
          ...event,
          price: getStartingPrice(event),
        };
      }

      const data = await response.json();

      const detail = data?.event || data?.data?.event || {};

      const mergedEvent = {
        ...event,
        ...detail,
        id: eventId,
        ticket_categories:
          detail.ticket_categories ||
          detail.ticketCategories ||
          event.ticket_categories ||
          event.ticketCategories ||
          [],
      };

      return {
        ...mergedEvent,
        price: getStartingPrice(mergedEvent),
      };
    } catch (err) {
      console.error(`EVENT DETAIL ERROR ${eventId}:`, err);

      return {
        ...event,
        price: getStartingPrice(event),
      };
    }
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/banners/home`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      const list = extractList(data, ['banners'])
        .filter((banner) => {
          const status =
            banner.is_active ??
            banner.isActive ??
            banner.active ??
            banner.status;

          if (status === undefined || status === null) return true;

          return [
            true,
            1,
            '1',
            'true',
            'active',
            'aktif',
            'published',
          ].includes(
            typeof status === 'string'
              ? status.toLowerCase()
              : status
          );
        })
        .sort(
          (a, b) =>
            Number(a.sort_order ?? a.urutan ?? 0) -
            Number(b.sort_order ?? b.urutan ?? 0)
        )
        .map((banner, index) => ({
          id: banner.id ?? index,
          title: banner.title || banner.judul || '',
          subtitle: banner.subtitle || banner.subjudul || '',
          description: banner.description || banner.deskripsi || '',
          image: getMediaUrl(
            banner.image ||
            banner.image_url ||
            banner.banner_image ||
            banner.gambar ||
            banner.image_path
          ),
          button_text:
            banner.button_text ||
            banner.buttonText ||
            banner.teks_tombol ||
            '',
          button_link:
            banner.button_link ||
            banner.buttonLink ||
            banner.link_tombol ||
            '/events',
          secondary_button_text:
            banner.secondary_button_text ||
            banner.secondaryButtonText ||
            '',
          secondary_button_link:
            banner.secondary_button_link ||
            banner.secondaryButtonLink ||
            '/tickets',
        }));

      setBanners(list);
    } catch (err) {
      console.error('Gagal mengambil banner:', err);
    }
  }, []);

  useEffect(() => {
    fetchBanners();

    const interval = setInterval(fetchBanners, 15000);

    const onFocus = () => fetchBanners();

    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchBanners]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [
          profileRes,
          eventsRes,
          ordersRes,
          ticketsRes,
          paymentsRes,
        ] = await Promise.all([
          fetchWithAuth('/api/users/profile'),
          fetchWithAuth('/api/events'),
          fetchWithAuth('/api/orders'),
          fetchWithAuth('/api/tickets'),
          fetchWithAuth('/api/payments'),
        ]);

        if (!mounted) return;

        const profile =
          profileRes?.user ||
          profileRes?.data?.user;

        if (!profileRes?.success || !profile) {
          throw new Error(
            profileRes?.message ||
            'Gagal mengambil profil pengguna.'
          );
        }

        setUser(profile);

        localStorage.setItem(
          'user',
          JSON.stringify(profile)
        );

        const eventList = extractList(eventsRes, ['events']);
        const orderList = extractList(ordersRes, ['orders']);
        const ticketList = extractList(ticketsRes, ['tickets']);
        const paymentList = extractList(paymentsRes, ['payments']);

        const recommendationEvents = await Promise.all(
          eventList.slice(0, 10).map((event) =>
            fetchEventDetails(event)
          )
        );

        if (!mounted) return;

        setEvents([
          ...recommendationEvents,
          ...eventList.slice(10),
        ]);

        setOrders(orderList);
        setTickets(ticketList);
        setPayments(paymentList);

        const [wishlistRes, notificationsRes] = await Promise.all([
          fetchWithAuth(`/api/wishlist/user/${profile.id}`),
          fetchWithAuth(`/api/notifications/user/${profile.id}`),
        ]);

        if (!mounted) return;

        setWishlist(
          wishlistRes?.success
            ? extractList(wishlistRes, ['wishlist'])
            : []
        );

        setNotifications(
          notificationsRes?.success
            ? extractList(notificationsRes, ['notifications'])
            : []
        );

        if (
          !eventsRes?.success ||
          !ordersRes ||
          !ticketsRes ||
          !paymentsRes
        ) {
          setError(
            'Sebagian data dashboard gagal dimuat. Silakan coba kembali.'
          );
        }
      } catch (err) {
        console.error('Dashboard error:', err);

        if (mounted) {
          setError(err.message || 'Gagal memuat dashboard.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [fetchWithAuth, fetchEventDetails, router]);

  const activeTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        if (!isPaid(ticket.payment_status)) return false;

        if (!ticket.event_date) return true;

        const eventDate = new Date(ticket.event_date);

        return (
          !Number.isNaN(eventDate.getTime()) &&
          eventDate.getTime() >= Date.now()
        );
      })
      .map((ticket) => ({
        ...ticket,
        id: ticket.id,
        name: ticket.event_name || ticket.name || 'Event',
        date: ticket.event_date || ticket.date,
        time: ticket.event_time || ticket.time,
        venue: ticket.venue_name || ticket.venue || '-',
        category: ticket.category_name || ticket.category || 'Event',
        price: Number(ticket.price) || 0,
        organizer:
          ticket.artist_name ||
          ticket.organizer ||
          'TicketVerse',
        image: getEventPoster(ticket),
        seat: ticket.seat || 'General',
        barcode: ticket.ticket_code || `TKT-${ticket.id}`,
        daysLeft: getDaysLeft(
          ticket.event_date,
          ticket.event_time
        ),
      }));
  }, [tickets]);

  const recommendations = useMemo(() => {
    const wishlistMap = new Map();

    wishlist.forEach((item) => {
      wishlistMap.set(Number(item.event_id), item);
    });

    return events
      .filter((event) => {
        if (!event.event_date) return true;

        const eventDate = new Date(event.event_date);

        return (
          !Number.isNaN(eventDate.getTime()) &&
          eventDate.getTime() >= Date.now()
        );
      })
      .slice(0, 10)
      .map((event) => {
        const eventId = event.id ?? event.event_id;

        const wishlistItem = wishlistMap.get(Number(eventId));

        return {
          ...event,
          id: eventId,
          name: event.event_name || event.name || 'Event',
          category:
            event.category_name ||
            event.category ||
            'Event',
          venue:
            event.venue_name ||
            event.venue ||
            '-',
          date:
            event.event_date ||
            event.date,
          time:
            event.event_time ||
            event.time,

          price: getStartingPrice(event),

          image: getEventPoster(event),

          isWishlisted: Boolean(wishlistItem),

          wishlistId:
            wishlistItem?.id ||
            wishlistItem?.wishlist_id ||
            null,
        };
      });
  }, [events, wishlist]);

  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const activeCount = activeTickets.length;

    const totalSpent = payments
      .filter((payment) =>
        isPaid(payment.payment_status || payment.status)
      )
      .reduce(
        (total, payment) =>
          total + (Number(payment.amount) || 0),
        0
      );

    return {
      total: totalTickets,
      active: activeCount,
      expired: Math.max(0, totalTickets - activeCount),
      totalSpent,
    };
  }, [tickets, activeTickets, payments]);

  const bookings = useMemo(() => {
    return orders
      .map((order) => {
        const relatedTickets = tickets.filter(
          (ticket) =>
            Number(ticket.order_id) === Number(order.id)
        );

        const relatedPayment = payments.find(
          (payment) =>
            Number(payment.order_id) === Number(order.id)
        );

        const firstTicket = relatedTickets[0];

        const status = String(
          order.payment_status || order.status || ''
        ).toLowerCase();

        return {
          id: order.id,

          event_name:
            firstTicket?.event_name ||
            order.event_name ||
            'Pesanan Tiket',

          event_date:
            firstTicket?.event_date ||
            order.event_date ||
            null,

          quantity:
            relatedTickets.length ||
            Number(order.quantity) ||
            0,

          total:
            Number(order.total_price) ||
            Number(relatedPayment?.amount) ||
            0,

          status: isPaid(status)
            ? 'confirmed'
            : ['cancelled', 'canceled', 'dibatalkan'].includes(status)
              ? 'cancelled'
              : 'pending',
        };
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [orders, tickets, payments]);

  const handleWishlistChange = (
    eventId,
    isAdded,
    wishlistItem
  ) => {
    setWishlist((current) => {
      if (isAdded) {
        const newWishlistId =
          wishlistItem?.id ??
          wishlistItem?.wishlist_id ??
          wishlistItem?.wishlist?.id ??
          null;

        return [
          ...current.filter(
            (item) =>
              Number(item.event_id) !== Number(eventId)
          ),
          {
            ...(wishlistItem || {}),
            id: newWishlistId,
            event_id: eventId,
          },
        ];
      }

      return current.filter(
        (item) =>
          Number(item.event_id) !== Number(eventId)
      );
    });
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({
      left: -300,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({
      left: 300,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">
            Profil tidak dapat dimuat. Silakan login kembali.
          </p>

          <Link
            href="/login"
            className="mt-4 inline-block rounded-lg bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  const profilePhoto = getProfilePhoto(user);

  return (
    <div className="w-full min-w-0">

      <Banner banners={banners} />

      {error && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
          {error}
        </div>
      )}

      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2.5 text-xl font-black text-[#112250] sm:text-2xl lg:text-3xl">
            <span className="max-w-full truncate">
              Halo, {user.fullname || user.name || user.username || 'Member'}
            </span>

            <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              {user.role === 'event_organizer'
                ? 'Organizer'
                : user.role === 'super_admin'
                  ? 'Super Admin'
                  : 'Member'}
            </span>
          </h2>

          <p className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">
            Siap untuk menemukan konser impianmu selanjutnya?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700">
            <Star className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
            Member TicketVerse
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Dashboard
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatsCard
          title="Total Tiket"
          value={stats.total}
          icon="ticket"
          subtitle="Total semua tiket"
          trendLabel={`${stats.total} tiket`}
        />

        <StatsCard
          title="Akan Datang"
          value={stats.active}
          icon="active"
          subtitle="Konser mendatang"
          trendLabel="Tiket aktif"
        />

        <StatsCard
          title="Pengeluaran"
          value={formatRupiah(stats.totalSpent)}
          icon="money"
          subtitle="Total pembayaran berhasil"
          trendLabel="Pembayaran"
        />

        <StatsCard
          title="Wishlist"
          value={wishlist.length}
          icon="heart"
          subtitle="Acara favorit"
          trendLabel={`${wishlist.length} acara`}
        />
      </div>

      <div className="mb-6 min-w-0 sm:mb-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#112250]">
              <Ticket className="h-5 w-5 text-blue-600" />
              Tiket Saya
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Tiket konser yang sudah dikonfirmasi
            </p>
          </div>

          <Link
            href="/tickets"
            className="flex items-center gap-1 self-start text-xs font-bold text-blue-600 transition hover:text-[#112250]"
          >
            Lihat semua <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          {activeTickets.slice(0, 2).map((event) => (
            <TicketCard key={event.id} event={event} />
          ))}

          {activeTickets.length === 0 && (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white py-12 text-center xl:col-span-2">
              <Ticket className="mx-auto h-10 w-10 text-blue-200" />

              <p className="mt-3 text-sm font-bold text-[#112250]">
                Belum ada tiket aktif
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Yuk, cari konser dan beli tiket sekarang!
              </p>

              <Link
                href="/events"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#112250] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800"
              >
                Jelajahi Event <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:mb-8 xl:grid-cols-3">

        <div className="min-w-0 xl:col-span-1">
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-900/5 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#112250]">
                <Bell className="h-4.5 w-4.5 text-blue-600" />
                Notifikasi
              </h3>

              <Link
                href="/notifications"
                className="whitespace-nowrap text-[10px] font-bold text-blue-600 hover:text-[#112250]"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="max-h-[300px] space-y-2.5 overflow-y-auto pr-1">
              {notifications.slice(0, 5).map((notif) => (
                <NotificationItem key={notif.id} notif={notif} />
              ))}

              {notifications.length === 0 && (
                <div className="py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-blue-200" />

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Belum ada notifikasi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 xl:col-span-2">
          <div className="min-w-0 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-900/5 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-[#112250]">
                <Sparkles className="h-4.5 w-4.5 flex-shrink-0 text-blue-500" />

                <span className="truncate">
                  Rekomendasi Untukmu
                </span>
              </h3>

              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollLeft}
                  aria-label="Geser kiri"
                  className="rounded-full bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollRight}
                  aria-label="Geser kanan"
                  className="rounded-full bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="hide-scrollbar flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
            >
              {recommendations.map((event) => (
                <RecommendationCard
                  key={event.id}
                  event={event}
                  userId={user.id}
                  onWishlistChange={handleWishlistChange}
                />
              ))}

              {recommendations.length === 0 && (
                <div className="w-full py-8 text-center text-sm font-medium text-slate-500">
                  Belum ada event tersedia.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 min-w-0 sm:mb-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#112250]">
            <History className="h-5 w-5 text-blue-600" />
            Riwayat Pemesanan
          </h3>

          <Link
            href="/history"
            className="whitespace-nowrap text-xs font-bold text-blue-600 hover:text-[#112250]"
          >
            Lihat semua
          </Link>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-900/5 sm:p-6">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[600px] divide-y divide-blue-50">
              <thead>
                <tr>
                  {['Event', 'Tanggal', 'Tiket', 'Total', 'Status'].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-50">
                {bookings.slice(0, 5).map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-blue-50/50"
                  >
                    <td className="max-w-[180px] truncate px-3 py-3.5 text-sm font-bold text-[#112250]">
                      {booking.event_name}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-xs font-medium text-slate-500">
                      {formatDate(booking.event_date)}
                    </td>

                    <td className="px-3 py-3.5 text-xs font-semibold text-slate-600">
                      {booking.quantity}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-xs font-bold text-[#112250]">
                      {formatRupiah(booking.total)}
                    </td>

                    <td className="px-3 py-3.5 text-xs">
                      <span
                        className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] font-bold ${
                          booking.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-700'
                            : booking.status === 'cancelled'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {booking.status === 'confirmed'
                          ? 'Dikonfirmasi'
                          : booking.status === 'cancelled'
                            ? 'Dibatalkan'
                            : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <History className="mx-auto h-8 w-8 text-blue-200" />

                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Belum ada riwayat pemesanan.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">

        <div className="min-w-0 xl:col-span-2">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#112250]">
                  Informasi Akun
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Data profil yang tersimpan di akunmu
                </p>
              </div>

              <User className="h-6 w-6 text-blue-600" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-50 bg-blue-50/50 p-3.5">
                <Mail className="h-4 w-4 flex-shrink-0 text-blue-600" />

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </p>

                  <p className="truncate text-xs font-semibold text-[#112250]">
                    {user.email || 'Belum diisi'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-50 bg-blue-50/50 p-3.5">
                <Phone className="h-4 w-4 flex-shrink-0 text-blue-600" />

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nomor HP
                  </p>

                  <p className="truncate text-xs font-semibold text-[#112250]">
                    {user.phone || 'Belum diisi'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-50 bg-blue-50/50 p-3.5">
                <User className="h-4 w-4 flex-shrink-0 text-blue-600" />

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Jenis Kelamin
                  </p>

                  <p className="truncate text-xs font-semibold text-[#112250]">
                    {user.gender || 'Belum diisi'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-50 bg-blue-50/50 p-3.5">
                <Calendar className="h-4 w-4 flex-shrink-0 text-blue-600" />

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tanggal Bergabung
                  </p>

                  <p className="truncate text-xs font-semibold text-[#112250]">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/profile"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profil
            </Link>
          </div>
        </div>

        <div className="min-w-0 xl:col-span-1">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 text-center shadow-sm shadow-blue-900/5 sm:p-6 xl:sticky xl:top-24">
            <div className="relative inline-block">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-blue-50 ring-4 ring-blue-100 sm:h-24 sm:w-24">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={user.fullname || 'Profile'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-10 w-10 text-blue-300" />
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-sm">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <h3 className="mt-4 truncate text-lg font-black text-[#112250]">
              {user.fullname || user.name || user.username || 'Member'}
            </h3>

            <p className="text-xs font-medium text-slate-500">
              Member sejak{' '}
              {user.created_at
                ? new Date(user.created_at).getFullYear()
                : '-'}
            </p>

            <div className="mt-5 space-y-2 border-t border-blue-50 pt-5">

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-50 bg-blue-50/50 p-3 text-left">
                <Mail className="h-4 w-4 flex-shrink-0 text-blue-500" />

                <span className="truncate text-xs font-medium text-slate-600">
                  {user.email || 'Belum diisi'}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-50 bg-blue-50/50 p-3 text-left">
                <Phone className="h-4 w-4 flex-shrink-0 text-blue-500" />

                <span className="truncate text-xs font-medium text-slate-600">
                  {user.phone || 'Belum diisi'}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-50 bg-blue-50/50 p-3 text-left">
                <User className="h-4 w-4 flex-shrink-0 text-blue-500" />

                <span className="truncate text-xs font-medium text-slate-600">
                  {user.gender || 'Belum diisi'}
                </span>
              </div>
            </div>

            <Link
              href="/profile"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profil
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
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
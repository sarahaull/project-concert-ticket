'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  History,
  Star,
  ChevronRight,
  User,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Gift,
  Flame,
  Bell,
  Heart,
  ChevronLeft,
  Music,
  Music2,
  Pencil,
  Check,
  Circle,
} from 'lucide-react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  } catch {
    return '-';
  }
};

const getDaysLeft = (date, time = '00:00:00') => {
  if (!date) return 0;

  try {
    const eventDate = new Date(date);

    if (time) {
      const timeParts = String(time).split(':');

      if (timeParts.length >= 2) {
        eventDate.setHours(
          Number(timeParts[0]) || 0,
          Number(timeParts[1]) || 0,
          Number(timeParts[2]) || 0,
          0
        );
      }
    }

    const now = new Date();
    const difference = eventDate.getTime() - now.getTime();

    return Math.max(
      0,
      Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
  } catch {
    return 0;
  }
};

const formatTime = (time) => {
  if (!time) return '-';
  return String(time).slice(0, 5);
};

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) return null;

    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Gagal membaca user dari localStorage:', error);
    return null;
  }
};

const StatsCard = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendIcon,
  trendLabel,
}) => {
  const iconMap = {
    ticket: Ticket,
    active: CalendarCheck,
    expired: CalendarX,
    money: DollarSign,
    heart: Heart,
  };

  const Icon = iconMap[icon] || Ticket;
  const TrendIcon = trendIcon;

  const gradients = {
    ticket: 'bg-gradient-to-br from-[#112250] to-[#3B507D]',
    active: 'bg-gradient-to-br from-emerald-600 to-teal-400',
    expired: 'bg-gradient-to-br from-rose-500 to-pink-400',
    money: 'bg-gradient-to-br from-amber-500 to-orange-400',
    heart: 'bg-gradient-to-br from-rose-400 to-pink-500',
  };

  const gradient = gradients[icon] || gradients.ticket;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl ${gradient}
        p-4 sm:p-5 lg:p-6
        text-white shadow-lg
        transition-all duration-500
        hover:-translate-y-1 hover:shadow-2xl
        min-w-0
      `}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/70 sm:text-xs">
            {title}
          </p>

          <p className="mt-1 break-words text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 truncate text-[10px] text-white/60 sm:text-xs">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 rounded-xl border border-white/20 bg-white/20 p-2 shadow-inner backdrop-blur-sm sm:rounded-2xl sm:p-3">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>

      {(trend || trendIcon) && (
        <div className="relative z-10 mt-3 flex items-center gap-1 text-[10px] font-medium text-white/80 sm:text-xs">
          {trend && <TrendingUp className="h-3 w-3" />}

          {TrendIcon && <TrendIcon className="h-3 w-3 inline-block" />}

          {trendLabel && <span>{trendLabel}</span>}

          {!trendIcon && trend && <span>{trend}</span>}
        </div>
      )}
    </div>
  );
};

const TicketCard = ({ event }) => {
  const getBarHeight = (index) => 8 + ((index * 7) % 20);

  const safeEvent = {
    id: event?.id || 0,
    name: event?.name || event?.event_name || 'Event',
    date: event?.date || event?.event_date || null,
    time: event?.time || event?.event_time || '19:00',
    venue: event?.venue || event?.venue_name || 'Venue',
    status: event?.status || 'Aktif',
    image: event?.image || event?.poster || '/images/default-event.jpg',
    category: event?.category || event?.category_name || 'Umum',
    price: event?.price || 0,
    organizer: event?.organizer || event?.artist_name || 'TicketVerse',
    seat: event?.seat || 'General',
    barcode: event?.barcode || event?.ticket_code || '#TKT-000',
    daysLeft: event?.daysLeft || 0,
  };

  return (
    <Link href={`/tickets/${safeEvent.id}`} className="group block min-w-0">
      <div className="relative overflow-hidden rounded-2xl border border-[#D8D0C4]/30 bg-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
        <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-[#112250] via-[#3B507D] to-[#E5C27A]" />

        <div className="flex h-full min-w-0 flex-col pt-2 lg:flex-row">
          <div className="relative h-48 w-full min-h-[180px] flex-shrink-0 overflow-hidden sm:h-52 lg:h-auto lg:w-40 xl:w-44">
            <img
              src={safeEvent.image}
              alt={safeEvent.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src =
                  'https://picsum.photos/seed/ticketverse-event/600/400';
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute left-3 right-3 top-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur-sm sm:text-[10px]">
                {safeEvent.category}
              </span>

              <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[9px] font-semibold text-white shadow-lg sm:text-[10px]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>

                {safeEvent.status}
              </span>
            </div>
          </div>

          <div className="relative hidden w-8 flex-shrink-0 items-center justify-center bg-white lg:flex">
            <div className="absolute bottom-0 left-1/2 top-0 border-l-2 border-dashed border-[#D8D0C4]/50" />

            <div className="absolute left-1/2 top-3 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#D8D0C4]/50 bg-[#F7F8FA]" />

            <div className="absolute bottom-3 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#D8D0C4]/50 bg-[#F7F8FA]" />

            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 bg-white px-2 text-[8px] font-bold uppercase tracking-widest text-[#9B907F]">
              potong
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-[#112250] transition group-hover:text-[#3B507D] sm:text-lg">
                {safeEvent.name}
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 text-xs text-gray-600 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                  <span className="truncate">{formatDate(safeEvent.date)}</span>
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                  <Clock className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                  <span className="truncate">{formatTime(safeEvent.time)} WIB</span>
                </div>

                <div className="flex min-w-0 items-center gap-1.5 sm:col-span-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                  <span className="truncate">{safeEvent.venue}</span>
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                  <User className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                  <span className="truncate">{safeEvent.organizer}</span>
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                  <Ticket className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                  <span className="truncate">
                    {safeEvent.seat === 'General'
                      ? 'General Admission'
                      : `Kursi ${safeEvent.seat}`}
                  </span>
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                  <Clock className="h-4 w-4 flex-shrink-0 text-rose-400" />
                  <span className="font-semibold text-rose-500">
                    {safeEvent.daysLeft} Hari
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-[#D8D0C4]/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#9B907F]">
                  Harga
                </p>

                <p className="bg-gradient-to-r from-[#112250] to-[#3B507D] bg-clip-text text-base font-extrabold text-transparent sm:text-lg">
                  {formatRupiah(safeEvent.price)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="hidden w-16 flex-shrink-0 md:block">
                  <div className="flex h-8 items-end gap-[1px]">
                    {Array.from({ length: 20 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-[#112250]/70"
                        style={{
                          width: '2px',
                          height: `${getBarHeight(index)}px`,
                        }}
                      />
                    ))}
                  </div>

                  <p className="mt-0.5 text-center font-mono text-[6px] tracking-wider text-[#9B907F]">
                    {safeEvent.barcode}
                  </p>
                </div>

                <span className="flex-shrink-0 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-4 py-2 text-xs font-bold text-white transition-all group-hover:scale-105 group-hover:shadow-lg">
                  Detail
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-0 top-1/2 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#D8D0C4]/50 bg-[#F7F8FA] lg:block" />

        <div className="absolute right-0 top-1/2 hidden h-6 w-6 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#D8D0C4]/50 bg-[#F7F8FA] lg:block" />
      </div>
    </Link>
  );
};

const RecommendationCard = ({ event, onWishlistChange }) => {
  const [isWishlisted, setIsWishlisted] = useState(
    Boolean(event?.isWishlisted)
  );

  useEffect(() => {
    setIsWishlisted(Boolean(event?.isWishlisted));
  }, [event?.isWishlisted]);

  const defaultGradient =
    'from-blue-500/90 via-purple-500/80 to-pink-600/70';

  const defaultBg = 'bg-gradient-to-br from-blue-400 to-purple-600';

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    const user = getStoredUser();

    if (!token || !user?.id) return;

    try {
      if (isWishlisted) {
        const wishlistId = event?.wishlistId;

        if (!wishlistId) return;

        const response = await fetch(
          `${API_BASE}/api/wishlist/${wishlistId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Gagal menghapus wishlist');
        }

        setIsWishlisted(false);

        if (onWishlistChange) {
          onWishlistChange(event.id, false);
        }
      } else {
        const response = await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            event_id: event.id,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal menambahkan wishlist');
        }

        setIsWishlisted(true);

        if (onWishlistChange) {
          onWishlistChange(event.id, true, data.wishlist);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  return (
    <div className="group relative w-[260px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-[#D8D0C4]/20 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:w-[300px] md:w-[320px] lg:w-[340px]">
      <div className="relative h-44 overflow-hidden sm:h-48 md:h-52">
        <img
          src={
            event?.image ||
            event?.poster ||
            'https://picsum.photos/seed/event/600/400'
          }
          alt={event?.name || event?.event_name || 'Event'}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src =
              'https://picsum.photos/seed/recommendation/600/400';
          }}
        />

        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            event?.gradient || defaultGradient
          } mix-blend-overlay`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/30 bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-500'
            }`}
          />
        </button>

        <div className="absolute left-3 right-12 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {event?.category || event?.category_name || 'Event'}
          </span>

          <span className="flex items-center gap-0.5 rounded-full bg-amber-400/90 px-2.5 py-1 text-[9px] font-bold text-white shadow-lg">
            <Star className="h-3 w-3 fill-white" />
            {event?.rating || '4.5'}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-[#3B507D]/80 px-3 py-1 text-[9px] font-bold text-white shadow-lg backdrop-blur-sm">
          <User className="h-3 w-3" />
          {event?.attendees || '1k'} tertarik
        </div>
      </div>

      <div className="p-4">
        <h4 className="truncate text-base font-bold text-[#112250] transition group-hover:text-[#3B507D]">
          {event?.name || event?.event_name || 'Event'}
        </h4>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <Calendar className="h-3.5 w-3.5 text-[#3B507D]" />

          <span>
            {event?.date || event?.event_date
              ? formatDate(event?.date || event?.event_date)
              : '-'}
          </span>

          <span className="text-[#9B907F]">-</span>

          <Clock className="h-3.5 w-3.5 text-[#3B507D]" />

          <span>{formatTime(event?.time || event?.event_time)}</span>
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#3B507D]" />

          <span className="truncate">
            {event?.venue || event?.venue_name || 'Venue'}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#D8D0C4]/30 pt-3">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-[#9B907F]">
              Mulai dari
            </p>

            <p className="truncate bg-gradient-to-r from-[#112250] to-[#3B507D] bg-clip-text text-sm font-extrabold text-transparent sm:text-base">
              {formatRupiah(event?.price || 0)}
            </p>
          </div>

          <Link
            href={`/cari-acara/${event?.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 hover:shadow-lg sm:px-5"
          >
            Pesan
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className={`h-1.5 w-full ${event?.bgColor || defaultBg}`} />
    </div>
  );
};

const PromoCard = ({ promo }) => {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-xl border border-[#D8D0C4]/30 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-32 overflow-hidden">
        <img
          src={promo?.image || 'https://picsum.photos/seed/promo/400/200'}
          alt={promo?.title || 'Promo'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#112250]/60 to-[#3B507D]/30" />

        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[8px] font-bold text-white">
          <Flame className="h-2.5 w-2.5" />
          {promo?.discount || 'Promo'}
        </div>

        <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full border border-white/20 bg-white/20 px-2 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">
          <Clock className="h-2.5 w-2.5" />
          <span>{promo?.valid_until || '-'}</span>
        </div>
      </div>

      <div className="p-3">
        <h4 className="truncate text-sm font-semibold text-[#112250] transition group-hover:text-[#3B507D]">
          {promo?.title || 'Promo'}
        </h4>

        <p className="mt-0.5 truncate text-[10px] text-gray-500">
          {promo?.description || ''}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#D8D0C4]/30 pt-2">
          <span className="truncate rounded border border-[#D8D0C4]/30 bg-[#E5C27A]/20 px-2 py-0.5 font-mono text-xs text-[#112250]">
            {promo?.code || 'PROMO'}
          </span>

          <button
            type="button"
            className="flex-shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-[10px] font-medium text-white transition-all hover:scale-105 hover:shadow-md"
          >
            Klaim
          </button>
        </div>
      </div>
    </div>
  );
};

const Banner = ({ imageUrl }) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&q=80';

  const bgImage = imageUrl || defaultImage;

  const sparkles = Array.from({ length: 12 }).map((_, index) => ({
    top: (index * 37 + 13) % 100,
    left: (index * 73 + 7) % 100,
    delay: ((index * 11 + 5) % 30) / 10,
    duration: 2 + ((index * 19 + 3) % 30) / 10,
  }));

  return (
    <div className="relative mb-8 min-w-0 overflow-hidden rounded-2xl sm:mb-10 lg:mb-12">
      <div className="absolute -bottom-6 left-1/2 h-20 w-[90%] -translate-x-1/2 animate-glow-pulse rounded-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-2xl" />

      <div className="relative h-64 overflow-hidden rounded-2xl shadow-2xl sm:h-72 md:h-80 lg:h-96">
        <img
          src={bgImage}
          alt="Concert Banner"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-[#112250]/80 via-[#3B507D]/60 to-[#E5C27A]/20" />

        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent mix-blend-overlay" />

        <div className="absolute inset-0 overflow-hidden">
          {sparkles.map((sparkle, index) => (
            <div
              key={index}
              className="absolute h-1.5 w-1.5 animate-sparkle rounded-full bg-white/60"
              style={{
                top: `${sparkle.top}%`,
                left: `${sparkle.left}%`,
                animationDelay: `${sparkle.delay}s`,
                animationDuration: `${sparkle.duration}s`,
              }}
            />
          ))}

          <div className="absolute -left-20 -top-20 h-64 w-64 animate-float rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -right-20 h-80 w-80 animate-float-delay rounded-full bg-amber-400/10 blur-3xl" />

          <div className="absolute left-1/2 top-1/3 h-40 w-40 animate-float-slow rounded-full bg-pink-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-5 sm:px-8 md:px-12">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/20 px-3 py-1 text-[10px] font-semibold text-amber-200 backdrop-blur-sm sm:text-xs">
              Konser Terbaru
            </span>

            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm sm:text-xs">
              Tiket Terbatas
            </span>
          </div>

          <h2 className="text-2xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
            Temukan konser{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-pink-400 bg-clip-text text-transparent">
              favoritmu
            </span>
            <br className="hidden sm:block" /> sekarang!
          </h2>

          <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/90 drop-shadow sm:text-sm md:text-base">
            Dapatkan tiket untuk konser terbaik dan nikmati pengalaman musik yang tak terlupakan.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 sm:mt-6 sm:gap-4">
            <Link
              href="/events"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-amber-400/30 sm:px-8 sm:py-3 sm:text-sm"
            >
              Jelajahi Sekarang
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <Link
              href="/tickets"
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 sm:px-8 sm:py-3 sm:text-sm"
            >
              Lihat Tiket
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden text-6xl text-white/20 sm:block">
          <Music className="h-12 w-12" />
        </div>

        <div className="absolute right-20 top-6 hidden text-5xl text-white/10 md:block">
          <Music2 className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ notif }) => {
  const bgColor =
    {
      info: 'border-[#3B507D]/20 bg-[#3B507D]/10',
      success: 'border-emerald-200 bg-emerald-50',
      event: 'border-amber-200 bg-amber-50',
    }[notif?.type] || 'border-gray-200 bg-gray-50';

  const iconColor =
    {
      info: 'text-[#3B507D]',
      success: 'text-emerald-600',
      event: 'text-amber-600',
    }[notif?.type] || 'text-gray-600';

  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 transition hover:shadow-sm ${bgColor}`}
    >
      <div className={`flex-shrink-0 rounded-full bg-white/80 p-1.5 ${iconColor}`}>
        <Bell className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#112250]">
          {notif?.title}
        </p>

        <p className="break-words text-xs text-gray-500">
          {notif?.description || notif?.message}
        </p>

        <p className="mt-1 text-[10px] text-[#9B907F]">
          {notif?.time || formatDate(notif?.created_at)}
        </p>
      </div>
    </div>
  );
};

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

  const [error, setError] = useState('');

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
        return null;
      }

      const data = await response.json();
      return data;
    } catch (fetchError) {
      console.error(`Fetch error ${url}:`, fetchError);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const storedUser = getStoredUser();

      if (!storedUser) {
        localStorage.removeItem('token');
        router.replace('/login');
        return;
      }

      if (!mounted) return;

      setUser(storedUser);
      setLoading(true);
      setError('');

      try {
        const [
          eventsRes,
          ordersRes,
          ticketsRes,
          paymentsRes,
          wishlistRes,
          notificationsRes,
        ] = await Promise.all([
          fetchWithAuth('/api/events'),
          fetchWithAuth('/api/orders'),
          fetchWithAuth('/api/tickets'),
          fetchWithAuth('/api/payments'),
          fetchWithAuth(`/api/wishlist/user/${storedUser.id}`),
          fetchWithAuth(`/api/notifications/user/${storedUser.id}`),
        ]);

        if (!mounted) return;

        if (eventsRes?.success) {
          setEvents(eventsRes.events || []);
        } else {
          setEvents([]);
        }

        const allOrders = ordersRes?.orders || [];
        const userOrders = allOrders.filter(
          (order) => Number(order.user_id) === Number(storedUser.id)
        );
        setOrders(userOrders);

        const allTickets = ticketsRes?.tickets || [];
        const userOrderIds = new Set(
          userOrders.map((order) => Number(order.id))
        );
        const userTickets = allTickets.filter((ticket) =>
          userOrderIds.has(Number(ticket.order_id))
        );
        setTickets(userTickets);

        const allPayments = paymentsRes?.payments || [];
        const userPayments = allPayments.filter((payment) =>
          userOrderIds.has(Number(payment.order_id))
        );
        setPayments(userPayments);

        if (wishlistRes?.success) {
          setWishlist(wishlistRes.wishlist || []);
        } else {
          setWishlist([]);
        }

        if (notificationsRes?.success) {
          setNotifications(
            (notificationsRes.notifications || []).map((notif) => ({
              ...notif,
              description: notif.message,
              type: notif.is_read ? 'info' : 'success',
              time: notif.created_at
                ? formatDate(notif.created_at)
                : 'Baru saja',
            }))
          );
        } else {
          setNotifications([]);
        }
      } catch (loadError) {
        console.error('Gagal memuat dashboard:', loadError);

        if (mounted) {
          setError('Sebagian data dashboard gagal dimuat.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [router]);

  const userOrderIds = useMemo(() => {
    return new Set(orders.map((order) => Number(order.id)));
  }, [orders]);

  const activeTickets = useMemo(() => {
    const now = new Date();

    return tickets
      .filter((ticket) => {
        if (
          String(ticket.payment_status || '').toLowerCase() !== 'paid'
        ) {
          return false;
        }

        if (!ticket.event_date) {
          return true;
        }

        const eventDate = new Date(ticket.event_date);
        return eventDate >= now;
      })
      .map((ticket) => ({
        ...ticket,
        id: ticket.id,
        name: ticket.event_name,
        date: ticket.event_date,
        time: ticket.event_time,
        venue: ticket.venue_name || ticket.venue,
        category: ticket.category_name,
        price: Number(ticket.price) || 0,
        organizer: ticket.artist_name || ticket.organizer || 'TicketVerse',
        status: 'Aktif',
        image:
          ticket.poster ||
          ticket.event_poster ||
          '/images/default-event.jpg',
        seat: ticket.seat || 'General',
        barcode: ticket.ticket_code || `#TKT-${ticket.id}`,
        daysLeft: getDaysLeft(ticket.event_date, ticket.event_time),
      }));
  }, [tickets]);

  const recommendations = useMemo(() => {
    const wishlistMap = new Map();

    wishlist.forEach((item) => {
      wishlistMap.set(Number(item.event_id), item);
    });

    return events
      .filter((event) => {
        if (!event?.event_date) return true;
        return new Date(event.event_date).getTime() >= Date.now();
      })
      .slice(0, 10)
      .map((event, index) => {
        const wishlistItem = wishlistMap.get(Number(event.id));

        return {
          ...event,
          id: event.id,
          name: event.event_name || event.name || 'Event',
          category: event.category_name || event.category || 'Event',
          venue: event.venue_name || event.venue || 'Venue',
          artist_name:
            event.artist_name || event.artist || 'TicketVerse',
          date: event.event_date || event.date,
          time: event.event_time || event.time,
          price:
            Number(event.min_price) ||
            Number(event.price) ||
            Number(event.starting_price) ||
            0,
          image:
            event.poster || event.image || '/images/default-event.jpg',
          isWishlisted: Boolean(wishlistItem),
          wishlistId: wishlistItem?.id || null,
          rating: event.rating || event.average_rating || '4.5',
          attendees:
            event.attendees || event.total_interested || '1k',
          gradient: [
            'from-blue-500/90 via-purple-500/80 to-pink-600/70',
            'from-indigo-500/90 via-blue-500/80 to-cyan-500/70',
            'from-purple-500/90 via-fuchsia-500/80 to-rose-500/70',
            'from-cyan-500/90 via-blue-500/80 to-indigo-600/70',
          ][index % 4],
        };
      });
  }, [events, wishlist]);

  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const activeCount = activeTickets.length;
    const expiredCount = Math.max(0, totalTickets - activeCount);

    const totalSpent = payments
      .filter(
        (payment) =>
          String(payment.payment_status || '').toLowerCase() === 'success'
      )
      .reduce(
        (total, payment) => total + (Number(payment.amount) || 0),
        0
      );

    return {
      total: totalTickets,
      active: activeCount,
      expired: expiredCount,
      totalSpent,
    };
  }, [tickets, activeTickets, payments]);

  const bookings = useMemo(() => {
    return orders
      .map((order) => {
        const relatedTickets = tickets.filter(
          (ticket) => Number(ticket.order_id) === Number(order.id)
        );

        const firstTicket = relatedTickets[0];

        const relatedPayment = payments.find(
          (payment) => Number(payment.order_id) === Number(order.id)
        );

        return {
          id: order.id,
          order_id: order.id,
          order_code: order.order_code || `ORDER-${order.id}`,
          event_name: firstTicket?.event_name || 'Pesanan Tiket',
          event_date: firstTicket?.event_date || null,
          quantity: relatedTickets.length || 0,
          total:
            Number(order.total_price) ||
            Number(relatedPayment?.amount) ||
            0,
          status:
            String(order.payment_status || '').toLowerCase() === 'paid'
              ? 'confirmed'
              : String(order.payment_status || '').toLowerCase() ===
                  'cancelled'
                ? 'cancelled'
                : 'pending',
        };
      })
      .sort((a, b) => b.id - a.id);
  }, [orders, tickets, payments]);

  const handleWishlistChange = (eventId, isAdded, wishlistItem) => {
    setWishlist((current) => {
      if (isAdded) {
        return [
          ...current,
          {
            ...(wishlistItem || {}),
            event_id: eventId,
            id: wishlistItem?.id,
          },
        ];
      }

      return current.filter(
        (item) => Number(item.event_id) !== Number(eventId)
      );
    });
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -330,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 330,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#3B507D]/20 border-t-[#3B507D]" />

          <p className="mt-4 text-sm text-[#9B907F]">
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
          <p className="text-sm text-gray-500">
            Silakan login terlebih dahulu.
          </p>

          <Link
            href="/login"
            className="mt-3 inline-block text-sm font-semibold text-[#3B507D] hover:text-[#112250]"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <Banner imageUrl="/images/bn2.png" />

      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold text-[#112250] sm:text-2xl lg:text-3xl">
            <span className="max-w-full truncate">
              Halo, {user.fullname || user.name || 'Member'}
            </span>

            <span className="rounded-full border border-[#D8D0C4]/30 bg-gradient-to-r from-[#E5C27A]/40 to-[#F7F8FA] px-3 py-1 text-[10px] font-semibold text-[#112250] shadow-sm sm:text-xs">
              {user.role === 'customer'
                ? 'Member'
                : user.role === 'event_organizer'
                  ? 'Organizer'
                  : user.role === 'super_admin'
                    ? 'Super Admin'
                    : 'Member'}
            </span>
          </h2>

          <p className="mt-1 text-xs text-[#3B507D]/70 sm:text-sm">
            Siap untuk menemukan konser impianmu selanjutnya?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#D8D0C4]/30 bg-[#E5C27A]/20 px-3 py-2 text-xs text-[#112250] shadow-sm sm:px-4 sm:text-sm">
            <Star className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />
            <span>Member Premium</span>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-[#D8D0C4]/30 bg-[#F7F8FA] px-3 py-1.5 text-[10px] text-[#9B907F] sm:text-xs">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Pro</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatsCard
          title="Total Tiket"
          value={stats.total}
          icon="ticket"
          subtitle="Total semua tiket"
          trendIcon={Ticket}
          trendLabel={`${stats.total} tiket`}
        />

        <StatsCard
          title="Akan Datang"
          value={stats.active}
          icon="active"
          subtitle="Konser mendatang"
          trendIcon={Circle}
          trendLabel="Aktif"
        />

        <StatsCard
          title="Pengeluaran"
          value={formatRupiah(stats.totalSpent)}
          icon="money"
          subtitle="Total pembayaran berhasil"
          trendIcon={DollarSign}
          trendLabel="Pembayaran"
        />

        <StatsCard
          title="Wishlist"
          value={wishlist.length}
          icon="heart"
          subtitle="Acara favorit"
          trendIcon={Heart}
          trendLabel={
            wishlist.length > 0
              ? `${wishlist.length} acara`
              : 'Belum ada'
          }
        />
      </div>

      <div className="mb-6 min-w-0 sm:mb-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#112250] sm:text-xl">
              <Ticket className="h-5 w-5 text-[#3B507D]" />
              Tiket Saya
            </h3>

            <p className="text-xs text-[#9B907F]">
              Akan Datang - Tiket terkonfirmasi
            </p>
          </div>

          <Link
            href="/tickets"
            className="flex items-center gap-1 self-start text-xs font-medium text-[#3B507D] hover:text-[#112250] sm:self-auto sm:text-sm"
          >
            Lihat semua
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          {activeTickets.slice(0, 2).map((event) => (
            <TicketCard key={event.id} event={event} />
          ))}

          {activeTickets.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#D8D0C4]/50 bg-white/60 py-10 text-center xl:col-span-2">
              <Ticket className="mx-auto h-10 w-10 text-[#D8D0C4]" />

              <p className="mt-3 text-sm font-medium text-[#112250]">
                Belum ada tiket aktif
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Yuk, cari konser dan beli tiket sekarang!
              </p>

              <Link
                href="/events"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
              >
                Jelajahi Event
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:mb-8 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-1">
          <div className="rounded-2xl border border-[#D8D0C4]/30 bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#112250] sm:text-lg">
                <Bell className="h-5 w-5 flex-shrink-0 text-[#3B507D]" />
                Notifikasi
              </h3>

              <Link
                href="/notifications"
                className="whitespace-nowrap text-[10px] text-[#3B507D] sm:text-xs"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="max-h-[300px] space-y-3 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <NotificationItem key={notif.id} notif={notif} />
              ))}

              {notifications.length === 0 && (
                <div className="py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-[#D8D0C4]" />

                  <p className="mt-2 text-xs text-gray-500">
                    Belum ada notifikasi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 xl:col-span-2">
          <div className="min-w-0 rounded-2xl border border-[#D8D0C4]/30 bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-[#112250] sm:text-lg">
                <Sparkles className="h-5 w-5 flex-shrink-0 fill-amber-400 text-amber-400" />
                <span className="truncate">Rekomendasi Untukmu</span>
              </h3>

              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="rounded-full bg-[#112250]/10 p-1.5 transition hover:bg-[#112250]/20"
                  aria-label="Geser kiri"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={scrollRight}
                  className="rounded-full bg-[#112250]/10 p-1.5 transition hover:bg-[#112250]/20"
                  aria-label="Geser kanan"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="hide-scrollbar flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 sm:gap-5"
            >
              {recommendations.map((event) => (
                <RecommendationCard
                  key={event.id}
                  event={event}
                  onWishlistChange={handleWishlistChange}
                />
              ))}

              {recommendations.length === 0 && (
                <div className="w-full min-w-full py-8 text-center text-sm text-gray-500">
                  Belum ada event tersedia.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 min-w-0 sm:mb-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#112250] sm:text-xl">
            <Gift className="h-5 w-5 text-rose-500" />
            Dapatkan Diskon Spesial!
          </h3>

          <Link
            href="/promos"
            className="flex items-center gap-1 self-start text-xs text-[#3B507D] sm:self-auto sm:text-sm"
          >
            Lihat semua
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          <PromoCard
            promo={{
              id: 1,
              title: 'Promo Tiket Konser',
              description: 'Nikmati pengalaman konser lebih hemat.',
              discount: 'Promo',
              code: 'TICKETVERSE',
              valid_until: 'Segera',
              image:
                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
            }}
          />

          <PromoCard
            promo={{
              id: 2,
              title: 'Special Member',
              description: 'Promo khusus untuk member TicketVerse.',
              discount: 'Member',
              code: 'MEMBER',
              valid_until: 'Terbatas',
              image:
                'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
            }}
          />

          <PromoCard
            promo={{
              id: 3,
              title: 'Concert Deals',
              description: 'Dapatkan harga terbaik untuk event pilihan.',
              discount: 'Deals',
              code: 'CONCERT',
              valid_until: 'Terbatas',
              image:
                'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80',
            }}
          />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <div className="min-w-0 rounded-2xl border border-[#D8D0C4]/30 bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#112250] sm:text-lg">
                <History className="h-5 w-5 text-[#3B507D]" />
                Riwayat Pemesanan
              </h3>

              <Link
                href="/history"
                className="whitespace-nowrap text-xs text-[#3B507D] sm:text-sm"
              >
                Lihat semua
              </Link>
            </div>

            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[650px] divide-y divide-[#D8D0C4]/30">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#9B907F]">
                      Event
                    </th>

                    <th className="px-4 py-2 text-left text-xs font-medium text-[#9B907F]">
                      Tanggal
                    </th>

                    <th className="px-4 py-2 text-left text-xs font-medium text-[#9B907F]">
                      Tiket
                    </th>

                    <th className="px-4 py-2 text-left text-xs font-medium text-[#9B907F]">
                      Total
                    </th>

                    <th className="px-4 py-2 text-left text-xs font-medium text-[#9B907F]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id}>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-[#112250]">
                        {booking.event_name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {booking.event_date
                          ? formatDate(booking.event_date)
                          : '-'}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500">
                        {booking.quantity}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-[#112250]">
                        {formatRupiah(booking.total)}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : booking.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
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
                      <td colSpan="5" className="py-10 text-center">
                        <History className="mx-auto h-8 w-8 text-[#D8D0C4]" />

                        <p className="mt-2 text-sm text-gray-500">
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

        <div className="min-w-0 xl:col-span-1">
          <div className="rounded-2xl border border-[#D8D0C4]/30 bg-white/80 p-5 text-center shadow-lg backdrop-blur-sm sm:p-6 xl:sticky xl:top-24">
            <div className="relative inline-block">
              <div className="h-20 w-20 overflow-hidden rounded-full shadow-lg ring-4 ring-[#E5C27A]/50 sm:h-24 sm:w-24">
                <img
                  src={user.photo || 'https://i.pravatar.cc/150'}
                  alt={user.fullname || 'Profile'}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-400">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>

            <h3 className="mt-4 truncate text-lg font-bold text-[#112250] sm:text-xl">
              {user.fullname || user.name || 'Member'}
            </h3>

            <p className="text-xs text-[#9B907F] sm:text-sm">
              Member sejak{' '}
              {user.created_at
                ? new Date(user.created_at).getFullYear()
                : '-'}
            </p>

            <div className="mt-4 space-y-2 border-t border-[#D8D0C4]/30 pt-4">
              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#E5C27A]/20 p-2 text-left text-sm text-gray-600">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <span className="truncate">{user.email || 'Belum diisi'}</span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#E5C27A]/20 p-2 text-left text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <span className="truncate">{user.phone || 'Belum diisi'}</span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#E5C27A]/20 p-2 text-left text-sm text-gray-600">
                <User className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <span className="truncate">{user.gender || 'Belum diisi'}</span>
              </div>
            </div>

            <Link
              href="/profile"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] py-2.5 text-center text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Pencil className="h-4 w-4" />
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-16px);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: float 5s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.5);
          }

          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-sparkle {
          animation: sparkle 2.5s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%,
          100% {
            opacity: 0.4;
          }

          50% {
            opacity: 1;
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .animate-swing {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
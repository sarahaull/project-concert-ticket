
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

  if (!value) return '';

  if (
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${API_BASE}${value}`;
  }

  return `${API_BASE}/${value}`;
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
  return ['paid', 'success', 'completed', 'berhasil', 'lunas']
    .includes(String(value || '').toLowerCase());
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

const ImagePlaceholder = ({ className = '' }) => (
  <div className={`flex items-center justify-center bg-[#F0F1F4] ${className}`}>
    <ImageIcon className="h-9 w-9 text-[#AAB0BD]" />
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
    ticket: 'bg-[#112250]/5 text-[#112250] bg-[#112250]',
    active: 'bg-emerald-50 text-emerald-600 bg-emerald-500',
    expired: 'bg-rose-50 text-rose-500 bg-rose-500',
    money: 'bg-amber-50 text-amber-600 bg-amber-500',
    heart: 'bg-pink-50 text-pink-500 bg-pink-500',
  };

  const accent = accents[icon] || accents.ticket;
  const [iconBg, iconColor, bar] = accent.split(' ');

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#E8E3D9] bg-white p-5 shadow-sm ring-1 ring-[#112250]/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`absolute left-0 top-0 h-full w-1 ${bar}`} />

      <div className="flex items-start justify-between gap-3 px-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9B907F]">
            {title}
          </p>

          <p className="mt-1.5 truncate text-2xl font-bold text-[#112250] lg:text-3xl">
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] text-[#9B907F]">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      {trendLabel && (
        <div className="mt-3 flex items-center gap-1.5 px-2 text-[11px] text-[#9B907F]">
          <TrendingUp className="h-3 w-3" />
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
      <div className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E8E3D9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg lg:flex-row">
        <div className="relative h-44 w-full flex-shrink-0 overflow-hidden sm:h-48 lg:h-auto lg:w-44 xl:w-48">
          {poster ? (
            <img
              src={poster}
              alt={event.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-black/50 px-2 py-1 text-[9px] font-semibold text-white">
              {event.category || 'Event'}
            </span>

            <span className="rounded-md bg-emerald-500 px-2 py-1 text-[9px] font-semibold text-white">
              Aktif
            </span>
          </div>
        </div>

        <div className="relative hidden w-8 flex-shrink-0 items-center justify-center lg:flex">
          <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-[#E8E3D9]" />
          <div className="absolute -left-2 top-2 h-4 w-4 rounded-full border-r border-[#E8E3D9] bg-[#F7F8FA]" />
          <div className="absolute -left-2 bottom-2 h-4 w-4 rounded-full border-r border-[#E8E3D9] bg-[#F7F8FA]" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[#112250] group-hover:text-[#3B507D]">
              {event.name}
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#3B507D]" />
                {formatDate(event.date)}
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#3B507D]" />
                {formatTime(event.time)} WIB
              </div>

              <div className="flex min-w-0 items-center gap-1.5 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#3B507D]" />
                <span className="truncate">{event.venue}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#3B507D]" />
                <span className="truncate">{event.organizer}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-[#3B507D]" />
                {event.seat === 'General' ? 'General Admission' : `Kursi ${event.seat}`}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-[#E8E3D9] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#9B907F]">
                Harga
              </p>
              <p className="text-base font-bold text-[#112250]">
                {formatRupiah(event.price)}
              </p>
            </div>

            <span className="flex items-center gap-1 self-end rounded-lg bg-[#112250] px-3.5 py-2 text-xs font-semibold text-white group-hover:bg-[#3B507D]">
              Detail <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* =========================================================
   RECOMMENDATION CARD
   Wishlist sekarang mengirim user_id dan event_id.
========================================================= */

const RecommendationCard = ({ event, userId, onWishlistChange }) => {
  const [isWishlisted, setIsWishlisted] = useState(Boolean(event.isWishlisted));
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

    // Ambil ID user dari profil yang sudah di-fetch dari backend.
    const currentUserId = userId;

    // Ambil ID event dari data event asli.
    const currentEventId =
      event?.id ??
      event?.event_id;

    console.log('WISHLIST REQUEST:', {
      user_id: currentUserId,
      event_id: currentEventId,
      event,
    });

    if (!currentUserId) {
      window.alert('ID pengguna tidak ditemukan. Silakan login kembali.');
      return;
    }

    if (!currentEventId) {
      window.alert('ID event tidak ditemukan.');
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
            user_id: currentUserId,
            event_id: currentEventId,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Gagal menambahkan wishlist.');
        }

        if (data.success === false) {
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
    <div className="group relative flex w-[260px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#E8E3D9] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-40 overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/95 p-2 shadow-sm transition hover:scale-110 disabled:opacity-50"
          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
        >
          {wishlistLoading ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#112250]" />
          ) : (
            <Heart
              className={`h-4 w-4 ${
                isWishlisted
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-gray-400'
              }`}
            />
          )}
        </button>

        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/50 px-2 py-1 text-[9px] font-semibold text-white">
          {event.category || 'Event'}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col border-t border-dashed border-[#E8E3D9] p-4">
        <h4 className="truncate text-sm font-bold text-[#112250]">
          {event.name}
        </h4>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
          <Calendar className="h-3 w-3 text-[#3B507D]" />
          {formatDate(event.date)}
          <span>|</span>
          <Clock className="h-3 w-3 text-[#3B507D]" />
          {formatTime(event.time)}
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] text-gray-500">
          <MapPin className="h-3 w-3 flex-shrink-0 text-[#3B507D]" />
          <span className="truncate">{event.venue}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-[#9B907F]">
              Mulai dari
            </p>
            <p className="truncate text-sm font-bold text-[#112250]">
              {formatRupiah(event.price)}
            </p>
          </div>

          <Link
            href={`/cari-acara/${event.id}`}
            className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-[#112250] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3B507D]"
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
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);

  const activeBanners = banners;

  useEffect(() => {
    setActiveIndex(0);
  }, [banners]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[activeIndex];

  const navigateTo = (path) => {
    if (!path) return;

    if (/^https?:\/\//i.test(path)) {
      window.location.href = path;
      return;
    }

    router.push(path.startsWith('/') ? path : `/${path}`);
  };

  const changeSlide = (direction) => {
    if (!activeBanners.length) return;

    setActiveIndex((current) =>
      (current + direction + activeBanners.length) % activeBanners.length
    );
  };

  if (!currentBanner) {
    return (
      <div className="mb-6 flex min-h-[220px] items-center justify-center rounded-2xl bg-[#112250] px-6 text-center sm:mb-8 sm:min-h-[280px]">
        <div>
          <Sparkles className="mx-auto h-8 w-8 text-[#E5C27A]" />

          <h2 className="mt-3 text-2xl font-bold text-white">
            Selamat Datang di TicketVerse
          </h2>

          <p className="mt-2 text-sm text-white/70">
            Temukan dan nikmati event favoritmu.
          </p>

          <Link
            href="/events"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#112250]"
          >
            Jelajahi Event <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl sm:mb-8">
      <div
        className="relative h-64 overflow-hidden rounded-2xl shadow-lg sm:h-72 md:h-80 lg:h-96"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0].screenX;
        }}
        onTouchEnd={(e) => {
          const difference =
            touchStartX.current - e.changedTouches[0].screenX;

          if (Math.abs(difference) > 50) {
            changeSlide(difference > 0 ? 1 : -1);
          }
        }}
      >
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className="absolute inset-0"
            style={{
              transform: `translateX(${
                index === activeIndex
                  ? '0%'
                  : index < activeIndex
                    ? '-100%'
                    : '100%'
              })`,
              transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {banner.image && (
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#112250]/90 via-[#112250]/60 to-transparent" />

        <div
          key={currentBanner.id}
          className="relative z-20 flex h-full max-w-2xl flex-col justify-center px-5 sm:px-8 md:px-12"
        >
          <span className="mb-3 w-fit rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white">
            {currentBanner.subtitle}
          </span>

          <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {currentBanner.title}
          </h2>

          <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/80 sm:text-sm md:text-base">
            {currentBanner.description}
          </p>

          {currentBanner.button_text && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigateTo(currentBanner.button_link)}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-[#112250] hover:bg-[#E5C27A]"
              >
                {currentBanner.button_text}
                <ArrowRight className="h-4 w-4" />
              </button>

              {currentBanner.secondary_button_text && (
                <button
                  type="button"
                  onClick={() => navigateTo(currentBanner.secondary_button_link)}
                  className="rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  {currentBanner.secondary_button_text}
                </button>
              )}
            </div>
          )}
        </div>

        {activeBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Banner sebelumnya"
              className="absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white sm:block"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Banner selanjutnya"
              className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white sm:block"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
              {activeBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Pilih banner ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? 'w-8 bg-white'
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const NotificationItem = ({ notif }) => {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#3B507D]/15 bg-[#3B507D]/5 p-3">
      <div className="rounded-lg bg-white p-1.5 text-[#3B507D]">
        <Bell className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[#112250]">
          {notif.title || 'Notifikasi'}
        </p>

        <p className="break-words text-[11px] leading-relaxed text-gray-500">
          {notif.message || notif.description || ''}
        </p>

        <p className="mt-1 text-[10px] text-[#9B907F]">
          {formatDate(notif.created_at)}
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

  const fetchBanners = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/banners/home`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
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
            true, 1, '1', 'true', 'active', 'aktif', 'published',
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

        const profile = profileRes?.user || profileRes?.data?.user;

        if (!profileRes?.success || !profile) {
          throw new Error(
            profileRes?.message || 'Gagal mengambil profil pengguna.'
          );
        }

        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));

        const eventList = extractList(eventsRes, ['events']);
        const orderList = extractList(ordersRes, ['orders']);
        const ticketList = extractList(ticketsRes, ['tickets']);
        const paymentList = extractList(paymentsRes, ['payments']);

        setEvents(eventList);
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
          setError('Sebagian data dashboard gagal dimuat. Silakan coba kembali.');
        }
      } catch (err) {
        console.error('Dashboard error:', err);

        if (mounted) {
          setError(err.message || 'Gagal memuat dashboard.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [fetchWithAuth, router]);

  const activeTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        if (!isPaid(ticket.payment_status)) return false;

        if (!ticket.event_date) return true;

        const eventDate = new Date(ticket.event_date);

        return !Number.isNaN(eventDate.getTime()) &&
          eventDate.getTime() >= Date.now();
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

        return !Number.isNaN(eventDate.getTime()) &&
          eventDate.getTime() >= Date.now();
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
          venue: event.venue_name || event.venue || '-',
          date: event.event_date || event.date,
          time: event.event_time || event.time,
          price:
            Number(event.min_price) ||
            Number(event.price) ||
            Number(event.starting_price) ||
            0,
          image: getEventPoster(event),
          isWishlisted: Boolean(wishlistItem),
          wishlistId: wishlistItem?.id || wishlistItem?.wishlist_id || null,
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
          (ticket) => Number(ticket.order_id) === Number(order.id)
        );

        const relatedPayment = payments.find(
          (payment) => Number(payment.order_id) === Number(order.id)
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

  const handleWishlistChange = (eventId, isAdded, wishlistItem) => {
    setWishlist((current) => {
      if (isAdded) {
        const newWishlistId =
          wishlistItem?.id ??
          wishlistItem?.wishlist_id ??
          wishlistItem?.wishlist?.id ??
          null;

        return [
          ...current.filter(
            (item) => Number(item.event_id) !== Number(eventId)
          ),
          {
            ...(wishlistItem || {}),
            id: newWishlistId,
            event_id: eventId,
          },
        ];
      }

      return current.filter(
        (item) => Number(item.event_id) !== Number(eventId)
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
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[#3B507D]/15 border-t-[#3B507D]" />
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
            Profil tidak dapat dimuat. Silakan login kembali.
          </p>

          <Link
            href="/login"
            className="mt-3 inline-block text-sm font-semibold text-[#3B507D]"
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
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2.5 text-xl font-bold text-[#112250] sm:text-2xl lg:text-3xl">
            <span className="max-w-full truncate">
              Halo, {user.fullname || user.name || user.username || 'Member'}
            </span>

            <span className="rounded-md border border-[#E5C27A]/40 bg-[#E5C27A]/15 px-2.5 py-1 text-[10px] font-semibold text-[#112250]">
              {user.role === 'event_organizer'
                ? 'Organizer'
                : user.role === 'super_admin'
                  ? 'Super Admin'
                  : 'Member'}
            </span>
          </h2>

          <p className="mt-1 text-xs text-[#9B907F] sm:text-sm">
            Siap untuk menemukan konser impianmu selanjutnya?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#E5C27A]/40 bg-[#E5C27A]/10 px-3 py-2 text-xs font-medium text-[#112250]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            Member TicketVerse
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-[#E8E3D9] bg-white px-3 py-2 text-xs text-[#9B907F]">
            <Sparkles className="h-3 w-3 text-amber-400" />
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
              <Ticket className="h-5 w-5 text-[#3B507D]" />
              Tiket Saya
            </h3>

            <p className="mt-0.5 text-xs text-[#9B907F]">
              Tiket konser yang sudah dikonfirmasi
            </p>
          </div>

          <Link
            href="/tickets"
            className="flex items-center gap-1 self-start text-xs font-medium text-[#3B507D] hover:text-[#112250]"
          >
            Lihat semua <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          {activeTickets.slice(0, 2).map((event) => (
            <TicketCard key={event.id} event={event} />
          ))}

          {activeTickets.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E8E3D9] bg-white py-12 text-center xl:col-span-2">
              <Ticket className="mx-auto h-8 w-8 text-[#D8D0C4]" />

              <p className="mt-3 text-sm font-semibold text-[#112250]">
                Belum ada tiket aktif
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Yuk, cari konser dan beli tiket sekarang!
              </p>

              <Link
                href="/events"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#112250] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3B507D]"
              >
                Jelajahi Event <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:mb-8 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-1">
          <div className="rounded-2xl border border-[#E8E3D9] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#112250]">
                <Bell className="h-4.5 w-4.5 text-[#3B507D]" />
                Notifikasi
              </h3>

              <Link
                href="/notifications"
                className="whitespace-nowrap text-[10px] font-medium text-[#3B507D]"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="max-h-[300px] space-y-2.5 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <NotificationItem key={notif.id} notif={notif} />
              ))}

              {notifications.length === 0 && (
                <div className="py-8 text-center">
                  <Bell className="mx-auto h-7 w-7 text-[#D8D0C4]" />
                  <p className="mt-2 text-xs text-gray-500">
                    Belum ada notifikasi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 xl:col-span-2">
          <div className="min-w-0 rounded-2xl border border-[#E8E3D9] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-[#112250]">
                <Sparkles className="h-4.5 w-4.5 flex-shrink-0 text-amber-500" />
                <span className="truncate">Rekomendasi Untukmu</span>
              </h3>

              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollLeft}
                  aria-label="Geser kiri"
                  className="rounded-full bg-[#112250]/5 p-1.5 text-[#112250] hover:bg-[#112250]/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollRight}
                  aria-label="Geser kanan"
                  className="rounded-full bg-[#112250]/5 p-1.5 text-[#112250] hover:bg-[#112250]/10"
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
                <div className="w-full py-8 text-center text-sm text-gray-500">
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
            <History className="h-5 w-5 text-[#3B507D]" />
            Riwayat Pemesanan
          </h3>

          <Link
            href="/history"
            className="whitespace-nowrap text-xs font-medium text-[#3B507D]"
          >
            Lihat semua
          </Link>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8E3D9] bg-white p-4 shadow-sm sm:p-6">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[600px] divide-y divide-[#E8E3D9]">
              <thead>
                <tr>
                  {['Event', 'Tanggal', 'Tiket', 'Total', 'Status'].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9B907F]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-[#F7F8FA]">
                    <td className="max-w-[180px] truncate px-3 py-3 text-sm font-medium text-[#112250]">
                      {booking.event_name}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">
                      {formatDate(booking.event_date)}
                    </td>

                    <td className="px-3 py-3 text-xs text-gray-500">
                      {booking.quantity}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-[#112250]">
                      {formatRupiah(booking.total)}
                    </td>

                    <td className="px-3 py-3 text-xs">
                      <span
                        className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : booking.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
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
                      <History className="mx-auto h-7 w-7 text-[#D8D0C4]" />
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

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <div className="rounded-2xl border border-[#E8E3D9] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#112250]">
                  Informasi Akun
                </h3>

                <p className="mt-1 text-xs text-[#9B907F]">
                  Data profil yang tersimpan di akunmu
                </p>
              </div>

              <User className="h-6 w-6 text-[#3B507D]" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#F7F8FA] p-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#9B907F]">Email</p>
                  <p className="truncate text-xs font-medium text-[#112250]">
                    {user.email || 'Belum diisi'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#F7F8FA] p-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#9B907F]">Nomor HP</p>
                  <p className="truncate text-xs font-medium text-[#112250]">
                    {user.phone || 'Belum diisi'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#F7F8FA] p-3">
                <User className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#9B907F]">Jenis Kelamin</p>
                  <p className="truncate text-xs font-medium text-[#112250]">
                    {user.gender || 'Belum diisi'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#F7F8FA] p-3">
                <Calendar className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#9B907F]">Tanggal Bergabung</p>
                  <p className="truncate text-xs font-medium text-[#112250]">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/profile"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#112250] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3B507D]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profil
            </Link>
          </div>
        </div>

        <div className="min-w-0 xl:col-span-1">
          <div className="rounded-2xl border border-[#E8E3D9] bg-white p-5 text-center shadow-sm sm:p-6 xl:sticky xl:top-24">
            <div className="relative inline-block">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-[#F0F1F4] ring-4 ring-[#E5C27A]/30 sm:h-24 sm:w-24">
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
                    <User className="h-10 w-10 text-[#AAB0BD]" />
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>

            <h3 className="mt-4 truncate text-lg font-bold text-[#112250]">
              {user.fullname || user.name || user.username || 'Member'}
            </h3>

            <p className="text-xs text-[#9B907F]">
              Member sejak{' '}
              {user.created_at
                ? new Date(user.created_at).getFullYear()
                : '-'}
            </p>

            <div className="mt-4 space-y-2 border-t border-[#E8E3D9] pt-4">
              <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#F7F8FA] p-2.5 text-left">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <span className="truncate text-xs text-gray-600">
                  {user.email || 'Belum diisi'}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#F7F8FA] p-2.5 text-left">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <span className="truncate text-xs text-gray-600">
                  {user.phone || 'Belum diisi'}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-lg bg-[#F7F8FA] p-2.5 text-left">
                <User className="h-4 w-4 flex-shrink-0 text-[#3B507D]" />
                <span className="truncate text-xs text-gray-600">
                  {user.gender || 'Belum diisi'}
                </span>
              </div>
            </div>

            <Link
              href="/profile"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#112250] py-2.5 text-sm font-semibold text-white transition hover:bg-[#3B507D]"
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

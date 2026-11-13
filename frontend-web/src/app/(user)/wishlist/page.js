'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Search,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Music,
  ArrowRight,
  Ticket,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles,
  Bookmark,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '';
  }
  const path = imagePath.trim();
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

const formatDate = (date) => {
  if (!date) return 'Tanggal belum tersedia';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Tanggal belum tersedia';
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
};

const formatShortDate = (date) => {
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

const formatTime = (time) => {
  if (!time) return '-';
  return String(time).slice(0, 5);
};

function EventPoster({ poster, name }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [poster]);

  if (!poster || failed) {
    return (
      <div className="flex h-full min-h-48 w-full items-center justify-center bg-gradient-to-br from-[#0D1F42] to-[#112250] text-white/30">
        <Music className="h-12 w-12" />
      </div>
    );
  }

  return (
    <img
      src={poster}
      alt={name || 'Poster event'}
      className="h-full min-h-48 w-full object-cover transition duration-700 group-hover:scale-110"
      onError={() => setFailed(true)}
    />
  );
}

export default function WishlistPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('token');
    let storedUser;

    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      storedUser = null;
    }

    if (!token || !storedUser?.id) {
      router.replace('/login');
      return;
    }

    setUser(storedUser);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/wishlist/user/${storedUser.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengambil wishlist');
      }

      setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
    } catch (fetchError) {
      console.error('GET WISHLIST ERROR:', fetchError);
      setError(fetchError.message || 'Gagal mengambil data wishlist');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const filteredWishlist = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return wishlist;

    return wishlist.filter((item) => {
      const searchable = [
        item.event_name,
        item.artist_name,
        item.venue_name,
        item.city,
        item.category_name,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [wishlist, search]);

  const handleDelete = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const confirmed = window.confirm(
      `Hapus "${item.event_name || 'event ini'}" dari wishlist?`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`${API_BASE}/api/wishlist/${item.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus wishlist');
      }

      setWishlist((current) => current.filter((wishlistItem) => wishlistItem.id !== item.id));
      setNotice('Event berhasil dihapus dari wishlist.');
    } catch (deleteError) {
      console.error('DELETE WISHLIST ERROR:', deleteError);
      setError(deleteError.message || 'Gagal menghapus wishlist');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#DDE4ED] bg-white shadow-[0_10px_30px_rgba(17,34,80,0.1)]">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-[#112250] opacity-10"></div>
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#112250]/10 border-t-[#112250]" />
          </div>
          <h2 className="mt-6 text-lg font-bold text-[#112250]">Memuat wishlist...</h2>
          <p className="mt-1 text-sm text-slate-500">Mengambil data event favorit Anda.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-12 text-[#112250]">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0D1F42] via-[#112250] to-[#1A326A] shadow-[0_20px_50px_-15px_rgba(17,34,80,0.3)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-16 bottom-[-100px] h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative w-full px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-300 backdrop-blur-md">
                <Heart size={13} className="fill-rose-300" />
                Koleksi Pribadi
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Wishlist Saya
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100/80">
                Simpan event favoritmu dan temukan kembali saat ingin membeli tiket.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md">
                <Heart className="h-4 w-4 text-rose-300 fill-rose-300" />
                <span>{wishlist.length} Event Tersimpan</span>
              </div>
              <Link
                href="/cari-acara"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#112250] shadow-[0_0_20px_rgba(255,255,255,0.2)] transition hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              >
                <Ticket className="h-4 w-4" />
                Jelajahi Event
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Heart size={22} />}
          label="Total Wishlist"
          value={wishlist.length}
          description="Event tersimpan"
          className="bg-rose-50 text-rose-500"
          accentColor="bg-rose-400"
        />
        <StatCard
          icon={<Search size={22} />}
          label="Hasil Pencarian"
          value={filteredWishlist.length}
          description="Event ditemukan"
          className="bg-blue-50 text-blue-600"
          accentColor="bg-blue-400"
        />
        <StatCard
          icon={<Bookmark size={22} />}
          label="Pengguna"
          value={user.fullname || user.name || 'Member'}
          description="Akun aktif"
          className="bg-emerald-50 text-emerald-600"
          accentColor="bg-emerald-400"
          isText
        />
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="min-w-0 flex-1">{error}</div>
          <button type="button" onClick={() => setError('')} className="flex-shrink-0 rounded-lg p-1 hover:bg-red-100" aria-label="Tutup pesan error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 shadow-sm">
          <CheckCircleIcon />
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="flex-shrink-0 rounded-lg p-1 hover:bg-emerald-100" aria-label="Tutup notifikasi">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-[20px] border border-[#DDE4ED] bg-white p-4 shadow-[0_8px_30px_rgba(17,34,80,0.04)] sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama event, artis, kategori, atau venue..."
            className="w-full rounded-xl border border-[#DDE4ED] bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm font-medium text-[#112250] outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
          />
        </div>
        <button
          type="button"
          onClick={fetchWishlist}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] bg-white px-5 py-3.5 text-sm font-bold text-[#526B92] shadow-sm transition hover:border-[#112250] hover:bg-[#112250] hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Muat Ulang
        </button>
      </div>

      {filteredWishlist.length === 0 ? (
        <div className="rounded-[24px] border border-[#DDE4ED] bg-white px-6 py-20 text-center shadow-[0_8px_30px_rgba(17,34,80,0.04)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-400 ring-4 ring-white shadow-inner">
            <Heart className="h-9 w-9" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-[#112250]">
            {search ? 'Event tidak ditemukan' : 'Wishlist kamu masih kosong'}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            {search
              ? 'Coba kata kunci lain untuk menemukan event favoritmu.'
              : 'Tambahkan event favorit dari halaman event agar mudah ditemukan kembali.'}
          </p>
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#DDE4ED] bg-white px-6 py-3.5 text-sm font-bold text-[#112250] transition hover:bg-slate-50"
            >
              Hapus Pencarian
            </button>
          ) : (
            <Link
              href="/cari-acara"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#112250]/20 transition hover:-translate-y-0.5 hover:bg-[#1A326A]"
            >
              <Ticket className="h-4 w-4" />
              Cari Event
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWishlist.map((item) => {
            const poster = getImageUrl(item.poster);

            return (
              <article
                key={item.id}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#112250]/20 hover:shadow-[0_20px_50px_-10px_rgba(17,34,80,0.12)]"
              >
                <Link href={`/cari-acara/${item.event_id}`} className="relative block h-56 overflow-hidden bg-slate-100">
                  <EventPoster poster={poster} name={item.event_name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07162F]/90 via-[#07162F]/20 to-transparent" />
                  
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#112250] shadow-sm backdrop-blur-md">
                    {item.category_name || 'Event'}
                  </span>
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-[#112250]/80 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                    {item.status || 'Tersedia'}
                  </span>

                  <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#112250] opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-6">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold text-[#112250]">
                      {item.event_name || 'Event tanpa nama'}
                    </h2>
                    <p className="mt-1 truncate text-sm font-medium text-[#526B92]">
                      {item.artist_name || 'Artis belum tersedia'}
                    </p>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#112250]">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="truncate">{formatShortDate(item.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#112250]">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span>{formatTime(item.event_time)} WIB</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#112250]">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="truncate">
                          {[item.venue_name, item.city].filter(Boolean).join(', ') || 'Lokasi belum tersedia'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <Link
                      href={`/cari-acara/${item.event_id}`}
                      className="group/btn relative flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#112250] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1A326A]"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        Lihat Event
                        <ChevronRight className="h-4 w-4 transition group-hover/btn:translate-x-0.5" />
                      </span>
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      aria-label={`Hapus ${item.event_name} dari wishlist`}
                      title="Hapus dari wishlist"
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Ditambahkan {formatDate(item.created_at)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, description, className, accentColor, isText = false }) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#DDE4ED] bg-white p-5 shadow-[0_4px_20px_rgba(17,34,80,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(17,34,80,0.08)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentColor} opacity-0 transition duration-300 group-hover:opacity-100`} />
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}>
          {icon}
        </div>
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 font-black tracking-tight text-[#112250] ${isText ? 'truncate text-xl' : 'text-3xl'}`}>
        {value}
      </p>
      <p className="mt-2 text-[11px] font-medium text-slate-400">{description}</p>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
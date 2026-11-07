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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  if (Number.isNaN(parsed.getTime())) {
    return 'Tanggal belum tersedia';
  }

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
      <div className="flex h-full min-h-48 w-full items-center justify-center bg-gradient-to-br from-[#112250] via-[#3B507D] to-[#112250] text-white/40">
        <Music className="h-12 w-12" />
      </div>
    );
  }

  return (
    <img
      src={poster}
      alt={name || 'Poster event'}
      className="h-full min-h-48 w-full object-cover transition duration-500 group-hover:scale-105"
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
      const response = await fetch(
        `${API_BASE}/api/wishlist/user/${storedUser.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );

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
      const response = await fetch(
        `${API_BASE}/api/wishlist/${item.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      setWishlist((current) =>
        current.filter((wishlistItem) => wishlistItem.id !== item.id)
      );

      setNotice('Event berhasil dihapus dari wishlist.');
    } catch (deleteError) {
      console.error('DELETE WISHLIST ERROR:', deleteError);
      setError(deleteError.message || 'Gagal menghapus wishlist');
    } finally {
      setDeletingId(null);
    }
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#112250]/10 border-t-[#112250]" />
          </div>
          <h2 className="mt-4 text-base font-bold text-[#14213D]">
            Memuat wishlist...
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Mengambil data event favorit Anda.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full min-w-0">

      {/* HEADER HALAMAN */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm mb-6">
        <div className="relative w-full px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              
              <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                Wishlist Saya
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Simpan event favoritmu dan temukan kembali saat ingin membeli tiket.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#112250]/10 bg-[#112250]/5 px-3 py-2 text-xs font-bold text-[#112250]">
                <Heart className="h-4 w-4" />
                <span>{wishlist.length} event tersimpan</span>
              </div>
              <Link
                href="/cari-acara"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1A326A]"
              >
                <Ticket className="h-4 w-4" />
                Jelajahi Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
            <Heart className="h-5 w-5 fill-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Wishlist
            </p>
            <p className="mt-0.5 text-xl font-black text-[#14213D]">
              {wishlist.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hasil Pencarian
            </p>
            <p className="mt-0.5 text-xl font-black text-[#14213D]">
              {filteredWishlist.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Bookmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pengguna
            </p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#14213D]">
              {user.fullname || user.name || 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* NOTICES */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="min-w-0 flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError('')}
            className="flex-shrink-0"
            aria-label="Tutup pesan error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 shadow-sm">
          <Heart className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="flex-shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama event, artis, kategori, atau venue..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
          />
        </div>

        <button
          type="button"
          onClick={fetchWishlist}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
        >
          <RefreshCw className="h-4 w-4" />
          Muat Ulang
        </button>
      </div>

      {/* WISHLIST GRID */}
      {filteredWishlist.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
            <Heart className="h-8 w-8" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#14213D]">
            {search ? 'Event tidak ditemukan' : 'Wishlist kamu masih kosong'}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {search
              ? 'Coba kata kunci lain untuk menemukan event favoritmu.'
              : 'Tambahkan event favorit dari halaman event agar mudah ditemukan kembali.'}
          </p>

          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-[#14213D] transition hover:bg-slate-50"
            >
              Hapus Pencarian
            </button>
          ) : (
            <Link
              href="/cari-acara"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A] hover:-translate-y-0.5"
            >
              <Ticket className="h-4 w-4" />
              Cari Event
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWishlist.map((item) => {
            const poster = getImageUrl(item.poster);

            return (
              <article
                key={item.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#112250]/20 hover:shadow-lg"
              >
                {/* POSTER */}
                <Link
                  href={`/cari-acara/${item.event_id}`}
                  className="relative block h-48 overflow-hidden bg-slate-100"
                >
                  <EventPoster poster={poster} name={item.event_name} />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {item.category_name || 'Event'}
                  </span>

                  <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#112250]">
                    {item.status || 'Tersedia'}
                  </span>

                  <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>

                {/* DETAILS */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold text-[#14213D]">
                      {item.event_name || 'Event tanpa nama'}
                    </h2>

                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                      {item.artist_name || 'Artis belum tersedia'}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-[#112250]" />
                        <span className="truncate">
                          {formatShortDate(item.event_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Clock className="h-4 w-4 flex-shrink-0 text-[#112250]" />
                        <span>{formatTime(item.event_time)} WIB</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-[#112250]" />
                        <span className="truncate">
                          {[item.venue_name, item.city]
                            .filter(Boolean)
                            .join(', ') || 'Lokasi belum tersedia'}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Link
                      href={`/cari-acara/${item.event_id}`}
                      className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#112250] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#1A326A]"
                    >
                      Lihat Event
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      aria-label={`Hapus ${item.event_name} dari wishlist`}
                      title="Hapus dari wishlist"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-3 text-[10px] font-medium text-slate-400">
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
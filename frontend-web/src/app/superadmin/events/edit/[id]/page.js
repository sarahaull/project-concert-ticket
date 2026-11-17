
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  InformationCircleIcon,
  SparklesIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  PhotoIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const API_BASE = API_URL.endsWith('/api')
  ? API_URL
  : `${API_URL}/api`;

const getToken = () => {
  if (typeof window === 'undefined') return '';

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    ''
  );
};

const getHeaders = (withJson = true) => {
  const token = getToken();

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (withJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(!(options.body instanceof FormData)),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
      result.error ||
      `Request gagal dengan status ${response.status}`
    );
  }

  return result;
};

const getList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  if (Array.isArray(result?.data)) return result.data;

  return [];
};

const getDateValue = (value) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDateTimeValue = (value) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getTimeValue = (value) => {
  if (!value) return '';

  return String(value).slice(0, 5);
};

const getOptionId = (item) =>
  item?.id ??
  item?.category_id ??
  item?.artist_id ??
  item?.venue_id ??
  '';

const getOptionName = (item) =>
  item?.category_name ??
  item?.artist_name ??
  item?.venue_name ??
  item?.name ??
  item?.title ??
  '';

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const inputClass =
  'w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all';

const labelClass =
  'block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');

  useEffect(() => {
    if (!id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [eventResult, categoryResult, artistResult, venueResult] =
          await Promise.all([
            request(`${API_BASE}/events/${id}`),
            request(`${API_BASE}/categories`).catch(() => null),
            request(`${API_BASE}/artists`).catch(() => null),
            request(`${API_BASE}/venues`).catch(() => null),
          ]);

        if (!active) return;

        const event = eventResult.event || eventResult.data?.event || eventResult.data;

        if (!event) {
          throw new Error('Data event tidak ditemukan.');
        }

        setCategories(
          getList(categoryResult, ['categories', 'data'])
        );

        setArtists(
          getList(artistResult, ['artists', 'data'])
        );

        setVenues(
          getList(venueResult, ['venues', 'data'])
        );

        setForm({
          event_name: event.event_name || '',
          category_id: String(event.category_id || ''),
          artist_id: String(event.artist_id || ''),
          venue_id: String(event.venue_id || ''),
          description: event.description || '',
          event_date: getDateValue(event.event_date),
          event_time: getTimeValue(event.event_time),
          end_time: getTimeValue(event.end_time),
          ticket_sale_start: getDateTimeValue(event.ticket_sale_start),
          ticket_sale_end: getDateTimeValue(event.ticket_sale_end),
          status: event.status || '',
          poster: event.poster || '',
        });

        setPosterPreview(event.poster || '');
      } catch (err) {
        if (active) {
          setError(err.message || 'Gagal mengambil data event.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Format poster harus JPG, JPEG, PNG, atau WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran poster maksimal 5 MB.');
      e.target.value = '';
      return;
    }

    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setError('');
  };

  const uploadPoster = async () => {
    if (!posterFile) {
      return form.poster;
    }

    const formData = new FormData();

    formData.append('event_id', String(id));
    formData.append('poster', posterFile);

    const result = await request(`${API_BASE}/uploads/event-poster`, {
      method: 'POST',
      body: formData,
    });

    const posterUrl =
      result.poster ||
      result.file?.path ||
      result.file?.url;

    if (!posterUrl) {
      throw new Error(
        'Upload poster berhasil diproses, tetapi URL poster tidak ditemukan pada respons backend.'
      );
    }

    return posterUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.event_name.trim()) {
      setError('Nama event wajib diisi.');
      return;
    }

    if (!form.category_id) {
      setError('Silakan pilih kategori event.');
      return;
    }

    if (!form.artist_id) {
      setError('Silakan pilih artis.');
      return;
    }

    if (!form.venue_id) {
      setError('Silakan pilih venue.');
      return;
    }

    if (!form.event_date) {
      setError('Tanggal event wajib diisi.');
      return;
    }

    if (!form.event_time) {
      setError('Waktu mulai event wajib diisi.');
      return;
    }

    if (
      form.ticket_sale_start &&
      form.ticket_sale_end &&
      new Date(form.ticket_sale_start) > new Date(form.ticket_sale_end)
    ) {
      setError('Waktu akhir penjualan tiket tidak boleh sebelum waktu mulai.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const poster = await uploadPoster();

      const payload = {
        event_name: form.event_name.trim(),
        category_id: Number(form.category_id),
        artist_id: Number(form.artist_id),
        venue_id: Number(form.venue_id),
        description: form.description,
        poster: poster || null,
        event_date: form.event_date,
        event_time: form.event_time,
        end_time: form.end_time || null,
        ticket_sale_start: form.ticket_sale_start
          ? new Date(form.ticket_sale_start).toISOString()
          : null,
        ticket_sale_end: form.ticket_sale_end
          ? new Date(form.ticket_sale_end).toISOString()
          : null,
        status: form.status,
      };

      await request(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSuccess('Event berhasil diperbarui.');

      setTimeout(() => {
        router.push('/superadmin/events');
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perubahan event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(
    (item) => String(getOptionId(item)) === String(form?.category_id)
  );

  const selectedArtist = artists.find(
    (item) => String(getOptionId(item)) === String(form?.artist_id)
  );

  const selectedVenue = venues.find(
    (item) => String(getOptionId(item)) === String(form?.venue_id)
  );

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#e0e8f0] border-t-[#8ab4f8] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#7e91b2]">
          Memuat data event dari server...
        </p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="w-full rounded-2xl border border-red-100 bg-white p-8 text-center">
        <InformationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#0a1628]">
          Data Event Tidak Ditemukan
        </h2>
        <p className="text-sm text-red-500 mt-2">
          {error || 'Event tidak tersedia atau gagal dimuat.'}
        </p>
        <Link
          href="/superadmin/events"
          className="inline-flex mt-5 px-5 py-3 rounded-xl bg-[#0a1628] text-white text-sm font-semibold"
        >
          Kembali ke Daftar Event
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link
              href="/superadmin/events"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Daftar Event
            </Link>

            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white flex items-center gap-3">
              <PencilSquareIcon className="w-8 h-8 text-[#8ab4f8]" />
              Edit Informasi Event
            </h1>

            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Perbarui informasi event melalui data yang tersimpan di database.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg">
            ID Event:{' '}
            <span className="text-[#8ab4f8]">
              #{String(id).padStart(4, '0')}
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <InformationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#0a1628] mb-1">
                  Informasi Utama
                </h2>
                <p className="text-xs text-[#7e91b2]">
                  Informasi dasar mengenai event yang diselenggarakan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Nama Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="event_name"
                    value={form.event_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Masukkan nama event"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Kategori Event <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2] pointer-events-none" />
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-10 cursor-pointer`}
                      required
                    >
                      <option value="">Pilih kategori</option>

                      {form.category_id && !selectedCategory && (
                        <option value={form.category_id}>
                          Kategori saat ini (ID: {form.category_id})
                        </option>
                      )}

                      {categories.map((item) => (
                        <option
                          key={getOptionId(item)}
                          value={getOptionId(item)}
                        >
                          {getOptionName(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Artis <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2] pointer-events-none" />
                    <select
                      name="artist_id"
                      value={form.artist_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-10 cursor-pointer`}
                      required
                    >
                      <option value="">Pilih artis</option>

                      {form.artist_id && !selectedArtist && (
                        <option value={form.artist_id}>
                          Artis saat ini (ID: {form.artist_id})
                        </option>
                      )}

                      {artists.map((item) => (
                        <option
                          key={getOptionId(item)}
                          value={getOptionId(item)}
                        >
                          {getOptionName(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Venue / Lokasi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2] pointer-events-none" />
                    <select
                      name="venue_id"
                      value={form.venue_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-10 cursor-pointer`}
                      required
                    >
                      <option value="">Pilih venue</option>

                      {form.venue_id && !selectedVenue && (
                        <option value={form.venue_id}>
                          Venue saat ini (ID: {form.venue_id})
                        </option>
                      )}

                      {venues.map((item) => (
                        <option
                          key={getOptionId(item)}
                          value={getOptionId(item)}
                        >
                          {getOptionName(item)}
                          {item.city ? ` - ${item.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Deskripsi Event</label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-4 w-5 h-5 text-[#7e91b2]" />
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      className={`${inputClass} pl-10 resize-y`}
                      placeholder="Masukkan deskripsi event..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e0e8f0] pt-6">
                <h2 className="text-sm font-bold text-[#0a1628] mb-1">
                  Poster Event
                </h2>
                <p className="text-xs text-[#7e91b2] mb-4">
                  Unggah poster baru jika ingin mengganti poster saat ini.
                </p>

                <label className={labelClass}>Upload Poster</label>

                <label className="flex flex-col items-center justify-center w-full min-h-40 border-2 border-dashed border-[#d0d8e4] rounded-xl bg-[#f8fafc] hover:bg-[#f0f5fc] cursor-pointer transition-colors overflow-hidden">
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Preview poster event"
                      className="max-h-72 w-auto object-contain p-3"
                    />
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <PhotoIcon className="w-10 h-10 text-[#8aa0c0] mb-2" />
                      <span className="text-sm font-semibold text-[#0a1628]">
                        Pilih poster event
                      </span>
                      <span className="text-xs text-[#7e91b2] mt-1">
                        JPG, PNG, WEBP (maksimal 5 MB)
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>

                {posterFile && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Poster baru: {posterFile.name}
                  </p>
                )}
              </div>

              <div className="border-t border-[#e0e8f0] pt-6">
                <h2 className="text-sm font-bold text-[#0a1628] mb-1">
                  Jadwal Event
                </h2>
                <p className="text-xs text-[#7e91b2] mb-5">
                  Atur tanggal dan waktu penyelenggaraan acara.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Tanggal Event <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2]" />
                      <input
                        type="date"
                        name="event_date"
                        value={form.event_date}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Waktu Mulai <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2]" />
                      <input
                        type="time"
                        name="event_time"
                        value={form.event_time}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Waktu Selesai</label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2]" />
                      <input
                        type="time"
                        name="end_time"
                        value={form.end_time}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e0e8f0] pt-6">
                <h2 className="text-sm font-bold text-[#0a1628] mb-1">
                  Periode Penjualan Tiket
                </h2>
                <p className="text-xs text-[#7e91b2] mb-5">
                  Tentukan kapan penjualan tiket dibuka dan ditutup.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Penjualan Dibuka</label>
                    <input
                      type="datetime-local"
                      name="ticket_sale_start"
                      value={form.ticket_sale_start}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Penjualan Ditutup</label>
                    <input
                      type="datetime-local"
                      name="ticket_sale_end"
                      value={form.ticket_sale_end}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e0e8f0] pt-6">
                <label className={labelClass}>Status Event</label>
                <input
                  type="text"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Contoh: Available"
                />
                <p className="text-[11px] text-[#7e91b2] mt-2">
                  Isi sesuai nilai status yang digunakan backend, misalnya
                  Available atau Limited.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-[#e0e8f0]">
                <button
                  type="button"
                  onClick={() => router.push('/superadmin/events')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#f0f5fc] border border-[#d0d8e4] text-[#0a1628] text-sm font-semibold hover:bg-[#e0e8f0] transition-colors disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold hover:shadow-[0_8px_25px_rgba(10,22,40,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />

            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
                <InformationCircleIcon className="w-6 h-6 text-[#8ab4f8]" />
              </div>

              <h3 className="text-sm font-bold text-white mb-2">
                Catatan Edit Event
              </h3>

              <ul className="text-[11px] text-[#8aa0c0] space-y-4 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>
                    Perubahan informasi event akan dikirim ke backend dan
                    disimpan ke database.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>
                    Pastikan kategori, artis, dan venue sudah sesuai dengan
                    penyelenggaraan event.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>
                    Perubahan status harus menggunakan nilai yang diterima
                    oleh backend.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>
                    Poster baru akan diunggah terlebih dahulu sebelum
                    informasi event diperbarui.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-[#0a1628] mb-3 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              Ringkasan Event
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#7e91b2]">
                  Nama Event
                </p>
                <p className="text-sm font-semibold text-[#0a1628] mt-1">
                  {form.event_name || '-'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#7e91b2]">
                  Kategori
                </p>
                <p className="text-sm font-semibold text-[#0a1628] mt-1">
                  {getOptionName(selectedCategory) || 'Belum tersedia'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#7e91b2]">
                  Artis
                </p>
                <p className="text-sm font-semibold text-[#0a1628] mt-1">
                  {getOptionName(selectedArtist) || 'Belum tersedia'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#7e91b2]">
                  Venue
                </p>
                <p className="text-sm font-semibold text-[#0a1628] mt-1">
                  {getOptionName(selectedVenue) || 'Belum tersedia'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#7e91b2]">
                  Status
                </p>
                <p className="text-sm font-semibold text-[#0a1628] mt-1">
                  {form.status || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-[#0a1628] mb-3 flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-[#5a8ad0]" />
              Informasi Tiket
            </h3>

            <p className="text-xs text-[#7e91b2] leading-relaxed">
              Harga tiket, kuota, dan sisa tiket dikelola melalui data kategori
              tiket pada tabel ticket_categories. Bagian tersebut tidak
              diubah melalui form informasi event ini.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeInUp 0.6s ease both;
        }
      `}</style>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  X,
  CalendarDays,
  Clock3,
  MapPin,
  Music,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* =========================================================
   API CONFIGURATION
========================================================= */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_ROOT = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");
const API_BASE = `${API_ROOT}/api`;

// Sesuaikan dengan endpoint upload yang tersedia di backend.
const UPLOAD_POSTER_ENDPOINT = `${API_BASE}/uploads/event-poster`;

const ALLOWED_STATUSES = [
  "Coming Soon",
  "Available",
  "Limited",
  "Sold Out",
];

const INITIAL_FORM = {
  category_id: "",
  artist_id: "",
  venue_id: "",
  event_name: "",
  description: "",
  poster: "",
  event_date: "",
  event_time: "",
  ticket_sale_start: "",
  ticket_sale_end: "",
  status: "Coming Soon",
};

/* =========================================================
   HELPERS
========================================================= */

const getToken = () => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!data) {
    throw new Error("Response backend tidak valid.");
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        data.error ||
        `Request gagal dengan status ${response.status}.`
    );
  }

  return data;
};

const getErrorMessage = (error) =>
  error?.message || "Terjadi kesalahan pada server.";

const getList = (data, key) => {
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data?.[key])) return data.data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getImageUrl = (path) => {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ROOT}/${String(path).replace(/^\/+/, "")}`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TambahEventPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);

  const [posterMode, setPosterMode] = useState("file");
  const [posterPreview, setPosterPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState(INITIAL_FORM);

  /* =========================================================
     LOAD MASTER DATA
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadMasterData = async () => {
      try {
        setLoadingData(true);

        const endpoints = [
          `${API_BASE}/categories`,
          `${API_BASE}/artists`,
          `${API_BASE}/venues`,
        ];

        const responses = await Promise.all(
          endpoints.map((url) =>
            fetch(url, {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              cache: "no-store",
            })
          )
        );

        const [categoryData, artistData, venueData] =
          await Promise.all(responses.map(parseResponse));

        if (!mounted) return;

        setCategories(getList(categoryData, "categories"));
        setArtists(getList(artistData, "artists"));
        setVenues(getList(venueData, "venues"));
      } catch (error) {
        console.error("LOAD MASTER DATA ERROR:", error);

        if (mounted) {
          setNotification({
            type: "error",
            message: getErrorMessage(error),
          });
        }
      } finally {
        if (mounted) {
          setLoadingData(false);
        }
      }
    };

    loadMasterData();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     CLEANUP PREVIEW URL
  ========================================================= */

  useEffect(() => {
    return () => {
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
      }
    };
  }, [posterPreview]);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (notification.message) {
      setNotification({
        type: "",
        message: "",
      });
    }
  };

  /* =========================================================
     POSTER MODE
  ========================================================= */

  const handlePosterMode = (mode) => {
    setPosterMode(mode);
    setSelectedFile(null);
    setPosterPreview("");

    setForm((previous) => ({
      ...previous,
      poster: "",
    }));

    setNotification({
      type: "",
      message: "",
    });
  };

  /* =========================================================
     SELECT POSTER
  ========================================================= */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setNotification({
        type: "error",
        message: "Format poster harus JPG, JPEG, PNG, atau WEBP.",
      });

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: "error",
        message: "Ukuran poster maksimal 5 MB.",
      });

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    setPosterPreview((previousPreview) => {
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview);
      }

      return URL.createObjectURL(file);
    });

    setForm((previous) => ({
      ...previous,
      poster: "",
    }));

    setNotification({
      type: "",
      message: "",
    });

    // Memungkinkan file yang sama dipilih kembali.
    event.target.value = "";
  };

  /* =========================================================
     REMOVE POSTER
  ========================================================= */

  const removePoster = () => {
    setSelectedFile(null);
    setPosterPreview("");

    setForm((previous) => ({
      ...previous,
      poster: "",
    }));
  };

  /* =========================================================
     UPLOAD POSTER
  ========================================================= */

  const uploadPoster = async (token) => {
    if (!selectedFile) {
      throw new Error("Silakan pilih file poster terlebih dahulu.");
    }

    const formData = new FormData();
    formData.append("poster", selectedFile);

    const response = await fetch(UPLOAD_POSTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await parseResponse(response);

    const posterPath =
      data.poster ||
      data.path ||
      data.url ||
      data.file?.path ||
      data.file?.url ||
      "";

    if (!posterPath) {
      throw new Error(
        "Upload berhasil, tetapi path poster tidak ditemukan dari backend."
      );
    }

    return posterPath;
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!form.category_id) {
      return "Kategori event wajib dipilih.";
    }

    if (!form.artist_id) {
      return "Artis wajib dipilih.";
    }

    if (!form.venue_id) {
      return "Venue wajib dipilih.";
    }

    if (!form.event_name.trim()) {
      return "Nama event wajib diisi.";
    }

    if (!form.event_date) {
      return "Tanggal event wajib diisi.";
    }

    if (!form.event_time) {
      return "Waktu event wajib diisi.";
    }

    if (!form.ticket_sale_start) {
      return "Tanggal mulai penjualan tiket wajib diisi.";
    }

    if (!form.ticket_sale_end) {
      return "Tanggal akhir penjualan tiket wajib diisi.";
    }

    if (
      form.ticket_sale_start >= form.ticket_sale_end
    ) {
      return "Tanggal akhir penjualan harus setelah tanggal mulai.";
    }

    if (form.ticket_sale_end > form.event_date) {
      return "Penjualan tiket tidak boleh berakhir setelah tanggal event.";
    }

    if (!ALLOWED_STATUSES.includes(form.status)) {
      return "Status event tidak valid.";
    }

    if (posterMode === "file" && !selectedFile) {
      return "Silakan pilih file poster terlebih dahulu.";
    }

    if (posterMode === "url") {
      if (!form.poster.trim()) {
        return "Link poster wajib diisi.";
      }

      try {
        const url = new URL(form.poster.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          return "Link poster harus menggunakan HTTP atau HTTPS.";
        }
      } catch {
        return "Format link poster tidak valid.";
      }
    }

    return "";
  };

  /* =========================================================
     SUBMIT EVENT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setNotification({
      type: "",
      message: "",
    });

    const validationError = validateForm();

    if (validationError) {
      setNotification({
        type: "error",
        message: validationError,
      });

      return;
    }

    const token = getToken();

    if (!token) {
      setNotification({
        type: "error",
        message: "Sesi login tidak ditemukan. Silakan login kembali.",
      });

      return;
    }

    try {
      setLoading(true);

      let posterPath = "";

      if (posterMode === "file") {
        setNotification({
          type: "info",
          message: "Sedang meng-upload poster event...",
        });

        posterPath = await uploadPoster(token);
      } else {
        posterPath = form.poster.trim();
      }

      /*
       * Payload mengikuti createEvent pada backend.
       * organizer_id tidak dikirim dari frontend.
       * Backend mengambil organizer_id dari req.user.id.
       */
      const payload = {
        category_id: Number(form.category_id),
        artist_id: Number(form.artist_id),
        venue_id: Number(form.venue_id),

        event_name: form.event_name.trim(),
        description: form.description.trim() || null,

        poster: posterPath || null,
        seat_map_image: null,

        event_date: form.event_date,
        event_time: form.event_time,

        ticket_sale_start: form.ticket_sale_start,
        ticket_sale_end: form.ticket_sale_end,

        status: form.status,
      };

      setNotification({
        type: "info",
        message: "Sedang menyimpan event...",
      });

      const response = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await parseResponse(response);

      const createdEventId =
        data.event?.id ||
        data.data?.event?.id ||
        data.data?.id;

      if (!createdEventId) {
        throw new Error(
          "Event tersimpan, tetapi ID event tidak ditemukan pada response backend."
        );
      }

      setNotification({
        type: "success",
        message: "Event berhasil dibuat. Mengarahkan ke halaman tiket...",
      });

      router.push(`/organizer/events/${createdEventId}/tiket`);
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);

      setNotification({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     STYLING
  ========================================================= */

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:bg-slate-50 disabled:text-slate-400";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full min-w-0 text-[#0F172A]">
      <div className="mx-auto w-full max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex items-start gap-4">
            <Link
              href="/organizer/events"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                Tambah Event
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Buat event baru untuk TicketVerse.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#112250]/15 bg-[#112250]/5 px-4 py-2 text-xs font-bold text-[#112250] sm:flex">
            <Music size={14} />
            Organizer
          </div>
        </div>

        {/* NOTIFICATION */}
        {notification.message && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${
                notification.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : notification.type === "info"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 size={19} />
              ) : notification.type === "info" ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <AlertCircle size={19} />
              )}

              <span className="flex-1">
                {notification.message}
              </span>

              {!loading && (
                <button
                  type="button"
                  onClick={() =>
                    setNotification({
                      type: "",
                      message: "",
                    })
                  }
                  className="opacity-60 transition hover:opacity-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* KOLOM KIRI */}
            <div className="space-y-6 xl:col-span-2">

              {/* INFORMASI EVENT */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Informasi Event
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Informasi dasar mengenai event yang akan dibuat.
                  </p>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">

                  {/* NAMA EVENT */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Nama Event <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="event_name"
                      value={form.event_name}
                      onChange={handleChange}
                      maxLength={150}
                      required
                      placeholder="Contoh: GIGI Live Concert"
                      className={inputClass}
                    />
                  </div>

                  {/* KATEGORI */}
                  <div>
                    <label className={labelClass}>
                      Kategori <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Tag
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        disabled={loadingData}
                        required
                        className={`${inputClass} appearance-none pl-11`}
                      >
                        <option value="">
                          {loadingData
                            ? "Memuat kategori..."
                            : "Pilih kategori"}
                        </option>

                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!loadingData && categories.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        Belum ada kategori. Tambahkan kategori terlebih dahulu.
                      </p>
                    )}
                  </div>

                  {/* ARTIS */}
                  <div>
                    <label className={labelClass}>
                      Artis <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Music
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        name="artist_id"
                        value={form.artist_id}
                        onChange={handleChange}
                        disabled={loadingData}
                        required
                        className={`${inputClass} appearance-none pl-11`}
                      >
                        <option value="">
                          {loadingData ? "Memuat artis..." : "Pilih artis"}
                        </option>

                        {artists.map((artist) => (
                          <option key={artist.id} value={artist.id}>
                            {artist.artist_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!loadingData && artists.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        Belum ada artis. Tambahkan artis terlebih dahulu.
                      </p>
                    )}
                  </div>

                  {/* VENUE */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Venue <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <MapPin
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        name="venue_id"
                        value={form.venue_id}
                        onChange={handleChange}
                        disabled={loadingData}
                        required
                        className={`${inputClass} appearance-none pl-11`}
                      >
                        <option value="">
                          {loadingData ? "Memuat venue..." : "Pilih venue"}
                        </option>

                        {venues.map((venue) => (
                          <option key={venue.id} value={venue.id}>
                            {venue.venue_name}
                            {venue.city ? ` — ${venue.city}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!loadingData && venues.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        Belum ada venue. Tambahkan venue terlebih dahulu.
                      </p>
                    )}
                  </div>

                  {/* DESKRIPSI */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Deskripsi Event
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      maxLength={5000}
                      placeholder="Masukkan deskripsi lengkap mengenai event..."
                      className={`${inputClass} resize-none`}
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {form.description.length}/5000 karakter
                    </p>
                  </div>
                </div>
              </section>

              {/* JADWAL EVENT */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Jadwal Event
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Tentukan jadwal event dan periode penjualan tiket.
                  </p>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">

                  {/* TANGGAL EVENT */}
                  <div>
                    <label className={labelClass}>
                      Tanggal Event <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        name="event_date"
                        value={form.event_date}
                        onChange={handleChange}
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* WAKTU EVENT */}
                  <div>
                    <label className={labelClass}>
                      Waktu Event <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Clock3
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="time"
                        name="event_time"
                        value={form.event_time}
                        onChange={handleChange}
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* SALE START */}
                  <div>
                    <label className={labelClass}>
                      Mulai Penjualan Tiket{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="ticket_sale_start"
                      value={form.ticket_sale_start}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* SALE END */}
                  <div>
                    <label className={labelClass}>
                      Akhir Penjualan Tiket{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="ticket_sale_end"
                      value={form.ticket_sale_end}
                      onChange={handleChange}
                      required
                      min={form.ticket_sale_start || undefined}
                      max={form.event_date || undefined}
                      className={inputClass}
                    />
                  </div>

                  {/* STATUS */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Status Event
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {ALLOWED_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Pilih status event sesuai pilihan yang tersedia pada database.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-6">

              {/* POSTER */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Poster Event
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Gunakan gambar dari komputer atau link gambar.
                  </p>
                </div>

                <div className="p-6">

                  {/* MODE SELECTOR */}
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => handlePosterMode("file")}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                        posterMode === "file"
                          ? "bg-white text-[#112250] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Upload size={16} />
                      Dari Folder
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePosterMode("url")}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                        posterMode === "url"
                          ? "bg-white text-[#112250] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <LinkIcon size={16} />
                      Dari Link
                    </button>
                  </div>

                  {/* FILE MODE */}
                  {posterMode === "file" && (
                    <div className="mt-5">
                      {!posterPreview ? (
                        <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition hover:border-[#112250]/30 hover:bg-[#112250]/5">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm transition group-hover:text-[#112250]">
                            <Upload size={24} />
                          </div>

                          <p className="text-sm font-bold text-slate-700">
                            Pilih gambar dari folder
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            JPG, JPEG, PNG atau WEBP
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Maksimal 5 MB
                          </p>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                            <img
                              src={posterPreview}
                              alt="Preview poster event"
                              className="h-full w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={removePoster}
                              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg transition hover:bg-red-50 hover:text-red-600"
                            >
                              <X size={17} />
                            </button>
                          </div>

                          <div className="p-4">
                            <p className="truncate text-sm font-bold text-slate-700">
                              {selectedFile?.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {selectedFile
                                ? `${(
                                    selectedFile.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)} MB`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* URL MODE */}
                  {posterMode === "url" && (
                    <div className="mt-5">
                      <label className={labelClass}>
                        Link Poster
                      </label>

                      <div className="relative">
                        <LinkIcon
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="url"
                          name="poster"
                          value={form.poster}
                          onChange={handleChange}
                          placeholder="https://example.com/poster.jpg"
                          className={`${inputClass} pl-11`}
                        />
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Masukkan URL langsung menuju gambar poster.
                      </p>
                    </div>
                  )}

                  {/* URL PREVIEW */}
                  {posterMode === "url" && form.poster && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <ImageIcon size={16} />
                          Preview
                        </span>

                        <button
                          type="button"
                          onClick={removePoster}
                          className="text-slate-400 transition hover:text-red-500"
                        >
                          <X size={17} />
                        </button>
                      </div>

                      <div className="aspect-[4/5] bg-slate-100">
                        <img
                          src={form.poster}
                          alt="Preview poster"
                          className="h-full w-full object-cover"
                          onError={() => {
                            setNotification({
                              type: "error",
                              message:
                                "Gambar dari link tidak dapat dimuat. Periksa kembali URL poster.",
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* INFO POSTER */}
              <section className="rounded-2xl border border-[#112250]/15 bg-[#112250]/5 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#112250] text-white">
                    <ImageIcon size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Penyimpanan Poster
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Poster dari folder akan dikirim ke server TicketVerse.
                      Database menyimpan path gambar pada kolom poster.
                    </p>
                  </div>
                </div>
              </section>

              {/* ACTION BUTTON */}
              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <Link
                  href="/organizer/events"
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={loading || loadingData}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1A326A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

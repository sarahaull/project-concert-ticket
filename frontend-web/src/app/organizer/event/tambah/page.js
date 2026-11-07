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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  const [form, setForm] = useState({
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
  });

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);

      const [categoryResponse, artistResponse, venueResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/categories`),
          fetch(`${API_URL}/api/artists`),
          fetch(`${API_URL}/api/venues`),
        ]);

      const categoryData = await categoryResponse.json();
      const artistData = await artistResponse.json();
      const venueData = await venueResponse.json();

      if (categoryData.success) {
        setCategories(categoryData.categories || categoryData.data || []);
      }

      if (artistData.success) {
        setArtists(artistData.artists || artistData.data || []);
      }

      if (venueData.success) {
        setVenues(venueData.venues || venueData.data || []);
      }
    } catch (error) {
      console.error("LOAD DATA ERROR:", error);

      setNotification({
        type: "error",
        message: "Gagal mengambil data kategori, artis, atau venue.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // POSTER MODE
  // ==========================================

  const handlePosterMode = (mode) => {
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }

    setPosterMode(mode);
    setSelectedFile(null);
    setPosterPreview("");

    setForm((prev) => ({
      ...prev,
      poster: "",
    }));

    setNotification({
      type: "",
      message: "",
    });
  };

  // ==========================================
  // FILE POSTER
  // ==========================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setNotification({
        type: "error",
        message: "Format poster harus JPG, JPEG, PNG, atau WEBP.",
      });

      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setNotification({
        type: "error",
        message: "Ukuran poster maksimal 5 MB.",
      });

      e.target.value = "";
      return;
    }

    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }

    setSelectedFile(file);

    const previewUrl = URL.createObjectURL(file);

    setPosterPreview(previewUrl);

    setForm((prev) => ({
      ...prev,
      poster: "",
    }));

    setNotification({
      type: "",
      message: "",
    });
  };

  // ==========================================
  // REMOVE POSTER
  // ==========================================

  const removePoster = () => {
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }

    setSelectedFile(null);
    setPosterPreview("");

    setForm((prev) => ({
      ...prev,
      poster: "",
    }));
  };

  // ==========================================
  // UPLOAD POSTER
  // ==========================================

  const uploadPoster = async () => {
    if (!selectedFile) {
      throw new Error("Silakan pilih file poster terlebih dahulu.");
    }

    const formData = new FormData();

    formData.append("poster", selectedFile);

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/uploads/event-poster`, {
      method: "POST",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      body: formData,
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Server mengembalikan response yang tidak valid.");
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Gagal upload poster.");
    }

    return data.poster;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setNotification({
      type: "",
      message: "",
    });

    // ======================================
    // VALIDATION
    // ======================================

    if (!form.category_id) {
      setNotification({
        type: "error",
        message: "Kategori event wajib dipilih.",
      });
      return;
    }

    if (!form.artist_id) {
      setNotification({
        type: "error",
        message: "Artis wajib dipilih.",
      });
      return;
    }

    if (!form.venue_id) {
      setNotification({
        type: "error",
        message: "Venue wajib dipilih.",
      });
      return;
    }

    if (!form.event_name.trim()) {
      setNotification({
        type: "error",
        message: "Nama event wajib diisi.",
      });
      return;
    }

    if (!form.event_date) {
      setNotification({
        type: "error",
        message: "Tanggal event wajib diisi.",
      });
      return;
    }

    if (!form.event_time) {
      setNotification({
        type: "error",
        message: "Waktu event wajib diisi.",
      });
      return;
    }

    if (!form.ticket_sale_start) {
      setNotification({
        type: "error",
        message: "Tanggal mulai penjualan tiket wajib diisi.",
      });
      return;
    }

    if (!form.ticket_sale_end) {
      setNotification({
        type: "error",
        message: "Tanggal akhir penjualan tiket wajib diisi.",
      });
      return;
    }

    if (new Date(form.ticket_sale_start) >= new Date(form.ticket_sale_end)) {
      setNotification({
        type: "error",
        message:
          "Waktu akhir penjualan tiket harus setelah waktu mulai penjualan.",
      });
      return;
    }

    if (posterMode === "file" && !selectedFile) {
      setNotification({
        type: "error",
        message: "Silakan pilih file poster terlebih dahulu.",
      });
      return;
    }

    if (posterMode === "url" && !form.poster.trim()) {
      setNotification({
        type: "error",
        message: "Link poster wajib diisi.",
      });
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      let posterValue = form.poster.trim();

      // ==================================
      // UPLOAD POSTER FILE
      // ==================================

      if (posterMode === "file") {
        posterValue = await uploadPoster();
      }

      // ==================================
      // PAYLOAD EVENT
      // ==================================

      const payload = {
        category_id: Number(form.category_id),
        artist_id: Number(form.artist_id),
        venue_id: Number(form.venue_id),
        event_name: form.event_name.trim(),
        description: form.description.trim(),
        poster: posterValue,
        event_date: form.event_date,
        event_time: form.event_time,
        ticket_sale_start: form.ticket_sale_start,
        ticket_sale_end: form.ticket_sale_end,
        status: form.status,
      };

      // ==================================
      // CREATE EVENT
      // ==================================

      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Server mengembalikan response yang tidak valid.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal membuat event.");
      }

      // ==================================
      // AMBIL ID EVENT BARU
      // ==================================

      const newEventId = data.event?.id || data.data?.id || data.id;

      if (!newEventId) {
        throw new Error(
          "Event berhasil dibuat, tetapi ID event tidak ditemukan."
        );
      }

      // ==================================
      // SUCCESS
      // ==================================

      setNotification({
        type: "success",
        message:
          "Event berhasil dibuat. Mengarahkan ke Kelola Tiket...",
      });

      setTimeout(() => {
        router.push(`/organizer/event/kelola-tiket/${newEventId}`);
      }, 700);
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);

      setNotification({
        type: "error",
        message: error.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="w-full min-w-0 text-[#0F172A]">
      <div className="mx-auto w-full max-w-7xl">
        {/* ======================================
            HEADER HALAMAN
        ====================================== */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex items-start gap-4">
            <Link
              href="/organizer/event"
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

        {/* ======================================
            NOTIFICATION
        ====================================== */}

        {notification.message && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${
                notification.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 size={19} />
              ) : (
                <AlertCircle size={19} />
              )}

              <span className="flex-1">{notification.message}</span>

              <button
                type="button"
                onClick={() =>
                  setNotification({ type: "", message: "" })
                }
                className="opacity-60 transition hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================
            MAIN FORM
        ====================================== */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* ==================================
                LEFT
            ================================== */}

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
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nama Event
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="event_name"
                      value={form.event_name}
                      onChange={handleChange}
                      placeholder="Contoh: GIGI Live Concert"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                    />
                  </div>

                  {/* CATEGORY */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Kategori
                      <span className="ml-1 text-red-500">*</span>
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
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:bg-slate-50"
                      >
                        <option value="">
                          {loadingData
                            ? "Memuat kategori..."
                            : "Pilih kategori"}
                        </option>

                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name ||
                              category.name ||
                              category.nama_kategori}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ARTIST */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Artis
                      <span className="ml-1 text-red-500">*</span>
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
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:bg-slate-50"
                      >
                        <option value="">
                          {loadingData ? "Memuat artis..." : "Pilih artis"}
                        </option>

                        {artists.map((artist) => (
                          <option key={artist.id} value={artist.id}>
                            {artist.artist_name ||
                              artist.name ||
                              artist.nama_artis}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* VENUE */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Venue
                      <span className="ml-1 text-red-500">*</span>
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
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:bg-slate-50"
                      >
                        <option value="">
                          {loadingData ? "Memuat venue..." : "Pilih venue"}
                        </option>

                        {venues.map((venue) => (
                          <option key={venue.id} value={venue.id}>
                            {venue.venue_name ||
                              venue.name ||
                              venue.nama_venue}
                            {venue.city ? ` — ${venue.city}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Deskripsi Event
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Masukkan deskripsi lengkap mengenai event..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                    />
                  </div>
                </div>
              </section>

              {/* JADWAL */}

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
                  {/* EVENT DATE */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Tanggal Event
                      <span className="ml-1 text-red-500">*</span>
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                      />
                    </div>
                  </div>

                  {/* EVENT TIME */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Waktu Event
                      <span className="ml-1 text-red-500">*</span>
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                      />
                    </div>
                  </div>

                  {/* SALE START */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Mulai Penjualan Tiket
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="datetime-local"
                      name="ticket_sale_start"
                      value={form.ticket_sale_start}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                    />
                  </div>

                  {/* SALE END */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Akhir Penjualan Tiket
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="datetime-local"
                      name="ticket_sale_end"
                      value={form.ticket_sale_end}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                    />
                  </div>

                  {/* STATUS */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status Event
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                    >
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Available">Available</option>
                      <option value="Limited">Limited</option>
                      <option value="Sold Out">Sold Out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* ==================================
                RIGHT
            ================================== */}

            <div className="space-y-6">
              {/* POSTER */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Poster Event
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Gunakan gambar dari folder komputer atau link gambar.
                  </p>
                </div>

                <div className="p-6">
                  {/* MODE */}

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
                              alt="Preview poster"
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
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
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
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
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
                                "Gambar dari link tidak dapat dimuat.",
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* INFO */}

              <section className="rounded-2xl border border-[#112250]/15 bg-[#112250]/5 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#112250] text-white">
                    <ImageIcon size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Poster Event
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Poster dari folder akan diupload ke server TicketVerse.
                      Database hanya menyimpan path gambar sehingga lebih
                      ringan.
                    </p>
                  </div>
                </div>
              </section>

              {/* ACTION */}

              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <Link
                  href="/organizer/event"
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={loading}
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
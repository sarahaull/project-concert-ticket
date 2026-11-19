"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Info,
  ChevronRight,
  CircleCheck,
  FileText,
  Lightbulb,
} from "lucide-react";

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_ROOT = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");
const API_BASE = `${API_ROOT}/api`;

const API = {
  categories: `${API_BASE}/categories`,
  artists: `${API_BASE}/artists`,
  venues: `${API_BASE}/venues`,
  events: `${API_BASE}/events`,
  uploadPoster: `${API_BASE}/uploads/event-poster`,
};

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
};

const easePremium = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: easePremium },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const getToken = () => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInitialEventStatus = (saleStart, saleEnd) => {
  const today = getLocalDate();
  if (today < saleStart) return "Coming Soon";
  if (today >= saleStart && today <= saleEnd) return "Available";
  return "Coming Soon";
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!data) {
    throw new Error(`Response backend tidak valid. HTTP ${response.status}`);
  }
  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || data.error || `Request gagal. HTTP ${response.status}`
    );
  }
  return data;
};

const getList = (data, key) => {
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data?.[key])) return data.data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getErrorMessage = (error) =>
  error?.message || "Terjadi kesalahan pada server.";

const formatDateShort = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TambahEventPage() {
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [posterMode, setPosterMode] = useState("file");
  const [posterPreview, setPosterPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadMasterData = async () => {
      try {
        setLoadingData(true);
        const token = getToken();
        const headers = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const responses = await Promise.all([
          fetch(API.categories, { headers, cache: "no-store" }),
          fetch(API.artists, { headers, cache: "no-store" }),
          fetch(API.venues, { headers, cache: "no-store" }),
        ]);

        const [categoryData, artistData, venueData] = await Promise.all(
          responses.map(parseResponse)
        );

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
        if (mounted) setLoadingData(false);
      }
    };

    loadMasterData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setNotification({ type: "", message: "" });
  };

  const handlePosterMode = (mode) => {
    if (loading) return;
    if (posterPreview) URL.revokeObjectURL(posterPreview);
    setPosterMode(mode);
    setSelectedFile(null);
    setPosterPreview("");
    setForm((previous) => ({ ...previous, poster: "" }));
    setNotification({ type: "", message: "" });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setNotification({
        type: "error",
        message: "Poster harus berformat JPG, PNG, atau WEBP.",
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

    if (posterPreview) URL.revokeObjectURL(posterPreview);

    setSelectedFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setNotification({ type: "", message: "" });
    event.target.value = "";
  };

  const removePoster = () => {
    if (loading) return;
    if (posterPreview) URL.revokeObjectURL(posterPreview);
    setSelectedFile(null);
    setPosterPreview("");
    setForm((previous) => ({ ...previous, poster: "" }));
  };

  const validateForm = () => {
    if (!form.category_id) return "Kategori event wajib dipilih.";
    if (!form.artist_id) return "Artis wajib dipilih.";
    if (!form.venue_id) return "Venue wajib dipilih.";
    if (!form.event_name.trim()) return "Nama event wajib diisi.";
    if (form.event_name.trim().length > 150)
      return "Nama event maksimal 150 karakter.";
    if (!form.event_date) return "Tanggal event wajib diisi.";
    if (!form.event_time) return "Waktu event wajib diisi.";
    if (!form.ticket_sale_start)
      return "Tanggal mulai penjualan tiket wajib diisi.";
    if (!form.ticket_sale_end)
      return "Tanggal akhir penjualan tiket wajib diisi.";

    const today = getLocalDate();

    if (form.ticket_sale_start > form.ticket_sale_end)
      return "Tanggal akhir penjualan harus setelah tanggal mulai.";
    if (form.ticket_sale_start > form.event_date)
      return "Penjualan tiket tidak boleh dimulai setelah tanggal event.";
    if (form.ticket_sale_end > form.event_date)
      return "Penjualan tiket tidak boleh berakhir setelah tanggal event.";
    if (form.event_date < today)
      return "Tanggal event tidak boleh menggunakan tanggal yang sudah lewat.";
    if (form.ticket_sale_end < today)
      return "Periode penjualan tiket sudah berakhir. Silakan pilih tanggal penjualan yang masih berlaku.";

    if (posterMode === "file" && !selectedFile)
      return "Silakan pilih poster event.";

    if (posterMode === "url") {
      if (!form.poster.trim()) return "Link poster wajib diisi.";
      try {
        const url = new URL(form.poster.trim());
        if (!["http:", "https:"].includes(url.protocol))
          return "Link poster harus menggunakan HTTP atau HTTPS.";
      } catch {
        return "Format link poster tidak valid.";
      }
    }

    return "";
  };

  const createEvent = async (token) => {
    const status = getInitialEventStatus(
      form.ticket_sale_start,
      form.ticket_sale_end
    );

    const payload = {
      category_id: Number(form.category_id),
      artist_id: Number(form.artist_id),
      venue_id: Number(form.venue_id),
      event_name: form.event_name.trim(),
      description: form.description.trim() || null,
      poster: posterMode === "url" ? form.poster.trim() : null,
      seat_map_image: null,
      event_date: form.event_date,
      event_time: form.event_time,
      ticket_sale_start: form.ticket_sale_start,
      ticket_sale_end: form.ticket_sale_end,
      status,
    };

    const response = await fetch(API.events, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);

    const eventId =
      data?.event?.id ??
      data?.data?.event?.id ??
      data?.data?.id ??
      data?.id;

    if (!eventId) {
      throw new Error(
        "Event berhasil dikirim, tetapi ID event tidak ditemukan pada response backend."
      );
    }

    return Number(eventId);
  };

  const uploadPoster = async (token, eventId) => {
    if (!selectedFile) throw new Error("File poster belum dipilih.");
    if (!eventId) throw new Error("ID event wajib dikirim.");

    const formData = new FormData();
    formData.append("poster", selectedFile);
    formData.append("event_id", String(eventId));

    const response = await fetch(API.uploadPoster, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await parseResponse(response);
    const posterPath =
      data?.poster ?? data?.data?.poster ?? data?.event?.poster;

    if (!posterPath) throw new Error("Backend tidak mengembalikan path poster.");
    return posterPath;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || loadingData) return;

    setNotification({ type: "", message: "" });

    const validationError = validateForm();
    if (validationError) {
      setNotification({ type: "error", message: validationError });
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
      setNotification({
        type: "info",
        message: "Sedang menyimpan informasi event...",
      });

      const eventId = await createEvent(token);

      if (posterMode === "file" && selectedFile) {
        setNotification({
          type: "info",
          message: "Event berhasil dibuat. Sedang mengupload poster...",
        });
        await uploadPoster(token, eventId);
      }

      setNotification({
        type: "success",
        message: "Event berhasil disimpan. Mengalihkan ke halaman tiket...",
      });

      if (posterPreview) URL.revokeObjectURL(posterPreview);

      setTimeout(() => {
        router.push(`/organizer/event/${eventId}/tiket`);
      }, 1000);
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);
      setNotification({ type: "error", message: getErrorMessage(error) });
      setLoading(false);
    }
  };

  const isLocked = loading;
  const today = getLocalDate();

  const previewStatus =
    form.ticket_sale_start && form.ticket_sale_end
      ? getInitialEventStatus(form.ticket_sale_start, form.ticket_sale_end)
      : "Coming Soon";

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(form.category_id)
  );
  const selectedArtist = artists.find(
    (a) => String(a.id) === String(form.artist_id)
  );
  const selectedVenue = venues.find(
    (v) => String(v.id) === String(form.venue_id)
  );

  const posterImageSrc =
    posterMode === "file" ? posterPreview : form.poster || "";

  const completeness = [
    form.event_name.trim(),
    form.category_id,
    form.artist_id,
    form.venue_id,
    form.event_date,
    form.event_time,
    form.ticket_sale_start,
    form.ticket_sale_end,
    posterImageSrc,
  ].filter(Boolean).length;

  const completenessPercent = Math.round((completeness / 9) * 100);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="w-full min-w-0 space-y-6"
    >
      {/* HEADER */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
      >
        <div className="flex items-start gap-3">
          <Link
            href="/organizer/event"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
          </Link>

          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              <span>Organizer</span>
              <span className="text-slate-300">/</span>
              <span>Event</span>
              <span className="text-slate-300">/</span>
              <span className="text-sky-600">Tambah Event</span>
            </div>

            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[30px]">
              Tambah Event
            </h1>

            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-500">
              Buat event baru untuk TicketVerse. Lengkapi informasi dan poster
              agar siap dipublikasikan ke pengunjung.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-[11.5px] font-semibold text-sky-700">
            <Sparkles size={13} />
            Organizer Suite
          </div>
        </div>
      </motion.div>

      {/* INFO BANNER */}
      <motion.div
        variants={fadeUp}
        className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-[12.5px] text-sky-900"
      >
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 ring-1 ring-sky-100">
          <Info size={14} />
        </div>
        <div>
          <p className="font-semibold">Informasi penyimpanan event</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-sky-900/75">
            Event baru disimpan sesuai periode penjualan tiket. Jika penjualan
            sudah dimulai, status otomatis menjadi <strong>Available</strong>.
            Jika belum, menjadi <strong>Coming Soon</strong>. Persetujuan event
            tetap dikelola oleh Super Admin secara terpisah.
          </p>
        </div>
      </motion.div>

      {/* NOTIFICATION */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className={`flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 text-[12.5px] ${
              notification.type === "success"
                ? "border-sky-200 bg-sky-50/70 text-sky-700"
                : notification.type === "info"
                ? "border-slate-200 bg-slate-50 text-slate-700"
                : "border-rose-200 bg-rose-50/70 text-rose-700"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            ) : notification.type === "info" ? (
              <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}

            <span className="flex-1">{notification.message}</span>

            {!loading && (
              <button
                type="button"
                onClick={() => setNotification({ type: "", message: "" })}
                className="opacity-60 transition hover:opacity-100"
              >
                <X size={15} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* EVENT INFO */}
            <motion.section
              variants={fadeUp}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-slate-900">
                    Informasi Event
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-slate-400">
                    Informasi dasar mengenai event yang akan dibuat.
                  </p>
                </div>
                <div className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 ring-1 ring-slate-100 sm:inline-flex">
                  <FileText size={11} />
                  Wajib diisi
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel required>Nama Event</FieldLabel>
                  <input
                    type="text"
                    name="event_name"
                    value={form.event_name}
                    onChange={handleChange}
                    maxLength={150}
                    required
                    disabled={isLocked}
                    placeholder="Contoh: GIGI Live Concert"
                    className={inputClass}
                  />
                  <p className="mt-1 text-right text-[10.5px] text-slate-400">
                    {form.event_name.length}/150 karakter
                  </p>
                </div>

                <div>
                  <FieldLabel required>Kategori</FieldLabel>
                  <div className="relative">
                    <Tag
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      disabled={loadingData || isLocked}
                      required
                      className={`${inputClass} appearance-none pl-9 pr-9`}
                    >
                      <option value="">
                        {loadingData ? "Memuat kategori..." : "Pilih kategori"}
                      </option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.category_name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                    />
                  </div>
                  {!loadingData && categories.length === 0 && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Belum ada kategori event.
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel required>Artis</FieldLabel>
                  <div className="relative">
                    <Music
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      name="artist_id"
                      value={form.artist_id}
                      onChange={handleChange}
                      disabled={loadingData || isLocked}
                      required
                      className={`${inputClass} appearance-none pl-9 pr-9`}
                    >
                      <option value="">
                        {loadingData ? "Memuat artis..." : "Pilih artis"}
                      </option>
                      {artists.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.artist_name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                    />
                  </div>
                  {!loadingData && artists.length === 0 && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Belum ada data artis.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <FieldLabel required>Venue</FieldLabel>
                  <div className="relative">
                    <MapPin
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      name="venue_id"
                      value={form.venue_id}
                      onChange={handleChange}
                      disabled={loadingData || isLocked}
                      required
                      className={`${inputClass} appearance-none pl-9 pr-9`}
                    >
                      <option value="">
                        {loadingData ? "Memuat venue..." : "Pilih venue"}
                      </option>
                      {venues.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.venue_name}
                          {item.city ? ` — ${item.city}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronRight
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                    />
                  </div>
                  {!loadingData && venues.length === 0 && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Belum ada data venue.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Deskripsi Event</FieldLabel>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    maxLength={5000}
                    disabled={isLocked}
                    placeholder="Masukkan deskripsi lengkap mengenai event..."
                    className={`${inputClass} resize-none`}
                  />
                  <p className="mt-1 text-right text-[10.5px] text-slate-400">
                    {form.description.length}/5000 karakter
                  </p>
                </div>
              </div>
            </motion.section>

            {/* SCHEDULE */}
            <motion.section
              variants={fadeUp}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-slate-900">
                    Jadwal Event
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-slate-400">
                    Tentukan jadwal event dan periode penjualan tiket.
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold ring-1 ${
                    previewStatus === "Available"
                      ? "bg-sky-50 text-sky-700 ring-sky-100"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      previewStatus === "Available"
                        ? "bg-sky-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {previewStatus}
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">
                <div>
                  <FieldLabel required>Tanggal Event</FieldLabel>
                  <div className="relative">
                    <CalendarDays
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      name="event_date"
                      value={form.event_date}
                      onChange={handleChange}
                      min={today}
                      required
                      disabled={isLocked}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Waktu Event</FieldLabel>
                  <div className="relative">
                    <Clock3
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="time"
                      name="event_time"
                      value={form.event_time}
                      onChange={handleChange}
                      required
                      disabled={isLocked}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Mulai Penjualan Tiket</FieldLabel>
                  <input
                    type="date"
                    name="ticket_sale_start"
                    value={form.ticket_sale_start}
                    onChange={handleChange}
                    required
                    disabled={isLocked}
                    max={
                      form.ticket_sale_end || form.event_date || undefined
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <FieldLabel required>Akhir Penjualan Tiket</FieldLabel>
                  <input
                    type="date"
                    name="ticket_sale_end"
                    value={form.ticket_sale_end}
                    onChange={handleChange}
                    required
                    disabled={isLocked}
                    min={form.ticket_sale_start || undefined}
                    max={form.event_date || undefined}
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 ring-1 ring-slate-100">
                      <CircleCheck size={15} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800">
                        Status penjualan: {previewStatus}
                      </p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
                        {previewStatus === "Available"
                          ? "Periode penjualan sudah dimulai. Event akan dikirim dengan status Available."
                          : "Periode penjualan belum dimulai. Event akan dikirim dengan status Coming Soon."}{" "}
                        Persetujuan event oleh Super Admin tetap proses
                        terpisah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ACTION BUTTONS */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
            >
              <Link
                href="/organizer/event"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </Link>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || loadingData}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Simpan Event
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            {/* COMPLETENESS */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                    Kelengkapan Form
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">
                    {completeness} / 9 field
                  </p>
                </div>
                <span className="text-[18px] font-bold text-sky-700">
                  {completenessPercent}%
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completenessPercent}%` }}
                  transition={{ duration: 0.6, ease: easePremium }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600"
                />
              </div>
            </motion.div>

            {/* POSTER CARD */}
            <motion.section
              variants={fadeUp}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-slate-900">
                  Poster Event
                </h2>
                <p className="mt-0.5 text-[11.5px] text-slate-400">
                  Upload dari folder atau gunakan link gambar.
                </p>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => handlePosterMode("file")}
                    disabled={isLocked}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                      posterMode === "file"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Upload size={13} />
                    Dari Folder
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosterMode("url")}
                    disabled={isLocked}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                      posterMode === "url"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <LinkIcon size={13} />
                    Dari Link
                  </button>
                </div>

                <div className="mt-4">
                  {posterMode === "file" && (
                    <>
                      {!posterPreview ? (
                        <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition group-hover:text-sky-600 group-hover:ring-sky-200">
                            <Upload size={20} />
                          </div>
                          <p className="text-[12.5px] font-semibold text-slate-700">
                            Pilih gambar dari folder
                          </p>
                          <p className="mt-1 text-[10.5px] text-slate-400">
                            JPG, PNG, WEBP · Maks. 5 MB
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            disabled={isLocked}
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
                              disabled={isLocked}
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="p-3">
                            <p className="truncate text-[12px] font-semibold text-slate-700">
                              {selectedFile?.name}
                            </p>
                            <p className="mt-0.5 text-[10.5px] text-slate-400">
                              {selectedFile
                                ? `${(selectedFile.size / 1024 / 1024).toFixed(
                                    2
                                  )} MB`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {posterMode === "url" && (
                    <>
                      <FieldLabel>Link Poster</FieldLabel>
                      <div className="relative">
                        <LinkIcon
                          size={15}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="url"
                          name="poster"
                          value={form.poster}
                          onChange={handleChange}
                          disabled={isLocked}
                          placeholder="https://example.com/poster.jpg"
                          className={`${inputClass} pl-9`}
                        />
                      </div>

                      <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-400">
                        Masukkan URL langsung menuju gambar poster.
                      </p>

                      {form.poster && (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700">
                              <ImageIcon size={12} />
                              Preview
                            </span>
                            <button
                              type="button"
                              onClick={removePoster}
                              disabled={isLocked}
                              className="text-slate-400 transition hover:text-rose-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="aspect-[4/5] bg-slate-100">
                            <img
                              src={form.poster}
                              alt="Preview poster"
                              className="h-full w-full object-cover"
                              onError={() =>
                                setNotification({
                                  type: "error",
                                  message:
                                    "Gambar tidak dapat dimuat. Periksa URL poster.",
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.section>

            {/* SUMMARY PREVIEW */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Sparkles size={13} />
                </div>
                <p className="text-[12.5px] font-semibold text-slate-900">
                  Ringkasan Event
                </p>
              </div>

              <div className="space-y-2.5 text-[11.5px]">
                <SummaryRow
                  label="Nama"
                  value={form.event_name.trim() || "Belum diisi"}
                  empty={!form.event_name.trim()}
                />
                <SummaryRow
                  label="Kategori"
                  value={
                    selectedCategory?.category_name || "Belum dipilih"
                  }
                  empty={!selectedCategory}
                />
                <SummaryRow
                  label="Artis"
                  value={selectedArtist?.artist_name || "Belum dipilih"}
                  empty={!selectedArtist}
                />
                <SummaryRow
                  label="Venue"
                  value={selectedVenue?.venue_name || "Belum dipilih"}
                  empty={!selectedVenue}
                />
                <SummaryRow
                  label="Tanggal"
                  value={formatDateShort(form.event_date) || "Belum diisi"}
                  empty={!form.event_date}
                />
                <SummaryRow
                  label="Waktu"
                  value={form.event_time || "Belum diisi"}
                  empty={!form.event_time}
                />
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    previewStatus === "Available"
                      ? "bg-sky-500"
                      : "bg-slate-400"
                  }`}
                />
                <p className="text-[11px] font-semibold text-slate-700">
                  Status: {previewStatus}
                </p>
              </div>
            </motion.div>

            {/* TIPS */}
            <motion.div
              variants={fadeUp}
              className="flex items-start gap-2.5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 ring-1 ring-sky-100">
                <Lightbulb size={13} />
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-sky-900">
                  Tips cepat
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-sky-900/75">
                  Poster dari folder akan diupload setelah event berhasil
                  dibuat. Backend menyimpan path poster berdasarkan ID event
                  yang baru dibuat.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-3 text-[12.5px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400";

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-1.5 block text-[11.5px] font-semibold text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

function SummaryRow({ label, value, empty = false }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span
        className={`truncate text-right font-semibold ${
          empty ? "text-slate-400" : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
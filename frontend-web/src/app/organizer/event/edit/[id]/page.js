"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Link2,
  Image as ImageIcon,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  UserRound,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";

// ============================================================
// API CONFIGURATION
// Mendukung NEXT_PUBLIC_API_URL dengan atau tanpa /api
// ============================================================

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const API = `${API_BASE}/api`;

const STATUS_OPTIONS = [
  "Coming Soon",
  "Available",
  "Limited",
  "Sold Out",
  "Cancelled",
];

// ============================================================
// HELPERS
// ============================================================

function getPosterUrl(poster) {
  if (!poster) return "";

  if (/^https?:\/\//i.test(poster)) {
    return poster;
  }

  return `${API_BASE}/${String(poster).replace(/^\/+/, "")}`;
}

function formatDateForInput(value) {
  if (!value) return "";

  const str = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

// Hindari perubahan tanggal karena konversi timezone.
function formatDateTimeLocalInput(value) {
  if (!value) {
    return { date: "", time: "" };
  }

  const str = String(value);

  const match = str.match(
    /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/
  );

  if (match) {
    return {
      date: match[1],
      time: match[2],
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  return {
    date: date.toISOString().slice(0, 10),
    time: date.toISOString().slice(11, 16),
  };
}

function formatTimeForInput(value) {
  if (!value) return "";

  return String(value).slice(0, 5);
}

function getList(data, keys) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

async function readJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      success: false,
      message: text || "Respons server tidak valid.",
    };
  }
}

async function apiRequest(path, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await readJson(response);

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request gagal (${response.status}).`
    );
  }

  return data;
}

// ============================================================
// COMPONENTS
// ============================================================

function InputLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}

function FieldIcon({ children }) {
  return (
    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50";

const iconInputClass = `${inputClass} pl-11`;

// ============================================================
// MAIN PAGE
// ============================================================

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [posterMode, setPosterMode] = useState("url");
  const [posterFile, setPosterFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  const [form, setForm] = useState({
    category_id: "",
    artist_id: "",
    venue_id: "",
    event_name: "",
    description: "",
    poster: "",
    event_date: "",
    event_time: "",
    ticket_sale_start_date: "",
    ticket_sale_start_time: "",
    ticket_sale_end_date: "",
    ticket_sale_end_time: "",
    status: "Coming Soon",
  });

  // ==========================================================
  // LOAD EVENT + MASTER DATA
  // ==========================================================

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setLoadingOptions(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Token login tidak ditemukan. Silakan login kembali."
          );
        }

        // Ambil detail event dan data pilihan.
        const results = await Promise.allSettled([
          apiRequest(`/events/${id}`),
          apiRequest("/categories"),
          apiRequest("/artists"),
          apiRequest("/venues"),
        ]);

        if (cancelled) return;

        // Detail event wajib berhasil.
        const eventResult = results[0];

        if (eventResult.status === "rejected") {
          throw eventResult.reason;
        }

        const eventData = eventResult.value;
        const event = eventData.event;

        if (!eventData.success || !event) {
          throw new Error(
            eventData.message || "Data event tidak ditemukan."
          );
        }

        // Isi pilihan kategori, artis, venue.
        const categoryResult = results[1];
        const artistResult = results[2];
        const venueResult = results[3];

        if (categoryResult.status === "fulfilled") {
          setCategories(
            getList(categoryResult.value, [
              "categories",
              "data",
            ])
          );
        }

        if (artistResult.status === "fulfilled") {
          setArtists(
            getList(artistResult.value, [
              "artists",
              "data",
            ])
          );
        }

        if (venueResult.status === "fulfilled") {
          setVenues(
            getList(venueResult.value, [
              "venues",
              "data",
            ])
          );
        }

        // Parsing jadwal penjualan.
        const start = formatDateTimeLocalInput(
          event.ticket_sale_start
        );

        const end = formatDateTimeLocalInput(
          event.ticket_sale_end
        );

        setForm({
          category_id: event.category_id
            ? String(event.category_id)
            : "",

          artist_id: event.artist_id
            ? String(event.artist_id)
            : "",

          venue_id: event.venue_id
            ? String(event.venue_id)
            : "",

          event_name: event.event_name || "",
          description: event.description || "",
          poster: event.poster || "",

          event_date: formatDateForInput(event.event_date),
          event_time: formatTimeForInput(event.event_time),

          ticket_sale_start_date: start.date,
          ticket_sale_start_time: start.time,

          ticket_sale_end_date: end.date,
          ticket_sale_end_time: end.time,

          status: event.status || "Coming Soon",
        });

        setPosterMode(
          event.poster &&
            !/^https?:\/\//i.test(event.poster)
            ? "file"
            : "url"
        );
      } catch (err) {
        if (!cancelled) {
          console.error("FETCH EDIT EVENT ERROR:", err);
          setError(
            err.message || "Gagal mengambil data event."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingOptions(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==========================================================
  // POSTER PREVIEW
  // ==========================================================

  useEffect(() => {
    if (!posterFile) {
      setFilePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(posterFile);

    setFilePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [posterFile]);

  const preview =
    posterMode === "file" && filePreview
      ? filePreview
      : getPosterUrl(form.poster);

  // ==========================================================
  // FORM HANDLERS
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handlePosterModeChange = (mode) => {
    setPosterMode(mode);

    setError("");
    setSuccess("");

    if (mode === "url") {
      setPosterFile(null);
      setFilePreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Format poster harus JPG, PNG, atau WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran poster maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    setPosterFile(file);
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // UPLOAD POSTER
  // ==========================================================

  async function uploadPoster() {
    if (!posterFile) {
      throw new Error("Silakan pilih poster terlebih dahulu.");
    }

    const formData = new FormData();

    formData.append("poster", posterFile);

    const data = await apiRequest("/uploads/event-poster", {
      method: "POST",
      body: formData,
    });

    if (!data.poster) {
      throw new Error(
        "Server tidak mengembalikan lokasi poster."
      );
    }

    return data.poster;
  }

  // ==========================================================
  // VALIDATION
  // ==========================================================

  function validateForm() {
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

    if (!form.ticket_sale_start_date) {
      return "Tanggal mulai penjualan wajib diisi.";
    }

    if (!form.ticket_sale_start_time) {
      return "Waktu mulai penjualan wajib diisi.";
    }

    if (!form.ticket_sale_end_date) {
      return "Tanggal berakhir penjualan wajib diisi.";
    }

    if (!form.ticket_sale_end_time) {
      return "Waktu berakhir penjualan wajib diisi.";
    }

    const saleStart = new Date(
      `${form.ticket_sale_start_date}T${form.ticket_sale_start_time}:00`
    );

    const saleEnd = new Date(
      `${form.ticket_sale_end_date}T${form.ticket_sale_end_time}:00`
    );

    if (
      Number.isNaN(saleStart.getTime()) ||
      Number.isNaN(saleEnd.getTime())
    ) {
      return "Jadwal penjualan tiket tidak valid.";
    }

    if (saleStart >= saleEnd) {
      return "Waktu mulai penjualan harus lebih awal dari waktu berakhir.";
    }

    if (!form.poster.trim() && !posterFile) {
      return "Poster event wajib diisi atau diupload.";
    }

    return "";
  }

  // ==========================================================
  // UPDATE EVENT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);

      let posterValue = form.poster.trim();

      // Upload hanya jika user memilih file poster baru.
      if (posterMode === "file" && posterFile) {
        posterValue = await uploadPoster();
      }

      // Payload disesuaikan dengan updateEvent backend.
      const payload = {
        category_id: Number(form.category_id),
        artist_id: Number(form.artist_id),
        venue_id: Number(form.venue_id),

        event_name: form.event_name.trim(),
        description: form.description.trim() || null,

        poster: posterValue || null,

        event_date: form.event_date,
        event_time: form.event_time,

        ticket_sale_start:
          `${form.ticket_sale_start_date} ${form.ticket_sale_start_time}:00`,

        ticket_sale_end:
          `${form.ticket_sale_end_date} ${form.ticket_sale_end_time}:00`,

        status: form.status,
      };

      const data = await apiRequest(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!data.success) {
        throw new Error(
          data.message || "Gagal memperbarui event."
        );
      }

      setSuccess(
        data.message || "Event berhasil diperbarui."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        router.push(`/organizer/event/${id}`);
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("UPDATE EVENT ERROR:", err);

      setError(
        err.message || "Terjadi kesalahan saat memperbarui event."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat data event...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR WITHOUT EVENT
  // ==========================================================

  if (error && !form.event_name) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={23}
              className="shrink-0 text-red-500"
            />

            <div>
              <h2 className="font-bold text-slate-900">
                Event tidak dapat dimuat
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>
            </div>
          </div>

          <Link
            href="/organizer/event"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Kembali ke Event
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="relative min-w-0 w-full pb-28">
      <div className="mx-auto w-full max-w-6xl">

        {/* HEADER */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <Link
                href="/organizer/event"
                className="transition hover:text-blue-600"
              >
                Event
              </Link>

              <span>/</span>

              <Link
                href={`/organizer/event/${id}`}
                className="transition hover:text-blue-600"
              >
                Detail
              </Link>

              <span>/</span>

              <span className="font-medium text-slate-600">
                Edit
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Edit Event
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Perbarui informasi event yang kamu kelola.
            </p>
          </div>

          <Link
            href={`/organizer/event/${id}`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Kembali
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                Gagal memperbarui event
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="text-sm font-bold">
                Berhasil
              </p>

              <p className="mt-1 text-sm">
                {success}
              </p>
            </div>
          </div>
        )}

        <form
          id="edit-event-form"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">

            {/* LEFT CONTENT */}
            <div className="min-w-0 space-y-6">

              {/* INFORMASI EVENT */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Informasi Event
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Informasi dasar mengenai event.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  {/* CATEGORY */}
                  <div>
                    <InputLabel required>
                      Kategori Event
                    </InputLabel>

                    <div className="relative">
                      <FieldIcon>
                        <Tag size={18} />
                      </FieldIcon>

                      <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        disabled={loadingOptions}
                        className={iconInputClass}
                        required
                      >
                        <option value="">
                          {loadingOptions
                            ? "Memuat kategori..."
                            : "Pilih kategori"}
                        </option>

                        {categories.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name ||
                              item.category_name ||
                              item.nama_kategori}
                          </option>
                        ))}
                      </select>
                    </div>

                    {categories.length === 0 && !loadingOptions && (
                      <p className="mt-2 text-xs text-red-500">
                        Data kategori tidak tersedia. Periksa endpoint GET /api/categories.
                      </p>
                    )}
                  </div>

                  {/* ARTIST */}
                  <div>
                    <InputLabel required>
                      Artis / Performer
                    </InputLabel>

                    <div className="relative">
                      <FieldIcon>
                        <UserRound size={18} />
                      </FieldIcon>

                      <select
                        name="artist_id"
                        value={form.artist_id}
                        onChange={handleChange}
                        disabled={loadingOptions}
                        className={iconInputClass}
                        required
                      >
                        <option value="">
                          {loadingOptions
                            ? "Memuat artis..."
                            : "Pilih artis"}
                        </option>

                        {artists.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name ||
                              item.artist_name ||
                              item.nama_artis}
                          </option>
                        ))}
                      </select>
                    </div>

                    {artists.length === 0 && !loadingOptions && (
                      <p className="mt-2 text-xs text-red-500">
                        Data artis tidak tersedia. Periksa endpoint GET /api/artists.
                      </p>
                    )}
                  </div>

                  {/* EVENT NAME */}
                  <div className="md:col-span-2">
                    <InputLabel required>
                      Nama Event
                    </InputLabel>

                    <div className="relative">
                      <FieldIcon>
                        <Ticket size={18} />
                      </FieldIcon>

                      <input
                        type="text"
                        name="event_name"
                        value={form.event_name}
                        onChange={handleChange}
                        placeholder="Contoh: GIGI Live Concert"
                        className={iconInputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2">
                    <InputLabel>
                      Deskripsi Event
                    </InputLabel>

                    <div className="relative">
                      <FileText
                        size={18}
                        className="absolute left-3.5 top-4 text-slate-400"
                      />

                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tuliskan informasi mengenai event..."
                        className={`${inputClass} resize-y pl-11`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* LOKASI DAN WAKTU */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Lokasi & Waktu
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Atur lokasi dan jadwal penyelenggaraan event.
                  </p>
                </div>

                <div className="space-y-5">

                  {/* VENUE */}
                  <div>
                    <InputLabel required>
                      Venue
                    </InputLabel>

                    <div className="relative">
                      <FieldIcon>
                        <MapPin size={18} />
                      </FieldIcon>

                      <select
                        name="venue_id"
                        value={form.venue_id}
                        onChange={handleChange}
                        disabled={loadingOptions}
                        className={iconInputClass}
                        required
                      >
                        <option value="">
                          {loadingOptions
                            ? "Memuat venue..."
                            : "Pilih venue"}
                        </option>

                        {venues.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name ||
                              item.venue_name ||
                              item.nama_venue}
                            {item.city ? ` — ${item.city}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {venues.length === 0 && !loadingOptions && (
                      <p className="mt-2 text-xs text-red-500">
                        Data venue tidak tersedia. Periksa endpoint GET /api/venues.
                      </p>
                    )}
                  </div>

                  {/* EVENT DATE AND TIME */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <InputLabel required>
                        Tanggal Event
                      </InputLabel>

                      <div className="relative">
                        <FieldIcon>
                          <CalendarDays size={18} />
                        </FieldIcon>

                        <input
                          type="date"
                          name="event_date"
                          value={form.event_date}
                          onChange={handleChange}
                          className={iconInputClass}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <InputLabel required>
                        Waktu Event
                      </InputLabel>

                      <div className="relative">
                        <FieldIcon>
                          <Clock3 size={18} />
                        </FieldIcon>

                        <input
                          type="time"
                          name="event_time"
                          value={form.event_time}
                          onChange={handleChange}
                          className={iconInputClass}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* SALE START */}
                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-800">
                      Mulai Penjualan Tiket
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <InputLabel required>
                          Tanggal
                        </InputLabel>

                        <input
                          type="date"
                          name="ticket_sale_start_date"
                          value={form.ticket_sale_start_date}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <InputLabel required>
                          Waktu
                        </InputLabel>

                        <input
                          type="time"
                          name="ticket_sale_start_time"
                          value={form.ticket_sale_start_time}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* SALE END */}
                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-800">
                      Berakhir Penjualan Tiket
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <InputLabel required>
                          Tanggal
                        </InputLabel>

                        <input
                          type="date"
                          name="ticket_sale_end_date"
                          value={form.ticket_sale_end_date}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <InputLabel required>
                          Waktu
                        </InputLabel>

                        <input
                          type="time"
                          name="ticket_sale_end_time"
                          value={form.ticket_sale_end_time}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* STATUS EVENT */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Status Event
                </h2>

                <p className="mb-5 mt-1 text-sm text-slate-400">
                  Tentukan status event yang akan ditampilkan.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {STATUS_OPTIONS.map((status) => {
                    const active = form.status === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            status,
                          }));

                          setError("");
                          setSuccess("");
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* RIGHT CONTENT */}
            <div className="min-w-0 space-y-6">

              {/* POSTER */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Poster Event
                </h2>

                <p className="mb-5 mt-1 text-sm text-slate-400">
                  Gunakan URL atau upload poster baru.
                </p>

                {/* MODE */}
                <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => handlePosterModeChange("url")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      posterMode === "url"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Link2 size={16} />
                    URL
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePosterModeChange("file")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      posterMode === "file"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                </div>

                {/* URL INPUT */}
                {posterMode === "url" ? (
                  <div className="mt-5">
                    <InputLabel>
                      URL Poster
                    </InputLabel>

                    <div className="relative">
                      <FieldIcon>
                        <Link2 size={18} />
                      </FieldIcon>

                      <input
                        type="url"
                        name="poster"
                        value={form.poster}
                        onChange={handleChange}
                        placeholder="https://example.com/poster.jpg"
                        className={iconInputClass}
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Gunakan URL gambar yang dapat diakses publik.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <InputLabel>
                      Upload Poster Baru
                    </InputLabel>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
                    >
                      <Upload
                        size={25}
                        className="text-blue-600"
                      />

                      <p className="mt-3 text-sm font-bold text-slate-700">
                        Pilih poster baru
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        JPG, PNG, WEBP · Maksimal 5 MB
                      </p>
                    </button>

                    {posterFile && (
                      <div className="mt-3 rounded-xl bg-blue-50 p-3">
                        <p className="truncate text-xs font-semibold text-blue-700">
                          {posterFile.name}
                        </p>

                        <p className="mt-1 text-xs text-blue-500">
                          {(posterFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}

                    {!posterFile && form.poster && (
                      <p className="mt-3 text-xs text-slate-500">
                        Poster lama tetap digunakan jika kamu tidak memilih file baru.
                      </p>
                    )}
                  </div>
                )}

                {/* PREVIEW */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      Preview Poster
                    </p>

                    {preview && (
                      <Eye
                        size={17}
                        className="text-slate-400"
                      />
                    )}
                  </div>

                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview poster event"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon
                          size={38}
                          strokeWidth={1.5}
                        />

                        <p className="mt-3 text-xs">
                          Belum ada poster
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* INFO */}
              <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                    <AlertCircle size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Informasi Perubahan
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-slate-600">
                      Perubahan informasi event akan dikirim ke server.
                      Kategori tiket dan denah kursi yang sudah dibuat
                      tidak diubah melalui halaman ini.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>

      {/* FIXED ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <Link
            href={`/organizer/event/${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">
              Batal
            </span>
          </Link>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("edit-event-form")
                ?.requestSubmit()
            }
            disabled={saving || loadingOptions}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
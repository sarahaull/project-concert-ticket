"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Info,
  ImagePlus,
  Trash2,
  Sparkles,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const API = `${API_BASE}/api`;

const STATUS_OPTIONS = [
  {
    value: "Coming Soon",
    label: "Coming Soon",
    dot: "bg-slate-400",
  },
  {
    value: "Available",
    label: "Available",
    dot: "bg-sky-500",
  },
  {
    value: "Limited",
    label: "Limited",
    dot: "bg-amber-500",
  },
  {
    value: "Sold Out",
    label: "Sold Out",
    dot: "bg-rose-500",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
    dot: "bg-slate-400",
  },
];

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06] disabled:bg-slate-50 disabled:text-slate-500";

const labelClass =
  "mb-1.5 block text-[12.5px] font-semibold text-slate-700";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function getPosterUrl(poster) {
  if (!poster) return "";

  if (/^https?:\/\//i.test(poster)) {
    return poster;
  }

  return `${API_BASE}/${String(poster).replace(/^\/+/, "")}`;
}

function formatDateForInput(value) {
  if (!value) return "";

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    return stringValue.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function formatDateTimeLocalInput(value) {
  if (!value) {
    return { date: "", time: "" };
  }

  const stringValue = String(value);

  const match = stringValue.match(
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

function getList(result, keys) {
  if (!result) return [];

  for (const key of keys) {
    if (Array.isArray(result[key])) {
      return result[key];
    }
  }

  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (result.data && typeof result.data === "object") {
    for (const key of keys) {
      if (Array.isArray(result.data[key])) {
        return result.data[key];
      }
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
  const token = getToken();

  if (!token) {
    throw new Error("Token login tidak ditemukan. Silakan login kembali.");
  }

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  if (isFormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await readJson(response);

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request gagal (${response.status}).`
    );
  }

  return data;
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1220]/[0.06] text-[#0B1220]">
        <Icon size={16} />
      </div>

      <div>
        <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0B1220]">
          {title}
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({ label, required, icon: Icon, children }) {
  return (
    <div className="group min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#0B1220]"
          />
        )}

        {children}
      </div>
    </div>
  );
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id ? String(params.id) : "";
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

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setLoadingOptions(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        apiRequest(`/events/${encodeURIComponent(id)}`),
        apiRequest("/categories"),
        apiRequest("/artists"),
        apiRequest("/venues"),
      ]);

      const eventResult = results[0];

      if (eventResult.status === "rejected") {
        throw eventResult.reason;
      }

      const eventData = eventResult.value;

      const event =
        eventData.event ||
        eventData.data?.event ||
        eventData.data;

      if (!event || !event.id) {
        throw new Error("Data event tidak ditemukan.");
      }

      if (results[1].status === "fulfilled") {
        setCategories(getList(results[1].value, ["categories"]));
      }

      if (results[2].status === "fulfilled") {
        setArtists(getList(results[2].value, ["artists"]));
      }

      if (results[3].status === "fulfilled") {
        setVenues(getList(results[3].value, ["venues"]));
      }

      const saleStart = formatDateTimeLocalInput(event.ticket_sale_start);
      const saleEnd = formatDateTimeLocalInput(event.ticket_sale_end);

      setForm({
        category_id: event.category_id ? String(event.category_id) : "",
        artist_id: event.artist_id ? String(event.artist_id) : "",
        venue_id: event.venue_id ? String(event.venue_id) : "",
        event_name: event.event_name || "",
        description: event.description || "",
        poster: event.poster || "",
        event_date: formatDateForInput(event.event_date),
        event_time: formatTimeForInput(event.event_time),
        ticket_sale_start_date: saleStart.date,
        ticket_sale_start_time: saleStart.time,
        ticket_sale_end_date: saleEnd.date,
        ticket_sale_end_time: saleEnd.time,
        status: event.status || "Coming Soon",
      });

      setPosterMode(
        event.poster && !/^https?:\/\//i.test(event.poster) ? "file" : "url"
      );
    } catch (err) {
      console.error("FETCH EDIT EVENT ERROR:", err);
      setError(err.message || "Gagal mengambil data event.");
    } finally {
      setLoading(false);
      setLoadingOptions(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!posterFile) {
      setFilePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(posterFile);
    setFilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [posterFile]);

  const preview =
    posterMode === "file" && filePreview
      ? filePreview
      : getPosterUrl(form.poster);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleStatusChange = (status) => {
    setForm((previous) => ({
      ...previous,
      status,
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Format poster harus JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran poster maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setPosterFile(file);
    setError("");
    setSuccess("");
  };

  const removeSelectedPoster = () => {
    setPosterFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function uploadPoster(eventId) {
    if (!posterFile) {
      throw new Error("Silakan pilih poster terlebih dahulu.");
    }

    if (!eventId) {
      throw new Error("ID event tidak ditemukan.");
    }

    const formData = new FormData();

    formData.append("poster", posterFile);
    formData.append("event_id", String(eventId));
    formData.append("eventId", String(eventId));
    formData.append("id", String(eventId));

    const data = await apiRequest("/uploads/event-poster", {
      method: "POST",
      body: formData,
    });

    const poster =
      data.poster ||
      data.data?.poster ||
      data.file?.path ||
      data.data?.file?.path ||
      data.path;

    if (!poster) {
      throw new Error("Server tidak mengembalikan lokasi poster.");
    }

    return poster;
  }

  function validateForm() {
    if (!id) return "ID event tidak ditemukan.";

    if (!form.category_id) return "Kategori event wajib dipilih.";
    if (!form.artist_id) return "Artis wajib dipilih.";
    if (!form.venue_id) return "Venue wajib dipilih.";
    if (!form.event_name.trim()) return "Nama event wajib diisi.";
    if (!form.event_date) return "Tanggal event wajib diisi.";
    if (!form.event_time) return "Waktu event wajib diisi.";

    if (!form.ticket_sale_start_date || !form.ticket_sale_start_time) {
      return "Jadwal mulai penjualan wajib diisi.";
    }

    if (!form.ticket_sale_end_date || !form.ticket_sale_end_time) {
      return "Jadwal akhir penjualan wajib diisi.";
    }

    const saleStart = new Date(
      `${form.ticket_sale_start_date}T${form.ticket_sale_start_time}:00`
    );

    const saleEnd = new Date(
      `${form.ticket_sale_end_date}T${form.ticket_sale_end_time}:00`
    );

    if (Number.isNaN(saleStart.getTime()) || Number.isNaN(saleEnd.getTime())) {
      return "Jadwal penjualan tiket tidak valid.";
    }

    if (saleStart >= saleEnd) {
      return "Waktu mulai penjualan harus lebih awal dari waktu berakhir.";
    }

    if (posterMode === "url" && !form.poster.trim()) {
      return "URL poster wajib diisi.";
    }

    if (posterMode === "file" && !posterFile && !form.poster.trim()) {
      return "Silakan pilih poster.";
    }

    return "";
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);

      let posterValue = form.poster.trim();

      if (posterMode === "file" && posterFile) {
        posterValue = await uploadPoster(id);
      }

      const payload = {
        category_id: Number(form.category_id),
        artist_id: Number(form.artist_id),
        venue_id: Number(form.venue_id),
        event_name: form.event_name.trim(),
        description: form.description.trim() || null,
        poster: posterValue || null,
        event_date: form.event_date,
        event_time: form.event_time,
        ticket_sale_start: `${form.ticket_sale_start_date} ${form.ticket_sale_start_time}:00`,
        ticket_sale_end: `${form.ticket_sale_end_date} ${form.ticket_sale_end_time}:00`,
        status: form.status,
      };

      const result = await apiRequest(`/events/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setForm((previous) => ({
        ...previous,
        poster: posterValue,
      }));

      setPosterFile(null);
      setSuccess(result.message || "Event berhasil diperbarui.");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        router.push(`/organizer/event/${id}`);
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("UPDATE EVENT ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat memperbarui event.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-xl bg-[#0B1220]/10" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220]/[0.06]">
            <Loader2 size={22} className="animate-spin text-[#0B1220]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[13.5px] font-semibold text-slate-800">
            Memuat data event...
          </p>
          <p className="mt-0.5 text-[12px] text-slate-400">
            Mengambil informasi event dan data pendukung
          </p>
        </div>
      </div>
    );
  }

  if (error && !form.event_name) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle size={22} />
          </div>

          <h2 className="mt-4 text-[15px] font-semibold text-slate-900">
            Event tidak dapat dimuat
          </h2>

          <p className="mt-2 text-[13px] leading-6 text-slate-500">{error}</p>

          <button
            onClick={loadData}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 text-[#0B1220]">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <Link
              href={`/organizer/event/${id}`}
              className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-white backdrop-blur transition hover:bg-white/[0.14]"
              aria-label="Kembali ke detail event"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                Edit Event
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Perbarui informasi, jadwal, dan poster event Anda. Perubahan
                akan langsung tersimpan setelah Anda menekan tombol simpan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-rose-800">
              Gagal menyimpan perubahan
            </p>
            <p className="mt-0.5 text-[12.5px] leading-5 text-rose-700">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 text-rose-400 transition hover:bg-rose-100 hover:text-rose-700"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <div>
            <p className="text-[12.5px] font-semibold text-emerald-800">
              Berhasil
            </p>
            <p className="mt-0.5 text-[12.5px] leading-5 text-emerald-700">
              {success}
            </p>
          </div>
        </div>
      )}

      <form id="edit-event-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="p-5 sm:p-6">
                <SectionHeader
                  icon={FileText}
                  title="Informasi Utama"
                  description="Informasi dasar mengenai event yang diselenggarakan."
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Kategori Event" required icon={Tag}>
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      disabled={loadingOptions}
                      className={`${inputClass} pl-9`}
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name || item.category_name || item.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Artis / Performer" required icon={UserRound}>
                    <select
                      name="artist_id"
                      value={form.artist_id}
                      onChange={handleChange}
                      disabled={loadingOptions}
                      className={`${inputClass} pl-9`}
                    >
                      <option value="">Pilih artis</option>
                      {artists.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name || item.artist_name || item.nama_artis}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Nama Event" required icon={Ticket}>
                      <input
                        type="text"
                        name="event_name"
                        value={form.event_name}
                        onChange={handleChange}
                        placeholder="Contoh: Konser Musik Indonesia"
                        className={`${inputClass} pl-9`}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Deskripsi Event" icon={FileText}>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tuliskan deskripsi lengkap mengenai event..."
                        className={`${inputClass} h-auto resize-y py-2.5`}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="p-5 sm:p-6">
                <SectionHeader
                  icon={CalendarDays}
                  title="Jadwal & Lokasi"
                  description="Atur tempat, tanggal, dan waktu penyelenggaraan event."
                />

                <div className="space-y-4">
                  <Field label="Venue" required icon={MapPin}>
                    <select
                      name="venue_id"
                      value={form.venue_id}
                      onChange={handleChange}
                      disabled={loadingOptions}
                      className={`${inputClass} pl-9`}
                    >
                      <option value="">Pilih venue</option>
                      {venues.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name || item.venue_name || item.nama_venue}
                          {item.city ? ` — ${item.city}` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Tanggal Event" required icon={CalendarDays}>
                      <input
                        type="date"
                        name="event_date"
                        value={form.event_date}
                        onChange={handleChange}
                        className={`${inputClass} pl-9`}
                      />
                    </Field>

                    <Field label="Waktu Event" required icon={Clock3}>
                      <input
                        type="time"
                        name="event_time"
                        value={form.event_time}
                        onChange={handleChange}
                        className={`${inputClass} pl-9`}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <h3 className="text-[12.5px] font-semibold text-emerald-800">
                          Mulai Penjualan
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <Field label="Tanggal Mulai" required>
                          <input
                            type="date"
                            name="ticket_sale_start_date"
                            value={form.ticket_sale_start_date}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Waktu Mulai" required>
                          <input
                            type="time"
                            name="ticket_sale_start_time"
                            value={form.ticket_sale_start_time}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <h3 className="text-[12.5px] font-semibold text-rose-800">
                          Berakhir Penjualan
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <Field label="Tanggal Berakhir" required>
                          <input
                            type="date"
                            name="ticket_sale_end_date"
                            value={form.ticket_sale_end_date}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Waktu Berakhir" required>
                          <input
                            type="time"
                            name="ticket_sale_end_time"
                            value={form.ticket_sale_end_time}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="p-5 sm:p-6">
                <SectionHeader
                  icon={Ticket}
                  title="Status Event"
                  description="Atur status ketersediaan event."
                />

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {STATUS_OPTIONS.map((status) => {
                    const active = form.status === status.value;

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => handleStatusChange(status.value)}
                        className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-semibold transition ${
                          active
                            ? "border-transparent bg-[#0B1220] text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            active ? "bg-white" : status.dot
                          }`}
                        />
                        <span className="truncate">{status.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11.5px] leading-5 text-slate-600">
                  <Info size={14} className="mt-0.5 shrink-0 text-slate-500" />
                  Status ini mengatur ketersediaan event. Persetujuan publikasi
                  event tetap mengikuti proses verifikasi administrator.
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="p-5 sm:p-6">
                <SectionHeader
                  icon={ImagePlus}
                  title="Poster Event"
                  description="Gunakan poster yang jelas dan berkualitas."
                />

                <div className="relative mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                  <div
                    className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-all duration-300 ${
                      posterMode === "file"
                        ? "translate-x-[calc(100%+4px)]"
                        : "translate-x-1"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handlePosterModeChange("url")}
                    className={`relative z-10 flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition-colors ${
                      posterMode === "url"
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Link2 size={13} />
                    URL Poster
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePosterModeChange("file")}
                    className={`relative z-10 flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition-colors ${
                      posterMode === "file"
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Upload size={13} />
                    Upload
                  </button>
                </div>

                {posterMode === "url" ? (
                  <Field label="URL Poster" required icon={Link2}>
                    <input
                      type="url"
                      name="poster"
                      value={form.poster}
                      onChange={handleChange}
                      placeholder="https://example.com/poster.jpg"
                      className={`${inputClass} pl-9`}
                    />
                  </Field>
                ) : (
                  <div>
                    <label className={labelClass}>Pilih File Poster</label>

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
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center transition hover:border-[#0B1220]/30 hover:bg-slate-50"
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1220]/[0.06] text-[#0B1220]">
                        <Upload size={18} />
                      </div>

                      <span className="text-[12.5px] font-semibold text-slate-700">
                        Klik untuk memilih poster
                      </span>

                      <span className="mt-0.5 text-[11px] text-slate-400">
                        JPG, PNG, WEBP · Maksimal 5 MB
                      </span>
                    </button>

                    {posterFile && (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-slate-800">
                            {posterFile.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {(posterFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={removeSelectedPoster}
                          className="rounded-md p-1.5 text-rose-500 transition hover:bg-rose-100"
                          title="Hapus pilihan poster"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-slate-600">
                      Preview Poster
                    </p>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-500">
                      Rasio 3:4
                    </span>
                  </div>

                  <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview poster event"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={34} strokeWidth={1.5} />
                        <p className="mt-2 text-[12px]">Belum ada poster</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1220]/[0.06] text-[#0B1220]">
                  <Info size={16} />
                </div>

                <div>
                  <h3 className="text-[13px] font-semibold text-[#0B1220]">
                    Informasi Pengaturan
                  </h3>
                  <p className="mt-1.5 text-[11.5px] leading-5 text-slate-600">
                    Perubahan di halaman ini hanya memperbarui informasi
                    event, jadwal, lokasi, poster, dan status ketersediaan.
                    Pengaturan kategori tiket, harga, dan denah kursi
                    dilakukan melalui menu terpisah.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[12px] text-slate-500">
            Pastikan seluruh informasi event sudah benar sebelum disimpan.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Link
              href={`/organizer/event/${id}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving || loadingOptions}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
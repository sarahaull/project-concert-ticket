
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

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const STATUS_OPTIONS = [
  "Coming Soon",
  "Available",
  "Limited",
  "Sold Out",
  "Cancelled",
];

function getPosterUrl(poster) {
  if (!poster) return "";
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_URL}/${poster.replace(/^\/+/, "")}`;
}

function formatDateForInput(value) {
  if (!value) return "";
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
}

function formatTimeForInput(value) {
  return value ? String(value).slice(0, 5) : "";
}

function formatDateTimeLocalInput(value) {
  if (!value) return { date: "", time: "" };

  const str = String(value);
  const match = str.match(
    /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/
  );

  if (match) {
    return { date: match[1], time: match[2] };
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

function InputLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
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
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const iconInputClass = `${inputClass} pl-11`;

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

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setLoadingOptions(true);
        setError("");

        const token = localStorage.getItem("token");
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const responses = await Promise.all([
          fetch(`${API_URL}/api/events/${id}`, { headers }),
          fetch(`${API_URL}/api/categories`, { headers }),
          fetch(`${API_URL}/api/artists`, { headers }),
          fetch(`${API_URL}/api/venues`, { headers }),
        ]);

        const [
          eventResponse,
          categoryResponse,
          artistResponse,
          venueResponse,
        ] = responses;

        const [
          eventData,
          categoryData,
          artistData,
          venueData,
        ] = await Promise.all(responses.map(readJson));

        if (!eventResponse.ok) {
          throw new Error(
            eventData.message || "Gagal mengambil data event."
          );
        }

        if (!eventData.success || !eventData.event) {
          throw new Error(
            eventData.message || "Data event tidak ditemukan."
          );
        }

        if (cancelled) return;

        const event = eventData.event;
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
          event.poster && !/^https?:\/\//i.test(event.poster)
            ? "file"
            : "url"
        );

        if (categoryResponse.ok) {
          setCategories(
            categoryData.categories || categoryData.data || []
          );
        }

        if (artistResponse.ok) {
          setArtists(
            artistData.artists || artistData.data || []
          );
        }

        if (venueResponse.ok) {
          setVenues(
            venueData.venues || venueData.data || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("FETCH EDIT EVENT ERROR:", err);
          setError(err.message || "Gagal mengambil data event.");
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

  useEffect(() => {
    if (!posterFile) {
      setFilePreview("");
      return;
    }

    const url = URL.createObjectURL(posterFile);
    setFilePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
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

  const uploadPoster = async () => {
    if (!posterFile) {
      throw new Error("Silakan pilih file poster terlebih dahulu.");
    }

    const formData = new FormData();
    formData.append("poster", posterFile);

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/uploads/event-poster`,
      {
        method: "POST",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        body: formData,
      }
    );

    const data = await readJson(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Gagal mengupload poster.");
    }

    if (!data.poster) {
      throw new Error("Server tidak mengembalikan lokasi poster.");
    }

    return data.poster;
  };

  const validateForm = () => {
    if (!form.category_id) return "Kategori event wajib dipilih.";
    if (!form.artist_id) return "Artis wajib dipilih.";
    if (!form.venue_id) return "Venue wajib dipilih.";
    if (!form.event_name.trim()) return "Nama event wajib diisi.";
    if (!form.event_date) return "Tanggal event wajib diisi.";
    if (!form.event_time) return "Waktu event wajib diisi.";

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

    const eventDate = new Date(
      `${form.event_date}T${form.event_time}`
    );

    const saleStart = new Date(
      `${form.ticket_sale_start_date}T${form.ticket_sale_start_time}`
    );

    const saleEnd = new Date(
      `${form.ticket_sale_end_date}T${form.ticket_sale_end_time}`
    );

    if (Number.isNaN(eventDate.getTime())) {
      return "Tanggal atau waktu event tidak valid.";
    }

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

    if (posterMode === "file" && !posterFile && !form.poster) {
      return "Silakan pilih poster yang akan diupload.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        posterValue = await uploadPoster();
      }

      const payload = {
        category_id: Number(form.category_id),
        artist_id: Number(form.artist_id),
        venue_id: Number(form.venue_id),
        event_name: form.event_name.trim(),
        description: form.description.trim(),
        poster: posterValue,
        event_date: form.event_date,
        event_time: form.event_time,
        ticket_sale_start:
          `${form.ticket_sale_start_date} ${form.ticket_sale_start_time}:00`,
        ticket_sale_end:
          `${form.ticket_sale_end_date} ${form.ticket_sale_end_time}:00`,
        status: form.status,
      };

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await readJson(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal memperbarui event."
        );
      }

      setSuccess(data.message || "Event berhasil diperbarui.");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        router.push(`/organizer/event/${id}`);
        router.refresh();
      }, 900);
    } catch (err) {
      console.error("UPDATE EVENT ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan event.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const preview =
    posterMode === "file" && filePreview
      ? filePreview
      : getPosterUrl(form.poster);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-blue-600"
          />
          <p className="mt-4 text-sm text-slate-500">
            Memuat data event...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0 pb-28">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/organizer/event" className="hover:text-blue-600">
                Event
              </Link>
              <span>/</span>
              <Link
                href={`/organizer/event/${id}`}
                className="hover:text-blue-600"
              >
                Detail
              </Link>
              <span>/</span>
              <span className="text-slate-600">Edit</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Edit Event
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Perbarui informasi event yang kamu kelola.
            </p>
          </div>

          <Link
            href={`/organizer/event/${id}`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Kembali
          </Link>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Gagal menyimpan perubahan</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
            <button type="button" onClick={() => setError("")}>
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Berhasil</p>
              <p className="mt-1 text-sm">{success}</p>
            </div>
          </div>
        )}

        <form id="edit-event-form" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Informasi Event
                </h2>
                <p className="mb-6 mt-1 text-sm text-slate-400">
                  Informasi dasar mengenai event.
                </p>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <InputLabel required>Kategori</InputLabel>
                    <div className="relative">
                      <FieldIcon><Tag size={18} /></FieldIcon>
                      <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        disabled={loadingOptions}
                        className={iconInputClass}
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name || item.category_name || item.nama_kategori}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <InputLabel required>Artis / Performer</InputLabel>
                    <div className="relative">
                      <FieldIcon><UserRound size={18} /></FieldIcon>
                      <select
                        name="artist_id"
                        value={form.artist_id}
                        onChange={handleChange}
                        disabled={loadingOptions}
                        className={iconInputClass}
                      >
                        <option value="">Pilih artis</option>
                        {artists.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name || item.artist_name || item.nama_artis}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputLabel required>Nama Event</InputLabel>
                    <div className="relative">
                      <FieldIcon><Ticket size={18} /></FieldIcon>
                      <input
                        name="event_name"
                        value={form.event_name}
                        onChange={handleChange}
                        placeholder="Contoh: GIGI Live Concert"
                        className={iconInputClass}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputLabel>Deskripsi Event</InputLabel>
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

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Lokasi & Waktu
                </h2>
                <p className="mb-6 mt-1 text-sm text-slate-400">
                  Atur lokasi dan jadwal penyelenggaraan event.
                </p>

                <div className="space-y-5">
                  <div>
                    <InputLabel required>Venue</InputLabel>
                    <div className="relative">
                      <FieldIcon><MapPin size={18} /></FieldIcon>
                      <select
                        name="venue_id"
                        value={form.venue_id}
                        onChange={handleChange}
                        disabled={loadingOptions}
                        className={iconInputClass}
                      >
                        <option value="">Pilih venue</option>
                        {venues.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name || item.venue_name || item.nama_venue}
                            {item.city ? ` — ${item.city}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <InputLabel required>Tanggal Event</InputLabel>
                      <div className="relative">
                        <FieldIcon><CalendarDays size={18} /></FieldIcon>
                        <input
                          type="date"
                          name="event_date"
                          value={form.event_date}
                          onChange={handleChange}
                          className={iconInputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <InputLabel required>Waktu Event</InputLabel>
                      <div className="relative">
                        <FieldIcon><Clock3 size={18} /></FieldIcon>
                        <input
                          type="time"
                          name="event_time"
                          value={form.event_time}
                          onChange={handleChange}
                          className={iconInputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-800">
                      Mulai Penjualan Tiket
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <InputLabel required>Tanggal</InputLabel>
                        <input
                          type="date"
                          name="ticket_sale_start_date"
                          value={form.ticket_sale_start_date}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <InputLabel required>Waktu</InputLabel>
                        <input
                          type="time"
                          name="ticket_sale_start_time"
                          value={form.ticket_sale_start_time}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-800">
                      Berakhir Penjualan Tiket
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <InputLabel required>Tanggal</InputLabel>
                        <input
                          type="date"
                          name="ticket_sale_end_date"
                          value={form.ticket_sale_end_date}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <InputLabel required>Waktu</InputLabel>
                        <input
                          type="time"
                          name="ticket_sale_end_time"
                          value={form.ticket_sale_end_time}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Status Event
                </h2>
                <p className="mb-5 mt-1 text-sm text-slate-400">
                  Tentukan status yang akan ditampilkan pada event.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {STATUS_OPTIONS.map((status) => {
                    const active = form.status === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, status }));
                          setError("");
                          setSuccess("");
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-blue-50"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Poster Event
                </h2>
                <p className="mb-5 mt-1 text-sm text-slate-400">
                  Gunakan URL atau upload poster baru.
                </p>

                <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => handlePosterModeChange("url")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      posterMode === "url"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Link2 size={16} /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosterModeChange("file")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      posterMode === "file"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Upload size={16} /> Upload
                  </button>
                </div>

                {posterMode === "url" ? (
                  <div className="mt-5">
                    <InputLabel>URL Poster</InputLabel>
                    <div className="relative">
                      <Link2
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
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
                      Gunakan URL gambar poster yang dapat diakses publik.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <InputLabel>Upload Poster</InputLabel>
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
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center hover:border-blue-300 hover:bg-blue-50/40"
                    >
                      <Upload size={24} className="text-blue-600" />
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        Pilih poster baru
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        JPG, PNG, WEBP • Maksimal 5 MB
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
                  </div>
                )}

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      Preview
                    </p>
                    {preview && <Eye size={17} className="text-slate-400" />}
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
                        <ImageIcon size={38} strokeWidth={1.5} />
                        <p className="mt-3 text-xs">Belum ada poster</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>

      {/* Tombol aksi selalu terlihat di bawah layar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <Link
            href={`/organizer/event/${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            <span>Batal</span>
          </Link>

          <button
            type="button"
            onClick={() =>
              document.getElementById("edit-event-form")?.requestSubmit()
            }
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
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

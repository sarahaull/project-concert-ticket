
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Save,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Camera,
  Hash,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? `${API_URL}/venues`
  : `${API_URL}/api/venues`;

const getToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
};

const getHeaders = (includeJson = false) => {
  const token = getToken();

  return {
    ...(includeJson
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
};

const normalizeVenue = (data) => ({
  id: data.id,
  name: data.venue_name || "",
  city: data.city || "",
  address: data.address || "",
  capacity:
    data.capacity === null || data.capacity === undefined
      ? ""
      : String(data.capacity),
  image: data.image || "",
  createdAt: data.created_at || null,
});

export default function EditVenuePage() {
  const params = useParams();
  const router = useRouter();

  const venueId = params?.id;

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    capacity: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState(false);

  // ========================================
  // GET DETAIL VENUE
  // ========================================

  const fetchVenue = useCallback(async () => {
    if (!venueId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(venueId)}`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Gagal mengambil data venue."
        );
      }

      const venueData = data.venue || data.data;

      if (!venueData) {
        throw new Error("Data venue tidak ditemukan.");
      }

      const normalized = normalizeVenue(venueData);

      setForm({
        name: normalized.name,
        city: normalized.city,
        address: normalized.address,
        capacity: normalized.capacity,
        image: normalized.image,
      });

      setImageError(false);
    } catch (err) {
      console.error("GET VENUE ERROR:", err);

      setError(
        err.message || "Terjadi kesalahan saat mengambil venue."
      );
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  // ========================================
  // INPUT HANDLER
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");

    if (name === "image") {
      setImageError(false);
    }
  };

  // ========================================
  // VALIDASI
  // ========================================

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Nama venue wajib diisi.";
    }

    if (!form.city.trim()) {
      return "Kota venue wajib diisi.";
    }

    if (!form.address.trim()) {
      return "Alamat venue wajib diisi.";
    }

    if (
      form.capacity === "" ||
      !Number.isFinite(Number(form.capacity)) ||
      Number(form.capacity) <= 0
    ) {
      return "Kapasitas venue harus lebih dari 0.";
    }

    if (!Number.isInteger(Number(form.capacity))) {
      return "Kapasitas harus berupa bilangan bulat.";
    }

    return "";
  };

  // ========================================
  // UPDATE VENUE
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        venue_name: form.name.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        capacity: Number(form.capacity),
        image: form.image.trim() || null,
      };

      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(venueId)}`,
        {
          method: "PUT",
          headers: getHeaders(true),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Gagal memperbarui venue."
        );
      }

      setSuccess(
        data.message || "Venue berhasil diperbarui."
      );

      // Pastikan detail mengambil data terbaru dari backend
      setTimeout(() => {
        router.push(`/superadmin/venues/${venueId}`);
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("UPDATE VENUE ERROR:", err);

      setError(
        err.message || "Terjadi kesalahan saat memperbarui venue."
      );

      setSaving(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-[#112250]" />

        <p className="text-sm font-medium text-[#8795A7]">
          Memuat data venue dari server...
        </p>
      </div>
    );
  }

  // ========================================
  // ERROR LOAD
  // ========================================

  if (error && !form.name && !form.city && !form.address) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center px-5 text-center">
        <AlertCircle size={35} className="text-red-500" />

        <h2 className="mt-4 text-base font-semibold text-[#112250]">
          Gagal memuat venue
        </h2>

        <p className="mt-2 text-sm text-[#8795A7]">
          {error}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={fetchVenue}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#DCE2EA] px-4 text-xs font-semibold text-[#112250]"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>

          <Link
            href="/superadmin/venues"
            className="flex h-10 items-center gap-2 rounded-xl bg-[#112250] px-4 text-xs font-semibold text-white"
          >
            <ArrowLeft size={14} />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-8">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(`/superadmin/venues/${venueId}`)
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white text-[#697F93] transition hover:bg-[#F5F7FA]"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8795A7]">
              Master Data / Venue / Edit
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#112250] sm:text-2xl">
              Edit Venue
            </h1>

            <p className="mt-1 text-xs text-[#697F93]">
              Perbarui informasi venue dari database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#DDE3EB] bg-white px-3 py-2">
          <Hash size={14} className="text-[#8795A7]" />

          <span className="text-xs font-medium text-[#53657D]">
            ID Venue: {venueId}
          </span>
        </div>
      </div>

      {/* ALERT ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="min-w-0">
            <p className="text-xs font-semibold text-red-700">
              Gagal memperbarui venue
            </p>

            <p className="mt-1 break-words text-xs text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-red-500"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ALERT SUCCESS */}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2
            size={17}
            className="text-emerald-600"
          />

          <p className="text-xs font-semibold text-emerald-700">
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* INFORMASI VENUE */}

        <section className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">

          <div className="border-b border-[#E8ECF1] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                <Building2 size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#112250]">
                  Informasi Venue
                </h2>

                <p className="mt-1 text-[11px] text-[#8795A7]">
                  Ubah informasi utama venue.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">

            <InputField
              label="Nama Venue"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama venue"
              required
            />

            <InputField
              label="Kota"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Masukkan kota venue"
              required
            />

            <InputField
              label="Kapasitas"
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Masukkan kapasitas"
              required
              min="1"
            />

            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#53657D]">
                <MapPin size={14} />
                Alamat Venue
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                required
                placeholder="Masukkan alamat lengkap venue"
                className="w-full resize-none rounded-xl border border-[#DCE2EA] bg-white px-3 py-3 text-xs text-[#112250] outline-none transition placeholder:text-[#A0AAB7] focus:border-[#8BA7CF] focus:ring-4 focus:ring-[#8BA7CF]/10"
              />
            </div>

          </div>
        </section>

        {/* GAMBAR VENUE */}

        <section className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">

          <div className="border-b border-[#E8ECF1] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                <Camera size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#112250]">
                  Gambar Venue
                </h2>

                <p className="mt-1 text-[11px] text-[#8795A7]">
                  Perbarui URL gambar venue.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">

            {/* IMAGE PREVIEW */}

            <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl border border-[#E5EAF0] bg-[#F5F7FA] sm:min-h-[280px]">

              {form.image && !imageError ? (
                <img
                  src={form.image}
                  alt={form.name || "Venue"}
                  className="max-h-[350px] w-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#9AA6B2]">
                  <ImageIcon size={38} />

                  <p className="text-xs">
                    {form.image
                      ? "Gambar tidak dapat dimuat"
                      : "Belum ada gambar venue"}
                  </p>
                </div>
              )}

            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#53657D]">
                URL Gambar
              </label>

              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/venue.jpg"
                className="h-11 w-full rounded-xl border border-[#DCE2EA] px-3 text-xs text-[#112250] outline-none transition placeholder:text-[#A0AAB7] focus:border-[#8BA7CF] focus:ring-4 focus:ring-[#8BA7CF]/10"
              />

              <p className="mt-2 text-[10px] leading-5 text-[#8795A7]">
                Masukkan URL gambar yang dapat diakses publik. Kosongkan
                jika ingin menghapus gambar yang tersimpan.
              </p>
            </div>

          </div>
        </section>

        {/* INFORMASI KAPASITAS */}

        <section className="rounded-2xl border border-[#DDE3EB] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
              <Users size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#112250]">
                Ringkasan Kapasitas
              </h2>

              <p className="mt-1 text-[11px] text-[#8795A7]">
                Kapasitas venue yang akan disimpan.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#F5F7FA] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8795A7]">
              Total kapasitas
            </p>

            <p className="mt-2 text-3xl font-bold text-[#112250]">
              {form.capacity
                ? new Intl.NumberFormat("id-ID").format(
                    Number(form.capacity)
                  )
                : "0"}
            </p>

            <p className="mt-1 text-xs text-[#8795A7]">
              Orang
            </p>
          </div>
        </section>

        {/* ACTION */}

        <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              router.push(`/superadmin/venues/${venueId}`)
            }
            className="h-11 rounded-xl border border-[#DCE2EA] bg-white px-5 text-xs font-semibold text-[#697F93] transition hover:bg-[#F5F7FA] disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-6 text-xs font-semibold text-white transition hover:bg-[#1B3560] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
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

      </form>
    </div>
  );
}

// ========================================
// INPUT COMPONENT
// ========================================

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#53657D]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-white px-3 text-xs text-[#112250] outline-none transition placeholder:text-[#A0AAB7] focus:border-[#8BA7CF] focus:ring-4 focus:ring-[#8BA7CF]/10"
      />
    </div>
  );
}

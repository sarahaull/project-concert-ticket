"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Save,
  ImagePlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Hash,
  Info,
  Globe,
  Camera,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? `${API_URL}/venues`
  : `${API_URL}/api/venues`;

export default function NewVenuePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    venue_name: "",
    city: "",
    address: "",
    capacity: "",
    image: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const venueName = form.venue_name.trim();
    const city = form.city.trim();
    const address = form.address.trim();
    const capacity = Number(form.capacity);

    if (!venueName || !city || !address || !form.capacity) {
      setError("Nama venue, kota, alamat, dan kapasitas wajib diisi.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setError("Kapasitas harus berupa angka bulat lebih dari 0.");
      return;
    }

    if (form.image.trim()) {
      try {
        new URL(form.image.trim());
      } catch {
        setError("URL gambar tidak valid. Masukkan URL gambar yang benar.");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          venue_name: venueName,
          city,
          address,
          capacity,
          image: form.image.trim() || null,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Gagal menambahkan venue ke database."
        );
      }

      setSuccess(result.message || "Venue berhasil ditambahkan.");

      setTimeout(() => {
        router.push("/superadmin/venues");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("Create venue error:", err);
      setError(
        err.message || "Terjadi kesalahan saat menghubungkan ke server."
      );
      setSaving(false);
    }
  };

  // Progress: 3 field wajib + image opsional
  const filledCount = [
    form.venue_name.trim(),
    form.city.trim(),
    form.address.trim(),
    form.capacity,
  ].filter(Boolean).length;
  const progress = Math.round((filledCount / 4) * 100);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 px-1 pb-10 sm:space-y-6 sm:px-2 lg:px-0">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/superadmin/venues")}
            aria-label="Kembali"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white text-[#697F93] transition hover:bg-slate-50 active:scale-95 sm:mt-1"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8795A7]">
              <Building2 size={11} />
              Master Data / Venue / Tambah
            </div>
            <h1 className="mt-1 text-xl font-semibold text-[#112250] sm:text-2xl">
              Tambah Venue Baru
            </h1>
            <p className="mt-1 text-xs text-[#8795A7] sm:text-sm">
              Tambahkan lokasi baru yang dapat digunakan untuk berbagai event.
            </p>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Link
            href="/superadmin/venues"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] bg-white px-4 text-xs font-semibold text-[#53657D] transition hover:bg-slate-50 active:scale-[0.98] sm:flex-none"
          >
            <ArrowLeft size={14} />
            Kembali
          </Link>
        </div>
      </div>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DDE3EB] bg-gradient-to-br from-[#0D1D35] via-[#142B4B] to-[#1D3A61] p-5 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold sm:text-lg">
                Lengkapi Data Venue
              </h2>
              <p className="mt-1 max-w-lg text-xs leading-5 text-white/70 sm:text-sm">
                Isi informasi utama venue dengan lengkap agar dapat digunakan
                pada event. Tanda <span className="text-red-300">*</span>{" "}
                menandakan field wajib.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full shrink-0 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur sm:w-56">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/70">
              <span>Kelengkapan</span>
              <span className="text-white">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-white/60">
              {filledCount} dari 4 field wajib terisi
            </p>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="leading-6">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <p className="leading-6">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        {/* LEFT: FORM */}
        <div className="space-y-4 sm:space-y-5 lg:col-span-2">
          {/* INFORMASI VENUE */}
          <section className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#EDF0F4] bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#53657D] sm:h-10 sm:w-10">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#112250]">
                  Informasi Venue
                </h2>
                <p className="mt-0.5 text-[10px] text-[#8795A7] sm:text-[11px]">
                  Lengkapi informasi utama mengenai lokasi venue.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:gap-5 sm:p-6 md:grid-cols-2">
              <InputField
                label="Nama Venue"
                name="venue_name"
                value={form.venue_name}
                onChange={handleChange}
                placeholder="Contoh: Gelora Bung Karno"
                icon={Building2}
                required
              />

              <InputField
                label="Kota"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Contoh: Jakarta"
                icon={MapPin}
                required
              />

              <InputField
                label="Kapasitas (Orang)"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleChange}
                placeholder="Contoh: 50000"
                icon={Users}
                required
                min="1"
              />

              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#112250] sm:text-xs">
                  <MapPin size={14} className="text-[#53657D]" />
                  Alamat Lengkap
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Masukkan alamat lengkap venue..."
                  className="w-full resize-none rounded-xl border border-[#DCE2EA] bg-[#F8FAFC] px-3.5 py-3 text-sm font-medium leading-relaxed text-[#112250] outline-none transition-all placeholder:text-[#9AA6B2] focus:border-[#315A91] focus:bg-white focus:ring-4 focus:ring-[#315A91]/10 sm:px-4 sm:py-3.5"
                />
              </div>
            </div>
          </section>

          {/* GAMBAR VENUE */}
          <section className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#EDF0F4] bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#53657D] sm:h-10 sm:w-10">
                <Camera size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#112250]">
                  Gambar Venue
                </h2>
                <p className="mt-0.5 text-[10px] text-[#8795A7] sm:text-[11px]">
                  Masukkan URL gambar venue untuk ditampilkan pada halaman.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              <InputField
                label="URL Gambar"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/gambar-venue.jpg"
                icon={Globe}
                type="url"
              />

              {form.image.trim() && (
                <div className="overflow-hidden rounded-xl border border-[#E5EAF0] bg-[#F6F8FA]">
                  <div className="flex items-center gap-2 border-b border-[#E5EAF0] bg-white px-4 py-2.5">
                    <ImagePlus size={13} className="text-[#53657D]" />
                    <p className="text-[11px] font-semibold text-[#53657D]">
                      Preview Gambar
                    </p>
                  </div>
                  <img
                    src={form.image}
                    alt="Preview venue"
                    className="max-h-72 w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = "block";
                    }}
                  />
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg bg-[#F5F7FA] p-3 text-[11px] leading-5 text-[#697F93]">
                <Info size={14} className="mt-0.5 shrink-0 text-[#8795A7]" />
                <p>
                  Isi dengan URL gambar langsung. Kosongkan jika venue belum
                  memiliki gambar.
                </p>
              </div>
            </div>
          </section>

          {/* INFO PENYIMPANAN */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-[#F5F7FA] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#53657D] shadow-sm">
                <Info size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#112250]">
                  Informasi penyimpanan
                </h3>
                <p className="mt-1 text-[11px] leading-6 text-[#697F93] sm:text-xs">
                  Data venue akan disimpan langsung ke database melalui API
                  backend TicketVerse. Data yang dikirim meliputi nama venue,
                  kota, alamat, kapasitas, dan URL gambar.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="space-y-4 sm:space-y-5">
          {/* RINGKASAN */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#53657D]">
                <Sparkles size={15} />
              </div>
              <h2 className="text-sm font-semibold text-[#112250]">
                Ringkasan Venue
              </h2>
            </div>

            <div className="mt-4 rounded-xl bg-[#F3F6FA] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8795A7]">
                Nama Venue
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-[#112250]">
                {form.venue_name.trim() || "Belum diisi"}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#697F93]">
                <MapPin size={12} />
                {form.city.trim() || "Kota belum diisi"}
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#697F93]">
                <Users size={12} />
                {form.capacity
                  ? `${new Intl.NumberFormat("id-ID").format(
                      Number(form.capacity) || 0
                    )} orang`
                  : "Kapasitas belum diisi"}
              </div>

              <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-[#697F93]">
                <Hash size={12} className="mt-0.5 shrink-0" />
                <span className="break-words">
                  {form.address.trim() || "Alamat belum diisi"}
                </span>
              </div>
            </div>
          </section>

          {/* CHECKLIST */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#53657D]">
                <CheckCircle2 size={15} />
              </div>
              <h2 className="text-sm font-semibold text-[#112250]">
                Kelengkapan Data
              </h2>
            </div>

            <div className="mt-4 space-y-2.5">
              <ChecklistItem
                label="Nama Venue"
                done={!!form.venue_name.trim()}
              />
              <ChecklistItem label="Kota" done={!!form.city.trim()} />
              <ChecklistItem label="Alamat" done={!!form.address.trim()} />
              <ChecklistItem label="Kapasitas" done={!!form.capacity} />
              <ChecklistItem
                label="Gambar (opsional)"
                done={!!form.image.trim()}
                optional
              />
            </div>
          </section>

          {/* TOMBOL AKSI */}
          <section className="space-y-2 rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-5">
            <button
              type="submit"
              form="venue-form"
              disabled={saving}
              onClick={handleSubmit}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-xs font-semibold text-white transition hover:bg-[#1B3560] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-sm"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Venue
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/superadmin/venues")}
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] bg-white px-5 text-xs font-semibold text-[#53657D] transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50 sm:h-12 sm:text-sm"
            >
              <ArrowLeft size={15} />
              Batal
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  icon: Icon,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#112250] sm:text-xs">
        {Icon && <Icon size={14} className="text-[#53657D]" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#F8FAFC] px-3.5 text-sm font-medium text-[#112250] outline-none transition-all placeholder:text-[#9AA6B2] focus:border-[#315A91] focus:bg-white focus:ring-4 focus:ring-[#315A91]/10 sm:h-12 sm:px-4"
      />
    </div>
  );
}

function ChecklistItem({ label, done, optional = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done
            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
            : "border-[#DCE2EA] bg-[#F5F7FA] text-[#9AA6B2]"
        }`}
      >
        {done ? <CheckCircle2 size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <span
        className={`text-xs font-medium ${
          done ? "text-[#334155]" : "text-[#8795A7]"
        }`}
      >
        {label}
      </span>
      {optional && (
        <span className="ml-auto rounded-md bg-[#F1F4F8] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#8795A7]">
          Opsional
        </span>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  CameraIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  LockClosedIcon,
  FingerPrintIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ArrowPathIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");
const PROFILE_URL = `${API_URL}/api/users/profile`;

const getToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
};

const getPhotoUrl = (photo) => {
  if (!photo) return null;

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://") ||
    photo.startsWith("data:")
  ) {
    return photo;
  }

  return `${API_URL}/${photo.replace(/^\/+/, "")}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function ProfilSuperAdmin() {
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    gender: "",
    birth_date: "",
    role: "",
    photo: "",
  });

  // ============================================================
  // AMBIL PROFIL DARI BACKEND
  // ============================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch(PROFILE_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Gagal mengambil data profil."
        );
      }

      const user = data.user || data.data?.user || data.data;

      if (!user) {
        throw new Error("Data profil tidak ditemukan dari backend.");
      }

      setProfile(user);

      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        birth_date: user.birth_date
          ? String(user.birth_date).substring(0, 10)
          : "",
        role: user.role || "",
        photo: user.photo || "",
      });

      setPhotoPreview(getPhotoUrl(user.photo));
    } catch (err) {
      console.error("FETCH PROFILE ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // PILIH FOTO PROFIL
  // ============================================================

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setError("");
    setSuccess("");

    setSelectedPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  // ============================================================
  // SIMPAN PERUBAHAN PROFIL
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.fullname.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);

      const token = getToken();

      if (!token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const payload = new FormData();

      payload.append("fullname", formData.fullname.trim());
      payload.append("phone", formData.phone.trim());
      payload.append("gender", formData.gender);
      payload.append("birth_date", formData.birth_date || "");

      if (selectedPhoto) {
        payload.append("photo", selectedPhoto);
      }

      const response = await fetch(PROFILE_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Gagal memperbarui profil."
        );
      }

      const updatedUser =
        data.user || data.data?.user || data.data;

      if (updatedUser && typeof updatedUser === "object") {
        setProfile(updatedUser);

        setFormData((prev) => ({
          ...prev,
          fullname: updatedUser.fullname ?? prev.fullname,
          email: updatedUser.email ?? prev.email,
          phone: updatedUser.phone ?? prev.phone,
          gender: updatedUser.gender ?? prev.gender,
          birth_date: updatedUser.birth_date
            ? String(updatedUser.birth_date).substring(0, 10)
            : prev.birth_date,
          role: updatedUser.role ?? prev.role,
          photo: updatedUser.photo ?? prev.photo,
        }));

        setPhotoPreview(
          getPhotoUrl(updatedUser.photo || formData.photo)
        );
      } else {
        await fetchProfile();
      }

      setSelectedPhoto(null);
      setSuccess(data.message || "Profil berhasil diperbarui.");
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      setError(err.message || "Gagal menyimpan perubahan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-[#112250]" />
          <p className="text-sm font-medium text-gray-500">
            Memuat profil akun...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR LOAD
  // ============================================================

  if (error && !profile) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
        <ExclamationTriangleIcon className="mx-auto h-10 w-10 text-rose-500" />

        <h2 className="mt-3 text-lg font-bold text-gray-900">
          Gagal Memuat Profil
        </h2>

        <p className="mt-2 text-sm text-gray-500">{error}</p>

        <button
          type="button"
          onClick={fetchProfile}
          className="mt-5 rounded-lg bg-[#112250] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3B507D]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const roleLabel = formData.role
    ? formData.role.replaceAll("_", " ")
    : "Super Admin";

  return (
    <div className="w-full space-y-6 text-[#112250]">

      {/* HEADER PROFIL */}
      <section className="relative overflow-hidden rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />

        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl" />

        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#8ab4f8]/60 to-[#5a8ad0]/60 p-[2px]">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#0a1628] bg-[#13213b]">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-16 w-16 text-[#8ab4f8]/80" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white text-[#0a1628] shadow-lg transition hover:bg-gray-100"
              aria-label="Ubah foto profil"
            >
              <CameraIcon className="h-4 w-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa0c0] sm:justify-start">
              <span>Super Admin</span>
              <ChevronRightIcon className="h-3 w-3 text-[#8aa0c0]/50" />
              <span>Profil Saya</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
              <ShieldCheckIcon className="h-3 w-3 text-emerald-400" />
              Akun Super Admin
            </div>

            <h1 className="mt-2.5 text-[24px] font-bold leading-tight tracking-tight text-white sm:text-[28px]">
              {formData.fullname || "Nama Pengguna"}
            </h1>

            <p className="mt-1 flex items-center justify-center gap-1.5 text-[12.5px] font-medium capitalize text-[#8ab4f8] sm:justify-start">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              {roleLabel}
            </p>

            <p className="mt-2 text-[13px] text-[#8aa0c0]">
              Kelola informasi akun Super Admin TicketVerse Anda.
            </p>
          </div>
        </div>
      </section>

      {/* NOTIFIKASI */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-rose-600" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-700">
            {success}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* KOLOM KIRI */}
        <div className="space-y-6 lg:col-span-2">

          {/* INFORMASI PRIBADI */}
          <div className="overflow-hidden rounded-2xl border border-[#e0e8f0]/60 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0a1628]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#112250]/[0.05] text-[#112250]">
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                </span>
                Informasi Pribadi
              </h2>

              <p className="mt-0.5 text-[11px] text-[#7e91b2]">
                Perbarui data diri yang tersimpan di database.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* NAMA */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama lengkap"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    Alamat Email
                  </label>

                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="h-10 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-[13px] text-gray-500 outline-none"
                    />
                  </div>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Email akun tidak dapat diubah melalui halaman ini.
                  </p>
                </div>

                {/* TELEPON */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    Nomor Telepon
                  </label>

                  <div className="relative">
                    <DevicePhoneMobileIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Masukkan nomor telepon"
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-[13px] text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                    />
                  </div>
                </div>

                {/* JENIS KELAMIN */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    Jenis Kelamin
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* TANGGAL LAHIR */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    Tanggal Lahir
                  </label>

                  <div className="relative">
                    <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-[13px] text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                    />
                  </div>
                </div>

                {/* ROLE */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    Hak Akses
                  </label>

                  <input
                    type="text"
                    value={roleLabel}
                    readOnly
                    className="h-10 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] capitalize text-gray-500 outline-none"
                  />
                </div>
              </div>

              {/* ACTION */}
              <div className="mt-5 flex flex-col-reverse items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">

                <p className="text-[11px] text-gray-400">
                  Perubahan akan disimpan ke akun Anda.
                </p>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#112250] px-5 text-[13px] font-bold text-white transition hover:bg-[#3B507D] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* KEAMANAN */}
          <div className="overflow-hidden rounded-2xl border border-[#e0e8f0]/60 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0a1628]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#112250]/[0.05] text-[#112250]">
                  <KeyIcon className="h-3.5 w-3.5" />
                </span>
                Keamanan Akun
              </h2>

              <p className="mt-0.5 text-[11px] text-[#7e91b2]">
                Informasi keamanan akun Super Admin.
              </p>
            </div>

            <div className="divide-y divide-gray-100">

              <div className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#112250]/[0.05] text-[#112250]">
                    <LockClosedIcon className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-[#112250]">
                      Kata Sandi
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Gunakan fitur pengaturan keamanan untuk mengganti kata sandi.
                    </p>
                  </div>
                </div>

                <span className="inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-[11px] font-semibold text-gray-500">
                  Endpoint belum tersedia
                </span>
              </div>

              <div className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#112250]/[0.05] text-[#112250]">
                    <FingerPrintIcon className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-[#112250]">
                      Autentikasi Akun
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Autentikasi menggunakan token login.
                    </p>
                  </div>
                </div>

                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-[11.5px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Terautentikasi
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e] p-5 shadow-sm">

            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5a8ad0]/15 blur-2xl" />

            <div className="relative">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] text-[#8ab4f8]">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>

              <h3 className="mt-3 text-[13px] font-bold text-white">
                Informasi Akun
              </h3>

              <p className="mt-0.5 text-[11.5px] text-[#8aa0c0]">
                Data akun berdasarkan database TicketVerse.
              </p>

              <div className="mt-5 space-y-4">

                <div className="flex items-start justify-between gap-3 text-[12px]">
                  <span className="text-[#8aa0c0]">
                    Nama Pengguna
                  </span>

                  <span className="max-w-[60%] break-words text-right font-bold text-white">
                    {formData.fullname || "-"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 text-[12px]">
                  <span className="text-[#8aa0c0]">
                    Email
                  </span>

                  <span className="max-w-[60%] break-all text-right font-bold text-white">
                    {formData.email || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="text-[#8aa0c0]">
                    Level Akses
                  </span>

                  <span className="font-bold capitalize text-white">
                    {roleLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="text-[#8aa0c0]">
                    Bergabung Sejak
                  </span>

                  <span className="text-right font-bold text-white">
                    {formatDate(profile?.created_at)}
                  </span>
                </div>

              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#8aa0c0]">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
                  Data diambil dari server
                </div>
              </div>

            </div>
          </div>

          {/* FOTO PROFIL */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-2">
              <CameraIcon className="h-5 w-5 text-[#112250]" />

              <h3 className="text-[13px] font-bold text-[#112250]">
                Foto Profil
              </h3>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              Gunakan foto profil yang jelas. Format gambar maksimal 5 MB.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#112250]/20 bg-[#112250]/[0.04] px-4 py-2.5 text-[12px] font-bold text-[#112250] transition hover:bg-[#112250]/10"
            >
              <CameraIcon className="h-4 w-4" />
              Pilih Foto Baru
            </button>

            {selectedPhoto && (
              <p className="mt-2 break-all text-[10px] text-emerald-600">
                Foto dipilih: {selectedPhoto.name}. Klik Simpan Perubahan untuk mengunggah.
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

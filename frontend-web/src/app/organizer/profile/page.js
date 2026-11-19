
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Building2,
  CalendarDays,
  Camera,
  Pencil,
  Save,
  X,
  Loader2,
  Ticket,
  Wallet,
  CalendarCheck,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

// ============================================================
// API CONFIGURATION
// Bisa menggunakan:
// http://localhost:5000
// atau http://localhost:5000/api
// ============================================================

const API_URL_RAW =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_BASE = API_URL_RAW.replace(/\/+$/, "").endsWith("/api")
  ? API_URL_RAW.replace(/\/+$/, "")
  : `${API_URL_RAW.replace(/\/+$/, "")}/api`;

const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

const easePremium = [0.22, 1, 0.36, 1];

const initialForm = {
  fullname: "",
  email: "",
  phone: "",
  gender: "",
  birth_date: "",
  address: "",
  organization_name: "",
};

// ============================================================
// HELPER
// ============================================================

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
}

function getImageUrl(photo) {
  if (!photo || typeof photo !== "string") return null;

  const value = photo.trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `${API_ORIGIN}/${value.replace(/^\/+/, "")}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "EO";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function buildForm(profile) {
  return {
    fullname: profile?.fullname || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    gender: profile?.gender || "",
    birth_date: profile?.birth_date
      ? String(profile.birth_date).slice(0, 10)
      : "",
    address: profile?.address || "",
    organization_name: profile?.organization_name || "",
  };
}

function getEventStatus(status) {
  const value = String(status || "").toLowerCase();

  if (["available", "active", "published"].includes(value)) {
    return {
      label: "Tersedia",
      className: "bg-sky-50 text-sky-700",
    };
  }

  if (["limited", "almost_sold"].includes(value)) {
    return {
      label: "Tiket Terbatas",
      className: "bg-amber-50 text-amber-700",
    };
  }

  if (["sold_out", "soldout"].includes(value)) {
    return {
      label: "Sold Out",
      className: "bg-slate-900 text-white",
    };
  }

  if (["cancelled", "canceled"].includes(value)) {
    return {
      label: "Dibatalkan",
      className: "bg-rose-50 text-rose-700",
    };
  }

  if (["completed", "ended"].includes(value)) {
    return {
      label: "Selesai",
      className: "bg-slate-100 text-slate-600",
    };
  }

  return {
    label: status || "Belum tersedia",
    className: "bg-slate-100 text-slate-600",
  };
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function OrganizerProfilePage() {
  const fileInputRef = useRef(null);
  const isEditingRef = useRef(false);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [activeTab, setActiveTab] = useState("profile");

  // ============================================================
  // AUTH FETCH
  // ============================================================

  const authFetch = useCallback(async (url, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Sesi login tidak ditemukan. Silakan login kembali."
      );
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        result?.message || `Request gagal (${response.status}).`
      );
    }

    if (result?.success === false) {
      throw new Error(result.message || "Request gagal.");
    }

    return result;
  }, []);

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  const loadData = useCallback(
    async (showRefresh = false, forceUpdateForm = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [profileResult, statsResult, eventsResult] =
          await Promise.all([
            authFetch(`${API_BASE}/organizer/profile`),
            authFetch(`${API_BASE}/organizer/stats`),
            authFetch(`${API_BASE}/organizer/events`),
          ]);

        const profileData = profileResult?.data || {};
        const statsData = statsResult?.data || {};

        const eventsData = Array.isArray(eventsResult?.data)
          ? eventsResult.data
          : [];

        setProfile(profileData);
        setStats(statsData);
        setEvents(eventsData);

        // Update form hanya jika tidak sedang mengedit
        // atau memang dipaksa setelah berhasil menyimpan.
        if (!isEditingRef.current || forceUpdateForm) {
          setForm(buildForm(profileData));
        }

        setPhotoLoadError(false);
      } catch (err) {
        setError(
          err.message || "Gagal mengambil data dari server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // PREVIEW PHOTO
  // ============================================================

  useEffect(() => {
    if (!selectedFile) {
      setPreviewImage(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);

    setPreviewImage(objectUrl);
    setPhotoLoadError(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SELECT PHOTO
  // ============================================================

  const handleSelectPhoto = (event) => {
    const file = event.target.files?.[0];

    setUploadError("");

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Foto harus berformat JPG, PNG, atau WEBP."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran foto maksimal 5 MB.");

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPhotoLoadError(false);
  };

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  const handleCancelEdit = () => {
    isEditingRef.current = false;

    setForm(buildForm(profile));
    setSelectedFile(null);
    setUploadError("");
    setEditing(false);
    setError("");
    setPhotoLoadError(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!form.fullname.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    setUploadError("");

    try {
      const formData = new FormData();

      formData.append("fullname", form.fullname.trim());
      formData.append("phone", form.phone || "");
      formData.append("gender", form.gender || "");
      formData.append("birth_date", form.birth_date || "");

      // Field ini dikirim agar bisa diproses
      // jika backend sudah mendukung organizer_profiles.
      formData.append("address", form.address || "");
      formData.append(
        "organization_name",
        form.organization_name || ""
      );

      // Harus sama dengan uploadProfile.single("avatar")
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const result = await authFetch(
        `${API_BASE}/organizer/profile`,
        {
          method: "PUT",
          body: formData,
        }
      );

      // Ambil data terbaru dari database.
      const updatedProfile = result?.data;

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      // Hapus preview lokal setelah server berhasil menerima file.
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Matikan mode edit sebelum load ulang.
      isEditingRef.current = false;
      setEditing(false);

      // GET ulang agar foto berasal dari database.
      await loadData(false, true);

      setSuccess(
        result?.message || "Profil berhasil diperbarui."
      );
    } catch (err) {
      setError(
        err.message || "Gagal menyimpan profil."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // PHOTO URL
  // ============================================================

  const savedPhoto = getImageUrl(
    profile?.photo || profile?.avatar
  );

  const currentPhoto = previewImage || savedPhoto;

  // ============================================================
  // STATISTICS
  // ============================================================

  const statCards = [
    {
      label: "Total Event",
      value: formatNumber(stats?.total_events),
      description: "Event yang dibuat",
      icon: CalendarCheck,
    },
    {
      label: "Event Mendatang",
      value: formatNumber(stats?.upcoming_events),
      description: "Event yang akan datang",
      icon: CalendarDays,
    },
    {
      label: "Tiket Terjual",
      value: formatNumber(stats?.sold_tickets),
      description: "Total tiket terjual",
      icon: Ticket,
    },
    {
      label: "Total Pendapatan",
      value: formatCurrency(stats?.total_revenue),
      description: "Pendapatan event",
      icon: Wallet,
    },
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading && !profile) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-sky-600" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            Memuat profil organizer...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR PAGE
  // ============================================================

  if (!profile && error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <AlertCircle className="h-8 w-8 text-rose-500" />

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Profil tidak dapat dimuat
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          type="button"
          onClick={() => loadData()}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-w-0 space-y-6"
    >
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Organizer</span>
            <span>/</span>
            <span className="text-sky-600">Profil Saya</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Profil Saya
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola informasi akun dan profil organizer kamu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {/* ALERT */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROFILE HERO */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 sm:h-40">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-lg sm:h-32 sm:w-32">
                {currentPhoto && !photoLoadError ? (
                  <img
                    key={currentPhoto}
                    src={currentPhoto}
                    alt="Foto profil organizer"
                    className="h-full w-full object-cover"
                    onError={() => setPhotoLoadError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-3xl font-bold text-slate-600">
                    {getInitials(profile?.fullname)}
                  </div>
                )}

                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition hover:opacity-100"
                    title="Ganti foto profil"
                  >
                    <Camera size={25} />
                  </button>
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  {profile?.fullname || "Organizer"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {profile?.email || "-"}
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  <ShieldCheck size={13} />
                  Event Organizer
                </div>
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  isEditingRef.current = true;

                  setEditing(true);
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Pencil size={15} />
                Edit Profil
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleSelectPhoto}
            className="hidden"
          />

          {editing && (
            <div className="mt-5 rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2.5 text-sky-600">
                    <ImagePlus size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Foto Profil
                    </p>

                    <p className="text-xs text-slate-500">
                      JPG, PNG, WEBP. Maksimal 5 MB.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                >
                  Pilih Foto
                </button>
              </div>

              {selectedFile && (
                <p className="mt-3 text-xs font-medium text-sky-700">
                  Foto dipilih: {selectedFile.name}
                </p>
              )}

              {uploadError && (
                <p className="mt-2 text-xs text-rose-600">
                  {uploadError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Icon size={20} />
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                {item.label}
              </p>

              <h3 className="mt-1 break-words text-xl font-bold text-slate-900">
                {item.value}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`border-b-2 pb-3 text-sm font-semibold ${
              activeTab === "profile"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Informasi Profil
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`border-b-2 pb-3 text-sm font-semibold ${
              activeTab === "events"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Event Saya ({events.length})
          </button>
        </div>
      </div>

      {/* PROFILE FORM */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900">
                Informasi Pribadi
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Informasi akun dan identitas organizer.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                label="Nama Lengkap"
                icon={<UserRound size={16} />}
              >
                <input
                  type="text"
                  name="fullname"
                  value={form.fullname}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  placeholder="Masukkan nama lengkap"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Email"
                icon={<Mail size={16} />}
              >
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className={`${inputClass} bg-slate-50`}
                />

                <p className="mt-1 text-xs text-slate-400">
                  Email akun tidak dapat diubah.
                </p>
              </FormField>

              <FormField
                label="Nomor Telepon"
                icon={<Phone size={16} />}
              >
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Contoh: 081234567890"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Jenis Kelamin"
                icon={<UserRound size={16} />}
              >
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={!editing}
                  className={inputClass}
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </FormField>

              <FormField
                label="Tanggal Lahir"
                icon={<CalendarDays size={16} />}
              >
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  disabled={!editing}
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Nama Organisasi"
                icon={<Building2 size={16} />}
              >
                <input
                  type="text"
                  name="organization_name"
                  value={form.organization_name}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Nama organisasi atau perusahaan"
                  className={inputClass}
                />
              </FormField>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Alamat
                </label>

                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={3}
                    placeholder="Masukkan alamat lengkap"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-base font-semibold text-slate-900">
                Informasi Akun
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoBox
                  label="Role Akun"
                  value={String(
                    profile?.role || "event_organizer"
                  ).replace(/_/g, " ")}
                />

                <InfoBox
                  label="Bergabung Sejak"
                  value={formatDate(profile?.created_at)}
                />
              </div>
            </div>

            {editing && (
              <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={15} />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
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
            )}
          </div>
        </form>
      )}

      {/* EVENTS */}
      {activeTab === "events" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Event Saya
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Daftar event yang telah kamu buat.
              </p>
            </div>

            <Link
              href="/organizer/events"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Kelola Event
              <ChevronRight size={14} />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-5 py-14 text-center">
              <Ticket size={30} className="text-slate-400" />

              <h4 className="mt-4 text-sm font-semibold text-slate-800">
                Belum Ada Event
              </h4>

              <p className="mt-2 text-xs text-slate-400">
                Event yang kamu buat akan ditampilkan di halaman ini.
              </p>

              <Link
                href="/organizer/events/create"
                className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Buat Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const status = getEventStatus(event.status);

                return (
                  <div
                    key={event.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-sky-200 sm:flex-row"
                  >
                    <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-40">
                      {event.poster ? (
                        <img
                          src={getImageUrl(event.poster)}
                          alt={event.event_name || "Poster event"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Ticket size={28} />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {event.event_name || "Tanpa Nama"}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                          {event.description ||
                            "Tidak ada deskripsi event."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            {formatDate(event.event_date)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} />
                            {event.event_time || "-"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={13} />
                            {event.venue_name || event.city || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>
                          Tiket terjual:{" "}
                          <strong className="text-slate-800">
                            {formatNumber(event.sold_tickets)}
                          </strong>
                        </span>

                        <span>
                          Sisa tiket:{" "}
                          <strong className="text-slate-800">
                            {formatNumber(event.remaining_ticket)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// FORM COMPONENTS
// ============================================================

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12.5px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-500";

function FormField({ icon, label, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
        {value}
      </p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound,
  Camera,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AtSign,
  Calendar,
  ImagePlus,
  X,
  LockKeyhole,
  Settings,
  RefreshCw,
} from "lucide-react";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "").replace(/\/$/, "");

const API_URL = `${API_ORIGIN}/api`;

const PROFILE_CACHE_KEY = "organizer_settings_cache";

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
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token")
  );
};

const authHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

const getPhotoUrl = (photo) => {
  if (!photo) return "";
  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://") ||
    photo.startsWith("blob:") ||
    photo.startsWith("data:")
  ) {
    return photo;
  }
  return `${API_ORIGIN}/${photo.replace(/^\/+/, "")}`;
};

const formatDate = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const initialForm = {
  fullname: "",
  username: "",
  email: "",
  phone: "",
  gender: "",
  birth_date: "",
  photo: "",
  role: "",
  created_at: "",
};

function readCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (!value) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function normalizeProfileData(data) {
  return {
    fullname: data?.fullname || "",
    username: data?.username || "",
    email: data?.email || "",
    phone: data?.phone || "",
    gender: data?.gender || "",
    birth_date: data?.birth_date ? String(data.birth_date).slice(0, 10) : "",
    photo: data?.photo || data?.avatar || "",
    role: data?.role || "event_organizer",
    created_at: data?.created_at || "",
  };
}

export default function OrganizerSettingsPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const hydratedRef = useRef(false);

  const [profile, setProfile] = useState(initialForm);
  const [form, setForm] = useState(initialForm);

  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");

  const loadProfile = useCallback(
    async (options = {}) => {
      const { silent = false, reason = "manual" } = options;

      if (reason === "manual") {
        if (profile?.email) setRefreshing(true);
        else setLoading(true);
      } else if (!profile?.email) {
        setLoading(true);
      }

      if (!silent) setMessage({ type: "", text: "" });

      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(`${API_URL}/organizer/profile`, {
          method: "GET",
          headers: authHeaders(),
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("access_token");
          router.replace("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil profil.");
        }

        const formatted = normalizeProfileData(result.data || {});

        setProfile(formatted);
        setForm(formatted);
        setPreview(getPhotoUrl(formatted.photo));
        setSelectedFile(null);

        if (fileRef.current) fileRef.current.value = "";

        writeCache(PROFILE_CACHE_KEY, formatted);
      } catch (error) {
        console.error("LOAD ORGANIZER PROFILE:", error);
        if (!silent) {
          setMessage({
            type: "error",
            text: error.message || "Gagal memuat profil.",
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setBootstrapped(true);
      }
    },
    [router, profile?.email]
  );

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const cached = readCache(PROFILE_CACHE_KEY);

    if (cached && cached.email) {
      const formatted = normalizeProfileData(cached);
      setProfile(formatted);
      setForm(formatted);
      setPreview(getPhotoUrl(formatted.photo));
      setLoading(false);
      setBootstrapped(true);
      loadProfile({ silent: true, reason: "background" });
    } else {
      loadProfile({ reason: "initial" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage({
        type: "error",
        text: "Format foto harus JPG, PNG, atau WEBP.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Ukuran foto maksimal 5 MB.",
      });
      e.target.value = "";
      return;
    }

    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreview(objectUrl);
    setMessage({ type: "", text: "" });
  };

  const handleReset = () => {
    setForm(profile);
    setSelectedFile(null);

    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(getPhotoUrl(profile.photo));

    if (fileRef.current) fileRef.current.value = "";

    setMessage({ type: "", text: "" });
  };

  const handleCancelPhoto = () => {
    setSelectedFile(null);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(getPhotoUrl(profile.photo));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      if (!form.fullname.trim()) {
        throw new Error("Nama lengkap wajib diisi.");
      }

      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const formData = new FormData();
      formData.append("fullname", form.fullname.trim());
      formData.append("phone", form.phone.trim());
      formData.append("gender", form.gender);
      formData.append("birth_date", form.birth_date || "");

      if (selectedFile) formData.append("avatar", selectedFile);

      const response = await fetch(`${API_URL}/organizer/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: formData,
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui profil.");
      }

      const updatedProfile = {
        ...profile,
        fullname: result.data?.fullname || form.fullname,
        username: result.data?.username || form.username,
        email: result.data?.email || form.email,
        phone: result.data?.phone || "",
        gender: result.data?.gender || "",
        birth_date: result.data?.birth_date
          ? String(result.data.birth_date).slice(0, 10)
          : "",
        photo: result.data?.photo || result.data?.avatar || "",
      };

      setProfile(updatedProfile);
      setForm(updatedProfile);
      setSelectedFile(null);

      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(getPhotoUrl(updatedProfile.photo));

      if (fileRef.current) fileRef.current.value = "";

      writeCache(PROFILE_CACHE_KEY, updatedProfile);

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsedUser, ...updatedProfile })
          );
        }
      } catch (storageError) {
        console.warn("Gagal memperbarui cache user:", storageError);
      }

      setMessage({
        type: "success",
        text: result.message || "Profil berhasil diperbarui.",
      });
    } catch (error) {
      console.error("UPDATE ORGANIZER PROFILE:", error);
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan.",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (loading && !profile.email) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <RefreshCw size={22} className="animate-spin text-sky-600" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Memuat pengaturan akun
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Menghubungkan ke server TicketVerse...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!profile.email && bootstrapped && message.type === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <AlertCircle size={22} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Pengaturan tidak dapat dimuat
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {message.text}
        </p>
        <button
          type="button"
          onClick={() => loadProfile()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </motion.div>
    );
  }

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
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            <span>Organizer</span>
            <span className="text-slate-300">/</span>
            <span className="text-sky-600">Pengaturan</span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[30px]">
              Pengaturan
            </h1>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Settings size={16} />
            </div>
          </div>

          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-500">
            Kelola informasi akun dan profil Event Organizer kamu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => loadProfile()}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Memuat..." : "Refresh"}
          </motion.button>
        </div>
      </motion.div>

      {/* ALERT */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className={`flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 text-[12.5px] ${
              message.type === "success"
                ? "border-sky-200 bg-sky-50/70 text-sky-700"
                : "border-rose-200 bg-rose-50/70 text-rose-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}

            <p className="flex-1">{message.text}</p>

            <button
              type="button"
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-current opacity-60 transition hover:opacity-100"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* SIDEBAR */}
        <motion.aside
          variants={fadeUp}
          className="h-fit space-y-4 lg:sticky lg:top-4"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-sky-400/25 blur-2xl"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            <div className="px-5 pb-5">
              <div className="-mt-10 flex flex-col items-center text-center">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md ring-1 ring-slate-200"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Foto profil organizer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={32} className="text-slate-400" />
                    )}
                  </motion.div>

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-md transition hover:bg-slate-800"
                    title="Ganti foto"
                  >
                    <Camera size={13} />
                  </button>
                </div>

                <h3 className="mt-3 text-[13.5px] font-semibold text-slate-900">
                  {profile.fullname || "Event Organizer"}
                </h3>

                <p className="mt-0.5 break-all text-[11.5px] text-slate-500">
                  {profile.email || "-"}
                </p>

                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10.5px] font-semibold text-sky-700">
                  <ShieldCheck size={11} />
                  Event Organizer
                </div>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 px-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Pengaturan Akun
            </p>

            {[
              { key: "profile", label: "Profil Saya", icon: UserRound },
              { key: "account", label: "Informasi Akun", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition ${
                    isActive
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-white text-sky-600 ring-1 ring-sky-100"
                        : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  {tab.label}

                  {isActive && (
                    <motion.span
                      layoutId="settings-tab-indicator"
                      className="absolute right-2 h-1.5 w-1.5 rounded-full bg-sky-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.aside>

        {/* CONTENT */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === "profile" ? (
              <motion.form
                key="profile-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: easePremium }}
                onSubmit={handleSubmit}
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-6 flex items-start justify-between gap-3 border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                        Informasi Profil
                      </h2>
                      <p className="mt-1 text-[12px] text-slate-400">
                        Perbarui informasi pribadi akun Event Organizer kamu.
                      </p>
                    </div>

                    {refreshing && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10.5px] font-semibold text-sky-700 ring-1 ring-sky-100">
                        <Loader2 size={10} className="animate-spin" />
                        Memperbarui
                      </div>
                    )}
                  </div>

                  {/* PHOTO */}
                  <div className="mb-7 flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm ring-1 ring-slate-200">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview foto profil"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={28} className="text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-[12.5px] font-semibold text-slate-800">
                        Foto Profil
                      </h3>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                        Gunakan foto yang jelas agar akun organizer kamu lebih
                        mudah dikenali. JPG, PNG, WEBP. Maksimal 5 MB.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-slate-800"
                        >
                          <ImagePlus size={13} />
                          Pilih Foto
                        </button>

                        {selectedFile && (
                          <button
                            type="button"
                            onClick={handleCancelPhoto}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 transition hover:bg-slate-100"
                          >
                            <X size={12} />
                            Batalkan Foto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FORM */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                        Nama Lengkap{" "}
                        <span className="text-rose-500">*</span>
                      </label>

                      <div className="relative">
                        <UserRound
                          size={15}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="fullname"
                          value={form.fullname}
                          onChange={handleChange}
                          required
                          placeholder="Masukkan nama lengkap"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12.5px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                        Username
                      </label>

                      <div className="relative">
                        <AtSign
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={form.username}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[12.5px] text-slate-500 outline-none"
                        />
                      </div>

                      <p className="mt-1 text-[10.5px] text-slate-400">
                        Username tidak dapat diubah.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          value={form.email}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[12.5px] text-slate-500 outline-none"
                        />
                      </div>

                      <p className="mt-1 text-[10.5px] text-slate-400">
                        Email digunakan untuk login.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                        Nomor Telepon
                      </label>

                      <div className="relative">
                        <Phone
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Contoh: 081234567890"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12.5px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                        Jenis Kelamin
                      </label>

                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12.5px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                        Tanggal Lahir
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          name="birth_date"
                          value={form.birth_date}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12.5px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleReset}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RotateCcw size={14} />
                      Batalkan
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Simpan Perubahan
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="account-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: easePremium }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-6 border-b border-slate-100 pb-5">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                    Informasi Akun
                  </h2>
                  <p className="mt-1 text-[12px] text-slate-400">
                    Informasi identitas akun Event Organizer kamu.
                  </p>
                </div>

                <div className="space-y-3">
                  <AccountRow
                    icon={<Mail size={16} />}
                    label="Email Terdaftar"
                    value={profile.email || "-"}
                  />

                  <AccountRow
                    icon={<ShieldCheck size={16} />}
                    label="Role Akun"
                    value="Event Organizer"
                    trailing={
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
                        Aktif
                      </span>
                    }
                  />

                  <AccountRow
                    icon={<Calendar size={16} />}
                    label="Tanggal Bergabung"
                    value={formatDate(profile.created_at)}
                  />
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-100">
                      <LockKeyhole size={15} />
                    </div>

                    <div>
                      <h3 className="text-[12.5px] font-semibold text-slate-800">
                        Keamanan Akun
                      </h3>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
                        Jaga kerahasiaan password dan kode OTP akun kamu.
                        Perubahan password belum tersedia pada endpoint backend
                        organizer yang saat ini digunakan.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function AccountRow({ icon, label, value, trailing }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition hover:border-sky-200">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-all text-[12.5px] font-semibold text-slate-800">
          {value}
        </p>
      </div>

      {trailing}
    </div>
  );
}
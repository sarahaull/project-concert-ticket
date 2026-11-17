"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AtSign,
  Camera,
  ArrowLeft,
  Sparkles,
  ImagePlus,
  Building2,
  Globe,
  MapPin,
  FileText,
  Clock,
  Send,
  RefreshCw,
} from "lucide-react";

// Komponen SVG inline pengganti ikon Instagram dari lucide-react
function InstagramIcon({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");

const PROFILE_API = `${API_URL}/api/users/profile`;
const ORGANIZER_API = `${API_URL}/api/organizer`;

const initialForm = {
  fullname: "",
  phone: "",
  gender: "",
  birth_date: "",
};

const initialOrganizerForm = {
  organization_name: "",
  organization_type: "individual",
  responsible_name: "",
  address: "",
  description: "",
  instagram: "",
  website: "",
};

async function readResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Respons server tidak valid.");
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [organizerSubmitting, setOrganizerSubmitting] = useState(false);
  const [organizerApplication, setOrganizerApplication] = useState(null);
  const [organizerForm, setOrganizerForm] = useState(initialOrganizerForm);
  const [showOrganizerForm, setShowOrganizerForm] = useState(false);
  const [organizerMessage, setOrganizerMessage] = useState("");
  const [organizerError, setOrganizerError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return "";

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://") ||
      photo.startsWith("data:") ||
      photo.startsWith("blob:")
    ) {
      return photo;
    }

    return `${API_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return String(date).slice(0, 10);
  };

  const formatRole = (role) => {
    if (!role) return "Customer";

    return String(role)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getInitial = () => {
    return (
      user?.fullname?.charAt(0)?.toUpperCase() ||
      user?.username?.charAt(0)?.toUpperCase() ||
      "U"
    );
  };

  const setProfileForm = (profile) => {
    setForm({
      fullname: profile.fullname || "",
      phone: profile.phone || "",
      gender: profile.gender || "",
      birth_date: formatDate(profile.birth_date),
    });

    setSelectedPhoto(null);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPhotoPreview(getPhotoUrl(profile.photo));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(PROFILE_API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await readResponse(response);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || "Gagal mengambil profil.");
      }

      setUser(data.user);
      setProfileForm(data.user);

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              ...data.user,
            })
          );
        } catch (error) {
          console.warn("LOCAL USER UPDATE:", error);
        }
      }
    } catch (error) {
      console.error("FETCH PROFILE ERROR:", error);
      setErrorMessage(error.message || "Gagal mengambil profil.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerApplication = async () => {
    try {
      setOrganizerLoading(true);
      setOrganizerError("");

      const token = getToken();

      if (!token) return;

      const response = await fetch(`${ORGANIZER_API}/application/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await readResponse(response);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil status pengajuan organizer."
        );
      }

      setOrganizerApplication(data.data || null);

      if (data.data) {
        setOrganizerForm({
          organization_name: data.data.organization_name || "",
          organization_type: data.data.organization_type || "individual",
          responsible_name:
            data.data.responsible_name || user?.fullname || "",
          address: data.data.address || "",
          description: data.data.description || "",
          instagram: data.data.instagram || "",
          website: data.data.website || "",
        });
      } else {
        setOrganizerForm((prev) => ({
          ...prev,
          responsible_name: user?.fullname || "",
        }));
      }
    } catch (error) {
      console.error("FETCH ORGANIZER APPLICATION ERROR:", error);
      setOrganizerError(error.message || "Gagal mengambil pengajuan EO.");
    } finally {
      setOrganizerLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchOrganizerApplication();
    }
  }, [user?.id, user?.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrganizerChange = (event) => {
    const { name, value } = event.target;

    setOrganizerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Gunakan foto JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran foto maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setSelectedPhoto(file);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setPhotoPreview(preview);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      if (!form.fullname.trim()) {
        throw new Error("Nama lengkap wajib diisi.");
      }

      const formData = new FormData();

      formData.append("fullname", form.fullname.trim());
      formData.append("phone", form.phone.trim());
      formData.append("gender", form.gender);
      formData.append("birth_date", form.birth_date);

      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }

      const response = await fetch(PROFILE_API, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await readResponse(response);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || "Gagal menyimpan profil.");
      }

      setUser(data.user);
      setProfileForm(data.user);

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              ...data.user,
            })
          );
        } catch (error) {
          console.warn("LOCAL USER UPDATE:", error);
        }
      }

      setEditing(false);
      setSuccessMessage(data.message || "Profil berhasil diperbarui.");
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);
      setErrorMessage(error.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    setProfileForm(user);
    setEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmitOrganizer = async (event) => {
    event.preventDefault();

    try {
      setOrganizerSubmitting(true);
      setOrganizerError("");
      setOrganizerMessage("");

      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      if (
        !organizerForm.organization_name.trim() ||
        !organizerForm.responsible_name.trim() ||
        !organizerForm.address.trim() ||
        !organizerForm.description.trim()
      ) {
        throw new Error(
          "Nama organisasi, penanggung jawab, alamat, dan deskripsi wajib diisi."
        );
      }

      const response = await fetch(`${ORGANIZER_API}/application`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization_name: organizerForm.organization_name.trim(),
          organization_type: organizerForm.organization_type,
          responsible_name: organizerForm.responsible_name.trim(),
          address: organizerForm.address.trim(),
          description: organizerForm.description.trim(),
          instagram: organizerForm.instagram.trim(),
          website: organizerForm.website.trim(),
        }),
      });

      const data = await readResponse(response);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengirim pengajuan EO.");
      }

      setOrganizerMessage(
        data.message || "Pengajuan berhasil dikirim."
      );

      setShowOrganizerForm(false);

      await fetchOrganizerApplication();
    } catch (error) {
      console.error("SUBMIT ORGANIZER ERROR:", error);
      setOrganizerError(error.message || "Gagal mengirim pengajuan.");
    } finally {
      setOrganizerSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-[#112250]"
          />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Memuat profil Anda...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <AlertCircle
            size={40}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-black text-[#112250]">
            Profil Tidak Dapat Dimuat
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {errorMessage}
          </p>

          <button
            onClick={fetchProfile}
            className="mt-6 rounded-xl bg-[#112250] px-6 py-3 text-sm font-bold text-white"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const applicationStatus = organizerApplication?.status;
  const isOrganizer = user.role === "event_organizer";

  return (
    <div className="w-full space-y-6 pb-12 text-[#112250]">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-50 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                <Sparkles size={13} />
                Pengaturan Akun
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Profile Saya
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola informasi pribadi akun TicketVerse Anda.
              </p>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-6 py-3 font-bold text-white transition hover:bg-[#1A326A]"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={17} />
                Batal
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white hover:bg-[#1A326A] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          )}
        </div>
      </section>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle size={20} />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-32 bg-gradient-to-br from-[#0D1F42] via-[#112250] to-[#294A85]">
            <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/10" />
          </div>

          <div className="px-6 pb-7">
            <div className="-mt-16 flex justify-center">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto profil"
                    className="h-32 w-32 rounded-3xl border-4 border-white bg-white object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white bg-[#EEF3F9] text-5xl font-black shadow-xl">
                    {getInitial()}
                  </div>
                )}

                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-xl border-4 border-white bg-[#112250] text-white shadow-lg transition hover:scale-105"
                      title="Ubah foto profil"
                    >
                      <Camera size={18} />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {editing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <ImagePlus size={15} />
                Pilih Foto Profil
              </button>
            )}

            <div className="mt-5 text-center">
              <h2 className="text-xl font-black">
                {user.fullname || "Nama User"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                @{user.username || "-"}
              </p>

              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold">
                <ShieldCheck size={15} className="text-emerald-500" />
                {formatRole(user.role)}
              </span>
            </div>

            <div className="mt-7 space-y-4 border-t border-dashed border-slate-200 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {user.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Nomor HP
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {user.phone || "Belum diisi"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#112250]">
                <User size={21} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  Informasi Personal
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Informasi pribadi akun TicketVerse Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Nama Lengkap
                </label>

                {editing ? (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />

                    <input
                      type="text"
                      name="fullname"
                      value={form.fullname}
                      onChange={handleChange}
                      maxLength={150}
                      placeholder="Nama lengkap"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold">
                    {user.fullname || "-"}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Username
                </label>

                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />

                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm font-semibold text-slate-500">
                    {user.username || "-"}
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Username tidak dapat diubah.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />

                  <div className="flex h-12 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm font-semibold text-slate-500">
                    <span className="truncate">
                      {user.email || "-"}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Email digunakan sebagai identitas akun.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Nomor HP
                </label>

                {editing ? (
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="08123456789"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold">
                    {user.phone || "Belum diisi"}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Jenis Kelamin
                </label>

                {editing ? (
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                ) : (
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold">
                    {user.gender || "Belum diisi"}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  Tanggal Lahir
                </label>

                {editing ? (
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />

                    <input
                      type="date"
                      name="birth_date"
                      value={form.birth_date}
                      onChange={handleChange}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold">
                    {formatDate(user.birth_date) || "Belum diisi"}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-9 border-t border-dashed border-slate-200 pt-7">
              <h3 className="flex items-center gap-2 text-sm font-black">
                <ShieldCheck size={18} />
                Informasi Akun
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Account ID
                  </p>
                  <p className="mt-2 text-sm font-black">
                    #{user.id}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Account Type
                  </p>
                  <p className="mt-2 text-sm font-black">
                    {formatRole(user.role)}
                  </p>
                </div>
              </div>
            </div>

            {editing && (
              <div className="mt-8 flex flex-col justify-between gap-4 border-t border-dashed border-slate-200 pt-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold">
                    Simpan perubahan profil
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Perubahan akan disimpan ke database akun Anda.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#112250] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A] disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {user.role === "customer" && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#112250]">
                  <Building2 size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-black">
                    Daftar Event Organizer
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Ajukan akun Anda untuk menjadi penyelenggara event TicketVerse.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchOrganizerApplication}
                disabled={organizerLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={organizerLoading ? "animate-spin" : ""}
                />
                Refresh Status
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {organizerMessage && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={20} />
                {organizerMessage}
              </div>
            )}

            {organizerError && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                <AlertCircle size={20} />
                {organizerError}
              </div>
            )}

            {organizerLoading ? (
              <div className="flex items-center justify-center gap-3 py-10 text-sm font-semibold text-slate-500">
                <Loader2 size={22} className="animate-spin" />
                Memeriksa status pengajuan...
              </div>
            ) : applicationStatus === "pending" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Clock size={24} />
                  </div>

                  <div>
                    <h3 className="font-black text-amber-900">
                      Pengajuan Sedang Ditinjau
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Pengajuan Event Organizer Anda sudah diterima dan sedang diperiksa oleh Super Admin. Anda dapat menggunakan akun sebagai customer selama proses pemeriksaan.
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-amber-900">
                      <p>
                        <strong>Organisasi:</strong>{" "}
                        {organizerApplication.organization_name}
                      </p>
                      <p>
                        <strong>Penanggung jawab:</strong>{" "}
                        {organizerApplication.responsible_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : applicationStatus === "approved" || isOrganizer ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={25} />
                  </div>

                  <div>
                    <h3 className="font-black text-emerald-900">
                      Pengajuan Berhasil Disetujui
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                      Akun Anda sudah memiliki akses Event Organizer TicketVerse.
                    </p>
                    <p className="mt-2 text-sm text-emerald-800">
                      Jika role baru belum terlihat, silakan logout lalu login kembali.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {applicationStatus === "rejected" && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={22}
                        className="shrink-0 text-red-600"
                      />
                      <div>
                        <h3 className="font-black text-red-800">
                          Pengajuan Belum Disetujui
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-red-700">
                          {organizerApplication.rejection_reason ||
                            "Pengajuan Anda ditolak oleh Super Admin."}
                        </p>
                        <p className="mt-2 text-xs text-red-600">
                          Silakan perbaiki informasi dan kirim ulang pengajuan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!showOrganizerForm ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-base font-black">
                      Jadilah Event Organizer
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Isi data organisasi dan informasi penanggung jawab untuk mengajukan akun Event Organizer. Pengajuan akan diperiksa oleh Super Admin sebelum akses diberikan.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setOrganizerError("");
                        setOrganizerMessage("");
                        setShowOrganizerForm(true);
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A]"
                    >
                      <Building2 size={17} />
                      {applicationStatus === "rejected"
                        ? "Perbaiki Pengajuan"
                        : "Ajukan Menjadi Organizer"}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmitOrganizer}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Nama Organisasi
                        </label>
                        <div className="relative">
                          <Building2
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            name="organization_name"
                            value={organizerForm.organization_name}
                            onChange={handleOrganizerChange}
                            maxLength={150}
                            required
                            placeholder="Nama organisasi atau brand"
                            className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Jenis Organisasi
                        </label>
                        <select
                          name="organization_type"
                          value={organizerForm.organization_type}
                          onChange={handleOrganizerChange}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="individual">Individu</option>
                          <option value="community">Komunitas</option>
                          <option value="company">Perusahaan</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Nama Penanggung Jawab
                        </label>
                        <div className="relative">
                          <User
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            name="responsible_name"
                            value={organizerForm.responsible_name}
                            onChange={handleOrganizerChange}
                            maxLength={150}
                            required
                            placeholder="Nama penanggung jawab"
                            className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Instagram
                        </label>
                        <div className="relative">
                          <InstagramIcon
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            name="instagram"
                            value={organizerForm.instagram}
                            onChange={handleOrganizerChange}
                            placeholder="@username"
                            className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Alamat Organisasi
                        </label>
                        <div className="relative">
                          <MapPin
                            size={17}
                            className="absolute left-4 top-4 text-slate-400"
                          />
                          <textarea
                            name="address"
                            value={organizerForm.address}
                            onChange={handleOrganizerChange}
                            rows={3}
                            required
                            placeholder="Alamat lengkap organisasi"
                            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Deskripsi Organisasi
                        </label>
                        <div className="relative">
                          <FileText
                            size={17}
                            className="absolute left-4 top-4 text-slate-400"
                          />
                          <textarea
                            name="description"
                            value={organizerForm.description}
                            onChange={handleOrganizerChange}
                            rows={4}
                            required
                            placeholder="Jelaskan organisasi dan pengalaman dalam menyelenggarakan event."
                            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Website
                        </label>
                        <div className="relative">
                          <Globe
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="url"
                            name="website"
                            value={organizerForm.website}
                            onChange={handleOrganizerChange}
                            placeholder="https://website.com"
                            className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse justify-end gap-3 border-t border-dashed border-slate-200 pt-6 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setShowOrganizerForm(false)}
                        disabled={organizerSubmitting}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={organizerSubmitting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A] disabled:opacity-60"
                      >
                        {organizerSubmitting ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Send size={17} />
                        )}
                        {organizerSubmitting
                          ? "Mengirim..."
                          : "Kirim Pengajuan"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {isOrganizer && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600" />
            <div>
              <h2 className="font-black text-emerald-900">
                Akun Event Organizer Aktif
              </h2>
              <p className="mt-1 text-sm text-emerald-800">
                Anda sudah dapat menggunakan fitur Event Organizer TicketVerse.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
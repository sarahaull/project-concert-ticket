"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  UserRound,
  Building2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  Save,
  X,
  Loader2,
  RefreshCw,
  Ticket,
  CheckCircle2,
  XCircle,
  Hourglass,
  ArrowUpRight,
  AtSign,
  Camera,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Layers,
} from "lucide-react";

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "").endsWith("/api")
  ? RAW_API_URL.replace(/\/+$/, "")
  : `${RAW_API_URL.replace(/\/+$/, "")}/api`;

const initialForm = {
  fullname: "",
  phone: "",
  address: "",
  organization_name: "",
  avatar: "",
};

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function getImageUrl(path) {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const base = API_URL.replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
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

function formatNumber(value) {
  const number = Number(value);
  return new Intl.NumberFormat("id-ID").format(
    Number.isFinite(number) ? number : 0
  );
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

function getApprovalStyle(status) {
  const value = String(status || "").toLowerCase();

  if (value === "approved") {
    return {
      label: "Disetujui",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  }

  if (value === "rejected") {
    return {
      label: "Ditolak",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
    };
  }

  if (value === "draft") {
    return {
      label: "Draft",
      className: "bg-slate-50 text-slate-600 border-slate-200",
      icon: Pencil,
    };
  }

  return {
    label: "Menunggu Persetujuan",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Hourglass,
  };
}

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-sky-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_8px_24px_rgba(14,165,233,0.10)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-300/30 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#0B1220]">
            {formatNumber(value)}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-500">
            {hint}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100 transition group-hover:scale-110">
          <Icon size={18} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[2.5px] w-full bg-gradient-to-r from-[#0B1220] to-sky-500 opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-sky-100 bg-sky-50/50 px-3.5 py-3 transition hover:border-sky-200">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm ring-1 ring-sky-100">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[13px] font-semibold text-slate-800">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-b from-sky-50/50 to-white px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Icon size={13} />
            </span>
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function OrganizerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(initialForm);

  const request = useCallback(async (endpoint, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || `Permintaan gagal (${response.status}).`
      );
    }

    return result;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profileResult, statsResult, eventsResult] = await Promise.all([
        request("/organizer/profile"),
        request("/organizer/stats"),
        request("/organizer/events"),
      ]);

      const organizer = profileResult.organizer;

      setProfile(organizer);
      setForm({
        fullname: organizer?.fullname || "",
        phone: organizer?.phone || "",
        address: organizer?.address || "",
        organization_name: organizer?.organization_name || "",
        avatar: organizer?.avatar || "",
      });

      setStats(statsResult.stats || {});
      setEvents(Array.isArray(eventsResult.events) ? eventsResult.events : []);
    } catch (err) {
      setError(err.message || "Gagal mengambil data profil.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.fullname.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await request("/organizer/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullname: form.fullname,
          phone: form.phone,
          address: form.address,
          organization_name: form.organization_name,
          avatar: form.avatar,
        }),
      });

      setProfile(result.organizer);
      setForm({
        fullname: result.organizer.fullname || "",
        phone: result.organizer.phone || "",
        address: result.organizer.address || "",
        organization_name: result.organizer.organization_name || "",
        avatar: result.organizer.avatar || "",
      });

      setEditing(false);
      setSuccess(result.message || "Profil berhasil diperbarui.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(err.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      fullname: profile?.fullname || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      organization_name: profile?.organization_name || "",
      avatar: profile?.avatar || "",
    });

    setEditing(false);
    setError("");
  };

  const approvalCounts = useMemo(() => {
    return events.reduce(
      (result, event) => {
        const status = String(
          event.approval_status || "Pending"
        ).toLowerCase();

        if (status === "approved") result.approved += 1;
        else if (status === "rejected") result.rejected += 1;
        else if (status === "draft") result.draft += 1;
        else result.pending += 1;

        return result;
      },
      { approved: 0, rejected: 0, pending: 0, draft: 0 }
    );
  }, [events]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-xl bg-[#0B1220]/10" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220]/[0.06]">
            <Loader2 size={22} className="animate-spin text-[#0B1220]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[13.5px] font-semibold text-slate-800">
            Memuat profil organizer...
          </p>
          <p className="mt-0.5 text-[12px] text-slate-400">
            Mengambil data akun dan aktivitas event
          </p>
        </div>
      </div>
    );
  }

  if (!profile && error) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center gap-3 text-[#0B1220]">
            <AlertCircle size={20} />
            <h2 className="text-[15px] font-semibold">
              Profil tidak dapat dimuat
            </h2>
          </div>

          <p className="mt-2 text-[13px] text-slate-600">{error}</p>

          <button
            onClick={loadData}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const verified =
    profile?.verified === 1 ||
    profile?.verified === true ||
    profile?.verified === "1";

  return (
    <div className="w-full min-w-0 text-[#0B1220]">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            <span>Organizer</span>
            <ChevronRight size={12} className="text-white/30" />
            <span className="text-white/90">Profil</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
                <Sparkles size={12} className="text-sky-300" />
                Organizer Account
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                Profil Event Organizer
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Kelola informasi akun, pantau status verifikasi, dan lihat
                ringkasan aktivitas event Anda dalam satu dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.14] disabled:opacity-60"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setEditing(true);
                  }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0B1220] shadow-lg shadow-black/10 transition hover:bg-slate-100"
                >
                  <Pencil size={15} />
                  Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-[12.5px] leading-5 text-rose-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="text-[12.5px] leading-5 text-emerald-700">{success}</p>
        </div>
      )}

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="h-24 bg-gradient-to-r from-[#0B1220] via-[#1B2942] to-[#2F3F63] sm:h-28" />

        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-12 flex flex-col gap-5 md:-mt-14 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#0B1220]/[0.06] text-2xl font-bold text-[#0B1220] shadow-md">
                {profile?.avatar ? (
                  <img
                    src={getImageUrl(profile.avatar)}
                    alt="Foto profil organizer"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  getInitials(profile?.fullname)
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#0B1220] sm:text-[20px]">
                  {profile?.fullname || "Event Organizer"}
                </h2>

                <p className="mt-0.5 text-[12.5px] text-slate-500">
                  {profile?.organization_name ||
                    "Nama organisasi belum diatur"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10.5px] font-semibold text-sky-700">
                    <UserRound size={12} />
                    Event Organizer
                  </span>

                  {verified ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                      <ShieldCheck size={12} />
                      Terverifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700">
                      <ShieldAlert size={12} />
                      Belum Terverifikasi
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Event"
          value={stats.totalEvents ?? events.length}
          hint="Seluruh event terdaftar"
          icon={Ticket}
        />
        <StatCard
          label="Event Mendatang"
          value={stats.upcoming}
          hint="Event dengan tanggal mendatang"
          icon={CalendarDays}
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={stats.pending ?? approvalCounts.pending}
          hint="Dalam review Super Admin"
          icon={Hourglass}
        />
        <StatCard
          label="Event Disetujui"
          value={stats.approved ?? approvalCounts.approved}
          hint="Event yang telah disetujui"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            icon={UserRound}
            title="Informasi Profil"
            description="Informasi akun dan organisasi Anda."
          >
            {editing ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="fullname"
                      value={form.fullname}
                      onChange={handleChange}
                      required
                      maxLength={150}
                      placeholder="Masukkan nama lengkap"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
                      Nama Organisasi
                    </label>
                    <input
                      name="organization_name"
                      value={form.organization_name}
                      onChange={handleChange}
                      maxLength={150}
                      placeholder="Nama perusahaan/organisasi"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
                      Nomor Telepon
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={30}
                      placeholder="Contoh: 081234567890"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
                      Email Akun
                    </label>
                    <input
                      value={profile?.email || ""}
                      disabled
                      className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-[13px] text-slate-500"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Email akun tidak dapat diubah dari halaman ini.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
                      Alamat
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      maxLength={500}
                      placeholder="Masukkan alamat organisasi"
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-700">
                      <Camera size={13} />
                      URL Foto Profil
                    </label>
                    <input
                      name="avatar"
                      type="url"
                      value={form.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/foto.jpg"
                      className={inputClass}
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Masukkan URL gambar yang dapat diakses publik.
                    </p>

                    {form.avatar && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={getImageUrl(form.avatar)}
                          alt="Preview avatar"
                          className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                        />
                        <span className="text-[11.5px] text-slate-500">
                          Preview foto profil
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    <X size={14} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0B1220] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
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
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Nama Lengkap"
                  value={profile?.fullname}
                />
                <InfoItem
                  icon={AtSign}
                  label="Username"
                  value={profile?.username}
                />
                <InfoItem icon={Mail} label="Email" value={profile?.email} />
                <InfoItem
                  icon={Phone}
                  label="Nomor Telepon"
                  value={profile?.phone}
                />
                <InfoItem
                  icon={Building2}
                  label="Nama Organisasi"
                  value={profile?.organization_name}
                />
                <InfoItem
                  icon={MapPin}
                  label="Alamat"
                  value={profile?.address}
                />
                <InfoItem
                  icon={CalendarDays}
                  label="Bergabung Sejak"
                  value={formatDate(profile?.created_at)}
                />
                <InfoItem
                  icon={ShieldCheck}
                  label="Status Akun"
                  value={verified ? "Terverifikasi" : "Belum Terverifikasi"}
                />
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard icon={ShieldCheck} title="Status Organizer">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ring-1 ${
                  verified
                    ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                    : "bg-amber-50 text-amber-600 ring-amber-100"
                }`}
              >
                {verified ? (
                  <ShieldCheck size={20} />
                ) : (
                  <ShieldAlert size={20} />
                )}
              </div>

              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  {verified ? "Akun Terverifikasi" : "Belum Terverifikasi"}
                </p>
                <p className="mt-0.5 text-[11.5px] text-slate-500">
                  Status verifikasi dari sistem.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50/50 p-3">
              <p className="text-[11.5px] leading-5 text-slate-600">
                {verified
                  ? "Akun organizer Anda telah terverifikasi. Anda dapat mengelola event dan mengajukan penerbitan ke publik."
                  : "Lengkapi informasi organisasi dan ikuti proses verifikasi yang ditetapkan administrator."}
              </p>
            </div>
          </SectionCard>

          <SectionCard icon={Ticket} title="Ringkasan Persetujuan">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Disetujui
                </span>
                <strong className="text-[15px] font-semibold text-emerald-800">
                  {formatNumber(stats.approved ?? approvalCounts.approved)}
                </strong>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-amber-700">
                  <Hourglass size={14} />
                  Menunggu
                </span>
                <strong className="text-[15px] font-semibold text-amber-800">
                  {formatNumber(stats.pending ?? approvalCounts.pending)}
                </strong>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/60 px-3 py-2.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-rose-700">
                  <XCircle size={14} />
                  Ditolak
                </span>
                <strong className="text-[15px] font-semibold text-rose-800">
                  {formatNumber(stats.rejected ?? approvalCounts.rejected)}
                </strong>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                  <Pencil size={14} />
                  Draft
                </span>
                <strong className="text-[15px] font-semibold text-slate-700">
                  {formatNumber(approvalCounts.draft)}
                </strong>
              </div>
            </div>

            <Link
              href="/organizer/event"
              className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0B1220] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#1B2942]"
            >
              Kelola Event
              <ArrowUpRight size={14} />
            </Link>
          </SectionCard>
        </aside>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col justify-between gap-3 border-b border-sky-100 bg-gradient-to-b from-sky-50/50 to-white px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <Layers size={13} />
              </span>
              Event Saya
            </h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Daftar event yang dibuat menggunakan akun ini.
            </p>
          </div>

          <Link
            href="/organizer/event"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0B1220] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#1B2942]"
          >
            Lihat Semua Event
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Sparkles size={22} />
            </div>

            <h3 className="mt-4 text-[15px] font-semibold text-slate-900">
              Belum Ada Event
            </h3>

            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">
              Event yang Anda buat akan ditampilkan di sini. Mulai dengan
              membuat event pertama Anda.
            </p>

            <Link
              href="/organizer/event/tambah"
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
            >
              Buat Event
              <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-sky-100">
            {events.slice(0, 5).map((event) => {
              const approval = getApprovalStyle(event.approval_status);
              const ApprovalIcon = approval.icon;

              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-sky-50/40 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-50 ring-1 ring-sky-100">
                      {event.poster ? (
                        <img
                          src={getImageUrl(event.poster)}
                          alt={event.event_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Ticket size={20} className="text-sky-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-[13.5px] font-semibold text-[#0B1220]">
                        {event.event_name}
                      </h3>

                      <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
                        {event.category_name || "Tanpa kategori"}
                        {" · "}
                        {event.venue_name || "Venue belum ditentukan"}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} />
                          {formatDate(event.event_date)}
                        </span>

                        {event.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {event.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] font-semibold ${approval.className}`}
                    >
                      <ApprovalIcon size={12} />
                      {approval.label}
                    </span>

                    <Link
                      href={`/organizer/event/${event.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                    >
                      Detail
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="pb-2 pt-6 text-center text-[11px] text-slate-400">
        TicketVerse · Organizer Dashboard
      </p>
    </div>
  );
}
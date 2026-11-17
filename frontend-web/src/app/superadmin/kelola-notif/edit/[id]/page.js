"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Send,
  Loader2,
  Megaphone,
  AlertCircle,
  Lock,
  FileText,
  User,
  Mail,
  Sparkles,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Info,
} from "lucide-react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const NOTIFICATION_URL = `${API_URL}/notifications`;

export default function EditNotifikasiPage() {
  const router = useRouter();
  const params = useParams();
  const editId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ title: "", message: "" });
  const [recipientInfo, setRecipientInfo] = useState({
    name: "-",
    email: "-",
    createdAt: null,
    isRead: 0,
  });

  const getHeaders = useCallback(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          localStorage.getItem("accessToken")
        : null;

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const request = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: { ...getHeaders(), ...options.headers },
        cache: "no-store",
      });

      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request gagal dengan status ${response.status}`
        );
      }

      return result;
    },
    [getHeaders]
  );

  useEffect(() => {
    let mounted = true;

    const loadNotifData = async () => {
      setLoading(true);
      setError("");

      try {
        const notifData = await request(NOTIFICATION_URL);
        const found = (notifData.notifications || []).find(
          (n) => String(n.id) === String(editId)
        );

        if (found && mounted) {
          setForm({
            title: found.title || "",
            message: found.message || "",
          });
          setRecipientInfo({
            name:
              found.fullname ||
              found.name ||
              `Customer #${found.user_id}`,
            email: found.email || "-",
            createdAt: found.created_at || null,
            isRead: Number(found.is_read) || 0,
          });
        } else if (mounted) {
          setError("Data notifikasi tidak ditemukan.");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Gagal memuat data notifikasi.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNotifData();
    return () => {
      mounted = false;
    };
  }, [editId, request]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setError("Judul dan isi notifikasi wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await request(`${NOTIFICATION_URL}/${editId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: form.title.trim(),
          message: form.message.trim(),
        }),
      });

      setSuccess("Notifikasi berhasil diperbarui.");

      setTimeout(() => {
        router.push("/superadmin/kelola-notif");
      }, 900);
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan.");
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4F8]">
            <Loader2 className="animate-spin text-[#112250]" size={24} />
          </div>
          <p className="mt-3 text-sm font-medium text-[#8795A7]">
            Memuat data notifikasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white text-[#697F93] transition hover:bg-slate-50 active:scale-95"
            aria-label="Kembali"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8795A7]">
              <Sparkles size={11} />
              Kelola Notifikasi / Edit
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-[#112250] sm:text-2xl md:text-3xl">
              Edit Notifikasi
            </h1>
            <p className="mt-1 text-xs font-medium text-[#8795A7] sm:text-sm">
              Perbarui detail informasi notifikasi di bawah ini.
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-[#DDE3EB] bg-[#F1F4F8] px-4 py-2.5 text-xs font-semibold text-[#53657D] sm:flex">
          <ShieldCheck size={15} />
          Super Admin Access
        </div>
      </div>

      {/* HERO BANNER */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-[#DDE3EB] bg-gradient-to-br from-[#0D1D35] via-[#142B4B] to-[#1D3A61] p-5 text-white shadow-sm sm:mb-8 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold sm:text-lg">
                Edit Konten Notifikasi
              </h2>
              <p className="mt-1 max-w-lg text-xs leading-5 text-white/70 sm:text-sm">
                Perubahan judul dan isi pesan akan langsung diterapkan pada
                notifikasi yang sudah terkirim ke customer.
              </p>
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto">
            <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Judul
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {form.title.length}
                <span className="text-[11px] font-medium text-white/60">
                  /100
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Pesan
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {form.message.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm sm:mb-6 sm:items-center">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-600 sm:mt-0"
          />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm sm:mb-6 sm:items-center">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600 sm:mt-0"
          />
          <span className="flex-1">{success}</span>
        </div>
      )}

      {/* FORM GRID */}
      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-12"
      >
        {/* KOLOM KIRI */}
        <div className="space-y-5 lg:col-span-2 xl:col-span-9 xl:space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#EDF0F4] bg-[#F8FAFC] px-4 py-4 sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#53657D]">
                <FileText size={17} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#112250] sm:text-base">
                  Konten Notifikasi
                </h2>
                <p className="text-[10px] text-[#8795A7] sm:text-[11px]">
                  Ubah judul dan isi pesan di bawah ini
                </p>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#112250]">
                    Judul Notifikasi{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#9AA6B2]">
                    {form.title.length}/100
                  </span>
                </div>
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Contoh: Promo Tiket Akhir Tahun!"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-[#DCE2EA] bg-[#F8FAFC] px-4 py-3.5 text-sm font-medium text-[#112250] outline-none transition placeholder:text-[#9AA6B2] focus:border-[#315A91] focus:bg-white focus:ring-4 focus:ring-[#315A91]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#112250]">
                  Isi Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tuliskan informasi lengkap..."
                  rows={12}
                  required
                  className="w-full resize-none rounded-xl border border-[#DCE2EA] bg-[#F8FAFC] px-4 py-3.5 text-sm font-medium leading-relaxed text-[#112250] outline-none transition placeholder:text-[#9AA6B2] focus:border-[#315A91] focus:bg-white focus:ring-4 focus:ring-[#315A91]/10"
                />
                <div className="mt-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <p className="text-[11px] text-[#9AA6B2]">
                    Gunakan bahasa yang jelas dan mudah dipahami
                  </p>
                  <p className="text-xs font-semibold text-[#9AA6B2] sm:text-right">
                    {form.message.length} karakter
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-[#DDE3EB] bg-[#F5F7FA] p-4 sm:block">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#53657D] shadow-sm">
                <Megaphone size={15} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#112250]">
                  Perubahan bersifat langsung
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#697F93]">
                  Setiap perubahan akan langsung diterapkan pada notifikasi
                  yang sudah terkirim ke customer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-5 lg:col-span-1 xl:col-span-3 xl:space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#EDF0F4] bg-[#F8FAFC] px-4 py-4 sm:px-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#53657D]">
                <User size={17} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#112250]">
                  Penerima
                </h2>
                <p className="text-[10px] text-[#8795A7] sm:text-[11px]">
                  Data customer
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="rounded-xl border border-[#E5EAF0] bg-[#F5F7FA] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#112250] text-sm font-bold text-white">
                    {String(recipientInfo.name || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#112250]">
                      {recipientInfo.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-[#8795A7]">
                      <Mail size={11} className="shrink-0" />
                      <span className="truncate">{recipientInfo.email}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-[#E5EAF0] pt-3">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium text-[#8795A7]">
                      <Calendar size={11} />
                      Dibuat
                    </span>
                    <span className="text-right font-semibold text-[#53657D]">
                      {formatDate(recipientInfo.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#8795A7]">
                      Status
                    </span>
                    {recipientInfo.isRead === 1 ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        Sudah dibaca
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                        Belum dibaca
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
                <Lock size={14} className="mt-0.5 shrink-0 text-[#8795A7]" />
                <p className="text-[11px] font-medium leading-relaxed text-[#697F93]">
                  Target penerima tidak dapat diubah saat mengedit
                  notifikasi yang sudah terkirim.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-[#112250] p-4 text-white shadow-sm sm:p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  <Megaphone size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Simpan Perubahan
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">
                    Perubahan akan segera diterapkan pada notifikasi
                    customer.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#112250] transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60 sm:mt-5 sm:py-3.5 sm:text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                    Simpan Perubahan
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-60 sm:py-3 sm:text-sm"
              >
                Batal
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE3EB] bg-[#F5F7FA] p-4 sm:hidden">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#53657D] shadow-sm">
                <Info size={15} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#112250]">
                  Perubahan bersifat langsung
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#697F93]">
                  Setiap perubahan akan langsung diterapkan pada notifikasi
                  yang sudah terkirim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
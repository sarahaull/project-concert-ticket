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
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Memuat data notifikasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    // PERUBAHAN UTAMA: max-w dihapus, diganti w-full agar full melebar
    <div className="w-full pb-10">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            aria-label="Kembali"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles size={13} />
              Kelola Notifikasi
            </div>
            <h1 className="text-xl font-black tracking-tight text-[#112250] sm:text-2xl md:text-3xl">
              Edit Notifikasi
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              Perbarui detail informasi notifikasi di bawah ini.
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 sm:flex">
          <ShieldCheck size={16} />
          Super Admin Access
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm sm:mb-6 sm:items-center">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 sm:mt-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm sm:mb-6 sm:items-center">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600 sm:mt-0" />
          <span className="flex-1">{success}</span>
        </div>
      )}

      {/* FORM GRID: Responsif & Melebar */}
      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-12"
      >
        {/* KOLOM KIRI (Konten) */}
        <div className="space-y-5 lg:col-span-2 xl:col-span-9 xl:space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FileText size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#112250] sm:text-base">
                  Konten Notifikasi
                </h2>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  Ubah judul dan isi pesan di bawah ini
                </p>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-[#112250]">
                    Judul Notifikasi <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {form.title.length}/100
                  </span>
                </div>
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Contoh: Promo Tiket Akhir Tahun!"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-[#112250] outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#112250]">
                  Isi Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tuliskan informasi lengkap..."
                  rows={12} // Saya tambah row-nya agar lebih tinggi karena melebar
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-[#112250] outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-[11px] text-slate-400">
                    Gunakan bahasa yang jelas dan mudah dipahami
                  </p>
                  <p className="text-xs font-semibold text-slate-400 sm:text-right">
                    {form.message.length} karakter
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:block">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Megaphone size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900">Perubahan bersifat langsung</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-blue-700">
                  Setiap perubahan akan langsung diterapkan pada notifikasi yang sudah terkirim ke customer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (Penerima & Aksi) - Dibuat 3/12 agar ramping di samping */}
        <div className="space-y-5 lg:col-span-1 xl:col-span-3 xl:space-y-6">
          
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <User size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#112250]">Penerima</h2>
                <p className="text-[11px] text-slate-500">Data customer</p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-600/30">
                    {String(recipientInfo.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#112250]">
                      {recipientInfo.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                      <Mail size={11} className="shrink-0" />
                      <span className="truncate">{recipientInfo.email}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-slate-200/60 pt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500">
                      <Calendar size={11} /> Dibuat
                    </span>
                    <span className="font-semibold text-slate-700 text-right">
                      {formatDate(recipientInfo.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-500">Status</span>
                    {recipientInfo.isRead === 1 ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                        Sudah dibaca
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        Belum dibaca
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3">
                <Lock size={14} className="mt-0.5 shrink-0 text-slate-500" />
                <p className="text-[11px] font-medium leading-relaxed text-slate-600">
                  Target penerima tidak dapat diubah saat mengedit notifikasi yang sudah terkirim.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-[#112250] p-4 sm:p-6 text-white shadow-xl shadow-blue-900/20">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <Megaphone size={16} className="text-blue-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Simpan Perubahan</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-blue-200">
                    Perubahan akan segera diterapkan pada notifikasi customer.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send size={18} className="transition-transform group-hover:translate-x-0.5" />
                    Simpan Perubahan
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-blue-100 backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-60"
              >
                Batal
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:hidden">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Megaphone size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900">Perubahan bersifat langsung</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-blue-700">
                  Setiap perubahan akan langsung diterapkan pada notifikasi yang sudah terkirim.
                </p>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
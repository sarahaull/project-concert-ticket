"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, RefreshCw, Pencil, Trash2, Eye, EyeOff,
  X, Upload, Save, Loader2, Image as ImageIcon, AlertCircle,
  CheckCircle2, Sparkles, Layers, Zap, Hourglass, TrendingUp,
  ChevronRight, SlidersHorizontal, ArrowUpRight, Crown,
  ShieldCheck, Send, XCircle,
} from "lucide-react";

/* ============================================================
   CONFIG
============================================================ */
const RAW_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL
  : `${RAW_API_URL}/api`;

const API_ORIGIN = RAW_API_URL.replace(/\/api$/i, "");
const ENDPOINT = `${API_BASE}/sadmin/banners`;

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  description: "",
  button_text: "Jelajahi Sekarang",
  button_link: "/events",
  secondary_button_text: "Lihat Tiket",
  secondary_button_link: "/tickets",
  is_active: true,
  sort_order: 0,
};

const FILTER_OPTIONS = ["all", "active", "inactive"];

const isActive = (value) => value === true || Number(value) === 1;

const getImageUrl = (image) => {
  if (!image) return "";
  const value = String(image).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}/${value.replace(/^\/+/, "")}`;
};

const formatNumber = (value) => {
  const n = Number(value);
  return new Intl.NumberFormat("id-ID").format(Number.isFinite(n) ? n : 0);
};

/* ============================================================
   MAIN PAGE
============================================================ */
export default function SuperAdminBannersPage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ---------- REQUEST ---------- */
  const request = useCallback(
    async (url, options = {}) => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        throw new Error("Sesi login tidak ditemukan.");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      const type = response.headers.get("content-type") || "";
      const data = type.includes("application/json") ? await response.json() : {};

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        throw new Error("Sesi login berakhir.");
      }
      if (response.status === 403) {
        throw new Error(data.message || "Akses khusus Super Admin.");
      }
      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || data.error || `Request gagal (${response.status})`
        );
      }
      return data;
    },
    [router]
  );

  /* ---------- LOAD ---------- */
  const loadBanners = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        const data = await request(ENDPOINT);
        setBanners(data.banners || []);
      } catch (err) {
        setError(err.message || "Gagal mengambil banner.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [request]
  );

  /* ---------- AUTH ---------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(stored);
      const role = String(parsed.role || parsed.role_name || "").toLowerCase();
      if (role !== "super_admin") {
        router.replace("/dashboard");
        return;
      }
      setUser(parsed);
      loadBanners();
    } catch {
      router.replace("/login");
    }
  }, [router, loadBanners]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ---------- DERIVED ---------- */
  const filtered = useMemo(() => {
    return [...banners]
      .filter((item) => {
        const keyword = search.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          String(item.title || "").toLowerCase().includes(keyword) ||
          String(item.subtitle || "").toLowerCase().includes(keyword);
        const active = isActive(item.is_active);
        const matchesFilter =
          filter === "all" ||
          (filter === "active" && active) ||
          (filter === "inactive" && !active);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }, [banners, search, filter]);

  const activeCount = banners.filter((item) => isActive(item.is_active)).length;
  const inactiveCount = banners.length - activeCount;
  const activeFilterCount =
    (search ? 1 : 0) + (filter !== "all" ? 1 : 0);

  /* ---------- FORM ---------- */
  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview("");
    setFormError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const openCreate = () => {
    resetForm();
    setForm({
      ...EMPTY_FORM,
      sort_order: banners.length
        ? Math.max(...banners.map((b) => Number(b.sort_order) || 0)) + 1
        : 0,
    });
    setModalOpen(true);
  };

  const openEdit = (banner) => {
    resetForm();
    setEditing(banner);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      button_text: banner.button_text || "",
      button_link: banner.button_link || "",
      secondary_button_text: banner.secondary_button_text || "",
      secondary_button_link: banner.secondary_button_link || "",
      is_active: isActive(banner.is_active),
      sort_order: Number(banner.sort_order) || 0,
    });
    setPreview(getImageUrl(banner.image));
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    resetForm();
  };

  const changeField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const changeFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setFormError("Gunakan gambar JPG, PNG, atau WEBP.");
      e.target.value = "";
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFormError("Ukuran gambar maksimal 5 MB.");
      e.target.value = "";
      return;
    }
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setFormError("");
  };

  /* ---------- SUBMIT FORM ---------- */
  const submitForm = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Judul banner wajib diisi.");
      return;
    }
    if (!editing && !file) {
      setFormError("Gambar banner wajib diupload.");
      return;
    }
    if (
      form.sort_order === "" ||
      !Number.isInteger(Number(form.sort_order)) ||
      Number(form.sort_order) < 0
    ) {
      setFormError("Urutan harus berupa angka bulat minimal 0.");
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      payload.append(
        key,
        key === "is_active" ? (value ? "true" : "false") : String(value)
      );
    });
    if (file) payload.append("banner", file);

    setSaving(true);
    try {
      const url = editing ? `${ENDPOINT}/${editing.id}` : ENDPOINT;
      await request(url, { method: editing ? "PUT" : "POST", body: payload });
      setSuccess(
        editing ? "Banner berhasil diperbarui." : "Banner berhasil ditambahkan."
      );
      setModalOpen(false);
      resetForm();
      await loadBanners(true);
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan banner.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- TOGGLE ---------- */
  const toggleStatus = async (banner) => {
    setProcessingId(banner.id);
    setError("");
    setSuccess("");
    const payload = new FormData();
    payload.append("is_active", isActive(banner.is_active) ? "false" : "true");
    try {
      await request(`${ENDPOINT}/${banner.id}`, {
        method: "PUT",
        body: payload,
      });
      setSuccess("Status banner berhasil diperbarui.");
      await loadBanners(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!deleteModal?.id || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await request(`${ENDPOINT}/${deleteModal.id}`, { method: "DELETE" });
      setDeleteModal(null);
      setSuccess("Banner berhasil dihapus.");
      await loadBanners(true);
    } catch (err) {
      setDeleteError(err.message || "Gagal menghapus banner.");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-xl bg-[#0B1220]/10" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220]/[0.06]">
            <Loader2 size={22} className="animate-spin text-[#0B1220]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 text-[#0B1220]">
      {/* ================= HERO ================= */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl" />
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
            <span>Super Admin</span>
            <ChevronRight size={12} className="text-white/30" />
            <span className="text-white/90">Manajemen Banner</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
                <Crown size={12} className="text-amber-300" />
                Content Management Suite
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                Manajemen Banner
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Kelola banner visual yang tampil di halaman utama customer.
                Aktifkan banner untuk langsung tayang, atau simpan sebagai
                draft untuk dikurasi lebih lanjut.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => loadBanners(true)}
                disabled={refreshing || loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.14] disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0B1220] shadow-lg shadow-black/10 transition hover:bg-slate-100"
              >
                <Plus size={16} />
                Tambah Banner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ALERTS ================= */}
      {error && !loading && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-[13px] font-semibold text-red-800">
                Gagal memuat data
              </p>
              <p className="mt-0.5 text-[12.5px] text-red-600">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadBanners(true)}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {success && !loading && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <p className="text-[12.5px] font-medium text-emerald-800">
              {success}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================= STATS ================= */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Banner"
          value={banners.length}
          hint="Semua koleksi banner"
          icon={Layers}
          accent="slate"
        />
        <StatCard
          label="Banner Aktif"
          value={activeCount}
          hint="Sedang tayang di customer"
          icon={Zap}
          accent="sky"
        />
        <StatCard
          label="Nonaktif"
          value={inactiveCount}
          hint="Disimpan sebagai draft"
          icon={EyeOff}
          accent="amber"
        />
        <StatCard
          label="Urutan Tertinggi"
          value={
            banners.length
              ? Math.max(...banners.map((b) => Number(b.sort_order) || 0))
              : 0
          }
          hint="Posisi tayang terakhir"
          icon={TrendingUp}
          accent="emerald"
        />
      </div>

      {/* ================= SUB SUMMARY ================= */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <MiniStat
          label="Banner Live"
          value={activeCount}
          icon={ShieldCheck}
          tone="emerald"
        />
        <MiniStat
          label="Banner Draft"
          value={inactiveCount}
          icon={Hourglass}
          tone="amber"
        />
        <MiniStat
          label="Total Slot"
          value={banners.length}
          icon={Layers}
          tone="slate"
        />
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {/* TOOLBAR */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                <LayersIcon />
                Daftar Banner
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {loading
                  ? "Memuat data banner..."
                  : `${formatNumber(filtered.length)} dari ${formatNumber(
                      banners.length
                    )} banner ditampilkan`}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:flex-wrap">
              <div className="relative w-full sm:w-[280px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul atau subtitle..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative">
                <SlidersHorizontal
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-9 w-full min-w-[150px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#0B1220]/40"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-xl bg-[#0B1220]/10" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220]/[0.06]">
                <Loader2 size={22} className="animate-spin text-[#0B1220]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-semibold text-slate-800">
                Memuat data banner...
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                Mengambil koleksi banner dari server
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0B1220]/[0.04] text-[#0B1220]">
              {banners.length === 0 ? (
                <Sparkles size={22} />
              ) : (
                <Search size={22} />
              )}
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-slate-900">
              {banners.length === 0
                ? "Belum ada banner"
                : "Banner tidak ditemukan"}
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">
              {banners.length === 0
                ? "Mulai dengan menambahkan banner pertama. Banner aktif akan otomatis tayang di halaman utama customer."
                : "Coba ubah kata kunci pencarian atau filter yang digunakan."}
            </p>
            {banners.length === 0 && (
              <button
                onClick={openCreate}
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
              >
                <Plus size={15} />
                Tambah Banner Pertama
              </button>
            )}
          </div>
        )}

        {/* GRID LIST */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 xl:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                processing={processingId === banner.id}
                onToggle={() => toggleStatus(banner)}
                onEdit={() => openEdit(banner)}
                onDelete={() => {
                  setDeleteError("");
                  setDeleteModal(banner);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= INFO PANEL ================= */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1220]/[0.05] text-[#0B1220]">
          <ImageIcon size={16} />
        </div>
        <p className="text-[12.5px] leading-relaxed text-slate-600">
          Dashboard customer mengambil data dari{" "}
          <code className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11.5px] font-semibold text-[#0B1220]">
            GET /api/banners/home
          </code>
          . Pastikan route publik backend mengembalikan data banner aktif agar
          dapat tampil di halaman customer.
        </p>
      </div>

      {/* ================= FORM MODAL ================= */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-900/[0.06] sm:rounded-2xl">
            {/* modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/60 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B1220]/[0.06] text-[#0B1220]">
                  <Sparkles size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Konten Beranda
                  </p>
                  <h2 className="text-[15px] font-semibold text-slate-900">
                    {editing ? "Edit Banner" : "Tambah Banner Baru"}
                  </h2>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={submitForm}
              className="max-h-[calc(95vh-64px)] overflow-y-auto p-6"
            >
              {formError && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <p className="text-[12px] leading-5 text-red-700">
                    {formError}
                  </p>
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  {[
                    ["title", "Judul Banner", true],
                    ["subtitle", "Subtitle / Label", false],
                    ["button_text", "Teks Tombol Utama", false],
                    ["button_link", "Link Tombol Utama", false],
                    ["secondary_button_text", "Teks Tombol Kedua", false],
                    ["secondary_button_link", "Link Tombol Kedua", false],
                  ].map(([name, label, required]) => (
                    <div key={name}>
                      <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {label}{" "}
                        {required && (
                          <span className="text-rose-500">*</span>
                        )}
                      </label>
                      <input
                        name={name}
                        value={form[name]}
                        onChange={changeField}
                        required={required}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={form.description}
                      onChange={changeField}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Urutan
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="sort_order"
                        value={form.sort_order}
                        onChange={changeField}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex h-9 cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 transition hover:bg-slate-50">
                        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                          Aktif
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={changeField}
                            className="peer sr-only"
                          />
                          <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-[#0B1220] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0B1220]/10" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col">
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Gambar Banner{" "}
                    {!editing && <span className="text-rose-500">*</span>}
                  </label>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={changeFile}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group relative flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white transition-all hover:border-[#0B1220]/40"
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="Preview banner"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <span className="rounded-lg bg-white/20 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/30">
                            Ganti Gambar
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="flex flex-col items-center gap-3 p-4 text-center text-sm text-slate-500">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1220]/[0.06] text-[#0B1220]">
                          <Upload size={16} />
                        </div>
                        <div>
                          <span className="text-[12.5px] font-semibold text-slate-700">
                            Klik untuk upload
                          </span>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            JPG, PNG, WEBP (Maks. 5MB)
                          </p>
                        </div>
                      </span>
                    )}
                  </button>

                  {file && (
                    <p className="mt-2 truncate text-[11px] font-medium text-slate-500">
                      File: {file.name}
                    </p>
                  )}

                  {/* LIVE PREVIEW */}
                  <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-5">
                    <div className="pointer-events-none absolute -right-6 -top-6 text-slate-700/40">
                      <ImageIcon size={120} />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-amber-300">
                        {form.subtitle || "PREVIEW BANNER"}
                      </p>
                      <h3 className="mt-2 text-[17px] font-semibold leading-tight text-white">
                        {form.title || "Judul Banner Anda"}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-white/60">
                        {form.description ||
                          "Deskripsi singkat mengenai banner akan muncul di bagian ini."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {form.button_text && (
                          <span className="rounded-full bg-white px-3 py-1 text-[10.5px] font-semibold text-[#0B1220]">
                            {form.button_text}
                          </span>
                        )}
                        {form.secondary_button_text && (
                          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10.5px] font-semibold text-white backdrop-blur">
                            {form.secondary_button_text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteModal(null);
              setDeleteError("");
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/[0.06]">
            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={18} />
              </div>
              <h2 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                Hapus Banner?
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                Banner{" "}
                <strong className="text-slate-700">
                  {deleteModal.title}
                </strong>{" "}
                akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              {deleteError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <p className="text-[12px] leading-5 text-red-700">
                    {deleteError}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteModal(null);
                  setDeleteError("");
                }}
                disabled={deleting}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Hapus Banner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HELPER: LayersIcon
============================================================ */
function LayersIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    </span>
  );
}

/* ============================================================
   STAT CARD (4 aksen: slate / sky / amber / emerald)
============================================================ */
function StatCard({ label, value, hint, icon: Icon, accent = "slate" }) {
  const accents = {
    slate: {
      iconWrap: "bg-[#0B1220]/[0.06] text-[#0B1220]",
      bar: "from-[#0B1220] to-slate-600",
      glow: "bg-slate-300/40",
    },
    sky: {
      iconWrap: "bg-sky-50 text-sky-600",
      bar: "from-sky-400 to-blue-500",
      glow: "bg-sky-300/40",
    },
    amber: {
      iconWrap: "bg-amber-50 text-amber-600",
      bar: "from-amber-400 to-orange-500",
      glow: "bg-amber-300/40",
    },
    emerald: {
      iconWrap: "bg-emerald-50 text-emerald-600",
      bar: "from-emerald-400 to-teal-500",
      glow: "bg-emerald-300/40",
    },
  };
  const a = accents[accent] || accents.slate;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${a.glow} opacity-0 blur-2xl transition duration-500 group-hover:opacity-100`}
      />
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
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${a.iconWrap} transition group-hover:scale-110`}
        >
          <Icon size={18} />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-[2.5px] w-full bg-gradient-to-r ${a.bar} opacity-0 transition group-hover:opacity-100`}
      />
    </div>
  );
}

/* ============================================================
   MINI STAT
============================================================ */
function MiniStat({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    rose: "border-rose-100 bg-rose-50/60 text-rose-700",
    violet: "border-violet-100 bg-violet-50/60 text-violet-700",
    amber: "border-amber-100 bg-amber-50/60 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };
  const cls = tones[tone] || tones.slate;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow-sm ${cls}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={15} />
        <span className="text-[12px] font-semibold">{label}</span>
      </div>
      <span className="text-[16px] font-semibold tracking-[-0.01em]">
        {formatNumber(value)}
      </span>
    </div>
  );
}

/* ============================================================
   BANNER CARD (gaya ticket card)
============================================================ */
function BannerCard({ banner, processing, onToggle, onEdit, onDelete }) {
  const imageUrl = getImageUrl(banner.image);
  const active = isActive(banner.is_active);

  return (
    <div className="group relative flex flex-col transition duration-500 hover:-translate-y-1.5">
      {/* outer glow */}
      <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-sky-400/0 via-violet-400/0 to-emerald-400/0 opacity-0 blur-xl transition duration-500 group-hover:from-sky-400/20 group-hover:via-violet-400/20 group-hover:to-emerald-400/20 group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-500 group-hover:border-slate-300 group-hover:shadow-[0_20px_48px_rgba(16,24,40,0.12)]">
        {/* TOP: IMAGE */}
        <div className="relative h-[180px] overflow-hidden bg-[#0B1220]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={banner.title || "Banner"}
              className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.08]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63]">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-blue-200">
                  <ImageIcon size={22} />
                </div>
                <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/80">
                  TICKETVERSE
                </p>
              </div>
            </div>
          )}

          {/* shine sweep */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1200ms] group-hover:translate-x-full" />

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* STATUS */}
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] font-semibold shadow-sm backdrop-blur ${
                active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  active ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {active ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          {/* SORT */}
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0B1220]/90 px-2 py-1 text-[10.5px] font-semibold text-white shadow-lg backdrop-blur">
              <Layers size={10} />
              #{banner.sort_order ?? 0}
            </span>
          </div>

          {/* BUTTON TEXT BADGE */}
          {banner.button_text && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-md bg-white/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#0B1220] shadow-sm">
                {banner.button_text}
              </span>
            </div>
          )}
        </div>

        {/* PERFORATION */}
        <div className="relative h-0">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-[#f7f8fb] shadow-inner" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-[#f7f8fb] shadow-inner" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-200" />
        </div>

        {/* BOTTOM CONTENT */}
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[14.5px] font-semibold leading-5 tracking-[-0.01em] text-[#0B1220]">
              {banner.title || "Untitled Banner"}
            </h3>
            {banner.subtitle && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                <Sparkles size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">{banner.subtitle}</span>
              </div>
            )}
          </div>

          <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
            {banner.description || "Tidak ada deskripsi."}
          </p>

          {/* ACTIONS */}
          <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3.5">
            <button
              type="button"
              onClick={onToggle}
              disabled={processing}
              className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 text-[11.5px] font-semibold transition ${
                active
                  ? "border-slate-200 bg-white text-slate-700 hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04]"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {processing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : active ? (
                <EyeOff size={12} />
              ) : (
                <Eye size={12} />
              )}
              {processing
                ? "Memproses..."
                : active
                ? "Sembunyikan"
                : "Tampilkan"}
            </button>

            <button
              type="button"
              onClick={onEdit}
              title="Edit banner"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
            >
              <Pencil size={13} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              title="Hapus banner"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
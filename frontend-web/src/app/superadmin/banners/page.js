"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, RefreshCw, Pencil, Trash2, Eye, EyeOff,
  X, Upload, Save, Loader2, Image as ImageIcon, AlertCircle,
  CheckCircle2, Sparkles, Layers, Zap, Hourglass, TrendingUp,
  ChevronRight, SlidersHorizontal, Crown, ShieldCheck,
} from "lucide-react";

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
    <div className="w-full space-y-6 text-[#112250]">
      <section className="relative overflow-hidden rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 animate-pulse rounded-full bg-[#5a8ad0]/15 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa0c0]">
              <span>Super Admin</span>
              <ChevronRight size={10} className="text-[#8aa0c0]/50" />
              <span>Manajemen Banner</span>
            </div>
            <h1 className="text-[26px] font-bold tracking-tight text-white sm:text-[32px]">
              Manajemen Banner
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-[#8aa0c0]">
              Kelola banner visual yang tampil di halaman utama customer.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => loadBanners(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] px-5 py-2.5 text-xs font-bold text-[#0a1628] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(138,180,248,0.3)] disabled:opacity-50"
            >
              <Plus size={14} />
              Tambah Banner
            </button>
          </div>
        </div>
      </section>

      {error && !loading && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-[13px] font-bold text-red-800">
                Gagal memuat data
              </p>
              <p className="mt-0.5 text-[12.5px] text-red-600">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadBanners(true)}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-[12.5px] font-bold text-white transition hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {success && !loading && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Banner"
          value={banners.length}
          hint="Semua koleksi banner"
          icon={Layers}
        />
        <StatCard
          label="Banner Aktif"
          value={activeCount}
          hint="Sedang tayang di customer"
          icon={Zap}
        />
        <StatCard
          label="Nonaktif"
          value={inactiveCount}
          hint="Disimpan sebagai draft"
          icon={EyeOff}
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
        />
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e0e8f0]/60 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0a1628]">
                <LayersIcon />
                Daftar Banner
              </h2>
              <p className="mt-0.5 text-[11px] text-[#7e91b2]">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul atau subtitle..."
                  className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 text-[13px] text-[#112250] outline-none transition placeholder:text-gray-400 focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative">
                <SlidersHorizontal
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-9 w-full min-w-[150px] appearance-none rounded-lg border border-gray-300 bg-white pl-9 pr-8 text-[13px] font-medium text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
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
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-bold text-gray-500 transition hover:bg-gray-100 hover:text-[#112250]"
                >
                  <X size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-xl bg-[#112250]/10" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#112250]/[0.06]">
                <Loader2 size={22} className="animate-spin text-[#112250]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-bold text-gray-800">
                Memuat data banner...
              </p>
              <p className="mt-0.5 text-[12px] text-gray-400">
                Mengambil koleksi banner dari server
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#112250]/[0.04] text-[#112250]">
              {banners.length === 0 ? (
                <Sparkles size={22} />
              ) : (
                <Search size={22} />
              )}
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-[#112250]">
              {banners.length === 0
                ? "Belum ada banner"
                : "Banner tidak ditemukan"}
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
              {banners.length === 0
                ? "Mulai dengan menambahkan banner pertama. Banner aktif akan otomatis tayang di halaman utama customer."
                : "Coba ubah kata kunci pencarian atau filter yang digunakan."}
            </p>
            {banners.length === 0 && (
              <button
                onClick={openCreate}
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#112250] px-4 text-[13px] font-bold text-white transition hover:bg-[#3B507D]"
              >
                <Plus size={15} />
                Tambah Banner Pertama
              </button>
            )}
          </div>
        )}

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
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-[#e0e8f0]/60 bg-white p-4 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#112250]/[0.05] text-[#112250]">
          <ImageIcon size={16} />
        </div>
        <p className="text-[12.5px] leading-relaxed text-gray-500">
          Dashboard customer mengambil data dari{" "}
          <code className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[11.5px] font-semibold text-[#112250]">
            GET /api/banners/home
          </code>
          . Pastikan route publik backend mengembalikan data banner aktif agar
          dapat tampil di halaman customer.
        </p>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-900/[0.06] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#112250]/[0.06] text-[#112250]">
                  <Sparkles size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Konten Beranda
                  </p>
                  <h2 className="text-[15px] font-bold text-[#112250]">
                    {editing ? "Edit Banner" : "Tambah Banner Baru"}
                  </h2>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
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
                      <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-500">
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
                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-[#112250] outline-none transition placeholder:text-gray-400 focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-500">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={form.description}
                      onChange={changeField}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-[#112250] outline-none transition placeholder:text-gray-400 focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-500">
                        Urutan
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="sort_order"
                        value={form.sort_order}
                        onChange={changeField}
                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-[#112250] outline-none transition focus:border-[#112250] focus:ring-1 focus:ring-[#112250]"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex h-9 cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 transition hover:bg-gray-50">
                        <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-500">
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
                          <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-[#112250] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#112250]/10" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-500">
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
                    className="group relative flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-[#112250]/40"
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
                      <span className="flex flex-col items-center gap-3 p-4 text-center text-sm text-gray-500">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#112250]/[0.06] text-[#112250]">
                          <Upload size={16} />
                        </div>
                        <div>
                          <span className="text-[12.5px] font-bold text-gray-700">
                            Klik untuk upload
                          </span>
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            JPG, PNG, WEBP (Maks. 5MB)
                          </p>
                        </div>
                      </span>
                    )}
                  </button>

                  {file && (
                    <p className="mt-2 truncate text-[11px] font-medium text-gray-500">
                      File: {file.name}
                    </p>
                  )}

                  <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e] p-5">
                    <div className="pointer-events-none absolute -right-6 -top-6 text-white/5">
                      <ImageIcon size={120} />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#8ab4f8]">
                        {form.subtitle || "PREVIEW BANNER"}
                      </p>
                      <h3 className="mt-2 text-[17px] font-bold leading-tight text-white">
                        {form.title || "Judul Banner Anda"}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-white/60">
                        {form.description ||
                          "Deskripsi singkat mengenai banner akan muncul di bagian ini."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {form.button_text && (
                          <span className="rounded-full bg-white px-3 py-1 text-[10.5px] font-bold text-[#0a1628]">
                            {form.button_text}
                          </span>
                        )}
                        {form.secondary_button_text && (
                          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10.5px] font-bold text-white backdrop-blur">
                            {form.secondary_button_text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-9 rounded-lg border border-gray-300 bg-white px-3.5 text-[13px] font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#112250] px-4 text-[13px] font-bold text-white transition hover:bg-[#3B507D] disabled:cursor-not-allowed disabled:opacity-60"
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
              <h2 className="mt-4 text-[16px] font-bold tracking-[-0.01em] text-[#112250]">
                Hapus Banner?
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                Banner{" "}
                <strong className="text-gray-700">
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
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteModal(null);
                  setDeleteError("");
                }}
                disabled={deleting}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3.5 text-[13px] font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-3.5 text-[13px] font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
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

function LayersIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#112250]/[0.05] text-[#112250]">
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

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e0e8f0]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#7e91b2]">
            {label}
          </p>
          <h3 className="mt-1 break-words text-lg font-extrabold leading-tight tracking-tight text-[#112250] sm:text-xl">
            {formatNumber(value)}
          </h3>
        </div>
      </div>
      <p className="mt-3 truncate text-[11px] font-medium text-[#7e91b2]">
        {hint}
      </p>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    slate: "border-gray-200 bg-gray-50 text-gray-700",
  };
  const cls = tones[tone] || tones.slate;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow-sm ${cls}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={15} />
        <span className="text-[12px] font-bold">{label}</span>
      </div>
      <span className="text-[16px] font-extrabold tracking-[-0.01em]">
        {formatNumber(value)}
      </span>
    </div>
  );
}

function BannerCard({ banner, processing, onToggle, onEdit, onDelete }) {
  const imageUrl = getImageUrl(banner.image);
  const active = isActive(banner.is_active);

  return (
    <div className="group relative flex flex-col transition duration-500 hover:-translate-y-1.5">
      <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-[#112250]/0 via-[#112250]/0 to-[#8ab4f8]/0 opacity-0 blur-xl transition duration-500 group-hover:from-[#112250]/10 group-hover:via-[#112250]/10 group-hover:to-[#8ab4f8]/10 group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#e0e8f0]/60 bg-white shadow-sm transition duration-500 group-hover:border-gray-300 group-hover:shadow-md">
        <div className="relative h-[180px] overflow-hidden bg-[#112250]">
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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-white">
                  <ImageIcon size={22} />
                </div>
                <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                  TICKETVERSE
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1200ms] group-hover:translate-x-full" />

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] font-bold shadow-sm backdrop-blur ${
                active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-gray-50 text-gray-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  active ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {active ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#112250]/90 px-2 py-1 text-[10.5px] font-bold text-white shadow-lg backdrop-blur">
              <Layers size={10} />
              #{banner.sort_order ?? 0}
            </span>
          </div>

          {banner.button_text && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-md bg-white/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#112250] shadow-sm">
                {banner.button_text}
              </span>
            </div>
          )}
        </div>

        <div className="relative h-0">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-[#e0e8f0]/60 bg-[#F8F9FA] shadow-inner" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-[#e0e8f0]/60 bg-[#F8F9FA] shadow-inner" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#e0e8f0]/80" />
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[14.5px] font-bold leading-5 tracking-[-0.01em] text-[#112250]">
              {banner.title || "Untitled Banner"}
            </h3>
            {banner.subtitle && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                <Sparkles size={12} className="shrink-0 text-gray-400" />
                <span className="truncate">{banner.subtitle}</span>
              </div>
            )}
          </div>

          <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-gray-500">
            {banner.description || "Tidak ada deskripsi."}
          </p>

          <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-3.5">
            <button
              type="button"
              onClick={onToggle}
              disabled={processing}
              className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 text-[11.5px] font-bold transition ${
                active
                  ? "border-gray-200 bg-white text-gray-700 hover:border-[#112250]/30 hover:bg-[#112250]/[0.04]"
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:border-[#112250]/30 hover:bg-[#112250]/[0.04] hover:text-[#112250]"
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
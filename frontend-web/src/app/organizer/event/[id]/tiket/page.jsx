
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ticket,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  RefreshCw,
  Tag,
  Wallet,
  Layers,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Music,
  Users,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

// ============================================================
// API CONFIGURATION
// ============================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_ROOT = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");
const API_BASE = `${API_ROOT}/api`;

const INITIAL_FORM = {
  category_name: "",
  price: "",
  quota: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B507D] focus:ring-4 focus:ring-[#3B507D]/10 disabled:bg-slate-50";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500";

const getToken = () => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!data) {
    throw new Error("Response backend tidak valid.");
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        data.error ||
        `Request gagal (${response.status}).`
    );
  }

  return data;
};

const getEventData = (data) =>
  data?.event || data?.data?.event || data?.data || data;

const getTicketCategories = (data) => {
  if (Array.isArray(data)) return data;

  return (
    data?.ticket_categories ||
    data?.data?.ticket_categories ||
    data?.categories ||
    data?.data ||
    []
  );
};

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// ============================================================
// COMPONENT
// ============================================================

export default function KelolaTiketEventPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  const [formError, setFormError] = useState("");

  // ==========================================================
  // API HELPER
  // ==========================================================

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
      cache: "no-store",
    });

    return parseResponse(response);
  }, []);

  // ==========================================================
  // LOAD EVENT & TICKET CATEGORIES
  // ==========================================================

  const loadData = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setNotification({ type: "", message: "" });

      const [eventResponse, categoryResponse] = await Promise.all([
        apiRequest(`/events/${eventId}`),
        apiRequest(`/ticket-categories/event/${eventId}`),
      ]);

      setEvent(getEventData(eventResponse));

      const categoryList = getTicketCategories(categoryResponse);

      setCategories(
        Array.isArray(categoryList) ? categoryList : []
      );
    } catch (error) {
      console.error("LOAD TICKET DATA ERROR:", error);

      setNotification({
        type: "error",
        message: error.message || "Gagal mengambil data tiket.",
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, apiRequest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    return categories.reduce(
      (result, category) => {
        const quota = Number(category.quota || 0);
        const remaining = Number(category.remaining_ticket || 0);

        result.totalQuota += quota;
        result.remaining += remaining;
        result.sold += Math.max(0, quota - remaining);
        result.revenuePotential +=
          Number(category.price || 0) * quota;

        return result;
      },
      {
        totalQuota: 0,
        remaining: 0,
        sold: 0,
        revenuePotential: 0,
      }
    );
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return categories;

    return categories.filter((category) =>
      String(category.category_name || "")
        .toLowerCase()
        .includes(keyword)
    );
  }, [categories, search]);

  // ==========================================================
  // NOTIFICATION
  // ==========================================================

  const notify = (type, message) => {
    setNotification({ type, message });
  };

  // ==========================================================
  // FORM HANDLER
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  };

  const openAddForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setFormError("");
    setShowForm(true);

    setNotification({ type: "", message: "" });
  };

  const openEditForm = (category) => {
    setEditingId(category.id);

    setForm({
      category_name: category.category_name || "",
      price: String(category.price ?? ""),
      quota: String(category.quota ?? ""),
    });

    setFormError("");
    setShowForm(true);

    setNotification({ type: "", message: "" });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!form.category_name.trim()) {
      return "Nama kategori tiket wajib diisi.";
    }

    if (form.category_name.trim().length > 100) {
      return "Nama kategori maksimal 100 karakter.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      return "Harga tiket tidak valid.";
    }

    if (
      !Number.isSafeInteger(Number(form.price))
    ) {
      return "Harga tiket harus berupa angka bulat.";
    }

    if (
      form.quota === "" ||
      !Number.isSafeInteger(Number(form.quota)) ||
      Number(form.quota) < 1
    ) {
      return "Kuota tiket minimal 1 dan harus berupa angka bulat.";
    }

    if (
      editingId &&
      Number(form.quota) <
        Number(
          categories.find((item) => item.id === editingId)
            ?.quota -
            Number(
              categories.find((item) => item.id === editingId)
                ?.remaining_ticket || 0
            )
        )
    ) {
      return "Kuota tidak boleh lebih kecil dari jumlah tiket yang sudah terjual.";
    }

    return "";
  };

  // ==========================================================
  // SAVE TICKET CATEGORY
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setNotification({ type: "", message: "" });

      const payload = {
        event_id: Number(eventId),
        category_name: form.category_name.trim(),
        price: Number(form.price),
        quota: Number(form.quota),
      };

      if (editingId) {
        await apiRequest(`/ticket-categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        notify("success", "Kategori tiket berhasil diperbarui.");
      } else {
        await apiRequest("/ticket-categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        notify("success", "Kategori tiket berhasil ditambahkan.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error("SAVE TICKET CATEGORY ERROR:", error);
      setFormError(
        error.message || "Gagal menyimpan kategori tiket."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE TICKET CATEGORY
  // ==========================================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${category.category_name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.id);
      setNotification({ type: "", message: "" });

      await apiRequest(`/ticket-categories/${category.id}`, {
        method: "DELETE",
      });

      notify("success", "Kategori tiket berhasil dihapus.");

      await loadData();
    } catch (error) {
      console.error("DELETE TICKET CATEGORY ERROR:", error);

      notify(
        "error",
        error.message || "Gagal menghapus kategori tiket."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  if (loading && !event) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-[#23354D]"
          />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat data event dan tiket...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-10 text-[#0F172A]">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <Link
            href={`/organizer/events/${eventId}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#495B7D]">
              <span>Organizer</span>
              <span>/</span>
              <span>Events</span>
              <span>/</span>
              <span>Kelola Tiket</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0D1F42] sm:text-3xl">
              Kelola Tiket
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Atur kategori, harga, dan kuota tiket event.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {/* ================================================== */}
      {/* NOTIFICATION */}
      {/* ================================================== */}

      {notification.message && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={19} />
          ) : (
            <AlertCircle size={19} />
          )}

          <span className="flex-1">{notification.message}</span>

          <button
            type="button"
            onClick={() =>
              setNotification({ type: "", message: "" })
            }
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* EVENT INFORMATION */}
      {/* ================================================== */}

      {event && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {event.poster ? (
                <img
                  src={
                    event.poster.startsWith("http")
                      ? event.poster
                      : `${API_ROOT}${event.poster.startsWith("/") ? "" : "/"}${event.poster}`
                  }
                  alt={event.event_name || "Poster event"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <Ticket size={32} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#EFF2F7] px-3 py-1 text-[11px] font-bold text-[#23354D]">
                  EVENT
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  {event.status || "Belum ada status"}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#0D1F42]">
                {event.event_name || "Nama Event"}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-2">
                  <CalendarDays size={15} />
                  {formatDate(event.event_date)}
                </span>

                <span className="flex items-center gap-2">
                  <Music size={15} />
                  {event.event_time || "-"}
                </span>

                <span className="flex items-center gap-2">
                  <Tag size={15} />
                  ID Event: {event.id}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-[#F5F7FA] px-5 py-4 sm:min-w-36">
              <p className="text-xs font-semibold text-slate-500">
                Total Kategori
              </p>
              <p className="mt-1 text-3xl font-bold text-[#0D1F42]">
                {categories.length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Kategori tiket
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* STATISTICS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Layers}
          label="Total Kuota"
          value={statistics.totalQuota.toLocaleString("id-ID")}
          description="Kapasitas seluruh tiket"
        />

        <StatCard
          icon={Ticket}
          label="Tiket Terjual"
          value={statistics.sold.toLocaleString("id-ID")}
          description="Total tiket yang terjual"
        />

        <StatCard
          icon={Users}
          label="Tiket Tersedia"
          value={statistics.remaining.toLocaleString("id-ID")}
          description="Sisa tiket yang tersedia"
        />

        <StatCard
          icon={TrendingUp}
          label="Potensi Pendapatan"
          value={formatRupiah(statistics.revenuePotential)}
          description="Berdasarkan seluruh kuota"
          compact
        />

      </div>

      {/* ================================================== */}
      {/* FORM ADD / EDIT */}
      {/* ================================================== */}

      {showForm && (
        <section
          id="ticket-category-form"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-[#0D1F42]">
                {editingId
                  ? "Edit Kategori Tiket"
                  : "Tambah Kategori Tiket"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Lengkapi informasi kategori tiket untuk event ini.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className={labelClass}>
                  Nama Kategori *
                </label>

                <div className="relative">
                  <Tag
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="category_name"
                    value={form.category_name}
                    onChange={handleChange}
                    placeholder="Contoh: VIP, Festival, Regular"
                    maxLength={100}
                    disabled={saving}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Harga Tiket (Rupiah) *
                </label>

                <div className="relative">
                  <Wallet
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Contoh: 250000"
                    min="0"
                    step="1"
                    disabled={saving}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Kuota Tiket *
                </label>

                <div className="relative">
                  <Users
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="number"
                    name="quota"
                    value={form.quota}
                    onChange={handleChange}
                    placeholder="Contoh: 500"
                    min="1"
                    step="1"
                    disabled={saving}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            {form.price !== "" && form.quota !== "" && (
              <div className="mt-5 rounded-xl border border-[#8BA3C5]/30 bg-[#F0F3F8] p-4">
                <p className="text-xs font-semibold text-[#495B7D]">
                  Estimasi pendapatan maksimal kategori
                </p>

                <p className="mt-1 text-xl font-bold text-[#0D1F42]">
                  {formatRupiah(
                    Number(form.price) * Number(form.quota)
                  )}
                </p>
              </div>
            )}

            {formError && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={17} />
                {formError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0D1F42] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#23354D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    {editingId ? "Simpan Perubahan" : "Tambah Kategori"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ================================================== */}
      {/* TICKET CATEGORY TABLE */}
      {/* ================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[#0D1F42]">
              Daftar Kategori Tiket
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Kelola harga dan kapasitas setiap kategori tiket.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            disabled={!event || showForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0D1F42] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#23354D] disabled:opacity-50"
          >
            <Plus size={18} />
            Tambah Kategori
          </button>
        </div>

        {/* SEARCH */}

        <div className="border-b border-slate-100 p-5">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kategori tiket..."
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {/* TABLE */}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={28}
              className="animate-spin text-[#23354D]"
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F3F8] text-[#495B7D]">
              <Ticket size={30} />
            </div>

            <h3 className="mt-5 text-base font-bold text-[#0D1F42]">
              Belum Ada Kategori Tiket
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Event ini belum memiliki kategori tiket. Tambahkan
              kategori seperti VIP, Festival, atau Regular.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0D1F42] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#23354D]"
            >
              <Plus size={17} />
              Buat Kategori Pertama
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">
            Kategori tiket tidak ditemukan.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Harga Tiket</th>
                    <th className="px-6 py-4">Total Kuota</th>
                    <th className="px-6 py-4">Terjual</th>
                    <th className="px-6 py-4">Tersedia</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((category) => {
                    const quota = Number(category.quota || 0);
                    const remaining = Number(
                      category.remaining_ticket || 0
                    );

                    const sold = Math.max(0, quota - remaining);

                    const percentage =
                      quota > 0
                        ? Math.min(100, (sold / quota) * 100)
                        : 0;

                    const soldOut = remaining <= 0;

                    return (
                      <tr
                        key={category.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF2F7] text-[#23354D]">
                              <Ticket size={19} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-[#0D1F42]">
                                {category.category_name}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                ID: {category.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-[#0D1F42]">
                            {formatRupiah(category.price)}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                          {quota.toLocaleString("id-ID")}
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-700">
                            {sold.toLocaleString("id-ID")}
                          </p>

                          <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#495B7D]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-[#0D1F42]">
                            {remaining.toLocaleString("id-ID")}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${
                              soldOut
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {soldOut ? "HABIS" : "TERSEDIA"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Edit kategori"
                              onClick={() => openEditForm(category)}
                              disabled={Boolean(deletingId)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#8BA3C5] hover:bg-[#F0F3F8] hover:text-[#23354D]"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Hapus kategori"
                              onClick={() => handleDelete(category)}
                              disabled={Boolean(deletingId)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              {deletingId === category.id ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:flex-row">
              <span>
                Menampilkan {filteredCategories.length} dari{" "}
                {categories.length} kategori tiket
              </span>

              <span>
                Total tiket tersedia:{" "}
                <strong className="text-[#0D1F42]">
                  {statistics.remaining.toLocaleString("id-ID")}
                </strong>
              </span>
            </div>
          </>
        )}
      </section>

      {/* ================================================== */}
      {/* INFORMATION */}
      {/* ================================================== */}

      <div className="rounded-2xl border border-[#8BA3C5]/30 bg-[#F0F3F8] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#23354D] text-white">
            <CircleDollarSign size={19} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#0D1F42]">
              Informasi Pengelolaan Tiket
            </h3>

            <p className="mt-1 text-xs leading-6 text-slate-600">
              Setiap kategori tiket terhubung langsung dengan event
              yang dipilih. Kuota dan sisa tiket disimpan pada tabel
              ticket_categories. Jumlah tiket terjual ditampilkan
              berdasarkan selisih kuota dan remaining_ticket.
              Pastikan backend melakukan validasi transaksi agar
              jumlah tiket yang tersedia selalu akurat.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ============================================================
// STATISTIC CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  compact = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            {label}
          </p>

          <p
            className={`mt-3 break-words font-bold tracking-tight text-[#0D1F42] ${
              compact ? "text-lg sm:text-xl" : "text-2xl"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF2F7] text-[#23354D]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

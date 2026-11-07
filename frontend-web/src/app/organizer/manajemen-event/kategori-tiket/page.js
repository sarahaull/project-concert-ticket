"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Ticket,
  CalendarDays,
  Users,
  Wallet,
  X,
  ChevronDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Music2,
  Package,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TICKET_CATEGORY_API = `${API_URL}/api/ticket-categories`;
const EVENT_API = `${API_URL}/api/events`;

const EMPTY_FORM = {
  event_id: "",
  category_name: "",
  price: "",
  quota: "",
  remaining_ticket: "",
};

const formatRupiah = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
};

const getEventName = (event) => {
  return (
    event?.event_name ||
    event?.name ||
    event?.title ||
    `Event #${event?.id || "-"}`
  );
};

export default function KategoriTiketPage() {
  const [ticketCategories, setTicketCategories] = useState([]);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const fetchTicketCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(TICKET_CATEGORY_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data kategori tiket");
      }
      setTicketCategories(data.ticket_categories || []);
    } catch (err) {
      console.error("FETCH TICKET CATEGORIES ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil kategori tiket.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(EVENT_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data event");
      }

      let eventData = [];
      if (Array.isArray(data)) eventData = data;
      else if (Array.isArray(data.events)) eventData = data.events;
      else if (Array.isArray(data.data)) eventData = data.data;

      setEvents(eventData);
    } catch (err) {
      console.error("FETCH EVENTS ERROR:", err);
      setError(err.message || "Gagal mengambil daftar event.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchTicketCategories();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 3500);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return ticketCategories.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.category_name?.toLowerCase().includes(keyword) ||
        item.event_name?.toLowerCase().includes(keyword) ||
        item.artist_name?.toLowerCase().includes(keyword) ||
        item.venue_name?.toLowerCase().includes(keyword);

      const matchesEvent =
        eventFilter === "all" || String(item.event_id) === String(eventFilter);

      return matchesSearch && matchesEvent;
    });
  }, [ticketCategories, search, eventFilter]);

  const statistics = useMemo(() => {
    const totalCategories = ticketCategories.length;
    const totalQuota = ticketCategories.reduce(
      (total, item) => total + Number(item.quota || 0),
      0
    );
    const totalRemaining = ticketCategories.reduce(
      (total, item) => total + Number(item.remaining_ticket || 0),
      0
    );
    const totalSold = Math.max(totalQuota - totalRemaining, 0);
    const totalRevenuePotential = ticketCategories.reduce(
      (total, item) => total + Number(item.quota || 0) * Number(item.price || 0),
      0
    );

    return {
      totalCategories,
      totalQuota,
      totalRemaining,
      totalSold,
      totalRevenuePotential,
    };
  }, [ticketCategories]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      event_id: String(item.event_id || ""),
      category_name: item.category_name || "",
      price: item.price ?? "",
      quota: item.quota ?? "",
      remaining_ticket: item.remaining_ticket ?? "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    if (submitting) return;
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.event_id) return setError("Silakan pilih event terlebih dahulu.");
    if (!form.category_name.trim())
      return setError("Nama kategori tiket wajib diisi.");
    if (form.price === "" || Number(form.price) < 0)
      return setError("Harga tiket harus diisi dengan benar.");
    if (form.quota === "" || Number(form.quota) <= 0)
      return setError("Kuota tiket harus lebih dari 0.");
    if (form.remaining_ticket !== "" && Number(form.remaining_ticket) < 0)
      return setError("Sisa tiket tidak boleh kurang dari 0.");
    if (
      form.remaining_ticket !== "" &&
      Number(form.remaining_ticket) > Number(form.quota)
    )
      return setError("Sisa tiket tidak boleh lebih besar dari kuota.");

    try {
      setSubmitting(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;
      const isEditing = Boolean(editingId);

      const payload = {
        event_id: Number(form.event_id),
        category_name: form.category_name.trim(),
        price: Number(form.price),
        quota: Number(form.quota),
        remaining_ticket:
          form.remaining_ticket === ""
            ? Number(form.quota)
            : Number(form.remaining_ticket),
      };

      const response = await fetch(
        isEditing ? `${TICKET_CATEGORY_API}/${editingId}` : TICKET_CATEGORY_API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Gagal memperbarui kategori tiket."
              : "Gagal menambahkan kategori tiket.")
        );
      }

      setSuccess(
        isEditing
          ? "Kategori tiket berhasil diperbarui."
          : "Kategori tiket berhasil ditambahkan."
      );
      closeForm();
      await fetchTicketCategories();
    } catch (err) {
      console.error("SUBMIT TICKET CATEGORY ERROR:", err);
      setError(
        err.message || "Terjadi kesalahan saat menyimpan kategori tiket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, categoryName) => {
    const confirmed = window.confirm(
      `Hapus kategori tiket "${categoryName}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
    );
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(`${TICKET_CATEGORY_API}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus kategori tiket.");
      }

      setSuccess("Kategori tiket berhasil dihapus.");
      await fetchTicketCategories();
    } catch (err) {
      console.error("DELETE TICKET CATEGORY ERROR:", err);
      setError(
        err.message || "Terjadi kesalahan saat menghapus kategori tiket."
      );
    }
  };

  const selectedEvent = useMemo(() => {
    if (!form.event_id) return null;
    return events.find((event) => String(event.id) === String(form.event_id));
  }, [events, form.event_id]);

  if (loading && ticketCategories.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 size={25} className="animate-spin text-[#112250]" />
          </div>
          <div className="text-center">
            <p className="font-bold text-[#0F172A]">Memuat kategori tiket</p>
            <p className="mt-1 text-sm text-slate-500">
              Mengambil data dari server...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 text-[#0F172A]">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Ticket size={16} className="text-[#112250]" />
              <span>Manajemen Event</span>
              <span className="text-[#112250]">/</span>
              <span className="font-semibold text-slate-600">
                Kategori Tiket
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Kategori Tiket
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Kelola kategori tiket, harga, dan kuota untuk setiap event yang
              kamu buat.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchTicketCategories}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1A326A] hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Tambah Kategori
            </button>
          </div>
        </div>

        {/* ALERT */}
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 shadow-sm">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-emerald-500"
            />
            <p className="text-sm font-medium text-emerald-700">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto text-emerald-500 hover:text-emerald-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm">
            <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Ticket}
            label="Total Kategori"
            value={formatNumber(statistics.totalCategories)}
            description="Kategori tiket tersedia"
          />
          <StatCard
            icon={Package}
            label="Total Kuota"
            value={formatNumber(statistics.totalQuota)}
            description="Kapasitas seluruh kategori"
          />
          <StatCard
            icon={Users}
            label="Tiket Tersisa"
            value={formatNumber(statistics.totalRemaining)}
            description={`${formatNumber(statistics.totalSold)} tiket terjual`}
          />
          <StatCard
            icon={Wallet}
            label="Potensi Pendapatan"
            value={formatRupiah(statistics.totalRevenuePotential)}
            description="Berdasarkan total kuota"
            compact
          />
        </div>

        {/* FORM */}
        {showForm && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                  {editingId ? <Pencil size={18} /> : <Plus size={19} />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">
                    {editingId ? "Edit Kategori Tiket" : "Tambah Kategori Tiket"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Lengkapi informasi kategori tiket di bawah.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Event <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.event_id}
                      onChange={(e) =>
                        handleFormChange("event_id", e.target.value)
                      }
                      disabled={loadingEvents || submitting}
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:opacity-60"
                    >
                      <option value="">
                        {loadingEvents ? "Memuat event..." : "Pilih event"}
                      </option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {getEventName(event)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  {selectedEvent && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#112250]/15 bg-[#112250]/5 px-4 py-3 text-xs font-medium text-slate-600">
                      {selectedEvent.artist_name && (
                        <span className="inline-flex items-center gap-1.5">
                          <Music2 size={14} className="text-[#112250]" />
                          {selectedEvent.artist_name}
                        </span>
                      )}
                      {selectedEvent.venue_name && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#112250]" />
                          {selectedEvent.venue_name}
                        </span>
                      )}
                      {selectedEvent.city && (
                        <span className="text-slate-500">
                          {selectedEvent.city}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nama Kategori <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.category_name}
                    onChange={(e) =>
                      handleFormChange("category_name", e.target.value)
                    }
                    placeholder="Contoh: VIP, Festival, CAT 1"
                    disabled={submitting}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Harga Tiket <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) =>
                        handleFormChange("price", e.target.value)
                      }
                      placeholder="500000"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kuota Tiket <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quota}
                    onChange={(e) => handleFormChange("quota", e.target.value)}
                    placeholder="100"
                    disabled={submitting}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tiket Tersisa{" "}
                    <span className="ml-1 text-[10px] font-normal normal-case text-slate-400">
                      (opsional saat tambah)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.remaining_ticket}
                    onChange={(e) =>
                      handleFormChange("remaining_ticket", e.target.value)
                    }
                    placeholder={form.quota ? `Default ${form.quota}` : "Mengikuti kuota"}
                    disabled={submitting}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10 disabled:opacity-60"
                  />
                  <p className="mt-2 text-[11px] text-slate-400">
                    Saat tambah kategori, kosongkan untuk otomatis mengikuti kuota.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1A326A] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      {editingId ? <Pencil size={17} /> : <Plus size={17} />}
                      {editingId ? "Simpan Perubahan" : "Tambah Kategori"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FILTER */}
        <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori, event, artis, atau venue..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
              />
            </div>

            <div className="relative lg:w-72">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
              >
                <option value="all">Semua Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {getEventName(event)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* RESULT INFO */}
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Daftar Kategori Tiket
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Menampilkan {filteredCategories.length} dari {ticketCategories.length} kategori
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {filteredCategories.length === 0 ? (
            <EmptyState
              hasFilter={Boolean(search || eventFilter !== "all")}
              onAdd={openAddForm}
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Kategori
                      </th>
                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Event
                      </th>
                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Harga
                      </th>
                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Kuota
                      </th>
                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Tersisa
                      </th>
                      <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Terjual
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCategories.map((item) => {
                      const quota = Number(item.quota || 0);
                      const remaining = Number(item.remaining_ticket || 0);
                      const sold = Math.max(quota - remaining, 0);
                      const percentage =
                        quota > 0
                          ? Math.min(
                              Math.round((remaining / quota) * 100),
                              100
                            )
                          : 0;

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50/50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                                <Ticket size={17} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#0F172A]">
                                  {item.category_name}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  ID #{item.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="max-w-[240px]">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {item.event_name || `Event #${item.event_id}`}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                {item.artist_name && (
                                  <span>{item.artist_name}</span>
                                )}
                                {item.venue_name && (
                                  <span>{item.venue_name}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="whitespace-nowrap text-sm font-bold text-[#0F172A]">
                              {formatRupiah(item.price)}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-slate-700">
                              {formatNumber(quota)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="w-32">
                              <div className="mb-1.5 flex items-center justify-between gap-3">
                                <span className="text-sm font-bold text-[#0F172A]">
                                  {formatNumber(remaining)}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                  {percentage}%
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-[#112250] transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg border border-[#112250]/15 bg-[#112250]/5 px-2.5 py-1 text-xs font-bold text-[#112250]">
                              {formatNumber(sold)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(item)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(item.id, item.category_name)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET CARD */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredCategories.map((item) => {
                  const quota = Number(item.quota || 0);
                  const remaining = Number(item.remaining_ticket || 0);
                  const sold = Math.max(quota - remaining, 0);
                  const percentage =
                    quota > 0
                      ? Math.min(Math.round((remaining / quota) * 100), 100)
                      : 0;

                  return (
                    <div key={item.id} className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                            <Ticket size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#0F172A]">
                              {item.category_name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {item.event_name || `Event #${item.event_id}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item.id, item.category_name)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <InfoItem
                          label="Harga"
                          value={formatRupiah(item.price)}
                        />
                        <InfoItem label="Kuota" value={formatNumber(quota)} />
                        <InfoItem
                          label="Tersisa"
                          value={formatNumber(remaining)}
                        />
                        <InfoItem label="Terjual" value={formatNumber(sold)} />
                      </div>

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Sisa tiket
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#112250]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {(item.artist_name ||
                        item.venue_name ||
                        item.city) && (
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                          {item.artist_name && (
                            <span className="inline-flex items-center gap-1.5">
                              <Music2 size={13} />
                              {item.artist_name}
                            </span>
                          )}
                          {item.venue_name && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={13} />
                              {item.venue_name}
                            </span>
                          )}
                          {item.city && <span>{item.city}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// STAT CARD
function StatCard({ icon: Icon, label, value, description, compact = false }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#112250]/[0.03] transition duration-500 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p
            className={`mt-2 font-bold tracking-tight text-[#0F172A] ${
              compact ? "text-lg sm:text-xl" : "text-2xl"
            }`}
          >
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// INFO ITEM
function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}

// EMPTY STATE
function EmptyState({ hasFilter, onAdd }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#112250]/5 text-[#112250]">
        {hasFilter ? <Search size={25} /> : <Ticket size={25} />}
      </div>
      <h3 className="mt-5 text-lg font-bold text-[#0F172A]">
        {hasFilter ? "Kategori tiket tidak ditemukan" : "Belum ada kategori tiket"}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilter
          ? "Coba ubah kata pencarian atau filter event untuk melihat data lainnya."
          : "Tambahkan kategori tiket pertama untuk mulai mengatur harga dan kuota event."}
      </p>
      {!hasFilter && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#112250] px-4 text-sm font-semibold text-white transition hover:bg-[#1A326A]"
        >
          <Plus size={16} />
          Tambah Kategori
        </button>
      )}
    </div>
  );
}
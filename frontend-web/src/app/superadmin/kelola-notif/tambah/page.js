"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Send,
  Users,
  User,
  Search,
  Loader2,
  Megaphone,
  AlertCircle,
  FileText,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const NOTIFICATION_URL = `${API_URL}/notifications`;

function FormNotifikasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const isEditing = Boolean(editId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    recipient_type: "all",
    user_ids: [],
  });

  const [error, setError] = useState("");

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
        headers: {
          ...getHeaders(),
          ...options.headers,
        },
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

  // LOAD INITIAL DATA (Customers & Notification if edit mode)
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch customers
        const customerData = await request(`${NOTIFICATION_URL}/recipients`);
        if (mounted) {
          setCustomers(
            Array.isArray(customerData.users) ? customerData.users : []
          );
        }

        // If editing, fetch notification details
        if (isEditing) {
          const notifData = await request(NOTIFICATION_URL);
          const found = notifData.notifications.find(
            (n) => String(n.id) === String(editId)
          );

          if (found && mounted) {
            setForm({
              title: found.title || "",
              message: found.message || "",
              recipient_type: "selected",
              user_ids: [Number(found.user_id)],
            });
          } else if (mounted) {
            setError("Data notifikasi tidak ditemukan.");
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || "Gagal memuat data form.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [isEditing, editId, request]);

  const visibleCustomers = useMemo(() => {
    const keyword = customerSearch.toLowerCase();

    return customers.filter((customer) => {
      const name = String(
        customer.fullname || customer.name || ""
      ).toLowerCase();
      const email = String(customer.email || "").toLowerCase();
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [customers, customerSearch]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCustomer = (id) => {
    setForm((prev) => {
      const exists = prev.user_ids.includes(id);
      return {
        ...prev,
        user_ids: exists
          ? prev.user_ids.filter((item) => item !== id)
          : [...prev.user_ids, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setError("Judul dan isi notifikasi wajib diisi.");
      return;
    }

    if (
      !isEditing &&
      form.recipient_type === "selected" &&
      form.user_ids.length === 0
    ) {
      setError("Pilih minimal satu customer.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        await request(`${NOTIFICATION_URL}/${editId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: form.title.trim(),
            message: form.message.trim(),
          }),
        });
      } else {
        await request(`${NOTIFICATION_URL}/broadcast`, {
          method: "POST",
          body: JSON.stringify({
            title: form.title.trim(),
            message: form.message.trim(),
            recipient_type: form.recipient_type,
            ...(form.recipient_type === "selected"
              ? { user_ids: form.user_ids }
              : {}),
          }),
        });
      }

      // Redirect back to list page on success
      router.push("/superadmin/kelola-notif");
    } catch (err) {
      setError(err.message || "Gagal menyimpan notifikasi.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Memuat data form...
          </p>
        </div>
      </div>
    );
  }

  return (
    // FULL WIDTH CONTAINER
    <div className="w-full pb-10">
      {/* HEADER & BACK BUTTON */}
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
              {isEditing ? "Edit Notifikasi" : "Buat Notifikasi Baru"}
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              {isEditing
                ? "Perbarui detail informasi notifikasi di bawah ini."
                : "Kirimkan informasi atau pengumuman terbaru untuk customer Anda."}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 sm:flex">
          <ShieldCheck size={16} />
          Super Admin Access
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm sm:mb-6 sm:items-center">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 sm:mt-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* GRID FORM (Responsive & Wide) */}
      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-12"
      >
        {/* KOLOM KIRI: Form Utama (9/12 di Desktop) */}
        <div className="space-y-5 lg:col-span-2 xl:col-span-9 xl:space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FileText size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#112250] sm:text-base">
                  Konten Notifikasi
                </h2>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  Tuliskan pesan yang akan dikirimkan
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
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
                  placeholder="Tuliskan informasi lengkap yang ingin disampaikan..."
                  rows={12}
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
        </div>

        {/* KOLOM KANAN: Target Penerima & Action (3/12 di Desktop) */}
        <div className="space-y-5 lg:col-span-1 xl:col-span-3 xl:space-y-6">
          
          {/* TARGET PENERIMA (Hanya jika BUKAN edit mode) */}
          {!isEditing && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Users size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#112250]">
                    Target Penerima
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Pilih audiens
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                {/* Opsi Semua */}
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      recipient_type: "all",
                      user_ids: [],
                    })
                  }
                  className={`group relative flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    form.recipient_type === "all"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-lg p-2 transition-colors ${
                      form.recipient_type === "all"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                    }`}
                  >
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#112250]">
                      Semua Customer
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      Kirim ke seluruh {customers.length} customer
                    </p>
                  </div>
                </button>

                {/* Opsi Tertentu */}
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, recipient_type: "selected" })
                  }
                  className={`group relative flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    form.recipient_type === "selected"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-lg p-2 transition-colors ${
                      form.recipient_type === "selected"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                    }`}
                  >
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#112250]">
                      Customer Tertentu
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      Pilih penerima secara manual
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PILIH CUSTOMER (Jika pilih tertentu) */}
          {!isEditing && form.recipient_type === "selected" && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <User size={17} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#112250]">
                      Pilih Customer
                    </h2>
                  </div>
                </div>
                <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                  {form.user_ids.length} dipilih
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <div className="relative mb-3">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Cari nama atau email..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
                  {visibleCustomers.map((customer) => (
                    <label
                      key={customer.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                        form.user_ids.includes(Number(customer.id))
                          ? "bg-indigo-50/80 border-indigo-200 shadow-sm"
                          : "hover:bg-slate-50 border-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.user_ids.includes(Number(customer.id))}
                        onChange={() => toggleCustomer(Number(customer.id))}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#112250]">
                          {customer.fullname || customer.name}
                        </p>
                        <p className="truncate text-[11px] font-medium text-slate-500">
                          {customer.email}
                        </p>
                      </div>
                    </label>
                  ))}

                  {visibleCustomers.length === 0 && (
                    <p className="py-6 text-center text-sm font-medium text-slate-400">
                      Customer tidak ditemukan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACTION & SUBMIT CARD (Biru Gelap Premium) */}
          <div className="relative overflow-hidden rounded-2xl bg-[#112250] p-4 sm:p-6 text-white shadow-xl shadow-blue-900/20">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <Megaphone size={16} className="text-blue-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {isEditing ? "Simpan Perubahan" : "Kirim Notifikasi"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-blue-200">
                    {isEditing
                      ? "Perubahan akan segera diterapkan pada notifikasi customer."
                      : form.recipient_type === "all"
                      ? `Notifikasi akan disebarkan ke seluruh ${customers.length} customer.`
                      : `Notifikasi akan dikirim ke ${form.user_ids.length} customer terpilih.`}
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
                    {isEditing ? "Simpan Perubahan" : "Kirim Notifikasi"}
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

        </div>
      </form>
    </div>
  );
}

// Suspense wrapper untuk Next.js useSearchParams
export default function FormNotifikasiPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
          <Loader2 className="animate-spin text-white" size={28} />
        </div>
      </div>
    }>
      <FormNotifikasiContent />
    </Suspense>
  );
}
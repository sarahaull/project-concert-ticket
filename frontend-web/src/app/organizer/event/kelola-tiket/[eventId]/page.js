"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Map,
  Ticket,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function KelolaTiketPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.eventId;

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    category_name: "",
    price: "",
    quota: "",
    description: "",
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil event.");
      }

      setEvent(data.event || data.data || data);

      // Sesuaikan dengan endpoint kategori tiket backend.
      const categoryResponse = await fetch(
        `${API_URL}/api/ticket-categories/event/${eventId}`,
        {
          headers: getHeaders(),
        }
      );

      const categoryData = await categoryResponse.json();

      if (!categoryResponse.ok || !categoryData.success) {
        throw new Error(
          categoryData.message || "Gagal mengambil kategori tiket."
        );
      }

      setCategories(
        categoryData.categories || categoryData.data || []
      );
    } catch (error) {
      setNotification({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadData();
  }, [eventId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/ticket-categories`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            event_id: Number(eventId),
            category_name: form.category_name.trim(),
            price: Number(form.price),
            quota: Number(form.quota),
            description: form.description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menambahkan tiket.");
      }

      setNotification({
        type: "success",
        message: "Kategori tiket berhasil ditambahkan.",
      });

      setForm({
        category_name: "",
        price: "",
        quota: "",
        description: "",
      });

      await loadData();
    } catch (error) {
      setNotification({
        type: "error",
        message: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/organizer/event"
            className="rounded-xl border p-3 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">
              Kelola Tiket
            </h1>

            <p className="text-sm text-slate-500">
              {event?.event_name || "Event"}
            </p>
          </div>
        </div>

        <Link
          href={`/organizer/event/kelola-tiket/${eventId}/denah`}
          className="flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white hover:bg-[#1A326A]"
        >
          <Map size={18} />
          Kelola Denah Kursi
        </Link>
      </div>

      {notification.message && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
            notification.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          {notification.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 font-bold">
            Tambah Kategori Tiket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="category_name"
              value={form.category_name}
              onChange={handleChange}
              placeholder="Nama kategori, contoh VIP"
              required
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="Harga tiket"
                required
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />

              <input
                name="quota"
                type="number"
                min="1"
                value={form.quota}
                onChange={handleChange}
                placeholder="Jumlah kuota"
                required
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi kategori tiket"
              rows={3}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <button
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Plus size={17} />
              )}

              Simpan Kategori
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <Ticket size={25} className="mb-3 text-[#112250]" />

          <h2 className="font-bold">
            Pengaturan Denah
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Atur gambar venue, section, serta posisi kursi untuk
            mendukung pemilihan kursi oleh customer.
          </p>

          <Link
            href={`/organizer/event/kelola-tiket/${eventId}/denah`}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#112250] px-4 py-3 text-sm font-bold text-[#112250] hover:bg-[#112250]/5"
          >
            <Map size={17} />
            Buka Denah
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-bold">
          Daftar Kategori Tiket
        </h2>

        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Belum ada kategori tiket.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-bold">
                    {category.category_name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Kuota: {category.quota}
                  </p>
                </div>

                <p className="font-bold text-[#112250]">
                  Rp{Number(category.price).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
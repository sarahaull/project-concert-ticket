
"use client";

import { useState } from "react";

export default function SeatMapSectionForm({
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState({
    ticket_category_id: "",
    section_code: "",
    section_name: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.ticket_category_id ||
      !form.section_code.trim() ||
      !form.section_name.trim()
    ) {
      return;
    }

    await onSubmit({
      ticket_category_id: Number(form.ticket_category_id),
      section_code: form.section_code.trim(),
      section_name: form.section_name.trim(),
    });

    setForm({
      ticket_category_id: "",
      section_code: "",
      section_name: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div>
        <h3 className="font-bold text-slate-800">
          Tambah Section
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Hubungkan section dengan kategori tiket.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          ID Kategori Tiket
        </label>
        <input
          type="number"
          min="1"
          required
          value={form.ticket_category_id}
          onChange={(e) =>
            setForm({
              ...form,
              ticket_category_id: e.target.value,
            })
          }
          placeholder="Contoh: 15"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#112250]"
        />
        <p className="mt-1 text-xs text-slate-400">
          Masukkan ID kategori tiket milik event ini.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Kode Section
        </label>
        <input
          required
          value={form.section_code}
          onChange={(e) =>
            setForm({
              ...form,
              section_code: e.target.value,
            })
          }
          placeholder="VIP-A"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#112250]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Nama Section
        </label>
        <input
          required
          value={form.section_name}
          onChange={(e) =>
            setForm({
              ...form,
              section_name: e.target.value,
            })
          }
          placeholder="VIP Area"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#112250]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#112250] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Tambah Section"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ticket,
  Save,
} from "lucide-react";

const ticketData = {
  1: {
    name: "VIP",
    code: "VIP-001",
    event: "Soundwave Festival 2026",
    category: "VIP",
    price: "750000",
    quota: "1000",
    status: "Aktif",
    description:
      "Tiket VIP memberikan akses terbaik untuk menikmati Soundwave Festival 2026.",
  },

  2: {
    name: "Festival",
    code: "FST-001",
    event: "Soundwave Festival 2026",
    category: "Festival",
    price: "350000",
    quota: "5000",
    status: "Aktif",
    description:
      "Tiket festival untuk akses utama area konser.",
  },

  3: {
    name: "Regular",
    code: "REG-001",
    event: "Nusantara Music Fest",
    category: "Regular",
    price: "275000",
    quota: "3000",
    status: "Aktif",
    description:
      "Tiket reguler untuk menikmati seluruh rangkaian acara.",
  },
};

export default function EditTicketPage() {
  const params = useParams();

  const initialData =
    ticketData[params.id] || ticketData[1];

  const [form, setForm] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Update tiket:", {
      id: params.id,
      ...form,
    });

    alert("Perubahan tiket berhasil disimpan");
  };

  return (
    <div className="w-full max-w-5xl space-y-6">

      {/* HEADER */}
      <div>

        <Link
          href={`/superadmin/tickets/${params.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#112250]"
        >
          <ArrowLeft size={17} />
          Kembali ke Detail
        </Link>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
            <Ticket size={23} />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-[#112250]">
              Edit Tiket
            </h1>

            <p className="mt-1 text-sm text-[#718096]">
              Perbarui informasi tiket {form.name}.
            </p>

          </div>

        </div>

      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-[#E2E7EF] bg-white shadow-sm"
      >

        <div className="border-b border-[#E8ECF2] px-6 py-5">

          <h2 className="font-bold text-[#112250]">
            Informasi Tiket
          </h2>

          <p className="mt-1 text-xs text-[#8490A1]">
            Ubah informasi tiket sesuai kebutuhan.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

          {/* NAMA */}
          <FormInput
            label="Nama Tiket"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* KODE */}
          <FormInput
            label="Kode Tiket"
            name="code"
            value={form.code}
            onChange={handleChange}
            required
          />

          {/* EVENT */}
          <FormSelect
            label="Event"
            name="event"
            value={form.event}
            onChange={handleChange}
            required
          >
            <option value="Soundwave Festival 2026">
              Soundwave Festival 2026
            </option>

            <option value="Nusantara Music Fest">
              Nusantara Music Fest
            </option>

            <option value="Jakarta Jazz Night">
              Jakarta Jazz Night
            </option>

            <option value="K-Pop Fan Meeting">
              K-Pop Fan Meeting
            </option>

            <option value="Indie Weekend">
              Indie Weekend
            </option>
          </FormSelect>

          {/* CATEGORY */}
          <FormSelect
            label="Kategori Tiket"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="VIP">VIP</option>
            <option value="Festival">Festival</option>
            <option value="Regular">Regular</option>
            <option value="Early Bird">Early Bird</option>
            <option value="Presale">Presale</option>
            <option value="Premium">Premium</option>
          </FormSelect>

          {/* PRICE */}
          <FormInput
            label="Harga Tiket"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            prefix="Rp"
            required
          />

          {/* QUOTA */}
          <FormInput
            label="Kuota Tiket"
            name="quota"
            type="number"
            value={form.quota}
            onChange={handleChange}
            required
          />

          {/* STATUS */}
          <FormSelect
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Aktif">
              Aktif
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Habis">
              Habis
            </option>
          </FormSelect>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-semibold text-[#44546A]">
              Deskripsi
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full resize-none rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 py-3 text-sm text-[#112250] outline-none focus:border-[#5275A5] focus:bg-white"
            />

          </div>

        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#E8ECF2] bg-[#FAFBFC] px-6 py-5 sm:flex-row sm:justify-end">

          <Link
            href={`/superadmin/tickets/${params.id}`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white px-5 text-sm font-semibold text-[#64748B] hover:bg-[#F4F7FB]"
          >
            Batal
          </Link>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white hover:bg-[#1A326A]"
          >
            <Save size={17} />
            Simpan Perubahan
          </button>

        </div>

      </form>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  prefix,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#44546A]">
        {label}

        {required && (
          <span className="ml-1 text-[#C04A4A]">
            *
          </span>
        )}
      </label>

      <div className="relative">

        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8A96A8]">
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] ${
            prefix ? "pl-11" : "px-4"
          } pr-4 text-sm text-[#112250] outline-none focus:border-[#5275A5] focus:bg-white`}
        />

      </div>

    </div>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  children,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#44546A]">
        {label}

        {required && (
          <span className="ml-1 text-[#C04A4A]">
            *
          </span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#44546A] outline-none focus:border-[#5275A5] focus:bg-white"
      >
        {children}
      </select>

    </div>
  );
}
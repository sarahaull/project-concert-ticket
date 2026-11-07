"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Save,
  RefreshCcw,
} from "lucide-react";

export default function CreatePaymentMethodPage() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "E-Wallet",
    provider: "",
    fee: "",
    description: "",
    priority: 1,
    status: "Aktif",
  });

  const generateCode = (value) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_");
  };

  const handleNameChange = (value) => {
    setForm({
      ...form,
      name: value,
      code: generateCode(value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Payment method:", form);

    alert("Metode pembayaran berhasil ditambahkan.");
  };

  return (
    <div className="w-full max-w-5xl space-y-6">

      {/* HEADER */}
      <div>

        <Link
          href="/superadmin/meth-pay"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#112250]"
        >
          <ArrowLeft size={17} />
          Kembali ke Metode Pembayaran
        </Link>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#112250] text-white shadow-[0_8px_20px_rgba(17,34,80,0.15)]">
            <CreditCard size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#112250]">
              Tambah Metode Pembayaran
            </h1>

            <p className="mt-1 text-sm text-[#718096]">
              Tambahkan metode pembayaran baru ke platform.
            </p>
          </div>

        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div className="rounded-2xl border border-[#E2E7EF] bg-white shadow-[0_4px_20px_rgba(17,34,80,0.04)]">

          <div className="border-b border-[#E8ECF2] px-6 py-5">
            <h2 className="font-bold text-[#112250]">
              Informasi Metode
            </h2>

            <p className="mt-1 text-xs text-[#8490A1]">
              Masukkan informasi metode pembayaran.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">

            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Nama Metode{" "}
                <span className="text-[#C04A4A]">*</span>
              </label>

              <input
                required
                value={form.name}
                onChange={(e) =>
                  handleNameChange(e.target.value)
                }
                placeholder="Contoh: GoPay"
                className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#112250] outline-none transition placeholder:text-[#A0AABA] focus:border-[#5275A5] focus:bg-white"
              />
            </div>

            {/* CODE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Kode{" "}
                <span className="text-[#C04A4A]">*</span>
              </label>

              <div className="flex gap-2">

                <input
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="GOPAY"
                  className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 font-mono text-sm text-[#112250] outline-none focus:border-[#5275A5] focus:bg-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      code: generateCode(form.name),
                    })
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DCE2EA] text-[#64748B] transition hover:bg-[#F1F4F8]"
                >
                  <RefreshCcw size={17} />
                </button>

              </div>
            </div>

            {/* TYPE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Tipe Pembayaran
              </label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#112250] outline-none focus:border-[#5275A5]"
              >
                <option>E-Wallet</option>
                <option>QR Payment</option>
                <option>Virtual Account</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
                <option>Payment Gateway</option>
              </select>
            </div>

            {/* PROVIDER */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Provider
              </label>

              <input
                value={form.provider}
                onChange={(e) =>
                  setForm({
                    ...form,
                    provider: e.target.value,
                  })
                }
                placeholder="Contoh: GoPay"
                className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#112250] outline-none transition placeholder:text-[#A0AABA] focus:border-[#5275A5] focus:bg-white"
              />
            </div>

            {/* FEE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Biaya Transaksi
              </label>

              <input
                value={form.fee}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fee: e.target.value,
                  })
                }
                placeholder="Contoh: 2% atau Rp4.000"
                className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#112250] outline-none transition placeholder:text-[#A0AABA] focus:border-[#5275A5] focus:bg-white"
              />
            </div>

            {/* PRIORITY */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Prioritas
              </label>

              <input
                type="number"
                min="1"
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: Number(e.target.value),
                  })
                }
                className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#112250] outline-none focus:border-[#5275A5] focus:bg-white"
              />

              <p className="mt-2 text-xs text-[#8A96A8]">
                Angka lebih kecil akan tampil lebih dahulu.
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Deskripsi
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="Jelaskan metode pembayaran ini..."
                className="w-full resize-none rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 py-3 text-sm leading-6 text-[#112250] outline-none transition placeholder:text-[#A0AABA] focus:border-[#5275A5] focus:bg-white"
              />

            </div>

            {/* STATUS */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#344563]">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#112250] outline-none focus:border-[#5275A5]"
              >
                <option>Aktif</option>
                <option>Nonaktif</option>
              </select>

            </div>

          </div>
        </div>

        {/* ACTION */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <Link
            href="/superadmin/meth-pay"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white px-5 text-sm font-semibold text-[#64748B] transition hover:bg-[#F5F7FA]"
          >
            Batal
          </Link>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,34,80,0.18)] transition hover:bg-[#1A326A]"
          >
            <Save size={17} />
            Simpan Metode
          </button>

        </div>

      </form>
    </div>
  );
}
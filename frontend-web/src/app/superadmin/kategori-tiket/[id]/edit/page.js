"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  TicketIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export default function EditTicketCategoryPage() {
  const params = useParams();
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: "VIP",
    code: "VIP",
    description: "Tiket dengan akses dan fasilitas eksklusif. Termasuk area khusus di depan panggung, akses masuk prioritas, dan merchandise eksklusif.",
    status: "Aktif",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateCode = (value) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Update kategori:", {
        id: params.id,
        ...form,
      });
      setIsSubmitting(false);
      alert("Kategori tiket berhasil diperbarui.");
      router.push(`/superadmin/kategori-tiket/${params.id}`);
    }, 1000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative">
          <Link 
            href={`/superadmin/kategori-tiket/${params.id}`} 
            className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            Kembali ke Detail Kategori
          </Link>
          <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white flex items-center gap-3">
            <PencilSquareIcon className="w-8 h-8 text-[#8ab4f8]" />
            Edit Kategori Tiket
          </h1>
          <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
            Perbarui informasi kategori tiket <strong className="text-white">{form.name}</strong>.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Kode Kategori <span className="text-red-500">*</span>
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
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-mono font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          code: generateCode(form.name),
                        })
                      }
                      className="flex-shrink-0 w-12 h-[46px] flex items-center justify-center rounded-xl border border-[#d0d8e4] bg-white text-[#5a7aad] hover:bg-[#f0f5fc] transition-colors"
                      title="Generate kode otomatis"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-[#7e91b2]">
                    Kode akan otomatis dibuat berdasarkan nama kategori. Anda dapat mengubahnya secara manual.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    className="w-full resize-none px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
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
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all cursor-pointer"
                  >
                    <option value="Aktif">Aktif (Dapat digunakan)</option>
                    <option value="Nonaktif">Nonaktif (Disembunyikan)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-[#e0e8f0]">
                <Link
                  href={`/superadmin/kategori-tiket/${params.id}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#f0f5fc] border border-[#d0d8e4] text-[#0a1628] text-sm font-semibold hover:bg-[#e0e8f0] transition-colors text-center"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold hover:shadow-[0_8px_25px_rgba(10,22,40,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
                <InformationCircleIcon className="w-6 h-6 text-[#8ab4f8]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Panduan Edit</h3>
              <ul className="text-[11px] text-[#8aa0c0] space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Mengubah **Nama Kategori** tidak akan mempengaruhi event yang sudah ada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Pastikan **Kode Kategori** tetap unik dan belum digunakan oleh kategori lain.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Menonaktifkan kategori akan menyembunyikannya dari pilihan saat membuat event baru.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-[#0a1628] mb-3 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              Informasi Tambahan
            </h3>
            <p className="text-xs text-[#7e91b2] leading-relaxed">
              Kategori tiket ini saat ini terhubung dengan <strong className="text-[#0a1628]">24 event</strong> aktif. Perubahan pada kategori ini akan berdampak pada tampilan tiket di event tersebut.
            </p>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.6s ease both; }
        .delay-75 { animation-delay: 0.75s; }
        .fade-in { opacity: 1; }
      `}</style>
    </div>
  );
}
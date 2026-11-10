'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  InformationCircleIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function CreateEventPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: '',
    category: 'Konser',
    date: '',
    location: '',
    price: '',
    capacity: '',
    status: 'Draf',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.location) {
      alert('Mohon lengkapi data event (nama, tanggal, lokasi).');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Event berhasil ditambahkan!');
      router.push('/superadmin/events');
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
            href="/superadmin/events" 
            className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            Kembali ke Daftar Event
          </Link>
          <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-[#8ab4f8]" />
            Tambah Event Baru
          </h1>
          <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
            Isi formulir di bawah ini untuk mempublikasikan acara baru di platform TicketVerse.
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
                    Nama Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Contoh: Coldplay - Music of The Spheres"
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all cursor-pointer"
                  >
                    <option>Konser</option>
                    <option>Festival</option>
                    <option>Fan Meeting</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Tanggal Event <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2]" />
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2]" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Contoh: Gelora Bung Karno, Jakarta"
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Harga Tiket (Rp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2]" />
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="1000000"
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Kapasitas Tiket <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TicketIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7e91b2]" />
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="5000"
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-2">
                    Status Event
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all cursor-pointer"
                  >
                    <option value="Aktif">Aktif (Langsung Tayang)</option>
                    <option value="Draf">Draf (Simpan Sementara)</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-[#e0e8f0]">
                <button
                  type="button"
                  onClick={() => router.push('/superadmin/events')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#f0f5fc] border border-[#d0d8e4] text-[#0a1628] text-sm font-semibold hover:bg-[#e0e8f0] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold hover:shadow-[0_8px_25px_rgba(10,22,40,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan & Publikasikan'}
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
              <h3 className="text-sm font-bold text-white mb-2">Panduan Pengisian</h3>
              <ul className="text-[11px] text-[#8aa0c0] space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Pastikan nama event sesuai dengan judul resmi tur atau konser.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Harga tiket yang dimasukkan adalah harga dasar (base price).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Kapasitas tiket tidak dapat diubah setelah event berstatus "Aktif".</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Gunakan status "Draf" jika event belum siap dipublikasikan.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-[#0a1628] mb-3 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              Tips Promosi
            </h3>
            <p className="text-xs text-[#7e91b2] leading-relaxed">
              Setelah event dipublikasikan, Anda dapat menambahkan banner promo atau diskon *early bird* melalui menu **Manajemen Promo** untuk meningkatkan penjualan tiket.
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
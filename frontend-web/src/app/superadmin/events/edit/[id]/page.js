'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const mockEventsData = [
  { id: '1', name: 'Coldplay - Music of The Spheres', category: 'Konser', date: '2025-11-15', location: 'Gelora Bung Karno, Jakarta', price: 2500000, capacity: 5000, status: 'Aktif' },
  { id: '2', name: 'Blackpink - Born Pink', category: 'Konser', date: '2025-12-20', location: 'Stadion Utama GBK, Jakarta', price: 1800000, capacity: 4500, status: 'Aktif' },
  { id: '3', name: 'NCT Dream - The Dream Show 3', category: 'Konser', date: '2026-01-10', location: 'ICE BSD, Tangerang', price: 2200000, capacity: 3000, status: 'Draf' },
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulasi fetch data berdasarkan ID
    const timer = setTimeout(() => {
      const foundEvent = mockEventsData.find((e) => String(e.id) === String(id)) || mockEventsData[0];
      setForm(foundEvent);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

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
      alert('Event berhasil diperbarui!');
      router.push('/superadmin/events');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#e0e8f0] border-t-[#8ab4f8] rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#7e91b2]">Memuat data event...</p>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link 
              href="/superadmin/events" 
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Daftar Event
            </Link>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white flex items-center gap-3">
              <PencilSquareIcon className="w-8 h-8 text-[#8ab4f8]" />
              Edit Informasi Event
            </h1>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Perbarui detail acara, jadwal, atau status publikasi untuk event ini.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg">
            ID Event: <span className="text-[#8ab4f8]">#{String(id).padStart(4, '0')}</span>
          </div>
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
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
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
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
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
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
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
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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
              <h3 className="text-sm font-bold text-white mb-2">Catatan Edit Event</h3>
              <ul className="text-[11px] text-[#8aa0c0] space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Perubahan pada **Nama Event** dan **Lokasi** akan langsung terlihat oleh pengguna.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Jika tiket sudah terjual, **Kapasitas** tidak disarankan untuk dikurangi secara drastis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#8ab4f8] flex-shrink-0 mt-0.5" />
                  <span>Mengubah status menjadi **Batal** akan menonaktifkan pembelian tiket secara otomatis.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-[#0a1628] mb-3 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              Butuh Bantuan?
            </h3>
            <p className="text-xs text-[#7e91b2] leading-relaxed mb-4">
              Jika Anda perlu mengubah detail teknis seperti *layout* kursi atau zona tiket, silakan hubungi tim *Support*.
            </p>
            <button className="w-full py-2 bg-[#f0f5fc] text-[#0a1628] text-xs font-semibold rounded-lg border border-[#d0d8e4] hover:bg-[#e0e8f0] transition-colors">
              Hubungi Support
            </button>
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
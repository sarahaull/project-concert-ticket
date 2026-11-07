// app/superadmin/events/create/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { createEvent } from '../data';

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.location) {
      alert('Mohon lengkapi data event (nama, tanggal, lokasi).');
      return;
    }
    createEvent(form);
    alert('Event berhasil ditambahkan!');
    router.push('/superadmin/events');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/superadmin/events')} className="p-2 rounded-lg border border-[#BEB7A7]/30 text-[#112250] hover:bg-[#F5F4F0] transition">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#112250]">Tambah Event Baru</h1>
          <p className="text-sm text-[#112250]/60">Isi formulir untuk menambahkan acara</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-[#BEB7A7]/30 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nama */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">Nama Event *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Coldplay World Tour"
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">Kategori *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
              >
                <option>Konser</option>
                <option>Festival</option>
                <option>Fan Meeting</option>
                <option>Lainnya</option>
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">Tanggal Event *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                required
              />
            </div>

            {/* Lokasi */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">Lokasi *</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Contoh: Gelora Bung Karno, Jakarta"
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                required
              />
            </div>

            {/* Harga */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">Harga Tiket (Rp) *</label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#112250]/40" />
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="1000000"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                  required
                />
              </div>
            </div>

            {/* Kapasitas */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">Kapasitas Tiket *</label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder="5000"
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">Status Event</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
              >
                <option>Aktif</option>
                <option>Selesai</option>
                <option>Draf</option>
                <option>Batal</option>
              </select>
            </div>
          </div>

          {/* Tombol */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[#BEB7A7]/30">
            <button
              type="button"
              onClick={() => router.push('/superadmin/events')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#BEB7A7]/30 text-[#112250] hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium hover:shadow-md transition"
            >
              Tambah Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// app/superadmin/organizer/edit/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getOrganizerById, updateOrganizer } from '../../data';

export default function EditOrganizerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getOrganizerById(id);
    if (data) {
      setForm(data);
    } else {
      alert('Organizer tidak ditemukan');
      router.push('/superadmin/organizer');
    }
    setLoading(false);
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      alert('Nama, Email, dan Perusahaan wajib diisi.');
      return;
    }
    updateOrganizer(id, form);
    alert('Organizer berhasil diperbarui!');
    router.push('/superadmin/organizer');
  };

  if (loading) return <div className="text-center py-10">Memuat...</div>;
  if (!form) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/superadmin/organizer')}
          className="p-2 rounded-lg border border-[#BEB7A7]/30 text-[#112250] hover:bg-[#F5F4F0] transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#112250]">Edit Organizer</h1>
          <p className="text-sm text-[#112250]/60">Perbarui informasi organizer</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#BEB7A7]/30 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nama */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                Nama Organizer *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                required
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                No. Telepon
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
              />
            </div>

            {/* Perusahaan */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                Perusahaan *
              </label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
                required
              />
            </div>

            {/* Kota */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                Kota
              </label>
              <input
                type="text"
                name="city"
                value={form.city || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
              />
            </div>

            {/* Tanggal Bergabung */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                Tanggal Bergabung
              </label>
              <input
                type="date"
                name="joinDate"
                value={form.joinDate || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
              />
            </div>

            {/* Alamat */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                Alamat Lengkap
              </label>
              <input
                type="text"
                name="address"
                value={form.address || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#112250]/70 mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            {/* Verifikasi */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                name="verified"
                checked={form.verified || false}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[#BEB7A7]/30 text-[#3B507D] focus:ring-[#3B507D]/30"
              />
              <label className="text-sm font-medium text-[#112250]/70">
                Verifikasi Organizer
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[#BEB7A7]/30">
            <button
              type="button"
              onClick={() => router.push('/superadmin/organizer')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#BEB7A7]/30 text-[#112250] hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium hover:shadow-md transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
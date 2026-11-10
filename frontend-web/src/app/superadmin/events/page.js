'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TicketIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon, // <-- TAMBAHAN: Import ikon yang hilang
} from '@heroicons/react/24/outline';

const mockEvents = [
  { id: 1, name: 'Coldplay - Music of The Spheres', category: 'Konser', date: '15 Nov 2025', location: 'Gelora Bung Karno, Jakarta', price: 2500000, sold: 4860, capacity: 5000, status: 'Aktif' },
  { id: 2, name: 'Blackpink - Born Pink', category: 'Konser', date: '20 Des 2025', location: 'Stadion Utama GBK, Jakarta', price: 1800000, sold: 3945, capacity: 4500, status: 'Aktif' },
  { id: 3, name: 'NCT Dream - The Dream Show 3', category: 'Konser', date: '10 Jan 2026', location: 'Indonesia Convention Exhibition, Tangerang', price: 2200000, sold: 2756, capacity: 3000, status: 'Draf' },
  { id: 4, name: 'Sheila On 7 - Tunggu Aku di Jakarta', category: 'Konser', date: '05 Feb 2026', location: 'Istora Senayan, Jakarta', price: 1500000, sold: 2301, capacity: 2500, status: 'Aktif' },
  { id: 5, name: 'Deep Purple - The Long Goodbye', category: 'Konser', date: '12 Mar 2026', location: 'Sentul International Convention Center, Bogor', price: 2800000, sold: 1967, capacity: 2000, status: 'Selesai' },
  { id: 6, name: 'Taylor Swift - The Eras Tour', category: 'Konser', date: '01 Apr 2026', location: 'National Stadium, Singapore', price: 3500000, sold: 4500, capacity: 5000, status: 'Aktif' },
];

export default function ManajemenEvent() {
  const router = useRouter();
  const [events, setEvents] = useState(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const itemsPerPage = 5;

  const filteredEvents = events.filter((event) => {
    const matchSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || event.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter((e) => e.id !== eventToDelete.id));
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      Aktif: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      Selesai: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      Draf: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      Batal: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return `inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold border rounded-full ${
      classes[status] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }`;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link href="/superadmin" className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3">
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white flex items-center gap-3">
              <TicketIcon className="w-8 h-8 text-[#8ab4f8]" />
              Manajemen Event
            </h1>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Kelola semua acara musik dan tiket di platform TicketVerse.
            </p>
          </div>
          <button
            onClick={() => router.push('/superadmin/events/tambah')}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] text-[#0a1628] text-sm font-bold px-5 py-3 rounded-xl hover:shadow-[0_8px_25px_rgba(138,180,248,0.3)] hover:-translate-y-0.5 transition-all duration-300 self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Event
          </button>
        </div>
      </section>

      <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300 overflow-hidden">
        
        <div className="p-6 border-b border-[#e0e8f0]/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f8fafc]">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e91b2]" />
            <input
              type="text"
              placeholder="Cari nama event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d0d8e4] rounded-xl text-xs font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#7e91b2] whitespace-nowrap">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto bg-white border border-[#d0d8e4] rounded-xl px-3 py-2.5 text-xs font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 cursor-pointer transition"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
              <option value="Draf">Draf</option>
              <option value="Batal">Batal</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-left border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#e0e8f0]">
              <tr className="text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">Nama Event</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Lokasi</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4 text-center">Terjual</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e8f0]/50">
              {currentEvents.length > 0 ? (
                currentEvents.map((event, index) => (
                  <tr key={event.id} className="group hover:bg-[#f0f5fc] transition-colors duration-200">
                    <td className="px-6 py-4 text-xs text-[#7e91b2]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0a1628] max-w-[260px] truncate">
                      {event.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#e6f0fa] text-[10px] font-medium text-[#4a6b9a] border border-[#d0d8e4]">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-[#0a1628]">
                        <CalendarIcon className="w-4 h-4 text-[#5a7aad]" />
                        <span>{event.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[220px] text-xs text-[#0a1628]">
                        <MapPinIcon className="w-4 h-4 flex-shrink-0 text-[#5a7aad]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#4a6b9a] whitespace-nowrap">
                      Rp {Number(event.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-[#0a1628]">
                          {Number(event.sold).toLocaleString('id-ID')} <span className="text-[10px] font-normal text-[#7e91b2]">/ {Number(event.capacity).toLocaleString('id-ID')}</span>
                        </span>
                        <div className="w-16 h-1.5 bg-[#e0e8f0] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#8ab4f8] to-[#4a6b9a] rounded-full" 
                            style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={getStatusBadge(event.status)}>{event.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => router.push(`/superadmin/events/${event.id}`)}
                          className="p-2 text-[#5a7aad] hover:text-[#0a1628] hover:bg-white rounded-lg transition-colors shadow-sm"
                          title="Detail"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/superadmin/events/edit/${event.id}`)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shadow-sm"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(event)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                          title="Hapus"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-sm text-[#7e91b2]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <TicketIcon className="w-8 h-8 text-[#d0d8e4]" />
                      <p>Tidak ada data event yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e0e8f0]/50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f8fafc]">
            <span className="text-xs text-[#7e91b2]">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredEvents.length)} dari {filteredEvents.length} event
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#d0d8e4] text-xs font-medium text-[#0a1628] hover:bg-[#e0e8f0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Prev
              </button>
              <span className="px-2 text-xs font-bold text-[#0a1628]">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#d0d8e4] text-xs font-medium text-[#0a1628] hover:bg-[#e0e8f0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isDeleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0a1628] mb-2">Hapus Event?</h3>
              <p className="text-sm text-[#7e91b2] mb-6">
                Apakah Anda yakin ingin menghapus event <strong className="text-[#0a1628]">{eventToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#7e91b2] hover:text-[#0a1628] bg-[#f0f5fc] hover:bg-[#e0e8f0] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.6s ease both; }
        .delay-75 { animation-delay: 0.75s; }
        .fade-in { opacity: 1; }
      `}</style>
    </div>
  );
}
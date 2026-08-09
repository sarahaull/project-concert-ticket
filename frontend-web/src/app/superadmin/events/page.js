// src/app/superadmin/events/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// Import Superbar dan Supertopbar
import Superbar from '@/components/dashboard/Superbar';
import Supertopbar from '@/components/dashboard/Supertopbar';

// --- DUMMY DATA EVENTS ---
const dummyEvents = [
  { id: 1, name: 'Coldplay - Music of The Spheres', category: 'Konser', date: '2026-10-15', location: 'Gelora Bung Karno, Jakarta', price: 1500000, sold: 4860, capacity: 5000, status: 'Aktif' },
  { id: 2, name: 'BLACKPINK - Born Pink World Tour', category: 'Konser', date: '2026-11-20', location: 'ICE BSD, Tangerang', price: 2200000, sold: 3945, capacity: 4000, status: 'Aktif' },
  { id: 3, name: 'Pesta Rakyat 2026', category: 'Festival', date: '2026-08-17', location: 'Lapangan Monas, Jakarta', price: 500000, sold: 12000, capacity: 20000, status: 'Selesai' },
  { id: 4, name: 'NCT DREAM - The Dream Show 3', category: 'Fan Meeting', date: '2026-12-05', location: 'Candi Prambanan, Yogyakarta', price: 850000, sold: 2756, capacity: 3000, status: 'Draf' },
  { id: 5, name: 'Sheila On 7 - Tunggu Aku di Jakarta', category: 'Konser', date: '2026-07-22', location: 'Istora Senayan, Jakarta', price: 350000, sold: 2301, capacity: 3000, status: 'Batal' },
  { id: 6, name: 'Deep Purple - The Long Goodbye', category: 'Konser', date: '2026-09-10', location: 'JCC, Jakarta', price: 1800000, sold: 1967, capacity: 2500, status: 'Aktif' },
  { id: 7, name: 'Summer Festival 2026', category: 'Festival', date: '2026-07-30', location: 'Pantai Ancol, Jakarta', price: 250000, sold: 8500, capacity: 10000, status: 'Selesai' },
];

export default function EventsPage() {
  const [events, setEvents] = useState(dummyEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Konser', date: '', location: '', price: '', capacity: '', status: 'Draf'
  });

  // --- FUNGSI FILTER & PAGINATION ---
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // --- FUNGSI CRUD ---
  const handleOpenCreateModal = () => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setFormData({ name: '', category: 'Konser', date: '', location: '', price: '', capacity: '', status: 'Draf' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setFormData({ ...event });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (isEditMode && selectedEvent) {
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...formData, id: e.id } : e));
    } else {
      const newId = Math.max(...events.map(e => e.id), 0) + 1;
      setEvents(prev => [...prev, { ...formData, id: newId, sold: 0 }]);
    }
    setIsModalOpen(false);
    alert(isEditMode ? 'Event berhasil diperbarui!' : 'Event baru berhasil ditambahkan!');
  };

  const handleConfirmDelete = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      alert('Event berhasil dihapus!');
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Aktif': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      'Selesai': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Draf': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'Batal': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return `px-2 py-0.5 text-xs font-medium border rounded-full ${classes[status] || 'bg-gray-500/10 text-gray-600'}`;
  };

  return (
    <div className="min-h-screen bg-[#E7E2CE]">
      

      {/* Superbar */}
      <Superbar
        title="Manajemen Event"
        breadcrumb="/ Super Admin / Events"
      />

      {/* Main Content */}
      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#112250]">Manajemen Event</h1>
            <p className="text-xs sm:text-sm text-[#112250]/60 mt-0.5 sm:mt-1">Kelola semua acara musik dan tiket di TicketVerse</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium text-sm sm:text-base shadow-md hover:shadow-lg hover:shadow-[#3B507D]/30 transition-all duration-300 whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Tambah Event Baru</span>
            <span className="xs:hidden">Tambah</span>
          </button>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:w-64 md:w-72">
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#112250]/40" />
            <input
              type="text"
              placeholder="Cari event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs sm:text-sm text-[#112250]/60 whitespace-nowrap">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
              <option value="Draf">Draf</option>
              <option value="Batal">Batal</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F5F4F0] border-b border-[#BEB7A7]/30 text-[#112250]/70 font-semibold">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">No</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 min-w-[100px] sm:min-w-[150px]">Nama Event</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">Kategori</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">Tanggal</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">Lokasi</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">Harga</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden md:table-cell">Terjual</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BEB7A7]/20">
                {currentEvents.length > 0 ? (
                  currentEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-[#F5F4F0]/50 transition-colors duration-150">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#112250]/60 text-center sm:text-left">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-[#112250]">
                        <div className="max-w-[80px] xs:max-w-[120px] sm:max-w-none truncate">{event.name}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#112250]/70 hidden sm:table-cell">{event.category}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#112250]/70 hidden md:table-cell">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="hidden xl:inline">{event.date}</span>
                          <span className="xl:hidden">{event.date.slice(5)}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#112250]/70 hidden lg:table-cell">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate max-w-[80px] xl:max-w-[120px]">{event.location}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-[#3B507D] hidden sm:table-cell text-xs sm:text-sm">
                        Rp {event.price.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[#112250]/70 hidden md:table-cell text-xs">
                        {event.sold.toLocaleString()}/{event.capacity.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className={getStatusBadge(event.status)}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 lg:gap-2">
                          <button className="p-1 sm:p-1.5 text-[#3B507D] hover:bg-[#3B507D]/10 rounded-lg transition-colors" title="Lihat Detail">
                            <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                          </button>
                          <button onClick={() => handleOpenEditModal(event)} className="p-1 sm:p-1.5 text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit">
                            <PencilSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                          </button>
                          <button onClick={() => handleDeleteClick(event)} className="p-1 sm:p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" title="Hapus">
                            <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 sm:px-6 py-8 sm:py-10 text-center text-[#112250]/60 text-sm sm:text-base">
                      Tidak ada data event yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-[#BEB7A7]/30 flex flex-col xs:flex-row items-center justify-between gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-[#112250]/60 text-center xs:text-left">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEvents.length)} dari {filteredEvents.length}
              </span>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg border border-[#BEB7A7]/30 text-[#112250]/60 hover:bg-[#F5F4F0] disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors"
                >
                  <ChevronLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Prev</span>
                </button>
                <span className="text-xs sm:text-sm font-medium text-[#112250] px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg border border-[#BEB7A7]/30 text-[#112250]/60 hover:bg-[#F5F4F0] disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: Create/Edit Event */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#112250]/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-[#BEB7A7]/30">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#BEB7A7]/30 rounded-t-xl sm:rounded-t-2xl">
                <h2 className="text-base sm:text-lg font-semibold text-[#112250]">
                  {isEditMode ? 'Edit Event' : 'Tambah Event Baru'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#112250]/60 hover:text-[#112250] hover:bg-[#F5F4F0] rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Nama Event *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                      placeholder="Contoh: Coldplay World Tour"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Kategori *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                    >
                      <option>Konser</option>
                      <option>Festival</option>
                      <option>Fan Meeting</option>
                      <option>Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Tanggal Event *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Lokasi *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                      placeholder="Contoh: Gelora Bung Karno, Jakarta"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Harga Tiket (Rp) *</label>
                    <div className="relative">
                      <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#112250]/40" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                        placeholder="1000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Kapasitas Tiket *</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Status Event</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                    >
                      <option>Aktif</option>
                      <option>Selesai</option>
                      <option>Draf</option>
                      <option>Batal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-[#BEB7A7]/30 bg-[#F5F4F0] rounded-b-xl sm:rounded-b-2xl">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg sm:rounded-xl bg-white border border-[#BEB7A7]/30 text-[#112250] hover:bg-gray-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium shadow-sm hover:shadow-md transition-all text-sm"
                >
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Delete Confirmation */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-[#112250]/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-[#BEB7A7]/30">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/10 mx-auto mb-3 sm:mb-4">
                <TrashIcon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-center text-[#112250]">Hapus Event?</h3>
              <p className="text-center text-[#112250]/60 text-xs sm:text-sm mt-1">
                Apakah kamu yakin ingin menghapus event <strong className="text-[#112250]">"{selectedEvent?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full sm:flex-1 px-4 py-2 rounded-lg sm:rounded-xl bg-[#F5F4F0] text-[#112250] hover:bg-gray-200 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="w-full sm:flex-1 px-4 py-2 rounded-lg sm:rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-sm transition-colors text-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
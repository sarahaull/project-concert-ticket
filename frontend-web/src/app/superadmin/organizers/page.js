// app/superadmin/organizer/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { getOrganizers } from './data';

export default function OrganizersPage() {
  const router = useRouter();
  const [organizers, setOrganizers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setOrganizers(getOrganizers());
  }, []);

  const filteredData = organizers.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status) => {
    if (status === 'Aktif') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border border-rose-200 bg-rose-50 text-rose-700">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
        Tidak Aktif
      </span>
    );
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#112250]">Kelola Organizer</h1>
          <p className="mt-1 text-sm text-[#112250]/60">Kelola dan pantau semua organizer di TicketVerse</p>
        </div>
        <button
          onClick={() => router.push('/superadmin/organizers/tambah')}
          className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium shadow-md hover:shadow-lg transition"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Organizer
        </button>
      </div>

      {/* Filter */}
      <div className="w-full bg-white rounded-2xl border border-[#BEB7A7]/30 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#112250]/40" />
            <input
              type="text"
              placeholder="Cari organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl text-sm text-[#112250] placeholder:text-[#112250]/40 focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#112250]/60 whitespace-nowrap">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-w-[150px] bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-xl px-3 py-2.5 text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/30"
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white rounded-2xl border border-[#BEB7A7]/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm text-left">
            <thead className="bg-[#F5F4F0] border-b border-[#BEB7A7]/30">
              <tr className="text-[#112250]/70 font-semibold">
                <th className="px-5 py-4 w-16">No</th>
                <th className="px-5 py-4">Nama</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Perusahaan</th>
                <th className="px-5 py-4">Kota</th>
                <th className="px-5 py-4 text-center">Event</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Verifikasi</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BEB7A7]/20">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#F5F4F0]/50 transition-colors">
                    <td className="px-5 py-4 text-[#112250]/60">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#112250]">{item.name}</div>
                    </td>
                    <td className="px-5 py-4 text-[#112250]/70">{item.email}</td>
                    <td className="px-5 py-4 text-[#112250]/70">{item.company}</td>
                    <td className="px-5 py-4 text-[#112250]/70">{item.city}</td>
                    <td className="px-5 py-4 text-center text-[#112250]/70">
                      {item.totalEvents || 0}
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4 text-center">
                      {item.verified ? (
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <CheckBadgeIcon className="w-5 h-5" />
                          <span className="text-xs">Terverifikasi</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#112250]/40">Belum</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => router.push(`/superadmin/organizer/${item.id}`)}
                          className="p-2 text-[#3B507D] hover:bg-[#3B507D]/10 rounded-lg transition"
                          title="Detail"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/superadmin/organizer/edit/${item.id}`)}
                          className="p-2 text-amber-600 hover:bg-amber-500/10 rounded-lg transition"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/superadmin/organizer/delete/${item.id}`)}
                          className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-lg transition"
                          title="Hapus"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-[#112250]/50">
                    Tidak ada data organizer yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#BEB7A7]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-[#112250]/60">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#BEB7A7]/30 text-[#112250]/60 hover:bg-[#F5F4F0] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Prev
              </button>
              <span className="px-3 text-sm font-medium text-[#112250]">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#BEB7A7]/30 text-[#112250]/60 hover:bg-[#F5F4F0] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
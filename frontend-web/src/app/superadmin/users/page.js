// app/superadmin/users/page.js
'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckBadgeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

// ============================================================
// DUMMY DATA USERS
// ============================================================
const dummyUsers = [
  { 
    id: 1, 
    name: 'Aisyah Putri', 
    email: 'aisyahp@gmail.com', 
    phone: '081234567890',
    role: 'Super Admin',
    status: 'Aktif',
    joinDate: '2026-01-15',
    eventsAttended: 12,
    totalSpent: 3450000,
    avatar: 'https://i.pravatar.cc/100?img=1'
  },
  { 
    id: 2, 
    name: 'Muhammad Alif', 
    email: 'alif.muhammad@gmail.com', 
    phone: '081298765432',
    role: 'Admin',
    status: 'Aktif',
    joinDate: '2026-02-20',
    eventsAttended: 8,
    totalSpent: 2100000,
    avatar: 'https://i.pravatar.cc/100?img=2'
  },
  { 
    id: 3, 
    name: 'Jonathan Lee', 
    email: 'jonathanlee@gmail.com', 
    phone: '081356789012',
    role: 'User',
    status: 'Aktif',
    joinDate: '2026-03-10',
    eventsAttended: 5,
    totalSpent: 850000,
    avatar: 'https://i.pravatar.cc/100?img=3'
  },
  { 
    id: 4, 
    name: 'Nadia Rahma', 
    email: 'nadirahma@gmail.com', 
    phone: '081345678901',
    role: 'User',
    status: 'Tidak Aktif',
    joinDate: '2026-04-05',
    eventsAttended: 3,
    totalSpent: 450000,
    avatar: 'https://i.pravatar.cc/100?img=4'
  },
  { 
    id: 5, 
    name: 'David Setiawan', 
    email: 'davidsetiawan@gmail.com', 
    phone: '081367890123',
    role: 'Organizer',
    status: 'Aktif',
    joinDate: '2026-05-12',
    eventsAttended: 0,
    totalSpent: 0,
    avatar: 'https://i.pravatar.cc/100?img=5'
  },
  { 
    id: 6, 
    name: 'Sarah NurBiqis', 
    email: 'sarah.nb@ticketverse.com', 
    phone: '081378901234',
    role: 'Super Admin',
    status: 'Aktif',
    joinDate: '2026-01-01',
    eventsAttended: 25,
    totalSpent: 12500000,
    avatar: 'https://i.pravatar.cc/100?img=6'
  },
  { 
    id: 7, 
    name: 'Rizky Febrian', 
    email: 'rizkyfebrian@gmail.com', 
    phone: '081389012345',
    role: 'User',
    status: 'Aktif',
    joinDate: '2026-06-20',
    eventsAttended: 2,
    totalSpent: 300000,
    avatar: 'https://i.pravatar.cc/100?img=7'
  },
  { 
    id: 8, 
    name: 'Maya Sari', 
    email: 'mayasari@gmail.com', 
    phone: '081390123456',
    role: 'Organizer',
    status: 'Tidak Aktif',
    joinDate: '2026-04-18',
    eventsAttended: 0,
    totalSpent: 0,
    avatar: 'https://i.pravatar.cc/100?img=8'
  },
];

// ============================================================
// MAIN USER MANAGEMENT PAGE
// ============================================================
export default function UsersPage() {
  const [users, setUsers] = useState(dummyUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'User', status: 'Aktif'
  });

  // --- FILTER & SORT ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Semua' || user.role === filterRole;
    const matchesStatus = filterStatus === 'Semua' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = a[sortBy]?.toString().toLowerCase() || '';
    let bVal = b[sortBy]?.toString().toLowerCase() || '';
    if (sortBy === 'totalSpent' || sortBy === 'eventsAttended') {
      aVal = a[sortBy] || 0;
      bVal = b[sortBy] || 0;
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- CRUD FUNCTIONS ---
  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setFormData({ name: '', email: '', phone: '', role: 'User', status: 'Aktif' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = () => {
    if (isEditMode && selectedUser) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...formData, id: u.id } : u));
    } else {
      const newId = Math.max(...users.map(u => u.id), 0) + 1;
      setUsers(prev => [...prev, { ...formData, id: newId, joinDate: new Date().toISOString().split('T')[0], eventsAttended: 0, totalSpent: 0 }]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getRoleBadge = (role) => {
    const classes = {
      'Super Admin': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Admin': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Organizer': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'User': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
    return `px-2 py-0.5 text-xs font-medium border rounded-full ${classes[role] || 'bg-gray-500/10 text-gray-600'}`;
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Aktif': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      'Tidak Aktif': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return `px-2 py-0.5 text-xs font-medium border rounded-full ${classes[status] || 'bg-gray-500/10 text-gray-600'}`;
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpIcon className="w-3 h-3 opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#112250]">Manajemen Users</h1>
          <p className="text-xs sm:text-sm text-[#112250]/60 mt-0.5 sm:mt-1">Kelola semua pengguna platform TicketVerse</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium text-sm sm:text-base shadow-md hover:shadow-lg hover:shadow-[#3B507D]/30 transition-all duration-300 whitespace-nowrap"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Tambah User Baru</span>
          <span className="xs:hidden">Tambah</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#112250]/40" />
            <input
              type="text"
              placeholder="Cari user berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <FunnelIcon className="w-4 h-4 text-[#112250]/40" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="flex-1 sm:flex-none bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
              >
                <option value="Semua">Semua Role</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Organizer">Organizer</option>
                <option value="User">User</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#112250] focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BEB7A7]/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F5F4F0] border-b border-[#BEB7A7]/30 text-[#112250]/70 font-semibold">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3">No</th>
                <th 
                  className="px-2 sm:px-4 py-2 sm:py-3 min-w-[120px] sm:min-w-[150px] cursor-pointer hover:text-[#112250] transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nama
                    <SortIcon field="name" />
                  </div>
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">Email</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">Role</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell text-center">Event</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 hidden xl:table-cell text-right">Total Belanja</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BEB7A7]/20">
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-[#F5F4F0]/50 transition-colors duration-150">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#112250]/60 text-center sm:text-left">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#E7E2CE]">
                          <img src={user.avatar || `https://i.pravatar.cc/100?img=${user.id}`} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-[#112250] truncate">{user.name}</p>
                          <p className="text-[10px] sm:text-xs text-[#112250]/40 truncate sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#112250]/60 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3" />
                        <span className="truncate max-w-[100px] md:max-w-[150px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                      <span className={getRoleBadge(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                      <span className={getStatusBadge(user.status)}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell text-center text-[#112250]/60">
                      {user.eventsAttended}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden xl:table-cell text-right font-medium text-[#3B507D]">
                      Rp {user.totalSpent?.toLocaleString() || 0}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 lg:gap-2">
                        <button 
                          onClick={() => handleOpenViewModal(user)}
                          className="p-1 sm:p-1.5 text-[#3B507D] hover:bg-[#3B507D]/10 rounded-lg transition-colors" 
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1 sm:p-1.5 text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="p-1 sm:p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" 
                          title="Hapus"
                        >
                          <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-6 py-8 sm:py-10 text-center text-[#112250]/60 text-sm sm:text-base">
                    Tidak ada data user yang ditemukan.
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
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedUsers.length)} dari {sortedUsers.length} user
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

      {/* ============================================================ */}
      {/* MODAL: Create/Edit User */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#112250]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-[#BEB7A7]/30">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#BEB7A7]/30 rounded-t-xl sm:rounded-t-2xl">
              <h2 className="text-base sm:text-lg font-semibold text-[#112250]">
                {isEditMode ? 'Edit User' : 'Tambah User Baru'}
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
                  <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Nama Lengkap *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#112250]/40" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Email *</label>
                  <div className="relative">
                    <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#112250]/40" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                      placeholder="Masukkan email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">No. Telepon</label>
                  <div className="relative">
                    <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#112250]/40" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                      placeholder="081234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                  >
                    <option value="User">User</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#112250]/70 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F4F0] border border-[#BEB7A7]/30 rounded-lg sm:rounded-xl text-[#112250] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B507D]/50"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
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
                onClick={handleSaveUser}
                className="w-full sm:w-auto px-4 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#3B507D] to-[#112250] text-white font-medium shadow-sm hover:shadow-md transition-all text-sm"
              >
                {isEditMode ? 'Simpan Perubahan' : 'Tambah User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: View User Detail */}
      {/* ============================================================ */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#112250]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-[#BEB7A7]/30">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#BEB7A7]/30 rounded-t-xl sm:rounded-t-2xl">
              <h2 className="text-base sm:text-lg font-semibold text-[#112250]">Detail User</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 text-[#112250]/60 hover:text-[#112250] hover:bg-[#F5F4F0] rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#E7E2CE] border-4 border-[#3B507D]/20 flex-shrink-0">
                  <img src={selectedUser.avatar || `https://i.pravatar.cc/100?img=${selectedUser.id}`} alt={selectedUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-[#112250]">{selectedUser.name}</h3>
                  <p className="text-sm text-[#112250]/60">{selectedUser.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className={getRoleBadge(selectedUser.role)}>{selectedUser.role}</span>
                    <span className={getStatusBadge(selectedUser.status)}>{selectedUser.status}</span>
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F5F4F0] rounded-xl p-4">
                  <p className="text-xs text-[#112250]/40">No. Telepon</p>
                  <p className="text-sm font-medium text-[#112250]">{selectedUser.phone || '-'}</p>
                </div>
                <div className="bg-[#F5F4F0] rounded-xl p-4">
                  <p className="text-xs text-[#112250]/40">Tanggal Bergabung</p>
                  <p className="text-sm font-medium text-[#112250]">{selectedUser.joinDate}</p>
                </div>
                <div className="bg-[#F5F4F0] rounded-xl p-4">
                  <p className="text-xs text-[#112250]/40">Event Dihadiri</p>
                  <p className="text-sm font-medium text-[#112250]">{selectedUser.eventsAttended} event</p>
                </div>
                <div className="bg-[#F5F4F0] rounded-xl p-4">
                  <p className="text-xs text-[#112250]/40">Total Belanja</p>
                  <p className="text-sm font-medium text-[#3B507D]">Rp {selectedUser.totalSpent?.toLocaleString() || 0}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(selectedUser);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors text-sm font-medium"
                >
                  Edit User
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg sm:rounded-xl bg-[#F5F4F0] text-[#112250] hover:bg-gray-200 transition-colors text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Delete Confirmation */}
      {/* ============================================================ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-[#112250]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-[#BEB7A7]/30">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/10 mx-auto mb-3 sm:mb-4">
              <TrashIcon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-center text-[#112250]">Hapus User?</h3>
            <p className="text-center text-[#112250]/60 text-xs sm:text-sm mt-1">
              Apakah kamu yakin ingin menghapus user <strong className="text-[#112250]">"{selectedUser?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  );
}
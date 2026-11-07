'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  User,
  Mail,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Users,
  Crown,
  Shield,
  Briefcase,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

import {
  getUsers,
  deleteUser,
} from './data';

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState(() => getUsers());

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // ============================================================
  // FILTER
  // ============================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.username?.toLowerCase().includes(search) ||
        user.phone?.includes(search);

      const matchesRole =
        filterRole === 'Semua' ||
        user.role === filterRole;

      const matchesStatus =
        filterStatus === 'Semua' ||
        user.status === filterStatus;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    searchTerm,
    filterRole,
    filterStatus,
  ]);

  // ============================================================
  // SORT
  // ============================================================

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aVal = a[sortBy] ?? '';
      let bVal = b[sortBy] ?? '';

      if (
        sortBy === 'totalSpent' ||
        sortBy === 'eventsAttended' ||
        sortBy === 'totalTickets'
      ) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      if (aVal < bVal) {
        return sortOrder === 'asc' ? -1 : 1;
      }

      if (aVal > bVal) {
        return sortOrder === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }, [
    filteredUsers,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedUsers.length / itemsPerPage
    )
  );

  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================================
  // SORT
  // ============================================================

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) =>
        prev === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return (
        <ArrowUp className="w-3 h-3 opacity-25" />
      );
    }

    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = (user) => {
    const confirmed = window.confirm(
      `Hapus user "${user.name}"?`
    );

    if (!confirmed) return;

    const updatedUsers = deleteUser(user.id);

    setUsers(updatedUsers);

    const maxPage = Math.max(
      1,
      Math.ceil(
        updatedUsers.length / itemsPerPage
      )
    );

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  };

  // ============================================================
  // BADGES
  // ============================================================

  const getRoleBadge = (role) => {
    const config = {
      'Super Admin': {
        icon: Crown,
        className:
          'text-[#365d99] bg-[#365d99]/10 border-[#365d99]/20',
      },

      Admin: {
        icon: Shield,
        className:
          'text-[#5a7aad] bg-[#5a7aad]/10 border-[#5a7aad]/20',
      },

      Organizer: {
        icon: Briefcase,
        className:
          'text-amber-600 bg-amber-500/10 border-amber-500/20',
      },

      User: {
        icon: User,
        className:
          'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      },
    };

    const item =
      config[role] || config.User;

    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-full ${item.className}`}
      >
        <Icon className="w-3 h-3" />
        {role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'Aktif') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Aktif
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border text-rose-600 bg-rose-500/10 border-rose-500/20">
        <XCircle className="w-3 h-3" />
        Tidak Aktif
      </span>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">

            <Users
              className="w-6 h-6 text-[#5a7aad]"
              strokeWidth={1.7}
            />

            <h1 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-[#0a1628]">
              Manajemen Users
            </h1>

          </div>

          <p className="text-xs sm:text-sm text-[#7e91b2] mt-1 ml-8">
            Kelola akun pengguna dan akses platform TicketVerse
          </p>
        </div>

        <button
          onClick={() =>
            router.push('/superadmin/users/tambah')
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white font-medium text-sm shadow-md hover:shadow-lg hover:shadow-[#0a1628]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <SummaryCard
          icon={Users}
          title="Total User"
          value={users.length}
        />

        <SummaryCard
          icon={CheckCircle}
          title="User Aktif"
          value={
            users.filter(
              (u) => u.status === 'Aktif'
            ).length
          }
        />

        <SummaryCard
          icon={Briefcase}
          title="Organizer"
          value={
            users.filter(
              (u) => u.role === 'Organizer'
            ).length
          }
        />

        <SummaryCard
          icon={ShieldCheck}
          title="Terverifikasi"
          value={
            users.filter(
              (u) => u.emailVerified
            ).length
          }
        />

      </div>

      {/* FILTER */}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#e0e8f0]/60 p-4 shadow-[0_4px_20px_rgba(10,20,40,0.06)]">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e91b2]" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, username, email, atau nomor telepon..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0]/70 text-sm text-[#0a1628] placeholder:text-[#9aa9bf] focus:outline-none focus:ring-2 focus:ring-[#5a7aad]/20"
            />

          </div>

          <div className="flex flex-wrap gap-2">

            <div className="flex items-center gap-2">

              <SlidersHorizontal className="w-4 h-4 text-[#7e91b2]" />

              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0]/70 text-sm text-[#0a1628] focus:outline-none"
              >
                <option value="Semua">
                  Semua Role
                </option>
                <option value="Super Admin">
                  Super Admin
                </option>
                <option value="Admin">
                  Admin
                </option>
                <option value="Organizer">
                  Organizer
                </option>
                <option value="User">
                  User
                </option>
              </select>

            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0]/70 text-sm text-[#0a1628] focus:outline-none"
            >
              <option value="Semua">
                Semua Status
              </option>

              <option value="Aktif">
                Aktif
              </option>

              <option value="Tidak Aktif">
                Tidak Aktif
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#e0e8f0]/60 shadow-[0_4px_20px_rgba(10,20,40,0.06)] overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-[#f5f8fc] border-b border-[#e0e8f0]/60 text-[#7e91b2]">

              <tr>

                <th className="px-4 py-3 text-xs font-semibold">
                  No
                </th>

                <th
                  onClick={() =>
                    toggleSort('name')
                  }
                  className="px-4 py-3 text-xs font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    User
                    <SortIcon field="name" />
                  </div>
                </th>

                <th className="px-4 py-3 text-xs font-semibold hidden md:table-cell">
                  Email
                </th>

                <th className="px-4 py-3 text-xs font-semibold hidden lg:table-cell">
                  Role
                </th>

                <th className="px-4 py-3 text-xs font-semibold hidden lg:table-cell">
                  Status
                </th>

                <th
                  onClick={() =>
                    toggleSort(
                      'eventsAttended'
                    )
                  }
                  className="px-4 py-3 text-xs font-semibold hidden xl:table-cell cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    Event
                    <SortIcon field="eventsAttended" />
                  </div>
                </th>

                <th
                  onClick={() =>
                    toggleSort('totalSpent')
                  }
                  className="px-4 py-3 text-xs font-semibold hidden xl:table-cell text-right cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    Total Belanja
                    <SortIcon field="totalSpent" />
                  </div>
                </th>

                <th className="px-4 py-3 text-xs font-semibold text-center">
                  Aksi
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#e0e8f0]/40">

              {currentUsers.length > 0 ? (

                currentUsers.map(
                  (user, index) => (

                    <tr
                      key={user.id}
                      className="hover:bg-[#f5f8fc]/60 transition-colors"
                    >

                      <td className="px-4 py-3 text-[#7e91b2]">
                        {(currentPage - 1) *
                          itemsPerPage +
                          index +
                          1}
                      </td>

                      <td className="px-4 py-3">

                        <div className="flex items-center gap-3 min-w-[190px]">

                          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#eef3fa] border border-[#e0e8f0] flex-shrink-0">

                            <img
                              src={
                                user.avatar ||
                                `https://i.pravatar.cc/150?img=${user.id}`
                              }
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />

                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold text-[#0a1628] truncate">
                              {user.name}
                            </p>

                            <p className="text-xs text-[#7e91b2] truncate">
                              @{user.username}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">

                        <div className="flex items-center gap-1.5 text-[#7e91b2]">

                          <Mail className="w-3.5 h-3.5" />

                          <span className="truncate max-w-[190px]">
                            {user.email}
                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell">
                        {getRoleBadge(
                          user.role
                        )}
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell">
                        {getStatusBadge(
                          user.status
                        )}
                      </td>

                      <td className="px-4 py-3 hidden xl:table-cell text-[#7e91b2]">
                        {user.eventsAttended}
                      </td>

                      <td className="px-4 py-3 hidden xl:table-cell text-right font-semibold text-[#0a1628]">
                        Rp{' '}
                        {Number(
                          user.totalSpent || 0
                        ).toLocaleString(
                          'id-ID'
                        )}
                      </td>

                      <td className="px-4 py-3">

                        <div className="flex items-center justify-center gap-1">

                          <ActionButton
                            title="Detail"
                            icon={Eye}
                            className="text-[#5a7aad] hover:bg-[#5a7aad]/10"
                            onClick={() =>
                              router.push(
                                `/superadmin/users/detail/${user.id}`
                              )
                            }
                          />

                          <ActionButton
                            title="Edit"
                            icon={Pencil}
                            className="text-amber-600 hover:bg-amber-500/10"
                            onClick={() =>
                              router.push(
                                `/superadmin/users/edit/${user.id}`
                              )
                            }
                          />

                          <ActionButton
                            title="Hapus"
                            icon={Trash2}
                            className="text-rose-600 hover:bg-rose-500/10"
                            onClick={() =>
                              handleDelete(user)
                            }
                          />

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="py-12 text-center text-[#7e91b2]"
                  >
                    Tidak ada user yang ditemukan.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        <div className="border-t border-[#e0e8f0]/60 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-[#7e91b2]">
            Menampilkan{' '}
            {sortedUsers.length === 0
              ? 0
              : (currentPage - 1) *
                  itemsPerPage +
                1}{' '}
            -{' '}
            {Math.min(
              currentPage * itemsPerPage,
              sortedUsers.length
            )}{' '}
            dari {sortedUsers.length} user
          </p>

          <div className="flex items-center gap-2">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              className="p-2 rounded-lg border border-[#e0e8f0] text-[#7e91b2] hover:bg-[#f5f8fc] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-[#0a1628] px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
                )
              }
              className="p-2 rounded-lg border border-[#e0e8f0] text-[#7e91b2] hover:bg-[#f5f8fc] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================

function SummaryCard({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e8f0]/60 p-4 shadow-[0_3px_15px_rgba(10,20,40,0.04)]">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs text-[#7e91b2]">
            {title}
          </p>

          <p className="text-xl font-bold text-[#0a1628] mt-1">
            {value}
          </p>

        </div>

        <div className="w-9 h-9 rounded-xl bg-[#5a7aad]/10 flex items-center justify-center">

          <Icon className="w-4 h-4 text-[#5a7aad]" />

        </div>

      </div>

    </div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  className,
  onClick,
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${className}`}
    >
      <Icon
        className="w-4 h-4"
        strokeWidth={1.8}
      />
    </button>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
  ShoppingBag,
  Wallet,
  Activity,
  Building2,
  UserCircle,
  BadgeCheck,
  Crown,
  Briefcase,
} from 'lucide-react';

import { getUserById, deleteUser, updateUser } from '../../data';

export default function DetailUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const data = getUserById(id);
    setUser(data || null);
    setLoading(false);
  }, [id]);

  const handleDelete = () => {
    if (!user) return;
    if (!window.confirm(`Hapus user "${user.name}"?`)) return;
    deleteUser(user.id);
    router.push('/superadmin/users');
  };

  const handleToggleStatus = () => {
    if (!user) return;
    const newStatus = user.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    updateUser(user.id, { status: newStatus });
    setUser((prev) => ({ ...prev, status: newStatus }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Memuat detail user…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mt-4">User Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mt-1">Data pengguna yang kamu cari tidak tersedia.</p>
        <button
          onClick={() => router.push('/superadmin/users')}
          className="mt-5 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
        >
          Kembali ke Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola User</h1>
          <p className="text-sm text-gray-500">Kelola dan pantau aktivitas TicketVerse</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/superadmin/users/edit/${user.id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit User
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 text-sm font-medium transition shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
              <img
                src={user.avatar || `https://i.pravatar.cc/150?img=${user.id}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Terverifikasi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STATISTICS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Aktivitas Ticketing</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Ticket} label="Total Tiket" value={user.totalTickets || 0} />
          <StatCard icon={Building2} label="Event" value={user.eventsAttended || 0} />
          <StatCard icon={ShoppingBag} label="Transaksi" value={user.totalTickets || 0} />
          <StatCard
            icon={Wallet}
            label="Total Belanja"
            value={`Rp ${Number(user.totalSpent || 0).toLocaleString('id-ID')}`}
          />
        </div>
      </section>

      {/* PERSONAL INFO */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informasi Pribadi</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Email" value={user.email} icon={Mail} />
          <DetailItem label="No. Telepon" value={user.phone} icon={Phone} />
          <DetailItem label="Tanggal Lahir" value={user.birthDate} icon={Calendar} />
          <DetailItem label="Jenis Kelamin" value={user.gender} icon={User} />
          <DetailItem label="Kota" value={user.city} icon={MapPin} />
          <DetailItem label="Kode Pos" value={user.postalCode} icon={MapPin} />
          <div className="sm:col-span-2 lg:col-span-3">
            <DetailItem label="Alamat Lengkap" value={user.address} icon={MapPin} />
          </div>
        </div>
      </section>

      {/* ACCOUNT INFO */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informasi Akun</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Username" value={`@${user.username}`} icon={UserCircle} />
          <DetailItem label="Role" value={user.role} icon={Shield} />
          <DetailItem
            label="Status"
            value={user.status}
            icon={user.status === 'Aktif' ? CheckCircle : XCircle}
          />
          <DetailItem label="Login Terakhir" value={user.lastLogin} icon={Clock} />
          <DetailItem label="Tanggal Bergabung" value={user.joinDate} icon={Calendar} />
          <DetailItem
            label="Verifikasi Email"
            value={user.emailVerified ? 'Sudah Terverifikasi' : 'Belum Terverifikasi'}
            icon={BadgeCheck}
          />
        </div>
      </section>

      {/* ACCOUNT CONTROL */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Kontrol Akun</h3>
            <p className="text-xs text-gray-500">Kelola status akses pengguna</p>
          </div>
          <button
            onClick={handleToggleStatus}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm ${
              user.status === 'Aktif'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {user.status === 'Aktif' ? 'Nonaktifkan User' : 'Aktifkan User'}
          </button>
        </div>
      </section>

      {/* BACK BUTTON */}
      <div className="flex justify-start">
        <button
          onClick={() => router.push('/superadmin/users')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar User
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS — DIPERKUAT VISUALNYA
// ============================================================

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 hover:shadow-md transition">
      <div className="flex items-center gap-2.5 mb-1.5">
        <Icon className="w-4 h-4 text-gray-400" />
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900 break-words">{value || '-'}</p>
    </div>
  );
}

function getRoleBadge(role) {
  const config = {
    'Super Admin': { icon: Crown, className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    Admin: { icon: Shield, className: 'bg-blue-50 text-blue-700 border-blue-200' },
    Organizer: { icon: Briefcase, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    User: { icon: User, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };
  const { icon: Icon, className } = config[role] || config.User;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {role}
    </span>
  );
}

function getStatusBadge(status) {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
        <CheckCircle className="w-3.5 h-3.5" />
        Aktif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-rose-200 bg-rose-50 text-rose-700">
      <XCircle className="w-3.5 h-3.5" />
      Tidak Aktif
    </span>
  );
}
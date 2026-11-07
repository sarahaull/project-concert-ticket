// app/superadmin/organizer/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  CheckBadgeIcon,
  TicketIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { getOrganizerById } from '../data';

export default function DetailOrganizerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getOrganizerById(id);
    if (data) setOrganizer(data);
    else alert('Organizer tidak ditemukan');
    setLoading(false);
  }, [id]);

  if (loading) return <div className="text-center py-10">Memuat...</div>;
  if (!organizer) return <div className="text-center py-10 text-[#112250]/60">Organizer tidak ditemukan</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/superadmin/organizer')}
          className="p-2 rounded-lg border border-[#BEB7A7]/30 text-[#112250] hover:bg-[#F5F4F0] transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#112250]">Detail Organizer</h1>
          <p className="text-sm text-[#112250]/60">Informasi lengkap organizer</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-[#BEB7A7]/30 shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#3B507D] to-[#112250]" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center">
              <span className="text-3xl font-bold text-[#112250]">
                {organizer.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#112250]">{organizer.name}</h2>
              <p className="text-sm text-[#112250]/60">{organizer.company}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
                  organizer.status === 'Aktif'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {organizer.status}
              </span>
              {organizer.verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                  <CheckBadgeIcon className="w-4 h-4" />
                  Terverifikasi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatBox icon={DocumentTextIcon} label="Total Event" value={organizer.totalEvents || 0} />
        <StatBox icon={TicketIcon} label="Total Tiket Terjual" value={organizer.totalTicketsSold || 0} />
        <StatBox icon={CalendarIcon} label="Bergabung Sejak" value={organizer.joinDate || '-'} />
      </div>

      {/* Detail Info */}
      <div className="bg-white rounded-2xl border border-[#BEB7A7]/30 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#112250] mb-4 uppercase tracking-wider">Informasi Kontak</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem icon={EnvelopeIcon} label="Email" value={organizer.email} />
          <InfoItem icon={PhoneIcon} label="Telepon" value={organizer.phone || '-'} />
          <InfoItem icon={BuildingOfficeIcon} label="Perusahaan" value={organizer.company} />
          <InfoItem icon={MapPinIcon} label="Kota" value={organizer.city || '-'} />
          <div className="sm:col-span-2">
            <InfoItem icon={MapPinIcon} label="Alamat" value={organizer.address || '-'} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-[#BEB7A7]/30 pt-6">
        <button
          onClick={() => router.push(`/superadmin/organizer/edit/${organizer.id}`)}
          className="px-5 py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition font-medium"
        >
          Edit Organizer
        </button>
        <button
          onClick={() => router.push(`/superadmin/organizer/delete/${organizer.id}`)}
          className="px-5 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition font-medium"
        >
          Hapus Organizer
        </button>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#F5F4F0] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#3B507D]" />
        <span className="text-xs text-[#112250]/60">{label}</span>
      </div>
      <p className="text-lg font-bold text-[#112250] mt-1">{value}</p>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#F5F4F0] rounded-xl px-4 py-3 flex items-center gap-3">
      <Icon className="w-5 h-5 text-[#3B507D] flex-shrink-0" />
      <div>
        <p className="text-xs text-[#112250]/60">{label}</p>
        <p className="text-sm font-medium text-[#112250]">{value}</p>
      </div>
    </div>
  );
}
// app/superadmin/events/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getEventById } from '../data';

export default function DetailEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getEventById(id);
    if (data) setEvent(data);
    else alert('Event tidak ditemukan');
    setLoading(false);
  }, [id]);

  if (loading) return <div className="text-center py-10">Memuat...</div>;
  if (!event) return <div className="text-center py-10 text-[#112250]/60">Event tidak ditemukan</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/superadmin/events')} className="p-2 rounded-lg border border-[#BEB7A7]/30 text-[#112250] hover:bg-[#F5F4F0] transition">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#112250]">Detail Event</h1>
          <p className="text-sm text-[#112250]/60">Informasi lengkap acara</p>
        </div>
      </div>

      {/* Card Detail */}
      <div className="bg-white rounded-2xl border border-[#BEB7A7]/30 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#112250]">{event.name}</h2>
            <span className={getStatusBadge(event.status)}>{event.status}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/superadmin/events/edit/${event.id}`)}
              className="px-4 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Kategori" value={event.category} />
          <InfoItem label="Tanggal" value={event.date} icon={<CalendarIcon className="w-4 h-4 text-[#3B507D]" />} />
          <InfoItem label="Lokasi" value={event.location} icon={<MapPinIcon className="w-4 h-4 text-[#3B507D]" />} />
          <InfoItem label="Harga" value={`Rp ${Number(event.price).toLocaleString('id-ID')}`} icon={<CurrencyDollarIcon className="w-4 h-4 text-[#3B507D]" />} />
          <InfoItem label="Kapasitas" value={Number(event.capacity).toLocaleString('id-ID')} icon={<UserGroupIcon className="w-4 h-4 text-[#3B507D]" />} />
          <InfoItem label="Terjual" value={`${Number(event.sold).toLocaleString('id-ID')} tiket`} />
          <InfoItem label="Sisa Tiket" value={Number(event.capacity - event.sold).toLocaleString('id-ID')} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="bg-[#F5F4F0] rounded-xl px-4 py-3 flex items-center gap-3">
      {icon && <span>{icon}</span>}
      <div>
        <p className="text-xs text-[#112250]/60">{label}</p>
        <p className="text-sm font-semibold text-[#112250]">{value}</p>
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  const classes = {
    Aktif: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    Selesai: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    Draf: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    Batal: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };
  return `inline-flex items-center px-2.5 py-1 text-xs font-medium border rounded-full ${classes[status] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'}`;
}
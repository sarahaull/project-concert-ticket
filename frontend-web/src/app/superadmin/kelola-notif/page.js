"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BellIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  CheckIcon,
  TicketIcon,
  PlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MegaphoneIcon
} from "@heroicons/react/24/outline";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const initialNotifications = [
  {
    id: 1,
    title: "Event Baru Ditambahkan",
    message: "Coldplay - Music of The Spheres telah ditambahkan ke sistem oleh Super Admin.",
    time: "2025-06-10T10:00:00",
    type: "event",
    isRead: false,
  },
  {
    id: 2,
    title: "Pembayaran Berhasil",
    message: "Transaksi TRX-2025-0610-001 sebesar Rp 2.500.000 telah dikonfirmasi otomatis oleh sistem.",
    time: "2025-06-10T09:45:00",
    type: "transaction",
    isRead: false,
  },
  {
    id: 3,
    title: "Ulasan Baru Masuk",
    message: "Aisyah Putri memberikan ulasan bintang 5 untuk event Coldplay.",
    time: "2025-06-10T08:30:00",
    type: "review",
    isRead: true,
  },
  {
    id: 4,
    title: "Peringatan Sistem",
    message: "Akan ada maintenance sistem pada tanggal 15 Juni 2025 pukul 02:00 WIB. Harap simpan pekerjaan Anda.",
    time: "2025-06-09T15:00:00",
    type: "system",
    isRead: true,
  },
];

export default function KelolaNotifikasi() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("Semua");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotifTitle, setNewNotifTitle] = useState("");
  const [newNotifMessage, setNewNotifMessage] = useState("");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotif = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleCreateNotif = (e) => {
    e.preventDefault();
    if (!newNotifTitle.trim() || !newNotifMessage.trim()) return;

    const newNotif = {
      id: Date.now(),
      title: newNotifTitle,
      message: newNotifMessage,
      time: new Date().toISOString(),
      type: "system",
      isRead: false,
    };

    setNotifications([newNotif, ...notifications]);
    setIsModalOpen(false);
    setNewNotifTitle("");
    setNewNotifMessage("");
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === "Belum Dibaca") return !n.isRead;
    return true;
  });

  return (
    <div className={`w-full space-y-6 ${isLoaded ? "animate-in fade-in duration-500" : "opacity-0"}`}>
      
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
              <BellIcon className="w-8 h-8 text-[#8ab4f8]" />
              Kelola Notifikasi
            </h1>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Pusat kendali notifikasi sistem, transaksi, dan pengumuman untuk pengguna.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] text-[#0a1628] text-sm font-bold px-5 py-3 rounded-xl hover:shadow-[0_8px_25px_rgba(138,180,248,0.3)] hover:-translate-y-0.5 transition-all duration-300 self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Buat Notifikasi
          </button>
        </div>
      </section>

      <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] overflow-hidden">
        <div className="p-4 border-b border-[#e0e8f0]/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f8fafc]">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setFilter("Semua")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filter === 'Semua' ? 'bg-[#0a1628] text-white' : 'text-[#7e91b2] hover:bg-[#e0e8f0]'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilter("Belum Dibaca")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${filter === 'Belum Dibaca' ? 'bg-[#0a1628] text-white' : 'text-[#7e91b2] hover:bg-[#e0e8f0]'}`}
            >
              Belum Dibaca
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>
          <button 
            onClick={markAllRead}
            className="text-[11px] font-bold text-[#5a7aad] hover:text-[#0a1628] transition-colors flex items-center gap-1"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        </div>

        <div className="divide-y divide-[#e0e8f0]/50">
          {filteredNotifs.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <BellIcon className="w-12 h-12 text-[#d0d8e4] mb-3" />
              <p className="text-sm font-semibold text-[#0a1628]">Tidak ada notifikasi</p>
              <p className="text-xs text-[#7e91b2]">Daftar notifikasi saat ini kosong.</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 sm:p-5 flex gap-4 hover:bg-[#f0f5fc] transition-colors group relative ${!notif.isRead ? "bg-blue-50/20" : ""}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  notif.type === 'event' ? 'bg-purple-500/10 text-purple-600' :
                  notif.type === 'transaction' ? 'bg-emerald-500/10 text-emerald-600' :
                  notif.type === 'review' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-blue-500/10 text-blue-600'
                }`}>
                  {notif.type === 'event' && <TicketIcon className="w-6 h-6" />}
                  {notif.type === 'transaction' && <CheckCircleIcon className="w-6 h-6" />}
                  {notif.type === 'review' && <ChatBubbleLeftRightIcon className="w-6 h-6" />}
                  {notif.type === 'system' && <MegaphoneIcon className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className={`text-sm sm:text-base ${!notif.isRead ? "font-bold text-[#0a1628]" : "font-semibold text-[#4a5a7a]"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-[#7e91b2] flex-shrink-0">{formatDate(notif.time)}</span>
                  </div>
                  <p className="text-xs text-[#7e91b2] leading-relaxed pr-8">{notif.message}</p>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button onClick={() => markAsRead(notif.id)} className="p-2 bg-white rounded-lg shadow-sm text-emerald-600 hover:bg-emerald-50 transition-colors" title="Tandai Dibaca">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(notif.id)} className="p-2 bg-white rounded-lg shadow-sm text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {!notif.isRead && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 group-hover:opacity-0 transition-opacity">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8ab4f8] shadow-[0_0_8px_rgba(138,180,248,0.6)] block" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-[#0a1628] flex items-center gap-2">
                  <MegaphoneIcon className="w-5 h-5 text-[#5a7aad]" />
                  Buat Notifikasi Baru
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#7e91b2] hover:text-red-500 transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateNotif} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1.5 block">Judul Notifikasi</label>
                  <input
                    type="text"
                    value={newNotifTitle}
                    onChange={(e) => setNewNotifTitle(e.target.value)}
                    placeholder="Contoh: Maintenance Sistem"
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1.5 block">Isi Pesan</label>
                  <textarea
                    value={newNotifMessage}
                    onChange={(e) => setNewNotifMessage(e.target.value)}
                    rows="4"
                    placeholder="Tulis detail informasi di sini..."
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all resize-none"
                    required
                  />
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-[#7e91b2] hover:text-[#0a1628] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold rounded-xl hover:shadow-[0_4px_15px_rgba(10,22,40,0.2)] transition-all"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Kirim Notifikasi
                  </button>
                </div>
              </form>
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
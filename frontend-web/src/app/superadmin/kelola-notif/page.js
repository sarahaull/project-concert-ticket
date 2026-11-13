"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Plus, Search, Users, CheckCircle2, Mail, Pencil, Trash2,
  X, Loader2, RefreshCw, User, AlertCircle,
} from "lucide-react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
const NOTIFICATION_URL = `${API_URL}/notifications`;

export default function AdminNotifikasiPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("accessToken") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const request = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
      cache: "no-store",
    });
    const text = await response.text();
    let result = {};
    try { result = text ? JSON.parse(text) : {}; } catch { result = {}; }
    if (!response.ok || result.success === false) {
      throw new Error(result.message || `Request gagal dengan status ${response.status}`);
    }
    return result;
  }, [getHeaders]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const notificationData = await request(NOTIFICATION_URL);
      setNotifications(Array.isArray(notificationData.notifications) ? notificationData.notifications : []);
    } catch (err) {
      setError(err.message || "Gagal mengambil data notifikasi.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((item) => Number(item.is_read) === 0).length;
    const read = total - unread;
    const recipients = new Set(notifications.map((item) => item.user_id).filter(Boolean)).size;
    return { total, unread, read, recipients };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const keyword = search.toLowerCase();
    return notifications.filter((item) => {
      const matchesSearch =
        String(item.title || "").toLowerCase().includes(keyword) ||
        String(item.message || "").toLowerCase().includes(keyword) ||
        String(item.fullname || "").toLowerCase().includes(keyword) ||
        String(item.email || "").toLowerCase().includes(keyword);
      const matchesFilter =
        filter === "all" ||
        (filter === "read" && Number(item.is_read) === 1) ||
        (filter === "unread" && Number(item.is_read) === 0);
      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Yakin ingin menghapus notifikasi ini?");
    if (!confirmed) return;
    setError("");
    setMessage("");
    try {
      await request(`${NOTIFICATION_URL}/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
      setMessage("Notifikasi berhasil dihapus.");
    } catch (err) {
      setError(err.message || "Gagal menghapus notifikasi.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const statItems = [
    { title: "Total Notifikasi", value: stats.total, icon: Bell, bgLight: "bg-indigo-50", textLight: "text-indigo-600" },
    { title: "Belum Dibaca", value: stats.unread, icon: Mail, bgLight: "bg-amber-50", textLight: "text-amber-600" },
    { title: "Sudah Dibaca", value: stats.read, icon: CheckCircle2, bgLight: "bg-emerald-50", textLight: "text-emerald-600" },
    { title: "Customer Terjangkau", value: stats.recipients, icon: Users, bgLight: "bg-sky-50", textLight: "text-sky-600" },
  ];

  return (
    <div className="w-full min-w-0">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
            <Bell size={16} /> Administration
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#112250] md:text-3xl">Kelola Notifikasi</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Kelola informasi dan kirim pemberitahuan kepada customer TicketVerse.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={loadData} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          {/* TOMBOL MENUJU HALAMAN TAMBAH */}
          <button onClick={() => router.push("/superadmin/kelola-notif/tambah")} className="flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:bg-indigo-900">
            <Plus size={18} /> Buat Notifikasi
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
          <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" />{message}</span>
          <button onClick={() => setMessage("")} className="hover:text-emerald-950"><X size={18} /></button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
          <span className="flex items-center gap-2"><AlertCircle size={18} className="text-red-600" />{error}</span>
          <button onClick={() => setError("")} className="hover:text-red-950"><X size={18} /></button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{item.title}</p>
                  <h2 className="mt-2 text-3xl font-black text-[#112250]">{item.value}</h2>
                </div>
                <div className={`rounded-xl p-3 ${item.bgLight} ${item.textLight} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-bold text-[#112250]">Riwayat Notifikasi</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Daftar notifikasi yang sudah dibuat admin.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari notifikasi..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:w-64" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10">
              <option value="all">Semua Status</option>
              <option value="read">Sudah Dibaca</option>
              <option value="unread">Belum Dibaca</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#112250] text-xs uppercase tracking-wider text-white">
              <tr>
                <th className="px-6 py-4 font-semibold">Notifikasi</th>
                <th className="px-6 py-4 font-semibold">Penerima</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-indigo-600" size={32} />
                    <p className="mt-3 text-sm font-medium text-slate-500">Memuat notifikasi...</p>
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Bell size={40} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-[#112250]">Belum ada notifikasi</p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="max-w-sm px-6 py-5">
                      <div className="font-bold text-[#112250] group-hover:text-indigo-600 transition-colors">{item.title}</div>
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">{item.message}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"><User size={16} /></div>
                        <div>
                          <p className="font-semibold text-[#112250]">{item.fullname || item.name || `Customer #${item.user_id}`}</p>
                          <p className="text-[11px] font-medium text-slate-500">{item.email || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-xs font-medium text-slate-500">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-5">
                      {Number(item.is_read) === 1 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 border border-emerald-100"><CheckCircle2 size={12} /> Dibaca</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 border border-amber-100"><Mail size={12} /> Belum</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        {/* TOMBOL MENUJU HALAMAN EDIT */}
                        <button onClick={() => router.push(`/superadmin/kelola-notif/edit/${item.id}`)} title="Edit" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} title="Hapus" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs font-medium text-slate-500">
          Menampilkan {filteredNotifications.length} dari {notifications.length} notifikasi
        </div>
      </div>
    </div>
  );
}
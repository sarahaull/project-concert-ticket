"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Mail,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  User,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
const API_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;
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
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          localStorage.getItem("accessToken")
        : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const request = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: { ...getHeaders(), ...options.headers },
        cache: "no-store",
      });
      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }
      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request gagal dengan status ${response.status}`
        );
      }
      return result;
    },
    [getHeaders]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const notificationData = await request(NOTIFICATION_URL);
      setNotifications(
        Array.isArray(notificationData.notifications)
          ? notificationData.notifications
          : []
      );
    } catch (err) {
      setError(err.message || "Gagal mengambil data notifikasi.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(
      (item) => Number(item.is_read) === 0
    ).length;
    const read = total - unread;
    const recipients = new Set(
      notifications.map((item) => item.user_id).filter(Boolean)
    ).size;
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
    const confirmed = window.confirm(
      "Yakin ingin menghapus notifikasi ini?"
    );
    if (!confirmed) return;
    setError("");
    setMessage("");
    try {
      await request(`${NOTIFICATION_URL}/${id}`, { method: "DELETE" });
      setNotifications((prev) =>
        prev.filter((item) => Number(item.id) !== Number(id))
      );
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
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statItems = [
    {
      title: "Total Notifikasi",
      value: stats.total,
      icon: Bell,
      bgLight: "bg-[#F1F4F8]",
      textLight: "text-[#53657D]",
    },
    {
      title: "Belum Dibaca",
      value: stats.unread,
      icon: Mail,
      bgLight: "bg-amber-50",
      textLight: "text-amber-600",
    },
    {
      title: "Sudah Dibaca",
      value: stats.read,
      icon: CheckCircle2,
      bgLight: "bg-emerald-50",
      textLight: "text-emerald-600",
    },
    {
      title: "Customer Terjangkau",
      value: stats.recipients,
      icon: Users,
      bgLight: "bg-sky-50",
      textLight: "text-sky-600",
    },
  ];

  return (
    <div className="w-full min-w-0">
      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8795A7]">
            <Bell size={11} />
            Administration / Notifikasi
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#112250] md:text-3xl">
            Kelola Notifikasi
          </h1>
          <p className="mt-1.5 text-sm font-medium text-[#8795A7]">
            Kelola informasi dan kirim pemberitahuan kepada customer
            TicketVerse.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] bg-white px-4 text-xs font-semibold text-[#53657D] transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            onClick={() =>
              router.push("/superadmin/kelola-notif/tambah")
            }
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#112250] px-4 text-xs font-semibold text-white transition hover:bg-[#1B3560] active:scale-[0.98]"
          >
            <Plus size={15} />
            Buat Notifikasi
          </button>
        </div>
      </div>

      {/* HERO BANNER — biar atas tidak polos */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-[#DDE3EB] bg-gradient-to-br from-[#0D1D35] via-[#142B4B] to-[#1D3A61] p-5 text-white shadow-sm sm:mb-8 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-white font-semibold sm:text-lg">
                Pusat Notifikasi
              </h2>
              <p className="mt-1 max-w-lg text-xs leading-5 text-white/70 sm:text-sm">
                Pantau seluruh pemberitahuan yang dikirim ke customer. Gunakan
                filter dan pencarian untuk menemukan notifikasi dengan cepat.
              </p>
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Belum Dibaca
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {stats.unread}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Penerima
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {stats.recipients}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      {message && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            {message}
          </span>
          <button
            onClick={() => setMessage("")}
            className="hover:text-emerald-950"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
          <span className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            {error}
          </span>
          <button
            onClick={() => setError("")}
            className="hover:text-red-950"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8795A7]">
                    {item.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-[#112250]">
                    {item.value}
                  </h2>
                </div>
                <div
                  className={`rounded-xl p-3 ${item.bgLight} ${item.textLight} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#EDF0F4] p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-semibold text-[#112250]">
              Riwayat Notifikasi
            </h2>
            <p className="mt-1 text-xs font-medium text-[#8795A7]">
              Daftar notifikasi yang sudah dibuat admin.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA6B2]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari notifikasi..."
                className="h-10 w-full rounded-xl border border-[#DCE2EA] bg-white pl-9 pr-4 text-xs font-medium text-[#112250] outline-none transition-all placeholder:text-[#9AA6B2] focus:border-[#315A91] focus:ring-4 focus:ring-[#315A91]/10 sm:w-64"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#DCE2EA] bg-white px-3 text-xs font-medium text-[#112250] outline-none transition-all focus:border-[#315A91] focus:ring-4 focus:ring-[#315A91]/10"
            >
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
                <th className="px-6 py-4 text-right font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F4]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F8]">
                      <Loader2
                        className="animate-spin text-[#112250]"
                        size={22}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#8795A7]">
                      Memuat notifikasi...
                    </p>
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F8] text-[#8795A7]">
                      <Bell size={22} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#112250]">
                      Belum ada notifikasi
                    </p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-[#F8FAFC]"
                  >
                    <td className="max-w-sm px-6 py-5">
                      <div className="font-semibold text-[#112250] transition-colors group-hover:text-[#315A91]">
                        {item.title}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-[#697F93]">
                        {item.message}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCE2EA] bg-[#F1F4F8] text-[#53657D]">
                          <User size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#112250]">
                            {item.fullname ||
                              item.name ||
                              `Customer #${item.user_id}`}
                          </p>
                          <p className="truncate text-[11px] font-medium text-[#8795A7]">
                            {item.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-xs font-medium text-[#697F93]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-5">
                      {Number(item.is_read) === 1 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          <CheckCircle2 size={12} />
                          Dibaca
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          <Mail size={12} />
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/superadmin/kelola-notif/edit/${item.id}`
                            )
                          }
                          title="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE2EA] bg-white text-[#697F93] transition hover:border-[#315A91]/30 hover:bg-[#F1F4F8] hover:text-[#315A91] active:scale-95"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE2EA] bg-white text-[#697F93] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#EDF0F4] bg-[#F8FAFC] px-6 py-4 text-xs font-medium text-[#8795A7] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5">
            <Info size={12} />
            Menampilkan {filteredNotifications.length} dari{" "}
            {notifications.length} notifikasi
          </span>
          <span>
            {stats.unread > 0
              ? `${stats.unread} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </span>
        </div>
      </div>
    </div>
  );
}
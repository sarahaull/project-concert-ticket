"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  CheckCircle2,
  CheckCheck,
  Clock3,
  Info,
  Loader2,
  RefreshCw,
  AlertCircle,
  Trash2,
  ChevronRight,
  Sparkles,
  Inbox,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const NOTIFICATIONS_API = `${API_BASE}/api/notifications`;

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatRelativeTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return formatDate(value);
}

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Gagal membaca user dari localStorage:", error);
    return null;
  }
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        else setRefreshing(true);

        setError("");

        const token = localStorage.getItem("token");
        const user = getStoredUser();

        if (!token || !user?.id) {
          router.replace("/login");
          return;
        }

        const response = await fetch(`${NOTIFICATIONS_API}/user/${user.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Gagal mengambil notifikasi.");
        }

        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      } catch (err) {
        console.error("GET NOTIFICATIONS ERROR:", err);
        setError(err?.message || "Terjadi kesalahan saat mengambil notifikasi.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, is_read: 1 } : item))
      );

      await fetch(`${NOTIFICATIONS_API}/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      console.error("MARK AS READ ERROR:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !Number(n.is_read));
    if (unread.length === 0) return;

    try {
      setMarkingAll(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      await Promise.allSettled(
        unread.map((item) =>
          fetch(`${NOTIFICATIONS_API}/${item.id}/read`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          })
        )
      );

      setNotifications((current) => current.map((item) => ({ ...item, is_read: 1 })));
    } catch (err) {
      console.error("MARK ALL AS READ ERROR:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus notifikasi ini?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${NOTIFICATIONS_API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Gagal menghapus notifikasi.");

      setNotifications((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      console.error("DELETE NOTIFICATION ERROR:", err);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((item) => !Number(item.is_read));
    if (filter === "read") return notifications.filter((item) => Number(item.is_read));
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !Number(item.is_read)).length,
    [notifications]
  );

  const readCount = useMemo(
    () => notifications.filter((item) => Number(item.is_read)).length,
    [notifications]
  );

  const filterOptions = [
    { value: "all", label: `Semua (${notifications.length})` },
    { value: "unread", label: `Belum Dibaca (${unreadCount})` },
    { value: "read", label: `Sudah Dibaca (${readCount})` },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#DDE4ED] bg-white shadow-[0_10px_30px_rgba(17,34,80,0.1)]">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-[#112250] opacity-10"></div>
            <Loader2 size={28} className="animate-spin text-[#112250]" />
          </div>
          <h2 className="mt-6 text-lg font-bold text-[#112250]">Memuat notifikasi...</h2>
          <p className="mt-1 text-sm text-slate-500">Mengambil data notifikasi dari server.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_20px_60px_rgba(17,34,80,0.08)]">
          <div className="h-2 w-full bg-red-500"></div>
          <div className="p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/50">
              <AlertCircle size={36} />
            </div>
            <h2 className="mt-6 text-xl font-bold text-[#112250]">Gagal Memuat Notifikasi</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => fetchNotifications()}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#112250]/20 transition hover:-translate-y-0.5 hover:bg-[#1A326A]"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-12 text-[#112250]">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0D1F42] via-[#112250] to-[#1A326A] shadow-[0_20px_50px_-15px_rgba(17,34,80,0.3)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-16 bottom-[-100px] h-56 w-56 rounded-full bg-[#E5C27A]/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative w-full px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#E5C27A] backdrop-blur-md">
                <Sparkles size={13} />
                Pusat Informasi
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Notifikasi
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100/80">
                Semua pemberitahuan penting tentang tiket dan aktivitas akun kamu.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md">
                <BellRing className="h-4 w-4 text-[#E5C27A]" />
                <span>{unreadCount} Belum Dibaca</span>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E5C27A] px-5 py-2.5 text-xs font-bold text-[#112250] shadow-[0_0_20px_rgba(229,194,122,0.3)] transition hover:-translate-y-0.5 hover:bg-[#d8b46b] hover:shadow-[0_0_30px_rgba(229,194,122,0.5)] disabled:opacity-60"
                >
                  {markingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4" />
                  )}
                  Tandai Semua Dibaca
                </button>
              )}

              <button
                type="button"
                onClick={() => fetchNotifications(false)}
                disabled={refreshing}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : "transition group-hover:rotate-180"}`}
                />
                Perbarui
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Bell size={22} />}
          label="Total Notifikasi"
          value={notifications.length}
          description="Seluruh pemberitahuan"
          className="bg-blue-50 text-blue-600"
          accentColor="bg-blue-400"
        />
        <StatCard
          icon={<BellRing size={22} />}
          label="Belum Dibaca"
          value={unreadCount}
          description="Perlu kamu periksa"
          className="bg-amber-50 text-amber-600"
          accentColor="bg-amber-400"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Sudah Dibaca"
          value={readCount}
          description="Sudah kamu periksa"
          className="bg-emerald-50 text-emerald-600"
          accentColor="bg-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-[20px] border border-[#DDE4ED] bg-white p-4 shadow-[0_8px_30px_rgba(17,34,80,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? "bg-[#112250] text-white shadow-md shadow-[#112250]/20"
                    : "border border-transparent bg-[#F8FAFC] text-[#526B92] hover:bg-slate-200/50 hover:text-[#112250]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {refreshing && (
          <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#112250] shadow-sm ring-1 ring-slate-200">
            <Loader2 size={14} className="animate-spin" />
            Memperbarui
          </span>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="rounded-[24px] border border-[#DDE4ED] bg-white px-6 py-20 text-center shadow-[0_8px_30px_rgba(17,34,80,0.04)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#EEF3F9] to-[#E1EAF6] text-[#526B92] ring-4 ring-white shadow-inner">
            <Inbox size={36} />
          </div>
          <h3 className="mt-6 text-xl font-bold text-[#112250]">
            {notifications.length === 0 ? "Belum Ada Notifikasi" : "Tidak Ada Notifikasi"}
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            {notifications.length === 0
              ? "Kamu belum memiliki pemberitahuan. Notifikasi tentang tiket, pembayaran, dan aktivitas akun akan muncul di sini."
              : "Tidak ada notifikasi yang sesuai dengan filter yang dipilih."}
          </p>
          {notifications.length === 0 && (
            <Link
              href="/cari-acara"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#112250]/20 transition hover:-translate-y-0.5 hover:bg-[#1A326A]"
            >
              Cari Acara
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  const isRead = Boolean(Number(notification.is_read));

  return (
    <article
      className={`group relative overflow-hidden rounded-[20px] border bg-white shadow-[0_4px_20px_rgba(17,34,80,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(17,34,80,0.08)] ${
        isRead
          ? "border-[#DDE4ED] bg-white"
          : "border-[#112250]/30 ring-1 ring-[#112250]/10"
      }`}
    >
      {!isRead && (
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#112250] to-[#1A326A]" />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
              isRead
                ? "bg-slate-100 text-slate-400"
                : "bg-[#EEF3F9] text-[#112250] ring-1 ring-[#DDE4ED]"
            }`}
          >
            {isRead ? <CheckCircle2 size={22} /> : <BellRing size={22} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3
                className={`text-base font-bold leading-snug ${
                  isRead ? "text-slate-600" : "text-[#112250]"
                }`}
              >
                {notification.title || "Notifikasi"}
              </h3>

              {!isRead && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#112250]/20 bg-[#112250]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#112250]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#112250]" />
                  Baru
                </span>
              )}
            </div>

            <p className={`mt-2 text-sm leading-relaxed ${isRead ? "text-slate-500" : "text-slate-600"}`}>
              {notification.message || "-"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock3 size={14} />
                {formatRelativeTime(notification.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Info size={14} />
                {formatDate(notification.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-dashed border-slate-200 bg-[#F8FAFC] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
        {!isRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] bg-white px-4 py-2 text-xs font-bold text-[#526B92] shadow-sm transition hover:border-[#112250] hover:text-[#112250]"
          >
            <CheckCircle2 size={15} />
            Tandai Dibaca
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-4 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
          Hapus
        </button>
      </div>
    </article>
  );
}

function StatCard({ icon, label, value, description, className, accentColor }) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#DDE4ED] bg-white p-5 shadow-[0_4px_20px_rgba(17,34,80,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(17,34,80,0.08)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentColor} opacity-0 transition duration-300 group-hover:opacity-100`} />
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}>
          {icon}
        </div>
        <Bell size={20} className="text-slate-200 transition group-hover:text-[#E5C27A]" />
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-[#112250]">{value}</p>
      <p className="mt-2 text-[11px] font-medium text-slate-400">{description}</p>
    </div>
  );
}
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
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const token = localStorage.getItem("token");
        const user = getStoredUser();

        if (!token || !user?.id) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${NOTIFICATIONS_API}/user/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Gagal mengambil notifikasi."
          );
        }

        setNotifications(
          Array.isArray(data.notifications)
            ? data.notifications
            : []
        );
      } catch (err) {
        console.error("GET NOTIFICATIONS ERROR:", err);
        setError(
          err?.message ||
            "Terjadi kesalahan saat mengambil notifikasi."
        );
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
        current.map((item) =>
          item.id === id ? { ...item, is_read: 1 } : item
        )
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

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: 1 }))
      );
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

      const response = await fetch(
        `${NOTIFICATIONS_API}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus notifikasi.");
      }

      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("DELETE NOTIFICATION ERROR:", err);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !Number(item.is_read));
    }

    if (filter === "read") {
      return notifications.filter((item) => Number(item.is_read));
    }

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D8D0C4]/40 bg-white shadow-lg">
            <Loader2
              size={26}
              className="animate-spin text-[#112250]"
            />
          </div>
          <h2 className="mt-4 text-base font-bold text-[#112250]">
            Memuat notifikasi...
          </h2>
          <p className="mt-1 text-sm text-[#9B907F]">
            Mengambil data notifikasi dari server.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle size={28} />
          </div>
          <h2 className="mt-5 text-lg font-bold text-[#112250]">
            Gagal Memuat Notifikasi
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#9B907F]">
            {error}
          </p>
          <button
            type="button"
            onClick={() => fetchNotifications()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <section className="relative isolate mb-6 overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-gradient-to-br from-[#112250] via-[#1A326A] to-[#3B507D] shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,194,122,0.15),transparent_50%)]" />

        <div className="relative w-full px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C27A]">
                <Sparkles size={14} />
                Pusat Informasi
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Notifikasi
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Semua pemberitahuan penting tentang tiket dan
                aktivitas akun kamu.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
                <BellRing className="h-4 w-4" />
                <span>{unreadCount} belum dibaca</span>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5C27A]/40 bg-[#E5C27A] px-4 py-2 text-xs font-bold text-[#112250] shadow-sm transition hover:bg-[#d8b46b] disabled:opacity-60"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Perbarui
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Bell size={21} />}
          label="Total Notifikasi"
          value={notifications.length}
          description="Seluruh pemberitahuan"
          className="bg-blue-50 text-blue-600"
        />

        <StatCard
          icon={<BellRing size={21} />}
          label="Belum Dibaca"
          value={unreadCount}
          description="Perlu kamu periksa"
          className="bg-amber-50 text-amber-600"
        />

        <StatCard
          icon={<CheckCircle2 size={21} />}
          label="Sudah Dibaca"
          value={readCount}
          description="Sudah kamu periksa"
          className="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#D8D0C4]/40 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#112250] to-[#3B507D] text-white shadow-sm"
                    : "border border-transparent bg-[#F7F8FA] text-[#3B507D] hover:border-[#D8D0C4]/40 hover:bg-[#112250]/5"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {refreshing && (
          <span className="flex items-center gap-2 text-xs font-medium text-[#3B507D]">
            <Loader2 size={14} className="animate-spin" />
            Memperbarui
          </span>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-white px-6 py-16 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F8FA] text-[#9B907F]">
            <Inbox size={30} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-[#112250]">
            {notifications.length === 0
              ? "Belum Ada Notifikasi"
              : "Tidak Ada Notifikasi"}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#9B907F]">
            {notifications.length === 0
              ? "Kamu belum memiliki pemberitahuan. Notifikasi tentang tiket, pembayaran, dan aktivitas akun akan muncul di sini."
              : "Tidak ada notifikasi yang sesuai dengan filter yang dipilih."}
          </p>

          {notifications.length === 0 && (
            <Link
              href="/cari-acara"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Cari Acara
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
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

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}) {
  const isRead = Boolean(Number(notification.is_read));

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isRead
          ? "border-[#D8D0C4]/40"
          : "border-[#3B507D]/30 ring-1 ring-[#3B507D]/10"
      }`}
    >
      {!isRead && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#112250] to-[#3B507D]" />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isRead
                ? "bg-[#F7F8FA] text-[#9B907F]"
                : "bg-[#112250]/10 text-[#112250]"
            }`}
          >
            {isRead ? (
              <CheckCircle2 size={21} />
            ) : (
              <BellRing size={21} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3
                className={`text-base font-bold leading-snug ${
                  isRead ? "text-[#3B507D]" : "text-[#112250]"
                }`}
              >
                {notification.title || "Notifikasi"}
              </h3>

              {!isRead && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#112250]/20 bg-[#112250]/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#112250]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#112250]" />
                  Baru
                </span>
              )}
            </div>

            <p className="mt-2 text-sm leading-6 text-[#3B507D]/80">
              {notification.message || "-"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#9B907F]">
              <span className="flex items-center gap-1.5">
                <Clock3 size={13} />
                {formatRelativeTime(notification.created_at)}
              </span>

              <span className="flex items-center gap-1.5">
                <Info size={13} />
                {formatDate(notification.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#D8D0C4]/30 bg-gradient-to-r from-[#F7F8FA] to-[#E5C27A]/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
        {!isRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D8D0C4]/40 bg-white px-3.5 py-2 text-xs font-bold text-[#3B507D] transition hover:bg-[#112250]/5 hover:text-[#112250]"
          >
            <CheckCircle2 size={14} />
            Tandai Dibaca
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
        >
          <Trash2 size={14} />
          Hapus
        </button>
      </div>
    </article>
  );
}

function StatCard({ icon, label, value, description, className }) {
  return (
    <div className="group rounded-2xl border border-[#D8D0C4]/40 bg-white p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>

        <Bell
          size={19}
          className="text-[#D8D0C4] transition group-hover:text-[#E5C27A]"
        />
      </div>

      <p className="mt-5 text-sm font-medium text-[#9B907F]">
        {label}
      </p>

      <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#112250]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#9B907F]">{description}</p>
    </div>
  );
}
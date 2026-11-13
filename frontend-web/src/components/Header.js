
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Info,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const getPhoto = useCallback((currentUser) => {
    const photo =
      currentUser?.photo ||
      currentUser?.profile_image ||
      currentUser?.profile_picture ||
      currentUser?.avatar ||
      currentUser?.image ||
      null;

    if (!photo) return null;

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://") ||
      photo.startsWith("data:")
    ) {
      return photo;
    }

    return `${API_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
  }, [API_URL]);

  const loadUser = useCallback(() => {
    try {
      const data = localStorage.getItem("user");

      if (!data) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(data);

      setUser({
        ...parsedUser,
        fullname:
          parsedUser.fullname ||
          parsedUser.name ||
          parsedUser.username ||
          "User",
        email: parsedUser.email || "",
        photo: getPhoto(parsedUser),
      });
    } catch (error) {
      console.error("Gagal membaca user:", error);
      setUser(null);
    }
  }, [getPhoto]);

  useEffect(() => {
    loadUser();

    const handleProfileUpdate = (event) => {
      if (event.detail) {
        const updatedUser = event.detail.user || event.detail;

        const normalizedUser = {
          ...updatedUser,
          fullname:
            updatedUser.fullname ||
            updatedUser.name ||
            updatedUser.username ||
            "User",
          email: updatedUser.email || "",
          photo: getPhoto(updatedUser),
        };

        setUser(normalizedUser);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user") || "{}"),
            ...updatedUser,
          })
        );
      } else {
        loadUser();
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === "user") {
        loadUser();
      }
    };

    window.addEventListener(
      "ticketverse:user-profile-updated",
      handleProfileUpdate
    );

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "ticketverse:user-profile-updated",
        handleProfileUpdate
      );

      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadUser, getPhoto]);

  const getUserId = () => {
    try {
      const data = localStorage.getItem("user");

      if (!data) return null;

      const parsedUser = JSON.parse(data);

      return (
        parsedUser?.id ||
        parsedUser?.user_id ||
        parsedUser?.userId ||
        null
      );
    } catch (error) {
      console.error("Gagal membaca ID user:", error);
      return null;
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = getUserId();

      if (!token || !userId) return;

      setLoadingNotifications(true);

      const response = await fetch(
        `${API_URL}/api/notifications/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Gagal mengambil notifikasi:", response.status);
        return;
      }

      const data = await response.json();

      if (!data.success) return;

      const notificationData = Array.isArray(data.notifications)
        ? data.notifications
        : [];

      setNotifications(notificationData);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(
    (notification) =>
      notification.is_read === 0 ||
      notification.is_read === false ||
      notification.is_read === "0"
  ).length;

  const getRoleName = () => {
    switch (user?.role) {
      case "super_admin":
        return "Super Admin";
      case "event_organizer":
        return "Event Organizer";
      case "customer":
        return "Customer";
      default:
        return "User";
    }
  };

  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";

    if (
      pathname.includes("/users") ||
      pathname.includes("/user")
    ) {
      return "Kelola User";
    }

    if (pathname.includes("/events")) {
      return user?.role === "event_organizer"
        ? "Event Saya"
        : "Event";
    }

    if (pathname.includes("/tickets")) {
      return user?.role === "customer"
        ? "Tiket Saya"
        : "Tiket";
    }

    if (pathname.includes("/participants")) return "Peserta";
    if (pathname.includes("/organizers")) return "Organizer";
    if (pathname.includes("/reports")) return "Laporan";
    if (pathname.includes("/favorites")) return "Favorit";
    if (pathname.includes("/notifications")) return "Notifikasi";
    if (pathname.includes("/profile")) return "Profil";
    if (pathname.includes("/settings")) return "Pengaturan";
    if (pathname.includes("/roles")) return "Roles & Permissions";

    return "Dashboard";
  };

  const getProfileUrl = () => {
    if (user?.role === "super_admin") {
      return "/superadmin/profile";
    }

    if (user?.role === "event_organizer") {
      return "/organizer/profile";
    }

    if (user?.role === "customer") {
      return "/profile";
    }

    return "/profile";
  };

  const getSettingsUrl = () => {
    if (user?.role === "super_admin") {
      return "/superadmin/settings";
    }

    if (user?.role === "event_organizer") {
      return "/organizer/settings";
    }

    return "/settings";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    router.push("/login");
  };

  const getInitial = () => {
    const fullname = user?.fullname || user?.name || "User";

    return fullname.charAt(0).toUpperCase();
  };

  const toggleNotification = () => {
    setNotificationOpen((prev) => !prev);
    setProfileOpen(false);

    if (!notificationOpen) {
      fetchNotifications();
    }
  };

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev);
    setNotificationOpen(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: 1,
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    const isUnread =
      notification.is_read === 0 ||
      notification.is_read === false ||
      notification.is_read === "0";

    if (isUnread) {
      await markAsRead(notification.id);
    }
  };

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();

    const diff = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (diff < 60) return "Baru saja";

    if (diff < 3600) {
      return `${Math.floor(diff / 60)} menit lalu`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)} jam lalu`;
    }

    if (diff < 604800) {
      return `${Math.floor(diff / 86400)} hari lalu`;
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getNotificationIcon = (title = "") => {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("pembayaran") ||
      lowerTitle.includes("transaksi") ||
      lowerTitle.includes("bayar")
    ) {
      return <CreditCard size={15} strokeWidth={1.8} />;
    }

    if (
      lowerTitle.includes("event") ||
      lowerTitle.includes("konser")
    ) {
      return <CalendarDays size={15} strokeWidth={1.8} />;
    }

    if (
      lowerTitle.includes("user") ||
      lowerTitle.includes("akun")
    ) {
      return <User size={15} strokeWidth={1.8} />;
    }

    return <Info size={15} strokeWidth={1.8} />;
  };

  return (
    <header
      className="
        sticky
        top-0
        z-40
        h-[76px]
        border-b
        border-slate-200/80
        bg-white/90
        backdrop-blur-2xl
        shadow-[0_1px_3px_rgba(15,23,42,0.03)]
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="
                hidden
                h-9
                w-1
                rounded-full
                bg-[#3B507D]
                sm:block
              "
            />

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-[18px]
                  font-bold
                  tracking-[-0.025em]
                  text-[#112250]
                  sm:text-[20px]
                "
              >
                {getPageTitle()}
              </h1>

              <div
                className="
                  mt-1
                  hidden
                  items-center
                  gap-2
                  sm:flex
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#3B507D]
                  "
                />

                <p
                  className="
                    text-[10px]
                    font-medium
                    tracking-[0.01em]
                    text-[#7A899A]
                  "
                >
                  Kelola dan pantau aktivitas TicketVerse
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative">
            <button
              onClick={toggleNotification}
              aria-label="Notifikasi"
              className={`
                group
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                transition-all
                duration-200
                ${
                  notificationOpen
                    ? "border-[#D8E0EA] bg-[#F3F6FA] text-[#112250] shadow-sm"
                    : "border-transparent text-[#718096] hover:border-[#E2E7ED] hover:bg-[#F7F9FB] hover:text-[#112250]"
                }
              `}
            >
              <Bell
                size={19}
                strokeWidth={1.8}
                className="transition-transform duration-200 group-hover:scale-105"
              />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    right-[6px]
                    top-[5px]
                    flex
                    h-[15px]
                    min-w-[15px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#3B507D]
                    px-1
                    text-[8px]
                    font-bold
                    leading-none
                    text-white
                    ring-2
                    ring-white
                  "
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-[370px]
                  max-w-[calc(100vw-1.5rem)]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_24px_70px_rgba(15,23,42,0.14)]
                  ring-1
                  ring-black/[0.02]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[#EEF1F5]
                    bg-white
                    px-5
                    py-4
                  "
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-bold text-[#112250]">
                        Notifikasi
                      </h3>

                      {unreadCount > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3B507D]" />
                      )}
                    </div>

                    <p className="mt-1 text-[10px] text-[#8492A3]">
                      Aktivitas terbaru akun Anda
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <span
                      className="
                        rounded-full
                        border
                        border-[#E1E7EF]
                        bg-[#F6F8FA]
                        px-2.5
                        py-1
                        text-[9px]
                        font-semibold
                        text-[#3B507D]
                      "
                    >
                      {unreadCount} baru
                    </span>
                  )}
                </div>

                {loadingNotifications && notifications.length === 0 ? (
                  <div className="flex items-center justify-center px-5 py-11">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-[#D7DEE8]
                          border-t-[#3B507D]
                        "
                      />

                      <span className="text-[11px] font-medium text-[#697F93]">
                        Memuat notifikasi...
                      </span>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-5 py-11 text-center">
                    <div
                      className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-[#E8ECF1]
                        bg-[#F7F9FB]
                        text-[#9AA6B2]
                      "
                    >
                      <Bell size={19} strokeWidth={1.7} />
                    </div>

                    <p className="mt-4 text-[12px] font-bold text-[#112250]">
                      Belum ada notifikasi
                    </p>

                    <p className="mx-auto mt-1.5 max-w-[230px] text-[10px] leading-5 text-[#9AA6B2]">
                      Notifikasi aktivitas akun akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[390px] overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => {
                      const isUnread =
                        notification.is_read === 0 ||
                        notification.is_read === false ||
                        notification.is_read === "0";

                      return (
                        <button
                          key={notification.id}
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                          className={`
                            group
                            flex
                            w-full
                            gap-3
                            border-b
                            border-[#EEF1F5]
                            px-5
                            py-4
                            text-left
                            transition-all
                            duration-200
                            hover:bg-[#F8FAFC]
                            ${
                              isUnread
                                ? "bg-[#FCFDFE]"
                                : "bg-white"
                            }
                          `}
                        >
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              flex-shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              border
                              transition
                              ${
                                isUnread
                                  ? "border-[#E0E6EE] bg-[#F2F5F8] text-[#3B507D]"
                                  : "border-[#EDF0F4] bg-[#F8F9FB] text-[#9AA6B2]"
                              }
                            `}
                          >
                            {getNotificationIcon(notification.title)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`
                                  line-clamp-1
                                  text-[12px]
                                  leading-5
                                  ${
                                    isUnread
                                      ? "font-bold text-[#112250]"
                                      : "font-semibold text-[#4B5C72]"
                                  }
                                `}
                              >
                                {notification.title || "Notifikasi"}
                              </p>

                              {isUnread && (
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3B507D]" />
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-[1.65] text-[#718096]">
                              {notification.message || "Tidak ada pesan."}
                            </p>

                            <p className="mt-1.5 text-[9px] font-medium text-[#A0AAB7]">
                              {formatNotificationTime(notification.created_at)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => {
                    setNotificationOpen(false);
                    router.push("/notifications");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    border-t
                    border-[#EEF1F5]
                    bg-white
                    py-3.5
                    text-[10px]
                    font-bold
                    text-[#3B507D]
                    transition
                    hover:bg-[#F7F9FB]
                  "
                >
                  Lihat semua notifikasi
                  <ArrowUpRight size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="hidden h-8 w-px bg-[#E4E8EE] sm:block" />

          <div className="relative">
            <button
              onClick={toggleProfile}
              className={`
                flex
                items-center
                gap-2.5
                rounded-xl
                border
                px-2
                py-1.5
                transition-all
                duration-200
                ${
                  profileOpen
                    ? "border-[#D8E0EA] bg-[#F3F6FA] shadow-sm"
                    : "border-transparent hover:border-[#E2E7ED] hover:bg-[#F8FAFC]"
                }
              `}
            >
              <div
                className="
                  relative
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  bg-[#112250]
                  text-[12px]
                  font-bold
                  text-white
                  shadow-sm
                  ring-1
                  ring-[#112250]/10
                "
              >
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitial()
                )}
              </div>

              <div className="hidden max-w-[170px] text-left sm:block">
                <p className="truncate text-[12px] font-bold tracking-[-0.01em] text-[#112250]">
                  {user?.fullname || "User"}
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B507D]" />

                  <p className="truncate text-[9px] font-medium text-[#718096]">
                    {getRoleName()}
                  </p>
                </div>
              </div>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className={`
                  hidden
                  text-[#718096]
                  transition-transform
                  duration-200
                  sm:block
                  ${profileOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-[280px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_24px_70px_rgba(15,23,42,0.14)]
                  ring-1
                  ring-black/[0.02]
                "
              >
                <div
                  className="
                    border-b
                    border-[#EAEFF4]
                    bg-gradient-to-br
                    from-[#F8FAFC]
                    to-[#F2F5F8]
                    p-5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        flex-shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        bg-[#112250]
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                        ring-1
                        ring-[#112250]/10
                      "
                    >
                      {user?.photo ? (
                        <img
                          src={user.photo}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitial()
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[#112250]">
                        {user?.fullname || "User"}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[#718096]">
                        {user?.email || "-"}
                      </p>

                      <div
                        className="
                          mt-2
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-[#DDE4EC]
                          bg-white
                          px-2
                          py-1
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3B507D]" />

                        <span className="text-[9px] font-bold text-[#3B507D]">
                          {getRoleName()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(getProfileUrl());
                    }}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-[12px]
                      font-semibold
                      text-[#697F93]
                      transition-all
                      duration-200
                      hover:bg-[#F4F7FA]
                      hover:text-[#112250]
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#F5F7FA]
                        text-[#718096]
                        transition
                        group-hover:bg-white
                        group-hover:text-[#3B507D]
                      "
                    >
                      <User size={16} strokeWidth={1.8} />
                    </span>

                    Profil Saya
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(getSettingsUrl());
                    }}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-[12px]
                      font-semibold
                      text-[#697F93]
                      transition-all
                      duration-200
                      hover:bg-[#F4F7FA]
                      hover:text-[#112250]
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#F5F7FA]
                        text-[#718096]
                        transition
                        group-hover:bg-white
                        group-hover:text-[#3B507D]
                      "
                    >
                      <Settings size={16} strokeWidth={1.8} />
                    </span>

                    Pengaturan
                  </button>
                </div>

                <div className="border-t border-[#EAEFF4] p-2">
                  <button
                    onClick={handleLogout}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-[12px]
                      font-semibold
                      text-[#B45353]
                      transition-all
                      duration-200
                      hover:bg-[#FEF5F5]
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#FEF5F5]
                        text-[#B45353]
                        transition
                        group-hover:bg-white
                      "
                    >
                      <LogOut size={16} strokeWidth={1.8} />
                    </span>

                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

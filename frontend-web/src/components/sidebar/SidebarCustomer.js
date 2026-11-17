"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  LayoutDashboard,
  Search,
  Ticket,
  Heart,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Bell,
  Star,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

function getStoredUserId() {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("user");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const id = parsed?.id || parsed?.user_id || parsed?.userId;
      if (id) return Number(id);
    } catch {
      // abaikan
    }
  }

  const token = getToken();
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(json);

    const id =
      payload?.id ||
      payload?.user_id ||
      payload?.userId ||
      payload?.sub;

    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

function getSeenKey(kind, userId) {
  return `tv_seen_${kind}_${userId || "guest"}`;
}

function getSeenCount(kind, userId) {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(getSeenKey(kind, userId));
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function setSeenCount(kind, userId, value) {
  if (typeof window === "undefined") return;
  const safe = Math.max(0, Number(value) || 0);
  localStorage.setItem(getSeenKey(kind, userId), String(safe));
}

export default function SidebarCustomer({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState({
    fullname: "Customer",
    email: "-",
    photo: null,
  });

  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistSeen, setWishlistSeen] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const menus = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Cari Event", href: "/cari-acara", icon: Search },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      badgeKey: "wishlist",
    },
    { label: "Pesanan Saya", href: "/orders", icon: Receipt },
    { label: "Tiket Saya", href: "/tickets", icon: Ticket },
    {
      label: "Notifikasi",
      href: "/notifications",
      icon: Bell,
      badgeKey: "notification",
    },
    { label: "Profil", href: "/profile", icon: User },
  ];

  const fetchUserProfile = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        const token = getToken();

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
          signal,
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.clear();
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        const profile =
          result.user ||
          result.data?.user ||
          result.data?.profile ||
          result.profile ||
          result.data ||
          result;

        if (!profile || typeof profile !== "object") return;

        const fullname =
          profile.fullname ||
          profile.fullName ||
          profile.namaLengkap ||
          profile.nama_lengkap ||
          profile.name ||
          profile.nama ||
          "Customer";

        const email = profile.email || "-";

        const photo =
          profile.photo ||
          profile.profilePhoto ||
          profile.foto ||
          profile.fotoProfil ||
          profile.foto_profil ||
          null;

        setUser({ fullname, email, photo });
      } catch (error) {
        if (error.name === "AbortError") return;
        console.log("Profile fetch skipped or failed:", error.message);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [router]
  );

  const fetchWishlistCount = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWishlistCount(0);
      return;
    }

    const userId = getStoredUserId();
    if (!userId) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/wishlist/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setWishlistCount(0);
        return;
      }

      const data = await response.json();

      const list = Array.isArray(data?.wishlist)
        ? data.wishlist
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setWishlistCount(list.length);

      const createdRecently = list.filter((item) => {
        if (!item?.created_at) return false;
        const created = new Date(
          String(item.created_at).replace(" ", "T")
        );
        if (Number.isNaN(created.getTime())) return false;
        return Date.now() - created.getTime() < 24 * 60 * 60 * 1000;
      });

      setNotificationCount(createdRecently.length);
    } catch (error) {
      console.log("Wishlist count skipped or failed:", error.message);
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchUserProfile(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchUserProfile]);

  useEffect(() => {
    const userId = getStoredUserId();
    setWishlistSeen(getSeenCount("wishlist", userId));
    fetchWishlistCount();
  }, [fetchWishlistCount, pathname]);

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) return;

    if (pathname === "/wishlist" || pathname.startsWith("/wishlist/")) {
      setSeenCount("wishlist", userId, wishlistCount);
      setWishlistSeen(wishlistCount);
    }
  }, [pathname, wishlistCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    router.replace("/login");
  };

  const toggleSidebar = () => {
    setCollapsed((previous) => !previous);
  };

  const isMenuActive = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getInitial = () => {
    if (!user.fullname) return "C";
    return user.fullname.trim().charAt(0).toUpperCase();
  };

  const getPhotoUrl = () => {
    if (!user.photo) return null;

    if (
      user.photo.startsWith("http://") ||
      user.photo.startsWith("https://")
    ) {
      return user.photo;
    }

    const baseHost = API_URL.replace(/\/api$/i, "");
    return `${baseHost}/${user.photo.replace(/^\/+/, "")}`;
  };

  const getBadgeValue = (menu) => {
    if (menu.badgeKey === "wishlist") {
      return Math.max(0, wishlistCount - wishlistSeen);
    }
    if (menu.badgeKey === "notification") {
      return notificationCount;
    }
    return 0;
  };

  const formatBadge = (value) => {
    if (value > 99) return "99+";
    return String(value);
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex flex-col
        border-r border-[#495B7D]/40
        bg-gradient-to-b
        from-[#02122F] via-[#23354D] to-[#02122F]
        shadow-[8px_0_30px_rgba(2,18,47,0.4)]
        transition-[width] duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      <div
        className={`
          flex h-[82px] shrink-0 items-center
          border-b border-[#495B7D]/30
          ${collapsed ? "justify-center px-2" : "px-5"}
        `}
      >
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md">
            <Image
              src="/images/logo.png"
              alt="TicketVerse"
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="whitespace-nowrap text-[17px] font-semibold text-[#F0ECDD]">
                Ticket<span className="text-[#8BA3C5]">Verse</span>
              </h1>

              <p className="mt-0.5 flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.16em] text-[#8BA3C5]/70">
                <User size={10} />
                Customer
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-5 [scrollbar-width:thin] [scrollbar-color:#495B7D_transparent]">
        {!collapsed && (
          <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8BA3C5]/60">
            Menu Utama
          </p>
        )}

        <nav className="space-y-1">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = isMenuActive(menu.href);
            const badgeValue = getBadgeValue(menu);
            const showBadge = badgeValue > 0;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                title={collapsed ? menu.label : undefined}
                className={`
                  group relative flex w-full items-center
                  rounded-xl transition-all duration-200
                  ${
                    collapsed
                      ? "justify-center px-3 py-3"
                      : "gap-3 px-3 py-2.5"
                  }
                  ${
                    isActive
                      ? "bg-[#495B7D]/40 text-[#F0ECDD] shadow-[inset_0_0_0_1px_rgba(139,163,197,0.3)]"
                      : "text-[#8BA3C5]/80 hover:bg-[#495B7D]/20 hover:text-[#F0ECDD]"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#F0ECDD] to-[#8BA3C5]" />
                )}

                <span className="relative shrink-0">
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className={`
                      transition-colors
                      ${
                        isActive
                          ? "text-[#F0ECDD]"
                          : "text-[#8BA3C5]/60 group-hover:text-[#F0ECDD]"
                      }
                    `}
                  />

                  {showBadge && collapsed && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F0ECDD] px-1 text-[8px] font-bold text-[#02122F] shadow-md">
                      {formatBadge(badgeValue)}
                    </span>
                  )}
                </span>

                {!collapsed && (
                  <span className="min-w-0 whitespace-nowrap text-[12px] font-medium">
                    {menu.label}
                  </span>
                )}

                {showBadge && !collapsed && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F0ECDD] px-1.5 text-[10px] font-bold text-[#02122F] shadow-[0_0_10px_rgba(240,236,221,0.5)]">
                    {formatBadge(badgeValue)}
                  </span>
                )}

                {isActive && !collapsed && !showBadge && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#F0ECDD] shadow-[0_0_8px_rgba(240,236,221,0.7)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="relative mt-7 overflow-hidden rounded-2xl border border-[#495B7D]/40 bg-gradient-to-br from-[#23354D]/80 via-[#495B7D]/30 to-[#02122F]/60 p-4 shadow-[0_0_30px_rgba(139,163,197,0.05)]">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#8BA3C5]/20 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-[#F0ECDD] text-[#F0ECDD]" />

                <span className="text-xs font-bold text-[#F0ECDD]">
                  TicketVerse Member
                </span>
              </div>

              <p className="mt-1.5 text-[10px] leading-relaxed text-[#8BA3C5]/80">
                Nikmati pengalaman konser terbaikmu bersama TicketVerse.
              </p>

              <div className="mt-3">
                <span className="rounded-full border border-[#8BA3C5]/30 bg-[#495B7D]/40 px-2.5 py-1 text-[8px] font-semibold text-[#F0ECDD]">
                  CUSTOMER
                </span>
              </div>
            </div>
          </div>
        )}


        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Keluar" : undefined}
          className={`
            group mt-2 flex w-full items-center
            rounded-xl text-[#8BA3C5]/60
            transition-all hover:bg-[#495B7D]/30
            hover:text-[#F0ECDD]
            ${collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"}
          `}
        >
          <LogOut size={18} strokeWidth={1.7} />

          {!collapsed && (
            <span className="text-[12px] font-medium">Keluar</span>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
        className="
          absolute -right-[13px] top-[94px] z-[60]
          flex h-7 w-7 items-center justify-center
          rounded-full border border-[#8BA3C5]/50
          bg-gradient-to-r from-[#495B7D] to-[#8BA3C5]
          text-[#F0ECDD] shadow-lg
          shadow-[#02122F]/40
          transition-all hover:scale-105
        "
      >
        {collapsed ? (
          <ChevronRight size={15} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={15} strokeWidth={2.5} />
        )}
      </button>
    </aside>
  );
}

"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

export default function SidebarCustomer({
  collapsed,
  setCollapsed,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState({
    fullname: "Customer",
    email: "customer@ticketverse.com",
  });

  const menus = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Cari Event",
      href: "/cari-acara",
      icon: Search,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: "Pesanan Saya",
      href: "/orders",
      icon: Receipt,
    },
    {
      label: "Tiket Saya",
      href: "/tickets",
      icon: Ticket,
    },
    {
      label: "Notifikasi",
      href: "/notifications",
      icon: Bell,
    },
    {
      label: "Profil",
      href: "/profile",
      icon: User,
    },
  ];

  // Ambil data customer
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return;

      const parsedUser = JSON.parse(storedUser);

      setUser({
        fullname:
          parsedUser.fullname ||
          parsedUser.name ||
          "Customer",

        email:
          parsedUser.email ||
          "customer@ticketverse.com",
      });
    } catch (error) {
      console.error("Gagal membaca data user:", error);
    }
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    router.push("/login");
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setCollapsed((previous) => !previous);
  };

  // Active menu
  const isMenuActive = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
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
        ${
          collapsed
            ? "w-[72px]"
            : "w-[260px]"
        }
      `}
    >
      {/* LOGO */}
      <div
        className={`
          flex h-[82px] shrink-0 items-center
          border-b border-[#495B7D]/30
          ${
            collapsed
              ? "justify-center px-2"
              : "px-5"
          }
        `}
      >
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3"
        >
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
                Ticket
                <span className="text-[#8BA3C5]">
                  Verse
                </span>
              </h1>

              <p className="mt-0.5 flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.16em] text-[#8BA3C5]/70">
                <User size={10} />
                Customer
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* SIDEBAR CONTENT */}
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-5 [scrollbar-width:thin] [scrollbar-color:#495B7D_transparent]">

        {/* MENU TITLE */}
        {!collapsed && (
          <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8BA3C5]/60">
            Menu Utama
          </p>
        )}

        {/* MENU LIST */}
        <nav className="space-y-1">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = isMenuActive(menu.href);

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

                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={`
                    shrink-0 transition-colors
                    ${
                      isActive
                        ? "text-[#F0ECDD]"
                        : "text-[#8BA3C5]/60 group-hover:text-[#F0ECDD]"
                    }
                  `}
                />

                {!collapsed && (
                  <span className="min-w-0 whitespace-nowrap text-[12px] font-medium">
                    {menu.label}
                  </span>
                )}

                {isActive && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#F0ECDD] shadow-[0_0_8px_rgba(240,236,221,0.7)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* MEMBER CARD */}
        {!collapsed && (
          <div className="relative mt-7 overflow-hidden rounded-2xl border border-[#495B7D]/40 bg-gradient-to-br from-[#23354D]/80 via-[#495B7D]/30 to-[#02122F]/60 p-4 shadow-[0_0_30px_rgba(139,163,197,0.05)]">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#8BA3C5]/20 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <Star
                  size={16}
                  className="fill-[#F0ECDD] text-[#F0ECDD]"
                />

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

        {/* ACCOUNT */}
        {!collapsed && (
          <p className="mb-2 mt-6 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8BA3C5]/60">
            Akun
          </p>
        )}

        <div
          title={collapsed ? user.fullname : undefined}
          className={`
            flex items-center rounded-xl
            border border-[#495B7D]/40
            bg-[#23354D]/40 backdrop-blur-sm
            ${
              collapsed
                ? "justify-center p-2"
                : "gap-3 px-3 py-2.5"
            }
          `}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#8BA3C5]/40 bg-gradient-to-br from-[#495B7D] to-[#8BA3C5] text-[#F0ECDD] shadow-md">
            <User size={19} strokeWidth={1.5} />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-[#F0ECDD]">
                {user.fullname}
              </p>

              <p className="truncate text-[10px] text-[#8BA3C5]/70">
                {user.email}
              </p>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Keluar" : undefined}
          className={`
            group mt-2 flex w-full items-center
            rounded-xl text-[#8BA3C5]/60
            transition-all hover:bg-[#495B7D]/30
            hover:text-[#F0ECDD]
            ${
              collapsed
                ? "justify-center p-3"
                : "gap-3 px-3 py-2.5"
            }
          `}
        >
          <LogOut size={18} strokeWidth={1.7} />

          {!collapsed && (
            <span className="text-[12px] font-medium">
              Keluar
            </span>
          )}
        </button>
      </div>

      {/* COLLAPSE BUTTON */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={
          collapsed
            ? "Buka sidebar"
            : "Tutup sidebar"
        }
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

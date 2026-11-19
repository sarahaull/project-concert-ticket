
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import NextImage from "next/image";

import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Ticket,
  Armchair,
  Users,
  ScanLine,
  Banknote,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

// ======================================================
// SIDEBAR CONFIGURATION
// ======================================================

const DEFAULT_WIDTH = 264;
const MIN_WIDTH = 76;
const MAX_WIDTH = 320;
const STORAGE_KEY = "ticketverse-organizer-sidebar-width";

const MENU_SECTIONS = [
  {
    title: "Menu Utama",
    items: [
      {
        label: "Dashboard",
        href: "/organizer",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Event Saya",
    items: [
      {
        label: "Daftar Event",
        href: "/organizer/event",
        icon: FolderOpen,
      },
      
    ],
  },
  {
    title: "Pesanan Tiket",
    items: [
      {
        label: "Data Pengunjung",
        href: "/organizer/peserta",
        icon: Users,
      },
      {
        label: "Check-in Pengunjung",
        href: "/organizer/check-in",
        icon: ScanLine,
      },
    ],
  },
  {
    title: "Keuangan",
    items: [
      {
        label: "Pendapatan",
        href: "/organizer/keuangan/pendapatan",
        icon: Banknote,
      },
    ],
  },
  {
    title: "Lainnya",
    items: [
      {
        label: "Laporan Penjualan",
        href: "/organizer/laporan",
        icon: BarChart3,
      },
      {
        label: "Profil Organizer",
        href: "/organizer/profile",
        icon: UserCircle,
      },
      {
        label: "Pengaturan",
        href: "/organizer/pengaturan",
        icon: Settings,
      },
    ],
  },
];

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function SidebarOrganizer() {
  const pathname = usePathname();
  const router = useRouter();

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const widthRef = useRef(DEFAULT_WIDTH);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  const isCollapsed = width <= 100;

  // ======================================================
  // WIDTH MANAGEMENT
  // ======================================================

  const updateWidth = (newWidth, save = true) => {
    const safeWidth = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, Math.round(newWidth))
    );

    widthRef.current = safeWidth;
    setWidth(safeWidth);

    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${safeWidth}px`
    );

    if (save) {
      localStorage.setItem(STORAGE_KEY, String(safeWidth));
    }
  };

  // ======================================================
  // INITIALIZE SIDEBAR WIDTH
  // ======================================================

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let initial = DEFAULT_WIDTH;

    if (saved) {
      const parsed = Number(saved);

      if (
        !Number.isNaN(parsed) &&
        parsed >= MIN_WIDTH &&
        parsed <= MAX_WIDTH
      ) {
        initial = parsed;
      }
    }

    widthRef.current = initial;
    setWidth(initial);

    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${initial}px`
    );
  }, []);

  // ======================================================
  // SIDEBAR RESIZE
  // ======================================================

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;

      const delta = e.clientX - startXRef.current;

      updateWidth(startWidthRef.current + delta, false);
    };

    const handleMouseUp = () => {
      if (!draggingRef.current) return;

      draggingRef.current = false;
      setIsDragging(false);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (widthRef.current < 150) {
        updateWidth(MIN_WIDTH);
      } else if (widthRef.current < 230) {
        updateWidth(220);
      } else {
        updateWidth(DEFAULT_WIDTH);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;

    e.preventDefault();

    draggingRef.current = true;
    setIsDragging(true);

    startXRef.current = e.clientX;
    startWidthRef.current = widthRef.current;

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    setTooltip(null);
  };

  // ======================================================
  // COLLAPSE SIDEBAR
  // ======================================================

  const toggleSidebar = () => {
    setTooltip(null);

    updateWidth(
      isCollapsed ? DEFAULT_WIDTH : MIN_WIDTH
    );
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.clear();

    router.push("/login");
  };

  // ======================================================
  // TOOLTIP
  // ======================================================

  const showTooltip = (e, label) => {
    if (!isCollapsed) return;

    const rect = e.currentTarget.getBoundingClientRect();

    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 14,
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  // ======================================================
  // ACTIVE MENU
  // ======================================================

  const isMenuActive = (href) => {
    if (href === "/organizer") {
      return pathname === "/organizer";
    }

    return (
      pathname === href ||
      pathname.startsWith(href + "/")
    );
  };

  // ======================================================
  // MENU ITEM
  // ======================================================

  const MenuItem = ({ menu }) => {
    const Icon = menu.icon;
    const isActive = isMenuActive(menu.href);

    return (
      <Link
        href={menu.href}
        onMouseEnter={(e) => showTooltip(e, menu.label)}
        onMouseLeave={hideTooltip}
        className={`
          group relative flex w-full items-center rounded-xl
          ${
            isCollapsed
              ? "justify-center px-3 py-3"
              : "gap-3 px-3 py-2.5"
          }
          ${
            isActive
              ? "bg-blue-500/20 text-white shadow-[inset_0_0_0_1px_rgba(96,165,250,0.25)]"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }
          ${
            isDragging
              ? ""
              : "transition-all duration-200"
          }
        `}
      >
        {isActive && (
          <span className="
            absolute left-0 top-1/2
            h-6 w-[3px]
            -translate-y-1/2
            rounded-r-full
            bg-blue-400
          " />
        )}

        <span className="
          flex h-5 w-5 shrink-0
          items-center justify-center
        ">
          <Icon
            size={18}
            strokeWidth={isActive ? 2.1 : 1.7}
            className={
              isActive
                ? "text-blue-300"
                : "text-slate-400 group-hover:text-blue-300"
            }
          />
        </span>

        {!isCollapsed && (
          <span className="
            min-w-0 whitespace-nowrap
            text-[13px] font-medium tracking-tight
          ">
            {menu.label}
          </span>
        )}

        {isActive && !isCollapsed && (
          <span className="
            ml-auto h-1.5 w-1.5 shrink-0
            rounded-full bg-blue-400
          " />
        )}
      </Link>
    );
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-[100]
          h-screen overflow-visible
          border-r border-white/10
          bg-gradient-to-b
          from-[#0B1220]
          via-[#0F1B2E]
          to-[#132744]
          text-white
          shadow-[8px_0_30px_rgba(2,8,20,0.35)]
          ${
            isDragging
              ? ""
              : "transition-[width] duration-200 ease-out"
          }
        `}
        style={{ width: `${width}px` }}
      >
        {/* ==================================================
            HEADER / LOGO
        ================================================== */}

        <div
          className={`
            flex h-[78px] items-center
            border-b border-white/10
            ${
              isCollapsed
                ? "justify-center px-2"
                : "px-5"
            }
          `}
        >
          {isCollapsed ? (
            <div className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              overflow-hidden rounded-xl
              bg-white/5 ring-1 ring-white/10
            ">
              <NextImage
                src="/images/logo.png"
                alt="Ticket Verse"
                width={40}
                height={40}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                overflow-hidden rounded-xl
                bg-white/5 ring-1 ring-white/10
              ">
                <NextImage
                  src="/images/logo.png"
                  alt="Ticket Verse"
                  width={40}
                  height={40}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <h1 className="
                  whitespace-nowrap
                  text-[17px] font-semibold
                  tracking-tight text-white
                ">
                  Ticket<span className="text-blue-400">Verse</span>
                </h1>

                <p className="
                  mt-0.5 flex items-center gap-1.5
                  whitespace-nowrap
                  text-[9px] font-medium uppercase
                  tracking-[0.16em] text-slate-400
                ">
                  <Crown
                    size={12}
                    strokeWidth={1.8}
                    className="text-blue-400"
                  />
                  Organizer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================
            NAVIGATION MENU
        ================================================== */}

        <div className="
          h-[calc(100vh-78px)]
          overflow-y-auto
          px-3 pb-28 pt-4
          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:w-0
          [&::-webkit-scrollbar]:h-0
        ">
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <div
              key={`section-${section.title}`}
              className="mb-5"
            >
              {!isCollapsed && (
                <p className="
                  mb-2 px-2
                  text-[10px] font-semibold
                  uppercase tracking-[0.16em]
                  text-slate-500
                ">
                  {section.title}
                </p>
              )}

              <nav className="space-y-1">
                {section.items.map((menu) => (
                  <MenuItem
                    key={`${section.title}-${menu.label}`}
                    menu={menu}
                  />
                ))}
              </nav>

              {sectionIndex < MENU_SECTIONS.length - 1 && (
                <div className="mt-5 h-px bg-white/5" />
              )}
            </div>
          ))}

          {/* ==================================================
              LOGOUT
          ================================================== */}

          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={(e) => showTooltip(e, "Logout")}
            onMouseLeave={hideTooltip}
            className={`
              group mt-2 flex w-full
              items-center rounded-xl
              text-slate-400
              hover:bg-red-500/10
              hover:text-red-300
              ${
                isCollapsed
                  ? "justify-center p-3"
                  : "gap-3 px-3 py-2.5"
              }
              ${
                isDragging
                  ? ""
                  : "transition-all duration-200"
              }
            `}
          >
            <LogOut size={18} strokeWidth={1.7} />

            {!isCollapsed && (
              <span className="text-[13px] font-medium">
                Logout
              </span>
            )}
          </button>
        </div>

        {/* ==================================================
            COLLAPSE BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={toggleSidebar}
          className="
            absolute -right-[13px] top-[86px]
            z-[200]
            flex h-7 w-7
            items-center justify-center
            rounded-full
            border border-white/20
            bg-[#0F1B2E]
            text-blue-300
            shadow-lg shadow-black/30
            transition-all duration-200
            hover:scale-105
            hover:bg-[#132744]
            hover:text-white
          "
          title={
            isCollapsed
              ? "Buka sidebar"
              : "Sembunyikan sidebar"
          }
        >
          {isCollapsed ? (
            <ChevronRight size={15} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={15} strokeWidth={2.5} />
          )}
        </button>

        {/* ==================================================
            RESIZE HANDLE
        ================================================== */}

        <div
          onMouseDown={handleMouseDown}
          className="
            absolute right-0 top-0
            z-[150] h-full w-[7px]
            cursor-ew-resize
            bg-transparent
            hover:bg-blue-400/30
          "
          title="Geser untuk mengubah ukuran sidebar"
        />
      </aside>

      {/* ==================================================
          COLLAPSED TOOLTIP
      ================================================== */}

      {tooltip && isCollapsed && (
        <div
          className="
            pointer-events-none fixed
            z-[9999] -translate-y-1/2
            whitespace-nowrap
          "
          style={{
            top: tooltip.top,
            left: tooltip.left,
          }}
        >
          <div className="
            relative rounded-lg
            border border-white/10
            bg-[#0F1B2E]
            px-3 py-2
            text-[12px] font-medium text-white
            shadow-[0_10px_30px_rgba(2,8,20,0.45)]
          ">
            <span className="
              absolute -left-1 top-1/2
              h-2 w-2
              -translate-y-1/2 rotate-45
              border-l border-b border-white/10
              bg-[#0F1B2E]
            " />

            {tooltip.label}
          </div>
        </div>
      )}
    </>
  );
}

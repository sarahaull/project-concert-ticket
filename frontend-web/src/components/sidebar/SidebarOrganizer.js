"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

import NextImage from "next/image";

import {
  Gauge,
  CalendarDays,
  PlusCircle,
  FolderOpen,
  FileText,
  Tags,
  Ticket,
  ShoppingCart,
  TicketCheck,
  CreditCard,
  Users,
  ScanLine,
  Megaphone,
  TicketPercent,
  KeyRound,
  Wallet,
  Banknote,
  BarChart3,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

// ============================================================
// CONSTANT
// ============================================================

const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 72;
const MAX_WIDTH = 320;

const STORAGE_KEY =
  "ticketverse-organizer-sidebar-width";

// ============================================================
// COMPONENT
// ============================================================

export default function SidebarOrganizer() {
  const pathname = usePathname();
  const router = useRouter();

  // ==========================================================
  // SIDEBAR WIDTH
  // ==========================================================

  const [width, setWidth] =
    useState(DEFAULT_WIDTH);

  const [isDragging, setIsDragging] =
    useState(false);

  const widthRef =
    useRef(DEFAULT_WIDTH);

  const draggingRef =
    useRef(false);

  const startXRef =
    useRef(0);

  const startWidthRef =
    useRef(DEFAULT_WIDTH);

  const isCollapsed = width <= 100;

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  const [openMenus, setOpenMenus] =
    useState({});

  // ==========================================================
  // TOOLTIP
  // ==========================================================

  const [tooltip, setTooltip] =
    useState(null);

  // ==========================================================
  // UPDATE WIDTH
  // ==========================================================

  const updateWidth = (
    newWidth,
    save = true
  ) => {
    const safeWidth = Math.min(
      MAX_WIDTH,
      Math.max(
        MIN_WIDTH,
        Math.round(newWidth)
      )
    );

    widthRef.current =
      safeWidth;

    setWidth(safeWidth);

    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${safeWidth}px`
    );

    if (save) {
      localStorage.setItem(
        STORAGE_KEY,
        String(safeWidth)
      );
    }
  };

  // ==========================================================
  // LOAD SAVED WIDTH
  // ==========================================================

  useEffect(() => {
    const savedWidth =
      localStorage.getItem(
        STORAGE_KEY
      );

    let initialWidth =
      DEFAULT_WIDTH;

    if (savedWidth) {
      const parsedWidth =
        Number(savedWidth);

      if (
        !Number.isNaN(parsedWidth) &&
        parsedWidth >= MIN_WIDTH &&
        parsedWidth <= MAX_WIDTH
      ) {
        initialWidth =
          parsedWidth;
      }
    }

    widthRef.current =
      initialWidth;

    setWidth(initialWidth);

    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${initialWidth}px`
    );
  }, []);

  // ==========================================================
  // MENU STRUCTURE
  // ==========================================================

  const menuSections = [
    // ========================================================
    // MENU UTAMA
    // ========================================================

    {
      title: "Menu Utama",
      items: [
        {
          label: "Dashboard",
          href: "/organizer",
          icon: Gauge,
        },
      ],
    },

    // ========================================================
    // EVENT
    // ========================================================

    {
      title: "Event",
      items: [
        {
          label: "Event",
          icon: CalendarDays,

          children: [
            {
              label: "Semua Event",
              href: "/organizer/event",
              icon: FolderOpen,
            },
            {
              label: "Buat Event",
              href: "/organizer/event/tambah",
              icon: PlusCircle,
            },
            
          ],
        },
      ],
    },

    // ========================================================
    // TIKET
    // ========================================================

    {
      title: "Tiket",
      items: [
        {
          label: "Tiket",
          icon: Ticket,

          children: [
            {
              label: "Kategori Tiket",
              href: "/organizer/manajemen-event/kategori-tiket",
              icon: Tags,
            },
            {
              label: "Tiket Terjual",
              href: "/organizer/penjualan/tiket-terjual",
              icon: TicketCheck,
            },
          ],
        },
      ],
    },

    // ========================================================
    // PESANAN
    // ========================================================

    {
      title: "Pesanan",
      items: [
        {
          label: "Pesanan",
          icon: ShoppingCart,

          children: [
            {
              label: "Semua Pesanan",
              href: "/organizer/penjualan",
              icon: ShoppingCart,
            },
            {
              label: "Pembayaran",
              href: "/organizer/penjualan/pembayaran",
              icon: CreditCard,
            },
          ],
        },
      ],
    },

    // ========================================================
    // PESERTA
    // ========================================================

    {
      title: "Peserta",
      items: [
        {
          label: "Peserta",
          icon: Users,

          children: [
            {
              label: "Daftar Peserta",
              href: "/organizer/peserta",
              icon: Users,
            },
            {
              label: "Check-in",
              href: "/organizer/peserta/check-in",
              icon: ScanLine,
            },
          ],
        },
      ],
    },

    // ========================================================
    // PROMOSI
    // ========================================================

    {
      title: "Promosi",
      items: [
        {
          label: "Promosi",
          icon: Megaphone,

          children: [
            {
              label: "Voucher",
              href: "/organizer/promosi/voucher",
              icon: TicketPercent,
            },
            {
              label: "Kode Promo",
              href: "/organizer/promosi/kode-promo",
              icon: KeyRound,
            },
          ],
        },
      ],
    },

    // ========================================================
    // KEUANGAN
    // ========================================================

    {
      title: "Keuangan",
      items: [
        {
          label: "Keuangan",
          icon: Wallet,

          children: [
            {
              label: "Pendapatan",
              href: "/organizer/keuangan/pendapatan",
              icon: Banknote,
            },
            {
              label: "Pencairan Dana",
              href: "/organizer/keuangan/pencairan",
              icon: Wallet,
            },
          ],
        },
      ],
    },

    // ========================================================
    // LAPORAN
    // ========================================================

    {
      title: "Laporan",
      items: [
        {
          label: "Laporan",
          icon: BarChart3,

          href: "/organizer/laporan",
        },
      ],
    },
  ];

  // ==========================================================
  // AUTO OPEN DROPDOWN SESUAI PATH
  // ==========================================================

  useEffect(() => {
    const activeMenus = {};

    menuSections.forEach(
      (section) => {
        section.items.forEach(
          (menu) => {
            if (!menu.children)
              return;

            const hasActiveChild =
              menu.children.some(
                (child) =>
                  pathname ===
                    child.href ||
                  pathname.startsWith(
                    child.href + "/"
                  )
              );

            if (hasActiveChild) {
              activeMenus[
                menu.label
              ] = true;
            }
          }
        );
      }
    );

    setOpenMenus((prev) => ({
      ...prev,
      ...activeMenus,
    }));
  }, [pathname]);

  // ==========================================================
  // DRAG
  // ==========================================================

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current)
        return;

      const delta =
        e.clientX -
        startXRef.current;

      const newWidth =
        startWidthRef.current +
        delta;

      updateWidth(
        newWidth,
        false
      );
    };

    const handleMouseUp = () => {
      if (!draggingRef.current)
        return;

      draggingRef.current =
        false;

      setIsDragging(false);

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";

      // SNAP
      if (widthRef.current < 150) {
        updateWidth(72);
      } else if (
        widthRef.current < 230
      ) {
        updateWidth(220);
      } else {
        updateWidth(260);
      }
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };
  }, []);

  // ==========================================================
  // START DRAG
  // ==========================================================

  const handleMouseDown = (e) => {
    if (e.button !== 0)
      return;

    e.preventDefault();

    draggingRef.current =
      true;

    setIsDragging(true);

    startXRef.current =
      e.clientX;

    startWidthRef.current =
      widthRef.current;

    document.body.style.cursor =
      "ew-resize";

    document.body.style.userSelect =
      "none";

    setTooltip(null);
  };

  // ==========================================================
  // TOGGLE SIDEBAR
  // ==========================================================

  const toggleSidebar = () => {
    setTooltip(null);

    if (isCollapsed) {
      updateWidth(260);
    } else {
      updateWidth(72);
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    sessionStorage.clear();

    router.push("/login");
  };

  // ==========================================================
  // TOOLTIP
  // ==========================================================

  const showTooltip = (
    e,
    label
  ) => {
    if (!isCollapsed)
      return;

    const rect =
      e.currentTarget.getBoundingClientRect();

    setTooltip({
      label,
      top:
        rect.top +
        rect.height / 2,
      left:
        rect.right + 14,
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  // ==========================================================
  // TOGGLE DROPDOWN
  // ==========================================================

  const toggleMenu = (
    label
  ) => {
    if (isCollapsed) {
      updateWidth(260);
      return;
    }

    setOpenMenus((prev) => ({
      ...prev,
      [label]:
        !prev[label],
    }));
  };

  // ==========================================================
  // CHECK ACTIVE CHILD
  // ==========================================================

  const hasActiveChild = (
    menu
  ) => {
    if (!menu.children)
      return false;

    return menu.children.some(
      (child) =>
        pathname ===
          child.href ||
        pathname.startsWith(
          child.href + "/"
        )
    );
  };

  // ==========================================================
  // MENU ITEM
  // ==========================================================

  const MenuItem = ({
    menu,
  }) => {
    const Icon =
      menu.icon;

    // ========================================================
    // DROPDOWN MENU
    // ========================================================

    if (menu.children) {
      const activeChild =
        hasActiveChild(menu);

      const isOpen =
        openMenus[
          menu.label
        ] ||
        activeChild;

      return (
        <div className="w-full">
          {/* DROPDOWN HEADER */}

          <button
            type="button"
            onClick={() =>
              toggleMenu(
                menu.label
              )
            }
            onMouseEnter={(e) =>
              showTooltip(
                e,
                menu.label
              )
            }
            onMouseLeave={
              hideTooltip
            }
            className={`
              menu-item-premium
              menu-item-glitter
              group
              relative
              flex
              w-full
              items-center
              rounded-xl

              ${
                isCollapsed
                  ? "justify-center px-3 py-3"
                  : "gap-3 px-3 py-2.5"
              }

              ${
                activeChild
                  ? "bg-[#294A78]/30 text-white"
                  : "text-slate-300 hover:bg-[#294A78]/25 hover:text-white"
              }

              ${
                isDragging
                  ? ""
                  : "transition-all duration-200"
              }
            `}
          >
            {/* ACTIVE INDICATOR */}

            {activeChild && (
              <span
                className="
                  sidebar-active-indicator
                  absolute
                  left-0
                  top-1/2
                  h-6
                  w-[3px]
                  -translate-y-1/2
                  rounded-r-full
                  bg-[#8AB4F8]
                "
              />
            )}

            {/* ICON */}

            <span
              className="
                flex
                h-5
                w-5
                flex-shrink-0
                items-center
                justify-center
              "
            >
              <Icon
                size={18}
                strokeWidth={
                  activeChild
                    ? 2.1
                    : 1.7
                }
                className={`
                  ${
                    activeChild
                      ? "text-[#A9C7F7] sidebar-icon-glow"
                      : "text-[#8FA4C0] group-hover:text-[#A9C7F7]"
                  }
                `}
              />
            </span>

            {/* LABEL */}

            {!isCollapsed && (
              <>
                <span
                  className="
                    min-w-0
                    flex-1
                    whitespace-nowrap
                    text-left
                    text-[12px]
                    font-medium
                    tracking-[-0.01em]
                  "
                >
                  {menu.label}
                </span>

                {/* CHEVRON */}

                <ChevronRight
                  size={15}
                  strokeWidth={2}
                  className={`
                    flex-shrink-0
                    text-[#8198B8]
                    transition-transform
                    duration-200

                    ${
                      isOpen
                        ? "rotate-90"
                        : ""
                    }
                  `}
                />
              </>
            )}
          </button>

          {/* CHILDREN */}

          {!isCollapsed &&
            isOpen && (
              <div
                className="
                  ml-4
                  mt-1
                  space-y-1
                  border-l
                  border-[#5275A5]/20
                  pl-3
                  animate-[fadeIn_0.2s_ease-out]
                "
              >
                {menu.children.map(
                  (child) => {
                    const ChildIcon =
                      child.icon;

                    const childActive =
                      pathname ===
                        child.href ||
                      pathname.startsWith(
                        child.href +
                          "/"
                      );

                    return (
                      <Link
                        key={`${menu.label}-${child.href}`}
                        href={
                          child.href
                        }
                        onMouseEnter={(
                          e
                        ) =>
                          showTooltip(
                            e,
                            child.label
                          )
                        }
                        onMouseLeave={
                          hideTooltip
                        }
                        className={`
                          group
                          relative
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-lg
                          px-3
                          py-2

                          text-[11px]
                          font-medium

                          ${
                            childActive
                              ? "bg-[#294A78]/35 text-white"
                              : "text-[#9AAFC9] hover:bg-[#294A78]/20 hover:text-white"
                          }

                          ${
                            isDragging
                              ? ""
                              : "transition-all duration-200"
                          }
                        `}
                      >
                        {/* ICON */}

                        <span
                          className="
                            flex
                            h-4
                            w-4
                            flex-shrink-0
                            items-center
                            justify-center
                          "
                        >
                          <ChildIcon
                            size={15}
                            strokeWidth={
                              childActive
                                ? 1.9
                                : 1.7
                            }
                            className={`
                              ${
                                childActive
                                  ? "text-[#A9C7F7]"
                                  : "text-[#8FA4C0]"
                              }

                              group-hover:text-[#A9C7F7]
                            `}
                          />
                        </span>

                        {/* LABEL */}

                        <span className="whitespace-nowrap">
                          {
                            child.label
                          }
                        </span>

                        {/* ACTIVE DOT */}

                        {childActive && (
                          <span
                            className="
                              ml-auto
                              h-1.5
                              w-1.5
                              flex-shrink-0
                              rounded-full
                              bg-[#9FC1F4]
                              shadow-[0_0_8px_rgba(159,193,244,0.7)]
                            "
                          />
                        )}
                      </Link>
                    );
                  }
                )}
              </div>
            )}
        </div>
      );
    }

    // ========================================================
    // NORMAL MENU
    // ========================================================

    const isActive =
      pathname ===
        menu.href ||
      pathname.startsWith(
        menu.href + "/"
      );

    return (
      <Link
        href={menu.href}
        onMouseEnter={(e) =>
          showTooltip(
            e,
            menu.label
          )
        }
        onMouseLeave={
          hideTooltip
        }
        className={`
          menu-item-premium
          menu-item-glitter
          group
          relative
          flex
          w-full
          items-center
          rounded-xl

          ${
            isCollapsed
              ? "justify-center px-3 py-3"
              : "gap-3 px-3 py-2.5"
          }

          ${
            isActive
              ? "bg-[#294A78]/40 text-white shadow-[inset_0_0_0_1px_rgba(138,180,248,0.18)]"
              : "text-slate-300 hover:bg-[#294A78]/25 hover:text-white"
          }

          ${
            isDragging
              ? ""
              : "transition-all duration-200"
          }
        `}
      >
        {/* ACTIVE INDICATOR */}

        {isActive && (
          <span
            className="
              sidebar-active-indicator
              absolute
              left-0
              top-1/2
              h-6
              w-[3px]
              -translate-y-1/2
              rounded-r-full
              bg-[#8AB4F8]
            "
          />
        )}

        {/* ICON */}

        <span
          className="
            flex
            h-5
            w-5
            flex-shrink-0
            items-center
            justify-center
          "
        >
          <Icon
            size={18}
            strokeWidth={
              isActive
                ? 2.1
                : 1.7
            }
            className={`
              ${
                isActive
                  ? "text-[#A9C7F7] sidebar-icon-glow"
                  : "text-[#8FA4C0] group-hover:text-[#A9C7F7]"
              }

              ${
                isDragging
                  ? ""
                  : "transition-colors duration-200"
              }
            `}
          />
        </span>

        {/* LABEL */}

        {!isCollapsed && (
          <span
            className="
              min-w-0
              whitespace-nowrap
              text-[12px]
              font-medium
              tracking-[-0.01em]
            "
          >
            {menu.label}
          </span>
        )}

        {/* ACTIVE DOT */}

        {isActive &&
          !isCollapsed && (
            <span
              className="
                ml-auto
                h-1.5
                w-1.5
                flex-shrink-0
                rounded-full
                bg-[#9FC1F4]
                shadow-[0_0_8px_rgba(159,193,244,0.7)]
              "
            />
          )}
      </Link>
    );
  };

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <>
      <aside
        className={`
          fixed
          left-0
          top-0
          z-[100]
          h-screen
          overflow-visible

          border-r
          border-[#5275A5]/20

          bg-gradient-to-b
          from-[#091626]
          via-[#10233D]
          to-[#193556]

          text-white

          shadow-[8px_0_30px_rgba(7,18,35,0.30)]

          ${
            isDragging
              ? ""
              : "transition-[width] duration-200 ease-out"
          }
        `}
        style={{
          width: `${width}px`,
        }}
      >
        {/* ==================================================
            LOGO
        ================================================== */}

        <div
          className={`
            flex
            h-[82px]
            items-center
            border-b
            border-[#5275A5]/20

            ${
              isCollapsed
                ? "justify-center px-2"
                : "px-5"
            }
          `}
        >
          {isCollapsed ? (
            <div
              className="
                sidebar-logo-shimmer
                sidebar-logo-sparkle

                flex
                h-10
                w-10
                flex-shrink-0
                items-center
                justify-center

                overflow-hidden
                rounded-xl

                shadow-[0_4px_15px_rgba(5,15,30,0.35)]
              "
            >
              <NextImage
                src="/images/logo.png"
                alt="Ticket Verse"
                width={40}
                height={40}
                priority
                className="
                  h-full
                  w-full
                  object-contain
                "
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="
                  sidebar-logo-shimmer
                  sidebar-logo-sparkle

                  flex
                  h-10
                  w-10
                  flex-shrink-0
                  items-center
                  justify-center

                  overflow-hidden
                  rounded-xl

                  shadow-[0_4px_15px_rgba(5,15,30,0.35)]
                "
              >
                <NextImage
                  src="/images/logo.png"
                  alt="Ticket Verse"
                  width={40}
                  height={40}
                  priority
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                />
              </div>

              <div className="min-w-0">
                <h1
                  className="
                    whitespace-nowrap
                    text-[17px]
                    font-semibold
                    tracking-tight
                    text-white
                  "
                >
                  Ticket
                  <span className="sidebar-title-glow">
                    Verse
                  </span>
                </h1>

                <p
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1.5
                    whitespace-nowrap
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-[#9EB4D1]
                  "
                >
                  <Crown
                    size={12}
                    strokeWidth={1.8}
                    className="
                      text-[#8AB4F8]
                      sidebar-icon-glow
                    "
                  />

                  Organizer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div
          className="
            h-[calc(100vh-82px)]
            overflow-y-auto

            px-3
            pt-5
            pb-28

            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:w-0
            [&::-webkit-scrollbar]:h-0
          "
        >
          {menuSections.map(
            (
              section,
              sectionIndex
            ) => (
              <div
                key={`section-${section.title}`}
                className="mb-5"
              >
                {/* SECTION TITLE */}

                {!isCollapsed && (
                  <p
                    className="
                      mb-2
                      px-2

                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]

                      text-[#8198B8]
                    "
                  >
                    {section.title}
                  </p>
                )}

                {/* ITEMS */}

                <nav className="space-y-1">
                  {section.items.map(
                    (menu) => (
                      <MenuItem
                        key={`${section.title}-${menu.label}`}
                        menu={menu}
                      />
                    )
                  )}
                </nav>

                {/* DIVIDER */}

                {sectionIndex <
                  menuSections.length -
                    1 && (
                  <div
                    className="
                      sidebar-divider-glow
                      mt-5
                      h-px
                    "
                  />
                )}
              </div>
            )
          )}

          {/* ==================================================
              AKUN
          ================================================== */}

          {!isCollapsed && (
            <p
              className="
                mb-2
                px-2

                text-[9px]
                font-semibold
                uppercase
                tracking-[0.18em]

                text-[#8198B8]
              "
            >
              Akun
            </p>
          )}

          <div
            className={`
              flex
              items-center

              rounded-xl

              border
              border-[#5275A5]/20

              bg-[#17304E]/50

              ${
                isCollapsed
                  ? "justify-center p-2"
                  : "gap-3 px-3 py-2.5"
              }
            `}
          >
            <div
              className="
                flex
                h-9
                w-9
                flex-shrink-0
                items-center
                justify-center

                rounded-full

                border
                border-[#5275A5]/40

                bg-[#1C3A5C]

                text-[#B7CAE4]
              "
            >
              <UserCircle
                size={19}
                strokeWidth={1.5}
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[12px]
                    font-medium
                    text-slate-200
                  "
                >
                  Organizer
                </p>

                <p
                  className="
                    truncate
                    text-[10px]
                    text-[#8198B8]
                  "
                >
                  organizer@ticketverse.com
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              LOGOUT
          ================================================== */}

          <button
            onClick={handleLogout}
            onMouseEnter={(e) =>
              showTooltip(
                e,
                "Logout"
              )
            }
            onMouseLeave={
              hideTooltip
            }
            className={`
              group
              relative
              mt-2

              flex
              w-full
              items-center

              rounded-xl

              text-[#8FA4C0]

              ${
                isCollapsed
                  ? "justify-center p-3"
                  : "gap-3 px-3 py-2.5"
              }

              hover:bg-[#263F5F]/60
              hover:text-[#B8CBE5]

              ${
                isDragging
                  ? ""
                  : "transition-all duration-200"
              }
            `}
          >
            <LogOut
              size={18}
              strokeWidth={1.7}
            />

            {!isCollapsed && (
              <span
                className="
                  text-[12px]
                  font-medium
                "
              >
                Logout
              </span>
            )}
          </button>
        </div>

        {/* ==================================================
            TOGGLE
        ================================================== */}

        <button
          onClick={toggleSidebar}
          className="
            sidebar-toggle-glow

            absolute
            -right-[13px]
            top-[94px]
            z-[200]

            flex
            h-7
            w-7
            items-center
            justify-center

            rounded-full

            border
            border-[#B8CBE5]

            bg-white

            text-[#294A78]

            shadow-lg
            shadow-black/10

            transition-all
            duration-200

            hover:scale-105
            hover:text-[#183352]
          "
          title={
            isCollapsed
              ? "Buka sidebar"
              : "Sembunyikan sidebar"
          }
        >
          {isCollapsed ? (
            <ChevronRight
              size={15}
              strokeWidth={2.5}
            />
          ) : (
            <ChevronLeft
              size={15}
              strokeWidth={2.5}
            />
          )}
        </button>

        {/* ==================================================
            DRAG HANDLE
        ================================================== */}

        <div
          onMouseDown={
            handleMouseDown
          }
          className="
            absolute
            right-0
            top-0
            z-[150]

            h-full
            w-[7px]

            cursor-ew-resize

            bg-transparent

            hover:bg-[#6E9FE5]/30
          "
          title="Geser untuk mengubah ukuran sidebar"
        />
      </aside>

      {/* ====================================================
          TOOLTIP
      ==================================================== */}

      {tooltip &&
        isCollapsed && (
          <div
            className="
              pointer-events-none

              fixed
              z-[9999]

              -translate-y-1/2

              whitespace-nowrap
            "
            style={{
              top: tooltip.top,
              left: tooltip.left,
            }}
          >
            <div
              className="
                tooltip-glow

                relative

                rounded-lg

                border
                border-[#5275A5]/40

                bg-[#183352]

                px-3
                py-2

                text-[12px]
                font-medium
                text-white

                shadow-[0_10px_30px_rgba(7,15,30,0.35)]
              "
            >
              <span
                className="
                  absolute
                  -left-1
                  top-1/2

                  h-2
                  w-2

                  -translate-y-1/2
                  rotate-45

                  border-l
                  border-b
                  border-[#5275A5]/40

                  bg-[#183352]
                "
              />

              {tooltip.label}
            </div>
          </div>
        )}
    </>
  );
}
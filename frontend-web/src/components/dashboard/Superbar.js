// // components/dashboard/Sidebar.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   HomeIcon,
//   CalendarIcon,
//   UsersIcon,
//   TicketIcon,
//   CreditCardIcon,
//   ArrowsRightLeftIcon,
//   GiftIcon,
//   PhotoIcon,
//   MegaphoneIcon,
//   ChartBarIcon,
//   DocumentTextIcon,
//   CloudArrowDownIcon,
//   ShieldCheckIcon,
//   ClipboardDocumentListIcon,
//   Cog6ToothIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   XMarkIcon,
// } from '@heroicons/react/24/outline';

// // ============================================================
// // MENU CONFIGURATION - SUPER ADMIN
// // ============================================================
// const menuItems = [
//   {
//     section: 'MANAJEMEN',
//     items: [
//       { name: 'Events / Acara', icon: CalendarIcon, href: '/superadmin/events' },
//       { name: 'Organizers', icon: UsersIcon, href: '/superadmin/organizers' },
//       { name: 'Users', icon: UsersIcon, href: '/superadmin/users' },
//       { name: 'Tickets', icon: TicketIcon, href: '/superadmin/tickets' },
//       { name: 'Transactions', icon: CreditCardIcon, href: '/superadmin/transactions' },
//       { name: 'Refunds', icon: ArrowsRightLeftIcon, href: '/superadmin/refunds' },
//     ],
//   },
//   {
//     section: 'KONTEN & PROMO',
//     items: [
//       { name: 'Promo & Discount', icon: GiftIcon, href: '/superadmin/promos' },
//       { name: 'Banner', icon: PhotoIcon, href: '/superadmin/banners' },
//       { name: 'Announcements', icon: MegaphoneIcon, href: '/superadmin/announcements' },
//     ],
//   },
//   {
//     section: 'LAPORAN & ANALITIK',
//     items: [
//       { name: 'Analytics', icon: ChartBarIcon, href: '/superadmin/analytics' },
//       { name: 'Reports', icon: DocumentTextIcon, href: '/superadmin/reports' },
//       { name: 'Export Data', icon: CloudArrowDownIcon, href: '/superadmin/export' },
//     ],
//   },
//   {
//     section: 'SISTEM',
//     items: [
//       { name: 'Roles & Permissions', icon: ShieldCheckIcon, href: '/superadmin/roles' },
//       { name: 'System Logs', icon: ClipboardDocumentListIcon, href: '/superadmin/logs' },
//       { name: 'Settings', icon: Cog6ToothIcon, href: '/superadmin/settings' },
//     ],
//   },
// ];

// // ============================================================
// // SIDEBAR
// // ============================================================
// export default function Sidebar({
//   isOpen = true,
//   setIsOpen,
//   isMobile = false,
//   defaultCollapsed = false,
// }) {
//   const pathname = usePathname();
//   const [collapsed, setCollapsed] = useState(defaultCollapsed);

//   useEffect(() => {
//     if (!isMobile && setIsOpen) {
//       setIsOpen(true);
//     }
//   }, [isMobile, setIsOpen]);

//   const isActive = (href) => {
//     if (href === '/superadmin/dashboard') {
//       return pathname === href || pathname === '/superadmin';
//     }
//     return pathname?.startsWith(href);
//   };

//   const closeSidebar = () => {
//     if (isMobile && setIsOpen) {
//       setIsOpen(false);
//     }
//   };

//   const toggleCollapse = () => {
//     if (!isMobile) setCollapsed(!collapsed);
//   };

//   return (
//     <>
//       {/* Overlay untuk mobile */}
//       {isMobile && isOpen && (
//         <div
//           className="fixed inset-0 bg-[#112250]/50 backdrop-blur-sm z-40 transition-opacity duration-300"
//           onClick={closeSidebar}
//         />
//       )}

//       <aside
//         className={`
//           fixed top-0 left-0 h-full bg-[#F5F4F0] border-r border-[#BEB7A7]/30 
//           z-50 transition-all duration-300 shadow-xl overflow-hidden
//           ${isMobile
//             ? isOpen ? 'translate-x-0' : '-translate-x-full'
//             : collapsed ? 'w-20' : 'w-64'
//           }
//         `}
//       >
//         <div className="flex flex-col h-full">
//           {/* ==========================================================
//               LOGO
//               ========================================================== */}
//           <div
//             className={`
//               flex items-center h-16 px-4 border-b border-[#BEB7A7]/30 flex-shrink-0
//               ${collapsed && !isMobile ? 'justify-center' : ''}
//             `}
//           >
//             {!collapsed || isMobile ? (
//               <Link
//                 href="/superadmin/dashboard"
//                 className="flex items-center gap-2.5"
//                 onClick={closeSidebar}
//               >
//                 <div className="p-1.5 rounded-lg bg-[#3B507D]/10 border border-[#3B507D]/20">
//                   <TicketIcon className="w-5 h-5 text-[#3B507D]" />
//                 </div>
//                 <span className="text-lg font-light tracking-tight">
//                   <span className="text-[#112250]">Ticket</span>
//                   <span className="font-medium text-[#3B507D] ml-0.5">Verse</span>
//                 </span>
//                 <span className="ml-2 text-[8px] font-bold uppercase bg-[#3B507D]/10 text-[#3B507D] px-1.5 py-0.5 rounded border border-[#3B507D]/20">
//                   Super
//                 </span>
//               </Link>
//             ) : (
//               <Link href="/superadmin/dashboard" onClick={closeSidebar}>
//                 <div className="p-1.5 rounded-lg bg-[#3B507D]/10 border border-[#3B507D]/20">
//                   <TicketIcon className="w-5 h-5 text-[#3B507D]" />
//                 </div>
//               </Link>
//             )}

//             {/* Tombol close khusus mobile */}
//             {isMobile && isOpen && (
//               <button
//                 onClick={closeSidebar}
//                 className="ml-auto p-1.5 rounded-lg hover:bg-[#3B507D]/10 transition-colors duration-200"
//                 aria-label="Tutup menu"
//               >
//                 <XMarkIcon className="w-5 h-5 text-[#112250]" />
//               </button>
//             )}
//           </div>

//           {/* ==========================================================
//               NAVIGASI - dengan scroll yang benar
//               ========================================================== */}
//           <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
//             <div className="space-y-6">
//               {/* Dashboard */}
//               <Link
//                 href="/superadmin/dashboard"
//                 onClick={closeSidebar}
//                 className={`
//                   flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
//                   ${isActive('/superadmin/dashboard')
//                     ? 'bg-[#3B507D]/10 text-[#3B507D] font-medium'
//                     : 'text-[#112250]/60 hover:text-[#112250] hover:bg-[#3B507D]/5'
//                   }
//                   ${collapsed && !isMobile ? 'justify-center' : ''}
//                 `}
//               >
//                 <HomeIcon className="w-5 h-5 flex-shrink-0" />
//                 {(!collapsed || isMobile) && <span>Dashboard</span>}
//               </Link>

//               {/* Menu sections */}
//               {menuItems.map((section, idx) => (
//                 <div key={idx}>
//                   {(!collapsed || isMobile) && (
//                     <p className="text-[10px] font-semibold uppercase tracking-wider text-[#112250]/40 px-3 mb-2">
//                       {section.section}
//                     </p>
//                   )}
//                   <div className="space-y-0.5">
//                     {section.items.map((item, i) => (
//                       <Link
//                         key={i}
//                         href={item.href}
//                         onClick={closeSidebar}
//                         className={`
//                           flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm
//                           ${isActive(item.href)
//                             ? 'bg-[#3B507D]/10 text-[#3B507D] font-medium'
//                             : 'text-[#112250]/60 hover:text-[#112250] hover:bg-[#3B507D]/5'
//                           }
//                           ${collapsed && !isMobile ? 'justify-center' : ''}
//                           whitespace-nowrap
//                         `}
//                       >
//                         <item.icon className="w-5 h-5 flex-shrink-0" />
//                         {(!collapsed || isMobile) && <span>{item.name}</span>}
//                       </Link>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ==========================================================
//               FOOTER - Collapse toggle
//               ========================================================== */}
//           {!isMobile && (
//             <button
//               onClick={toggleCollapse}
//               className="flex items-center justify-center h-12 border-t border-[#BEB7A7]/30 text-[#112250]/40 hover:text-[#112250] transition-colors duration-200 flex-shrink-0"
//               aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
//             >
//               {collapsed ? (
//                 <ChevronRightIcon className="w-5 h-5" />
//               ) : (
//                 <ChevronLeftIcon className="w-5 h-5" />
//               )}
//             </button>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// }
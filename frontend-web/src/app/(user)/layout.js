
"use client";

import { useState, useEffect } from "react";
import SidebarCustomer from "../../components/sidebar/SidebarCustomer";
import Header from "../../components/Header";

export default function UserLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sidebarWidth = collapsed ? 72 : 260;

  // Membaca preferensi sidebar
  useEffect(() => {
    const saved = localStorage.getItem("customer-sidebar-collapsed");

    if (saved !== null) {
      setCollapsed(saved === "true");
    }

    setMounted(true);
  }, []);

  // Menyimpan preferensi sidebar
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      "customer-sidebar-collapsed",
      String(collapsed)
    );
  }, [collapsed, mounted]);

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#F0F4F8]">

      {/* SIDEBAR */}
      <SidebarCustomer
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN AREA */}
      <div
        className="relative min-h-screen min-w-0 bg-[#F0F4F8] transition-[margin-left] duration-300 ease-in-out"
        style={{
          marginLeft: `${sidebarWidth}px`,
        }}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-40 w-full">
          <Header />
        </div>

        {/* PAGE CONTENT */}
        <main className="w-full min-w-0 bg-[#F0F4F8] px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto min-h-[calc(100vh-140px)] w-full max-w-[1800px] min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

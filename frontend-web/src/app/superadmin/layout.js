// app/superadmin/layout.js
"use client";

import { useEffect, useState } from "react";
import SidebarSuperAdmin from "../../components/sidebar/SidebarSuperAdmin";
import Header from "../../components/Header";

export default function SuperAdminLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  // Update margin saat sidebar width berubah
  useEffect(() => {
    const updateWidth = () => {
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      const width = computed.getPropertyValue("--sidebar-width").trim();
      if (width) {
        const parsed = parseInt(width);
        if (!isNaN(parsed)) {
          setSidebarWidth(parsed);
        }
      }
    };

    updateWidth();

    // Observer untuk perubahan CSS variable
    const observer = new MutationObserver(updateWidth);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#e2e8ee]">
      {/* SIDEBAR */}
      <SidebarSuperAdmin />

      {/* AREA UTAMA */}
      <div
        className="min-h-screen w-auto transition-all duration-200 ease-out"
        style={{
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <main
          className="
            w-full
            min-w-0
            px-4
            py-5
            sm:px-6
            lg:px-8
            xl:px-10
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1800px]
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import SidebarOrganizer from "../../components/sidebar/SidebarOrganizer";
import Header from "../../components/Header";

export default function OrganizerLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  useEffect(() => {
    const updateWidth = () => {
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      const width = computed.getPropertyValue("--sidebar-width").trim();

      if (width) {
        const parsed = parseInt(width, 10);

        if (!Number.isNaN(parsed)) {
          setSidebarWidth(parsed);
        }
      }
    };

    // Ambil width sidebar saat pertama kali halaman dibuka
    updateWidth();

    // Pantau perubahan --sidebar-width dari SidebarOrganizer
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
      {/* SIDEBAR ORGANIZER */}
      <SidebarOrganizer />

      {/* AREA UTAMA */}
      <div
        className="
          min-h-screen
          min-w-0
          transition-[margin-left,width]
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
        "
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
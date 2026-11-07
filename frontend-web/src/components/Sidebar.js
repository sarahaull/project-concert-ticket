"use client";

import { useEffect, useState } from "react";

import SidebarSuperAdmin from "./sidebar/SidebarSuperAdmin";
import SidebarOrganizer from "./sidebar/SidebarOrganizer";
import SidebarCustomer from "./sidebar/SidebarCustomer";

export default function Sidebar({
  width,
  setWidth,
  collapsed,
  toggleSidebar,
}) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      setRole(user?.role || null);
    } catch (error) {
      console.error("Gagal membaca user:", error);
    }
  }, []);

  if (role === "super_admin") {
    return (
      <SidebarSuperAdmin
        width={width}
        setWidth={setWidth}
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
      />
    );
  }

  if (role === "event_organizer") {
    return <SidebarOrganizer />;
  }

  if (role === "customer") {
    return <SidebarCustomer />;
  }

  return null;
}
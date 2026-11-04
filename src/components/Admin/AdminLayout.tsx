import { useState } from "react";

import AdminHeader from "./AdminHeader";

import AdminSidebar, { AdminSection } from "./AdminSidebar";

import AdminContent from "./AdminContent";

interface AdminLayoutProps {
  initialSection?: AdminSection;
}

export default function AdminLayout({
  initialSection = "overview",
}: AdminLayoutProps) {
  const [activeSection, setActiveSection] =
    useState<AdminSection>(initialSection);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  function handleSectionChange(section: AdminSection) {
    setActiveSection(section);
  }

  /*
   * ============================================================
   * HEADER TITLE
   * ============================================================
   */

  const sectionTitles: Record<
    AdminSection,
    {
      title: string;
      subtitle: string;
    }
  > = {
    overview: {
      title: "Admin Dashboard",
      subtitle: "Restaurant Overview",
    },

    queue: {
      title: "Queue Management",
      subtitle: "Manage waiting customers",
    },

    tables: {
      title: "Table Management",
      subtitle: "Manage restaurant tables",
    },

    staff: {
      title: "Staff Management",
      subtitle: "Manage restaurant staff",
    },

    menu: {
      title: "Menu Management",
      subtitle: "Manage your restaurant menu",
    },

    orders: {
      title: "Order Management",
      subtitle: "Monitor restaurant orders",
    },
  };

  const header = sectionTitles[activeSection];

  return (
    <div
      className="
        flex
        min-h-screen
        bg-zinc-950
        text-white
      "
    >
      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ======================================================
          MAIN AREA
          ====================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
        "
      >
        {/* ====================================================
            HEADER
            ==================================================== */}

        <AdminHeader
          title={header.title}
          subtitle={header.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* ====================================================
            CONTENT
            ==================================================== */}

        <main
          className="
            flex-1
            overflow-x-hidden
            px-4
            py-6
            sm:px-6
            lg:px-8
            lg:py-8
          "
        >
          <AdminContent activeSection={activeSection} onSectionChange={handleSectionChange} />
        </main>
      </div>
    </div>
  );
}

import { AdminSection } from "./AdminSidebar";

import AdminOverview from "./AdminOverview";

import TableManagement from "../tables/TableManagement";
import StaffManagement from "../staff/StaffManagement";
import QueueManagement from "../queue/QueueManagement";
import MenuManagement from "../menu/MenuManagement";

interface AdminContentProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

export default function AdminContent({
  activeSection,
  onSectionChange,
}: AdminContentProps) {
  /*
   * ============================================================
   * OVERVIEW
   * ============================================================
   */

  if (activeSection === "overview") {
    return <AdminOverview onNavigate={onSectionChange} />;
  }

  /*
   * ============================================================
   * QUEUE
   * ============================================================
   */

  if (activeSection === "queue") {
    return <QueueManagement />;
  }

  /*
   * ============================================================
   * TABLES
   * ============================================================
   */

  if (activeSection === "tables") {
    return <TableManagement />;
  }

  /*
   * ============================================================
   * STAFF
   * ============================================================
   */

  if (activeSection === "staff") {
    return <StaffManagement />;
  }

  /*
   * ============================================================
   * MENU
   * ============================================================
   */

  if (activeSection === "menu") {
    return <MenuManagement />;
  }

  /*
   * ============================================================
   * ORDERS
   * ============================================================
   */

  if (activeSection === "orders") {
    return (
      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-8
          backdrop-blur-xl
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          Orders
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-white/50
          "
        >
          Order management will be added here.
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * FALLBACK
   * ============================================================
   */

  return null;
}

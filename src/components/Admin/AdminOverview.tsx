import { useEffect, useState } from "react";

import { motion } from "motion/react";

import {
  Users,
  Grid3X3,
  UserCog,
  UtensilsCrossed,
  Activity,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import { tableService } from "../../services/table.service";

import { staffService } from "../../services/staff.service";

import { TableResponse } from "../../types/table";

import { StaffResponse } from "../../types/staff";

interface AdminOverviewProps {
  onNavigate?: (
    section: "queue" | "tables" | "staff" | "menu" | "orders",
  ) => void;
}

interface StatCardProps {
  label: string;

  value: number;

  description: string;

  icon: typeof Users;

  gradient: string;

  onClick?: () => void;
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  gradient,
  onClick,
}: StatCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{
        y: -3,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className="
        group
        w-full
        rounded-2xl
        border
        border-white/10
        bg-white/5
        p-5
        text-left
        shadow-xl
        backdrop-blur-xl
        transition
        hover:border-white/20
        hover:bg-white/[0.08]
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">{label}</p>

          <p className="mt-2 text-3xl font-bold text-white">{value}</p>

          <p className="mt-1 text-xs text-white/30">{description}</p>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            ${gradient}
            shadow-lg
          `}
        >
          <Icon
            className="
              h-5
              w-5
              text-white
            "
          />
        </div>
      </div>
    </motion.button>
  );
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const [tables, setTables] = useState<TableResponse[]>([]);

  const [staff, setStaff] = useState<StaffResponse[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /*
   * ============================================================
   * LOAD OVERVIEW DATA
   * ============================================================
   *
   * There is no new overview backend endpoint.
   *
   * We use the existing authenticated services instead.
   */

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const [tableResult, staffResult] = await Promise.all([
          tableService.getAll(),
          staffService.getAll(),
        ]);

        setTables(tableResult);

        setStaff(staffResult);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load restaurant overview.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, []);

  /*
   * ============================================================
   * TABLE STATISTICS
   * ============================================================
   */

  const activeTables = tables.filter((table) => table.active);

  const availableTables = activeTables.filter(
    (table) => table.status === "available",
  );

  const occupiedTables = activeTables.filter(
    (table) => table.status === "occupied",
  );

  const cleaningTables = activeTables.filter(
    (table) => table.status === "cleaning",
  );

  const reservedTables = activeTables.filter(
    (table) => table.status === "reserved",
  );

  /*
   * ============================================================
   * STAFF STATISTICS
   * ============================================================
   */

  const activeStaff = staff.filter((member) => member.active);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className="
            h-8
            w-56
            animate-pulse
            rounded-lg
            bg-white/10
          "
        />

        <div
          className="
            grid
            gap-5
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="
                  h-32
                  animate-pulse
                  rounded-2xl
                  bg-white/5
                "
            />
          ))}
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6">
      {/* ======================================================
          TITLE
          ====================================================== */}

      <div>
        <h2 className="text-2xl font-bold text-white">Restaurant Overview</h2>

        <p className="mt-1 text-sm text-white/50">
          A quick look at your restaurant's current state.
        </p>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-300
          "
        >
          <AlertCircle
            className="
              h-5
              w-5
              shrink-0
            "
          />

          {error}
        </div>
      )}

      {/* ======================================================
          STAT CARDS
          ====================================================== */}

      <div
        className="
          grid
          gap-5
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          label="Total Tables"
          value={activeTables.length}
          description="Active restaurant tables"
          icon={Grid3X3}
          gradient="from-cyan-500 to-blue-600"
          onClick={() => onNavigate?.("tables")}
        />

        <StatCard
          label="Available"
          value={availableTables.length}
          description="Tables ready for customers"
          icon={CheckCircle2}
          gradient="from-emerald-500 to-green-600"
          onClick={() => onNavigate?.("tables")}
        />

        <StatCard
          label="Occupied"
          value={occupiedTables.length}
          description="Tables currently occupied"
          icon={Users}
          gradient="from-orange-500 to-pink-600"
          onClick={() => onNavigate?.("tables")}
        />

        <StatCard
          label="Active Staff"
          value={activeStaff.length}
          description="Currently active accounts"
          icon={UserCog}
          gradient="from-purple-500 to-pink-600"
          onClick={() => onNavigate?.("staff")}
        />
      </div>

      {/* ======================================================
          TABLE STATUS
          ====================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-6
          shadow-xl
          backdrop-blur-xl
        "
      >
        <div className="mb-5 flex items-center gap-3">
          <Activity
            className="
              h-5
              w-5
              text-cyan-400
            "
          />

          <div>
            <h3 className="font-bold text-white">Table Status</h3>

            <p className="text-xs text-white/40">
              Current state of active tables
            </p>
          </div>
        </div>

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <StatusItem
            label="Available"
            value={availableTables.length}
            icon={CheckCircle2}
            className="
              text-emerald-400
              bg-emerald-500/10
              border-emerald-500/20
            "
          />

          <StatusItem
            label="Reserved"
            value={reservedTables.length}
            icon={Clock3}
            className="
              text-amber-400
              bg-amber-500/10
              border-amber-500/20
            "
          />

          <StatusItem
            label="Occupied"
            value={occupiedTables.length}
            icon={Users}
            className="
              text-orange-400
              bg-orange-500/10
              border-orange-500/20
            "
          />

          <StatusItem
            label="Cleaning"
            value={cleaningTables.length}
            icon={UtensilsCrossed}
            className="
              text-blue-400
              bg-blue-500/10
              border-blue-500/20
            "
          />
        </div>
      </div>

      {/* ======================================================
          QUICK ACTIONS
          ====================================================== */}

      <div
        className="
          grid
          gap-5
          md:grid-cols-3
        "
      >
        <QuickAction
          title="Manage Tables"
          description="Add, edit or manage table status."
          icon={Grid3X3}
          gradient="from-cyan-500 to-blue-600"
          onClick={() => onNavigate?.("tables")}
        />

        <QuickAction
          title="Manage Staff"
          description="Manage staff roles and accounts."
          icon={UserCog}
          gradient="from-purple-500 to-pink-600"
          onClick={() => onNavigate?.("staff")}
        />

        <QuickAction
          title="Manage Menu"
          description="Update menu items and availability."
          icon={UtensilsCrossed}
          gradient="from-orange-500 to-pink-600"
          onClick={() => onNavigate?.("menu")}
        />
      </div>
    </div>
  );
}

/*
 * ============================================================
 * STATUS ITEM
 * ============================================================
 */

interface StatusItemProps {
  label: string;

  value: number;

  icon: typeof CheckCircle2;

  className: string;
}

function StatusItem({ label, value, icon: Icon, className }: StatusItemProps) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon
          className="
            h-5
            w-5
          "
        />

        <div>
          <p className="text-xs opacity-70">{label}</p>

          <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * QUICK ACTION
 * ============================================================
 */

interface QuickActionProps {
  title: string;

  description: string;

  icon: typeof Grid3X3;

  gradient: string;

  onClick: () => void;
}

function QuickAction({
  title,
  description,
  icon: Icon,
  gradient,
  onClick,
}: QuickActionProps) {
  return (
    <motion.button
      type="button"
      whileHover={{
        y: -3,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className="
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-white/10
        bg-white/5
        p-5
        text-left
        backdrop-blur-xl
        transition
        hover:border-white/20
        hover:bg-white/[0.08]
      "
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-gradient-to-br
          ${gradient}
        `}
      >
        <Icon
          className="
            h-5
            w-5
            text-white
          "
        />
      </div>

      <div>
        <p className="font-bold text-white">{title}</p>

        <p className="mt-1 text-xs text-white/40">{description}</p>
      </div>
    </motion.button>
  );
}

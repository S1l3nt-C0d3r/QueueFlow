import { useMemo } from "react";

import {
  Edit2,
  Trash2,
  Users,
  QrCode,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock3,
  Utensils,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import {
  TableResponse,
  TableStatus,
  UpdateTableStatusRequest,
} from "../../types/table";

import QRCodeCard from "./QRCodeCard";

interface TableCardProps {
  table: TableResponse;

  onEdit: (table: TableResponse) => void;

  onDelete: (id: string) => Promise<void>;

  onStatusChange: (
    id: string,
    request: UpdateTableStatusRequest,
  ) => Promise<void>;
}

/*
 * ============================================================
 * STATUS CONFIGURATION
 * ============================================================
 */

const STATUS_CONFIG: Record<
  TableStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  available: {
    label: "Available",
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },

  reserved: {
    label: "Reserved",
    icon: Clock3,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },

  occupied: {
    label: "Occupied",
    icon: Utensils,
    className: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  },

  cleaning: {
    label: "Cleaning",
    icon: Sparkles,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
};

/*
 * ============================================================
 * VALID STATUS TRANSITIONS
 * ============================================================
 *
 * These mirror the backend state machine.
 *
 * The backend remains the final authority and can still reject
 * a transition if the table state changed since the frontend
 * loaded it.
 */

const STATUS_TRANSITIONS: Record<TableStatus, TableStatus[]> = {
  available: ["reserved", "occupied"],

  reserved: ["occupied", "available"],

  occupied: ["cleaning"],

  cleaning: ["available"],
};

export default function TableCard({
  table,
  onEdit,
  onDelete,
  onStatusChange,
}: TableCardProps) {
  const status = STATUS_CONFIG[table.status];

  const StatusIcon = status.icon;

  /*
   * ============================================================
   * AVAILABLE STATUS OPTIONS
   * ============================================================
   */

  const statusOptions = useMemo(
    () =>
      [table.status, ...STATUS_TRANSITIONS[table.status]].filter(
        (value, index, array) => array.indexOf(value) === index,
      ),
    [table.status],
  );

  /*
   * ============================================================
   * STATUS CHANGE
   * ============================================================
   */

  async function handleStatusChange(newStatus: TableStatus) {
    if (newStatus === table.status) {
      return;
    }

    await onStatusChange(table.id, {
      status: newStatus,
    });
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -3,
      }}
      className="
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-gradient-to-br
        from-white/10
        to-white/5
        shadow-lg
        backdrop-blur-xl
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">
                Table {table.tableNumber}
              </h3>

              {!table.active && (
                <span
                  className="
                    rounded-full
                    border
                    border-zinc-500/30
                    bg-zinc-500/10
                    px-2
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-zinc-400
                  "
                >
                  Inactive
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
              <Users className="h-4 w-4" />

              <span>Capacity: {table.capacity}</span>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 gap-1">
            <motion.button
              type="button"
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() => onEdit(table)}
              className="
                rounded-lg
                p-2
                text-blue-400
                transition
                hover:bg-blue-500/10
              "
              title="Edit table"
            >
              <Edit2 className="h-4 w-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() => onDelete(table.id)}
              disabled={!table.active}
              className="
                rounded-lg
                p-2
                text-red-400
                transition
                hover:bg-red-500/10
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
              title="Deactivate table"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ======================================================
          STATUS
          ====================================================== */}

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Status
          </span>

          <div
            className={`
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              px-3
              py-1.5
              text-xs
              font-bold
              ${status.className}
            `}
          >
            <StatusIcon className="h-3.5 w-3.5" />

            {status.label}
          </div>
        </div>

        <select
          value={table.status}
          disabled={!table.active}
          onChange={(event) =>
            void handleStatusChange(event.target.value as TableStatus)
          }
          className="
            w-full
            rounded-lg
            border
            border-white/10
            bg-zinc-900/80
            px-3
            py-2.5
            text-sm
            font-semibold
            text-white
            outline-none
            transition
            focus:border-orange-500/40
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {STATUS_CONFIG[option].label}
            </option>
          ))}
        </select>

        {/* ====================================================
            ACTIVE STATE
            ==================================================== */}

        <div className="mt-4 flex items-center gap-2">
          {table.active ? (
            <>
              <Eye className="h-4 w-4 text-emerald-400" />

              <span className="text-xs text-white/50">Table is active</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-zinc-500" />

              <span className="text-xs text-white/40">Table is inactive</span>
            </>
          )}
        </div>
      </div>

      {/* ======================================================
          QR CODE
          ====================================================== */}

      {table.active && (
        <div className="border-t border-white/10 p-5">
          <div className="mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-orange-400" />

            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Customer QR
            </span>
          </div>

          <QRCodeCard table={table} />
        </div>
      )}
    </motion.div>
  );
}

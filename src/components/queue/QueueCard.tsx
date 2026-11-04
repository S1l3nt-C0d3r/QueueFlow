import { motion } from "motion/react";

import {
  Users,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  XCircle,
  MapPin,
} from "lucide-react";

import { cn } from "../../lib/utils";

import { QueueCardProps } from "./types";

export default function QueueCard({
  entry,
  onCall,
  onSeat,
  onCancel,
}: QueueCardProps) {
  /*
   * ============================================================
   * STATUS CONFIGURATION
   * ============================================================
   *
   * These are the queue statuses supported by the current
   * backend.
   *
   * WAITING
   * CALLED
   * SEATED
   * CANCELLED
   */

  const statusConfig = {
    WAITING: {
      label: "Waiting",
      className: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    },

    CALLED: {
      label: "Called",
      className: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    },

    SEATED: {
      label: "Seated",
      className: "bg-green-500/10 text-green-300 border-green-500/30",
    },

    CANCELLED: {
      label: "Cancelled",
      className: "bg-red-500/10 text-red-300 border-red-500/30",
    },
  };

  const status = statusConfig[entry.status];

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
        y: -4,
      }}
      className="
        rounded-2xl
        border
        border-white/15
        bg-gradient-to-br
        from-white/10
        to-white/5
        p-6
        backdrop-blur-xl
        shadow-lg
        transition-all
        hover:border-blue-500/30
        hover:shadow-blue-500/20
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold text-white">
            {entry.customerName}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <Phone className="h-4 w-4 shrink-0" />

            <span>{entry.customerPhone || "No phone number"}</span>
          </div>
        </div>

        <div
          className={cn(
            "shrink-0 rounded-lg border px-3 py-1 text-xs font-bold",
            status.className,
          )}
        >
          {status.label}
        </div>
      </div>

      {/* ======================================================
          DETAILS
          ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* PARTY SIZE */}

        <div className="rounded-xl bg-white/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-white/50">
            <Users className="h-4 w-4" />

            <span>Party Size</span>
          </div>

          <p className="text-lg font-bold text-white">{entry.partySize}</p>
        </div>

        {/* QUEUE POSITION */}

        <div className="rounded-xl bg-white/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-white/50">
            <Clock className="h-4 w-4" />

            <span>Queue Position</span>
          </div>

          <p className="text-lg font-bold text-white">
            {entry.position ?? "--"}
          </p>
        </div>
      </div>

      {/* ======================================================
          TABLE
          ====================================================== */}

      {entry.tableId && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/60">
          <MapPin className="h-4 w-4 text-white/40" />

          <span>Table assigned</span>
        </div>
      )}

      {/* ======================================================
          NOTES
          ====================================================== */}

      {entry.notes && (
        <div className="mt-4 rounded-xl bg-white/5 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
            Notes
          </p>

          <p className="text-sm text-white/70">{entry.notes}</p>
        </div>
      )}

      {/* ======================================================
          ACTIONS
          ====================================================== */}

      <div className="mt-6 flex flex-wrap gap-3">
        {/* ====================================================
            WAITING
            ==================================================== */}

        {entry.status === "WAITING" && (
          <>
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => onCall(entry)}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-green-600
                px-4
                py-2
                font-semibold
                text-white
                transition-colors
                hover:bg-green-700
              "
            >
              <UserCheck className="h-4 w-4" />
              Call Customer
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => onCancel(entry)}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-orange-500/10
                px-4
                py-2
                font-semibold
                text-orange-300
                transition-colors
                hover:bg-orange-500/20
              "
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </motion.button>
          </>
        )}

        {/* ====================================================
            CALLED
            ==================================================== */}

        {entry.status === "CALLED" && (
          <>
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => onSeat(entry)}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-green-500
                px-4
                py-2
                font-semibold
                text-white
                transition-colors
                hover:bg-green-600
              "
            >
              <UserCheck className="h-4 w-4" />
              Seat Customer
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => onCancel(entry)}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-red-500/10
                px-4
                py-2
                font-semibold
                text-red-300
                transition-colors
                hover:bg-red-500/20
              "
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </motion.button>
          </>
        )}

        {/* ====================================================
            SEATED
            ==================================================== */}

        {entry.status === "SEATED" && (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-green-500/10
              px-4
              py-2
              text-green-300
            "
          >
            <CheckCircle2 className="h-4 w-4" />
            Customer Seated
          </div>
        )}

        {/* ====================================================
            CANCELLED
            ==================================================== */}

        {entry.status === "CANCELLED" && (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-red-500/10
              px-4
              py-2
              text-red-300
            "
          >
            <AlertTriangle className="h-4 w-4" />
            Cancelled Entry
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { motion } from "motion/react";
import {
  Edit2,
  Trash2,
  Users,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

import { cn } from "../../lib/utils";

import { QueueCardProps } from "./types";

export default function QueueCard({
  entry,
  onEdit,
  onDelete,
  onCall,
  onSeat,
  onCancel,
  onNoShow,
}: QueueCardProps) {
  const statusConfig = {
    WAITING: {
      label: "Waiting",
      className:
        "bg-blue-500/10 text-blue-300 border-blue-500/30",
    },
    CALLED: {
      label: "Called",
      className:
        "bg-amber-500/10 text-amber-300 border-amber-500/30",
    },
    SEATED: {
      label: "Seated",
      className:
        "bg-green-500/10 text-green-300 border-green-500/30",
    },
    CANCELLED: {
      label: "Cancelled",
      className:
        "bg-red-500/10 text-red-300 border-red-500/30",
    },
    NO_SHOW: {
      label: "No Show",
      className:
        "bg-red-500/10 text-red-300 border-red-500/30",
    },
  };

  const status = statusConfig[entry.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl shadow-lg transition-all hover:border-blue-500/30 hover:shadow-blue-500/20"
    >
      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-xl font-bold text-white">
            {entry.customerName}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <Phone className="h-4 w-4" />
            {entry.customerPhone}
          </div>

        </div>

        <div
          className={cn(
            "rounded-lg border px-3 py-1 text-xs font-bold",
            status.className
          )}
        >
          {status.label}
        </div>

      </div>

      {/* Details */}

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="rounded-xl bg-white/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-white/50">
            <Users className="h-4 w-4" />
            Party Size
          </div>

          <p className="text-lg font-bold text-white">
            {entry.partySize}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-white/50">
            <Clock className="h-4 w-4" />
            Wait Time
          </div>

          <p className="text-lg font-bold text-white">
            {entry.estimatedWaitTime ?? "--"} min
          </p>
        </div>

      </div>

      {entry.notes && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-sm text-white/70">
            {entry.notes}
          </p>
        </div>
      )}

      {/* Actions */}

      <div className="mt-6 flex flex-wrap gap-3">

        {entry.status === "WAITING" && (
  <>
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onCall(entry)}
      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
    >
      <UserCheck className="h-4 w-4" />
      Call
    </motion.button>

    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onEdit(entry)}
      className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 font-semibold text-blue-300 hover:bg-blue-500/20"
    >
      <Edit2 className="h-4 w-4" />
      Edit
    </motion.button>

    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onCancel(entry)}
      className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-4 py-2 font-semibold text-orange-300 hover:bg-orange-500/20"
    >
      Cancel
    </motion.button>

    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onDelete(entry.id)}
      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 font-semibold text-red-300 hover:bg-red-500/20"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </motion.button>
  </>
)}

        {entry.status === "CALLED" && (
  <>
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSeat(entry)}
      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
    >
      <UserCheck className="h-4 w-4" />
      Seat Customer
    </motion.button>

    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onNoShow(entry)}
      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 font-semibold text-red-300 hover:bg-red-500/20"
    >
      No Show
    </motion.button>
  </>
)}

        {entry.status === "SEATED" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            Customer Seated
          </div>
        )}

        {(entry.status === "NO_SHOW" ||
          entry.status === "CANCELLED") && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            Closed Entry
          </div>
        )}

      </div>

    </motion.div>
  );
}
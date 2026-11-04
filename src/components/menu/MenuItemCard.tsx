import { motion } from "motion/react";
import {
  Edit2,
  Trash2,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { cn } from "../../lib/utils";

import { MenuItemCardProps } from "./types";

export default function MenuItemCard({
  item,
  onEdit,
  onDelete,
}: MenuItemCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-lg transition-all hover:border-orange-500/30 hover:shadow-orange-500/20"
    >
      <div className="p-6">
        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-white">
              {item.name}
            </h3>

            <div className="mt-2 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-orange-400" />

              <span className="text-lg font-bold text-orange-400">
                {item.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="ml-3 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(item)}
              className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
            >
              <Edit2 className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(item.id)}
              className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* ======================================================
            DESCRIPTION
            ====================================================== */}

        {item.description && (
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {item.description}
          </p>
        )}

        {/* ======================================================
            STATUS
            ====================================================== */}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {/* ACTIVE */}

          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold",
              item.active
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
            )}
          >
            {item.active ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                Active
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Retired
              </>
            )}
          </div>

          {/* AVAILABLE */}

          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold",
              item.available
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300",
            )}
          >
            {item.available ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Available
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Unavailable
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

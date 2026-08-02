import { motion } from "motion/react";
import {
  Edit2,
  Trash2,
  PoundSterling,
  Tag,
  CheckCircle2,
  XCircle,
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

        {/* Header */}

        <div className="flex items-start justify-between">

          <div>

            <h3 className="text-lg font-bold text-white">
              {item.name}
            </h3>

            <div className="mt-2 flex items-center gap-2">

              <PoundSterling className="h-4 w-4 text-orange-400" />

              <span className="text-lg font-bold text-orange-400">
                {item.price.toFixed(2)}
              </span>

            </div>

          </div>

          <div className="flex gap-2">

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(item)}
              className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
            >
              <Edit2 className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(item.id)}
              className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>

          </div>

        </div>

        {/* Description */}

        {item.description && (
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {item.description}
          </p>
        )}

        {/* Footer */}

        <div className="mt-6 flex items-center justify-between">

          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold",
              "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
            )}
          >
            <Tag className="h-3.5 w-3.5" />

            {item.category}
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold",
              item.available
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
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
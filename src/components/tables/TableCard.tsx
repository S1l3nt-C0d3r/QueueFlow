import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Trash2,
  Users,
  Table2,
} from "lucide-react";

import { cn } from "../../lib/utils";

import QRCodeCard from "./QRCodeCard";
import { TableCardProps } from "./types";

export default function TableCard({
  table,
  onUpdate,
  onDelete,
}: TableCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusStyles = () => {
    switch (table.status) {
      case "AVAILABLE":
        return {
          badge:
            "bg-gradient-to-r from-green-500 to-emerald-600",
          border:
            "border-green-500/30",
          text:
            "text-green-300",
        };

      case "ACTIVE":
        return {
          badge:
            "bg-gradient-to-r from-red-500 to-pink-600",
          border:
            "border-red-500/30",
          text:
            "text-red-300",
        };

      case "BILLING":
        return {
          badge:
            "bg-gradient-to-r from-yellow-500 to-orange-600",
          border:
            "border-yellow-500/30",
          text:
            "text-yellow-300",
        };

      case "OUT_OF_SERVICE":
        return {
          badge:
            "bg-gradient-to-r from-slate-500 to-gray-700",
          border:
            "border-gray-500/30",
          text:
            "text-gray-300",
        };

      default:
        return {
          badge:
            "bg-gradient-to-r from-green-500 to-emerald-600",
          border:
            "border-green-500/30",
          text:
            "text-green-300",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-2xl border-2 backdrop-blur-xl shadow-lg",
        styles.border,
        "bg-white/5"
      )}
    >
      {/* Header */}

      <motion.button
        layout
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Table2 className="h-7 w-7 text-white" />
            </div>

            <div>

              <h3 className="text-xl font-bold text-white">
                Table {table.tableNumber}
              </h3>

              <div className="flex items-center gap-2 mt-1">

                <Users className="h-4 w-4 text-white/50" />

                <span className="text-white/60 text-sm">
                  Capacity: {table.capacity}
                </span>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <span
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg",
                styles.badge
              )}
            >
              {table.status.replaceAll("_", " ")}
            </span>

            <motion.div
              animate={{
                rotate: expanded ? 180 : 0,
              }}
            >
              <ChevronDown className="h-5 w-5 text-white/60" />
            </motion.div>

          </div>

        </div>
      </motion.button>

      {/* Expanded Section */}

      <AnimatePresence>

        {expanded && (

          <motion.div
            layout
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="border-t border-white/10"
          >
            <div className="space-y-6 p-6">

              {/* Status */}

              <div>

                <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                  Table Status
                </label>

                <select
                  value={table.status}
                  onChange={(e) =>
                    onUpdate(table.id, {
                      status: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-500/50"
                >
                  <option value="AVAILABLE">
                    AVAILABLE
                  </option>

                  <option value="ACTIVE">
                    ACTIVE
                  </option>

                  <option value="BILLING">
                    BILLING
                  </option>

                  <option value="OUT_OF_SERVICE">
                    OUT OF SERVICE
                  </option>

                </select>

              </div>

              {/* QR */}

              <QRCodeCard
                table={table}
              />

              {/* Delete */}

              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  onDelete(table.id)
                }
                className="w-full rounded-lg border border-red-500/30 bg-gradient-to-r from-red-500/20 to-pink-500/20 px-4 py-3 text-red-400 font-bold flex items-center justify-center gap-2 hover:from-red-500/30 hover:to-pink-500/30"
              >
                <Trash2 className="h-5 w-5" />

                Delete Table

              </motion.button>

            </div>
          </motion.div>

        )}

      </AnimatePresence>

    </motion.div>
  );
}
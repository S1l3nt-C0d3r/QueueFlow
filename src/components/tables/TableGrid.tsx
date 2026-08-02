import { AnimatePresence } from "motion/react";
import { Table2 } from "lucide-react";
import { motion } from "motion/react";

import TableCard from "./TableCard";
import { TableGridProps } from "./types";

export default function TableGrid({
  tables,
  onUpdate,
  onDelete,
}: TableGridProps) {
  if (tables.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center"
      >
        <Table2 className="h-12 w-12 text-white/20 mx-auto mb-3" />

        <p className="text-white/50">
          No tables created yet.
        </p>

        <p className="text-white/30 text-sm mt-2">
          Click <span className="font-semibold">"Add Table"</span> to
          create your restaurant layout.
        </p>
      </motion.div>
    );
  }

  const sortedTables = [...tables].sort(
    (a, b) => a.tableNumber - b.tableNumber
  );

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sortedTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
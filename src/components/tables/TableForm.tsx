import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Grid3X3, Save } from "lucide-react";

import { TableFormProps } from "./types";

export default function TableForm({
  loading,
  onSubmit,
  onCancel,
}: TableFormProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);

    if (!tableNumber.trim()) {
      setError("Table number is required.");
      return;
    }

    if (!capacity.trim()) {
      setError("Capacity is required.");
      return;
    }

    const parsedTable = Number(tableNumber);
    const parsedCapacity = Number(capacity);

    if (parsedTable <= 0) {
      setError("Table number must be greater than zero.");
      return;
    }

    if (parsedCapacity <= 0) {
      setError("Capacity must be greater than zero.");
      return;
    }

    try {
      await onSubmit({
        tableNumber: parsedTable,
        capacity: parsedCapacity,
      });

      setTableNumber("");
      setCapacity("");
    } catch (err: any) {
      setError(err.message ?? "Unable to create table.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Grid3X3 className="h-6 w-6 text-cyan-400" />

        <h3 className="text-xl font-bold text-white">
          Create New Table
        </h3>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/80">
              Table Number
            </label>

            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-500/50"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/80">
              Capacity
            </label>

            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-500/50"
              placeholder="4"
            />
          </div>

        </div>

        <div className="flex gap-3">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg disabled:opacity-50"
          >
            {loading ? (
              "Creating..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="h-5 w-5" />
                Create Table
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 py-3 font-bold text-white hover:bg-white/10"
          >
            Cancel
          </motion.button>

        </div>

      </form>
    </motion.div>
  );
}
import { FormEvent, useEffect, useState } from "react";

import { motion } from "motion/react";

import { Grid3X3, Save } from "lucide-react";

import { TableFormProps } from "./types";

export default function TableForm({
  loading,
  editingTable,
  onSubmit,
  onCancel,
}: TableFormProps) {
  /*
   * ============================================================
   * FORM STATE
   * ============================================================
   */

  const [tableNumber, setTableNumber] = useState("");

  const [capacity, setCapacity] = useState("");

  const [error, setError] = useState<string | null>(null);

  /*
   * ============================================================
   * LOAD EDITING TABLE
   * ============================================================
   */

  useEffect(() => {
    if (!editingTable) {
      setTableNumber("");
      setCapacity("");
      setError(null);

      return;
    }

    setTableNumber(editingTable.tableNumber);

    setCapacity(String(editingTable.capacity));

    setError(null);
  }, [editingTable]);

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    /*
     * TABLE NUMBER
     */

    const normalizedTableNumber = tableNumber.trim();

    if (!normalizedTableNumber) {
      setError("Table number is required.");

      return;
    }

    /*
     * CAPACITY
     */

    const parsedCapacity = Number(capacity);

    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      setError("Capacity must be a positive whole number.");

      return;
    }

    try {
      /*
       * CREATE
       */

      if (!editingTable) {
        await onSubmit({
          tableNumber: normalizedTableNumber,

          capacity: parsedCapacity,
        });
      } else {

      /*
       * UPDATE
       */
        await onSubmit({
          tableNumber: normalizedTableNumber,

          capacity: parsedCapacity,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save table.");
    }
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -20,
      }}
      className="
        rounded-2xl
        border
        border-cyan-500/30
        bg-gradient-to-br
        from-cyan-500/10
        to-blue-500/10
        p-8
        shadow-2xl
        backdrop-blur-xl
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <Grid3X3
          className="
            h-6
            w-6
            text-cyan-400
          "
        />

        <div>
          <h3 className="text-xl font-bold text-white">
            {editingTable ? "Edit Table" : "Create New Table"}
          </h3>

          <p className="mt-1 text-sm text-white/40">
            {editingTable
              ? "Update the table configuration."
              : "Add a new table to your restaurant."}
          </p>
        </div>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div
          className="
            mb-5
            rounded-lg
            border
            border-red-500/30
            bg-red-500/10
            p-3
            text-sm
            text-red-300
          "
        >
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
          ====================================================== */}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >
          {/* ==================================================
              TABLE NUMBER
              ================================================== */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Table Number
            </label>

            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 1, A1, VIP-1"
              disabled={loading}
              required
              autoComplete="off"
              className="
                w-full
                rounded-lg
                border
                border-white/10
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-white/25
                focus:border-cyan-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />

            <p className="mt-2 text-xs text-white/30">
              Table numbers can contain letters or numbers.
            </p>
          </div>

          {/* ==================================================
              CAPACITY
              ================================================== */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Capacity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 4"
              disabled={loading}
              required
              className="
                w-full
                rounded-lg
                border
                border-white/10
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-white/25
                focus:border-cyan-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>
        </div>

        {/* ======================================================
            EDIT INFORMATION
            ====================================================== */}

        {editingTable && (
          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-4
            "
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Current Status
            </p>

            <p className="mt-2 text-sm font-semibold capitalize text-white">
              {editingTable.status}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-white/40">
              Table status is managed separately from table configuration. Use
              the status control on the table card to change its operational
              state.
            </p>
          </div>
        )}

        {/* ======================================================
            ACTIONS
            ====================================================== */}

        <div className="flex gap-3">
          {/* SAVE */}

          <motion.button
            type="submit"
            whileHover={{
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            disabled={loading}
            className="
              flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              py-3
              font-bold
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Save className="h-5 w-5" />

            {loading
              ? "Saving..."
              : editingTable
                ? "Update Table"
                : "Create Table"}
          </motion.button>

          {/* CANCEL */}

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex-1
              rounded-lg
              border
              border-white/10
              bg-white/5
              py-3
              font-semibold
              text-white
              transition
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

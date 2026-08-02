import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Save, Users } from "lucide-react";

import {
  CreateQueueRequest,
} from "../../types/queue";

import { QueueFormProps } from "./types";

const DEFAULT_FORM: CreateQueueRequest = {
  customerName: "",
  customerPhone: "",
  partySize: 2,
  estimatedWaitTime: 15,
  notes: "",
};

export default function QueueForm({
  loading,
  editingEntry,
  onSubmit,
  onCancel,
}: QueueFormProps) {
  const [form, setForm] =
    useState<CreateQueueRequest>(DEFAULT_FORM);

  useEffect(() => {
    if (!editingEntry) {
      setForm(DEFAULT_FORM);
      return;
    }

    setForm({
      customerName: editingEntry.customerName,
      customerPhone: editingEntry.customerPhone,
      partySize: editingEntry.partySize,
      estimatedWaitTime:
        editingEntry.estimatedWaitTime ?? 15,
      notes: editingEntry.notes ?? "",
    });
  }, [editingEntry]);

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    await onSubmit(form);

    if (!editingEntry) {
      setForm(DEFAULT_FORM);
    }
  }

  function update<
    K extends keyof CreateQueueRequest
  >(
    key: K,
    value: CreateQueueRequest[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-8 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-400" />

        <h3 className="text-xl font-bold text-white">
          {editingEntry
            ? "Edit Queue Entry"
            : "Add Customer"}
        </h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Customer Name
            </label>

            <input
              value={form.customerName}
              onChange={(e) =>
                update(
                  "customerName",
                  e.target.value
                )
              }
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Phone Number
            </label>

            <input
              value={form.customerPhone}
              onChange={(e) =>
                update(
                  "customerPhone",
                  e.target.value
                )
              }
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500/40"
            />
          </div>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Party Size
            </label>

            <input
              type="number"
              min={1}
              value={form.partySize}
              onChange={(e) =>
                update(
                  "partySize",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Estimated Wait (minutes)
            </label>

            <input
              type="number"
              min={0}
              value={form.estimatedWaitTime}
              onChange={(e) =>
                update(
                  "estimatedWaitTime",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500/40"
            />
          </div>

        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-white/70">
            Notes
          </label>

          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) =>
              update("notes", e.target.value)
            }
            className="w-full resize-none rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500/40"
          />
        </div>

        <div className="flex gap-3">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 py-3 font-bold text-white"
          >
            <span className="flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />

              {editingEntry
                ? "Update Entry"
                : "Add Customer"}
            </span>
          </motion.button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 py-3 font-semibold text-white"
          >
            Cancel
          </button>

        </div>

      </form>
    </motion.div>
  );
}
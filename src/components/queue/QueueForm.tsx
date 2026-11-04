import { FormEvent, useState } from "react";

import { motion } from "motion/react";

import { Save, Users } from "lucide-react";

import { CreateQueueRequest } from "../../types/queue";

import { QueueFormProps } from "./types";

/*
 * ============================================================
 * DEFAULT FORM
 * ============================================================
 *
 * The current backend accepts:
 *
 * - customerName
 * - phone
 * - partySize
 * - notes
 *
 * The frontend continues to use customerPhone because that is
 * the existing frontend naming convention.
 *
 * estimatedWaitTime has intentionally been removed.
 */

const DEFAULT_FORM: CreateQueueRequest = {
  customerName: "",

  customerPhone: "",

  partySize: 2,

  notes: "",
};

export default function QueueForm({
  loading,

  onSubmit,

  onCancel,
}: QueueFormProps) {
  /*
   * ==========================================================
   * FORM STATE
   * ==========================================================
   */

  const [form, setForm] = useState<CreateQueueRequest>(DEFAULT_FORM);

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    /*
     * The backend handles:
     *
     * - token number
     * - queue status
     * - queue position
     *
     * We only submit the customer information.
     */

    await onSubmit(form);

    /*
     * Reset the form after a successful
     * submission.
     *
     * QueueManagement closes the form when
     * the API request succeeds.
     */

    setForm(DEFAULT_FORM);
  }

  /*
   * ==========================================================
   * FORM UPDATE
   * ==========================================================
   */

  function update<K extends keyof CreateQueueRequest>(
    key: K,

    value: CreateQueueRequest[K],
  ) {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -15,
      }}
      className="
        rounded-2xl
        border
        border-blue-500/20
        bg-gradient-to-br
        from-blue-500/10
        to-cyan-500/10
        p-8
        backdrop-blur-xl
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-400" />

        <h3 className="text-xl font-bold text-white">Add Customer</h3>
      </div>

      {/* ======================================================
          FORM
          ====================================================== */}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ====================================================
            NAME + PHONE
            ==================================================== */}

        <div className="grid gap-5 md:grid-cols-2">
          {/* CUSTOMER NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Customer Name
            </label>

            <input
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              required
              disabled={loading}
              placeholder="Enter customer name"
              className="
                w-full
                rounded-lg
                border
                border-white/20
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-white/30
                focus:border-blue-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* PHONE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Phone Number
            </label>

            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => update("customerPhone", e.target.value)}
              disabled={loading}
              placeholder="Optional"
              className="
                w-full
                rounded-lg
                border
                border-white/20
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-white/30
                focus:border-blue-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>
        </div>

        {/* ====================================================
            PARTY SIZE
            ==================================================== */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-white/70">
            Party Size
          </label>

          <input
            type="number"
            min={1}
            max={20}
            value={form.partySize}
            onChange={(e) => update("partySize", Number(e.target.value))}
            disabled={loading}
            className="
              w-full
              rounded-lg
              border
              border-white/20
              bg-white/5
              px-4
              py-3
              text-white
              outline-none
              focus:border-blue-500/40
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>

        {/* ====================================================
            NOTES
            ==================================================== */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-white/70">
            Notes
          </label>

          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            disabled={loading}
            placeholder="Optional notes or special requests"
            className="
              w-full
              resize-none
              rounded-lg
              border
              border-white/20
              bg-white/5
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-white/30
              focus:border-blue-500/40
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>

        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="flex gap-3">
          {/* SUBMIT */}

          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            disabled={loading}
            type="submit"
            className="
              flex-1
              rounded-lg
              bg-gradient-to-r
              from-blue-500
              to-cyan-600
              py-3
              font-bold
              text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span className="flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />

              {loading ? "Adding..." : "Add Customer"}
            </span>
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
              border-white/20
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

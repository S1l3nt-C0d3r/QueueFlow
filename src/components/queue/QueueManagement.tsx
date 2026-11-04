import { useCallback, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { Plus, RefreshCw, X, Clock3, Users, UserCheck } from "lucide-react";

import QueueGrid from "./QueueGrid";

import { queueService } from "../../services/queue.service";
import { tableService } from "../../services/table.service";

import { CreateQueueRequest, QueueResponse } from "../../types/queue";

import { TableResponse } from "../../types/table";

/*
 * ============================================================
 * FORM STATE
 * ============================================================
 *
 * The current Queue backend accepts:
 *
 * - customerName
 * - phone
 * - partySize
 * - notes
 *
 * The frontend continues using customerPhone because that is
 * the existing frontend naming convention.
 *
 * The queue service is responsible for translating:
 *
 * customerPhone -> phone
 *
 * when making the backend request.
 */

interface QueueFormState {
  customerName: string;

  customerPhone: string;

  partySize: number;

  notes: string;
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function QueueManagement() {
  /*
   * ==========================================================
   * STATE
   * ==========================================================
   */

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [queue, setQueue] = useState<QueueResponse[]>([]);

  const [tables, setTables] = useState<TableResponse[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<QueueFormState>({
    customerName: "",

    customerPhone: "",

    partySize: 1,

    notes: "",
  });

  /*
   * ==========================================================
   * LOAD QUEUE + TABLES
   * ==========================================================
   */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [queueData, tableData] = await Promise.all([
        queueService.getAll(),

        tableService.getAll(),
      ]);

      setQueue(queueData);

      setTables(tableData);
    } catch (error) {
      console.error("Unable to load queue data:", error);

      alert(
        error instanceof Error ? error.message : "Unable to load queue data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /*
   * ==========================================================
   * REFRESH
   * ==========================================================
   */

  const refresh = async () => {
    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * ==========================================================
   * STATISTICS
   * ==========================================================
   */

  const statistics = useMemo(() => {
    const waiting = queue.filter((entry) => entry.status === "WAITING");

    const called = queue.filter((entry) => entry.status === "CALLED");

    const seated = queue.filter((entry) => entry.status === "SEATED");

    const availableTables = tables.filter(
      (table) => table.status === "AVAILABLE",
    );

    return {
      waiting: waiting.length,

      called: called.length,

      seated: seated.length,

      availableTables: availableTables.length,
    };
  }, [queue, tables]);

  /*
   * ==========================================================
   * OPEN CREATE MODAL
   * ==========================================================
   */

  const openCreateModal = () => {
    setForm({
      customerName: "",

      customerPhone: "",

      partySize: 1,

      notes: "",
    });

    setShowModal(true);
  };

  /*
   * ==========================================================
   * SAVE NEW CUSTOMER
   * ==========================================================
   *
   * There is intentionally NO edit operation here.
   *
   * The current backend exposes POST /queue for creation,
   * but no queue-entry update endpoint.
   */

  const handleSave = async () => {
    try {
      const request: CreateQueueRequest = {
        customerName: form.customerName.trim(),

        customerPhone: form.customerPhone.trim(),

        partySize: Number(form.partySize),

        notes: form.notes.trim(),
      };

      /*
       * Basic frontend validation.
       */

      if (!request.customerName) {
        alert("Please enter the customer's name.");

        return;
      }

      if (request.partySize <= 0) {
        alert("Party size must be greater than zero.");

        return;
      }

      /*
       * The queue service handles the API call
       * and any customerPhone -> phone mapping.
       */

      await queueService.create(request);

      setShowModal(false);

      await refresh();
    } catch (error) {
      console.error("Unable to add customer:", error);

      alert(error instanceof Error ? error.message : "Unable to add customer.");
    }
  };

  /*
   * ==========================================================
   * CALL CUSTOMER
   * ==========================================================
   *
   * WAITING -> CALLED
   *
   * The current backend requires a tableId when calling
   * a customer.
   *
   * We choose the first available table that can
   * accommodate the party.
   */

  const handleCallCustomer = async (entry: QueueResponse) => {
    const availableTable = tables.find(
      (table) =>
        table.status === "AVAILABLE" && table.capacity >= entry.partySize,
    );

    if (!availableTable) {
      alert("No available table can accommodate this party.");

      return;
    }

    try {
      await queueService.updateStatus(entry.id, {
        status: "CALLED",

        tableId: availableTable.id,
      });

      await refresh();
    } catch (error) {
      console.error("Unable to call customer:", error);

      alert(
        error instanceof Error ? error.message : "Unable to call customer.",
      );
    }
  };

  /*
   * ==========================================================
   * SEAT CUSTOMER
   * ==========================================================
   *
   * CALLED -> SEATED
   *
   * Uses the backend's dedicated seat operation.
   */

  const handleSeatCustomer = async (entry: QueueResponse) => {
    if (!entry.tableId) {
      alert("This customer does not have an assigned table.");

      return;
    }

    try {
      await queueService.seatCustomer(
        entry.id,

        entry.tableId,
      );

      await refresh();
    } catch (error) {
      console.error("Unable to seat customer:", error);

      alert(
        error instanceof Error ? error.message : "Unable to seat customer.",
      );
    }
  };

  /*
   * ==========================================================
   * CANCEL CUSTOMER
   * ==========================================================
   *
   * WAITING -> CANCELLED
   * CALLED  -> CANCELLED
   *
   * There is no DELETE endpoint in the current backend.
   */

  const handleCancel = async (entry: QueueResponse) => {
    const confirmed = window.confirm(
      `Cancel ${entry.customerName}'s queue entry?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await queueService.updateStatus(entry.id, {
        status: "CANCELLED",
      });

      await refresh();
    } catch (error) {
      console.error("Unable to cancel customer:", error);

      alert(
        error instanceof Error ? error.message : "Unable to cancel customer.",
      );
    }
  };

  /*
   * ==========================================================
   * LOADING STATE
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <RefreshCw
          className="
            h-10
            w-10
            animate-spin
            text-blue-500
          "
        />
      </div>
    );
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-8">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Queue Management</h1>

          <p className="mt-2 text-white/60">
            Manage customer waiting list and seating.
          </p>
        </div>

        <div className="flex gap-3">
          {/* REFRESH */}

          <button
            type="button"
            onClick={refresh}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/10
              px-5
              py-3
              text-white
              transition
              hover:bg-white/20
            "
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} size={18} />
            Refresh
          </button>

          {/* ADD CUSTOMER */}

          <button
            type="button"
            onClick={openCreateModal}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </div>

      {/* ======================================================
          STATISTICS
          ====================================================== */}

      <div
        className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {/* WAITING */}

        <div
          className="
            rounded-2xl
            bg-gradient-to-br
            from-blue-600/20
            to-blue-400/10
            p-6
          "
        >
          <Clock3
            className="
              mb-4
              text-blue-400
            "
            size={28}
          />

          <p className="text-sm text-white/60">Waiting</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {statistics.waiting}
          </h2>
        </div>

        {/* CALLED */}

        <div
          className="
            rounded-2xl
            bg-gradient-to-br
            from-orange-600/20
            to-orange-400/10
            p-6
          "
        >
          <Users
            className="
              mb-4
              text-orange-400
            "
            size={28}
          />

          <p className="text-sm text-white/60">Called</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {statistics.called}
          </h2>
        </div>

        {/* SEATED */}

        <div
          className="
            rounded-2xl
            bg-gradient-to-br
            from-green-600/20
            to-green-400/10
            p-6
          "
        >
          <UserCheck
            className="
              mb-4
              text-green-400
            "
            size={28}
          />

          <p className="text-sm text-white/60">Seated</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {statistics.seated}
          </h2>
        </div>

        {/* AVAILABLE TABLES */}

        <div
          className="
            rounded-2xl
            bg-gradient-to-br
            from-cyan-600/20
            to-cyan-400/10
            p-6
          "
        >
          <Users
            className="
              mb-4
              text-cyan-400
            "
            size={28}
          />

          <p className="text-sm text-white/60">Available Tables</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {statistics.availableTables}
          </h2>
        </div>
      </div>

      {/* ======================================================
          QUEUE
          ====================================================== */}

      <QueueGrid
        entries={queue}
        onCall={handleCallCustomer}
        onSeat={handleSeatCustomer}
        onCancel={handleCancel}
      />

      {/* ======================================================
          ADD CUSTOMER MODAL
          ====================================================== */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/60
              p-4
              backdrop-blur-md
            "
          >
            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              className="
                w-full
                max-w-xl
                rounded-3xl
                bg-zinc-900
                p-8
              "
            >
              {/* ==================================================
                  MODAL HEADER
                  ================================================== */}

              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <h2 className="text-2xl font-bold text-white">Add Customer</h2>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="
                    text-white/50
                    transition
                    hover:text-white
                  "
                >
                  <X />
                </button>
              </div>

              {/* ==================================================
                  FORM
                  ================================================== */}

              <div className="space-y-5">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/70">
                    Customer Name
                  </label>

                  <input
                    placeholder="Customer Name"
                    value={form.customerName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,

                        customerName: event.target.value,
                      }))
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-3
                      text-white
                      outline-none
                      placeholder:text-white/30
                      focus:border-blue-500/40
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
                    placeholder="Phone Number (optional)"
                    value={form.customerPhone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,

                        customerPhone: event.target.value,
                      }))
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-3
                      text-white
                      outline-none
                      placeholder:text-white/30
                      focus:border-blue-500/40
                    "
                  />
                </div>

                {/* PARTY SIZE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/70">
                    Party Size
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={20}
                    placeholder="Party Size"
                    value={form.partySize}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,

                        partySize: Number(event.target.value),
                      }))
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-3
                      text-white
                      outline-none
                      placeholder:text-white/30
                      focus:border-blue-500/40
                    "
                  />
                </div>

                {/* NOTES */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/70">
                    Notes
                  </label>

                  <textarea
                    placeholder="Notes"
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,

                        notes: event.target.value,
                      }))
                    }
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-3
                      text-white
                      outline-none
                      placeholder:text-white/30
                      focus:border-blue-500/40
                    "
                  />
                </div>
              </div>

              {/* ==================================================
                  MODAL ACTIONS
                  ================================================== */}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="
                    rounded-xl
                    border
                    border-white/10
                    px-5
                    py-3
                    text-white
                    transition
                    hover:bg-white/5
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                >
                  Add Customer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

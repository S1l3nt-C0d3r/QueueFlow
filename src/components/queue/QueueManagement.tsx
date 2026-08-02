import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus,
  RefreshCw,
  X,
  Clock3,
  Users,
  UserCheck,
} from "lucide-react";

import QueueGrid from "./QueueGrid";

import { queueService } from "../../services/queue.service";
import { tableService } from "../../services/table.service";

import {
  CreateQueueRequest,
  QueueResponse,
  UpdateQueueRequest,
} from "../../types/queue";

import { TableResponse } from "../../types/table";

export default function QueueManagement() {

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [queue, setQueue] =
    useState<QueueResponse[]>([]);

  const [tables, setTables] =
    useState<TableResponse[]>([]);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedQueue, setSelectedQueue] =
    useState<QueueResponse | null>(null);

  const [form, setForm] =
    useState<CreateQueueRequest>({
      customerName: "",
      customerPhone: "",
      partySize: 1,
      estimatedWaitTime: 15,
      notes: "",
    });

    const loadData =
    useCallback(async () => {

      try {

        setLoading(true);

        const [
          queueData,
          tableData,
        ] = await Promise.all([
          queueService.getAll(),
          tableService.getAll(),
        ]);

        setQueue(queueData);
        setTables(tableData);

      } finally {

        setLoading(false);

      }

    }, []);

      const refresh =
    async () => {

      setRefreshing(true);

      await loadData();

      setRefreshing(false);

    };

      useEffect(() => {

    loadData();

  }, [loadData]);

    const statistics =
    useMemo(() => {

      return {

        waiting:
          queue.filter(
            q => q.status === "WAITING"
          ).length,

        called:
          queue.filter(
            q => q.status === "CALLED"
          ).length,

        seated:
          queue.filter(
            q => q.status === "SEATED"
          ).length,

        availableTables:
          tables.filter(
            t => t.status === "AVAILABLE"
          ).length,

      };

    }, [queue, tables]);

      const openCreateModal =
    () => {

      setSelectedQueue(null);

      setForm({
        customerName: "",
        customerPhone: "",
        partySize: 1,
        estimatedWaitTime: 15,
        notes: "",
      });

      setShowModal(true);

    };

      const openEditModal =
    (
      queue: QueueResponse
    ) => {

      setSelectedQueue(queue);

      setForm({

        customerName:
          queue.customerName,

        customerPhone:
          queue.customerPhone,

        partySize:
          queue.partySize,

        estimatedWaitTime:
          queue.estimatedWaitTime ?? 15,

        notes:
          queue.notes ?? "",

      });

      setShowModal(true);

    };

      const handleSave = async () => {

    try {

      if (selectedQueue) {

        const request: UpdateQueueRequest = {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          partySize: form.partySize,
          estimatedWaitTime:
            form.estimatedWaitTime,
          notes: form.notes,
        };

        await queueService.update(
          selectedQueue.id,
          request
        );

      } else {

        await queueService.create(form);

      }

      setShowModal(false);

      await refresh();

    } catch (error) {

      console.error(error);

      alert("Unable to save customer.");

    }

  };

    const handleDelete = async (
    queueId: string
  ) => {

    if (
      !window.confirm(
        "Remove this customer from the queue?"
      )
    ) {
      return;
    }

    try {

      await queueService.delete(queueId);

      await refresh();

    } catch (error) {

      console.error(error);

      alert("Unable to delete customer.");

    }

  };

    const handleCallCustomer = async (
    entry: QueueResponse
  ) => {

    const availableTable =
      tables.find(
        table =>
          table.status === "AVAILABLE"
      );

    if (!availableTable) {

      alert(
        "No available tables."
      );

      return;

    }

    try {

      await queueService.updateStatus(
        entry.id,
        {
          status: "CALLED",
          tableId:
            availableTable.id,
        }
      );

      await refresh();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to call customer."
      );

    }

  };

    const handleSeatCustomer =
    async (
      entry: QueueResponse
    ) => {

      if (!entry.tableId) {

        alert(
          "Customer has no assigned table."
        );

        return;

      }

      try {

        await queueService.seatCustomer(
          entry.id,
          entry.tableId
        );

        await refresh();

      } catch (error) {

        console.error(error);

        alert(
          "Unable to seat customer."
        );

      }

    };

      const handleCancel =
    async (
      entry: QueueResponse
    ) => {

      try {

        await queueService.updateStatus(
          entry.id,
          {
            status: "CANCELLED",
          }
        );

        await refresh();

      } catch (error) {

        console.error(error);

      }

    };

      const handleNoShow =
    async (
      entry: QueueResponse
    ) => {

      try {

        await queueService.updateStatus(
          entry.id,
          {
            status: "NO_SHOW",
          }
        );

        await refresh();

      } catch (error) {

        console.error(error);

      }

    };

    if (loading) {
      return (
        <div className="flex h-[70vh] items-center justify-center">
          <RefreshCw className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      );
    }

    return (
  <div className="space-y-8">

    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-3xl font-bold text-white">
          Queue Management
        </h1>

        <p className="mt-2 text-white/60">
          Manage customer waiting list and seating.
        </p>

      </div>

      <div className="flex gap-3">

        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-white transition hover:bg-white/20"
        >
          <RefreshCw
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
            size={18}
          />

          Refresh
        </button>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Customer
        </button>

      </div>

    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

  <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 p-6">

    <Clock3
      className="mb-4 text-blue-400"
      size={28}
    />

    <p className="text-sm text-white/60">
      Waiting
    </p>

    <h2 className="mt-2 text-3xl font-bold text-white">
      {statistics.waiting}
    </h2>

  </div>

  <div className="rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-400/10 p-6">

    <Users
      className="mb-4 text-orange-400"
      size={28}
    />

    <p className="text-sm text-white/60">
      Called
    </p>

    <h2 className="mt-2 text-3xl font-bold text-white">
      {statistics.called}
    </h2>

  </div>

  <div className="rounded-2xl bg-gradient-to-br from-green-600/20 to-green-400/10 p-6">

    <UserCheck
      className="mb-4 text-green-400"
      size={28}
    />

    <p className="text-sm text-white/60">
      Seated
    </p>

    <h2 className="mt-2 text-3xl font-bold text-white">
      {statistics.seated}
    </h2>

  </div>

  <div className="rounded-2xl bg-gradient-to-br from-cyan-600/20 to-cyan-400/10 p-6">

    <Users
      className="mb-4 text-cyan-400"
      size={28}
    />

    <p className="text-sm text-white/60">
      Available Tables
    </p>

    <h2 className="mt-2 text-3xl font-bold text-white">
      {statistics.availableTables}
    </h2>

  </div>

</div>
<QueueGrid
  entries={queue}
  onEdit={openEditModal}
  onDelete={handleDelete}
  onCall={handleCallCustomer}
  onSeat={handleSeatCustomer}
  onCancel={handleCancel}
  onNoShow={handleNoShow}
/>
<AnimatePresence>

  {showModal && (

    <motion.div

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      exit={{ opacity: 0 }}

      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"

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

        className="w-full max-w-xl rounded-3xl bg-zinc-900 p-8"

      >

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-white">

            {selectedQueue
              ? "Edit Customer"
              : "Add Customer"}

          </h2>

          <button
            onClick={() =>
              setShowModal(false)
            }
          >

            <X />

          </button>

        </div>
        <div className="space-y-5">

        <input
        placeholder="Customer Name"
        value={form.customerName}
        onChange={(e)=>
        setForm({
        ...form,
        customerName:e.target.value,
        })}
        />

        <input
        placeholder="Phone Number"
        value={form.customerPhone}
        onChange={(e)=>
        setForm({
        ...form,
        customerPhone:e.target.value,
        })}
        />

        <input
        type="number"
        placeholder="Party Size"
        value={form.partySize}
        onChange={(e)=>
        setForm({
        ...form,
        partySize:Number(e.target.value),
        })}
        />

        <input
        type="number"
        placeholder="Estimated Wait"
        value={form.estimatedWaitTime}
        onChange={(e)=>
        setForm({
        ...form,
        estimatedWaitTime:Number(e.target.value),
        })}
        />

        <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e)=>
        setForm({
        ...form,
        notes:e.target.value,
        })}
        />

        </div>
        <div className="mt-8 flex justify-end gap-3">

        <button
        onClick={() =>
        setShowModal(false)
        }
        className="rounded-xl border border-white/10 px-5 py-3 text-white"
        >

        Cancel

        </button>

        <button
        onClick={handleSave}
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >

        {selectedQueue
        ? "Update Customer"
        : "Add Customer"}

        </button>

        </div>

        </motion.div>

        </motion.div>

        )}

        </AnimatePresence>

        </div>

        );

      }

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";

import AlertBanner from "../staff/AlertBanner";
import TableForm from "./TableForm";
import TableGrid from "./TableGrid";
import TableInfo from "./TableInfo";

import { tableService } from "../../services/table.service";

import {
  CreateTableRequest,
  TableResponse,
  UpdateTableRequest,
} from "../../types/table";

export default function TableManagement() {
  const [tables, setTables] = useState<TableResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadTables() {
    try {
      setLoading(true);

      const result = await tableService.getAll();

      result.sort((a, b) => a.tableNumber - b.tableNumber);

      setTables(result);
    } catch (err: any) {
      setError(err.message ?? "Unable to load tables.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTables();
  }, []);

  async function handleCreate(
    request: CreateTableRequest
  ) {
    try {
      setCreating(true);

      await tableService.create(request);

      setShowForm(false);

      setSuccess("Table created successfully.");

      await loadTables();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Unable to create table.");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(
    id: string,
    request: UpdateTableRequest
  ) {
    try {
      const updated = await tableService.update(id, request);

      setTables((current) =>
        current.map((table) =>
          table.id === id ? updated : table
        )
      );

      setSuccess("Table updated.");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Unable to update table.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this table?")) {
      return;
    }

    try {
      await tableService.delete(id);

      setTables((current) =>
        current.filter((table) => table.id !== id)
      );

      setSuccess("Table deleted.");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Unable to delete table.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <AlertBanner
        error={error}
        success={success}
      />

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>

          <h2 className="text-2xl font-bold text-white">
            Table Management
          </h2>

          <p className="text-sm text-white/60">
            Manage restaurant tables and QR codes.
          </p>

        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-white font-bold shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add Table
        </motion.button>
      </motion.div>

      <AnimatePresence>

        {showForm && (
          <TableForm
            loading={creating}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

      </AnimatePresence>

      <TableGrid
        tables={tables}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <TableInfo />

    </div>
  );
}
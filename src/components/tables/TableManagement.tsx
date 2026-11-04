import { useEffect, useState } from "react";

import { Plus, RefreshCw } from "lucide-react";

import TableForm from "./TableForm";
import TableGrid from "./TableGrid";

import { tableService } from "../../services/table.service";

import {
  CreateTableRequest,
  TableResponse,
  UpdateTableRequest,
  UpdateTableStatusRequest,
} from "../../types/table";

export default function TableManagement() {
  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [tables, setTables] = useState<TableResponse[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingTable, setEditingTable] = useState<TableResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  /*
   * ============================================================
   * LOAD TABLES
   * ============================================================
   */

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await tableService.getAll();

      setTables(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load tables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTables();
  }, []);

  /*
   * ============================================================
   * CREATE / UPDATE TABLE
   * ============================================================
   *
   * PUT /tables/:id
   * POST /tables
   *
   * These operations modify table configuration only.
   * Status changes use handleStatusChange below.
   */

  const handleSubmit = async (
    request: CreateTableRequest | UpdateTableRequest,
  ) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingTable) {
        const updated = await tableService.update(
          editingTable.id,
          request as UpdateTableRequest,
        );

        setTables((current) =>
          current.map((table) => (table.id === updated.id ? updated : table)),
        );

        setSuccess("Table updated successfully.");
      } else {
        const created = await tableService.create(
          request as CreateTableRequest,
        );

        setTables((current) => [...current, created]);

        setSuccess("Table created successfully.");
      }

      setEditingTable(null);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save table.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * EDIT TABLE
   * ============================================================
   */

  const handleEdit = (table: TableResponse) => {
    setEditingTable(table);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  /*
   * ============================================================
   * DELETE TABLE
   * ============================================================
   *
   * DELETE /tables/:id
   *
   * Backend performs a soft delete.
   */

  const handleDelete = async (id: string) => {
    const table = tables.find((current) => current.id === id);

    if (!table) {
      return;
    }

    if (!window.confirm(`Deactivate Table ${table.tableNumber}?`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      await tableService.delete(id);

      /*
       * Keep the table in the Admin list but mark it inactive.
       * This is useful because the backend performs a soft delete.
       */

      setTables((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                active: false,
              }
            : item,
        ),
      );

      setSuccess(`Table ${table.tableNumber} was deactivated.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to delete table.");
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ============================================================
   * CHANGE STATUS
   * ============================================================
   *
   * PATCH /tables/:id/status
   *
   * The backend validates the transition.
   */

  const handleStatusChange = async (
    id: string,
    request: UpdateTableStatusRequest,
  ) => {
    try {
      setError(null);
      setSuccess(null);

      const updated = await tableService.updateStatus(id, request);

      setTables((current) =>
        current.map((table) => (table.id === updated.id ? updated : table)),
      );

      setSuccess(`Table ${updated.tableNumber} is now ${updated.status}.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to change table status.",
      );

      /*
       * Refresh because the backend is the authority on
       * valid status transitions.
       */

      void loadTables();
    }
  };

  /*
   * ============================================================
   * CANCEL FORM
   * ============================================================
   */

  const handleCancel = () => {
    setEditingTable(null);
    setShowForm(false);
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Table Management</h2>

          <p className="mt-1 text-sm text-white/50">
            Manage restaurant tables, availability and status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* REFRESH */}

          <button
            type="button"
            onClick={() => void loadTables()}
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-3
              text-sm
              font-semibold
              text-white/70
              transition
              hover:bg-white/10
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* ADD TABLE */}

          <button
            type="button"
            onClick={() => {
              setEditingTable(null);
              setShowForm(true);
              setError(null);
              setSuccess(null);
            }}
            disabled={saving || deleting}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-orange-500
              to-pink-600
              px-5
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Plus className="h-5 w-5" />
            Add Table
          </button>
        </div>
      </div>

      {/* ======================================================
          ALERTS
          ====================================================== */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-300
          "
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-4
            py-3
            text-sm
            text-emerald-300
          "
        >
          {success}
        </div>
      )}

      {/* ======================================================
          FORM
          ====================================================== */}

      {showForm && (
        <TableForm
          loading={saving}
          editingTable={editingTable}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* ======================================================
          TABLE GRID
          ====================================================== */}

      <TableGrid
        tables={tables}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {/* ======================================================
          DELETE INDICATOR
          ====================================================== */}

      {deleting && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-50
            rounded-xl
            border
            border-white/10
            bg-zinc-900/95
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-xl
            backdrop-blur-xl
          "
        >
          Deactivating table...
        </div>
      )}
    </div>
  );
}

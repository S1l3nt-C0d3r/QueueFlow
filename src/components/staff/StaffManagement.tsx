import { useEffect, useState } from "react";

import { Plus } from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import AlertBanner from "./AlertBanner";
import StaffForm from "./StaffForm";
import StaffList from "./StaffList";
import StaffInfo from "./StaffInfo";

import { staffService } from "../../services/staff.service";

import { CreateStaffRequest, StaffResponse } from "../../types/staff";

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffResponse[]>([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  /*
   * ============================================================
   * LOAD STAFF
   * ============================================================
   */

  async function loadStaff() {
    try {
      setLoading(true);
      setError(null);

      const result = await staffService.getAll();

      result.sort((a, b) => a.staffNumber.localeCompare(b.staffNumber));

      setStaff(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStaff();
  }, []);

  /*
   * ============================================================
   * CREATE STAFF
   * ============================================================
   */

  async function handleCreate(request: CreateStaffRequest) {
    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      await staffService.create(request);

      setSuccess(`Staff #${request.staffNumber} created successfully.`);

      setShowForm(false);

      await loadStaff();

      window.setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create staff.");
    } finally {
      setCreating(false);
    }
  }

  /*
   * ============================================================
   * CHANGE ROLE
   * ============================================================
   */

  async function handleRoleChange(id: string, roleId: StaffResponse["roleId"]) {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const updated = await staffService.update(id, {
        roleId,
      });

      setStaff((current) =>
        current.map((member) => (member.id === id ? updated : member)),
      );

      setSuccess("Staff role updated successfully.");

      window.setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to update staff role.",
      );
    } finally {
      setUpdating(false);
    }
  }

  /*
   * ============================================================
   * DEACTIVATE STAFF
   * ============================================================
   *
   * There is intentionally no DELETE endpoint in the backend.
   *
   * Staff accounts are deactivated using:
   *
   * PUT /staff/:id
   *
   * {
   *   active: false
   * }
   *
   * This preserves the staff record for historical data.
   */

  async function handleDelete(id: string) {
    const member = staff.find((current) => current.id === id);

    if (!member) {
      return;
    }

    if (!member.active) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate ${member.displayName} (Staff #${member.staffNumber})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const updated = await staffService.update(id, {
        active: false,
      });

      setStaff((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );

      setSuccess(`${member.displayName} has been deactivated.`);

      window.setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate staff member.",
      );
    } finally {
      setUpdating(false);
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div
          className="
            h-8
            w-8
            animate-spin
            rounded-full
            border-2
            border-green-500
            border-t-transparent
          "
        />
      </div>
    );
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-8">
      <AlertBanner error={error} success={success} />

      {/* ======================================================
          HEADER
          ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex
          items-center
          justify-between
        "
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Members</h2>

          <p className="text-sm text-white/60">Manage your restaurant staff</p>
        </div>

        <motion.button
          whileHover={{
            scale: 1.04,
          }}
          whileTap={{
            scale: 0.96,
          }}
          onClick={() => setShowForm((value) => !value)}
          disabled={creating || updating}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-gradient-to-r
            from-green-500
            to-emerald-600
            px-4
            py-2
            font-bold
            text-white
            shadow-lg
            transition-all
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </motion.button>
      </motion.div>

      {/* ======================================================
          FORM
          ====================================================== */}

      <AnimatePresence>
        {showForm && (
          <StaffForm
            loading={creating}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          STAFF LIST
          ====================================================== */}

      <StaffList
        staff={staff}
        onRoleChange={handleRoleChange}
        onDelete={handleDelete}
      />

      {/* ======================================================
          INFORMATION
          ====================================================== */}

      <StaffInfo />
    </div>
  );
}

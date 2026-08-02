import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import AlertBanner from "./AlertBanner";
import StaffForm from "./StaffForm";
import StaffList from "./StaffList";
import StaffInfo from "./StaffInfo";

import { staffService } from "../../services/staff.service";

import {
  CreateStaffRequest,
  StaffResponse,
} from "../../types/staff";

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  async function loadStaff() {
    try {
      setLoading(true);

      const result = await staffService.getAll();

      result.sort((a, b) =>
        a.staffNumber.localeCompare(b.staffNumber)
      );

      setStaff(result);
    } catch (err: any) {
      setError(err.message ?? "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleCreate(
    request: CreateStaffRequest
  ) {
    try {
      setCreating(true);

      await staffService.create(request);

      setSuccess(
        `Staff #${request.staffNumber} created successfully.`
      );

      setShowForm(false);

      await loadStaff();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Failed to create staff.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(
    id: string,
    roleId: StaffResponse["roleId"]
  ) {
    try {
      await staffService.update(id, {
        roleId,
      });

      setStaff((current) =>
        current.map((member) =>
          member.id === id
            ? {
                ...member,
                roleId,
              }
            : member
        )
      );

      setSuccess("Staff role updated.");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Unable to update role.");
    }
  }

  async function handleDelete(
    id: string
  ) {
    alert(
      "Delete endpoint has not been implemented in the backend yet."
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">

        <div className="h-8 w-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />

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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>

          <h2 className="text-2xl font-bold text-white">
            Staff Members
          </h2>

          <p className="text-white/60 text-sm">
            Manage your restaurant staff
          </p>

        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />

          Add Staff

        </motion.button>
      </motion.div>

      <AnimatePresence>

        {showForm && (
          <StaffForm
            loading={creating}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

      </AnimatePresence>

      <StaffList
        staff={staff}
        onRoleChange={handleRoleChange}
        onDelete={handleDelete}
      />

      <StaffInfo />

    </div>
  );
}
import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Plus, Save } from "lucide-react";

import { StaffFormProps } from "./types";
import { RoleId } from "../../types/common";

export default function StaffForm({
  loading,
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const [staffNumber, setStaffNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<RoleId>("waiter");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);

    // UX validation only.
    // Backend remains the source of truth.

    if (!staffNumber.trim()) {
      setError("Staff Number is required.");
      return;
    }

    if (!displayName.trim()) {
      setError("Display Name is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await onSubmit({
        staffNumber,
        displayName,
        email: email || undefined,
        password,
        roleId,
      });

      setStaffNumber("");
      setDisplayName("");
      setEmail("");
      setRoleId("waiter");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message ?? "Failed to create staff member.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 p-8 rounded-2xl shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Plus className="h-6 w-6 text-green-400" />

        <h3 className="text-xl font-bold text-white">
          Create New Staff Member
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
              Staff Number
            </label>

            <input
              value={staffNumber}
              onChange={(e) => setStaffNumber(e.target.value)}
              placeholder="1001"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-green-500/50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/80">
              Display Name
            </label>

            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-green-500/50"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/80">
              Email (Optional)
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-green-500/50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/80">
              Role
            </label>

            <select
              value={roleId}
              onChange={(e) =>
                setRoleId(e.target.value as RoleId)
              }
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-green-500/50"
            >
              <option value="waiter">
                Waiter
              </option>

              <option value="receptionist">
                Receptionist
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/80">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-green-500/50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/80">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-green-500/50"
            />
          </div>

        </div>

        <div className="flex gap-3 pt-2">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="h-5 w-5" />
                Create Staff
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 py-3 font-bold text-white transition-all hover:bg-white/10"
          >
            Cancel
          </motion.button>

        </div>

      </form>
    </motion.div>
  );
}
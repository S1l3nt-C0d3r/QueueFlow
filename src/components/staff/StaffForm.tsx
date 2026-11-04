import { FormEvent, useState } from "react";

import { motion } from "motion/react";

import { UserPlus } from "lucide-react";

import { StaffFormProps } from "./types";

export default function StaffForm({
  loading,
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const [staffNumber, setStaffNumber] = useState("");

  const [displayName, setDisplayName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [roleId, setRoleId] = useState<"admin" | "waiter" | "receptionist">(
    "waiter",
  );

  const [error, setError] = useState<string | null>(null);

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const normalizedStaffNumber = staffNumber.trim();

    const normalizedDisplayName = displayName.trim();

    const normalizedEmail = email.trim();

    if (!normalizedStaffNumber) {
      setError("Staff number is required.");

      return;
    }

    if (!normalizedDisplayName) {
      setError("Display name is required.");

      return;
    }

    if (!password) {
      setError("Password is required.");

      return;
    }

    try {
      await onSubmit({
        staffNumber: normalizedStaffNumber,

        displayName: normalizedDisplayName,

        email: normalizedEmail || undefined,

        password,

        roleId,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to create staff member.",
      );
    }
  }

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
        border-green-500/20
        bg-gradient-to-br
        from-green-500/10
        to-emerald-500/10
        p-6
        shadow-xl
        backdrop-blur-xl
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            bg-gradient-to-br
            from-green-500
            to-emerald-600
          "
        >
          <UserPlus
            className="
              h-5
              w-5
              text-white
            "
          />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">Add Staff Member</h3>

          <p className="mt-1 text-sm text-white/50">
            Create a new staff account for this restaurant.
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
            px-4
            py-3
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
              STAFF NUMBER
              ================================================== */}

          <div>
            <label
              htmlFor="staff-number"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Staff Number
            </label>

            <input
              id="staff-number"
              type="text"
              value={staffNumber}
              onChange={(event) => setStaffNumber(event.target.value)}
              placeholder="e.g. W001"
              autoComplete="off"
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
                placeholder:text-white/25
                focus:border-green-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* ==================================================
              DISPLAY NAME
              ================================================== */}

          <div>
            <label
              htmlFor="staff-name"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Display Name
            </label>

            <input
              id="staff-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="e.g. Rahul Sharma"
              autoComplete="name"
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
                placeholder:text-white/25
                focus:border-green-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* ==================================================
              EMAIL
              ================================================== */}

          <div>
            <label
              htmlFor="staff-email"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Email
              <span className="ml-1 text-white/30">(optional)</span>
            </label>

            <input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@example.com"
              autoComplete="email"
              disabled={loading}
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
                placeholder:text-white/25
                focus:border-green-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* ==================================================
              ROLE
              ================================================== */}

          <div>
            <label
              htmlFor="staff-role"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Role
            </label>

            <select
              id="staff-role"
              value={roleId}
              onChange={(event) =>
                setRoleId(
                  event.target.value as "admin" | "waiter" | "receptionist",
                )
              }
              disabled={loading}
              className="
                w-full
                rounded-lg
                border
                border-white/10
                bg-zinc-900
                px-4
                py-3
                text-white
                outline-none
                focus:border-green-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="waiter">Waiter</option>

              <option value="receptionist">Receptionist</option>

              <option value="admin">Admin</option>
            </select>
          </div>

          {/* ==================================================
              PASSWORD
              ================================================== */}

          <div className="md:col-span-2">
            <label
              htmlFor="staff-password"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-white/80
              "
            >
              Initial Password
            </label>

            <input
              id="staff-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter initial password"
              autoComplete="new-password"
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
                placeholder:text-white/25
                focus:border-green-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />

            <p className="mt-2 text-xs text-white/30">
              The staff member can use this password when signing into the
              restaurant system.
            </p>
          </div>
        </div>

        {/* ======================================================
            ACTIONS
            ====================================================== */}

        <div className="flex gap-3 pt-2">
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
              rounded-lg
              bg-gradient-to-r
              from-green-500
              to-emerald-600
              py-3
              font-bold
              text-white
              shadow-lg
              transition-all
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Creating..." : "Create Staff"}
          </motion.button>

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

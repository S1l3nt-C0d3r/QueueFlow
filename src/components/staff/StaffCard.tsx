import { UserX, UserCheck } from "lucide-react";

import { motion } from "motion/react";

import { cn } from "../../lib/utils";

import { StaffCardProps } from "./types";

function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    admin: "from-purple-500 to-pink-600",

    waiter: "from-blue-500 to-cyan-600",

    receptionist: "from-orange-500 to-pink-600",
  };

  return colors[role] ?? colors.waiter;
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: "Admin",
    waiter: "Waiter",
    receptionist: "Receptionist",
  };

  return labels[role] ?? role;
}

export default function StaffCard({
  member,
  onRoleChange,
  onDelete,
}: StaffCardProps) {
  const isActive = member.active;

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={cn(
        `
          rounded-2xl
          border-2
          p-6
          shadow-lg
          backdrop-blur-xl
          transition-all
        `,
        isActive
          ? `
            border-white/20
            bg-gradient-to-br
            from-white/10
            to-white/5
            hover:border-purple-500/30
          `
          : `
            border-white/10
            bg-white/[0.03]
            opacity-70
          `,
      )}
    >
      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* ==================================================
            STAFF INFORMATION
            ================================================== */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            gap-4
          "
        >
          {/* STAFF NUMBER */}

          <div
            className={cn(
              `
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-lg
                font-bold
                text-white
                shadow-lg
              `,
              `bg-gradient-to-br ${getRoleColor(member.roleId)}`,
            )}
          >
            #{member.staffNumber}
          </div>

          {/* DETAILS */}

          <div className="min-w-0 flex-1">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <p className="text-lg font-bold text-white">
                {member.displayName}
              </p>

              {!isActive && (
                <span
                  className="
                    rounded-full
                    border
                    border-red-500/30
                    bg-red-500/10
                    px-2
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-red-300
                  "
                >
                  Inactive
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-white/60">
              Staff #{member.staffNumber}
            </p>

            {member.email && (
              <p
                className="
                  mt-1
                  truncate
                  text-xs
                  text-white/50
                "
              >
                {member.email}
              </p>
            )}
          </div>
        </div>

        {/* ==================================================
            ACTIONS
            ================================================== */}

        <div
          className="
            flex
            w-full
            items-center
            gap-3
            lg:w-auto
          "
        >
          {/* ROLE */}

          <div className="flex-1 lg:flex-none">
            <label className="sr-only">Staff role</label>

            <select
              value={member.roleId}
              disabled={!isActive}
              onChange={(event) =>
                void onRoleChange(
                  member.id,
                  event.target.value as StaffCardProps extends {
                    onRoleChange: (id: string, roleId: infer R) => unknown;
                  }
                    ? R
                    : never,
                )
              }
              className={cn(
                `
                  w-full
                  rounded-lg
                  border-0
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-white
                  outline-none
                  shadow-lg
                  transition-all
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  lg:w-auto
                `,
                `bg-gradient-to-r ${getRoleColor(member.roleId)}`,
              )}
            >
              <option value="waiter" className="bg-zinc-900">
                Waiter
              </option>

              <option value="receptionist" className="bg-zinc-900">
                Receptionist
              </option>

              <option value="admin" className="bg-zinc-900">
                Admin
              </option>
            </select>
          </div>

          {/* ACTIVATE / DEACTIVATE */}

          <motion.button
            type="button"
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() => onDelete(member.id)}
            disabled={!isActive}
            title={
              isActive
                ? "Deactivate staff member"
                : "Staff member is already inactive"
            }
            className={cn(
              `
                shrink-0
                rounded-lg
                border
                p-2
                transition-all
                disabled:cursor-not-allowed
                disabled:opacity-30
              `,
              isActive
                ? `
                  border-red-500/30
                  text-red-400
                  hover:bg-red-500/20
                `
                : `
                  border-white/10
                  text-white/30
                `,
            )}
          >
            {isActive ? (
              <UserX className="h-5 w-5" />
            ) : (
              <UserCheck className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

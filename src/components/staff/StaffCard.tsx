import { Trash2 } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "../../lib/utils";

import { StaffCardProps } from "./types";

function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    admin: "from-purple-500 to-pink-600",
    waiter: "from-blue-500 to-cyan-600",
    receptionist: "from-orange-500 to-pink-600",
  };

  return colors[role] || colors.waiter;
}

export default function StaffCard({
  member,
  onRoleChange,
  onDelete,
}: StaffCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 p-6 rounded-2xl shadow-lg hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-center justify-between">

        {/* Left */}

        <div className="flex items-center gap-4 flex-1">

          <div
            className={cn(
              "h-14 w-14 rounded-lg flex items-center justify-center text-white font-display font-bold shadow-lg",
              `bg-gradient-to-br ${getRoleColor(member.roleId)}`
            )}
          >
            #{member.staffNumber}
          </div>

          <div className="flex-1">

            <p className="text-white font-bold text-lg">
              {member.displayName}
            </p>

            <p className="text-white/60 text-sm">
              Staff #{member.staffNumber}
            </p>

            {member.email && (
              <p className="text-white/50 text-xs">
                {member.email}
              </p>
            )}

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          <select
            value={member.roleId}
            onChange={(e) =>
              onRoleChange(
                member.id,
                e.target.value as typeof member.roleId
              )
            }
            className={cn(
              "px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-r border-0 outline-none shadow-lg",
              getRoleColor(member.roleId)
            )}
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

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(member.id)}
            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 border border-transparent hover:border-red-500/30 transition-all"
          >
            <Trash2 className="h-5 w-5" />
          </motion.button>

        </div>

      </div>
    </motion.div>
  );
}
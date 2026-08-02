import { AnimatePresence } from "motion/react";
import { Users } from "lucide-react";
import { motion } from "motion/react";

import StaffCard from "./StaffCard";
import { StaffListProps } from "./types";

export default function StaffList({
  staff,
  onRoleChange,
  onDelete,
}: StaffListProps) {
  if (staff.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center"
      >
        <Users className="h-12 w-12 text-white/20 mx-auto mb-3" />

        <p className="text-white/50">
          No staff members yet. Add your first staff member!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {staff.map((member) => (
          <StaffCard
            key={member.id}
            member={member}
            onRoleChange={onRoleChange}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
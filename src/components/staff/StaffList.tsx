import { StaffListProps } from "./types";

import StaffCard from "./StaffCard";

export default function StaffList({
  staff,
  onRoleChange,
  onDelete,
}: StaffListProps) {
  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (staff.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-10
          text-center
          backdrop-blur-xl
        "
      >
        <p className="text-lg font-bold text-white">No staff members</p>

        <p className="mt-2 text-sm text-white/50">
          Add your first staff member to get started.
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * STAFF LIST
   * ============================================================
   */

  return (
    <div className="space-y-4">
      {staff.map((member) => (
        <StaffCard
          key={member.id}
          member={member}
          onRoleChange={onRoleChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

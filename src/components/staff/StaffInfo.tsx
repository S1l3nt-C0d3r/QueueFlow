import { motion } from "motion/react";

export default function StaffInfo() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        rounded-2xl
        border
        border-blue-500/30
        bg-gradient-to-br
        from-blue-500/10
        to-cyan-500/10
        p-6
        shadow-2xl
        backdrop-blur-xl
      "
    >
      <h3 className="mb-3 text-lg font-bold text-blue-300">
        Staff Login & Account Management
      </h3>

      <div className="space-y-2 text-sm text-blue-200">
        <p>✓ Each staff member receives a unique Staff Number.</p>

        <p>✓ Admin sets the initial password when creating the account.</p>

        <p>✓ Staff log in using their Staff Number and password.</p>

        <p>✓ No email confirmation is required for staff accounts.</p>

        <p>✓ Admin can change a staff member's role using the role selector.</p>

        <p>
          ✓ Staff accounts can be deactivated without removing their historical
          records.
        </p>
      </div>
    </motion.div>
  );
}

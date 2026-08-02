import { motion } from "motion/react";

export default function StaffInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-6 rounded-2xl shadow-2xl"
    >
      <h3 className="text-lg font-bold text-blue-300 mb-3">
        Staff Login Instructions
      </h3>

      <div className="space-y-2 text-blue-200 text-sm">
        <p>✓ Each staff member gets a unique Staff Number (e.g. 1001, 1002, etc.)</p>

        <p>✓ Admin sets a password for each staff member</p>

        <p>✓ Staff logs in using their Staff Number + Password</p>

        <p>✓ No need to wait for email confirmations</p>

        <p>✓ Admin can change staff roles anytime using the dropdown</p>
      </div>
    </motion.div>
  );
}
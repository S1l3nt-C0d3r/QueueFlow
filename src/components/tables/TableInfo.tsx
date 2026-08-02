import { Info, QrCode, Users, Smartphone } from "lucide-react";
import { motion } from "motion/react";

export default function TableInfo() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Info className="h-5 w-5 text-white" />
        </div>

        <h3 className="text-xl font-bold text-white">
          Table Management Guide
        </h3>
      </div>

      <div className="space-y-5 text-sm">

        <div className="flex gap-3">
          <QrCode className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />

          <div>
            <p className="font-semibold text-white">
              QR Codes
            </p>

            <p className="text-white/60">
              Every table has its own QR code. Customers scan it to
              start or join a dining session and place their orders.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Users className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />

          <div>
            <p className="font-semibold text-white">
              Capacity
            </p>

            <p className="text-white/60">
              Set the maximum number of guests each table can
              accommodate. Reception uses this information while
              seating customers from the queue.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Smartphone className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />

          <div>
            <p className="font-semibold text-white">
              Local First
            </p>

            <p className="text-white/60">
              Table information is managed by your local QueueFlow
              server, ensuring that operations continue even if the
              internet connection is unavailable.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
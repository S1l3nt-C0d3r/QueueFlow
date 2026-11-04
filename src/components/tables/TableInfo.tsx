import { Info, QrCode, Users, Smartphone } from "lucide-react";

import { motion } from "motion/react";

export default function TableInfo() {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="
        rounded-2xl
        border
        border-cyan-500/30
        bg-gradient-to-br
        from-cyan-500/10
        to-blue-500/10
        p-6
        shadow-lg
        backdrop-blur-xl
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-5 flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            bg-gradient-to-br
            from-cyan-500
            to-blue-600
          "
        >
          <Info
            className="
              h-5
              w-5
              text-white
            "
          />
        </div>

        <h3 className="text-xl font-bold text-white">Table Management Guide</h3>
      </div>

      {/* ======================================================
          INFORMATION
          ====================================================== */}

      <div className="space-y-5 text-sm">
        {/* ====================================================
            QR CODES
            ==================================================== */}

        <div className="flex gap-3">
          <QrCode
            className="
              mt-0.5
              h-5
              w-5
              flex-shrink-0
              text-cyan-400
            "
          />

          <div>
            <p className="font-semibold text-white">QR Codes</p>

            <p className="mt-1 leading-relaxed text-white/60">
              Every active table has its own permanent QR code. Customers scan
              it to join the dining session and begin placing orders.
            </p>
          </div>
        </div>

        {/* ====================================================
            CAPACITY
            ==================================================== */}

        <div className="flex gap-3">
          <Users
            className="
              mt-0.5
              h-5
              w-5
              flex-shrink-0
              text-cyan-400
            "
          />

          <div>
            <p className="font-semibold text-white">Capacity</p>

            <p className="mt-1 leading-relaxed text-white/60">
              Set the maximum number of guests each table can accommodate.
              Reception uses this information when seating customers from the
              queue.
            </p>
          </div>
        </div>

        {/* ====================================================
            TABLE STATUS
            ==================================================== */}

        <div className="flex gap-3">
          <Info
            className="
              mt-0.5
              h-5
              w-5
              flex-shrink-0
              text-cyan-400
            "
          />

          <div>
            <p className="font-semibold text-white">Table Status</p>

            <p className="mt-1 leading-relaxed text-white/60">
              Tables move through the restaurant workflow using Available,
              Reserved, Occupied and Cleaning states. Status changes are
              validated by the server.
            </p>
          </div>
        </div>

        {/* ====================================================
            LOCAL FIRST
            ==================================================== */}

        <div className="flex gap-3">
          <Smartphone
            className="
              mt-0.5
              h-5
              w-5
              flex-shrink-0
              text-cyan-400
            "
          />

          <div>
            <p className="font-semibold text-white">Local First</p>

            <p className="mt-1 leading-relaxed text-white/60">
              Table information is managed by the local QueueFlow server,
              allowing restaurant operations to continue even when the internet
              connection is unavailable.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

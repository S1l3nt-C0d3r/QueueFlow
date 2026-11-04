import { BookOpen, Database, QrCode, CheckCircle2 } from "lucide-react";

import { MenuInfoProps } from "./types";

export default function MenuInfo({}: MenuInfoProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-orange-500/20
        bg-gradient-to-br
        from-orange-500/10
        to-pink-500/10
        p-6
        shadow-lg
        backdrop-blur-xl
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <BookOpen
          className="
            h-6
            w-6
            text-orange-400
          "
        />

        <h3 className="text-xl font-bold text-white">Menu Information</h3>
      </div>

      {/* ======================================================
          INFORMATION CARDS
          ====================================================== */}

      <div
        className="
          grid
          gap-5
          md:grid-cols-3
        "
      >
        {/* ====================================================
            DATABASE
            ==================================================== */}

        <div
          className="
            rounded-xl
            border
            border-white/10
            bg-white/5
            p-5
          "
        >
          <div className="mb-3 flex items-center gap-3">
            <Database
              className="
                h-5
                w-5
                text-cyan-400
              "
            />

            <h4 className="font-semibold text-white">Local Database</h4>
          </div>

          <p
            className="
              text-sm
              leading-relaxed
              text-white/60
            "
          >
            Every menu item is stored in your restaurant's local SQLite database
            through the backend. The frontend never writes directly to the
            database.
          </p>
        </div>

        {/* ====================================================
            CUSTOMER ORDERING
            ==================================================== */}

        <div
          className="
            rounded-xl
            border
            border-white/10
            bg-white/5
            p-5
          "
        >
          <div className="mb-3 flex items-center gap-3">
            <QrCode
              className="
                h-5
                w-5
                text-green-400
              "
            />

            <h4 className="font-semibold text-white">Customer Ordering</h4>
          </div>

          <p
            className="
              text-sm
              leading-relaxed
              text-white/60
            "
          >
            Only active and available menu items can be ordered by customers.
            Items marked unavailable remain in the restaurant menu but cannot
            currently be ordered.
          </p>
        </div>

        {/* ====================================================
            AVAILABILITY
            ==================================================== */}

        <div
          className="
            rounded-xl
            border
            border-white/10
            bg-white/5
            p-5
          "
        >
          <div className="mb-3 flex items-center gap-3">
            <CheckCircle2
              className="
                h-5
                w-5
                text-pink-400
              "
            />

            <h4 className="font-semibold text-white">Availability</h4>
          </div>

          <p
            className="
              text-sm
              leading-relaxed
              text-white/60
            "
          >
            Active controls whether an item is part of the restaurant's menu.
            Available controls whether customers can currently order it.
          </p>
        </div>
      </div>
    </div>
  );
}

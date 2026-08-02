import {
  BookOpen,
  Database,
  QrCode,
  UtensilsCrossed,
} from "lucide-react";

import { MenuInfoProps } from "./types";

export default function MenuInfo({}: MenuInfoProps) {
  return (
    <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-6 backdrop-blur-xl shadow-lg">

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-orange-400" />

        <h3 className="text-xl font-bold text-white">
          Menu Information
        </h3>
      </div>

      <div className="grid gap-5 md:grid-cols-3">

        {/* Database */}

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center gap-3 mb-3">
            <Database className="h-5 w-5 text-cyan-400" />

            <h4 className="font-semibold text-white">
              Local Database
            </h4>
          </div>

          <p className="text-sm leading-relaxed text-white/60">
            Every menu item is stored in your restaurant's local
            SQLite database through the backend. The frontend never
            writes directly to the database.
          </p>

        </div>

        {/* QR Ordering */}

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center gap-3 mb-3">
            <QrCode className="h-5 w-5 text-green-400" />

            <h4 className="font-semibold text-white">
              Customer Ordering
            </h4>
          </div>

          <p className="text-sm leading-relaxed text-white/60">
            Available menu items automatically appear in the customer
            QR ordering experience. Unavailable items are hidden from
            customers until they are enabled again.
          </p>

        </div>

        {/* Categories */}

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center gap-3 mb-3">
            <UtensilsCrossed className="h-5 w-5 text-pink-400" />

            <h4 className="font-semibold text-white">
              Categories
            </h4>
          </div>

          <p className="text-sm leading-relaxed text-white/60">
            Categories organize your menu for both staff and customers.
            They are also used throughout the ordering workflow and
            kitchen interface.
          </p>

        </div>

      </div>

    </div>
  );
}
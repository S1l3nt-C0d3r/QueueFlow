import {
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react";

import { QueueInfoProps } from "./types";

export default function QueueInfo({
  waitingCount,
  seatedCount,
  averagePartySize,
}: QueueInfoProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">

      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <Clock className="h-6 w-6 text-blue-400" />

          <h3 className="text-lg font-bold text-white">
            Waiting
          </h3>
        </div>

        <p className="text-4xl font-bold text-blue-400">
          {waitingCount}
        </p>

        <p className="mt-2 text-sm text-white/60">
          Customers currently in queue
        </p>
      </div>

      <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-400" />

          <h3 className="text-lg font-bold text-white">
            Seated Today
          </h3>
        </div>

        <p className="text-4xl font-bold text-green-400">
          {seatedCount}
        </p>

        <p className="mt-2 text-sm text-white/60">
          Successfully seated customers
        </p>
      </div>

      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <Users className="h-6 w-6 text-orange-400" />

          <h3 className="text-lg font-bold text-white">
            Avg Party Size
          </h3>
        </div>

        <p className="text-4xl font-bold text-orange-400">
          {averagePartySize.toFixed(1)}
        </p>

        <p className="mt-2 text-sm text-white/60">
          Guests per reservation
        </p>
      </div>

    </div>
  );
}
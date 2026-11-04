import { motion } from "motion/react";
import {
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

interface SessionHeaderProps {
  restaurantName: string;
  tableNumber: number;
  partySize: number;
  sessionTime: string;
}

export default function SessionHeader({
  restaurantName,
  tableNumber,
  partySize,
  sessionTime,
}: SessionHeaderProps) {

  return (

    <motion.header

      initial={{
        opacity: 0,
        y: -20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      className="
        sticky
        top-0
        z-40
        border-b
        border-white/10
        bg-slate-950/90
        backdrop-blur-xl
      "

    >

      <div className="mx-auto max-w-7xl px-6 py-6">

        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

          {restaurantName}

        </h1>

        <div className="mt-5 grid grid-cols-3 gap-4">

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

            <div className="flex items-center gap-2 text-cyan-400">

              <MapPin size={18} />

              <span className="text-xs uppercase tracking-wide">

                Table

              </span>

            </div>

            <p className="mt-2 text-2xl font-bold text-white">

              {tableNumber}

            </p>

          </div>

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

            <div className="flex items-center gap-2 text-cyan-400">

              <Users size={18} />

              <span className="text-xs uppercase tracking-wide">

                Party

              </span>

            </div>

            <p className="mt-2 text-2xl font-bold text-white">

              {partySize}

            </p>

          </div>

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

            <div className="flex items-center gap-2 text-cyan-400">

              <Clock3 size={18} />

              <span className="text-xs uppercase tracking-wide">

                Time

              </span>

            </div>

            <p className="mt-2 text-2xl font-bold text-white">

              {sessionTime}

            </p>

          </div>

        </div>

      </div>

    </motion.header>

  );

}
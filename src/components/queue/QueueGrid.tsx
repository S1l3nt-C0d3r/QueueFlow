import { AnimatePresence, motion } from "motion/react";
import { Users } from "lucide-react";

import QueueCard from "./QueueCard";
import {
  QueueGridProps,
  QueueStatusSection,
} from "./types";

export default function QueueGrid({
  entries,
  onEdit,
  onDelete,
  onCall,
  onSeat,
  onCancel,
  onNoShow,
}: QueueGridProps) {
  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/20 bg-white/10 p-12 text-center backdrop-blur-xl"
      >
        <Users className="mx-auto mb-4 h-12 w-12 text-white/20" />

        <h3 className="text-lg font-semibold text-white">
          Queue Empty
        </h3>

        <p className="mt-2 text-sm text-white/40">
          There are currently no customers in the queue.
        </p>
      </motion.div>
    );
  }

 const groupedEntries: QueueStatusSection[] = [

  {
    title: "Waiting Queue",
    entries: entries.filter(
      entry =>
        entry.status === "WAITING"
    ),
  },

  {
    title: "Ready To Seat",
    entries: entries.filter(
      entry =>
        entry.status === "CALLED"
    ),
  },

  {
    title: "Recently Seated",
    entries: entries.filter(
      entry =>
        entry.status === "SEATED"
    ),
  },

  {
    title: "Archived",
    entries: entries.filter(
      entry =>
        entry.status === "CANCELLED" ||
        entry.status === "NO_SHOW"
    ),
  },

].filter(
  section =>
    section.entries.length > 0
);

const sectionColors = {

  "Waiting Queue":
    "from-yellow-500 to-orange-500",

  "Ready To Seat":
    "from-green-500 to-emerald-500",

  "Recently Seated":
    "from-cyan-500 to-blue-500",

  Archived:
    "from-red-500 to-red-700",

};

  return (
    <div className="space-y-8">
      {groupedEntries.map((section) => (
        <section
          key={section.title}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className={`h-10 w-1 rounded-full bg-gradient-to-b ${sectionColors[section.title]}`}/>
            <h2 className="text-xl font-bold text-white">
              {section.title}
            </h2>

            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
              {section.entries.length}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {section.entries.map((entry) => (
                <QueueCard
    key={entry.id}
    entry={entry}
    onEdit={onEdit}
    onDelete={onDelete}
    onCall={onCall}
    onSeat={onSeat}
    onCancel={onCancel}
    onNoShow={onNoShow}
/>
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}
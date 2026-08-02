import { AnimatePresence, motion } from "motion/react";
import { UtensilsCrossed } from "lucide-react";

import MenuItemCard from "./MenuItemCard";
import {
  CategorySection,
  MenuGridProps,
} from "./types";

export default function MenuGrid({
  items,
  onEdit,
  onDelete,
}: MenuGridProps) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/20 bg-white/10 p-12 text-center backdrop-blur-xl"
      >
        <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-white/20" />

        <h3 className="text-lg font-semibold text-white">
          No Menu Items
        </h3>

        <p className="mt-2 text-sm text-white/40">
          Create your first menu item to begin accepting orders.
        </p>
      </motion.div>
    );
  }

  const groupedItems: CategorySection[] = Object.entries(
    items.reduce<Record<string, typeof items>>((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }

      groups[item.category].push(item);

      return groups;
    }, {})
  )
    .map(([category, categoryItems]) => ({
      category,
      items: [...categoryItems].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return (
    <div className="space-y-8">
      {groupedItems.map((section) => (
        <section
          key={section.category}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">

            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-orange-500 to-pink-500" />

            <h2 className="text-xl font-bold uppercase tracking-wider text-white">
              {section.category}
            </h2>

            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
              {section.items.length}
            </span>

          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {section.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}
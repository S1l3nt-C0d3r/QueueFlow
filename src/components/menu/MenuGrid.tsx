import { AnimatePresence, motion } from "motion/react";

import { UtensilsCrossed } from "lucide-react";

import MenuItemCard from "./MenuItemCard";

import { MenuGridProps } from "./types";

export default function MenuGrid({
  items,

  onEdit,

  onDelete,
}: MenuGridProps) {
  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (items.length === 0) {
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
          border-white/20
          bg-white/10
          p-12
          text-center
          backdrop-blur-xl
        "
      >
        <UtensilsCrossed
          className="
            mx-auto
            mb-4
            h-12
            w-12
            text-white/20
          "
        />

        <h3 className="text-lg font-semibold text-white">No Menu Items</h3>

        <p className="mt-2 text-sm text-white/40">
          Create your first menu item to begin accepting orders.
        </p>
      </motion.div>
    );
  }

  /*
   * ============================================================
   * SORT ITEMS
   * ============================================================
   *
   * Categories are not persisted by the current backend, so
   * items are simply sorted alphabetically by name.
   */

  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-8">
      {/* ======================================================
          SECTION HEADER
          ====================================================== */}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="
              h-10
              w-1
              rounded-full
              bg-gradient-to-b
              from-orange-500
              to-pink-500
            "
          />

          <h2
            className="
              text-xl
              font-bold
              uppercase
              tracking-wider
              text-white
            "
          >
            Menu Items
          </h2>

          <span
            className="
              rounded-full
              bg-white/10
              px-3
              py-1
              text-xs
              font-semibold
              text-white/60
            "
          >
            {sortedItems.length}
          </span>
        </div>

        {/* ====================================================
            ITEMS
            ==================================================== */}

        <div
          className="
            grid
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          <AnimatePresence>
            {sortedItems.map((item) => (
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
    </div>
  );
}

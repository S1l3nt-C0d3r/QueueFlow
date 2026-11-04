import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "motion/react";

import MenuCard from "./MenuCards";

import { menuService } from "../../services/menu.service";
import { MenuResponse } from "../../types/menu";

const categories = ["All", "Starters", "Main Course", "Desserts", "Beverages"];

interface MenuGridProps {
  getQuantity: (menuItemId: string) => number;

  onAdd: (item: MenuResponse) => void;

  onIncrease: (item: MenuResponse) => void;

  onDecrease: (item: MenuResponse) => void;
}

export default function MenuGrid({
  getQuantity,
  onAdd,
  onIncrease,
  onDecrease,
}: MenuGridProps) {
  const [menu, setMenu] = useState<MenuResponse[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await menuService.getAll();

        setMenu(data);
      } catch (err) {
        console.error("Failed to load menu:", err);

        setError("Unable to load the menu.");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" || item.category === selectedCategory;

      const searchMatch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [menu, selectedCategory, search]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="
            h-10
            w-10
            animate-spin
            rounded-full
            border-2
            border-white/10
            border-t-cyan-400
          "
          />

          <p className="text-white/50">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
        rounded-3xl
        border
        border-red-500/20
        bg-red-500/10
        p-10
        text-center
      "
      >
        <h2 className="text-xl font-semibold text-white">
          Unable to load menu
        </h2>

        <p className="mt-2 text-white/50">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}

      <div className="relative">
        <Search
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-white/40
          "
          size={18}
        />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search menu..."
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/5
            py-4
            pl-12
            pr-4
            text-white
            outline-none
            transition
            focus:border-cyan-500/50
          "
        />
      </div>

      {/* Categories */}

      <div
        className="
        flex
        gap-3
        overflow-x-auto
        pb-2
        scrollbar-none
      "
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            whileTap={{
              scale: 0.96,
            }}
            whileHover={{
              scale: 1.03,
            }}
            onClick={() => setSelectedCategory(category)}
            className={`
              whitespace-nowrap
              rounded-full
              px-5
              py-2
              text-sm
              font-semibold
              transition

              ${
                selectedCategory === category
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }
            `}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Menu */}

      {filteredMenu.length > 0 ? (
        <div
          className="
          grid
          gap-5
          sm:grid-cols-2
          lg:grid-cols-3
        "
        >
          {filteredMenu.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              quantity={getQuantity(item.id)}
              onAdd={onAdd}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
            />
          ))}
        </div>
      ) : (
        <div
          className="
          rounded-2xl
          border
          border-dashed
          border-white/10
          p-16
          text-center
        "
        >
          <h2
            className="
            text-xl
            font-semibold
            text-white
          "
          >
            No dishes found
          </h2>

          <p
            className="
            mt-2
            text-white/50
          "
          >
            Try changing the search or category.
          </p>
        </div>
      )}
    </div>
  );
}

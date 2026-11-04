import { motion } from "motion/react";
import { Leaf, Drumstick, Plus, Star } from "lucide-react";

import { MenuResponse } from "../../types/menu";

interface MenuCardProps {
  item: MenuResponse;

  quantity: number;

  onAdd: (item: MenuResponse) => void;

  onIncrease: (item: MenuResponse) => void;

  onDecrease: (item: MenuResponse) => void;
}

export default function MenuCard({
  item,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
}: MenuCardProps){
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
      "
    >
      {/* Image */}

      <div className="aspect-[4/3] overflow-hidden bg-slate-800">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              bg-gradient-to-br
              from-cyan-900
              to-blue-900
            "
          >
            <span className="text-5xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Body */}

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="
                text-lg
                font-bold
                text-white
              "
            >
              {item.name}
            </h2>

            <p
              className="
                mt-1
                line-clamp-2
                text-sm
                text-white/60
              "
            >
              {item.description}
            </p>
          </div>
        </div>

        {/* Rating + Veg */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-1
              text-yellow-400
            "
          >
            <Star size={16} fill="currentColor" />

            <span className="text-sm">4.8</span>
          </div>

          {item.isVegetarian ? (
            <div
              className="
                flex
                items-center
                gap-1
                rounded-full
                bg-green-500/15
                px-3
                py-1
                text-green-400
              "
            >
              <Leaf size={15} />

              <span className="text-xs">Veg</span>
            </div>
          ) : (
            <div
              className="
                flex
                items-center
                gap-1
                rounded-full
                bg-red-500/15
                px-3
                py-1
                text-red-400
              "
            >
              <Drumstick size={15} />

              <span className="text-xs">Non Veg</span>
            </div>
          )}
        </div>

        {/* Footer */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <div>
            <p
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              ₹{item.price}
            </p>
          </div>

          {quantity === 0 ? (
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => onAdd(item)}
              className="
      flex
      items-center
      gap-2
      rounded-xl
      bg-gradient-to-r
      from-cyan-500
      to-blue-600
      px-5
      py-3
      font-semibold
      text-white
    "
            >
              <Plus size={18} />
              Add
            </motion.button>
          ) : (
            <motion.div
              layout
              className="
      flex
      items-center
      gap-4
      rounded-xl
      bg-gradient-to-r
      from-cyan-500
      to-blue-600
      px-3
      py-2
    "
            >
              <button
                onClick={() => onDecrease(item)}
                className="
        rounded-lg
        bg-white/20
        p-2
      "
              >
                −
              </button>

              <span
                className="
        w-6
        text-center
        text-lg
        font-bold
      "
              >
                {quantity}
              </span>

              <button
                onClick={() => onIncrease(item)}
                className="
        rounded-lg
        bg-white/20
        p-2
      "
              >
                +
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

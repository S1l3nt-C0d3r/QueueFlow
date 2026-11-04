import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

import { MenuResponse } from "../../types/menu";

export interface CartItem {
  item: MenuResponse;
  quantity: number;
}

interface CartViewProps {
  items: CartItem[];

  onIncrease: (item: MenuResponse) => void;

  onDecrease: (item: MenuResponse) => void;

  onRemove?: (item: MenuResponse) => void;

  onPlaceOrder: () => void;

  isPlacingOrder?: boolean;
}

export default function CartView({
  items,
  onIncrease,
  onDecrease,
  onRemove,
  onPlaceOrder,
  isPlacingOrder = false,
}: CartViewProps) {
  /*
   * Empty cart
   */

  if (items.length === 0) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex
          min-h-[50vh]
          flex-col
          items-center
          justify-center
          rounded-3xl
          border
          border-dashed
          border-white/10
          bg-white/[0.02]
          px-6
          py-20
          text-center
        "
      >
        <div
          className="
            mb-6
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-cyan-500/10
          "
        >
          <ShoppingBag size={40} className="text-cyan-400/70" />
        </div>

        <h2
          className="
            text-2xl
            font-semibold
            text-white
          "
        >
          Your cart is empty
        </h2>

        <p
          className="
            mt-3
            max-w-sm
            text-white/50
          "
        >
          Add some delicious dishes from the menu to start building your order.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}

      <div>
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          Your Cart
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-white/50
          "
        >
          Review your items before placing the order.
        </p>
      </div>

      {/* Cart Items */}

      <div className="space-y-3">
        <AnimatePresence>
          {items.map((cartItem) => {
            const itemTotal = Number(cartItem.item.price) * cartItem.quantity;

            return (
              <motion.div
                key={cartItem.item.id}
                layout
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-5
                  backdrop-blur-xl
                "
              >
                <div
                  className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
                >
                  {/* Item Info */}

                  <div className="min-w-0">
                    <h3
                      className="
                        truncate
                        text-lg
                        font-semibold
                        text-white
                      "
                    >
                      {cartItem.item.name}
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-white/50
                      "
                    >
                      ₹{Number(cartItem.item.price).toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity */}

                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-2
                    "
                  >
                    <button
                      type="button"
                      onClick={() => onDecrease(cartItem.item)}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/10
                        text-white
                        transition
                        hover:bg-white/20
                      "
                    >
                      <Minus size={16} />
                    </button>

                    <span
                      className="
                        w-7
                        text-center
                        font-semibold
                        text-white
                      "
                    >
                      {cartItem.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onIncrease(cartItem.item)}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-500
                        text-white
                        transition
                        hover:bg-cyan-400
                      "
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Bottom Row */}

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-between
                    border-t
                    border-white/10
                    pt-4
                  "
                >
                  <button
                    type="button"
                    onClick={() => onRemove?.(cartItem.item)}
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-red-400
                      transition
                      hover:text-red-300
                    "
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>

                  <span
                    className="
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    ₹{itemTotal.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}

      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-6
          backdrop-blur-xl
        "
      >
        <h3
          className="
            mb-5
            text-lg
            font-semibold
            text-white
          "
        >
          Order Summary
        </h3>

        <div className="space-y-3">
          {items.map((cartItem) => {
            const itemTotal = cartItem.item.price * cartItem.quantity;

            return (
              <div
                key={cartItem.item.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <span className="text-white">{cartItem.item.name}</span>

                  <span className="ml-2 text-white/40">
                    × {cartItem.quantity}
                  </span>
                </div>

                <span className="shrink-0 font-medium text-white">
                  ₹{itemTotal.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Place Order */}

        <button
          type="button"
          disabled={isPlacingOrder}
          onClick={onPlaceOrder}
          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            py-4
            text-lg
            font-semibold
            text-white
            shadow-lg
            shadow-cyan-500/10
            transition
            hover:from-cyan-400
            hover:to-blue-500
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isPlacingOrder ? (
            <>
              <span
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-white
                "
              />
              Placing Order...
            </>
          ) : (
            <>
              Place Order
              <ArrowRight size={20} />
            </>
          )}
        </button>

        <p
          className="
            mt-3
            text-center
            text-xs
            text-white/40
          "
        >
          You can review your order before submitting it.
        </p>
      </div>
    </div>
  );
}

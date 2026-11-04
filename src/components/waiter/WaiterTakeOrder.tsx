import {
  ArrowLeft,
  Check,
  ChevronDown,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
  Utensils,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

export interface WaiterMenuItem {
  id: string;

  name: string;

  description?: string | null;

  price: number;

  categoryId?: string | null;

  categoryName?: string | null;

  available?: boolean;

  imageUrl?: string | null;
}

export interface WaiterSelectedItem {
  menuItemId: string;

  name: string;

  quantity: number;

  unitPrice: number;

  notes?: string;
}

interface WaiterTakeOrderProps {
  tableNumber: string;

  customerName?: string | null;

  menuItems: WaiterMenuItem[];

  isLoading?: boolean;

  isSubmitting?: boolean;

  error?: string | null;

  onBack: () => void;

  /**
   * Called when the waiter confirms the order.
   *
   * The parent/service layer will create the actual
   * order using the active dining session.
   */
  onSubmitOrder: (items: WaiterSelectedItem[]) => void;
}

function formatPrice(price: number) {
  return `₹${price.toFixed(2)}`;
}

export default function WaiterTakeOrder({
  tableNumber,
  customerName,
  menuItems,
  isLoading = false,
  isSubmitting = false,
  error = null,
  onBack,
  onSubmitOrder,
}: WaiterTakeOrderProps) {
  const [selectedItems, setSelectedItems] = useState<
    Record<string, WaiterSelectedItem>
  >({});

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [showReview, setShowReview] = useState(false);

  /*
   * ============================================================
   * CATEGORIES
   * ============================================================
   */

  const categories = useMemo(() => {
    const values = menuItems
      .map((item) => item.categoryName)
      .filter((value): value is string => Boolean(value));

    return ["ALL", ...Array.from(new Set(values))];
  }, [menuItems]);

  /*
   * ============================================================
   * FILTER MENU
   * ============================================================
   */

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      const categoryMatches =
        selectedCategory === "ALL" || item.categoryName === selectedCategory;

      const searchMatches =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query);

      return categoryMatches && searchMatches;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  /*
   * ============================================================
   * SELECTED ITEMS
   * ============================================================
   */

  const selectedList = Object.values(selectedItems);

  const totalItems = selectedList.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalAmount = selectedList.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  /*
   * ============================================================
   * QUANTITY
   * ============================================================
   */

  const addItem = (item: WaiterMenuItem) => {
    setSelectedItems((current) => {
      const existing = current[item.id];

      return {
        ...current,

        [item.id]: {
          menuItemId: item.id,

          name: item.name,

          quantity: existing ? existing.quantity + 1 : 1,

          unitPrice: item.price,

          notes: existing?.notes,
        },
      };
    });
  };

  const removeItem = (itemId: string) => {
    setSelectedItems((current) => {
      const existing = current[itemId];

      if (!existing) {
        return current;
      }

      if (existing.quantity <= 1) {
        const next = {
          ...current,
        };

        delete next[itemId];

        return next;
      }

      return {
        ...current,

        [itemId]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };
    });
  };

  const getQuantity = (itemId: string) => {
    return selectedItems[itemId]?.quantity ?? 0;
  };

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = () => {
    if (selectedList.length === 0 || isSubmitting) {
      return;
    }

    onSubmitOrder(selectedList);
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        x: 15,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="
        relative
        min-h-full
        w-full
        pb-28
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div
        className="
          sticky
          top-0
          z-30
          -mx-4
          flex
          items-center
          gap-3
          border-b
          border-white/10
          bg-slate-950/90
          px-4
          py-3
          backdrop-blur-xl
          sm:-mx-6
          sm:px-6
        "
      >
        <motion.button
          type="button"
          whileTap={{
            scale: 0.92,
          }}
          onClick={onBack}
          disabled={isSubmitting}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-white/5
            text-white/70
            disabled:opacity-40
          "
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-wider text-white/30">
            New Order
          </p>

          <h1 className="truncate text-lg font-bold text-white">
            Table {tableNumber}
          </h1>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-xl
            border
            border-blue-400/10
            bg-blue-400/5
            px-3
            py-2
            text-xs
            font-medium
            text-blue-300
          "
        >
          <ShoppingBag className="h-3.5 w-3.5" />

          {totalItems}
        </div>
      </div>

      {/* ======================================================
          CUSTOMER
          ====================================================== */}

      {customerName && (
        <div
          className="
            mt-4
            rounded-2xl
            border
            border-white/5
            bg-white/[0.025]
            px-4
            py-3
          "
        >
          <p className="text-[9px] uppercase tracking-wider text-white/25">
            Customer
          </p>

          <p className="mt-1 text-sm font-medium text-white/70">
            {customerName}
          </p>
        </div>
      )}

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div
          className="
            mt-4
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/5
            p-4
            text-sm
            text-red-300
          "
        >
          {error}
        </div>
      )}

      {/* ======================================================
          SEARCH
          ====================================================== */}

      <div className="relative mt-4">
        <Search
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-white/25
          "
        />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search menu..."
          disabled={isSubmitting}
          className="
            min-h-12
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            pl-11
            pr-4
            text-sm
            text-white
            outline-none
            placeholder:text-white/25
            focus:border-blue-400/30
            disabled:opacity-40
          "
        />
      </div>

      {/* ======================================================
          CATEGORIES
          ====================================================== */}

      <div
        className="
          mt-3
          flex
          gap-2
          overflow-x-auto
          pb-1
          scrollbar-none
        "
      >
        {categories.map((category) => {
          const selected = selectedCategory === category;

          return (
            <motion.button
              key={category}
              type="button"
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => setSelectedCategory(category)}
              disabled={isSubmitting}
              className={`
                  min-h-10
                  shrink-0
                  rounded-xl
                  border
                  px-4
                  text-xs
                  font-semibold
                  transition

                  ${
                    selected
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                      : "border-white/5 bg-white/[0.02] text-white/40"
                  }
                `}
            >
              {category === "ALL" ? "All" : category}
            </motion.button>
          );
        })}
      </div>

      {/* ======================================================
          MENU
          ====================================================== */}

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70">Menu</h2>

          <p className="text-[10px] text-white/25">
            {filteredItems.length} items
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                    h-24
                    animate-pulse
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.04]
                  "
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-8
              text-center
            "
          >
            <Search className="mx-auto h-6 w-6 text-white/20" />

            <p className="mt-3 text-sm text-white/50">No menu items found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const quantity = getQuantity(item.id);

              const unavailable = item.available === false;

              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      p-4
                      ${
                        unavailable
                          ? "border-white/5 bg-white/[0.02] opacity-40"
                          : quantity > 0
                            ? "border-blue-400/20 bg-blue-500/[0.07]"
                            : "border-white/10 bg-white/[0.035]"
                      }
                    `}
                >
                  <div className="flex items-center gap-3">
                    {/* ITEM IMAGE / ICON */}

                    <div
                      className="
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-2xl
                          bg-gradient-to-br
                          from-blue-500/10
                          to-cyan-500/5
                        "
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="
                              h-full
                              w-full
                              object-cover
                            "
                        />
                      ) : (
                        <Utensils className="h-5 w-5 text-blue-300/50" />
                      )}
                    </div>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {item.name}
                          </h3>

                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/30">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-sm font-bold text-white/75">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {unavailable && (
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-red-300/70">
                          Unavailable
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ==================================================
                        QUANTITY CONTROL
                        ================================================== */}

                  {!unavailable && (
                    <div className="mt-3 flex items-center justify-end">
                      {quantity === 0 ? (
                        <motion.button
                          type="button"
                          whileTap={{
                            scale: 0.94,
                          }}
                          onClick={() => addItem(item)}
                          disabled={isSubmitting}
                          className="
                              flex
                              min-h-11
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-blue-400/15
                              bg-blue-500/10
                              px-5
                              text-xs
                              font-semibold
                              text-blue-300
                              transition
                              disabled:opacity-40
                            "
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </motion.button>
                      ) : (
                        <div
                          className="
                              flex
                              min-h-11
                              items-center
                              gap-3
                              rounded-xl
                              border
                              border-blue-400/15
                              bg-blue-500/10
                              px-2
                            "
                        >
                          <motion.button
                            type="button"
                            whileTap={{
                              scale: 0.88,
                            }}
                            onClick={() => removeItem(item.id)}
                            disabled={isSubmitting}
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                bg-white/5
                                text-white/60
                              "
                            aria-label={`Remove ${item.name}`}
                          >
                            <Minus className="h-4 w-4" />
                          </motion.button>

                          <span
                            className="
                                min-w-5
                                text-center
                                text-sm
                                font-bold
                                text-white
                              "
                          >
                            {quantity}
                          </span>

                          <motion.button
                            type="button"
                            whileTap={{
                              scale: 0.88,
                            }}
                            onClick={() => addItem(item)}
                            disabled={isSubmitting}
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                bg-white/5
                                text-white/60
                              "
                            aria-label={`Add another ${item.name}`}
                          >
                            <Plus className="h-4 w-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================
          STICKY ORDER SUMMARY
          ====================================================== */}

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-40
              border-t
              border-white/10
              bg-slate-950/95
              p-3
              pb-[max(0.75rem,env(safe-area-inset-bottom))]
              backdrop-blur-xl
            "
          >
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              {/* SUMMARY */}

              <button
                type="button"
                onClick={() => setShowReview(true)}
                disabled={isSubmitting}
                className="
                  min-w-0
                  flex-1
                  text-left
                "
              >
                <p className="text-[9px] uppercase tracking-wider text-white/30">
                  Order
                </p>

                <p className="truncate text-sm font-semibold text-white">
                  {totalItems} {totalItems === 1 ? "item" : "items"} ·{" "}
                  {formatPrice(totalAmount)}
                </p>
              </button>

              {/* REVIEW */}

              <motion.button
                type="button"
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() => setShowReview(true)}
                disabled={isSubmitting}
                className="
                  flex
                  min-h-12
                  items-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-500
                  to-cyan-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-500/10
                  disabled:opacity-40
                "
              >
                Review
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          REVIEW SHEET
          ====================================================== */}

      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-end
              justify-center
              bg-black/70
              backdrop-blur-sm
            "
            onClick={() => setShowReview(false)}
          >
            <motion.div
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 300,
              }}
              onClick={(event) => event.stopPropagation()}
              className="
                max-h-[85vh]
                w-full
                overflow-y-auto
                rounded-t-3xl
                border
                border-white/10
                bg-slate-900
                p-5
                pb-[max(1.25rem,env(safe-area-inset-bottom))]
              "
            >
              {/* SHEET HEADER */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">
                    Table {tableNumber}
                  </p>

                  <h2 className="text-lg font-bold text-white">Review Order</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/5
                    text-white/50
                  "
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* SELECTED ITEMS */}

              <div className="mt-5 space-y-2">
                {selectedList.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-white/5
                        bg-white/[0.03]
                        p-3
                      "
                  >
                    <span
                      className="
                          flex
                          h-8
                          min-w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-blue-500/10
                          px-2
                          text-xs
                          font-bold
                          text-blue-300
                        "
                    >
                      {item.quantity}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm text-white/75">
                      {item.name}
                    </span>

                    <span className="text-xs font-medium text-white/45">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* TOTAL */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  border-t
                  border-white/10
                  pt-4
                "
              >
                <span className="text-sm text-white/40">Total</span>

                <span className="text-xl font-bold text-white">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              {/* SUBMIT */}

              <motion.button
                type="button"
                whileTap={{
                  scale: 0.98,
                }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="
                  mt-5
                  flex
                  min-h-14
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-500
                  to-cyan-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {isSubmitting ? (
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
                    <Check className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </motion.button>

              <p className="mt-3 text-center text-[10px] leading-4 text-white/20">
                The order will be added to this table's active dining session.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

import {
  ClipboardList,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  Utensils,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import WaiterOrderCard, { type WaiterOrder } from "./WaiterOrderCard";

interface WaiterOrderListProps {
  orders: WaiterOrder[];

  onStatusChange?: (
    order: WaiterOrder,
    status: "PREPARING" | "DELIVERED",
  ) => void;

  onDelete?: (order: WaiterOrder) => void;

  onOrderSelect?: (order: WaiterOrder) => void;

  isLoading?: boolean;

  isRefreshing?: boolean;

  updatingOrderId?: string | null;

  deletingOrderId?: string | null;

  error?: string | null;

  onRefresh?: () => void;
}

type OrderFilter = "ALL" | "PLACED" | "PREPARING" | "DELIVERED";

const FILTERS: {
  value: OrderFilter;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "PLACED",
    label: "Placed",
  },
  {
    value: "PREPARING",
    label: "Preparing",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
  },
];

function getStatusCount(orders: WaiterOrder[], status: OrderFilter) {
  if (status === "ALL") {
    return orders.length;
  }

  return orders.filter((order) => String(order.status).toUpperCase() === status)
    .length;
}

function OrderListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({
        length: 3,
      }).map((_, index) => (
        <div
          key={index}
          className="
            animate-pulse
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-4
          "
        >
          <div className="flex justify-between">
            <div className="h-10 w-28 rounded-xl bg-white/10" />

            <div className="h-7 w-20 rounded-full bg-white/10" />
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-12 rounded-2xl bg-white/5" />
            <div className="h-12 rounded-2xl bg-white/5" />
          </div>

          <div className="mt-4 h-12 rounded-2xl bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export default function WaiterOrderList({
  orders,
  onStatusChange,
  onDelete,
  onOrderSelect,
  isLoading = false,
  isRefreshing = false,
  updatingOrderId = null,
  deletingOrderId = null,
  error = null,
  onRefresh,
}: WaiterOrderListProps) {
  const [filter, setFilter] = useState<OrderFilter>("ALL");

  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders
      .filter((order) => {
        if (filter === "ALL") {
          return true;
        }

        return String(order.status).toUpperCase() === filter;
      })
      .filter((order) => {
        if (!query) {
          return true;
        }

        const table = order.tableNumber ?? "";

        const orderId = order.id;

        const customer = order.customerName ?? "";

        const items = order.items.map((item) => item.name).join(" ");

        const searchable = `
              ${table}
              ${orderId}
              ${customer}
              ${items}
            `.toLowerCase();

        return searchable.includes(query);
      });
  }, [orders, filter, searchQuery]);

  const activeOrders = orders.filter((order) => {
    const status = String(order.status).toUpperCase();

    return status === "PLACED" || status === "PREPARING";
  }).length;

  return (
    <section className="w-full">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
                text-blue-300
              "
            >
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Orders</h2>

              <p className="text-xs text-white/35">
                {activeOrders} active {activeOrders === 1 ? "order" : "orders"}
              </p>
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.92,
          }}
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            text-white/50
            transition
            hover:bg-white/[0.08]
            hover:text-white
            disabled:opacity-40
          "
          aria-label="Refresh orders"
        >
          <RefreshCw
            className={`
              h-4
              w-4
              ${isRefreshing ? "animate-spin" : ""}
            `}
          />
        </motion.button>
      </div>

      {/* ======================================================
          SEARCH
          ====================================================== */}

      <div className="relative">
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
          placeholder="Search table, customer or item..."
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
            focus:bg-white/[0.06]
          "
        />
      </div>

      {/* ======================================================
          FILTERS
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
        <div
          className="
            flex
            h-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/5
            bg-white/[0.02]
            px-2
            text-white/25
          "
        >
          <Filter className="h-3.5 w-3.5" />
        </div>

        {FILTERS.map((item) => {
          const count = getStatusCount(orders, item.value);

          const selected = filter === item.value;

          return (
            <motion.button
              key={item.value}
              type="button"
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => setFilter(item.value)}
              className={`
                  flex
                  h-10
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-3
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
              {item.label}

              <span
                className={`
                    rounded-full
                    px-1.5
                    py-0.5
                    text-[9px]

                    ${
                      selected
                        ? "bg-blue-400/10 text-blue-300"
                        : "bg-white/5 text-white/25"
                    }
                  `}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

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
          LOADING
          ====================================================== */}

      {isLoading ? (
        <div className="mt-4">
          <OrderListSkeleton />
        </div>
      ) : filteredOrders.length === 0 ? (
        /* ====================================================
           EMPTY
           ==================================================== */

        <div
          className="
            mt-4
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            px-6
            py-10
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-white/5
              text-white/25
            "
          >
            {searchQuery ? (
              <Search className="h-6 w-6" />
            ) : (
              <ClipboardList className="h-6 w-6" />
            )}
          </div>

          <h3 className="mt-4 text-sm font-semibold text-white/70">
            {searchQuery
              ? "No matching orders"
              : filter === "ALL"
                ? "No orders"
                : `No ${filter.toLowerCase()} orders`}
          </h3>

          <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/30">
            {searchQuery
              ? "Try searching for another table, customer or menu item."
              : "Orders placed by customers will appear here."}
          </p>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="
                mt-4
                min-h-10
                rounded-xl
                bg-white/5
                px-4
                text-xs
                font-medium
                text-white/50
              "
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* ====================================================
           ORDER LIST
           ==================================================== */

        <div className="mt-4">
          {/* Count */}

          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-white/25">
              Showing {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"}
            </p>

            {filter === "ALL" && activeOrders > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-blue-300/60">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {activeOrders} active
              </div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <motion.div key={order.id} layout>
                  <WaiterOrderCard
                    order={order}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    isUpdating={updatingOrderId === order.id}
                    isDeleting={deletingOrderId === order.id}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* ======================================================
          MOBILE HELPER
          ====================================================== */}

      {filteredOrders.length > 0 && (
        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
            text-center
            text-[10px]
            text-white/20
          "
        >
          <Clock3 className="h-3 w-3" />
          Keep order statuses updated during service
        </div>
      )}
    </section>
  );
}

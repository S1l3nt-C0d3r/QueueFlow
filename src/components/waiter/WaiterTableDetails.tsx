import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  Receipt,
  UserRound,
  Users,
  Utensils,
  UserRoundCheck,
} from "lucide-react";
import { motion } from "motion/react";

import type { WaiterTable } from "./WaiterGrid";

import type { WaiterOrder } from "./WaiterOrderCard";

interface WaiterTableDetailsProps {
  table: WaiterTable;

  currentWaiterId?: string | null;

  orders?: WaiterOrder[];

  isAssigning?: boolean;

  isLoadingOrders?: boolean;

  error?: string | null;

  onBack: () => void;

  /**
   * Attach the currently logged-in waiter
   * to this table's active dining session.
   */
  onAssignToMe?: (table: WaiterTable) => void;

  /**
   * Open the order creation flow.
   */
  onAddOrder?: (table: WaiterTable) => void;

  /**
   * Open an individual order.
   */
  onOrderSelect?: (order: WaiterOrder) => void;

  /**
   * Open bill information.
   */
  onViewBill?: (table: WaiterTable) => void;
}

function getStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "AVAILABLE":
      return "Available";

    case "OCCUPIED":
      return "Occupied";

    case "BILL_REQUESTED":
      return "Bill Requested";

    case "RESERVED":
      return "Reserved";

    case "CLEANING":
      return "Cleaning";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case "AVAILABLE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "BILL_REQUESTED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "RESERVED":
      return "border-purple-400/20 bg-purple-400/10 text-purple-300";

    case "CLEANING":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

    case "OCCUPIED":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

function getOrderStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case "PLACED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "PREPARING":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "DELIVERED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

export default function WaiterTableDetails({
  table,
  currentWaiterId,
  orders = [],
  isAssigning = false,
  isLoadingOrders = false,
  error = null,
  onBack,
  onAssignToMe,
  onAddOrder,
  onOrderSelect,
  onViewBill,
}: WaiterTableDetailsProps) {
  const isAssignedToMe = Boolean(
    currentWaiterId && table.waiterStaffId === currentWaiterId,
  );

  const hasOtherWaiter = Boolean(table.waiterStaffId && !isAssignedToMe);

  const hasActiveSession = Boolean(table.diningSessionId);

  const isBillRequested =
    String(table.status).toUpperCase() === "BILL_REQUESTED";

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
        min-h-full
        w-full
        pb-6
      "
    >
      {/* ======================================================
          TOP BAR
          ====================================================== */}

      <div
        className="
          sticky
          top-0
          z-20
          -mx-4
          mb-4
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
            transition
            hover:bg-white/10
            hover:text-white
          "
          aria-label="Back to tables"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-wider text-white/30">
            Table
          </p>

          <h1 className="truncate text-lg font-bold text-white">
            {table.tableNumber}
          </h1>
        </div>

        <div
          className={`
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1.5
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            ${getStatusClass(table.status)}
          `}
        >
          <span>{getStatusLabel(table.status)}</span>
        </div>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div
          className="
            mb-4
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
          TABLE SUMMARY
          ====================================================== */}

      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.045]
          p-5
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-blue-500/20
              to-cyan-500/10
              text-blue-300
            "
          >
            <span className="text-2xl font-bold">{table.tableNumber}</span>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white">
              Table {table.tableNumber}
            </h2>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 text-xs text-white/45">
                <Users className="h-3.5 w-3.5" />
                {table.capacity} seats
              </div>

              {table.partySize && table.partySize > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-white/45">
                  <UserRound className="h-3.5 w-3.5" />
                  {table.partySize} {table.partySize === 1 ? "guest" : "guests"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            CUSTOMER
            ==================================================== */}

        {hasActiveSession && (
          <div
            className="
              mt-5
              border-t
              border-white/5
              pt-4
            "
          >
            <p className="text-[9px] uppercase tracking-wider text-white/30">
              Customer
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/5
                  text-white/40
                "
              >
                <UserRound className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/80">
                  {table.customerName || "Customer"}
                </p>

                <p className="text-xs text-white/30">Active dining session</p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            WAITER ASSIGNMENT
            ==================================================== */}

        <div
          className="
            mt-5
            border-t
            border-white/5
            pt-4
          "
        >
          <p className="text-[9px] uppercase tracking-wider text-white/30">
            Waiter
          </p>

          {isAssignedToMe ? (
            <div
              className="
                mt-2
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-cyan-400/15
                bg-cyan-400/5
                p-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                  text-cyan-300
                "
              >
                <UserRoundCheck className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-cyan-300">
                  Assigned to you
                </p>

                <p className="text-[11px] text-white/35">
                  You are responsible for this table
                </p>
              </div>

              <CheckCircle2 className="ml-auto h-5 w-5 text-cyan-300/70" />
            </div>
          ) : hasOtherWaiter ? (
            <div
              className="
                mt-2
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                p-3
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/5
                    text-white/40
                  "
                >
                  <UserRound className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white/70">
                    Another waiter is assigned
                  </p>

                  <p className="mt-0.5 text-[11px] text-white/30">
                    This table already has a waiter
                  </p>
                </div>
              </div>
            </div>
          ) : hasActiveSession ? (
            <motion.button
              type="button"
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => onAssignToMe?.(table)}
              disabled={isAssigning}
              className="
                mt-2
                flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-blue-500
                to-cyan-600
                px-4
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-500/10
                transition
                hover:from-blue-400
                hover:to-cyan-500
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isAssigning ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Assigning...
                </>
              ) : (
                <>
                  <UserRoundCheck className="h-4 w-4" />
                  Assign Table to Me
                </>
              )}
            </motion.button>
          ) : (
            <div
              className="
                mt-2
                rounded-2xl
                border
                border-white/5
                bg-white/[0.02]
                p-3
                text-xs
                text-white/30
              "
            >
              No active dining session. There is currently nobody to assign this
              table to.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          QUICK ACTIONS
          ====================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
        "
      >
        <motion.button
          type="button"
          whileTap={{
            scale: 0.97,
          }}
          onClick={() => onAddOrder?.(table)}
          disabled={!hasActiveSession || !isAssignedToMe}
          className="
            flex
            min-h-14
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-blue-400/15
            bg-blue-500/10
            px-3
            text-sm
            font-semibold
            text-blue-300
            transition
            hover:bg-blue-500/15
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <Plus className="h-5 w-5" />
          Add Order
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.97,
          }}
          onClick={() => onViewBill?.(table)}
          disabled={!hasActiveSession || !isAssignedToMe}
          className={`
            flex
            min-h-14
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            px-3
            text-sm
            font-semibold
            transition
            disabled:cursor-not-allowed
            disabled:opacity-30

            ${
              isBillRequested
                ? "border-orange-400/20 bg-orange-400/10 text-orange-300"
                : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07]"
            }
          `}
        >
          <Receipt className="h-5 w-5" />

          {isBillRequested ? "View Bill" : "Bill"}
        </motion.button>
      </div>

      {/* ======================================================
          ORDERS
          ====================================================== */}

      <div className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Orders</h2>

            <p className="mt-1 text-xs text-white/35">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>

          {hasOrders(orders) && (
            <span className="text-[10px] text-white/30">
              Tap an order for details
            </span>
          )}
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="
                    animate-pulse
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-5
                  "
              >
                <div className="h-5 w-24 rounded bg-white/10" />

                <div className="mt-4 h-4 w-full rounded bg-white/5" />

                <div className="mt-2 h-4 w-3/4 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
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
              <Utensils className="h-6 w-6" />
            </div>

            <p className="mt-4 text-sm font-medium text-white/60">
              No orders yet
            </p>

            <p className="mt-1 text-xs text-white/30">
              Orders placed by the customer will appear here.
            </p>

            {isAssignedToMe && (
              <button
                type="button"
                onClick={() => onAddOrder?.(table)}
                className="
                  mt-5
                  inline-flex
                  min-h-11
                  items-center
                  gap-2
                  rounded-2xl
                  bg-blue-500/10
                  px-5
                  text-sm
                  font-semibold
                  text-blue-300
                "
              >
                <Plus className="h-4 w-4" />
                Take an Order
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = String(order.status).toUpperCase();

              return (
                <motion.button
                  key={order.id}
                  type="button"
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() => onOrderSelect?.(order)}
                  className="
                      w-full
                      rounded-3xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      p-4
                      text-left
                      transition
                      hover:bg-white/[0.07]
                    "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Order #{order.id.slice(0, 8)}
                      </p>

                      <p className="mt-1 text-xs text-white/35">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    <div
                      className={`
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-wide
                          ${getOrderStatusClass(status)}
                        `}
                    >
                      {status}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/60">
                          {item.quantity}×
                        </span>

                        <span className="truncate text-xs text-white/45">
                          {item.name}
                        </span>
                      </div>
                    ))}

                    {order.items.length > 3 && (
                      <p className="text-[10px] text-white/25">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-white/20" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}

function hasOrders(orders: WaiterOrder[]) {
  return orders.length > 0;
}

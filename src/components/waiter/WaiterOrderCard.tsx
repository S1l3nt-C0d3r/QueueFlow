import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock3,
  PackageCheck,
  Trash2,
  Utensils,
} from "lucide-react";
import { motion } from "motion/react";

export type WaiterOrderStatus = "PLACED" | "PREPARING" | "DELIVERED" | string;

export interface WaiterOrderItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  notes?: string | null;
}

export interface WaiterOrder {
  id: string;

  restaurantId: string;

  sessionId: string;

  tableId: string;

  /**
   * Current waiter associated with the order.
   */
  waiterId?: string | null;

  status: WaiterOrderStatus;

  items: WaiterOrderItem[];

  /**
   * Display-only information supplied by the
   * parent component / backend response.
   */
  tableNumber?: string | null;

  customerName?: string | null;

  createdAt?: string;

  updatedAt?: string;

  notes?: string | null;
}

interface WaiterOrderCardProps {
  order: WaiterOrder;

  /**
   * Move:
   *
   * PLACED -> PREPARING
   * PREPARING -> DELIVERED
   */
  onStatusChange?: (
    order: WaiterOrder,
    status: "PREPARING" | "DELIVERED",
  ) => void;

  /**
   * Cancel/delete an order.
   */
  onDelete?: (order: WaiterOrder) => void;

  isUpdating?: boolean;

  isDeleting?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  PLACED: {
    label: "Placed",
    description: "Waiting to be prepared",
    className: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    icon: Clock3,
  },

  PREPARING: {
    label: "Preparing",
    description: "Currently being prepared",
    className: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    icon: Utensils,
  },

  DELIVERED: {
    label: "Delivered",
    description: "Delivered to the customer",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    icon: PackageCheck,
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status.toUpperCase()] ?? STATUS_CONFIG.PLACED;
}

function getNextStatus(status: string): "PREPARING" | "DELIVERED" | null {
  switch (status.toUpperCase()) {
    case "PLACED":
      return "PREPARING";

    case "PREPARING":
      return "DELIVERED";

    default:
      return null;
  }
}

function getNextStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "PLACED":
      return "Start Preparing";

    case "PREPARING":
      return "Mark Delivered";

    default:
      return null;
  }
}

function formatTime(timestamp?: string) {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WaiterOrderCard({
  order,
  onStatusChange,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: WaiterOrderCardProps) {
  const status = String(order.status).toUpperCase();

  const config = getStatusConfig(status);

  const StatusIcon = config.icon;

  const nextStatus = getNextStatus(status);

  const nextStatusLabel = getNextStatusLabel(status);

  const isBusy = isUpdating || isDeleting;

  /*
   * Delivered orders should not be deleted
   * from the waiter interface.
   *
   * They are already completed operationally.
   */
  const canDelete = status !== "DELIVERED";

  return (
    <motion.article
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
        y: -10,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.045]
        shadow-lg
        shadow-black/10
      "
    >
      {/* ======================================================
          STATUS ACCENT
          ====================================================== */}

      <div
        className={`
          h-1
          w-full
          ${
            status === "PLACED"
              ? "bg-orange-400"
              : status === "PREPARING"
                ? "bg-blue-400"
                : status === "DELIVERED"
                  ? "bg-emerald-400"
                  : "bg-white/20"
          }
        `}
      />

      <div className="p-4 sm:p-5">
        {/* ====================================================
            HEADER
            ==================================================== */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-blue-300
                "
              >
                <Utensils className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/30">
                  Order
                </p>

                <h3 className="truncate text-sm font-bold text-white">
                  #{order.id.slice(0, 8)}
                </h3>
              </div>
            </div>

            {order.tableNumber && (
              <p className="mt-2 text-xs text-white/45">
                Table{" "}
                <span className="font-semibold text-white/70">
                  {order.tableNumber}
                </span>
              </p>
            )}
          </div>

          {/* STATUS */}

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
              text-[9px]
              font-semibold
              uppercase
              tracking-wide
              ${config.className}
            `}
          >
            <StatusIcon className="h-3.5 w-3.5" />

            {config.label}
          </div>
        </div>

        {/* ====================================================
            TIME
            ==================================================== */}

        {order.createdAt && (
          <div
            className="
              mt-3
              flex
              items-center
              gap-1.5
              text-[10px]
              text-white/30
            "
          >
            <Clock3 className="h-3 w-3" />
            Placed at {formatTime(order.createdAt) ?? "—"}
          </div>
        )}

        {/* ====================================================
            ITEMS
            ==================================================== */}

        <div className="mt-4 space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="
                  rounded-2xl
                  border
                  border-white/5
                  bg-black/10
                  px-3
                  py-3
                "
            >
              <div className="flex items-start gap-3">
                {/* QUANTITY */}

                <div
                  className="
                      flex
                      h-7
                      min-w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/10
                      px-1.5
                      text-xs
                      font-bold
                      text-white/80
                    "
                >
                  {item.quantity}
                </div>

                {/* ITEM */}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/85">
                    {item.name}
                  </p>

                  {item.notes && (
                    <div className="mt-1 flex items-start gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-orange-300/60" />

                      <p className="text-[10px] leading-4 text-orange-300/70">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* PRICE */}

                {typeof item.unitPrice === "number" && (
                  <span className="shrink-0 text-xs text-white/35">
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ====================================================
            ORDER NOTE
            ==================================================== */}

        {order.notes && (
          <div
            className="
              mt-3
              flex
              gap-2
              rounded-2xl
              border
              border-orange-400/10
              bg-orange-400/5
              p-3
            "
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300/70" />

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-orange-300/50">
                Order Note
              </p>

              <p className="mt-1 text-xs leading-5 text-orange-200/70">
                {order.notes}
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            STATUS DESCRIPTION
            ==================================================== */}

        <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
          <div
            className={`
              h-1.5
              w-1.5
              rounded-full

              ${
                status === "PLACED"
                  ? "bg-orange-400"
                  : status === "PREPARING"
                    ? "bg-blue-400"
                    : "bg-emerald-400"
              }
            `}
          />

          <p className="text-[10px] text-white/35">{config.description}</p>
        </div>

        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="mt-4 flex gap-2">
          {/* NEXT STATUS */}

          {nextStatus && nextStatusLabel && (
            <motion.button
              type="button"
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => onStatusChange?.(order, nextStatus)}
              disabled={isBusy}
              className="
                  flex
                  min-h-12
                  flex-1
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
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
            >
              {isUpdating ? (
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
                  Updating...
                </>
              ) : (
                <>
                  {nextStatus === "PREPARING" ? (
                    <Utensils className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  {nextStatusLabel}

                  <ChevronRight className="h-4 w-4 opacity-50" />
                </>
              )}
            </motion.button>
          )}

          {/* DELETE */}

          {canDelete && (
            <motion.button
              type="button"
              whileTap={{
                scale: 0.94,
              }}
              onClick={() => onDelete?.(order)}
              disabled={isBusy}
              className="
                flex
                min-h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-red-500/15
                bg-red-500/5
                text-red-400
                transition
                active:bg-red-500/10
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="Cancel order"
            >
              {isDeleting ? (
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-red-400/30
                    border-t-red-400
                  "
                />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </motion.button>
          )}
        </div>

        {/* ====================================================
            DELIVERED
            ==================================================== */}

        {status === "DELIVERED" && (
          <div
            className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-emerald-400/10
              bg-emerald-400/5
              py-3
              text-xs
              font-medium
              text-emerald-300/70
            "
          >
            <Check className="h-4 w-4" />
            Order delivered
          </div>
        )}
      </div>
    </motion.article>
  );
}

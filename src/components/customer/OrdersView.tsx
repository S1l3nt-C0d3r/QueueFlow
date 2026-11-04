import { useCallback, useEffect, useState } from "react";

import {
  Clock3,
  RefreshCw,
  PackageCheck,
  ChefHat,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { motion } from "motion/react";

import { orderService } from "../../services/orders.service";

import { OrderResponse, OrderStatus } from "../../types/orders";

interface OrdersViewProps {
  sessionId: string;
  sessionToken: string;
}

export default function OrdersView({
  sessionId,
  sessionToken,
}: OrdersViewProps) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * ============================================================
   * LOAD CUSTOMER ORDERS
   * ============================================================
   */

  const loadOrders = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        if (!sessionId || !sessionToken) {
          throw new Error("Invalid dining session.");
        }

        const result = await orderService.getCustomerOrders(
          sessionId,
          sessionToken,
        );

        setOrders(result);
      } catch (err) {
        console.error("Failed to load customer orders:", err);

        setError("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sessionId, sessionToken],
  );

  /**
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    void loadOrders();

    /*
     * Keep customer order statuses fresh while this view is mounted.
     * We use the existing customer-orders endpoint, so no backend
     * socket/event contract is being invented here.
     */
    const interval = window.setInterval(() => {
      void loadOrders(true);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadOrders]);

  /**
   * ============================================================
   * STATUS
   * ============================================================
   */

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "open":
        return "Placed";

      case "preparing":
        return "Preparing";

      case "ready":
        return "Ready";

      case "served":
        return "Served";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "preparing":
        return <ChefHat size={18} />;

      case "ready":
        return <PackageCheck size={18} />;

      case "served":
      case "completed":
        return <CheckCircle2 size={18} />;

      case "cancelled":
        return <XCircle size={18} />;

      default:
        return <Clock3 size={18} />;
    }
  };

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case "preparing":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";

      case "ready":
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";

      case "served":
      case "completed":
        return "border-green-500/20 bg-green-500/10 text-green-400";

      case "cancelled":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      default:
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    }
  };

  /**
   * ============================================================
   * DATE
   * ============================================================
   */

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Your Orders</h2>

          <p className="mt-1 text-sm text-white/50">
            Orders from your dining session
          </p>
        </div>

        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />

            <p className="mt-4 text-sm text-white/50">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Orders</h2>

            <p className="mt-1 text-sm text-white/50">
              Orders from your dining session
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Retry
          </button>
        </div>

        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 px-6 text-center">
          <div>
            <XCircle size={48} className="mx-auto text-red-400/70" />

            <h3 className="mt-5 text-xl font-semibold text-white">
              Unable to load orders
            </h3>

            <p className="mt-2 text-sm text-white/50">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * EMPTY
   * ============================================================
   */

  if (!orders.length) {
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
        className="mx-auto max-w-3xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Orders</h2>

            <p className="mt-1 text-sm text-white/50">
              Orders from your dining session
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10">
            <Clock3 className="text-white/30" size={56} />
          </div>

          <h2 className="text-2xl font-semibold text-white">No Orders Yet</h2>

          <p className="mt-3 max-w-sm text-white/50">
            Your placed orders will appear here.
          </p>
        </div>
      </motion.div>
    );
  }

  /**
   * ============================================================
   * ORDERS
   * ============================================================
   */

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
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Orders</h2>

          <p className="mt-1 text-sm text-white/50">
            Orders from your dining session
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 text-xs text-white/40 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Live
          </div>

          <button
            type="button"
            onClick={() => void loadOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders */}

      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.05,
            }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            {/* Order Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40">
                  Order
                </p>

                <h3 className="mt-1 font-semibold text-white">
                  #{order.id.slice(0, 8).toUpperCase()}
                </h3>

                <p className="mt-1 text-xs text-white/40">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div
                className={`
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    ${getStatusClass(order.status)}
                  `}
              >
                {getStatusIcon(order.status)}

                {getStatusLabel(order.status)}
              </div>
            </div>

            {/* Divider */}

            <div className="my-5 border-t border-white/10" />

            {/* Items */}

            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-white/10 px-1.5 text-xs font-semibold text-white/70">
                        {item.quantity}
                      </span>

                      <span className="truncate text-sm font-medium text-white">
                        {item.itemName}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="mt-1 pl-8 text-xs text-white/40">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-sm font-medium text-white/80">
                    ₹{Number(item.totalPrice).toFixed(2)}
                  </span>
                </div>
              ))}

              {!order.items?.length && (
                <p className="text-sm text-white/40">
                  Order items unavailable.
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

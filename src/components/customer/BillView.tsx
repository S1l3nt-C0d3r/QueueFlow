import { useCallback, useEffect, useState } from "react";

import { motion } from "motion/react";

import {
  Receipt,
  Clock3,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { billingService } from "../../services/billing.service";
import { orderService } from "../../services/orders.service.ts";

import { BillResponse } from "../../types/billing";
import { OrderItemResponse } from "../../types/orders";

interface BillViewProps {
  sessionId: string;
  sessionToken: string;
  onBillRequested?: () => void;
}

export default function BillView({
  sessionId,
  sessionToken,
  onBillRequested,
}: BillViewProps) {
  /**
   * ============================================================
   * STATE
   * ============================================================
   */

  const [bill, setBill] = useState<BillResponse | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItemResponse[]>([]);

  const [itemsLoading, setItemsLoading] = useState(false);

  const [itemsError, setItemsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [requesting, setRequesting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * ============================================================
   * LOAD BILL
   * ============================================================
   */

  const loadOrderItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError(null);

    try {
      const result = await orderService.getCustomerOrders(
        sessionId,
        sessionToken,
      );

      const orders = result ?? [];

      setOrderItems(orders.flatMap((order) => order.items ?? []));
    } catch (err) {
      console.error("Failed to load customer orders:", err);
      setItemsError("Unable to load your ordered items.");
    } finally {
      setItemsLoading(false);
    }
  }, [sessionId, sessionToken]);

  const loadBill = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const result = await billingService.getCustomerBill(
          sessionId,
          sessionToken,
        );

        setBill(result);
        void loadOrderItems();
      } catch (err: any) {
        console.error("Failed to load customer bill:", err);

        /*
         * A missing bill is an expected state before the
         * customer requests one.
         */
        if (err?.response?.status === 404) {
          setBill(null);
          setError(null);
        } else {
          setError("Unable to load your bill. Please try again.");
        }
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
    void loadBill();
    void loadOrderItems();
  }, [loadBill, loadOrderItems]);

  /**
   * ============================================================
   * REQUEST BILL
   * ============================================================
   */

  const handleRequestBill = async () => {
    if (requesting) {
      return;
    }

    setRequesting(true);
    setError(null);

    try {
      const result = await billingService.requestCustomerBill(
        sessionId,
        sessionToken,
      );

      setBill(result);

      /*
       * Refresh the order items so the bill view reflects the
       * latest customer orders.
       */
      await loadOrderItems();

      /*
       * Tell CustomerView that billing has started so it can
       * lock the Order and Cart tabs.
       */
      onBillRequested?.();
    } catch (err) {
      console.error("Failed to request bill:", err);

      setError("We couldn't request your bill. Please try again.");
    } finally {
      setRequesting(false);
    }
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
          <h2 className="text-2xl font-bold text-white">Your Bill</h2>

          <p className="mt-1 text-sm text-white/50">Your current dining bill</p>
        </div>

        <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />

            <p className="mt-4 text-sm text-white/50">Loading your bill...</p>
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
            <h2 className="text-2xl font-bold text-white">Your Bill</h2>

            <p className="mt-1 text-sm text-white/50">
              Your current dining bill
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadBill(true)}
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
              Unable to load bill
            </h3>

            <p className="mt-2 text-sm text-white/50">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * NO BILL YET
   * ============================================================
   */

  if (!bill) {
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
        className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-400/20"
        >
          <Receipt size={44} className="text-cyan-400" />
        </motion.div>

        <h2 className="mt-7 text-2xl font-bold text-white">
          Ready for your bill?
        </h2>

        <p className="mt-3 max-w-md text-white/50">
          Once you're finished dining, request your bill and the restaurant
          staff will prepare it for you.
        </p>

        <button
          type="button"
          disabled={requesting}
          onClick={handleRequestBill}
          className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {requesting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Requesting...
            </>
          ) : (
            <>
              <Receipt size={20} />
              Request Bill
            </>
          )}
        </button>
      </motion.div>
    );
  }

  /**
   * ============================================================
   * BILL STATUS
   * ============================================================
   */

  const billStatus = String(bill.status).toLowerCase();

  const isPaid = billStatus === "paid";

  /**
   * ============================================================
   * BILL READY
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
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Receipt size={24} className="text-cyan-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Your Bill</h2>

            <p className="text-sm text-white/50">Bill #{bill.billNumber}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadBill(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Status */}

      <div
        className={
          isPaid
            ? "flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-400"
            : "flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-400"
        }
      >
        {isPaid ? <CheckCircle2 size={22} /> : <Receipt size={22} />}

        <div>
          <p className="font-semibold">
            {isPaid ? "Payment completed" : "Bill is ready"}
          </p>

          <p className="mt-0.5 text-sm opacity-70">
            {isPaid
              ? "Thank you for dining with us."
              : "Please see the restaurant staff for payment."}
          </p>
        </div>
      </div>

      {/* Ordered Items */}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white">Items</h3>

        {itemsLoading ? (
          <div className="mt-5 flex items-center justify-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
          </div>
        ) : itemsError ? (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-400">{itemsError}</p>

            <button
              type="button"
              onClick={() => void loadOrderItems()}
              className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : orderItems.length === 0 ? (
          <p className="mt-5 text-sm text-white/50">No ordered items found.</p>
        ) : (
          <div className="mt-5 divide-y divide-white/10">
            {orderItems.map((item, index) => (
              <div
                key={item.id ?? `${item.menuItemId}-${index}`}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {item.itemName}
                  </p>

                  {item.notes && (
                    <p className="mt-1 text-xs text-white/40">{item.notes}</p>
                  )}

                  <p className="mt-1 text-sm text-white/50">
                    × {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-white">
                  ₹{Number(item.totalPrice).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Information */}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white">Bill Details</h3>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Bill Number</span>

            <span className="font-medium text-white">#{bill.billNumber}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Status</span>

            <span
              className={
                isPaid
                  ? "font-medium text-green-400"
                  : "font-medium text-cyan-400"
              }
            >
              {isPaid ? "Paid" : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* Amount */}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-white">Amount</span>

          <span className="text-3xl font-bold text-cyan-400">
            ₹{bill.grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Information */}

      {!isPaid && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-sm text-white/60">
            Please complete your payment with the restaurant staff.
          </p>
        </div>
      )}
    </motion.div>
  );
}

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Receipt,
  RefreshCw,
  UserRound,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export interface WaiterBill {
  id: string;

  restaurantId: string;

  sessionId: string;

  tableId: string;

  /**
   * Bill is created against the waiter associated
   * with the dining session.
   */
  waiterId?: string | null;

  status: string;

  subtotal?: number;

  tax?: number;

  discount?: number;

  total?: number;

  createdAt?: string;

  updatedAt?: string;

  tableNumber?: string | null;

  customerName?: string | null;

  partySize?: number | null;
}

interface WaiterBillRequestsProps {
  bills: WaiterBill[];

  isLoading?: boolean;

  isRefreshing?: boolean;

  updatingBillId?: string | null;

  error?: string | null;

  onRefresh?: () => void;

  onBack?: () => void;

  /**
   * Called when the waiter confirms that the
   * restaurant has received payment.
   *
   * This does NOT process payment.
   */
  onPaymentHandled?: (bill: WaiterBill) => void;

  /**
   * Optional callback for opening the complete bill.
   */
  onViewBill?: (bill: WaiterBill) => void;
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") {
    return "₹0.00";
  }

  return `₹${value.toFixed(2)}`;
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

function getStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "REQUESTED":
      return "Payment Pending";

    case "PENDING":
      return "Payment Pending";

    case "PAID":
      return "Paid";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case "REQUESTED":
    case "PENDING":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "PAID":
    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

function isPaymentPending(status: string) {
  const normalized = status.toUpperCase();

  return normalized === "REQUESTED" || normalized === "PENDING";
}

function BillSkeleton() {
  return (
    <div
      className="
        animate-pulse
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-5
      "
    >
      <div className="flex justify-between">
        <div className="h-12 w-12 rounded-2xl bg-white/10" />

        <div className="h-7 w-24 rounded-full bg-white/10" />
      </div>

      <div className="mt-5 h-5 w-32 rounded bg-white/10" />

      <div className="mt-2 h-4 w-24 rounded bg-white/5" />

      <div className="mt-6 h-12 rounded-2xl bg-white/10" />
    </div>
  );
}

export default function WaiterBillRequests({
  bills,
  isLoading = false,
  isRefreshing = false,
  updatingBillId = null,
  error = null,
  onRefresh,
  onBack,
  onPaymentHandled,
  onViewBill,
}: WaiterBillRequestsProps) {
  const [confirmingBillId, setConfirmingBillId] = useState<string | null>(null);

  const pendingBills = bills.filter((bill) => isPaymentPending(bill.status));

  const handlePaymentClick = (bill: WaiterBill) => {
    setConfirmingBillId(bill.id);
  };

  const handleConfirmPayment = (bill: WaiterBill) => {
    setConfirmingBillId(null);

    onPaymentHandled?.(bill);
  };

  return (
    <section className="w-full pb-6">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div
        className="
          sticky
          top-0
          z-20
          -mx-4
          mb-5
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
        {onBack && (
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
            "
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-wider text-white/30">
            Payments
          </p>

          <h1 className="text-lg font-bold text-white">Bill Requests</h1>
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
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-white/5
            text-white/50
            disabled:opacity-40
          "
          aria-label="Refresh bills"
        >
          <RefreshCw
            className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />
        </motion.button>
      </div>

      {/* ======================================================
          SUMMARY
          ====================================================== */}

      <div
        className="
          rounded-3xl
          border
          border-orange-400/15
          bg-orange-400/[0.05]
          p-5
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-orange-400/10
              text-orange-300
            "
          >
            <Receipt className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-2xl font-bold text-white">
              {pendingBills.length}
            </p>

            <p className="text-xs text-white/40">
              {pendingBills.length === 1
                ? "bill waiting for payment"
                : "bills waiting for payment"}
            </p>
          </div>
        </div>
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
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((item) => (
            <BillSkeleton key={item} />
          ))}
        </div>
      ) : bills.length === 0 ? (
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
            p-10
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
              text-white/20
            "
          >
            <Receipt className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-white/60">
            No bill requests
          </h2>

          <p className="mt-2 text-xs leading-5 text-white/30">
            When a customer requests their bill, it will appear here.
          </p>
        </div>
      ) : (
        /* ====================================================
           BILLS
           ==================================================== */

        <div className="mt-4 space-y-3">
          {bills.map((bill) => {
            const paymentPending = isPaymentPending(bill.status);

            const confirming = confirmingBillId === bill.id;

            const updating = updatingBillId === bill.id;

            return (
              <motion.article
                key={bill.id}
                layout
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.045]
                  "
              >
                <div className="p-4 sm:p-5">
                  {/* ========================================
                        TOP
                        ======================================== */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-orange-400/15
                            to-yellow-400/5
                            text-orange-300
                          "
                      >
                        <span className="text-lg font-bold">
                          {bill.tableNumber ?? "—"}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-wider text-white/30">
                          Table
                        </p>

                        <h2 className="text-base font-bold text-white">
                          Table {bill.tableNumber ?? "—"}
                        </h2>

                        {bill.customerName && (
                          <p className="mt-1 truncate text-xs text-white/40">
                            {bill.customerName}
                          </p>
                        )}
                      </div>
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
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-wide
                          ${getStatusClass(bill.status)}
                        `}
                    >
                      {paymentPending ? (
                        <Clock3 className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}

                      {getStatusLabel(bill.status)}
                    </div>
                  </div>

                  {/* ========================================
                        SESSION INFO
                        ======================================== */}

                  <div
                    className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-x-4
                        gap-y-2
                        border-t
                        border-white/5
                        pt-3
                      "
                  >
                    {bill.partySize && (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                        <Users className="h-3 w-3" />
                        {bill.partySize}{" "}
                        {bill.partySize === 1 ? "guest" : "guests"}
                      </div>
                    )}

                    {bill.createdAt && (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                        <Clock3 className="h-3 w-3" />
                        Requested {formatTime(bill.createdAt)}
                      </div>
                    )}

                    {bill.waiterId && (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                        <UserRound className="h-3 w-3" />
                        Assigned waiter
                      </div>
                    )}
                  </div>

                  {/* ========================================
                        TOTAL
                        ======================================== */}

                  <div
                    className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        border-white/5
                        bg-black/10
                        px-4
                        py-3
                      "
                  >
                    <span className="text-xs text-white/40">Bill Total</span>

                    <span className="text-xl font-bold text-white">
                      {formatCurrency(bill.total)}
                    </span>
                  </div>

                  {/* ========================================
                        ACTIONS
                        ======================================== */}

                  {paymentPending && (
                    <>
                      {confirming ? (
                        <div
                          className="
                              mt-4
                              rounded-2xl
                              border
                              border-orange-400/15
                              bg-orange-400/5
                              p-4
                            "
                        >
                          <div className="flex gap-3">
                            <div
                              className="
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-orange-400/10
                                  text-orange-300
                                "
                            >
                              <Receipt className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-white">
                                Confirm payment
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/40">
                                Confirm only after the restaurant has received
                                the customer's payment.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmingBillId(null)}
                              disabled={updating}
                              className="
                                  min-h-12
                                  rounded-2xl
                                  border
                                  border-white/10
                                  bg-white/5
                                  text-sm
                                  font-semibold
                                  text-white/50
                                "
                            >
                              Not Yet
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(bill)}
                              disabled={updating}
                              className="
                                  flex
                                  min-h-12
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-2xl
                                  bg-emerald-500/15
                                  text-sm
                                  font-semibold
                                  text-emerald-300
                                "
                            >
                              {updating ? (
                                <span
                                  className="
                                      h-4
                                      w-4
                                      animate-spin
                                      rounded-full
                                      border-2
                                      border-emerald-300/30
                                      border-t-emerald-300
                                    "
                                />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Payment Received
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => onViewBill?.(bill)}
                            className="
                                flex
                                min-h-12
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.04]
                                text-sm
                                font-semibold
                                text-white/60
                              "
                          >
                            <Receipt className="h-4 w-4" />
                            View Bill
                          </button>

                          <motion.button
                            type="button"
                            whileTap={{
                              scale: 0.97,
                            }}
                            onClick={() => handlePaymentClick(bill)}
                            disabled={updating}
                            className="
                                flex
                                min-h-12
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-gradient-to-r
                                from-emerald-500
                                to-green-600
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                shadow-emerald-500/10
                                disabled:opacity-40
                              "
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Payment Received
                          </motion.button>
                        </div>
                      )}
                    </>
                  )}

                  {/* ========================================
                        COMPLETED
                        ======================================== */}

                  {!paymentPending && (
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
                      <CheckCircle2 className="h-4 w-4" />
                      Payment handled
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

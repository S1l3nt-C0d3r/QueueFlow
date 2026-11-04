import { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { motion, AnimatePresence } from "motion/react";

import {
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
  PackageCheck,
} from "lucide-react";

import SessionHeader from "./SessionHeader";
import OrdersView from "./OrdersView";
import MenuGrid from "./MenuGrid";
import CartView, { CartItem } from "./CartView";
import BillView from "./BillView";

import { MenuResponse } from "../../types/menu";

import { DiningSessionResponse } from "../../types/dining-session";

import { diningSessionsService } from "../../services/dining-session";

import { orderService } from "../../services/orders.service.ts";

type Tab = "order" | "cart" | "orders" | "bill";

export default function CustomerView() {
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("order");

  const [session, setSession] = useState<DiningSessionResponse | null>(null);

  const [loadingSession, setLoadingSession] = useState(true);

  const [sessionError, setSessionError] = useState<string | null>(null);

  /*
   * ============================================================
   * CUSTOMER SESSION
   * ============================================================
   *
   * JoinSession creates the dining session and stores the
   * complete response in sessionStorage.
   *
   * The session token is also present in the URL so the
   * session can be restored after a page refresh.
   */

  const sessionToken = searchParams.get("session");

  /*
   * Table number is currently passed through the QR URL.
   *
   * The dining session response gives us tableId rather than
   * the display table number.
   */

  const tableNumberParam = searchParams.get("tableNumber");

  /*
   * ============================================================
   * CART
   * ============================================================
   */

  const [cart, setCart] = useState<CartItem[]>([]);

  /*
   * ============================================================
   * ORDER SUBMISSION STATE
   * ============================================================
   */

  const [placingOrder, setPlacingOrder] = useState(false);

  const [orderError, setOrderError] = useState<string | null>(null);

  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  /*
   * ============================================================
   * BILLING STATE
   * ============================================================
   *
   * Once the customer requests the bill, new ordering is closed.
   * Orders and Bill remain available for viewing.
   */
  const [billingStarted, setBillingStarted] = useState(false);

  /*
   * ============================================================
   * LOAD DINING SESSION
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      setLoadingSession(true);
      setSessionError(null);

      try {
        /*
         * First attempt to restore the complete session
         * created by JoinSession.
         */

        const storedSession = sessionStorage.getItem("customerDiningSession");

        if (storedSession) {
          try {
            const parsedSession = JSON.parse(
              storedSession,
            ) as DiningSessionResponse;

            if (parsedSession?.id && parsedSession?.sessionToken) {
              if (!cancelled) {
                setSession(parsedSession);

                if (
                  parsedSession.status === "BILLING" ||
                  parsedSession.status === "COMPLETED"
                ) {
                  setBillingStarted(true);
                }

                setLoadingSession(false);
              }

              return;
            }
          } catch {
            /*
             * Invalid sessionStorage data.
             *
             * Fall through and restore the session
             * using the URL token.
             */
          }
        }

        /*
         * No valid stored session.
         *
         * Restore it using the dining session token.
         */

        if (!sessionToken) {
          throw new Error("No dining session was found.");
        }

        const loadedSession =
          await diningSessionsService.getByToken(sessionToken);

        if (!cancelled) {
          setSession(loadedSession);

          if (
            loadedSession.status === "BILLING" ||
            loadedSession.status === "COMPLETED"
          ) {
            setBillingStarted(true);
          }

          sessionStorage.setItem(
            "customerDiningSession",
            JSON.stringify(loadedSession),
          );
        }
      } catch (error) {
        console.error("Failed to load dining session:", error);

        if (!cancelled) {
          setSessionError(
            "We couldn't load your dining session. Please scan the table QR code again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSession(false);
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionToken]);

  /*
   * ============================================================
   * CART HELPERS
   * ============================================================
   */

  const getQuantity = (menuItemId: string): number => {
    return (
      cart.find((cartItem) => cartItem.item.id === menuItemId)?.quantity ?? 0
    );
  };

  /*
   * Add item.
   */

  const handleAdd = (menuItem: MenuResponse) => {
    if (billingStarted) {
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem.item.id === menuItem.id,
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.item.id === menuItem.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem,
        );
      }

      return [
        ...currentCart,
        {
          item: menuItem,
          quantity: 1,
        },
      ];
    });
  };

  /*
   * Increase quantity.
   */

  const handleIncrease = (menuItem: MenuResponse) => {
    if (billingStarted) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.item.id === menuItem.id
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            }
          : cartItem,
      ),
    );
  };

  /*
   * Decrease quantity.
   */

  const handleDecrease = (menuItem: MenuResponse) => {
    if (billingStarted) {
      return;
    }

    setCart((currentCart) =>
      currentCart
        .map((cartItem) =>
          cartItem.item.id === menuItem.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity - 1,
              }
            : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    );
  };

  /*
   * Remove item completely.
   */

  const handleRemoveItem = (menuItem: MenuResponse) => {
    if (billingStarted) {
      return;
    }

    setCart((currentCart) =>
      currentCart.filter((cartItem) => cartItem.item.id !== menuItem.id),
    );
  };

  /*
   * ============================================================
   * CART COUNT
   * ============================================================
   */

  const cartCount = useMemo(
    () => cart.reduce((total, cartItem) => total + cartItem.quantity, 0),
    [cart],
  );

  /*
   * ============================================================
   * PLACE CUSTOMER ORDER
   * ============================================================
   *
   * This is now connected to the backend.
   *
   * We send ONLY:
   * - sessionId
   * - sessionToken
   * - items
   *
   * The backend determines that the creator is CUSTOMER.
   */

  const handlePlaceOrder = async () => {
    if (billingStarted) {
      setOrderError(
        "Ordering is closed because the bill has already been requested.",
      );
      return;
    }

    if (!session) {
      setOrderError("Your dining session could not be found.");

      return;
    }

    if (cart.length === 0) {
      setOrderError("Your cart is empty.");

      return;
    }

    if (placingOrder) {
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      await orderService.placeCustomerOrder({
        sessionId: session.id,

        sessionToken: session.sessionToken,

        items: cart.map((cartItem) => ({
          menuItemId: cartItem.item.id,

          quantity: cartItem.quantity,
        })),
      });

      /*
       * The backend creates/reuses the PLACED order.
       *
       * The cart now represents items that have already
       * been submitted, so clear it.
       */

      setCart([]);

      setOrderSuccess("Your order has been placed successfully.");

      /*
       * Move the customer directly to Orders so they
       * can see the order they just submitted.
       */

      setActiveTab("orders");
    } catch (error) {
      console.error("Failed to place customer order:", error);

      setOrderError("We couldn't place your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  /*
   * ============================================================
   * DISPLAY VALUES
   * ============================================================
   */

  const partySize =
    (session?.partySize ?? Number(sessionStorage.getItem("partySize"))) || 0;

  const customerName =
    session?.createdByName ?? sessionStorage.getItem("customerName") ?? "Guest";

  const tableNumber = tableNumberParam ? Number(tableNumberParam) : undefined;

  /*
   * ============================================================
   * SESSION TIME
   * ============================================================
   */

  const sessionTime = useMemo(() => {
    if (!session?.startedAt) {
      return "Just started";
    }

    const startedAt = new Date(session.startedAt).getTime();

    if (Number.isNaN(startedAt)) {
      return "Active";
    }

    const elapsedMs = Date.now() - startedAt;

    const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000));

    if (elapsedMinutes < 1) {
      return "Just started";
    }

    if (elapsedMinutes < 60) {
      return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"}`;
    }

    const hours = Math.floor(elapsedMinutes / 60);

    const minutes = elapsedMinutes % 60;

    return `${hours}h ${minutes}m`;
  }, [session]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />

          <p className="mt-4 text-sm text-white/50">Loading your table...</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * SESSION ERROR
   * ============================================================
   */

  if (sessionError || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 px-6 text-center text-white">
        <div className="max-w-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
            <UtensilsCrossed size={36} className="text-red-400" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Dining session unavailable
          </h1>

          <p className="mt-3 text-white/50">
            {sessionError ?? "Your dining session could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN CUSTOMER VIEW
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* ======================================================
          SESSION HEADER
          ====================================================== */}

      <SessionHeader
        restaurantName="Restaurant"
        tableNumber={tableNumber ?? 0}
        partySize={partySize}
        sessionTime={sessionTime}
      />

      {/* ======================================================
          CUSTOMER GREETING
          ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 pt-5">
        <p className="text-sm text-white/50">
          Welcome,{" "}
          <span className="font-medium text-white/80">{customerName}</span>
        </p>
      </div>

      {/* ======================================================
          ORDER FEEDBACK
          ====================================================== */}

      {(orderError || orderSuccess) && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          {orderError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {orderError}
            </div>
          )}

          {orderSuccess && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {orderSuccess}
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          BILLING LOCK NOTICE
          ====================================================== */}

      {billingStarted && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            The bill has been requested. New ordering is now closed.
          </div>
        </div>
      )}

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6">
        <AnimatePresence mode="wait">
          {/* ==================================================
              ORDER
              ================================================== */}

          {activeTab === "order" && billingStarted ? (
            <motion.div
              key="order-locked"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
                <h2 className="text-xl font-bold text-amber-300">
                  Ordering is closed
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  The bill has already been requested for this dining session.
                </p>
              </div>
            </motion.div>
          ) : (
            activeTab === "order" && (
              <motion.div
                key="order"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -15,
                }}
              >
                <MenuGrid
                  getQuantity={getQuantity}
                  onAdd={handleAdd}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
              </motion.div>
            )
          )}

          {/* ==================================================
              CART
              ================================================== */}

          {activeTab === "cart" && billingStarted ? (
            <motion.div
              key="cart-locked"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
                <h2 className="text-xl font-bold text-amber-300">
                  Cart unavailable
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Ordering is closed because the bill has already been
                  requested.
                </p>
              </div>
            </motion.div>
          ) : (
            activeTab === "cart" && (
              <motion.div
                key="cart"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -15,
                }}
              >
                <CartView
                  items={cart}
                  onIncrease={handleIncrease}
                  onRemove={handleRemoveItem}
                  onDecrease={handleDecrease}
                  onPlaceOrder={handlePlaceOrder}
                  isPlacingOrder={placingOrder}
                />
              </motion.div>
            )
          )}

          {/* ==================================================
              ORDERS
              ================================================== */}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
            >
              <OrdersView
                sessionId={session.id}
                sessionToken={session.sessionToken}
              />
            </motion.div>
          )}

          {/* ==================================================
              BILL
              ================================================== */}

          {activeTab === "bill" && (
            <motion.div
              key="bill"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
            >
              <BillView
                sessionId={session.id}
                sessionToken={session.sessionToken}
                onBillRequested={() => {
                  setBillingStarted(true);
                  setCart([]);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ======================================================
          BOTTOM NAVIGATION
          ====================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl justify-around py-3">
          {/* Order */}

          <button
            type="button"
            onClick={() => {
              if (!billingStarted) {
                setActiveTab("order");
              }
            }}
            disabled={billingStarted}
            className={`
              flex
              flex-col
              items-center
              gap-1
              transition
              ${
                billingStarted
                  ? "cursor-not-allowed text-white/20"
                  : activeTab === "order"
                    ? "text-cyan-400"
                    : "text-white/50"
              }
            `}
          >
            <UtensilsCrossed size={22} />

            <span className="text-xs">Order</span>
          </button>

          {/* Cart */}

          <button
            type="button"
            onClick={() => {
              if (!billingStarted) {
                setActiveTab("cart");
              }
            }}
            disabled={billingStarted}
            className={`
              relative
              flex
              flex-col
              items-center
              gap-1
              transition
              ${
                billingStarted
                  ? "cursor-not-allowed text-white/20"
                  : activeTab === "cart"
                    ? "text-cyan-400"
                    : "text-white/50"
              }
            `}
          >
            <ShoppingCart size={22} />

            {!billingStarted && cartCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}

            <span className="text-xs">Cart</span>
          </button>

          {/* Orders */}

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`
              flex
              flex-col
              items-center
              gap-1
              transition
              ${activeTab === "orders" ? "text-cyan-400" : "text-white/50"}
            `}
          >
            <PackageCheck size={22} />

            <span className="text-xs">Orders</span>
          </button>

          {/* Bill */}

          <button
            type="button"
            onClick={() => {
              setBillingStarted(true);
              setCart([]);
              setActiveTab("bill");
            }}
            className={`
              flex
              flex-col
              items-center
              gap-1
              transition
              ${activeTab === "bill" ? "text-cyan-400" : "text-white/50"}
            `}
          >
            <Receipt size={22} />

            <span className="text-xs">Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}

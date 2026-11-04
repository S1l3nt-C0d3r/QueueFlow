import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  ListOrdered,
  Receipt,
  RefreshCw,
} from "lucide-react";

import { motion } from "motion/react";

import WaiterHeader from "./WaiterHeader";

import WaiterTableGrid, { type WaiterTable } from "./WaiterGrid";

import WaiterTableDetails from "./WaiterTableDetails";

import WaiterOrderList from "./WaiterOrderList";

import WaiterTakeOrder, {
  type WaiterMenuItem,
  type WaiterSelectedItem,
} from "./WaiterTakeOrder";

import WaiterBillRequests, { type WaiterBill } from "./WaiterBills";

import type { WaiterOrder } from "./WaiterOrderCard";

import { api } from "../../services/api";

/*
 * ============================================================
 * BACKEND TYPES
 * ============================================================
 */

interface BackendTable {
  id: string;

  restaurantId: string;

  tableNumber: number | string;

  capacity: number;

  status: string;

  tableToken: string;

  currentQueueId?: string | null;
}

interface DiningSession {
  id: string;

  restaurantId: string;

  tableId: string;

  queueId: string | null;

  waiterStaffId: string;

  sessionToken: string;

  joinCode: string;

  createdByName: string;

  createdByPhone: string;

  status: string;

  source: string;

  partySize: number;

  startedAt: string;

  endedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

interface BackendOrder {
  id: string;

  sessionId: string;

  tableId: string;

  status: string;

  subtotal?: number;

  discount?: number;

  tax?: number;

  grandTotal?: number;

  createdAt: string;

  updatedAt: string;
}

interface BackendOrderItem {
  id: string;

  orderId: string;

  menuItemId: string;

  itemName: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  notes?: string | null;
}

interface BackendMenuItem {
  id: string;

  restaurantId: string;

  name: string;

  description?: string | null;

  price: number;

  categoryId?: string | null;

  categoryName?: string | null;

  available?: boolean;

  imageUrl?: string | null;
}

interface BackendBill {
  id: string;

  sessionId: string;

  status: string;

  subtotal?: number;

  tax?: number;

  discount?: number;

  grandTotal?: number;

  createdAt: string;

  updatedAt: string;
}

interface StaffMember {
  id: string;

  staffNumber?: string | null;

  displayName?: string | null;

  name?: string | null;

  roleId?: string | null;

  active?: boolean;
}

/*
 * ============================================================
 * PROPS
 * ============================================================
 */

interface WaiterViewProps {
  user?: {
    id?: string;

    displayName?: string | null;

    restaurantId?: string | null;
  };
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeOrder(
  order: BackendOrder,
  items: BackendOrderItem[],
  table?: BackendTable,
  session?: DiningSession,
): WaiterOrder {
  return {
    id: order.id,

    restaurantId: session?.restaurantId ?? "",

    sessionId: order.sessionId,

    tableId: order.tableId,

    waiterId: session?.waiterStaffId ?? null,

    status: order.status,

    items: items.map((item) => ({
      id: item.id,

      menuItemId: item.menuItemId,

      name: item.itemName,

      quantity: item.quantity,

      unitPrice: item.unitPrice,

      notes: item.notes,
    })),

    tableNumber: table ? String(table.tableNumber) : null,

    customerName: session?.createdByName ?? null,

    createdAt: order.createdAt,

    updatedAt: order.updatedAt,
  };
}

function normalizeMenuItem(item: BackendMenuItem): WaiterMenuItem {
  return {
    id: item.id,

    name: item.name,

    description: item.description ?? null,

    price: Number(item.price),

    categoryId: item.categoryId ?? null,

    categoryName: item.categoryName ?? null,

    available: item.available !== false,

    imageUrl: item.imageUrl ?? null,
  };
}

function normalizeBill(
  bill: BackendBill,
  session?: DiningSession,
  table?: BackendTable,
): WaiterBill {
  return {
    id: bill.id,

    restaurantId: session?.restaurantId ?? "",

    sessionId: bill.sessionId,

    tableId: session?.tableId ?? "",

    waiterId: session?.waiterStaffId ?? null,

    status: bill.status,

    subtotal: bill.subtotal,

    tax: bill.tax,

    discount: bill.discount,

    total: bill.grandTotal,

    createdAt: bill.createdAt,

    updatedAt: bill.updatedAt,

    tableNumber: table ? String(table.tableNumber) : null,

    customerName: session?.createdByName ?? null,

    partySize: session?.partySize ?? null,
  };
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function WaiterView({ user }: WaiterViewProps) {
  /*
   * ==========================================================
   * AUTHENTICATED STAFF
   * ==========================================================
   */

  const currentWaiterId = user?.id ?? localStorage.getItem("staffId");

  const [staff, setStaff] = useState<StaffMember | null>(null);

  const displayName =
    user?.displayName ??
    staff?.displayName ??
    staff?.name ??
    localStorage.getItem("displayName") ??
    "Waiter";

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  type Screen = "tables" | "orders" | "bills";

  const [screen, setScreen] = useState<Screen>("tables");

  const [selectedTable, setSelectedTable] = useState<WaiterTable | null>(null);

  const [takeOrderMode, setTakeOrderMode] = useState(false);

  /*
   * ==========================================================
   * DATA
   * ==========================================================
   */

  const [rawTables, setRawTables] = useState<BackendTable[]>([]);

  const [sessions, setSessions] = useState<DiningSession[]>([]);

  const [orders, setOrders] = useState<WaiterOrder[]>([]);

  const [bills, setBills] = useState<WaiterBill[]>([]);

  const [menuItems, setMenuItems] = useState<WaiterMenuItem[]>([]);

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingOrders, setLoadingOrders] = useState(false);

  const [submittingOrder, setSubmittingOrder] = useState(false);

  /*
   * ==========================================================
   * ACTION STATE
   * ==========================================================
   */

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  /*
   * ==========================================================
   * FEEDBACK
   * ==========================================================
   */

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  /*
   * ==========================================================
   * LOAD STAFF
   * ==========================================================
   */

  const loadStaff = useCallback(async () => {
    if (!currentWaiterId) {
      return;
    }

    try {
      const result = await api.get<StaffMember[]>("/staff");

      const current = result.find((member) => member.id === currentWaiterId);

      if (current) {
        setStaff(current);
      }
    } catch (staffError) {
      console.error("Unable to load staff:", staffError);
    }
  }, [currentWaiterId]);

  /*
   * ==========================================================
   * LOAD TABLES
   * ==========================================================
   */

  const loadTables = useCallback(async () => {
    const result = await api.get<BackendTable[]>("/tables");

    setRawTables(result);

    return result;
  }, []);

  /*
   * ==========================================================
   * LOAD DINING SESSIONS
   * ==========================================================
   */

  const loadSessions = useCallback(async () => {
    const result = await api.get<DiningSession[]>("/dining-sessions");

    setSessions(result);

    return result;
  }, []);

  /*
   * ==========================================================
   * LOAD ORDERS
   * ==========================================================
   */

  const loadOrders = useCallback(
    async (tables: BackendTable[], sessionData: DiningSession[]) => {
      setLoadingOrders(true);

      try {
        const result = await api.get<BackendOrder[]>("/orders");

        const tableMap = new Map<string, BackendTable>();

        tables.forEach((table) => {
          tableMap.set(table.id, table);
        });

        const sessionMap = new Map<string, DiningSession>();

        sessionData.forEach((session) => {
          sessionMap.set(session.id, session);
        });

        const normalized: WaiterOrder[] = [];

        for (const order of result) {
          let items: BackendOrderItem[] = [];

          try {
            items = await api.get<BackendOrderItem[]>(
              `/orders/${encodeURIComponent(order.id)}/items`,
            );
          } catch (itemError) {
            console.error(
              `Unable to load items for order ${order.id}:`,
              itemError,
            );
          }

          normalized.push(
            normalizeOrder(
              order,
              items,
              tableMap.get(order.tableId),
              sessionMap.get(order.sessionId),
            ),
          );
        }

        setOrders(normalized);
      } finally {
        setLoadingOrders(false);
      }
    },
    [],
  );

  /*
   * ==========================================================
   * LOAD MENU
   * ==========================================================
   */

  const loadMenu = useCallback(async () => {
    try {
      const result = await api.get<BackendMenuItem[]>("/menu");

      setMenuItems(result.map(normalizeMenuItem));
    } catch (menuError) {
      console.error("Unable to load menu:", menuError);
    }
  }, []);

  /*
   * ==========================================================
   * LOAD BILLS
   * ==========================================================
   */

  const loadBills = useCallback(
    async (tables: BackendTable[], sessionData: DiningSession[]) => {
      try {
        const result = await api.get<BackendBill[]>("/billing");

        const tableMap = new Map<string, BackendTable>();

        tables.forEach((table) => {
          tableMap.set(table.id, table);
        });

        const sessionMap = new Map<string, DiningSession>();

        sessionData.forEach((session) => {
          sessionMap.set(session.id, session);
        });

        setBills(
          result.map((bill) => {
            const session = sessionMap.get(bill.sessionId);

            return normalizeBill(
              bill,
              session,
              session ? tableMap.get(session.tableId) : undefined,
            );
          }),
        );
      } catch (billError) {
        console.error("Unable to load bills:", billError);
      }
    },
    [],
  );

  /*
   * ==========================================================
   * LOAD EVERYTHING
   * ==========================================================
   */

  const loadAll = useCallback(
    async (refresh = false) => {
      try {
        setError(null);

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [tableData, sessionData] = await Promise.all([
          loadTables(),
          loadSessions(),
        ]);

        await Promise.all([
          loadStaff(),

          loadOrders(tableData, sessionData),

          loadMenu(),

          loadBills(tableData, sessionData),
        ]);
      } catch (loadError) {
        console.error("Waiter dashboard load failed:", loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load waiter dashboard.",
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [loadTables, loadSessions, loadStaff, loadOrders, loadMenu, loadBills],
  );

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  /*
   * ==========================================================
   * BUILD TABLE LAYOUT
   * ==========================================================
   */

  const waiterTables = useMemo(() => {
    const sessionByTable = new Map<string, DiningSession>();

    /*
     * Prefer active sessions.
     *
     * The backend's active lookup is explicitly based
     * on SESSION_STATUS.ACTIVE.
     */

    sessions
      .filter(
        (session) =>
          String(session.status).toUpperCase() === "ACTIVE" ||
          String(session.status).toUpperCase() === "BILLING",
      )
      .forEach((session) => {
        sessionByTable.set(session.tableId, session);
      });

    return rawTables.map((table): WaiterTable => {
      const session = sessionByTable.get(table.id);

      const tableOrders = session
        ? orders.filter((order) => order.sessionId === session.id)
        : [];

      return {
        id: table.id,

        restaurantId: table.restaurantId,

        tableNumber: String(table.tableNumber),

        capacity: table.capacity,

        status: table.status,

        tableToken: table.tableToken,

        currentQueueId: table.currentQueueId ?? null,

        diningSessionId: session?.id ?? null,

        diningSessionStatus: session?.status ?? null,

        waiterStaffId: session?.waiterStaffId ?? null,

        customerName: session?.createdByName ?? null,

        partySize: session?.partySize ?? null,

        orderCount: tableOrders.length,
      };
    });
  }, [rawTables, sessions, orders]);

  /*
   * ==========================================================
   * CURRENT TABLE
   * ==========================================================
   */

  const currentSelectedTable = useMemo(() => {
    if (!selectedTable) {
      return null;
    }

    return (
      waiterTables.find((table) => table.id === selectedTable.id) ??
      selectedTable
    );
  }, [selectedTable, waiterTables]);

  /*
   * ==========================================================
   * ACTIVE ORDERS
   * ==========================================================
   */

  const activeOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = String(order.status).toLowerCase();

        return status !== "completed" && status !== "cancelled";
      }),
    [orders],
  );

  /*
   * ==========================================================
   * PENDING BILLS
   * ==========================================================
   */

  const pendingBills = useMemo(
    () =>
      bills.filter((bill) => {
        const status = String(bill.status).toUpperCase();

        return (
          status === "OPEN" || status === "REQUESTED" || status === "PENDING"
        );
      }),
    [bills],
  );

  /*
   * ==========================================================
   * SELECT TABLE
   * ==========================================================
   */

  const handleTableSelect = (table: WaiterTable) => {
    setSelectedTable(table);

    setTakeOrderMode(false);

    setScreen("tables");
  };

  /*
   * ==========================================================
   * ADD ORDER
   * ==========================================================
   */

  const handleAddOrder = (table: WaiterTable) => {
    setSelectedTable(table);

    setTakeOrderMode(true);

    setScreen("tables");
  };

  /*
   * ==========================================================
   * SUBMIT WAITER ORDER
   * ==========================================================
   */

  const handleSubmitOrder = async (items: WaiterSelectedItem[]) => {
    if (!currentSelectedTable) {
      return;
    }

    if (!currentSelectedTable.diningSessionId) {
      setError("This table does not have an active dining session.");

      return;
    }

    try {
      setSubmittingOrder(true);

      setError(null);

      const subtotal = items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0,
      );

      /*
       * IMPORTANT:
       *
       * waiterStaffId is NOT sent here.
       *
       * The backend gets the authenticated staff member
       * from req.user and uses that when creating a
       * dining session.
       *
       * For an order, the authenticated staff member is
       * similarly available server-side.
       */

      const created = await api.post<BackendOrder>("/orders", {
        sessionId: currentSelectedTable.diningSessionId,

        tableId: currentSelectedTable.id,

        status: "open",

        subtotal,

        discount: 0,

        tax: 0,

        grandTotal: subtotal,
      });

      for (const item of items) {
        await api.post(`/orders/${encodeURIComponent(created.id)}/items`, {
          menuItemId: item.menuItemId,

          itemName: item.name,

          quantity: item.quantity,

          unitPrice: item.unitPrice,

          totalPrice: item.unitPrice * item.quantity,

          createdByType: "STAFF",

          createdById: currentWaiterId,

          takenByStaffId: currentWaiterId,

          notes: item.notes ?? null,
        });
      }

      await loadAll(true);

      setSuccess("Order placed successfully.");

      setTakeOrderMode(false);

      setTimeout(() => setSuccess(null), 2500);
    } catch (orderError) {
      console.error("Failed to place waiter order:", orderError);

      setError(
        orderError instanceof Error
          ? orderError.message
          : "Unable to place order.",
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  /*
   * ==========================================================
   * UPDATE ORDER STATUS
   * ==========================================================
   */

  const handleUpdateOrderStatus = async (
    order: WaiterOrder,
    status: "PREPARING" | "DELIVERED",
  ) => {
    try {
      setUpdatingOrderId(order.id);

      setError(null);

      /*
       * Current backend lifecycle:
       *
       * open
       * preparing
       * ready
       * served
       * completed
       *
       * Our waiter UI's "DELIVERED" currently maps to
       * the backend's "served" state.
       */

      const backendStatus = status === "PREPARING" ? "preparing" : "served";

      await api.patch(`/orders/${encodeURIComponent(order.id)}/status`, {
        status: backendStatus,
      });

      await loadAll(true);

      setSuccess("Order status updated.");

      setTimeout(() => setSuccess(null), 2000);
    } catch (statusError) {
      console.error("Failed to update order status:", statusError);

      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update order status.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /*
   * ==========================================================
   * CANCEL ORDER
   * ==========================================================
   */

  const handleDeleteOrder = async (order: WaiterOrder) => {
    if (!window.confirm("Cancel this order?")) {
      return;
    }

    try {
      setDeletingOrderId(order.id);

      setError(null);

      /*
       * This is a status transition, not a DELETE.
       */

      await api.patch(`/orders/${encodeURIComponent(order.id)}/status`, {
        status: "cancelled",
      });

      await loadAll(true);

      setSuccess("Order cancelled.");

      setTimeout(() => setSuccess(null), 2000);
    } catch (cancelError) {
      console.error("Failed to cancel order:", cancelError);

      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel order.",
      );
    } finally {
      setDeletingOrderId(null);
    }
  };

  /*
   * ==========================================================
   * BACK
   * ==========================================================
   */

  const handleBack = () => {
    setSelectedTable(null);

    setTakeOrderMode(false);

    setScreen("tables");
  };

  /*
   * ==========================================================
   * LOGOUT
   * ==========================================================
   */

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("staffId");

    localStorage.removeItem("displayName");

    localStorage.removeItem("restaurantId");

    window.location.href = "/";
  };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-950
          text-white
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-11
              w-11
              animate-spin
              rounded-full
              border-2
              border-white/10
              border-t-cyan-400
            "
          />

          <p className="mt-5 text-sm font-semibold">
            Loading waiter dashboard...
          </p>

          <p className="mt-2 text-xs text-white/30">
            Connecting to the restaurant server
          </p>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-950
        via-slate-950
        to-blue-950/30
        text-white
      "
    >
      <WaiterHeader
        displayName={displayName}
        activeOrders={activeOrders.length}
        pendingBills={pendingBills.length}
        isRefreshing={refreshing}
        onRefresh={() => loadAll(true)}
        onBills={() => setScreen("bills")}
        onMenu={() => setScreen("tables")}
        onLogout={handleLogout}
      />

      {/* ======================================================
          FEEDBACK
          ====================================================== */}

      {(error || success) && (
        <div
          className="
            fixed
            left-4
            right-4
            top-20
            z-[100]
            mx-auto
            max-w-xl
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className={`
              flex
              items-start
              gap-3
              rounded-2xl
              border
              p-4
              shadow-2xl
              backdrop-blur-xl

              ${
                error
                  ? "border-red-500/20 bg-red-950/95 text-red-200"
                  : "border-emerald-500/20 bg-emerald-950/95 text-emerald-200"
              }
            `}
          >
            {error ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="flex-1 text-sm leading-5">{error ?? success}</p>

            <button
              type="button"
              onClick={() => {
                setError(null);

                setSuccess(null);
              }}
              className="text-xs text-white/40"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main
        className="
          mx-auto
          w-full
          max-w-3xl
          px-4
          py-5
          pb-24
          sm:px-6
        "
      >
        {/* ====================================================
            TABLE FLOW
            ==================================================== */}

        {screen === "tables" && currentSelectedTable && takeOrderMode && (
          <WaiterTakeOrder
            tableNumber={currentSelectedTable.tableNumber}
            customerName={currentSelectedTable.customerName}
            menuItems={menuItems}
            isLoading={menuItems.length === 0}
            isSubmitting={submittingOrder}
            error={error}
            onBack={() => setTakeOrderMode(false)}
            onSubmitOrder={handleSubmitOrder}
          />
        )}

        {screen === "tables" && currentSelectedTable && !takeOrderMode && (
          <WaiterTableDetails
            table={currentSelectedTable}
            currentWaiterId={currentWaiterId}
            orders={orders.filter(
              (order) =>
                order.sessionId === currentSelectedTable.diningSessionId,
            )}
            isLoadingOrders={loadingOrders}
            onBack={handleBack}
            onAddOrder={handleAddOrder}
            onAssignToMe={() => {
              /*
               * Deliberately not provided as an actual
               * assignment operation.
               *
               * waiterStaffId is established when the
               * dining session starts.
               */
              setError(
                "This dining session is already assigned by the backend when it was started.",
              );
            }}
            onOrderSelect={(order) => {
              console.log("Selected order:", order.id);
            }}
            onViewBill={() => setScreen("bills")}
          />
        )}

        {screen === "tables" && !currentSelectedTable && (
          <WaiterTableGrid
            tables={waiterTables}
            currentWaiterId={currentWaiterId}
            onTableSelect={handleTableSelect}
            isLoading={loading}
            error={error}
          />
        )}

        {/* ====================================================
            ORDERS
            ==================================================== */}

        {screen === "orders" && (
          <WaiterOrderList
            orders={activeOrders}
            isLoading={loadingOrders}
            updatingOrderId={updatingOrderId}
            deletingOrderId={deletingOrderId}
            onStatusChange={handleUpdateOrderStatus}
            onDelete={handleDeleteOrder}
            onRefresh={() => loadAll(true)}
          />
        )}

        {/* ====================================================
            BILLS
            ==================================================== */}

        {screen === "bills" && (
          <WaiterBillRequests
            bills={bills}
            onRefresh={() => loadAll(true)}
            onBack={() => setScreen("tables")}
            onPaymentHandled={(bill) => {
              /*
               * Payment is intentionally NOT processed here.
               *
               * Current backend billing permissions do not
               * give a waiter payment-processing authority.
               */
              setError(
                "Payment processing is handled by the authorised billing staff.",
              );
            }}
          />
        )}
      </main>

      {/* ======================================================
          BOTTOM NAV
          ====================================================== */}

      {!currentSelectedTable && (
        <nav
          className="
            fixed
            bottom-0
            left-0
            right-0
            z-40
            border-t
            border-white/10
            bg-slate-950/95
            px-3
            pb-[max(0.75rem,env(safe-area-inset-bottom))]
            pt-2
            backdrop-blur-xl
          "
        >
          <div
            className="
              mx-auto
              grid
              max-w-md
              grid-cols-3
              gap-2
            "
          >
            <BottomNavButton
              active={screen === "tables"}
              label="Tables"
              icon={<LayoutGrid className="h-5 w-5" />}
              onClick={() => setScreen("tables")}
            />

            <BottomNavButton
              active={screen === "orders"}
              label="Orders"
              badge={activeOrders.length > 0 ? activeOrders.length : undefined}
              icon={<ListOrdered className="h-5 w-5" />}
              onClick={() => setScreen("orders")}
            />

            <BottomNavButton
              active={screen === "bills"}
              label="Bills"
              badge={pendingBills.length > 0 ? pendingBills.length : undefined}
              icon={<Receipt className="h-5 w-5" />}
              onClick={() => setScreen("bills")}
            />
          </div>
        </nav>
      )}
    </div>
  );
}

/*
 * ============================================================
 * BOTTOM NAV BUTTON
 * ============================================================
 */

function BottomNavButton({
  active,
  label,
  badge,
  icon,
  onClick,
}: {
  active: boolean;

  label: string;

  badge?: number;

  icon: React.ReactNode;

  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{
        scale: 0.94,
      }}
      onClick={onClick}
      className={`
        relative
        flex
        min-h-14
        flex-col
        items-center
        justify-center
        gap-1
        rounded-2xl
        text-[10px]
        font-medium
        transition

        ${active ? "bg-blue-500/10 text-blue-300" : "text-white/30"}
      `}
    >
      {icon}

      <span>{label}</span>

      {badge !== undefined && (
        <span
          className="
            absolute
            right-[25%]
            top-1
            flex
            h-4
            min-w-4
            items-center
            justify-center
            rounded-full
            bg-orange-500
            px-1
            text-[8px]
            font-bold
            text-white
          "
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </motion.button>
  );
}

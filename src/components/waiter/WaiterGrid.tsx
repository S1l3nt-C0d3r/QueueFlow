import { CheckCircle2, Clock3, Users, Utensils, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

export interface WaiterTable {
  id: string;

  restaurantId: string;

  tableNumber: string;

  capacity: number;

  status: string;

  tableToken?: string;

  currentQueueId?: string | null;

  /*
   * Dining-session information.
   */

  diningSessionId?: string | null;

  diningSessionStatus?: string | null;

  waiterStaffId?: string | null;

  customerName?: string | null;

  partySize?: number | null;

  orderCount?: number;
}

interface WaiterTableGridProps {
  tables: WaiterTable[];

  currentWaiterId?: string | null;

  onTableSelect: (table: WaiterTable) => void;

  isLoading?: boolean;

  error?: string | null;
}

type TableFilter = "ALL" | "AVAILABLE" | "MINE" | "OTHER_WAITER" | "OCCUPIED";

function normalizeStatus(status: string) {
  return String(status).toUpperCase();
}

function getTableVisualStatus(table: WaiterTable) {
  const status = normalizeStatus(table.status);

  if (table.diningSessionId) {
    return "OCCUPIED";
  }

  if (status === "AVAILABLE" || status === "FREE") {
    return "AVAILABLE";
  }

  if (status === "RESERVED") {
    return "RESERVED";
  }

  if (status === "CLEANING") {
    return "CLEANING";
  }

  return "OCCUPIED";
}

function getStatusConfig(table: WaiterTable, currentWaiterId?: string | null) {
  const visualStatus = getTableVisualStatus(table);

  if (table.diningSessionId && table.waiterStaffId === currentWaiterId) {
    return {
      label: "Your Table",
      shortLabel: "YOURS",
      className: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      dotClass: "bg-cyan-400",
    };
  }

  if (
    table.diningSessionId &&
    table.waiterStaffId &&
    table.waiterStaffId !== currentWaiterId
  ) {
    return {
      label: "Other Waiter",
      shortLabel: "ASSIGNED",
      className: "border-purple-400/20 bg-purple-400/10 text-purple-300",
      dotClass: "bg-purple-400",
    };
  }

  switch (visualStatus) {
    case "AVAILABLE":
      return {
        label: "Available",
        shortLabel: "FREE",
        className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        dotClass: "bg-emerald-400",
      };

    case "RESERVED":
      return {
        label: "Reserved",
        shortLabel: "RESERVED",
        className: "border-blue-400/20 bg-blue-400/10 text-blue-300",
        dotClass: "bg-blue-400",
      };

    case "CLEANING":
      return {
        label: "Cleaning",
        shortLabel: "CLEANING",
        className: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
        dotClass: "bg-yellow-400",
      };

    default:
      return {
        label: "Occupied",
        shortLabel: "OCCUPIED",
        className: "border-orange-400/20 bg-orange-400/10 text-orange-300",
        dotClass: "bg-orange-400",
      };
  }
}

function TableSkeleton() {
  return (
    <div
      className="
        animate-pulse
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-4
      "
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-white/10" />

      <div className="mx-auto mt-4 h-4 w-16 rounded bg-white/10" />

      <div className="mx-auto mt-2 h-3 w-24 rounded bg-white/5" />
    </div>
  );
}

export default function WaiterTableGrid({
  tables,
  currentWaiterId,
  onTableSelect,
  isLoading = false,
  error = null,
}: WaiterTableGridProps) {
  const [filter, setFilter] = useState<TableFilter>("ALL");

  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...tables]
      .sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber))
      .filter((table) => {
        if (!query) {
          return true;
        }

        return table.tableNumber.toLowerCase().includes(query);
      })
      .filter((table) => {
        if (filter === "ALL") {
          return true;
        }

        if (filter === "MINE") {
          return (
            Boolean(table.diningSessionId) &&
            table.waiterStaffId === currentWaiterId
          );
        }

        if (filter === "OTHER_WAITER") {
          return (
            Boolean(table.diningSessionId) &&
            Boolean(table.waiterStaffId) &&
            table.waiterStaffId !== currentWaiterId
          );
        }

        if (filter === "AVAILABLE") {
          return (
            !table.diningSessionId &&
            (normalizeStatus(table.status) === "AVAILABLE" ||
              normalizeStatus(table.status) === "FREE")
          );
        }

        if (filter === "OCCUPIED") {
          return Boolean(table.diningSessionId);
        }

        return true;
      });
  }, [tables, currentWaiterId, filter, search]);

  const counts = useMemo(() => {
    const mine = tables.filter(
      (table) =>
        Boolean(table.diningSessionId) &&
        table.waiterStaffId === currentWaiterId,
    ).length;

    const occupied = tables.filter((table) =>
      Boolean(table.diningSessionId),
    ).length;

    const available = tables.filter((table) => {
      const status = normalizeStatus(table.status);

      return (
        !table.diningSessionId && (status === "AVAILABLE" || status === "FREE")
      );
    }).length;

    const otherWaiter = tables.filter(
      (table) =>
        Boolean(table.diningSessionId) &&
        Boolean(table.waiterStaffId) &&
        table.waiterStaffId !== currentWaiterId,
    ).length;

    return {
      mine,
      occupied,
      available,
      otherWaiter,
    };
  }, [tables, currentWaiterId]);

  return (
    <section className="w-full">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/25">
              Restaurant Floor
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white">Tables</h1>

            <p className="mt-1 text-xs text-white/35">
              Tap a table to view its session and orders.
            </p>
          </div>

          <div
            className="
              flex
              h-11
              min-w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-3
              text-xs
              font-semibold
              text-white/50
            "
          >
            {tables.length}
          </div>
        </div>

        {/* SEARCH */}

        <div className="mt-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search table number..."
            className="
              min-h-12
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              text-sm
              text-white
              outline-none
              placeholder:text-white/25
              focus:border-blue-400/30
            "
          />
        </div>

        {/* FILTERS */}

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
          <FilterButton
            active={filter === "ALL"}
            label="All"
            count={tables.length}
            onClick={() => setFilter("ALL")}
          />

          <FilterButton
            active={filter === "MINE"}
            label="Mine"
            count={counts.mine}
            onClick={() => setFilter("MINE")}
          />

          <FilterButton
            active={filter === "OCCUPIED"}
            label="Occupied"
            count={counts.occupied}
            onClick={() => setFilter("OCCUPIED")}
          />

          <FilterButton
            active={filter === "AVAILABLE"}
            label="Free"
            count={counts.available}
            onClick={() => setFilter("AVAILABLE")}
          />

          <FilterButton
            active={filter === "OTHER_WAITER"}
            label="Others"
            count={counts.otherWaiter}
            onClick={() => setFilter("OTHER_WAITER")}
          />
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
          GRID
          ====================================================== */}

      {isLoading ? (
        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
          "
        >
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <TableSkeleton key={index} />
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            p-10
            text-center
          "
        >
          <Utensils className="mx-auto h-7 w-7 text-white/20" />

          <p className="mt-4 text-sm font-semibold text-white/60">
            No tables found
          </p>

          <p className="mt-1 text-xs text-white/30">
            Try changing your filter or search.
          </p>
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
          "
        >
          <AnimatePresence>
            {filteredTables.map((table, index) => {
              const config = getStatusConfig(table, currentWaiterId);

              const isMine =
                Boolean(table.diningSessionId) &&
                table.waiterStaffId === currentWaiterId;

              const isOccupied = Boolean(table.diningSessionId);

              return (
                <motion.button
                  key={table.id}
                  type="button"
                  layout
                  initial={{
                    opacity: 0,
                    scale: 0.94,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: index * 0.025,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={() => onTableSelect(table)}
                  className={`
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      p-4
                      text-left
                      transition
                      ${config.className}
                    `}
                >
                  {/* STATUS DOT */}

                  <div
                    className={`
                        absolute
                        right-3
                        top-3
                        h-2
                        w-2
                        rounded-full
                        ${config.dotClass}
                      `}
                  />

                  {/* TABLE NUMBER */}

                  <div
                    className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        bg-black/10
                      "
                  >
                    <span className="text-xl font-bold text-white">
                      T{table.tableNumber}
                    </span>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-white/75">
                      {config.label}
                    </p>

                    <p className="mt-1 text-[10px] text-white/30">
                      {table.capacity} seats
                    </p>
                  </div>

                  {/* CUSTOMER */}

                  {isOccupied && table.customerName && (
                    <div
                      className="
                            mt-3
                            flex
                            items-center
                            gap-1.5
                            border-t
                            border-white/5
                            pt-3
                          "
                    >
                      <UserRound className="h-3 w-3 shrink-0 text-white/30" />

                      <span className="truncate text-[10px] text-white/50">
                        {table.customerName}
                      </span>
                    </div>
                  )}

                  {/* PARTY */}

                  {isOccupied && table.partySize && table.partySize > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30">
                      <Users className="h-3 w-3" />
                      {table.partySize} guests
                    </div>
                  )}

                  {/* ORDERS */}

                  {isOccupied && typeof table.orderCount === "number" && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30">
                      <Utensils className="h-3 w-3" />
                      {table.orderCount}{" "}
                      {table.orderCount === 1 ? "order" : "orders"}
                    </div>
                  )}

                  {/* YOUR TABLE */}

                  {isMine && (
                    <div
                      className="
                          mt-3
                          flex
                          items-center
                          gap-1.5
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-cyan-300
                        "
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Assigned to you
                    </div>
                  )}

                  {/* OTHER WAITER */}

                  {isOccupied && !isMine && table.waiterStaffId && (
                    <div
                      className="
                            mt-3
                            flex
                            items-center
                            gap-1.5
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-purple-300/70
                          "
                    >
                      <Clock3 className="h-3 w-3" />
                      Another waiter
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

/*
 * ============================================================
 * FILTER BUTTON
 * ============================================================
 */

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;

  label: string;

  count: number;

  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{
        scale: 0.96,
      }}
      onClick={onClick}
      className={`
        flex
        min-h-10
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
          active
            ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
            : "border-white/5 bg-white/[0.02] text-white/40"
        }
      `}
    >
      {label}

      <span
        className={`
          rounded-full
          px-1.5
          py-0.5
          text-[9px]

          ${
            active ? "bg-blue-400/10 text-blue-300" : "bg-white/5 text-white/25"
          }
        `}
      >
        {count}
      </span>
    </motion.button>
  );
}

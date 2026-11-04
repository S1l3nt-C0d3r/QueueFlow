import { Bell, LogOut, Menu, RefreshCw, Utensils } from "lucide-react";
import { motion } from "motion/react";

interface WaiterHeaderProps {
  displayName: string;
  pendingBills?: number;
  activeOrders?: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onBills?: () => void;
  onMenu?: () => void;
  onLogout?: () => void;
}

export default function WaiterHeader({
  displayName,
  pendingBills = 0,
  activeOrders = 0,
  isRefreshing = false,
  onRefresh,
  onBills,
  onMenu,
  onLogout,
}: WaiterHeaderProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-white/10
        bg-slate-950/85
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          h-16
          items-center
          justify-between
          px-4
          sm:px-6
        "
      >
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={onMenu}
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
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <div className="flex min-w-0 items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-blue-500
                to-cyan-500
                shadow-lg
                shadow-blue-500/20
              "
            >
              <Utensils className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-white">
                QueueFlow
              </h1>

              <p className="truncate text-[11px] text-white/40">
                Waiter Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active orders */}

          <div
            className="
              hidden
              rounded-xl
              border
              border-blue-500/10
              bg-blue-500/5
              px-3
              py-2
              sm:block
            "
          >
            <p className="text-[9px] uppercase tracking-wider text-white/30">
              Active Orders
            </p>

            <p className="text-sm font-bold text-blue-300">{activeOrders}</p>
          </div>

          {/* Bills */}

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={onBills}
            className="
              relative
              flex
              h-10
              w-10
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
            aria-label="Bill requests"
          >
            <Bell className="h-5 w-5" />

            {pendingBills > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[10px]
                  font-bold
                  text-white
                  ring-2
                  ring-slate-950
                "
              >
                {pendingBills > 9 ? "9+" : pendingBills}
              </span>
            )}
          </motion.button>

          {/* Refresh */}

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={onRefresh}
            disabled={isRefreshing}
            className="
              hidden
              h-10
              w-10
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
              disabled:opacity-40
              sm:flex
            "
            aria-label="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </motion.button>

          {/* Desktop identity */}

          <div
            className="
              ml-1
              hidden
              max-w-32
              border-l
              border-white/10
              pl-3
              text-right
              sm:block
            "
          >
            <p className="truncate text-sm font-semibold text-white">
              {displayName || "Waiter"}
            </p>

            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Staff
            </p>
          </div>

          {/* Logout */}

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={onLogout}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-red-500/10
              bg-red-500/5
              text-red-400
              transition
              hover:bg-red-500/10
              hover:text-red-300
            "
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* MOBILE INFO BAR */}

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-white/5
          bg-white/[0.02]
          px-4
          py-2
          sm:hidden
        "
      >
        <div>
          <p className="text-[9px] uppercase tracking-wider text-white/30">
            Logged in as
          </p>

          <p className="text-sm font-medium text-white/80">
            {displayName || "Waiter"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-white/30">
              Orders
            </p>

            <p className="text-xs font-semibold text-blue-300">
              {activeOrders}
            </p>
          </div>

          {pendingBills > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-300">
              <Bell className="h-3.5 w-3.5" />

              {pendingBills}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

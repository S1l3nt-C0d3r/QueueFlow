import {
  ClipboardList,
  Users,
  Grid3X3,
  UserCog,
  UtensilsCrossed,
  ShoppingBag,
  X,
} from "lucide-react";

import { motion } from "motion/react";

export type AdminSection =
  | "overview"
  | "queue"
  | "tables"
  | "staff"
  | "menu"
  | "orders";

interface AdminSidebarProps {
  activeSection: AdminSection;

  onSectionChange: (section: AdminSection) => void;

  open?: boolean;

  onClose?: () => void;
}

interface NavigationItem {
  id: AdminSection;

  label: string;

  description: string;

  icon: typeof ClipboardList;
}

const NAVIGATION: NavigationItem[] = [
  {
    id: "overview",

    label: "Overview",

    description: "Restaurant overview",

    icon: ClipboardList,
  },

  {
    id: "queue",

    label: "Queue",

    description: "Waiting customers",

    icon: Users,
  },

  {
    id: "tables",

    label: "Tables",

    description: "Table management",

    icon: Grid3X3,
  },

  {
    id: "staff",

    label: "Staff",

    description: "Staff management",

    icon: UserCog,
  },

  {
    id: "menu",

    label: "Menu",

    description: "Menu management",

    icon: UtensilsCrossed,
  },

  {
    id: "orders",

    label: "Orders",

    description: "Restaurant orders",

    icon: ShoppingBag,
  },
];

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  open = false,
  onClose,
}: AdminSidebarProps) {
  function handleNavigation(section: AdminSection) {
    onSectionChange(section);

    onClose?.();
  }

  return (
    <>
      {/* ======================================================
          MOBILE BACKDROP
          ====================================================== */}

      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[280px]
          flex-col
          border-r
          border-white/10
          bg-zinc-950/95
          shadow-2xl
          backdrop-blur-xl
          transition-transform
          duration-300
          lg:static
          lg:z-auto
          lg:translate-x-0
          lg:bg-zinc-950/70

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ==================================================
            BRAND
            ================================================== */}

        <div
          className="
            flex
            h-[72px]
            shrink-0
            items-center
            justify-between
            border-b
            border-white/10
            px-5
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-purple-500
                to-pink-600
                shadow-lg
              "
            >
              <ClipboardList
                className="
                  h-5
                  w-5
                  text-white
                "
              />
            </div>

            <div>
              <p
                className="
                  text-base
                  font-bold
                  text-white
                "
              >
                QueueFlow
              </p>

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-widest
                  text-white/30
                "
              >
                Admin
              </p>
            </div>
          </div>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-white/50
              transition
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
            aria-label="Close navigation"
          >
            <X
              className="
                h-5
                w-5
              "
            />
          </button>
        </div>

        {/* ==================================================
            NAVIGATION
            ================================================== */}

        <nav
          className="
            flex-1
            space-y-2
            overflow-y-auto
            p-4
          "
        >
          {NAVIGATION.map((item) => {
            const Icon = item.icon;

            const active = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => handleNavigation(item.id)}
                className={`
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-left
                    transition-all

                    ${
                      active
                        ? `
                          bg-gradient-to-r
                          from-purple-500/20
                          to-pink-500/10
                          text-white
                          shadow-lg
                        `
                        : `
                          text-white/50
                          hover:bg-white/5
                          hover:text-white
                        `
                    }
                  `}
              >
                {/* ACTIVE INDICATOR */}

                <div
                  className={`
                      absolute
                      left-0
                      h-8
                      w-1
                      rounded-r-full
                      bg-gradient-to-b
                      from-purple-400
                      to-pink-500
                      transition-opacity

                      ${active ? "opacity-100" : "opacity-0"}
                    `}
                />

                {/* ICON */}

                <div
                  className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      transition-all

                      ${
                        active
                          ? `
                            bg-gradient-to-br
                            from-purple-500
                            to-pink-600
                            shadow-lg
                          `
                          : `
                            bg-white/5
                            group-hover:bg-white/10
                          `
                      }
                    `}
                >
                  <Icon
                    className="
                        h-4
                        w-4
                      "
                  />
                </div>

                {/* LABEL */}

                <div className="min-w-0">
                  <p
                    className={`
                        text-sm
                        font-semibold
                        ${active ? "text-white" : "text-white/70"}
                      `}
                  >
                    {item.label}
                  </p>

                  <p
                    className="
                        mt-0.5
                        truncate
                        text-[11px]
                        text-white/30
                      "
                  >
                    {item.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* ==================================================
            FOOTER
            ================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-white/10
            p-4
          "
        >
          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-4
            "
          >
            <p
              className="
                text-xs
                font-semibold
                text-white/70
              "
            >
              Restaurant Admin
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-relaxed
                text-white/30
              "
            >
              Manage your restaurant operations from one place.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

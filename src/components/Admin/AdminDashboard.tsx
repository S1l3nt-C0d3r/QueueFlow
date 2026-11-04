import { useState } from "react";

import { motion } from "motion/react";

import {
  Users,
  Grid3X3,
  UserCog,
  UtensilsCrossed,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

type AdminSection =
  | "overview"
  | "queue"
  | "tables"
  | "staff"
  | "menu"
  | "orders";

interface AdminDashboardProps {
  onSectionChange?: (section: AdminSection) => void;
}

interface DashboardSection {
  id: AdminSection;

  title: string;

  description: string;

  icon: typeof Users;

  gradient: string;
}

const SECTIONS: DashboardSection[] = [
  {
    id: "overview",

    title: "Overview",

    description: "View an overview of your restaurant operations.",

    icon: ClipboardList,

    gradient: "from-cyan-500 to-blue-600",
  },

  {
    id: "queue",

    title: "Queue",

    description: "Manage customers waiting to be seated.",

    icon: Users,

    gradient: "from-purple-500 to-pink-600",
  },

  {
    id: "tables",

    title: "Tables",

    description: "Manage tables, capacity and availability.",

    icon: Grid3X3,

    gradient: "from-cyan-500 to-blue-600",
  },

  {
    id: "staff",

    title: "Staff",

    description: "Manage restaurant staff and their roles.",

    icon: UserCog,

    gradient: "from-green-500 to-emerald-600",
  },

  {
    id: "menu",

    title: "Menu",

    description: "Manage menu categories and items.",

    icon: UtensilsCrossed,

    gradient: "from-orange-500 to-pink-600",
  },

  {
    id: "orders",

    title: "Orders",

    description: "View and manage restaurant orders.",

    icon: ClipboardList,

    gradient: "from-yellow-500 to-orange-600",
  },
];

export default function AdminDashboard({
  onSectionChange,
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  function handleSectionChange(section: AdminSection) {
    setActiveSection(section);

    onSectionChange?.(section);
  }

  return (
    <div className="min-h-full">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <h1
          className="
            text-3xl
            font-bold
            tracking-tight
            text-white
          "
        >
          Admin Dashboard
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-white/50
          "
        >
          Manage your restaurant from one place.
        </p>
      </motion.div>

      {/* ======================================================
          SECTION GRID
          ====================================================== */}

      <div
        className="
          grid
          gap-5
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        {SECTIONS.map((section, index) => {
          const Icon = section.icon;

          const active = activeSection === section.id;

          return (
            <motion.button
              key={section.id}
              type="button"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              whileHover={{
                y: -4,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => handleSectionChange(section.id)}
              className={`
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  p-6
                  text-left
                  shadow-xl
                  backdrop-blur-xl
                  transition-all

                  ${
                    active
                      ? "border-white/20 bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                  }
                `}
            >
              {/* BACKGROUND GLOW */}

              <div
                className={`
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-32
                    w-32
                    rounded-full
                    bg-gradient-to-br
                    ${section.gradient}
                    opacity-10
                    blur-3xl
                    transition-opacity
                    group-hover:opacity-20
                  `}
              />

              {/* ICON */}

              <div
                className={`
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    ${section.gradient}
                    shadow-lg
                  `}
              >
                <Icon
                  className="
                      h-6
                      w-6
                      text-white
                    "
                />
              </div>

              {/* CONTENT */}

              <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
              >
                <div>
                  <h2
                    className="
                        text-lg
                        font-bold
                        text-white
                      "
                  >
                    {section.title}
                  </h2>

                  <p
                    className="
                        mt-2
                        text-sm
                        leading-relaxed
                        text-white/50
                      "
                  >
                    {section.description}
                  </p>
                </div>

                <ChevronRight
                  className="
                      mt-1
                      h-5
                      w-5
                      shrink-0
                      text-white/30
                      transition-all
                      group-hover:translate-x-1
                      group-hover:text-white/70
                    "
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ======================================================
          ACTIVE SECTION INDICATOR
          ====================================================== */}

      <motion.div
        key={activeSection}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        className="
          mt-6
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-5
          py-4
          text-sm
          text-white/50
        "
      >
        Currently viewing:{" "}
        <span
          className="
            font-semibold
            capitalize
            text-white
          "
        >
          {activeSection}
        </span>
      </motion.div>
    </div>
  );
}

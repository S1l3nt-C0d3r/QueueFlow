import { Menu, Bell, UserCog, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
}

export default function AdminHeader({
  title = "Admin Dashboard",
  subtitle = "Restaurant Management",
  onMenuClick,
  onNotificationsClick,
  onProfileClick,
}: AdminHeaderProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-white/10
        bg-zinc-950/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          min-h-[72px]
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* LEFT */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          {/* MOBILE MENU */}

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={onMenuClick}
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
              lg:hidden
            "
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          {/* TITLE */}

          <div className="min-w-0">
            <h1
              className="
                truncate
                text-lg
                font-bold
                text-white
                sm:text-xl
              "
            >
              {title}
            </h1>

            <p
              className="
                hidden
                truncate
                text-xs
                text-white/40
                sm:block
              "
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            sm:gap-3
          "
        >
          {/* NOTIFICATIONS */}

          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={onNotificationsClick}
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
              text-white/60
              transition
              hover:bg-white/10
              hover:text-white
            "
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </motion.button>

          {/* PROFILE */}

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onProfileClick}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-3
              py-2
              text-white
              transition
              hover:bg-white/10
            "
            aria-label="Admin profile"
          >
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-purple-500
                to-pink-600
              "
            >
              <UserCog className="h-4 w-4 text-white" />
            </div>

            <span
              className="
                hidden
                text-sm
                font-semibold
                sm:block
              "
            >
              Admin
            </span>
          </motion.button>

          {/* LOGOUT */}

          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleLogout}
            className="
              flex
              h-10
              items-center
              gap-2
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              px-3
              text-red-400
              transition
              hover:bg-red-500/20
              hover:text-red-300
            "
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />

            <span
              className="
                hidden
                text-sm
                font-semibold
                sm:block
              "
            >
              Logout
            </span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface AlertBannerProps {
  error: string | null;
  success: string | null;
}

export default function AlertBanner({
  error,
  success,
}: AlertBannerProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3"
        >
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
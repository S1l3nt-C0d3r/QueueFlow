import { useState, FormEvent } from 'react';
import { authService } from "../services/auth.service";
import { useAuth } from "../context/auth.context";
import { LogIn, AlertCircle, CheckCircle2, Loader, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  
  // Staff Login
  const [staffNumber, setStaffNumber] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (e: FormEvent) => {
  e.preventDefault();

  setError(null);
  setSuccess(null);
  setStaffLoading(true);

  try {
    const response = await authService.login({
      staffNumber,
      password: staffPassword,
    });

    await login(response.token);

    setSuccess("Login successful!");

    switch (response.staff.roleId) {
      case "admin":
        navigate(`/restaurant/${response.staff.restaurantId}`);
        break;

      case "receptionist":
        navigate(`/receptionist/${response.staff.restaurantId}`);
        break;

      case "waiter":
        navigate(`/waiter/${response.staff.restaurantId}`);
        break;

      default:
        throw new Error("Unknown role");
    }
  } catch (err: any) {
    setError(err.message || "Login failed");
  } finally {
    setStaffLoading(false);
  }
};
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white font-sans flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50"
          >
            <LogIn className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            QueueFlow
          </h1>
          <p className="text-white/50">Restaurant Staff Login</p>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3 text-sm"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3 text-sm"
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>
          <motion.form
  onSubmit={handleLogin}
  className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-8 rounded-2xl shadow-2xl space-y-4"
>
  <div>
    <label className="text-sm font-bold text-white/80 block mb-2">
      Staff Number
    </label>

    <input
      type="text"
      value={staffNumber}
      onChange={(e) => setStaffNumber(e.target.value)}
      placeholder="1001"
      required
      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/30 outline-none focus:border-blue-500/50 transition-all"
    />
  </div>

  <div>
    <label className="text-sm font-bold text-white/80 block mb-2">
      Password
    </label>

    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={staffPassword}
        onChange={(e) => setStaffPassword(e.target.value)}
        placeholder="••••••••"
        required
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/30 outline-none focus:border-blue-500/50 transition-all"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  </div>

  <motion.button
    type="submit"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={staffLoading}
    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
  >
    {staffLoading ? (
      <>
        <Loader className="h-5 w-5 animate-spin" />
        Logging in...
      </>
    ) : (
      <>
        <LogIn className="h-5 w-5" />
        Login
      </>
    )}
  </motion.button>
</motion.form>
        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/50 text-xs mt-8"
        >
          Secure Login • Staff Number Based • Admin Managed
        </motion.p>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useUserRole } from '../hooks/useUserRole';

export default function Login() {
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();
  const { profile, loading } = useUserRole(user);

  useEffect(() => {
    // If user has a complete profile, redirect to their dashboard
    if (user && profile && !loading) {
      if (profile.role === 'global_admin') {
        navigate('/admin');
      } else if (profile.role === 'waiter') {
        navigate(`/waiter/${profile.restaurantId}`);
      } else if (profile.role === 'receptionist') {
        navigate(`/receptionist/${profile.restaurantId}`);
      } else if (profile.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [profile, loading, user, navigate]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      // Profile loading will be handled by useUserRole hook
    } catch (err: any) {
      setError(err.message);
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError('');
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err: any) {
      setError('Failed to sign out');
    }
  };

  // Show loading state while checking profile
  if (user && loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center mb-4"
          >
            <Loader className="h-12 w-12 text-indigo-500" />
          </motion.div>
          <p className="text-white/60">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // Show error if user not authorized
  if (user && !profile && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 font-sans relative overflow-hidden pb-safe pt-safe">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full space-y-8 p-8 sm:p-12 glass-morphism rounded-[2.5rem] sm:rounded-5xl relative z-10"
        >
          <div className="text-center">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-red-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl shadow-red-500/20">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">Access Denied</h2>
            <p className="mt-2 sm:mt-3 text-white/40 font-medium uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">
              Not Authorized
            </p>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-white/70 text-sm">
              Your account <span className="font-bold text-white">{user.email}</span> has not been authorized for this system.
            </p>
            <p className="text-white/50 text-xs">
              Please contact your restaurant administrator to grant you access.
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 border border-red-500/30 text-red-400 font-bold rounded-2xl bg-red-500/5 hover:bg-red-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Try Another Account
          </button>
        </motion.div>
      </div>
    );
  }

  // Login screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 font-sans relative overflow-hidden pb-safe pt-safe">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 sm:space-y-10 p-8 sm:p-12 glass-morphism rounded-[2.5rem] sm:rounded-5xl relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 mesh-gradient-purple rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl shadow-purple-500/20">
            <LogIn className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">QueueFlow</h2>
          <p className="mt-2 sm:mt-3 text-white/40 font-medium uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Staff Portal</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold border border-red-500/20 text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 border border-white/10 text-white font-bold rounded-2xl bg-white/5 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Loader className="h-5 w-5" />
                </motion.div>
                Signing in...
              </>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
                Sign in with Google
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}

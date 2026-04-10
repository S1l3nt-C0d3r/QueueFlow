import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/waiter');
    } catch (err: any) {
      setError(err.message);
    }
  };

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
            className="w-full flex items-center justify-center gap-3 px-6 py-5 border border-white/10 text-white font-bold rounded-2xl bg-white/5 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
            Sign in with Google
          </button>
          
          <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}

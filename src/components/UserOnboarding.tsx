import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Users, Building2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
  user: User;
}

export default function UserOnboarding({ user }: OnboardingProps) {
  const [role, setRole] = useState<'waiter' | 'receptionist' | 'admin' | null>(null);
  const [restaurantId, setRestaurantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!role || !restaurantId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Staff Member',
        role,
        restaurantId,
        createdAt: new Date().toISOString()
      });

      // Redirect based on role
      if (role === 'waiter') {
        navigate(`/waiter/${restaurantId}`);
      } else if (role === 'receptionist') {
        navigate(`/receptionist/${restaurantId}`);
      } else if (role === 'admin') {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-safe pt-safe flex items-center justify-center px-4">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 p-8 sm:p-12 glass-morphism rounded-3xl sm:rounded-5xl relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 mesh-gradient-blue rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl shadow-blue-500/20">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">Welcome!</h2>
          <p className="mt-2 sm:mt-3 text-white/40 font-medium uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Complete Your Profile</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Role</label>
            <div className="space-y-2">
              {['waiter', 'receptionist', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r as any)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-medium uppercase tracking-wider text-sm ${
                    role === r
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Restaurant ID</label>
            <input
              type="text"
              value={restaurantId}
              onChange={e => setRestaurantId(e.target.value)}
              placeholder="e.g., pizza-palace"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white placeholder:text-white/30 text-sm"
            />
            <p className="text-[10px] text-white/40">Ask your admin for your restaurant ID</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !role || !restaurantId.trim()}
            className="w-full py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </div>

        <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
          Secure Staff Portal
        </p>
      </motion.div>
    </div>
  );
}

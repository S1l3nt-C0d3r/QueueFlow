import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc, updateDoc, Unsubscribe } from 'firebase/firestore';
import { Users, Clock, CheckCircle2, XCircle, AlertCircle, LogOut, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export default function ReceptionistView() {
  const { restaurantId: urlRestaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const setupView = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        let profile = {
          email: auth.currentUser.email,
          role: 'receptionist',
          restaurantId: urlRestaurantId || 'default'
        };

        if (userDoc.exists()) {
          const storedProfile = userDoc.data() as any;
          profile = {
            ...storedProfile,
            restaurantId: urlRestaurantId || storedProfile.restaurantId
          };
        }
        
        setUserProfile(profile);
        
        // Fetch restaurant
        const restaurantIdToUse = profile.restaurantId;
        try {
          const restDoc = await getDoc(doc(db, 'restaurants', restaurantIdToUse));
          if (restDoc.exists()) {
            setRestaurant({ id: restDoc.id, ...restDoc.data() });
          } else {
            setRestaurant({ id: restaurantIdToUse, name: 'QueueFlow Restaurant' });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `restaurants/${restaurantIdToUse}`);
        }

        // Listen to queue
        const q = query(
          collection(db, 'restaurants', restaurantIdToUse, 'queue'),
          where('status', 'in', ['waiting', 'notified']),
          orderBy('joinedAt', 'asc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          setQueue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, `restaurants/${restaurantIdToUse}/queue`);
          setError("Permission denied. You may not be assigned to this restaurant.");
          setLoading(false);
        });

      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${auth.currentUser?.uid}`);
        setLoading(false);
      }
    };

    setupView();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [urlRestaurantId]);

  const handleSeat = async (entryId: string) => {
    if (!restaurant) return;
    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id, 'queue', entryId), {
        status: 'seated'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `restaurants/${restaurant.id}/queue/${entryId}`);
    }
  };

  const handleCancel = async (entryId: string) => {
    if (!restaurant) return;
    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id, 'queue', entryId), {
        status: 'cancelled'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `restaurants/${restaurant.id}/queue/${entryId}`);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleLogout}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const waitingCount = queue.filter(e => e.status === 'waiting').length;
  const notifiedCount = queue.filter(e => e.status === 'notified').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 pb-safe">
      {/* Top Nav */}
      <nav className="glass border-b border-white/5 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 mesh-gradient-blue rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight leading-tight">{restaurant?.name}</h1>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Receptionist</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-white">{userProfile?.email}</p>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Host Stand</p>
          </div>
          <button 
            onClick={handleLogout}
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="glass-morphism p-6 sm:p-8 rounded-3xl sm:rounded-4xl relative overflow-hidden">
            <div className="absolute inset-0 mesh-gradient-blue opacity-10" />
            <div className="relative z-10">
              <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 sm:mb-6">Queue Overview</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                  <p className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tighter">{waitingCount}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Waiting</p>
                </div>
                <div className="p-4 sm:p-6 bg-green-500/10 rounded-2xl sm:rounded-3xl border border-green-500/20">
                  <p className="text-3xl sm:text-4xl font-display font-bold text-green-400 tracking-tighter">{notifiedCount}</p>
                  <p className="text-[9px] sm:text-[10px] text-green-400/60 font-black uppercase tracking-widest mt-1">Ready</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morphism p-6 sm:p-8 rounded-3xl sm:rounded-4xl relative overflow-hidden hidden sm:block">
            <div className="absolute inset-0 mesh-gradient-purple opacity-10" />
            <div className="relative z-10">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                <Store className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mb-3">Host Stand</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-medium">
                Welcome customers as they arrive. Parties highlighted in green have been notified and are ready to be seated.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Queue List */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">Active Queue</h2>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">
                {queue.length} Total
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {queue.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-4 sm:p-6 rounded-3xl sm:rounded-4xl border transition-all relative overflow-hidden",
                    entry.status === 'notified' 
                      ? "bg-green-500/5 border-green-500/20 shadow-2xl shadow-green-500/10" 
                      : "bg-white/[0.03] border-white/5"
                  )}
                >
                  {entry.status === 'notified' && (
                    <div className="absolute inset-0 mesh-gradient-green opacity-5" />
                  )}
                  
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={cn(
                        "h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-display font-bold tracking-tighter shrink-0",
                        entry.status === 'notified' ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-white/5 text-white/20"
                      )}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <p className="font-display font-bold text-white text-lg sm:text-xl tracking-tight">{entry.customerName}</p>
                          <span className="px-2 py-0.5 bg-white/5 rounded-lg text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest border border-white/5">
                            P{entry.partySize}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 sm:mt-2">
                          <div className="flex items-center gap-1.5 text-white/30 text-[10px] sm:text-xs font-medium">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {new Date(entry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {entry.status === 'notified' && (
                            <div className="flex items-center gap-1.5 text-red-400/80 text-[10px] sm:text-xs font-bold">
                              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Exp {new Date(entry.claimExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {entry.status === 'notified' ? (
                        <button
                          onClick={() => handleSeat(entry.id)}
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-green-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Seat
                        </button>
                      ) : (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleCancel(entry.id)}
                            className="flex-1 sm:h-12 sm:w-12 py-3 sm:py-0 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all text-[10px] sm:text-base uppercase sm:normal-case font-bold sm:font-normal tracking-widest sm:tracking-normal"
                          >
                            <XCircle className="h-5 w-5 sm:mr-0 mr-2" />
                            <span className="sm:hidden">Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {queue.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 sm:py-32 glass-morphism rounded-3xl sm:rounded-4xl border-2 border-dashed border-white/5"
              >
                <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-white/[0.02] rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white/10" />
                </div>
                <p className="text-white/40 font-display font-bold text-lg sm:text-xl">The queue is empty</p>
                <p className="text-[9px] sm:text-[10px] text-white/20 uppercase font-black tracking-[0.3em] mt-2">Ready for next customers</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

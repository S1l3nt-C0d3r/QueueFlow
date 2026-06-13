import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc, updateDoc, Unsubscribe } from 'firebase/firestore';
import { Users, Clock, CheckCircle2, XCircle, AlertCircle, LogOut, LayoutDashboard, History, ShoppingCart, ArrowLeft, Grid3X3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import OrdersView from './OrdersView';
import RestaurantLayout from './RestaurantLayout';
import UserProfile from './UserProfile';

type ViewMode = 'queue' | 'orders' | 'tables';

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

export default function WaiterView() {
  const { restaurantId: urlRestaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('queue');
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const setupView = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.email!.toLowerCase()));
        let profile = {
          email: auth.currentUser.email,
          role: 'waiter',
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
          where('status', 'in', ['waiting', 'notified', 'seated']),
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
        handleFirestoreError(err, OperationType.GET, `users/${auth.currentUser?.email}`);
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
        status: 'seated',
        seatedAt: new Date().toISOString()
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

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="bg-white/5 border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center backdrop-blur-xl">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 mb-6">{error}</p>
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

  const seatedCount = queue.filter(e => e.status === 'seated').length;
  const waitingCount = queue.filter(e => e.status === 'waiting').length;
  const notifiedCount = queue.filter(e => e.status === 'notified').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 pb-safe">
      {/* Top Nav */}
      <nav className="glass border-b border-white/5 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title="Back to Admin"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 sm:h-12 sm:w-12 mesh-gradient-indigo rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight leading-tight">{restaurant?.name}</h1>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Waiter</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <UserProfile user={auth.currentUser} displayName={userProfile?.displayName} />
          <button 
            onClick={handleLogout}
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setViewMode('queue')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                viewMode === 'queue'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Users className="h-5 w-5" />
              Queue
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                viewMode === 'orders'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              Orders
            </button>
            <button
              onClick={() => setViewMode('tables')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                viewMode === 'tables'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Grid3X3 className="h-5 w-5" />
              Tables
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Queue View */}
        {viewMode === 'queue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                <p className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tighter">{seatedCount}</p>
                <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Seated</p>
              </div>
              <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                <p className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tighter">{notifiedCount}</p>
                <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Ready</p>
              </div>
              <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                <p className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tighter">{waitingCount}</p>
                <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Waiting</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white">Queue List</h3>
              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence mode="popLayout">
                  {queue.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-12 rounded-3xl border-2 border-dashed border-white/10 text-center"
                    >
                      <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 font-medium">No queue entries</p>
                    </motion.div>
                  ) : (
                    queue.map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all",
                          entry.status === 'seated' ? "bg-green-500/5 border-green-500/20" :
                          entry.status === 'notified' ? "bg-blue-500/5 border-blue-500/20" :
                          "bg-white/5 border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm sm:text-base">{entry.customerName}</h4>
                            <p className="text-[10px] sm:text-xs text-white/50">
                              {entry.partySize} people • {entry.status}
                            </p>
                          </div>
                          {entry.status === 'notified' && (
                            <button
                              onClick={() => handleSeat(entry.id)}
                              className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all whitespace-nowrap flex-shrink-0"
                            >
                              Seat
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Orders View */}
        {viewMode === 'orders' && restaurant && (
          <OrdersView restaurantId={restaurant.id} />
        )}

        {/* Tables View */}
        {viewMode === 'tables' && restaurant && (
          <RestaurantLayout restaurantId={restaurant.id} />
        )}
      </main>
    </div>
  );
}

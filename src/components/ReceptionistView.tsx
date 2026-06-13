import { useState, useEffect, FormEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc, updateDoc, Unsubscribe } from 'firebase/firestore';
import { Users, Clock, CheckCircle2, XCircle, AlertCircle, LogOut, Store, ArrowLeft, Grid3X3, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import RestaurantLayout from './RestaurantLayout';
import UserProfile from './UserProfile';

type TabType = 'queue' | 'tables';

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
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const setupView = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.email!.toLowerCase()));
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
      setNotificationMessage('Guest seated ✓');
      setTimeout(() => setNotificationMessage(null), 3000);
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
      setNotificationMessage('Cancelled ✓');
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `restaurants/${restaurant.id}/queue/${entryId}`);
    }
  };

  const handleNotify = async (entryId: string) => {
    if (!restaurant) return;
    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id, 'queue', entryId), {
        status: 'notified',
        claimExpiresAt: new Date(Date.now() + 10 * 60000).toISOString()
      });
      setNotificationMessage('Guest notified ✓');
      setTimeout(() => setNotificationMessage(null), 3000);
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
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('queue')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base",
                activeTab === 'queue'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Users className="h-5 w-5" />
              Queue
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base",
                activeTab === 'tables'
                  ? 'border-blue-500 text-blue-400'
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
        {/* Notification */}
        <AnimatePresence>
          {notificationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-3"
            >
              <Bell className="h-5 w-5" />
              {notificationMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
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
                    Manage your queue efficiently. Notify customers when tables are ready, then seat them. Use the Tables tab to manage seating.
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
                  {queue.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-12 rounded-3xl border-2 border-dashed border-white/10 text-center"
                    >
                      <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 font-medium">No one in the queue right now</p>
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
                          "p-4 sm:p-6 rounded-3xl sm:rounded-4xl border transition-all relative overflow-hidden",
                          entry.status === 'notified' 
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-white/5 border-white/10"
                        )}
                      >
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1">
                              <div className={cn(
                                "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center font-display font-bold text-lg sm:text-xl flex-shrink-0",
                                entry.status === 'notified' ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"
                              )}>
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-white truncate">{entry.customerName}</h3>
                                <p className={cn(
                                  "text-xs sm:text-sm font-medium",
                                  entry.status === 'notified' ? "text-green-400" : "text-white/50"
                                )}>
                                  Party of {entry.partySize} • {entry.status === 'notified' ? '✓ Ready to be seated' : `Est. ${idx * 10}m`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {entry.phoneNumber && (
                            <p className="text-[10px] text-white/40 mb-4 font-mono">{entry.phoneNumber}</p>
                          )}

                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {entry.status === 'waiting' && (
                              <button
                                onClick={() => handleNotify(entry.id)}
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg sm:rounded-xl hover:bg-orange-500/30 transition-all flex items-center justify-center gap-2 min-w-max"
                              >
                                <Bell className="h-4 w-4" />
                                Notify
                              </button>
                            )}
                            {entry.status === 'notified' && (
                              <button
                                onClick={() => handleSeat(entry.id)}
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-green-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg sm:rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 min-w-max"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Seat
                              </button>
                            )}
                            <button
                              onClick={() => handleCancel(entry.id)}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 text-white/70 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg sm:rounded-xl hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center gap-2 min-w-max"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && restaurant && (
          <RestaurantLayout restaurantId={restaurant.id} />
        )}
      </main>
    </div>
  );
}

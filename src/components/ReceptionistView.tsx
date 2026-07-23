import { useState, useEffect, FormEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc, updateDoc, Unsubscribe } from 'firebase/firestore';
import { Users, Clock, CheckCircle2, XCircle, AlertCircle, LogOut, Store, Bell, Phone, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import RestaurantLayout from './RestaurantLayout';
import UserProfile from './UserProfile';

type TabType = 'queue' | 'tables';

export default function ReceptionistView() {
  const { restaurantId: urlRestaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const setupView = async () => {
      if (!auth.currentUser) return;

      try {
        const userEmail = auth.currentUser.email?.toLowerCase();
        const userDoc = await getDoc(doc(db, 'users', urlRestaurantId || 'default', 'staff', userEmail!));
        
        let profile = {
          email: auth.currentUser.email,
          role: 'receptionist',
          restaurantId: urlRestaurantId || 'default'
        };

        if (userDoc.exists()) {
          profile = { ...profile, ...userDoc.data() };
        }
        
        setUserProfile(profile);
        
        const restaurantIdToUse = profile.restaurantId;
        const restDoc = await getDoc(doc(db, 'restaurants', restaurantIdToUse));
        if (restDoc.exists()) {
          setRestaurant({ id: restDoc.id, ...restDoc.data() });
        } else {
          setRestaurant({ id: restaurantIdToUse, name: 'QueueFlow Restaurant' });
        }
        setLoading(false);
      } catch (err) {
        console.error('Setup error:', err);
        setError('Failed to load receptionist view');
        setLoading(false);
      }
    };

    setupView();
  }, [urlRestaurantId]);

  useEffect(() => {
    if (loading || !restaurant) return;

    const q = query(
      collection(db, 'restaurants', restaurant.id, 'queue'),
      where('status', 'in', ['waiting', 'notified']),
      orderBy('joinedAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc, idx) => ({
        id: doc.id,
        position: idx + 1,
        ...doc.data()
      }));
      setQueue(entries);
    });

    return () => unsubscribe();
  }, [loading, restaurant]);

  const handleNotifyCustomer = async (entryId: string, customerName: string) => {
    try {
      const claimExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await updateDoc(doc(db, 'restaurants', restaurant.id, 'queue', entryId), {
        status: 'notified',
        notificationTime: new Date().toISOString(),
        claimExpiresAt: claimExpiry
      });
      setSuccessMessage(`Notified ${customerName}! ✓`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error notifying customer:', err);
      setError('Failed to notify customer');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white font-sans">
      {/* Header */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              {restaurant?.name || 'Receptionist'}
            </h1>
            <p className="text-xs text-white/50 uppercase tracking-widest">Queue Management</p>
          </div>
        </div>
        <UserProfile user={auth.currentUser} displayName={userProfile?.displayName} />
      </motion.nav>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-sm bg-white/5 border-b border-white/10"
      >
        <div className="px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex gap-4">
            {[
              { key: 'queue', label: 'Queue', icon: Users, color: 'from-blue-500 to-cyan-600' },
              { key: 'tables', label: 'Tables', icon: Store, color: 'from-purple-500 to-pink-600' }
            ].map(({ key, label, icon: Icon, color }) => (
              <motion.button
                key={key}
                onClick={() => setActiveTab(key as TabType)}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "px-6 py-4 font-bold border-b-2 transition-all flex items-center gap-2 text-sm whitespace-nowrap",
                  activeTab === key
                    ? `border-b-4 bg-gradient-to-r ${color} text-white rounded-t-lg shadow-lg`
                    : 'border-transparent text-white/60 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 sm:mx-8 mt-4 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 sm:mx-8 mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Current Queue
                </h2>
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-300 uppercase">
                  {queue.length} Waiting
                </div>
              </div>

              {queue.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center shadow-2xl"
                >
                  <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 font-medium">Queue is empty</p>
                  <p className="text-white/30 text-sm mt-1">Customers will appear here</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {queue.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      className={cn(
                        "backdrop-blur-xl border-2 p-6 rounded-2xl transition-all shadow-lg",
                        entry.status === 'notified'
                          ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 shadow-green-500/20"
                          : "bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-blue-500/30 hover:shadow-blue-500/20"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={cn(
                              "h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg",
                              entry.status === 'notified'
                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                : "bg-gradient-to-br from-blue-500 to-cyan-600"
                            )}
                          >
                            #{entry.position}
                          </motion.div>
                          <div>
                            <p className="text-xl font-bold text-white">{entry.customerName}</p>
                            <p className="text-white/60 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Party of {entry.partySize}
                            </p>
                          </div>
                        </div>

                        {entry.status === 'notified' ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg"
                          >
                            <p className="text-sm font-bold text-green-300">✓ Notified</p>
                          </motion.div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNotifyCustomer(entry.id, entry.customerName)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                          >
                            <Bell className="h-4 w-4" />
                            Notify
                          </motion.button>
                        )}
                      </div>

                      {entry.customerPhone && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-white/60 mb-1">Phone</p>
                          <a href={`tel:${entry.customerPhone}`} className="text-sm text-blue-400 hover:text-blue-300 font-mono">
                            {entry.customerPhone}
                          </a>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RestaurantLayout restaurantId={restaurant?.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

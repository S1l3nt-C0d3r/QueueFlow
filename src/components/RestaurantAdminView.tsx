import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, where, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Users, Menu, BarChart3, LogOut, Settings, Plus, Trash2, Clock, CheckCircle2, XCircle, AlertCircle, Grid3X3, TrendingUp, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import MenuManagement from './MenuManagement';
import RestaurantLayout from './RestaurantLayout';
import StaffManagement from './StaffManagement';
import UserProfile from './UserProfile';
import { motion, AnimatePresence } from 'motion/react';

type AdminTab = 'overview' | 'staff' | 'menu' | 'queue' | 'tables';

interface RestaurantAdminViewProps {
  restaurantId: string;
  restaurantName: string;
  displayName?: string;
}

interface QueueEntry {
  id: string;
  customerName: string;
  partySize: number;
  status: 'waiting' | 'notified' | 'seated' | 'cancelled' | 'expired';
  position: number;
  createdAt: string;
  updatedAt: string;
}

export default function RestaurantAdminView({restaurantId, restaurantName, displayName}: RestaurantAdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAccess = async () => {
  try {

    const staffNumber = localStorage.getItem("staffNumber");

    if (!staffNumber) {
      setError("No active session");
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    const staffDoc = await getDoc(
      doc(
        db,
        "restaurants",
        restaurantId,
        "staff",
        staffNumber
      )
    );

    if (!staffDoc.exists()) {
      setError("Admin account not found");
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    const staffData = staffDoc.data();

    if (staffData.role !== "admin") {
      setError("Admin access required");
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    if (staffData.status !== "active") {
      setError("Your account has been disabled.");
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    setLoading(false);

  } catch (err) {

    console.error(err);

    setError("Access verification failed");

    setAccessDenied(true);

    setLoading(false);

  }
};

    verifyAdminAccess();
  }, [restaurantId]);

  useEffect(() => {
    if (accessDenied || loading) return;

    const q = query(
      collection(db, 'restaurants', restaurantId, 'queue'),
      where('status', 'in', ['waiting', 'notified', 'seated'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: QueueEntry[] = [];
      snapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          customerName: doc.data().customerName,
          partySize: doc.data().partySize,
          status: doc.data().status,
          position: entries.length + 1,
          createdAt: doc.data().joinedAt || new Date().toISOString(),
          updatedAt: doc.data().updatedAt || new Date().toISOString()
        });
      });
      setQueue(entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    });

    return () => unsubscribe();
  }, [restaurantId, loading, accessDenied]);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 p-8 rounded-2xl text-center max-w-md shadow-2xl"
        >
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all"
          >
            Logout
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const queueStats = {
    total: queue.length,
    waiting: queue.filter(q => q.status === 'waiting').length,
    notified: queue.filter(q => q.status === 'notified').length,
    seated: queue.filter(q => q.status === 'seated').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'from-blue-500 to-cyan-600';
      case 'notified': return 'from-orange-500 to-pink-600';
      case 'seated': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'notified': return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      case 'seated': return 'bg-green-500/20 border-green-500/30 text-green-300';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white font-sans">
      {/* Header */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {restaurantName}
            </h1>
            <p className="text-xs text-white/50 uppercase tracking-widest">Restaurant Admin</p>
          </div>
        </div>
      </motion.nav>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-sm bg-white/5 border-b border-white/10"
      >
        <div className="px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp, color: 'from-blue-500 to-cyan-600' },
              { key: 'staff', label: 'Staff', icon: Users, color: 'from-purple-500 to-pink-600' },
              { key: 'menu', label: 'Menu', icon: Menu, color: 'from-orange-500 to-pink-600' },
              { key: 'queue', label: 'Queue', icon: Clock, color: 'from-green-500 to-emerald-600' },
              { key: 'tables', label: 'Tables', icon: Grid3X3, color: 'from-cyan-500 to-blue-600' }
            ].map(({ key, label, icon: Icon, color }) => (
              <motion.button
                key={key}
                onClick={() => setActiveTab(key as AdminTab)}
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

      {/* Content */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Queue Overview
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Queue', value: queueStats.total, color: 'from-blue-500 to-cyan-600' },
                  { label: 'Waiting', value: queueStats.waiting, color: 'from-purple-500 to-pink-600' },
                  { label: 'Notified', value: queueStats.notified, color: 'from-orange-500 to-pink-600' },
                  { label: 'Seated', value: queueStats.seated, color: 'from-green-500 to-emerald-600' }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    className={`backdrop-blur-xl bg-gradient-to-br ${stat.color} p-1 rounded-2xl shadow-lg`}
                  >
                    <div className="bg-slate-950 p-6 rounded-xl">
                      <p className="text-white/60 text-sm font-bold mb-2 uppercase">{stat.label}</p>
                      <p className="text-4xl font-display font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Queue List */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Current Queue</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {queue.length === 0 ? (
                    <p className="text-white/50 text-center py-8">Queue is empty</p>
                  ) : (
                    queue.map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getStatusColor(entry.status)} flex items-center justify-center text-white font-bold`}>
                            {entry.position}
                          </div>
                          <div>
                            <p className="text-white font-bold">{entry.customerName}</p>
                            <p className="text-white/50 text-sm">{entry.partySize} people</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusBadgeColor(entry.status)}`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StaffManagement restaurantId={restaurantId} />
            </motion.div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MenuManagement restaurantId={restaurantId} />
            </motion.div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                Queue Management
              </h2>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
                <p className="text-white/60">Full queue management interface coming soon</p>
              </div>
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
              <RestaurantLayout restaurantId={restaurantId} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

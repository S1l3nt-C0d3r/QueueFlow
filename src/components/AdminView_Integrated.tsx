import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Store, QrCode, Settings, Users, ArrowLeft, Grid3X3, Copy, CheckCircle2, Eye, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import MenuManagement from './MenuManagement';
import StaffManagement from './StaffManagement';
import TableManagement from './TableManagement';
import UserProfile from './UserProfile';
import { User } from 'firebase/auth';

type AdminTab = 'restaurants' | 'staff' | 'tables' | 'menu';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export default function AdminView({ user, displayName }: { user?: User | null; displayName?: string }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('restaurants');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showViewOptions, setShowViewOptions] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRestaurants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, 'restaurants', id), {
        name,
        description: desc,
        createdAt: new Date().toISOString()
      });
      setName('');
      setDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewDashboard = (restaurantId: string, view: 'waiter' | 'receptionist' | 'queue') => {
    const routes: Record<string, string> = {
      waiter: `/waiter/${restaurantId}`,
      receptionist: `/receptionist/${restaurantId}`,
      queue: `/q/${restaurantId}`
    };
    navigate(routes[view]);
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
        className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-50 shadow-lg"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              QueueFlow Admin
            </h1>
            <p className="text-xs text-white/50 uppercase tracking-widest">Global Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UserProfile user={user || auth.currentUser} displayName={displayName} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              auth.signOut();
              navigate('/');
            }}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-all shadow-lg"
          >
            <LogOut className="h-6 w-6" />
          </motion.button>
        </div>
      </motion.nav>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-sm bg-white/5 border-b border-white/10"
      >
        <div className="px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'restaurants', label: 'Restaurants', icon: Store, color: 'from-blue-500 to-cyan-600' },
              { key: 'tables', label: 'Tables', icon: Grid3X3, color: 'from-purple-500 to-pink-600' },
              { key: 'staff', label: 'Staff', icon: Users, color: 'from-green-500 to-emerald-600' }
            ].map(({ key, label, icon: Icon, color }) => (
              <motion.button
                key={key}
                onClick={() => {
                  setActiveTab(key as AdminTab);
                  setSelectedRestaurant(null);
                }}
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

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Staff Management Tab */}
          {activeTab === 'staff' && selectedRestaurant && (
            <motion.div
              key="staff-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, x: -4 }}
                onClick={() => setSelectedRestaurant(null)}
                className="mb-8 h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all shadow-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <StaffManagement restaurantId={selectedRestaurant.id} />
            </motion.div>
          )}

          {/* Restaurant Picker for Staff Tab */}
          {activeTab === 'staff' && !selectedRestaurant && (
            <motion.div
              key="staff-picker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Select Restaurant
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((rest, idx) => (
                  <motion.button
                    key={rest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedRestaurant(rest)}
                    className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 hover:border-green-500/30 p-6 rounded-2xl text-left transition-all shadow-lg hover:shadow-green-500/20"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{rest.name}</h3>
                    <p className="text-white/60 text-sm">Manage staff</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Restaurants Tab */}
          {activeTab === 'restaurants' && (
            <motion.div
              key="restaurants"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Create Restaurant Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-8 rounded-2xl shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Create Restaurant</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-white/80 block mb-2">Restaurant Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Blue Springs"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 focus:border-blue-500/50 rounded-xl text-white placeholder:text-white/30 outline-none transition-all backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-white/80 block mb-2">Description</label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Restaurant description..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 focus:border-blue-500/50 rounded-xl text-white placeholder:text-white/30 outline-none transition-all backdrop-blur-sm resize-none"
                      rows={3}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create Restaurant
                  </motion.button>
                </form>
              </motion.div>

              {/* Restaurants Grid */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Existing Restaurants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.map((rest, idx) => (
                    <motion.div
                      key={rest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 hover:border-purple-500/30 p-6 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all"
                    >
                      <h3 className="text-xl font-bold text-white mb-2">{rest.name}</h3>
                      <p className="text-white/60 text-sm mb-4">{rest.description}</p>
                      <div className="space-y-3">
                        {/* Restaurant ID */}
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-xs text-white/60 mb-2">Restaurant ID</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-purple-300 font-mono flex-1 truncate">{rest.id}</code>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => copyToClipboard(rest.id)}
                              className="p-2 hover:bg-white/10 rounded transition-all"
                            >
                              {copiedId === rest.id ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4 text-white/60" />
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {/* View Options */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setShowViewOptions(showViewOptions === rest.id ? null : rest.id)}
                          className="w-full py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View Dashboards
                        </motion.button>

                        {/* View Options Dropdown */}
                        <AnimatePresence>
                          {showViewOptions === rest.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-2 pt-2 border-t border-white/10"
                            >
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleViewDashboard(rest.id, 'waiter')}
                                className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all font-bold text-xs"
                              >
                                👨‍💼 Waiter View
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleViewDashboard(rest.id, 'receptionist')}
                                className="w-full py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all font-bold text-xs"
                              >
                                📞 Receptionist View
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleViewDashboard(rest.id, 'queue')}
                                className="w-full py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all font-bold text-xs"
                              >
                                👥 Queue View
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* QR Code */}
                        <QRCodeSVG
                          value={`${window.location.origin}/q/${rest.id}`}
                          size={128}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                          includeMargin={true}
                          className="w-full rounded-lg border border-white/20"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tables Tab - With TableManagement Component */}
          {activeTab === 'tables' && selectedRestaurant && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, x: -4 }}
                onClick={() => setSelectedRestaurant(null)}
                className="mb-8 h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all shadow-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <TableManagement restaurantId={selectedRestaurant.id} />
            </motion.div>
          )}

          {/* Restaurant Picker for Tables Tab */}
          {activeTab === 'tables' && !selectedRestaurant && (
            <motion.div
              key="tables-picker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Select Restaurant
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((rest, idx) => (
                  <motion.button
                    key={rest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedRestaurant(rest)}
                    className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 hover:border-cyan-500/30 p-6 rounded-2xl text-left transition-all shadow-lg hover:shadow-cyan-500/20"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{rest.name}</h3>
                    <p className="text-white/60 text-sm">Manage tables, orders & QR codes</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

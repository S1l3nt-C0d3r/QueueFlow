import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Users, Menu, BarChart3, LogOut, Settings, Plus, Trash2, Clock, CheckCircle2, XCircle, AlertCircle, Grid3X3 } from 'lucide-react';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import MenuManagement from './MenuManagement';
import RestaurantLayout from './RestaurantLayout';
import UserProfile from './UserProfile';
import { motion, AnimatePresence } from 'motion/react';

type AdminTab = 'overview' | 'staff' | 'menu' | 'queue' | 'tables';

interface RestaurantAdminViewProps {
  user: FirebaseUser;
  restaurantId: string;
  restaurantName: string;
  displayName?: string;
}

interface StaffMember {
  email: string;
  displayName?: string;
  role: 'waiter' | 'receptionist' | 'admin';
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

export default function RestaurantAdminView({ user, restaurantId, restaurantName, displayName }: RestaurantAdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'waiter' | 'receptionist'>('waiter');
  const [newStaffName, setNewStaffName] = useState('');
  
  const navigate = useNavigate();

  // Load staff for this restaurant
  useEffect(() => {
    const staffCollection = collection(db, 'users');
    const q = query(staffCollection, where('restaurantId', '==', restaurantId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffList: StaffMember[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Don't include global admins in this list
        if (data.role !== 'global_admin') {
          staffList.push({
            email: doc.id,
            displayName: data.displayName,
            role: data.role
          });
        }
      });
      setStaff(staffList.sort((a, b) => a.email.localeCompare(b.email)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  // Load queue for this restaurant
  useEffect(() => {
    const queueCollection = collection(db, 'restaurants', restaurantId, 'queue');
    const unsubscribe = onSnapshot(queueCollection, (snapshot) => {
      const queueList: QueueEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        queueList.push({
          id: doc.id,
          customerName: data.customerName,
          partySize: data.partySize,
          status: data.status,
          position: data.position || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      // Sort by position
      setQueue(queueList.sort((a, b) => a.position - b.position));
    });

    return () => unsubscribe();
  }, [restaurantId]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaffEmail || !newStaffRole) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaffEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const email = newStaffEmail.toLowerCase();
      await setDoc(doc(db, 'users', email), {
        email,
        role: newStaffRole,
        restaurantId,
        displayName: newStaffName || email.split('@')[0],
        createdAt: new Date().toISOString()
      });

      setNewStaffEmail('');
      setNewStaffName('');
      setNewStaffRole('waiter');
      setSuccess(`Added ${email} as ${newStaffRole}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStaff = async (email: string) => {
    if (!window.confirm(`Remove ${email} from your staff?`)) return;

    try {
      await deleteDoc(doc(db, 'users', email));
      setSuccess(`Removed ${email}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to remove staff member');
    }
  };

  const handleUpdateQueueStatus = async (entryId: string, newStatus: string) => {
    try {
      await setDoc(
        doc(db, 'restaurants', restaurantId, 'queue', entryId),
        { status: newStatus, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      setError('Failed to update queue');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const seatedCount = queue.filter(e => e.status === 'seated').length;
  const waitingCount = queue.filter(e => e.status === 'waiting').length;
  const notifiedCount = queue.filter(e => e.status === 'notified').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 pb-safe">
      {/* Header */}
      <nav className="glass border-b border-white/5 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 mesh-gradient-blue rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight leading-tight">{restaurantName}</h1>
            <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Restaurant Management</p>
          </div>
        </div>

        {/* Right side: User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <UserProfile user={user} displayName={displayName} />
          <button
            onClick={handleLogout}
            className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <BarChart3 className="h-5 w-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'queue'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Clock className="h-5 w-5" />
              Queue
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'tables'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Grid3X3 className="h-5 w-5" />
              Tables
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'staff'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Users className="h-5 w-5" />
              Staff
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'menu'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Menu className="h-5 w-5" />
              Menu
            </button>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 sm:mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 sm:mx-8 mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="glass-morphism p-6 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient-blue opacity-10" />
                <div className="relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tighter">{staff.length}</p>
                  <p className="text-[9px] sm:text-[10px] text-blue-400/60 font-black uppercase tracking-widest mt-2">Staff Members</p>
                </div>
              </div>

              <div className="glass-morphism p-6 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient-purple opacity-10" />
                <div className="relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tighter">{waitingCount}</p>
                  <p className="text-[9px] sm:text-[10px] text-purple-400/60 font-black uppercase tracking-widest mt-2">Waiting</p>
                </div>
              </div>

              <div className="glass-morphism p-6 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient-orange opacity-10" />
                <div className="relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 border border-orange-500/30">
                    <AlertCircle className="h-5 w-5 text-orange-400" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tighter">{notifiedCount}</p>
                  <p className="text-[9px] sm:text-[10px] text-orange-400/60 font-black uppercase tracking-widest mt-2">Ready to Seat</p>
                </div>
              </div>

              <div className="glass-morphism p-6 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient-green opacity-10" />
                <div className="relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/30">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tighter">{seatedCount}</p>
                  <p className="text-[9px] sm:text-[10px] text-green-400/60 font-black uppercase tracking-widest mt-2">Seated</p>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-6 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 mesh-gradient-blue opacity-10" />
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                  Restaurant Dashboard
                </h3>
                <p className="text-white/60 text-sm">
                  Welcome to your restaurant management dashboard. Use the tabs above to manage your queue, tables, staff, and menu.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-morphism p-6 sm:p-8 rounded-2xl sm:rounded-3xl">
              <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Queue Management
              </h3>

              {queue.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No queue entries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {queue.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-bold text-white text-lg">{entry.customerName}</p>
                              <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/70">
                                Party of {entry.partySize}
                              </span>
                            </div>
                            <p className="text-sm text-white/60">
                              Position: #{entry.position}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {entry.status === 'waiting' && (
                              <>
                                <button
                                  onClick={() => handleUpdateQueueStatus(entry.id, 'notified')}
                                  className="px-3 py-2 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-lg hover:bg-orange-500/30 transition-all"
                                >
                                  Notify
                                </button>
                                <button
                                  onClick={() => handleUpdateQueueStatus(entry.id, 'cancelled')}
                                  className="px-3 py-2 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {entry.status === 'notified' && (
                              <>
                                <button
                                  onClick={() => handleUpdateQueueStatus(entry.id, 'seated')}
                                  className="px-3 py-2 bg-green-500/20 text-green-300 text-xs font-bold rounded-lg hover:bg-green-500/30 transition-all"
                                >
                                  Seat
                                </button>
                                <button
                                  onClick={() => handleUpdateQueueStatus(entry.id, 'cancelled')}
                                  className="px-3 py-2 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            <span className={cn(
                              'px-3 py-2 rounded-lg text-xs font-bold',
                              entry.status === 'waiting' && 'bg-blue-500/20 text-blue-300',
                              entry.status === 'notified' && 'bg-orange-500/20 text-orange-300',
                              entry.status === 'seated' && 'bg-green-500/20 text-green-300',
                              entry.status === 'cancelled' && 'bg-red-500/20 text-red-300'
                            )}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <RestaurantLayout restaurantId={restaurantId} />
          </motion.div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Add Staff Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 sm:p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                Add Staff Member
              </h3>

              <form onSubmit={handleAddStaff} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    placeholder="staff@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white placeholder:text-white/30"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    placeholder="John Doe (optional)"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white placeholder:text-white/30"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Role *
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value as 'waiter' | 'receptionist')}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white"
                    disabled={submitting}
                  >
                    <option value="waiter" className="bg-[#050505]">Waiter</option>
                    <option value="receptionist" className="bg-[#050505]">Receptionist</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !newStaffEmail}
                  className="w-full py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                >
                  {submitting ? 'Adding...' : 'Add Staff Member'}
                </button>
              </form>
            </motion.div>

            {/* Staff List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Your Staff ({staff.length})
              </h3>

              {staff.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No staff members yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {staff.map((member) => (
                      <motion.div
                        key={member.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white">{member.displayName || member.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                              {member.role}
                            </span>
                            <span className="text-xs text-white/50">{member.email}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStaff(member.email)}
                          className="ml-4 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <MenuManagement restaurantId={restaurantId} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

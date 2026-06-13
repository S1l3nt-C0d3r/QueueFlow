import { useState, useEffect } from 'react';
import { doc, setDoc, getDocs, collection, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Trash2, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StaffMember {
  email: string;
  role: 'waiter' | 'receptionist' | 'admin';
  restaurantId: string;
  displayName?: string;
  createdAt: string;
}

interface StaffInput {
  email: string;
  role: 'waiter' | 'receptionist' | 'admin';
  restaurantId: string;
  displayName: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffInput>({
    email: '',
    role: 'waiter',
    restaurantId: '',
    displayName: ''
  });

  // Fetch all staff members
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const staffCollection = collection(db, 'users');
        const snapshot = await getDocs(staffCollection);
        const staffList: StaffMember[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Skip global admin entries
          if (data.role !== 'global_admin') {
            staffList.push({
              email: doc.id,
              role: data.role,
              restaurantId: data.restaurantId,
              displayName: data.displayName,
              createdAt: data.createdAt
            });
          }
        });
        
        setStaff(staffList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setError(null);
      } catch (err: any) {
        setError('Failed to load staff members');
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.restaurantId) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const newStaff: StaffMember = {
        email: formData.email.toLowerCase(),
        role: formData.role,
        restaurantId: formData.restaurantId,
        displayName: formData.displayName || formData.email.split('@')[0],
        createdAt: new Date().toISOString()
      };

      // Create the user document with email as the key
      await setDoc(doc(db, 'users', newStaff.email), {
        email: newStaff.email,
        role: newStaff.role,
        restaurantId: newStaff.restaurantId,
        displayName: newStaff.displayName,
        createdAt: newStaff.createdAt
      });

      // Update local state
      setStaff(prev => [newStaff, ...prev]);

      // Reset form
      setFormData({
        email: '',
        role: 'waiter',
        restaurantId: '',
        displayName: ''
      });

      setSuccess(`Added ${newStaff.email} as ${newStaff.role}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (email: string) => {
    if (!window.confirm(`Remove ${email} from the system?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', email));
      setStaff(prev => prev.filter(s => s.email !== email));
      setSuccess(`Removed ${email}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to remove staff member');
      console.error('Error deleting staff:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Staff Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Plus className="h-5 w-5 text-indigo-400" />
          Add New Staff Member
        </h3>

        <form onSubmit={handleAddStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
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
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white placeholder:text-white/30"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white"
                disabled={submitting}
              >
                <option value="waiter" className="bg-[#050505]">Waiter</option>
                <option value="receptionist" className="bg-[#050505]">Receptionist</option>
                <option value="admin" className="bg-[#050505]">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                Restaurant ID *
              </label>
              <input
                type="text"
                name="restaurantId"
                value={formData.restaurantId}
                onChange={handleInputChange}
                placeholder="restaurant-id"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white placeholder:text-white/30"
                disabled={submitting}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 text-green-400 rounded-xl text-sm border border-green-500/20 flex items-start gap-3"
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting || !formData.email || !formData.restaurantId}
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
          Staff Members ({staff.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No staff members added yet</p>
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
                      <span className="text-xs text-white/50">{member.restaurantId}</span>
                      <span className="text-xs text-white/30">{member.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteStaff(member.email)}
                    className="ml-4 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Remove staff member"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

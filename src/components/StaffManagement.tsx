import { useState, useEffect, FormEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Users, AlertCircle, CheckCircle2, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface StaffMember {
  staffNumber: string;
  displayName: string;
  email?: string;
  role: 'admin' | 'waiter' | 'receptionist';
  status: 'active' | 'inactive';
  password: string;
  createdAt: string;
}

interface Props {
  restaurantId: string;
}

// Helper function to get Firebase ID token
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken(true); // Force refresh
  return token;
}

export default function StaffManagement({ restaurantId }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [staffNumber, setStaffNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'waiter' | 'admin' | 'receptionist'>('waiter');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Load staff - NOW FROM /restaurants/{restaurantId}/staff
  useEffect(() => {
    const q = query(collection(db, 'restaurants', restaurantId, 'staff'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffList = snapshot.docs.map(doc => ({
        staffNumber: doc.id,
        ...doc.data()
      })) as StaffMember[];
      setStaff(staffList.sort((a, b) => a.staffNumber.localeCompare(b.staffNumber)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!staffNumber || !displayName || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if staff number already exists
    if (staff.some(s => s.staffNumber === staffNumber)) {
      setError('Staff number already exists');
      return;
    }

    setCreating(true);

    try {      
      const addStaff=async () => {
        setDoc(doc(db, 'restaurants', restaurantId, 'staff', staffNumber), {
          staffNumber,
          displayName,
          email: email || null,
          role,
          password,
          status: "active",
          createdAt: new Date().toISOString(),
        });
      };
      await addStaff();

      // Cloud Function creates in Firestore, no need to create again
      setSuccess(`Staff member #${staffNumber} created successfully! ✓`);
      
      // Reset form
      setStaffNumber('');
      setDisplayName('');
      setEmail('');
      setRole('waiter');
      setPassword('');
      setConfirmPassword('');
      setShowForm(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating staff:', err);
      setError(err.message || 'Failed to create staff member');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = async (staffNum: string) => {
    if (!window.confirm(`Delete staff member #${staffNum}?`)) return;

    try {
      // Get Firebase ID token
      const token = await getAuthToken();

      // Call Cloud Function to delete staff
      const functionUrl = `https://us-central1-gen-lang-client-0928440940.cloudfunctions.net/deleteStaff`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId,
          staffNumber: staffNum
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete staff');
      }

      // Cloud Function deleted from Firestore, component will update via snapshot
      setSuccess('Staff member deleted ✓');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      setError(err.message || 'Failed to delete staff member');
    }
  };

  const handleUpdateStaffRole = async (staffNum: string, newRole: string) => {
    try {
      // NOW USING /restaurants/{restaurantId}/staff/{staffNum}
      const staffRef = doc(db, 'restaurants', restaurantId, 'staff', staffNum);
      await updateDoc(staffRef, { role: newRole });
      setSuccess('Staff role updated ✓');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating staff role:', err);
      setError('Failed to update staff role');
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'from-purple-500 to-pink-600',
      waiter: 'from-blue-500 to-cyan-600',
      receptionist: 'from-orange-500 to-pink-600'
    };
    return colors[role] || colors.waiter;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Add Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Members</h2>
          <p className="text-white/60 text-sm">Manage your restaurant staff</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </motion.button>
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 p-8 rounded-2xl shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">Create New Staff Member</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Staff Number</label>
                  <input
                    type="text"
                    value={staffNumber}
                    onChange={(e) => setStaffNumber(e.target.value)}
                    placeholder="1001"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-green-500/50 rounded-lg text-white placeholder:text-white/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-green-500/50 rounded-lg text-white placeholder:text-white/30 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-green-500/50 rounded-lg text-white placeholder:text-white/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-green-500/50 rounded-lg text-white outline-none"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-green-500/50 rounded-lg text-white placeholder:text-white/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-green-500/50 rounded-lg text-white placeholder:text-white/30 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  disabled={creating}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Create Staff
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff List */}
      <div className="space-y-4">
        {staff.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center"
          >
            <Users className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No staff members yet. Add your first staff member!</p>
          </motion.div>
        ) : (
          staff.map((member, idx) => (
            <motion.div
              key={member.staffNumber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 p-6 rounded-2xl shadow-lg hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    'h-14 w-14 rounded-lg flex items-center justify-center text-white font-display font-bold shadow-lg',
                    `bg-gradient-to-br ${getRoleColor(member.role)}`
                  )}>
                    #{member.staffNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">{member.displayName}</p>
                    <p className="text-white/60 text-sm">Staff #{member.staffNumber}</p>
                    {member.email && (
                      <p className="text-white/50 text-xs">{member.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateStaffRole(member.staffNumber, e.target.value)}
                    className={cn(
                      'px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-r border-0 outline-none shadow-lg',
                      `${getRoleColor(member.role)}`
                    )}
                  >
                    <option value="waiter">Waiter</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleDeleteStaff(member.staffNumber)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 border border-transparent hover:border-red-500/30"
                  >
                    <Trash2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-6 rounded-2xl shadow-2xl"
      >
        <h3 className="text-lg font-bold text-blue-300 mb-3">Staff Login Instructions</h3>
        <div className="space-y-2 text-blue-200 text-sm">
          <p>✓ Each staff member gets a unique Staff Number (e.g., 1001, 1002, etc.)</p>
          <p>✓ Admin sets a password for each staff member</p>
          <p>✓ Staff logs in using their Staff Number + Password</p>
          <p>✓ No need to wait for email confirmations!</p>
          <p>✓ Admin can change staff roles anytime using the dropdown</p>
        </div>
      </motion.div>
    </div>
  );
}

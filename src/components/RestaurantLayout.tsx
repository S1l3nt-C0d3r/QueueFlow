import { useState, useEffect, FormEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { Users, AlertCircle, Plus, X, CheckCircle2, Trash2, Grid3X3, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type TableStatus = 'available' | 'occupied' | 'cleaning' | 'reserved';

interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  occupiedBy?: { name: string; partySize: number };
  x?: number;
  y?: number;
}

interface RestaurantLayoutProps {
  restaurantId: string;
}

const STATUS_COLORS = {
  available: 'from-green-500 to-emerald-600',
  occupied: 'from-red-500 to-pink-600',
  cleaning: 'from-yellow-500 to-orange-600',
  reserved: 'from-blue-500 to-indigo-600'
};

export default function RestaurantLayout({ restaurantId }: RestaurantLayoutProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [gridWidth, setGridWidth] = useState(8);
  const [gridHeight, setGridHeight] = useState(8);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [filter, setFilter] = useState<TableStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!auth.currentUser?.email) {
        setIsAdmin(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', restaurantId, 'staff', auth.currentUser.email.toLowerCase()));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          setIsAdmin(role === 'admin');
        }
      } catch (err) {
        console.error('Error checking role:', err);
      }
    };
    checkUserRole();
  }, [restaurantId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTables(data.tables || []);
          setGridWidth(data.gridWidth || 8);
          setGridHeight(data.gridHeight || 8);
        } else {
          setTables([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading layout:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [restaurantId]);

  const handleAddTable = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTableNumber || !newCapacity) {
      setError('Table number and capacity required');
      return;
    }

    const newTable: RestaurantTable = {
      id: `table_${Date.now()}`,
      tableNumber: parseInt(newTableNumber),
      capacity: parseInt(newCapacity),
      status: 'available',
      x: Math.random() * gridWidth,
      y: Math.random() * gridHeight
    };

    try {
      const updatedTables = [...tables, newTable];
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), {
        tables: updatedTables,
        gridWidth,
        gridHeight,
        updatedAt: new Date().toISOString()
      });
      setSuccess(`Table ${newTableNumber} added ✓`);
      setNewTableNumber('');
      setNewCapacity('');
      setShowAddForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add table');
      console.error(err);
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    try {
      const updatedTables = tables.map(t =>
        t.id === tableId ? { ...t, status: newStatus } : t
      );
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), {
        tables: updatedTables,
        gridWidth,
        gridHeight,
        updatedAt: new Date().toISOString()
      });
      setSuccess('Table status updated ✓');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update table');
      console.error(err);
    }
  };

  const handleDeleteTable = async (tableId: string, tableNumber: number) => {
    if (!window.confirm(`Delete Table ${tableNumber}?`)) return;
    try {
      const updatedTables = tables.filter(t => t.id !== tableId);
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), {
        tables: updatedTables,
        gridWidth,
        gridHeight,
        updatedAt: new Date().toISOString()
      });
      setSuccess(`Table ${tableNumber} deleted ✓`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete table');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const filteredTables = filter === 'all' ? tables : tables.filter(t => t.status === filter);
  const statusStats = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  };

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
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Grid3X3 className="h-6 w-6 text-white" />
            </div>
            Table Management
          </h2>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              {showAddForm ? 'Cancel' : 'Add Table'}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Available', value: statusStats.available, color: 'from-green-500 to-emerald-600' },
          { label: 'Occupied', value: statusStats.occupied, color: 'from-red-500 to-pink-600' },
          { label: 'Cleaning', value: statusStats.cleaning, color: 'from-yellow-500 to-orange-600' },
          { label: 'Reserved', value: statusStats.reserved, color: 'from-blue-500 to-indigo-600' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`backdrop-blur-xl bg-gradient-to-br ${stat.color} p-1 rounded-xl shadow-lg`}
          >
            <div className="bg-slate-950 p-4 rounded-lg">
              <p className="text-white/60 text-xs font-bold mb-1 uppercase">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-6 rounded-2xl shadow-2xl"
          >
            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Table Number</label>
                  <input
                    type="number"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-blue-500/50 rounded-lg text-white outline-none"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-cyan-500/50 rounded-lg text-white outline-none"
                    placeholder="4"
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                Add Table
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'available', 'occupied', 'cleaning', 'reserved'] as const).map((status) => (
          <motion.button
            key={status}
            onClick={() => setFilter(status)}
            whileHover={{ scale: 1.02 }}
            className={cn(
              "px-4 py-2 rounded-lg font-bold text-sm capitalize transition-all",
              filter === status
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
            )}
          >
            {status}
          </motion.button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.length === 0 ? (
          <div className="col-span-full backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center">
            <Grid3X3 className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">No tables found</p>
          </div>
        ) : (
          filteredTables.map((table, idx) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedTable(table)}
              className={`backdrop-blur-xl bg-gradient-to-br ${STATUS_COLORS[table.status]} p-1 rounded-2xl shadow-lg cursor-pointer transition-all`}
            >
              <div className="bg-slate-950 p-6 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase mb-1">Table</p>
                    <p className="text-3xl font-display font-bold text-white">{table.tableNumber}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/70 capitalize">
                    {table.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Users className="h-4 w-4" />
                    Capacity: {table.capacity}
                  </div>
                  {table.occupiedBy && (
                    <div className="text-sm">
                      <p className="text-white/60">Occupied by:</p>
                      <p className="text-white font-bold">{table.occupiedBy.name}</p>
                      <p className="text-white/50 text-xs">Party of {table.occupiedBy.partySize}</p>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(table.id, e.target.value as TableStatus)}
                      value={table.status}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="reserved">Reserved</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(table.id, table.tableNumber);
                      }}
                      className="w-full py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

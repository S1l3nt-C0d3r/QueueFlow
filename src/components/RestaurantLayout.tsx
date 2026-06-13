import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { Users, AlertCircle, Plus, X, Clock, CheckCircle2, Trash2, Grid3X3, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type TableStatus = 'available' | 'occupied' | 'cleaning' | 'reserved';
type UserRole = 'global_admin' | 'admin' | 'waiter' | 'receptionist' | 'customer' | null;

interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  occupiedBy?: {
    name: string;
    partySize: number;
    seatedAt?: string;
  };
  x?: number;
  y?: number;
  occupied?: boolean;
  createdAt: string;
}

interface TableLayout {
  restaurantId: string;
  tables: RestaurantTable[];
  gridWidth: number;
  gridHeight: number;
  updatedAt: string;
}

interface RestaurantLayoutProps {
  restaurantId: string;
  queueData?: any[];
  onTableStatusChange?: (tableId: string, status: TableStatus) => void;
}

const STATUS_CONFIG = {
  available: { color: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', label: '✓ Available' },
  occupied: { color: 'from-red-500 to-pink-600', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: '⊙ Occupied' },
  cleaning: { color: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: '◐ Cleaning' },
  reserved: { color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: '◇ Reserved' }
};

export default function RestaurantLayout({ restaurantId, queueData = [], onTableStatusChange }: RestaurantLayoutProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [gridWidth, setGridWidth] = useState(8);
  const [gridHeight, setGridHeight] = useState(8);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [filter, setFilter] = useState<TableStatus | 'all'>('all');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user role
  useEffect(() => {
    const checkUserRole = async () => {
      if (!auth.currentUser?.email) {
        setUserRole(null);
        setIsAdmin(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.email.toLowerCase()));
        if (userDoc.exists()) {
          const role = userDoc.data().role as UserRole;
          setUserRole(role);
          // Only global_admin and admin can modify tables
          setIsAdmin(role === 'global_admin' || role === 'admin');
        } else {
          setUserRole(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        setUserRole(null);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // Load table layout
  useEffect(() => {
    const loadLayout = async () => {
      try {
        const unsubscribe = onSnapshot(
          doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as TableLayout;
              setTables(data.tables || []);
              setGridWidth(data.gridWidth || 8);
              setGridHeight(data.gridHeight || 8);
            }
            setLoading(false);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading layout:', err);
        setLoading(false);
      }
    };

    loadLayout();
  }, [restaurantId]);

  const handleAddTable = async () => {
    if (!newTableNumber || !newCapacity) return;

    const newTable: RestaurantTable = {
      id: `table-${Date.now()}`,
      tableNumber: parseInt(newTableNumber),
      capacity: parseInt(newCapacity),
      status: 'available',
      createdAt: new Date().toISOString()
    };

    const updatedTables = [...tables, newTable];
    const tableLayout: TableLayout = {
      restaurantId,
      tables: updatedTables,
      gridWidth,
      gridHeight,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), tableLayout);
      setNewTableNumber('');
      setNewCapacity('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding table:', err);
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    const updatedTables = tables.map(t =>
      t.id === tableId ? { ...t, status: newStatus } : t
    );

    const tableLayout: TableLayout = {
      restaurantId,
      tables: updatedTables,
      gridWidth,
      gridHeight,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), tableLayout);
      onTableStatusChange?.(tableId, newStatus);
    } catch (err) {
      console.error('Error updating table status:', err);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Delete this table?')) return;

    const updatedTables = tables.filter(t => t.id !== tableId);
    const tableLayout: TableLayout = {
      restaurantId,
      tables: updatedTables,
      gridWidth,
      gridHeight,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), tableLayout);
      setSelectedTableId(null);
    } catch (err) {
      console.error('Error deleting table:', err);
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  };

  const filteredTables = filter === 'all' ? tables : tables.filter(t => t.status === filter);
  const selectedTable = tables.find(t => t.id === selectedTableId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Grid3X3 className="h-6 w-6 text-white" />
            </div>
            Restaurant Layout
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {isAdmin ? 'Manage tables and their status in real-time' : 'View tables and their status'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Table
          </button>
        )}
      </div>

      {/* Role Badge */}
      {!isAdmin && userRole && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3"
        >
          <Lock className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-blue-300 font-semibold text-sm">Read-Only Mode</p>
            <p className="text-blue-400/70 text-xs">You can view tables and change status, but only admins can add or delete tables</p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {[
          { key: 'total', label: 'Total', color: 'from-gray-500 to-slate-600' },
          { key: 'available', label: 'Available', color: 'from-green-500 to-emerald-600' },
          { key: 'occupied', label: 'Occupied', color: 'from-red-500 to-pink-600' },
          { key: 'cleaning', label: 'Cleaning', color: 'from-yellow-500 to-orange-600' },
          { key: 'reserved', label: 'Reserved', color: 'from-blue-500 to-indigo-600' }
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key as any)}
            className={cn(
              "p-3 rounded-xl transition-all border-2 cursor-pointer",
              filter === stat.key || (filter === 'all' && stat.key === 'total')
                ? `bg-gradient-to-br ${stat.color} border-white/30 shadow-lg shadow-purple-500/20`
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
          >
            <p className={cn(
              "text-2xl font-display font-bold",
              filter === stat.key || (filter === 'all' && stat.key === 'total')
                ? "text-white"
                : "text-white/80"
            )}>
              {stats[stat.key as keyof typeof stats]}
            </p>
            <p className={cn(
              "text-[9px] font-bold uppercase tracking-widest mt-1",
              filter === stat.key || (filter === 'all' && stat.key === 'total')
                ? "text-white/90"
                : "text-white/50"
            )}>
              {stat.label}
            </p>
          </button>
        ))}
      </div>

      {/* Add Table Form (Admin Only) */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-morphism p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-400" />
                Add New Table
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-white/10 rounded transition-all"
              >
                <X className="h-5 w-5 text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-white/60 block mb-2 font-bold">Table Number</label>
                <input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-lg text-white placeholder:text-white/30 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-2 font-bold">Capacity</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  placeholder="e.g., 4"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-lg text-white placeholder:text-white/30 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddTable}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
              >
                Add Table
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Grid */}
      <div className="glass-morphism p-8 rounded-2xl border border-white/10">
        <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Visual Layout</h3>
        <div
          className="grid gap-2 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 rounded-xl border border-white/10"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
            minHeight: '400px'
          }}
        >
          <AnimatePresence>
            {filteredTables
              .sort((a, b) => a.tableNumber - b.tableNumber)
              .map((table, idx) => (
                <motion.button
                  key={table.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedTableId(table.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all relative group",
                    `bg-gradient-to-br ${STATUS_CONFIG[table.status].color} ${STATUS_CONFIG[table.status].bg} border-gradient-to-br ${STATUS_CONFIG[table.status].border}`,
                    selectedTableId === table.id && "ring-2 ring-white/30 shadow-lg"
                  )}
                >
                  {/* Table Info */}
                  <div className="text-center mb-2">
                    <p className={cn("text-xl font-display font-bold", STATUS_CONFIG[table.status].text)}>
                      T{table.tableNumber}
                    </p>
                    <p className="text-xs text-white/70 mt-1">{table.capacity} seats</p>
                  </div>

                  {/* Status Badge */}
                  <div className={cn(
                    "text-[10px] font-bold text-center px-2 py-1 rounded",
                    STATUS_CONFIG[table.status].bg,
                    STATUS_CONFIG[table.status].text
                  )}>
                    {STATUS_CONFIG[table.status].label}
                  </div>

                  {/* Party Info (if occupied) */}
                  {table.status === 'occupied' && table.occupiedBy && (
                    <div className="mt-2 text-[10px] text-white/70 truncate">
                      {table.occupiedBy.name}
                    </div>
                  )}
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Details Panel */}
      {selectedTable && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={cn(
            "glass-morphism p-8 rounded-2xl border-2",
            `${STATUS_CONFIG[selectedTable.status].border} bg-gradient-to-br ${STATUS_CONFIG[selectedTable.status].color}/5`
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center font-display font-bold text-lg",
                  `bg-gradient-to-br ${STATUS_CONFIG[selectedTable.status].color}`
                )}>
                  T{selectedTable.tableNumber}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Table {selectedTable.tableNumber}</h3>
                  <p className="text-white/60 text-sm">Capacity: {selectedTable.capacity} people</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedTableId(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Status Info */}
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/70 text-sm font-bold">Current Status</p>
              <p className={cn("font-bold text-sm", STATUS_CONFIG[selectedTable.status].text)}>
                {STATUS_CONFIG[selectedTable.status].label}
              </p>
            </div>

            {selectedTable.status === 'occupied' && selectedTable.occupiedBy && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Guest:</span>
                  <span className="text-white font-medium">{selectedTable.occupiedBy.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Party Size:</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedTable.occupiedBy.partySize} people
                  </span>
                </div>
                {selectedTable.occupiedBy.seatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Seated:</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(selectedTable.occupiedBy.seatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Actions - Available to All */}
          <div className="space-y-2 mb-6">
            <p className="text-white/70 text-sm font-bold mb-3">Change Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(STATUS_CONFIG) as TableStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(selectedTable.id, status)}
                  className={cn(
                    "px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all",
                    selectedTable.status === status
                      ? `bg-gradient-to-r ${STATUS_CONFIG[status].color} text-white shadow-lg`
                      : `${STATUS_CONFIG[status].bg} border ${STATUS_CONFIG[status].border} ${STATUS_CONFIG[status].text} hover:opacity-80`
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Delete Button - Admin Only */}
          {isAdmin && (
            <button
              onClick={() => handleDeleteTable(selectedTable.id)}
              className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Table
            </button>
          )}
        </motion.div>
      )}

      {/* Table List */}
      <div className="glass-morphism p-8 rounded-2xl border border-white/10">
        <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider flex items-center justify-between">
          <span>All Tables ({filteredTables.length})</span>
        </h3>

        {filteredTables.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No tables found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTables
                .sort((a, b) => a.tableNumber - b.tableNumber)
                .map((table, idx) => (
                  <motion.button
                    key={table.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedTableId(table.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                      `${STATUS_CONFIG[table.status].bg} ${STATUS_CONFIG[table.status].border} hover:border-white/20`,
                      selectedTableId === table.id && "ring-2 ring-white/30"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center font-display font-bold text-sm",
                        `bg-gradient-to-br ${STATUS_CONFIG[table.status].color}`
                      )}>
                        T{table.tableNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold">Table {table.tableNumber}</p>
                        <p className="text-white/50 text-xs">
                          {table.capacity} seats • {STATUS_CONFIG[table.status].label}
                        </p>
                      </div>
                    </div>

                    {table.status === 'occupied' && table.occupiedBy && (
                      <div className="text-right ml-4">
                        <p className={cn("text-sm font-bold", STATUS_CONFIG[table.status].text)}>
                          {table.occupiedBy.name}
                        </p>
                        <p className="text-white/50 text-xs">{table.occupiedBy.partySize} people</p>
                      </div>
                    )}
                  </motion.button>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

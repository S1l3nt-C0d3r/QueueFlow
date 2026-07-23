import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Table2, Users, Check, AlertCircle, Bell, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  occupied: boolean;
  occupiedBy?: string;
}

interface TableLayout {
  restaurantId: string;
  tables: Table[];
  updatedAt: string;
}

interface TableFreeingProps {
  restaurantId: string;
  queue: any[];
  onTablesUpdated?: () => void;
}

export default function TableFreeing({ restaurantId, queue, onTablesUpdated }: TableFreeingProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [freingTable, setFreeingTable] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [suitableQueue, setSuitableQueue] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const unsubscribe = onSnapshot(
          doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as TableLayout;
              setTables(data.tables || []);
            }
            setLoading(false);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading tables:', err);
        setLoading(false);
      }
    };
    loadTables();
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedTableId) {
      setSuitableQueue([]);
      return;
    }

    const selectedTable = tables.find(t => t.id === selectedTableId);
    if (!selectedTable) return;

    const waitingEntries = queue
      .filter(e => e.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
      .filter(entry => entry.partySize <= selectedTable.capacity)
      .slice(0, 3);

    setSuitableQueue(waitingEntries);
  }, [selectedTableId, tables, queue]);

  const handleFreeTable = async (tableId: string) => {
    setFreeingTable(tableId);
    try {
      const updatedTables = tables.map(t =>
        t.id === tableId
          ? { ...t, occupied: false, occupiedBy: undefined }
          : t
      );

      const tableLayoutData: TableLayout = {
        restaurantId,
        tables: updatedTables,
        updatedAt: new Date().toISOString()
      };

      await setDoc(
        doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'),
        tableLayoutData,
        { merge: true }
      );

      setSuccessMessage('Table freed successfully! ✓');
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedTableId(tableId);
      onTablesUpdated?.();
    } catch (err) {
      console.error('Error freeing table:', err);
    } finally {
      setFreeingTable(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const occupiedTables = tables.filter(t => t.occupied);
  const freeTables = tables.filter(t => !t.occupied);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-3xl font-display font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Table2 className="h-6 w-6 text-white" />
          </div>
          Table Management
        </h3>
        <p className="text-white/60 text-sm mt-1">Mark tables as free to seat waiting customers</p>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-blue-300 flex items-center gap-3"
          >
            <Bell className="h-5 w-5 flex-shrink-0" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-6"
      >
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6 rounded-2xl shadow-lg">
          <p className="text-white/60 text-sm font-bold uppercase mb-2">Occupied</p>
          <p className="text-4xl font-display font-bold text-purple-300">{occupiedTables.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6 rounded-2xl shadow-lg">
          <p className="text-white/60 text-sm font-bold uppercase mb-2">Available</p>
          <p className="text-4xl font-display font-bold text-green-300">{freeTables.length}</p>
        </div>
      </motion.div>

      {/* Occupied Tables */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Occupied Tables - Tap to Free</h4>
        {occupiedTables.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center">
            <p className="text-white/50">All tables are free! ✓</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {occupiedTables
              .sort((a, b) => a.tableNumber - b.tableNumber)
              .map((table, idx) => (
                <motion.button
                  key={table.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleFreeTable(table.id)}
                  disabled={freingTable === table.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "p-6 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 shadow-lg",
                    freingTable === table.id
                      ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400"
                      : selectedTableId === table.id
                      ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-blue-400 shadow-blue-500/20"
                      : "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400 hover:border-purple-500/60 hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-pink-500/30 hover:shadow-purple-500/30"
                  )}
                >
                  <span className="text-3xl font-display">T{table.tableNumber}</span>
                  <span className="text-xs opacity-80">{table.capacity} seats</span>
                  {freingTable === table.id && (
                    <Zap className="h-4 w-4 animate-pulse" />
                  )}
                </motion.button>
              ))}
          </div>
        )}
      </motion.div>

      {/* Suitable Customers */}
      <AnimatePresence>
        {selectedTableId && suitableQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 p-6 rounded-2xl shadow-lg"
          >
            <h4 className="font-bold text-green-300 mb-4 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Ready to Seat ({suitableQueue.length})
            </h4>
            <div className="space-y-3">
              {suitableQueue.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-green-500/20"
                >
                  <div>
                    <span className="text-green-400 font-bold">#{idx + 1}</span>
                    <span className="text-white/80 ml-3 font-bold">{entry.customerName}</span>
                    <span className="text-white/50 text-xs ml-2">({entry.partySize} people)</span>
                  </div>
                  <span className="text-green-400 text-xs font-bold px-2 py-1 bg-green-500/20 rounded">✓ Fits</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedTableId && suitableQueue.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3 text-yellow-300 mb-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-bold">No suitable customers</p>
            </div>
            <p className="text-yellow-300/70 text-sm">
              Wait for more tables to free up or for customers with matching party sizes to join the queue
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

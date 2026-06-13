import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Table, TableLayout, findSuitableTable } from '../lib/tableUtils';
import { autoNotifyNextParty } from '../lib/tableAssignmentService';
import { TableX, LogOut, Users, Check, AlertCircle, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

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
  const [lastNotificationMessage, setLastNotificationMessage] = useState<string | null>(null);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);

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

  // When a table is selected/freed, calculate if we can seat someone
  useEffect(() => {
    if (!selectedTableId) {
      setSuitableQueue([]);
      return;
    }

    const freedTable = tables.find(t => t.id === selectedTableId);
    if (!freedTable) return;

    // Find all entries in waiting status
    const waitingEntries = queue.filter(e => e.status === 'waiting').sort((a, b) => 
      new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );

    // For each waiting entry, check if they can fit at this table
    const suitable = waitingEntries
      .filter(entry => {
        const freeTablesCopy = tables.map(t => ({ ...t }));
        const result = findSuitableTable(entry.partySize, freeTablesCopy);
        
        // Check if the freed table is in the suitable result
        if (Array.isArray(result)) {
          return result.some(t => t.id === selectedTableId);
        } else if (result) {
          return result.id === selectedTableId;
        }
        return false;
      })
      .slice(0, 3); // Show top 3 suitable entries

    setSuitableQueue(suitable);
  }, [selectedTableId, tables, queue]);

  const handleFreeTable = async (tableId: string) => {
    setFreeingTable(tableId);
    try {
      const updatedTables = tables.map(t => 
        t.id === tableId 
          ? { ...t, occupied: false, occupiedBy: undefined }
          : t
      );

      const tableLayout: TableLayout = {
        restaurantId,
        tables: updatedTables,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), tableLayout);
      
      // Try to notify next suitable party
      const notificationResult = await autoNotifyNextParty(restaurantId, updatedTables);
      
      if (notificationResult.notified && notificationResult.party) {
        setLastNotificationMessage(
          `✓ Notified ${notificationResult.party.name} (${notificationResult.party.partySize} people) for table freeing`
        );
        setShowNotificationSuccess(true);
        setTimeout(() => setShowNotificationSuccess(false), 4000);
      } else if (!notificationResult.notified) {
        setLastNotificationMessage('Table freed, but no suitable customers waiting yet');
        setShowNotificationSuccess(true);
        setTimeout(() => setShowNotificationSuccess(false), 3000);
      }
      
      // Auto-select the freed table to show suitable customers
      setSelectedTableId(tableId);
      onTablesUpdated?.();
    } catch (err) {
      console.error('Error freeing table:', err);
    } finally {
      setFreeingTable(null);
    }
  };

  if (loading) return <div className="text-center py-8 text-white/60">Loading tables...</div>;

  const occupiedTables = tables.filter(t => t.occupied);
  const freeTables = tables.filter(t => !t.occupied);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-3 mb-2">
          <TableX className="h-6 w-6 text-purple-400" />
          Table Management
        </h3>
        <p className="text-white/50 text-sm">Mark tables as free to seat waiting customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <p className="text-2xl font-display font-bold text-purple-400">{occupiedTables.length}</p>
          <p className="text-xs text-purple-400/60 font-bold uppercase tracking-widest mt-1">Occupied</p>
        </div>
        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
          <p className="text-2xl font-display font-bold text-green-400">{freeTables.length}</p>
          <p className="text-xs text-green-400/60 font-bold uppercase tracking-widest mt-1">Available</p>
        </div>
      </div>

      {/* Notification Success Message */}
      {showNotificationSuccess && lastNotificationMessage && (
        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 flex items-center gap-3 animate-in fade-in duration-300">
          <Bell className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-sm font-medium">{lastNotificationMessage}</p>
        </div>
      )}

      {/* Tables Grid */}
      <div>
        <h4 className="font-bold text-white/80 mb-4 text-sm">Occupied Tables</h4>
        {occupiedTables.length === 0 ? (
          <p className="text-white/40 text-sm py-8 text-center">All tables are free!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {occupiedTables
              .sort((a, b) => a.tableNumber - b.tableNumber)
              .map(table => (
                <button
                  key={table.id}
                  onClick={() => handleFreeTable(table.id)}
                  disabled={freingTable === table.id}
                  className={cn(
                    "p-4 rounded-xl border-2 font-bold transition-all text-sm flex flex-col items-center gap-2",
                    freingTable === table.id
                      ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                      : selectedTableId === table.id
                      ? "bg-blue-500/20 border-blue-500 text-blue-400"
                      : "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:border-purple-500/60 hover:bg-purple-500/20"
                  )}
                >
                  <span className="text-lg font-display">T{table.tableNumber}</span>
                  <span className="text-[10px] opacity-80">{table.capacity} seats</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Suitable Customers */}
      {selectedTableId && suitableQueue.length > 0 && (
        <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/30">
          <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Ready to Seat
          </h4>
          <div className="space-y-2">
            {suitableQueue.map((entry, idx) => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-green-300 font-bold">#{idx + 1}</span>
                  <span className="text-white/80 ml-2">{entry.customerName}</span>
                  <span className="text-white/50 text-xs ml-2">({entry.partySize} people)</span>
                </div>
                <span className="text-green-400/70 text-xs font-bold">✓ Fits</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTableId && suitableQueue.length === 0 && (
        <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
            <AlertCircle className="h-4 w-4" />
            <span>No suitable customers for this table size</span>
          </div>
          <p className="text-yellow-400/60 text-xs mt-2">
            Wait for more tables to free up or for customers with matching party sizes to join the queue
          </p>
        </div>
      )}
    </div>
  );
}

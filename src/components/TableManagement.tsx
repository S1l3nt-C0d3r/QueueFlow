import { useState, useEffect, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Grid3X3, AlertCircle, CheckCircle2, QrCode, Copy, ChevronDown, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {QRCodeSVG} from 'qrcode.react';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied' | 'cleaning' | 'reserved';
  createdAt: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
  specialInstructions: string;
  createdAt: string;
}

interface TableLayout {
  restaurantId: string;
  tables: Table[];
  updatedAt: string;
}

interface Props {
  restaurantId: string;
}

export default function TableManagement({ restaurantId }: Props) {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load tables
  useEffect(() => {
    const loadTables = async () => {
      try {
        const layoutDoc = await getDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'));
        if (layoutDoc.exists()) {
          const data = layoutDoc.data() as TableLayout;
          setTables(data.tables || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading tables:', err);
        setLoading(false);
      }
    };
    loadTables();
  }, [restaurantId]);

  // Load orders in real-time
  useEffect(() => {
    const q = query(collection(db, 'restaurants', restaurantId, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersList);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const handleAddTable = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTableNumber || !newCapacity) {
      setError('Table number and capacity required');
      return;
    }

    const newTable: Table = {
      id: `table-${Date.now()}`,
      tableNumber: parseInt(newTableNumber),
      capacity: parseInt(newCapacity),
      status: 'available',
      createdAt: new Date().toISOString()
    };

    const updatedTables = [...tables, newTable];
    await saveTablesLayout(updatedTables);
    
    setNewTableNumber('');
    setNewCapacity('');
    setShowForm(false);
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Delete this table?')) return;
    const updatedTables = tables.filter(t => t.id !== tableId);
    await saveTablesLayout(updatedTables);
    setSuccess('Table deleted ✓');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdateTableStatus = async (tableId: string, newStatus: Table['status']) => {
    const updatedTables = tables.map(t =>
      t.id === tableId ? { ...t, status: newStatus } : t
    );
    await saveTablesLayout(updatedTables);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setSuccess('Order status updated ✓');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const saveTablesLayout = async (updatedTables: Table[]) => {
    try {
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), {
        restaurantId,
        tables: updatedTables,
        updatedAt: new Date().toISOString()
      });
      setTables(updatedTables);
      setSuccess('Changes saved ✓');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save layout');
    }
  };

  const generateQRUrl = (table: Table) => {
    return `${window.location.origin}/order?restaurant=${restaurantId}&table=${table.id}&number=${table.tableNumber}`;
  };

  const copyToClipboard = (text: string, tableId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(tableId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTableOrders = (tableId: string) => {
    return orders.filter(o => o.tableId === tableId);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      available: { bg: 'from-green-500 to-emerald-600', text: 'text-green-300', border: 'border-green-500/30' },
      occupied: { bg: 'from-red-500 to-pink-600', text: 'text-red-300', border: 'border-red-500/30' },
      cleaning: { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-300', border: 'border-yellow-500/30' },
      reserved: { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-300', border: 'border-blue-500/30' },
      pending: { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-300', border: 'border-blue-500/30' },
      confirmed: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-300', border: 'border-purple-500/30' },
      preparing: { bg: 'from-orange-500 to-pink-600', text: 'text-orange-300', border: 'border-orange-500/30' },
      ready: { bg: 'from-green-500 to-emerald-600', text: 'text-green-300', border: 'border-green-500/30' },
      served: { bg: 'from-gray-500 to-slate-600', text: 'text-gray-300', border: 'border-gray-500/30' }
    };
    return colors[status] || colors.available;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <Grid3X3 className="h-6 w-6 text-white" />
          </div>
          Table Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2 font-bold"
        >
          <Plus className="h-4 w-4" />
          Add Table
        </motion.button>
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-6 rounded-2xl shadow-2xl"
          >
            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="px-4 py-2.5 bg-white/5 border border-white/20 focus:border-blue-500/50 rounded-lg text-white placeholder:text-white/30 outline-none"
                  placeholder="Table Number"
                />
                <input
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="px-4 py-2.5 bg-white/5 border border-white/20 focus:border-cyan-500/50 rounded-lg text-white placeholder:text-white/30 outline-none"
                  placeholder="Capacity (seats)"
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                >
                  Add Table
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tables List */}
      <div className="space-y-4">
        {tables.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center">
            <Grid3X3 className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No tables yet. Add your first table!</p>
          </div>
        ) : (
          tables
            .sort((a, b) => a.tableNumber - b.tableNumber)
            .map((table, idx) => {
              const tableOrders = getTableOrders(table.id);
              const isExpanded = expandedTable === table.id;
              const statusColor = getStatusColor(table.status);

              return (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'backdrop-blur-xl border-2 rounded-2xl shadow-lg overflow-hidden transition-all',
                    `bg-gradient-to-br ${statusColor.bg} bg-opacity-5 ${statusColor.border}`
                  )}
                >
                  {/* Header */}
                  <motion.button
                    onClick={() => setExpandedTable(isExpanded ? null : table.id)}
                    className="w-full p-6 text-left hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                          'h-14 w-14 rounded-lg flex items-center justify-center text-white font-display font-bold shadow-lg',
                          `bg-gradient-to-br ${statusColor.bg}`
                        )}>
                          T{table.tableNumber}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">Table {table.tableNumber}</p>
                          <p className="text-white/60 text-sm">{table.capacity} seats • {tableOrders.length} orders</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          onClick={(e) => e.stopPropagation()}
                          value={table.status}
                          onChange={(e) => {
                            handleUpdateTableStatus(table.id, e.target.value as Table['status']);
                            e.stopPropagation();
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-r border-0 outline-none shadow-lg',
                            `${statusColor.bg}`
                          )}
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="cleaning">Cleaning</option>
                          <option value="reserved">Reserved</option>
                        </select>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTable(table.id);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 border border-transparent hover:border-red-500/30"
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.button>

                        <motion.button
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-white/60"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 bg-white/5"
                      >
                        <div className="p-6 space-y-6">
                          {/* QR Code */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest">QR Code</h4>
                            <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                              <QRCodeSVG
                                value={generateQRUrl(table)}
                                size={120}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                                includeMargin={true}
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => copyToClipboard(generateQRUrl(table), table.id)}
                                className="w-full py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 font-bold text-xs"
                              >
                                <Copy className="h-4 w-4" />
                                {copiedId === table.id ? 'Copied!' : 'Copy URL'}
                              </motion.button>
                            </div>
                          </div>

                          {/* Orders */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Orders ({tableOrders.length})
                            </h4>
                            {tableOrders.length === 0 ? (
                              <p className="text-white/50 text-sm py-4 text-center">No orders yet</p>
                            ) : (
                              <div className="space-y-3">
                                {tableOrders.map((order, oIdx) => {
                                  const orderStatusColor = getStatusColor(order.status);
                                  return (
                                    <motion.div
                                      key={order.id}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: oIdx * 0.1 }}
                                      className={cn(
                                        'p-4 rounded-lg border-2 space-y-3',
                                        `bg-gradient-to-br ${orderStatusColor.bg} bg-opacity-10 ${orderStatusColor.border}`
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-white font-bold">Order #{order.id.slice(-6)}</p>
                                          <p className="text-white/60 text-xs">₹{order.totalPrice.toFixed(2)}</p>
                                        </div>
                                        <select
                                          value={order.status}
                                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                                          className={cn(
                                            'px-3 py-1.5 rounded text-xs font-bold text-white bg-gradient-to-r border-0 outline-none shadow-lg',
                                            `${orderStatusColor.bg}`
                                          )}
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="confirmed">Confirmed</option>
                                          <option value="preparing">Preparing</option>
                                          <option value="ready">Ready</option>
                                          <option value="served">Served</option>
                                        </select>
                                      </div>

                                      <div className="space-y-2 pt-2 border-t border-white/10">
                                        {order.items.map((item, iIdx) => (
                                          <div key={iIdx} className="flex justify-between items-center text-sm text-white/80">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span className="text-white/60">₹{(item.price * item.quantity).toFixed(2)}</span>
                                          </div>
                                        ))}
                                      </div>

                                      {order.specialInstructions && (
                                        <div className="pt-2 border-t border-white/10">
                                          <p className="text-xs text-white/60"><span className="font-bold">Notes:</span> {order.specialInstructions}</p>
                                        </div>
                                      )}

                                      <p className="text-xs text-white/50 pt-2">
                                        Placed: {new Date(order.createdAt).toLocaleTimeString()}
                                      </p>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
        )}
      </div>
    </div>
  );
}

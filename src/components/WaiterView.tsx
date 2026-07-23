import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, updateDoc, getDoc } from 'firebase/firestore';
import { LogOut, ShoppingCart, Clock, Users, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied' | 'cleaning' | 'reserved';
}

interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: any[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
  customerName: string;
  createdAt: string;
}

interface Bill {
  id: string;
  tableId: string;
  tableNumber: number;
  status: 'pending' | 'paid';
  requestedAt: string;
}

export default function WaiterView() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'ready'>('all');
  const [displayName, setDisplayName] = useState('');

  if (!restaurantId) {
    return <div className="p-4 text-red-500">Restaurant ID not found</div>;
  }

  // Get display name from localStorage
  useEffect(() => {
    const name = localStorage.getItem('displayName') || 'Waiter';
    setDisplayName(name);
  }, []);

  // Load tables
  useEffect(() => {
    const q = query(collection(db, 'restaurants', restaurantId, 'settings'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.size > 0) {
        const layoutDoc = snapshot.docs[0];
        const data = layoutDoc.data();
        setTables(data.tables || []);
      }
      setLoading(false);
    });
    return () => unsubscribe();
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

  // Load bills in real-time
  useEffect(() => {
    const q = query(collection(db, 'restaurants', restaurantId, 'bills'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const billsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bill[];
      setBills(billsList);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setSuccess('Order updated ✓');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update order');
    }
  };

  const handleMarkBillPaid = async (billId: string) => {
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId, 'bills', billId), {
        status: 'paid'
      });
      setSuccess('Bill marked as paid ✓');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update bill');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; badge: string }> = {
      pending: { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300' },
      confirmed: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300' },
      preparing: { bg: 'from-orange-500 to-pink-600', text: 'text-orange-300', badge: 'bg-orange-500/20 text-orange-300' },
      ready: { bg: 'from-green-500 to-emerald-600', text: 'text-green-300', badge: 'bg-green-500/20 text-green-300' },
      served: { bg: 'from-gray-500 to-slate-600', text: 'text-gray-300', badge: 'bg-gray-500/20 text-gray-300' }
    };
    return colors[status] || colors.pending;
  };

  const getTableStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500/20 text-green-300',
      occupied: 'bg-red-500/20 text-red-300',
      cleaning: 'bg-yellow-500/20 text-yellow-300',
      reserved: 'bg-blue-500/20 text-blue-300'
    };
    return colors[status] || colors.available;
  };

  const filteredOrders = activeFilter === 'all'
    ? orders
    : activeFilter === 'pending'
    ? orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
    : orders.filter(o => o.status === 'ready');

  const pendingBills = bills.filter(b => b.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 text-white font-sans pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-40 shadow-lg"
      >
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Orders
            </h1>
            <p className="text-xs text-white/60">Welcome, {displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3 text-sm"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3 text-sm"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="sticky top-16 z-30 backdrop-blur-sm bg-white/5 border-b border-white/10 p-3">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Orders', icon: ShoppingCart },
            { key: 'pending', label: 'In Progress', icon: Clock },
            { key: 'ready', label: 'Ready', icon: CheckCircle2 }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setActiveFilter(key as any)}
              className={cn(
                'px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all',
                activeFilter === key
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/5 border border-white/10 text-white/60'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 space-y-4">
        {/* Pending Bills Alert */}
        {pendingBills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 p-4 rounded-xl"
          >
            <p className="font-bold text-orange-300 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {pendingBills.length} pending bill{pendingBills.length > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center"
          >
            <ShoppingCart className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No orders to show</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, idx) => {
              const statusColors = getStatusColor(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'backdrop-blur-xl bg-gradient-to-br border-2 p-4 rounded-2xl',
                    `${statusColors.bg} bg-opacity-10 border-white/20`
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-white">Table {order.tableNumber}</h3>
                        <span className={cn('text-xs font-bold px-2 py-1 rounded-full', statusColors.badge)}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-white/60 text-xs">{order.customerName} • ₹{order.totalPrice}</p>
                      <p className="text-white/50 text-xs mt-1">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r border-0 outline-none shadow-lg',
                        statusColors.bg
                      )}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="served">Served</option>
                    </select>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1 py-3 border-t border-white/10">
                    {order.items.map((item: any) => (
                      <div key={item.menuItemId} className="flex justify-between text-sm text-white/70">
                        <span>{item.name} ×{item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pending Bills Section */}
        {pendingBills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-3"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              Pending Bills ({pendingBills.length})
            </h2>
            {pendingBills.map((bill, idx) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white">Table {bill.tableNumber}</p>
                  <p className="text-white/60 text-xs">Bill requested</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleMarkBillPaid(bill.id)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all"
                >
                  Paid
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}

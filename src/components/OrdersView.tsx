import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { ShoppingCart, User, Clock, CheckCircle2, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  queueEntryId: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  customerName?: string;
  seatedAt?: string;
}

interface Props {
  restaurantId: string;
}

export default function OrdersView({ restaurantId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [queueData, setQueueData] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'served'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'restaurants', restaurantId, 'orders'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        try {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[];

          const queueMap: { [key: string]: any } = {};
          for (const order of ordersData) {
            if (!queueData[order.queueEntryId]) {
              try {
                const queueDoc = await getDoc(
                  doc(db, 'restaurants', restaurantId, 'queue', order.queueEntryId)
                );
                if (queueDoc.exists()) {
                  queueMap[order.queueEntryId] = queueDoc.data();
                }
              } catch (err) {
                console.error('Error fetching queue entry:', err);
              }
            }
          }

          setQueueData(prev => ({ ...prev, ...queueMap }));
          setOrders(ordersData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing orders snapshot:', err);
          setError('Failed to load orders');
          setLoading(false);
        }
      }, (err) => {
        console.error('Firestore listener error:', err);
        setError('Permission denied or network error');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up orders listener:', err);
      setError('Failed to setup orders listener');
      setLoading(false);
    }
  }, [restaurantId, queueData]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') {
      const queueEntry = queueData[order.queueEntryId];
      return queueEntry?.status !== 'seated';
    }
    if (filter === 'served') {
      const queueEntry = queueData[order.queueEntryId];
      return queueEntry?.status === 'seated';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            Preorders
          </h2>
          <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300 uppercase tracking-widest">
            {filteredOrders.length} {filter === 'all' ? 'Orders' : filter}
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/10"
      >
        {[
          { key: 'all', label: 'All Orders', color: 'from-blue-500 to-cyan-600' },
          { key: 'pending', label: 'Pending', color: 'from-orange-500 to-pink-600' },
          { key: 'served', label: 'Served', color: 'from-green-500 to-emerald-600' }
        ].map(({ key, label, color }) => (
          <motion.button
            key={key}
            onClick={() => setFilter(key as any)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-300",
              filter === key
                ? `bg-gradient-to-r ${color} text-white shadow-lg`
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            )}
          >
            {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Orders Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 text-center"
            >
              <Utensils className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 font-medium">No orders yet</p>
              <p className="text-white/30 text-sm mt-1">Orders will appear when customers place them</p>
            </motion.div>
          ) : (
            filteredOrders.map((order, idx) => {
              const queueEntry = queueData[order.queueEntryId];
              const isSeated = queueEntry?.status === 'seated';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "backdrop-blur-xl border-2 p-6 rounded-2xl transition-all duration-300 shadow-lg",
                    isSeated
                      ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 shadow-green-500/20"
                      : "bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-orange-500/30 hover:shadow-orange-500/20"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                      >
                        <User className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white truncate">
                          {queueEntry?.customerName || 'Unknown Customer'}
                        </h3>
                        <p className="text-white/50 text-sm">
                          Party of {queueEntry?.partySize || '?'} people
                        </p>
                      </div>
                    </div>
                    {isSeated && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 ml-4 flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-sm font-bold text-green-300">Seated</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Order Items</p>
                    {order.items.map((item, itemIdx) => (
                      <motion.div
                        key={itemIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIdx * 0.05 }}
                        className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">
                            {item.name}{' '}
                            <span className="text-white/50 font-normal">
                              × {item.quantity}
                            </span>
                          </p>
                        </div>
                        <p className="text-orange-400 font-bold ml-4 flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Clock className="h-4 w-4 text-white/40" />
                      <span>
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg">
                      <p className="text-xs text-white/60 uppercase font-bold mb-1">Total</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    {isSeated && queueEntry?.seatedAt && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-bold text-green-400 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg"
                      >
                        ✓ Seated {formatDistanceToNow(new Date(queueEntry.seatedAt), { addSuffix: true })}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

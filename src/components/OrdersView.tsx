import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { ShoppingCart, User, Clock, CheckCircle2 } from 'lucide-react';
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

  // Fetch orders
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

          // Fetch corresponding queue entry data for each order
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-morphism p-8 rounded-3xl border border-red-500/30 text-center">
        <p className="text-red-400 font-bold mb-3">Error Loading Orders</p>
        <p className="text-white/60 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-indigo-400" />
          </div>
          Preorders
        </h2>
        <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">
          {filteredOrders.length} {filter === 'all' ? 'Total' : filter === 'pending' ? 'Pending' : 'Served'}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'served'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as 'all' | 'pending' | 'served')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize",
              filter === f
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            )}
          >
            {f === 'all' ? 'All Orders' : f === 'pending' ? 'Pending' : 'Served'}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-morphism p-8 rounded-3xl text-center"
            >
              <ShoppingCart className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">No orders found</p>
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
                  className={cn(
                    "glass-morphism p-6 sm:p-8 rounded-3xl border transition-all",
                    isSeated
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-white/10 hover:border-indigo-500/30"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mt-1">
                        <User className="h-5 w-5 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">
                          {queueEntry?.customerName || 'Unknown Customer'}
                        </h3>
                        <p className="text-white/50 text-sm">
                          Party of {queueEntry?.partySize || '?'}
                        </p>
                      </div>
                    </div>
                    {isSeated && (
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-green-400 whitespace-nowrap">Seated</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-6 p-4 bg-white/5 rounded-2xl">
                    {order.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">
                            {item.name} <span className="text-white/50">× {item.quantity}</span>
                          </p>
                        </div>
                        <p className="text-white/60 ml-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="h-4 w-4 text-white/40" />
                      <span>
                        Ordered {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="font-bold text-white">
                      Total: <span className="text-indigo-400">${order.totalPrice.toFixed(2)}</span>
                    </div>

                    {isSeated && queueEntry?.seatedAt && (
                      <div className="text-green-400 text-xs font-medium">
                        Seated {formatDistanceToNow(new Date(queueEntry.seatedAt), { addSuffix: true })}
                      </div>
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

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, setDoc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  available?: boolean;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  restaurantId: string;
  queueEntryId: string;
}

export default function PreorderScreen({ restaurantId, queueEntryId }: Props) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'restaurants', restaurantId, 'menu'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        setMenuItems(items.sort((a, b) => a.name.localeCompare(b.name)));
        
        if (items.length > 0 && !selectedCategory) {
          const categories = [...new Set(items.map(i => i.category || 'Main Course'))];
          setSelectedCategory(categories[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to load menu');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const handleAddItem = (item: MenuItem) => {
    const existing = order.find(o => o.menuItemId === item.id);
    if (existing) {
      setOrder(order.map(o =>
        o.menuItemId === item.id ? { ...o, quantity: o.quantity + 1 } : o
      ));
    } else {
      setOrder([...order, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    const existing = order.find(o => o.menuItemId === menuItemId);
    if (existing && existing.quantity > 1) {
      setOrder(order.map(o =>
        o.menuItemId === menuItemId ? { ...o, quantity: o.quantity - 1 } : o
      ));
    } else {
      setOrder(order.filter(o => o.menuItemId !== menuItemId));
    }
  };

  const handleDeleteItem = (menuItemId: string) => {
    setOrder(order.filter(o => o.menuItemId !== menuItemId));
  };

  const handleSubmitOrder = async () => {
    if (order.length === 0) {
      setError('Please add items to your order');
      return;
    }

    setSaving(true);
    try {
      const totalPrice = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await setDoc(doc(db, 'restaurants', restaurantId, 'orders', queueEntryId), {
        queueEntryId,
        items: order,
        totalPrice,
        status: 'pending',
        specialInstructions,
        createdAt: new Date().toISOString()
      });
      setSuccess('Order submitted! ✓');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to submit order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(i => i.category || 'Main Course'))];
  const filteredItems = menuItems.filter(i => i.category === selectedCategory);
  const totalPrice = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 text-white font-sans flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 py-6 sticky top-0 z-50 shadow-lg"
      >
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Order Menu
        </h1>
        <p className="text-white/60 text-sm mt-1">Select items from the menu</p>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Menu Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col min-w-0"
        >
          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "px-6 py-2.5 rounded-lg font-bold whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/50"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                )}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">No items in this category</p>
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "backdrop-blur-xl border-2 p-4 rounded-xl transition-all shadow-lg",
                    item.available === false
                      ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                      : "bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-purple-500/30 hover:shadow-purple-500/20 cursor-pointer"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-bold text-white">{item.name}</p>
                      {item.description && (
                        <p className="text-white/60 text-sm">{item.description}</p>
                      )}
                    </div>
                    <p className="text-xl font-bold text-orange-400">${item.price.toFixed(2)}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddItem(item)}
                    disabled={item.available === false}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Order
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Order Summary Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-6 flex flex-col shadow-lg"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Your Order
          </h2>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-6 pb-4">
            {order.length === 0 ? (
              <p className="text-white/50 text-center py-8">No items added yet</p>
            ) : (
              order.map((item) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-white font-bold">{item.name}</p>
                    <p className="text-white/60 text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleRemoveItem(item.menuItemId)}
                      className="p-1 hover:bg-white/10 rounded transition-all text-white/60"
                    >
                      <Minus className="h-4 w-4" />
                    </motion.button>
                    <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleAddItem(menuItems.find(m => m.id === item.menuItemId)!)}
                      className="p-1 hover:bg-white/10 rounded transition-all text-white/60"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleDeleteItem(item.menuItemId)}
                      className="p-1 hover:bg-red-500/20 rounded transition-all text-red-400 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Special Instructions */}
          <div className="mb-6 space-y-2">
            <label className="text-sm font-bold text-white/80">Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Allergies, preferences, etc..."
              className="w-full px-3 py-2 bg-white/5 border border-white/20 focus:border-purple-500/50 rounded-lg text-white placeholder:text-white/30 outline-none transition-all resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Total */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg">
            <p className="text-white/60 text-sm mb-1">Total</p>
            <p className="text-3xl font-display font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              ${totalPrice.toFixed(2)}
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitOrder}
            disabled={saving || order.length === 0}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Order
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

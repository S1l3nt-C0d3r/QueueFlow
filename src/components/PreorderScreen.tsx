import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
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
  onBack: () => void;
  customerName?: string;
}

export default function PreorderScreen({ restaurantId, queueEntryId, onBack, customerName }: Props) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [orderSavedNotification, setOrderSavedNotification] = useState(false);

  // Fetch menu items
  useEffect(() => {
    const q = query(
      collection(db, 'restaurants', restaurantId, 'menus')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        setMenuItems(items);
        setError(null);
        
        // Set default category
        if (items.length > 0 && !selectedCategory) {
          const categories = [...new Set(items.map(i => i.category || 'Other'))];
          setSelectedCategory(categories[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to load menu. Please try again.');
        setLoading(false);
      }
    }, (err) => {
      console.error('Firestore error:', err);
      setError('Failed to load menu. Please check permissions.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId, selectedCategory]);

  // Fetch existing order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(
          doc(db, 'restaurants', restaurantId, 'orders', queueEntryId)
        );
        if (orderDoc.exists()) {
          setOrder(orderDoc.data().items || []);
          setSpecialInstructions(orderDoc.data().specialInstructions || '');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      }
    };
    fetchOrder();
  }, [restaurantId, queueEntryId]);

  // Auto-dismiss order saved notification
  useEffect(() => {
    if (orderSavedNotification) {
      const timer = setTimeout(() => {
        setOrderSavedNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderSavedNotification]);

  const handleAddItem = (item: MenuItem) => {
    const existing = order.find(o => o.menuItemId === item.id);
    if (existing) {
      setOrder(order.map(o =>
        o.menuItemId === item.id
          ? { ...o, quantity: o.quantity + 1 }
          : o
      ));
    } else {
      setOrder([...order, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    setOrder(order.filter(o => o.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
    } else {
      setOrder(order.map(o =>
        o.menuItemId === menuItemId
          ? { ...o, quantity }
          : o
      ));
    }
  };

  const handleSaveOrder = async () => {
    if (!specialInstructions.trim()) {
      setShowInstructionsModal(true);
      return;
    }

    setSaving(true);
    try {
      const totalPrice = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      await setDoc(
        doc(db, 'restaurants', restaurantId, 'orders', queueEntryId),
        {
          queueEntryId,
          items: order,
          specialInstructions,
          totalPrice,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      setOrderSavedNotification(true);
      setSaving(false);
    } catch (err) {
      console.error('Error saving order:', err);
      setSaving(false);
    }
  };

  const handleClearOrder = async () => {
    if (!order.length) return;
    setShowClearModal(true);
  };

  const confirmClearOrder = async () => {
    setClearing(true);
    try {
      await deleteDoc(
        doc(db, 'restaurants', restaurantId, 'orders', queueEntryId)
      );
      setOrder([]);
      setSpecialInstructions('');
      setShowClearModal(false);
    } catch (err) {
      console.error('Error clearing order:', err);
    } finally {
      setClearing(false);
    }
  };

  const categories = [...new Set(menuItems.map(i => i.category || 'Other'))];
  const filteredItems = selectedCategory 
    ? menuItems.filter(i => (i.category || 'Other') === selectedCategory)
    : menuItems;

  const totalPrice = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pb-safe">
        <div className="glass border-b border-white/5 px-4 sm:px-8 py-4 sticky top-0 z-50 flex items-center gap-4">
          <button
            onClick={onBack}
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">Preorder</h1>
        </div>
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
          <div className="glass-morphism p-8 rounded-3xl border border-red-500/30 text-center">
            <p className="text-red-400 font-bold text-lg mb-4">⚠️ Error Loading Menu</p>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={onBack}
              className="py-3 px-6 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all"
            >
              Back to Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pb-safe">
        <div className="glass border-b border-white/5 px-4 sm:px-8 py-4 sticky top-0 z-50 flex items-center gap-4">
          <button
            onClick={onBack}
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">Preorder</h1>
        </div>
        <div className="max-w-6xl mx-auto p-4 sm:p-8 py-20 text-center">
          <div className="glass-morphism p-8 sm:p-12 rounded-3xl border border-white/10">
            <ShoppingCart className="h-16 w-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold text-white mb-3">No Menu Available</h2>
            <p className="text-white/60 mb-8">The restaurant hasn't added a menu yet. Check back soon!</p>
            <button
              onClick={onBack}
              className="py-4 px-8 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all"
            >
              Back to Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-safe">
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 sm:px-8 py-4 sticky top-0 z-50 flex items-center gap-4">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">Preorder</h1>
          {customerName && <p className="text-xs text-white/50">{customerName}</p>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all",
                    selectedCategory === cat
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-morphism p-6 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all group cursor-pointer flex items-center justify-between"
                  onClick={() => handleAddItem(item)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                    {item.description && (
                      <p className="text-white/50 text-sm mt-1">{item.description}</p>
                    )}
                    <p className="text-indigo-400 font-bold mt-2">Rs. {item.price.toFixed(2)}</p>
                  </div>
                  <div className="ml-4 h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/40 transition-all border border-indigo-500/30">
                    <Plus className="h-6 w-6 text-indigo-400" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/50">No items in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary - Fixed Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 glass-morphism p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-indigo-400" />
              </div>
              <h2 className="font-display font-bold text-lg text-white">Your Order</h2>
            </div>

            {/* Order Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {order.length === 0 ? (
                <p className="text-white/50 text-sm">No items selected</p>
              ) : (
                order.map(item => (
                  <div key={item.menuItemId} className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{item.name}</p>
                      <p className="text-white/50 text-xs">Rs. {item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                        className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-white font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                        className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.menuItemId)}
                        className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            {order.length > 0 && (
              <>
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Items:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-white">
                    <span>Total:</span>
                    <span className="text-indigo-400">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Special Instructions</label>
                  <textarea
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    placeholder="e.g., No onions, Extra sauce, etc. or '-' if none"
                    className="w-full px-3 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-white placeholder:text-white/30 text-sm resize-none min-h-[70px]"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={handleSaveOrder}
                    disabled={saving}
                    className="w-full py-4 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 text-lg"
                  >
                    {saving ? 'Saving...' : 'Save Order'}
                  </button>
                  <button
                    onClick={handleClearOrder}
                    disabled={saving || clearing}
                    className="w-full py-3 bg-white/5 text-white/60 border border-white/10 font-medium rounded-xl hover:bg-white/10 transition-all"
                  >
                    Clear Order
                  </button>
                </div>
              </>
            )}

            {order.length === 0 && (
              <button
                onClick={onBack}
                className="w-full py-4 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all text-lg"
              >
                Back to Queue
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Special Instructions Validation Modal */}
      <AnimatePresence>
        {showInstructionsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstructionsModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="glass-morphism p-6 rounded-3xl border border-white/10 max-w-sm mx-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Special Instructions Required</h3>
                    <p className="text-white/60 text-sm mt-1">Please fill in the special instructions field.</p>
                  </div>
                </div>
                
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 mb-6">
                  <p className="text-white/80 text-sm mb-3 font-medium">If you don't have any special instructions, you can write:</p>
                  <div className="space-y-2">
                    <p className="text-indigo-300 text-sm font-mono">• <span className="font-bold">-</span> (dash)</p>
                    <p className="text-indigo-300 text-sm font-mono">• <span className="font-bold">nil</span></p>
                    <p className="text-indigo-300 text-sm font-mono">• <span className="font-bold">none</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInstructionsModal(false)}
                    className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all text-sm"
                  >
                    Add Instructions
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear Order Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="glass-morphism p-6 rounded-3xl border border-white/10 max-w-sm mx-4">
                <h3 className="text-lg font-bold text-white mb-2">Clear Order?</h3>
                <p className="text-white/60 text-sm mb-6">Are you sure you want to clear your entire order? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearModal(false)}
                    disabled={clearing}
                    className="flex-1 py-3 bg-white/5 text-white/60 font-medium rounded-2xl border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmClearOrder}
                    disabled={clearing}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50 text-sm"
                  >
                    {clearing ? 'Clearing...' : 'Clear'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Saved Notification */}
      <AnimatePresence>
        {orderSavedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-3xl border bg-green-500/20 border-green-500/30 max-w-md"
          >
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-sm font-medium text-green-200">Order saved successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

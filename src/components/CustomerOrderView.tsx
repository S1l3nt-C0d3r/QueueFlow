import { useState, useEffect, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, doc, getDoc } from 'firebase/firestore';
import { ShoppingCart, Plus, Minus, Trash2, Send, AlertCircle, CheckCircle2, Menu, MapPin, Users, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  available: boolean;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  restaurantId: string;
  tableId: string;
  tableNumber: number;
  customerName?: string;
  onBack?: () => void;
}

export default function CustomerOrderView({
  restaurantId,
  tableId,
  tableNumber,
  customerName = 'Guest',
  onBack
}: Props) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'bill'>('menu');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [billRequested, setBillRequested] = useState(false);

  // Load menu
  useEffect(() => {
    const q = query(collection(db, 'restaurants', restaurantId, 'menu'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      setMenu(menuItems);
      
      // Get unique categories
      const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
      setCategories(uniqueCategories);
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const filteredMenu = selectedCategory
    ? menu.filter(item => item.category === selectedCategory)
    : menu;

  const handleAddToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(c => c.menuItemId === item.id);
      if (existing) {
        return prevCart.map(c =>
          c.menuItemId === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prevCart, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }];
    });
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(c =>
        c.menuItemId === menuItemId
          ? { ...c, quantity }
          : c
      )
    );
  };

  const handleRemoveItem = (menuItemId: string) => {
    setCart(prevCart => prevCart.filter(c => c.menuItemId !== menuItemId));
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError('Please add items to your order');
      return;
    }

    setSubmitting(true);

    try {
      const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const ordersRef = collection(db, 'restaurants', restaurantId, 'orders');
      await addDoc(ordersRef, {
        tableId,
        tableNumber,
        customerName,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice,
        status: 'pending',
        specialInstructions: specialInstructions || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setSuccess('Order placed successfully! ✓');
      setCart([]);
      setSpecialInstructions('');
      setActiveTab('cart');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestBill = async () => {
    if (!window.confirm('Request bill for this table?')) return;

    try {
      const billsRef = collection(db, 'restaurants', restaurantId, 'bills');
      await addDoc(billsRef, {
        tableId,
        tableNumber,
        customerName,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      });

      setBillRequested(true);
      setSuccess('Bill requested! Staff will bring it shortly. ✓');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to request bill');
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white font-sans pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-40 shadow-lg"
      >
        <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Order Food
            </h1>
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onBack}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-bold transition-all"
              >
                Back
              </motion.button>
            )}
          </div>

          {/* Table Info */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span>Table {tableNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4 text-blue-400" />
              <span>{customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
              <span>{cart.length} items</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 sm:mx-6 mt-4 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3 text-sm max-w-4xl mx-auto"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 sm:mx-6 mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3 text-sm max-w-4xl mx-auto"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-sm bg-white/5 border-b border-white/10 sticky top-16 sm:top-24 z-30"
      >
        <div className="p-4 max-w-4xl mx-auto w-full flex gap-2 sm:gap-4">
          {[
            { key: 'menu', label: 'Menu', icon: Menu },
            { key: 'cart', label: 'Cart', icon: ShoppingCart },
            { key: 'bill', label: 'Bill', icon: Clock }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setActiveTab(key as any)}
              whileHover={{ scale: 1.05 }}
              className={cn(
                'px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all flex-1 sm:flex-none',
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <main className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Category Tabs */}
              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <motion.button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        'px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all',
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                          : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                      )}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Menu Items */}
              {filteredMenu.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center">
                  <Menu className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No items available in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenu.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'backdrop-blur-xl bg-gradient-to-br border-2 p-4 rounded-2xl transition-all',
                        item.available
                          ? 'from-white/10 to-white/5 border-white/20 hover:border-blue-500/30'
                          : 'from-white/5 to-white/5 border-white/10 opacity-50'
                      )}
                    >
                      <h3 className="font-bold text-lg text-white mb-2">{item.name}</h3>
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-blue-400">₹{item.price}</span>
                        <span className={cn(
                          'text-xs font-bold px-3 py-1 rounded-full',
                          item.available
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        )}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        disabled={!item.available}
                        onClick={() => handleAddToCart(item)}
                        className={cn(
                          'w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all',
                          item.available
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg'
                            : 'bg-white/5 text-white/50 cursor-not-allowed'
                        )}
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {cart.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center">
                  <ShoppingCart className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 mb-4">Your cart is empty</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveTab('menu')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold"
                  >
                    Continue Shopping
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                      <motion.div
                        key={item.menuItemId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-4 rounded-2xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-white">{item.name}</h3>
                            <p className="text-white/60 text-sm">₹{item.price} each</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleRemoveItem(item.menuItemId)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                              className="p-1 hover:bg-white/20 rounded transition-all"
                            >
                              <Minus className="h-4 w-4 text-white" />
                            </motion.button>
                            <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                              className="p-1 hover:bg-white/20 rounded transition-all"
                            >
                              <Plus className="h-4 w-4 text-white" />
                            </motion.button>
                          </div>
                          <span className="font-bold text-blue-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="text-sm font-bold text-white/80 block mb-2">Special Instructions (Optional)</label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g., Extra spicy, no onions..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 focus:border-blue-500/50 rounded-xl text-white placeholder:text-white/30 outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 rounded-2xl"
                  >
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-white/70">
                        <span>Subtotal</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Tax (5%)</span>
                        <span>₹{(totalPrice * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg text-blue-400">
                        <span>Total</span>
                        <span>₹{(totalPrice * 1.05).toFixed(2)}</span>
                      </div>
                    </div>

                    <motion.form
                      onSubmit={handlePlaceOrder}
                      className="space-y-3"
                    >
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        disabled={submitting || cart.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Placing order...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Place Order
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {/* Bill Tab */}
          {activeTab === 'bill' && (
            <motion.div
              key="bill"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 rounded-2xl text-center space-y-6"
              >
                <div>
                  <Clock className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white mb-2">Request Your Bill</h2>
                  <p className="text-white/60">Click below to request the bill. Our staff will bring it shortly.</p>
                </div>

                {billRequested ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl"
                  >
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-400" />
                    <p className="text-green-300 font-bold">Bill Requested!</p>
                    <p className="text-green-200 text-sm mt-2">Your staff will bring the bill shortly.</p>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleRequestBill}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all text-lg"
                  >
                    Request Bill
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

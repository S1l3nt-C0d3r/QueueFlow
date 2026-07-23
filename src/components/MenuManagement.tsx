import { useState, useEffect, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save, X, AlertCircle, CheckCircle2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface MenuManagementProps {
  restaurantId: string;
}

export default function MenuManagement({ restaurantId }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    available: true
  });

  useEffect(() => {
    const menuRef = collection(db, 'restaurants', restaurantId, 'menu');
    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        } as MenuItem);
      });
      setMenuItems(items.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setError('Name and price are required');
      return;
    }

    try {
      const docId = editingId || `item_${Date.now()}`;
      await setDoc(doc(db, 'restaurants', restaurantId, 'menu', docId), {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
        updatedAt: new Date().toISOString()
      });

      setSuccess(`${editingId ? 'Updated' : 'Added'} ${formData.name} ✓`);
      setTimeout(() => setSuccess(null), 3000);
      setFormData({ name: '', description: '', price: '', category: 'Main Course', available: true });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError('Failed to save menu item');
      console.error(err);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'menu', id));
      setSuccess(`Deleted ${name} ✓`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];

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
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
              <Menu className="h-6 w-6 text-white" />
            </div>
            Menu Management
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(!showForm);
              if (editingId) {
                setEditingId(null);
                setFormData({ name: '', description: '', price: '', category: 'Main Course', available: true });
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Cancel' : 'Add Item'}
          </motion.button>
        </div>
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-8 rounded-2xl shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Item Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-blue-500/50 rounded-lg text-white placeholder:text-white/30 outline-none transition-all"
                    placeholder="e.g., Caesar Salad"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-pink-500/50 rounded-lg text-white placeholder:text-white/30 outline-none transition-all"
                    placeholder="12.99"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-purple-500/50 rounded-lg text-white placeholder:text-white/30 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="Item description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-white/80 block mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 focus:border-cyan-500/50 rounded-lg text-white outline-none transition-all"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-5 h-5 rounded accent-blue-500"
                    />
                    <span className="text-white font-medium">Available</span>
                  </label>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                {editingId ? 'Update Item' : 'Add Item'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items by Category */}
      {categories.map((category) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-white uppercase tracking-widest opacity-70">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems
              .filter((item) => item.category === category)
              .map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 hover:border-purple-500/30 p-6 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-white">{item.name}</h4>
                      <p className="text-orange-400 font-bold text-lg">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-all text-blue-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-white/60 text-sm mb-3">{item.description}</p>
                  )}
                  <span className={cn(
                    "inline-block px-3 py-1 text-xs font-bold rounded-lg",
                    item.available
                      ? "bg-green-500/20 border border-green-500/30 text-green-300"
                      : "bg-red-500/20 border border-red-500/30 text-red-300"
                  )}>
                    {item.available ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </motion.div>
              ))}
          </div>
        </motion.div>
      ))}

      {menuItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center"
        >
          <p className="text-white/50 font-medium">No menu items yet</p>
          <p className="text-white/30 text-sm mt-1">Add your first item to get started</p>
        </motion.div>
      )}
    </div>
  );
}

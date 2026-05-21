import { useState, useEffect, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  active: boolean;
}

interface Props {
  restaurantId: string;
}

export default function MenuManagement({ restaurantId }: Props) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');

  // Fetch menu items
  useEffect(() => {
    try {
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
          setLoading(false);
        } catch (err) {
          console.error('Error processing menu snapshot:', err);
          setError('Failed to load menu items');
          setLoading(false);
        }
      }, (err) => {
        console.error('Firestore listener error:', err);
        setError('Permission denied or network error');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up menu listener:', err);
      setError('Failed to setup menu listener');
      setLoading(false);
    }
  }, [restaurantId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;
    
    setSaving(true);
    try {
      const itemData = {
        name,
        description,
        price: parseFloat(price),
        category,
        active: true,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        // Update existing
        await updateDoc(
          doc(db, 'restaurants', restaurantId, 'menus', editingId),
          itemData
        );
        setEditingId(null);
      } else {
        // Create new
        const docId = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        await setDoc(
          doc(db, 'restaurants', restaurantId, 'menus', docId),
          { ...itemData, createdAt: new Date().toISOString() }
        );
      }

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Main Course');
      setShowForm(false);
      alert(editingId ? 'Menu item updated!' : 'Menu item added successfully!');
    } catch (err) {
      console.error('Error saving menu item:', err);
      alert('Failed to save menu item. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      await deleteDoc(
        doc(db, 'restaurants', restaurantId, 'menus', itemId)
      );
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setCategory(item.category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Main Course');
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="glass-morphism p-6 rounded-2xl border border-red-500/30 text-center">
          <p className="text-red-400 font-bold mb-3">Error loading menu</p>
          <p className="text-white/60 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-0 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <Plus className="h-5 w-5 text-green-400" />
          </div>
          Menu Management
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium"
          >
            Add Item
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-morphism p-6 sm:p-8 rounded-3xl sm:rounded-4xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-white/50 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Item Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-white placeholder:text-white/20 text-base"
                    placeholder="Burger"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-5 top-4 text-white/40 font-medium">$</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full pl-8 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-white placeholder:text-white/20 text-base"
                      placeholder="12.99"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-white text-base"
                >
                  <option value="Main Course">Main Course</option>
                  <option value="Appetizers">Appetizers</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Sides">Sides</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-white placeholder:text-white/20 min-h-[80px] resize-none text-base"
                  placeholder="Juicy beef patty with fresh toppings"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-green-500 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50 text-base"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-4 bg-white/5 text-white/60 font-medium rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="glass-morphism p-8 sm:p-12 rounded-3xl text-center border border-white/10">
            <div className="mb-4">
              <Plus className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Menu Items Yet</h3>
              <p className="text-white/60 mb-6">Get started by adding your first menu item.</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-bold"
                >
                  Add Your First Item
                </button>
              )}
            </div>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat}>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-3 ml-2">{cat}</h3>
              <div className="space-y-2">
                {menuItems.filter(item => item.category === cat).map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="glass-morphism p-4 sm:p-6 rounded-2xl flex items-center justify-between group hover:border-green-500/30 border border-white/10 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white">{item.name}</h4>
                      {item.description && (
                        <p className="text-white/50 text-sm mt-1 truncate">{item.description}</p>
                      )}
                      <p className="text-green-400 font-medium text-sm mt-2">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

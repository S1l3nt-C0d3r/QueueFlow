import { useState, useEffect, FormEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Store, QrCode, Settings, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AdminView() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRestaurants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, 'restaurants', id), {
        name,
        description: desc,
        createdAt: new Date().toISOString()
      });
      setName('');
      setDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 pb-safe">
      <nav className="glass border-b border-white/5 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 mesh-gradient-purple rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight leading-tight">QueueFlow Admin</h1>
            <p className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">System Management</p>
          </div>
        </div>
        <button onClick={handleLogout} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all">
          <LogOut className="h-5 w-5" />
        </button>
      </nav>

      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Create Restaurant */}
        <div className="lg:col-span-4">
          <div className="glass-morphism p-6 sm:p-8 rounded-3xl sm:rounded-4xl relative overflow-hidden">
            <div className="absolute inset-0 mesh-gradient-purple opacity-10" />
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 sm:mb-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-purple-400" />
                </div>
                Add Restaurant
              </h2>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-white placeholder:text-white/20 text-base"
                    placeholder="The Burger Joint"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-white placeholder:text-white/20 min-h-[100px] sm:min-h-[120px] resize-none text-base"
                    placeholder="Best burgers in town"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-5 bg-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:bg-purple-600 active:scale-[0.98] transition-all text-lg"
                >
                  Create Restaurant
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Restaurant List & QR Codes */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">Active Restaurants</h2>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">
              {restaurants.length} Total
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {restaurants.map((rest, idx) => (
              <div key={rest.id} className="glass-morphism p-6 sm:p-8 rounded-3xl sm:rounded-4xl flex flex-col items-center text-center relative overflow-hidden group">
                <div className={cn(
                  "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500",
                  idx % 3 === 0 ? "mesh-gradient-purple" : idx % 3 === 1 ? "mesh-gradient-blue" : "mesh-gradient-green"
                )} />
                
                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl">
                    <QRCodeSVG 
                      value={`${window.location.origin}/q/${rest.id}`}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mb-1 sm:mb-2">{rest.name}</h3>
                  <p className="text-xs sm:text-sm text-white/50 mb-6 sm:mb-8 font-medium line-clamp-2 min-h-[32px] sm:min-h-[40px]">{rest.description}</p>
                  
                  <div className="w-full space-y-2 sm:space-y-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/waiter/${rest.id}`)}
                        className="flex-1 py-3 bg-white/5 text-white/80 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 border border-white/5 transition-all"
                      >
                        Waiter
                      </button>
                      <button 
                        onClick={() => navigate(`/receptionist/${rest.id}`)}
                        className="flex-1 py-3 bg-white/5 text-white/80 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 border border-white/5 transition-all"
                      >
                        Reception
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/q/${rest.id}`)}
                        className="flex-1 py-3 bg-white/5 text-white/80 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <Store className="h-3 w-3" />
                        App
                      </button>
                      <button 
                        className="flex-1 py-3 bg-indigo-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        onClick={() => {
                          const url = `${window.location.origin}/q/${rest.id}`;
                          navigator.clipboard.writeText(url);
                          alert('URL copied to clipboard!');
                        }}
                      >
                        <QrCode className="h-3 w-3" />
                        Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect, FormEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Store, QrCode, Settings, Users, ArrowLeft, Grid3X3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import MenuManagement from './MenuManagement';
import StaffManagement from './StaffManagement';
import RestaurantLayout from './RestaurantLayout';
import UserProfile from './UserProfile';
import { User } from 'firebase/auth';

type AdminTab = 'restaurants' | 'staff' | 'tables';

interface AdminViewProps {
  user?: User | null;
  displayName?: string;
}

export default function AdminView({ user, displayName }: AdminViewProps) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('restaurants');
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 pb-safe">
      {/* Header */}
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

        {/* Right side: User Profile */}
        <UserProfile user={user || auth.currentUser} displayName={displayName} />
      </nav>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('restaurants');
                setSelectedRestaurant(null);
              }}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'restaurants'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Store className="h-5 w-5" />
              Restaurants
            </button>
            <button
              onClick={() => {
                setActiveTab('tables');
                setSelectedRestaurant(null);
              }}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'tables'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Grid3X3 className="h-5 w-5" />
              Tables
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={cn(
                "px-4 py-4 font-medium border-b-2 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap",
                activeTab === 'staff'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              <Users className="h-5 w-5" />
              Staff Management
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Staff Management Tab */}
        {activeTab === 'staff' && (
          <div className="animate-in fade-in">
            <StaffManagement />
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="animate-in fade-in">
            {selectedRestaurant ? (
              <div>
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="mb-8 h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <RestaurantLayout restaurantId={selectedRestaurant.id} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-white">Select Restaurant to Manage Tables</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {restaurants.map((rest, idx) => (
                    <button
                      key={rest.id}
                      onClick={() => setSelectedRestaurant(rest)}
                      className="glass-morphism p-6 sm:p-8 rounded-3xl sm:rounded-4xl text-left relative overflow-hidden group hover:border-indigo-500/50 transition-all"
                    >
                      <div className={cn(
                        "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500",
                        idx % 3 === 0 ? "mesh-gradient-purple" : idx % 3 === 1 ? "mesh-gradient-blue" : "mesh-gradient-green"
                      )} />
                      <div className="relative z-10">
                        <h3 className="text-xl sm:text-2xl font-display font-bold text-white">{rest.name}</h3>
                        <p className="text-white/50 text-sm mt-2">{rest.description}</p>
                        <p className="text-indigo-400 text-sm font-bold mt-4 flex items-center gap-2">
                          <Grid3X3 className="h-4 w-4" />
                          Manage Tables
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <>
            {selectedRestaurant ? (
              // Menu Management View
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">{selectedRestaurant.name}</h2>
                    <p className="text-white/50 text-sm mt-1">Menu Management</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 rounded-4xl p-8">
                  <MenuManagement restaurantId={selectedRestaurant.id} />
                </div>
              </div>
            ) : (
              // Restaurants Grid
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Create Restaurant Form */}
                <div className="lg:col-span-4">
                  <div className="glass-morphism p-6 sm:p-8 rounded-3xl sm:rounded-4xl relative overflow-hidden sticky top-24">
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

                {/* Restaurant List */}
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
                            <button
                              onClick={() => setSelectedRestaurant(rest)}
                              className="w-full py-3 bg-green-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"
                            >
                              Menu
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

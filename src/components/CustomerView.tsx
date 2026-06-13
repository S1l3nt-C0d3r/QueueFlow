import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Users, Clock, CheckCircle2, XCircle, AlertCircle, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { differenceInSeconds } from 'date-fns';
import PreorderScreen from './PreorderScreen';

export default function CustomerView() {
  const { restaurantId = 'default' } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [myEntry, setMyEntry] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState<string | number>(2);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showPreorder, setShowPreorder] = useState(false);

  // Countdown timer for notified status
  useEffect(() => {
    let timer: any;
    if (myEntry?.status === 'notified' && myEntry.claimExpiresAt) {
      const updateTimer = async () => {
        const diff = differenceInSeconds(new Date(myEntry.claimExpiresAt), new Date());
        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(timer);
          
          // Automatically mark as expired in DB
          try {
            await updateDoc(doc(db, 'restaurants', restaurantId, 'queue', myEntry.id), {
              status: 'expired'
            });
          } catch (err) {
            console.error('Failed to mark as expired:', err);
          }
        } else {
          setTimeLeft(diff);
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(timer);
  }, [myEntry, restaurantId]);

  // Load restaurant and queue data
  useEffect(() => {
    // Fetch restaurant details
    const fetchRestaurant = async () => {
      const docRef = doc(db, 'restaurants', restaurantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRestaurant(docSnap.data());
      } else {
        setRestaurant({ name: 'QueueFlow Restaurant', description: 'Welcome to our virtual queue.' });
      }
    };
    fetchRestaurant();

    // Listen to queue
    const q = query(
      collection(db, 'restaurants', restaurantId, 'queue'),
      where('status', 'in', ['waiting', 'notified']),
      orderBy('joinedAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQueue(entries);
      setLoading(false);
      
      // Check if user has an entry in local storage
      const storedEntryId = localStorage.getItem(`queueEntry_${restaurantId}`);
      if (storedEntryId) {
        const entry = entries.find(e => e.id === storedEntryId);
        if (entry) {
          setMyEntry(entry);
        } else {
          // Check if it was seated, cancelled, or expired
          const checkStatus = async () => {
            try {
              const entryDoc = await getDoc(doc(db, 'restaurants', restaurantId, 'queue', storedEntryId));
              if (entryDoc.exists()) {
                const data = entryDoc.data();
                setMyEntry({ id: entryDoc.id, ...data });
              } else {
                localStorage.removeItem(`queueEntry_${restaurantId}`);
                setMyEntry(null);
              }
            } catch (err) {
              console.error(err);
            }
          };
          checkStatus();
        }
      }
    });

    return () => unsubscribe();
  }, [restaurantId]);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    setJoining(true);
    const newEntryData = {
      restaurantId,
      customerName: name,
      phoneNumber: phone,
      partySize: String(partySize),
      status: 'waiting',
      joinedAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'restaurants', restaurantId, 'queue'), newEntryData);
      localStorage.setItem(`queueEntry_${restaurantId}`, docRef.id);
      setMyEntry({ id: docRef.id, ...newEntryData });
      setJoining(false);
    } catch (err) {
      console.error(err);
      setJoining(false);
    }
  };

  const handleCancel = async () => {
    if (!myEntry) return;
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId, 'queue', myEntry.id), {
        status: 'cancelled'
      });
      localStorage.removeItem(`queueEntry_${restaurantId}`);
      setMyEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  const myPosition = myEntry ? queue.findIndex(e => e.id === myEntry.id) + 1 : -1;

  if (loading) return (
    <div className="max-w-md mx-auto min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  );

  // Show preorder screen if in preorder mode
  if (showPreorder && myEntry && myEntry.status === 'waiting') {
    return (
      <PreorderScreen 
        restaurantId={restaurantId}
        queueEntryId={myEntry.id}
        onBack={() => setShowPreorder(false)}
        customerName={myEntry.customerName}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#050505] pb-safe font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="p-6 pt-12 sm:p-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white">{restaurant?.name}</h1>
          <p className="text-white/50 mt-2 font-medium text-sm sm:text-base">{restaurant?.description}</p>
        </motion.div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {!myEntry || myEntry.status === 'cancelled' || myEntry.status === 'seated' ? (
            <motion.div
              key="join-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-morphism p-6 sm:p-8 rounded-4xl sm:rounded-5xl relative overflow-hidden"
            >
              <div className="absolute inset-0 mesh-gradient-blue opacity-10" />
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  Join Queue
                </h2>
                <form onSubmit={handleJoin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-white/20 text-base"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone</label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-white/20 text-base"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Party Size</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1', '2', '3', '4', '5', '6', '6+'].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPartySize(size)}
                          className={cn(
                            "py-3.5 rounded-xl border font-bold transition-all text-sm",
                            partySize === size 
                              ? "bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                              : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    disabled={joining}
                    type="submit"
                    className="w-full py-5 bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 text-lg"
                  >
                    {joining ? 'Joining...' : 'Join Queue'}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : myEntry.status === 'expired' ? (
            <motion.div
              key="expired-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-morphism p-8 sm:p-10 rounded-4xl sm:rounded-5xl text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 mesh-gradient-orange opacity-20" />
              <div className="relative z-10">
                <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-orange-500/20 rounded-3xl flex items-center justify-center mb-6 border border-orange-500/30">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-orange-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Time's Up!</h2>
                <p className="text-white/60 mt-4 leading-relaxed text-sm sm:text-base">
                  We're sorry, but you didn't claim your table in time. 
                  Please join the queue again.
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem(`queueEntry_${restaurantId}`);
                    setMyEntry(null);
                    setName('');
                    setPhone('');
                  }}
                  className="mt-8 w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-lg"
                >
                  Join Again
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="status-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-morphism p-8 sm:p-10 rounded-4xl sm:rounded-5xl text-center relative overflow-hidden"
            >
              <div className={cn(
                "absolute inset-0 opacity-20 transition-all duration-1000",
                myEntry.status === 'notified' ? "mesh-gradient-green" : "mesh-gradient-purple"
              )} />
              
              <div className="relative z-10">
                {myEntry.status === 'notified' ? (
                  <div className="space-y-6">
                    <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-green-500/20 rounded-3xl flex items-center justify-center animate-pulse border border-green-500/30">
                      <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-400" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Your Table is Ready!</h2>
                      <p className="text-white/60 text-sm sm:text-base">Please head to the host stand now.</p>
                    </div>
                    
                    <div className="py-6 sm:py-8 bg-white/5 rounded-3xl border border-white/10">
                      <div className="text-5xl sm:text-6xl font-display font-bold text-green-400 tracking-tighter">
                        {timeLeft !== null ? (
                          `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                        ) : '0:00'}
                      </div>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-2">Time Remaining</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-white/40 text-xs sm:text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Expires at {new Date(myEntry.claimExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative inline-block">
                      <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-[10px] sm:border-[12px] border-white/5 flex items-center justify-center">
                        <span className="text-5xl sm:text-6xl font-display font-bold text-white tracking-tighter">{myPosition}</span>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-5 py-2 rounded-2xl text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-xl shadow-purple-500/20 uppercase tracking-widest">
                        Position
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-white">Hang tight, {myEntry.customerName}!</h2>
                      <p className="text-white/50 font-medium text-sm sm:text-base">We'll notify you when your table for {myEntry.partySize} is ready.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-4 sm:p-5 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Est. Wait</p>
                        <p className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">~{myPosition * 10}m</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Ahead</p>
                        <p className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">{myPosition - 1}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPreorder(true)}
                      className="w-full py-6 sm:py-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-3xl shadow-2xl shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all text-lg sm:text-xl flex items-center justify-center gap-3 border border-emerald-400/20"
                    >
                      <Utensils className="h-6 w-6 sm:h-7 sm:w-7" />
                      <span>Preorder Food</span>
                    </button>

                    <button
                      onClick={handleCancel}
                      className="text-[10px] text-white/30 font-bold uppercase tracking-widest hover:text-red-400 transition-colors flex items-center justify-center gap-2 mx-auto py-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Spot
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Queue Preview */}
        <div className="mt-12 mb-12">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Live Queue</h3>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-lg uppercase tracking-widest">
              {queue.length} Active
            </span>
          </div>
          <div className="space-y-3">
            {queue.slice(0, 5).map((entry, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={entry.id}
                className={cn(
                  "p-5 rounded-3xl border flex items-center justify-between transition-all",
                  entry.id === myEntry?.id 
                    ? "bg-white/10 border-white/20 shadow-xl" 
                    : "bg-white/[0.03] border-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold",
                    entry.id === myEntry?.id ? "bg-indigo-500 text-white" : "bg-white/5 text-white/40"
                  )}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {entry.customerName} {entry.id === myEntry?.id && '(You)'}
                    </p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Party of {entry.partySize}</p>
                  </div>
                </div>
                {entry.status === 'notified' && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-400/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Ready
                  </span>
                )}
              </motion.div>
            ))}
            {queue.length > 5 && (
              <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] pt-4">
                + {queue.length - 5} more parties waiting
              </p>
            )}
            {queue.length === 0 && (
              <div className="text-center p-12 bg-white/[0.02] rounded-4xl border border-dashed border-white/5">
                <p className="text-white/20 text-sm font-medium">The queue is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

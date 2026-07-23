import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Users, Clock, CheckCircle2, XCircle, AlertCircle, Utensils, PhoneIcon } from 'lucide-react';
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

  useEffect(() => {
    let timer: any;
    if (myEntry?.status === 'notified' && myEntry.claimExpiresAt) {
      const updateTimer = async () => {
        const diff = differenceInSeconds(new Date(myEntry.claimExpiresAt), new Date());
        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(timer);
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

  useEffect(() => {
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

    const q = query(
      collection(db, 'restaurants', restaurantId, 'queue'),
      where('status', 'in', ['waiting', 'notified']),
      orderBy('joinedAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQueue(entries);
      setLoading(false);
      const storedEntryId = localStorage.getItem(`queueEntry_${restaurantId}`);
      if (storedEntryId) {
        const entry = entries.find(e => e.id === storedEntryId);
        if (entry) {
          setMyEntry(entry);
        } else {
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

  const handleJoinQueue = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !partySize) {
      alert('Please fill in all fields');
      return;
    }

    setJoining(true);
    try {
      const entry = await addDoc(collection(db, 'restaurants', restaurantId, 'queue'), {
        customerName: name,
        customerPhone: phone,
        partySize: parseInt(String(partySize)),
        status: 'waiting',
        joinedAt: new Date(),
        notificationTime: null,
        claimExpiresAt: null,
        seatedAt: null
      });
      
      localStorage.setItem(`queueEntry_${restaurantId}`, entry.id);
      setMyEntry({
        id: entry.id,
        customerName: name,
        customerPhone: phone,
        partySize: parseInt(String(partySize)),
        status: 'waiting',
        joinedAt: new Date()
      });
      setName('');
      setPhone('');
      setPartySize(2);
    } catch (err) {
      console.error('Error joining queue:', err);
      alert('Failed to join queue');
    } finally {
      setJoining(false);
    }
  };

  if (showPreorder && myEntry) {
    return <PreorderScreen restaurantId={restaurantId} queueEntryId={myEntry.id} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const myPosition = queue.findIndex(e => e.id === myEntry?.id) + 1;
  const status = myEntry?.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-display font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
          >
            {restaurant?.name || 'Welcome'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60"
          >
            {restaurant?.description || 'Virtual queue management'}
          </motion.p>
        </div>

        {!myEntry ? (
          // Join Queue Form
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Join the Queue</h2>
            <form onSubmit={handleJoinQueue} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={joining}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 focus:border-blue-500/50 rounded-xl text-white placeholder:text-white/30 outline-none transition-all disabled:opacity-50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={joining}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 focus:border-pink-500/50 rounded-xl text-white placeholder:text-white/30 outline-none transition-all disabled:opacity-50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">Party Size</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, '6+'].map(size => (
                    <motion.button
                      key={size}
                      type="button"
                      onClick={() => setPartySize(size === '6+' ? 6 : size)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg font-bold transition-all",
                        partySize === (size === '6+' ? 6 : size)
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                          : "bg-white/5 border border-white/20 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={joining}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Join Queue
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          // My Entry Status
          <AnimatePresence mode="wait">
            {status === 'notified' ? (
              <motion.div
                key="notified"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-green-300">Table Ready!</h2>
                      <p className="text-green-200">Your table is ready for you</p>
                    </div>
                  </div>

                  {timeLeft !== null && (
                    <div className="text-center py-4 bg-white/5 rounded-xl border border-white/10 mb-4">
                      <p className="text-white/60 text-sm mb-1">Claim expires in</p>
                      <p className="text-3xl font-bold text-green-400">{timeLeft}s</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowPreorder(true)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                  >
                    View Table & Preorder
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-8">Your Queue Status</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
                      <p className="text-blue-400/60 text-sm font-bold mb-2 uppercase">Your Position</p>
                      <p className="text-4xl font-bold text-blue-300">#{myPosition}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                      <p className="text-purple-400/60 text-sm font-bold mb-2 uppercase">Queue Length</p>
                      <p className="text-4xl font-bold text-purple-300">{queue.length}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-white/60 text-sm mb-2">Party Size</p>
                    <p className="text-2xl font-bold text-white">{myEntry.partySize} people</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Queue List */}
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mt-8 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">Queue ({queue.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queue.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    myEntry?.id === entry.id
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50"
                      : "bg-white/5 border-white/10 hover:border-white/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        entry.status === 'notified'
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                          : "bg-white/10 text-white/60"
                      )}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-white font-bold">{entry.customerName}</p>
                        <p className="text-white/50 text-sm">{entry.partySize} people</p>
                      </div>
                    </div>
                    {entry.status === 'notified' && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 rounded-full text-xs font-bold text-green-300">
                        Ready
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

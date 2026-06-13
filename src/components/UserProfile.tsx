import { User } from 'firebase/auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface UserProfileProps {
  user: User | null;
  displayName?: string;
}

export default function UserProfile({ user, displayName }: UserProfileProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) return null;

  const name = displayName || user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <UserIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-white hidden sm:inline">{name}</span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Logged In As</p>
            <p className="text-sm font-semibold text-white mt-1">{name}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              handleLogout();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

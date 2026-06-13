import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type UserRole = 'waiter' | 'receptionist' | 'admin' | 'global_admin' | null;

export interface UserProfile {
  email: string;
  role: UserRole;
  restaurantId?: string;
  displayName?: string;
  createdAt: string;
}

export const useUserRole = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Check if user is global admin
        if (user.email === 'incrediblegamer64@gmail.com' && user.emailVerified) {
          setProfile({
            email: user.email,
            role: 'global_admin',
            displayName: user.displayName || 'Admin',
            createdAt: new Date().toISOString()
          });
          setError(null);
          setLoading(false);
          return;
        }

        // Fetch user profile from Firestore using email as key
        if (!user.email) {
          setError('User email not available');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.email.toLocaleLowerCase()));
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setError(null);
        } else {
          // User not found in system
          setProfile(null);
          setError(`Account ${user.email} has not been authorized. Contact your admin.`);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return { profile, loading, error };
};

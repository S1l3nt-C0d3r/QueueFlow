import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type UserRole = 'waiter' | 'receptionist' | 'admin' | 'global_admin' | null;

interface UserProfile {
  uid: string;
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
            uid: user.uid,
            email: user.email,
            role: 'global_admin',
            displayName: user.displayName || 'Admin',
            createdAt: new Date().toISOString()
          });
          setError(null);
          setLoading(false);
          return;
        }

        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setError(null);
        } else {
          // User not found - needs onboarding
          setProfile(null);
          setError('User profile not found. Please complete onboarding.');
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

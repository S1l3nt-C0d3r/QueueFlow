import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserRole } from './hooks/useUserRole';
import CustomerView from './components/CustomerView';
import WaiterView from './components/WaiterView';
import ReceptionistView from './components/ReceptionistView';
import AdminView from './components/AdminView_Integrated';
import RestaurantAdminView from './components/RestaurantAdminView';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, loading: profileLoading } = useUserRole(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] font-sans">
        <Routes>
          {/* Customer Routes - No authentication required */}
          <Route path="/" element={<CustomerView />} />
          <Route path="/q/:restaurantId" element={<CustomerView />} />
          
          {/* Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - Only for authenticated users with profiles */}
          {user && profile ? (
            <>
              {/* Global Admin Routes - Access to all restaurants */}
              {profile.role === 'global_admin' && (
                <>
                  <Route path="/admin" element={<AdminView user={user} displayName={profile.displayName} />} />
                  <Route path="/admin/*" element={<AdminView user={user} displayName={profile.displayName} />} />
                  
                  {/* Global admin can view waiter/receptionist perspectives for any restaurant */}
                  <Route path="/waiter/:restaurantId" element={<WaiterView />} />
                  <Route path="/receptionist/:restaurantId" element={<ReceptionistView />} />
                  
                  {/* Catch-all for global admin */}
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </>
              )}

              {/* Restaurant Admin Routes - Access to their restaurant only */}
              {profile.role === 'admin' && profile.restaurantId && (
                <>
                  <Route 
                    path={`/restaurant/${profile.restaurantId}`}
                    element={
                      <RestaurantAdminView 
                        user={user}
                        restaurantId={profile.restaurantId}
                        restaurantName={profile.restaurantName || 'My Restaurant'}
                      />
                    }
                  />
                  <Route 
                    path="/restaurant/*" 
                    element={<Navigate to={`/restaurant/${profile.restaurantId}`} replace />} 
                  />
                  {/* Redirect all other routes to their restaurant */}
                  <Route path="*" element={<Navigate to={`/restaurant/${profile.restaurantId}`} replace />} />
                </>
              )}

              {/* Waiter Routes */}
              {profile.role === 'waiter' && profile.restaurantId && (
                <>
                  <Route path={`/waiter/${profile.restaurantId}`} element={<WaiterView />} />
                  <Route path="/waiter" element={<Navigate to={`/waiter/${profile.restaurantId}`} replace />} />
                  {/* Redirect all other routes to their waiter view */}
                  <Route path="*" element={<Navigate to={`/waiter/${profile.restaurantId}`} replace />} />
                </>
              )}

              {/* Receptionist Routes */}
              {profile.role === 'receptionist' && profile.restaurantId && (
                <>
                  <Route path={`/receptionist/${profile.restaurantId}`} element={<ReceptionistView />} />
                  <Route path="/receptionist" element={<Navigate to={`/receptionist/${profile.restaurantId}`} replace />} />
                  {/* Redirect all other routes to their receptionist view */}
                  <Route path="*" element={<Navigate to={`/receptionist/${profile.restaurantId}`} replace />} />
                </>
              )}
            </>
          ) : user ? (
            // User authenticated but not authorized (profile not found)
            <Route path="*" element={<Navigate to="/login" replace />} />
          ) : (
            // Not authenticated - all routes go to login
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

/**
 * ROUTING LOGIC SUMMARY
 * 
 * Not Authenticated:
 *   /login → Login component
 *   /q/{restaurantId} → CustomerView (no auth needed)
 *   /* → Redirect to /login
 * 
 * Global Admin (role: 'global_admin'):
 *   /admin → AdminView (all restaurants)
 *   /waiter/{restaurantId} → WaiterView (view as waiter for any restaurant)
 *   /receptionist/{restaurantId} → ReceptionistView (view as receptionist for any restaurant)
 *   /* → Redirect to /admin
 * 
 * Restaurant Admin (role: 'admin' + restaurantId):
 *   /restaurant/{restaurantId} → RestaurantAdminView (their restaurant)
 *   /* → Redirect to /restaurant/{restaurantId}
 * 
 * Waiter (role: 'waiter' + restaurantId):
 *   /waiter/{restaurantId} → WaiterView
 *   /* → Redirect to /waiter/{restaurantId}
 * 
 * Receptionist (role: 'receptionist' + restaurantId):
 *   /receptionist/{restaurantId} → ReceptionistView
 *   /* → Redirect to /receptionist/{restaurantId}
 * 
 * Customer (public, no auth):
 *   / → CustomerView
 *   /q/{restaurantId} → CustomerView
 */

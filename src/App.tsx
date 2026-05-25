import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserRole } from './hooks/useUserRole';
import { ProtectedRoute } from './components/ProtectedRoute';
import CustomerView from './components/CustomerView';
import WaiterView from './components/WaiterView';
import ReceptionistView from './components/ReceptionistView';
import AdminView from './components/AdminView';
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
          
          {/* Protected Staff Routes */}
          {/* Waiter Routes */}
          <Route 
            path="/waiter" 
            element={
              <ProtectedRoute 
                userRole={profile?.role || null}
                requiredRoles={['waiter', 'admin', 'global_admin']}
                loading={profileLoading}
              >
                <WaiterView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/waiter/:restaurantId" 
            element={
              <ProtectedRoute 
                userRole={profile?.role || null}
                requiredRoles={['waiter', 'admin', 'global_admin']}
                loading={profileLoading}
              >
                <WaiterView />
              </ProtectedRoute>
            } 
          />
          
          {/* Receptionist Routes */}
          <Route 
            path="/receptionist" 
            element={
              <ProtectedRoute 
                userRole={profile?.role || null}
                requiredRoles={['receptionist', 'admin', 'global_admin']}
                loading={profileLoading}
              >
                <ReceptionistView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receptionist/:restaurantId" 
            element={
              <ProtectedRoute 
                userRole={profile?.role || null}
                requiredRoles={['receptionist', 'admin', 'global_admin']}
                loading={profileLoading}
              >
                <ReceptionistView />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute 
                userRole={profile?.role || null}
                requiredRoles={['admin', 'global_admin']}
                loading={profileLoading}
              >
                <AdminView />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

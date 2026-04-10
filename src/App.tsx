import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import CustomerView from './components/CustomerView';
import WaiterView from './components/WaiterView';
import ReceptionistView from './components/ReceptionistView';
import AdminView from './components/AdminView';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerView />} />
          <Route path="/q/:restaurantId" element={<CustomerView />} />
          
          {/* Waiter/Admin Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/waiter" element={user ? <WaiterView /> : <Navigate to="/login" />} />
          <Route path="/waiter/:restaurantId" element={user ? <WaiterView /> : <Navigate to="/login" />} />
          <Route path="/receptionist" element={user ? <ReceptionistView /> : <Navigate to="/login" />} />
          <Route path="/receptionist/:restaurantId" element={user ? <ReceptionistView /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user ? <AdminView /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

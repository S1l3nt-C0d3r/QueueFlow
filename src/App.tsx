import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import JoinSession from "./components/customer/JoinSession";

import { AuthProvider, useAuth } from "./context/auth.context";

import Login from "./components/Login";
import Unauthorized from "./components/Unauthorized";

import AdminView from "./components/Admin/AdminView";

import WaiterView from "./components/waiter/WaiterView";
//import ReceptionistView from "./components/ReceptionistView";

import CustomerView from "./components/customer/CustomerView";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  /*
   * ============================================================
   * AUTH LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-gradient-to-br
          from-slate-900
          via-slate-800
          to-slate-900
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              mb-4
              h-12
              w-12
              animate-spin
              rounded-full
              border-b-2
              border-t-2
              border-indigo-500
            "
          />

          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * CUSTOMER ROUTES
   * ============================================================
   *
   * Customers don't use staff authentication.
   */

  if (!user) {
    return (
      <Routes>
        <Route path="/join-session" element={<JoinSession />} />

        <Route path="/q/:restaurantId" element={<CustomerView />} />

        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  /*
   * ============================================================
   * STAFF ROUTES
   * ============================================================
   */

  switch (user.roleId) {
    /*
     * ========================================================
     * ADMIN
     * ========================================================
     */

    case "role-admin":
      return (
        <Routes>
          {/* Customer routes remain accessible */}

          <Route path="/join-session" element={<JoinSession />} />

          <Route path="/q/:restaurantId" element={<CustomerView />} />

          {/* Admin Dashboard */}

          <Route path="/admin" element={<AdminView />} />

          {/* Unauthorized */}

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default Admin Route */}

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      );

    /*
     * ========================================================
     * RECEPTIONIST
     * ========================================================
     */

    case "receptionist":
      return (
        <Routes>
          <Route path="/join-session" element={<JoinSession />} />

          <Route path="/q/:restaurantId" element={<CustomerView />} />

          <Route path="/receptionist" element={<ReceptionistView />} />

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="*" element={<Navigate to="/receptionist" replace />} />
        </Routes>
      );

    /*
     * ========================================================
     * WAITER
     * ========================================================
     */

    case "waiter":
      return (
        <Routes>
          <Route path="/join-session" element={<JoinSession />} />

          <Route path="/q/:restaurantId" element={<CustomerView />} />

          <Route path="/waiter" element={<WaiterView />} />

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="*" element={<Navigate to="/waiter" replace />} />
        </Routes>
      );

    /*
     * ========================================================
     * UNKNOWN ROLE
     * ========================================================
     */

    default:
      return (
        <Routes>
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      );
  }
}

export default App;

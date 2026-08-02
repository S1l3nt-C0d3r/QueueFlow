import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/auth.context";

import Login from "./components/Login";
import Unauthorized from "./components/Unauthorized";

import RestaurantAdminView from "./components/RestaurantAdminView";
import WaiterView from "./components/WaiterView";
import ReceptionistView from "./components/ReceptionistView";

import CustomerView from "./components/CustomerView";
import CustomerOrderView from "./components/CustomerOrderView";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        {/* Public Customer Routes */}
        <Route
          path="/q/:restaurantId"
          element={<CustomerView />}
        />

        <Route
          path="/order"
          element={<CustomerOrderView />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    );
  }

  switch (user.roleId) {
    case "admin":
      return (
        <Routes>
          <Route
            path="/restaurant"
            element={
              <RestaurantAdminView
                restaurantId={user.restaurantId}
                restaurantName="Restaurant"
                displayName={user.displayName}
              />
            }
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          <Route
            path="*"
            element={<Navigate to="/restaurant" replace />}
          />
        </Routes>
      );

    case "receptionist":
      return (
        <Routes>
          <Route
            path="/receptionist"
            element={<ReceptionistView />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          <Route
            path="*"
            element={<Navigate to="/receptionist" replace />}
          />
        </Routes>
      );

    case "waiter":
      return (
        <Routes>
          <Route
            path="/waiter"
            element={<WaiterView />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          <Route
            path="*"
            element={<Navigate to="/waiter" replace />}
          />
        </Routes>
      );

    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;
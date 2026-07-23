import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/auth.context";

import Login from "./components/Login";

import AdminView from "./components/AdminView_Integrated";
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
          <p className="text-white/60">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route
          path="/q/:restaurantId"
          element={<CustomerView />}
        />

        <Route
          path="/order"
          element={<CustomerOrderView />}
        />

        <Route
          path="*"
          element={<Login />}
        />
      </Routes>
    );
  }

  return (
    <Routes>

      <Route
        path="/q/:restaurantId"
        element={<CustomerView />}
      />

      <Route
        path="/order"
        element={<CustomerOrderView />}
      />

      {/* Global Admin */}

      {user.roleId === "global_admin" && (
        <>
          <Route
            path="/admin"
            element={<AdminView />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/admin"
                replace
              />
            }
          />
        </>
      )}

      {/* Restaurant Admin */}

      {user.roleId === "admin" && (
        <>
          <Route
            path="/restaurant/:restaurantId"
            element={
              <RestaurantAdminView
                restaurantId={user.restaurantId}
                restaurantName={user.restaurantId}
                displayName={user.displayName}
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={`/restaurant/${user.restaurantId}`}
                replace
              />
            }
          />
        </>
      )}

      {/* Waiter */}

      {user.roleId === "waiter" && (
        <>
          <Route
            path="/waiter/:restaurantId"
            element={<WaiterView />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to={`/waiter/${user.restaurantId}`}
                replace
              />
            }
          />
        </>
      )}

      {/* Receptionist */}

      {user.roleId === "receptionist" && (
        <>
          <Route
            path="/receptionist/:restaurantId"
            element={<ReceptionistView />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to={`/receptionist/${user.restaurantId}`}
                replace
              />
            }
          />
        </>
      )}

    </Routes>
  );
}

export default App;

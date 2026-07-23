import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { authService } from "../services/auth.service";

export interface AuthUser {
  id: string;
  restaurantId: string;
  roleId: string;
  staffNumber: string;
  displayName: string;
  active: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;

  login: (token: string) => Promise<void>;

  logout: () => void;

  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {
    try {
      const response = await authService.me();

      setUser(response.staff);
    } catch {
      localStorage.removeItem("token");

      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(token: string) {
    localStorage.setItem("token", token);

    await refresh();
  }

  function logout() {
    authService.logout();

    setUser(null);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiPost, apiGet } from "@/lib/api";

interface User {
  id: number | null;
  username: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginAsGuest: (nickname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiGet<{ user: User }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await apiPost<{ token: string; user: User }>(
      "/auth/login",
      { email, password }
    );
    localStorage.setItem("token", token);
    setUser(user);
  };

  const register = async (username: string, email: string, password: string) => {
    const { token, user } = await apiPost<{ token: string; user: User }>(
      "/auth/register",
      { username, email, password }
    );
    localStorage.setItem("token", token);
    setUser(user);
  };

  const loginAsGuest = async (nickname: string) => {
    const { token, user } = await apiPost<{ token: string; user: User }>(
      "/auth/guest",
      { nickname }
    );
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

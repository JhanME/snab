import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SocketProvider } from "@/hooks/useSocket";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Lobby from "@/pages/Lobby";
import Game from "@/pages/Game";
import Join from "@/pages/Join";

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/lobby" />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route element={<ProtectedLayout />}>
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/:roomId" element={<Game />} />
      </Route>
      <Route path="/join/:roomId" element={<Join />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

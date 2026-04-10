import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/lobby");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="font-bold text-lg tracking-tight">SNAB</Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
            Authentication required
          </p>
          <h1 className="text-2xl font-semibold mt-1">Iniciar sesion</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-destructive/50 bg-destructive/5 text-destructive px-4 py-2.5 rounded-lg text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full font-mono text-xs uppercase tracking-widest">
            {loading ? "Connecting..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-muted-foreground text-xs font-mono text-center">
          No tienes cuenta?{" "}
          <Link to="/register" className="text-accent hover:underline">REGISTRARSE</Link>
        </p>
      </div>
    </div>
  );
}

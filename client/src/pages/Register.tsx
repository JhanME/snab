import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
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
            Create new account
          </p>
          <h1 className="text-2xl font-semibold mt-1">Registrarse</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-destructive/50 bg-destructive/5 text-destructive px-4 py-2.5 rounded-lg text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="tu_nombre"
            />
          </div>

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
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full font-mono text-xs uppercase tracking-widest">
            {loading ? "Creating..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-6 text-muted-foreground text-xs font-mono text-center">
          Ya tienes cuenta?{" "}
          <Link to="/login" className="text-accent hover:underline">INICIAR SESION</Link>
        </p>
      </div>
    </div>
  );
}

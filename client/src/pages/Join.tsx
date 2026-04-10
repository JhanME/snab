import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Join() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, loading: authLoading, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate(`/game/${roomId}`, { replace: true });
    }
  }, [user, authLoading, roomId, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAsGuest(nickname);
      navigate(`/game/${roomId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <span className="text-text-heading font-bold text-lg tracking-tight">SNAB</span>
          <p className="font-mono text-[10px] uppercase tracking-widest text-teal mt-4">
            Incoming invitation
          </p>
          <h1 className="text-text-heading text-2xl font-semibold mt-2">Unirse a partida</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mt-2">
            Session: {roomId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-red-500/30 bg-red-500/5 text-red-400 px-4 py-2 text-xs font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted block mb-2">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3 bg-bg-card border border-border text-text-heading text-sm font-sans placeholder-text-muted focus:outline-none focus:border-accent"
              placeholder="Tu nombre"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-white font-mono text-xs uppercase tracking-widest hover:bg-accent/80 disabled:opacity-50 transition-colors"
          >
            {loading ? "Joining..." : "Enter session"}
          </button>
        </form>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-text-muted text-center">
          No account required for guest access
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Lobby() {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = () => {
    if (!socket || !connected) return;
    setCreating(true);
    socket.emit("room:create", (res: any) => {
      setCreating(false);
      if (res.roomId) navigate(`/game/${res.roomId}`);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">SNAB</span>
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Home</span>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">Lobby</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-destructive"}`} />
          <span className="font-mono text-xs text-muted-foreground">{connected ? "Online" : "Offline"}</span>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
            <span className="text-xs font-mono">{user?.username?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </nav>

      {/* User info */}
      <div className="border-b border-border px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
              <span className="text-lg font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg uppercase tracking-tight">{user?.username}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">0 pts</span>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Rank: Rookie</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { logout(); navigate("/login"); }}
            className="font-mono text-[10px] uppercase tracking-widest"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Games */}
      <div className="max-w-5xl mx-auto px-8 py-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Word Search */}
          <button
            onClick={handleCreateRoom}
            disabled={creating || !connected}
            className="bg-card border border-border rounded-lg text-left hover:border-accent/50 transition-all group disabled:opacity-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest text-green-500 border-green-500/30">
                  Active
                </Badge>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Players</p>
                    <p className="font-mono text-xs text-accent">2-4</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Mode</p>
                    <p className="font-mono text-xs">Competitive</p>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-accent transition-colors">
                {creating ? "Creating..." : "Sopa de Letras"}
              </h3>
              <p className="text-muted-foreground text-sm mt-2 mb-6">
                Encuentra palabras antes que tu rival. Partidas rapidas.
              </p>
              <span className="font-mono text-xs uppercase tracking-widest text-accent">
                Enter lobby &rarr;
              </span>
            </div>
          </button>

          {/* Coming soon */}
          <div className="bg-card/50 border border-border/50 border-dashed rounded-lg p-6 opacity-40">
            <div className="flex items-center justify-center h-full min-h-[200px] flex-col gap-2">
              <h3 className="text-xl font-bold uppercase tracking-tight text-muted-foreground">Proximamente</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sector locked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <Separator />
      <div className="px-8 py-4">
        <div className="max-w-5xl mx-auto flex gap-10">
          {[
            { label: "Connections", value: "1" },
            { label: "Latency", value: "12ms", accent: true },
            { label: "Region", value: "LOCAL" },
            { label: "Version", value: "v0.1.0-a" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className={`font-semibold mt-1 ${s.accent ? "text-accent" : ""}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

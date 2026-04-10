import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Player {
  socketId: string;
  username: string;
  color: string;
  score: number;
  cursor: { row: number; col: number } | null;
}

interface FoundWord {
  word: string;
  playerName: string;
  color: string;
  cells: [number, number][];
}

interface RoomState {
  id: string;
  grid: string[][];
  size: number;
  words: string[];
  foundWords: FoundWord[];
  players: Player[];
  status: "waiting" | "playing" | "finished";
  createdBy: string;
}

interface RemoteCursor {
  x: number;
  y: number;
  color: string;
  username: string;
}

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [myColor, setMyColor] = useState("#7c3aed");
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(new Map());
  const [error, setError] = useState("");
  const [scores, setScores] = useState<{ username: string; score: number; color: string }[]>([]);
  const [gameResult, setGameResult] = useState<{ username: string; score: number; color: string }[] | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState<{ word: string; playerName: string; color: string } | null>(null);
  const [myCursor, setMyCursor] = useState<{ x: number; y: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const foundCellsRef = useRef<Map<string, string>>(new Map());
  const playersRef = useRef<Player[]>([]);

  const cellKey = (r: number, c: number) => `${r},${c}`;

  // Timer
  useEffect(() => {
    if (room?.status === "playing") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Join room on connect
  useEffect(() => {
    if (!socket || !connected || !roomId) return;

    socket.emit("room:join", roomId, (res: any) => {
      if (res.error) {
        setError(res.error);
        return;
      }
      setRoom(res.room);
      setMyColor(res.player.color);
      setIsHost(res.room.createdBy === user?.username);
      playersRef.current = res.room.players;

      for (const fw of res.room.foundWords) {
        for (const [r, c] of fw.cells) {
          foundCellsRef.current.set(cellKey(r, c), fw.color);
        }
      }

      setScores(
        res.room.players.map((p: Player) => ({
          username: p.username,
          score: p.score,
          color: p.color,
        }))
      );
    });

    socket.on("player:joined", (player: Player) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, players: [...prev.players, player] };
        playersRef.current = updated.players;
        return updated;
      });
      setScores((prev) => [...prev, { username: player.username, score: player.score, color: player.color }]);
    });

    socket.on("player:left", ({ socketId, players }: { socketId: string; players: Player[] }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return { ...prev, players };
      });
      playersRef.current = players;
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.delete(socketId);
        return next;
      });
      setScores(players.map((p) => ({ username: p.username, score: p.score, color: p.color })));
    });

    socket.on("game:started", (roomState: RoomState) => {
      setRoom(roomState);
      playersRef.current = roomState.players;
    });

    socket.on("game:mouse", (data: { socketId: string; x: number; y: number }) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        const player = playersRef.current.find((p) => p.socketId === data.socketId);
        next.set(data.socketId, {
          x: data.x,
          y: data.y,
          color: player?.color || "#888",
          username: player?.username || "???",
        });
        return next;
      });
    });

    socket.on("game:word-found", (data: FoundWord & { scores: { username: string; score: number; color: string }[] }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return { ...prev, foundWords: [...prev.foundWords, data] };
      });
      for (const [r, c] of data.cells) {
        foundCellsRef.current.set(cellKey(r, c), data.color);
      }
      setScores(data.scores);
      setFlash({ word: data.word, playerName: data.playerName, color: data.color });
      setTimeout(() => setFlash(null), 2000);
    });

    socket.on("game:finished", ({ scores }: { scores: { username: string; score: number; color: string }[] }) => {
      setGameResult(scores);
      setRoom((prev) => (prev ? { ...prev, status: "finished" } : prev));
      if (timerRef.current) clearInterval(timerRef.current);
    });

    return () => {
      socket.off("player:joined");
      socket.off("player:left");
      socket.off("game:started");
      socket.off("game:mouse");
      socket.off("game:word-found");
      socket.off("game:finished");
    };
  }, [socket, connected, roomId]);

  // Track mouse
  useEffect(() => {
    if (!socket || !roomId) return;

    let lastEmit = 0;
    const handleMouseMove = (e: MouseEvent) => {
      setMyCursor({ x: e.clientX, y: e.clientY });
      const now = Date.now();
      if (now - lastEmit < 50) return;
      lastEmit = now;
      socket.emit("game:mouse", { roomId, x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [socket, roomId]);

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (selecting) {
        if (selectedCells.length === 0) {
          setSelectedCells([[row, col]]);
          return;
        }
        const [startR, startC] = selectedCells[0];
        const dr = Math.sign(row - startR);
        const dc = Math.sign(col - startC);
        const cells: [number, number][] = [];
        let r = startR, c = startC;
        const maxSteps = Math.max(Math.abs(row - startR), Math.abs(col - startC));
        for (let i = 0; i <= maxSteps; i++) {
          cells.push([r, c]);
          r += dr;
          c += dc;
        }
        setSelectedCells(cells);
      }
    },
    [selecting, selectedCells]
  );

  const handleCellDown = useCallback(
    (row: number, col: number) => {
      if (room?.status !== "playing") return;
      setSelecting(true);
      setSelectedCells([[row, col]]);
    },
    [room?.status]
  );

  const handleCellUp = useCallback(() => {
    if (!selecting || !socket || !roomId || selectedCells.length < 2) {
      setSelecting(false);
      setSelectedCells([]);
      return;
    }
    socket.emit("game:select", { roomId, cells: selectedCells }, () => {});
    setSelecting(false);
    setSelectedCells([]);
  }, [selecting, socket, roomId, selectedCells]);

  const handleStart = () => {
    if (socket && roomId) socket.emit("game:start", roomId);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-mono text-sm mb-4">{error}</p>
          <button onClick={() => navigate("/lobby")} className="font-mono text-xs uppercase tracking-widest text-accent">
            &larr; Back to lobby
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Connecting to session...</p>
      </div>
    );
  }

  const selectedSet = new Set(selectedCells.map(([r, c]) => cellKey(r, c)));

  return (
    <div
      className="min-h-screen bg-background text-foreground cursor-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
      onMouseUp={handleCellUp}
    >
      {/* Cursors */}
      {Array.from(remoteCursors.entries()).map(([id, cursor]) => (
        <div key={id} className="pointer-events-none fixed z-50 transition-all duration-75" style={{ left: cursor.x, top: cursor.y }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill={cursor.color}>
            <path d="M0 0L20 8L10 10L8 20L0 0Z" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 ml-1 whitespace-nowrap" style={{ backgroundColor: cursor.color, color: "#fff" }}>
            {cursor.username}
          </span>
        </div>
      ))}
      {myCursor && (
        <div className="pointer-events-none fixed z-50" style={{ left: myCursor.x, top: myCursor.y }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill={myColor}>
            <path d="M0 0L20 8L10 10L8 20L0 0Z" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 ml-1 whitespace-nowrap" style={{ backgroundColor: myColor, color: "#fff" }}>
            {user?.username}
          </span>
        </div>
      )}

      {/* Flash */}
      {flash && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
          <div className="px-6 py-3 border text-foreground font-mono text-xs uppercase tracking-widest" style={{ borderColor: flash.color, backgroundColor: flash.color + "15" }}>
            {flash.playerName} found "{flash.word}"
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-border px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-foreground font-bold text-lg tracking-tight">SNAB</span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Home</span>
          <span className="font-mono text-xs uppercase tracking-widest text-accent border-b border-accent pb-1">Lobby</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground">Sopa de letras</span>
          <button
            onClick={() => navigate("/lobby")}
            className="font-mono text-[10px] uppercase tracking-widest border border-border px-4 py-2 text-muted-foreground hover:text-foreground hover:border-text-muted transition-colors"
          >
            &larr; Back to lobby
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-teal" : "bg-red-500"}`} />
            <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center">
              <span className="text-[10px] text-foreground font-mono">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-53px)]">
        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar: session info */}
          <div className="border-b border-border px-8 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {room.status === "waiting" ? "Waiting for players" : "Session active"}
              </p>
              <p className="text-foreground text-2xl font-bold mt-1">
                {room.foundWords.length}/{room.words.length}
              </p>
            </div>
            {room.status === "playing" && (
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Time elapsed</p>
                <p className="text-accent text-2xl font-bold font-mono mt-1">{formatTime(elapsed)}</p>
              </div>
            )}
          </div>

          {/* Grid area */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
            {room.status === "waiting" && (
              <div className="mb-6 text-center space-y-4">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Waiting for host to start...
                </p>
                <div className="flex items-center gap-3 justify-center">
                  {isHost && (
                    <Button onClick={handleStart} className="font-mono text-xs uppercase tracking-widest">
                      Start game
                    </Button>
                  )}
                  <Button
                    variant={copied ? "secondary" : "outline"}
                    onClick={copyInviteLink}
                    className="font-mono text-xs uppercase tracking-widest"
                  >
                    {copied ? "Link copied!" : "Invite friend"}
                  </Button>
                </div>
              </div>
            )}

            {gameResult && (
              <div className="mb-8 border border-border bg-card rounded-lg p-8 w-full max-w-md">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">Match complete</p>
                <div className="space-y-3">
                  {gameResult.map((p, i) => (
                    <div key={p.username} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}.</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-foreground text-sm font-medium uppercase">{p.username}</span>
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color: p.color }}>{p.score}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => navigate("/lobby")} className="w-full mt-6 font-mono text-xs uppercase tracking-widest">
                  Back to lobby
                </Button>
              </div>
            )}

            {/* Grid */}
            <div
              className="grid gap-[1px] select-none bg-border"
              style={{ gridTemplateColumns: `repeat(${room.size}, minmax(0, 1fr))` }}
            >
              {room.grid.map((row, r) =>
                row.map((letter, c) => {
                  const key = cellKey(r, c);
                  const isSelected = selectedSet.has(key);
                  const foundColor = foundCellsRef.current.get(key);

                  return (
                    <div
                      key={key}
                      onMouseDown={() => handleCellDown(r, c)}
                      onMouseEnter={() => handleCellHover(r, c)}
                      className="w-11 h-11 flex items-center justify-center font-mono text-sm font-medium cursor-none transition-colors"
                      style={{
                        backgroundColor: isSelected
                          ? myColor + "55"
                          : foundColor
                          ? foundColor + "30"
                          : "#111113",
                        color: isSelected
                          ? "#fff"
                          : foundColor
                          ? foundColor
                          : "#71717a",
                      }}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>

            {/* Words as tags */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {room.words.map((word) => {
                const found = room.foundWords.find((f) => f.word === word);
                return (
                  <span
                    key={word}
                    className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors"
                    style={
                      found
                        ? { borderColor: found.color, color: found.color, backgroundColor: found.color + "15", textDecoration: "line-through" }
                        : { borderColor: "#1e1e2e", color: "#a1a1aa" }
                    }
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 border-l border-border flex flex-col">
          {/* Players */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">Active players</p>
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-teal/30 px-1.5 py-0.5">
                {scores.length}/4
              </span>
            </div>
            <div className="space-y-3">
              {scores.map((p) => (
                <div key={p.username} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-border bg-background-card flex items-center justify-center relative">
                      <span className="text-[10px] font-mono text-foreground">{p.username.charAt(0).toUpperCase()}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background" style={{ backgroundColor: p.color }} />
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-medium uppercase">{p.username}</p>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase">
                        {room.status === "playing" ? "Searching..." : "Ready"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold" style={{ color: p.color }}>{p.score}</p>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room info */}
          <div className="p-6 mt-auto border-t border-border">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Session</p>
            <p className="font-mono text-xs text-foreground">{room.id}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-3 mb-2">Status</p>
            <p className="font-mono text-xs text-accent uppercase">{room.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

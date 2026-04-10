import { createContext, useContext, useEffect, useState, ReactNode, createElement } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const s = io("http://localhost:3001", {
      auth: { token },
    });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return createElement(
    SocketContext.Provider,
    { value: { socket, connected } },
    children
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

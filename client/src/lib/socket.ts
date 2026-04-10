import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token") || "",
  },
});

export function connectWithToken(token: string) {
  socket.auth = { token };
  socket.connect();
}

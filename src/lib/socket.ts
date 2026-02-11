import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "wss://profootball.srv883830.hstgr.cloud";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => console.log("socket connected", socket?.id));
    socket.on("connect_error", (err) => console.warn("socket connect_error", err));
    socket.on("reconnect_attempt", (n) => console.log("socket reconnect attempt", n));
  }

  return socket;
}

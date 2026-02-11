import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "wss://profootball.srv883830.hstgr.cloud";

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.IO client instance.
 * 
 * The socket is configured with:
 * - WebSocket transport only for optimal performance
 * - Automatic reconnection with infinite attempts
 * - 1 second delay between reconnection attempts
 * 
 * This singleton pattern ensures a single persistent connection
 * is shared across the entire application, preventing multiple
 * connections and reducing server load.
 * 
 * @returns The Socket.IO client instance
 */
export function getSocket(): Socket {
  if (!socket) {
    console.log(`🔌 Initializing Socket.IO connection to ${SOCKET_URL}`);
    
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log(`✅ Socket connected (ID: ${socket?.id})`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected:`, reason);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Socket connection error:", err.message);
      // Log connection errors for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.error("Full error:", err);
      }
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Successfully reconnected after ${attemptNumber} attempts`);
    });

    socket.on("reconnect_failed", () => {
      console.error("🔴 Socket reconnection failed after all attempts");
    });
  }

  return socket;
}

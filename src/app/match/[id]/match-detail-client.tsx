"use client";

import { useEffect, useState, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { MatchDetail, MatchEvent } from "@/types/match";

type Props = {
  initialMatch: MatchDetail;
};

const eventColors: Record<string, string> = {
  GOAL: "text-green-600",
  YELLOW_CARD: "text-yellow-500",
  RED_CARD: "text-red-600",
  FOUL: "text-gray-700",
  SHOT: "text-blue-500",
  SUBSTITUTION: "text-purple-500",
};

export default function MatchDetailClient({ initialMatch }: Props) {
  const [match, setMatch] = useState<MatchDetail>(initialMatch);
  const [connected, setConnected] = useState(false);

  // Chat state
  const [username, setUsername] = useState<string>(
    typeof window !== "undefined" ? localStorage.getItem("mm_username") || "" : ""
  );
  const [userId] = useState<string>(() => Math.random().toString(36).slice(2, 9));
  const [messages, setMessages] = useState<{ userId: string; username: string; message: string; timestamp: string }[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (username) localStorage.setItem("mm_username", username);
  }, [username]);

  useEffect(() => {
    const socket = getSocket();

    const subscribe = () => {
      socket.emit("subscribe_match", { matchId: match.id });
    };

    socket.on("connect", () => {
      console.log("🌐 Socket connected:", socket.id);
      setConnected(true);
      subscribe();
    });

    socket.on("disconnect", () => setConnected(false));

    // Initialize match from server payload
    socket.on("subscribed", ({ currentState }: { currentState: MatchDetail }) => {
      console.log("✅ Subscribed with currentState", currentState);
      setMatch(currentState);
    });

    // Score updates
    socket.on("score_update", (payload: { homeScore: number; awayScore: number }) => {
      setMatch(prev => ({ ...prev, homeScore: payload.homeScore, awayScore: payload.awayScore }));
    });

    // New match event
    socket.on("match_event", (event: MatchEvent) => {
      setMatch(prev => ({ ...prev, events: [...(prev.events || []), event] }));
    });

    // Stats update
    socket.on("stats_update", (payload: { statistics: MatchDetail["statistics"] }) => {
      setMatch(prev => ({ ...prev, statistics: payload.statistics }));
    });

    // Status change
    socket.on("status_change", (payload: { status: string; minute: number }) => {
      setMatch(prev => ({ ...prev, status: payload.status as any, minute: payload.minute }));
    });

    // Chat
    socket.on("chat_message", (msg: { userId: string; username: string; message: string; timestamp: string }) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("typing_start", ({ userId: typingUserId }: { userId: string }) => {
      if (typingUserId !== userId) setIsTyping(true);
    });

    socket.on("typing_stop", ({ userId: typingUserId }: { userId: string }) => {
      if (typingUserId !== userId) setIsTyping(false);
    });

    return () => {
      socket.emit("unsubscribe_match", { matchId: match.id });
      socket.off("subscribed");
      socket.off("score_update");
      socket.off("match_event");
      socket.off("stats_update");
      socket.off("status_change");
      socket.off("chat_message");
      socket.off("typing_start");
      socket.off("typing_stop");
    };
  }, [match.id, userId]);

  // Chat helpers
  const sendMessage = () => {
    if (!message.trim() || !username) return;
    const socket = getSocket();
    const payload = { matchId: match.id, userId, username, message: message.slice(0, 500) };
    socket.emit("send_message", payload);
    setMessages(prev => [...prev, { ...payload, timestamp: new Date().toISOString() }]);
    setMessage("");
  };

  const handleTypingChange = (v: string) => {
    setMessage(v);
    const socket = getSocket();
    socket.emit("typing_start", { matchId: match.id, userId, username });
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      socket.emit("typing_stop", { matchId: match.id, userId });
    }, 1500);
  };

  // Group events by minute for display
  const eventsByMinute = (match.events || []).reduce<Record<number, MatchEvent[]>>((acc, ev) => {
    if (!acc[ev.minute]) acc[ev.minute] = [];
    acc[ev.minute].push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <p className={`text-sm font-medium ${connected ? "text-green-600" : "text-red-600"}`}>
        {connected ? "🟢 Live updates connected" : "🔴 Reconnecting..."}
      </p>

      {/* Score */}
      <div className="text-center">
        <h2 className="text-xl font-bold">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</h2>
        <div className="text-3xl font-extrabold">{match.homeScore} : {match.awayScore}</div>
        <p className="text-gray-500">{match.status.replace("_", " ")} · {match.minute}</p>
      </div>

      {/* Timeline */}
      <div className="border rounded p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Timeline</h3>
        <ul className="space-y-1 max-h-96 overflow-auto">
          {Object.entries(eventsByMinute).sort((a, b) => Number(a[0]) - Number(b[0])).map(([minute, events]) => (
            <li key={minute}>
              <span className="font-bold text-gray-700">{minute}</span>
              {events.map(ev => (
                <span key={ev.id} className={`ml-3 ${eventColors[ev.type] ?? "text-gray-800"} font-medium`}>
                  {ev.type.replace("_", " ")} - {ev.player}{ev.assistPlayer ? ` (Assist: ${ev.assistPlayer})` : ""}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>

      {/* Statistics */}
      <div className="border rounded p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Statistics</h3>
        <pre className="text-sm">{JSON.stringify(match.statistics, null, 2)}</pre>
      </div>

      {/* Chat */}
      <div className="border rounded p-3 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Match Chat</h3>

        <div className="mb-2 flex gap-2">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your name"
            className="border rounded px-2 py-1 flex-1"
          />
        </div>

        <div className="h-40 overflow-auto border rounded p-2 mb-2 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className="mb-1">
              <strong>{m.username}:</strong> {m.message}
            </div>
          ))}
          {isTyping && <div className="text-sm text-gray-500">Someone is typing...</div>}
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={e => handleTypingChange(e.target.value)}
            placeholder="Type a message"
            className="flex-1 border rounded px-2 py-1"
            maxLength={500}
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-3 py-1 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
